import type { Employee, Equipment } from '../types';

export function normalizePersonName(value: string | null | undefined) {
  return String(value ?? '')
    .trim()
    .replace(/\s+/g, ' ')
    .toUpperCase();
}

export function getEmployeeProfileKey(employee: Employee) {
  const id = String(employee.employeeId ?? '').trim();
  return id || slugify(employee.name);
}

export function encodeEmployeeKey(employee: Employee) {
  return encodeURIComponent(getEmployeeProfileKey(employee));
}

export function findEmployeeByKey(employees: Employee[], key: string | undefined) {
  const decoded = decodeURIComponent(key ?? '');
  return employees.find((employee) => getEmployeeProfileKey(employee) === decoded);
}

export function getEquipmentForEmployee(equipment: Equipment[], employee?: Employee) {
  if (!employee) return [];
  const employeeName = normalizePersonName(employee.name);
  return equipment.filter((item) => normalizePersonName(item.issuedTo) === employeeName);
}

function slugify(value: string) {
  return normalizePersonName(value)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}
