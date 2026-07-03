import { Suspense } from 'react';
import { LoginForm } from './login-form';
import { LocaleToggle } from '@/components/locale-toggle';
import { getLocale } from '@/lib/i18n/server';
import { getDictionary, t } from '@/lib/i18n/dictionary';

export const dynamic = 'force-dynamic';

export default async function LoginPage() {
  const locale = await getLocale();
  const dict = getDictionary(locale);

  return (
    <main className="min-h-screen flex items-center justify-center px-6 py-12">
      <div className="w-full max-w-md space-y-8">
        <div className="flex justify-center">
          <LocaleToggle />
        </div>
        <header className="space-y-3 text-center">
          <span className="chip mx-auto">{t(dict, 'shell.internalRestricted')}</span>
          <h1 className="text-3xl font-semibold text-white tracking-tight">
            {t(dict, 'login.title')}
          </h1>
          <p className="text-sm text-ink-300">
            {t(dict, 'login.subtitle')}
          </p>
        </header>

        <Suspense fallback={<div className="surface-strong p-6 h-[148px]" />}>
          <LoginForm />
        </Suspense>

        <p className="text-center text-xs text-ink-500">
          {t(dict, 'login.forgot')}{' '}
          <a
            href="mailto:contact@devya.dev?subject=Flow%20Map%20access%20password%20reset"
            className="text-ink-200 underline underline-offset-4 hover:text-white"
          >
            {t(dict, 'login.emailLink')}
          </a>
        </p>
      </div>
    </main>
  );
}
