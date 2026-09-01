import React, { useState, useMemo, useEffect } from 'react';
import { Search } from 'lucide-react';
import { cashback, allCashbackClients, currency } from '@/lib/mockData';
import DataTable from '@/components/shared/DataTable';
import Pagination from '@/components/shared/Pagination';
import MetricGrid from '@/components/shared/MetricGrid';
import { usePeriod } from '@/lib/PeriodContext';
import { cn } from '@/lib/utils';

const filters = [
  { key: 'all', label: 'Все' },
  { key: 'balance', label: 'Есть баланс' },
  { key: 'expiring', label: 'Скоро сгорит' },
];
const PAGE_SIZE = 50;

const summary = [
  { label: 'Начислено', value: currency(cashback.issued) },
  { label: 'Использовано', value: currency(cashback.used) },
  { label: 'Активный баланс', value: currency(cashback.balance) },
  { label: 'Utilisation', value: `${cashback.utilisation}%` },
];

function CashbackMobileRow({ r }) {
  const statusColor = r.status === 'used' ? 'text-muted-2' : r.status === 'expiring' ? 'text-[hsl(36_90%_62%)]' : 'text-[hsl(142_70%_58%)]';
  const statusDot = r.status === 'used' ? 'bg-muted-2' : r.status === 'expiring' ? 'bg-[hsl(36_90%_58%)]' : 'bg-[hsl(142_64%_47%)]';
  const statusLabel = r.status === 'used' ? 'Использован' : r.status === 'expiring' ? 'Скоро сгорит' : 'Активен';
  return (
    <div className="rounded-xl border border-border-soft bg-[hsl(232_26%_6%)] p-3.5">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <div className="truncate text-[13px] font-medium text-foreground">{r.name}</div>
          <div className="truncate text-[11px] text-muted-2">{r.handle}</div>
        </div>
        <span className={cn('inline-flex shrink-0 items-center gap-1.5 text-[12px]', statusColor)}>
          <span className={cn('h-1.5 w-1.5 rounded-full', statusDot)} />
          {statusLabel}
        </span>
      </div>
      <div className="mt-3 border-t border-border-soft pt-3">
        <MetricGrid cols={3} items={[
          { label: 'Баланс', value: `${r.balance} zł`, className: 'text-[hsl(255_100%_72%)]' },
          { label: 'Выдано', value: `${r.issued} zł` },
          { label: 'Использовано', value: `${r.used} zł` },
        ]} />
        <div className="mt-2 text-[11px] text-muted-2">Сгорит: <span className={r.noExpire ? 'text-muted-2' : r.status === 'expiring' ? 'font-medium text-[hsl(36_90%_62%)]' : 'text-muted-foreground'}>{r.expireLabel}</span></div>
      </div>
    </div>
  );
}

