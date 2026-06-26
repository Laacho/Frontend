import React, { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { adminApi } from '../../api/admin';
import { ErrorBanner } from '../../components/ui/ErrorBanner';
import { Spinner } from '../../components/ui/Spinner';
import { getApiError } from '../../api/client';

export function AdminBulkPage() {
  const [recipientInput, setRecipientInput] = useState('');
  const [recipients, setRecipients] = useState<string[]>([]);
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const mutation = useMutation({
    mutationFn: () => adminApi.bulkNotification({ userIds: recipients, title, message }),
    onSuccess: () => {
      setSuccess(`Notification sent to ${recipients.length} users.`);
      setRecipients([]); setTitle(''); setMessage('');
    },
    onError: (err) => setError(getApiError(err)),
  });

  function addRecipient() {
    const id = recipientInput.trim();
    if (id && !recipients.includes(id)) {
      setRecipients(prev => [...prev, id]);
    }
    setRecipientInput('');
  }

  function removeRecipient(id: string) {
    setRecipients(prev => prev.filter(r => r !== id));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (recipients.length === 0) { setError('Add at least one recipient'); return; }
    if (!title.trim()) { setError('Enter a title'); return; }
    if (!message.trim()) { setError('Enter a message'); return; }
    setError(''); setSuccess('');
    mutation.mutate();
  }

  const inputStyle = { borderColor: 'var(--c-border)', backgroundColor: 'var(--c-surface)', color: 'var(--c-text)', fontFamily: 'Geist, sans-serif' };

  return (
    <div className="animate-bub-fade">
      <div className="flex items-center gap-2 mb-5">
        <span className="text-[10px] px-2 py-1 rounded font-semibold tracking-wider" style={{ backgroundColor: '#FBF1E2', color: '#B5781E', fontFamily: '"Geist Mono", monospace' }}>
          ADMIN / STAFF
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Form */}
        <div className="lg:col-span-3">
          <div className="rounded-xl border p-6" style={{ backgroundColor: 'var(--c-surface)', borderColor: 'var(--c-border)' }}>
            <h2 className="text-xl font-semibold mb-1" style={{ fontFamily: 'Fraunces, serif', color: 'var(--c-text)' }}>
              Bulk send
            </h2>
            <p className="text-sm mb-6" style={{ color: 'var(--c-text-2)', fontFamily: 'Geist, sans-serif' }}>
              Send a notification to multiple specific users.
            </p>

            {error && <ErrorBanner message={error} className="mb-4" />}
            {success && (
              <div className="p-3 rounded-lg border-l-4 mb-4" style={{ backgroundColor: '#E3F2EA', borderLeftColor: '#1F7A4D' }}>
                <p className="text-sm" style={{ color: '#1F7A4D', fontFamily: 'Geist, sans-serif' }}>{success}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Recipients */}
              <div>
                <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--c-text-2)', fontFamily: 'Geist, sans-serif' }}>
                  Recipients
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={recipientInput}
                    onChange={e => setRecipientInput(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addRecipient())}
                    placeholder="User ID…"
                    className="flex-1 px-3 py-2.5 rounded-lg border text-sm outline-none"
                    style={{ ...inputStyle, fontFamily: '"Geist Mono", monospace' }}
                  />
                  <button
                    type="button"
                    onClick={addRecipient}
                    className="px-3 py-2.5 rounded-lg border text-sm"
                    style={{ borderColor: 'var(--c-border)', color: '#0F2A47', fontFamily: 'Geist, sans-serif' }}
                  >
                    Add
                  </button>
                </div>
                {recipients.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {recipients.map(r => (
                      <span
                        key={r}
                        className="flex items-center gap-1.5 px-2 py-1 rounded-full text-xs"
                        style={{ backgroundColor: 'var(--c-bg)', border: '1px solid var(--c-border)', fontFamily: '"Geist Mono", monospace', color: 'var(--c-text)' }}
                      >
                        {r.slice(0, 8)}…
                        <button
                          type="button"
                          onClick={() => removeRecipient(r)}
                          className="hover:text-red-500"
                          style={{ color: 'var(--c-text-muted)' }}
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <div>
                <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--c-text-2)', fontFamily: 'Geist, sans-serif' }}>Title</label>
                <input type="text" value={title} onChange={e => setTitle(e.target.value)} placeholder="System maintenance notice" className="w-full px-3 py-2.5 rounded-lg border text-sm outline-none" style={inputStyle} />
              </div>
              <div>
                <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--c-text-2)', fontFamily: 'Geist, sans-serif' }}>Message</label>
                <textarea value={message} onChange={e => setMessage(e.target.value)} rows={4} className="w-full px-3 py-2.5 rounded-lg border text-sm outline-none resize-none" style={inputStyle} />
              </div>
              <button
                type="submit"
                disabled={mutation.isPending || recipients.length === 0}
                className="flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium disabled:opacity-60"
                style={{ backgroundColor: '#0F2A47', color: 'var(--c-on-brand)', fontFamily: 'Geist, sans-serif' }}
              >
                {mutation.isPending && <Spinner size="sm" className="text-white" />}
                Send to {recipients.length} user{recipients.length !== 1 ? 's' : ''}
              </button>
            </form>
          </div>
        </div>

        {/* Right panel */}
        <div className="lg:col-span-2">
          <div className="rounded-xl border p-5" style={{ backgroundColor: 'var(--c-surface)', borderColor: 'var(--c-border)' }}>
            <p className="text-xs font-semibold mb-3" style={{ color: 'var(--c-text-muted)', fontFamily: '"Geist Mono", monospace' }}>
              AUDIENCE
            </p>
            <div className="space-y-3">
              {[
                { label: 'All users with active accounts', checked: false },
                { label: 'All users with active cards', checked: false },
                { label: 'Users with pending transactions', checked: false },
                { label: 'Users with frozen accounts', checked: false },
              ].map(filter => (
                <label key={filter.label} className="flex items-center gap-3 cursor-pointer">
                  <input type="checkbox" defaultChecked={filter.checked} className="rounded" />
                  <span className="text-sm" style={{ color: 'var(--c-text-2)', fontFamily: 'Geist, sans-serif' }}>{filter.label}</span>
                </label>
              ))}
            </div>
            <div className="mt-4 pt-4 border-t" style={{ borderColor: 'var(--c-surface-2)' }}>
              <p className="text-xs" style={{ color: 'var(--c-text-muted)', fontFamily: 'Geist, sans-serif' }}>
                {recipients.length} recipient{recipients.length !== 1 ? 's' : ''} manually specified above.
                Audience filters are informational only — recipients are those added by ID.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
