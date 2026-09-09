export function formatMoney(n: number | null): string {
  if (n === null) return '—';
  return n.toLocaleString('en-US', { style: 'currency', currency: 'USD' });
}

export function formatNumber(n: number | null): string {
  if (n === null) return '—';
  return n.toLocaleString('en-US');
}

const CATEGORY_COLORS: Record<string, string> = {
  pokemon: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/40',
  'one piece': 'bg-red-500/20 text-red-300 border-red-500/40',
  riftbound: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40',
  lorcana: 'bg-purple-500/20 text-purple-300 border-purple-500/40',
};

export function categoryColor(category: string): string {
  return CATEGORY_COLORS[category.trim().toLowerCase()] || 'bg-neutral-500/20 text-neutral-300 border-neutral-500/40';
}

const GRADER_COLORS: Record<string, string> = {
  psa: 'bg-red-600 text-white',
  bgs: 'bg-black text-white border border-neutral-600',
  beckett: 'bg-black text-white border border-neutral-600',
  sgc: 'bg-blue-600 text-white',
  cgc: 'bg-sky-500 text-white',
};

export function graderColor(company: string): string {
  return GRADER_COLORS[company.trim().toLowerCase()] || 'bg-neutral-700 text-white';
}
