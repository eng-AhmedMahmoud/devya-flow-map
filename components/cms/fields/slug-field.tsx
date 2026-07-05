'use client';

import { useId } from 'react';

export function slugify(input: string): string {
  return (input ?? '')
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80);
}

interface SlugFieldProps {
  label?: string;
  value: string;
  onChange: (v: string) => void;
  source?: string;
  helper?: string;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
}

export function SlugField({
  label = 'Slug',
  value,
  onChange,
  source,
  helper = 'lowercase, dashes only',
  placeholder = 'auto-generated',
  required,
  disabled,
}: SlugFieldProps) {
  const id = useId();
  return (
    <div className="space-y-1.5">
      <label htmlFor={id} className="block text-xs font-medium text-ink-200">
        {label}
        {required && <span className="text-rose-400 ml-1">*</span>}
      </label>
      <div className="flex items-center gap-2">
        <input
          id={id}
          type="text"
          value={value ?? ''}
          onChange={(e) => onChange(e.target.value)}
          required={required}
          placeholder={placeholder}
          disabled={disabled}
          className="ring-focus flex-1 rounded-md border border-white/10 bg-white/[0.03] px-3 py-2 text-sm text-ink-100 placeholder:text-ink-500 focus:outline-none focus:border-white/30 disabled:opacity-60 font-mono text-[12.5px]"
        />
        {source !== undefined && (
          <button
            type="button"
            onClick={() => onChange(slugify(source))}
            disabled={disabled || !source}
            className="inline-flex items-center gap-1 rounded-md border border-white/10 bg-white/[0.04] px-2.5 py-2 text-xs text-ink-100 hover:bg-white/[0.07] hover:border-white/20 disabled:opacity-50"
            title="Generate from title"
          >
            Generate
          </button>
        )}
      </div>
      {helper && <p className="text-[11px] text-ink-500">{helper}</p>}
    </div>
  );
}
