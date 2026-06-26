import React from 'react';

interface SpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function Spinner({ size = 'md', className = '' }: SpinnerProps) {
  const sizeClass = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
  }[size];

  return (
    <div
      className={`${sizeClass} rounded-full border-2 border-current border-t-transparent animate-bub-spin ${className}`}
      role="status"
      aria-label="Loading"
    />
  );
}

export function PageSpinner() {
  return (
    <div className="flex items-center justify-center min-h-64">
      <div className="flex flex-col items-center gap-3">
        <Spinner size="lg" className="text-[#C8A878]" />
        <span className="text-sm text-[var(--c-text-2)]" style={{ fontFamily: 'Geist, sans-serif' }}>Loading…</span>
      </div>
    </div>
  );
}
