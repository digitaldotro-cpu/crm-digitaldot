import { prisma } from '@/lib/db/prisma';
import { requireInternalUser } from '@/lib/auth/current-user';
import { projectAccessWhere } from '@/lib/domain/scopes';
import { PageHeader } from '@/components/layout/page-header';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Table, Th, Td } from '@/components/ui/table';
import { createAssetAction } from '@/app/(app)/assets/actions';

export default async function AssetsPage() {
  const user = await requireInternalUser();

  const [assets, users, projects] = await Promise.all([
    prisma.asset.findMany({
      include: {
        responsibleUser: { select: { name: true } },
        project: { select: { name: true } }
      },
      orderBy: { updatedAt: 'desc' },
      take: 50
    }),
    prisma.user.findMany({
      where: { role: { not: 'CLIENT' }, isActive: true },
      select: { id: true, name: true },
      orderBy: { name: 'asc' }
    }),
    prisma.project.findMany({
      where: projectAccessWhere(user),
      select: { id: true, name: true },
      orderBy: { name: 'asc' }
    })
  ]);

  return (
    <div>
      <PageHeader title="Echipamente" description="Asset registry: cine are ce, in ce status si pe ce proiect." />

      <div className="grid gap-4 xl:grid-cols-[2fr_1fr]">
        <Card>
          <div className="overflow-auto">
            <Table>
              <thead>
                <tr>
                  <Th>Nume</Th>
                  <Th>Categorie</Th>
                  <Th>Serial</Th>
                  <Th>Status</Th>
                  <Th>Responsabil</Th>
                  <Th>Proiect</Th>
                </tr>
              </thead>
              <tbody>
                {assets.map((asset) => (
                  <tr key={asset.id}>
                    <Td>{asset.name}</Td>
                    <Td>{asset.category}</Td>
                    <Td>{asset.serialNumber}</Td>
                    <Td>{asset.status}</Td>
                    <Td>{asset.responsibleUser?.name ?? '-'}</Td>
                    <Td>{asset.project?.name ?? '-'}</Td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </div>
        </Card>

        <Card>
          <h3 className="text-lg font-semibold">Echipament nou</h3>
          <form action={createAssetAction} className="mt-4 space-y-3">
            <div>
              <Label htmlFor="name">Nume</Label>
              <Input id="name" name="name" required />
            </div>
            <div>
              <Label htmlFor="category">Categorie</Label>
              <Input id="category" name="category" required />
            </div>
            <div>
              <Label htmlFor="serialNumber">Serial Number</Label>
              <Input id="serialNumber" name="serialNumber" required />
            </div>
            <div>
              <Label htmlFor="status">Status</Label>
              <Select id="status" name="status" defaultValue="AVAILABLE">
                {['AVAILABLE', 'IN_USE', 'IN_SERVICE', 'RETIRED'].map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </Select>
            </div>
            <div>
              <Label htmlFor="responsibleUserId">Responsabil</Label>
              <Select id="responsibleUserId" name="responsibleUserId">
                <option value="">-</option>
                {users.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.name}
                  </option>
                ))}
              </Select>
            </div>
            <div>
              <Label htmlFor="projectId">Proiect</Label>
              <Select id="projectId" name="projectId">
                <option value="">-</option>
                {projects.map((project) => (
                  <option key={project.id} value={project.id}>
                    {project.name}
                  </option>
                ))}
              </Select>
            </div>
            <Button type="submit" className="w-full">
              Salveaza echipament
            </Button>
          </form>
        </Card>
      </div>
    </div>
  );
}
