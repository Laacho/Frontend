import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { cardsApi } from '../../api/cards';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { PageSpinner } from '../../components/ui/Spinner';
import { ErrorBanner } from '../../components/ui/ErrorBanner';
import { EmptyState } from '../../components/ui/EmptyState';
import { useLang } from '../../hooks/useLang';
import type { CardResponse } from '../../types';

function CardVisual({ card }: { card: CardResponse }) {
  const isDebit = card.cardType === 'DEBIT';
  const isCredit = card.cardType === 'CREDIT';
  const isVirtual = card.cardType === 'VIRTUAL';

  const bgStyle = isDebit
    ? 'linear-gradient(135deg, #0F2A47 0%, #1A3F6F 60%, #173A5E 100%)'
    : isCredit
    ? 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)'
    : 'linear-gradient(135deg, #C8A878 0%, #B8946A 50%, #A07840 100%)';

  return (
    <div
      className="relative rounded-xl overflow-hidden"
      style={{
        aspectRatio: '1.586 / 1',
        background: bgStyle,
        padding: '18px 20px',
      }}
    >
      {/* Virtual card diagonal pattern */}
      {isVirtual && (
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 8px, rgba(255,255,255,0.3) 8px, rgba(255,255,255,0.3) 9px)',
          }}
        />
      )}

      <div className="relative h-full flex flex-col justify-between">
        {/* Top row */}
        <div className="flex items-start justify-between">
          <div>
            <p
              className="text-[9px] tracking-[0.2em] uppercase opacity-70"
              style={{ color: isVirtual ? '#0F2A47' : '#fff', fontFamily: '"Geist Mono", monospace' }}
            >
              Balkan United
            </p>
          </div>
          <div
            className="w-8 h-6 rounded"
            style={{ backgroundColor: isVirtual ? 'rgba(15,42,71,0.3)' : 'rgba(200,168,120,0.5)' }}
          />
        </div>

        {/* Chip */}
        <div
          className="w-8 h-6 rounded"
          style={{
            backgroundColor: isVirtual ? 'rgba(15,42,71,0.4)' : '#C8A878',
            border: '1px solid rgba(255,255,255,0.3)',
          }}
        />

        {/* Bottom row */}
        <div>
          <p
            className="text-sm font-medium tracking-widest mb-1"
            style={{
              color: isVirtual ? '#0F2A47' : '#fff',
              fontFamily: '"Geist Mono", monospace',
              opacity: 0.9,
            }}
          >
            {card.maskedPan || '**** **** **** ****'}
          </p>
          <div className="flex items-center justify-between">
            <p
              className="text-[10px] tracking-wider opacity-70"
              style={{ color: isVirtual ? '#0F2A47' : '#fff', fontFamily: '"Geist Mono", monospace' }}
            >
              {card.expiryDate}
            </p>
            <p
              className="text-[10px] font-semibold tracking-wider"
              style={{ color: isVirtual ? '#0F2A47' : '#C8A878', fontFamily: '"Geist Mono", monospace' }}
            >
              {card.cardType}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export function CardsPage() {
  const { t } = useLang();
  const [typeFilter, setTypeFilter] = useState('ALL');

  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ['cards'],
    queryFn: () => cardsApi.list(0, 50),
  });

  if (isLoading) return <PageSpinner />;
  if (isError) return (
    <div className="max-w-lg">
      <ErrorBanner message={(error as Error)?.message || 'Failed to load cards'} onRetry={() => refetch()} />
    </div>
  );

  const allCards = data?.content || [];
  const cards = typeFilter === 'ALL' ? allCards : allCards.filter(c => c.cardType === typeFilter);

  return (
    <div className="animate-bub-fade">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          {['ALL', 'DEBIT', 'CREDIT', 'VIRTUAL'].map(t => (
            <button
              key={t}
              onClick={() => setTypeFilter(t)}
              className="px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors"
              style={{
                borderColor: typeFilter === t ? '#0F2A47' : '#E5E2D9',
                backgroundColor: typeFilter === t ? '#0F2A47' : '#fff',
                color: typeFilter === t ? '#fff' : '#5C6470',
                fontFamily: '"Geist Mono", monospace',
              }}
            >
              {t}
            </button>
          ))}
        </div>
        <Link
          to="/cards/issue"
          className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium"
          style={{ backgroundColor: '#0F2A47', color: '#fff', fontFamily: 'Geist, sans-serif' }}
        >
          <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-4 h-4">
            <line x1="8" y1="2" x2="8" y2="14" />
            <line x1="2" y1="8" x2="14" y2="8" />
          </svg>
          {t.issueCard}
        </Link>
      </div>

      {cards.length === 0 ? (
        <EmptyState
          title={t.noCardsYet}
          description="Issue a debit, credit, or virtual card linked to one of your accounts."
          action={
            <Link
              to="/cards/issue"
              className="px-5 py-2.5 rounded-lg text-sm font-medium"
              style={{ backgroundColor: '#0F2A47', color: '#fff', fontFamily: 'Geist, sans-serif' }}
            >
              {t.issueCard}
            </Link>
          }
          icon={
            <svg viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-12 h-12">
              <rect x="4" y="10" width="40" height="28" rx="4" />
              <line x1="4" y1="20" x2="44" y2="20" />
              <circle cx="38" cy="32" r="3" />
            </svg>
          }
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {cards.map(card => (
            <Link
              key={card.id}
              to={`/cards/${card.id}`}
              className="block hover:opacity-90 transition-opacity"
            >
              <CardVisual card={card} />
              <div className="mt-3 px-1">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium" style={{ color: '#14181F', fontFamily: 'Geist, sans-serif' }}>
                    {card.cardType} card
                  </p>
                  <StatusBadge status={card.status} />
                </div>
                <p className="text-xs mt-0.5" style={{ color: '#8A8F99', fontFamily: '"Geist Mono", monospace' }}>
                  Account {card.accountId.slice(0, 8)}…
                </p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
