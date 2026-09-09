import type { CardRecord } from '@/lib/types';
import { categoryColor, graderColor, formatMoney, formatNumber } from '@/lib/format';

export default function CardTile({
  card,
  showFinancials,
}: {
  card: CardRecord;
  showFinancials: boolean;
}) {
  return (
    <div className="group flex flex-col overflow-hidden rounded-xl border border-white/10 bg-ink-800 shadow-lg transition hover:border-berry-500/50 hover:shadow-berry-900/30">
      {/* Image area — placeholder until photos are added */}
      <div className="relative flex aspect-[3/4] items-center justify-center bg-gradient-to-br from-ink-700 to-ink-900">
        {card.imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={card.imageUrl} alt={card.title} className="h-full w-full object-cover" />
        ) : (
          <div className="px-4 text-center text-xs uppercase tracking-wide text-neutral-500">
            No image yet
          </div>
        )}
        <div className="absolute left-2 top-2 flex flex-wrap gap-1">
          <span className={`rounded-full border px-2 py-0.5 text-[10px] font-semibold ${categoryColor(card.category)}`}>
            {card.category || 'Uncategorized'}
          </span>
        </div>
        <div className="absolute right-2 top-2">
          <span className={`rounded px-2 py-0.5 text-[10px] font-bold shadow ${graderColor(card.gradingCompany)}`}>
            {card.gradingCompany || '—'} {card.grade}
          </span>
        </div>
      </div>

      <div className="flex flex-1 flex-col gap-1.5 p-3">
        <h3 className="line-clamp-2 text-sm font-semibold leading-snug text-neutral-100">
          {card.subject || card.title}
        </h3>
        <p className="line-clamp-2 text-xs text-neutral-400">
          {[card.year, card.set, card.variation].filter(Boolean).join(' · ')}
        </p>
        <p className="text-xs text-neutral-500">
          {card.number ? `#${card.number}` : ''}
          {card.quantity > 1 ? ` · Qty ${card.quantity}` : ''}
        </p>

        <div className="mt-1 flex items-center justify-between text-[11px] text-neutral-500">
          <span>Cert #{card.gradedCertNumber || '—'}</span>
          <span>Pop {formatNumber(card.population)}</span>
        </div>

        {showFinancials && (
          <div className="mt-2 grid grid-cols-2 gap-x-2 gap-y-1 border-t border-white/10 pt-2 text-[11px]">
            <div>
              <div className="text-neutral-500">Paid</div>
              <div className="font-medium text-neutral-200">{formatMoney(card.investment)}</div>
            </div>
            <div>
              <div className="text-neutral-500">Value</div>
              <div className="font-medium text-neutral-200">{formatMoney(card.currentValue)}</div>
            </div>
            <div className="col-span-2">
              <span
                className={
                  card.potentialProfit !== null && card.potentialProfit >= 0
                    ? 'text-emerald-400'
                    : 'text-red-400'
                }
              >
                {card.potentialProfit !== null
                  ? `${card.potentialProfit >= 0 ? '+' : ''}${formatMoney(card.potentialProfit)}`
                  : '—'}
              </span>
            </div>
          </div>
        )}

        {card.notes && (
          <p className="mt-1 line-clamp-2 text-[11px] italic text-neutral-500">{card.notes}</p>
        )}
      </div>
    </div>
  );
}
