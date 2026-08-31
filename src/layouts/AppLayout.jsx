import { useState } from 'react';
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { SidebarNav } from '../components/navigation/SidebarNav';
import { ThemeToggle } from '../components/theme/ThemeToggle';
import { Drawer, Dropdown, DropdownItem } from '../components/ui';
import { MsIcon } from '../components/ui/MsIcon';
import { NotificationCenter } from '../components/notifications/NotificationCenter';
import { SyncBar } from '../components/pwa/SyncBar';
import { InstallBanner } from '../components/pwa/InstallBanner';
import { ConflictResolver } from '../components/pwa/ConflictResolver';
import { useLogoutMutation } from '../features/auth/authApi';
import { useGetNotificationsQuery } from '../features/notifications/notificationsApi';
import { selectUser } from '../features/auth/authSlice';
import { NAV_ITEMS } from '../constants';

const BOTTOM_ICONS = {
  home: 'home',
  wallet: 'payments',
  note: 'description',
  lock: 'lock',
  target: 'target',
};

export function AppLayout() {
  const user = useSelector(selectUser);
  const navigate = useNavigate();
  const location = useLocation();
  const [logout, { isLoading }] = useLogoutMutation();
  const [menuOpen, setMenuOpen] = useState(false);
  const [notifyOpen, setNotifyOpen] = useState(false);
  const [conflictsOpen, setConflictsOpen] = useState(false);
  const { data: notifyData } = useGetNotificationsQuery({}, { pollingInterval: 90000 });
  const unread = notifyData?.data?.unread || 0;

  const pageTitle = location.pathname.startsWith('/app/money')
    ? 'Money Hub'
    : location.pathname.startsWith('/app/notes')
      ? 'Notes'
      : location.pathname.startsWith('/app/goals')
        ? 'Goals'
        : location.pathname.startsWith('/app/vault')
          ? 'Vault'
          : location.pathname.startsWith('/app/secrets')
            ? 'ENV'
            : location.pathname.startsWith('/app/security')
              ? 'Security'
              : location.pathname.startsWith('/app/profile')
                ? 'Account'
                : 'Aether';

  async function handleLogout() {
    await logout();
    navigate('/login');
  }

  return (
    <div className="app-shell">
      <a className="skip-link" href="#workspace">Skip to content</a>
      <SidebarNav user={user} />

      <div className="app-main">
        <header className="topbar">
          <div className="topbar-brand">
            <button
              type="button"
              className="icon-btn mobile-only"
              aria-label="Open menu"
              onClick={() => setMenuOpen(true)}
            >
              <MsIcon name="menu" />
            </button>
            <span className="topbar-title">{pageTitle}</span>
          </div>
          <div className="topbar-actions">
            <button
              type="button"
              className="icon-btn notify-btn"
              aria-label={unread ? `${unread} unread notifications` : 'Notifications'}
              onClick={() => setNotifyOpen(true)}
            >
              <MsIcon name="notifications" />
              {unread ? <span className="notify-count">{unread > 9 ? '9+' : unread}</span> : null}
            </button>
            <ThemeToggle />
            <Dropdown
              trigger={(
                <button type="button" className="topbar-account">
                  Account
                </button>
              )}
            >
              <DropdownItem onClick={() => navigate('/app/profile')}>Profile</DropdownItem>
              <DropdownItem onClick={() => navigate('/app/sharing')}>Sharing</DropdownItem>
              <DropdownItem onClick={() => navigate('/app/security')}>Security</DropdownItem>
              <DropdownItem onClick={() => navigate('/app/security/activity')}>Activity</DropdownItem>
              <DropdownItem danger onClick={handleLogout}>
                {isLoading ? 'Signing out…' : 'Sign out'}
              </DropdownItem>
            </Dropdown>
          </div>
        </header>

        <InstallBanner />
        <SyncBar onOpenConflicts={() => setConflictsOpen(true)} />
        <main id="workspace" className="app-content" tabIndex={-1}>
          <Outlet />
        </main>
      </div>

      <nav className="bottom-nav" aria-label="Primary">
        {NAV_ITEMS.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            className={({ isActive }) => `nav-link ${isActive ? 'is-active' : ''}`}
          >
            {({ isActive }) => (
              <>
                <MsIcon name={BOTTOM_ICONS[item.icon] || 'circle'} filled={isActive} />
                <span>{item.label}</span>
              </>
            )}
          </NavLink>
        ))}
      </nav>

      <Drawer open={menuOpen} title="Aether" onClose={() => setMenuOpen(false)} side="left">
        <SidebarNav user={user} onNavigate={() => setMenuOpen(false)} />
      </Drawer>
      <NotificationCenter open={notifyOpen} onClose={() => setNotifyOpen(false)} />
      <ConflictResolver open={conflictsOpen} onClose={() => setConflictsOpen(false)} />
    </div>
  );
}
