import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { settingsApi } from '../../api/settings';
import { authApi, TWO_FA_SETUP_KEY, TWO_FA_SETUP_STALE_MS } from '../../api/auth';
import { Toggle } from '../../components/ui/Toggle';
import { ErrorBanner } from '../../components/ui/ErrorBanner';
import { Spinner } from '../../components/ui/Spinner';
import { getApiError } from '../../api/client';
import { useLang } from '../../hooks/useLang';
import { useAuth } from '../../hooks/useAuth';
import { useNavigate } from 'react-router-dom';

type Tab = 'profile' | 'notifications' | 'security' | 'language';

const TABS: { id: Tab; label: string }[] = [
  { id: 'profile', label: 'Profile' },
  { id: 'notifications', label: 'Notifications' },
  { id: 'security', label: 'Security & 2FA' },
  { id: 'language', label: 'Language' },
];

function ProfileTab() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { t } = useLang();

  const initials = user?.username ? user.username.substring(0, 2).toUpperCase() : 'U';

  return (
    <div>
      <div className="flex items-center gap-4 mb-6 pb-6 border-b" style={{ borderColor: '#EFEDE6' }}>
        <div
          className="w-16 h-16 rounded-full flex items-center justify-center text-xl font-semibold"
          style={{ backgroundColor: '#C8A878', color: '#0F2A47', fontFamily: 'Fraunces, serif' }}
        >
          {initials}
        </div>
        <div>
          <p className="text-lg font-semibold" style={{ fontFamily: 'Fraunces, serif', color: '#14181F' }}>
            {user?.username || 'User'}
          </p>
          <span
            className="text-xs px-2 py-0.5 rounded"
            style={{ backgroundColor: '#EFEDE6', color: '#5C6470', fontFamily: '"Geist Mono", monospace' }}
          >
            {user?.role || 'USER'}
          </span>
        </div>
      </div>

      <div className="space-y-3 mb-8">
        <p className="text-[10px] tracking-[0.14em] uppercase font-semibold" style={{ color: '#8A8F99', fontFamily: '"Geist Mono", monospace' }}>
          Account details
        </p>
        {[
          { label: t.username, value: user?.username || '—', mono: true },
          { label: t.role, value: user?.role || 'USER', mono: true },
        ].map(row => (
          <div key={row.label} className="flex justify-between items-center py-3 border-b" style={{ borderColor: '#EFEDE6' }}>
            <span className="text-xs" style={{ color: '#8A8F99', fontFamily: 'Geist, sans-serif' }}>{row.label}</span>
            <span
              className="text-sm"
              style={{ color: '#14181F', fontFamily: row.mono ? '"Geist Mono", monospace' : 'Geist, sans-serif' }}
            >
              {row.value}
            </span>
          </div>
        ))}
      </div>

      <div className="border-t pt-6" style={{ borderColor: '#EFEDE6' }}>
        <p className="text-[10px] tracking-[0.14em] uppercase font-semibold mb-3" style={{ color: '#A8362F', fontFamily: '"Geist Mono", monospace' }}>
          DANGER ZONE
        </p>
        <button
          onClick={() => { logout(); navigate('/login'); }}
          className="w-full flex items-center gap-2 px-4 py-3 rounded-lg border text-sm font-medium"
          style={{ borderColor: '#FBEDEB', color: '#A8362F', backgroundColor: '#FBEDEB', fontFamily: 'Geist, sans-serif' }}
        >
          <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-4 h-4">
            <path d="M6 2H3a1 1 0 00-1 1v10a1 1 0 001 1h3M10 11l3-3-3-3M13 8H6" />
          </svg>
          {t.signOut}
        </button>
      </div>
    </div>
  );
}

function NotificationsTab() {
  const queryClient = useQueryClient();
  const [error, setError] = useState('');

  const { data: settings, isLoading } = useQuery({
    queryKey: ['settings'],
    queryFn: settingsApi.get,
  });

  const mutation = useMutation({
    mutationFn: (data: Partial<typeof settings>) => settingsApi.update(data as any),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['settings'] }),
    onError: (err) => setError(getApiError(err)),
  });

  if (isLoading) return <div className="py-8 flex justify-center"><Spinner className="text-[#C8A878]" /></div>;
  if (!settings) return null;

  return (
    <div>
      <p className="text-sm mb-6" style={{ color: '#5C6470', fontFamily: 'Geist, sans-serif' }}>
        Choose how you receive notifications from Balkan United Bank.
      </p>

      {error && <ErrorBanner message={error} className="mb-4" />}

      <div className="space-y-4">
        {[
          {
            key: 'emailNotificationsEnabled' as const,
            title: 'Email notifications',
            description: 'Transaction confirmations and alerts sent to your email',
          },
          {
            key: 'internalNotificationsEnabled' as const,
            title: 'In-app notifications',
            description: 'Push notifications and bell alerts in the dashboard',
          },
        ].map(item => (
          <div
            key={item.key}
            className="flex items-center justify-between p-4 rounded-xl border"
            style={{ borderColor: '#E5E2D9', backgroundColor: '#fff' }}
          >
            <div>
              <p className="text-sm font-medium mb-1" style={{ color: '#14181F', fontFamily: 'Geist, sans-serif' }}>
                {item.title}
              </p>
              <p className="text-xs" style={{ color: '#8A8F99', fontFamily: 'Geist, sans-serif' }}>
                {item.description}
              </p>
            </div>
            <Toggle
              checked={settings[item.key]}
              onChange={val => mutation.mutate({ [item.key]: val })}
              disabled={mutation.isPending}
            />
          </div>
        ))}
      </div>
    </div>
  );
}

