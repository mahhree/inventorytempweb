import { NextRequest, NextResponse } from 'next/server';
import { isAuthed } from '@/lib/auth';
import { readCardsData, writeCardsData } from '@/lib/storage';

export async function POST(req: NextRequest) {
  if (!(await isAuthed())) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }
  const body = await req.json().catch(() => null);
  if (!body || typeof body.showFinancials !== 'boolean') {
    return NextResponse.json({ error: 'Invalid body' }, { status: 400 });
  }
  const existing = await readCardsData();
  await writeCardsData({
    ...existing,
    settings: { ...existing.settings, showFinancials: body.showFinancials },
  });
  return NextResponse.json({ ok: true });
}
