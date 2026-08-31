import { Outlet } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { selectUser } from '../features/auth/authSlice';
import { CreatePinScreen } from '../components/security/CreatePinScreen';

export function PinSetupGate() {
  const user = useSelector(selectUser);

  if (user && !user.pinSet) {
    return <CreatePinScreen />;
  }

  return <Outlet />;
}
