import { NextResponse } from 'next/server';
import { readCardsData } from '@/lib/storage';

export const dynamic = 'force-dynamic';

export async function GET() {
  const data = await readCardsData();
  return NextResponse.json(data);
}
