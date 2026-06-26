import React, { ReactNode } from 'react';

interface EmptyStateProps {
  title: string;
  description?: string;
  action?: ReactNode;
  icon?: ReactNode;
}

export function EmptyState({ title, description, action, icon }: EmptyStateProps) {
  return (
    <div
      className="flex flex-col items-center justify-center py-16 px-6 rounded-xl border-2 border-dashed text-center"
      style={{ borderColor: 'var(--c-border)', backgroundColor: 'var(--c-bg)' }}
    >
      {icon && (
        <div className="mb-4 text-[#C8A878] opacity-60">{icon}</div>
      )}
      <h3
        className="text-lg font-medium mb-2"
        style={{ fontFamily: 'Fraunces, serif', color: 'var(--c-text)' }}
      >
        {title}
      </h3>
      {description && (
        <p className="text-sm mb-6" style={{ color: 'var(--c-text-2)', fontFamily: 'Geist, sans-serif' }}>
          {description}
        </p>
      )}
      {action && <div>{action}</div>}
    </div>
  );
}