export default function Cashback() {
  const { period } = usePeriod();
  const [filter, setFilter] = useState('all');
  const [query, setQuery] = useState('');
  const [page, setPage] = useState(1);

  useEffect(() => { setPage(1); }, [period, filter, query]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return allCashbackClients.filter((c) => {
      if (filter === 'balance' && c.balance <= 0) return false;
      if (filter === 'expiring' && !(c.status === 'expiring')) return false;
      if (q && !c.name.toLowerCase().includes(q) && !c.handle.toLowerCase().includes(q)) return false;
      return true;
    });
  }, [filter, query]);

  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, pageCount);
  const pageRows = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  const columns = [
    {
      key: 'name', header: 'Клиент', render: (r) => (
        <div>
          <div className="font-medium text-foreground">{r.name}</div>
          <div className="text-[11px] text-muted-2">{r.handle}</div>
        </div>
      ),
    },
    { key: 'balance', header: 'Баланс', align: 'right', render: (r) => <span className="font-medium text-[hsl(255_100%_72%)]">{r.balance} zł</span> },
    { key: 'issued', header: 'Выдано всего', align: 'right', render: (r) => <span className="text-muted-foreground">{r.issued} zł</span> },
    { key: 'used', header: 'Использовано', align: 'right', render: (r) => <span className="text-muted-foreground">{r.used} zł</span> },
    {
      key: 'expire', header: 'Сгорит', align: 'right', render: (r) => (
        <span className={r.noExpire ? 'text-muted-2' : r.status === 'expiring' ? 'font-medium text-[hsl(36_90%_62%)]' : 'text-muted-foreground'}>
          {r.expireLabel}
        </span>
      ),
    },
    {
      key: 'status', header: 'Статус', align: 'right', render: (r) => (
        <span className={cn(
          'inline-flex items-center gap-1.5 text-[12px]',
          r.status === 'used' ? 'text-muted-2' : r.status === 'expiring' ? 'text-[hsl(36_90%_62%)]' : 'text-[hsl(142_70%_58%)]'
        )}>
          <span className={cn('h-1.5 w-1.5 rounded-full', r.status === 'used' ? 'bg-muted-2' : r.status === 'expiring' ? 'bg-[hsl(36_90%_58%)]' : 'bg-[hsl(142_64%_47%)]')} />
          {r.status === 'used' ? 'Использован' : r.status === 'expiring' ? 'Скоро сгорит' : 'Активен'}
        </span>
      ),
    },
  ];

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {summary.map((s) => (
          <div key={s.label} className="rounded-2xl surface-card p-5">
            <div className="text-[11px] uppercase tracking-wider text-muted-2">{s.label}</div>
            <div className="mt-2 font-heading text-[26px] font-semibold text-foreground">{s.value}</div>
          </div>
        ))}
      </div>

      <div className="rounded-2xl surface-card p-6">
        <h3 className="font-heading text-[15px] font-semibold text-foreground">Распределение кэшбэка</h3>
        <p className="mt-0.5 text-[12px] text-muted-foreground">Структура начислений и использования</p>
        <div className="mt-5 space-y-4">
          {cashback.distribution.map((d, i) => {
            const max = Math.max(...cashback.distribution.map((x) => x.value));
            return (
              <div key={d.label}>
                <div className="flex items-center justify-between text-[13px]">
                  <span className="text-muted-foreground">{d.label}</span>
                  <span className="font-medium text-foreground">{currency(d.value)} · {d.share}%</span>
                </div>
                <div className="mt-1.5 h-2 w-full overflow-hidden rounded-full bg-[hsl(234_22%_11%)]">
                  <div className={cn('h-full rounded-full', i === 0 ? 'bg-[hsl(255_100%_68%)]' : 'bg-[hsl(234_18%_28%)]')} style={{ width: `${(d.value / max) * 100}%` }} />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <h3 className="font-heading text-[15px] font-semibold text-foreground">Кэшбэк клиентов</h3>
          <div className="flex items-center gap-3">
            <div className="relative w-full sm:w-auto">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-2" />
              <input
                value={query}
                onChange={(e) => { setQuery(e.target.value); setPage(1); }}
                placeholder="Имя или @telegram…"
                className="h-9 w-full rounded-lg border border-border bg-[hsl(232_26%_7%)] pl-9 pr-3 text-[13px] outline-none focus:border-[hsl(255_100%_68%/0.4)] sm:w-56"
              />
            </div>
          </div>
        </div>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="inline-flex max-w-full items-center gap-0.5 overflow-x-auto rounded-lg border border-border bg-[hsl(232_26%_7%)] p-0.5 no-scrollbar">
            {filters.map((f) => (
              <button
                key={f.key}
                onClick={() => { setFilter(f.key); setPage(1); }}
                className={cn(
                  'shrink-0 whitespace-nowrap rounded-md px-3 py-1.5 text-[12px] font-medium transition-all',
                  filter === f.key
                    ? 'bg-[hsl(255_100%_68%/0.14)] text-foreground shadow-[inset_0_0_0_1px_hsl(255_100%_68%/0.22)]'
                    : 'text-muted-foreground hover:text-foreground'
                )}
              >
                {f.label}
              </button>
            ))}
          </div>
          <div className="text-[12px] text-muted-2">Найдено: {filtered.length}</div>
        </div>

        <div className="rounded-2xl surface-card p-2">
          <div className="hidden md:block">
            <DataTable columns={columns} rows={pageRows} dense />
          </div>
          <div className="space-y-2.5 p-1 md:hidden">
            {pageRows.map((r) => (
              <CashbackMobileRow key={r.id} r={r} />
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
    </div>
  );
}