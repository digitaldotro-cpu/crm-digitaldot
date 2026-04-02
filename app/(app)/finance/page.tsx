import { prisma } from '@/lib/db/prisma';
import { requireInternalUser } from '@/lib/auth/current-user';
import { canAccessFinance } from '@/lib/domain/permissions';
import { projectAccessWhere } from '@/lib/domain/scopes';
import { PageHeader } from '@/components/layout/page-header';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Table, Th, Td } from '@/components/ui/table';
import { formatCurrency, formatDate } from '@/lib/domain/formatters';
import { createFinanceCategoryAction, createFinanceTransactionAction } from '@/app/(app)/finance/actions';

export default async function FinancePage() {
  const user = await requireInternalUser();

  if (!canAccessFinance(user.role)) {
    return (
      <Card>
        <p className="text-sm text-muted">Nu ai permisiuni pentru modulul financiar.</p>
      </Card>
    );
  }

  const [categories, transactions, projects, clients] = await Promise.all([
    prisma.financialCategory.findMany({ orderBy: { name: 'asc' } }),
    prisma.financialTransaction.findMany({
      include: {
        category: true,
        project: { select: { name: true } },
        clientCompany: { select: { name: true } }
      },
      orderBy: { createdAt: 'desc' },
      take: 50
    }),
    prisma.project.findMany({
      where: projectAccessWhere(user),
      select: { id: true, name: true },
      orderBy: { name: 'asc' }
    }),
    prisma.company.findMany({
      where: { type: 'CLIENT' },
      select: { id: true, name: true },
      orderBy: { name: 'asc' }
    })
  ]);

  return (
    <div>
      <PageHeader title="Financiar" description="Income/outcome, categorii, statusuri si scadente." />

      <div className="grid gap-4 xl:grid-cols-[2fr_1fr]">
        <Card>
          <div className="overflow-auto">
            <Table>
              <thead>
                <tr>
                  <Th>Tip</Th>
                  <Th>Categorie</Th>
                  <Th>Client</Th>
                  <Th>Proiect</Th>
                  <Th>Suma</Th>
                  <Th>Status</Th>
                  <Th>Scadenta</Th>
                </tr>
              </thead>
              <tbody>
                {transactions.map((tx) => (
                  <tr key={tx.id}>
                    <Td>{tx.type}</Td>
                    <Td>{tx.category.name}</Td>
                    <Td>{tx.clientCompany?.name ?? '-'}</Td>
                    <Td>{tx.project?.name ?? '-'}</Td>
                    <Td>{formatCurrency(tx.amount.toString(), tx.currency)}</Td>
                    <Td>{tx.status}</Td>
                    <Td>{formatDate(tx.dueDate)}</Td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </div>
        </Card>

        <div className="space-y-4">
          <Card>
            <h3 className="text-lg font-semibold">Tranzactie noua</h3>
            <form action={createFinanceTransactionAction} className="mt-4 space-y-3">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Label htmlFor="type">Tip</Label>
                  <Select id="type" name="type" defaultValue="OUTCOME">
                    <option value="INCOME">INCOME</option>
                    <option value="OUTCOME">OUTCOME</option>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="status">Status</Label>
                  <Select id="status" name="status" defaultValue="PLANNED">
                    {['PLANNED', 'ISSUED', 'PAID', 'OVERDUE'].map((status) => (
                      <option key={status} value={status}>
                        {status}
                      </option>
                    ))}
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="categoryId">Categorie</Label>
                <Select id="categoryId" name="categoryId" required>
                  <option value="">Selecteaza</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name} ({category.type})
                    </option>
                  ))}
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Label htmlFor="amount">Suma</Label>
                  <Input id="amount" name="amount" type="number" step="0.01" required />
                </div>
                <div>
                  <Label htmlFor="currency">Moneda</Label>
                  <Input id="currency" name="currency" defaultValue="EUR" required />
                </div>
              </div>

              <div>
                <Label htmlFor="clientCompanyId">Client</Label>
                <Select id="clientCompanyId" name="clientCompanyId">
                  <option value="">-</option>
                  {clients.map((client) => (
                    <option key={client.id} value={client.id}>
                      {client.name}
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

              <div>
                <Label htmlFor="dueDate">Scadenta</Label>
                <Input id="dueDate" name="dueDate" type="date" />
              </div>

              <div>
                <Label htmlFor="note">Note</Label>
                <Input id="note" name="note" />
              </div>

              <Button type="submit" className="w-full">
                Salveaza tranzactie
              </Button>
            </form>
          </Card>

          <Card>
            <h3 className="text-sm font-semibold uppercase tracking-wide text-muted">Categorie noua</h3>
            <form action={createFinanceCategoryAction} className="mt-4 space-y-3">
              <div>
                <Label htmlFor="catName">Nume</Label>
                <Input id="catName" name="name" required />
              </div>
              <div>
                <Label htmlFor="catType">Tip</Label>
                <Select id="catType" name="type" defaultValue="OUTCOME">
                  <option value="INCOME">INCOME</option>
                  <option value="OUTCOME">OUTCOME</option>
                </Select>
              </div>
              <Button type="submit" className="w-full" variant="secondary">
                Salveaza categorie
              </Button>
            </form>
          </Card>
        </div>
      </div>
    </div>
  );
}
