import type { Prisma, SystemRole } from '@prisma/client';
import type { AuthUser } from '@/lib/auth/current-user';

function isPrivileged(role: SystemRole) {
  return role === 'ADMIN' || role === 'FINANCE';
}

function clientScopeId(user: AuthUser) {
  return user.clientCompanyId ?? '__forbidden_client_scope__';
}

export function projectAccessWhere(user: AuthUser): Prisma.ProjectWhereInput {
  if (isPrivileged(user.role)) {
    return {};
  }

  if (user.role === 'CLIENT') {
    return {
      clientCompanyId: clientScopeId(user)
    };
  }

  return {
    memberships: {
      some: {
        userId: user.id
      }
    }
  };
}

export function taskAccessWhere(user: AuthUser): Prisma.TaskWhereInput {
  if (isPrivileged(user.role)) {
    return {};
  }

  if (user.role === 'CLIENT') {
    return {
      visibleToClient: true,
      project: {
        clientCompanyId: clientScopeId(user)
      }
    };
  }

  return {
    project: {
      memberships: {
        some: {
          userId: user.id
        }
      }
    }
  };
}

export function timeEntryAccessWhere(user: AuthUser): Prisma.TimeEntryWhereInput {
  if (isPrivileged(user.role)) {
    return {};
  }

  if (user.role === 'CLIENT') {
    return {
      visibleToClient: true,
      status: 'APPROVED',
      project: {
        clientCompanyId: clientScopeId(user)
      }
    };
  }

  return {
    project: {
      memberships: {
        some: {
          userId: user.id
        }
      }
    }
  };
}

export function clientCompanyAccessWhere(user: AuthUser): Prisma.CompanyWhereInput {
  if (isPrivileged(user.role)) {
    return { type: 'CLIENT' };
  }

  if (user.role === 'CLIENT') {
    return {
      id: clientScopeId(user),
      type: 'CLIENT'
    };
  }

  return {
    type: 'CLIENT',
    clientProjects: {
      some: {
        memberships: {
          some: {
            userId: user.id
          }
        }
      }
    }
  };
}
