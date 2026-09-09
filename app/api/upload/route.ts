import { NextRequest, NextResponse } from 'next/server';
import { parseCardsCsv } from '@/lib/csv';
import { readCardsData, writeCardsData } from '@/lib/storage';

export async function POST(req: NextRequest) {
  const form = await req.formData().catch(() => null);
  const file = form?.get('file');

  if (!file || typeof file === 'string') {
    return NextResponse.json({ error: 'No CSV file provided' }, { status: 400 });
  }

  const csvText = await (file as File).text();
  const { cards, warnings, missingRequiredColumns } = parseCardsCsv(csvText);

  if (missingRequiredColumns.length) {
    return NextResponse.json(
      {
        error: `CSV is missing expected column(s): ${missingRequiredColumns.join(', ')}. Nothing was uploaded.`,
      },
      { status: 400 }
    );
  }

  if (cards.length === 0) {
    return NextResponse.json({ error: 'No card rows found in that CSV.' }, { status: 400 });
  }

  const existing = await readCardsData();
  await writeCardsData({ ...existing, cards });

  return NextResponse.json({ ok: true, count: cards.length, warnings });
}
