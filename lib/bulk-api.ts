import { apiFetch } from './api';

/** Uniform bulk endpoint contract: POST /admin/<resource>/bulk {ids, action, payload?} */
export interface BulkFailure {
  id: string;
  reason: string;
}

export interface BulkResult {
  ok: number;
  failed: BulkFailure[];
}

export type BulkResource = 'users' | 'contracts' | 'bookings' | 'feedback' | 'clients' | 'invoices';

export function runBulkAction(
  resource: BulkResource,
  ids: string[],
  action: string,
  payload?: Record<string, unknown>,
): Promise<BulkResult> {
  return apiFetch<BulkResult>(`/api/admin/${resource}/bulk`, {
    method: 'POST',
    body: JSON.stringify({ ids, action, ...(payload ? { payload } : {}) }),
  });
}
