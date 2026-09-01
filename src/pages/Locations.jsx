import React, { useState, useMemo } from 'react';
import { locations } from '@/lib/mockData';
import LocationCard from '@/components/shared/LocationCard';
import { sortOptions } from '@/lib/locationMetrics';
import { usePeriod } from '@/lib/PeriodContext';
import { cn } from '@/lib/utils';

export default function Locations() {
  const { range } = usePeriod();
  const [metric, setMetric] = useState('revenue');
  const days = useMemo(() => {
    if (!range) return null;
    return Math.max(1, Math.round((range.end - range.start) / 86400000));
  }, [range]);
  const rows = [...locations].sort((a, b) => b[metric] - a[metric]);

  return (
    <div className="space-y-5">
      <div className="inline-flex max-w-full items-center gap-0.5 overflow-x-auto rounded-lg border border-border bg-[hsl(232_26%_7%)] p-0.5 no-scrollbar">
        {sortOptions.map((s) => (
          <button
            key={s.key}
            onClick={() => setMetric(s.key)}
            className={cn(
              'shrink-0 whitespace-nowrap rounded-md px-3 py-1.5 text-[12px] font-medium transition-all',
              metric === s.key
                ? 'bg-[hsl(255_100%_68%/0.14)] text-foreground shadow-[inset_0_0_0_1px_hsl(255_100%_68%/0.22)]'
                : 'text-muted-foreground hover:text-foreground'
            )}
          >
            {s.label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {rows.map((l) => (
          <LocationCard key={l.name} metric={metric} location={l} days={days} />
        ))}
      </div>
    </div>
  );
}