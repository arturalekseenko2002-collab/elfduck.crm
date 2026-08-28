import React, { useState, useMemo, useEffect } from 'react';
import { Search } from 'lucide-react';
import { allLeads, currency, num } from '@/lib/mockData';
import Pagination from '@/components/shared/Pagination';
import { usePeriod } from '@/lib/PeriodContext';
import { cn } from '@/lib/utils';

const PAGE_SIZE = 50;

// Derive status from purchase history.
function derive(l) {
  if (l.completedPurchases > 0) {
    return { status: 'client', sum: l.completedTotal, inLeads: l.firstPurchaseDays };
  }
  if (l.daysSinceCreated > 8) {
    return { status: 'sleeping', sum: 0, inLeads: l.daysSinceCreated };
  }
  return { status: 'lead', sum: 0, inLeads: l.daysSinceCreated };
}

const statusPill = {
  lead: { label: 'Лид', cls: 'border-[hsl(214_84%_60%/0.3)] bg-[hsl(214_84%_60%/0.1)] text-[hsl(214_84%_68%)]', dot: 'bg-[hsl(214_84%_60%)]' },
  sleeping: { label: 'Спящий лид', cls: 'border-[hsl(36_92%_56%/0.3)] bg-[hsl(36_92%_56%/0.1)] text-[hsl(36_92%_62%)]', dot: 'bg-[hsl(36_92%_56%)]' },
  client: { label: 'Клиент', cls: 'border-[hsl(142_64%_47%/0.3)] bg-[hsl(142_64%_47%/0.1)] text-[hsl(142_70%_60%)]', dot: 'bg-[hsl(142_64%_47%)]' },
};

const fmtDate = (d) => d.toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' });

export default function Leads() {
  const { period, range } = usePeriod();
  const [query, setQuery] = useState('');
  const [page, setPage] = useState(1);

  useEffect(() => { setPage(1); }, [period, query]);

  const derived = useMemo(() => {
    const q = query.trim().toLowerCase();
    return allLeads
      .filter((l) => {
        if (range && (l.createdDate < range.start || l.createdDate > range.end)) return false;
        if (q && !l.name.toLowerCase().includes(q) && !l.handle.toLowerCase().includes(q)) return false;
        return true;
      })
      .map((l) => ({ ...l, ...derive(l), createdLabel: fmtDate(l.createdDate) }));
  }, [range, query]);

  const metrics = useMemo(() => {
    const leads = derived.filter((d) => d.status === 'lead').length;
    const sleeping = derived.filter((d) => d.status === 'sleeping').length;
    const clients = derived.filter((d) => d.status === 'client').length;
    const total = derived.length;
    const conversion = total ? Math.round((clients / total) * 100) : 0;
    return [
      { label: 'Лидов', value: num(leads) },
      { label: 'Спящих лидов', value: num(sleeping) },
      { label: 'Клиентов', value: num(clients) },
      { label: 'Конверсия', value: `${conversion}%` },
    ];
  }, [derived]);

  const pageCount = Math.max(1, Math.ceil(derived.length / PAGE_SIZE));
  const safePage = Math.min(page, pageCount);
  const pageRows = derived.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-4 gap-4">
        {metrics.map((m) => (
          <div key={m.label} className="rounded-2xl surface-card p-5">
            <div className="font-heading text-[26px] font-semibold leading-none text-foreground">{m.value}</div>
            <div className="mt-2 text-[11px] uppercase tracking-wider text-muted-2">{m.label}</div>
          </div>
        ))}
      </div>

      <div className="flex items-center justify-between gap-4">
        <h3 className="font-heading text-[15px] font-semibold text-foreground">Лиды</h3>
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-2" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Поиск лида…"
            className="h-9 w-64 rounded-lg border border-border bg-[hsl(232_26%_7%)] pl-9 pr-3 text-[13px] outline-none focus:border-[hsl(255_100%_68%/0.4)]"
          />
        </div>
      </div>

      <div className="rounded-2xl surface-card p-2">
        <table className="w-full border-collapse text-[13px]">
          <thead>
            <tr className="border-b border-border">
              {['Клиент', 'Создан', 'В лидах', 'Сумма', 'Статус'].map((h, i) => (
                <th key={h} className={cn('px-4 py-3 text-[11px] font-medium uppercase tracking-wider text-muted-2', i >= 2 && i <= 3 && 'text-right')}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {pageRows.map((l) => {
              const pill = statusPill[l.status];
              return (
                <tr key={l.id} className="border-b border-border-soft hover:bg-[hsl(234_22%_11%/0.6)]">
                  <td className="px-4 py-3">
                    <div className="font-medium text-foreground">{l.name}</div>
                    <div className="text-[11px] text-muted-2">{l.handle}</div>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{l.createdLabel}</td>
                  <td className="px-4 py-3 text-right text-muted-foreground">{l.inLeads} дн.</td>
                  <td className="px-4 py-3 text-right font-medium text-foreground">{currency(l.sum)}</td>
                  <td className="px-4 py-3">
                    <span className={cn('inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[12px] font-medium', pill.cls)}>
                      <span className={cn('h-1.5 w-1.5 rounded-full', pill.dot)} />
                      {pill.label}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        <Pagination
          page={safePage}
          pageCount={pageCount}
          total={derived.length}
          pageSize={PAGE_SIZE}
          onPageChange={setPage}
        />
      </div>
    </div>
  );
}