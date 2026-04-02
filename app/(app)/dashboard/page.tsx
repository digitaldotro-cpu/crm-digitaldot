import { prisma } from '@/lib/db/prisma';
import { requireInternalUser } from '@/lib/auth/current-user';
import { projectAccessWhere, taskAccessWhere, timeEntryAccessWhere } from '@/lib/domain/scopes';
import { StatCard } from '@/components/layout/stat-card';
import { Card } from '@/components/ui/card';
import { PageHeader } from '@/components/layout/page-header';
import { formatMinutes } from '@/lib/domain/formatters';

export default async function DashboardPage() {
  const user = await requireInternalUser();

  const [projectsCount, taskCount, openTaskCount, pendingEntries, approvedMinutes, overdueFinance] = await Promise.all([
    prisma.project.count({ where: projectAccessWhere(user) }),
    prisma.task.count({ where: taskAccessWhere(user) }),
    prisma.task.count({
      where: {
        ...taskAccessWhere(user),
        status: {
          in: ['TODO', 'IN_PROGRESS', 'BLOCKED', 'REVIEW']
        }
      }
    }),
    prisma.timeEntry.count({
      where: {
        ...timeEntryAccessWhere(user),
        status: 'SUBMITTED'
      }
    }),
    prisma.timeEntry.aggregate({
      where: {
        ...timeEntryAccessWhere(user),
        status: 'APPROVED'
      },
      _sum: {
        durationMinutes: true
      }
    }),
    prisma.financialTransaction.count({
      where:
        user.role === 'ADMIN' || user.role === 'FINANCE'
          ? { status: 'OVERDUE' }
          : {
              status: 'OVERDUE',
              project: {
                memberships: {
                  some: {
                    userId: user.id
                  }
                }
              }
            }
    })
  ]);

  const recentTasks = await prisma.task.findMany({
    where: taskAccessWhere(user),
    include: {
      project: { select: { name: true } },
      assignee: { select: { name: true } }
    },
    orderBy: {
      updatedAt: 'desc'
    },
    take: 8
  });

  return (
    <div>
      <PageHeader
        title="Dashboard"
        description="Panou operational intern cu focus pe taskuri, time tracking si risc financiar."
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <StatCard label="Proiecte active in scope" value={projectsCount} />
        <StatCard label="Taskuri totale in scope" value={taskCount} />
        <StatCard label="Taskuri deschise" value={openTaskCount} />
        <StatCard label="Time entries in asteptare" value={pendingEntries} />
        <StatCard label="Ore aprobate" value={formatMinutes(approvedMinutes._sum.durationMinutes ?? 0)} />
        <StatCard label="Tranzactii overdue" value={overdueFinance} />
      </div>

      <Card className="mt-5">
        <h3 className="text-sm font-semibold uppercase tracking-wide text-muted">Taskuri recente</h3>
        <div className="mt-3 overflow-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs uppercase tracking-wide text-muted">
                <th className="px-2 py-2">Titlu</th>
                <th className="px-2 py-2">Proiect</th>
                <th className="px-2 py-2">Status</th>
                <th className="px-2 py-2">Asignee</th>
              </tr>
            </thead>
            <tbody>
              {recentTasks.map((task) => (
                <tr key={task.id} className="border-t border-line">
                  <td className="px-2 py-2 font-medium text-foreground">{task.title}</td>
                  <td className="px-2 py-2 text-muted">{task.project.name}</td>
                  <td className="px-2 py-2 text-muted">{task.status}</td>
                  <td className="px-2 py-2 text-muted">{task.assignee?.name ?? '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
