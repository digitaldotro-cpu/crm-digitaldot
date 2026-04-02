import { notFound } from 'next/navigation';
import { prisma } from '@/lib/db/prisma';
import { requireInternalUser } from '@/lib/auth/current-user';
import { assertProjectAccess } from '@/lib/domain/access';
import { Card } from '@/components/ui/card';
import { PageHeader } from '@/components/layout/page-header';
import { Select } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { addProjectMemberAction } from '@/app/(app)/projects/actions';

export default async function ProjectDetailsPage({ params }: { params: { id: string } }) {
  const user = await requireInternalUser();

  await assertProjectAccess(user, params.id);

  const [project, users] = await Promise.all([
    prisma.project.findUnique({
      where: { id: params.id },
      include: {
        clientCompany: true,
        memberships: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                role: true
              }
            }
          }
        },
        _count: {
          select: {
            tasks: true,
            timeEntries: true,
            documentInstances: true,
            secrets: true
          }
        }
      }
    }),
    prisma.user.findMany({
      where: { role: { not: 'CLIENT' }, isActive: true },
      select: { id: true, name: true, role: true },
      orderBy: { name: 'asc' }
    })
  ]);

  if (!project) {
    notFound();
  }

  return (
    <div>
      <PageHeader
        title={project.name}
        description={`Client: ${project.clientCompany.name} | Status: ${project.status}`}
      />

      <div className="grid gap-4 lg:grid-cols-[2fr_1fr]">
        <Card>
          <h3 className="text-sm font-semibold uppercase tracking-wide text-muted">Membri proiect</h3>
          <div className="mt-3 space-y-2">
            {project.memberships.map((membership) => (
              <div key={membership.id} className="rounded-md border border-line p-3">
                <p className="font-medium">{membership.user.name}</p>
                <p className="text-xs text-muted">
                  {membership.user.email} | role sistem: {membership.user.role} | rol proiect: {membership.role}
                </p>
              </div>
            ))}
          </div>
        </Card>

        <Card>
          <h3 className="text-sm font-semibold uppercase tracking-wide text-muted">Adauga / actualizeaza membru</h3>
          <form action={addProjectMemberAction} className="mt-4 space-y-3">
            <input type="hidden" name="projectId" value={project.id} />
            <div>
              <label htmlFor="memberId" className="mb-1 block text-xs font-semibold uppercase text-muted">
                Utilizator
              </label>
              <Select id="memberId" name="memberId" required>
                <option value="">Selecteaza user</option>
                {users.map((member) => (
                  <option key={member.id} value={member.id}>
                    {member.name} ({member.role})
                  </option>
                ))}
              </Select>
            </div>
            <div>
              <label htmlFor="role" className="mb-1 block text-xs font-semibold uppercase text-muted">
                Rol proiect
              </label>
              <Select id="role" name="role" defaultValue="CONTRIBUTOR">
                {['MANAGER', 'CONTRIBUTOR', 'VIEWER', 'FINANCE_REVIEWER', 'CLIENT_VIEWER'].map((role) => (
                  <option key={role} value={role}>
                    {role}
                  </option>
                ))}
              </Select>
            </div>
            <Button type="submit" className="w-full">
              Salveaza membership
            </Button>
          </form>

          <div className="mt-4 rounded-md border border-line bg-slate-50 p-3 text-xs text-muted">
            Scope curent: {project._count.tasks} taskuri, {project._count.timeEntries} time entries,
            {' '}{project._count.documentInstances} documente, {project._count.secrets} secrete.
          </div>
        </Card>
      </div>
    </div>
  );
}
