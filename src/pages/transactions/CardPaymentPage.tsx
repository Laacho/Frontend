import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { cardsApi } from '../../api/cards';
import { transactionsApi } from '../../api/transactions';
import { ErrorBanner } from '../../components/ui/ErrorBanner';
import { Spinner } from '../../components/ui/Spinner';
import { getApiError } from '../../api/client';
import { generateIdempotencyKey } from '../../utils/idempotency';
import { formatAmount, formatDateTime } from '../../utils/format';
import { useLang } from '../../hooks/useLang';

const MERCHANT_CATEGORIES = [
  'RETAIL', 'FOOD_AND_BEVERAGE', 'TRAVEL', 'FUEL', 'UTILITIES',
  'HEALTHCARE', 'ENTERTAINMENT', 'ONLINE', 'ATM', 'OTHER',
];

export function CardPaymentPage() {
  const { t } = useLang();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const now = new Date();

  const [cardId, setCardId] = useState('');
  const [amount, setAmount] = useState('');
  const [currency, setCurrency] = useState('BGN');
  const [merchantName, setMerchantName] = useState('');
  const [merchantCategory, setMerchantCategory] = useState('RETAIL');
  const [terminalId, setTerminalId] = useState('TERM-001');
  const [error, setError] = useState('');

  const { data: cardsData } = useQuery({
    queryKey: ['cards'],
    queryFn: () => cardsApi.list(0, 50),
  });

  const cards = cardsData?.content.filter(c => c.status === 'ACTIVE') || [];
  const selectedCard = cards.find(c => c.id === cardId);

  const mutation = useMutation({
    mutationFn: () => transactionsApi.cardPayment({
      cardId,
      amount: parseFloat(amount),
      currency,
      merchantName,
      merchantCategory,
      terminalId,
    }, generateIdempotencyKey()),
    onSuccess: (data) => {
      // Account balance, card and transaction history all moved — refresh them.
      queryClient.invalidateQueries({ queryKey: ['accounts'] });
      queryClient.invalidateQueries({ queryKey: ['cards'] });
      queryClient.invalidateQueries({ queryKey: ['card-transactions'] });
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      navigate(`/transactions/${data.id}`);
    },
    onError: (err) => {
      setError(getApiError(err));
    },
  });

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!cardId) { setError('Select a card'); return; }
    if (!merchantName.trim()) { setError('Enter a merchant name'); return; }
    if (!amount || parseFloat(amount) <= 0) { setError('Enter a valid amount'); return; }
    setError('');
    mutation.mutate();
  }

  const inputStyle = { borderColor: 'var(--c-border)', backgroundColor: 'var(--c-surface)', color: 'var(--c-text)', fontFamily: 'Geist, sans-serif' };

  return (
    <div className="animate-bub-fade">
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Form */}
        <div className="lg:col-span-3">
          <div className="rounded-xl border p-6" style={{ backgroundColor: 'var(--c-surface)', borderColor: 'var(--c-border)' }}>
            {error && <ErrorBanner message={error} className="mb-4" />}

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Card selector */}
              <div>
                <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--c-text-2)', fontFamily: 'Geist, sans-serif' }}>
                  Card
                </label>
                <select value={cardId} onChange={e => setCardId(e.target.value)} className="w-full px-3 py-2.5 rounded-lg border text-sm outline-none" style={{ ...inputStyle, fontFamily: '"Geist Mono", monospace' }}>
                  <option value="">Select active card…</option>
                  {cards.map(c => (
                    <option key={c.id} value={c.id}>
                      {c.cardType} — {c.maskedPan} ({c.currencyCode})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="col-span-2">
                  <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--c-text-2)', fontFamily: 'Geist, sans-serif' }}>{t.amount}</label>
                  <input type="number" value={amount} onChange={e => setAmount(e.target.value)} min="0.01" step="0.01" placeholder="0.00" className="w-full px-3 py-2.5 rounded-lg border text-sm outline-none" style={{ ...inputStyle, fontFamily: '"Geist Mono", monospace' }} />
                </div>
                <div>
                  <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--c-text-2)', fontFamily: 'Geist, sans-serif' }}>Currency</label>
                  <select value={currency} onChange={e => setCurrency(e.target.value)} className="w-full px-3 py-2.5 rounded-lg border text-sm outline-none" style={{ ...inputStyle, fontFamily: '"Geist Mono", monospace' }}>
                    <option>BGN</option><option>EUR</option><option>USD</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--c-text-2)', fontFamily: 'Geist, sans-serif' }}>Merchant name</label>
                <input type="text" value={merchantName} onChange={e => setMerchantName(e.target.value)} placeholder="e.g. LIDL BULGARIA EAD" className="w-full px-3 py-2.5 rounded-lg border text-sm outline-none" style={inputStyle} />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--c-text-2)', fontFamily: 'Geist, sans-serif' }}>Category</label>
                  <select value={merchantCategory} onChange={e => setMerchantCategory(e.target.value)} className="w-full px-3 py-2.5 rounded-lg border text-sm outline-none" style={inputStyle}>
                    {MERCHANT_CATEGORIES.map(c => <option key={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--c-text-2)', fontFamily: 'Geist, sans-serif' }}>Terminal ID</label>
                  <input type="text" value={terminalId} onChange={e => setTerminalId(e.target.value)} className="w-full px-3 py-2.5 rounded-lg border text-sm outline-none" style={{ ...inputStyle, fontFamily: '"Geist Mono", monospace' }} />
                </div>
              </div>

              <div className="p-3 rounded-lg" style={{ backgroundColor: 'var(--c-bg)', border: '1px solid var(--c-border)' }}>
                <p className="text-[11px]" style={{ color: 'var(--c-text-2)', fontFamily: '"Geist Mono", monospace' }}>
                  DEV NOTE: This simulates a POS terminal. In production, card payments are initiated by merchants, not cardholders.
                </p>
              </div>

              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => navigate(-1)} className="flex-1 py-2.5 rounded-lg text-sm font-medium border" style={{ borderColor: 'var(--c-border)', color: 'var(--c-text-2)', backgroundColor: 'var(--c-surface)', fontFamily: 'Geist, sans-serif' }}>
                  {t.cancel}
                </button>
                <button type="submit" disabled={mutation.isPending} className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium disabled:opacity-60" style={{ backgroundColor: '#0F2A47', color: 'var(--c-on-brand)', fontFamily: 'Geist, sans-serif' }}>
                  {mutation.isPending && <Spinner size="sm" className="text-white" />}
                  Process payment
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Receipt preview */}
        <div className="lg:col-span-2">
          <div className="rounded-xl border p-5" style={{ backgroundColor: 'var(--c-surface)', borderColor: 'var(--c-border)' }}>
            <h3 className="text-sm font-semibold mb-4" style={{ fontFamily: 'Fraunces, serif', color: 'var(--c-text)' }}>
              Receipt preview
            </h3>
            <div
              className="p-4 rounded-lg text-[11px] leading-relaxed"
              style={{ backgroundColor: 'var(--c-bg)', fontFamily: '"Geist Mono", monospace', color: 'var(--c-text)' }}
            >
              <div className="text-center mb-3">
                <p>BALKAN UNITED BANK</p>
                <p style={{ color: 'var(--c-text-muted)' }}>POS TERMINAL RECEIPT</p>
                <p style={{ color: 'var(--c-text-muted)' }}>{'─'.repeat(28)}</p>
              </div>
              <p>DATE: {formatDateTime(now.toISOString())}</p>
              <p>TERM: {terminalId || 'TERM-???'}</p>
              <div className="my-2" style={{ borderTop: '1px dashed var(--c-border)' }} />
              <p>MERCHANT: {merchantName || '???'}</p>
              <p>CATEGORY: {merchantCategory}</p>
              <div className="my-2" style={{ borderTop: '1px dashed var(--c-border)' }} />
              <p>CARD: {selectedCard?.maskedPan || '???? **** **** ????'}</p>
              <p>TYPE: {selectedCard?.cardType || '???'}</p>
              <div className="my-2" style={{ borderTop: '1px dashed var(--c-border)' }} />
              <p className="text-right font-semibold" style={{ color: 'var(--c-text)', fontSize: '13px' }}>
                {amount ? formatAmount(parseFloat(amount)) : '0.00'} {currency}
              </p>
              <div className="text-center mt-3" style={{ color: 'var(--c-text-muted)' }}>
                <p>AWAITING APPROVAL</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
