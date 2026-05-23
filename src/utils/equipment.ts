import type { Equipment, EquipmentPayload } from '../types';

export function isEquipmentAssigned(item: Equipment) {
  return Boolean(String(item.issuedTo ?? '').trim());
}

export function isEquipmentAvailable(item: Equipment) {
  return !isEquipmentAssigned(item);
}

export function getEquipmentValue(item: Equipment) {
  return Number(item.amount || 0);
}

export function findDuplicateEquipment(equipment: Equipment[], candidate: EquipmentPayload & { id?: string }) {
  const propertyNo = normalizeEquipmentKey(candidate.propertyNo);
  if (!propertyNo) return undefined;

  return equipment.find((item) => item.id !== candidate.id && normalizeEquipmentKey(item.propertyNo) === propertyNo);
}

function normalizeEquipmentKey(value: string) {
  return value.trim().replace(/\s+/g, ' ').toLocaleLowerCase();
}
