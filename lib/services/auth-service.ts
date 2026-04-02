'use server';

import { redirect } from 'next/navigation';
import { prisma } from '@/lib/db/prisma';
import { verifyPassword } from '@/lib/auth/password';
import { clearSessionCookie, setSessionCookie } from '@/lib/auth/session';
import { loginSchema } from '@/lib/validation/schemas';
import { auditLog } from '@/lib/security/audit';

export type LoginActionState = {
  error?: string;
};

export async function loginAction(_prevState: LoginActionState, formData: FormData): Promise<LoginActionState> {
  const parsed = loginSchema.safeParse({
    email: formData.get('email'),
    password: formData.get('password')
  });

  if (!parsed.success) {
    return { error: 'Datele de autentificare sunt invalide.' };
  }

  const user = await prisma.user.findUnique({
    where: { email: parsed.data.email.toLowerCase() }
  });

  if (!user || !user.isActive) {
    return { error: 'Email sau parola incorecta.' };
  }

  const isValid = await verifyPassword(parsed.data.password, user.passwordHash);
  if (!isValid) {
    return { error: 'Email sau parola incorecta.' };
  }

  await setSessionCookie({
    userId: user.id,
    role: user.role,
    email: user.email,
    name: user.name,
    clientCompanyId: user.clientCompanyId
  });

  await auditLog({
    actorUserId: user.id,
    action: 'AUTH_LOGIN_SUCCESS',
    entityType: 'User',
    entityId: user.id
  });

  if (user.role === 'CLIENT') {
    redirect('/portal');
  }

  redirect('/dashboard');
}

export async function logoutAction() {
  clearSessionCookie();
  redirect('/login');
}
