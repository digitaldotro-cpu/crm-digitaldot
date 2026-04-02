import { prisma } from '@/lib/db/prisma';
import { requireInternalUser } from '@/lib/auth/current-user';
import { projectAccessWhere, taskAccessWhere } from '@/lib/domain/scopes';
import { PageHeader } from '@/components/layout/page-header';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Table, Th, Td } from '@/components/ui/table';
import { formatDate } from '@/lib/domain/formatters';
import { addTaskCommentAction, createTaskAction, updateTaskStatusAction } from '@/app/(app)/tasks/actions';

export default async function TasksPage() {
  const user = await requireInternalUser();

  const [projects, users, tasks] = await Promise.all([
    prisma.project.findMany({
      where: projectAccessWhere(user),
      select: {
        id: true,
        name: true
      },
      orderBy: { name: 'asc' }
    }),
    prisma.user.findMany({
      where: {
        role: { not: 'CLIENT' },
        isActive: true
      },
      select: {
        id: true,
        name: true,
        role: true
      },
      orderBy: { name: 'asc' }
    }),
    prisma.task.findMany({
      where: taskAccessWhere(user),
      include: {
        project: { select: { name: true } },
        assignee: { select: { name: true } },
        comments: {
          orderBy: { createdAt: 'desc' },
          take: 1,
          include: { user: { select: { name: true } } }
        }
      },
      orderBy: [{ status: 'asc' }, { updatedAt: 'desc' }],
      take: 40
    })
  ]);

  return (
    <div>
      <PageHeader
        title="Taskuri"
        description="Management taskuri intern + control publicare catre client portal (by default ascuns)."
      />

      <div className="grid gap-4 xl:grid-cols-[2fr_1fr]">
        <Card>
          <div className="overflow-auto">
            <Table>
              <thead>
                <tr>
                  <Th>Task</Th>
                  <Th>Proiect</Th>
                  <Th>Status</Th>
                  <Th>Prioritate</Th>
                  <Th>Deadline</Th>
                  <Th>Asignee</Th>
                  <Th>Portal</Th>
                  <Th>Update</Th>
                </tr>
              </thead>
              <tbody>
                {tasks.map((task) => (
                  <tr key={task.id}>
                    <Td>
                      <p className="font-medium">{task.title}</p>
                      <p className="text-xs text-muted">{task.description ?? '-'}</p>
                      {task.comments[0] ? (
                        <p className="mt-1 text-xs text-muted">
                          Ultim comentariu: {task.comments[0].user.name} - {task.comments[0].body}
                        </p>
                      ) : null}
                    </Td>
                    <Td>{task.project.name}</Td>
                    <Td>{task.status}</Td>
                    <Td>{task.priority}</Td>
                    <Td>{formatDate(task.deadline)}</Td>
                    <Td>{task.assignee?.name ?? '-'}</Td>
                    <Td>{task.visibleToClient ? 'Vizibil' : 'Intern'}</Td>
                    <Td>
                      <form action={updateTaskStatusAction} className="flex flex-col gap-2">
                        <input type="hidden" name="taskId" value={task.id} />
                        <Select name="status" defaultValue={task.status}>
                          {['TODO', 'IN_PROGRESS', 'BLOCKED', 'REVIEW', 'DONE'].map((status) => (
                            <option key={status} value={status}>
                              {status}
                            </option>
                          ))}
                        </Select>
                        <Select name="visibleToClient" defaultValue={task.visibleToClient ? 'true' : 'false'}>
                          <option value="false">Intern only</option>
                          <option value="true">Client-facing</option>
                        </Select>
                        <Button type="submit" variant="secondary" className="h-8">
                          Update
                        </Button>
                      </form>
                    </Td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </div>
        </Card>

        <div className="space-y-4">
          <Card>
            <h3 className="text-lg font-semibold">Task nou</h3>
            <form action={createTaskAction} className="mt-4 space-y-3">
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
                <Label htmlFor="title">Titlu</Label>
                <Input id="title" name="title" required />
              </div>
              <div>
                <Label htmlFor="description">Descriere</Label>
                <Input id="description" name="description" />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Label htmlFor="priority">Prioritate</Label>
                  <Select id="priority" name="priority" defaultValue="MEDIUM">
                    {['LOW', 'MEDIUM', 'HIGH', 'URGENT'].map((priority) => (
                      <option key={priority} value={priority}>
                        {priority}
                      </option>
                    ))}
                  </Select>
                </div>
                <div>
                  <Label htmlFor="status">Status</Label>
                  <Select id="status" name="status" defaultValue="TODO">
                    {['TODO', 'IN_PROGRESS', 'BLOCKED', 'REVIEW', 'DONE'].map((status) => (
                      <option key={status} value={status}>
                        {status}
                      </option>
                    ))}
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="assigneeId">Asignee</Label>
                <Select id="assigneeId" name="assigneeId">
                  <option value="">Neasignat</option>
                  {users.map((member) => (
                    <option key={member.id} value={member.id}>
                      {member.name} ({member.role})
                    </option>
                  ))}
                </Select>
              </div>

              <div>
                <Label htmlFor="deadline">Deadline</Label>
                <Input id="deadline" name="deadline" type="date" />
              </div>

              <div>
                <Label htmlFor="internalNotes">Note interne</Label>
                <Input id="internalNotes" name="internalNotes" />
              </div>

              <label className="flex items-center gap-2 text-sm text-muted">
                <input type="checkbox" name="visibleToClient" />
                Vizibil in client portal
              </label>

              <Button type="submit" className="w-full">
                Creeaza task
              </Button>
            </form>
          </Card>

          <Card>
            <h3 className="text-sm font-semibold uppercase tracking-wide text-muted">Comentariu rapid</h3>
            <form action={addTaskCommentAction} className="mt-4 space-y-3">
              <div>
                <Label htmlFor="taskId">Task</Label>
                <Select id="taskId" name="taskId" required>
                  <option value="">Selecteaza task</option>
                  {tasks.map((task) => (
                    <option key={task.id} value={task.id}>
                      {task.title}
                    </option>
                  ))}
                </Select>
              </div>
              <div>
                <Label htmlFor="comment">Comentariu</Label>
                <Input id="comment" name="comment" required />
              </div>
              <label className="flex items-center gap-2 text-sm text-muted">
                <input type="checkbox" name="isInternal" defaultChecked />
                Comentariu intern
              </label>
              <Button type="submit" className="w-full" variant="secondary">
                Adauga comentariu
              </Button>
            </form>
          </Card>
        </div>
      </div>
    </div>
  );
}
