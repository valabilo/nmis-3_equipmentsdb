import type { SelectHTMLAttributes } from 'react';

export function Select({ className = '', children, ...props }: SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      className={`h-11 w-full rounded-lg border border-zinc-200 bg-white/80 px-3.5 text-sm text-zinc-950 outline-none transition focus:border-zinc-400 focus:ring-4 focus:ring-zinc-950/5 dark:border-zinc-800 dark:bg-zinc-950/60 dark:text-zinc-50 ${className}`}
      {...props}
    >
      {children}
    </select>
  );
}
