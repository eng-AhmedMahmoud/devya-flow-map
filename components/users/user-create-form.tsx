'use client';

import Link from 'next/link';
import { useState, useTransition } from 'react';
import { ArrowLeft, CheckCircle2, Copy, Loader2, Mail, MailX, Save, UserPlus } from 'lucide-react';
import { TextField, SwitchToggle } from '@/components/cms/fields';
import { MediaPicker } from '@/components/cms/fields/media-picker';
import { RoleSelect } from './role-select';
import { RoleMatrixPanel } from './role-matrix-panel';
import { RoleBadge } from './user-badges';
import { usersApi, usersApiErrorMessage, type CreateUserResponse, type UserRole } from '@/lib/users-api';

export function UserCreateForm() {
  const [submitting, start] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<CreateUserResponse | null>(null);
  const [copied, setCopied] = useState(false);

  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState<UserRole>('TEAM');
  const [sendInvite, setSendInvite] = useState(true);
  const [avatarUrl, setAvatarUrl] = useState('');

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    start(async () => {
      try {
        const res = await usersApi.create({
          email: email.trim(),
          name: name.trim(),
          role,
          sendInvite,
          ...(avatarUrl.trim() ? { avatarUrl: avatarUrl.trim() } : {}),
        });
        setResult(res);
      } catch (err) {
        setError(usersApiErrorMessage(err, 'Could not create user'));
      }
    });
  }

  function copyInvite(url: string) {
    void navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 1200);
  }

  if (result) {
    return (
      <div className="space-y-6">
        <div>
          <Link href="/users" className="inline-flex items-center gap-1.5 text-xs text-ink-400 hover:text-white mb-2">
            <ArrowLeft className="h-3.5 w-3.5" />
            Back to users
          </Link>
          <h1 className="text-2xl font-semibold text-white">User created</h1>
          <p className="text-sm text-ink-400 mt-1">{result.user.email}</p>
        </div>

        <div className="surface-strong p-5 space-y-4">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-emerald-400" />
            <span className="text-sm text-white font-medium">{result.user.name}</span>
            <RoleBadge role={result.user.role} />
          </div>

          <div
            className={`inline-flex items-center gap-1.5 rounded-md border px-2.5 py-1.5 text-xs ${
              result.mailSent
                ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-300'
                : 'border-amber-500/40 bg-amber-500/10 text-amber-200'
            }`}
          >
            {result.mailSent ? <Mail className="h-3.5 w-3.5" /> : <MailX className="h-3.5 w-3.5" />}
            {result.mailSent ? 'Invite email sent.' : 'Email is disabled — share the invite link manually.'}
          </div>

          {typeof result.inviteUrl === 'string' && result.inviteUrl ? (
            <div>
              <div className="text-[10px] uppercase tracking-wider text-ink-500 mb-1">Invite link</div>
              <div className="flex items-center gap-2 rounded-md border border-white/10 bg-black/40 px-2 py-1.5">
                <code className="flex-1 truncate text-[11px] text-ink-200">{result.inviteUrl}</code>
                <button
                  type="button"
                  onClick={() => copyInvite(result.inviteUrl ?? '')}
                  className="inline-flex items-center gap-1 rounded px-2 py-0.5 text-[11px] text-ink-300 hover:bg-white/5"
                >
                  <Copy className="h-3 w-3" />
                  {copied ? 'Copied' : 'Copy'}
                </button>
              </div>
              <p className="text-[11px] text-ink-500 mt-1.5">
                The user sets their own password via this link (12–128 chars, with a lowercase, an uppercase and a digit).
              </p>
            </div>
          ) : null}

          <div className="flex items-center gap-2 pt-1">
            <Link
              href={`/users/${result.user.id}`}
              className="inline-flex items-center gap-1.5 rounded-md border border-white/10 bg-white px-3.5 py-1.5 text-sm text-ink-900 font-medium hover:bg-ink-100"
            >
              Open profile
            </Link>
            <Link
              href="/users"
              className="inline-flex items-center gap-1.5 rounded-md border border-white/10 bg-white/[0.02] px-3 py-1.5 text-sm text-ink-200 hover:bg-white/5"
            >
              Back to list
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <Link href="/users" className="inline-flex items-center gap-1.5 text-xs text-ink-400 hover:text-white mb-2">
            <ArrowLeft className="h-3.5 w-3.5" />
            Back to users
          </Link>
          <h1 className="text-2xl font-semibold text-white">New user</h1>
          <p className="text-sm text-ink-400 mt-1">Create a staff account. Only super admins can do this.</p>
        </div>
        <button
          type="submit"
          disabled={submitting}
          className="inline-flex items-center gap-1.5 rounded-md border border-white/10 bg-white px-3.5 py-1.5 text-sm text-ink-900 font-medium hover:bg-ink-100 disabled:opacity-60"
        >
          {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          Create
        </button>
      </div>

      {error && (
        <div className="rounded-md border border-rose-500/40 bg-rose-500/10 px-3 py-2 text-sm text-rose-200">
          {error}
        </div>
      )}

      <div className="surface-strong p-5 space-y-5">
        <div className="flex items-center gap-2 text-sm font-semibold text-white">
          <UserPlus className="h-4 w-4 text-ink-400" />
          Account
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <TextField label="Email" value={email} onChange={setEmail} required type="email" placeholder="name@devya.dev" />
          <TextField label="Name" value={name} onChange={setName} required maxLength={120} placeholder="Full name" />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <RoleSelect label="Role" value={role} onChange={setRole} helper="Controls what the user can access." />
          <SwitchToggle
            label="Send invite email"
            value={sendInvite}
            onChange={setSendInvite}
            helper="Emails a link where the user sets their password (12–128 chars, lowercase, uppercase and a digit)."
          />
        </div>
        <MediaPicker
          label="Profile picture"
          value={avatarUrl}
          onChange={(url) => setAvatarUrl(url)}
          helper="Optional. Shown next to their name in the users list."
        />
        <RoleMatrixPanel role={role} />
      </div>
    </form>
  );
}
