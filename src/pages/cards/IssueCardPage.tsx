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
    textColor: '#fff',
  },
  {
    value: 'CREDIT',
    label: 'Credit',
    description: 'Revolving credit line, repaid monthly.',
    icon: '◈',
    bg: 'linear-gradient(135deg, #1a1a2e 0%, #0f3460 100%)',
    textColor: '#fff',
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
  const [error, setError] = useState('');

  const { data: accountsData } = useQuery({
    queryKey: ['accounts'],
    queryFn: () => accountsApi.list(0, 50),
  });

  const mutation = useMutation({
    mutationFn: () => cardsApi.create({ accountId, cardType }),
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
    setError('');
    mutation.mutate();
  }

  return (
    <div className="max-w-xl mx-auto animate-bub-fade">
      <button
        onClick={() => navigate('/cards')}
        className="flex items-center gap-1.5 text-sm mb-6 hover:underline"
        style={{ color: '#5C6470', fontFamily: 'Geist, sans-serif' }}
      >
        {t.backToCards}
      </button>

      <div className="rounded-xl border p-8" style={{ backgroundColor: '#fff', borderColor: '#E5E2D9' }}>
        <h2 className="text-xl font-semibold mb-1" style={{ fontFamily: 'Fraunces, serif', color: '#14181F' }}>
          {t.issueCard}
        </h2>
        <p className="text-sm mb-8" style={{ color: '#5C6470', fontFamily: 'Geist, sans-serif' }}>
          Link a new card to one of your active accounts.
        </p>

        <form onSubmit={handleSubmit}>
          {/* Source account */}
          <div className="mb-6">
            <label className="block text-xs font-medium mb-1.5" style={{ color: '#5C6470', fontFamily: 'Geist, sans-serif' }}>
              Source account
            </label>
            <select
              value={accountId}
              onChange={e => setAccountId(e.target.value)}
              className="w-full px-3 py-2.5 rounded-lg border text-sm outline-none"
              style={{ borderColor: '#E5E2D9', backgroundColor: '#fff', color: '#14181F', fontFamily: 'Geist, sans-serif' }}
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
            <p className="text-[10px] tracking-[0.14em] uppercase font-semibold mb-3" style={{ color: '#8A8F99', fontFamily: '"Geist Mono", monospace' }}>
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

          {error && <ErrorBanner message={error} className="mb-4" />}

          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => navigate('/cards')}
              className="flex-1 py-2.5 rounded-lg text-sm font-medium border"
              style={{ borderColor: '#E5E2D9', color: '#5C6470', backgroundColor: '#fff', fontFamily: 'Geist, sans-serif' }}
            >
              {t.cancel}
            </button>
            <button
              type="submit"
              disabled={mutation.isPending}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium disabled:opacity-60"
              style={{ backgroundColor: '#0F2A47', color: '#fff', fontFamily: 'Geist, sans-serif' }}
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
