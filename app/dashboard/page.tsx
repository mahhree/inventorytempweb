'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import type { CardsData } from '@/lib/types';

export default function DashboardPage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [data, setData] = useState<CardsData | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState<{ type: 'ok' | 'error'; text: string } | null>(null);

  async function refresh() {
    const res = await fetch('/api/cards', { cache: 'no-store' });
    if (res.ok) setData(await res.json());
  }

  useEffect(() => {
    refresh();
  }, []);

  async function handleFile(file: File) {
    if (!file.name.toLowerCase().endsWith('.csv')) {
      setMessage({ type: 'error', text: 'Please upload a .csv file.' });
      return;
    }
    setUploading(true);
    setMessage(null);
    const form = new FormData();
    form.append('file', file);
    const res = await fetch('/api/upload', { method: 'POST', body: form });
    const body = await res.json().catch(() => ({}));
    setUploading(false);
    if (res.ok) {
      setMessage({
        type: 'ok',
        text: `Uploaded ${body.count} card${body.count === 1 ? '' : 's'}.${
          body.warnings?.length ? ` (${body.warnings.length} row warning(s))` : ''
        }`,
      });
      refresh();
    } else {
      setMessage({ type: 'error', text: body.error || 'Upload failed.' });
    }
  }

  async function toggleFinancials(next: boolean) {
    setData((d) => (d ? { ...d, settings: { ...d.settings, showFinancials: next } } : d));
    await fetch('/api/settings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ showFinancials: next }),
    });
  }

  async function logout() {
    await fetch('/api/logout', { method: 'POST' });
    router.push('/dashboard/login');
    router.refresh();
  }

  return (
    <main className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-neutral-50">Dashboard</h1>
        <div className="flex items-center gap-3">
          <a href="/" className="text-sm text-neutral-400 hover:text-neutral-200">
            View public site →
          </a>
          <button onClick={logout} className="text-sm text-neutral-500 hover:text-neutral-300">
            Log out
          </button>
        </div>
      </div>

      <section className="mb-6 rounded-xl border border-white/10 bg-ink-800 p-6">
        <h2 className="mb-1 text-lg font-semibold text-neutral-100">Upload collection CSV</h2>
        <p className="mb-4 text-sm text-neutral-400">
          Re-uploading replaces the entire collection currently shown on the public site. Expected columns: Date
          Purchased, Quantity, Card, Subject, Year, Set, Variation, Number, Category, Condition, Investment, Current
          Value, Potential Profit, Graded Cert #, Population, Notes.
        </p>

        <div
          onDragOver={(e) => {
            e.preventDefault();
            setDragOver(true);
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDragOver(false);
            const file = e.dataTransfer.files?.[0];
            if (file) handleFile(file);
          }}
          onClick={() => fileInputRef.current?.click()}
          className={`flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed p-10 text-center transition ${
            dragOver ? 'border-berry-500 bg-berry-500/5' : 'border-white/15'
          }`}
        >
          <p className="text-sm text-neutral-300">
            {uploading ? 'Uploading…' : 'Drag & drop your CSV here, or click to browse'}
          </p>
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleFile(file);
            }}
          />
        </div>

        {message && (
          <p className={`mt-3 text-sm ${message.type === 'ok' ? 'text-emerald-400' : 'text-red-400'}`}>
            {message.text}
          </p>
        )}
      </section>

      <section className="mb-6 rounded-xl border border-white/10 bg-ink-800 p-6">
        <h2 className="mb-3 text-lg font-semibold text-neutral-100">Public site settings</h2>
        <label className="flex items-center gap-3 text-sm text-neutral-300">
          <input
            type="checkbox"
            checked={data?.settings.showFinancials ?? false}
            onChange={(e) => toggleFinancials(e.target.checked)}
            className="h-4 w-4 rounded border-white/20 bg-ink-900"
          />
          Show what I paid / current value / profit publicly
        </label>
        <p className="mt-1 text-xs text-neutral-500">
          Off by default — most people sharing a collection don't want purchase price or profit visible.
        </p>
      </section>

      <section className="rounded-xl border border-white/10 bg-ink-800 p-6">
        <h2 className="mb-2 text-lg font-semibold text-neutral-100">Current collection</h2>
        {data ? (
          <p className="text-sm text-neutral-400">
            {data.cards.length} card{data.cards.length === 1 ? '' : 's'} live on the public site. Last updated{' '}
            {new Date(data.updatedAt).toLocaleString()}.
          </p>
        ) : (
          <p className="text-sm text-neutral-500">Loading…</p>
        )}
      </section>
    </main>
  );
}
