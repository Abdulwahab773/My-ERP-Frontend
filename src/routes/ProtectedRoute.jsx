import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { useGetMeQuery } from '../features/user/userApi';
import { selectAuthStatus, selectUser } from '../features/auth/authSlice';
import { LoadingState } from '../components/ui';

export function ProtectedRoute() {
  const location = useLocation();
  const user = useSelector(selectUser);
  const status = useSelector(selectAuthStatus);
  const { isLoading, isFetching } = useGetMeQuery();

  if ((isLoading || isFetching || status === 'idle' || status === 'loading') && !user) {
    return (
      <div style={{ minHeight: '100vh', display: 'grid', placeItems: 'center' }}>
        <LoadingState label="Opening your workspace" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  return <Outlet />;
}
