import { prisma } from '@/lib/db/prisma';
import { requireInternalUser } from '@/lib/auth/current-user';
import { projectAccessWhere } from '@/lib/domain/scopes';
import { PageHeader } from '@/components/layout/page-header';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Table, Th, Td } from '@/components/ui/table';
import { formatDate } from '@/lib/domain/formatters';
import { generateDocumentAction, updateDocumentStatusAction } from '@/app/(app)/documents/instances/actions';

export default async function DocumentInstancesPage() {
  const user = await requireInternalUser();

  const [templates, projects, instances] = await Promise.all([
    prisma.documentTemplate.findMany({
      where: { isActive: true },
      select: { id: true, name: true, type: true, requiresNdaSigned: true },
      orderBy: { name: 'asc' }
    }),
    prisma.project.findMany({
      where: projectAccessWhere(user),
      select: {
        id: true,
        name: true,
        clientCompany: { select: { name: true } }
      },
      orderBy: { name: 'asc' }
    }),
    prisma.documentInstance.findMany({
      where: {
        project: projectAccessWhere(user)
      },
      include: {
        template: { select: { name: true, type: true } },
        project: { select: { name: true } },
        clientCompany: { select: { name: true } }
      },
      orderBy: { createdAt: 'desc' },
      take: 50
    })
  ]);

  return (
    <div>
      <PageHeader
        title="Documente generate"
        description="Generare din template, status tracking si publicare controlata in client portal."
      />

      <div className="grid gap-4 xl:grid-cols-[2fr_1fr]">
        <Card>
          <div className="overflow-auto">
            <Table>
              <thead>
                <tr>
                  <Th>Titlu</Th>
                  <Th>Template</Th>
                  <Th>Client</Th>
                  <Th>Status</Th>
                  <Th>Publicat</Th>
                  <Th>Update</Th>
                </tr>
              </thead>
              <tbody>
                {instances.map((instance) => (
                  <tr key={instance.id}>
                    <Td>
                      <p className="font-medium">{instance.title}</p>
                      <p className="text-xs text-muted">{formatDate(instance.createdAt)}</p>
                    </Td>
                    <Td>
                      {instance.template.name}
                      <br />
                      <span className="text-xs text-muted">{instance.template.type}</span>
                    </Td>
                    <Td>
                      {instance.clientCompany.name}
                      <br />
                      <span className="text-xs text-muted">{instance.project.name}</span>
                    </Td>
                    <Td>{instance.status}</Td>
                    <Td>{instance.publishedToClient ? 'Da' : 'Nu'}</Td>
                    <Td>
                      <form action={updateDocumentStatusAction} className="flex gap-2">
                        <input type="hidden" name="instanceId" value={instance.id} />
                        <Select name="status" defaultValue={instance.status}>
                          {['DRAFT', 'GENERATED', 'SENT', 'VIEWED', 'SIGNED', 'EXPIRED'].map((status) => (
                            <option key={status} value={status}>
                              {status}
                            </option>
                          ))}
                        </Select>
                        <Button type="submit" variant="secondary" className="h-8">
                          Save
                        </Button>
                      </form>
                    </Td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </div>
        </Card>

        <Card>
          <h3 className="text-lg font-semibold">Genereaza document</h3>
          <form action={generateDocumentAction} className="mt-4 space-y-3">
            <div>
              <Label htmlFor="templateId">Template</Label>
              <Select id="templateId" name="templateId" required>
                <option value="">Selecteaza template</option>
                {templates.map((template) => (
                  <option key={template.id} value={template.id}>
                    {template.name} ({template.type}) {template.requiresNdaSigned ? '- needs NDA signed' : ''}
                  </option>
                ))}
              </Select>
            </div>
            <div>
              <Label htmlFor="projectId">Proiect</Label>
              <Select id="projectId" name="projectId" required>
                <option value="">Selecteaza proiect</option>
                {projects.map((project) => (
                  <option key={project.id} value={project.id}>
                    {project.name} - {project.clientCompany.name}
                  </option>
                ))}
              </Select>
            </div>
            <div>
              <Label htmlFor="title">Titlu document</Label>
              <Input id="title" name="title" required />
            </div>
            <div>
              <Label htmlFor="dataJson">Merge fields JSON</Label>
              <Textarea
                id="dataJson"
                name="dataJson"
                rows={6}
                placeholder='{"client_representative":"John Doe","service_annex":"Social Media + Ads"}'
              />
            </div>
            <label className="flex items-center gap-2 text-sm text-muted">
              <input type="checkbox" name="publishToClient" />
              Publica document in portal
            </label>
            <Button type="submit" className="w-full">
              Genereaza
            </Button>
          </form>
        </Card>
      </div>
    </div>
  );
}
