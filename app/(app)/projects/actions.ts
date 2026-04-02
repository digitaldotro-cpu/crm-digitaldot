'use server';

import { revalidatePath } from 'next/cache';
import { prisma } from '@/lib/db/prisma';
import { requireInternalUser } from '@/lib/auth/current-user';
import { createProjectSchema } from '@/lib/validation/schemas';
import { assertProjectAccess } from '@/lib/domain/access';
import { auditLog } from '@/lib/security/audit';

export async function createProjectAction(formData: FormData) {
  const user = await requireInternalUser();

  const parsed = createProjectSchema.safeParse({
    name: formData.get('name'),
    description: formData.get('description') || undefined,
    clientCompanyId: formData.get('clientCompanyId'),
    status: formData.get('status'),
    services: formData.get('services') || undefined,
    startDate: formData.get('startDate') || undefined,
    endDate: formData.get('endDate') || undefined
  });

  if (!parsed.success) {
    throw new Error('Date proiect invalide.');
  }

  const project = await prisma.project.create({
    data: {
      name: parsed.data.name,
      description: parsed.data.description,
      clientCompanyId: parsed.data.clientCompanyId,
      status: parsed.data.status,
      services: parsed.data.services ? parsed.data.services.split(',').map((service) => service.trim()) : [],
      startDate: parsed.data.startDate ? new Date(parsed.data.startDate) : null,
      endDate: parsed.data.endDate ? new Date(parsed.data.endDate) : null,
      createdById: user.id,
      memberships: {
        create: {
          userId: user.id,
          role: 'MANAGER'
        }
      }
    }
  });

  await auditLog({
    actorUserId: user.id,
    action: 'PROJECT_CREATED',
    entityType: 'Project',
    entityId: project.id
  });

  revalidatePath('/projects');
}

export async function addProjectMemberAction(formData: FormData) {
  const user = await requireInternalUser();

  const projectId = String(formData.get('projectId') ?? '');
  const memberId = String(formData.get('memberId') ?? '');
  const role = String(formData.get('role') ?? 'VIEWER');

  if (!projectId || !memberId) {
    throw new Error('Date membership invalide.');
  }

  await assertProjectAccess(user, projectId);

  await prisma.projectMembership.upsert({
    where: {
      projectId_userId: {
        projectId,
        userId: memberId
      }
    },
    update: {
      role: role as 'MANAGER' | 'CONTRIBUTOR' | 'VIEWER' | 'FINANCE_REVIEWER' | 'CLIENT_VIEWER'
    },
    create: {
      projectId,
      userId: memberId,
      role: role as 'MANAGER' | 'CONTRIBUTOR' | 'VIEWER' | 'FINANCE_REVIEWER' | 'CLIENT_VIEWER'
    }
  });

  await auditLog({
    actorUserId: user.id,
    action: 'PROJECT_MEMBER_UPDATED',
    entityType: 'ProjectMembership',
    metadata: {
      projectId,
      memberId,
      role
    }
  });

  revalidatePath('/projects');
  revalidatePath(`/projects/${projectId}`);
}
