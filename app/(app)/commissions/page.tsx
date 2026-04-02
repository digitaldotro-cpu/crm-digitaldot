import { prisma } from '@/lib/db/prisma';
import { requireInternalUser } from '@/lib/auth/current-user';
import { canApproveCommission, canManageCommission } from '@/lib/domain/permissions';
import { projectAccessWhere } from '@/lib/domain/scopes';
import { PageHeader } from '@/components/layout/page-header';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Table, Th, Td } from '@/components/ui/table';
import { approveCommissionAction, createCommissionAction } from '@/app/(app)/commissions/actions';

export default async function CommissionsPage() {
  const user = await requireInternalUser();

  if (!canManageCommission(user.role)) {
    return (
      <Card>
        <p className="text-sm text-muted">Nu ai acces la modulul comisioane.</p>
      </Card>
    );
  }

  const [rules, projects, users] = await Promise.all([
    prisma.commissionRule.findMany({
      include: {
        project: { select: { name: true } },
        proposedBy: { select: { name: true } },
        approvedBy: { select: { name: true } },
        allocations: {
          include: {
            participantUser: { select: { name: true } }
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    }),
    prisma.project.findMany({
      where: projectAccessWhere(user),
      select: { id: true, name: true },
      orderBy: { name: 'asc' }
    }),
    prisma.user.findMany({
      where: {
        role: { not: 'CLIENT' },
        isActive: true
      },
      select: { id: true, name: true },
      orderBy: { name: 'asc' }
    })
  ]);

  return (
    <div>
      <PageHeader
        title="Comisioane"
        description="Reguli comision + alocari participanti, cu workflow propunere -> aprobare."
      />

      <div className="grid gap-4 xl:grid-cols-[2fr_1fr]">
        <Card>
          <div className="overflow-auto">
            <Table>
              <thead>
                <tr>
                  <Th>Regula</Th>
                  <Th>Proiect</Th>
                  <Th>Tip</Th>
                  <Th>Alocari</Th>
                  <Th>Status</Th>
                  <Th>Actiune</Th>
                </tr>
              </thead>
              <tbody>
                {rules.map((rule) => (
                  <tr key={rule.id}>
                    <Td>
                      <p className="font-medium">{rule.name}</p>
                      <p className="text-xs text-muted">Proposed by {rule.proposedBy.name}</p>
                    </Td>
                    <Td>{rule.project.name}</Td>
                    <Td>
                      {rule.type}
                      <br />
                      <span className="text-xs text-muted">
                        Fix: {rule.fixedAmount?.toString() ?? '-'} | %: {rule.percentage?.toString() ?? '-'}
                      </span>
                    </Td>
                    <Td>
                      {rule.allocations.map((a) => (
                        <p key={a.id} className="text-xs text-muted">
                          {a.participantUser.name}: {a.amount?.toString() ?? '-'} / {a.percentage?.toString() ?? '-'}%
                        </p>
                      ))}
                    </Td>
                    <Td>{rule.approvalStatus}</Td>
                    <Td>
                      {rule.approvalStatus === 'PENDING' && canApproveCommission(user.role) ? (
                        <form action={approveCommissionAction}>
                          <input type="hidden" name="ruleId" value={rule.id} />
                          <Button type="submit" variant="secondary" className="h-8">
                            Aproba
                          </Button>
                        </form>
                      ) : (
                        <span className="text-xs text-muted">-</span>
                      )}
                    </Td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </div>
        </Card>

        <Card>
          <h3 className="text-lg font-semibold">Propune comision</h3>
          <form action={createCommissionAction} className="mt-4 space-y-3">
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
              <Label htmlFor="name">Nume regula</Label>
              <Input id="name" name="name" required />
            </div>
            <div>
              <Label htmlFor="type">Tip</Label>
              <Select id="type" name="type" defaultValue="PERCENTAGE">
                {['FIXED', 'PERCENTAGE', 'MIXED'].map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label htmlFor="fixedAmount">Fix</Label>
                <Input id="fixedAmount" name="fixedAmount" type="number" step="0.01" />
              </div>
              <div>
                <Label htmlFor="percentage">%</Label>
                <Input id="percentage" name="percentage" type="number" step="0.01" />
              </div>
            </div>
            <div>
              <Label htmlFor="participantUserId">Participant</Label>
              <Select id="participantUserId" name="participantUserId" required>
                <option value="">Selecteaza user</option>
                {users.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.name}
                  </option>
                ))}
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label htmlFor="allocationAmount">Alocare fixa</Label>
                <Input id="allocationAmount" name="allocationAmount" type="number" step="0.01" />
              </div>
              <div>
                <Label htmlFor="allocationPercentage">Alocare %</Label>
                <Input id="allocationPercentage" name="allocationPercentage" type="number" step="0.01" />
              </div>
            </div>
            <Button type="submit" className="w-full">
              Propune comision
            </Button>
          </form>
        </Card>
      </div>
    </div>
  );
}
