import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { accountsApi } from '../../api/accounts';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { PageSpinner } from '../../components/ui/Spinner';
import { ErrorBanner } from '../../components/ui/ErrorBanner';
import { EmptyState } from '../../components/ui/EmptyState';
import { formatAmount, formatDate } from '../../utils/format';
import { useLang } from '../../hooks/useLang';

export function AccountsPage() {
  const { t } = useLang();
  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ['accounts'],
    queryFn: () => accountsApi.list(0, 50),
  });

  if (isLoading) return <PageSpinner />;
  if (isError) return (
    <div className="max-w-lg">
      <ErrorBanner
        message={(error as Error)?.message || 'Failed to load accounts'}
        onRetry={() => refetch()}
      />
    </div>
  );

  const accounts = data?.content || [];

  return (
    <div className="animate-bub-fade">
      <div className="flex items-center justify-between mb-6">
        <div />
        <Link
          to="/accounts/open"
          className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium"
          style={{ backgroundColor: '#0F2A47', color: '#fff', fontFamily: 'Geist, sans-serif' }}
        >
          <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-4 h-4">
            <line x1="8" y1="2" x2="8" y2="14" />
            <line x1="2" y1="8" x2="14" y2="8" />
          </svg>
          {t.openAccount}
        </Link>
      </div>

      {accounts.length === 0 ? (
        <EmptyState
          title={t.noAccountsYet}
          description="Open your first account to start managing your finances."
          action={
            <Link
              to="/accounts/open"
              className="px-5 py-2.5 rounded-lg text-sm font-medium"
              style={{ backgroundColor: '#0F2A47', color: '#fff', fontFamily: 'Geist, sans-serif' }}
            >
              {t.openAccount}
            </Link>
          }
          icon={
            <svg viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-12 h-12">
              <rect x="4" y="12" width="40" height="28" rx="4" />
              <line x1="4" y1="22" x2="44" y2="22" />
              <line x1="12" y1="32" x2="22" y2="32" />
            </svg>
          }
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {accounts.map(account => (
            <Link
              key={account.id}
              to={`/accounts/${account.id}`}
              className="block rounded-xl border p-5 hover:border-[#C8A878] transition-colors"
              style={{ backgroundColor: '#fff', borderColor: '#E5E2D9' }}
            >
              <div className="flex items-start justify-between mb-4">
                <div>
                  <p
                    className="text-[10px] tracking-[0.14em] uppercase font-semibold mb-1.5"
                    style={{ color: '#8A8F99', fontFamily: '"Geist Mono", monospace' }}
                  >
                    {account.accountType}
                  </p>
                  <StatusBadge status={account.status} />
                </div>
                <div
                  className="w-9 h-9 rounded-lg flex items-center justify-center text-xs font-bold"
                  style={{ backgroundColor: '#F4F2EC', color: '#5C6470', fontFamily: '"Geist Mono", monospace' }}
                >
                  {account.balance?.currencyCode?.substring(0, 3) || 'BGN'}
                </div>
              </div>

              <p
                className="text-2xl font-medium mb-1"
                style={{ fontFamily: 'Fraunces, serif', color: '#14181F' }}
              >
                {formatAmount(account.balance?.availableAmount || 0)}
                <span className="text-sm ml-2" style={{ color: '#8A8F99' }}>
                  {account.balance?.currencyCode}
                </span>
              </p>

              <p
                className="text-[11px] tracking-wider mb-3"
                style={{ color: '#8A8F99', fontFamily: '"Geist Mono", monospace' }}
              >
                {account.iban}
              </p>

              <div className="flex items-center gap-3 pt-3 border-t" style={{ borderColor: '#EFEDE6' }}>
                <span className="text-xs" style={{ color: '#5C6470', fontFamily: 'Geist, sans-serif' }}>
                  Opened {formatDate(account.openedAt)}
                </span>
                {account.branchName && (
                  <span
                    className="text-xs px-2 py-0.5 rounded"
                    style={{ backgroundColor: '#F4F2EC', color: '#5C6470', fontFamily: 'Geist, sans-serif' }}
                  >
                    {account.branchName}
                  </span>
                )}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
