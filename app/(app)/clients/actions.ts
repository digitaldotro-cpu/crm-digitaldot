'use server';

import { revalidatePath } from 'next/cache';
import { createClientSchema } from '@/lib/validation/schemas';
import { requireInternalUser } from '@/lib/auth/current-user';
import { prisma } from '@/lib/db/prisma';
import { auditLog } from '@/lib/security/audit';

export async function createClientAction(formData: FormData) {
  const user = await requireInternalUser();

  const parsed = createClientSchema.safeParse({
    name: formData.get('name'),
    slug: formData.get('slug'),
    website: formData.get('website') || undefined,
    status: formData.get('status')
  });

  if (!parsed.success) {
    throw new Error('Date client invalide.');
  }

  const company = await prisma.company.create({
    data: {
      type: 'CLIENT',
      name: parsed.data.name,
      slug: parsed.data.slug,
      website: parsed.data.website || null,
      status: parsed.data.status
    }
  });

  await auditLog({
    actorUserId: user.id,
    action: 'CLIENT_CREATED',
    entityType: 'Company',
    entityId: company.id,
    metadata: {
      slug: company.slug
    }
  });

  revalidatePath('/clients');
}
