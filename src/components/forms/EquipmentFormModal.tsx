import { useEffect, useState, type ReactNode } from 'react';
import { EQUIPMENT_STATUSES, SHEET_TABS } from '../../constants/sheets';
import type { Employee, Equipment, EquipmentPayload } from '../../types';
import { findDuplicateEquipment } from '../../utils/equipment';
import { Button } from '../ui/Button';
import { Input, Textarea } from '../ui/Input';
import { Modal } from '../ui/Modal';
import { Select } from '../ui/Select';

const emptyEquipment: EquipmentPayload = {
  category: 'PPE ACCOUNTABILITY',
  article: '',
  propertyNo: '',
  itemDescription: '',
  amount: 0,
  accountabilityNo: '',
  accountabilityType: 'PAR',
  issuedTo: '',
  dateIssued: '',
  status: 'Existing',
  location: '',
  remarks: '',
};

type EquipmentFormState = Omit<EquipmentPayload, 'amount'> & {
  id?: string;
  amount: number | '';
};

export function EquipmentFormModal({
  open,
  employees,
  equipment,
  existingEquipment = [],
  loading,
  onClose,
  onSubmit,
}: {
  open: boolean;
  employees: Employee[];
  equipment?: Equipment | null;
  existingEquipment?: Equipment[];
  loading?: boolean;
  onClose: () => void;
  onSubmit: (payload: EquipmentPayload & { id?: string }) => void;
}) {
  const [form, setForm] = useState<EquipmentFormState>(emptyEquipment);
  const duplicateEquipment = findDuplicateEquipment(existingEquipment, form);
  const isDuplicate = Boolean(duplicateEquipment);

  useEffect(() => {
    setForm(equipment ? { ...equipment } : emptyEquipment);
  }, [equipment, open]);

  const update = (field: keyof typeof form, value: string | number) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  return (
    <Modal
      open={open}
      title={equipment ? 'Edit equipment' : 'Add equipment'}
      onClose={onClose}
      footer={
        <div className="flex justify-end gap-3">
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button loading={loading} onClick={() => onSubmit(normalizeEquipment(form))} disabled={!form.propertyNo || !form.itemDescription || isDuplicate}>
            {loading ? 'Saving...' : equipment ? 'Update record' : 'Create record'}
          </Button>
        </div>
      }
    >
      <div className="grid gap-5 md:grid-cols-2">
        <Field label="Category">
          <Select value={form.category} onChange={(event) => update('category', event.target.value)}>
            {SHEET_TABS.equipment.map((category) => (
              <option key={category}>{category}</option>
            ))}
          </Select>
        </Field>
        <Field label="Article">
          <Input value={form.article} onChange={(event) => update('article', event.target.value)} />
        </Field>
        <Field label="Property number">
          <Input
            value={form.propertyNo}
            onChange={(event) => update('propertyNo', event.target.value)}
            aria-invalid={isDuplicate}
            className={isDuplicate ? 'border-rose-300 focus:border-rose-400 focus:ring-rose-500/10 dark:border-rose-800 dark:focus:border-rose-700' : ''}
          />
          {duplicateEquipment ? (
            <span className="text-xs leading-5 text-rose-600 dark:text-rose-400">
              Equipment with property no. {duplicateEquipment.propertyNo} already exists.
            </span>
          ) : null}
        </Field>
        <Field label="Amount">
          <Input
            type="number"
            inputMode="decimal"
            className="no-number-spinner"
            value={form.amount}
            onChange={(event) => update('amount', event.target.value === '' ? '' : Number(event.target.value))}
          />
        </Field>
        <Field label="Reference type">
          <Select value={form.accountabilityType} onChange={(event) => update('accountabilityType', event.target.value)}>
            <option>PAR</option>
            <option>ICS</option>
          </Select>
        </Field>
        <Field label="PAR No.">
          <Input value={form.accountabilityNo} onChange={(event) => update('accountabilityNo', event.target.value)} />
        </Field>
        <Field label="Issued to">
          <Select value={form.issuedTo} onChange={(event) => update('issuedTo', event.target.value)}>
            <option value="">Unassigned</option>
            {employees.map((employee) => (
              <option key={employee.employeeId}>{employee.name}</option>
            ))}
          </Select>
        </Field>
        <Field label="Date issued">
          <Input type="date" value={form.dateIssued} onChange={(event) => update('dateIssued', event.target.value)} />
        </Field>
        <Field label="Status">
          <Select value={form.status} onChange={(event) => update('status', event.target.value)}>
            <option value="">No Status</option>
            {EQUIPMENT_STATUSES.map((status) => (
              <option key={status}>{status}</option>
            ))}
          </Select>
        </Field>
        <Field label="Location">
          <Input value={form.location} onChange={(event) => update('location', event.target.value)} />
        </Field>
        <Field label="Item description" className="md:col-span-2">
          <Textarea value={form.itemDescription} onChange={(event) => update('itemDescription', event.target.value)} />
        </Field>
        <Field label="Remarks" className="md:col-span-2">
          <Textarea value={form.remarks} onChange={(event) => update('remarks', event.target.value)} />
        </Field>
      </div>
    </Modal>
  );
}

function normalizeEquipment(equipment: EquipmentFormState) {
  return {
    ...equipment,
    article: String(equipment.article ?? '').trim(),
    propertyNo: String(equipment.propertyNo ?? '').trim(),
    itemDescription: String(equipment.itemDescription ?? '').trim(),
    accountabilityNo: String(equipment.accountabilityNo ?? '').trim(),
    issuedTo: String(equipment.issuedTo ?? '').trim(),
    dateIssued: String(equipment.dateIssued ?? '').trim(),
    status: String(equipment.status ?? '').trim(),
    location: String(equipment.location ?? '').trim(),
    remarks: String(equipment.remarks ?? '').trim(),
    amount: Number(equipment.amount || 0),
  };
}

function Field({ label, children, className = '' }: { label: string; children: ReactNode; className?: string }) {
  return (
    <label className={`field-stack ${className}`}>
      <span className="microcopy">{label}</span>
      {children}
    </label>
  );
}
