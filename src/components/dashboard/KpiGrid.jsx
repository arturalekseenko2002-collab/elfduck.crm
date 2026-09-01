import React from 'react';
import { kpis, num } from '@/lib/mockData';
import KpiCard from '@/components/shared/KpiCard';

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
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-3">
      {cards.map((c) => {
        const k = kpis[c.key];
        return (
          <KpiCard
            key={c.key}
            label={c.label}
            value={c.fmt(k.value)}
            delta={k.delta}
            series={c.spark}
            color={c.color}
            suffix={c.suffix}
            invert={c.invert}
          />
        );
      })}
    </div>
  );
}