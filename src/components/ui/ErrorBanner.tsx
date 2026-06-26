import React from 'react';

interface ErrorBannerProps {
  message: string;
  onRetry?: () => void;
  className?: string;
}

export function ErrorBanner({ message, onRetry, className = '' }: ErrorBannerProps) {
  return (
    <div
      className={`flex items-start gap-3 px-4 py-3 rounded-lg border-l-4 ${className}`}
      style={{
        backgroundColor: '#FBEDEB',
        borderLeftColor: '#A8362F',
        color: '#A8362F',
      }}
      role="alert"
    >
      <div
        className="flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold mt-0.5"
        style={{ backgroundColor: '#A8362F', color: 'var(--c-on-brand)' }}
      >
        !
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium" style={{ fontFamily: 'Geist, sans-serif' }}>{message}</p>
      </div>
      {onRetry && (
        <button
          onClick={onRetry}
          className="text-xs underline hover:no-underline flex-shrink-0"
          style={{ color: '#A8362F', fontFamily: 'Geist, sans-serif' }}
        >
          Try again
        </button>
      )}
    </div>
  );
}
