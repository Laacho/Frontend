import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authApi } from '../../api/auth';
import { useAuth } from '../../hooks/useAuth';
import { getApiError } from '../../api/client';
import { validateEGN } from '../../utils/egn';
import { Spinner } from '../../components/ui/Spinner';

function PasswordStrength({ password }: { password: string }) {
  const getStrength = (p: string) => {
    let score = 0;
    if (p.length >= 8) score++;
    if (p.length >= 12) score++;
    if (/[A-Z]/.test(p) && /[a-z]/.test(p)) score++;
    if (/[0-9]/.test(p)) score++;
    if (/[^a-zA-Z0-9]/.test(p)) score++;
    return Math.min(4, score);
  };

  const strength = getStrength(password);
  const colors = ['#E5E2D9', '#A8362F', '#B5781E', '#C8A878', '#1F7A4D'];
  const labels = ['', 'Weak', 'Fair', 'Good', 'Strong'];

  if (!password) return null;

  return (
    <div className="mt-2">
      <div className="flex gap-1 mb-1">
        {[1, 2, 3, 4].map(i => (
          <div
            key={i}
            className="h-1 flex-1 rounded-full transition-colors"
            style={{ backgroundColor: i <= strength ? colors[strength] : '#E5E2D9' }}
          />
        ))}
      </div>
      <p className="text-[11px]" style={{ color: colors[strength], fontFamily: 'Geist, sans-serif' }}>
        {labels[strength]}
      </p>
    </div>
  );
}

function FormSection({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="mb-6">
      <p
        className="text-[10px] tracking-[0.14em] uppercase font-semibold mb-3 pb-2 border-b"
        style={{ color: '#8A8F99', fontFamily: '"Geist Mono", monospace', borderColor: '#EFEDE6' }}
      >
        {label}
      </p>
      {children}
    </div>
  );
}

function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return (
    <div>
      <label
        className="block text-xs font-medium mb-1.5"
        style={{ color: '#5C6470', fontFamily: 'Geist, sans-serif' }}
      >
        {label}
      </label>
      {children}
      {error && (
        <p className="text-xs mt-1" style={{ color: '#A8362F', fontFamily: 'Geist, sans-serif' }}>{error}</p>
      )}
    </div>
  );
}

const inputStyle = {
  borderColor: '#E5E2D9',
  backgroundColor: '#fff',
  color: '#14181F',
  fontFamily: 'Geist, sans-serif',
};

