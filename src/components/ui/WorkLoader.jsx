import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { useSelector } from 'react-redux';
import { Loader } from './Loader';

const QUIET_MUTATIONS = new Set([
  'updateNote',
  'touchVaultItem',
  'favoriteNote',
  'pinNote',
  'favoriteVaultItem',
  'favoriteEnvCollection',
  'markNotificationRead',
  'markAllNotificationsRead',
  'deleteNotification',
]);

function selectWorkPending(state) {
  const mutations = state.api?.mutations;
  if (!mutations) return false;
  return Object.values(mutations).some(
    (entry) => entry?.status === 'pending' && !QUIET_MUTATIONS.has(entry.endpointName)
  );
}

export function WorkLoader() {
  const pending = useSelector(selectWorkPending);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!pending) {
      setVisible(false);
      return undefined;
    }
    const timer = window.setTimeout(() => setVisible(true), 180);
    return () => window.clearTimeout(timer);
  }, [pending]);

  if (!visible) return null;

  return createPortal(
    <div className="work-loader-overlay" aria-busy="true" aria-live="polite">
      <div className="work-loader-card">
        <Loader size="lg" />
        <p>Working…</p>
      </div>
    </div>,
    document.body
  );
}
