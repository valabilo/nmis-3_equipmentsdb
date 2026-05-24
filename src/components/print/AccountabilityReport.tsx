import { useLayoutEffect, useMemo, useRef, useState } from 'react';
import type { Employee, Equipment } from '../../types';
import { formatCurrency, formatDate } from '../../utils/format';

type PrintEntry =
  | { type: 'group'; id: string; employeeName: string; summary: string }
  | { type: 'item'; id: string; item: Equipment };

const PRINT_COLUMNS = {
  propertyNo: 22,
  description: 42,
  accountabilityNo: 18,
  dateIssued: 13,
  status: 13,
  amount: 12,
};
const PRINT_FOOTER_BUFFER = 10;

export function AccountabilityReport({ employee, equipment }: { employee?: Employee; equipment: Equipment[] }) {
  const measurementRef = useRef<HTMLDivElement>(null);
  const assignedEquipment = useMemo(() => (employee ? equipment : equipment.filter((item) => item.issuedTo.trim())), [employee, equipment]);
  const total = assignedEquipment.reduce((sum, item) => sum + Number(item.amount || 0), 0);
  const entries = useMemo(() => getPrintEntries(assignedEquipment, employee), [assignedEquipment, employee]);
  const [pages, setPages] = useState(() => paginateEntriesByEstimate(entries));

  useLayoutEffect(() => {
    setPages(paginateEntriesByEstimate(entries));
  }, [entries]);

  useLayoutEffect(() => {
    const measurement = measurementRef.current;
    if (!measurement) return;

    const firstPage = measurement.querySelector<HTMLElement>('[data-measure-page="first"]');
    const nextPage = measurement.querySelector<HTMLElement>('[data-measure-page="next"]');
    const firstHeader = measurement.querySelector<HTMLElement>('[data-measure-header="first"]');
    const nextHeader = measurement.querySelector<HTMLElement>('[data-measure-header="next"]');
    const firstTable = measurement.querySelector<HTMLElement>('[data-measure-table="first"]');
    const nextTable = measurement.querySelector<HTMLElement>('[data-measure-table="next"]');
    const firstTableHead = measurement.querySelector<HTMLElement>('[data-measure-table="first"] thead');
    const nextTableHead = measurement.querySelector<HTMLElement>('[data-measure-table="next"] thead');
    const firstFooter = measurement.querySelector<HTMLElement>('[data-measure-footer="first"]');
    const nextFooter = measurement.querySelector<HTMLElement>('[data-measure-footer="next"]');

    if (!firstPage || !nextPage || !firstHeader || !nextHeader || !firstTable || !nextTable || !firstTableHead || !nextTableHead || !firstFooter || !nextFooter) return;

    const firstPageStyle = getComputedStyle(firstPage);
    const nextPageStyle = getComputedStyle(nextPage);
    const firstPageVerticalPadding = Number.parseFloat(firstPageStyle.paddingTop || '0') + Number.parseFloat(firstPageStyle.paddingBottom || '0');
    const nextPageVerticalPadding = Number.parseFloat(nextPageStyle.paddingTop || '0') + Number.parseFloat(nextPageStyle.paddingBottom || '0');
    const firstTableMarginTop = Number.parseFloat(getComputedStyle(firstTable).marginTop || '0');
    const nextTableMarginTop = Number.parseFloat(getComputedStyle(nextTable).marginTop || '0');
    const firstTableHeadHeight = firstTableHead.getBoundingClientRect().height;
    const nextTableHeadHeight = nextTableHead.getBoundingClientRect().height;
    const firstLimit =
      firstPage.clientHeight -
      firstPageVerticalPadding -
      firstFooter.getBoundingClientRect().height -
      firstHeader.getBoundingClientRect().height -
      firstTableMarginTop -
      firstTableHeadHeight -
      PRINT_FOOTER_BUFFER;
    const nextLimit =
      nextPage.clientHeight -
      nextPageVerticalPadding -
      nextFooter.getBoundingClientRect().height -
      nextHeader.getBoundingClientRect().height -
      nextTableMarginTop -
      nextTableHeadHeight -
      PRINT_FOOTER_BUFFER;
    const rowHeights = new Map<string, number>();

    measurement.querySelectorAll<HTMLElement>('[data-print-entry-id]').forEach((row) => {
      rowHeights.set(row.dataset.printEntryId ?? '', row.getBoundingClientRect().height);
    });

    const measuredPages = paginateEntriesByHeight(entries, rowHeights, firstLimit, nextLimit);
    setPages((currentPages) => (arePagesEqual(currentPages, measuredPages) ? currentPages : measuredPages));
  }, [entries]);

  return (
    <>
      <div className="print-document">
        {pages.map((page, index) => (
          <section key={`print-page-${index}`} className="print-page bg-white p-10 text-black">
            <main className="print-page-main">
              {index === 0 ? <ReportHeader employee={employee} /> : <ContinuedHeader employee={employee} />}
              <EquipmentTable entries={page} hasEmployee={Boolean(employee)} compact={index > 0} />
            </main>
            <footer className="print-page-footer">
              <span>{index === pages.length - 1 ? `Total Value: ${formatCurrency(total)}` : ''}</span>
              <span>
                Page {index + 1} of {pages.length}
              </span>
            </footer>
          </section>
        ))}
      </div>
      <div ref={measurementRef} className="print-measurement no-print" aria-hidden="true">
        <section className="print-measure-page bg-white text-black" data-measure-page="first">
          <div data-measure-header="first">
            <ReportHeader employee={employee} />
          </div>
          <EquipmentTable entries={entries} hasEmployee={Boolean(employee)} measureTable="first" />
          <footer className="print-page-footer" data-measure-footer="first">
            <span>Total Value: {formatCurrency(total)}</span>
            <span>Page 1 of 1</span>
          </footer>
        </section>
        <section className="print-measure-page bg-white text-black" data-measure-page="next">
          <div data-measure-header="next">
            <ContinuedHeader employee={employee} />
          </div>
          <EquipmentTable entries={[]} hasEmployee={Boolean(employee)} compact measureTable="next" />
          <footer className="print-page-footer" data-measure-footer="next">
            <span />
            <span>Page 1 of 1</span>
          </footer>
        </section>
      </div>
    </>
  );
}

