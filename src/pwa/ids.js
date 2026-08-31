export function makeOperationId() {
  const rand = Math.random().toString(36).slice(2, 12);
  return `op_${Date.now().toString(36)}_${rand}`;
}

export function isOfflineId(id) {
  return String(id || '').startsWith('offline-');
}

export function makeOfflineId(prefix = 'offline') {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}
