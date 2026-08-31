import { STORAGE_KEYS } from '../constants';
import { idbGet, idbSet } from './idb';

const listeners = new Set();

const defaultStatus = {
  online: typeof navigator === 'undefined' ? true : navigator.onLine,
  state: 'idle',
  label: 'Synced',
  pending: 0,
  failed: 0,
  lastSyncedAt: null,
};

let current = { ...defaultStatus };

export function getSyncStatus() {
  return current;
}

export function subscribeSyncStatus(listener) {
  listeners.add(listener);
  listener(current);
  return () => listeners.delete(listener);
}

function emit() {
  listeners.forEach((listener) => listener(current));
}

export async function setSyncStatus(patch) {
  current = { ...current, ...patch };
  await idbSet(STORAGE_KEYS.SYNC_STATUS, current);
  emit();
}

export async function hydrateSyncStatus() {
  const stored = await idbGet(STORAGE_KEYS.SYNC_STATUS);
  if (stored) current = { ...defaultStatus, ...stored };
  emit();
  return current;
}

export function describeSync({ offline, syncing, pending, failed } = {}) {
  if (offline) return { state: 'offline', label: pending ? 'Saved offline' : 'Offline' };
  if (syncing) return { state: 'syncing', label: 'Syncing...' };
  if (failed) return { state: 'failed', label: 'Sync failed' };
  return { state: 'synced', label: 'Synced' };
}
