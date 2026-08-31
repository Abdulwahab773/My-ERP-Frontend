import { STORAGE_KEYS } from '../constants';
import { API_BASE_URL } from '../store/api/baseApi';
import { idbGet, idbSet } from './idb';
import { isOnline } from './offline';
import { makeOperationId } from './ids';
import { setSyncStatus, describeSync } from './syncStatus';
import { addConflict, isConflictError, conflictPayload } from './conflicts';
import { replaceCachedId, upsertCachedNote } from '../features/notes/notesCache';
import { upsertFinanceRecord, removeFinanceRecord } from '../features/finance/financeCache';

const BLOCKED = new Set(['vault', 'secrets']);
const ALLOWED = new Set(['notes', 'income', 'expenses']);

async function readQueue() {
  return (await idbGet(STORAGE_KEYS.OFFLINE_QUEUE)) || [];
}

async function writeQueue(queue) {
  await idbSet(STORAGE_KEYS.OFFLINE_QUEUE, queue);
}

async function readFailed() {
  return (await idbGet(STORAGE_KEYS.FAILED_QUEUE)) || [];
}

async function writeFailed(queue) {
  await idbSet(STORAGE_KEYS.FAILED_QUEUE, queue);
}

export async function enqueueMutation(mutation) {
  if (BLOCKED.has(mutation.module)) {
    throw new Error('Sensitive secrets cannot be queued offline');
  }
  if (!ALLOWED.has(mutation.module)) {
    throw new Error('This module cannot be queued offline');
  }

  const queue = await readQueue();
  const operationId = mutation.operationId || mutation.body?.idempotencyKey || makeOperationId();
  const body = mutation.body
    ? { ...mutation.body, idempotencyKey: mutation.body.idempotencyKey || operationId }
    : mutation.body;

  const tempId = mutation.tempId || '';
  if (tempId && (mutation.type === 'create' || mutation.type === 'update')) {
    const existing = queue.find((item) => item.module === mutation.module && item.type === 'create' && item.tempId === tempId);
    if (existing) {
      existing.body = { ...existing.body, ...body };
      existing.updatedAt = new Date().toISOString();
      await writeQueue(queue);
      await refreshStatus({ offline: !isOnline(), pending: queue.length });
      return existing;
    }
  }

  const next = queue.filter((item) => {
    if (mutation.type === 'update' && item.type === 'update' && item.recordId === mutation.recordId && item.module === mutation.module) {
      return false;
    }
    if (mutation.module === 'notes' && mutation.type === 'update' && item.type === 'update' && item.noteId === mutation.noteId) {
      return false;
    }
    return true;
  });

  const entry = {
    ...mutation,
    body,
    operationId,
    recordId: mutation.recordId || mutation.noteId || mutation.tempId,
    createdAt: mutation.createdAt || new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    attempts: mutation.attempts || 0,
  };
  next.push(entry);
  await writeQueue(next);
  await refreshStatus({ offline: !isOnline(), pending: next.length });
  return entry;
}

