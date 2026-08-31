/**
 * Offline helpers for owned records. Vault secrets are never queued or cached.
 */
export function isOnline() {
  return typeof navigator === 'undefined' ? true : navigator.onLine;
}

export function isNetworkError(error) {
  return error?.status === 'FETCH_ERROR'
    || error?.status === 'TIMEOUT_ERROR'
    || error?.originalStatus === 0
    || error?.error === 'TypeError: Failed to fetch';
}

export function subscribeToConnectivity(onChange) {
  const notify = () => onChange(isOnline());
  window.addEventListener('online', notify);
  window.addEventListener('offline', notify);
  return () => {
    window.removeEventListener('online', notify);
    window.removeEventListener('offline', notify);
  };
}
