import { jwtVerify, SignJWT } from 'jose';
import { cookies } from 'next/headers';

export const SESSION_COOKIE_NAME = 'dd_session';
const ONE_DAY_SECONDS = 60 * 60 * 24;
const TEN_DAYS_SECONDS = ONE_DAY_SECONDS * 10;

export type SessionPayload = {
  userId: string;
  role: 'ADMIN' | 'PROJECT_MANAGER' | 'SPECIALIST' | 'FINANCE' | 'CLIENT';
  email: string;
  name: string;
  clientCompanyId?: string | null;
};

function getSessionSecret() {
  const secret = process.env.SESSION_SECRET;
  if (!secret || secret.length < 20) {
    throw new Error('SESSION_SECRET is missing or too short.');
  }

  return new TextEncoder().encode(secret);
}

export async function createSessionToken(payload: SessionPayload): Promise<string> {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(`${TEN_DAYS_SECONDS}s`)
    .sign(getSessionSecret());
}

export async function verifySessionToken(token: string): Promise<SessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, getSessionSecret());

    return {
      userId: payload.userId as string,
      role: payload.role as SessionPayload['role'],
      email: payload.email as string,
      name: payload.name as string,
      clientCompanyId: (payload.clientCompanyId as string | null | undefined) ?? null
    };
  } catch {
    return null;
  }
}

export async function setSessionCookie(payload: SessionPayload) {
  const token = await createSessionToken(payload);

  cookies().set(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: TEN_DAYS_SECONDS
  });
}

export function clearSessionCookie() {
  cookies().set(SESSION_COOKIE_NAME, '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    expires: new Date(0)
  });
}

export async function getSessionFromCookie() {
  const token = cookies().get(SESSION_COOKIE_NAME)?.value;
  if (!token) {
    return null;
  }

  return verifySessionToken(token);
}
