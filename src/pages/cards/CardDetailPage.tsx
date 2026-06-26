import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { cardsApi } from '../../api/cards';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { PageSpinner } from '../../components/ui/Spinner';
import { ErrorBanner } from '../../components/ui/ErrorBanner';
import { Modal } from '../../components/ui/Modal';
import { formatAmount, formatDateTime } from '../../utils/format';
import { getApiError } from '../../api/client';
import { useLang } from '../../hooks/useLang';
import type { CardResponse } from '../../types';

function CardVisual({ card }: { card: CardResponse }) {
  const isVirtual = card.cardType === 'VIRTUAL';
  const isCredit = card.cardType === 'CREDIT';

  const bg = isVirtual
    ? 'linear-gradient(135deg, #C8A878 0%, #B8946A 50%, #A07840 100%)'
    : isCredit
    ? 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)'
    : 'linear-gradient(135deg, #0F2A47 0%, #1A3F6F 60%, #173A5E 100%)';

  return (
    <div
      className="relative rounded-xl overflow-hidden w-full"
      style={{ aspectRatio: '1.586 / 1', background: bg, padding: '22px 24px' }}
    >
      {isVirtual && (
        <div className="absolute inset-0 opacity-10" style={{
          backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 8px, rgba(255,255,255,0.3) 8px, rgba(255,255,255,0.3) 9px)',
        }} />
      )}
      <div className="relative h-full flex flex-col justify-between">
        <div className="flex justify-between items-start">
          <p className="text-[10px] tracking-[0.2em] uppercase opacity-70"
            style={{ color: isVirtual ? '#0F2A47' : '#fff', fontFamily: '"Geist Mono", monospace' }}>
            Balkan United Bank
          </p>
          <div className="w-8 h-5 rounded" style={{ backgroundColor: isVirtual ? 'rgba(15,42,71,0.3)' : 'rgba(200,168,120,0.5)' }} />
        </div>
        <div className="w-10 h-7 rounded" style={{ backgroundColor: isVirtual ? 'rgba(15,42,71,0.4)' : '#C8A878', border: '1px solid rgba(255,255,255,0.3)' }} />
        <div>
          <p className="text-base font-medium tracking-widest mb-1"
            style={{ color: isVirtual ? '#0F2A47' : '#fff', fontFamily: '"Geist Mono", monospace', opacity: 0.9 }}>
            {card.maskedPan}
          </p>
          <div className="flex justify-between">
            <p className="text-xs opacity-70" style={{ color: isVirtual ? '#0F2A47' : '#fff', fontFamily: '"Geist Mono", monospace' }}>
              {card.expiryDate}
            </p>
            <p className="text-xs font-semibold" style={{ color: isVirtual ? '#0F2A47' : '#C8A878', fontFamily: '"Geist Mono", monospace' }}>
              {card.cardType}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function UsageBar({ used, limit, label }: { used: number; limit: number; label: string }) {
  const pct = limit > 0 ? Math.min(100, (used / limit) * 100) : 0;
  const color = pct > 90 ? '#A8362F' : pct > 70 ? '#B5781E' : '#1F7A4D';
  return (
    <div>
      <div className="flex justify-between items-center mb-1">
        <span className="text-xs" style={{ color: '#5C6470', fontFamily: 'Geist, sans-serif' }}>{label}</span>
        <span className="text-xs font-medium" style={{ color: '#14181F', fontFamily: '"Geist Mono", monospace' }}>
          {formatAmount(limit)}
        </span>
      </div>
      <div className="h-1.5 rounded-full" style={{ backgroundColor: '#EFEDE6' }}>
        <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, backgroundColor: color }} />
      </div>
    </div>
  );
}

