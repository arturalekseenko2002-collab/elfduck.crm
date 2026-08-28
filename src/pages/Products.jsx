import React, { useState, useMemo, useEffect } from 'react';
import { allProducts, currency, num } from '@/lib/mockData';
import DataTable from '@/components/shared/DataTable';
import Sparkline from '@/components/shared/Sparkline';
import Delta from '@/components/shared/Delta';
import Pagination from '@/components/shared/Pagination';
import { usePeriod } from '@/lib/PeriodContext';
import { cn } from '@/lib/utils';

const PAGE_SIZE = 10;

export default function Products() {
  const { period } = usePeriod();
  const [page, setPage] = useState(1);

  useEffect(() => { setPage(1); }, [period]);

  // Summary reflects the FULL dataset, not the current page.
  const summary = useMemo(() => {
    const revenue = allProducts.reduce((a, p) => a + p.revenue, 0);
    const sold = allProducts.reduce((a, p) => a + p.sold, 0);
    const bestsellers = allProducts.filter((p) => p.trend > 20).length;
    const slow = allProducts.filter((p) => p.trend < 0).length;
    const ending = allProducts.filter((p) => p.days <= 2).length;
    const stockValue = allProducts.reduce((a, p) => a + p.stockValue, 0);
    return [
      { label: 'выручка', value: currency(revenue) },
      { label: 'продано', value: num(sold) },
      { label: 'бестселлеры', value: String(bestsellers) },
      { label: 'медленные', value: String(slow) },
      { label: 'заканчиваются', value: String(ending) },
      { label: 'стоимость остатков', value: currency(stockValue) },
    ];
  }, []);

  const pageCount = Math.max(1, Math.ceil(allProducts.length / PAGE_SIZE));
  const safePage = Math.min(page, pageCount);
  const pageRows = allProducts.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  const columns = [
    { key: 'name', header: 'Товар', render: (r) => <span className="font-medium text-foreground">{r.name}</span> },
    { key: 'category', header: 'Категория', render: (r) => <span className="text-muted-foreground">{r.category}</span> },
    { key: 'revenue', header: 'Выручка', align: 'right', render: (r) => <span className="font-medium text-foreground">{currency(r.revenue)}</span> },
    { key: 'sold', header: 'Продано', align: 'right', render: (r) => <span className="text-muted-foreground">{num(r.sold)}</span> },
    {
      key: 'trend', header: 'Динамика', render: (r) => (
        <div className="flex items-center gap-2">
          <div className="w-16"><Sparkline data={r.spark} color={r.trend >= 0 ? 'hsl(255 100% 68%)' : 'hsl(0_72%_58%)'} height={22} /></div>
          <Delta value={r.trend} suffix="%" />
        </div>
      ),
    },
    { key: 'repeat', header: 'Повторные', align: 'right', render: (r) => <span className="text-muted-foreground">{r.repeat}%</span> },
    { key: 'stock', header: 'Остаток', align: 'right', render: (r) => <span className={r.days <= 2 ? 'text-[hsl(36_90%_62%)]' : 'text-muted-foreground'}>{r.stock} шт.</span> },
    { key: 'days', header: 'Дн. запаса', align: 'right', render: (r) => <span className={r.days <= 2 ? 'font-medium text-[hsl(36_90%_62%)]' : 'text-muted-foreground'}>{r.days}</span> },
    { key: 'stockValue', header: 'Стоимость остатка', align: 'right', render: (r) => <span className="text-muted-foreground">{currency(r.stockValue)}</span> },
  ];

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center gap-6">
        {summary.map((s, i) => (
          <div key={s.label} className="flex items-center gap-6">
            {i > 0 && <span className="h-8 w-px bg-border" />}
            <div>
              <div className="font-heading text-[20px] font-semibold leading-none text-foreground">{s.value}</div>
              <div className="mt-1 text-[11px] uppercase tracking-wider text-muted-2">{s.label}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="rounded-2xl surface-card p-2">
        <DataTable columns={columns} rows={pageRows} dense />
        <Pagination
          page={safePage}
          pageCount={pageCount}
          total={allProducts.length}
          pageSize={PAGE_SIZE}
          onPageChange={setPage}
        />
      </div>
    </div>
  );
}