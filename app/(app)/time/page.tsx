import { prisma } from '@/lib/db/prisma';
import { requireInternalUser } from '@/lib/auth/current-user';
import { projectAccessWhere, timeEntryAccessWhere } from '@/lib/domain/scopes';
import { PageHeader } from '@/components/layout/page-header';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Table, Th, Td } from '@/components/ui/table';
import { formatDateTime, formatMinutes } from '@/lib/domain/formatters';
import {
  approveTimeEntryAction,
  createManualTimeEntryAction,
  startTimerAction,
  stopTimerAction
} from '@/app/(app)/time/actions';

export default async function TimePage() {
  const user = await requireInternalUser();

  const [projects, tasks, entries, runningEntries] = await Promise.all([
    prisma.project.findMany({
      where: projectAccessWhere(user),
      select: { id: true, name: true },
      orderBy: { name: 'asc' }
    }),
    prisma.task.findMany({
      where: {
        project: projectAccessWhere(user)
      },
      select: { id: true, title: true },
      orderBy: { updatedAt: 'desc' },
      take: 50
    }),
    prisma.timeEntry.findMany({
      where: timeEntryAccessWhere(user),
      include: {
        project: { select: { name: true } },
        task: { select: { title: true } },
        user: { select: { name: true } }
      },
      orderBy: { createdAt: 'desc' },
      take: 40
    }),
    prisma.timeEntry.findMany({
      where: {
        userId: user.id,
        status: 'RUNNING'
      },
      select: {
        id: true,
        project: { select: { name: true } },
        startedAt: true
      }
    })
  ]);

  return (
    <div>
      <PageHeader
        title="Time Tracking"
        description="Tracking intern complet. Publicarea catre client este controlata prin aprobare explicita."
      />

      <div className="grid gap-4 xl:grid-cols-[2fr_1fr]">
        <Card>
          <div className="overflow-auto">
            <Table>
              <thead>
                <tr>
                  <Th>Consultant</Th>
                  <Th>Proiect</Th>
                  <Th>Task</Th>
                  <Th>Status</Th>
                  <Th>Interval</Th>
                  <Th>Durata</Th>
                  <Th>Portal</Th>
                  <Th>Aprobare</Th>
                </tr>
              </thead>
              <tbody>
                {entries.map((entry) => (
                  <tr key={entry.id}>
                    <Td>{entry.user.name}</Td>
                    <Td>{entry.project.name}</Td>
                    <Td>{entry.task?.title ?? '-'}</Td>
                    <Td>{entry.status}</Td>
                    <Td>
                      {formatDateTime(entry.startedAt)} - {formatDateTime(entry.endedAt)}
                    </Td>
                    <Td>{formatMinutes(entry.durationMinutes)}</Td>
                    <Td>{entry.visibleToClient ? 'Publicat' : 'Intern'}</Td>
                    <Td>
                      {entry.status === 'SUBMITTED' ? (
                        <form action={approveTimeEntryAction} className="space-y-1">
                          <input type="hidden" name="entryId" value={entry.id} />
                          <Select name="publishToClient" defaultValue="false">
                            <option value="false">Aproba intern</option>
                            <option value="true">Aproba + publica client</option>
                          </Select>
                          <Button type="submit" variant="secondary" className="h-8 w-full">
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

        <div className="space-y-4">
          <Card>
            <h3 className="text-lg font-semibold">Timer</h3>

            <div className="mt-3 space-y-2">
              {runningEntries.length === 0 ? (
                <p className="text-sm text-muted">Nu ai timer activ.</p>
              ) : (
                runningEntries.map((running) => (
                  <div key={running.id} className="rounded-md border border-line p-3">
                    <p className="text-sm font-medium">{running.project.name}</p>
                    <p className="text-xs text-muted">Start: {formatDateTime(running.startedAt)}</p>
                    <form action={stopTimerAction} className="mt-2">
                      <input type="hidden" name="entryId" value={running.id} />
                      <Button type="submit" variant="danger" className="h-8 w-full">
                        Stop Timer
                      </Button>
                    </form>
                  </div>
                ))
              )}
            </div>

            <form action={startTimerAction} className="mt-4 space-y-3">
              <div>
                <Label htmlFor="timerProjectId">Proiect</Label>
                <Select id="timerProjectId" name="projectId" required>
                  <option value="">Selecteaza proiect</option>
                  {projects.map((project) => (
                    <option key={project.id} value={project.id}>
                      {project.name}
                    </option>
                  ))}
                </Select>
              </div>
              <div>
                <Label htmlFor="timerTaskId">Task (optional)</Label>
                <Select id="timerTaskId" name="taskId">
                  <option value="">Fara task</option>
                  {tasks.map((task) => (
                    <option key={task.id} value={task.id}>
                      {task.title}
                    </option>
                  ))}
                </Select>
              </div>
              <div>
                <Label htmlFor="activityType">Activitate</Label>
                <Input id="activityType" name="activityType" defaultValue="Execution" />
              </div>
              <div>
                <Label htmlFor="description">Descriere</Label>
                <Input id="description" name="description" />
              </div>
              <Button type="submit" className="w-full">
                Start timer
              </Button>
            </form>
          </Card>

          <Card>
            <h3 className="text-sm font-semibold uppercase tracking-wide text-muted">Adaugare manuala</h3>
            <form action={createManualTimeEntryAction} className="mt-4 space-y-3">
              <div>
                <Label htmlFor="manualProjectId">Proiect</Label>
                <Select id="manualProjectId" name="projectId" required>
                  <option value="">Selecteaza proiect</option>
                  {projects.map((project) => (
                    <option key={project.id} value={project.id}>
                      {project.name}
                    </option>
                  ))}
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Label htmlFor="startedAt">Start</Label>
                  <Input id="startedAt" name="startedAt" type="datetime-local" required />
                </div>
                <div>
                  <Label htmlFor="endedAt">Stop</Label>
                  <Input id="endedAt" name="endedAt" type="datetime-local" />
                </div>
              </div>
              <div>
                <Label htmlFor="manualDescription">Descriere</Label>
                <Input id="manualDescription" name="description" />
              </div>
              <label className="flex items-center gap-2 text-sm text-muted">
                <input type="checkbox" name="visibleToClient" />
                Marcat pentru client (devine vizibil doar dupa aprobare)
              </label>
              <Button type="submit" variant="secondary" className="w-full">
                Salveaza manual
              </Button>
            </form>
          </Card>
        </div>
      </div>
    </div>
  );
}
