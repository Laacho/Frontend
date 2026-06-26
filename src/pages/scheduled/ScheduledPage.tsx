import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { transactionsApi } from '../../api/transactions';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { PageSpinner } from '../../components/ui/Spinner';
import { ErrorBanner } from '../../components/ui/ErrorBanner';
import { EmptyState } from '../../components/ui/EmptyState';
import { formatAmount, formatDate } from '../../utils/format';
import { useLang } from '../../hooks/useLang';

const FREQ_COLORS: Record<string, string> = {
  ONCE: '#8A8F99',
  DAILY: '#1F7A4D',
  WEEKLY: '#B5781E',
  MONTHLY: '#0F2A47',
};

export function ScheduledPage() {
  const { t } = useLang();
  const queryClient = useQueryClient();

  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ['scheduled'],
    queryFn: () => transactionsApi.listScheduled(0, 50),
  });

  const pauseMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      transactionsApi.updateScheduled(id, { status }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['scheduled'] }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => transactionsApi.deleteScheduled(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['scheduled'] }),
  });

  if (isLoading) return <PageSpinner />;

  const items = data?.content || [];

  return (
    <div className="animate-bub-fade">
      <div className="flex justify-end mb-5">
        <Link
          to="/scheduled/new"
          className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium"
          style={{ backgroundColor: '#0F2A47', color: '#fff', fontFamily: 'Geist, sans-serif' }}
        >
          <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-4 h-4">
            <line x1="8" y1="2" x2="8" y2="14" /><line x1="2" y1="8" x2="14" y2="8" />
          </svg>
          {t.newScheduled}
        </Link>
      </div>

      {isError ? (
        <ErrorBanner message={(error as Error)?.message || 'Failed to load'} onRetry={() => refetch()} />
      ) : items.length === 0 ? (
        <EmptyState
          title="No scheduled payments"
          description="Set up recurring or one-time future payments."
          action={
            <Link to="/scheduled/new" className="px-5 py-2.5 rounded-lg text-sm font-medium" style={{ backgroundColor: '#0F2A47', color: '#fff', fontFamily: 'Geist, sans-serif' }}>
              {t.newScheduled}
            </Link>
          }
        />
      ) : (
        <div className="space-y-3">
          {items.map(item => (
            <div
              key={item.id}
              className="flex items-center gap-4 rounded-xl border p-4"
              style={{ backgroundColor: '#fff', borderColor: '#E5E2D9' }}
            >
              {/* Color accent bar */}
              <div
                className="w-1 self-stretch rounded-full flex-shrink-0"
                style={{ backgroundColor: FREQ_COLORS[item.frequency] || '#8A8F99', minHeight: '40px' }}
              />

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <p className="text-sm font-medium truncate" style={{ color: '#14181F', fontFamily: 'Geist, sans-serif' }}>
                    {item.description || 'Scheduled payment'}
                  </p>
                  <StatusBadge status={item.status} />
                </div>
                <div className="flex items-center gap-3 flex-wrap">
                  <span
                    className="text-[11px] px-2 py-0.5 rounded"
                    style={{ backgroundColor: '#F4F2EC', color: '#5C6470', fontFamily: '"Geist Mono", monospace' }}
                  >
                    {item.frequency}
                  </span>
                  {item.nextExecutionDate && (
                    <span className="text-xs" style={{ color: '#8A8F99', fontFamily: 'Geist, sans-serif' }}>
                      Next: {formatDate(item.nextExecutionDate)}
                    </span>
                  )}
                </div>
              </div>

              <div className="text-right flex-shrink-0">
                <p className="text-base font-semibold" style={{ color: '#14181F', fontFamily: '"Geist Mono", monospace' }}>
                  {formatAmount(item.amount)} {item.currency}
                </p>
              </div>

              <div className="flex items-center gap-2 flex-shrink-0">
                {item.status === 'ACTIVE' ? (
                  <button
                    onClick={() => pauseMutation.mutate({ id: item.id, status: 'PAUSED' })}
                    className="px-3 py-1.5 rounded-lg text-xs border"
                    style={{ borderColor: '#E5E2D9', color: '#B5781E', fontFamily: 'Geist, sans-serif' }}
                  >
                    {t.pause}
                  </button>
                ) : item.status === 'PAUSED' ? (
                  <button
                    onClick={() => pauseMutation.mutate({ id: item.id, status: 'ACTIVE' })}
                    className="px-3 py-1.5 rounded-lg text-xs border"
                    style={{ borderColor: '#E5E2D9', color: '#1F7A4D', fontFamily: 'Geist, sans-serif' }}
                  >
                    {t.resume}
                  </button>
                ) : null}
                {item.status !== 'COMPLETED' && (
                  <button
                    onClick={() => deleteMutation.mutate(item.id)}
                    className="px-3 py-1.5 rounded-lg text-xs border"
                    style={{ borderColor: '#E5E2D9', color: '#A8362F', fontFamily: 'Geist, sans-serif' }}
                  >
                    {t.cancel}
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
