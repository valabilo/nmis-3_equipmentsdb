import type { ColumnDef } from '@tanstack/react-table';
import { useMemo, useRef, useState } from 'react';
import { AccountabilityReport } from '../components/print/AccountabilityReport';
import { DataTable } from '../components/tables/DataTable';
import { Badge } from '../components/ui/Badge';
import { Card } from '../components/ui/Card';
import { ExportButton } from '../components/ui/ExportButton';
import { PrintButton } from '../components/ui/PrintButton';
import { Select } from '../components/ui/Select';
import { Tabs } from '../components/ui/Tabs';
import { useEmployees } from '../hooks/useEmployees';
import { useEquipments } from '../hooks/useEquipment';
import { exportCsv, exportEquipmentPdf, exportExcel, mapEquipmentRows } from '../services/export';
import type { Equipment, ReportKind } from '../types';
import { findEmployeeByKey, getEmployeeProfileKey, getEquipmentForEmployee } from '../utils/employee';
import { getEquipmentValue } from '../utils/equipment';
import { formatCurrency, formatDate } from '../utils/format';

export function Reports() {
  const [kind, setKind] = useState<ReportKind>('inventory');
  const [employeeId, setEmployeeId] = useState('');
  const printRef = useRef<HTMLDivElement>(null);
  const { data: employees = [], isLoading: employeesLoading } = useEmployees();
  const { data: equipment = [], isLoading: equipmentLoading } = useEquipments();
  const loading = employeesLoading || equipmentLoading;
  const employee = findEmployeeByKey(employees, employeeId);
  const scopedEquipment = employee ? getEquipmentForEmployee(equipment, employee) : equipment;
  const rows = mapEquipmentRows(scopedEquipment);
  const reportTitle = getReportTitle(kind, employee?.name);
  const grouped = useMemo(
    () =>
      Object.entries(
        scopedEquipment.reduce<Record<string, { count: number; value: number }>>((acc, item) => {
          const key = getGroupKey(item, kind);
          acc[key] = acc[key] ?? { count: 0, value: 0 };
          acc[key].count += 1;
          acc[key].value += getEquipmentValue(item);
          return acc;
        }, {}),
      ),
    [kind, scopedEquipment],
  );
  const columns = useMemo<ColumnDef<Equipment>[]>(
    () => [
      { accessorKey: 'propertyNo', header: 'Property No.' },
      { accessorKey: 'article', header: 'Article' },
      { accessorKey: 'itemDescription', header: 'Description' },
      { accessorKey: 'issuedTo', header: 'Issued To', cell: ({ row }) => row.original.issuedTo || 'Unassigned' },
      { accessorKey: 'accountabilityNo', header: 'Reference' },
      { accessorKey: 'dateIssued', header: 'Date', cell: ({ row }) => formatDate(row.original.dateIssued) },
      { accessorKey: 'status', header: 'Status', cell: ({ row }) => <Badge tone={row.original.status}>{row.original.status || 'No status'}</Badge> },
      { accessorKey: 'amount', header: 'Amount', cell: ({ row }) => formatCurrency(row.original.amount) },
    ],
    [],
  );

  return (
    <div className="page-stack">
      <section className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
        <div className="section-heading">
          <p className="microcopy">Reports</p>
          <h2 className="text-2xl font-semibold tracking-tight text-zinc-950 sm:text-3xl dark:text-white">Printable accountability center</h2>
          <p className="text-xs leading-5 text-zinc-500 sm:text-sm">Generate A4-ready summaries for inventory, employees, categories, and accountability forms.</p>
        </div>
      </section>
      <Card className="p-3 sm:p-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <Tabs
            value={kind}
            onChange={setKind}
            tabs={[
              { value: 'inventory', label: 'Inventory' },
              { value: 'employee', label: 'Employee' },
              { value: 'accountability', label: 'Accountability' },
              { value: 'category', label: 'Category' },
            ]}
          />
          <Select value={employeeId} onChange={(event) => setEmployeeId(event.target.value)} className="md:w-80">
            <option value="">All employees</option>
            {employees.map((item) => (
              <option key={getEmployeeProfileKey(item)} value={getEmployeeProfileKey(item)}>
                {item.name}
              </option>
            ))}
          </Select>
        </div>
      </Card>
      <Card className="overflow-visible p-0">
        <div className="flex flex-col gap-3 border-b border-zinc-200 p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5 dark:border-zinc-800">
          <div>
            <p className="microcopy">Report Summary</p>
            <h3 className="mt-1 text-lg font-semibold">{reportTitle}</h3>
          </div>
          <ExportButton
            onCsv={() => exportCsv(`${fileSafe(reportTitle)}.csv`, rows)}
            onExcel={() => exportExcel(`${fileSafe(reportTitle)}.xlsx`, rows, 'Report')}
            onPdf={() => exportEquipmentPdf(`${fileSafe(reportTitle)}.pdf`, scopedEquipment, reportTitle)}
          />
        </div>
        <div className="divide-y divide-zinc-100 dark:divide-zinc-900">
          {loading ? <p className="p-6 text-sm text-zinc-500">Loading report data...</p> : null}
          {!loading && grouped.map(([name, value], index) => (
            <div key={name || `group-${index}`} className="grid gap-2 p-4 sm:gap-3 sm:p-6 md:grid-cols-[1fr_auto_auto]">
              <p className="font-medium">{name || 'Unspecified'}</p>
              <p className="text-sm text-zinc-500">{value.count} records</p>
              <p className="font-medium">{formatCurrency(value.value)}</p>
            </div>
          ))}
          {!loading && !grouped.length ? <p className="p-6 text-sm text-zinc-500">No equipment records found for this report.</p> : null}
        </div>
      </Card>
      <DataTable data={scopedEquipment} columns={columns} loading={loading} loadingLabel="Loading report data..." />
      <div className="overflow-auto rounded-xl border border-zinc-200 bg-zinc-100 p-2 sm:p-5 dark:border-zinc-800 dark:bg-zinc-950">
        <div className="mb-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="microcopy">Print Preview</p>
            <h3 className="mt-1 text-lg font-semibold text-zinc-950 dark:text-white">Accountability form</h3>
          </div>
          <PrintButton contentRef={printRef} label="Print preview" />
        </div>
        {loading ? (
          <p className="rounded-lg bg-white p-6 text-sm text-zinc-500 dark:bg-zinc-900 dark:text-zinc-400">Loading print preview...</p>
        ) : (
          <div ref={printRef} className="print-preview-surface">
            <AccountabilityReport employee={employee} equipment={scopedEquipment} />
          </div>
        )}
      </div>
    </div>
  );
}

function getGroupKey(item: Equipment, kind: ReportKind) {
  if (kind === 'category') return item.category;
  if (kind === 'employee') return item.issuedTo || 'Unassigned';
  if (kind === 'accountability') return item.accountabilityType || 'No accountability type';
  return item.status || 'No status';
}

function getReportTitle(kind: ReportKind, employeeName?: string) {
  const scope = employeeName ? ` - ${employeeName}` : '';
  if (kind === 'category') return `Category Equipment Report${scope}`;
  if (kind === 'employee') return `Employee Equipment Report${scope}`;
  if (kind === 'accountability') return `Accountability Reference Report${scope}`;
  return `Equipment Inventory Report${scope}`;
}

function fileSafe(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
}
