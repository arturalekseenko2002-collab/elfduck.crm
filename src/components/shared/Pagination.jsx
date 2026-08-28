import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function Pagination({ page, pageCount, total, pageSize, onPageChange }) {
  const from = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const to = Math.min(page * pageSize, total);

  const pages = [];
  const start = Math.max(1, page - 2);
  const end = Math.min(pageCount, page + 2);
  for (let i = start; i <= end; i++) pages.push(i);

  return (
    <div className="flex items-center justify-between gap-4 px-4 py-3">
      <div className="text-[12px] text-muted-2">
        {from}–{to} из {total}
      </div>
      <div className="flex items-center gap-1">
        <button
          onClick={() => onPageChange(page - 1)}
          disabled={page <= 1}
          className="inline-flex items-center gap-1 rounded-lg border border-border px-2.5 py-1.5 text-[12px] text-muted-foreground transition-colors hover:text-foreground disabled:opacity-30 disabled:hover:text-muted-foreground"
        >
          <ChevronLeft className="h-3.5 w-3.5" /> Назад
        </button>
        {start > 1 && (
          <>
            <PageBtn n={1} active={page === 1} onClick={() => onPageChange(1)} />
            {start > 2 && <span className="px-1 text-muted-2">…</span>}
          </>
        )}
        {pages.map((p) => (
          <PageBtn key={p} n={p} active={p === page} onClick={() => onPageChange(p)} />
        ))}
        {end < pageCount && (
          <>
            {end < pageCount - 1 && <span className="px-1 text-muted-2">…</span>}
            <PageBtn n={pageCount} active={page === pageCount} onClick={() => onPageChange(pageCount)} />
          </>
        )}
        <button
          onClick={() => onPageChange(page + 1)}
          disabled={page >= pageCount}
          className="inline-flex items-center gap-1 rounded-lg border border-border px-2.5 py-1.5 text-[12px] text-muted-foreground transition-colors hover:text-foreground disabled:opacity-30 disabled:hover:text-muted-foreground"
        >
          Вперёд <ChevronRight className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
}

function PageBtn({ n, active, onClick }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'h-8 min-w-8 rounded-lg px-2 text-[12px] font-medium transition-all',
        active
          ? 'bg-[hsl(255_100%_68%/0.14)] text-foreground shadow-[inset_0_0_0_1px_hsl(255_100%_68%/0.22)]'
          : 'text-muted-foreground hover:bg-[hsl(234_22%_11%/0.6)] hover:text-foreground'
      )}
    >
      {n}
    </button>
  );
}