'use client';

import { useId } from 'react';

interface SwitchToggleProps {
  label: string;
  value: boolean;
  onChange: (v: boolean) => void;
  helper?: string;
  disabled?: boolean;
}

export function SwitchToggle({ label, value, onChange, helper, disabled }: SwitchToggleProps) {
  const id = useId();
  return (
    <div className="flex items-start justify-between gap-4 rounded-md border border-white/10 bg-white/[0.02] px-3 py-2.5">
      <div className="min-w-0">
        <label htmlFor={id} className="block text-xs font-medium text-ink-100 cursor-pointer">
          {label}
        </label>
        {helper && <p className="text-[11px] text-ink-500 mt-0.5">{helper}</p>}
      </div>
      <button
        id={id}
        type="button"
        role="switch"
        aria-checked={value}
        disabled={disabled}
        onClick={() => onChange(!value)}
        className={`ring-focus relative inline-flex h-5 w-9 shrink-0 items-center rounded-full transition-colors disabled:opacity-50 ${
          value ? 'bg-emerald-500/80' : 'bg-white/15'
        }`}
      >
        <span
          className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${
            value ? 'translate-x-4' : 'translate-x-0.5'
          }`}
        />
      </button>
    </div>
  );
}
