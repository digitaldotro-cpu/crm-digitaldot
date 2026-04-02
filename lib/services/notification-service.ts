import { prisma } from '@/lib/db/prisma';
import type { Prisma } from '@prisma/client';

export async function createNotification(input: {
  userId?: string;
  companyId?: string;
  channel: 'EMAIL' | 'PORTAL' | 'PUSH';
  type: string;
  subject: string;
  body: string;
  metadata?: Record<string, unknown>;
}) {
  return prisma.notification.create({
    data: {
      userId: input.userId,
      companyId: input.companyId,
      channel: input.channel,
      type: input.type,
      subject: input.subject,
      body: input.body,
      metadata: input.metadata as Prisma.InputJsonValue | undefined,
      status: 'PENDING'
    }
  });
}
