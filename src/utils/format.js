export function formatCurrency(value, currency = 'USD', locale = undefined) {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    maximumFractionDigits: 2,
  }).format(Number(value) || 0);
}

export function formatDate(value, options = {}) {
  if (!value) return '—';
  return new Intl.DateTimeFormat(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    ...options,
  }).format(new Date(value));
}

export function formatDateTime(value) {
  if (!value) return '—';
  return new Intl.DateTimeFormat(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  }).format(new Date(value));
}

export function greetingForHour(date = new Date()) {
  const hour = date.getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
}

export function initials(name = '') {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('');
}

export function clsx(...values) {
  return values.flat().filter(Boolean).join(' ');
}

export function formatPercent(value, digits = 1) {
  const amount = Number(value) || 0;
  const prefix = amount > 0 ? '+' : '';
  return `${prefix}${amount.toFixed(digits)}%`;
}

export function todayIso() {
  const date = new Date();
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

export function currentMonthKey(date = new Date()) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
}

export function shiftMonthKey(monthKey, delta) {
  const [year, month] = String(monthKey).split('-').map(Number);
  const date = new Date(year, month - 1 + delta, 1);
  return currentMonthKey(date);
}

export function monthLabel(monthKey) {
  const [year, month] = String(monthKey).split('-').map(Number);
  if (!year || !month) return monthKey;
  return new Date(year, month - 1, 1).toLocaleDateString(undefined, { month: 'long', year: 'numeric' });
}

export function historicalMonths(count = 36) {
  const now = currentMonthKey();
  return Array.from({ length: count }, (_, index) => shiftMonthKey(now, -index));
}
