'use server';

import { revalidatePath } from 'next/cache';
import { prisma } from '@/lib/db/prisma';
import { requireInternalUser } from '@/lib/auth/current-user';
import { createCommissionSchema } from '@/lib/validation/schemas';
import { canApproveCommission, canManageCommission } from '@/lib/domain/permissions';
import { assertProjectAccess } from '@/lib/domain/access';
import { auditLog } from '@/lib/security/audit';

export async function createCommissionAction(formData: FormData) {
  const user = await requireInternalUser();

  if (!canManageCommission(user.role)) {
    throw new Error('Nu ai acces la comisioane.');
  }

  const parsed = createCommissionSchema.safeParse({
    projectId: formData.get('projectId'),
    name: formData.get('name'),
    type: formData.get('type'),
    fixedAmount: formData.get('fixedAmount') || undefined,
    percentage: formData.get('percentage') || undefined,
    participantUserId: formData.get('participantUserId'),
    allocationAmount: formData.get('allocationAmount') || undefined,
    allocationPercentage: formData.get('allocationPercentage') || undefined
  });

  if (!parsed.success) {
    throw new Error('Date comision invalide.');
  }

  await assertProjectAccess(user, parsed.data.projectId);

  const rule = await prisma.commissionRule.create({
    data: {
      projectId: parsed.data.projectId,
      name: parsed.data.name,
      type: parsed.data.type,
      fixedAmount: parsed.data.fixedAmount,
      percentage: parsed.data.percentage,
      proposedById: user.id,
      approvalStatus: 'PENDING',
      allocations: {
        create: {
          participantUserId: parsed.data.participantUserId,
          amount: parsed.data.allocationAmount,
          percentage: parsed.data.allocationPercentage,
          status: 'PENDING'
        }
      }
    }
  });

  await auditLog({
    actorUserId: user.id,
    action: 'COMMISSION_RULE_PROPOSED',
    entityType: 'CommissionRule',
    entityId: rule.id,
    metadata: {
      projectId: rule.projectId
    }
  });

  revalidatePath('/commissions');
}

export async function approveCommissionAction(formData: FormData) {
  const user = await requireInternalUser();

  if (!canApproveCommission(user.role)) {
    throw new Error('Nu ai drept de aprobare comision.');
  }

  const ruleId = String(formData.get('ruleId') ?? '');

  await prisma.$transaction([
    prisma.commissionRule.update({
      where: { id: ruleId },
      data: {
        approvalStatus: 'APPROVED',
        approvedById: user.id,
        approvedAt: new Date()
      }
    }),
    prisma.commissionAllocation.updateMany({
      where: { ruleId },
      data: { status: 'APPROVED' }
    })
  ]);

  await auditLog({
    actorUserId: user.id,
    action: 'COMMISSION_RULE_APPROVED',
    entityType: 'CommissionRule',
    entityId: ruleId,
    severity: 'WARN'
  });

  revalidatePath('/commissions');
}
