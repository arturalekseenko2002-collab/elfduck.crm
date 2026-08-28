import React from 'react';
import { kpis, currency, num } from '@/lib/mockData';
import Sparkline from '@/components/shared/Sparkline';
import Delta from '@/components/shared/Delta';

const cards = [
  { key: 'orders', label: 'Заказы', fmt: (v) => num(v), spark: kpis.orders.series, color: 'hsl(255 100% 68%)' },
  { key: 'avgCheck', label: 'Средний чек', fmt: (v) => `${v} zł`, spark: kpis.avgCheck.series, color: 'hsl(214 84% 60%)' },
  { key: 'customers', label: 'Клиенты', fmt: (v) => num(v), spark: kpis.customers.series, color: 'hsl(142 64% 47%)' },
  { key: 'repeat', label: 'Повторные покупки', fmt: (v) => `${v}%`, spark: kpis.repeat.series, color: 'hsl(255 100% 68%)', suffix: ' п.п.' },
  { key: 'cancel', label: 'Отмены', fmt: (v) => `${v}%`, spark: kpis.cancel.series, color: 'hsl(0 72% 58%)', invert: true },
  { key: 'newCustomers', label: 'Новые клиенты', fmt: (v) => `${v}%`, spark: kpis.newCustomers.series, color: 'hsl(214 84% 60%)' },
];

export default function KpiGrid() {
  return (
    <div className="grid grid-cols-3 gap-4">
      {cards.map((c) => {
        const k = kpis[c.key];
        return (
          <div key={c.key} className="rounded-2xl surface-card p-4 transition-colors hover:border-[hsl(255_100%_68%/0.25)]">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-medium uppercase tracking-[0.12em] text-muted-2">{c.label}</span>
              <Delta value={c.invert ? -Math.abs(k.delta) : k.delta} suffix={c.suffix} />
            </div>
            <div className="mt-2 font-heading text-[26px] font-semibold leading-none tracking-tight text-foreground">
              {c.fmt(k.value)}
            </div>
            <div className="mt-3 h-8">
              <Sparkline data={c.spark} color={c.color} area />
            </div>
          </div>
        );
      })}
    </div>
  );
}