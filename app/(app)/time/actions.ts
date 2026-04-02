'use server';

import { revalidatePath } from 'next/cache';
import { prisma } from '@/lib/db/prisma';
import { requireInternalUser } from '@/lib/auth/current-user';
import { createTimeEntrySchema } from '@/lib/validation/schemas';
import { assertProjectAccess } from '@/lib/domain/access';
import { auditLog } from '@/lib/security/audit';

function diffMinutes(start: Date, end: Date) {
  return Math.max(1, Math.round((end.getTime() - start.getTime()) / 60000));
}

export async function startTimerAction(formData: FormData) {
  const user = await requireInternalUser();
  const projectId = String(formData.get('projectId') ?? '');
  const taskId = String(formData.get('taskId') ?? '');
  const description = String(formData.get('description') ?? '');
  const activityType = String(formData.get('activityType') ?? 'Execution');

  if (!projectId) {
    throw new Error('Project invalid.');
  }

  await assertProjectAccess(user, projectId);

  await prisma.timeEntry.create({
    data: {
      projectId,
      taskId: taskId || null,
      userId: user.id,
      startedAt: new Date(),
      status: 'RUNNING',
      description,
      activityType,
      visibleToClient: false
    }
  });

  revalidatePath('/time');
}

export async function stopTimerAction(formData: FormData) {
  const user = await requireInternalUser();
  const entryId = String(formData.get('entryId') ?? '');

  const entry = await prisma.timeEntry.findUnique({
    where: { id: entryId },
    select: {
      id: true,
      userId: true,
      projectId: true,
      startedAt: true,
      status: true
    }
  });

  if (!entry || entry.status !== 'RUNNING' || entry.userId !== user.id) {
    throw new Error('Timer invalid.');
  }

  const endedAt = new Date();
  const durationMinutes = diffMinutes(entry.startedAt, endedAt);

  await prisma.timeEntry.update({
    where: { id: entry.id },
    data: {
      endedAt,
      durationMinutes,
      status: 'SUBMITTED'
    }
  });

  revalidatePath('/time');
}

export async function createManualTimeEntryAction(formData: FormData) {
  const user = await requireInternalUser();

  const parsed = createTimeEntrySchema.safeParse({
    projectId: formData.get('projectId'),
    taskId: formData.get('taskId') || undefined,
    description: formData.get('description') || undefined,
    activityType: formData.get('activityType') || undefined,
    startedAt: formData.get('startedAt'),
    endedAt: formData.get('endedAt') || undefined,
    visibleToClient: String(formData.get('visibleToClient') ?? 'off') === 'on'
  });

  if (!parsed.success) {
    throw new Error('Time entry invalid.');
  }

  await assertProjectAccess(user, parsed.data.projectId);

  const startedAt = new Date(parsed.data.startedAt);
  const endedAt = parsed.data.endedAt ? new Date(parsed.data.endedAt) : null;

  await prisma.timeEntry.create({
    data: {
      projectId: parsed.data.projectId,
      taskId: parsed.data.taskId || null,
      userId: user.id,
      startedAt,
      endedAt,
      durationMinutes: endedAt ? diffMinutes(startedAt, endedAt) : null,
      description: parsed.data.description,
      activityType: parsed.data.activityType,
      visibleToClient: parsed.data.visibleToClient,
      status: endedAt ? 'SUBMITTED' : 'RUNNING'
    }
  });

  revalidatePath('/time');
}

export async function approveTimeEntryAction(formData: FormData) {
  const user = await requireInternalUser();
  if (!['ADMIN', 'PROJECT_MANAGER', 'FINANCE'].includes(user.role)) {
    throw new Error('Nu ai drept de aprobare.');
  }

  const entryId = String(formData.get('entryId') ?? '');
  const publishToClient = String(formData.get('publishToClient') ?? 'false') === 'true';

  const entry = await prisma.timeEntry.findUnique({
    where: { id: entryId },
    select: {
      id: true,
      projectId: true
    }
  });

  if (!entry) {
    throw new Error('Entry invalid.');
  }

  await assertProjectAccess(user, entry.projectId);

  await prisma.timeEntry.update({
    where: { id: entryId },
    data: {
      status: 'APPROVED',
      approvedById: user.id,
      visibleToClient: publishToClient,
      publishedAt: publishToClient ? new Date() : null
    }
  });

  await auditLog({
    actorUserId: user.id,
    action: 'TIME_ENTRY_APPROVED',
    entityType: 'TimeEntry',
    entityId: entryId,
    metadata: {
      publishToClient
    }
  });

  revalidatePath('/time');
  revalidatePath('/portal');
}