export function CardDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { t } = useLang();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [modal, setModal] = useState<'block' | 'terminate' | null>(null);
  const [limitError, setLimitError] = useState('');
  const [limitsForm, setLimitsForm] = useState({ daily: '', monthly: '', single: '' });
  const [limitsLoaded, setLimitsLoaded] = useState(false);

  const { data: card, isLoading, isError, error, refetch } = useQuery({
    queryKey: ['card', id],
    queryFn: () => cardsApi.get(id!),
    enabled: !!id,
  });

  const { data: txData, isLoading: txLoading } = useQuery({
    queryKey: ['card-transactions', id],
    queryFn: () => cardsApi.getTransactions(id!, 0, 10),
    enabled: !!id,
  });

  React.useEffect(() => {
    if (card && !limitsLoaded) {
      setLimitsForm({
        daily: String(card.limits?.daily || 0),
        monthly: String(card.limits?.monthly || 0),
        single: String(card.limits?.single || 0),
      });
      setLimitsLoaded(true);
    }
  }, [card, limitsLoaded]);

  const statusMutation = useMutation({
    mutationFn: ({ status, reason }: { status: string; reason: string }) =>
      cardsApi.updateStatus(id!, status, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['card', id] });
      queryClient.invalidateQueries({ queryKey: ['cards'] });
      setModal(null);
    },
  });

  const limitsMutation = useMutation({
    mutationFn: () => {
      const daily = parseFloat(limitsForm.daily);
      const monthly = parseFloat(limitsForm.monthly);
      const single = parseFloat(limitsForm.single);
      if (single > daily) throw new Error('Single transaction limit cannot exceed daily limit');
      if (daily > monthly) throw new Error('Daily limit cannot exceed monthly limit');
      return cardsApi.updateLimits(id!, { dailyLimit: daily, monthlyLimit: monthly, singleTransactionLimit: single });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['card', id] });
      queryClient.invalidateQueries({ queryKey: ['cards'] });
      setLimitError('');
    },
    onError: (err) => {
      setLimitError(getApiError(err));
    },
  });

  if (isLoading) return <PageSpinner />;
  if (isError || !card) return (
    <div className="max-w-lg">
      <button onClick={() => navigate('/cards')} className="flex items-center gap-1.5 text-sm mb-4 hover:underline" style={{ color: '#5C6470', fontFamily: 'Geist, sans-serif' }}>
        {t.backToCards}
      </button>
      <ErrorBanner message={(error as Error)?.message || 'Card not found'} onRetry={() => refetch()} />
    </div>
  );

  const txList = txData?.content || [];

  return (
    <div className="animate-bub-fade">
      <button onClick={() => navigate('/cards')} className="flex items-center gap-1.5 text-sm mb-6 hover:underline" style={{ color: '#5C6470', fontFamily: 'Geist, sans-serif' }}>
        {t.backToCards}
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Card visual + status */}
        <div>
          <CardVisual card={card} />

          <div className="mt-4 rounded-xl border p-5" style={{ backgroundColor: '#fff', borderColor: '#E5E2D9' }}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold" style={{ fontFamily: 'Fraunces, serif', color: '#14181F' }}>
                Card status
              </h3>
              <StatusBadge status={card.status} />
            </div>

            <div className="space-y-2">
              {card.status === 'BLOCKED' ? (
                <button
                  onClick={() => statusMutation.mutate({ status: 'ACTIVE', reason: 'User unblocked card' })}
                  disabled={statusMutation.isPending}
                  className="w-full py-2.5 rounded-lg text-sm font-medium border transition-colors"
                  style={{ borderColor: '#1F7A4D', color: '#1F7A4D', fontFamily: 'Geist, sans-serif' }}
                >
                  {t.activate}
                </button>
              ) : card.status === 'ACTIVE' ? (
                <button
                  onClick={() => setModal('block')}
                  className="w-full py-2.5 rounded-lg text-sm font-medium border transition-colors hover:bg-[#FBF1E2]"
                  style={{ borderColor: '#E5E2D9', color: '#B5781E', fontFamily: 'Geist, sans-serif' }}
                >
                  {t.blockCard}
                </button>
              ) : null}

              {card.status !== 'EXPIRED' && (
                <button
                  onClick={() => setModal('terminate')}
                  className="w-full py-2.5 rounded-lg text-sm font-medium border transition-colors hover:bg-[#FBEDEB]"
                  style={{ borderColor: '#E5E2D9', color: '#A8362F', fontFamily: 'Geist, sans-serif' }}
                >
                  {t.terminate}
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Right: Limits + transactions */}
        <div className="space-y-4">
          <div className="rounded-xl border p-5" style={{ backgroundColor: '#fff', borderColor: '#E5E2D9' }}>
            <h3 className="text-sm font-semibold mb-4" style={{ fontFamily: 'Fraunces, serif', color: '#14181F' }}>
              {t.limits}
            </h3>

            {limitError && <ErrorBanner message={limitError} className="mb-3" />}

            <div className="space-y-4 mb-4">
              <UsageBar used={0} limit={card.limits?.single || 0} label={t.singleLimit} />
              <UsageBar used={0} limit={card.limits?.daily || 0} label={t.dailyLimit} />
              <UsageBar used={0} limit={card.limits?.monthly || 0} label={t.monthlyLimit} />
            </div>

            <div className="border-t pt-4 space-y-3" style={{ borderColor: '#EFEDE6' }}>
              <p className="text-[10px] tracking-[0.14em] uppercase" style={{ color: '#8A8F99', fontFamily: '"Geist Mono", monospace' }}>
                Update limits
              </p>
              {[
                { key: 'single', label: t.singleLimit },
                { key: 'daily', label: t.dailyLimit },
                { key: 'monthly', label: t.monthlyLimit },
              ].map(({ key, label }) => (
                <div key={key}>
                  <label className="block text-xs mb-1" style={{ color: '#5C6470', fontFamily: 'Geist, sans-serif' }}>{label}</label>
                  <input
                    type="number"
                    value={limitsForm[key as keyof typeof limitsForm]}
                    onChange={e => setLimitsForm(prev => ({ ...prev, [key]: e.target.value }))}
                    className="w-full px-3 py-2 rounded-lg border text-sm outline-none"
                    style={{ borderColor: '#E5E2D9', backgroundColor: '#fff', color: '#14181F', fontFamily: '"Geist Mono", monospace' }}
                    min="0"
                    step="0.01"
                  />
                </div>
              ))}
              <button
                onClick={() => limitsMutation.mutate()}
                disabled={limitsMutation.isPending}
                className="w-full py-2 rounded-lg text-sm font-medium disabled:opacity-60"
                style={{ backgroundColor: '#0F2A47', color: '#fff', fontFamily: 'Geist, sans-serif' }}
              >
                {limitsMutation.isPending ? 'Saving…' : t.saveChanges}
              </button>
            </div>
          </div>

          {/* Card transactions */}
          <div className="rounded-xl border" style={{ backgroundColor: '#fff', borderColor: '#E5E2D9' }}>
            <div className="px-5 py-4 border-b" style={{ borderColor: '#EFEDE6' }}>
              <h3 className="text-sm font-semibold" style={{ fontFamily: 'Fraunces, serif', color: '#14181F' }}>
                Card transactions
              </h3>
            </div>
            <div className="px-5">
              {txLoading ? (
                <div className="py-8 text-center">
                  <div className="w-5 h-5 rounded-full border-2 border-[#C8A878] border-t-transparent animate-bub-spin mx-auto" />
                </div>
              ) : txList.length === 0 ? (
                <p className="py-8 text-center text-sm" style={{ color: '#8A8F99', fontFamily: 'Geist, sans-serif' }}>No transactions yet</p>
              ) : (
                txList.map(tx => (
                  <div key={tx.id} className="flex items-center justify-between py-3 border-b last:border-0" style={{ borderColor: '#EFEDE6' }}>
                    <div>
                      <p className="text-sm font-medium" style={{ color: '#14181F', fontFamily: 'Geist, sans-serif' }}>
                        {tx.merchantName || tx.merchantCategory || 'Card payment'}
                      </p>
                      <p className="text-[11px]" style={{ color: '#8A8F99', fontFamily: '"Geist Mono", monospace' }}>
                        {formatDateTime(tx.occurredAt)}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold" style={{ color: '#14181F', fontFamily: '"Geist Mono", monospace' }}>
                        {formatAmount(tx.amount)} {tx.currencyCode}
                      </p>
                      <StatusBadge status={tx.status} />
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      <Modal
        isOpen={modal === 'block'}
        onClose={() => setModal(null)}
        onConfirm={() => statusMutation.mutate({ status: 'BLOCKED', reason: 'User blocked card' })}
        title="Block this card?"
        confirmLabel="Block card"
        variant="danger"
        loading={statusMutation.isPending}
      >
        All transactions will be declined until you unblock the card.
      </Modal>

      <Modal
        isOpen={modal === 'terminate'}
        onClose={() => setModal(null)}
        onConfirm={() => statusMutation.mutate({ status: 'BLOCKED', reason: 'User terminated card' })}
        title="Terminate this card?"
        confirmLabel="Terminate"
        variant="danger"
        loading={statusMutation.isPending}
      >
        This permanently deactivates the card. A replacement card can be issued from your account.
      </Modal>
    </div>
  );
}
