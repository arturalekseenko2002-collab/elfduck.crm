import React from 'react';
import { TrendingUp, AlertTriangle, Send, Package } from 'lucide-react';
import { insights } from '@/lib/mockData';
import { cn } from '@/lib/utils';

const iconMap = { trending: TrendingUp, alert: AlertTriangle, send: Send, box: Package };
const toneMap = {
  success: { ring: 'border-[hsl(142_64%_47%/0.25)]', icon: 'text-[hsl(142_70%_58%)]', glow: 'bg-[hsl(142_64%_47%/0.08)]' },
  warning: { ring: 'border-[hsl(36_92%_56%/0.25)]', icon: 'text-[hsl(36_90%_62%)]', glow: 'bg-[hsl(36_92%_56%/0.08)]' },
  primary: { ring: 'border-[hsl(255_100%_68%/0.25)]', icon: 'text-[hsl(255_100%_72%)]', glow: 'bg-[hsl(255_100%_68%/0.08)]' },
  info: { ring: 'border-[hsl(214_84%_60%/0.25)]', icon: 'text-[hsl(214_90%_68%)]', glow: 'bg-[hsl(214_84%_60%/0.08)]' },
};

export default function InsightsRow() {
  return (
    <div>
      <div className="mb-3 flex items-baseline justify-between">
        <h3 className="font-heading text-[15px] font-semibold text-foreground">ElfDuck Insights</h3>
        <span className="text-[12px] text-muted-foreground">Важное за выбранный период</span>
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {insights.map((it) => {
          const tone = toneMap[it.tone];
          const Icon = iconMap[it.icon];
          return (
            <div key={it.id} className={cn('relative overflow-hidden rounded-2xl surface-card p-4', tone.ring)}>
              <div className={cn('pointer-events-none absolute -right-10 -top-10 h-28 w-28 rounded-full blur-2xl', tone.glow)} />
              <div className="relative">
                <div className={cn('flex h-8 w-8 items-center justify-center rounded-lg bg-[hsl(234_22%_11%)]', tone.icon)}>
                  <Icon className="h-4 w-4" />
                </div>
                <div className="mt-3 text-[13px] font-semibold leading-snug text-foreground">{it.title}</div>
                <div className="mt-1 text-[12px] text-muted-foreground">{it.line}</div>
                <div className={cn('mt-3 text-[12px] font-medium tabular-nums', tone.icon)}>{it.metric}</div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}