import React from 'react';
import { ResponsiveContainer, RadialBarChart, RadialBar, PolarAngleAxis } from 'recharts';
import { retention, currency } from '@/lib/mockData';

export default function RetentionPanel() {
  const data = [{ name: 'repeat', value: retention.rate, fill: 'hsl(255 100% 68%)' }];
  return (
    <div className="rounded-2xl surface-card p-6">
      <h3 className="font-heading text-[15px] font-semibold text-foreground">Повторные покупки</h3>
      <p className="mt-0.5 text-[12px] text-muted-foreground">Удержание клиентов</p>

      <div className="relative mt-2 h-[150px] min-w-0">
        <ResponsiveContainer width="100%" height="100%">
          <RadialBarChart innerRadius="72%" outerRadius="100%" data={data} startAngle={90} endAngle={-270}>
            <PolarAngleAxis type="number" domain={[0, 100]} tick={false} />
            <RadialBar background={{ fill: 'hsl(234 22% 11%)' }} dataKey="value" cornerRadius={20} />
          </RadialBarChart>
        </ResponsiveContainer>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="font-heading text-[30px] font-semibold leading-none tabular-nums text-foreground">{retention.rate}%</span>
          <span className="mt-1 text-[12px] font-medium text-[hsl(142_70%_55%)]">+{retention.delta} п.п.</span>
        </div>
      </div>

      <div className="mt-4 space-y-2.5 border-t border-border-soft pt-4">
        <Row label="Новые клиенты" value={`${retention.newShare}%`} />
        <Row label="Повторные" value={`${retention.repeatShare}%`} />
        <Row label="Средний интервал" value={`${retention.avgIntervalDays} дней`} />
        <Row label="Выручка повторных" value={currency(retention.repeatRevenue)} accent />
      </div>
    </div>
  );
}

function Row({ label, value, accent }) {
  return (
    <div className="flex items-center justify-between text-[12px]">
      <span className="text-muted-foreground">{label}</span>
      <span className={accent ? 'font-medium tabular-nums text-[hsl(255_100%_72%)]' : 'font-medium tabular-nums text-foreground'}>{value}</span>
    </div>
  );
}