import React, { useState } from 'react';
import {
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid
} from 'recharts';
import { revenueSeries, currency, num } from '@/lib/mockData';
import { cn } from '@/lib/utils';

const tabs = [
  { key: 'revenue', label: 'Выручка', fmt: currency },
  { key: 'orders', label: 'Заказы', fmt: num },
  { key: 'newCustomers', label: 'Новые клиенты', fmt: num },
  { key: 'repeat', label: 'Повторные', fmt: (v) => `${v}%` },
];

export default function RevenueChart() {
  const [tab, setTab] = useState('revenue');
  const cfg = tabs.find((t) => t.key === tab);
  return (
    <div className="rounded-2xl surface-card p-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="font-heading text-[15px] font-semibold text-foreground">Динамика бизнеса</h3>
          <p className="mt-0.5 text-[12px] text-muted-foreground">Тренд ключевых метрик во времени</p>
        </div>
        <div className="inline-flex max-w-full items-center gap-0.5 overflow-x-auto rounded-lg border border-border bg-[hsl(232_26%_7%)] p-0.5 no-scrollbar">
          {tabs.map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={cn(
                'shrink-0 whitespace-nowrap rounded-md px-3 py-1.5 text-[12px] font-medium transition-all',
                tab === t.key
                  ? 'bg-[hsl(255_100%_68%/0.14)] text-foreground shadow-[inset_0_0_0_1px_hsl(255_100%_68%/0.22)]'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-5 h-[260px] min-w-0">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={revenueSeries} margin={{ top: 8, right: 8, bottom: 0, left: -10 }}>
            <defs>
              <linearGradient id="dyn-fill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="hsl(255 100% 68%)" stopOpacity={0.3} />
                <stop offset="100%" stopColor="hsl(255 100% 68%)" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid stroke="hsl(234 18% 13%)" strokeDasharray="3 6" vertical={false} />
            <XAxis dataKey="date" tick={{ fill: 'hsl(228 10% 44%)', fontSize: 11 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: 'hsl(228 10% 44%)', fontSize: 11 }} axisLine={false} tickLine={false} width={48} />
            <Tooltip
              cursor={{ stroke: 'hsl(255 100% 68%)', strokeWidth: 1, strokeDasharray: '4 4' }}
              contentStyle={{ background: 'hsl(232 26% 8%)', border: '1px solid hsl(234 18% 15%)', borderRadius: 12, fontSize: 12, color: '#fff', boxShadow: '0 8px 30px -8px rgba(0,0,0,0.6)' }}
              labelStyle={{ color: 'hsl(228 12% 62%)', fontSize: 11, marginBottom: 4 }}
              formatter={(v) => [cfg.fmt(v), cfg.label]}
            />
            <Area type="monotone" dataKey={tab} stroke="hsl(255 100% 68%)" strokeWidth={2} fill="url(#dyn-fill)" dot={false} activeDot={{ r: 4, fill: 'hsl(255 100% 68%)', stroke: '#fff', strokeWidth: 1.5 }} />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}