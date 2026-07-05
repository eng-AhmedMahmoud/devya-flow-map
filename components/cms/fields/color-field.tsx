'use client';

import { useId } from 'react';

interface ColorFieldProps {
  label: string;
  value: string;
  onChange: (v: string) => void;
  required?: boolean;
  helper?: string;
  disabled?: boolean;
}

export function ColorField({ label, value, onChange, required, helper, disabled }: ColorFieldProps) {
  const id = useId();
  const safe = isLikelyHex(value) ? value : '#000000';
  return (
    <div className="space-y-1.5">
      <label htmlFor={id} className="block text-xs font-medium text-ink-200">
        {label}
        {required && <span className="text-rose-400 ml-1">*</span>}
      </label>
      <div className="flex items-center gap-2">
        <input
          type="color"
          aria-label={`${label} color picker`}
          value={safe}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
          className="h-9 w-12 cursor-pointer rounded-md border border-white/10 bg-white/[0.03] p-1"
        />
        <input
          id={id}
          type="text"
          value={value ?? ''}
          onChange={(e) => onChange(e.target.value)}
          required={required}
          placeholder="#3B82F6"
          disabled={disabled}
          className="ring-focus flex-1 rounded-md border border-white/10 bg-white/[0.03] px-3 py-2 text-sm text-ink-100 placeholder:text-ink-500 focus:outline-none focus:border-white/30 disabled:opacity-60 font-mono"
        />
      </div>
      {helper && <p className="text-[11px] text-ink-500">{helper}</p>}
    </div>
  );
}

function isLikelyHex(s: string | undefined): boolean {
  return !!s && /^#?[0-9a-fA-F]{3,8}$/.test(s.trim());
}
