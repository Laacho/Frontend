import React, { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { adminApi } from '../../api/admin';
import { ErrorBanner } from '../../components/ui/ErrorBanner';
import { Spinner } from '../../components/ui/Spinner';
import { getApiError } from '../../api/client';

export function AdminSendPage() {
  const [userId, setUserId] = useState('');
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const mutation = useMutation({
    mutationFn: () => adminApi.sendNotification({ userId, title, message }),
    onSuccess: () => {
      setSuccess('Notification sent successfully.');
      setUserId(''); setTitle(''); setMessage('');
    },
    onError: (err) => setError(getApiError(err)),
  });

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!userId.trim()) { setError('Enter a user ID'); return; }
    if (!title.trim()) { setError('Enter a title'); return; }
    if (!message.trim()) { setError('Enter a message'); return; }
    setError(''); setSuccess('');
    mutation.mutate();
  }

  const inputStyle = { borderColor: '#E5E2D9', backgroundColor: '#fff', color: '#14181F', fontFamily: 'Geist, sans-serif' };

  return (
    <div className="animate-bub-fade">
      <div className="flex items-center gap-2 mb-5">
        <span
          className="text-[10px] px-2 py-1 rounded font-semibold tracking-wider"
          style={{ backgroundColor: '#FBF1E2', color: '#B5781E', fontFamily: '"Geist Mono", monospace' }}
        >
          ADMIN / STAFF
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Form */}
        <div className="lg:col-span-3">
          <div className="rounded-xl border p-6" style={{ backgroundColor: '#fff', borderColor: '#E5E2D9' }}>
            <h2 className="text-xl font-semibold mb-1" style={{ fontFamily: 'Fraunces, serif', color: '#14181F' }}>
              Send notification
            </h2>
            <p className="text-sm mb-6" style={{ color: '#5C6470', fontFamily: 'Geist, sans-serif' }}>
              Send a targeted notification to a specific user.
            </p>

            {error && <ErrorBanner message={error} className="mb-4" />}
            {success && (
              <div className="p-3 rounded-lg border-l-4 mb-4" style={{ backgroundColor: '#E3F2EA', borderLeftColor: '#1F7A4D' }}>
                <p className="text-sm" style={{ color: '#1F7A4D', fontFamily: 'Geist, sans-serif' }}>{success}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-medium mb-1.5" style={{ color: '#5C6470', fontFamily: 'Geist, sans-serif' }}>
                  Recipient user ID
                </label>
                <input
                  type="text"
                  value={userId}
                  onChange={e => setUserId(e.target.value)}
                  placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
                  className="w-full px-3 py-2.5 rounded-lg border text-sm outline-none"
                  style={{ ...inputStyle, fontFamily: '"Geist Mono", monospace' }}
                />
              </div>
              <div>
                <label className="block text-xs font-medium mb-1.5" style={{ color: '#5C6470', fontFamily: 'Geist, sans-serif' }}>
                  Title
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  placeholder="Account alert"
                  className="w-full px-3 py-2.5 rounded-lg border text-sm outline-none"
                  style={inputStyle}
                />
              </div>
              <div>
                <label className="block text-xs font-medium mb-1.5" style={{ color: '#5C6470', fontFamily: 'Geist, sans-serif' }}>
                  Message
                </label>
                <textarea
                  value={message}
                  onChange={e => setMessage(e.target.value)}
                  rows={4}
                  placeholder="Your account has been…"
                  className="w-full px-3 py-2.5 rounded-lg border text-sm outline-none resize-none"
                  style={inputStyle}
                />
              </div>
              <button
                type="submit"
                disabled={mutation.isPending}
                className="flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium disabled:opacity-60"
                style={{ backgroundColor: '#0F2A47', color: '#fff', fontFamily: 'Geist, sans-serif' }}
              >
                {mutation.isPending && <Spinner size="sm" className="text-white" />}
                Send
              </button>
            </form>
          </div>
        </div>

        {/* Preview */}
        <div className="lg:col-span-2">
          <div className="rounded-xl border p-5" style={{ backgroundColor: '#fff', borderColor: '#E5E2D9' }}>
            <p className="text-xs font-semibold mb-4" style={{ color: '#8A8F99', fontFamily: '"Geist Mono", monospace' }}>
              NOTIFICATION PREVIEW
            </p>
            <div className="rounded-xl border p-4" style={{ backgroundColor: '#F4F2EC', borderColor: '#E5E2D9' }}>
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0" style={{ backgroundColor: '#E5E2D9' }}>
                  <svg viewBox="0 0 16 16" fill="none" stroke="#5C6470" strokeWidth="1.5" className="w-4 h-4">
                    <path d="M10 2C7.515 2 5.5 4.015 5.5 6.5v3.5L4 11.5h12l-1.5-1.5V6.5C14.5 4.015 12.485 2 10 2z" />
                    <path d="M8.5 11.5a1.5 1.5 0 003 0" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-semibold mb-1" style={{ color: '#14181F', fontFamily: 'Geist, sans-serif' }}>
                    {title || 'Notification title'}
                  </p>
                  <p className="text-xs leading-relaxed" style={{ color: '#5C6470', fontFamily: 'Geist, sans-serif' }}>
                    {message || 'The notification body will appear here.'}
                  </p>
                  <p className="text-[10px] mt-2" style={{ color: '#8A8F99', fontFamily: '"Geist Mono", monospace' }}>
                    Just now · IN_APP
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
