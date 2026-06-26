import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { notificationsApi } from '../../api/notifications';
import { PageSpinner } from '../../components/ui/Spinner';
import { ErrorBanner } from '../../components/ui/ErrorBanner';
import { EmptyState } from '../../components/ui/EmptyState';
import { formatRelativeTime } from '../../utils/format';
import { useLang } from '../../hooks/useLang';

function ChannelBadge({ channel }: { channel: string }) {
  const colors: Record<string, { bg: string; fg: string }> = {
    IN_APP: { bg: '#F4F2EC', fg: '#5C6470' },
    EMAIL: { bg: '#E3F2EA', fg: '#1F7A4D' },
    SMS: { bg: '#FBF1E2', fg: '#B5781E' },
  };
  const c = colors[channel] || { bg: '#EFEDE6', fg: '#5C6470' };
  return (
    <span
      className="text-[10px] px-1.5 py-0.5 rounded font-medium"
      style={{ backgroundColor: c.bg, color: c.fg, fontFamily: '"Geist Mono", monospace' }}
    >
      {channel}
    </span>
  );
}

function NotifIcon({ eventType }: { eventType: string }) {
  const type = (eventType || '').toLowerCase();
  const color = type.includes('fail') || type.includes('error') ? '#A8362F'
    : type.includes('success') || type.includes('complet') ? '#1F7A4D'
    : '#5C6470';

  return (
    <div
      className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0"
      style={{ backgroundColor: '#F4F2EC' }}
    >
      <svg viewBox="0 0 16 16" fill="none" stroke={color} strokeWidth="1.5" className="w-4 h-4">
        <path d="M10 2C7.515 2 5.5 4.015 5.5 6.5v3.5L4 11.5h12l-1.5-1.5V6.5C14.5 4.015 12.485 2 10 2z" />
        <path d="M8.5 11.5a1.5 1.5 0 003 0" />
      </svg>
    </div>
  );
}

export function NotificationsPage() {
  const { t } = useLang();
  const queryClient = useQueryClient();
  const [channelFilter, setChannelFilter] = useState('ALL');

  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ['notifications', 'all'],
    queryFn: () => notificationsApi.list(0, 50),
  });

  const markReadMutation = useMutation({
    mutationFn: (id: string) => notificationsApi.markRead(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['notifications'] }),
  });

  const markAllMutation = useMutation({
    mutationFn: () => notificationsApi.markAllRead(),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['notifications'] }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => notificationsApi.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['notifications'] }),
  });

  if (isLoading) return <PageSpinner />;

  const allNotifs = data?.content || [];
  const unreadCount = (data as any)?.unreadCount || allNotifs.filter(n => n.status !== 'READ').length;
  const filtered = channelFilter === 'ALL' ? allNotifs : allNotifs.filter(n => n.channel === channelFilter);

  return (
    <div className="animate-bub-fade">
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            {['ALL', 'IN_APP', 'EMAIL', 'SMS'].map(ch => (
              <button
                key={ch}
                onClick={() => setChannelFilter(ch)}
                className="px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors"
                style={{
                  borderColor: channelFilter === ch ? '#0F2A47' : '#E5E2D9',
                  backgroundColor: channelFilter === ch ? '#0F2A47' : '#fff',
                  color: channelFilter === ch ? '#fff' : '#5C6470',
                  fontFamily: '"Geist Mono", monospace',
                }}
              >
                {ch}
              </button>
            ))}
          </div>
          {unreadCount > 0 && (
            <span
              className="text-xs px-2 py-0.5 rounded-full font-medium"
              style={{ backgroundColor: '#FBEDEB', color: '#A8362F', fontFamily: 'Geist, sans-serif' }}
            >
              {unreadCount} unread
            </span>
          )}
        </div>

        <button
          onClick={() => markAllMutation.mutate()}
          disabled={markAllMutation.isPending || unreadCount === 0}
          className="text-sm hover:underline disabled:opacity-40"
          style={{ color: '#C8A878', fontFamily: 'Geist, sans-serif' }}
        >
          {t.markAllRead}
        </button>
      </div>

      {isError ? (
        <ErrorBanner message={(error as Error)?.message || 'Failed to load'} onRetry={() => refetch()} />
      ) : filtered.length === 0 ? (
        <EmptyState title={t.noNotifications} description="You're all caught up. Notifications will appear here." />
      ) : (
        <div className="rounded-xl border overflow-hidden" style={{ backgroundColor: '#fff', borderColor: '#E5E2D9' }}>
          {filtered.map((n) => {
            const isUnread = n.status !== 'READ';
            return (
              <div
                key={n.id}
                className="flex items-start gap-4 px-5 py-4 border-b last:border-0 cursor-pointer hover:bg-[#FAF8F2] transition-colors"
                style={{
                  borderColor: '#EFEDE6',
                  backgroundColor: isUnread ? '#FAF8F2' : '#fff',
                }}
                onClick={() => isUnread && markReadMutation.mutate(n.id)}
              >
                {/* Unread dot */}
                <div className="flex-shrink-0 mt-2.5">
                  <div
                    className="w-1.5 h-1.5 rounded-full"
                    style={{ backgroundColor: isUnread ? '#C8A878' : 'transparent' }}
                  />
                </div>

                <NotifIcon eventType={n.eventType} />

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                    <p className="text-sm font-medium" style={{ color: '#14181F', fontFamily: 'Geist, sans-serif' }}>
                      {n.title}
                    </p>
                    <span
                      className="text-[10px] px-1.5 py-0.5 rounded"
                      style={{ backgroundColor: '#EFEDE6', color: '#5C6470', fontFamily: '"Geist Mono", monospace' }}
                    >
                      {n.eventType}
                    </span>
                  </div>
                  <p className="text-xs leading-relaxed" style={{ color: '#5C6470', fontFamily: 'Geist, sans-serif' }}>
                    {n.message}
                  </p>
                </div>

                <div className="flex items-center gap-3 flex-shrink-0">
                  <ChannelBadge channel={n.channel} />
                  <span className="text-[11px]" style={{ color: '#8A8F99', fontFamily: '"Geist Mono", monospace' }}>
                    {formatRelativeTime(n.createdAt)}
                  </span>
                  <button
                    onClick={e => { e.stopPropagation(); deleteMutation.mutate(n.id); }}
                    className="p-1 rounded hover:bg-[#EFEDE6] transition-colors"
                    style={{ color: '#8A8F99' }}
                    aria-label="Delete notification"
                  >
                    <svg viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-3.5 h-3.5">
                      <line x1="2" y1="2" x2="12" y2="12" />
                      <line x1="12" y1="2" x2="2" y2="12" />
                    </svg>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
