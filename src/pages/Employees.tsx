import { PencilSquareIcon, PlusIcon } from '@heroicons/react/24/outline';
import type { ColumnDef } from '@tanstack/react-table';
import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { EmployeeFormModal } from '../components/forms/EmployeeFormModal';
import { DataTable } from '../components/tables/DataTable';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { ExportButton } from '../components/ui/ExportButton';
import { HighlightText } from '../components/ui/HighlightText';
import { SearchBar } from '../components/ui/SearchBar';
import { useDebouncedValue } from '../hooks/useDebouncedValue';
import { useEmployeeMutations, useEmployees } from '../hooks/useEmployees';
import { useEquipments } from '../hooks/useEquipment';
import { exportCsv, exportExcel, mapEmployeeRows } from '../services/export';
import type { Employee, EmployeePayload } from '../types';
import { encodeEmployeeKey, getEquipmentForEmployee } from '../utils/employee';
import { searchEmployees } from '../utils/search';

export function Employees() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const [query, setQuery] = useState(() => searchParams.get('q') ?? '');
  const [editing, setEditing] = useState<Employee | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const debounced = useDebouncedValue(query);
  const { data: employees = [] } = useEmployees();
  const { data: equipment = [] } = useEquipments();
  const mutations = useEmployeeMutations();
  const filtered = searchEmployees(employees, debounced);
  const rows = mapEmployeeRows(filtered);

  useEffect(() => {
    setQuery(searchParams.get('q') ?? '');
  }, [searchParams]);

  const updateQuery = (value: string) => {
    setQuery(value);
    const nextParams = new URLSearchParams(searchParams);
    if (value.trim()) {
      nextParams.set('q', value);
    } else {
      nextParams.delete('q');
    }
    setSearchParams(nextParams, { replace: true });
  };

  const columns = useMemo<ColumnDef<Employee>[]>(
    () => [
      { accessorKey: 'employeeId', header: 'Employee ID', cell: ({ row }) => <span className="font-medium"><HighlightText text={row.original.employeeId} query={query} /></span> },
      { accessorKey: 'name', header: 'Name', cell: ({ row }) => <HighlightText text={row.original.name} query={query} /> },
      { accessorKey: 'position', header: 'Position', cell: ({ row }) => <HighlightText text={row.original.position} query={query} /> },
      { accessorKey: 'status', header: 'Status', cell: ({ row }) => <Badge><HighlightText text={row.original.status} query={query} /></Badge> },
      {
        id: 'assigned',
        header: 'Assigned',
        cell: ({ row }) => getEquipmentForEmployee(equipment, row.original).length,
      },
      {
        id: 'profile',
        header: 'Actions',
        cell: ({ row }) => (
          <div className="flex flex-wrap gap-1" onClick={(event) => event.stopPropagation()}>
            <Button
              variant="ghost"
              className="h-8 px-2"
              aria-label={`Edit ${row.original.name}`}
              icon={<PencilSquareIcon />}
              onClick={() => {
                setEditing(row.original);
                setFormOpen(true);
              }}
            />
          </div>
        ),
      },
    ],
    [equipment, query],
  );

  const submitEmployee = (payload: EmployeePayload) => {
    if (editing) {
      mutations.updateEmployee.mutate({ employee: payload, previousEmployee: editing });
    } else {
      mutations.createEmployee.mutate(payload);
    }
    setFormOpen(false);
  };

  return (
    <div className="page-stack">
      <section className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div className="section-heading">
          <p className="microcopy">Employee Management</p>
          <h2 className="text-2xl font-semibold tracking-tight text-zinc-950 sm:text-3xl dark:text-white">Personnel accountability</h2>
          <p className="text-xs leading-5 text-zinc-500 sm:text-sm">Search personnel, review assigned assets, and prepare individual accountability reports.</p>
        </div>
        <div className="control-row">
          <ExportButton
            onCsv={() => exportCsv('employees.csv', rows)}
            onExcel={() => exportExcel('employees.xlsx', rows, 'Employees')}
            onPdf={() => window.print()}
          />
          <Button icon={<PlusIcon />} onClick={() => { setEditing(null); setFormOpen(true); }}>
            Add employee
          </Button>
        </div>
      </section>
      <Card className="p-3 sm:p-5">
        <SearchBar value={query} onChange={updateQuery} placeholder="Search employees by name, ID, position, status..." />
      </Card>
      <DataTable data={filtered} columns={columns} onRowClick={(employee) => navigate(`/app/employees/${encodeEmployeeKey(employee)}`)} />
      <EmployeeFormModal
        open={formOpen}
        employee={editing}
        loading={mutations.createEmployee.isPending || mutations.updateEmployee.isPending}
        onClose={() => setFormOpen(false)}
        onSubmit={submitEmployee}
      />
    </div>
  );
}
