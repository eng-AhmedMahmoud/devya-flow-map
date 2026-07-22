'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useMemo, useState, useTransition } from 'react';
import { ChevronDown, Loader2, RotateCcw, Undo2 } from 'lucide-react';
import { ApiError } from '@/lib/api';
import {
  ACTIVITY_ACTIONS,
  ACTIVITY_ACTION_META,
  activityApi,
  type ActivityAction,
  type ActivityEntry,
} from '@/lib/activity-api';
import { useDialog } from '@/components/ui/dialog-provider';

export interface ActivityFilters {
  resource: string;
  action: ActivityAction | '';
  from: string;
  to: string;
}

interface Props {
  items: ActivityEntry[];
  total: number;
  filters: ActivityFilters;
}

const KNOWN_RESOURCES = ['users', 'contracts', 'bookings', 'feedback', 'clients', 'invoices', 'cms'];

export function ActivityTable({ items, total, filters }: Props) {
  const router = useRouter();
  const dialog = useDialog();
  const [pending, start] = useTransition();
  const [actorEmail, setActorEmail] = useState('');
  const [openId, setOpenId] = useState<string | null>(null);
  const [revertingId, setRevertingId] = useState<string | null>(null);

  function pushParams(next: Partial<ActivityFilters>) {
    const url = new URL(window.location.href);
    const merged = { ...filters, ...next };
    for (const [key, value] of Object.entries(merged) as Array<[keyof ActivityFilters, string]>) {
      if (value) url.searchParams.set(key, value);
      else url.searchParams.delete(key);
    }
    url.searchParams.delete('page');
    start(() => router.push(url.pathname + url.search));
  }

  // Actor email is filtered client-side (the API filters by actorId only).
  const visible = useMemo(() => {
    const needle = actorEmail.trim().toLowerCase();
    if (!needle) return items;
    return items.filter((e) => e.actorEmail?.toLowerCase().includes(needle) ?? false);
  }, [items, actorEmail]);

  async function revert(entry: ActivityEntry) {
    const ok = await dialog.confirm({
      title: 'Revert this change?',
      message: `${entry.action} on ${entry.resource}${entry.resourceId ? ` (${entry.resourceId})` : ''} will be rolled back to its previous state.`,
      confirmLabel: 'Revert',
      tone: 'warn',
    });
    if (!ok) return;
    setRevertingId(entry.id);
    try {
      await activityApi.revert(entry.id);
      void dialog.notify({ title: 'Reverted', message: 'The mutation was rolled back.', tone: 'success' });
      start(() => router.refresh());
    } catch (err) {
      const message =
        err instanceof ApiError && err.body && typeof err.body === 'object' && 'message' in err.body
          ? String((err.body as { message?: unknown }).message ?? err.message)
          : err instanceof Error
            ? err.message
            : 'Revert failed';
      void dialog.notify({ title: 'Could not revert', message, tone: 'warn' });
    } finally {
      setRevertingId(null);
    }
  }

  return (
    <div className="space-y-4">
      <div className="surface p-4 flex flex-wrap gap-3 items-end">
        <FilterSelect
          label="Resource"
          value={filters.resource}
          onChange={(v) => pushParams({ resource: v })}
          options={[{ value: '', label: 'All resources' }, ...KNOWN_RESOURCES.map((r) => ({ value: r, label: r }))]}
          disabled={pending}
        />
        <FilterSelect
          label="Action"
          value={filters.action}
          onChange={(v) => pushParams({ action: v as ActivityAction | '' })}
          options={[
            { value: '', label: 'All actions' },
            ...ACTIVITY_ACTIONS.map((a) => ({ value: a, label: ACTIVITY_ACTION_META[a].label })),
          ]}
          disabled={pending}
        />
        <FilterDate label="From" value={filters.from} onChange={(v) => pushParams({ from: v })} disabled={pending} />
        <FilterDate label="To" value={filters.to} onChange={(v) => pushParams({ to: v })} disabled={pending} />
        <div className="ml-auto" />
        <div className="space-y-1">
          <div className="text-[10px] uppercase tracking-wider text-ink-500">Actor email</div>
          <input
            value={actorEmail}
            onChange={(e) => setActorEmail(e.target.value)}
            placeholder="Filter this page by actor"
            className="ring-focus rounded-md border border-white/10 bg-white/[0.03] px-3 py-2 text-sm text-ink-100 placeholder:text-ink-500 focus:outline-none focus:border-white/30 w-full sm:w-64"
          />
        </div>
      </div>

      <div className="text-sm text-ink-400">
        {visible.length} of {total} shown
      </div>

      <div className="surface overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-[11px] uppercase tracking-wider text-ink-400 border-b border-white/5">
                <th className="w-8 px-4 py-3 font-medium" aria-label="Expand" />
                <th className="px-4 py-3 font-medium">Time</th>
                <th className="px-4 py-3 font-medium">Actor</th>
                <th className="px-4 py-3 font-medium">Action</th>
                <th className="px-4 py-3 font-medium">Resource</th>
                <th className="px-4 py-3 font-medium">Path</th>
                <th className="px-4 py-3 font-medium text-right">Revert</th>
              </tr>
            </thead>
            <tbody>
              {visible.length === 0 && (
                <tr>
                  <td colSpan={7} className="text-center text-ink-400 py-12">
                    No activity matches the current filters.
                  </td>
                </tr>
              )}
              {visible.map((entry) => {
                const isOpen = openId === entry.id;
                const revertible = entry.action !== 'ACTION' && !entry.reverted;
                return (
                  <ActivityRow
                    key={entry.id}
                    entry={entry}
                    isOpen={isOpen}
                    onToggle={() => setOpenId(isOpen ? null : entry.id)}
                    revertible={revertible}
                    reverting={revertingId === entry.id}
                    onRevert={() => void revert(entry)}
                  />
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function ActivityRow({
  entry,
  isOpen,
  onToggle,
  revertible,
  reverting,
  onRevert,
}: {
  entry: ActivityEntry;
  isOpen: boolean;
  onToggle: () => void;
  revertible: boolean;
  reverting: boolean;
  onRevert: () => void;
}) {
  const meta = ACTIVITY_ACTION_META[entry.action] ?? { label: entry.action, color: '#A3A3A3' };
  return (
    <>
      <tr
        onClick={onToggle}
        className="border-b border-white/5 hover:bg-white/[0.02] cursor-pointer"
      >
        <td className="px-4 py-3">
          <ChevronDown
            className={`h-4 w-4 text-ink-400 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          />
        </td>
        <td className="px-4 py-3 whitespace-nowrap">
          <div className="text-ink-100 text-xs">{new Date(entry.createdAt).toLocaleString(undefined, { hour12: true })}</div>
        </td>
        <td className="px-4 py-3">
          <div className="text-ink-100 text-xs truncate max-w-[200px]">{entry.actorEmail ?? 'system'}</div>
          {entry.actorRole ? <div className="text-[10px] text-ink-500">{entry.actorRole}</div> : null}
        </td>
        <td className="px-4 py-3">
          <div className="flex items-center gap-1.5">
            <span
              className="inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[11px] font-medium"
              style={{ color: meta.color, background: `${meta.color}1A`, border: `1px solid ${meta.color}33` }}
            >
              <span className="h-1.5 w-1.5 rounded-full" style={{ background: meta.color }} />
              {meta.label}
            </span>
            {entry.reverted ? (
              <span
                className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium"
                style={{ color: '#A3A3A3', background: '#A3A3A31A', border: '1px solid #A3A3A333' }}
                title={entry.revertedAt ? `Reverted ${new Date(entry.revertedAt).toLocaleString(undefined, { hour12: true })}` : 'Reverted'}
              >
                <RotateCcw className="h-2.5 w-2.5" />
                Reverted
              </span>
            ) : null}
          </div>
        </td>
        <td className="px-4 py-3">
          <div className="text-ink-100 text-xs">{entry.resource}</div>
          {entry.resourceId ? (
            <code className="text-[10px] text-ink-500 truncate block max-w-[160px]">{entry.resourceId}</code>
          ) : null}
        </td>
        <td className="px-4 py-3">
          <code className="text-[11px] text-ink-400 truncate block max-w-[240px]">
            {entry.method} {entry.path}
          </code>
        </td>
        <td className="px-4 py-3 text-right">
          {revertible ? (
            <button
              type="button"
              disabled={reverting}
              onClick={(e) => {
                e.stopPropagation();
                onRevert();
              }}
              className="inline-flex items-center gap-1 rounded-md border border-white/10 bg-white/[0.02] px-2 py-1 text-[11px] text-ink-200 transition-colors hover:border-amber-500/40 hover:text-amber-200 disabled:opacity-50"
            >
              {reverting ? <Loader2 className="h-3 w-3 animate-spin" /> : <Undo2 className="h-3 w-3" />}
              Revert
            </button>
          ) : null}
        </td>
      </tr>
      {isOpen && (
        <tr className="bg-white/[0.015] border-b border-white/5">
          <td colSpan={7} className="px-4 py-4">
            <div className="grid gap-4 lg:grid-cols-2">
              <JsonPanel title="Before" value={entry.before} />
              <JsonPanel title="After" value={entry.after} />
            </div>
            <div className="mt-3 flex flex-wrap gap-4 text-[11px] text-ink-500">
              {entry.ip ? <span>IP: {entry.ip}</span> : null}
              {entry.userAgent ? <span className="truncate max-w-md">UA: {entry.userAgent}</span> : null}
              <span>ID: {entry.id}</span>
            </div>
          </td>
        </tr>
      )}
    </>
  );
}

function JsonPanel({ title, value }: { title: string; value: unknown }) {
  return (
    <div>
      <div className="text-[10px] uppercase tracking-wider text-ink-500 mb-1.5">{title}</div>
      <pre className="max-h-72 overflow-auto rounded-md border border-white/10 bg-black/40 p-3 text-[11px] leading-relaxed text-ink-200 whitespace-pre-wrap break-all">
        {value === null || value === undefined ? '—' : JSON.stringify(value, null, 2)}
      </pre>
    </div>
  );
}

function FilterSelect({
  label,
  value,
  onChange,
  options,
  disabled,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: Array<{ value: string; label: string }>;
  disabled?: boolean;
}) {
  return (
    <div className="space-y-1">
      <div className="text-[10px] uppercase tracking-wider text-ink-500">{label}</div>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        className="ring-focus rounded-md border border-white/10 bg-white/[0.03] px-3 py-2 text-sm text-ink-100 focus:outline-none focus:border-white/30 disabled:opacity-60 [&>option]:bg-ink-800"
      >
        {options.map((o) => (
          <option key={o.value || 'all'} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </div>
  );
}

function FilterDate({
  label,
  value,
  onChange,
  disabled,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  disabled?: boolean;
}) {
  return (
    <div className="space-y-1">
      <div className="text-[10px] uppercase tracking-wider text-ink-500">{label}</div>
      <input
        type="date"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        className="ring-focus rounded-md border border-white/10 bg-white/[0.03] px-3 py-1.5 text-sm text-ink-100 focus:outline-none focus:border-white/30 disabled:opacity-60 [color-scheme:dark]"
      />
    </div>
  );
}
