'use server';

import { revalidatePath } from 'next/cache';
import { prisma } from '@/lib/db/prisma';
import { requireInternalUser } from '@/lib/auth/current-user';

export async function createKnowledgeCollectionAction(formData: FormData) {
  const user = await requireInternalUser();

  const name = String(formData.get('name') ?? '').trim();
  const visibility = String(formData.get('visibility') ?? 'TEAM');
  const description = String(formData.get('description') ?? '').trim();

  if (!name) {
    throw new Error('Nume colectie invalid.');
  }

  await prisma.knowledgeCollection.create({
    data: {
      name,
      visibility: visibility as 'PRIVATE' | 'TEAM' | 'FINANCE_ONLY' | 'ADMIN_ONLY',
      description: description || null,
      createdById: user.id
    }
  });

  revalidatePath('/knowledge');
}

export async function createKnowledgeDocumentAction(formData: FormData) {
  const user = await requireInternalUser();

  const collectionId = String(formData.get('collectionId') ?? '');
  const title = String(formData.get('title') ?? '').trim();
  const content = String(formData.get('content') ?? '').trim();
  const isSensitive = String(formData.get('isSensitive') ?? 'off') === 'on';

  if (!collectionId || !title || !content) {
    throw new Error('Document knowledge invalid.');
  }

  await prisma.knowledgeDocument.create({
    data: {
      collectionId,
      title,
      content,
      isSensitive,
      createdById: user.id,
      updatedById: user.id
    }
  });

  revalidatePath('/knowledge');
}
