'use client';

import { useRouter } from 'next/navigation';
import { useState, useTransition } from 'react';
import { Copy, KeyRound, Loader2, LockOpen, Mail, MailX, MapPin, Monitor, Save, ShieldCheck } from 'lucide-react';
import { TextField, SwitchToggle } from '@/components/cms/fields';
import { MediaPicker } from '@/components/cms/fields/media-picker';
import { useDialog } from '@/components/ui/dialog-provider';
import {
  isUserLocked,
  usersApi,
  usersApiErrorMessage,
  type AuthEvent,
  type ManagedUser,
  type ResetPasswordResponse,
  type UpdateUserBody,
  type UserRole,
} from '@/lib/users-api';
import { RoleSelect } from './role-select';
import { RoleMatrixPanel } from './role-matrix-panel';
import { EventBadge, ROLE_META, relativeTime } from './user-badges';

interface Props {
  user: ManagedUser;
  recentEvents: AuthEvent[];
}

export function UserDetail({ user, recentEvents }: Props) {
  const router = useRouter();
  const dialog = useDialog();
  const [saving, startSave] = useTransition();
  const [saveError, setSaveError] = useState<string | null>(null);

  const [name, setName] = useState(user.name);
  const [role, setRole] = useState<UserRole>(user.role);
  const [isActive, setIsActive] = useState(user.isActive);
  const [mustChangePassword, setMustChangePassword] = useState(user.mustChangePassword);
  const [avatarUrl, setAvatarUrl] = useState(user.avatarUrl ?? '');

  const [actionError, setActionError] = useState<string | null>(null);
  const [resetBusy, setResetBusy] = useState(false);
  const [unlockBusy, setUnlockBusy] = useState(false);
  const [resetResult, setResetResult] = useState<ResetPasswordResponse | null>(null);
  const [copied, setCopied] = useState(false);

  const locked = isUserLocked(user);
  const dirty =
    name.trim() !== user.name ||
    role !== user.role ||
    isActive !== user.isActive ||
    mustChangePassword !== user.mustChangePassword ||
    avatarUrl.trim() !== (user.avatarUrl ?? '');

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaveError(null);
    if (!dirty) return;

    if (role !== user.role) {
      const ok = await dialog.confirm({
        title: 'Change role?',
        message: `${user.name} will go from ${ROLE_META[user.role].label} to ${ROLE_META[role].label}. This changes what they can access.`,
        confirmLabel: 'Change role',
        tone: 'warn',
      });
      if (!ok) return;
    }
    if (!isActive && user.isActive) {
      const ok = await dialog.confirm({
        title: 'Deactivate this user?',
        message: `${user.name} will no longer be able to sign in until reactivated.`,
        confirmLabel: 'Deactivate',
        tone: 'danger',
      });
      if (!ok) return;
    }

    const body: UpdateUserBody = {};
    if (name.trim() !== user.name) body.name = name.trim();
    if (role !== user.role) body.role = role;
    if (isActive !== user.isActive) body.isActive = isActive;
    if (mustChangePassword !== user.mustChangePassword) body.mustChangePassword = mustChangePassword;
    if (avatarUrl.trim() !== (user.avatarUrl ?? '')) body.avatarUrl = avatarUrl.trim();

    startSave(async () => {
      try {
        await usersApi.update(user.id, body);
        router.refresh();
      } catch (err) {
        setSaveError(usersApiErrorMessage(err, 'Could not update user'));
      }
    });
  }

  async function handleReset() {
    setResetBusy(true);
    setActionError(null);
    try {
      const res = await usersApi.resetPassword(user.id);
      setResetResult(res);
    } catch (err) {
      setActionError(usersApiErrorMessage(err, 'Could not send password reset'));
    } finally {
      setResetBusy(false);
    }
  }

  async function handleUnlock() {
    setUnlockBusy(true);
    setActionError(null);
    try {
      await usersApi.unlock(user.id);
      router.refresh();
    } catch (err) {
      setActionError(usersApiErrorMessage(err, 'Could not unlock account'));
    } finally {
      setUnlockBusy(false);
    }
  }

  function copyResetUrl(url: string) {
    void navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 1200);
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-6">
      <div className="space-y-6">
        <form onSubmit={handleSave} className="surface p-5 space-y-5">
          <div className="flex items-center justify-between gap-3">
            <h3 className="text-sm font-semibold text-white">Profile</h3>
            <button
              type="submit"
              disabled={saving || !dirty}
              className="inline-flex items-center gap-1.5 rounded-md border border-white/10 bg-white px-3.5 py-1.5 text-sm text-ink-900 font-medium hover:bg-ink-100 disabled:opacity-60"
            >
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              Save changes
            </button>
          </div>

          {saveError && (
            <div className="rounded-md border border-rose-500/40 bg-rose-500/10 px-3 py-2 text-sm text-rose-200">
              {saveError}
            </div>
          )}

          <div className="grid gap-4 sm:grid-cols-2">
            <TextField label="Name" value={name} onChange={setName} required maxLength={120} />
            <TextField label="Email" value={user.email} onChange={() => undefined} disabled helper="Email cannot be changed." />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <RoleSelect label="Role" value={role} onChange={setRole} helper="Controls what the user can access." />
            <div className="space-y-3">
              <SwitchToggle
                label="Active account"
                value={isActive}
                onChange={setIsActive}
                helper="Inactive users cannot sign in."
              />
              <SwitchToggle
                label="Must change password"
                value={mustChangePassword}
                onChange={setMustChangePassword}
                helper="Forces a password change on next login."
              />
            </div>
          </div>
          <MediaPicker
            label="Profile picture"
            value={avatarUrl}
            onChange={(url) => setAvatarUrl(url)}
            helper="Shown next to the user's name across the admin."
          />
          <RoleMatrixPanel role={role} />
        </form>

        <section className="surface p-5">
          <h3 className="text-sm font-semibold text-white mb-3">Auth activity</h3>
          <EventTimeline events={recentEvents} />
        </section>
      </div>

      <aside className="space-y-6">
        <div className="surface p-5 space-y-3">
          <h3 className="text-sm font-semibold text-white flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-ink-400" />
            Security actions
          </h3>

          {actionError && (
            <div className="rounded-md border border-rose-500/40 bg-rose-500/10 px-3 py-2 text-xs text-rose-300">
              {actionError}
            </div>
          )}

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={handleReset}
              disabled={resetBusy}
              className="inline-flex items-center gap-1.5 rounded-md border border-white/10 bg-white/[0.02] px-3 py-1.5 text-sm text-ink-200 hover:bg-white/5 hover:border-white/20 transition-colors disabled:opacity-50"
            >
              {resetBusy ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <KeyRound className="h-3.5 w-3.5" />}
              Send password reset
            </button>
            {locked && (
              <button
                type="button"
                onClick={handleUnlock}
                disabled={unlockBusy}
                className="inline-flex items-center gap-1.5 rounded-md border border-amber-500/40 bg-amber-500/10 px-3 py-1.5 text-sm text-amber-200 hover:bg-amber-500/20 transition-colors disabled:opacity-50"
              >
                {unlockBusy ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <LockOpen className="h-3.5 w-3.5" />}
                Unlock
              </button>
            )}
          </div>

          {resetResult ? (
            <div className="space-y-2">
              <div
                className={`inline-flex items-center gap-1.5 rounded-md border px-2.5 py-1.5 text-xs ${
                  resetResult.mailSent
                    ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-300'
                    : 'border-amber-500/40 bg-amber-500/10 text-amber-200'
                }`}
              >
                {resetResult.mailSent ? <Mail className="h-3.5 w-3.5" /> : <MailX className="h-3.5 w-3.5" />}
                {resetResult.mailSent ? 'Reset email sent.' : 'Email is disabled — share the link manually.'}
              </div>
              <div>
                <div className="text-[10px] uppercase tracking-wider text-ink-500 mb-1">Reset link</div>
                <div className="flex items-center gap-2 rounded-md border border-white/10 bg-black/40 px-2 py-1.5">
                  <code className="flex-1 truncate text-[11px] text-ink-200">{resetResult.resetUrl}</code>
                  <button
                    type="button"
                    onClick={() => copyResetUrl(resetResult.resetUrl)}
                    className="inline-flex items-center gap-1 rounded px-2 py-0.5 text-[11px] text-ink-300 hover:bg-white/5"
                  >
                    <Copy className="h-3 w-3" />
                    {copied ? 'Copied' : 'Copy'}
                  </button>
                </div>
                <p className="text-[11px] text-ink-500 mt-1.5">
                  The user picks a new password (12–128 chars, with a lowercase, an uppercase and a digit).
                </p>
              </div>
            </div>
          ) : null}
        </div>

        <div className="surface p-5 space-y-2 text-xs">
          <h3 className="text-sm font-semibold text-white mb-2">Account</h3>
          <MetaRow label="Last login" value={user.lastLoginAt ? new Date(user.lastLoginAt).toLocaleString() : 'Never'} />
          <MetaRow
            label="Password updated"
            value={user.passwordUpdatedAt ? new Date(user.passwordUpdatedAt).toLocaleString() : 'Never'}
          />
          <MetaRow label="Failed logins" value={String(user.failedLoginCount)} />
          {user.lockedUntil ? (
            <MetaRow
              label="Locked until"
              value={`${new Date(user.lockedUntil).toLocaleString()}${locked ? ` (${relativeTime(user.lockedUntil)})` : ''}`}
            />
          ) : null}
          <MetaRow label="Created" value={new Date(user.createdAt).toLocaleString()} />
          <MetaRow label="Updated" value={new Date(user.updatedAt).toLocaleString()} />
        </div>
      </aside>
    </div>
  );
}

function MetaRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-3 text-xs">
      <span className="text-ink-500">{label}</span>
      <span className="text-ink-100 text-right break-all">{value}</span>
    </div>
  );
}

function EventTimeline({ events }: { events: AuthEvent[] }) {
  if (events.length === 0) return <p className="text-xs text-ink-500">No auth events yet.</p>;
  return (
    <ol className="relative border-l border-white/10 ml-2 space-y-4">
      {events.map((e) => (
        <li key={e.id} className="ml-4">
          <div className="absolute -left-1.5 mt-1.5 h-2.5 w-2.5 rounded-full bg-ink-500" />
          <div className="flex flex-wrap items-center gap-2">
            <EventBadge type={e.type} />
            <span className="text-[10px] text-ink-500" title={new Date(e.createdAt).toLocaleString()}>
              {relativeTime(e.createdAt)} · {new Date(e.createdAt).toLocaleString()}
            </span>
          </div>
          <div className="mt-1 flex flex-wrap items-center gap-3 text-[11px] text-ink-500">
            {e.ip ? (
              <span className="inline-flex items-center gap-1">
                <MapPin className="h-3 w-3" />
                {e.ip}
              </span>
            ) : null}
            {e.userAgent ? (
              <span className="inline-flex items-center gap-1 truncate max-w-xs">
                <Monitor className="h-3 w-3 shrink-0" />
                <span className="truncate">{e.userAgent}</span>
              </span>
            ) : null}
          </div>
        </li>
      ))}
    </ol>
  );
}
