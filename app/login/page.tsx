import { Suspense } from 'react';
import { redirect } from 'next/navigation';
import { headers } from 'next/headers';
import { LoginForm } from '@/components/auth/login-form';
import { LocaleToggle } from '@/components/locale-toggle';
import { api, ApiError } from '@/lib/api';
import { getLocale } from '@/lib/i18n/server';
import { getDictionary, t } from '@/lib/i18n/dictionary';

export const dynamic = 'force-dynamic';

export default async function LoginPage() {
  const cookieHeader = (await headers()).get('cookie') ?? '';
  if (cookieHeader) {
    try {
      await api.me(cookieHeader);
      redirect('/');
    } catch (err) {
      // Ignore expected unauthenticated errors; let other errors surface.
      if (err instanceof ApiError && err.status !== 401 && err.status !== 403) {
        throw err;
      }
    }
  }

  const locale = await getLocale();
  const dict = getDictionary(locale);

  return (
    <main className="min-h-screen flex items-center justify-center bg-grid px-6 py-12">
      <div className="w-full max-w-md space-y-8">
        <div className="flex justify-center">
          <LocaleToggle />
        </div>
        <header className="space-y-3 text-center">
          <span className="chip mx-auto">{t(dict, 'shell.internalRestricted')}</span>
          <h1 className="text-3xl font-semibold text-white tracking-tight">
            {t(dict, 'login.title')}
          </h1>
          <p className="text-sm text-ink-300">{t(dict, 'login.subtitle')}</p>
        </header>

        <div className="surface-strong p-6">
          <Suspense fallback={<div className="h-[148px]" />}>
            <LoginForm />
          </Suspense>
        </div>

        <p className="text-center text-xs text-ink-500">
          {t(dict, 'shell.notIndexedFooter')}{' '}
          <span className="font-mono">noindex,nofollow</span>
        </p>
      </div>
    </main>
  );
}
