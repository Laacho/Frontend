import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { accountsApi } from '../../api/accounts';
import { transactionsApi } from '../../api/transactions';
import { notificationsApi } from '../../api/notifications';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { formatAmount, formatDateTime, formatRelativeTime } from '../../utils/format';
import { useLang } from '../../hooks/useLang';
import type { AccountResponse, TransactionResponse, NotificationResponse } from '../../types';

function AccountCard({ account, index }: { account: AccountResponse; index: number }) {
  const isFirst = index === 0;
  return (
    <Link to={`/accounts/${account.id}`} className="block rounded-xl border overflow-hidden hover:border-[#C8A878] transition-colors"
      style={{ borderColor: isFirst ? 'transparent' : 'var(--c-border)' }}>
      <div
        className="p-5 h-full"
        style={{
          background: isFirst
            ? 'linear-gradient(135deg, #0F2A47 0%, #173A5E 100%)'
            : 'var(--c-surface)',
        }}
      >
        <div className="flex items-start justify-between mb-4">
          <div>
            <p
              className="text-[10px] tracking-[0.14em] uppercase font-semibold mb-1"
              style={{
                color: isFirst ? '#C8A878' : 'var(--c-text-muted)',
                fontFamily: '"Geist Mono", monospace',
              }}
            >
              {account.accountType}
            </p>
            <StatusBadge status={account.status} />
          </div>
          <div
            className="w-8 h-8 rounded flex items-center justify-center text-xs font-bold"
            style={{
              backgroundColor: isFirst ? 'rgba(200,168,120,0.15)' : 'var(--c-bg)',
              color: isFirst ? '#C8A878' : 'var(--c-text-2)',
              fontFamily: 'Fraunces, serif',
            }}
          >
            {account.balance?.currencyCode || 'BGN'}
          </div>
        </div>

        <div className="mb-4">
          <p
            className="text-3xl font-medium leading-tight"
            style={{
              fontFamily: 'Fraunces, serif',
              color: isFirst ? 'var(--c-surface)' : 'var(--c-text)',
            }}
          >
            {formatAmount(account.balance?.availableAmount || 0)}
          </p>
          <p
            className="text-sm mt-0.5"
            style={{
              color: isFirst ? 'rgba(200,216,229,0.7)' : 'var(--c-text-2)',
              fontFamily: 'Geist, sans-serif',
            }}
          >
            {account.balance?.currencyCode || 'BGN'} available
          </p>
        </div>

        <p
          className="text-[11px] tracking-wider truncate"
          style={{
            color: isFirst ? 'rgba(200,216,229,0.5)' : 'var(--c-text-muted)',
            fontFamily: '"Geist Mono", monospace',
          }}
        >
          {account.iban}
        </p>
      </div>
    </Link>
  );
}

function SkeletonCard() {
  return (
    <div className="rounded-xl border p-5 animate-bub-pulse" style={{ borderColor: 'var(--c-border)', backgroundColor: 'var(--c-surface)' }}>
      <div className="flex justify-between mb-4">
        <div className="h-4 w-20 rounded" style={{ backgroundColor: 'var(--c-surface-2)' }} />
        <div className="h-6 w-12 rounded" style={{ backgroundColor: 'var(--c-surface-2)' }} />
      </div>
      <div className="h-8 w-32 rounded mb-2" style={{ backgroundColor: 'var(--c-surface-2)' }} />
      <div className="h-4 w-16 rounded mb-4" style={{ backgroundColor: 'var(--c-surface-2)' }} />
      <div className="h-3 w-40 rounded" style={{ backgroundColor: 'var(--c-surface-2)' }} />
    </div>
  );
}

function QuickAction({ to, icon, label }: { to: string; icon: React.ReactNode; label: string }) {
  return (
    <Link
      to={to}
      className="flex flex-col items-center gap-2 p-4 rounded-xl border hover:border-[#C8A878] transition-colors"
      style={{ backgroundColor: 'var(--c-surface)', borderColor: 'var(--c-border)' }}
    >
      <div
        className="w-10 h-10 rounded-lg flex items-center justify-center"
        style={{ backgroundColor: 'var(--c-bg)', color: '#0F2A47' }}
      >
        {icon}
      </div>
      <span className="text-xs font-medium text-center" style={{ color: 'var(--c-text)', fontFamily: 'Geist, sans-serif' }}>
        {label}
      </span>
    </Link>
  );
}

