'use client';

import { useEffect, useId, useState } from 'react';

interface JsonFieldProps {
  label: string;
  value: unknown;
  onChange: (v: unknown) => void;
  helper?: string;
  rows?: number;
  disabled?: boolean;
}

export function JsonField({ label, value, onChange, helper, rows = 8, disabled }: JsonFieldProps) {
  const id = useId();
  const [text, setText] = useState<string>(() => safeStringify(value));
  const [error, setError] = useState<string | null>(null);

  // If the upstream value changes (e.g., loaded from server), reset the editor text.
  useEffect(() => {
    setText(safeStringify(value));
    setError(null);
  }, [value]);

  function commit(next: string) {
    setText(next);
    if (next.trim() === '') {
      setError(null);
      onChange(null);
      return;
    }
    try {
      const parsed = JSON.parse(next);
      setError(null);
      onChange(parsed);
    } catch (e) {
      setError((e as Error).message);
    }
  }

  return (
    <div className="space-y-1.5">
      <label htmlFor={id} className="block text-xs font-medium text-ink-200">
        {label}
      </label>
      <textarea
        id={id}
        value={text}
        onChange={(e) => commit(e.target.value)}
        disabled={disabled}
        rows={rows}
        spellCheck={false}
        className="ring-focus w-full rounded-md border border-white/10 bg-white/[0.03] px-3 py-2 text-[12px] text-ink-100 placeholder:text-ink-500 focus:outline-none focus:border-white/30 disabled:opacity-60 font-mono resize-y"
      />
      {error && <p className="text-[11px] text-rose-400">JSON error: {error}</p>}
      {helper && !error && <p className="text-[11px] text-ink-500">{helper}</p>}
    </div>
  );
}

function safeStringify(value: unknown): string {
  if (value === null || value === undefined) return '';
  if (typeof value === 'string') return value;
  try {
    return JSON.stringify(value, null, 2);
  } catch {
    return '';
  }
}
