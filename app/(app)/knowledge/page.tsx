import { prisma } from '@/lib/db/prisma';
import { requireInternalUser } from '@/lib/auth/current-user';
import { PageHeader } from '@/components/layout/page-header';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { createKnowledgeCollectionAction, createKnowledgeDocumentAction } from '@/app/(app)/knowledge/actions';

export default async function KnowledgePage() {
  await requireInternalUser();

  const collections = await prisma.knowledgeCollection.findMany({
    include: {
      _count: { select: { documents: true } },
      documents: {
        orderBy: { updatedAt: 'desc' },
        take: 4
      }
    },
    orderBy: { updatedAt: 'desc' }
  });

  return (
    <div>
      <PageHeader title="Knowledge Base" description="Documente interne, proceduri, template-uri si versiuni." />

      <div className="grid gap-4 xl:grid-cols-[2fr_1fr]">
        <Card>
          <div className="space-y-3">
            {collections.map((collection) => (
              <div key={collection.id} className="rounded-md border border-line p-4">
                <p className="font-semibold">{collection.name}</p>
                <p className="text-xs text-muted">
                  {collection.visibility} | {collection._count.documents} documente
                </p>
                <div className="mt-2 space-y-1">
                  {collection.documents.map((doc) => (
                    <div key={doc.id} className="rounded border border-line bg-slate-50 px-2 py-1 text-xs">
                      {doc.title} {doc.isSensitive ? '(sensitive)' : ''}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </Card>

        <div className="space-y-4">
          <Card>
            <h3 className="text-lg font-semibold">Colectie noua</h3>
            <form action={createKnowledgeCollectionAction} className="mt-4 space-y-3">
              <div>
                <Label htmlFor="name">Nume</Label>
                <Input id="name" name="name" required />
              </div>
              <div>
                <Label htmlFor="visibility">Vizibilitate</Label>
                <Select id="visibility" name="visibility" defaultValue="TEAM">
                  {['PRIVATE', 'TEAM', 'FINANCE_ONLY', 'ADMIN_ONLY'].map((visibility) => (
                    <option key={visibility} value={visibility}>
                      {visibility}
                    </option>
                  ))}
                </Select>
              </div>
              <div>
                <Label htmlFor="description">Descriere</Label>
                <Input id="description" name="description" />
              </div>
              <Button type="submit" className="w-full">
                Creeaza colectie
              </Button>
            </form>
          </Card>

          <Card>
            <h3 className="text-sm font-semibold uppercase tracking-wide text-muted">Document nou</h3>
            <form action={createKnowledgeDocumentAction} className="mt-4 space-y-3">
              <div>
                <Label htmlFor="collectionId">Colectie</Label>
                <Select id="collectionId" name="collectionId" required>
                  <option value="">Selecteaza</option>
                  {collections.map((collection) => (
                    <option key={collection.id} value={collection.id}>
                      {collection.name}
                    </option>
                  ))}
                </Select>
              </div>
              <div>
                <Label htmlFor="title">Titlu</Label>
                <Input id="title" name="title" required />
              </div>
              <div>
                <Label htmlFor="content">Continut</Label>
                <Textarea id="content" name="content" rows={6} required />
              </div>
              <label className="flex items-center gap-2 text-sm text-muted">
                <input type="checkbox" name="isSensitive" />
                Marcat ca sensibil (audit recomandat)
              </label>
              <Button type="submit" className="w-full" variant="secondary">
                Salveaza document
              </Button>
            </form>
          </Card>
        </div>
      </div>
    </div>
  );
}
