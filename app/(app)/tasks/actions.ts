'use server';

import { revalidatePath } from 'next/cache';
import { prisma } from '@/lib/db/prisma';
import { requireInternalUser } from '@/lib/auth/current-user';
import { createTaskSchema } from '@/lib/validation/schemas';
import { assertProjectAccess } from '@/lib/domain/access';
import { auditLog } from '@/lib/security/audit';

export async function createTaskAction(formData: FormData) {
  const user = await requireInternalUser();

  const parsed = createTaskSchema.safeParse({
    projectId: formData.get('projectId'),
    title: formData.get('title'),
    description: formData.get('description') || undefined,
    priority: formData.get('priority'),
    status: formData.get('status'),
    deadline: formData.get('deadline') || undefined,
    assigneeId: formData.get('assigneeId') || undefined,
    visibleToClient: String(formData.get('visibleToClient') ?? 'off') === 'on',
    internalNotes: formData.get('internalNotes') || undefined
  });

  if (!parsed.success) {
    throw new Error('Date task invalide.');
  }

  await assertProjectAccess(user, parsed.data.projectId);

  const task = await prisma.task.create({
    data: {
      projectId: parsed.data.projectId,
      title: parsed.data.title,
      description: parsed.data.description,
      priority: parsed.data.priority,
      status: parsed.data.status,
      deadline: parsed.data.deadline ? new Date(parsed.data.deadline) : null,
      assigneeId: parsed.data.assigneeId || null,
      visibleToClient: parsed.data.visibleToClient,
      internalNotes: parsed.data.internalNotes,
      createdById: user.id
    }
  });

  await auditLog({
    actorUserId: user.id,
    action: 'TASK_CREATED',
    entityType: 'Task',
    entityId: task.id,
    metadata: {
      projectId: task.projectId,
      visibleToClient: task.visibleToClient
    }
  });

  revalidatePath('/tasks');
  revalidatePath('/portal');
}

export async function addTaskCommentAction(formData: FormData) {
  const user = await requireInternalUser();

  const taskId = String(formData.get('taskId') ?? '');
  const comment = String(formData.get('comment') ?? '').trim();
  const isInternal = String(formData.get('isInternal') ?? 'on') === 'on';

  if (!taskId || !comment) {
    throw new Error('Comentariu invalid.');
  }

  const task = await prisma.task.findUnique({
    where: { id: taskId },
    select: { id: true, projectId: true }
  });

  if (!task) {
    throw new Error('Task inexistent.');
  }

  await assertProjectAccess(user, task.projectId);

  await prisma.taskComment.create({
    data: {
      taskId,
      userId: user.id,
      body: comment,
      isInternal
    }
  });

  revalidatePath('/tasks');
}

export async function updateTaskStatusAction(formData: FormData) {
  const user = await requireInternalUser();

  const taskId = String(formData.get('taskId') ?? '');
  const status = String(formData.get('status') ?? 'TODO');
  const visibleToClient = String(formData.get('visibleToClient') ?? 'false') === 'true';

  const task = await prisma.task.findUnique({
    where: { id: taskId },
    select: { projectId: true }
  });

  if (!task) {
    throw new Error('Task invalid.');
  }

  await assertProjectAccess(user, task.projectId);

  await prisma.task.update({
    where: { id: taskId },
    data: {
      status: status as 'TODO' | 'IN_PROGRESS' | 'BLOCKED' | 'REVIEW' | 'DONE',
      visibleToClient
    }
  });

  await auditLog({
    actorUserId: user.id,
    action: 'TASK_STATUS_UPDATED',
    entityType: 'Task',
    entityId: taskId,
    metadata: {
      status,
      visibleToClient
    }
  });

  revalidatePath('/tasks');
  revalidatePath('/portal');
}
