import { Suspense } from 'react';
import { LoginForm } from './login-form';

export const dynamic = 'force-static';

export default function LoginPage() {
  return (
    <main className="min-h-screen flex items-center justify-center px-6 py-12">
      <div className="w-full max-w-md space-y-8">
        <header className="space-y-3 text-center">
          <span className="chip mx-auto">Internal · Restricted</span>
          <h1 className="text-3xl font-semibold text-white tracking-tight">
            Devya Flow Map
          </h1>
          <p className="text-sm text-ink-300">
            This document is confidential. Enter the access password to continue.
          </p>
        </header>

        <Suspense fallback={<div className="surface-strong p-6 h-[148px]" />}>
          <LoginForm />
        </Suspense>

        <p className="text-center text-xs text-ink-500">
          Forgot the password?{' '}
          <a
            href="mailto:contact@devya.dev?subject=Flow%20Map%20access%20password%20reset"
            className="text-ink-200 underline underline-offset-4 hover:text-white"
          >
            Email contact@devya.dev
          </a>
        </p>
      </div>
    </main>
  );
}
