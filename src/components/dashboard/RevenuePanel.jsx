import React from 'react';
import { TrendingUp } from 'lucide-react';
import { ResponsiveContainer, AreaChart, Area, YAxis, Tooltip } from 'recharts';
import { kpis, currency } from '@/lib/mockData';
import Sparkline from '@/components/shared/Sparkline';

export default function RevenuePanel() {
  const data = kpis.revenue.series.map((v, i) => ({ i, v }));
  return (
    <div className="relative overflow-hidden rounded-2xl surface-card p-6">
      <div className="pointer-events-none absolute -right-20 -top-24 h-64 w-64 rounded-full bg-[hsl(255_100%_68%/0.12)] blur-3xl" />
      <div className="relative">
        <div className="flex items-center justify-between">
          <span className="text-[12px] font-medium uppercase tracking-[0.14em] text-muted-2">Выручка</span>
          <span className="inline-flex items-center gap-1 rounded-full border border-[hsl(142_64%_47%/0.2)] bg-[hsl(142_64%_47%/0.1)] px-2 py-0.5 text-[12px] font-medium text-[hsl(142_70%_58%)]">
            <TrendingUp className="h-3 w-3" /> ↑ 12.4%
          </span>
        </div>
        <div className="mt-3 flex items-end gap-3">
          <span className="font-heading text-[36px] font-semibold leading-none tracking-tight text-foreground">{currency(kpis.revenue.value)}</span>
          <span className="mb-1 text-[12px] text-muted-foreground">к предыдущему периоду</span>
        </div>
        <div className="mt-5 h-[120px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 4, right: 0, bottom: 0, left: 0 }}>
              <defs>
                <linearGradient id="rev-fill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="hsl(255 100% 68%)" stopOpacity={0.35} />
                  <stop offset="100%" stopColor="hsl(255 100% 68%)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <YAxis hide domain={['dataMin - 5', 'dataMax + 5']} />
              <Tooltip
                cursor={{ stroke: 'hsl(255 100% 68%)', strokeWidth: 1, strokeDasharray: '4 4' }}
                contentStyle={{ background: 'hsl(232 26% 8%)', border: '1px solid hsl(234 18% 16%)', borderRadius: 10, fontSize: 12, color: '#fff' }}
                labelStyle={{ display: 'none' }}
                formatter={(v) => [`${v}k zł`, 'Выручка']}
              />
              <Area type="monotone" dataKey="v" stroke="hsl(255 100% 68%)" strokeWidth={2} fill="url(#rev-fill)" dot={false} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}