import { prisma } from '@/lib/db/prisma';
import { requireInternalUser } from '@/lib/auth/current-user';
import { canAccessAudit } from '@/lib/domain/permissions';
import { Card } from '@/components/ui/card';
import { PageHeader } from '@/components/layout/page-header';
import { Table, Th, Td } from '@/components/ui/table';
import { formatDateTime } from '@/lib/domain/formatters';

export default async function AuditPage() {
  const user = await requireInternalUser();

  if (!canAccessAudit(user.role)) {
    return (
      <Card>
        <p className="text-sm text-muted">Doar Admin are acces la audit log.</p>
      </Card>
    );
  }

  const logs = await prisma.auditLog.findMany({
    include: {
      actor: { select: { name: true, email: true } }
    },
    orderBy: { createdAt: 'desc' },
    take: 150
  });

  return (
    <div>
      <PageHeader title="Audit Logs" description="Evenimente critice securitate, permisiuni, documente si secrete." />

      <Card>
        <div className="overflow-auto">
          <Table>
            <thead>
              <tr>
                <Th>Timp</Th>
                <Th>Actor</Th>
                <Th>Action</Th>
                <Th>Entity</Th>
                <Th>Severity</Th>
                <Th>Metadata</Th>
              </tr>
            </thead>
            <tbody>
              {logs.map((log) => (
                <tr key={log.id}>
                  <Td>{formatDateTime(log.createdAt)}</Td>
                  <Td>
                    {log.actor?.name ?? 'System'}
                    <br />
                    <span className="text-xs text-muted">{log.actor?.email ?? '-'}</span>
                  </Td>
                  <Td>{log.action}</Td>
                  <Td>
                    {log.entityType}
                    <br />
                    <span className="text-xs text-muted">{log.entityId ?? '-'}</span>
                  </Td>
                  <Td>{log.severity}</Td>
                  <Td>
                    <pre className="max-w-[360px] whitespace-pre-wrap text-xs text-muted">
                      {log.metadata ? JSON.stringify(log.metadata, null, 2) : '-'}
                    </pre>
                  </Td>
                </tr>
              ))}
            </tbody>
          </Table>
        </div>
      </Card>
    </div>
  );
}
