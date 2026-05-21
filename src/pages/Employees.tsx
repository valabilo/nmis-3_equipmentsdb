import { ArrowRightIcon } from '@heroicons/react/24/outline';
import type { ColumnDef } from '@tanstack/react-table';
import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { DataTable } from '../components/tables/DataTable';
import { Badge } from '../components/ui/Badge';
import { Card } from '../components/ui/Card';
import { ExportButton } from '../components/ui/ExportButton';
import { SearchBar } from '../components/ui/SearchBar';
import { useDebouncedValue } from '../hooks/useDebouncedValue';
import { useEmployees } from '../hooks/useEmployees';
import { useEquipments } from '../hooks/useEquipment';
import { exportCsv, exportExcel, mapEmployeeRows } from '../services/export';
import type { Employee } from '../types';
import { encodeEmployeeKey, getEquipmentForEmployee } from '../utils/employee';
import { searchEmployees } from '../utils/search';

export function Employees() {
  const [query, setQuery] = useState('');
  const debounced = useDebouncedValue(query);
  const { data: employees = [] } = useEmployees();
  const { data: equipment = [] } = useEquipments();
  const filtered = searchEmployees(employees, debounced);
  const rows = mapEmployeeRows(filtered);

  const columns = useMemo<ColumnDef<Employee>[]>(
    () => [
      { accessorKey: 'employeeId', header: 'Employee ID', cell: ({ row }) => <span className="font-medium">{row.original.employeeId}</span> },
      { accessorKey: 'name', header: 'Name' },
      { accessorKey: 'position', header: 'Position' },
      { accessorKey: 'status', header: 'Status', cell: ({ row }) => <Badge>{row.original.status}</Badge> },
      {
        id: 'assigned',
        header: 'Assigned',
        cell: ({ row }) => getEquipmentForEmployee(equipment, row.original).length,
      },
      {
        id: 'profile',
        header: 'Profile',
        cell: ({ row }) => (
          <Link className="inline-flex items-center gap-2 text-sm font-medium text-zinc-950 dark:text-white" to={`/app/employees/${encodeEmployeeKey(row.original)}`}>
            Open <ArrowRightIcon className="size-4" />
          </Link>
        ),
      },
    ],
    [equipment],
  );

  return (
    <div className="page-stack">
      <section className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div className="section-heading">
          <p className="microcopy">Employee Management</p>
          <h2 className="text-2xl font-semibold tracking-tight text-zinc-950 sm:text-3xl dark:text-white">Personnel accountability</h2>
          <p className="text-xs leading-5 text-zinc-500 sm:text-sm">Search personnel, review assigned assets, and prepare individual accountability reports.</p>
        </div>
        <ExportButton
          onCsv={() => exportCsv('employees.csv', rows)}
          onExcel={() => exportExcel('employees.xlsx', rows, 'Employees')}
          onPdf={() => window.print()}
        />
      </section>
      <Card className="p-3 sm:p-5">
        <SearchBar value={query} onChange={setQuery} placeholder="Search employees by name, ID, position, status..." />
      </Card>
      <DataTable data={filtered} columns={columns} />
    </div>
  );
}
