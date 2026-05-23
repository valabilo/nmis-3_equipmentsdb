import { STATUS_STYLES } from '../../constants/sheets';
import type { ReactNode } from 'react';

export function Badge({ children, tone }: { children: ReactNode; tone?: string }) {
  const style = tone ? STATUS_STYLES[tone] : undefined;
  return (
    <span
      className={`inline-flex items-center whitespace-nowrap rounded-full px-2 py-1 text-xs font-medium ring-1 ring-inset ${
        style ?? 'bg-zinc-100 text-zinc-700 ring-zinc-500/10 dark:bg-zinc-800 dark:text-zinc-200 dark:ring-zinc-700'
      }`}
    >
      {children}
    </span>
  );
}
