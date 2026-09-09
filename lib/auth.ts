import { cookies } from 'next/headers';

// Everything here uses the Web Crypto API (available in both the Node.js
// and Edge runtimes) instead of Node's 'crypto' module, so this file works
// unmodified inside Next.js middleware.

export const SESSION_COOKIE = 'cardberry_session';

function getSecret(): string {
  return process.env.SESSION_SECRET || process.env.DASHBOARD_PASSWORD || 'dev-secret-change-me';
}

async function hmacHex(secret: string, message: string): Promise<string> {
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey('raw', enc.encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, [
    'sign',
  ]);
  const sig = await crypto.subtle.sign('HMAC', key, enc.encode(message));
  return Array.from(new Uint8Array(sig))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

function timingSafeEqualStr(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let result = 0;
  for (let i = 0; i < a.length; i++) result |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return result === 0;
}

export async function makeSessionToken(): Promise<string> {
  const payload = `${Date.now()}`;
  const sig = await hmacHex(getSecret(), payload);
  return `${payload}.${sig}`;
}

export async function isValidSessionToken(token: string | undefined | null): Promise<boolean> {
  if (!token) return false;
  const [payload, sig] = token.split('.');
  if (!payload || !sig) return false;
  const expected = await hmacHex(getSecret(), payload);
  if (!timingSafeEqualStr(expected, sig)) return false;
  // Sessions last 7 days.
  const age = Date.now() - Number(payload);
  return age >= 0 && age < 7 * 24 * 60 * 60 * 1000;
}

export function checkPassword(candidate: string): boolean {
  const real = process.env.DASHBOARD_PASSWORD;
  if (!real) return false;
  return timingSafeEqualStr(candidate, real);
}

export async function isAuthed(): Promise<boolean> {
  const store = await cookies();
  const token = store.get(SESSION_COOKIE)?.value;
  return isValidSessionToken(token);
}
