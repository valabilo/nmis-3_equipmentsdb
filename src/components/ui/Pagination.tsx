import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';
import { Button } from './Button';

export function Pagination({
  pageIndex,
  pageCount,
  onPrevious,
  onNext,
}: {
  pageIndex: number;
  pageCount: number;
  onPrevious: () => void;
  onNext: () => void;
}) {
  return (
    <div className="flex flex-col gap-3 border-t border-zinc-200 px-5 py-4 sm:flex-row sm:items-center sm:justify-between dark:border-zinc-800">
      <p className="text-sm text-zinc-500">
        Page <span className="font-medium text-zinc-900 dark:text-zinc-100">{pageIndex + 1}</span> of {Math.max(pageCount, 1)}
      </p>
      <div className="grid grid-cols-2 gap-2 sm:flex">
        <Button variant="secondary" onClick={onPrevious} disabled={pageIndex === 0} icon={<ChevronLeftIcon />}>
          Previous
        </Button>
        <Button variant="secondary" onClick={onNext} disabled={pageIndex + 1 >= pageCount} icon={<ChevronRightIcon />}>
          Next
        </Button>
      </div>
    </div>
  );
}