function SecurityTab() {
  const queryClient = useQueryClient();
  const { data: settings } = useQuery({
    queryKey: ['settings'],
    queryFn: settingsApi.get,
  });

  // Warm the 2FA setup (QR + secret) on hover/focus so the setup page paints instantly.
  // Same key + staleTime the setup page reads, so it reuses this result and the
  // displayed QR matches the secret stored by this very call.
  const prefetch2FA = () => {
    queryClient.prefetchQuery({
      queryKey: TWO_FA_SETUP_KEY,
      queryFn: authApi.setup2FA,
      staleTime: TWO_FA_SETUP_STALE_MS,
    });
  };

  const [currentPwd, setCurrentPwd] = useState('');
  const [newPwd, setNewPwd] = useState('');
  const [confirmPwd, setConfirmPwd] = useState('');
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();
  const auth = useAuth();

  async function handlePasswordChange(e: React.FormEvent) {
    e.preventDefault();
    if (newPwd !== confirmPwd) { setError('New passwords do not match'); return; }
    if (newPwd.length < 8) { setError('Password must be at least 8 characters'); return; }
    setError('');
    setSubmitting(true);
    try {
      const tokens = await authApi.changePassword(currentPwd, newPwd);
      // Backend bumps tokensValidFrom and invalidates old refresh token; persist
      // the fresh pair so THIS session survives instead of being force-logged-out.
      auth.login(tokens.accessToken, tokens.refreshToken);
      setSuccess('Password updated successfully');
      setCurrentPwd(''); setNewPwd(''); setConfirmPwd('');
    } catch (err) {
      setError(getApiError(err));
    } finally {
      setSubmitting(false);
    }
  }

  const inputStyle = { borderColor: '#E5E2D9', backgroundColor: '#fff', color: '#14181F', fontFamily: 'Geist, sans-serif' };

  return (
    <div>
      {/* 2FA panel */}
      <div className="mb-6 p-5 rounded-xl border" style={{ borderColor: '#E5E2D9', backgroundColor: '#fff' }}>
        <div className="flex items-center justify-between mb-3">
          <div>
            <p className="text-sm font-semibold" style={{ color: '#14181F', fontFamily: 'Geist, sans-serif' }}>
              Two-factor authentication
            </p>
            <p className="text-xs" style={{ color: '#8A8F99', fontFamily: 'Geist, sans-serif' }}>
              Adds an extra layer of security to your account.
            </p>
          </div>
          {settings?.twoFactorEnabled ? (
            <span
              className="text-xs px-2 py-1 rounded-full font-medium"
              style={{ backgroundColor: '#E3F2EA', color: '#1F7A4D', fontFamily: 'Geist, sans-serif' }}
            >
              Enabled
            </span>
          ) : (
            <span
              className="text-xs px-2 py-1 rounded-full font-medium"
              style={{ backgroundColor: '#EFEDE6', color: '#5C6470', fontFamily: 'Geist, sans-serif' }}
            >
              Disabled
            </span>
          )}
        </div>
        <button
          onClick={() => navigate('/2fa/setup')}
          // Prefetch the QR/secret on hover/focus so the setup page paints instantly.
          onMouseEnter={prefetch2FA}
          onFocus={prefetch2FA}
          className="px-4 py-2 rounded-lg text-sm font-medium border"
          style={{ borderColor: '#E5E2D9', color: '#0F2A47', fontFamily: 'Geist, sans-serif' }}
        >
          {settings?.twoFactorEnabled ? 'Reconfigure 2FA' : 'Set up 2FA'}
        </button>
      </div>

      {/* Change password */}
      <div className="p-5 rounded-xl border" style={{ borderColor: '#E5E2D9', backgroundColor: '#fff' }}>
        <p className="text-sm font-semibold mb-4" style={{ color: '#14181F', fontFamily: 'Geist, sans-serif' }}>
          Change password
        </p>

        {error && <ErrorBanner message={error} className="mb-4" />}
        {success && (
          <div className="p-3 rounded-lg border-l-4 mb-4" style={{ backgroundColor: '#E3F2EA', borderLeftColor: '#1F7A4D' }}>
            <p className="text-sm" style={{ color: '#1F7A4D', fontFamily: 'Geist, sans-serif' }}>{success}</p>
          </div>
        )}

        <form onSubmit={handlePasswordChange} className="space-y-3">
          {[
            { label: 'Current password', value: currentPwd, setValue: setCurrentPwd, show: showCurrent, setShow: setShowCurrent },
            { label: 'New password', value: newPwd, setValue: setNewPwd, show: showNew, setShow: setShowNew },
            { label: 'Confirm new password', value: confirmPwd, setValue: setConfirmPwd, show: showConfirm, setShow: setShowConfirm },
          ].map(field => (
            <div key={field.label}>
              <label className="block text-xs font-medium mb-1" style={{ color: '#5C6470', fontFamily: 'Geist, sans-serif' }}>
                {field.label}
              </label>
              <div className="relative">
                <input
                  type={field.show ? 'text' : 'password'}
                  value={field.value}
                  onChange={e => field.setValue(e.target.value)}
                  className="w-full px-3 py-2.5 pr-10 rounded-lg border text-sm outline-none"
                  style={inputStyle}
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => field.setShow(!field.show)}
                  className="absolute right-3 top-1/2 -translate-y-1/2"
                  style={{ color: '#8A8F99' }}
                >
                  <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-4 h-4">
                    <path d="M2 8s2-4 6-4 6 4 6 4-2 4-6 4-6-4-6-4z" />
                    <circle cx="8" cy="8" r="2" />
                  </svg>
                </button>
              </div>
            </div>
          ))}
          <button
            type="submit"
            disabled={submitting}
            className="w-full py-2.5 rounded-lg text-sm font-medium mt-2 disabled:opacity-60"
            style={{ backgroundColor: '#0F2A47', color: '#fff', fontFamily: 'Geist, sans-serif' }}
          >
            {submitting ? 'Updating…' : 'Update password'}
          </button>
        </form>
      </div>
    </div>
  );
}

