import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { accountsApi } from '../../api/accounts';
import { transactionsApi } from '../../api/transactions';
import { ErrorBanner } from '../../components/ui/ErrorBanner';
import { Spinner } from '../../components/ui/Spinner';
import { getApiError } from '../../api/client';
import { generateIdempotencyKey } from '../../utils/idempotency';
import { formatAmount } from '../../utils/format';
import { useLang } from '../../hooks/useLang';

export function TransferPage() {
  const { t } = useLang();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [sourceId, setSourceId] = useState('');
  const [destId, setDestId] = useState('');
  const [amount, setAmount] = useState('');
  const [currency, setCurrency] = useState('BGN');
  const [description, setDescription] = useState('');
  const [error, setError] = useState('');

  const { data: accountsData } = useQuery({
    queryKey: ['accounts'],
    queryFn: () => accountsApi.list(0, 50),
  });

  const accounts = accountsData?.content.filter(a => a.status === 'ACTIVE') || [];
  const sourceAccount = accounts.find(a => a.id === sourceId);
  const destAccount = accounts.find(a => a.id === destId);

  const mutation = useMutation({
    mutationFn: () => transactionsApi.transfer({
      sourceAccountId: sourceId,
      destinationAccountId: destId,
      amount: parseFloat(amount),
      currency,
      description: description || undefined,
    }, generateIdempotencyKey()),
    onSuccess: (data) => {
      // Balances and transaction history changed — drop stale caches.
      queryClient.invalidateQueries({ queryKey: ['accounts'] });
      queryClient.invalidateQueries({ queryKey: ['account'] });
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      navigate(`/transactions/${data.id}`);
    },
    onError: (err) => {
      setError(getApiError(err));
    },
  });

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    if (!sourceId || !destId) { setError('Select both source and destination accounts'); return; }
    if (sourceId === destId) { setError('Source and destination accounts must differ'); return; }
    if (!amount || parseFloat(amount) <= 0) { setError('Enter a valid amount'); return; }
    mutation.mutate();
  }

  const inputStyle = { borderColor: '#E5E2D9', backgroundColor: '#fff', color: '#14181F', fontFamily: 'Geist, sans-serif' };

  return (
    <div className="animate-bub-fade">
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Form */}
        <div className="lg:col-span-3">
          <div className="rounded-xl border p-6" style={{ backgroundColor: '#fff', borderColor: '#E5E2D9' }}>
            {error && <ErrorBanner message={error} className="mb-4" />}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-medium mb-1.5" style={{ color: '#5C6470', fontFamily: 'Geist, sans-serif' }}>
                  {t.from}
                </label>
                <select value={sourceId} onChange={e => setSourceId(e.target.value)} className="w-full px-3 py-2.5 rounded-lg border text-sm outline-none" style={inputStyle}>
                  <option value="">Select source account…</option>
                  {accounts.map(a => (
                    <option key={a.id} value={a.id}>
                      {a.accountType} — {a.iban} ({formatAmount(a.balance?.availableAmount || 0)} {a.balance?.currencyCode})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium mb-1.5" style={{ color: '#5C6470', fontFamily: 'Geist, sans-serif' }}>
                  {t.to}
                </label>
                <select value={destId} onChange={e => setDestId(e.target.value)} className="w-full px-3 py-2.5 rounded-lg border text-sm outline-none" style={inputStyle}>
                  <option value="">Select destination account…</option>
                  {accounts.filter(a => a.id !== sourceId).map(a => (
                    <option key={a.id} value={a.id}>
                      {a.accountType} — {a.iban}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="col-span-2">
                  <label className="block text-xs font-medium mb-1.5" style={{ color: '#5C6470', fontFamily: 'Geist, sans-serif' }}>
                    {t.amount}
                  </label>
                  <input
                    type="number"
                    value={amount}
                    onChange={e => setAmount(e.target.value)}
                    min="0.01"
                    step="0.01"
                    placeholder="0.00"
                    className="w-full px-3 py-2.5 rounded-lg border text-sm outline-none"
                    style={{ ...inputStyle, fontFamily: '"Geist Mono", monospace' }}
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium mb-1.5" style={{ color: '#5C6470', fontFamily: 'Geist, sans-serif' }}>
                    Currency
                  </label>
                  <select value={currency} onChange={e => setCurrency(e.target.value)} className="w-full px-3 py-2.5 rounded-lg border text-sm outline-none" style={{ ...inputStyle, fontFamily: '"Geist Mono", monospace' }}>
                    <option>BGN</option>
                    <option>EUR</option>
                    <option>USD</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium mb-1.5" style={{ color: '#5C6470', fontFamily: 'Geist, sans-serif' }}>
                  {t.description} <span style={{ color: '#8A8F99' }}>(optional)</span>
                </label>
                <input
                  type="text"
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  placeholder="Payment for…"
                  className="w-full px-3 py-2.5 rounded-lg border text-sm outline-none"
                  style={inputStyle}
                />
              </div>

              <div
                className="flex items-start gap-3 p-3 rounded-lg"
                style={{ backgroundColor: '#FBF1E2', border: '1px solid #E5D5B8' }}
              >
                <svg viewBox="0 0 16 16" fill="none" stroke="#B5781E" strokeWidth="1.5" className="w-4 h-4 mt-0.5 flex-shrink-0">
                  <path d="M8 1.5L14.5 13.5h-13L8 1.5z" />
                  <line x1="8" y1="6" x2="8" y2="9.5" />
                  <circle cx="8" cy="11.5" r="0.5" fill="currentColor" />
                </svg>
                <p className="text-xs" style={{ color: '#B5781E', fontFamily: 'Geist, sans-serif' }}>
                  Transfers between accounts in the same currency are instant. Cross-currency transfers may take 1–2 business days.
                </p>
              </div>

              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => navigate(-1)} className="flex-1 py-2.5 rounded-lg text-sm font-medium border" style={{ borderColor: '#E5E2D9', color: '#5C6470', backgroundColor: '#fff', fontFamily: 'Geist, sans-serif' }}>
                  {t.cancel}
                </button>
                <button type="submit" disabled={mutation.isPending} className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium disabled:opacity-60" style={{ backgroundColor: '#0F2A47', color: '#fff', fontFamily: 'Geist, sans-serif' }}>
                  {mutation.isPending && <Spinner size="sm" className="text-white" />}
                  Send transfer
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Summary panel */}
        <div className="lg:col-span-2">
          <div className="rounded-xl border p-5 sticky top-6" style={{ backgroundColor: '#fff', borderColor: '#E5E2D9' }}>
            <h3 className="text-sm font-semibold mb-4" style={{ fontFamily: 'Fraunces, serif', color: '#14181F' }}>
              Transfer summary
            </h3>

            <div className="space-y-3">
              {[
                { label: t.from, value: sourceAccount ? `${sourceAccount.accountType} …${sourceAccount.iban.slice(-4)}` : '—' },
                { label: t.to, value: destAccount ? `${destAccount.accountType} …${destAccount.iban.slice(-4)}` : '—' },
                { label: t.amount, value: amount ? `${formatAmount(parseFloat(amount))} ${currency}` : '—', mono: true },
                { label: 'Fee', value: '0.00 ' + currency, mono: true },
                { label: 'Total', value: amount ? `${formatAmount(parseFloat(amount))} ${currency}` : '—', mono: true },
                { label: 'Executes', value: 'Immediately' },
              ].map(row => (
                <div key={row.label} className="flex justify-between items-center py-2 border-b" style={{ borderColor: '#EFEDE6' }}>
                  <span className="text-xs" style={{ color: '#8A8F99', fontFamily: 'Geist, sans-serif' }}>{row.label}</span>
                  <span className="text-sm font-medium" style={{ color: '#14181F', fontFamily: row.mono ? '"Geist Mono", monospace' : 'Geist, sans-serif' }}>
                    {row.value}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
