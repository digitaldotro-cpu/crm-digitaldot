import Link from 'next/link';
import { prisma } from '@/lib/db/prisma';
import { requireInternalUser } from '@/lib/auth/current-user';
import { projectAccessWhere } from '@/lib/domain/scopes';
import { canManageSecrets } from '@/lib/domain/permissions';
import { PageHeader } from '@/components/layout/page-header';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Table, Th, Td } from '@/components/ui/table';
import { formatDateTime } from '@/lib/domain/formatters';
import { createSecretAction } from '@/app/(app)/secrets/actions';

export default async function SecretsPage() {
  const user = await requireInternalUser();

  if (!canManageSecrets(user.role)) {
    return (
      <Card>
        <p className="text-sm text-muted">Acces restrictionat. Doar Admin/Project Manager.</p>
      </Card>
    );
  }

  const [projects, secrets] = await Promise.all([
    prisma.project.findMany({
      where: projectAccessWhere(user),
      select: { id: true, name: true },
      orderBy: { name: 'asc' }
    }),
    prisma.secret.findMany({
      where: {
        project: projectAccessWhere(user)
      },
      include: {
        project: { select: { name: true } },
        createdBy: { select: { name: true } },
        accessLogs: {
          orderBy: { createdAt: 'desc' },
          take: 1
        }
      },
      orderBy: { updatedAt: 'desc' }
    })
  ]);

  return (
    <div>
      <PageHeader
        title="Secrets Vault"
        description="Credentiale externe criptate, acces strict si log imutabil pentru fiecare vizualizare."
      />

      <div className="grid gap-4 xl:grid-cols-[2fr_1fr]">
        <Card>
          <div className="overflow-auto">
            <Table>
              <thead>
                <tr>
                  <Th>Nume</Th>
                  <Th>Project</Th>
                  <Th>Username</Th>
                  <Th>Creat de</Th>
                  <Th>Ultim acces</Th>
                  <Th>Actiune</Th>
                </tr>
              </thead>
              <tbody>
                {secrets.map((secret) => (
                  <tr key={secret.id}>
                    <Td>{secret.name}</Td>
                    <Td>{secret.project.name}</Td>
                    <Td>{secret.username ?? '-'}</Td>
                    <Td>{secret.createdBy.name}</Td>
                    <Td>{formatDateTime(secret.accessLogs[0]?.createdAt)}</Td>
                    <Td>
                      <Link href={`/secrets/${secret.id}`} className="text-brand underline-offset-2 hover:underline">
                        Reveal + audit
                      </Link>
                    </Td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </div>
        </Card>

        <Card>
          <h3 className="text-lg font-semibold">Secret nou</h3>
          <form action={createSecretAction} className="mt-4 space-y-3">
            <div>
              <Label htmlFor="projectId">Proiect</Label>
              <Select id="projectId" name="projectId" required>
                <option value="">Selecteaza proiect</option>
                {projects.map((project) => (
                  <option key={project.id} value={project.id}>
                    {project.name}
                  </option>
                ))}
              </Select>
            </div>
            <div>
              <Label htmlFor="name">Nume secret</Label>
              <Input id="name" name="name" required />
            </div>
            <div>
              <Label htmlFor="username">Username</Label>
              <Input id="username" name="username" />
            </div>
            <div>
              <Label htmlFor="secretValue">Secret</Label>
              <Input id="secretValue" name="secretValue" required />
            </div>
            <div>
              <Label htmlFor="description">Descriere</Label>
              <Input id="description" name="description" />
            </div>
            <Button type="submit" className="w-full">
              Salveaza criptat
            </Button>
          </form>
        </Card>
      </div>
    </div>
  );
}
