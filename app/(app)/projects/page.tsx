import Link from 'next/link';
import { prisma } from '@/lib/db/prisma';
import { requireInternalUser } from '@/lib/auth/current-user';
import { projectAccessWhere, clientCompanyAccessWhere } from '@/lib/domain/scopes';
import { PageHeader } from '@/components/layout/page-header';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Select } from '@/components/ui/select';
import { Table, Th, Td } from '@/components/ui/table';
import { formatDate } from '@/lib/domain/formatters';
import { createProjectAction } from '@/app/(app)/projects/actions';

export default async function ProjectsPage() {
  const user = await requireInternalUser();

  const [projects, clients] = await Promise.all([
    prisma.project.findMany({
      where: projectAccessWhere(user),
      include: {
        clientCompany: { select: { name: true } },
        _count: { select: { memberships: true, tasks: true, timeEntries: true } }
      },
      orderBy: {
        createdAt: 'desc'
      }
    }),
    prisma.company.findMany({
      where: clientCompanyAccessWhere(user),
      select: { id: true, name: true },
      orderBy: { name: 'asc' }
    })
  ]);

  return (
    <div>
      <PageHeader
        title="Proiecte"
        description="Containerul principal pentru taskuri, time tracking, documente, secrete si comisioane."
      />

      <div className="grid gap-4 xl:grid-cols-[2fr_1fr]">
        <Card>
          <div className="overflow-auto">
            <Table>
              <thead>
                <tr>
                  <Th>Nume</Th>
                  <Th>Client</Th>
                  <Th>Status</Th>
                  <Th>Perioada</Th>
                  <Th>Scope</Th>
                  <Th>Detalii</Th>
                </tr>
              </thead>
              <tbody>
                {projects.map((project) => (
                  <tr key={project.id}>
                    <Td>{project.name}</Td>
                    <Td>{project.clientCompany.name}</Td>
                    <Td>{project.status}</Td>
                    <Td>
                      {formatDate(project.startDate)} - {formatDate(project.endDate)}
                    </Td>
                    <Td>
                      {project._count.memberships} membri | {project._count.tasks} taskuri | {project._count.timeEntries} time
                    </Td>
                    <Td>
                      <Link href={`/projects/${project.id}`} className="text-brand underline-offset-2 hover:underline">
                        Vezi
                      </Link>
                    </Td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </div>
        </Card>

        <Card>
          <h3 className="text-lg font-semibold">Proiect nou</h3>
          <form action={createProjectAction} className="mt-4 space-y-3">
            <div>
              <Label htmlFor="name">Nume proiect</Label>
              <Input id="name" name="name" required />
            </div>

            <div>
              <Label htmlFor="clientCompanyId">Client</Label>
              <Select id="clientCompanyId" name="clientCompanyId" required>
                <option value="">Selecteaza client</option>
                {clients.map((client) => (
                  <option key={client.id} value={client.id}>
                    {client.name}
                  </option>
                ))}
              </Select>
            </div>

            <div>
              <Label htmlFor="status">Status</Label>
              <Select id="status" name="status" defaultValue="PLANNING">
                {['PLANNING', 'ACTIVE', 'ON_HOLD', 'COMPLETED', 'ARCHIVED'].map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </Select>
            </div>

            <div>
              <Label htmlFor="services">Servicii (CSV)</Label>
              <Input id="services" name="services" placeholder="Social Media, Ads, SEO" />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label htmlFor="startDate">Start</Label>
                <Input id="startDate" name="startDate" type="date" />
              </div>
              <div>
                <Label htmlFor="endDate">Final</Label>
                <Input id="endDate" name="endDate" type="date" />
              </div>
            </div>

            <div>
              <Label htmlFor="description">Descriere</Label>
              <Input id="description" name="description" />
            </div>

            <Button type="submit" className="w-full">
              Creeaza proiect
            </Button>
          </form>
        </Card>
      </div>
    </div>
  );
}
