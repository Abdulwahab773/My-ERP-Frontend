import { STORAGE_KEYS } from '../../constants';
import { idbGet, idbSet } from '../../pwa/idb';
import { isOfflineId, makeOfflineId } from '../../pwa/ids';

function key(userId, kind) {
  return `${STORAGE_KEYS.FINANCE_CACHE}.${userId}.${kind}`;
}

function safeRecord(row) {
  if (!row) return null;
  return {
    id: row.id,
    title: row.title,
    amount: row.amount,
    cashAmount: row.cashAmount,
    bankAmount: row.bankAmount,
    category: row.category,
    account: row.account,
    source: row.source || '',
    occurredAt: row.occurredAt,
    note: row.note || '',
    version: row.version || 1,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
    offline: Boolean(row.offline),
  };
}

export async function readFinanceCache(userId, kind) {
  if (!userId) return [];
  return ((await idbGet(key(userId, kind))) || []).map(safeRecord).filter(Boolean);
}

export async function writeFinanceCache(userId, kind, rows) {
  if (!userId) return;
  await idbSet(key(userId, kind), rows.map(safeRecord).filter(Boolean));
}

export async function mergeFinanceCache(userId, kind, incoming) {
  const current = await readFinanceCache(userId, kind);
  const byId = new Map(current.map((row) => [row.id, row]));
  incoming.forEach((row) => {
    const safe = safeRecord(row);
    if (safe) byId.set(safe.id, safe);
  });
  const next = [...byId.values()];
  await writeFinanceCache(userId, kind, next);
  return next;
}

export async function upsertFinanceRecord(userId, kind, row) {
  const safe = safeRecord(row);
  if (!userId || !safe) return row;
  const current = await readFinanceCache(userId, kind);
  await writeFinanceCache(userId, kind, [safe, ...current.filter((item) => item.id !== safe.id)]);
  return safe;
}

export async function removeFinanceRecord(userId, kind, id) {
  const current = await readFinanceCache(userId, kind);
  await writeFinanceCache(userId, kind, current.filter((item) => item.id !== id));
}

export function makeOfflineFinance(kind, payload) {
  const now = new Date().toISOString();
  return safeRecord({
    id: makeOfflineId(kind),
    title: payload.title,
    amount: payload.amount,
    cashAmount: payload.cashAmount,
    bankAmount: payload.bankAmount,
    category: payload.category || 'Other',
    account: payload.account || (kind === 'income' ? 'bank' : 'cash'),
    source: payload.source || '',
    occurredAt: payload.date || now,
    note: payload.note || '',
    version: 1,
    createdAt: now,
    updatedAt: now,
    offline: true,
  });
}

export function filterFinance(rows, params = {}) {
  return rows.filter((row) => {
    if (params.q && !`${row.title} ${row.note} ${row.category}`.toLowerCase().includes(String(params.q).toLowerCase())) {
      return false;
    }
    if (params.category && row.category !== params.category) return false;
    if (params.account && row.account !== params.account) return false;
    return true;
  });
}

export { isOfflineId };
