'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { CheckSquare, ChevronDown, ChevronUp, ListChecks, Loader2, Square, X } from 'lucide-react';
import { useDialog } from '@/components/ui/dialog-provider';
import type { BulkResult } from '@/lib/bulk-api';

/* ------------------------------------------------------------------ */
/* Types                                                               */
/* ------------------------------------------------------------------ */

export interface BulkActionDef {
  key: string;
  label: string;
  destructive?: boolean;
  confirmTitle?: string;
  confirmMessage?: string;
  /** When set, a small select is rendered next to the action button; the chosen
   *  value is sent as payload `{ [payloadKey]: value }`. */
  payloadKey?: string;
  payloadOptions?: Array<{ value: string; label: string }>;
}

export interface UseBulkSelectResult {
  batchMode: boolean;
  toggleBatchMode: () => void;
  exitBatchMode: () => void;
  selected: Set<string>;
  selectedIds: string[];
  isSelected: (id: string) => boolean;
  /** Toggle by row index — supports shift+click range selection. */
  toggleRow: (index: number, shiftKey: boolean) => void;
  selectAllOnPage: () => void;
  clear: () => void;
}

/* ------------------------------------------------------------------ */
/* Hook                                                                */
/* ------------------------------------------------------------------ */

export function useBulkSelect(items: Array<{ id: string }>): UseBulkSelectResult {
  const [batchMode, setBatchMode] = useState(false);
  const [selected, setSelected] = useState<Set<string>>(() => new Set());
  const anchorRef = useRef<number | null>(null);
  const itemsRef = useRef(items);
  itemsRef.current = items;

  // Drop selections that no longer exist on the page (e.g. after refresh).
  useEffect(() => {
    setSelected((prev) => {
      if (prev.size === 0) return prev;
      const valid = new Set(items.map((i) => i.id));
      let changed = false;
      const next = new Set<string>();
      prev.forEach((id) => {
        if (valid.has(id)) next.add(id);
        else changed = true;
      });
      return changed ? next : prev;
    });
  }, [items]);

  const exitBatchMode = useCallback(() => {
    setBatchMode(false);
    setSelected(new Set());
    anchorRef.current = null;
  }, []);

  const toggleBatchMode = useCallback(() => {
    setBatchMode((on) => {
      if (on) {
        setSelected(new Set());
        anchorRef.current = null;
      }
      return !on;
    });
  }, []);

  // Escape exits batch mode.
  useEffect(() => {
    if (!batchMode) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') exitBatchMode();
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [batchMode, exitBatchMode]);

  const toggleRow = useCallback((index: number, shiftKey: boolean) => {
    const list = itemsRef.current;
    setSelected((prev) => {
      const next = new Set(prev);
      const anchor = anchorRef.current;
      if (shiftKey && anchor !== null && anchor !== index) {
        const [lo, hi] = anchor < index ? [anchor, index] : [index, anchor];
        const target = list[index]?.id;
        const turnOn = target ? !prev.has(target) : true;
        for (let i = lo; i <= hi; i++) {
          const id = list[i]?.id;
          if (!id) continue;
          if (turnOn) next.add(id);
          else next.delete(id);
        }
      } else {
        const id = list[index]?.id;
        if (id) {
          if (next.has(id)) next.delete(id);
          else next.add(id);
        }
      }
      anchorRef.current = index;
      return next;
    });
  }, []);

  const selectAllOnPage = useCallback(() => {
    setSelected(new Set(itemsRef.current.map((i) => i.id)));
  }, []);

  const clear = useCallback(() => {
    setSelected(new Set());
    anchorRef.current = null;
  }, []);

  const selectedIds = useMemo(() => Array.from(selected), [selected]);
  const isSelected = useCallback((id: string) => selected.has(id), [selected]);

  return {
    batchMode,
    toggleBatchMode,
    exitBatchMode,
    selected,
    selectedIds,
    isSelected,
    toggleRow,
    selectAllOnPage,
    clear,
  };
}

/* ------------------------------------------------------------------ */
/* Batch toggle button (rendered by the parent in the list header)     */
/* ------------------------------------------------------------------ */

export function BatchToggle({ active, onClick }: { active: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex items-center gap-1.5 rounded-md border px-2.5 py-1.5 text-xs transition-colors ring-focus ${
        active
          ? 'border-white/30 bg-white text-ink-900 font-medium'
          : 'border-white/10 bg-white/[0.02] text-ink-200 hover:bg-white/5 hover:text-white'
      }`}
      title={active ? 'Exit batch mode (Esc)' : 'Select multiple rows'}
    >
      <ListChecks className="h-3.5 w-3.5" />
      Batch
    </button>
  );
}

/* ------------------------------------------------------------------ */
/* Row checkbox                                                        */
/* ------------------------------------------------------------------ */

export function BulkCheckbox({
  checked,
  onToggle,
}: {
  checked: boolean;
  onToggle: (shiftKey: boolean) => void;
}) {
  return (
    <button
      type="button"
      aria-label={checked ? 'Deselect row' : 'Select row'}
      onClick={(e) => {
        e.stopPropagation();
        onToggle(e.shiftKey);
      }}
      className="inline-flex items-center justify-center rounded p-0.5 text-ink-400 hover:text-white ring-focus select-none"
    >
      {checked ? <CheckSquare className="h-4 w-4 text-white" /> : <Square className="h-4 w-4" />}
    </button>
  );
}

/* ------------------------------------------------------------------ */
/* Sticky toolbar                                                      */
/* ------------------------------------------------------------------ */

interface RunResult {
  label: string;
  result: BulkResult;
}

export interface BulkToolbarProps {
  selectedIds: string[];
  actions: BulkActionDef[];
  onAction: (action: string, ids: string[], payload?: Record<string, unknown>) => Promise<BulkResult>;
  onSelectAll: () => void;
  onClear: () => void;
  onExit: () => void;
  /** Called after an action completes so the parent can refresh its list. */
  onDone?: () => void;
}

export function BulkToolbar({
  selectedIds,
  actions,
  onAction,
  onSelectAll,
  onClear,
  onExit,
  onDone,
}: BulkToolbarProps) {
  const dialog = useDialog();
  const [busyKey, setBusyKey] = useState<string | null>(null);
  const [runResult, setRunResult] = useState<RunResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showReasons, setShowReasons] = useState(false);
  const [picks, setPicks] = useState<Record<string, string>>({});

  async function run(def: BulkActionDef) {
    if (selectedIds.length === 0 || busyKey) return;
    setError(null);

    let payload: Record<string, unknown> | undefined;
    if (def.payloadKey && def.payloadOptions && def.payloadOptions.length > 0) {
      const value = picks[def.key] ?? def.payloadOptions[0].value;
      payload = { [def.payloadKey]: value };
    }

    if (def.destructive) {
      const ok = await dialog.confirm({
        title: def.confirmTitle ?? `${def.label} ${selectedIds.length} item${selectedIds.length === 1 ? '' : 's'}?`,
        message: def.confirmMessage ?? 'This action cannot be undone.',
        confirmLabel: def.label,
        tone: 'danger',
      });
      if (!ok) return;
    }

    setBusyKey(def.key);
    setRunResult(null);
    setShowReasons(false);
    try {
      const result = await onAction(def.key, selectedIds, payload);
      setRunResult({ label: def.label, result });
      onDone?.();
    } catch (err) {
      setError(err instanceof Error && err.message ? err.message : `${def.label} failed`);
    } finally {
      setBusyKey(null);
    }
  }

  return (
    <div className="sticky top-0 z-20 space-y-2">
      <div className="surface-strong px-4 py-2.5 flex flex-wrap items-center gap-2">
        <span className="text-sm text-white font-medium tabular-nums">{selectedIds.length} selected</span>
        <button
          type="button"
          onClick={onSelectAll}
          className="rounded-md border border-white/10 bg-white/[0.02] px-2 py-1 text-[11px] text-ink-200 hover:bg-white/5"
        >
          Select all on page
        </button>
        <button
          type="button"
          onClick={onClear}
          className="rounded-md border border-white/10 bg-white/[0.02] px-2 py-1 text-[11px] text-ink-200 hover:bg-white/5"
        >
          Clear
        </button>

        <div className="ml-auto flex flex-wrap items-center gap-1.5">
          {actions.map((def) => (
            <span key={def.key} className="inline-flex items-center gap-1">
              {def.payloadKey && def.payloadOptions ? (
                <select
                  value={picks[def.key] ?? def.payloadOptions[0]?.value}
                  onChange={(e) => setPicks((p) => ({ ...p, [def.key]: e.target.value }))}
                  className="ring-focus rounded-md border border-white/10 bg-white/[0.03] px-1.5 py-1 text-[11px] text-ink-100 focus:outline-none focus:border-white/30 [&>option]:bg-ink-800"
                >
                  {def.payloadOptions.map((o) => (
                    <option key={o.value} value={o.value}>
                      {o.label}
                    </option>
                  ))}
                </select>
              ) : null}
              <button
                type="button"
                onClick={() => void run(def)}
                disabled={busyKey !== null || selectedIds.length === 0}
                className={`inline-flex items-center gap-1 rounded-md border px-2.5 py-1 text-[11px] transition-colors disabled:opacity-50 ${
                  def.destructive
                    ? 'border-rose-500/40 bg-rose-500/10 text-rose-200 hover:bg-rose-500/20'
                    : 'border-white/10 bg-white/[0.02] text-ink-200 hover:bg-white/5 hover:text-white'
                }`}
              >
                {busyKey === def.key ? <Loader2 className="h-3 w-3 animate-spin" /> : null}
                {def.label}
              </button>
            </span>
          ))}
          <button
            type="button"
            onClick={onExit}
            aria-label="Exit batch mode"
            title="Exit batch mode (Esc)"
            className="ml-1 rounded-md border border-white/10 bg-white/[0.02] p-1 text-ink-300 hover:bg-white/5 hover:text-white"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {error ? (
        <div className="rounded-md border border-rose-500/40 bg-rose-500/10 px-3 py-2 text-xs text-rose-200">
          {error}
        </div>
      ) : null}

      {runResult ? (
        <div className="rounded-md border border-white/10 bg-white/[0.02] px-3 py-2 text-xs">
          <div className="flex items-center gap-2">
            <span className="text-ink-100">
              {runResult.label}: <span className="text-emerald-300">{runResult.result.ok} succeeded</span>
              {' · '}
              <span className={runResult.result.failed.length > 0 ? 'text-amber-300' : 'text-ink-400'}>
                {runResult.result.failed.length} skipped
              </span>
            </span>
            {runResult.result.failed.length > 0 ? (
              <button
                type="button"
                onClick={() => setShowReasons((s) => !s)}
                className="inline-flex items-center gap-0.5 text-ink-300 hover:text-white"
              >
                {showReasons ? 'Hide reasons' : 'Show reasons'}
                {showReasons ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
              </button>
            ) : null}
            <button
              type="button"
              onClick={() => setRunResult(null)}
              aria-label="Dismiss result"
              className="ml-auto rounded p-0.5 text-ink-400 hover:text-white"
            >
              <X className="h-3 w-3" />
            </button>
          </div>
          {showReasons && runResult.result.failed.length > 0 ? (
            <ul className="mt-2 space-y-1 border-t border-white/5 pt-2">
              {runResult.result.failed.map((f) => (
                <li key={f.id} className="flex gap-2">
                  <code className="shrink-0 text-[10px] text-ink-500">{f.id}</code>
                  <span className="text-ink-300">{f.reason}</span>
                </li>
              ))}
            </ul>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
