import { useSelector } from 'react-redux';
import { selectAuthStatus, selectUser } from '../features/auth/authSlice';

export function useAuth() {
  const user = useSelector(selectUser);
  const status = useSelector(selectAuthStatus);

  return {
    user,
    status,
    isAuthenticated: Boolean(user),
  };
}
