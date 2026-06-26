import React, { ReactNode, useEffect } from 'react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm?: () => void;
  title: string;
  children?: ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: 'default' | 'danger';
  loading?: boolean;
}

export function Modal({
  isOpen,
  onClose,
  onConfirm,
  title,
  children,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  variant = 'default',
  loading = false,
}: ModalProps) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="absolute inset-0 bg-black/30"
        onClick={onClose}
      />
      <div
        className="relative z-10 w-full max-w-md mx-4 rounded-xl border p-6"
        style={{ backgroundColor: 'var(--c-surface)', borderColor: 'var(--c-border)' }}
      >
        <h2
          className="text-xl font-semibold mb-3"
          style={{ fontFamily: 'Fraunces, serif', color: 'var(--c-text)' }}
        >
          {title}
        </h2>
        {children && (
          <div className="mb-6 text-sm" style={{ color: 'var(--c-text-2)', fontFamily: 'Geist, sans-serif' }}>
            {children}
          </div>
        )}
        <div className="flex gap-3 justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg text-sm font-medium border transition-colors"
            style={{
              borderColor: 'var(--c-border)',
              color: 'var(--c-text)',
              backgroundColor: 'var(--c-surface)',
              fontFamily: 'Geist, sans-serif',
            }}
          >
            {cancelLabel}
          </button>
          {onConfirm && (
            <button
              onClick={onConfirm}
              disabled={loading}
              className="px-4 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
              style={{
                backgroundColor: variant === 'danger' ? '#A8362F' : '#0F2A47',
                color: 'var(--c-on-brand)',
                fontFamily: 'Geist, sans-serif',
              }}
            >
              {loading ? 'Loading…' : confirmLabel}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