function ReportHeader({ employee }: { employee?: Employee }) {
  return (
    <>
      <div className="text-center">
        <p className="text-xs uppercase">Republic of the Philippines</p>
        <h1 className="mt-2 text-lg font-semibold uppercase">Property Accountability Report</h1>
        <p className="text-xs">Equipment Database Management System</p>
      </div>
      <div className="mt-8 grid grid-cols-2 gap-4 text-sm">
        <p>
          <span className="font-semibold">Employee:</span> {employee?.name ?? 'All Employees'}
        </p>
        <p>
          <span className="font-semibold">Employee ID:</span> {employee?.employeeId ?? 'N/A'}
        </p>
        <p>
          <span className="font-semibold">Position:</span> {employee?.position ?? 'N/A'}
        </p>
        <p>
          <span className="font-semibold">Status:</span> {employee?.status ?? 'N/A'}
        </p>
      </div>
    </>
  );
}

function ContinuedHeader({ employee }: { employee?: Employee }) {
  return (
    <div className="print-continued-header flex items-end justify-between gap-4 border-b border-black pb-2 text-sm">
      <div>
        <p className="text-xs uppercase">Property Accountability Report</p>
        <h2 className="font-semibold">{employee?.name ?? 'All Employees'}</h2>
      </div>
      <p className="text-xs">Continued</p>
    </div>
  );
}

