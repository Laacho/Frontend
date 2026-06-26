import React from 'react';

type StatusString = string;

interface StatusColors {
  bg: string;
  fg: string;
}

export function getStatusColors(status: StatusString): StatusColors {
  const s = status?.toUpperCase() || '';
  if (['ACTIVE', 'COMPLETED', 'APPROVED'].includes(s)) {
    return { bg: '#E3F2EA', fg: '#1F7A4D' };
  }
  if (['FROZEN', 'PAUSED', 'BLOCKED'].includes(s)) {
    return { bg: '#FBF1E2', fg: '#B5781E' };
  }
  if (['CLOSED', 'FAILED', 'DECLINED', 'REVERSED', 'EXPIRED', 'CANCELLED', 'TERMINATED'].includes(s)) {
    return { bg: '#FBEDEB', fg: '#A8362F' };
  }
  return { bg: '#EFEDE6', fg: '#5C6470' };
}

interface StatusBadgeProps {
  status: string;
  className?: string;
}

export function StatusBadge({ status, className = '' }: StatusBadgeProps) {
  const { bg, fg } = getStatusColors(status);
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium tracking-wide ${className}`}
      style={{
        backgroundColor: bg,
        color: fg,
        fontFamily: '"Geist Mono", monospace',
      }}
    >
      {status}
    </span>
  );
}
