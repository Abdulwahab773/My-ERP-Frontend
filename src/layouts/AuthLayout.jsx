import { Outlet } from 'react-router-dom';
import { ThemeToggle } from '../components/theme/ThemeToggle';

export function AuthLayout() {
  return (
    <div className="auth-page-shell">
      <div className="auth-theme">
        <ThemeToggle />
      </div>
      <Outlet />
    </div>
  );
}
