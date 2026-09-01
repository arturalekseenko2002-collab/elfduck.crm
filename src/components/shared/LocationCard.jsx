import React from 'react';
import { num } from '@/lib/mockData';
import Sparkline from '@/components/shared/Sparkline';
import { metricConfig, chartColorFor, scaleLocation } from '@/lib/locationMetrics';
import { cn } from '@/lib/utils';

function Trend({ value, goodPositive }) {
  const positive = value >= 0;
  const good = goodPositive ? positive : !positive;
  return (
    <span className={cn('inline-flex items-center gap-1 text-[13px] font-medium tabular-nums', good ? 'text-[hsl(142_70%_58%)]' : 'text-[hsl(0_72%_62%)]')}>
      {positive ? '↑' : '↓'} {Math.abs(value)}%
    </span>
  );
}

export default function LocationCard({ metric, location, days }) {
  const cfg = metricConfig[metric];
  const view = scaleLocation(location, days);
  const chartColor = chartColorFor(metric, location);
  return (
    <div className="rounded-2xl surface-card p-5 transition-colors hover:border-[hsl(255_100%_68%/0.25)]">
      <div className="flex items-start justify-between">
        <span className="text-[14px] font-semibold text-foreground">{location.name}</span>
        <Trend value={cfg.trend(location)} goodPositive={cfg.goodPositive} />
      </div>
      <div className="mt-2 font-heading text-[24px] font-semibold leading-none tabular-nums text-foreground">{cfg.primary(view)}</div>
      <div className="mt-1 text-[11px] uppercase tracking-[0.06em] text-muted-2">{cfg.label}</div>
      <div className="mt-3 h-10"><Sparkline data={cfg.chart(location)} color={chartColor} area height={40} /></div>
      <div className="mt-4 grid grid-cols-3 gap-y-2 text-[12px] tabular-nums">
        <span className="text-muted-2">{num(view.orders)} заказов</span>
        <span className="text-center text-muted-2">{view.avgCheck} zł чек</span>
        <span className="text-right text-muted-2">{view.cancel}% отмен</span>
      </div>
      <div className="mt-3 border-t border-border-soft pt-2.5">
        <div className="text-[11px] text-muted-2">Топ: <span className="text-muted-foreground">{location.top}</span></div>
        {location.risk && <div className="mt-0.5 text-[11px] text-[hsl(36_90%_62%)]">⚠ {location.risk}</div>}
      </div>
    </div>
  );
}