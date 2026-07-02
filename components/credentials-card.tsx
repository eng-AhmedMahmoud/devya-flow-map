'use client';

import { useState } from 'react';
import { Copy, Check, ExternalLink } from 'lucide-react';

// Demo credentials are injected at build time via env vars.
// Never hardcode real credentials here — this file is committed to git.
const DEMO_EMAIL = process.env.NEXT_PUBLIC_DEMO_EMAIL;
const DEMO_PASSWORD = process.env.NEXT_PUBLIC_DEMO_PASSWORD;
const ADMIN_URL = 'https://admin.devya-solutions.com';

function CopyButton({ value, label }: { value: string; label: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      onClick={() => {
        navigator.clipboard.writeText(value);
        setCopied(true);
        setTimeout(() => setCopied(false), 1500);
      }}
      className="inline-flex items-center gap-1.5 text-xs text-ink-300 hover:text-white transition-colors"
      aria-label={`Copy ${label}`}
    >
      {copied ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
      <span>{copied ? 'Copied' : 'Copy'}</span>
    </button>
  );
}

export function CredentialsCard() {
  // Render nothing unless demo credentials are explicitly provided via env.
  if (!DEMO_EMAIL || !DEMO_PASSWORD) return null;

  return (
    <div className="surface-strong p-6">
      <div className="flex items-start justify-between gap-4 mb-5">
        <div>
          <span className="chip">Admin Access</span>
          <h2 className="mt-3 text-2xl font-semibold text-white">Sign-in credentials</h2>
          <p className="mt-1 text-sm text-ink-300">For the marketing team and ops admins. Keep these private.</p>
        </div>
        <a
          href={ADMIN_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="shrink-0 inline-flex items-center gap-1.5 rounded-md bg-white px-3 py-2 text-xs font-medium text-ink-900 hover:bg-ink-200"
        >
          Open dashboard <ExternalLink className="h-3.5 w-3.5" />
        </a>
      </div>

      <dl className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <Field label="URL" value={ADMIN_URL} />
        <Field label="Email" value={DEMO_EMAIL} />
        <Field label="Password" value={DEMO_PASSWORD} mono />
        <Field label="Local dev" value="https://admin.localhost" hint="Behind portless; same creds." />
      </dl>

      <div className="mt-5 text-xs text-ink-400">
        Lost the password? Re-run <code className="font-mono text-ink-200">docker exec devya-backend node dist/seed.js</code> with a new
        <code className="font-mono text-ink-200"> SEED_ADMIN_PASSWORD</code> on the VPS.
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
