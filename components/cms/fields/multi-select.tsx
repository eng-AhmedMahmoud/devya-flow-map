'use client';

import { useMemo } from 'react';
import { cn } from '@/lib/utils';

interface MultiSelectProps<T extends { id: string }> {
  label: string;
  options: T[];
  selected: string[];
  onChange: (ids: string[]) => void;
  getLabel: (o: T) => string;
  helper?: string;
  emptyHint?: string;
  disabled?: boolean;
}

export function MultiSelect<T extends { id: string }>({
  label,
  options,
  selected,
  onChange,
  getLabel,
  helper,
  emptyHint = 'No options available',
  disabled,
}: MultiSelectProps<T>) {
  const set = useMemo(() => new Set(selected), [selected]);

  function toggle(id: string) {
    if (disabled) return;
    if (set.has(id)) {
      onChange(selected.filter((s) => s !== id));
    } else {
      onChange([...selected, id]);
    }
  }

  return (
    <div className="space-y-1.5">
      <label className="block text-xs font-medium text-ink-200">{label}</label>
      {options.length === 0 ? (
        <div className="rounded-md border border-white/10 bg-white/[0.02] px-3 py-2 text-xs text-ink-500">
          {emptyHint}
        </div>
      ) : (
        <div className="flex flex-wrap gap-1.5 rounded-md border border-white/10 bg-white/[0.02] p-2">
          {options.map((o) => {
            const active = set.has(o.id);
            return (
              <button
                type="button"
                key={o.id}
                onClick={() => toggle(o.id)}
                disabled={disabled}
                className={cn(
                  'inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs transition-colors disabled:opacity-50',
                  active
                    ? 'border-emerald-500/40 bg-emerald-500/15 text-emerald-200'
                    : 'border-white/10 bg-white/[0.02] text-ink-300 hover:text-white hover:border-white/20',
                )}
              >
                {getLabel(o)}
              </button>
            );
          })}
        </div>
      )}
      <p className="text-[11px] text-ink-500">
        {helper ?? `${selected.length} selected`}
      </p>
    </div>
  );
}
