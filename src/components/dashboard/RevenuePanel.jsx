import React from 'react';
import {
  TrendingDown,
  TrendingUp,
} from 'lucide-react';

import {
  ResponsiveContainer,
  AreaChart,
  Area,
  YAxis,
  Tooltip,
} from 'recharts';

const moneyFormatter =
  new Intl.NumberFormat(
    'pl-PL',
    {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }
  );

function currency(value) {
  return `${moneyFormatter.format(
    Number(value || 0)
  )} zł`;
}

export default function RevenuePanel({
  revenue,
  series = [],
  loading = false,
}) {
  const value =
    Number(
      revenue?.value || 0
    );

  const change =
    revenue?.changePercent;

  const hasChange =
    change !== null &&
    change !== undefined;

  const positive =
    Number(change || 0) >= 0;

  const data =
    series.map((row) => ({
      date: row.date,
      value:
        Number(
          row.revenue || 0
        ),
    }));

  return (
    <div className="relative overflow-hidden rounded-2xl surface-card p-6">
      <div className="pointer-events-none absolute -right-20 -top-24 h-64 w-64 rounded-full bg-[hsl(255_100%_68%/0.08)] blur-3xl" />

      <div className="relative">
        <div className="flex items-center justify-between">
          <span className="text-[12px] font-medium uppercase tracking-[0.1em] text-muted-2">
            Выручка
          </span>

          {hasChange && (
            <span
              className={
                positive
                  ? 'inline-flex items-center gap-1 rounded-full border border-[hsl(142_64%_47%/0.2)] bg-[hsl(142_64%_47%/0.1)] px-2 py-0.5 text-[12px] font-medium text-[hsl(142_70%_58%)]'
                  : 'inline-flex items-center gap-1 rounded-full border border-red-500/20 bg-red-500/10 px-2 py-0.5 text-[12px] font-medium text-red-400'
              }
            >
              {positive ? (
                <TrendingUp className="h-3 w-3" />
              ) : (
                <TrendingDown className="h-3 w-3" />
              )}

              {positive ? '+' : ''}
              {Number(change).toFixed(1)}%
            </span>
          )}
        </div>

        <div className="mt-3 flex flex-wrap items-end gap-x-3 gap-y-1">
          <span className="font-heading text-[36px] font-semibold leading-none tracking-tight tabular-nums text-foreground">
            {loading
              ? '—'
              : currency(value)}
          </span>

          <span className="mb-1 text-[12px] text-muted-foreground">
            к предыдущему периоду
          </span>
        </div>

        <div className="mt-5 h-[120px] min-w-0">
          <ResponsiveContainer
            width="100%"
            height="100%"
          >
            <AreaChart
              data={data}
              margin={{
                top: 4,
                right: 0,
                bottom: 0,
                left: 0,
              }}
            >
              <defs>
                <linearGradient
                  id="rev-fill"
                  x1="0"
                  y1="0"
                  x2="0"
                  y2="1"
                >
                  <stop
                    offset="0%"
                    stopColor="hsl(255 100% 68%)"
                    stopOpacity={0.35}
                  />

                  <stop
                    offset="100%"
                    stopColor="hsl(255 100% 68%)"
                    stopOpacity={0}
                  />
                </linearGradient>
              </defs>

              <YAxis
                hide
                domain={[
                  'dataMin',
                  'dataMax',
                ]}
              />

              <Tooltip
                cursor={{
                  stroke:
                    'hsl(255 100% 68%)',
                  strokeWidth: 1,
                  strokeDasharray:
                    '4 4',
                }}
                contentStyle={{
                  background:
                    'hsl(232 26% 8%)',
                  border:
                    '1px solid hsl(234 18% 15%)',
                  borderRadius: 12,
                  fontSize: 12,
                  color: '#fff',
                  boxShadow:
                    '0 8px 30px -8px rgba(0,0,0,0.6)',
                }}
                labelStyle={{
                  display: 'none',
                }}
                formatter={(v) => [
                  currency(v),
                  'Выручка',
                ]}
              />

              <Area
                type="monotone"
                dataKey="value"
                stroke="hsl(255 100% 68%)"
                strokeWidth={2}
                fill="url(#rev-fill)"
                dot={false}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}