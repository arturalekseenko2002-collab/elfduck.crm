import React, { useState, useMemo, useEffect } from 'react';
import { allProducts, productCategories, currency, num } from '@/lib/mockData';
import Sparkline from '@/components/shared/Sparkline';
import Delta from '@/components/shared/Delta';
import Pagination from '@/components/shared/Pagination';
import { usePeriod } from '@/lib/PeriodContext';
import { cn } from '@/lib/utils';

const segments = [
  { key: 'best', label: 'Лучшие' },
  { key: 'worst', label: 'Худшие' },
  { key: 'category', label: 'По категориям' },
];

const PAGE_SIZE = 10;

export default function ProductPerformance() {
  const { period } = usePeriod();
  const [seg, setSeg] = useState('best');
  const [cat, setCat] = useState('Все категории');
  const [page, setPage] = useState(1);

  useEffect(() => { setPage(1); }, [period]);

  const filtered = useMemo(() => {
    let rows;
    if (seg === 'best') rows = [...allProducts].sort((a, b) => b.revenue - a.revenue);
    else if (seg === 'worst') rows = [...allProducts].sort((a, b) => a.revenue - b.revenue);
    else rows = allProducts.filter((p) => cat === 'Все категории' || p.category === cat);
    return rows;
  }, [seg, cat]);

  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, pageCount);
  const pageRows = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  const onSegChange = (s) => { setSeg(s); setPage(1); };
  const onCatChange = (c) => { setCat(c); setPage(1); };

  return (
    <div className="rounded-2xl surface-card p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h3 className="font-heading text-[15px] font-semibold text-foreground">Товары</h3>
        <div className="flex items-center gap-2">
          <div className="inline-flex items-center gap-0.5 rounded-lg border border-border bg-[hsl(232_26%_7%)] p-0.5">
            {segments.map((s) => (
              <button
                key={s.key}
                onClick={() => onSegChange(s.key)}
                className={cn(
                  'rounded-md px-2.5 py-1 text-[12px] font-medium transition-all',
                  seg === s.key
                    ? 'bg-[hsl(255_100%_68%/0.14)] text-foreground shadow-[inset_0_0_0_1px_hsl(255_100%_68%/0.22)]'
                    : 'text-muted-foreground hover:text-foreground'
                )}
              >
                {s.label}
              </button>
            ))}
          </div>
          {seg === 'category' && (
            <select
              value={cat}
              onChange={(e) => onCatChange(e.target.value)}
              className="h-8 rounded-lg border border-border bg-[hsl(232_26%_7%)] px-2.5 text-[12px] text-foreground outline-none focus:border-[hsl(255_100%_68%/0.4)]"
            >
              {productCategories.map((c) => (
                <option key={c}>{c}</option>
              ))}
            </select>
          )}
        </div>
      </div>

      <div className="mt-4">
        <table className="w-full border-collapse text-[13px]">
          <thead>
            <tr className="border-b border-border">
              {['Товар', 'Категория', 'Выручка', 'Продано', 'Динамика', 'Остаток', 'Дн. запаса'].map((h, i) => (
                <th key={h} className={cn('px-3 py-2.5 text-[11px] font-medium uppercase tracking-wider text-muted-2', i >= 2 && 'text-right')}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {pageRows.map((p) => {
              const lowStock = p.days <= 2;
              return (
                <tr key={p.id} className="border-b border-border-soft hover:bg-[hsl(234_22%_11%/0.6)]">
                  <td className="px-3 py-3 font-medium text-foreground">{p.name}</td>
                  <td className="px-3 py-3 text-muted-foreground">{p.category}</td>
                  <td className="px-3 py-3 text-right font-medium text-foreground">{currency(p.revenue)}</td>
                  <td className="px-3 py-3 text-right text-muted-foreground">{num(p.sold)} шт.</td>
                  <td className="px-3 py-3">
                    <div className="flex items-center justify-end gap-2">
                      <div className="w-16"><Sparkline data={p.spark} color={p.trend >= 0 ? 'hsl(255 100% 68%)' : 'hsl(0_72%_58%)'} height={22} /></div>
                      <Delta value={p.trend} suffix="%" />
                    </div>
                  </td>
                  <td className={cn('px-3 py-3 text-right', lowStock ? 'text-[hsl(36_90%_62%)]' : 'text-muted-foreground')}>{p.stock} шт.</td>
                  <td className={cn('px-3 py-3 text-right', lowStock ? 'font-medium text-[hsl(36_90%_62%)]' : 'text-muted-foreground')}>{p.days}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
        <Pagination
          page={safePage}
          pageCount={pageCount}
          total={filtered.length}
          pageSize={PAGE_SIZE}
          onPageChange={setPage}
        />
      </div>
    </div>
  );
}