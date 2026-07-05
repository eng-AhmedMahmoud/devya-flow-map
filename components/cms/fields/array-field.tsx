'use client';

import { X, Plus } from 'lucide-react';
import { useState } from 'react';

interface ArrayFieldProps {
  label: string;
  value: string[];
  onChange: (v: string[]) => void;
  helper?: string;
  placeholder?: string;
  disabled?: boolean;
}

export function ArrayField({ label, value, onChange, helper, placeholder, disabled }: ArrayFieldProps) {
  const [draft, setDraft] = useState('');
  const items = value ?? [];

  function add() {
    const v = draft.trim();
    if (!v) return;
    onChange([...items, v]);
    setDraft('');
  }

  function remove(idx: number) {
    onChange(items.filter((_, i) => i !== idx));
  }

  return (
    <div className="space-y-1.5">
      <label className="block text-xs font-medium text-ink-200">{label}</label>
      <div className="flex flex-wrap gap-1.5">
        {items.length === 0 && (
          <div className="text-[11px] text-ink-500 italic">No items yet</div>
        )}
        {items.map((item, idx) => (
          <span
            key={`${item}-${idx}`}
            className="inline-flex items-center gap-1 rounded-full border border-white/10 bg-white/[0.04] pl-2.5 pr-1 py-0.5 text-[12px] text-ink-100"
          >
            {item}
            <button
              type="button"
              onClick={() => remove(idx)}
              disabled={disabled}
              className="rounded-full p-0.5 text-ink-400 hover:text-rose-300 hover:bg-rose-500/15 transition-colors"
              aria-label={`Remove ${item}`}
            >
              <X className="h-3 w-3" />
            </button>
          </span>
        ))}
      </div>
      <div className="flex items-center gap-2">
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              add();
            }
          }}
          placeholder={placeholder ?? 'Type then press Enter'}
          disabled={disabled}
          className="ring-focus flex-1 rounded-md border border-white/10 bg-white/[0.03] px-3 py-2 text-sm text-ink-100 placeholder:text-ink-500 focus:outline-none focus:border-white/30 disabled:opacity-60"
        />
        <button
          type="button"
          onClick={add}
          disabled={disabled || !draft.trim()}
          className="inline-flex items-center gap-1 rounded-md border border-white/10 bg-white/[0.04] px-2.5 py-2 text-xs text-ink-100 hover:bg-white/[0.07] hover:border-white/20 disabled:opacity-50"
        >
          <Plus className="h-3.5 w-3.5" />
          Add
        </button>
      </div>
      {helper && <p className="text-[11px] text-ink-500">{helper}</p>}
    </div>
  );
}
