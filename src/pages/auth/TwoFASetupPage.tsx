import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { authApi, TWO_FA_SETUP_KEY, TWO_FA_SETUP_STALE_MS } from '../../api/auth';
import { getApiError } from '../../api/client';
import { Spinner } from '../../components/ui/Spinner';

export function TwoFASetupPage() {
  const navigate = useNavigate();

  // Reads the same cache key SettingsPage prefetches on hover — if warmed, this
  // renders instantly with no request. react-query dedupes concurrent calls, so
  // the StrictMode double-mount no longer races on the user_settings insert.
  const { data, isLoading: loading, error: queryError } = useQuery({
    queryKey: TWO_FA_SETUP_KEY,
    queryFn: authApi.setup2FA,
    staleTime: TWO_FA_SETUP_STALE_MS,
    gcTime: TWO_FA_SETUP_STALE_MS,
    refetchOnWindowFocus: false,
    retry: false,
  });
  const error = queryError ? getApiError(queryError) : '';

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
        className="w-full max-w-md rounded-xl border p-8 text-center"
        style={{ backgroundColor: 'var(--c-surface)', borderColor: 'var(--c-border)' }}
      >
        <div
          className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4"
          style={{ backgroundColor: '#E3F2EA' }}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="#1F7A4D" strokeWidth="1.5" className="w-6 h-6">
            <path d="M12 1l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-2.01L12 1z" />
          </svg>
        </div>

        <h1
          className="text-2xl font-medium mb-2"
          style={{ fontFamily: 'Fraunces, serif', color: 'var(--c-text)' }}
        >
          Set up two-factor authentication
        </h1>
        <p className="text-sm mb-8" style={{ color: 'var(--c-text-2)', fontFamily: 'Geist, sans-serif' }}>
          Scan the QR code below with your authenticator app (Google Authenticator, Authy, etc.)
        </p>

        {loading && <div className="flex justify-center mb-6"><Spinner size="lg" className="text-[#C8A878]" /></div>}

        {error && (
          <div
            className="p-3 rounded-lg border-l-4 mb-6 text-left"
            style={{ backgroundColor: '#FBEDEB', borderLeftColor: '#A8362F' }}
          >
            <p className="text-sm" style={{ color: '#A8362F', fontFamily: 'Geist, sans-serif' }}>{error}</p>
          </div>
        )}

        {data && (
          <>
            <div className="flex justify-center mb-6">
              <img
                src={`data:image/png;base64,${data.qrImageBase64}`}
                alt="QR Code for 2FA setup"
                className="w-48 h-48 border rounded-lg p-2"
                style={{ borderColor: 'var(--c-border)' }}
              />
            </div>

            <div className="mb-8">
              <p
                className="text-[10px] tracking-[0.14em] uppercase mb-2"
                style={{ color: 'var(--c-text-muted)', fontFamily: '"Geist Mono", monospace' }}
              >
                Manual entry code
              </p>
              <div
                className="px-4 py-3 rounded-lg text-sm select-all cursor-text"
                style={{
                  backgroundColor: 'var(--c-bg)',
                  border: '1px solid var(--c-border)',
                  fontFamily: '"Geist Mono", monospace',
                  color: 'var(--c-text)',
                  letterSpacing: '0.1em',
                }}
              >
                {data.secret}
              </div>
            </div>
          </>
        )}

        <div className="flex gap-3">
          <button
            onClick={() => navigate('/dashboard')}
            className="flex-1 py-2.5 rounded-lg text-sm font-medium border transition-colors"
            style={{
              borderColor: 'var(--c-border)',
              color: 'var(--c-text-2)',
              backgroundColor: 'var(--c-surface)',
              fontFamily: 'Geist, sans-serif',
            }}
          >
            Skip for now
          </button>
          <button
            onClick={() => navigate('/2fa/verify')}
            className="flex-1 py-2.5 rounded-lg text-sm font-medium"
            style={{ backgroundColor: '#0F2A47', color: 'var(--c-on-brand)', fontFamily: 'Geist, sans-serif' }}
          >
            I've added it →
          </button>
        </div>
      </div>
    </div>
  );
}
