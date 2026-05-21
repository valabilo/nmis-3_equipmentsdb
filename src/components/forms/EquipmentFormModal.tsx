import { useEffect, useState, type ReactNode } from 'react';
import { SHEET_TABS } from '../../constants/sheets';
import type { Employee, Equipment, EquipmentPayload } from '../../types';
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
  status: 'Available',
  location: '',
  remarks: '',
};

export function EquipmentFormModal({
  open,
  employees,
  equipment,
  loading,
  onClose,
  onSubmit,
}: {
  open: boolean;
  employees: Employee[];
  equipment?: Equipment | null;
  loading?: boolean;
  onClose: () => void;
  onSubmit: (payload: EquipmentPayload & { id?: string }) => void;
}) {
  const [form, setForm] = useState<EquipmentPayload & { id?: string }>(emptyEquipment);

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
          <Button onClick={() => onSubmit(form)} disabled={loading || !form.propertyNo || !form.itemDescription}>
            {equipment ? 'Update record' : 'Create record'}
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
          <Input value={form.propertyNo} onChange={(event) => update('propertyNo', event.target.value)} />
        </Field>
        <Field label="Amount">
          <Input type="number" value={form.amount} onChange={(event) => update('amount', Number(event.target.value))} />
        </Field>
        <Field label="Accountability type">
          <Select value={form.accountabilityType} onChange={(event) => update('accountabilityType', event.target.value)}>
            <option>PAR</option>
            <option>ICS</option>
          </Select>
        </Field>
        <Field label="Accountability number">
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
            {['Available', 'Assigned', 'Returned', 'For Repair', 'Disposed'].map((status) => (
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

function Field({ label, children, className = '' }: { label: string; children: ReactNode; className?: string }) {
  return (
    <label className={`field-stack ${className}`}>
      <span className="microcopy">{label}</span>
      {children}
    </label>
  );
}
