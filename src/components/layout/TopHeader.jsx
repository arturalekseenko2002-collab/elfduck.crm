import React from 'react';
import PeriodControl from './PeriodControl';

export default function TopHeader({ title, subtitle }) {
  return (
    <header className="sticky top-0 z-20 flex items-center justify-between gap-6 border-b border-border bg-[hsl(234_31%_4%/0.85)] px-7 py-4 backdrop-blur-xl">
      <div className="min-w-0">
        <h2 className="font-heading text-[18px] font-semibold tracking-tight text-foreground">{title}</h2>
        {subtitle && <p className="mt-0.5 text-[12px] text-muted-foreground">{subtitle}</p>}
      </div>
      <PeriodControl />
    </header>
  );
}