function LanguageTab() {
  const { lang, setLang } = useLang();

  return (
    <div>
      <p className="text-sm mb-6" style={{ color: '#5C6470', fontFamily: 'Geist, sans-serif' }}>
        Choose the display language for Balkan United Bank.
      </p>
      <div className="grid grid-cols-2 gap-4">
        {[
          { code: 'en' as const, label: 'English', sublabel: 'English', flag: '🇬🇧' },
          { code: 'bg' as const, label: 'Български', sublabel: 'Bulgarian', flag: '🇧🇬' },
        ].map(lng => (
          <button
            key={lng.code}
            onClick={() => setLang(lng.code)}
            className="p-5 rounded-xl border-2 text-left transition-all"
            style={{
              borderColor: lang === lng.code ? '#0F2A47' : '#E5E2D9',
              backgroundColor: lang === lng.code ? '#F4F2EC' : '#fff',
            }}
          >
            <div className="text-2xl mb-3">{lng.flag}</div>
            <p className="text-base font-semibold" style={{ fontFamily: 'Fraunces, serif', color: '#14181F' }}>
              {lng.label}
            </p>
            <p className="text-xs" style={{ color: '#8A8F99', fontFamily: 'Geist, sans-serif' }}>
              {lng.sublabel}
            </p>
            {lang === lng.code && (
              <div className="mt-3">
                <span
                  className="text-[10px] px-2 py-0.5 rounded-full font-medium"
                  style={{ backgroundColor: '#E3F2EA', color: '#1F7A4D', fontFamily: 'Geist, sans-serif' }}
                >
                  Active
                </span>
              </div>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}

export function SettingsPage() {
  const [activeTab, setActiveTab] = useState<Tab>('profile');
  const { t } = useLang();

  const tabLabels: Record<Tab, string> = {
    profile: t.profile,
    notifications: t.notifications,
    security: t.security,
    language: t.language,
  };

  const tabContent: Record<Tab, React.ReactNode> = {
    profile: <ProfileTab />,
    notifications: <NotificationsTab />,
    security: <SecurityTab />,
    language: <LanguageTab />,
  };

  return (
    <div className="animate-bub-fade">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Left: Tab list */}
        <div className="lg:col-span-1">
          <nav className="rounded-xl border overflow-hidden" style={{ backgroundColor: '#fff', borderColor: '#E5E2D9' }}>
            {TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className="w-full flex items-center justify-between px-4 py-3 text-sm font-medium transition-colors border-b last:border-0"
                style={{
                  borderColor: '#EFEDE6',
                  backgroundColor: activeTab === tab.id ? '#F4F2EC' : '#fff',
                  color: activeTab === tab.id ? '#14181F' : '#5C6470',
                  fontFamily: 'Geist, sans-serif',
                  borderLeft: activeTab === tab.id ? '2px solid #0F2A47' : '2px solid transparent',
                }}
              >
                {tabLabels[tab.id]}
                <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-4 h-4 opacity-40">
                  <path d="M6 4l4 4-4 4" />
                </svg>
              </button>
            ))}
          </nav>
        </div>

        {/* Right: Tab content */}
        <div className="lg:col-span-3">
          <div className="rounded-xl border p-6" style={{ backgroundColor: '#fff', borderColor: '#E5E2D9' }}>
            <h2
              className="text-lg font-semibold mb-6"
              style={{ fontFamily: 'Fraunces, serif', color: '#14181F' }}
            >
              {tabLabels[activeTab]}
            </h2>
            {tabContent[activeTab]}
          </div>
        </div>
      </div>
    </div>
  );
}
