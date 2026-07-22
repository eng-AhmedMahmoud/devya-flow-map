'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import {
  Server,
  RefreshCw,
  ExternalLink,
  Github,
  Rocket,
  Copy,
  Check,
  Loader2,
  X,
} from 'lucide-react';
import { opsApi, opsApiErrorMessage, type AppStatus, type DeployResult, type DeployLog } from '@/lib/ops-api';

const REFRESH_MS = 30_000;

export function DeploymentsDashboard({
  initial,
  isSuperAdmin,
}: {
  initial: AppStatus[];
  isSuperAdmin: boolean;
}) {
  const [statuses, setStatuses] = useState<AppStatus[]>(initial);
  const [refreshing, setRefreshing] = useState(false);
  const [updatedAt, setUpdatedAt] = useState<number>(() => Date.now());
  const [notice, setNotice] = useState<string | null>(null);
  // Per-app deploy command panel + which command has just been copied.
  const [panels, setPanels] = useState<Record<string, DeployResult>>({});
  const [logs, setLogs] = useState<Record<string, DeployLog>>({});
  const [deploying, setDeploying] = useState<string | null>(null);
  const [copied, setCopied] = useState<string | null>(null);
  const mounted = useRef(true);

  const refresh = useCallback(async () => {
    setRefreshing(true);
    try {
      const next = await opsApi.getStatus();
      if (!mounted.current) return;
      setStatuses(next);
      setUpdatedAt(Date.now());
      setNotice(null);
    } catch (err) {
      if (mounted.current) setNotice(opsApiErrorMessage(err, 'Could not refresh status.'));
    } finally {
      if (mounted.current) setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    mounted.current = true;
    const id = setInterval(refresh, REFRESH_MS);
    return () => {
      mounted.current = false;
      clearInterval(id);
    };
  }, [refresh]);

  async function onDeploy(key: string) {
    if (panels[key]) {
      // Toggle the panel closed if it's already open.
      setPanels((p) => {
        const { [key]: _drop, ...rest } = p;
        return rest;
      });
      setLogs((l) => {
        const { [key]: _drop, ...rest } = l;
        return rest;
      });
      return;
    }
    setDeploying(key);
    try {
      const result = await opsApi.deploy(key);
      if (!mounted.current) return;
      setPanels((p) => ({ ...p, [key]: result }));
      // Queued to the host runner — stream its log until it finishes.
      if (result.triggered && result.id) void pollLog(key, result.id);
    } catch (err) {
      if (mounted.current) setNotice(opsApiErrorMessage(err, 'Could not start the deploy.'));
    } finally {
      if (mounted.current) setDeploying(null);
    }
  }

  async function pollLog(key: string, id: string) {
    for (let i = 0; i < 150 && mounted.current; i++) {
      try {
        const dl = await opsApi.deployLog(id);
        if (!mounted.current) return;
        setLogs((l) => ({ ...l, [key]: dl }));
        if (!dl.running) return;
      } catch {
        // transient — keep polling
      }
      await new Promise((r) => setTimeout(r, 2000));
    }
  }

  function copy(key: string, text: string) {
    void navigator.clipboard.writeText(text);
    setCopied(key);
    setTimeout(() => {
      if (mounted.current) setCopied((c) => (c === key ? null : c));
    }, 1500);
  }

  const upCount = statuses.filter((s) => s.ok).length;

  return (
    <div className="space-y-5">
      {/* Summary bar */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3 text-sm text-ink-300">
          <span className="inline-flex items-center gap-2">
            <span
              className={
                upCount === statuses.length
                  ? 'h-2 w-2 rounded-full bg-emerald-400'
                  : 'h-2 w-2 rounded-full bg-amber-400'
              }
            />
            <span className="text-white font-medium">
              {upCount}/{statuses.length}
            </span>
            up
          </span>
          <span className="text-ink-500">·</span>
          <span>updated {new Date(updatedAt).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', hour12: true })}</span>
        </div>
        <button
          onClick={refresh}
          disabled={refreshing}
          className="inline-flex items-center gap-2 rounded-md border border-white/10 bg-white/[0.02] px-3 py-1.5 text-sm text-ink-200 hover:bg-white/5 hover:border-white/20 transition-colors disabled:opacity-60 ring-focus"
        >
          <RefreshCw className={refreshing ? 'h-4 w-4 animate-spin' : 'h-4 w-4'} />
          Refresh
        </button>
      </div>

      {notice && (
        <div className="flex items-center justify-between gap-3 rounded-md border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-sm text-amber-200">
          <span>{notice}</span>
          <button onClick={() => setNotice(null)} aria-label="Dismiss" className="text-amber-300/70 hover:text-amber-200">
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {statuses.map((s) => {
          const panel = panels[s.key];
          return (
            <div key={s.key} className="surface p-5 flex flex-col gap-4">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-medium text-white truncate">{s.name}</h3>
                    <span className="inline-flex items-center gap-1 rounded-full border border-white/10 bg-white/[0.03] px-1.5 py-0.5 text-[10px] uppercase tracking-wider text-ink-400">
                      <Server className="h-3 w-3" /> VPS
                    </span>
                  </div>
                  <div className="mt-0.5 text-xs text-ink-500 font-mono truncate">
                    {s.publicUrl.replace(/^https?:\/\//, '')}
                  </div>
                </div>
                <StatusPill s={s} />
              </div>

              {s.key === 'backend' && (s.version || s.timestamp) && (
                <div className="text-xs text-ink-400">
                  {s.version && <span className="font-mono">v{s.version} </span>}
                  {s.timestamp && <span>· {new Date(s.timestamp).toLocaleString(undefined, { hour12: true })}</span>}
                </div>
              )}

              <div className="flex flex-wrap items-center gap-2 mt-auto">
                <a
                  href={s.publicUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 rounded-md border border-white/10 bg-white/[0.02] px-2.5 py-1.5 text-xs text-ink-200 hover:bg-white/5 hover:border-white/20 transition-colors ring-focus"
                >
                  <ExternalLink className="h-3.5 w-3.5" /> Open
                </a>
                <a
                  href={`https://github.com/${s.repo}`}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 rounded-md border border-white/10 bg-white/[0.02] px-2.5 py-1.5 text-xs text-ink-200 hover:bg-white/5 hover:border-white/20 transition-colors ring-focus"
                >
                  <Github className="h-3.5 w-3.5" /> GitHub
                </a>
                {isSuperAdmin && (
                  <button
                    onClick={() => onDeploy(s.key)}
                    disabled={deploying === s.key}
                    className="inline-flex items-center gap-1.5 rounded-md border border-white/10 bg-white/[0.04] px-2.5 py-1.5 text-xs text-white hover:bg-white/[0.08] hover:border-white/20 transition-colors disabled:opacity-60 ring-focus"
                  >
                    {deploying === s.key ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <Rocket className="h-3.5 w-3.5" />
                    )}
                    {panel ? 'Hide deploy' : 'Redeploy'}
                  </button>
                )}
              </div>

              {panel && panel.platform === 'vercel' && (
                <div className="rounded-md border border-white/10 bg-ink-950/50 p-3 space-y-1.5">
                  <div className="text-[11px] uppercase tracking-wider text-ink-500">
                    {panel.triggered ? 'Vercel build triggered' : 'Deploys via Vercel'}
                  </div>
                  <div className="text-xs text-ink-200">
                    {panel.note ?? 'This app builds on Vercel automatically on git push.'}
                  </div>
                </div>
              )}

              {panel && panel.platform !== 'vercel' && panel.triggered && (
                <div className="rounded-md border border-white/10 bg-ink-950/50 p-3 space-y-2">
                  <div className="flex items-center justify-between text-[11px] uppercase tracking-wider text-ink-500">
                    <span>Deploying on VPS</span>
                    <DeployState log={logs[s.key]} />
                  </div>
                  <pre className="max-h-56 overflow-auto whitespace-pre-wrap break-all font-mono text-[11px] leading-relaxed text-ink-200">
                    {logs[s.key]?.log || 'Queued — starting the runner…'}
                  </pre>
                </div>
              )}

              {panel && panel.platform !== 'vercel' && panel.manual && (
                <div className="rounded-md border border-white/10 bg-ink-950/50 p-3 space-y-2">
                  <div className="flex items-center justify-between text-[11px] uppercase tracking-wider text-ink-500">
                    <span>Run on the VPS</span>
                    <button
                      onClick={() => copy(s.key, panel.command)}
                      className="inline-flex items-center gap-1 text-ink-300 hover:text-white transition-colors"
                    >
                      {copied === s.key ? (
                        <>
                          <Check className="h-3.5 w-3.5 text-emerald-400" /> Copied
                        </>
                      ) : (
                        <>
                          <Copy className="h-3.5 w-3.5" /> Copy
                        </>
                      )}
                    </button>
                  </div>
                  <code className="block whitespace-pre-wrap break-all font-mono text-xs text-ink-100">
                    {panel.command}
                  </code>
                  <div className="text-[11px] text-ink-500">
                    ssh root@72.61.81.59, then run the command above.
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function DeployState({ log }: { log?: DeployLog }) {
  if (!log || log.running) {
    return (
      <span className="inline-flex items-center gap-1 text-ink-300">
        <Loader2 className="h-3 w-3 animate-spin" /> Running
      </span>
    );
  }
  if (log.exitCode === 0) {
    return (
      <span className="inline-flex items-center gap-1 text-emerald-400">
        <Check className="h-3 w-3" /> Done
      </span>
    );
  }
  return <span className="text-rose-400">Failed · exit {log.exitCode ?? '?'}</span>;
}

function StatusPill({ s }: { s: AppStatus }) {
  if (s.ok) {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-1 text-xs text-emerald-300 shrink-0">
        <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
        Up · {s.latencyMs}ms
      </span>
    );
  }
  const label = s.httpCode ? `Down · HTTP ${s.httpCode}` : s.error === 'timeout' ? 'Timeout' : 'Unreachable';
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-rose-500/30 bg-rose-500/10 px-2.5 py-1 text-xs text-rose-300 shrink-0">
      <span className="h-1.5 w-1.5 rounded-full bg-rose-400" />
      {label}
    </span>
  );
}
