import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { transactionsApi } from '../../api/transactions';
import { accountsApi } from '../../api/accounts';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { PageSpinner } from '../../components/ui/Spinner';
import { ErrorBanner } from '../../components/ui/ErrorBanner';
import { EmptyState } from '../../components/ui/EmptyState';
import { formatAmount, formatDateTime } from '../../utils/format';
import { useLang } from '../../hooks/useLang';

export function TransactionsPage() {
  const { t } = useLang();
  const [page, setPage] = useState(0);
  const [accountFilter, setAccountFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const { data: accountsData } = useQuery({
    queryKey: ['accounts'],
    queryFn: () => accountsApi.list(0, 50),
  });

  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ['transactions', page, accountFilter, typeFilter, statusFilter],
    queryFn: () => transactionsApi.list(page, 20, {
      ...(accountFilter && { accountId: accountFilter }),
      ...(typeFilter && { type: typeFilter }),
      ...(statusFilter && { status: statusFilter }),
    }),
  });

  const accounts = accountsData?.content || [];
  const transactions = data?.content || [];

  if (isLoading) return <PageSpinner />;

  return (
    <div className="animate-bub-fade">
      {/* Filters */}
      <div
        className="flex flex-wrap gap-3 mb-5 p-4 rounded-xl border"
        style={{ backgroundColor: 'var(--c-surface)', borderColor: 'var(--c-border)' }}
      >
        <select
          value={accountFilter}
          onChange={e => { setAccountFilter(e.target.value); setPage(0); }}
          className="px-3 py-2 rounded-lg border text-sm outline-none"
          style={{ borderColor: 'var(--c-border)', backgroundColor: 'var(--c-surface)', color: 'var(--c-text)', fontFamily: 'Geist, sans-serif' }}
        >
          <option value="">All accounts</option>
          {accounts.map(a => (
            <option key={a.id} value={a.id}>{a.accountType} …{a.iban.slice(-4)}</option>
          ))}
        </select>

        <select
          value={typeFilter}
          onChange={e => { setTypeFilter(e.target.value); setPage(0); }}
          className="px-3 py-2 rounded-lg border text-sm outline-none"
          style={{ borderColor: 'var(--c-border)', backgroundColor: 'var(--c-surface)', color: 'var(--c-text)', fontFamily: 'Geist, sans-serif' }}
        >
          <option value="">All types</option>
          <option value="INTRA_BANK">Intra-bank</option>
          <option value="INTER_BANK">Inter-bank</option>
          <option value="CARD_PAYMENT">Card payment</option>
        </select>

        <select
          value={statusFilter}
          onChange={e => { setStatusFilter(e.target.value); setPage(0); }}
          className="px-3 py-2 rounded-lg border text-sm outline-none"
          style={{ borderColor: 'var(--c-border)', backgroundColor: 'var(--c-surface)', color: 'var(--c-text)', fontFamily: 'Geist, sans-serif' }}
        >
          <option value="">All statuses</option>
          <option value="PENDING">Pending</option>
          <option value="COMPLETED">Completed</option>
          <option value="FAILED">Failed</option>
          <option value="REVERSED">Reversed</option>
        </select>
      </div>

      {isError ? (
        <ErrorBanner message={(error as Error)?.message || 'Failed to load transactions'} onRetry={() => refetch()} />
      ) : transactions.length === 0 ? (
        <EmptyState title={t.noTxnsYet} description="Transactions will appear here after your first transfer." />
      ) : (
        <>
          <div className="rounded-xl border overflow-hidden" style={{ backgroundColor: 'var(--c-surface)', borderColor: 'var(--c-border)' }}>
            <table className="w-full">
              <thead>
                <tr style={{ borderBottom: '1px solid var(--c-surface-2)' }}>
                  {['Date', 'Description', 'Type', 'Status', 'Amount'].map(h => (
                    <th
                      key={h}
                      className="px-5 py-3 text-left text-[10px] font-semibold tracking-wider uppercase"
                      style={{ color: 'var(--c-text-muted)', fontFamily: '"Geist Mono", monospace' }}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {transactions.map(tx => (
                  <tr
                    key={tx.id}
                    className="border-b last:border-0 hover:bg-[var(--c-surface-alt)] cursor-pointer transition-colors"
                    style={{ borderColor: 'var(--c-surface-2)' }}
                    onClick={() => window.location.href = `/transactions/${tx.id}`}
                  >
                    <td className="px-5 py-3">
                      <p className="text-xs" style={{ color: 'var(--c-text-2)', fontFamily: '"Geist Mono", monospace' }}>
                        {formatDateTime(tx.initiatedAt)}
                      </p>
                    </td>
                    <td className="px-5 py-3">
                      <p className="text-sm font-medium" style={{ color: 'var(--c-text)', fontFamily: 'Geist, sans-serif' }}>
                        {tx.description || tx.merchantName || tx.type}
                      </p>
                      {tx.reference && (
                        <p className="text-[11px]" style={{ color: 'var(--c-text-muted)', fontFamily: '"Geist Mono", monospace' }}>
                          {tx.reference}
                        </p>
                      )}
                    </td>
                    <td className="px-5 py-3">
                      <span
                        className="text-[11px] px-2 py-0.5 rounded"
                        style={{ backgroundColor: 'var(--c-surface-2)', color: 'var(--c-text-2)', fontFamily: '"Geist Mono", monospace' }}
                      >
                        {tx.type}
                      </span>
                    </td>
                    <td className="px-5 py-3">
                      <StatusBadge status={tx.status} />
                    </td>
                    <td className="px-5 py-3 text-right">
                      <p
                        className="text-sm font-semibold"
                        style={{
                          color: tx.status === 'FAILED' ? '#A8362F' : 'var(--c-text)',
                          fontFamily: '"Geist Mono", monospace',
                        }}
                      >
                        {formatAmount(tx.amount)} {tx.currency}
                      </p>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {data && data.totalPages > 1 && (
            <div className="flex items-center justify-between mt-4">
              <p className="text-xs" style={{ color: 'var(--c-text-muted)', fontFamily: 'Geist, sans-serif' }}>
                {t.page} {(data.number || 0) + 1} {t.of} {data.totalPages}
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => setPage(p => Math.max(0, p - 1))}
                  disabled={data.first}
                  className="px-3 py-1.5 rounded-lg border text-xs disabled:opacity-40"
                  style={{ borderColor: 'var(--c-border)', color: 'var(--c-text-2)', fontFamily: 'Geist, sans-serif' }}
                >
                  {t.prev}
                </button>
                <button
                  onClick={() => setPage(p => p + 1)}
                  disabled={data.last}
                  className="px-3 py-1.5 rounded-lg border text-xs disabled:opacity-40"
                  style={{ borderColor: 'var(--c-border)', color: 'var(--c-text-2)', fontFamily: 'Geist, sans-serif' }}
                >
                  {t.next}
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
