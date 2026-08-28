import React, { useState, useMemo, useEffect } from 'react';
import { Search } from 'lucide-react';
import { allCustomers, currency } from '@/lib/mockData';
import DataTable from '@/components/shared/DataTable';
import Badge from '@/components/shared/Badge';
import Pagination from '@/components/shared/Pagination';
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
    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-[hsl(234_22%_18%)] to-[hsl(234_22%_10%)] text-[11px] font-semibold text-foreground">
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
      { label: 'клиентов', value: '284' },
      { label: 'активных', value: String(active) },
      { label: 'top LTV', value: currency(topLtv) },
      { label: 'средний чек', value: `${avgCheck} zł` },
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
            placeholder="Поиск клиента…"
            className="h-9 w-64 rounded-lg border border-border bg-[hsl(232_26%_7%)] pl-9 pr-3 text-[13px] outline-none focus:border-[hsl(255_100%_68%/0.4)]"
          />
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div className="inline-flex items-center gap-0.5 rounded-lg border border-border bg-[hsl(232_26%_7%)] p-0.5">
          {statusFilters.map((s) => (
            <button
              key={s.key}
              onClick={() => setStatus(s.key)}
              className={cn(
                'rounded-md px-3 py-1.5 text-[12px] font-medium transition-all',
                status === s.key
                  ? 'bg-[hsl(255_100%_68%/0.14)] text-foreground shadow-[inset_0_0_0_1px_hsl(255_100%_68%/0.22)]'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              {s.label}
            </button>
          ))}
        </div>
        <div className="text-[12px] text-muted-2">Найдено: {filtered.length}</div>
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