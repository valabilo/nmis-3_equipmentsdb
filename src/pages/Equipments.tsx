import { PencilSquareIcon, PlusIcon, TrashIcon } from '@heroicons/react/24/outline';
import type { ColumnDef } from '@tanstack/react-table';
import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Card } from '../components/ui/Card';
import { ConfirmDeleteModal } from '../components/ui/ConfirmDeleteModal';
import { ExportButton } from '../components/ui/ExportButton';
import { HighlightText } from '../components/ui/HighlightText';
import { SearchBar } from '../components/ui/SearchBar';
import { DataTable } from '../components/tables/DataTable';
import { EquipmentFormModal } from '../components/forms/EquipmentFormModal';
import { useDebouncedValue } from '../hooks/useDebouncedValue';
import { useEmployees } from '../hooks/useEmployees';
import { useEquipmentMutations, useEquipments } from '../hooks/useEquipment';
import { exportCsv, exportEquipmentPdf, exportExcel, mapEquipmentRows } from '../services/export';
import { useAppStore } from '../store/appStore';
import type { Equipment } from '../types';
import { findDuplicateEquipment } from '../utils/equipment';
import { formatCurrency, formatDate } from '../utils/format';
import { searchEquipment } from '../utils/search';

export function Equipments() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [query, setQuery] = useState(() => searchParams.get('q') ?? '');
  const [editing, setEditing] = useState<Equipment | null>(null);
  const [deleting, setDeleting] = useState<Equipment | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [selected, setSelected] = useState<Equipment[]>([]);
  const debounced = useDebouncedValue(query);
  const { data: equipment = [], isLoading: equipmentLoading } = useEquipments();
  const { data: employees = [], isLoading: employeesLoading } = useEmployees();
  const mutations = useEquipmentMutations();
  const pushToast = useAppStore((state) => state.pushToast);
  const filtered = searchEquipment(equipment, debounced);
  const exportRows = mapEquipmentRows(selected.length ? selected : filtered);

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

  const columns = useMemo<ColumnDef<Equipment>[]>(
    () => [
      {
        accessorKey: 'propertyNo',
        header: 'Property No.',
        cell: ({ row }) => (
          <span className="font-medium text-zinc-950 dark:text-white">
            <HighlightText text={row.original.propertyNo} query={query} />
          </span>
        ),
      },
      { accessorKey: 'article', header: 'Article', cell: ({ row }) => <HighlightText text={row.original.article} query={query} /> },
      { accessorKey: 'itemDescription', header: 'Description', cell: ({ row }) => <HighlightText text={row.original.itemDescription} query={query} /> },
      { accessorKey: 'issuedTo', header: 'Issued To', cell: ({ row }) => <HighlightText text={row.original.issuedTo || 'Unassigned'} query={query} /> },
      { accessorKey: 'accountabilityNo', header: 'PAR No.', cell: ({ row }) => <HighlightText text={row.original.accountabilityNo} query={query} /> },
      { accessorKey: 'location', header: 'Location', cell: ({ row }) => <HighlightText text={row.original.location} query={query} /> },
      { accessorKey: 'amount', header: 'Amount', cell: ({ row }) => formatCurrency(row.original.amount) },
      { accessorKey: 'dateIssued', header: 'Date Issued', cell: ({ row }) => formatDate(row.original.dateIssued) },
      { accessorKey: 'status', header: 'Status', cell: ({ row }) => <Badge tone={row.original.status}><HighlightText text={row.original.status || 'No Status'} query={query} /></Badge> },
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
    [query],
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
        <SearchBar value={query} onChange={updateQuery} placeholder="Search by property no., employee, description, status, location..." />
      </Card>
      <DataTable data={filtered} columns={columns} enableSelection loading={equipmentLoading} loadingLabel="Loading equipment..." onSelectionChange={setSelected} />
      <EquipmentFormModal
        open={formOpen}
        employees={employees}
        equipment={editing}
        existingEquipment={equipment}
        loading={employeesLoading || mutations.createEquipment.isPending || mutations.updateEquipment.isPending}
        onClose={() => setFormOpen(false)}
        onSubmit={(payload) => {
          const duplicateEquipment = findDuplicateEquipment(equipment, payload);
          if (duplicateEquipment) {
            pushToast({
              title: 'Duplicate equipment found',
              description: `Property no. ${duplicateEquipment.propertyNo} already exists.`,
              tone: 'danger',
            });
            return;
          }

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
