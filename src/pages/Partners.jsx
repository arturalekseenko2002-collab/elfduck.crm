import React, { useState, useMemo, useEffect } from 'react';
import { Search } from 'lucide-react';
import { allPartners, allCustomers, allLeads, currency, num } from '@/lib/mockData';
import DataTable from '@/components/shared/DataTable';
import Delta from '@/components/shared/Delta';
import Pagination from '@/components/shared/Pagination';
import PartnerMobileRow from '@/components/shared/PartnerMobileRow';
import { usePeriod } from '@/lib/PeriodContext';
import { toast } from '@/components/ui/use-toast';

const PAGE_SIZE = 25;
const norm = (h) => h.toLowerCase().replace(/^@/, '');

export default function Partners() {
  const { period } = usePeriod();
  const [partners, setPartners] = useState(allPartners);
  const [query, setQuery] = useState('');
  const [page, setPage] = useState(1);
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => { setPage(1); }, [period, query]);

  // Pool of existing Telegram users (customers + leads) lookupable by handle.
  const userPool = useMemo(() => {
    const m = new Map();
    allCustomers.forEach((c) => m.set(norm(c.handle), c.name));
    allLeads.forEach((l) => m.set(norm(l.handle), l.name));
    return m;
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return partners.filter((p) => !q || p.name.toLowerCase().includes(q) || p.handle.toLowerCase().includes(q));
  }, [partners, query]);

  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, pageCount);
  const pageRows = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  const assign = () => {
    const raw = username.trim();
    if (!raw) return;
    setLoading(true);
    setTimeout(() => {
      const key = norm(raw);
      const name = userPool.get(key);
      const already = partners.some((p) => norm(p.handle) === key);
      if (!name) {
        toast({ variant: 'destructive', title: 'Пользователь не найден' });
      } else if (already) {
        toast({ variant: 'destructive', title: 'Пользователь уже является партнёром' });
      } else {
        setPartners((prev) => [
          { id: 'P-' + Date.now(), name, handle: '@' + key, invited: 0, bought: 0, conversion: 0, revenue: 0, avgCheck: 0, ltv: 0, trend: 0 },
          ...prev,
        ]);
        toast({ title: 'Пользователь назначен партнёром' });
        setUsername('');
      }
      setLoading(false);
    }, 600);
  };

  const columns = [
    {
      key: 'name', header: 'Партнёр', render: (r) => (
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-[hsl(234_22%_18%)] to-[hsl(234_22%_10%)] text-[11px] font-semibold text-foreground">
            {r.name.slice(0, 2).toUpperCase()}
          </div>
          <div>
            <div className="font-medium text-foreground">{r.name}</div>
            <div className="text-[11px] text-muted-2">{r.handle}</div>
          </div>
        </div>
      ),
    },
    { key: 'invited', header: 'Приглашено', align: 'right', render: (r) => <span className="text-muted-foreground">{num(r.invited)}</span> },
    { key: 'bought', header: 'Купили', align: 'right', render: (r) => <span className="text-muted-foreground">{num(r.bought)}</span> },
    { key: 'conversion', header: 'Конверсия', align: 'right', render: (r) => <span className="font-medium text-[hsl(255_100%_72%)]">{r.conversion}%</span> },
    { key: 'revenue', header: 'Выручка', align: 'right', render: (r) => <span className="font-medium text-foreground">{currency(r.revenue)}</span> },
    { key: 'avgCheck', header: 'Средний чек', align: 'right', render: (r) => <span className="text-muted-foreground">{r.avgCheck} zł</span> },
    { key: 'ltv', header: 'LTV клиентов', align: 'right', render: (r) => <span className="text-muted-foreground">{r.ltv} zł</span> },
    { key: 'trend', header: 'Тренд', align: 'right', render: (r) => <Delta value={r.trend} suffix="%" /> },
  ];

  return (
    <div className="space-y-5">
      <div className="rounded-2xl surface-card p-5">
        <h3 className="font-heading text-[15px] font-semibold text-foreground">Добавить партнёра</h3>
        <p className="mt-0.5 text-[12px] text-muted-foreground">Назначить пользователя партнёром по Telegram username</p>
        <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center">
          <input
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && assign()}
            placeholder="@username"
            className="input-base h-10 w-full sm:max-w-xs"
          />
          <button
            onClick={assign}
            disabled={loading || !username.trim()}
            className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-[hsl(255_100%_68%)] to-[hsl(280_90%_60%)] px-4 py-2.5 text-[13px] font-medium text-white shadow-[0_4px_20px_-6px_hsl(255_100%_68%)] disabled:opacity-50 sm:w-auto"
          >
            {loading && <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />}
            Назначить партнёром
          </button>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="text-[12px] text-muted-2">Найдено: {filtered.length}</div>
        <div className="relative w-full sm:w-auto">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-2" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Поиск партнёра…"
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
            <PartnerMobileRow key={r.id} p={r} showName showTrend showLtv />
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