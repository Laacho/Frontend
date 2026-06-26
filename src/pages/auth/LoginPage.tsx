import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authApi } from '../../api/auth';
import { useAuth } from '../../hooks/useAuth';
import { useLang } from '../../hooks/useLang';
import { getApiError } from '../../api/client';
import { Spinner } from '../../components/ui/Spinner';

export function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const { login } = useAuth();
  const { t } = useLang();
  const navigate = useNavigate();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const data = await authApi.login(username, password);
      login(data.accessToken, data.refreshToken);
      navigate('/dashboard');
    } catch (err) {
      setError(getApiError(err));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex" style={{ backgroundColor: 'var(--c-bg)' }}>
      {/* Left brand panel */}
      <div
        className="hidden lg:flex lg:w-[52%] flex-col justify-between p-12"
        style={{ backgroundColor: '#0F2A47' }}
      >
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 flex items-center justify-center rounded border text-xl font-bold"
            style={{ borderColor: '#C8A878', color: '#C8A878', fontFamily: 'Fraunces, serif' }}
          >
            B
          </div>
          <span
            className="text-white font-semibold"
            style={{ fontFamily: 'Fraunces, serif', fontSize: '18px' }}
          >
            Balkan United Bank
          </span>
        </div>

        <div>
          <h2
            className="text-white leading-tight mb-6"
            style={{ fontFamily: 'Fraunces, serif', fontSize: '42px', fontWeight: 400, letterSpacing: '-0.5px' }}
          >
            Banking that respects<br />
            your time and<br />
            your money.
          </h2>
          <p
            className="text-sm leading-relaxed max-w-xs"
            style={{ color: 'rgba(200,216,229,0.7)', fontFamily: 'Geist, sans-serif' }}
          >
            Secure personal and business banking for the Balkan region. Open an account in minutes.
          </p>
        </div>

        <div
          className="flex items-center gap-6 text-[11px] tracking-wider"
          style={{ color: '#6E84A0', fontFamily: '"Geist Mono", monospace' }}
        >
          <span>BIC: BKUBGSFX</span>
          <span>FSC MEMBER</span>
          <span>v2.0.0</span>
        </div>
      </div>

      {/* Right form panel */}
      <div className="flex-1 flex flex-col items-center justify-center p-8">
        <div className="w-full max-w-sm">
          {/* Mobile logo */}
          <div className="flex items-center gap-2 mb-10 lg:hidden">
            <div
              className="w-8 h-8 flex items-center justify-center rounded border font-bold"
              style={{ borderColor: '#C8A878', color: '#C8A878', fontFamily: 'Fraunces, serif' }}
            >
              B
            </div>
            <span style={{ fontFamily: 'Fraunces, serif', color: 'var(--c-text)', fontSize: '16px' }}>
              Balkan United Bank
            </span>
          </div>

          <p
            className="mb-1 text-[11px] tracking-[0.14em] uppercase"
            style={{ color: 'var(--c-text-muted)', fontFamily: '"Geist Mono", monospace' }}
          >
            {t.signIn}
          </p>
          <h1
            className="mb-8"
            style={{ fontFamily: 'Fraunces, serif', fontSize: '34px', fontWeight: 400, color: 'var(--c-text)', letterSpacing: '-0.3px' }}
          >
            {t.welcomeBack}
          </h1>

          {error && (
            <div
              className="flex items-start gap-3 p-3 rounded-lg border-l-4 mb-6"
              style={{ backgroundColor: '#FBEDEB', borderLeftColor: '#A8362F' }}
            >
              <div
                className="flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold text-white mt-0.5"
                style={{ backgroundColor: '#A8362F' }}
              >
                !
              </div>
              <p className="text-sm" style={{ color: '#A8362F', fontFamily: 'Geist, sans-serif' }}>{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div>
              <label
                className="block text-xs font-medium mb-1.5"
                style={{ color: 'var(--c-text-2)', fontFamily: 'Geist, sans-serif' }}
              >
                {t.username}
              </label>
              <input
                type="text"
                value={username}
                onChange={e => setUsername(e.target.value)}
                required
                autoComplete="username"
                className="w-full px-3 py-2.5 rounded-lg border text-sm outline-none transition-colors focus:border-[#0F2A47]"
                style={{
                  borderColor: 'var(--c-border)',
                  backgroundColor: 'var(--c-surface)',
                  color: 'var(--c-text)',
                  fontFamily: 'Geist, sans-serif',
                }}
                placeholder="your.username"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label
                  className="text-xs font-medium"
                  style={{ color: 'var(--c-text-2)', fontFamily: 'Geist, sans-serif' }}
                >
                  {t.password}
                </label>
                <a
                  href="#"
                  className="text-xs hover:underline"
                  style={{ color: '#C8A878', fontFamily: 'Geist, sans-serif' }}
                >
                  Forgot password?
                </a>
              </div>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                  autoComplete="current-password"
                  className="w-full px-3 py-2.5 pr-10 rounded-lg border text-sm outline-none transition-colors focus:border-[#0F2A47]"
                  style={{
                    borderColor: 'var(--c-border)',
                    backgroundColor: 'var(--c-surface)',
                    color: 'var(--c-text)',
                    fontFamily: 'Geist, sans-serif',
                  }}
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2"
                  style={{ color: 'var(--c-text-muted)' }}
                >
                  {showPassword ? (
                    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-4 h-4">
                      <path d="M2 8s2-4 6-4 6 4 6 4-2 4-6 4-6-4-6-4z" />
                      <circle cx="8" cy="8" r="2" />
                      <line x1="2" y1="2" x2="14" y2="14" />
                    </svg>
                  ) : (
                    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-4 h-4">
                      <path d="M2 8s2-4 6-4 6 4 6 4-2 4-6 4-6-4-6-4z" />
                      <circle cx="8" cy="8" r="2" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 rounded-lg text-sm font-medium transition-opacity disabled:opacity-60 mt-2 flex items-center justify-center gap-2"
              style={{
                backgroundColor: '#0F2A47',
                color: 'var(--c-on-brand)',
                fontFamily: 'Geist, sans-serif',
              }}
            >
              {loading && <Spinner size="sm" className="text-white" />}
              {t.signIn}
            </button>
          </form>

          <div className="flex items-center gap-3 my-6">
            <div className="flex-1 h-px" style={{ backgroundColor: 'var(--c-border)' }} />
            <span className="text-xs" style={{ color: 'var(--c-text-muted)', fontFamily: 'Geist, sans-serif' }}>OR</span>
            <div className="flex-1 h-px" style={{ backgroundColor: 'var(--c-border)' }} />
          </div>

          <p className="text-center text-sm" style={{ color: 'var(--c-text-2)', fontFamily: 'Geist, sans-serif' }}>
            New here?{' '}
            <Link
              to="/register"
              className="font-medium hover:underline"
              style={{ color: '#0F2A47' }}
            >
              Create an account
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
