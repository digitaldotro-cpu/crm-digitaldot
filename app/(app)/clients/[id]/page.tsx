import { notFound } from 'next/navigation';
import { prisma } from '@/lib/db/prisma';
import { requireInternalUser } from '@/lib/auth/current-user';
import { clientCompanyAccessWhere } from '@/lib/domain/scopes';
import { Card } from '@/components/ui/card';
import { PageHeader } from '@/components/layout/page-header';
import { formatDate } from '@/lib/domain/formatters';

export default async function ClientDetailsPage({ params }: { params: { id: string } }) {
  const user = await requireInternalUser();

  const client = await prisma.company.findFirst({
    where: {
      id: params.id,
      ...clientCompanyAccessWhere(user)
    },
    include: {
      contacts: true,
      clientProjects: {
        include: {
          _count: {
            select: {
              tasks: true,
              timeEntries: true,
              documentInstances: true
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        }
      },
      financialTransactions: {
        orderBy: { createdAt: 'desc' },
        take: 10
      },
      reportSnapshots: {
        orderBy: { periodStart: 'desc' },
        take: 6
      }
    }
  });

  if (!client) {
    notFound();
  }

  return (
    <div>
      <PageHeader
        title={client.name}
        description="Subpagini client: proiecte, taskuri, research, documente si rapoarte. Date client-facing publicate explicit."
      />

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <h3 className="text-sm font-semibold uppercase tracking-wide text-muted">Contacte</h3>
          <div className="mt-3 space-y-2">
            {client.contacts.map((contact) => (
              <div key={contact.id} className="rounded-md border border-line p-3">
                <p className="font-medium">{contact.name}</p>
                <p className="text-sm text-muted">{contact.email}</p>
                <p className="text-xs text-muted">{contact.position ?? '-'}</p>
              </div>
            ))}
          </div>
        </Card>

        <Card>
          <h3 className="text-sm font-semibold uppercase tracking-wide text-muted">Proiecte</h3>
          <div className="mt-3 space-y-2">
            {client.clientProjects.map((project) => (
              <div key={project.id} className="rounded-md border border-line p-3">
                <p className="font-medium">{project.name}</p>
                <p className="text-xs text-muted">{project.status}</p>
                <p className="mt-1 text-xs text-muted">
                  Taskuri: {project._count.tasks} | Time entries: {project._count.timeEntries} | Documente:{' '}
                  {project._count.documentInstances}
                </p>
              </div>
            ))}
          </div>
        </Card>

        <Card>
          <h3 className="text-sm font-semibold uppercase tracking-wide text-muted">Tranzactii recente</h3>
          <div className="mt-3 space-y-2 text-sm">
            {client.financialTransactions.length === 0 ? (
              <p className="text-muted">Nu exista tranzactii.</p>
            ) : (
              client.financialTransactions.map((tx) => (
                <div key={tx.id} className="rounded-md border border-line p-3">
                  <p className="font-medium">{tx.type}</p>
                  <p className="text-xs text-muted">
                    {tx.amount.toString()} {tx.currency} - {tx.status}
                  </p>
                </div>
              ))
            )}
          </div>
        </Card>

        <Card>
          <h3 className="text-sm font-semibold uppercase tracking-wide text-muted">Rapoarte client</h3>
          <div className="mt-3 space-y-2 text-sm">
            {client.reportSnapshots.length === 0 ? (
              <p className="text-muted">Nu exista snapshot-uri.</p>
            ) : (
              client.reportSnapshots.map((report) => (
                <div key={report.id} className="rounded-md border border-line p-3">
                  <p className="font-medium">
                    {formatDate(report.periodStart)} - {formatDate(report.periodEnd)}
                  </p>
                  <p className="text-xs text-muted">Publicat client: {report.publishedToClient ? 'Da' : 'Nu'}</p>
                </div>
              ))
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}
