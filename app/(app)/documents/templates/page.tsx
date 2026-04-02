import { prisma } from '@/lib/db/prisma';
import { requireInternalUser } from '@/lib/auth/current-user';
import { canManageTemplates } from '@/lib/domain/permissions';
import { PageHeader } from '@/components/layout/page-header';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Table, Th, Td } from '@/components/ui/table';
import { createTemplateAction } from '@/app/(app)/documents/templates/actions';

export default async function DocumentTemplatesPage() {
  const user = await requireInternalUser();

  const templates = await prisma.documentTemplate.findMany({
    include: {
      createdBy: { select: { name: true } },
      _count: { select: { instances: true, versions: true } }
    },
    orderBy: { updatedAt: 'desc' }
  });

  const canEdit = canManageTemplates(user.role);

  return (
    <div>
      <PageHeader
        title="Template-uri document"
        description="NDA, Contract, Oferta. Clauzele de confidentialitate si penalizare sunt configurabile."
      />

      <div className="grid gap-4 xl:grid-cols-[2fr_1fr]">
        <Card>
          <div className="overflow-auto">
            <Table>
              <thead>
                <tr>
                  <Th>Nume</Th>
                  <Th>Tip</Th>
                  <Th>Versiune</Th>
                  <Th>Flags juridice</Th>
                  <Th>Instante</Th>
                </tr>
              </thead>
              <tbody>
                {templates.map((template) => (
                  <tr key={template.id}>
                    <Td>
                      {template.name}
                      <br />
                      <span className="text-xs text-muted">{template.createdBy.name}</span>
                    </Td>
                    <Td>{template.type}</Td>
                    <Td>{template.version}</Td>
                    <Td>
                      <span className="text-xs text-muted">
                        NDA signed required: {template.requiresNdaSigned ? 'Da' : 'Nu'}
                        <br />
                        Non-disclosure annex: {template.includesServiceConfidentialityClause ? 'Da' : 'Nu'}
                        <br />
                        Disclosure penalties: {template.includesDisclosurePenaltyClause ? 'Da' : 'Nu'}
                      </span>
                    </Td>
                    <Td>
                      {template._count.instances} inst. / {template._count.versions} versiuni
                    </Td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </div>
        </Card>

        <Card>
          <h3 className="text-lg font-semibold">Template nou</h3>
          {canEdit ? (
            <form action={createTemplateAction} className="mt-4 space-y-3">
              <div>
                <Label htmlFor="name">Nume</Label>
                <Input id="name" name="name" required />
              </div>
              <div>
                <Label htmlFor="type">Tip</Label>
                <Select id="type" name="type" defaultValue="NDA">
                  {['NDA', 'CONTRACT', 'OFFER', 'INTERNAL'].map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </Select>
              </div>
              <div>
                <Label htmlFor="content">Continut</Label>
                <Textarea id="content" name="content" rows={10} placeholder="Use placeholders like {{client_name}}" required />
              </div>
              <label className="flex items-center gap-2 text-sm text-muted">
                <input type="checkbox" name="requiresNdaSigned" />
                Necesita NDA semnat inainte de trimitere
              </label>
              <label className="flex items-center gap-2 text-sm text-muted">
                <input type="checkbox" name="includesServiceConfidentialityClause" />
                Include clauza non-divulgare Anexa servicii
              </label>
              <label className="flex items-center gap-2 text-sm text-muted">
                <input type="checkbox" name="includesDisclosurePenaltyClause" />
                Include penalizari pentru divulgare
              </label>
              <Button type="submit" className="w-full">
                Salveaza template
              </Button>
            </form>
          ) : (
            <p className="mt-3 text-sm text-muted">Doar Admin/Project Manager pot edita template-uri.</p>
          )}
        </Card>
      </div>
    </div>
  );
}
