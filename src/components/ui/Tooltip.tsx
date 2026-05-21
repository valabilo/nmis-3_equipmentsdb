import type { ReactNode } from 'react';

export function Tooltip({ label, children }: { label: string; children: ReactNode }) {
  return (
    <span className="group relative inline-flex">
      {children}
      <span className="pointer-events-none absolute bottom-full left-1/2 z-20 mb-2 -translate-x-1/2 rounded-md border border-zinc-800 bg-zinc-950 px-2 py-1 text-xs text-white opacity-0 transition group-hover:opacity-100 dark:border-zinc-200 dark:bg-white dark:text-zinc-950">
        {label}
      </span>
    </span>
  );
}
