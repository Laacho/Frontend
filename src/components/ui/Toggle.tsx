import React from 'react';

interface ToggleProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
  label?: string;
}

export function Toggle({ checked, onChange, disabled = false, label }: ToggleProps) {
  return (
    <label className="flex items-center gap-3 cursor-pointer select-none">
      <div className="relative">
        <input
          type="checkbox"
          className="sr-only"
          checked={checked}
          onChange={e => onChange(e.target.checked)}
          disabled={disabled}
        />
        <div
          className="w-11 h-6 rounded-full transition-colors duration-200"
          style={{
            backgroundColor: checked ? '#0F2A47' : '#E5E2D9',
          }}
        />
        <div
          className="absolute top-0.5 left-0.5 w-5 h-5 rounded-full transition-transform duration-200 bg-white"
          style={{
            transform: checked ? 'translateX(20px)' : 'translateX(0)',
          }}
        />
      </div>
      {label && (
        <span className="text-sm" style={{ color: '#14181F', fontFamily: 'Geist, sans-serif' }}>
          {label}
        </span>
      )}
    </label>
  );
}
