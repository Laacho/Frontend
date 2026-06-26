import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { accountsApi } from '../../api/accounts';
import { cardsApi } from '../../api/cards';
import { transactionsApi } from '../../api/transactions';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { PageSpinner } from '../../components/ui/Spinner';
import { ErrorBanner } from '../../components/ui/ErrorBanner';
import { Modal } from '../../components/ui/Modal';
import { formatAmount, formatDate, formatDateTime } from '../../utils/format';
import { getApiError } from '../../api/client';
import { useLang } from '../../hooks/useLang';

export function AccountDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { t } = useLang();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [modal, setModal] = useState<'freeze' | 'unfreeze' | 'close' | null>(null);
  const [statusError, setStatusError] = useState('');

  const { data: account, isLoading, isError, error, refetch } = useQuery({
    queryKey: ['account', id],
    queryFn: () => accountsApi.get(id!),
    enabled: !!id,
  });

  const { data: cardsData } = useQuery({
    queryKey: ['cards'],
    queryFn: () => cardsApi.list(0, 20),
  });

  const { data: txData } = useQuery({
    queryKey: ['transactions', 'account', id],
    queryFn: () => transactionsApi.list(0, 5, { accountId: id! }),
    enabled: !!id,
  });

  const statusMutation = useMutation({
    mutationFn: ({ status, reason }: { status: string; reason: string }) =>
      accountsApi.updateStatus(id!, status, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['account', id] });
      queryClient.invalidateQueries({ queryKey: ['accounts'] });
      setModal(null);
    },
    onError: (err) => {
      setStatusError(getApiError(err));
    },
  });

  if (isLoading) return <PageSpinner />;
  if (isError || !account) return (
    <div className="max-w-lg">
      <button
        onClick={() => navigate('/accounts')}
        className="flex items-center gap-1.5 text-sm mb-4 hover:underline"
        style={{ color: '#5C6470', fontFamily: 'Geist, sans-serif' }}
      >
        ← {t.accounts}
      </button>
      <ErrorBanner
        message={(error as Error)?.message || 'Account not found'}
        onRetry={() => refetch()}
      />
    </div>
  );

  const accountCards = cardsData?.content.filter(c => c.accountId === id) || [];
  const transactions = txData?.content || [];

  const canFreeze = account.status === 'ACTIVE';
  const canUnfreeze = account.status === 'FROZEN';
  const canClose = account.status !== 'CLOSED';

  return (
    <div className="animate-bub-fade">
      <button
        onClick={() => navigate('/accounts')}
        className="flex items-center gap-1.5 text-sm mb-6 hover:underline"
        style={{ color: '#5C6470', fontFamily: 'Geist, sans-serif' }}
      >
        {t.backToAccounts}
      </button>

      {statusError && (
        <ErrorBanner message={statusError} className="mb-4" onRetry={() => setStatusError('')} />
      )}

      {/* Main 2-col grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
        {/* Balance card */}
        <div
          className="rounded-xl p-6"
          style={{ background: 'linear-gradient(135deg, #0F2A47 0%, #173A5E 100%)' }}
        >
          <div className="flex items-start justify-between mb-6">
            <div>
              <p
                className="text-[10px] tracking-[0.14em] uppercase mb-1.5"
                style={{ color: '#C8A878', fontFamily: '"Geist Mono", monospace' }}
              >
                {account.accountType}
              </p>
              <StatusBadge status={account.status} />
            </div>
          </div>

          <div className="space-y-3 mb-6">
            <div className="flex justify-between items-center">
              <span className="text-sm" style={{ color: 'rgba(200,216,229,0.6)', fontFamily: 'Geist, sans-serif' }}>
                {t.available}
              </span>
              <span
                className="text-2xl font-medium"
                style={{ color: '#fff', fontFamily: 'Fraunces, serif' }}
              >
                {formatAmount(account.balance?.availableAmount || 0)}
              </span>
            </div>
            <div className="h-px" style={{ backgroundColor: 'rgba(255,255,255,0.08)' }} />
            <div className="flex justify-between items-center">
              <span className="text-sm" style={{ color: 'rgba(200,216,229,0.6)', fontFamily: 'Geist, sans-serif' }}>
                {t.blocked}
              </span>
              <span className="text-base" style={{ color: 'rgba(255,255,255,0.7)', fontFamily: '"Geist Mono", monospace' }}>
                {formatAmount(account.balance?.blockedAmount || 0)}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm" style={{ color: 'rgba(200,216,229,0.6)', fontFamily: 'Geist, sans-serif' }}>
                {t.total}
              </span>
              <span className="text-base" style={{ color: 'rgba(255,255,255,0.7)', fontFamily: '"Geist Mono", monospace' }}>
                {formatAmount(account.balance?.totalAmount || 0)}
              </span>
            </div>
          </div>

          <div className="pt-4 border-t" style={{ borderColor: 'rgba(255,255,255,0.08)' }}>
            <p
              className="text-xs mb-1"
              style={{ color: 'rgba(200,216,229,0.4)', fontFamily: '"Geist Mono", monospace' }}
            >
              IBAN
            </p>
            <p
              className="text-sm tracking-wider"
              style={{ color: 'rgba(200,216,229,0.8)', fontFamily: '"Geist Mono", monospace' }}
            >
              {account.iban}
            </p>
          </div>
        </div>

        {/* Details + controls */}
        <div className="rounded-xl border p-6" style={{ backgroundColor: '#fff', borderColor: '#E5E2D9' }}>
          <h3
            className="text-base font-semibold mb-4"
            style={{ fontFamily: 'Fraunces, serif', color: '#14181F' }}
          >
            Account details
          </h3>

          <div className="space-y-3 mb-6">
            {[
              { label: 'Type', value: account.accountType },
              { label: 'Account number', value: account.accountNumber, mono: true },
              { label: 'Currency', value: account.balance?.currencyCode },
              { label: 'Opened', value: formatDate(account.openedAt) },
              account.branchName && { label: 'Branch', value: account.branchName },
            ].filter(Boolean).map((item: any) => (
              <div key={item.label} className="flex justify-between items-center py-2 border-b" style={{ borderColor: '#EFEDE6' }}>
                <span className="text-xs" style={{ color: '#8A8F99', fontFamily: 'Geist, sans-serif' }}>
                  {item.label}
                </span>
                <span
                  className="text-sm font-medium"
                  style={{
                    color: '#14181F',
                    fontFamily: item.mono ? '"Geist Mono", monospace' : 'Geist, sans-serif',
                  }}
                >
                  {item.value}
                </span>
              </div>
            ))}
          </div>

          <div className="border-t pt-4 space-y-2" style={{ borderColor: '#EFEDE6' }}>
            <p className="text-xs font-medium mb-3" style={{ color: '#8A8F99', fontFamily: '"Geist Mono", monospace' }}>
              ACCOUNT CONTROLS
            </p>
            {canFreeze && (
              <button
                onClick={() => setModal('freeze')}
                className="w-full flex items-center gap-2 px-4 py-2.5 rounded-lg border text-sm font-medium transition-colors hover:bg-[#FBF1E2]"
                style={{ borderColor: '#E5E2D9', color: '#B5781E', fontFamily: 'Geist, sans-serif' }}
              >
                <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-4 h-4">
                  <path d="M8 1v14M1 8h14M3.17 3.17l9.66 9.66M12.83 3.17L3.17 12.83" />
                </svg>
                {t.freeze}
              </button>
            )}
            {canUnfreeze && (
              <button
                onClick={() => setModal('unfreeze')}
                className="w-full flex items-center gap-2 px-4 py-2.5 rounded-lg border text-sm font-medium"
                style={{ borderColor: '#E5E2D9', color: '#1F7A4D', fontFamily: 'Geist, sans-serif' }}
              >
                Unfreeze account
              </button>
            )}
            {canClose && (
              <button
                onClick={() => setModal('close')}
                className="w-full flex items-center gap-2 px-4 py-2.5 rounded-lg border text-sm font-medium transition-colors hover:bg-[#FBEDEB]"
                style={{ borderColor: '#E5E2D9', color: '#A8362F', fontFamily: 'Geist, sans-serif' }}
              >
                <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-4 h-4">
                  <circle cx="8" cy="8" r="6.5" />
                  <line x1="5.5" y1="5.5" x2="10.5" y2="10.5" />
                  <line x1="10.5" y1="5.5" x2="5.5" y2="10.5" />
                </svg>
                {t.close}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Bottom 2-col: cards + transactions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Cards on account */}
        <div className="rounded-xl border" style={{ backgroundColor: '#fff', borderColor: '#E5E2D9' }}>
          <div className="flex items-center justify-between px-5 py-4 border-b" style={{ borderColor: '#EFEDE6' }}>
            <h3 className="text-sm font-semibold" style={{ fontFamily: 'Fraunces, serif', color: '#14181F' }}>
              Linked cards
            </h3>
            <Link to="/cards/issue" className="text-xs hover:underline" style={{ color: '#C8A878', fontFamily: 'Geist, sans-serif' }}>
              {t.issueCard}
            </Link>
          </div>
          <div className="p-5">
            {accountCards.length === 0 ? (
              <p className="text-sm text-center py-4" style={{ color: '#8A8F99', fontFamily: 'Geist, sans-serif' }}>
                {t.noCardsYet}
              </p>
            ) : (
              <div className="space-y-2">
                {accountCards.map(card => (
                  <Link
                    key={card.id}
                    to={`/cards/${card.id}`}
                    className="flex items-center gap-3 p-3 rounded-lg border hover:border-[#C8A878] transition-colors"
                    style={{ borderColor: '#EFEDE6' }}
                  >
                    <div
                      className="w-8 h-8 rounded flex items-center justify-center text-[10px] font-bold"
                      style={{ backgroundColor: '#0F2A47', color: '#C8A878', fontFamily: '"Geist Mono", monospace' }}
                    >
                      {card.cardType[0]}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium" style={{ color: '#14181F', fontFamily: 'Geist, sans-serif' }}>
                        {card.cardType} card
                      </p>
                      <p className="text-[11px]" style={{ color: '#8A8F99', fontFamily: '"Geist Mono", monospace' }}>
                        {card.maskedPan}
                      </p>
                    </div>
                    <StatusBadge status={card.status} />
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Recent transactions */}
        <div className="rounded-xl border" style={{ backgroundColor: '#fff', borderColor: '#E5E2D9' }}>
          <div className="flex items-center justify-between px-5 py-4 border-b" style={{ borderColor: '#EFEDE6' }}>
            <h3 className="text-sm font-semibold" style={{ fontFamily: 'Fraunces, serif', color: '#14181F' }}>
              Recent transactions
            </h3>
            <Link to="/transactions" className="text-xs hover:underline" style={{ color: '#C8A878', fontFamily: 'Geist, sans-serif' }}>
              View all
            </Link>
          </div>
          <div className="px-5">
            {transactions.length === 0 ? (
              <p className="text-sm text-center py-8" style={{ color: '#8A8F99', fontFamily: 'Geist, sans-serif' }}>
                {t.noTxnsYet}
              </p>
            ) : (
              transactions.map(tx => (
                <Link
                  key={tx.id}
                  to={`/transactions/${tx.id}`}
                  className="flex items-center justify-between py-3 border-b last:border-0 hover:opacity-80"
                  style={{ borderColor: '#EFEDE6' }}
                >
                  <div>
                    <p className="text-sm font-medium" style={{ color: '#14181F', fontFamily: 'Geist, sans-serif' }}>
                      {tx.description || tx.type}
                    </p>
                    <p className="text-[11px]" style={{ color: '#8A8F99', fontFamily: '"Geist Mono", monospace' }}>
                      {formatDateTime(tx.initiatedAt)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold" style={{ color: '#14181F', fontFamily: '"Geist Mono", monospace' }}>
                      {formatAmount(tx.amount)} {tx.currency}
                    </p>
                    <StatusBadge status={tx.status} />
                  </div>
                </Link>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Modals */}
      <Modal
        isOpen={modal === 'freeze'}
        onClose={() => setModal(null)}
        onConfirm={() => statusMutation.mutate({ status: 'FROZEN', reason: 'User requested freeze' })}
        title="Freeze this account?"
        confirmLabel="Freeze"
        variant="danger"
        loading={statusMutation.isPending}
      >
        Freezing will prevent all transactions. You can unfreeze at any time.
      </Modal>

      <Modal
        isOpen={modal === 'unfreeze'}
        onClose={() => setModal(null)}
        onConfirm={() => statusMutation.mutate({ status: 'ACTIVE', reason: 'User requested unfreeze' })}
        title="Unfreeze this account?"
        confirmLabel="Activate"
        loading={statusMutation.isPending}
      >
        The account will become active and accept transactions again.
      </Modal>

      <Modal
        isOpen={modal === 'close'}
        onClose={() => setModal(null)}
        onConfirm={() => statusMutation.mutate({ status: 'CLOSED', reason: 'User requested closure' })}
        title="Close this account?"
        confirmLabel="Close account"
        variant="danger"
        loading={statusMutation.isPending}
      >
        This action is permanent and cannot be undone. Ensure your balance is zero before closing.
      </Modal>
    </div>
  );
}
