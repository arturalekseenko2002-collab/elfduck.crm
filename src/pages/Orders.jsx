import React, { useState, useMemo, useEffect } from 'react';
import { Search } from 'lucide-react';
import { allOrders, currency, num } from '@/lib/mockData';
import DataTable from '@/components/shared/DataTable';
import Badge from '@/components/shared/Badge';
import Pagination from '@/components/shared/Pagination';
import KpiCard from '@/components/shared/KpiCard';
import MetricGrid from '@/components/shared/MetricGrid';
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
      { label: 'Заказов', value: num(filtered.length) },
      { label: 'Выручка', value: currency(revenue) },
      { label: 'Средний чек', value: `${Math.round(revenue / (done.length || 1))} zł` },
      { label: 'Отмен', value: `${Math.round((cancelled / (filtered.length || 1)) * 1000) / 10}%` },
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
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {summary.map((s) => (
          <KpiCard key={s.label} label={s.label} value={s.value} />
        ))}
      </div>

      <div className="flex justify-end">
        <div className="relative w-full sm:w-64">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-2" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Поиск заказа…"
            className="h-9 w-full rounded-lg border border-border bg-[hsl(232_26%_7%)] pl-9 pr-3 text-[13px] outline-none focus:border-[hsl(255_100%_68%/0.4)]"
          />
        </div>
      </div>

      <div className="rounded-2xl surface-card p-2">
        <div className="hidden md:block">
          <DataTable columns={columns} rows={pageRows} dense />
        </div>
        <div className="space-y-2.5 p-1 md:hidden">
          {pageRows.map((r) => (
            <OrderMobileRow key={r.id} r={r} />
          ))}
        </div>
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

function OrderMobileRow({ r }) {
  return (
    <div className="rounded-xl border border-border-soft bg-[hsl(232_26%_6%)] p-3.5">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <div className="font-mono text-[11px] text-muted-foreground">{r.id}</div>
          <div className="truncate text-[13px] font-medium text-foreground">{r.customer}</div>
          <div className="text-[11px] text-muted-2">{r.date}</div>
        </div>
        <Badge status={statusMap[r.status]} />
      </div>
      <div className="mt-2 text-[12px] text-muted-foreground">{r.items}</div>
      <div className="mt-3 border-t border-border-soft pt-3">
        <MetricGrid cols={3} items={[
          { label: 'Сумма', value: `${r.amount} zł`, className: 'text-foreground' },
          { label: 'Оплата', value: r.payment },
          { label: 'Доставка', value: r.delivery },
        ]} />
        <div className="mt-2 text-[11px] text-muted-2">Точка: <span className="text-muted-foreground">{r.location}</span></div>
      </div>
    </div>
  );
}