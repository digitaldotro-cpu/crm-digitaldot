export function formatDate(date: Date | string | null | undefined) {
  if (!date) {
    return '-';
  }

  return new Intl.DateTimeFormat('ro-RO', {
    dateStyle: 'medium'
  }).format(new Date(date));
}

export function formatDateTime(date: Date | string | null | undefined) {
  if (!date) {
    return '-';
  }

  return new Intl.DateTimeFormat('ro-RO', {
    dateStyle: 'medium',
    timeStyle: 'short'
  }).format(new Date(date));
}

export function formatCurrency(value: number | string | null | undefined, currency = 'EUR') {
  if (value === null || value === undefined || value === '') {
    return '-';
  }

  return new Intl.NumberFormat('ro-RO', {
    style: 'currency',
    currency
  }).format(Number(value));
}

export function formatMinutes(minutes: number | null | undefined) {
  if (!minutes) {
    return '0m';
  }

  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;

  return `${hours}h ${rest}m`;
}
