import type { EquipmentCategory } from '../types';

export const SHEET_TABS = {
  employees: 'MASTER LIST OF PERSONNEL',
  equipment: [
    'PPE ACCOUNTABILITY',
    'SEMI-EXPENDABLE PROPERTY (SE)',
    'TECHNICAL AND SCIENTIFIC EQUIPMENTS',
    'OFFICE EQUIPMENTS - EXPANDABLES',
    'SUPPLIES AND SEMI-EXPENDABLES/OFFICE EQUIPMENT',
  ] satisfies EquipmentCategory[],
};

export const CATEGORY_LABELS: Record<EquipmentCategory, string> = {
  'PPE ACCOUNTABILITY': 'PPE Accountability',
  'SEMI-EXPENDABLE PROPERTY (SE)': 'Semi-Expendable Property',
  'TECHNICAL AND SCIENTIFIC EQUIPMENTS': 'Technical & Scientific',
  'OFFICE EQUIPMENTS - EXPANDABLES': 'Office Equipments',
  'SUPPLIES AND SEMI-EXPENDABLES/OFFICE EQUIPMENT': 'Supplies & Semi-Expendables',
};

export const STATUS_STYLES: Record<string, string> = {
  Assigned: 'bg-zinc-950 text-white dark:bg-white dark:text-zinc-950',
  Available: 'bg-emerald-50 text-emerald-700 ring-emerald-600/15 dark:bg-emerald-400/10 dark:text-emerald-300',
  Returned: 'bg-sky-50 text-sky-700 ring-sky-600/15 dark:bg-sky-400/10 dark:text-sky-300',
  'For Repair': 'bg-amber-50 text-amber-700 ring-amber-600/15 dark:bg-amber-400/10 dark:text-amber-300',
  Disposed: 'bg-rose-50 text-rose-700 ring-rose-600/15 dark:bg-rose-400/10 dark:text-rose-300',
};
