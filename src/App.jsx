import { useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import { AppRoutes } from './routes';
import { ToastProvider, WorkLoader } from './components/ui';
import { UpdateBanner } from './components/pwa/UpdateBanner';
import { applyTheme, readStoredTheme } from './theme/applyTheme';
import { syncSystemTheme } from './features/theme/themeSlice';
import { selectUser } from './features/auth/authSlice';
import { notesApi } from './features/notes/notesApi';
import { financeApi } from './features/finance/financeApi';
import { flushQueue } from './pwa/sync';
import { hydrateSyncStatus } from './pwa/syncStatus';
import { isOnline, subscribeToConnectivity } from './pwa/offline';

export function App() {
  const dispatch = useDispatch();
  const user = useSelector(selectUser);
  const [needRefresh, setNeedRefresh] = useState(false);
  const updateRef = useRef(null);

  useEffect(() => {
    applyTheme(readStoredTheme());
    const media = window.matchMedia('(prefers-color-scheme: dark)');
    const onChange = () => dispatch(syncSystemTheme());
    media.addEventListener('change', onChange);
    return () => media.removeEventListener('change', onChange);
  }, [dispatch]);

  useEffect(() => {
    if (!user?.id) return undefined;
    let busy = false;
    async function syncAll() {
      if (busy || !isOnline()) return;
      busy = true;
      try {
        const result = await flushQueue(user.id);
        if (result.flushed > 0) {
          dispatch(notesApi.util.invalidateTags(['Notes', 'Dashboard']));
          dispatch(financeApi.util.invalidateTags(['Income', 'Expenses', 'Dashboard']));
        }
      } finally {
        busy = false;
      }
    }
    hydrateSyncStatus();
    const stop = subscribeToConnectivity((online) => {
      if (online) syncAll();
    });
    syncAll();
    return stop;
  }, [dispatch, user?.id]);

  useEffect(() => {
    import('virtual:pwa-register')
      .then(({ registerSW }) => {
        updateRef.current = registerSW({
          immediate: true,
          onNeedRefresh() {
            setNeedRefresh(true);
          },
        });
      })
      .catch(() => {});
  }, []);

  return (
    <BrowserRouter>
      <ToastProvider>
        <WorkLoader />
        <UpdateBanner
          update={needRefresh}
          onReload={() => {
            updateRef.current?.(true);
            setNeedRefresh(false);
          }}
        />
        <AppRoutes />
      </ToastProvider>
    </BrowserRouter>
  );
}
