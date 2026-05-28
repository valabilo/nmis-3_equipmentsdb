import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  type ColumnDef,
  type RowSelectionState,
  type SortingState,
  type VisibilityState,
} from '@tanstack/react-table';
import { ChevronDownIcon, ChevronUpDownIcon } from '@heroicons/react/24/outline';
import { useMemo, useState } from 'react';
import { Pagination } from '../ui/Pagination';
import { SkeletonBlock, TableLoadingRows } from '../ui/LoadingSkeleton';

type DataTableProps<T> = {
  data: T[];
  columns: ColumnDef<T>[];
  globalFilter?: string;
  enableSelection?: boolean;
  loading?: boolean;
  noWrapCells?: boolean;
  onSelectionChange?: (rows: T[]) => void;
  onRowClick?: (row: T) => void;
};

export function DataTable<T>({
  data,
  columns,
  globalFilter = '',
  enableSelection,
  loading,
  noWrapCells,
  onSelectionChange,
  onRowClick,
}: DataTableProps<T>) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});

  const selectionColumn = useMemo<ColumnDef<T>>(
    () => ({
      id: 'select',
      header: ({ table }) => (
        <input
          aria-label="Select all rows"
          type="checkbox"
          checked={table.getIsAllPageRowsSelected()}
          onChange={table.getToggleAllPageRowsSelectedHandler()}
          className="size-4 rounded border-zinc-300"
        />
      ),
      cell: ({ row }) => (
        <input
          aria-label="Select row"
          type="checkbox"
          checked={row.getIsSelected()}
          onChange={row.getToggleSelectedHandler()}
          className="size-4 rounded border-zinc-300"
        />
      ),
      size: 42,
    }),
    [],
  );

  const table = useReactTable({
    data,
    columns: enableSelection ? [selectionColumn, ...columns] : columns,
    state: { sorting, globalFilter, rowSelection, columnVisibility },
    onSortingChange: setSorting,
    onRowSelectionChange: (updater) => {
      setRowSelection(updater);
      window.setTimeout(() => onSelectionChange?.(table.getSelectedRowModel().rows.map((row) => row.original)), 0);
    },
    onColumnVisibilityChange: setColumnVisibility,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: { pagination: { pageSize: 10 } },
  });

  return (
    <div className="min-w-0 overflow-hidden rounded-xl border border-zinc-200 bg-white/80 dark:border-zinc-800 dark:bg-zinc-950/60">
      <div className="flex flex-col gap-3 border-b border-zinc-200 px-3 py-3 sm:flex-row sm:flex-wrap sm:items-center sm:px-5 sm:py-4 dark:border-zinc-800">
        {loading ? <SkeletonBlock className="h-5 w-24" /> : <span className="shrink-0 text-sm text-zinc-500">{`${data.length} records`}</span>}
        <div className="flex max-w-full flex-wrap gap-1.5 sm:ml-auto">
          {table
            .getAllLeafColumns()
            .filter((column) => column.id !== 'select')
            .slice(0, 8)
            .map((column, index) => (
              <button
                key={column.id || `column-${index}`}
                type="button"
                onClick={column.getToggleVisibilityHandler()}
                className={`max-w-32 truncate rounded-md px-2 py-1 text-xs transition ${
                  column.getIsVisible()
                    ? 'bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-200'
                    : 'text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200'
                }`}
              >
                {column.id}
              </button>
            ))}
        </div>
      </div>
      <div className="max-w-full overflow-auto thin-scrollbar">
        <table className="min-w-[920px] border-separate border-spacing-0 text-left text-sm">
          <thead className="sticky top-0 z-10 bg-zinc-50/95 backdrop-blur dark:bg-zinc-900/95">
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header, index) => (
                  <th
                    key={header.id}
                    className={`whitespace-nowrap border-b border-zinc-200 px-3 py-3 text-xs font-medium uppercase text-zinc-500 sm:px-5 sm:py-3.5 dark:border-zinc-800 ${
                      index === 0 ? 'sticky left-0 z-20 bg-zinc-50/95 dark:bg-zinc-900/95' : ''
                    }`}
                    style={{ width: header.getSize() }}
                  >
                    {header.isPlaceholder ? null : (
                      <button
                        type="button"
                        onClick={header.column.getToggleSortingHandler()}
                        className="inline-flex max-w-40 items-center gap-1 whitespace-nowrap text-left"
                      >
                        {flexRender(header.column.columnDef.header, header.getContext())}
                        {header.column.getIsSorted() ? (
                          <ChevronDownIcon className={`size-3 ${header.column.getIsSorted() === 'desc' ? '' : 'rotate-180'}`} />
                        ) : (
                          <ChevronUpDownIcon className="size-3 text-zinc-400" />
                        )}
                      </button>
                    )}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody>
            {loading ? (
              <TableLoadingRows rows={8} columns={table.getVisibleLeafColumns().length} />
            ) : null}
            {!loading && table.getRowModel().rows.map((row) => (
              <tr
                key={row.id}
                tabIndex={onRowClick ? 0 : undefined}
                className={`group hover:bg-zinc-50/90 dark:hover:bg-zinc-900/60 ${onRowClick ? 'cursor-pointer focus:outline-none focus-visible:bg-zinc-50 focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-zinc-300 dark:focus-visible:bg-zinc-900 dark:focus-visible:ring-zinc-700' : ''}`}
                onClick={() => onRowClick?.(row.original)}
                onKeyDown={(event) => {
                  if (!onRowClick || (event.key !== 'Enter' && event.key !== ' ')) return;
                  event.preventDefault();
                  onRowClick(row.original);
                }}
              >
                {row.getVisibleCells().map((cell, index) => {
                  const isDescription = cell.column.id === 'itemDescription';
                  const renderedCell = flexRender(cell.column.columnDef.cell, cell.getContext());

                  return (
                    <td
                      key={cell.id}
                      className={`max-w-[28rem] border-b border-zinc-100 px-3 py-3 align-middle leading-6 text-zinc-700 sm:px-5 sm:py-4 dark:border-zinc-900 dark:text-zinc-200 ${
                        isDescription ? 'w-80 overflow-hidden whitespace-normal' : noWrapCells ? 'whitespace-nowrap' : 'whitespace-normal break-words'
                      } ${index === 0 ? 'sticky left-0 bg-white group-hover:bg-zinc-50 dark:bg-zinc-950 dark:group-hover:bg-zinc-900' : ''}`}
                    >
                      {isDescription ? (
                        <div className="line-clamp-3 max-w-80 break-words leading-5" title={String(cell.getValue() ?? '')}>
                          {renderedCell}
                        </div>
                      ) : (
                        renderedCell
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {!loading ? (
        <Pagination
          pageIndex={table.getState().pagination.pageIndex}
          pageCount={table.getPageCount()}
          onPrevious={() => table.previousPage()}
          onNext={() => table.nextPage()}
        />
      ) : null}
    </div>
  );
}