function TxRow({ tx }: { tx: TransactionResponse }) {
  const isCredit = tx.type === 'INTRA_BANK' || tx.type === 'INTER_BANK';
  return (
    <div className="flex items-center gap-3 py-3 border-b last:border-0" style={{ borderColor: 'var(--c-surface-2)' }}>
      <div
        className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
        style={{ backgroundColor: 'var(--c-bg)' }}
      >
        <svg viewBox="0 0 16 16" fill="none" stroke="var(--c-text-2)" strokeWidth="1.5" className="w-4 h-4">
          {isCredit
            ? <path d="M8 12V4M5 7l3-3 3 3" />
            : <path d="M8 4v8M5 9l3 3 3-3" />
          }
        </svg>
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium truncate" style={{ color: 'var(--c-text)', fontFamily: 'Geist, sans-serif' }}>
          {tx.description || tx.merchantName || tx.type}
        </p>
        <p className="text-[11px]" style={{ color: 'var(--c-text-muted)', fontFamily: '"Geist Mono", monospace' }}>
          {formatDateTime(tx.initiatedAt)}
        </p>
      </div>
      <div className="text-right">
        <p
          className="text-sm font-semibold"
          style={{
            color: tx.status === 'FAILED' ? '#A8362F' : 'var(--c-text)',
            fontFamily: '"Geist Mono", monospace',
          }}
        >
          {formatAmount(tx.amount)} {tx.currency}
        </p>
        <StatusBadge status={tx.status} />
      </div>
    </div>
  );
}

function NotifRow({ n }: { n: NotificationResponse }) {
  const isUnread = n.status !== 'READ';
  return (
    <div
      className="flex items-start gap-3 py-3 border-b last:border-0"
      style={{ borderColor: 'var(--c-surface-2)', backgroundColor: isUnread ? 'var(--c-surface-alt)' : undefined }}
    >
      {isUnread && (
        <div className="w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0" style={{ backgroundColor: '#C8A878' }} />
      )}
      {!isUnread && <div className="w-1.5 flex-shrink-0" />}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium truncate" style={{ color: 'var(--c-text)', fontFamily: 'Geist, sans-serif' }}>
          {n.title}
        </p>
        <p className="text-xs truncate" style={{ color: 'var(--c-text-2)', fontFamily: 'Geist, sans-serif' }}>
          {n.message}
        </p>
      </div>
      <span className="text-[10px] flex-shrink-0" style={{ color: 'var(--c-text-muted)', fontFamily: '"Geist Mono", monospace' }}>
        {formatRelativeTime(n.createdAt)}
      </span>
    </div>
  );
}

