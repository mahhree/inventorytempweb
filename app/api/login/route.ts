import { NextRequest, NextResponse } from 'next/server';
import { checkPassword, makeSessionToken, SESSION_COOKIE } from '@/lib/auth';

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const password = body?.password;

  if (!process.env.DASHBOARD_PASSWORD) {
    return NextResponse.json(
      { error: 'Server is missing DASHBOARD_PASSWORD env var. Set it, then redeploy.' },
      { status: 500 }
    );
  }

  if (typeof password !== 'string' || !checkPassword(password)) {
    return NextResponse.json({ error: 'Incorrect password' }, { status: 401 });
  }

  const res = NextResponse.json({ ok: true });
  res.cookies.set(SESSION_COOKIE, await makeSessionToken(), {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 7,
  });
  return res;
}
