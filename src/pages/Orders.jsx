import React, { useState, useMemo, useEffect } from 'react';
import { Search } from 'lucide-react';
import { allOrders, currency, num } from '@/lib/mockData';
import DataTable from '@/components/shared/DataTable';
import Badge from '@/components/shared/Badge';
import Pagination from '@/components/shared/Pagination';
import { usePeriod } from '@/lib/PeriodContext';

const statusMap = { done: 'done', cancelled: 'cancelled', processing: 'processing' };
const PAGE_SIZE = 50;

export default function Orders() {
  const { period, range } = usePeriod();
  const [query, setQuery] = useState('');
  const [page, setPage] = useState(1);

  useEffect(() => { setPage(1); }, [period, query]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return allOrders.filter((o) => {
      if (range && (o.orderDate < range.start || o.orderDate > range.end)) return false;
      if (q && !o.id.toLowerCase().includes(q) && !o.customer.toLowerCase().includes(q) && !o.items.toLowerCase().includes(q)) return false;
      return true;
    });
  }, [range, query]);

  const summary = useMemo(() => {
    const done = filtered.filter((o) => o.status !== 'cancelled');
    const revenue = done.reduce((a, o) => a + o.amount, 0);
    const cancelled = filtered.filter((o) => o.status === 'cancelled').length;
    return [
      { label: 'заказов', value: num(filtered.length) },
      { label: 'выручка', value: currency(revenue) },
      { label: 'средний чек', value: `${Math.round(revenue / (done.length || 1))} zł` },
      { label: 'отмен', value: `${Math.round((cancelled / (filtered.length || 1)) * 1000) / 10}%` },
    ];
  }, [filtered]);

  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, pageCount);
  const pageRows = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  const columns = [
    { key: 'id', header: 'ID', render: (r) => <span className="font-mono text-[12px] text-muted-foreground">{r.id}</span> },
    { key: 'customer', header: 'Клиент', render: (r) => <span className="font-medium text-foreground">{r.customer}</span> },
    { key: 'date', header: 'Дата', render: (r) => <span className="text-muted-foreground">{r.date}</span> },
    { key: 'items', header: 'Товары', render: (r) => <span className="text-muted-foreground">{r.items}</span> },
    { key: 'amount', header: 'Сумма', align: 'right', render: (r) => <span className="font-medium text-foreground">{r.amount} zł</span> },
    { key: 'payment', header: 'Оплата', render: (r) => <span className="text-muted-foreground">{r.payment}</span> },
    { key: 'delivery', header: 'Доставка', render: (r) => <span className="text-muted-foreground">{r.delivery}</span> },
    { key: 'location', header: 'Точка', render: (r) => <span className="text-muted-foreground">{r.location}</span> },
    { key: 'status', header: 'Статус', render: (r) => <Badge status={statusMap[r.status]} /> },
  ];

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-6">
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
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-2" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Поиск заказа…"
            className="h-9 w-64 rounded-lg border border-border bg-[hsl(232_26%_7%)] pl-9 pr-3 text-[13px] outline-none focus:border-[hsl(255_100%_68%/0.4)]"
          />
        </div>
      </div>

      <div className="rounded-2xl surface-card p-2">
        <DataTable columns={columns} rows={pageRows} dense />
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