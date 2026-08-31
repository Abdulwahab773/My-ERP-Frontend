import { useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { LoadingState } from '../components/ui';
import { CreatePinScreen } from '../components/security/CreatePinScreen';
import { PinLockScreen } from '../components/security/PinLockScreen';
import { useGetPinStatusQuery } from '../features/security/securityApi';

export function SensitiveRoute() {
  const { data, isLoading, refetch } = useGetPinStatusQuery(undefined, { pollingInterval: 20000 });
  const status = data?.data;

  useEffect(() => {
    if (!status?.unlocked || !status?.expiresAt) return undefined;
    const wait = Math.max(250, new Date(status.expiresAt).getTime() - Date.now() + 250);
    const timer = window.setTimeout(() => {
      refetch();
    }, wait);
    return () => window.clearTimeout(timer);
  }, [status?.unlocked, status?.expiresAt, refetch]);

  if (isLoading && !status) {
    return (
      <div style={{ minHeight: '40vh', display: 'grid', placeItems: 'center' }}>
        <LoadingState label="Checking security lock" />
      </div>
    );
  }

  if (!status?.pinSet) {
    return <CreatePinScreen />;
  }

  if (!status.unlocked) {
    return <PinLockScreen lockedUntil={status.lockedUntil} />;
  }

  return <Outlet />;
}
