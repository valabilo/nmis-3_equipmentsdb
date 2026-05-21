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
