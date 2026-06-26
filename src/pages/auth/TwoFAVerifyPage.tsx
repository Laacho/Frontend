import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { authApi } from '../../api/auth';
import { getApiError } from '../../api/client';
import { Spinner } from '../../components/ui/Spinner';

export function TwoFAVerifyPage() {
  const [digits, setDigits] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  useEffect(() => {
    inputRefs.current[0]?.focus();
  }, []);

  function handleDigitChange(index: number, value: string) {
    const v = value.replace(/\D/, '');
    if (!v && value) return;
    const newDigits = [...digits];
    newDigits[index] = v;
    setDigits(newDigits);
    if (v && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  }

  function handleKeyDown(index: number, e: React.KeyboardEvent) {
    if (e.key === 'Backspace' && !digits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  }

  function handlePaste(e: React.ClipboardEvent) {
    e.preventDefault();
    const text = e.clipboardData.getData('text').replace(/\D/g, '').substring(0, 6);
    const newDigits = [...digits];
    for (let i = 0; i < text.length; i++) {
      newDigits[i] = text[i];
    }
    setDigits(newDigits);
    const nextEmpty = newDigits.findIndex((d, i) => !d && i >= text.length);
    const focusIdx = nextEmpty === -1 ? 5 : nextEmpty;
    inputRefs.current[focusIdx]?.focus();
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const code = parseInt(digits.join(''));
    if (isNaN(code) || digits.join('').length < 6) {
      setError('Enter all 6 digits');
      return;
    }
    setError('');
    setLoading(true);
    try {
      await authApi.verify2FA(code);
      // Verify flipped twoFactorEnabled=true server-side; drop stale settings cache
      // so SettingsPage reflects "Enabled".
      await queryClient.invalidateQueries({ queryKey: ['settings'] });
      navigate('/dashboard');
    } catch (err) {
      setError(getApiError(err));
      setDigits(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center py-12 px-4" style={{ backgroundColor: 'var(--c-bg)' }}>
      <div className="flex items-center gap-3 mb-8">
        <div
          className="w-9 h-9 flex items-center justify-center rounded border font-bold text-lg"
          style={{ borderColor: '#C8A878', color: '#C8A878', fontFamily: 'Fraunces, serif' }}
        >
          B
        </div>
        <span style={{ fontFamily: 'Fraunces, serif', color: 'var(--c-text)', fontSize: '20px' }}>
          Balkan United Bank
        </span>
      </div>

      <div
        className="w-full max-w-sm rounded-xl border p-8 text-center"
        style={{ backgroundColor: 'var(--c-surface)', borderColor: 'var(--c-border)' }}
      >
        <div
          className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4"
          style={{ backgroundColor: 'var(--c-bg)', border: '1px solid var(--c-border)' }}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="#0F2A47" strokeWidth="1.5" className="w-6 h-6">
            <rect x="3" y="11" width="18" height="11" rx="2" />
            <path d="M7 11V7a5 5 0 0110 0v4" />
          </svg>
        </div>

        <h1
          className="text-2xl font-medium mb-2"
          style={{ fontFamily: 'Fraunces, serif', color: 'var(--c-text)' }}
        >
          Verify your identity
        </h1>
        <p className="text-sm mb-8" style={{ color: 'var(--c-text-2)', fontFamily: 'Geist, sans-serif' }}>
          Enter the 6-digit code from your authenticator app.
        </p>

        {error && (
          <div
            className="p-3 rounded-lg border-l-4 mb-6 text-left"
            style={{ backgroundColor: '#FBEDEB', borderLeftColor: '#A8362F' }}
          >
            <p className="text-sm" style={{ color: '#A8362F', fontFamily: 'Geist, sans-serif' }}>{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="flex gap-2 justify-center mb-8" onPaste={handlePaste}>
            {digits.map((d, i) => (
              <input
                key={i}
                ref={el => { inputRefs.current[i] = el; }}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={d}
                onChange={e => handleDigitChange(i, e.target.value)}
                onKeyDown={e => handleKeyDown(i, e)}
                className="w-12 h-14 text-center text-xl font-semibold rounded-lg border outline-none focus:border-[#0F2A47] transition-colors"
                style={{
                  borderColor: d ? '#0F2A47' : 'var(--c-border)',
                  backgroundColor: 'var(--c-surface)',
                  color: 'var(--c-text)',
                  fontFamily: '"Geist Mono", monospace',
                }}
              />
            ))}
          </div>

          <button
            type="submit"
            disabled={loading || digits.some(d => !d)}
            className="w-full py-2.5 rounded-lg text-sm font-medium flex items-center justify-center gap-2 transition-opacity disabled:opacity-60"
            style={{ backgroundColor: '#0F2A47', color: 'var(--c-on-brand)', fontFamily: 'Geist, sans-serif' }}
          >
            {loading && <Spinner size="sm" className="text-white" />}
            Verify and continue
          </button>
        </form>
      </div>
    </div>
  );
}
