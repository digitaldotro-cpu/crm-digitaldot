'use server';

import { revalidatePath } from 'next/cache';
import { prisma } from '@/lib/db/prisma';
import { requireInternalUser } from '@/lib/auth/current-user';
import { projectAccessWhere } from '@/lib/domain/scopes';
import { generateDocumentSchema } from '@/lib/validation/schemas';
import { assertProjectAccess } from '@/lib/domain/access';
import { parseTemplateData, renderTemplate } from '@/lib/services/document-service';
import { auditLog } from '@/lib/security/audit';

function appendTemplateClauses(content: string, options: { includeConfidentiality: boolean; includePenalty: boolean }) {
  let result = content;

  if (options.includeConfidentiality) {
    result +=
      '\n\n[CLAUZA_CONFIDENTIALITATE_ANEXA] Clientul nu poate divulga detaliile din Anexa servicii fara acordul scris al agentiei.';
  }

  if (options.includePenalty) {
    result +=
      '\n\n[CLAUZA_PENALIZARE_DIVULGARE] Divulgarea neautorizata poate atrage penalitati conform termenilor comerciali agreati.';
  }

  return result;
}

export async function generateDocumentAction(formData: FormData) {
  const user = await requireInternalUser();

  const parsed = generateDocumentSchema.safeParse({
    templateId: formData.get('templateId'),
    projectId: formData.get('projectId'),
    title: formData.get('title'),
    dataJson: formData.get('dataJson') || undefined,
    publishToClient: String(formData.get('publishToClient') ?? 'off') === 'on'
  });

  if (!parsed.success) {
    throw new Error('Date generare document invalide.');
  }

  const project = await prisma.project.findFirst({
    where: {
      id: parsed.data.projectId,
      ...projectAccessWhere(user)
    },
    select: {
      id: true,
      name: true,
      clientCompanyId: true,
      clientCompany: {
        select: {
          name: true
        }
      }
    }
  });

  if (!project) {
    throw new Error('Proiect invalid pentru utilizatorul curent.');
  }

  const template = await prisma.documentTemplate.findUnique({
    where: { id: parsed.data.templateId }
  });

  if (!template) {
    throw new Error('Template inexistent.');
  }

  if (template.requiresNdaSigned) {
    const signedNda = await prisma.documentInstance.findFirst({
      where: {
        projectId: project.id,
        clientCompanyId: project.clientCompanyId,
        status: 'SIGNED',
        template: {
          type: 'NDA'
        }
      }
    });

    if (!signedNda) {
      throw new Error('Nu se poate genera documentul: NDA nu este semnat pentru acest client/proiect.');
    }
  }

  const data = parseTemplateData(parsed.data.dataJson);
  const mergedData = {
    client_name: project.clientCompany.name,
    project_name: project.name,
    generated_by: user.name,
    generated_at: new Date().toISOString(),
    ...data
  };

  const rendered = renderTemplate(template.content, mergedData);
  const contentWithClauses = appendTemplateClauses(rendered, {
    includeConfidentiality: template.includesServiceConfidentialityClause,
    includePenalty: template.includesDisclosurePenaltyClause
  });

  const instance = await prisma.documentInstance.create({
    data: {
      templateId: template.id,
      projectId: project.id,
      clientCompanyId: project.clientCompanyId,
      title: parsed.data.title,
      content: contentWithClauses,
      status: 'GENERATED',
      generatedData: mergedData,
      createdById: user.id,
      requiresNdaSigned: template.requiresNdaSigned,
      publishedToClient: parsed.data.publishToClient
    }
  });

  await auditLog({
    actorUserId: user.id,
    action: 'DOCUMENT_INSTANCE_GENERATED',
    entityType: 'DocumentInstance',
    entityId: instance.id,
    severity: 'WARN'
  });

  revalidatePath('/documents/instances');
  revalidatePath('/portal');
}

export async function updateDocumentStatusAction(formData: FormData) {
  const user = await requireInternalUser();

  const instanceId = String(formData.get('instanceId') ?? '');
  const status = String(formData.get('status') ?? 'GENERATED');

  const instance = await prisma.documentInstance.findUnique({
    where: { id: instanceId },
    select: { id: true, projectId: true }
  });

  if (!instance) {
    throw new Error('Document invalid.');
  }

  await assertProjectAccess(user, instance.projectId);

  await prisma.documentInstance.update({
    where: { id: instanceId },
    data: {
      status: status as 'DRAFT' | 'GENERATED' | 'SENT' | 'VIEWED' | 'SIGNED' | 'EXPIRED',
      sentAt: status === 'SENT' ? new Date() : undefined,
      viewedAt: status === 'VIEWED' ? new Date() : undefined,
      signedAt: status === 'SIGNED' ? new Date() : undefined
    }
  });

  await auditLog({
    actorUserId: user.id,
    action: 'DOCUMENT_STATUS_UPDATED',
    entityType: 'DocumentInstance',
    entityId: instanceId,
    metadata: {
      status
    }
  });

  revalidatePath('/documents/instances');
  revalidatePath('/portal');
}
