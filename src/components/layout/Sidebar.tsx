import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useLang } from '../../hooks/useLang';

interface NavItem {
  to: string;
  label: string;
  icon: React.ReactNode;
}

function NavSection({ label, items }: { label: string; items: NavItem[] }) {
  return (
    <div className="mb-4">
      <p
        className="px-4 mb-1 text-[10px] font-semibold tracking-[0.12em] uppercase"
        style={{ color: '#6E84A0', fontFamily: '"Geist Mono", monospace' }}
      >
        {label}
      </p>
      {items.map(item => (
        <NavLink
          key={item.to}
          to={item.to}
          className={({ isActive }) =>
            `flex items-center gap-3 px-4 py-2.5 mx-2 rounded-lg text-sm font-medium transition-colors ${
              isActive
                ? 'text-white'
                : 'hover:bg-white/5'
            }`
          }
          style={({ isActive }) => ({
            backgroundColor: isActive ? '#173A5E' : undefined,
            color: isActive ? '#ffffff' : '#C8D5E5',
            fontFamily: 'Geist, sans-serif',
          })}
        >
          <span className="flex-shrink-0 w-4 h-4">{item.icon}</span>
          {item.label}
        </NavLink>
      ))}
    </div>
  );
}

function IconDashboard() {
  return (
    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-4 h-4">
      <rect x="1" y="1" width="6" height="6" rx="1.5" />
      <rect x="9" y="1" width="6" height="6" rx="1.5" />
      <rect x="1" y="9" width="6" height="6" rx="1.5" />
      <rect x="9" y="9" width="6" height="6" rx="1.5" />
    </svg>
  );
}

function IconAccounts() {
  return (
    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-4 h-4">
      <rect x="1" y="3" width="14" height="10" rx="2" />
      <line x1="1" y1="7" x2="15" y2="7" />
      <line x1="4" y1="10.5" x2="7" y2="10.5" />
    </svg>
  );
}

function IconCards() {
  return (
    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-4 h-4">
      <rect x="1" y="3.5" width="14" height="9" rx="1.5" />
      <line x1="1" y1="7" x2="15" y2="7" />
      <circle cx="12" cy="10.5" r="1" fill="currentColor" stroke="none" />
    </svg>
  );
}

function IconTransactions() {
  return (
    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-4 h-4">
      <path d="M2 5h12M10 2l3 3-3 3M14 11H2M6 8l-3 3 3 3" />
    </svg>
  );
}

function IconScheduled() {
  return (
    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-4 h-4">
      <rect x="2" y="3" width="12" height="11" rx="1.5" />
      <line x1="5" y1="1.5" x2="5" y2="4.5" />
      <line x1="11" y1="1.5" x2="11" y2="4.5" />
      <line x1="2" y1="7" x2="14" y2="7" />
      <circle cx="8" cy="10.5" r="2" />
      <path d="M8 9.5v1.5l1 0.5" />
    </svg>
  );
}

function IconNotifications() {
  return (
    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-4 h-4">
      <path d="M8 1.5C5.515 1.5 3.5 3.515 3.5 6v3.5L2 11h12l-1.5-1.5V6C12.5 3.515 10.485 1.5 8 1.5z" />
      <path d="M6.5 11.5a1.5 1.5 0 003 0" />
    </svg>
  );
}

function IconTransfer() {
  return (
    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-4 h-4">
      <circle cx="8" cy="8" r="6.5" />
      <path d="M5.5 8h5M8.5 5.5L11 8l-2.5 2.5" />
    </svg>
  );
}

function IconSettings() {
  return (
    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-4 h-4">
      <circle cx="8" cy="8" r="2.5" />
      <path d="M8 1v2M8 13v2M1 8h2M13 8h2M2.93 2.93l1.41 1.41M11.66 11.66l1.41 1.41M2.93 13.07l1.41-1.41M11.66 4.34l1.41-1.41" />
    </svg>
  );
}

function IconAdmin() {
  return (
    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-4 h-4">
      <circle cx="8" cy="5" r="2.5" />
      <path d="M2.5 13.5C2.5 11 5 9 8 9s5.5 2 5.5 4.5" />
    </svg>
  );
}

function IconBroadcast() {
  return (
    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-4 h-4">
      <path d="M8 8m-2 0a2 2 0 104 0 2 2 0 10-4 0" />
      <path d="M4.5 4.5a5 5 0 017 7M3 3a7.5 7.5 0 0110 10" />
    </svg>
  );
}

function IconSignOut() {
  return (
    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-4 h-4">
      <path d="M6 2H3a1 1 0 00-1 1v10a1 1 0 001 1h3" />
      <path d="M10 11l3-3-3-3M13 8H6" />
    </svg>
  );
}