async function api(path, { method = 'GET', body } = {}) {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    method,
    credentials: 'include',
    headers: {
      Accept: 'application/json',
      ...(body ? { 'Content-Type': 'application/json' } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    const error = new Error(payload.message || 'Sync failed');
    error.status = response.status;
    error.data = payload;
    throw error;
  }
  return payload;
}

async function refreshStatus({ offline, syncing, pending, failed } = {}) {
  const queue = pending == null ? (await readQueue()).length : pending;
  const failedCount = failed == null ? (await readFailed()).length : failed;
  const { state, label } = describeSync({
    offline: offline ?? !isOnline(),
    syncing,
    pending: queue,
    failed: failedCount,
  });
  await setSyncStatus({
    online: !(offline ?? !isOnline()),
    state,
    label,
    pending: queue,
    failed: failedCount,
    lastSyncedAt: state === 'synced' ? new Date().toISOString() : undefined,
  });
}

export async function flushQueue(userId) {
  if (!isOnline()) {
    const queue = await readQueue();
    await refreshStatus({ offline: true, pending: queue.length });
    return { flushed: 0, remaining: queue.length, reason: 'offline' };
  }

  await refreshStatus({ syncing: true, offline: false });
  const queue = await readQueue();
  const remaining = [];
  const failed = await readFailed();
  const newlyFailed = [];
  const tempMap = {};
  let flushed = 0;

  for (const item of queue) {
    if (!ALLOWED.has(item.module)) continue;
    try {
      if (item.module === 'notes') await replayNote(item, tempMap, userId);
      else await replayFinance(item, tempMap, userId);
      flushed += 1;
    } catch (error) {
      if (isConflictError(error)) {
        const payload = conflictPayload(error);
        await addConflict({
          module: item.module,
          recordId: item.recordId || item.noteId,
          message: error.message,
          server: payload.server,
          client: payload.client || item.body,
        });
        continue;
      }
      const nextAttempt = { ...remapQueued(item, tempMap), attempts: (item.attempts || 0) + 1 };
      if (nextAttempt.attempts >= 4) {
        const dead = { ...nextAttempt, failedAt: new Date().toISOString(), lastError: error.message };
        failed.push(dead);
        newlyFailed.push(dead);
      } else {
        remaining.push(nextAttempt);
      }
    }
  }

  await writeQueue(remaining);
  await writeFailed(failed);
  if (newlyFailed.length > 0) {
    try {
      await api('/notifications/sync-failure', { method: 'POST' });
    } catch {
      /* local failed queue still holds the work */
    }
  }
  await refreshStatus({
    syncing: false,
    offline: false,
    pending: remaining.length,
    failed: failed.length,
  });
  return { flushed, remaining: remaining.length, failed: failed.length };
}

export async function retryFailed(userId) {
  const failed = await readFailed();
  if (!failed.length) return { flushed: 0, remaining: 0 };
  const queue = await readQueue();
  await writeQueue([...queue, ...failed.map((item) => ({ ...item, attempts: 0 }))]);
  await writeFailed([]);
  return flushQueue(userId);
}

export async function listFailedQueue() {
  return readFailed();
}

function remapQueued(item, tempMap) {
  const recordId = tempMap[item.recordId] || tempMap[item.noteId] || item.recordId || item.noteId;
  return { ...item, recordId, noteId: recordId, tempId: tempMap[item.tempId] ? undefined : item.tempId };
}

async function replayNote(item, tempMap, userId) {
  if (item.type === 'create') {
    const payload = await api('/notes', { method: 'POST', body: item.body });
    const note = payload.data?.note;
    if (note && item.tempId) {
      tempMap[item.tempId] = note.id;
      await replaceCachedId(userId, item.tempId, note);
    } else if (note) {
      await upsertCachedNote(userId, note);
    }
    return;
  }

  const noteId = tempMap[item.noteId] || tempMap[item.recordId] || item.noteId || item.recordId;
  if (!noteId || String(noteId).startsWith('offline-')) {
    throw new Error('Waiting for create');
  }

  if (item.type === 'update') {
    const payload = await api(`/notes/${noteId}`, { method: 'PATCH', body: item.body });
    if (payload.data?.note) await upsertCachedNote(userId, payload.data.note);
    return;
  }

  if (item.type === 'delete') {
    await api(`/notes/${noteId}`, { method: 'DELETE' });
    return;
  }

  await api(`/notes/${noteId}/${item.type}`, { method: 'POST' });
}

async function replayFinance(item, tempMap, userId) {
  const kind = item.module === 'income' ? 'income' : 'expenses';
  const path = item.module === 'income' ? '/finance/income' : '/finance/expenses';
  const key = item.module === 'income' ? 'income' : 'expense';

  if (item.type === 'create') {
    const payload = await api(path, { method: 'POST', body: item.body });
    const row = payload.data?.[key] || payload.data?.item;
    if (row && item.tempId) {
      tempMap[item.tempId] = row.id;
      await removeFinanceRecord(userId, kind, item.tempId);
      await upsertFinanceRecord(userId, kind, row);
    } else if (row) {
      await upsertFinanceRecord(userId, kind, row);
    }
    return;
  }

  const recordId = tempMap[item.recordId] || item.recordId;
  if (!recordId || String(recordId).startsWith('offline-')) {
    throw new Error('Waiting for create');
  }

  if (item.type === 'update') {
    const payload = await api(`${path}/${recordId}`, { method: 'PATCH', body: item.body });
    const row = payload.data?.[key] || payload.data?.item;
    if (row) await upsertFinanceRecord(userId, kind, row);
    return;
  }

  if (item.type === 'delete') {
    await api(`${path}/${recordId}`, { method: 'DELETE' });
    await removeFinanceRecord(userId, kind, recordId);
  }
}
