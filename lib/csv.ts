import Papa from 'papaparse';
import type { CardRecord } from './types';

// Known/expected header names in the user's export (from Card Ladder or similar).
// We match case-insensitively and tolerate minor variations so re-exports
// with slightly different column order/casing still work without code edits.
const HEADER_ALIASES: Record<string, string[]> = {
  datePurchased: ['date purchased', 'date'],
  quantity: ['quantity', 'qty'],
  card: ['card', 'title'],
  subject: ['subject'],
  year: ['year'],
  set: ['set'],
  variation: ['variation'],
  number: ['number', 'card number', '#'],
  category: ['category'],
  condition: ['condition', 'grade'],
  investment: ['investment', 'cost', 'paid'],
  currentValue: ['current value', 'value'],
  potentialProfit: ['potential profit', 'profit'],
  gradedCertNumber: ['graded cert #', 'graded cert#', 'cert #', 'cert number', 'certification number'],
  population: ['population', 'pop'],
  notes: ['notes', 'note'],
};

function normalizeHeader(h: string): string {
  return h.trim().toLowerCase().replace(/\s+/g, ' ');
}

function buildHeaderMap(headers: string[]): Record<string, string> {
  const normalized = headers.map((h) => ({ raw: h, norm: normalizeHeader(h) }));
  const map: Record<string, string> = {};
  for (const [key, aliases] of Object.entries(HEADER_ALIASES)) {
    const match = normalized.find((h) => aliases.includes(h.norm));
    if (match) map[key] = match.raw;
  }
  return map;
}

function parseNumber(val: string | undefined | null): number | null {
  if (val === undefined || val === null) return null;
  const cleaned = String(val).replace(/[^0-9.\-]/g, '');
  if (cleaned === '' || cleaned === '-') return null;
  const n = Number(cleaned);
  return Number.isFinite(n) ? n : null;
}

function parseInt0(val: string | undefined | null): number | null {
  const n = parseNumber(val);
  return n === null ? null : Math.round(n);
}

// Splits a "Condition" field like "PSA 7", "CGC 9.5", "SGC 10" into
// { company: "PSA", grade: "7" }. Falls back gracefully if it doesn't match
// the "<COMPANY> <GRADE>" shape.
function splitCondition(condition: string): { company: string; grade: string } {
  const trimmed = (condition || '').trim();
  const match = trimmed.match(/^([A-Za-z][A-Za-z.&\s]{0,20}?)\s+([\d.]+.*)$/);
  if (match) {
    return { company: match[1].trim().toUpperCase(), grade: match[2].trim() };
  }
  return { company: '', grade: trimmed };
}

export interface CsvParseResult {
  cards: CardRecord[];
  warnings: string[];
  missingRequiredColumns: string[];
}

export function parseCardsCsv(csvText: string): CsvParseResult {
  const warnings: string[] = [];
  const result = Papa.parse<Record<string, string>>(csvText, {
    header: true,
    skipEmptyLines: true,
  });

  if (result.errors && result.errors.length) {
    for (const err of result.errors.slice(0, 5)) {
      warnings.push(`Row ${err.row ?? '?'}: ${err.message}`);
    }
  }

  const fields = result.meta.fields || [];
  const headerMap = buildHeaderMap(fields);

  const requiredForDisplay = ['card', 'category', 'condition'];
  const missingRequiredColumns = requiredForDisplay.filter((k) => !headerMap[k]);

  const cards: CardRecord[] = [];

  result.data.forEach((row, idx) => {
    const get = (key: string) => (headerMap[key] ? row[headerMap[key]] : undefined);

    const cardTitle = (get('card') || '').toString().trim();
    if (!cardTitle) return; // skip blank rows

    const conditionRaw = (get('condition') || '').toString().trim();
    const { company, grade } = splitCondition(conditionRaw);

    const certNumber = (get('gradedCertNumber') || '').toString().trim();

    cards.push({
      id: certNumber ? `cert-${certNumber}` : `row-${idx}-${cardTitle.slice(0, 20)}`,
      datePurchased: (get('datePurchased') || '').toString().trim() || null,
      quantity: parseInt0(get('quantity')) ?? 1,
      title: cardTitle,
      subject: (get('subject') || '').toString().trim(),
      year: (get('year') || '').toString().trim(),
      set: (get('set') || '').toString().trim(),
      variation: (get('variation') || '').toString().trim(),
      number: (get('number') || '').toString().trim(),
      category: (get('category') || '').toString().trim(),
      gradingCompany: company,
      grade,
      conditionRaw,
      investment: parseNumber(get('investment')),
      currentValue: parseNumber(get('currentValue')),
      potentialProfit: parseNumber(get('potentialProfit')),
      gradedCertNumber: certNumber,
      population: parseInt0(get('population')),
      notes: (get('notes') || '').toString().trim(),
      imageUrl: null,
    });
  });

  return { cards, warnings, missingRequiredColumns };
}
