'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Lock, Loader2 } from 'lucide-react';
import { useT, useLocale } from '@/lib/i18n/client';

export function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const next = params.get('next') || '/';
  const t = useT();
  const locale = useLocale();

  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setPending(true);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ password }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data?.error || t('login.signInFailed'));
        setPending(false);
        return;
      }
      router.replace(next.startsWith('/') ? next : '/');
      router.refresh();
    } catch {
      setError(t('login.networkError'));
      setPending(false);
    }
  }

  const iconSide = locale === 'ar' ? 'right-3' : 'left-3';
  const padSide = locale === 'ar' ? 'pr-10 pl-3' : 'pl-10 pr-3';

  return (
    <form onSubmit={onSubmit} className="surface-strong p-6 space-y-4">
      <label className="block space-y-2">
        <span className="text-xs uppercase tracking-wider text-ink-400">
          {t('login.passwordLabel')}
        </span>
        <div className="relative">
          <Lock className={`absolute ${iconSide} top-1/2 -translate-y-1/2 h-4 w-4 text-ink-500`} />
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoFocus
            required
            disabled={pending}
            placeholder={t('login.passwordPlaceholder')}
            className={`w-full rounded-lg bg-white/[0.04] border border-white/10 ${padSide} py-2.5 text-sm text-white placeholder-ink-500 focus:outline-none focus:border-white/30 disabled:opacity-50`}
          />
        </div>
      </label>

      {error && (
        <div className="rounded-md border border-red-500/30 bg-red-500/10 px-3 py-2 text-xs text-red-200">
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={pending || !password}
        className="w-full rounded-lg bg-white text-ink-900 font-medium text-sm py-2.5 hover:bg-ink-100 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-colors"
      >
        {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
        {pending ? t('login.verifying') : t('login.unlock')}
      </button>
    </form>
  );
}
