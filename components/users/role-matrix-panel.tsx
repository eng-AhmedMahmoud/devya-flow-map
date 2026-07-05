'use client';

import { useEffect, useState } from 'react';
import { Check, ShieldQuestion } from 'lucide-react';
import { usersApi, type RoleMatrixEntry, type RolesMatrixResponse, type UserRole } from '@/lib/users-api';
import { RoleBadge } from './user-badges';

// Fetched once per session — the matrix is static config on the backend.
let matrixPromise: Promise<RolesMatrixResponse> | null = null;

export function RoleMatrixPanel({ role }: { role: UserRole }) {
  const [entries, setEntries] = useState<RoleMatrixEntry[] | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let cancelled = false;
    matrixPromise ??= usersApi.rolesMatrix();
    matrixPromise
      .then((res) => {
        if (!cancelled) setEntries(res.roles);
      })
      .catch(() => {
        matrixPromise = null;
        if (!cancelled) setFailed(true);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  if (failed) return null;

  const entry = entries?.find((e) => e.role === role) ?? null;

  return (
    <div className="rounded-lg border border-white/10 bg-white/[0.02] p-4 space-y-3">
      <div className="flex items-center gap-2">
        <ShieldQuestion className="h-4 w-4 text-ink-400" />
        <span className="text-xs font-semibold uppercase tracking-wider text-ink-400">Role scope</span>
        <RoleBadge role={role} />
      </div>

      {entries === null ? (
        <div className="space-y-2 animate-pulse">
          <div className="h-3 w-2/3 rounded bg-white/5" />
          <div className="h-3 w-1/2 rounded bg-white/5" />
          <div className="h-3 w-3/5 rounded bg-white/5" />
        </div>
      ) : entry === null ? (
        <p className="text-xs text-ink-500">No scope information for this role.</p>
      ) : (
        <>
          <p className="text-sm text-ink-200">{entry.summary}</p>
          <ul className="space-y-1.5">
            {entry.capabilities.map((cap) => (
              <li key={cap} className="flex items-start gap-2 text-xs text-ink-300">
                <Check className="mt-0.5 h-3 w-3 shrink-0 text-emerald-400" />
                <span>{cap}</span>
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}
