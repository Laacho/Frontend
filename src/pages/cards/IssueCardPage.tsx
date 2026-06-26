import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { cardsApi } from '../../api/cards';
import { accountsApi } from '../../api/accounts';
import { ErrorBanner } from '../../components/ui/ErrorBanner';
import { Spinner } from '../../components/ui/Spinner';
import { getApiError } from '../../api/client';
import { useLang } from '../../hooks/useLang';

const CARD_TYPES = [
  {
    value: 'DEBIT',
    label: 'Debit',
    description: 'Spend your available balance directly. No credit.',
    icon: '↔',
    bg: 'linear-gradient(135deg, #0F2A47 0%, #173A5E 100%)',
    textColor: 'var(--c-surface)',
  },
  {
    value: 'CREDIT',
    label: 'Credit',
    description: 'Revolving credit line, repaid monthly.',
    icon: '◈',
    bg: 'linear-gradient(135deg, #1a1a2e 0%, #0f3460 100%)',
    textColor: 'var(--c-surface)',
  },
  {
    value: 'VIRTUAL',
    label: 'Virtual',
    description: 'Digital-only card for online payments.',
    icon: '⬡',
    bg: 'linear-gradient(135deg, #C8A878 0%, #A07840 100%)',
    textColor: '#0F2A47',
  },
];

export function IssueCardPage() {
  const { t } = useLang();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [accountId, setAccountId] = useState('');
  const [cardType, setCardType] = useState('DEBIT');
  const [pin, setPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [error, setError] = useState('');

  const { data: accountsData } = useQuery({
    queryKey: ['accounts'],
    queryFn: () => accountsApi.list(0, 50),
  });

  const mutation = useMutation({
    mutationFn: () => cardsApi.create({ accountId, cardType, pin }),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['cards'] });
      navigate(`/cards/${data.id}`);
    },
    onError: (err) => {
      setError(getApiError(err));
    },
  });

  const accounts = accountsData?.content.filter(a => a.status === 'ACTIVE') || [];

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!accountId) {
      setError('Select an account to link this card to');
      return;
    }
    if (!/^\d{4}$/.test(pin)) {
      setError('PIN must be exactly 4 digits');
      return;
    }
    if (pin !== confirmPin) {
      setError('PINs do not match');
      return;
    }
    setError('');
    mutation.mutate();
  }

  return (
    <div className="max-w-xl mx-auto animate-bub-fade">
      <button
        onClick={() => navigate('/cards')}
        className="flex items-center gap-1.5 text-sm mb-6 hover:underline"
        style={{ color: 'var(--c-text-2)', fontFamily: 'Geist, sans-serif' }}
      >
        {t.backToCards}
      </button>

      <div className="rounded-xl border p-8" style={{ backgroundColor: 'var(--c-surface)', borderColor: 'var(--c-border)' }}>
        <h2 className="text-xl font-semibold mb-1" style={{ fontFamily: 'Fraunces, serif', color: 'var(--c-text)' }}>
          {t.issueCard}
        </h2>
        <p className="text-sm mb-8" style={{ color: 'var(--c-text-2)', fontFamily: 'Geist, sans-serif' }}>
          Link a new card to one of your active accounts.
        </p>

        <form onSubmit={handleSubmit}>
          {/* Source account */}
          <div className="mb-6">
            <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--c-text-2)', fontFamily: 'Geist, sans-serif' }}>
              Source account
            </label>
            <select
              value={accountId}
              onChange={e => setAccountId(e.target.value)}
              className="w-full px-3 py-2.5 rounded-lg border text-sm outline-none"
              style={{ borderColor: 'var(--c-border)', backgroundColor: 'var(--c-surface)', color: 'var(--c-text)', fontFamily: 'Geist, sans-serif' }}
            >
              <option value="">Select account…</option>
              {accounts.map(a => (
                <option key={a.id} value={a.id}>
                  {a.accountType} — {a.iban} ({a.balance?.currencyCode})
                </option>
              ))}
            </select>
          </div>

          {/* Card type */}
          <div className="mb-6">
            <p className="text-[10px] tracking-[0.14em] uppercase font-semibold mb-3" style={{ color: 'var(--c-text-muted)', fontFamily: '"Geist Mono", monospace' }}>
              Card type
            </p>
            <div className="grid grid-cols-3 gap-3">
              {CARD_TYPES.map(ct => (
                <button
                  key={ct.value}
                  type="button"
                  onClick={() => setCardType(ct.value)}
                  className="rounded-xl overflow-hidden border-2 transition-colors"
                  style={{ borderColor: cardType === ct.value ? '#0F2A47' : 'transparent' }}
                >
                  <div className="p-4 text-left" style={{ background: ct.bg }}>
                    <div className="text-xl mb-3" style={{ color: ct.textColor }}>{ct.icon}</div>
                    <p className="text-sm font-semibold mb-1" style={{ color: ct.textColor, fontFamily: 'Geist, sans-serif' }}>
                      {ct.label}
                    </p>
                    <p className="text-[10px] leading-relaxed" style={{ color: ct.textColor, opacity: 0.7, fontFamily: 'Geist, sans-serif' }}>
                      {ct.description}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Card PIN */}
          <div className="mb-6">
            <p className="text-[10px] tracking-[0.14em] uppercase font-semibold mb-3" style={{ color: 'var(--c-text-muted)', fontFamily: '"Geist Mono", monospace' }}>
              Card PIN
            </p>
            <div className="grid grid-cols-2 gap-3">
              <input
                type="password"
                inputMode="numeric"
                maxLength={4}
                value={pin}
                onChange={e => setPin(e.target.value.replace(/\D/g, ''))}
                placeholder="4-digit PIN"
                className="px-3 py-2.5 rounded-lg border text-sm outline-none tracking-[0.3em]"
                style={{ borderColor: 'var(--c-border)', backgroundColor: 'var(--c-surface)', color: 'var(--c-text)', fontFamily: '"Geist Mono", monospace' }}
              />
              <input
                type="password"
                inputMode="numeric"
                maxLength={4}
                value={confirmPin}
                onChange={e => setConfirmPin(e.target.value.replace(/\D/g, ''))}
                placeholder="Confirm PIN"
                className="px-3 py-2.5 rounded-lg border text-sm outline-none tracking-[0.3em]"
                style={{ borderColor: 'var(--c-border)', backgroundColor: 'var(--c-surface)', color: 'var(--c-text)', fontFamily: '"Geist Mono", monospace' }}
              />
            </div>
            <p className="text-[11px] mt-2" style={{ color: 'var(--c-text-muted)', fontFamily: 'Geist, sans-serif' }}>
              You'll need this PIN to freeze or unfreeze the card.
            </p>
          </div>

          {error && <ErrorBanner message={error} className="mb-4" />}

          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => navigate('/cards')}
              className="flex-1 py-2.5 rounded-lg text-sm font-medium border"
              style={{ borderColor: 'var(--c-border)', color: 'var(--c-text-2)', backgroundColor: 'var(--c-surface)', fontFamily: 'Geist, sans-serif' }}
            >
              {t.cancel}
            </button>
            <button
              type="submit"
              disabled={mutation.isPending}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium disabled:opacity-60"
              style={{ backgroundColor: '#0F2A47', color: 'var(--c-on-brand)', fontFamily: 'Geist, sans-serif' }}
            >
              {mutation.isPending && <Spinner size="sm" className="text-white" />}
              Issue card
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
