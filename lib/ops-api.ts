import { apiFetch, ApiError } from './api';

export type OpsPlatform = 'vps' | 'vercel';

/** One app's health-poll result, mirrors the backend AppStatus shape. */
export interface AppStatus {
  key: string;
  name: string;
  publicUrl: string;
  repo: string;
  platform: OpsPlatform;
  ok: boolean;
  httpCode: number | null;
  latencyMs: number;
  checkedAt: string;
  error?: string;
  /** Backend only. */
  version?: string;
  /** Backend only. */
  timestamp?: string;
}

/**
 * Deploy descriptor. vps: `triggered` → queued to the host runner (poll id),
 * `manual` → run the command by hand. vercel: `triggered` → deploy hook fired,
 * `manual` → auto-deploys on push (see `note`).
 */
export interface DeployResult {
  key: string;
  platform: OpsPlatform;
  repoDir: string;
  command: string;
  triggered: boolean;
  manual: boolean;
  id?: string;
  /** Vercel apps only: human-readable hint. */
  note?: string;
}

export interface DeployLog {
  id: string;
  running: boolean;
  exitCode: number | null;
  log: string;
}

export const opsApi = {
  getStatus: (cookieHeader?: string) =>
    apiFetch<AppStatus[]>('/api/admin/ops/status', { cookieHeader }),
  deploy: (key: string) =>
    apiFetch<DeployResult>(`/api/admin/ops/deploy/${encodeURIComponent(key)}`, { method: 'POST' }),
  deployLog: (id: string) =>
    apiFetch<DeployLog>(`/api/admin/ops/deploy-log/${encodeURIComponent(id)}`),
};

/** Backend errors are JSON `{ message }` (string or string[] for validation). */
export function opsApiErrorMessage(err: unknown, fallback: string): string {
  if (err instanceof ApiError) {
    if (err.status === 429) return 'Too many requests — try again in a moment.';
    if (err.status === 403) return 'You do not have permission to do that — super admin only.';
    const body = err.body;
    if (body && typeof body === 'object' && 'message' in body) {
      const m = (body as { message?: unknown }).message;
      if (typeof m === 'string' && m) return m;
      if (Array.isArray(m) && m.length > 0) return m.filter((x): x is string => typeof x === 'string').join(', ');
    }
    return err.message;
  }
  return err instanceof Error && err.message ? err.message : fallback;
}
