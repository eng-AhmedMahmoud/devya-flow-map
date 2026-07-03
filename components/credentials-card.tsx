'use client';

import { useState } from 'react';
import { Copy, Check, ExternalLink } from 'lucide-react';
import { useT } from '@/lib/i18n/client';

// Demo credentials are injected at build time via env vars.
// Never hardcode real credentials here — this file is committed to git.
const DEMO_EMAIL = process.env.NEXT_PUBLIC_DEMO_EMAIL;
const DEMO_PASSWORD = process.env.NEXT_PUBLIC_DEMO_PASSWORD;
const ADMIN_URL = 'https://admin.devya-solutions.com';

function CopyButton({ value, label }: { value: string; label: string }) {
  const [copied, setCopied] = useState(false);
  const t = useT();
  return (
    <button
      onClick={() => {
        navigator.clipboard.writeText(value);
        setCopied(true);
        setTimeout(() => setCopied(false), 1500);
      }}
      className="inline-flex items-center gap-1.5 text-xs text-ink-300 hover:text-white transition-colors"
      aria-label={`${t('credentials.copy')} ${label}`}
    >
      {copied ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
      <span>{copied ? t('credentials.copied') : t('credentials.copy')}</span>
    </button>
  );
}

export function CredentialsCard() {
  const t = useT();

  // Render nothing unless demo credentials are explicitly provided via env.
  if (!DEMO_EMAIL || !DEMO_PASSWORD) return null;

  return (
    <div className="surface-strong p-6">
      <div className="flex items-start justify-between gap-4 mb-5">
        <div>
          <span className="chip">{t('credentials.chip')}</span>
          <h2 className="mt-3 text-2xl font-semibold text-white">{t('credentials.title')}</h2>
          <p className="mt-1 text-sm text-ink-300">{t('credentials.subtitle')}</p>
        </div>
        <a
          href={ADMIN_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="shrink-0 inline-flex items-center gap-1.5 rounded-md bg-white px-3 py-2 text-xs font-medium text-ink-900 hover:bg-ink-200"
        >
          {t('credentials.openDashboard')} <ExternalLink className="h-3.5 w-3.5" />
        </a>
      </div>

      <dl className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <Field label={t('credentials.labelUrl')} value={ADMIN_URL} />
        <Field label={t('credentials.labelEmail')} value={DEMO_EMAIL} />
        <Field label={t('credentials.labelPassword')} value={DEMO_PASSWORD} mono />
        <Field
          label={t('credentials.labelLocalDev')}
          value="https://admin.localhost"
          hint={t('credentials.hintLocalDev')}
        />
      </dl>

      <div className="mt-5 text-xs text-ink-400">
        {t('credentials.resetHintA')}{' '}
        <code className="font-mono text-ink-200">docker exec devya-backend node dist/seed.js</code>{' '}
        {t('credentials.resetHintB')}{' '}
        <code className="font-mono text-ink-200">SEED_ADMIN_PASSWORD</code> {t('credentials.resetHintC')}
      </div>
    </div>
  );
}

function Field({ label, value, mono, hint }: { label: string; value: string; mono?: boolean; hint?: string }) {
  return (
    <div className="surface p-4">
      <div className="flex items-center justify-between mb-1.5">
        <dt className="text-[10px] uppercase tracking-wider text-ink-400">{label}</dt>
        <CopyButton value={value} label={label} />
      </div>
      <dd className={`text-sm text-ink-100 break-all ${mono ? 'font-mono' : ''}`}>{value}</dd>
      {hint && <p className="mt-1.5 text-[11px] text-ink-400">{hint}</p>}
    </div>
  );
}
