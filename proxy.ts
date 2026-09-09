import { NextRequest, NextResponse } from 'next/server';
import { isValidSessionToken, SESSION_COOKIE } from './lib/auth';

// Protects the dashboard UI and its API routes. Login page and login API
// stay public so you can actually authenticate.
export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  const isPublicDashboardPath = pathname === '/dashboard/login';
  const isPublicApiPath = pathname === '/api/login';

  const needsAuth =
    (pathname.startsWith('/dashboard') && !isPublicDashboardPath) ||
    (pathname.startsWith('/api/upload') && !isPublicApiPath);

  if (!needsAuth) return NextResponse.next();

  const token = req.cookies.get(SESSION_COOKIE)?.value;
  if (await isValidSessionToken(token)) return NextResponse.next();

  if (pathname.startsWith('/api/')) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }

  const loginUrl = new URL('/dashboard/login', req.url);
  loginUrl.searchParams.set('next', pathname);
  return NextResponse.redirect(loginUrl);
}

export const config = {
  matcher: ['/dashboard/:path*', '/api/upload', '/api/upload/:path*'],
};