export function RegisterPage() {
  const [form, setForm] = useState({
    firstName: '', secondName: '', thirdName: '',
    egn: '', birthDate: '',
    phoneNumber: '', email: '',
    username: '', password: '', confirmPassword: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState('');

  const { login } = useAuth();
  const navigate = useNavigate();

  function set(field: string, value: string) {
    setForm(prev => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors(prev => { const e = { ...prev }; delete e[field]; return e; });
  }

  function validate() {
    const e: Record<string, string> = {};
    if (!form.firstName.trim()) e.firstName = 'Required';
    if (!form.secondName.trim()) e.secondName = 'Required';
    if (!form.thirdName.trim()) e.thirdName = 'Required';
    if (!form.egn || !validateEGN(form.egn)) e.egn = 'Invalid EGN checksum';
    if (!form.birthDate) e.birthDate = 'Required';
    if (!form.phoneNumber.trim()) e.phoneNumber = 'Required';
    if (!form.email.trim() || !form.email.includes('@')) e.email = 'Invalid email';
    if (!form.username.trim()) e.username = 'Required';
    if (form.password.length < 8) e.password = 'At least 8 characters';
    if (form.password !== form.confirmPassword) e.confirmPassword = 'Passwords do not match';
    return e;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
    setApiError('');
    setLoading(true);
    try {
      const data = await authApi.register({
        firstName: form.firstName,
        secondName: form.secondName,
        thirdName: form.thirdName,
        username: form.username,
        password: form.password,
        egn: form.egn,
        birthDate: form.birthDate,
        phoneNumber: form.phoneNumber,
        email: form.email,
      });
      login(data.accessToken, data.refreshToken);
      navigate('/2fa/setup');
    } catch (err) {
      setApiError(getApiError(err));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center py-12 px-4" style={{ backgroundColor: '#F4F2EC' }}>
      {/* Logo */}
      <div className="flex items-center gap-3 mb-8">
        <div
          className="w-9 h-9 flex items-center justify-center rounded border font-bold text-lg"
          style={{ borderColor: '#C8A878', color: '#C8A878', fontFamily: 'Fraunces, serif' }}
        >
          B
        </div>
        <span style={{ fontFamily: 'Fraunces, serif', color: '#14181F', fontSize: '20px' }}>
          Balkan United Bank
        </span>
      </div>

      <div
        className="w-full max-w-2xl rounded-xl border p-8"
        style={{ backgroundColor: '#fff', borderColor: '#E5E2D9' }}
      >
        <h1
          className="text-2xl font-medium mb-1"
          style={{ fontFamily: 'Fraunces, serif', color: '#14181F' }}
        >
          Create your account
        </h1>
        <p className="text-sm mb-8" style={{ color: '#5C6470', fontFamily: 'Geist, sans-serif' }}>
          Join Balkan United Bank — it takes about 2 minutes.
        </p>

        {apiError && (
          <div
            className="flex items-start gap-3 p-3 rounded-lg border-l-4 mb-6"
            style={{ backgroundColor: '#FBEDEB', borderLeftColor: '#A8362F' }}
          >
            <div
              className="flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold text-white"
              style={{ backgroundColor: '#A8362F' }}
            >
              !
            </div>
            <p className="text-sm" style={{ color: '#A8362F', fontFamily: 'Geist, sans-serif' }}>{apiError}</p>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <FormSection label="Legal name">
            <div className="grid grid-cols-3 gap-3">
              <Field label="First name" error={errors.firstName}>
                <input
                  type="text"
                  value={form.firstName}
                  onChange={e => set('firstName', e.target.value)}
                  className="w-full px-3 py-2.5 rounded-lg border text-sm outline-none focus:border-[#0F2A47]"
                  style={inputStyle}
                  placeholder="Ivan"
                />
              </Field>
              <Field label="Middle name" error={errors.secondName}>
                <input
                  type="text"
                  value={form.secondName}
                  onChange={e => set('secondName', e.target.value)}
                  className="w-full px-3 py-2.5 rounded-lg border text-sm outline-none focus:border-[#0F2A47]"
                  style={inputStyle}
                  placeholder="Georgiev"
                />
              </Field>
              <Field label="Last name" error={errors.thirdName}>
                <input
                  type="text"
                  value={form.thirdName}
                  onChange={e => set('thirdName', e.target.value)}
                  className="w-full px-3 py-2.5 rounded-lg border text-sm outline-none focus:border-[#0F2A47]"
                  style={inputStyle}
                  placeholder="Petrov"
                />
              </Field>
            </div>
          </FormSection>

          <FormSection label="Identity">
            <div className="grid grid-cols-2 gap-3">
              <Field label="EGN" error={errors.egn}>
                <input
                  type="text"
                  value={form.egn}
                  onChange={e => set('egn', e.target.value)}
                  maxLength={10}
                  className="w-full px-3 py-2.5 rounded-lg border text-sm outline-none focus:border-[#0F2A47]"
                  style={{ ...inputStyle, fontFamily: '"Geist Mono", monospace' }}
                  placeholder="0000000000"
                />
                <p className="text-[11px] mt-1" style={{ color: '#8A8F99', fontFamily: 'Geist, sans-serif' }}>
                  10-digit Bulgarian personal number
                </p>
              </Field>
              <Field label="Date of birth" error={errors.birthDate}>
                <input
                  type="date"
                  value={form.birthDate}
                  onChange={e => set('birthDate', e.target.value)}
                  className="w-full px-3 py-2.5 rounded-lg border text-sm outline-none focus:border-[#0F2A47]"
                  style={inputStyle}
                />
              </Field>
            </div>
          </FormSection>

          <FormSection label="Contact">
            <div className="grid grid-cols-2 gap-3">
              <Field label="Phone number" error={errors.phoneNumber}>
                <input
                  type="tel"
                  value={form.phoneNumber}
                  onChange={e => set('phoneNumber', e.target.value)}
                  className="w-full px-3 py-2.5 rounded-lg border text-sm outline-none focus:border-[#0F2A47]"
                  style={inputStyle}
                  placeholder="+359 88 888 8888"
                />
              </Field>
              <Field label="Email address" error={errors.email}>
                <input
                  type="email"
                  value={form.email}
                  onChange={e => set('email', e.target.value)}
                  className="w-full px-3 py-2.5 rounded-lg border text-sm outline-none focus:border-[#0F2A47]"
                  style={inputStyle}
                  placeholder="ivan@example.com"
                />
              </Field>
            </div>
          </FormSection>

          <FormSection label="Credentials">
            <div className="grid grid-cols-2 gap-3">
              <Field label="Username" error={errors.username}>
                <input
                  type="text"
                  value={form.username}
                  onChange={e => set('username', e.target.value)}
                  autoComplete="username"
                  className="w-full px-3 py-2.5 rounded-lg border text-sm outline-none focus:border-[#0F2A47]"
                  style={inputStyle}
                  placeholder="ivan.petrov"
                />
              </Field>
              <Field label="Password" error={errors.password}>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={form.password}
                    onChange={e => set('password', e.target.value)}
                    autoComplete="new-password"
                    className="w-full px-3 py-2.5 pr-10 rounded-lg border text-sm outline-none focus:border-[#0F2A47]"
                    style={inputStyle}
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2"
                    style={{ color: '#8A8F99' }}
                  >
                    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-4 h-4">
                      <path d="M2 8s2-4 6-4 6 4 6 4-2 4-6 4-6-4-6-4z" />
                      <circle cx="8" cy="8" r="2" />
                    </svg>
                  </button>
                </div>
                <PasswordStrength password={form.password} />
              </Field>
            </div>
            <div className="mt-3">
              <Field label="Confirm password" error={errors.confirmPassword}>
                <input
                  type="password"
                  value={form.confirmPassword}
                  onChange={e => set('confirmPassword', e.target.value)}
                  autoComplete="new-password"
                  className="w-full px-3 py-2.5 rounded-lg border text-sm outline-none focus:border-[#0F2A47]"
                  style={inputStyle}
                  placeholder="••••••••"
                />
              </Field>
            </div>
          </FormSection>

          <div className="flex items-center justify-between pt-4 border-t" style={{ borderColor: '#EFEDE6' }}>
            <Link
              to="/login"
              className="text-sm hover:underline"
              style={{ color: '#5C6470', fontFamily: 'Geist, sans-serif' }}
            >
              Already have an account? Sign in
            </Link>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2.5 rounded-lg text-sm font-medium flex items-center gap-2 transition-opacity disabled:opacity-60"
              style={{ backgroundColor: '#0F2A47', color: '#fff', fontFamily: 'Geist, sans-serif' }}
            >
              {loading && <Spinner size="sm" className="text-white" />}
              Continue
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