export function DashboardPage() {
  const { t } = useLang();

  const { data: accountsData, isLoading: loadingAccounts, isError: errorAccounts, refetch: refetchAccounts } = useQuery({
    queryKey: ['accounts'],
    queryFn: () => accountsApi.list(0, 6),
  });

  const { data: txData, isLoading: loadingTx } = useQuery({
    queryKey: ['transactions', 'recent'],
    queryFn: () => transactionsApi.list(0, 5),
  });

  const { data: notifData, isLoading: loadingNotif } = useQuery({
    queryKey: ['notifications', 'recent'],
    queryFn: () => notificationsApi.list(0, 5),
  });

  const accounts = accountsData?.content || [];
  const transactions = txData?.content || [];
  const notifications = notifData?.content || [];

  return (
    <div className="animate-bub-fade">
      {/* Account cards */}
      <section className="mb-6">
        {errorAccounts ? (
          <div
            className="p-6 rounded-xl border text-center"
            style={{ borderColor: 'var(--c-border)', backgroundColor: 'var(--c-surface)' }}
          >
            <p className="text-sm mb-3" style={{ color: '#A8362F', fontFamily: 'Geist, sans-serif' }}>
              Could not load accounts.
            </p>
            <button
              onClick={() => refetchAccounts()}
              className="text-sm underline"
              style={{ color: '#0F2A47', fontFamily: 'Geist, sans-serif' }}
            >
              {t.tryAgain}
            </button>
          </div>
        ) : loadingAccounts ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[0, 1, 2].map(i => <SkeletonCard key={i} />)}
          </div>
        ) : accounts.length === 0 ? (
          <div
            className="flex flex-col items-center py-16 rounded-xl border-2 border-dashed"
            style={{ borderColor: 'var(--c-border)', backgroundColor: 'var(--c-surface)' }}
          >
            <div className="w-12 h-12 rounded-full flex items-center justify-center mb-4" style={{ backgroundColor: 'var(--c-bg)' }}>
              <svg viewBox="0 0 24 24" fill="none" stroke="#C8A878" strokeWidth="1.5" className="w-6 h-6">
                <rect x="2" y="5" width="20" height="14" rx="2" />
                <line x1="2" y1="10" x2="22" y2="10" />
              </svg>
            </div>
            <h3 className="text-lg font-medium mb-2" style={{ fontFamily: 'Fraunces, serif', color: 'var(--c-text)' }}>
              {t.noAccountsYet}
            </h3>
            <p className="text-sm mb-6" style={{ color: 'var(--c-text-2)', fontFamily: 'Geist, sans-serif' }}>
              Open your first account to get started.
            </p>
            <Link
              to="/accounts/open"
              className="px-5 py-2.5 rounded-lg text-sm font-medium"
              style={{ backgroundColor: '#0F2A47', color: 'var(--c-on-brand)', fontFamily: 'Geist, sans-serif' }}
            >
              {t.openAccount}
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {accounts.map((a, i) => <AccountCard key={a.id} account={a} index={i} />)}
          </div>
        )}
      </section>

      {/* Quick actions */}
      <section className="mb-6">
        <h2 className="text-base font-semibold mb-3" style={{ fontFamily: 'Fraunces, serif', color: 'var(--c-text)' }}>
          {t.quickActions}
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <QuickAction
            to="/transfer"
            label={t.transfer}
            icon={
              <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-5 h-5">
                <path d="M2 5h12M10 2l3 3-3 3M14 11H2M6 8l-3 3 3 3" />
              </svg>
            }
          />
          <QuickAction
            to="/card-payment"
            label={t.cardPayment}
            icon={
              <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-5 h-5">
                <rect x="1" y="3.5" width="14" height="9" rx="1.5" />
                <line x1="1" y1="7" x2="15" y2="7" />
                <circle cx="12" cy="10.5" r="1" fill="currentColor" stroke="none" />
              </svg>
            }
          />
          <QuickAction
            to="/scheduled/new"
            label={t.scheduled}
            icon={
              <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-5 h-5">
                <rect x="2" y="3" width="12" height="11" rx="1.5" />
                <line x1="5" y1="1.5" x2="5" y2="4.5" />
                <line x1="11" y1="1.5" x2="11" y2="4.5" />
                <line x1="2" y1="7" x2="14" y2="7" />
              </svg>
            }
          />
          <QuickAction
            to="/cards/issue"
            label={t.issueCard}
            icon={
              <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-5 h-5">
                <rect x="1" y="3.5" width="14" height="9" rx="1.5" />
                <line x1="1" y1="7" x2="15" y2="7" />
                <line x1="8" y1="9.5" x2="8" y2="12.5" />
                <line x1="6.5" y1="11" x2="9.5" y2="11" />
              </svg>
            }
          />
        </div>
      </section>

      {/* Bottom 2-col grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Recent activity */}
        <div className="rounded-xl border" style={{ backgroundColor: 'var(--c-surface)', borderColor: 'var(--c-border)' }}>
          <div className="flex items-center justify-between px-5 py-4 border-b" style={{ borderColor: 'var(--c-surface-2)' }}>
            <h2 className="text-sm font-semibold" style={{ fontFamily: 'Fraunces, serif', color: 'var(--c-text)' }}>
              {t.recentActivity}
            </h2>
            <Link
              to="/transactions"
              className="text-xs hover:underline"
              style={{ color: '#C8A878', fontFamily: 'Geist, sans-serif' }}
            >
              {t.viewAll}
            </Link>
          </div>
          <div className="px-5">
            {loadingTx ? (
              <div className="py-8 text-center">
                <div className="w-5 h-5 rounded-full border-2 border-[#C8A878] border-t-transparent animate-bub-spin mx-auto" />
              </div>
            ) : transactions.length === 0 ? (
              <p className="py-8 text-center text-sm" style={{ color: 'var(--c-text-muted)', fontFamily: 'Geist, sans-serif' }}>
                {t.noTxnsYet}
              </p>
            ) : (
              transactions.map(tx => <TxRow key={tx.id} tx={tx} />)
            )}
          </div>
        </div>

        {/* Notifications panel */}
        <div className="rounded-xl border" style={{ backgroundColor: 'var(--c-surface)', borderColor: 'var(--c-border)' }}>
          <div className="flex items-center justify-between px-5 py-4 border-b" style={{ borderColor: 'var(--c-surface-2)' }}>
            <h2 className="text-sm font-semibold" style={{ fontFamily: 'Fraunces, serif', color: 'var(--c-text)' }}>
              {t.notifications}
            </h2>
            <Link
              to="/notifications"
              className="text-xs hover:underline"
              style={{ color: '#C8A878', fontFamily: 'Geist, sans-serif' }}
            >
              {t.viewAll}
            </Link>
          </div>
          <div className="px-5">
            {loadingNotif ? (
              <div className="py-8 text-center">
                <div className="w-5 h-5 rounded-full border-2 border-[#C8A878] border-t-transparent animate-bub-spin mx-auto" />
              </div>
            ) : notifications.length === 0 ? (
              <p className="py-8 text-center text-sm" style={{ color: 'var(--c-text-muted)', fontFamily: 'Geist, sans-serif' }}>
                {t.noNotifications}
              </p>
            ) : (
              notifications.map(n => <NotifRow key={n.id} n={n} />)
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
