import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { transactionsApi } from '../../api/transactions';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { PageSpinner } from '../../components/ui/Spinner';
import { ErrorBanner } from '../../components/ui/ErrorBanner';
import { formatAmount, formatDateTime } from '../../utils/format';
import { useLang } from '../../hooks/useLang';

export function TransactionDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { t } = useLang();
  const navigate = useNavigate();

  const { data: tx, isLoading, isError, error, refetch } = useQuery({
    queryKey: ['transaction', id],
    queryFn: () => transactionsApi.get(id!),
    enabled: !!id,
  });

  if (isLoading) return <PageSpinner />;
  if (isError || !tx) return (
    <div className="max-w-lg">
      <button onClick={() => navigate('/transactions')} className="flex items-center gap-1.5 text-sm mb-4 hover:underline" style={{ color: '#5C6470', fontFamily: 'Geist, sans-serif' }}>
        {t.backToTransactions}
      </button>
      <ErrorBanner message={(error as Error)?.message || 'Transaction not found'} onRetry={() => refetch()} />
    </div>
  );

  const isCompleted = tx.status === 'COMPLETED';

  return (
    <div className="animate-bub-fade">
      <button onClick={() => navigate('/transactions')} className="flex items-center gap-1.5 text-sm mb-6 hover:underline" style={{ color: '#5C6470', fontFamily: 'Geist, sans-serif' }}>
        {t.backToTransactions}
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Main card */}
        <div className="lg:col-span-3">
          <div className="rounded-xl border p-6" style={{ backgroundColor: '#fff', borderColor: '#E5E2D9' }}>
            {/* From → To */}
            <div className="flex items-center gap-4 mb-6 p-4 rounded-lg" style={{ backgroundColor: '#F4F2EC' }}>
              <div className="flex-1">
                <p className="text-[10px] mb-1" style={{ color: '#8A8F99', fontFamily: '"Geist Mono", monospace' }}>FROM</p>
                <p className="text-xs font-medium truncate" style={{ color: '#14181F', fontFamily: '"Geist Mono", monospace' }}>
                  {tx.sourceAccountId}
                </p>
              </div>
              <div className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center" style={{ backgroundColor: '#E5E2D9' }}>
                <svg viewBox="0 0 16 16" fill="none" stroke="#5C6470" strokeWidth="1.5" className="w-4 h-4">
                  <path d="M3 8h10M9 4l4 4-4 4" />
                </svg>
              </div>
              <div className="flex-1 text-right">
                <p className="text-[10px] mb-1" style={{ color: '#8A8F99', fontFamily: '"Geist Mono", monospace' }}>TO</p>
                <p className="text-xs font-medium truncate" style={{ color: '#14181F', fontFamily: '"Geist Mono", monospace' }}>
                  {tx.destinationAccountId || tx.merchantName || '—'}
                </p>
              </div>
            </div>

            {/* Amount */}
            <div className="text-center mb-6">
              <p
                className="text-4xl font-medium"
                style={{
                  fontFamily: 'Fraunces, serif',
                  color: tx.status === 'FAILED' ? '#A8362F' : '#14181F',
                }}
              >
                {formatAmount(tx.amount)}
              </p>
              <p className="text-sm mt-1" style={{ color: '#5C6470', fontFamily: '"Geist Mono", monospace' }}>
                {tx.currency}
              </p>
              <div className="mt-2">
                <StatusBadge status={tx.status} />
              </div>
            </div>

            {/* Metadata grid */}
            <div className="space-y-2 border-t pt-4" style={{ borderColor: '#EFEDE6' }}>
              {[
                { label: 'Type', value: tx.type },
                { label: 'Reference', value: tx.reference || '—', mono: true },
                { label: 'Initiated', value: formatDateTime(tx.initiatedAt) },
                tx.executedAt && { label: 'Executed', value: formatDateTime(tx.executedAt) },
                tx.description && { label: t.description, value: tx.description },
                tx.failureReason && { label: 'Failure reason', value: tx.failureReason },
              ].filter(Boolean).map((item: any) => (
                <div key={item.label} className="flex justify-between items-start py-2 border-b" style={{ borderColor: '#EFEDE6' }}>
                  <span className="text-xs" style={{ color: '#8A8F99', fontFamily: 'Geist, sans-serif' }}>{item.label}</span>
                  <span className="text-sm font-medium text-right max-w-xs" style={{ color: '#14181F', fontFamily: item.mono ? '"Geist Mono", monospace' : 'Geist, sans-serif', wordBreak: 'break-all' }}>
                    {item.value}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Timeline + actions */}
        <div className="lg:col-span-2">
          <div className="rounded-xl border p-5" style={{ backgroundColor: '#fff', borderColor: '#E5E2D9' }}>
            <h3 className="text-sm font-semibold mb-5" style={{ fontFamily: 'Fraunces, serif', color: '#14181F' }}>
              Timeline
            </h3>

            <div className="space-y-0">
              {[
                { label: isCompleted ? 'Completed' : tx.status, time: tx.executedAt || null, done: isCompleted },
                { label: 'Funds debited', time: tx.executedAt || null, done: isCompleted },
                { label: 'Initiated', time: tx.initiatedAt, done: true },
              ].map((step, i, arr) => (
                <div key={step.label} className="flex gap-3">
                  <div className="flex flex-col items-center">
                    <div
                      className="w-3 h-3 rounded-full mt-0.5 flex-shrink-0"
                      style={{ backgroundColor: step.done ? '#1F7A4D' : '#E5E2D9', border: step.done ? 'none' : '2px solid #E5E2D9' }}
                    />
                    {i < arr.length - 1 && (
                      <div className="w-px flex-1 mt-1 mb-1" style={{ backgroundColor: '#EFEDE6', minHeight: '24px' }} />
                    )}
                  </div>
                  <div className="pb-4">
                    <p className="text-sm font-medium" style={{ color: step.done ? '#14181F' : '#8A8F99', fontFamily: 'Geist, sans-serif' }}>
                      {step.label}
                    </p>
                    {step.time && (
                      <p className="text-[11px]" style={{ color: '#8A8F99', fontFamily: '"Geist Mono", monospace' }}>
                        {formatDateTime(step.time)}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <button
              onClick={() => window.print()}
              className="w-full mt-4 py-2.5 rounded-lg text-sm font-medium border flex items-center justify-center gap-2"
              style={{ borderColor: '#E5E2D9', color: '#5C6470', backgroundColor: '#fff', fontFamily: 'Geist, sans-serif' }}
            >
              <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-4 h-4">
                <path d="M4 6V2h8v4M4 12H2V7h12v5h-2" />
                <rect x="4" y="10" width="8" height="4" />
              </svg>
              Download receipt
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
