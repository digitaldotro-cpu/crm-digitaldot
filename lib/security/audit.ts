import { prisma } from '@/lib/db/prisma';
import type { Prisma } from '@prisma/client';

export async function auditLog(input: {
  actorUserId?: string;
  action: string;
  entityType: string;
  entityId?: string;
  severity?: 'INFO' | 'WARN' | 'CRITICAL';
  metadata?: Record<string, unknown>;
}) {
  await prisma.auditLog.create({
    data: {
      actorUserId: input.actorUserId,
      action: input.action,
      entityType: input.entityType,
      entityId: input.entityId,
      severity: input.severity ?? 'INFO',
      metadata: input.metadata as Prisma.InputJsonValue | undefined
    }
  });
}
