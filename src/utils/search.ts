import type { Employee, Equipment } from '../types';

export function searchEquipment(equipment: Equipment[], query: string) {
  const tokens = getSearchTokens(query);
  if (!tokens.length) return equipment;

  return equipment.filter((item) =>
    tokens.every((token) =>
      getSearchText([
        item.issuedTo,
        item.propertyNo,
        item.itemDescription,
        item.location,
        item.remarks,
        item.status,
        item.article,
        item.accountabilityNo,
        item.category,
      ]).includes(token),
    ),
  );
}

export function searchEmployees(employees: Employee[], query: string) {
  const tokens = getSearchTokens(query);
  if (!tokens.length) return employees;

  return employees.filter((employee) =>
    tokens.every((token) => getSearchText([employee.name, employee.employeeId, employee.position, employee.status]).includes(token)),
  );
}

function getSearchTokens(query: string) {
  return normalizeSearchText(query).split(' ').filter(Boolean);
}

function getSearchText(values: unknown[]) {
  return normalizeSearchText(values.join(' '));
}

function normalizeSearchText(value: unknown) {
  return String(value ?? '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
}
