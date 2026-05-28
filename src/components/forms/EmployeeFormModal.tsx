import { useEffect, useState, type ReactNode } from 'react';
import type { Employee, EmployeePayload } from '../../types';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Modal } from '../ui/Modal';
import { Select } from '../ui/Select';

const emptyEmployee: EmployeePayload = {
  employeeId: '',
  name: '',
  position: '',
  status: 'Active',
};

export function EmployeeFormModal({
  open,
  employee,
  loading,
  onClose,
  onSubmit,
}: {
  open: boolean;
  employee?: Employee | null;
  loading?: boolean;
  onClose: () => void;
  onSubmit: (payload: EmployeePayload) => void;
}) {
  const [form, setForm] = useState<EmployeePayload>(emptyEmployee);

  useEffect(() => {
    setForm(employee ? { ...employee } : emptyEmployee);
  }, [employee, open]);

  const update = (field: keyof EmployeePayload, value: string) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const isValid = Boolean(form.employeeId.trim() && form.name.trim());

  return (
    <Modal
      open={open}
      title={employee ? 'Edit employee' : 'Add employee'}
      onClose={onClose}
      footer={
        <div className="flex justify-end gap-3">
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button loading={loading} onClick={() => onSubmit(trimEmployee(form))} disabled={!isValid}>
            {loading ? 'Saving...' : employee ? 'Update employee' : 'Create employee'}
          </Button>
        </div>
      }
    >
      <div className="grid gap-5 md:grid-cols-2">
        <Field label="Employee ID">
          <Input value={form.employeeId} onChange={(event) => update('employeeId', event.target.value)} />
        </Field>
        <Field label="Status">
          <Select value={form.status} onChange={(event) => update('status', event.target.value)}>
            {['Active', 'Retired', 'Transferred'].map((status) => (
              <option key={status}>{status}</option>
            ))}
          </Select>
        </Field>
        <Field label="Name" className="md:col-span-2">
          <Input value={form.name} onChange={(event) => update('name', event.target.value)} />
        </Field>
        <Field label="Position" className="md:col-span-2">
          <Input value={form.position} onChange={(event) => update('position', event.target.value)} />
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

function trimEmployee(employee: EmployeePayload) {
  return {
    employeeId: String(employee.employeeId ?? '').trim(),
    name: String(employee.name ?? '').trim(),
    position: String(employee.position ?? '').trim(),
    status: String(employee.status ?? '').trim() || 'Active',
  };
}
