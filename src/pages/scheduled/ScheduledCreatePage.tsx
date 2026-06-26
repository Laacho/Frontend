import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { accountsApi } from '../../api/accounts';
import { transactionsApi } from '../../api/transactions';
import { ErrorBanner } from '../../components/ui/ErrorBanner';
import { Spinner } from '../../components/ui/Spinner';
import { getApiError } from '../../api/client';
import { useLang } from '../../hooks/useLang';

type Frequency = 'ONCE' | 'DAILY' | 'WEEKLY' | 'MONTHLY';

export function ScheduledCreatePage() {
  const { t } = useLang();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [sourceId, setSourceId] = useState('');
  const [destId, setDestId] = useState('');
  const [amount, setAmount] = useState('');
  const [currency, setCurrency] = useState('BGN');
  const [frequency, setFrequency] = useState<Frequency>('MONTHLY');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('09:00');
  const [description, setDescription] = useState('');
  const [error, setError] = useState('');

  const { data: accountsData } = useQuery({
    queryKey: ['accounts'],
    queryFn: () => accountsApi.list(0, 50),
  });

  const accounts = accountsData?.content.filter(a => a.status === 'ACTIVE') || [];

  const mutation = useMutation({
    mutationFn: () => {
      if (!date) throw new Error('Select a date');
      const scheduledAt = `${date}T${time}:00`;
      return transactionsApi.createScheduled({
        sourceAccountId: sourceId,
        destinationAccountId: destId,
        amount: parseFloat(amount),
        currency,
        frequency,
        scheduledAt,
        description: description || undefined,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['scheduled'] });
      navigate('/scheduled');
    },
    onError: (err) => {
      setError(getApiError(err));
    },
  });

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!sourceId || !destId) { setError('Select both accounts'); return; }
    if (sourceId === destId) { setError('Source and destination must differ'); return; }
    if (!amount || parseFloat(amount) <= 0) { setError('Enter a valid amount'); return; }
    if (!date) { setError('Select a start date'); return; }
    setError('');
    mutation.mutate();
  }

  const FREQS: { value: Frequency; label: string }[] = [
    { value: 'ONCE', label: t.once },
    { value: 'DAILY', label: t.daily },
    { value: 'WEEKLY', label: t.weekly },
    { value: 'MONTHLY', label: t.monthly },
  ];

  const inputStyle = { borderColor: '#E5E2D9', backgroundColor: '#fff', color: '#14181F', fontFamily: 'Geist, sans-serif' };

  return (
    <div className="max-w-xl mx-auto animate-bub-fade">
      <button onClick={() => navigate('/scheduled')} className="flex items-center gap-1.5 text-sm mb-6 hover:underline" style={{ color: '#5C6470', fontFamily: 'Geist, sans-serif' }}>
        ← {t.scheduled}
      </button>

      <div className="rounded-xl border p-6" style={{ backgroundColor: '#fff', borderColor: '#E5E2D9' }}>
        <h2 className="text-xl font-semibold mb-1" style={{ fontFamily: 'Fraunces, serif', color: '#14181F' }}>{t.newScheduled}</h2>
        <p className="text-sm mb-6" style={{ color: '#5C6470', fontFamily: 'Geist, sans-serif' }}>Set up a recurring or future-dated payment.</p>

        {error && <ErrorBanner message={error} className="mb-4" />}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium mb-1.5" style={{ color: '#5C6470', fontFamily: 'Geist, sans-serif' }}>{t.from}</label>
            <select value={sourceId} onChange={e => setSourceId(e.target.value)} className="w-full px-3 py-2.5 rounded-lg border text-sm outline-none" style={inputStyle}>
              <option value="">Select source…</option>
              {accounts.map(a => <option key={a.id} value={a.id}>{a.accountType} — {a.iban.slice(-8)}</option>)}
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium mb-1.5" style={{ color: '#5C6470', fontFamily: 'Geist, sans-serif' }}>{t.to}</label>
            <select value={destId} onChange={e => setDestId(e.target.value)} className="w-full px-3 py-2.5 rounded-lg border text-sm outline-none" style={inputStyle}>
              <option value="">Select destination…</option>
              {accounts.filter(a => a.id !== sourceId).map(a => <option key={a.id} value={a.id}>{a.accountType} — {a.iban.slice(-8)}</option>)}
            </select>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="col-span-2">
              <label className="block text-xs font-medium mb-1.5" style={{ color: '#5C6470', fontFamily: 'Geist, sans-serif' }}>{t.amount}</label>
              <input type="number" value={amount} onChange={e => setAmount(e.target.value)} min="0.01" step="0.01" placeholder="0.00" className="w-full px-3 py-2.5 rounded-lg border text-sm outline-none" style={{ ...inputStyle, fontFamily: '"Geist Mono", monospace' }} />
            </div>
            <div>
              <label className="block text-xs font-medium mb-1.5" style={{ color: '#5C6470', fontFamily: 'Geist, sans-serif' }}>Currency</label>
              <select value={currency} onChange={e => setCurrency(e.target.value)} className="w-full px-3 py-2.5 rounded-lg border text-sm outline-none" style={{ ...inputStyle, fontFamily: '"Geist Mono", monospace' }}>
                <option>BGN</option><option>EUR</option><option>USD</option>
              </select>
            </div>
          </div>

          {/* Frequency selector */}
          <div>
            <label className="block text-xs font-medium mb-2" style={{ color: '#5C6470', fontFamily: 'Geist, sans-serif' }}>{t.frequency}</label>
            <div className="grid grid-cols-4 gap-2">
              {FREQS.map(f => (
                <button
                  key={f.value}
                  type="button"
                  onClick={() => setFrequency(f.value)}
                  className="py-2 rounded-lg text-xs font-medium border transition-colors"
                  style={{
                    borderColor: frequency === f.value ? '#0F2A47' : '#E5E2D9',
                    backgroundColor: frequency === f.value ? '#0F2A47' : '#fff',
                    color: frequency === f.value ? '#fff' : '#5C6470',
                    fontFamily: 'Geist, sans-serif',
                  }}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium mb-1.5" style={{ color: '#5C6470', fontFamily: 'Geist, sans-serif' }}>Start date</label>
              <input type="date" value={date} onChange={e => setDate(e.target.value)} className="w-full px-3 py-2.5 rounded-lg border text-sm outline-none" style={inputStyle} />
            </div>
            <div>
              <label className="block text-xs font-medium mb-1.5" style={{ color: '#5C6470', fontFamily: 'Geist, sans-serif' }}>Time</label>
              <input type="time" value={time} onChange={e => setTime(e.target.value)} className="w-full px-3 py-2.5 rounded-lg border text-sm outline-none" style={{ ...inputStyle, fontFamily: '"Geist Mono", monospace' }} />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium mb-1.5" style={{ color: '#5C6470', fontFamily: 'Geist, sans-serif' }}>{t.description} <span style={{ color: '#8A8F99' }}>(optional)</span></label>
            <input type="text" value={description} onChange={e => setDescription(e.target.value)} placeholder="Monthly rent, Utility bill…" className="w-full px-3 py-2.5 rounded-lg border text-sm outline-none" style={inputStyle} />
          </div>

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={() => navigate('/scheduled')} className="flex-1 py-2.5 rounded-lg text-sm font-medium border" style={{ borderColor: '#E5E2D9', color: '#5C6470', backgroundColor: '#fff', fontFamily: 'Geist, sans-serif' }}>
              {t.cancel}
            </button>
            <button type="submit" disabled={mutation.isPending} className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium disabled:opacity-60" style={{ backgroundColor: '#0F2A47', color: '#fff', fontFamily: 'Geist, sans-serif' }}>
              {mutation.isPending && <Spinner size="sm" className="text-white" />}
              Create
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
