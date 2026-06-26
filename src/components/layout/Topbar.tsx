import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { notificationsApi } from '../../api/notifications';

function BellIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-5 h-5">
      <path d="M10 2C7.24 2 5 4.24 5 7v4.5L3.5 13h13l-1.5-1.5V7C15 4.24 12.76 2 10 2z" />
      <path d="M8.5 13.5a1.5 1.5 0 003 0" />
    </svg>
  );
}

function GearIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-5 h-5">
      <circle cx="10" cy="10" r="3" />
      <path d="M10 2v2M10 16v2M2 10h2M16 10h2M4.34 4.34l1.42 1.42M14.24 14.24l1.42 1.42M4.34 15.66l1.42-1.42M14.24 5.76l1.42-1.42" />
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
        backgroundColor: '#F4F2EC',
        borderColor: '#E5E2D9',
      }}
    >
      {/* Breadcrumb + Title */}
      <div>
        <p
          className="text-[10px] tracking-[0.12em] uppercase mb-0.5"
          style={{ color: '#8A8F99', fontFamily: '"Geist Mono", monospace' }}
        >
          {routeInfo.breadcrumb}
        </p>
        <h1
          className="text-xl font-semibold leading-tight"
          style={{ fontFamily: 'Fraunces, serif', color: '#14181F' }}
        >
          {routeInfo.title}
        </h1>
      </div>

      {/* Right side */}
      <div className="flex items-center gap-3">
        <div
          className="relative flex items-center"
          style={{
            backgroundColor: '#fff',
            border: '1px solid #E5E2D9',
            borderRadius: '7px',
          }}
        >
          <svg
            className="absolute left-3 w-4 h-4 pointer-events-none"
            style={{ color: '#8A8F99' }}
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
            style={{ color: '#14181F', fontFamily: 'Geist, sans-serif' }}
          />
        </div>

        <button
          onClick={() => navigate('/notifications')}
          className="relative p-2 rounded-lg hover:bg-[#E5E2D9] transition-colors"
          style={{ color: '#5C6470' }}
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
          onClick={() => navigate('/settings')}
          className="p-2 rounded-lg hover:bg-[#E5E2D9] transition-colors"
          style={{ color: '#5C6470' }}
          aria-label="Settings"
        >
          <GearIcon />
        </button>
      </div>
    </header>
  );
}
