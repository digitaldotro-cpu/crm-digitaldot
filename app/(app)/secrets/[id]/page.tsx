import Link from 'next/link';
import { notFound } from 'next/navigation';
import { prisma } from '@/lib/db/prisma';
import { requireInternalUser } from '@/lib/auth/current-user';
import { canManageSecrets } from '@/lib/domain/permissions';
import { assertProjectAccess } from '@/lib/domain/access';
import { decryptSecret } from '@/lib/security/secrets';
import { auditLog } from '@/lib/security/audit';
import { Card } from '@/components/ui/card';

export default async function SecretRevealPage({ params }: { params: { id: string } }) {
  const user = await requireInternalUser();

  if (!canManageSecrets(user.role)) {
    notFound();
  }

  const secret = await prisma.secret.findUnique({
    where: { id: params.id },
    include: {
      project: { select: { id: true, name: true } }
    }
  });

  if (!secret) {
    notFound();
  }

  await assertProjectAccess(user, secret.project.id);

  const revealed = decryptSecret({
    encryptedValue: secret.encryptedValue,
    iv: secret.iv,
    authTag: secret.authTag
  });

  await prisma.secretAccessLog.create({
    data: {
      secretId: secret.id,
      userId: user.id,
      action: 'REVEAL',
      reason: 'Manual reveal from secure vault page'
    }
  });

  await auditLog({
    actorUserId: user.id,
    action: 'SECRET_REVEALED',
    entityType: 'Secret',
    entityId: secret.id,
    severity: 'CRITICAL'
  });

  return (
    <div className="space-y-4">
      <Card>
        <p className="text-xs uppercase tracking-wide text-muted">Secret Reveal</p>
        <h1 className="mt-1 text-xl font-bold">{secret.name}</h1>
        <p className="mt-1 text-sm text-muted">Proiect: {secret.project.name}</p>
        <div className="mt-4 rounded-md border border-rose-200 bg-rose-50 p-3 text-sm text-rose-800">
          Acest acces este auditat. Nu distribui secretul in canale nesecurizate.
        </div>
        <div className="mt-4 rounded-md border border-line bg-white p-3">
          <p className="text-xs uppercase tracking-wide text-muted">Username</p>
          <p className="font-medium">{secret.username ?? '-'}</p>
          <p className="mt-3 text-xs uppercase tracking-wide text-muted">Valoare secret</p>
          <p className="font-mono text-sm">{revealed}</p>
        </div>
        <Link href="/secrets" className="mt-4 inline-block text-sm text-brand underline-offset-2 hover:underline">
          Inapoi la vault
        </Link>
      </Card>
    </div>
  );
}
