'use server';

import { revalidatePath } from 'next/cache';
import { prisma } from '@/lib/db/prisma';
import { requireInternalUser } from '@/lib/auth/current-user';
import { canManageTemplates } from '@/lib/domain/permissions';
import { createTemplateSchema } from '@/lib/validation/schemas';
import { auditLog } from '@/lib/security/audit';

export async function createTemplateAction(formData: FormData) {
  const user = await requireInternalUser();

  if (!canManageTemplates(user.role)) {
    throw new Error('Nu ai acces la template-uri.');
  }

  const parsed = createTemplateSchema.safeParse({
    name: formData.get('name'),
    type: formData.get('type'),
    content: formData.get('content'),
    requiresNdaSigned: String(formData.get('requiresNdaSigned') ?? 'off') === 'on',
    includesServiceConfidentialityClause:
      String(formData.get('includesServiceConfidentialityClause') ?? 'off') === 'on',
    includesDisclosurePenaltyClause: String(formData.get('includesDisclosurePenaltyClause') ?? 'off') === 'on'
  });

  if (!parsed.success) {
    throw new Error('Template invalid.');
  }

  const template = await prisma.documentTemplate.create({
    data: {
      name: parsed.data.name,
      type: parsed.data.type,
      content: parsed.data.content,
      requiresNdaSigned: parsed.data.requiresNdaSigned,
      includesServiceConfidentialityClause: parsed.data.includesServiceConfidentialityClause,
      includesDisclosurePenaltyClause: parsed.data.includesDisclosurePenaltyClause,
      createdById: user.id,
      versions: {
        create: {
          version: 1,
          content: parsed.data.content,
          changeNote: 'Initial version',
          createdById: user.id
        }
      }
    }
  });

  await auditLog({
    actorUserId: user.id,
    action: 'DOCUMENT_TEMPLATE_CREATED',
    entityType: 'DocumentTemplate',
    entityId: template.id,
    severity: 'WARN'
  });

  revalidatePath('/documents/templates');
}
