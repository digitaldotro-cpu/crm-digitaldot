import { prisma } from '@/lib/db/prisma';
import { requireInternalUser } from '@/lib/auth/current-user';
import { PageHeader } from '@/components/layout/page-header';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Table, Th, Td } from '@/components/ui/table';
import { createLeadAction, convertLeadAction } from '@/app/(app)/leads/actions';
import { formatDate } from '@/lib/domain/formatters';

export default async function LeadsPage() {
  await requireInternalUser();

  const leads = await prisma.lead.findMany({
    orderBy: { updatedAt: 'desc' },
    take: 50
  });

  return (
    <div>
      <PageHeader title="Prospectare" description="Pipeline lead-uri si conversie lead -> client + proiect initial." />

      <div className="grid gap-4 xl:grid-cols-[2fr_1fr]">
        <Card>
          <div className="overflow-auto">
            <Table>
              <thead>
                <tr>
                  <Th>Companie</Th>
                  <Th>Contact</Th>
                  <Th>Stage</Th>
                  <Th>Next Step</Th>
                  <Th>Reminder</Th>
                  <Th>Conversie</Th>
                </tr>
              </thead>
              <tbody>
                {leads.map((lead) => (
                  <tr key={lead.id}>
                    <Td>{lead.companyName}</Td>
                    <Td>
                      {lead.contactName}
                      <br />
                      <span className="text-xs text-muted">{lead.contactEmail}</span>
                    </Td>
                    <Td>{lead.stage}</Td>
                    <Td>{lead.nextStep ?? '-'}</Td>
                    <Td>{formatDate(lead.reminderAt)}</Td>
                    <Td>
                      {lead.convertedClientId ? (
                        <span className="text-xs text-emerald-700">Convertit</span>
                      ) : (
                        <form action={convertLeadAction}>
                          <input type="hidden" name="leadId" value={lead.id} />
                          <Button type="submit" variant="secondary" className="h-8">
                            Convert
                          </Button>
                        </form>
                      )}
                    </Td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </div>
        </Card>

        <Card>
          <h3 className="text-lg font-semibold">Lead nou</h3>
          <form action={createLeadAction} className="mt-4 space-y-3">
            <div>
              <Label htmlFor="companyName">Companie</Label>
              <Input id="companyName" name="companyName" required />
            </div>
            <div>
              <Label htmlFor="contactName">Contact</Label>
              <Input id="contactName" name="contactName" required />
            </div>
            <div>
              <Label htmlFor="contactEmail">Email</Label>
              <Input id="contactEmail" name="contactEmail" type="email" required />
            </div>
            <div>
              <Label htmlFor="source">Sursa</Label>
              <Input id="source" name="source" placeholder="Referral, Ads, Outbound" />
            </div>
            <div>
              <Label htmlFor="stage">Pipeline Stage</Label>
              <Select id="stage" name="stage" defaultValue="NEW">
                {['NEW', 'CONTACTED', 'QUALIFIED', 'PROPOSAL', 'NEGOTIATION', 'WON', 'LOST'].map((stage) => (
                  <option key={stage} value={stage}>
                    {stage}
                  </option>
                ))}
              </Select>
            </div>
            <div>
              <Label htmlFor="nextStep">Next Step</Label>
              <Input id="nextStep" name="nextStep" />
            </div>
            <div>
              <Label htmlFor="reminderAt">Reminder</Label>
              <Input id="reminderAt" name="reminderAt" type="date" />
            </div>
            <Button type="submit" className="w-full">
              Salveaza lead
            </Button>
          </form>
        </Card>
      </div>
    </div>
  );
}
