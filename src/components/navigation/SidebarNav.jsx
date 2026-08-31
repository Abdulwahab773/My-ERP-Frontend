import { NavLink } from 'react-router-dom';
import { MORE_NAV_ITEMS, NAV_ITEMS } from '../../constants';
import { MsIcon } from '../ui/MsIcon';
import { initials } from '../../utils/format';

const ICONS = {
  home: 'home',
  wallet: 'payments',
  note: 'description',
  lock: 'lock',
  target: 'target',
  users: 'group',
  key: 'vpn_key',
  chart: 'insights',
  user: 'person',
  alert: 'history',
};

function NavGroup({ items, onNavigate }) {
  return (
    <div className="nav-list">
      {items.map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          end={item.end}
          onClick={onNavigate}
          className={({ isActive }) => `nav-link ${isActive ? 'is-active' : ''}`}
        >
          {({ isActive }) => (
            <>
              <MsIcon name={ICONS[item.icon] || 'circle'} filled={isActive} />
              <span className="nav-link-label">{item.label}</span>
            </>
          )}
        </NavLink>
      ))}
    </div>
  );
}

export function SidebarNav({ onNavigate, user, className = '' }) {
  const mark = initials(user?.name || 'A');

  return (
    <aside className={`sidebar ${className}`.trim()}>
      <div className="sidebar-head">
        <div className="brand">
          {user?.avatarUrl ? (
            <img src={user.avatarUrl} alt="" className="avatar" />
          ) : (
            <div className="avatar">{mark}</div>
          )}
          <div className="brand-copy">
            <strong>Aether ERP</strong>
            <span>Personal Workspace</span>
          </div>
        </div>
      </div>
      <nav aria-label="Workspace">
        <p className="nav-label">Menu</p>
        <NavGroup items={NAV_ITEMS} onNavigate={onNavigate} />
        <p className="nav-label" style={{ marginTop: 16 }}>More</p>
        <NavGroup items={MORE_NAV_ITEMS} onNavigate={onNavigate} />
      </nav>
      <div className="sidebar-footer">
        <strong>Premium</strong>
        <p>Personal workspace</p>
      </div>
    </aside>
  );
}
