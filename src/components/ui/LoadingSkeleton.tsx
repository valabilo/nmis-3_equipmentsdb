import type { CSSProperties } from 'react';

export function LoadingSkeleton({ rows = 6 }: { rows?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: rows }).map((_, index) => (
        <div
          key={index}
          className="h-12 animate-pulse rounded-lg bg-zinc-100 dark:bg-zinc-900"
          style={{ animationDelay: `${index * 45}ms` }}
        />
      ))}
    </div>
  );
}

export function SkeletonBlock({ className = '', style }: { className?: string; style?: CSSProperties }) {
  return <div className={`animate-pulse rounded-lg bg-zinc-100 dark:bg-zinc-900 ${className}`} style={style} />;
}

export function TableLoadingRows({ rows = 6, columns = 5 }: { rows?: number; columns?: number }) {
  return (
    <>
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <tr key={rowIndex}>
          {Array.from({ length: columns }).map((_, columnIndex) => (
            <td key={columnIndex} className="border-b border-zinc-100 px-3 py-3 sm:px-5 sm:py-4 dark:border-zinc-900">
              <SkeletonBlock className={`h-4 ${columnIndex === 0 ? 'w-28' : columnIndex % 2 ? 'w-20' : 'w-40'}`} />
            </td>
          ))}
        </tr>
      ))}
    </>
  );
}
