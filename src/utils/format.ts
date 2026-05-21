export function formatCurrency(value: number) {
  return new Intl.NumberFormat('en-PH', {
    style: 'currency',
    currency: 'PHP',
    maximumFractionDigits: 0,
  }).format(value || 0);
}

export function formatDate(value: string | number | Date | null | undefined) {
  if (!value) return 'Unissued';
  const date = parseDate(value);

  if (!date) return String(value);

  return new Intl.DateTimeFormat('en-PH', {
    year: 'numeric',
    month: 'short',
    day: '2-digit',
  }).format(date);
}

function parseDate(value: string | number | Date) {
  if (value instanceof Date) return Number.isNaN(value.getTime()) ? null : value;

  if (typeof value === 'number') {
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? null : date;
  }

  const trimmed = value.trim();
  const direct = new Date(trimmed);
  if (!Number.isNaN(direct.getTime())) return direct;

  const match = trimmed.match(/^(\d{1,2})[/-](\d{1,2})[/-](\d{2,4})$/);
  if (!match) return null;

  const [, first, second, yearPart] = match;
  const year = Number(yearPart.length === 2 ? `20${yearPart}` : yearPart);
  const day = Number(first);
  const month = Number(second) - 1;
  const parsed = new Date(year, month, day);

  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

export function compactNumber(value: number) {
  return new Intl.NumberFormat('en', { notation: 'compact' }).format(value || 0);
}
