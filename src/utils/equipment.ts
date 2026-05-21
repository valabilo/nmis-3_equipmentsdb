import type { Equipment } from '../types';

export function isEquipmentAssigned(item: Equipment) {
  return Boolean(String(item.issuedTo ?? '').trim());
}

export function isEquipmentAvailable(item: Equipment) {
  return !isEquipmentAssigned(item);
}

export function getEquipmentValue(item: Equipment) {
  return Number(item.amount || 0);
}
