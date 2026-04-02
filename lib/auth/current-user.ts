import { redirect } from 'next/navigation';
import type { User } from '@prisma/client';
import { prisma } from '@/lib/db/prisma';
import { getSessionFromCookie } from '@/lib/auth/session';

export type AuthUser = Pick<User, 'id' | 'email' | 'name' | 'role' | 'clientCompanyId' | 'isActive'>;

export async function getCurrentUser(): Promise<AuthUser | null> {
  const session = await getSessionFromCookie();
  if (!session) {
    return null;
  }

  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      clientCompanyId: true,
      isActive: true
    }
  });

  if (!user || !user.isActive) {
    return null;
  }

  return user;
}

export async function requireUser(): Promise<AuthUser> {
  const user = await getCurrentUser();
  if (!user) {
    redirect('/login');
  }
  return user;
}

export async function requireInternalUser() {
  const user = await requireUser();
  if (user.role === 'CLIENT') {
    redirect('/portal');
  }
  return user;
}

export async function requireClientUser() {
  const user = await requireUser();
  if (user.role !== 'CLIENT') {
    redirect('/dashboard');
  }
  return user;
}
