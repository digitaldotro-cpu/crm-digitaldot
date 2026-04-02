import Link from 'next/link';
import { prisma } from '@/lib/db/prisma';
import { requireInternalUser } from '@/lib/auth/current-user';
import { clientCompanyAccessWhere } from '@/lib/domain/scopes';
import { PageHeader } from '@/components/layout/page-header';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Table, Th, Td } from '@/components/ui/table';
import { createClientAction } from '@/app/(app)/clients/actions';

export default async function ClientsPage() {
  const user = await requireInternalUser();

  const clients = await prisma.company.findMany({
    where: clientCompanyAccessWhere(user),
    include: {
      _count: {
        select: {
          clientProjects: true,
          contacts: true
        }
      }
    },
    orderBy: {
      createdAt: 'desc'
    }
  });

  return (
    <div>
      <PageHeader
        title="Clienti"
        description="Registry centralizat pentru companiile client si relatia lor operationala in CRM."
      />

      <div className="grid gap-4 xl:grid-cols-[2fr_1fr]">
        <Card>
          <div className="overflow-auto">
            <Table>
              <thead>
                <tr>
                  <Th>Companie</Th>
                  <Th>Status</Th>
                  <Th>Proiecte</Th>
                  <Th>Contacte</Th>
                  <Th>Actiuni</Th>
                </tr>
              </thead>
              <tbody>
                {clients.map((client) => (
                  <tr key={client.id}>
                    <Td>{client.name}</Td>
                    <Td>{client.status}</Td>
                    <Td>{client._count.clientProjects}</Td>
                    <Td>{client._count.contacts}</Td>
                    <Td>
                      <Link href={`/clients/${client.id}`} className="text-brand underline-offset-2 hover:underline">
                        Vezi detalii
                      </Link>
                    </Td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </div>
        </Card>

        <Card>
          <h3 className="text-lg font-semibold">Client nou</h3>
          <form action={createClientAction} className="mt-4 space-y-3">
            <div>
              <Label htmlFor="name">Nume companie</Label>
              <Input id="name" name="name" required />
            </div>
            <div>
              <Label htmlFor="slug">Slug</Label>
              <Input id="slug" name="slug" placeholder="fitcore" required />
            </div>
            <div>
              <Label htmlFor="website">Website</Label>
              <Input id="website" name="website" placeholder="https://" />
            </div>
            <div>
              <Label htmlFor="status">Status</Label>
              <Input id="status" name="status" defaultValue="ACTIVE" required />
            </div>
            <Button type="submit" className="w-full">
              Salveaza client
            </Button>
          </form>
        </Card>
      </div>
    </div>
  );
}
