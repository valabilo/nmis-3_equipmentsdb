import { matchSorter } from 'match-sorter';
import type { Employee, Equipment } from '../types';

export function searchEquipment(equipment: Equipment[], query: string) {
  if (!query.trim()) return equipment;
  return matchSorter(equipment, query, {
    keys: ['issuedTo', 'propertyNo', 'itemDescription', 'location', 'remarks', 'status', 'article', 'accountabilityNo'],
  });
}

export function searchEmployees(employees: Employee[], query: string) {
  if (!query.trim()) return employees;
  return matchSorter(employees, query, {
    keys: ['name', 'employeeId', 'position', 'status'],
  });
}