function EquipmentTable({
  entries,
  hasEmployee,
  compact,
  measureTable,
}: {
  entries: PrintEntry[];
  hasEmployee: boolean;
  compact?: boolean;
  measureTable?: 'first' | 'next';
}) {
  return (
    <table className={`print-equipment-table ${compact ? 'mt-5' : 'mt-8'} w-full border-collapse text-xs`} data-measure-table={measureTable}>
      <thead>
        <tr>
          {['Property No.', 'Description', 'PAR No.', 'Date', 'Status', 'Amount'].map((head) => (
            <th key={head} className="whitespace-nowrap border border-black px-2 py-2 text-left font-semibold">
              {head}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {entries.map((entry) =>
          entry.type === 'group' ? (
            <tr key={entry.id} className={hasEmployee ? 'hidden' : ''} data-print-entry-id={entry.id}>
              <td colSpan={6} className="border border-black bg-zinc-100 px-2 py-2 font-semibold">
                <span>{entry.employeeName}</span>
                <span className="float-right font-normal">{entry.summary}</span>
              </td>
            </tr>
          ) : (
            <tr key={entry.id} data-print-entry-id={entry.id}>
              <td className="border border-black px-2 py-2">{entry.item.propertyNo}</td>
              <td className="border border-black px-2 py-2">{entry.item.itemDescription}</td>
              <td className="border border-black px-2 py-2">{entry.item.accountabilityNo}</td>
              <td className="border border-black px-2 py-2">{formatDate(entry.item.dateIssued)}</td>
              <td className="border border-black px-2 py-2">{entry.item.status}</td>
              <td className="border border-black px-2 py-2">{formatCurrency(entry.item.amount)}</td>
            </tr>
          ),
        )}
        {!entries.length ? (
          <tr>
            <td colSpan={6} className="border border-black px-2 py-4 text-center">
              No assigned equipment records found.
            </td>
          </tr>
        ) : null}
      </tbody>
    </table>
  );
}

function getPrintEntries(equipment: Equipment[], employee?: Employee): PrintEntry[] {
  if (employee) {
    return equipment.map((item) => ({ type: 'item', id: item.id, item }));
  }

  return groupEquipmentByEmployee(equipment).flatMap(([employeeName, items]) => [
    {
      type: 'group' as const,
      id: `group-${employeeName}`,
      employeeName,
      summary: `${items.length} item${items.length === 1 ? '' : 's'} | ${formatCurrency(sumEquipmentValue(items))}`,
    },
    ...items.map((item) => ({ type: 'item' as const, id: item.id, item })),
  ]);
}

function paginateEntriesByEstimate(entries: PrintEntry[]) {
  return paginateEntriesByHeight(
    entries,
    new Map(entries.map((entry) => [entry.id, getEstimatedEntryHeight(entry)])),
    660,
    770,
  );
}

function paginateEntriesByHeight(entries: PrintEntry[], rowHeights: Map<string, number>, firstLimit: number, nextLimit: number) {
  const pages: PrintEntry[][] = [];
  let page: PrintEntry[] = [];
  let pageHeight = 0;
  let limit = firstLimit;

  entries.forEach((entry, index) => {
    const nextEntry = entries[index + 1];
    const entryHeight = rowHeights.get(entry.id) ?? getEstimatedEntryHeight(entry);
    const nextEntryHeight = nextEntry ? (rowHeights.get(nextEntry.id) ?? getEstimatedEntryHeight(nextEntry)) : 0;
    const isOrphanedGroup = entry.type === 'group' && nextEntry?.type === 'item' && pageHeight + entryHeight + nextEntryHeight > limit;
    const wouldOverflow = pageHeight + entryHeight > limit;

    if (page.length && (wouldOverflow || isOrphanedGroup)) {
      pages.push(page);
      page = [];
      pageHeight = 0;
      limit = nextLimit;
    }

    page.push(entry);
    pageHeight += entryHeight;
  });

  pages.push(page);
  return pages;
}

function getEstimatedEntryHeight(entry: PrintEntry) {
  if (entry.type === 'group') {
    return 26;
  }

  const item = entry.item;
  const lineCount = Math.max(
    countWrappedLines(item.propertyNo, PRINT_COLUMNS.propertyNo),
    countWrappedLines(item.itemDescription, PRINT_COLUMNS.description),
    countWrappedLines(item.accountabilityNo, PRINT_COLUMNS.accountabilityNo),
    countWrappedLines(formatDate(item.dateIssued), PRINT_COLUMNS.dateIssued),
    countWrappedLines(item.status, PRINT_COLUMNS.status),
    countWrappedLines(formatCurrency(item.amount), PRINT_COLUMNS.amount),
  );

  return lineCount * 16 + 14;
}

function countWrappedLines(value: string, characterWidth: number) {
  const words = String(value || '').split(/(\s+|-)/);
  let lines = 1;
  let currentLine = 0;

  words.forEach((word) => {
    const length = word.length;
    if (!length) return;

    if (currentLine && currentLine + length > characterWidth) {
      lines += 1;
      currentLine = 0;
    }

    currentLine += length;

    while (currentLine > characterWidth) {
      lines += 1;
      currentLine -= characterWidth;
    }
  });

  return lines;
}

function arePagesEqual(first: PrintEntry[][], second: PrintEntry[][]) {
  if (first.length !== second.length) return false;

  return first.every((page, pageIndex) => {
    const nextPage = second[pageIndex];
    if (page.length !== nextPage.length) return false;

    return page.every((entry, entryIndex) => entry.id === nextPage[entryIndex].id);
  });
}

function groupEquipmentByEmployee(equipment: Equipment[]) {
  const groups = equipment.reduce<Record<string, Equipment[]>>((acc, item) => {
    const employeeName = item.issuedTo.trim() || 'Unassigned';
    acc[employeeName] = acc[employeeName] ?? [];
    acc[employeeName].push(item);
    return acc;
  }, {});

  return Object.entries(groups).sort(([first], [second]) => first.localeCompare(second));
}

function sumEquipmentValue(equipment: Equipment[]) {
  return equipment.reduce((sum, item) => sum + Number(item.amount || 0), 0);
}
