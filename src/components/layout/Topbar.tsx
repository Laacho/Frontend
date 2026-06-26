import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { MoonStar, Sun } from 'lucide-react';
import { notificationsApi } from '../../api/notifications';
import { useTheme } from '../../hooks/useTheme';

function BellIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-5 h-5">
      <path d="M10 2C7.24 2 5 4.24 5 7v4.5L3.5 13h13l-1.5-1.5V7C15 4.24 12.76 2 10 2z" />
      <path d="M8.5 13.5a1.5 1.5 0 003 0" />
    </svg>
  );
}

const routeTitles: Record<string, { breadcrumb: string; title: string }> = {
  '/dashboard': { breadcrumb: 'MAIN', title: 'Dashboard' },
  '/accounts': { breadcrumb: 'ACCOUNTS', title: 'Accounts' },
  '/accounts/open': { breadcrumb: 'ACCOUNTS', title: 'Open account' },
  '/cards': { breadcrumb: 'CARDS', title: 'Cards' },
  '/cards/issue': { breadcrumb: 'CARDS', title: 'Issue a card' },
  '/transfer': { breadcrumb: 'MONEY', title: 'Transfer' },
  '/card-payment': { breadcrumb: 'MONEY', title: 'Card payment' },
  '/transactions': { breadcrumb: 'MONEY', title: 'Transactions' },
  '/scheduled': { breadcrumb: 'MONEY', title: 'Scheduled' },
  '/scheduled/new': { breadcrumb: 'SCHEDULED', title: 'New schedule' },
  '/notifications': { breadcrumb: 'NOTIFICATIONS', title: 'Notifications' },
  '/settings': { breadcrumb: 'ACCOUNT', title: 'Settings' },
  '/admin/send': { breadcrumb: 'ADMIN', title: 'Send notification' },
  '/admin/bulk': { breadcrumb: 'ADMIN', title: 'Bulk send' },
  '/admin/broadcast': { breadcrumb: 'ADMIN', title: 'Broadcast' },
  '/admin/users': { breadcrumb: 'ADMIN', title: 'Users & roles' },
};

export function Topbar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { theme, toggle } = useTheme();
  const [search, setSearch] = useState('');

  // Drive the badge from react-query so marking notifications read (which
  // invalidates ['notifications']) refreshes the count immediately.
  const { data: notifData } = useQuery({
    queryKey: ['notifications', 'unread'],
    queryFn: () => notificationsApi.list(0, 1),
  });
  const unreadCount = (notifData as { unreadCount?: number })?.unreadCount || 0;

  const path = location.pathname;
  let routeInfo = routeTitles[path];
  if (!routeInfo) {
    if (path.startsWith('/accounts/')) routeInfo = { breadcrumb: 'ACCOUNTS', title: 'Account detail' };
    else if (path.startsWith('/cards/')) routeInfo = { breadcrumb: 'CARDS', title: 'Card detail' };
    else if (path.startsWith('/transactions/')) routeInfo = { breadcrumb: 'TRANSACTIONS', title: 'Transaction detail' };
    else routeInfo = { breadcrumb: 'BUB', title: '' };
  }

  return (
    <header
      className="fixed top-0 right-0 h-16 flex items-center justify-between px-6 border-b z-30"
      style={{
        left: '248px',
        backgroundColor: 'var(--c-bg)',
        borderColor: 'var(--c-border)',
      }}
    >
      {/* Breadcrumb + Title */}
      <div>
        <p
          className="text-[10px] tracking-[0.12em] uppercase mb-0.5"
          style={{ color: 'var(--c-text-muted)', fontFamily: '"Geist Mono", monospace' }}
        >
          {routeInfo.breadcrumb}
        </p>
        <h1
          className="text-xl font-semibold leading-tight"
          style={{ fontFamily: 'Fraunces, serif', color: 'var(--c-text)' }}
        >
          {routeInfo.title}
        </h1>
      </div>

      {/* Right side */}
      <div className="flex items-center gap-3">
        <div
          className="relative flex items-center"
          style={{
            backgroundColor: 'var(--c-surface)',
            border: '1px solid var(--c-border)',
            borderRadius: '7px',
          }}
        >
          <svg
            className="absolute left-3 w-4 h-4 pointer-events-none"
            style={{ color: 'var(--c-text-muted)' }}
            viewBox="0 0 16 16"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
          >
            <circle cx="6.5" cy="6.5" r="4.5" />
            <line x1="10" y1="10" x2="14" y2="14" />
          </svg>
          <input
            type="search"
            placeholder="Search…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="pl-9 pr-3 py-1.5 text-sm bg-transparent outline-none w-48"
            style={{ color: 'var(--c-text)', fontFamily: 'Geist, sans-serif' }}
          />
        </div>

        <button
          onClick={() => navigate('/notifications')}
          className="relative p-2 rounded-lg hover:bg-[var(--c-border)] transition-colors"
          style={{ color: 'var(--c-text-2)' }}
          aria-label="Notifications"
        >
          <BellIcon />
          {unreadCount > 0 && (
            <span
              className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full flex items-center justify-center text-[9px] font-bold text-white"
              style={{ backgroundColor: '#A8362F', fontFamily: '"Geist Mono", monospace' }}
            >
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </button>

        <button
          onClick={toggle}
          className="p-2 rounded-lg hover:bg-[var(--c-border)] transition-colors"
          style={{ color: 'var(--c-text-2)' }}
          aria-label={theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'}
          title={theme === 'dark' ? 'Light mode' : 'Dark mode'}
        >
          {theme === 'dark' ? <Sun className="w-5 h-5" /> : <MoonStar className="w-5 h-5" />}
        </button>
      </div>
    </header>
  );
}
