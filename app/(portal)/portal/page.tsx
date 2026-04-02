import { prisma } from '@/lib/db/prisma';
import { requireClientUser } from '@/lib/auth/current-user';
import { Card } from '@/components/ui/card';
import { PageHeader } from '@/components/layout/page-header';
import { formatDate, formatMinutes } from '@/lib/domain/formatters';
import { FileUploadForm } from '@/components/forms/file-upload-form';

export default async function ClientPortalPage() {
  const user = await requireClientUser();

  const clientCompanyId = user.clientCompanyId ?? '';

  const [projects, tasks, timeByProject, documents, files, onboarding] = await Promise.all([
    prisma.project.findMany({
      where: { clientCompanyId },
      select: {
        id: true,
        name: true,
        status: true,
        startDate: true,
        endDate: true
      },
      orderBy: { createdAt: 'desc' }
    }),
    prisma.task.findMany({
      where: {
        visibleToClient: true,
        project: {
          clientCompanyId
        }
      },
      select: {
        id: true,
        title: true,
        status: true,
        priority: true,
        deadline: true,
        project: {
          select: {
            name: true
          }
        }
      },
      orderBy: { updatedAt: 'desc' },
      take: 30
    }),
    prisma.timeEntry.groupBy({
      by: ['projectId'],
      where: {
        project: {
          clientCompanyId
        },
        status: 'APPROVED',
        visibleToClient: true
      },
      _sum: {
        durationMinutes: true
      }
    }),
    prisma.documentInstance.findMany({
      where: {
        clientCompanyId,
        publishedToClient: true
      },
      select: {
        id: true,
        title: true,
        status: true,
        createdAt: true,
        signedAt: true
      },
      orderBy: { createdAt: 'desc' }
    }),
    prisma.uploadedFile.findMany({
      where: {
        clientCompanyId,
        isClientVisible: true
      },
      select: {
        id: true,
        originalName: true,
        createdAt: true,
        project: {
          select: { name: true }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: 20
    }),
    prisma.onboardingItem.findMany({
      where: {
        clientCompanyId,
        isClientVisible: true
      },
      orderBy: { createdAt: 'desc' },
      take: 20
    })
  ]);

  const timeMap = new Map(timeByProject.map((entry) => [entry.projectId, entry._sum.durationMinutes ?? 0]));

  return (
    <div>
      <PageHeader
        title="Portal Client"
        description="Vizibilitate controlata asupra proiectelor active, taskurilor publicate si timpului aprobat."
      />

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <h3 className="text-sm font-semibold uppercase tracking-wide text-muted">Proiecte active</h3>
          <div className="mt-3 space-y-2">
            {projects.map((project) => (
              <div key={project.id} className="rounded-md border border-line p-3">
                <p className="font-medium">{project.name}</p>
                <p className="text-xs text-muted">
                  {project.status} | {formatDate(project.startDate)} - {formatDate(project.endDate)}
                </p>
                <p className="mt-1 text-xs text-muted">
                  Ore aprobate publicate: {formatMinutes(timeMap.get(project.id) ?? 0)}
                </p>
                <div className="mt-2">
                  <FileUploadForm projectId={project.id} />
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card>
          <h3 className="text-sm font-semibold uppercase tracking-wide text-muted">Taskuri publicate</h3>
          <div className="mt-3 space-y-2 text-sm">
            {tasks.length === 0 ? (
              <p className="text-muted">Nu exista taskuri publicate momentan.</p>
            ) : (
              tasks.map((task) => (
                <div key={task.id} className="rounded-md border border-line p-3">
                  <p className="font-medium">{task.title}</p>
                  <p className="text-xs text-muted">
                    {task.project.name} | {task.status} | {task.priority} | deadline: {formatDate(task.deadline)}
                  </p>
                </div>
              ))
            )}
          </div>
        </Card>

        <Card>
          <h3 className="text-sm font-semibold uppercase tracking-wide text-muted">Documente publicate</h3>
          <div className="mt-3 space-y-2 text-sm">
            {documents.length === 0 ? (
              <p className="text-muted">Nu exista documente publicate.</p>
            ) : (
              documents.map((doc) => (
                <div key={doc.id} className="rounded-md border border-line p-3">
                  <p className="font-medium">{doc.title}</p>
                  <p className="text-xs text-muted">
                    Status: {doc.status} | Creat: {formatDate(doc.createdAt)} | Semnat: {formatDate(doc.signedAt)}
                  </p>
                </div>
              ))
            )}
          </div>
        </Card>

        <Card>
          <h3 className="text-sm font-semibold uppercase tracking-wide text-muted">Fisiere & onboarding</h3>
          <div className="mt-3 space-y-2 text-sm">
            <p className="text-xs uppercase tracking-wide text-muted">Fisiere incarcate</p>
            {files.length === 0 ? (
              <p className="text-muted">Nu exista fisiere in portal.</p>
            ) : (
              files.map((file) => (
                <div key={file.id} className="rounded-md border border-line p-3">
                  <p className="font-medium">{file.originalName}</p>
                  <p className="text-xs text-muted">
                    {file.project?.name ?? '-'} | {formatDate(file.createdAt)}
                  </p>
                </div>
              ))
            )}

            <p className="mt-4 text-xs uppercase tracking-wide text-muted">Checklist onboarding</p>
            {onboarding.length === 0 ? (
              <p className="text-muted">Onboarding complet.</p>
            ) : (
              onboarding.map((item) => (
                <div key={item.id} className="rounded-md border border-line p-3">
                  <p className="font-medium">{item.title}</p>
                  <p className="text-xs text-muted">
                    {item.status} | due: {formatDate(item.dueDate)}
                  </p>
                </div>
              ))
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}
