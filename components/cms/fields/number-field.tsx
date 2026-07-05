'use client';

import { useId } from 'react';

interface NumberFieldProps {
  label: string;
  value: number | null | undefined;
  onChange: (v: number) => void;
  required?: boolean;
  placeholder?: string;
  helper?: string;
  min?: number;
  max?: number;
  step?: number;
  disabled?: boolean;
}

export function NumberField({
  label,
  value,
  onChange,
  required,
  placeholder,
  helper,
  min,
  max,
  step,
  disabled,
}: NumberFieldProps) {
  const id = useId();
  return (
    <div className="space-y-1.5">
      <label htmlFor={id} className="block text-xs font-medium text-ink-200">
        {label}
        {required && <span className="text-rose-400 ml-1">*</span>}
      </label>
      <input
        id={id}
        type="number"
        value={value === null || value === undefined ? '' : value}
        onChange={(e) => {
          const v = e.target.value;
          if (v === '') {
            onChange(0);
          } else {
            const parsed = Number(v);
            if (!Number.isNaN(parsed)) onChange(parsed);
          }
        }}
        required={required}
        placeholder={placeholder}
        min={min}
        max={max}
        step={step}
        disabled={disabled}
        className="ring-focus w-full rounded-md border border-white/10 bg-white/[0.03] px-3 py-2 text-sm text-ink-100 placeholder:text-ink-500 focus:outline-none focus:border-white/30 disabled:opacity-60"
      />
      {helper && <p className="text-[11px] text-ink-500">{helper}</p>}
    </div>
  );
}
