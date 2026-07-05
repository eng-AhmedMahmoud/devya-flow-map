'use client';

import { useId } from 'react';

interface TextFieldProps {
  label: string;
  value: string;
  onChange: (v: string) => void;
  required?: boolean;
  placeholder?: string;
  helper?: string;
  type?: 'text' | 'email' | 'url' | 'date' | 'datetime-local' | 'tel';
  disabled?: boolean;
  maxLength?: number;
}

export function TextField({
  label,
  value,
  onChange,
  required,
  placeholder,
  helper,
  type = 'text',
  disabled,
  maxLength,
}: TextFieldProps) {
  const id = useId();
  return (
    <div className="space-y-1.5">
      <label htmlFor={id} className="block text-xs font-medium text-ink-200">
        {label}
        {required && <span className="text-rose-400 ml-1">*</span>}
      </label>
      <input
        id={id}
        type={type}
        value={value ?? ''}
        onChange={(e) => onChange(e.target.value)}
        required={required}
        placeholder={placeholder}
        disabled={disabled}
        maxLength={maxLength}
        className="ring-focus w-full rounded-md border border-white/10 bg-white/[0.03] px-3 py-2 text-sm text-ink-100 placeholder:text-ink-500 focus:outline-none focus:border-white/30 disabled:opacity-60"
      />
      {helper && <p className="text-[11px] text-ink-500">{helper}</p>}
    </div>
  );
}
