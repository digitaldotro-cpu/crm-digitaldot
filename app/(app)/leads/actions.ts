'use server';

import { revalidatePath } from 'next/cache';
import { prisma } from '@/lib/db/prisma';
import { requireInternalUser } from '@/lib/auth/current-user';
import { createLeadSchema } from '@/lib/validation/schemas';
import { canManageLeads } from '@/lib/domain/permissions';
import { auditLog } from '@/lib/security/audit';

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}

export async function createLeadAction(formData: FormData) {
  const user = await requireInternalUser();

  if (!canManageLeads(user.role)) {
    throw new Error('Nu ai acces la leaduri.');
  }

  const parsed = createLeadSchema.safeParse({
    companyName: formData.get('companyName'),
    contactName: formData.get('contactName'),
    contactEmail: formData.get('contactEmail'),
    contactPhone: formData.get('contactPhone') || undefined,
    source: formData.get('source') || undefined,
    stage: formData.get('stage'),
    nextStep: formData.get('nextStep') || undefined,
    reminderAt: formData.get('reminderAt') || undefined,
    notes: formData.get('notes') || undefined
  });

  if (!parsed.success) {
    throw new Error('Date lead invalide.');
  }

  await prisma.lead.create({
    data: {
      ...parsed.data,
      reminderAt: parsed.data.reminderAt ? new Date(parsed.data.reminderAt) : null,
      createdById: user.id
    }
  });

  revalidatePath('/leads');
}

export async function convertLeadAction(formData: FormData) {
  const user = await requireInternalUser();
  const leadId = String(formData.get('leadId') ?? '');

  const lead = await prisma.lead.findUnique({ where: { id: leadId } });
  if (!lead) {
    throw new Error('Lead invalid.');
  }

  const baseSlug = slugify(lead.companyName);
  const existing = await prisma.company.findFirst({ where: { slug: baseSlug } });
  const slug = existing ? `${baseSlug}-${Date.now().toString().slice(-4)}` : baseSlug;

  const clientCompany = await prisma.company.create({
    data: {
      type: 'CLIENT',
      name: lead.companyName,
      slug,
      status: 'ACTIVE',
      contacts: {
        create: {
          name: lead.contactName,
          email: lead.contactEmail,
          phone: lead.contactPhone,
          isPrimary: true
        }
      }
    }
  });

  const project = await prisma.project.create({
    data: {
      name: `${lead.companyName} - Initial Setup`,
      status: 'PLANNING',
      clientCompanyId: clientCompany.id,
      createdById: user.id,
      memberships: {
        create: {
          userId: user.id,
          role: 'MANAGER'
        }
      }
    }
  });

  await prisma.lead.update({
    where: { id: lead.id },
    data: {
      stage: 'WON',
      convertedClientId: clientCompany.id,
      convertedProjectId: project.id
    }
  });

  await auditLog({
    actorUserId: user.id,
    action: 'LEAD_CONVERTED',
    entityType: 'Lead',
    entityId: lead.id,
    metadata: {
      clientCompanyId: clientCompany.id,
      projectId: project.id
    }
  });

  revalidatePath('/leads');
  revalidatePath('/clients');
  revalidatePath('/projects');
}
