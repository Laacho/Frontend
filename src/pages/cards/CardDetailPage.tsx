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
            style={{ color: isVirtual ? '#0F2A47' : 'var(--c-surface)', fontFamily: '"Geist Mono", monospace' }}>
            Balkan United Bank
          </p>
          <div className="w-8 h-5 rounded" style={{ backgroundColor: isVirtual ? 'rgba(15,42,71,0.3)' : 'rgba(200,168,120,0.5)' }} />
        </div>
        <div className="w-10 h-7 rounded" style={{ backgroundColor: isVirtual ? 'rgba(15,42,71,0.4)' : '#C8A878', border: '1px solid rgba(255,255,255,0.3)' }} />
        <div>
          <p className="text-base font-medium tracking-widest mb-1"
            style={{ color: isVirtual ? '#0F2A47' : 'var(--c-surface)', fontFamily: '"Geist Mono", monospace', opacity: 0.9 }}>
            {card.maskedPan}
          </p>
          <div className="flex justify-between">
            <p className="text-xs opacity-70" style={{ color: isVirtual ? '#0F2A47' : 'var(--c-surface)', fontFamily: '"Geist Mono", monospace' }}>
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
        <span className="text-xs" style={{ color: 'var(--c-text-2)', fontFamily: 'Geist, sans-serif' }}>{label}</span>
        <span className="text-xs font-medium" style={{ color: 'var(--c-text)', fontFamily: '"Geist Mono", monospace' }}>
          {formatAmount(limit)}
        </span>
      </div>
      <div className="h-1.5 rounded-full" style={{ backgroundColor: 'var(--c-surface-2)' }}>
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

  const [modal, setModal] = useState<'block' | 'unblock' | 'terminate' | null>(null);
  const [pin, setPin] = useState('');
  const [statusError, setStatusError] = useState('');
  const [limitError, setLimitError] = useState('');
  const [limitsForm, setLimitsForm] = useState({ daily: '', monthly: '', single: '' });
  const [limitsLoaded, setLimitsLoaded] = useState(false);
  const [pinForm, setPinForm] = useState({ old: '', next: '', confirm: '' });
  const [pinError, setPinError] = useState('');
  const [pinSuccess, setPinSuccess] = useState('');

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
      cardsApi.updateStatus(id!, status, reason, pin),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['card', id] });
      queryClient.invalidateQueries({ queryKey: ['cards'] });
      setModal(null);
      setPin('');
      setStatusError('');
    },
    onError: (err) => setStatusError(getApiError(err)),
  });

  const changePinMutation = useMutation({
    // PIN-less card → initial set (oldPin null); otherwise change (oldPin required).
    mutationFn: () => cardsApi.changePin(id!, card?.pinSet ? pinForm.old : null, pinForm.next),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['card', id] });
      queryClient.invalidateQueries({ queryKey: ['cards'] });
      setPinForm({ old: '', next: '', confirm: '' });
      setPinError('');
      setPinSuccess('PIN updated');
    },
    onError: (err) => { setPinSuccess(''); setPinError(getApiError(err)); },
  });

  function submitPinChange() {
    setPinSuccess('');
    if (!/^\d{4}$/.test(pinForm.next)) { setPinError('PIN must be exactly 4 digits'); return; }
    if (pinForm.next !== pinForm.confirm) { setPinError('PINs do not match'); return; }
    setPinError('');
    changePinMutation.mutate();
  }

  // status → {target status, reason, modal title/label/body}
  const statusAction: Record<'block' | 'unblock' | 'terminate', { status: string; reason: string; title: string; label: string; body: string }> = {
    block: { status: 'BLOCKED', reason: 'User blocked card', title: 'Block this card?', label: 'Block card', body: 'All transactions will be declined until you unblock the card.' },
    unblock: { status: 'ACTIVE', reason: 'User unblocked card', title: 'Unblock this card?', label: 'Unblock card', body: 'The card will be active again for transactions.' },
    terminate: { status: 'BLOCKED', reason: 'User terminated card', title: 'Terminate this card?', label: 'Terminate', body: 'This deactivates the card. A replacement can be issued from your account.' },
  };

  function openStatusModal(which: 'block' | 'unblock' | 'terminate') {
    setPin('');
    setStatusError('');
    setModal(which);
  }

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
      <button onClick={() => navigate('/cards')} className="flex items-center gap-1.5 text-sm mb-4 hover:underline" style={{ color: 'var(--c-text-2)', fontFamily: 'Geist, sans-serif' }}>
        {t.backToCards}
      </button>
      <ErrorBanner message={(error as Error)?.message || 'Card not found'} onRetry={() => refetch()} />
    </div>
  );

  const txList = txData?.content || [];

  return (
    <div className="animate-bub-fade">
      <button onClick={() => navigate('/cards')} className="flex items-center gap-1.5 text-sm mb-6 hover:underline" style={{ color: 'var(--c-text-2)', fontFamily: 'Geist, sans-serif' }}>
        {t.backToCards}
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Card visual + status */}
        <div>
          <CardVisual card={card} />

          <div className="mt-4 rounded-xl border p-5" style={{ backgroundColor: 'var(--c-surface)', borderColor: 'var(--c-border)' }}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold" style={{ fontFamily: 'Fraunces, serif', color: 'var(--c-text)' }}>
                Card status
              </h3>
              <StatusBadge status={card.status} />
            </div>

            {!card.pinSet && (
              <p className="text-xs mb-3 px-3 py-2 rounded-lg" style={{ backgroundColor: '#FBF1E2', color: '#B5781E', fontFamily: 'Geist, sans-serif' }}>
                Set a card PIN below to enable freeze / unfreeze.
              </p>
            )}
            <div className="space-y-2">
              {card.status === 'BLOCKED' ? (
                <button
                  onClick={() => openStatusModal('unblock')}
                  disabled={!card.pinSet}
                  className="w-full py-2.5 rounded-lg text-sm font-medium border transition-colors disabled:opacity-50"
                  style={{ borderColor: '#1F7A4D', color: '#1F7A4D', fontFamily: 'Geist, sans-serif' }}
                >
                  {t.activate}
                </button>
              ) : card.status === 'ACTIVE' ? (
                <button
                  onClick={() => openStatusModal('block')}
                  disabled={!card.pinSet}
                  className="w-full py-2.5 rounded-lg text-sm font-medium border transition-colors hover:bg-[#FBF1E2] disabled:opacity-50"
                  style={{ borderColor: 'var(--c-border)', color: '#B5781E', fontFamily: 'Geist, sans-serif' }}
                >
                  {t.blockCard}
                </button>
              ) : null}

              {card.status !== 'EXPIRED' && (
                <button
                  onClick={() => openStatusModal('terminate')}
                  disabled={!card.pinSet}
                  className="w-full py-2.5 rounded-lg text-sm font-medium border transition-colors hover:bg-[#FBEDEB] disabled:opacity-50"
                  style={{ borderColor: 'var(--c-border)', color: '#A8362F', fontFamily: 'Geist, sans-serif' }}
                >
                  {t.terminate}
                </button>
              )}
            </div>

            {/* Set / Change PIN */}
            <div className="mt-5 pt-5 border-t" style={{ borderColor: 'var(--c-surface-2)' }}>
              <p className="text-[10px] tracking-[0.14em] uppercase mb-3" style={{ color: 'var(--c-text-muted)', fontFamily: '"Geist Mono", monospace' }}>
                {card.pinSet ? 'Change PIN' : 'Set PIN'}
              </p>
              {pinError && <ErrorBanner message={pinError} className="mb-3" />}
              {pinSuccess && (
                <p className="text-xs mb-3 px-3 py-2 rounded-lg" style={{ backgroundColor: '#E3F2EA', color: '#1F7A4D', fontFamily: 'Geist, sans-serif' }}>{pinSuccess}</p>
              )}
              <div className="space-y-2">
                {card.pinSet && (
                  <input
                    type="password" inputMode="numeric" maxLength={4}
                    value={pinForm.old}
                    onChange={e => setPinForm(p => ({ ...p, old: e.target.value.replace(/\D/g, '') }))}
                    placeholder="Current PIN"
                    className="w-full px-3 py-2 rounded-lg border text-sm outline-none tracking-[0.3em]"
                    style={{ borderColor: 'var(--c-border)', backgroundColor: 'var(--c-surface)', color: 'var(--c-text)', fontFamily: '"Geist Mono", monospace' }}
                  />
                )}
                <input
                  type="password" inputMode="numeric" maxLength={4}
                  value={pinForm.next}
                  onChange={e => setPinForm(p => ({ ...p, next: e.target.value.replace(/\D/g, '') }))}
                  placeholder="New 4-digit PIN"
                  className="w-full px-3 py-2 rounded-lg border text-sm outline-none tracking-[0.3em]"
                  style={{ borderColor: 'var(--c-border)', backgroundColor: 'var(--c-surface)', color: 'var(--c-text)', fontFamily: '"Geist Mono", monospace' }}
                />
                <input
                  type="password" inputMode="numeric" maxLength={4}
                  value={pinForm.confirm}
                  onChange={e => setPinForm(p => ({ ...p, confirm: e.target.value.replace(/\D/g, '') }))}
                  placeholder="Confirm new PIN"
                  className="w-full px-3 py-2 rounded-lg border text-sm outline-none tracking-[0.3em]"
                  style={{ borderColor: 'var(--c-border)', backgroundColor: 'var(--c-surface)', color: 'var(--c-text)', fontFamily: '"Geist Mono", monospace' }}
                />
                <button
                  onClick={submitPinChange}
                  disabled={changePinMutation.isPending}
                  className="w-full py-2 rounded-lg text-sm font-medium disabled:opacity-60"
                  style={{ backgroundColor: '#0F2A47', color: 'var(--c-on-brand)', fontFamily: 'Geist, sans-serif' }}
                >
                  {changePinMutation.isPending ? 'Saving…' : (card.pinSet ? 'Change PIN' : 'Set PIN')}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Limits + transactions */}
        <div className="space-y-4">
          <div className="rounded-xl border p-5" style={{ backgroundColor: 'var(--c-surface)', borderColor: 'var(--c-border)' }}>
            <h3 className="text-sm font-semibold mb-4" style={{ fontFamily: 'Fraunces, serif', color: 'var(--c-text)' }}>
              {t.limits}
            </h3>

            {limitError && <ErrorBanner message={limitError} className="mb-3" />}

            <div className="space-y-4 mb-4">
              <UsageBar used={0} limit={card.limits?.single || 0} label={t.singleLimit} />
              <UsageBar used={0} limit={card.limits?.daily || 0} label={t.dailyLimit} />
              <UsageBar used={0} limit={card.limits?.monthly || 0} label={t.monthlyLimit} />
            </div>

            <div className="border-t pt-4 space-y-3" style={{ borderColor: 'var(--c-surface-2)' }}>
              <p className="text-[10px] tracking-[0.14em] uppercase" style={{ color: 'var(--c-text-muted)', fontFamily: '"Geist Mono", monospace' }}>
                Update limits
              </p>
              {[
                { key: 'single', label: t.singleLimit },
                { key: 'daily', label: t.dailyLimit },
                { key: 'monthly', label: t.monthlyLimit },
              ].map(({ key, label }) => (
                <div key={key}>
                  <label className="block text-xs mb-1" style={{ color: 'var(--c-text-2)', fontFamily: 'Geist, sans-serif' }}>{label}</label>
                  <input
                    type="number"
                    value={limitsForm[key as keyof typeof limitsForm]}
                    onChange={e => setLimitsForm(prev => ({ ...prev, [key]: e.target.value }))}
                    className="w-full px-3 py-2 rounded-lg border text-sm outline-none"
                    style={{ borderColor: 'var(--c-border)', backgroundColor: 'var(--c-surface)', color: 'var(--c-text)', fontFamily: '"Geist Mono", monospace' }}
                    min="0"
                    step="0.01"
                  />
                </div>
              ))}
              <button
                onClick={() => limitsMutation.mutate()}
                disabled={limitsMutation.isPending}
                className="w-full py-2 rounded-lg text-sm font-medium disabled:opacity-60"
                style={{ backgroundColor: '#0F2A47', color: 'var(--c-on-brand)', fontFamily: 'Geist, sans-serif' }}
              >
                {limitsMutation.isPending ? 'Saving…' : t.saveChanges}
              </button>
            </div>
          </div>

          {/* Card transactions */}
          <div className="rounded-xl border" style={{ backgroundColor: 'var(--c-surface)', borderColor: 'var(--c-border)' }}>
            <div className="px-5 py-4 border-b" style={{ borderColor: 'var(--c-surface-2)' }}>
              <h3 className="text-sm font-semibold" style={{ fontFamily: 'Fraunces, serif', color: 'var(--c-text)' }}>
                Card transactions
              </h3>
            </div>
            <div className="px-5">
              {txLoading ? (
                <div className="py-8 text-center">
                  <div className="w-5 h-5 rounded-full border-2 border-[#C8A878] border-t-transparent animate-bub-spin mx-auto" />
                </div>
              ) : txList.length === 0 ? (
                <p className="py-8 text-center text-sm" style={{ color: 'var(--c-text-muted)', fontFamily: 'Geist, sans-serif' }}>No transactions yet</p>
              ) : (
                txList.map(tx => (
                  <div key={tx.id} className="flex items-center justify-between py-3 border-b last:border-0" style={{ borderColor: 'var(--c-surface-2)' }}>
                    <div>
                      <p className="text-sm font-medium" style={{ color: 'var(--c-text)', fontFamily: 'Geist, sans-serif' }}>
                        {tx.merchantName || tx.merchantCategory || 'Card payment'}
                      </p>
                      <p className="text-[11px]" style={{ color: 'var(--c-text-muted)', fontFamily: '"Geist Mono", monospace' }}>
                        {formatDateTime(tx.occurredAt)}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold" style={{ color: 'var(--c-text)', fontFamily: '"Geist Mono", monospace' }}>
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
        isOpen={modal !== null}
        onClose={() => { setModal(null); setPin(''); setStatusError(''); }}
        onConfirm={() => modal && statusMutation.mutate({ status: statusAction[modal].status, reason: statusAction[modal].reason })}
        title={modal ? statusAction[modal].title : ''}
        confirmLabel={modal ? statusAction[modal].label : ''}
        variant="danger"
        loading={statusMutation.isPending}
      >
        <p className="mb-4">{modal ? statusAction[modal].body : ''}</p>
        <label className="block text-xs mb-1.5" style={{ color: 'var(--c-text-2)', fontFamily: 'Geist, sans-serif' }}>
          Enter your card PIN to confirm
        </label>
        <input
          type="password" inputMode="numeric" maxLength={4} autoFocus
          value={pin}
          onChange={e => setPin(e.target.value.replace(/\D/g, ''))}
          placeholder="••••"
          className="w-full px-3 py-2.5 rounded-lg border text-sm outline-none tracking-[0.4em] text-center"
          style={{ borderColor: 'var(--c-border)', backgroundColor: 'var(--c-surface)', color: 'var(--c-text)', fontFamily: '"Geist Mono", monospace' }}
        />
        {statusError && (
          <p className="text-xs mt-2" style={{ color: '#A8362F', fontFamily: 'Geist, sans-serif' }}>{statusError}</p>
        )}
      </Modal>
    </div>
  );
}
