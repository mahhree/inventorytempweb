'use client';

import { useMemo, useState } from 'react';
import type { CardRecord } from '@/lib/types';
import CardTile from './CardTile';

function uniqueSorted(values: (string | undefined | null)[]): string[] {
  return Array.from(new Set(values.map((v) => (v || '').trim()).filter(Boolean))).sort();
}

export default function GalleryClient({
  cards,
  showFinancials,
}: {
  cards: CardRecord[];
  showFinancials: boolean;
}) {
  const [category, setCategory] = useState<string>('All');
  const [grader, setGrader] = useState<string>('All');
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState<'title' | 'value-desc' | 'grade-desc'>('title');

  const categories = useMemo(() => ['All', ...uniqueSorted(cards.map((c) => c.category))], [cards]);
  const graders = useMemo(() => ['All', ...uniqueSorted(cards.map((c) => c.gradingCompany))], [cards]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    let result = cards.filter((c) => {
      if (category !== 'All' && c.category.trim() !== category) return false;
      if (grader !== 'All' && c.gradingCompany.trim() !== grader) return false;
      if (q) {
        const haystack = `${c.title} ${c.subject} ${c.set} ${c.year} ${c.variation}`.toLowerCase();
        if (!haystack.includes(q)) return false;
      }
      return true;
    });

    result = [...result].sort((a, b) => {
      if (sortBy === 'value-desc') return (b.currentValue ?? -1) - (a.currentValue ?? -1);
      if (sortBy === 'grade-desc') return (parseFloat(b.grade) || 0) - (parseFloat(a.grade) || 0);
      return (a.subject || a.title).localeCompare(b.subject || b.title);
    });

    return result;
  }, [cards, category, grader, search, sortBy]);

  return (
    <div>
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by name, set, year..."
          className="w-full rounded-lg border border-white/10 bg-ink-800 px-3 py-2 text-sm text-neutral-100 placeholder:text-neutral-500 focus:border-berry-500 focus:outline-none sm:max-w-xs"
        />
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="rounded-lg border border-white/10 bg-ink-800 px-3 py-2 text-sm text-neutral-100 focus:border-berry-500 focus:outline-none"
        >
          {categories.map((c) => (
            <option key={c} value={c}>
              {c === 'All' ? 'All categories' : c}
            </option>
          ))}
        </select>
        <select
          value={grader}
          onChange={(e) => setGrader(e.target.value)}
          className="rounded-lg border border-white/10 bg-ink-800 px-3 py-2 text-sm text-neutral-100 focus:border-berry-500 focus:outline-none"
        >
          {graders.map((g) => (
            <option key={g} value={g}>
              {g === 'All' ? 'All graders' : g}
            </option>
          ))}
        </select>
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
          className="rounded-lg border border-white/10 bg-ink-800 px-3 py-2 text-sm text-neutral-100 focus:border-berry-500 focus:outline-none"
        >
          <option value="title">Sort: Name (A–Z)</option>
          {showFinancials && <option value="value-desc">Sort: Value (high–low)</option>}
          <option value="grade-desc">Sort: Grade (high–low)</option>
        </select>
        <span className="text-sm text-neutral-500">
          {filtered.length} of {cards.length} card{cards.length === 1 ? '' : 's'}
        </span>
      </div>

      {filtered.length === 0 ? (
        <div className="rounded-xl border border-dashed border-white/10 p-12 text-center text-neutral-500">
          No cards match those filters.
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
          {filtered.map((card) => (
            <CardTile key={card.id} card={card} showFinancials={showFinancials} />
          ))}
        </div>
      )}
    </div>
  );
}
