import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { accountsApi } from '../../api/accounts';
import { ErrorBanner } from '../../components/ui/ErrorBanner';
import { Spinner } from '../../components/ui/Spinner';
import { getApiError } from '../../api/client';
import { useLang } from '../../hooks/useLang';

const BRANCHES = [
  'Sofia Center Branch',
  'Sofia Airport Branch',
  'Plovdiv Branch',
  'Varna Branch',
];

const ACCOUNT_TYPES = [
  {
    value: 'CURRENT',
    label: 'Current',
    description: 'Day-to-day payments and transfers. No minimum balance.',
    icon: '↔',
  },
  {
    value: 'SAVINGS',
    label: 'Savings',
    description: 'Earn interest on your balance. Limit of 6 withdrawals per month.',
    icon: '↑',
  },
  {
    value: 'BUSINESS',
    label: 'Business',
    description: 'For sole traders and companies. Supports multiple currencies.',
    icon: '⬡',
  },
];

const CURRENCIES = ['BGN', 'EUR', 'USD'];

export function OpenAccountPage() {
  const { t } = useLang();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [accountType, setAccountType] = useState('CURRENT');
  const [currency, setCurrency] = useState('BGN');
  const [branchName, setBranchName] = useState(BRANCHES[0]);
  const [error, setError] = useState('');

  const mutation = useMutation({
    mutationFn: () => accountsApi.create({ accountType, currency, branchName }),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['accounts'] });
      navigate(`/accounts/${data.id}`);
    },
    onError: (err) => {
      setError(getApiError(err));
    },
  });

  return (
    <div className="max-w-2xl mx-auto animate-bub-fade">
      <button
        onClick={() => navigate('/accounts')}
        className="flex items-center gap-1.5 text-sm mb-6 hover:underline"
        style={{ color: '#5C6470', fontFamily: 'Geist, sans-serif' }}
      >
        ← {t.accounts}
      </button>

      {error && <ErrorBanner message={error} className="mb-4" />}

      <div className="rounded-xl border p-8" style={{ backgroundColor: '#fff', borderColor: '#E5E2D9' }}>
        <h2
          className="text-xl font-semibold mb-1"
          style={{ fontFamily: 'Fraunces, serif', color: '#14181F' }}
        >
          Open a new account
        </h2>
        <p className="text-sm mb-8" style={{ color: '#5C6470', fontFamily: 'Geist, sans-serif' }}>
          Choose the account type that fits your needs.
        </p>

        {/* Account type */}
        <div className="mb-6">
          <p
            className="text-[10px] tracking-[0.14em] uppercase font-semibold mb-3 pb-2 border-b"
            style={{ color: '#8A8F99', fontFamily: '"Geist Mono", monospace', borderColor: '#EFEDE6' }}
          >
            Account type
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {ACCOUNT_TYPES.map(type => (
              <button
                key={type.value}
                onClick={() => setAccountType(type.value)}
                className="p-4 rounded-lg border text-left transition-colors"
                style={{
                  borderColor: accountType === type.value ? '#0F2A47' : '#E5E2D9',
                  backgroundColor: accountType === type.value ? '#F4F2EC' : '#fff',
                }}
              >
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-base mb-3"
                  style={{
                    backgroundColor: accountType === type.value ? '#0F2A47' : '#F4F2EC',
                    color: accountType === type.value ? '#C8A878' : '#5C6470',
                  }}
                >
                  {type.icon}
                </div>
                <p
                  className="text-sm font-semibold mb-1"
                  style={{ color: '#14181F', fontFamily: 'Geist, sans-serif' }}
                >
                  {type.label}
                </p>
                <p className="text-xs leading-relaxed" style={{ color: '#5C6470', fontFamily: 'Geist, sans-serif' }}>
                  {type.description}
                </p>
              </button>
            ))}
          </div>
        </div>

        {/* Currency + Branch */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div>
            <label
              className="block text-xs font-medium mb-1.5"
              style={{ color: '#5C6470', fontFamily: 'Geist, sans-serif' }}
            >
              {t.currency}
            </label>
            <select
              value={currency}
              onChange={e => setCurrency(e.target.value)}
              className="w-full px-3 py-2.5 rounded-lg border text-sm outline-none"
              style={{
                borderColor: '#E5E2D9',
                backgroundColor: '#fff',
                color: '#14181F',
                fontFamily: '"Geist Mono", monospace',
              }}
            >
              {CURRENCIES.map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          <div>
            <label
              className="block text-xs font-medium mb-1.5"
              style={{ color: '#5C6470', fontFamily: 'Geist, sans-serif' }}
            >
              {t.branch}
            </label>
            <select
              value={branchName}
              onChange={e => setBranchName(e.target.value)}
              className="w-full px-3 py-2.5 rounded-lg border text-sm outline-none"
              style={{
                borderColor: '#E5E2D9',
                backgroundColor: '#fff',
                color: '#14181F',
                fontFamily: 'Geist, sans-serif',
              }}
            >
              {BRANCHES.map(b => (
                <option key={b} value={b}>{b}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Info note */}
        <div
          className="flex items-start gap-3 p-4 rounded-lg mb-8"
          style={{ backgroundColor: '#F4F2EC', border: '1px solid #E5E2D9' }}
        >
          <svg viewBox="0 0 16 16" fill="none" stroke="#5C6470" strokeWidth="1.5" className="w-4 h-4 mt-0.5 flex-shrink-0">
            <circle cx="8" cy="8" r="6.5" />
            <line x1="8" y1="7" x2="8" y2="11" />
            <circle cx="8" cy="5" r="0.5" fill="currentColor" />
          </svg>
          <p className="text-xs" style={{ color: '#5C6470', fontFamily: 'Geist, sans-serif' }}>
            New accounts start with a zero balance. Transfer funds from an external account to start transacting.
          </p>
        </div>

        <div className="flex items-center justify-end gap-3">
          <button
            onClick={() => navigate('/accounts')}
            className="px-4 py-2.5 rounded-lg text-sm font-medium border"
            style={{ borderColor: '#E5E2D9', color: '#5C6470', backgroundColor: '#fff', fontFamily: 'Geist, sans-serif' }}
          >
            {t.cancel}
          </button>
          <button
            onClick={() => mutation.mutate()}
            disabled={mutation.isPending}
            className="flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium disabled:opacity-60"
            style={{ backgroundColor: '#0F2A47', color: '#fff', fontFamily: 'Geist, sans-serif' }}
          >
            {mutation.isPending && <Spinner size="sm" className="text-white" />}
            Open account
          </button>
        </div>
      </div>
    </div>
  );
}
