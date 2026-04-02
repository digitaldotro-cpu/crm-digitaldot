'use server';

import { revalidatePath } from 'next/cache';
import { prisma } from '@/lib/db/prisma';
import { requireInternalUser } from '@/lib/auth/current-user';
import { canManageSecrets } from '@/lib/domain/permissions';
import { createSecretSchema } from '@/lib/validation/schemas';
import { assertProjectAccess } from '@/lib/domain/access';
import { encryptSecret } from '@/lib/security/secrets';
import { auditLog } from '@/lib/security/audit';

export async function createSecretAction(formData: FormData) {
  const user = await requireInternalUser();

  if (!canManageSecrets(user.role)) {
    throw new Error('Nu ai acces la secrets vault.');
  }

  const parsed = createSecretSchema.safeParse({
    projectId: formData.get('projectId'),
    name: formData.get('name'),
    username: formData.get('username') || undefined,
    secretValue: formData.get('secretValue'),
    description: formData.get('description') || undefined
  });

  if (!parsed.success) {
    throw new Error('Date secret invalide.');
  }

  const project = await assertProjectAccess(user, parsed.data.projectId);
  const encrypted = encryptSecret(parsed.data.secretValue);

  const secret = await prisma.secret.create({
    data: {
      projectId: parsed.data.projectId,
      clientCompanyId: project.clientCompanyId,
      name: parsed.data.name,
      username: parsed.data.username,
      encryptedValue: encrypted.encryptedValue,
      iv: encrypted.iv,
      authTag: encrypted.authTag,
      description: parsed.data.description,
      createdById: user.id
    }
  });

  await auditLog({
    actorUserId: user.id,
    action: 'SECRET_CREATED',
    entityType: 'Secret',
    entityId: secret.id,
    severity: 'CRITICAL'
  });

  revalidatePath('/secrets');
}
