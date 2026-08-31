import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { Button } from '../ui';
import { selectUser } from '../../features/auth/authSlice';
import { flushQueue, retryFailed } from '../../pwa/sync';
import { subscribeSyncStatus } from '../../pwa/syncStatus';
import { isOnline, subscribeToConnectivity } from '../../pwa/offline';
import { listConflicts } from '../../pwa/conflicts';

export function SyncBar({ onOpenConflicts }) {
  const user = useSelector(selectUser);
  const [status, setStatus] = useState({ label: 'Synced', state: 'idle', pending: 0, failed: 0 });
  const [online, setOnline] = useState(isOnline());
  const [conflicts, setConflicts] = useState(0);

  useEffect(() => subscribeToConnectivity(setOnline), []);
  useEffect(() => subscribeSyncStatus(setStatus), []);
  useEffect(() => {
    listConflicts().then((rows) => setConflicts(rows.length));
  }, [status.lastSyncedAt, status.failed]);

  async function retry() {
    if (!user?.id) return;
    await retryFailed(user.id);
  }

  async function syncNow() {
    if (!user?.id) return;
    await flushQueue(user.id);
  }

  const label = !online ? (status.pending ? 'Saved offline' : 'Offline') : status.label;

  return (
    <div className={`sync-bar is-${!online ? 'offline' : status.state}`}>
      <span>{label}</span>
      {status.pending ? <span className="muted">{status.pending} queued</span> : null}
      {status.failed ? <Button size="sm" variant="ghost" onClick={retry}>Retry failed</Button> : null}
      {conflicts ? <Button size="sm" variant="ghost" onClick={onOpenConflicts}>{conflicts} conflicts</Button> : null}
      {online && status.pending ? <Button size="sm" variant="ghost" onClick={syncNow}>Sync now</Button> : null}
    </div>
  );
}
