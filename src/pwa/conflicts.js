import { STORAGE_KEYS } from '../constants';
import { idbGet, idbSet } from './idb';

export async function listConflicts() {
  return (await idbGet(STORAGE_KEYS.CONFLICTS)) || [];
}

export async function addConflict(conflict) {
  const rows = await listConflicts();
  const next = [
    {
      id: conflict.id || `conflict-${Date.now()}`,
      module: conflict.module,
      recordId: conflict.recordId,
      message: conflict.message || 'This record changed while you were offline.',
      server: conflict.server || null,
      client: conflict.client || null,
      createdAt: new Date().toISOString(),
    },
    ...rows.filter((row) => !(row.module === conflict.module && row.recordId === conflict.recordId)),
  ];
  await idbSet(STORAGE_KEYS.CONFLICTS, next);
  return next;
}

export async function removeConflict(id) {
  const rows = await listConflicts();
  const next = rows.filter((row) => row.id !== id);
  await idbSet(STORAGE_KEYS.CONFLICTS, next);
  return next;
}

export function isConflictError(error) {
  return error?.status === 409 || error?.data?.code === 'CONFLICT';
}

export function conflictPayload(error) {
  return error?.data?.data || error?.data || {};
}
