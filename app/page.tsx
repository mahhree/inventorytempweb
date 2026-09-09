import { readCardsData } from '@/lib/storage';
import GalleryClient from '@/components/GalleryClient';

export const dynamic = 'force-dynamic';

export default async function HomePage() {
  const data = await readCardsData();

  return (
    <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <header className="mb-8 flex flex-col items-start justify-between gap-2 sm:flex-row sm:items-end">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-neutral-50">
            {data.settings.siteName || 'CardBerry TCG'}
          </h1>
          <p className="mt-1 text-sm text-neutral-400">Graded card collection</p>
        </div>
        <p className="text-xs text-neutral-600">
          Last updated {new Date(data.updatedAt).toLocaleDateString()}
        </p>
      </header>

      {data.cards.length === 0 ? (
        <div className="rounded-xl border border-dashed border-white/10 p-16 text-center text-neutral-500">
          No cards uploaded yet.
        </div>
      ) : (
        <GalleryClient cards={data.cards} showFinancials={data.settings.showFinancials} />
      )}
    </main>
  );
}
