import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';
import { SESSION_COOKIE_NAME } from '@/lib/auth/session';

const PUBLIC_PATHS = ['/login'];

async function verifyToken(token: string) {
  const secret = process.env.SESSION_SECRET;
  if (!secret) {
    return null;
  }

  try {
    const result = await jwtVerify(token, new TextEncoder().encode(secret));
    return result.payload as { role?: string };
  } catch {
    return null;
  }
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api/public') ||
    pathname.startsWith('/favicon.ico') ||
    pathname.includes('.')
  ) {
    return NextResponse.next();
  }

  if (PUBLIC_PATHS.includes(pathname)) {
    return NextResponse.next();
  }

  const token = request.cookies.get(SESSION_COOKIE_NAME)?.value;
  if (!token) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  const payload = await verifyToken(token);
  if (!payload?.role) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  if (pathname.startsWith('/portal') && payload.role !== 'CLIENT') {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  if (!pathname.startsWith('/portal') && payload.role === 'CLIENT') {
    return NextResponse.redirect(new URL('/portal', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api/upload).*)']
};
