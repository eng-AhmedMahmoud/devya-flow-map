'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState, useTransition } from 'react';
import { KeyRound, Trash2 } from 'lucide-react';
import { USER_ROLES, usersApi, usersApiErrorMessage, type ManagedUser, type UserRole } from '@/lib/users-api';
import { runBulkAction } from '@/lib/bulk-api';
import { resolveImg } from '@/lib/img';
import { useDialog } from '@/components/ui/dialog-provider';
import {
  BatchToggle,
  BulkCheckbox,
  BulkToolbar,
  useBulkSelect,
  type BulkActionDef,
} from '@/components/ui/bulk-select-toolbar';
import { ROLE_META, RoleBadge, UserStatusBadge, relativeTime } from './user-badges';

export interface UsersTableFilters {
  search: string;
  role: UserRole | '';
  active: '' | 'true' | 'false';
}

interface Props {
  users: ManagedUser[];
  total: number;
  filters: UsersTableFilters;
  currentRole?: UserRole | null;
}

const ACTIVE_FILTERS: Array<{ value: '' | 'true' | 'false'; label: string }> = [
  { value: '', label: 'All' },
  { value: 'true', label: 'Active' },
  { value: 'false', label: 'Inactive' },
];

export function UsersTable({ users, total, filters, currentRole }: Props) {
  const router = useRouter();
  const dialog = useDialog();
  const [pending, start] = useTransition();
  const [search, setSearch] = useState(filters.search);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const isSuperAdmin = currentRole === 'SUPER_ADMIN';
  const bulk = useBulkSelect(users);

  const bulkActions: BulkActionDef[] = [
    { key: 'activate', label: 'Activate' },
    { key: 'deactivate', label: 'Deactivate' },
    ...(isSuperAdmin
      ? [
          {
            key: 'delete',
            label: 'Delete',
            destructive: true,
            confirmMessage: 'Selected users will be permanently deleted. This cannot be undone.',
          } satisfies BulkActionDef,
        ]
      : []),
  ];

  function pushParams(next: Partial<UsersTableFilters>) {
    const url = new URL(window.location.href);
    const merged = { ...filters, ...next };
    if (merged.search) url.searchParams.set('search', merged.search);
    else url.searchParams.delete('search');
    if (merged.role) url.searchParams.set('role', merged.role);
    else url.searchParams.delete('role');
    if (merged.active) url.searchParams.set('active', merged.active);
    else url.searchParams.delete('active');
    url.searchParams.delete('page');
    start(() => router.push(url.pathname + url.search));
  }

  useEffect(() => {
    if (search === filters.search) return;
    const t = setTimeout(() => pushParams({ search }), 400);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]);

  async function deleteOne(user: ManagedUser) {
    const ok = await dialog.confirm({
      title: `Delete ${user.name}?`,
      message: `${user.email} will be permanently deleted along with their access. This cannot be undone.`,
      confirmLabel: 'Delete',
      tone: 'danger',
    });
    if (!ok) return;
    setDeletingId(user.id);
    try {
      await usersApi.remove(user.id);
      start(() => router.refresh());
    } catch (err) {
      void dialog.notify({
        title: 'Could not delete user',
        message: usersApiErrorMessage(err, 'Delete failed'),
        tone: 'warn',
      });
    } finally {
      setDeletingId(null);
    }
  }

  const colCount = 5 + (bulk.batchMode ? 1 : 0) + (isSuperAdmin ? 1 : 0);

  return (
    <div className="space-y-4">
      <div className="surface p-4 flex flex-wrap gap-3 items-center">
        <Tabs
          options={[
            { value: '', label: 'All roles' },
            ...USER_ROLES.map((r) => ({ value: r, label: ROLE_META[r].label })),
          ]}
          value={filters.role}
          onChange={(v) => pushParams({ role: v as UserRole | '' })}
          disabled={pending}
        />
        <div className="h-5 w-px bg-white/10 mx-1" />
        <Tabs
          options={ACTIVE_FILTERS}
          value={filters.active}
          onChange={(v) => pushParams({ active: v as '' | 'true' | 'false' })}
          disabled={pending}
        />
        <div className="ml-auto" />
        <BatchToggle active={bulk.batchMode} onClick={bulk.toggleBatchMode} />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search name or email"
          className="ring-focus rounded-md border border-white/10 bg-white/[0.03] px-3 py-2 text-sm text-ink-100 placeholder:text-ink-500 focus:outline-none focus:border-white/30 w-full sm:w-72"
        />
      </div>

      {bulk.batchMode ? (
        <BulkToolbar
          selectedIds={bulk.selectedIds}
          actions={bulkActions}
          onAction={(action, ids, payload) => runBulkAction('users', ids, action, payload)}
          onSelectAll={bulk.selectAllOnPage}
          onClear={bulk.clear}
          onExit={bulk.exitBatchMode}
          onDone={() => start(() => router.refresh())}
        />
      ) : null}

      <div className="text-sm text-ink-400">{users.length} of {total} shown</div>

      <div className="surface overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-[11px] uppercase tracking-wider text-ink-400 border-b border-white/5">
                {bulk.batchMode && <th className="w-10 px-4 py-3 font-medium" aria-label="Select" />}
                <th className="px-4 py-3 font-medium">User</th>
                <th className="px-4 py-3 font-medium">Role</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Last login</th>
                <th className="px-4 py-3 font-medium">Created</th>
                {isSuperAdmin && <th className="px-4 py-3 font-medium text-right">Actions</th>}
              </tr>
            </thead>
            <tbody>
              {users.length === 0 && (
                <tr>
                  <td colSpan={colCount} className="text-center text-ink-400 py-12">
                    No users match the current filters.
                  </td>
                </tr>
              )}
              {users.map((u, index) => (
                <tr
                  key={u.id}
                  onClick={(e) => {
                    if (bulk.batchMode) bulk.toggleRow(index, e.shiftKey);
                    else router.push(`/users/${u.id}`);
                  }}
                  className={`border-b border-white/5 hover:bg-white/[0.02] cursor-pointer select-none ${
                    bulk.batchMode && bulk.isSelected(u.id) ? 'bg-white/[0.04]' : ''
                  }`}
                >
                  {bulk.batchMode && (
                    <td className="px-4 py-3">
                      <BulkCheckbox
                        checked={bulk.isSelected(u.id)}
                        onToggle={(shiftKey) => bulk.toggleRow(index, shiftKey)}
                      />
                    </td>
                  )}
                  <td className="px-4 py-3">
                    {bulk.batchMode ? (
                      <div className="flex items-center gap-2.5">
                        <UserAvatar user={u} />
                        <div className="min-w-0">
                          <div className="text-white font-medium truncate">{u.name}</div>
                          <div className="text-xs text-ink-400 truncate">{u.email}</div>
                        </div>
                      </div>
                    ) : (
                      <Link
                        href={`/users/${u.id}`}
                        onClick={(e) => e.stopPropagation()}
                        className="flex items-center gap-2.5 ring-focus rounded"
                      >
                        <UserAvatar user={u} />
                        <div className="min-w-0">
                          <div className="text-white font-medium truncate">{u.name}</div>
                          <div className="text-xs text-ink-400 truncate">{u.email}</div>
                        </div>
                      </Link>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <RoleBadge role={u.role} />
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1.5">
                      <UserStatusBadge user={u} />
                      {u.mustChangePassword && (
                        <span title="Must change password on next login">
                          <KeyRound className="h-3.5 w-3.5 text-amber-300" />
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="text-ink-100">{relativeTime(u.lastLoginAt)}</div>
                    {u.lastLoginAt && (
                      <div className="text-xs text-ink-400">{new Date(u.lastLoginAt).toLocaleString()}</div>
                    )}
                  </td>
                  <td className="px-4 py-3 text-ink-300 text-xs">{new Date(u.createdAt).toLocaleDateString()}</td>
                  {isSuperAdmin && (
                    <td className="px-4 py-3 text-right">
                      <button
                        type="button"
                        title="Delete user"
                        disabled={deletingId === u.id}
                        onClick={(e) => {
                          e.stopPropagation();
                          void deleteOne(u);
                        }}
                        className="inline-flex items-center gap-1 rounded-md border border-white/10 bg-white/[0.02] px-2 py-1 text-[12px] text-ink-200 transition-colors hover:border-rose-500/50 hover:text-rose-300 disabled:opacity-50"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function UserAvatar({ user }: { user: ManagedUser }) {
  const initials = (user.name || user.email || '?')
    .split(/\s+/)
    .map((p) => p.charAt(0))
    .join('')
    .slice(0, 2)
    .toUpperCase();
  return (
    <div className="h-9 w-9 shrink-0 overflow-hidden rounded-full border border-white/10 bg-white/[0.04] flex items-center justify-center">
      {user.avatarUrl ? (
        // Live user input — plain <img> to avoid next/image throwing on arbitrary hosts.
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={resolveImg(user.avatarUrl)}
          alt=""
          className="h-full w-full object-cover"
          onError={(e) => {
            (e.currentTarget as HTMLImageElement).style.display = 'none';
          }}
        />
      ) : (
        <span className="text-[11px] font-semibold text-ink-300">{initials}</span>
      )}
    </div>
  );
}

function Tabs({
  options,
  value,
  onChange,
  disabled,
}: {
  options: Array<{ value: string; label: string }>;
  value: string;
  onChange: (v: string) => void;
  disabled?: boolean;
}) {
  return (
    <div className="inline-flex flex-wrap rounded-md border border-white/10 bg-white/[0.02] p-0.5">
      {options.map((o) => (
        <button
          key={o.value || 'all'}
          onClick={() => onChange(o.value)}
          disabled={disabled}
          className={`px-2.5 py-1 text-xs rounded-[5px] transition-colors disabled:opacity-60 ${
            value === o.value ? 'bg-white text-ink-900' : 'text-ink-300 hover:text-white'
          }`}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}
