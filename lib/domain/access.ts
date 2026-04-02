import { prisma } from '@/lib/db/prisma';
import type { AuthUser } from '@/lib/auth/current-user';
import { projectAccessWhere } from '@/lib/domain/scopes';

export async function assertProjectAccess(user: AuthUser, projectId: string) {
  const project = await prisma.project.findFirst({
    where: {
      id: projectId,
      ...projectAccessWhere(user)
    },
    select: {
      id: true,
      name: true,
      clientCompanyId: true,
      status: true
    }
  });

  if (!project) {
    throw new Error('Access denied for this project.');
  }

  return project;
}

export async function getAccessibleProjects(user: AuthUser) {
  return prisma.project.findMany({
    where: projectAccessWhere(user),
    select: {
      id: true,
      name: true,
      status: true,
      clientCompany: {
        select: {
          id: true,
          name: true
        }
      }
    },
    orderBy: [{ status: 'asc' }, { name: 'asc' }]
  });
}

export async function getClientScopedCompany(user: AuthUser) {
  if (user.role !== 'CLIENT') {
    return null;
  }

  return prisma.company.findUnique({
    where: {
      id: user.clientCompanyId ?? ''
    },
    select: {
      id: true,
      name: true,
      status: true
    }
  });
}
