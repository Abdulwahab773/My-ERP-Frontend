import { Navigate, Outlet } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { useGetMeQuery } from '../features/user/userApi';
import { selectUser } from '../features/auth/authSlice';
import { LoadingState } from '../components/ui';

export function PublicOnlyRoute() {
  const user = useSelector(selectUser);
  const { isLoading, isFetching } = useGetMeQuery();

  if ((isLoading || isFetching) && !user) {
    return (
      <div style={{ minHeight: '100vh', display: 'grid', placeItems: 'center' }}>
        <LoadingState label="Checking session" />
      </div>
    );
  }

  if (user) {
    return <Navigate to="/app" replace />;
  }

  return <Outlet />;
}
