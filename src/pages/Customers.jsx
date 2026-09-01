import React, { useState, useMemo, useEffect } from 'react';
import { Search } from 'lucide-react';
import { allCustomers, currency } from '@/lib/mockData';
import DataTable from '@/components/shared/DataTable';
import Badge from '@/components/shared/Badge';
import Pagination from '@/components/shared/Pagination';
import KpiCard from '@/components/shared/KpiCard';
import MetricGrid from '@/components/shared/MetricGrid';
import { usePeriod } from '@/lib/PeriodContext';
import { cn } from '@/lib/utils';

const statusFilters = [
  { key: 'all', label: 'Все' },
  { key: 'active', label: 'Активные' },
  { key: 'sleeping', label: 'Спящие' },
  { key: 'new', label: 'Новые' },
];
const statusMap = { active: 'active', sleeping: 'sleeping', vip: 'vip', new: 'new' };
const PAGE_SIZE = 50;

function Avatar({ name }) {
  const initials = name.split(' ').map((p) => p[0]).slice(0, 2).join('');
  return (
    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[hsl(234_22%_18%)] to-[hsl(234_22%_10%)] text-[11px] font-semibold text-foreground">
      {initials}
    </div>
  );
}

export default function Customers() {
  const { period } = usePeriod();
  const [status, setStatus] = useState('all');
  const [query, setQuery] = useState('');
  const [page, setPage] = useState(1);

  useEffect(() => { setPage(1); }, [period, status, query]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return allCustomers.filter((c) => {
      if (status !== 'all' && c.status !== status) return false;
      if (q && !c.name.toLowerCase().includes(q) && !c.handle.toLowerCase().includes(q)) return false;
      return true;
    });
  }, [status, query]);

  const summary = useMemo(() => {
    const active = allCustomers.filter((c) => c.status === 'active').length;
    const topLtv = Math.max(...allCustomers.map((c) => c.ltv));
    const avgCheck = Math.round(allCustomers.reduce((a, c) => a + c.avgCheck, 0) / allCustomers.length);
    return [
      { label: 'Клиентов', value: '284' },
      { label: 'Активных', value: String(active) },
      { label: 'Top LTV', value: currency(topLtv) },
      { label: 'Средний чек', value: `${avgCheck} zł` },
    ];
  }, []);

  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, pageCount);
  const pageRows = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  const columns = [
    {
      key: 'name', header: 'Клиент', render: (r) => (
        <div className="flex items-center gap-3">
          <Avatar name={r.name} />
          <div>
            <div className="font-medium text-foreground">{r.name}</div>
            <div className="text-[11px] text-muted-2">{r.handle}</div>
          </div>
        </div>
      ),
    },
    { key: 'status', header: 'Статус', render: (r) => <Badge status={statusMap[r.status]} /> },
    { key: 'segment', header: 'Сегмент', render: (r) => <span className="text-muted-foreground">{r.segment}</span> },
    { key: 'ltv', header: 'LTV', align: 'right', render: (r) => <span className="font-medium text-foreground">{currency(r.ltv)}</span> },
    { key: 'purchases', header: 'Покупки', align: 'right', render: (r) => <span className="text-muted-foreground">{r.purchases}</span> },
    { key: 'interval', header: 'Период.', align: 'right', render: (r) => <span className="text-muted-foreground">{r.interval ? `${r.interval} дн.` : '—'}</span> },
    { key: 'avgCheck', header: 'Ср. чек', align: 'right', render: (r) => <span className="text-muted-foreground">{r.avgCheck} zł</span> },
    { key: 'lastOrder', header: 'Последний', align: 'right', render: (r) => <span className="text-muted-foreground">{r.lastOrder}</span> },
    { key: 'cashback', header: 'Кэшбэк', align: 'right', render: (r) => <span className="font-medium text-[hsl(255_100%_72%)]">{r.cashback} zł</span> },
  ];

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {summary.map((s) => (
          <KpiCard key={s.label} label={s.label} value={s.value} />
        ))}
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="inline-flex max-w-full items-center gap-0.5 overflow-x-auto rounded-lg border border-border bg-[hsl(232_26%_7%)] p-0.5 no-scrollbar">
          {statusFilters.map((s) => (
            <button
              key={s.key}
              onClick={() => setStatus(s.key)}
              className={cn(
                'shrink-0 whitespace-nowrap rounded-md px-3 py-1.5 text-[12px] font-medium transition-all',
                status === s.key
                  ? 'bg-[hsl(255_100%_68%/0.14)] text-foreground shadow-[inset_0_0_0_1px_hsl(255_100%_68%/0.22)]'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              {s.label}
            </button>
          ))}
        </div>
        <div className="relative w-full sm:w-auto">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-2" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Поиск клиента…"
            className="h-9 w-full rounded-lg border border-border bg-[hsl(232_26%_7%)] pl-9 pr-3 text-[13px] outline-none focus:border-[hsl(255_100%_68%/0.4)] sm:w-64"
          />
        </div>
      </div>

      <div className="rounded-2xl surface-card p-2">
        <div className="hidden md:block">
          <DataTable columns={columns} rows={pageRows} dense />
        </div>
        <div className="space-y-2.5 p-1 md:hidden">
          {pageRows.map((r) => (
            <CustomerMobileRow key={r.id} r={r} />
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

function CustomerMobileRow({ r }) {
  return (
    <div className="rounded-xl border border-border-soft bg-[hsl(232_26%_6%)] p-3.5">
      <div className="flex items-center gap-3">
        <Avatar name={r.name} />
        <div className="min-w-0 flex-1">
          <div className="truncate text-[13px] font-medium text-foreground">{r.name}</div>
          <div className="truncate text-[11px] text-muted-2">{r.handle}</div>
        </div>
        <Badge status={statusMap[r.status]} />
      </div>
      <div className="mt-3 border-t border-border-soft pt-3">
        <MetricGrid cols={3} items={[
          { label: 'LTV', value: currency(r.ltv), className: 'text-foreground' },
          { label: 'Покупки', value: r.purchases },
          { label: 'Ср. чек', value: `${r.avgCheck} zł` },
        ]} />
        <div className="mt-2.5">
          <MetricGrid cols={3} items={[
            { label: 'Период', value: r.interval ? `${r.interval} дн.` : '—' },
            { label: 'Кэшбэк', value: `${r.cashback} zł`, className: 'text-[hsl(255_100%_72%)]' },
            { label: 'Последний', value: r.lastOrder },
          ]} />
        </div>
        <div className="mt-2 text-[11px] text-muted-2">Сегмент: <span className="text-muted-foreground">{r.segment}</span></div>
      </div>
    </div>
  );
}