import { ArrowDownTrayIcon } from '@heroicons/react/24/outline';
import type { ColumnDef } from '@tanstack/react-table';
import { useMemo, useRef } from 'react';
import { Link, useParams } from 'react-router-dom';
import { AccountabilityReport } from '../components/print/AccountabilityReport';
import { DataTable } from '../components/tables/DataTable';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { ExportButton } from '../components/ui/ExportButton';
import { PrintButton } from '../components/ui/PrintButton';
import { useEmployees } from '../hooks/useEmployees';
import { useEquipments } from '../hooks/useEquipment';
import { exportCsv, exportEquipmentPdf, exportExcel, mapEquipmentRows } from '../services/export';
import type { Equipment } from '../types';
import { findEmployeeByKey, getEmployeeProfileKey, getEquipmentForEmployee } from '../utils/employee';
import { getEquipmentValue, isEquipmentAssigned } from '../utils/equipment';
import { formatCurrency, formatDate } from '../utils/format';

export function EmployeeDetails() {
  const { employeeId } = useParams();
  const printRef = useRef<HTMLDivElement>(null);
  const { data: employees = [], isLoading: employeesLoading } = useEmployees();
  const { data: equipment = [], isLoading: equipmentLoading } = useEquipments();
  const employee = findEmployeeByKey(employees, employeeId);
  const assigned = getEquipmentForEmployee(equipment, employee);
  const totalValue = assigned.reduce((sum, item) => sum + getEquipmentValue(item), 0);
  const rows = mapEquipmentRows(assigned);
  const profileKey = employee ? getEmployeeProfileKey(employee) : 'employee';

  const columns = useMemo<ColumnDef<Equipment>[]>(
    () => [
      { accessorKey: 'propertyNo', header: 'Property No.' },
      { accessorKey: 'category', header: 'Category' },
      { accessorKey: 'itemDescription', header: 'Description' },
      { accessorKey: 'accountabilityNo', header: 'Reference' },
      { accessorKey: 'dateIssued', header: 'Date', cell: ({ row }) => formatDate(row.original.dateIssued) },
      { accessorKey: 'status', header: 'Status', cell: ({ row }) => <Badge tone={row.original.status}>{row.original.status}</Badge> },
      { accessorKey: 'amount', header: 'Amount', cell: ({ row }) => formatCurrency(row.original.amount) },
    ],
    [],
  );

  if (employeesLoading) {
    return (
      <Card className="p-8 text-center">
        <h2 className="text-xl font-semibold">Loading employee...</h2>
      </Card>
    );
  }

  if (!employee) {
    return (
      <Card className="p-8 text-center">
        <h2 className="text-xl font-semibold">Employee not found</h2>
        <Link to="/app/employees" className="mt-4 inline-flex">
          <Button variant="secondary">Back to employees</Button>
        </Link>
      </Card>
    );
  }

  return (
    <div className="page-stack">
      <section className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
        <div className="section-heading">
          <p className="microcopy">Employee Profile</p>
          <h2 className="text-2xl font-semibold tracking-tight text-zinc-950 sm:text-3xl dark:text-white">{employee.name}</h2>
          <p className="text-xs leading-5 text-zinc-500 sm:text-sm">{employee.position} - {employee.employeeId || profileKey}</p>
        </div>
        <div className="control-row">
          <ExportButton
            onCsv={() => exportCsv(`${profileKey}-equipment.csv`, rows)}
            onExcel={() => exportExcel(`${profileKey}-equipment.xlsx`, rows, profileKey)}
            onPdf={() => exportEquipmentPdf(`${profileKey}-equipment.pdf`, assigned, `${employee.name} Equipment Accountability`)}
          />
          <PrintButton contentRef={printRef} label="Print form" />
          <Button variant="secondary" icon={<ArrowDownTrayIcon />} onClick={() => exportCsv(`${profileKey}-equipment.csv`, rows)}>
            Download CSV
          </Button>
        </div>
      </section>
      <div className="grid grid-cols-2 gap-2.5 sm:gap-5 md:grid-cols-4">
        {[
          ['Total assigned equipments', assigned.length],
          ['Total equipment value', formatCurrency(totalValue)],
          ['Active assignments', assigned.filter(isEquipmentAssigned).length],
          ['Returned items', assigned.filter((item) => item.status === 'Returned').length],
        ].map(([label, value]) => (
          <Card key={label} className="p-4 sm:p-6">
            <p className="microcopy">{label}</p>
            <p className="mt-3 text-2xl font-semibold text-zinc-950 dark:text-white">{equipmentLoading ? 'Loading...' : value}</p>
          </Card>
        ))}
      </div>
      <Card className="p-4 sm:p-7">
        <p className="microcopy">Employee Information</p>
        <div className="mt-5 grid gap-5 md:grid-cols-4">
          <Info label="Employee ID" value={employee.employeeId || profileKey} />
          <Info label="Full Name" value={employee.name} />
          <Info label="Position" value={employee.position} />
          <Info label="Employment Status" value={employee.status} />
        </div>
      </Card>
      <DataTable data={assigned} columns={columns} loading={equipmentLoading} loadingLabel="Loading equipment..." />
      <div className="fixed left-[-10000px] top-0">
        <div ref={printRef}>
          <AccountabilityReport employee={employee} equipment={assigned} />
        </div>
      </div>
    </div>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="microcopy">{label}</p>
      <p className="mt-1 text-sm font-medium text-zinc-950 dark:text-white">{value}</p>
    </div>
  );
}
