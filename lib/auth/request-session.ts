import type { NextRequest } from 'next/server';
import { verifySessionToken, SESSION_COOKIE_NAME } from '@/lib/auth/session';

export async function getSessionFromRequest(request: NextRequest) {
  const token = request.cookies.get(SESSION_COOKIE_NAME)?.value;
  if (!token) {
    return null;
  }

  return verifySessionToken(token);
}