export function Sidebar() {
  const { user, logout } = useAuth();
  const { t } = useLang();
  const navigate = useNavigate();

  const isAdminOrStaff = user?.role === 'ADMIN' || user?.role === 'STAFF';

  const mainItems: NavItem[] = [
    { to: '/dashboard', label: t.dashboard, icon: <IconDashboard /> },
    { to: '/accounts', label: t.accounts, icon: <IconAccounts /> },
    { to: '/cards', label: t.cards, icon: <IconCards /> },
    { to: '/notifications', label: t.notifications, icon: <IconNotifications /> },
    { to: '/settings', label: t.settings, icon: <IconSettings /> },
  ];

  const moneyItems: NavItem[] = [
    { to: '/transfer', label: t.transfer, icon: <IconTransfer /> },
    { to: '/transactions', label: t.transactions, icon: <IconTransactions /> },
    { to: '/scheduled', label: t.scheduled, icon: <IconScheduled /> },
  ];

  const adminItems: NavItem[] = [
    { to: '/admin/users', label: 'Users & roles', icon: <IconAdmin /> },
    { to: '/admin/send', label: 'Send notification', icon: <IconNotifications /> },
    { to: '/admin/bulk', label: 'Bulk send', icon: <IconTransactions /> },
    { to: '/admin/broadcast', label: 'Broadcast', icon: <IconBroadcast /> },
  ];

  const initials = user?.username
    ? user.username.substring(0, 2).toUpperCase()
    : 'U';

  function handleLogout() {
    logout();
    navigate('/login');
  }

  return (
    <aside
      className="fixed left-0 top-0 bottom-0 w-[248px] flex flex-col overflow-hidden z-40"
      style={{ backgroundColor: '#0F2A47' }}
    >
      {/* Brand */}
      <div className="px-6 py-5 border-b" style={{ borderColor: 'rgba(255,255,255,0.08)' }}>
        <div className="flex items-center gap-3">
          <div
            className="w-8 h-8 flex items-center justify-center rounded font-bold text-sm border"
            style={{
              borderColor: '#C8A878',
              color: '#C8A878',
              fontFamily: 'Fraunces, serif',
              fontSize: '16px',
            }}
          >
            B
          </div>
          <div>
            <p
              className="text-white font-semibold leading-tight text-sm"
              style={{ fontFamily: 'Fraunces, serif' }}
            >
              Balkan United
            </p>
            <p
              className="text-[10px] tracking-wider"
              style={{ color: '#6E84A0', fontFamily: '"Geist Mono", monospace' }}
            >
              BANK
            </p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-4 sidebar-scroll">
        <NavSection label="MAIN" items={mainItems} />
        <NavSection label="MONEY" items={moneyItems} />
        {isAdminOrStaff && (
          <div className="mb-4">
            <p
              className="px-4 mb-1 text-[10px] font-semibold tracking-[0.12em] uppercase"
              style={{ color: '#C8A878', fontFamily: '"Geist Mono", monospace' }}
            >
              ADMIN
            </p>
            {adminItems.map(item => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-4 py-2.5 mx-2 rounded-lg text-sm font-medium transition-colors ${
                    isActive ? 'text-white' : 'hover:bg-white/5'
                  }`
                }
                style={({ isActive }) => ({
                  backgroundColor: isActive ? '#173A5E' : undefined,
                  color: isActive ? '#ffffff' : '#C8D5E5',
                  fontFamily: 'Geist, sans-serif',
                })}
              >
                <span className="flex-shrink-0 w-4 h-4">{item.icon}</span>
                {item.label}
              </NavLink>
            ))}
          </div>
        )}
      </nav>

      {/* User footer */}
      <div className="border-t p-4" style={{ borderColor: 'rgba(255,255,255,0.08)' }}>
        <button
          onClick={() => navigate('/settings')}
          className="w-full flex items-center gap-3 mb-3 rounded-lg p-1 -m-1 text-left transition-colors hover:bg-white/5"
          aria-label="Open settings"
        >
          <div
            className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-semibold flex-shrink-0"
            style={{ backgroundColor: '#C8A878', color: '#0F2A47', fontFamily: 'Geist, sans-serif' }}
          >
            {initials}
          </div>
          <div className="min-w-0 flex-1">
            <p
              className="text-white text-sm font-medium truncate leading-tight"
              style={{ fontFamily: 'Geist, sans-serif' }}
            >
              {user?.username || 'User'}
            </p>
            <p
              className="text-[11px] truncate"
              style={{ color: '#6E84A0', fontFamily: '"Geist Mono", monospace' }}
            >
              {user?.role || 'USER'}
            </p>
          </div>
        </button>
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors hover:bg-white/5"
          style={{ color: '#C8D5E5', fontFamily: 'Geist, sans-serif' }}
        >
          <IconSignOut />
          {t.signOut}
        </button>
      </div>
    </aside>
  );
}
