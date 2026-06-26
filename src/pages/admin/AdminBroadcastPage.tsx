import React, { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { adminApi } from '../../api/admin';
import { ErrorBanner } from '../../components/ui/ErrorBanner';
import { Spinner } from '../../components/ui/Spinner';
import { getApiError } from '../../api/client';

export function AdminBroadcastPage() {
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [confirmed, setConfirmed] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const mutation = useMutation({
    mutationFn: () => adminApi.broadcastNotification({ title, message }),
    onSuccess: () => {
      setSuccess('Broadcast sent to all users.');
      setTitle(''); setMessage(''); setConfirmed(false);
    },
    onError: (err) => setError(getApiError(err)),
  });

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!confirmed) { setError('Confirm that you want to broadcast to all users'); return; }
    if (!title.trim()) { setError('Enter a title'); return; }
    if (!message.trim()) { setError('Enter a message'); return; }
    setError(''); setSuccess('');
    mutation.mutate();
  }

  const inputStyle = { borderColor: 'var(--c-border)', backgroundColor: 'var(--c-surface)', color: 'var(--c-text)', fontFamily: 'Geist, sans-serif' };

  return (
    <div className="animate-bub-fade">
      <div className="flex items-center gap-2 mb-5">
        <span
          className="text-[10px] px-2 py-1 rounded font-semibold tracking-wider"
          style={{ backgroundColor: '#FBEDEB', color: '#A8362F', fontFamily: '"Geist Mono", monospace' }}
        >
          BROADCAST · SENT TO ALL USERS
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Form */}
        <div className="lg:col-span-3">
          <div className="rounded-xl border p-6" style={{ backgroundColor: 'var(--c-surface)', borderColor: 'var(--c-border)' }}>
            <h2 className="text-xl font-semibold mb-1" style={{ fontFamily: 'Fraunces, serif', color: 'var(--c-text)' }}>
              Broadcast notification
            </h2>
            <p className="text-sm mb-4" style={{ color: 'var(--c-text-2)', fontFamily: 'Geist, sans-serif' }}>
              This sends a notification to every user in the system.
            </p>

            {/* Warning banner */}
            <div
              className="flex items-start gap-3 p-4 rounded-lg mb-6"
              style={{ backgroundColor: '#FBEDEB', border: '1px solid #F0B8B5' }}
            >
              <svg viewBox="0 0 16 16" fill="none" stroke="#A8362F" strokeWidth="1.5" className="w-4 h-4 mt-0.5 flex-shrink-0">
                <path d="M8 1.5L14.5 13.5h-13L8 1.5z" />
                <line x1="8" y1="6" x2="8" y2="9.5" />
                <circle cx="8" cy="11.5" r="0.5" fill="currentColor" />
              </svg>
              <p className="text-sm" style={{ color: '#A8362F', fontFamily: 'Geist, sans-serif' }}>
                <strong>Warning:</strong> This will deliver a notification to every registered user. Use only for critical system announcements.
              </p>
            </div>

            {error && <ErrorBanner message={error} className="mb-4" />}
            {success && (
              <div className="p-3 rounded-lg border-l-4 mb-4" style={{ backgroundColor: '#E3F2EA', borderLeftColor: '#1F7A4D' }}>
                <p className="text-sm" style={{ color: '#1F7A4D', fontFamily: 'Geist, sans-serif' }}>{success}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--c-text-2)', fontFamily: 'Geist, sans-serif' }}>Title</label>
                <input type="text" value={title} onChange={e => setTitle(e.target.value)} placeholder="System announcement" className="w-full px-3 py-2.5 rounded-lg border text-sm outline-none" style={inputStyle} />
              </div>
              <div>
                <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--c-text-2)', fontFamily: 'Geist, sans-serif' }}>Message</label>
                <textarea value={message} onChange={e => setMessage(e.target.value)} rows={5} className="w-full px-3 py-2.5 rounded-lg border text-sm outline-none resize-none" style={inputStyle} />
              </div>

              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={confirmed}
                  onChange={e => setConfirmed(e.target.checked)}
                  className="mt-0.5"
                />
                <span className="text-sm" style={{ color: 'var(--c-text-2)', fontFamily: 'Geist, sans-serif' }}>
                  I understand this will be sent to all users and cannot be undone.
                </span>
              </label>

              <button
                type="submit"
                disabled={mutation.isPending || !confirmed}
                className="flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium disabled:opacity-60"
                style={{ backgroundColor: '#A8362F', color: 'var(--c-on-brand)', fontFamily: 'Geist, sans-serif' }}
              >
                {mutation.isPending && <Spinner size="sm" className="text-white" />}
                Broadcast now
              </button>
            </form>
          </div>
        </div>

        {/* Right panel */}
        <div className="lg:col-span-2">
          <div className="rounded-xl border p-5" style={{ backgroundColor: 'var(--c-surface)', borderColor: 'var(--c-border)' }}>
            <p className="text-xs font-semibold mb-3" style={{ color: 'var(--c-text-muted)', fontFamily: '"Geist Mono", monospace' }}>
              DELIVERY ESTIMATE
            </p>
            <div className="space-y-2 mb-5">
              {[
                { label: 'Total recipients', value: 'All users' },
                { label: 'Channels', value: 'IN_APP + EMAIL' },
                { label: 'Estimated delivery', value: '< 5 minutes' },
              ].map(row => (
                <div key={row.label} className="flex justify-between py-2 border-b" style={{ borderColor: 'var(--c-surface-2)' }}>
                  <span className="text-xs" style={{ color: 'var(--c-text-muted)', fontFamily: 'Geist, sans-serif' }}>{row.label}</span>
                  <span className="text-xs font-medium" style={{ color: 'var(--c-text)', fontFamily: '"Geist Mono", monospace' }}>{row.value}</span>
                </div>
              ))}
            </div>

            <p className="text-xs font-semibold mb-3" style={{ color: 'var(--c-text-muted)', fontFamily: '"Geist Mono", monospace' }}>
              RECENT BROADCASTS
            </p>
            <div className="p-4 rounded-lg text-center" style={{ backgroundColor: 'var(--c-bg)' }}>
              <p className="text-xs" style={{ color: 'var(--c-text-muted)', fontFamily: 'Geist, sans-serif' }}>
                No broadcast history available
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
