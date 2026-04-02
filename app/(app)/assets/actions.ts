'use server';

import { revalidatePath } from 'next/cache';
import { prisma } from '@/lib/db/prisma';
import { requireInternalUser } from '@/lib/auth/current-user';
import { canManageAssets } from '@/lib/domain/permissions';
import { createAssetSchema } from '@/lib/validation/schemas';
import { assertProjectAccess } from '@/lib/domain/access';

export async function createAssetAction(formData: FormData) {
  const user = await requireInternalUser();

  if (!canManageAssets(user.role)) {
    throw new Error('Nu ai acces la asset registry.');
  }

  const parsed = createAssetSchema.safeParse({
    name: formData.get('name'),
    category: formData.get('category'),
    serialNumber: formData.get('serialNumber'),
    status: formData.get('status'),
    responsibleUserId: formData.get('responsibleUserId') || undefined,
    projectId: formData.get('projectId') || undefined,
    location: formData.get('location') || undefined,
    notes: formData.get('notes') || undefined,
    services: formData.get('services') || undefined
  });

  if (!parsed.success) {
    throw new Error('Date echipament invalide.');
  }

  if (parsed.data.projectId) {
    await assertProjectAccess(user, parsed.data.projectId);
  }

  await prisma.asset.create({
    data: {
      name: parsed.data.name,
      category: parsed.data.category,
      serialNumber: parsed.data.serialNumber,
      status: parsed.data.status,
      responsibleUserId: parsed.data.responsibleUserId || null,
      projectId: parsed.data.projectId || null,
      location: parsed.data.location,
      notes: parsed.data.notes,
      services: parsed.data.services ? parsed.data.services.split(',').map((service) => service.trim()) : []
    }
  });

  revalidatePath('/assets');
}
