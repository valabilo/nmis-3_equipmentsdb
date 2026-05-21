import { PencilSquareIcon, PlusIcon, TrashIcon } from '@heroicons/react/24/outline';
import type { ColumnDef } from '@tanstack/react-table';
import { useMemo, useState } from 'react';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Card } from '../components/ui/Card';
import { ConfirmDeleteModal } from '../components/ui/ConfirmDeleteModal';
import { ExportButton } from '../components/ui/ExportButton';
import { SearchBar } from '../components/ui/SearchBar';
import { DataTable } from '../components/tables/DataTable';
import { EquipmentFormModal } from '../components/forms/EquipmentFormModal';
import { useDebouncedValue } from '../hooks/useDebouncedValue';
import { useEmployees } from '../hooks/useEmployees';
import { useEquipmentMutations, useEquipments } from '../hooks/useEquipment';
import { exportCsv, exportEquipmentPdf, exportExcel, mapEquipmentRows } from '../services/export';
import type { Equipment } from '../types';
import { formatCurrency, formatDate } from '../utils/format';
import { searchEquipment } from '../utils/search';

export function Equipments() {
  const [query, setQuery] = useState('');
  const [editing, setEditing] = useState<Equipment | null>(null);
  const [deleting, setDeleting] = useState<Equipment | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [selected, setSelected] = useState<Equipment[]>([]);
  const debounced = useDebouncedValue(query);
  const { data: equipment = [] } = useEquipments();
  const { data: employees = [] } = useEmployees();
  const mutations = useEquipmentMutations();
  const filtered = searchEquipment(equipment, debounced);
  const exportRows = mapEquipmentRows(selected.length ? selected : filtered);

  const columns = useMemo<ColumnDef<Equipment>[]>(
    () => [
      {
        accessorKey: 'propertyNo',
        header: 'Property No.',
        cell: ({ row }) => <span className="font-medium text-zinc-950 dark:text-white">{row.original.propertyNo}</span>,
      },
      { accessorKey: 'article', header: 'Article' },
      { accessorKey: 'itemDescription', header: 'Description' },
      { accessorKey: 'issuedTo', header: 'Issued To', cell: ({ row }) => row.original.issuedTo || 'Unassigned' },
      { accessorKey: 'accountabilityNo', header: 'Accountability' },
      { accessorKey: 'location', header: 'Location' },
      { accessorKey: 'amount', header: 'Amount', cell: ({ row }) => formatCurrency(row.original.amount) },
      { accessorKey: 'dateIssued', header: 'Date Issued', cell: ({ row }) => formatDate(row.original.dateIssued) },
      { accessorKey: 'status', header: 'Status', cell: ({ row }) => <Badge tone={row.original.status}>{row.original.status}</Badge> },
      {
        id: 'actions',
        header: 'Actions',
        cell: ({ row }) => (
          <div className="flex gap-1">
            <Button
              variant="ghost"
              className="h-8 px-2"
              aria-label="Edit"
              icon={<PencilSquareIcon />}
              onClick={() => {
                setEditing(row.original);
                setFormOpen(true);
              }}
            />
            <Button
              variant="ghost"
              className="h-8 px-2 text-rose-600"
              aria-label="Delete"
              icon={<TrashIcon />}
              onClick={() => setDeleting(row.original)}
            />
          </div>
        ),
      },
    ],
    [],
  );

  return (
    <div className="page-stack">
      <section className="flex flex-col gap-3 xl:flex-row xl:items-end xl:justify-between">
        <div className="section-heading">
          <p className="microcopy">Equipment Management</p>
          <h2 className="text-2xl font-semibold tracking-tight text-zinc-950 sm:text-3xl dark:text-white">Inventory registry</h2>
          <p className="max-w-2xl text-xs leading-5 text-zinc-500 sm:text-sm">Manage property cards, assignments, locations, accountability numbers, and exportable reports.</p>
        </div>
        <div className="control-row">
          <ExportButton
            onCsv={() => exportCsv('equipment-inventory.csv', exportRows)}
            onExcel={() => exportExcel('equipment-inventory.xlsx', exportRows, 'Inventory')}
            onPdf={() => exportEquipmentPdf('equipment-inventory.pdf', selected.length ? selected : filtered)}
          />
          <Button icon={<PlusIcon />} onClick={() => { setEditing(null); setFormOpen(true); }}>
            Add equipment
          </Button>
        </div>
      </section>
      <Card className="p-3 sm:p-5">
        <SearchBar value={query} onChange={setQuery} placeholder="Search by property no., employee, description, status, location..." />
      </Card>
      <DataTable data={filtered} columns={columns} enableSelection onSelectionChange={setSelected} />
      <EquipmentFormModal
        open={formOpen}
        employees={employees}
        equipment={editing}
        loading={mutations.createEquipment.isPending || mutations.updateEquipment.isPending}
        onClose={() => setFormOpen(false)}
        onSubmit={(payload) => {
          if (payload.id) {
            mutations.updateEquipment.mutate(payload as Equipment);
          } else {
            mutations.createEquipment.mutate(payload);
          }
          setFormOpen(false);
        }}
      />
      <ConfirmDeleteModal
        open={Boolean(deleting)}
        description={`Delete ${deleting?.propertyNo ?? 'this equipment'}? This removes the row from the connected sheet.`}
        loading={mutations.deleteEquipment.isPending}
        onClose={() => setDeleting(null)}
        onConfirm={() => {
          if (deleting) mutations.deleteEquipment.mutate(deleting.id);
          setDeleting(null);
        }}
      />
    </div>
  );
}
