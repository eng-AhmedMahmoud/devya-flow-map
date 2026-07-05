import { apiFetch } from './api';
import type { AdminRole } from './api';

export type ActivityAction = 'CREATE' | 'UPDATE' | 'DELETE' | 'ACTION' | 'BULK';

export const ACTIVITY_ACTIONS: ActivityAction[] = ['CREATE', 'UPDATE', 'DELETE', 'ACTION', 'BULK'];

export const ACTIVITY_ACTION_META: Record<ActivityAction, { label: string; color: string }> = {
  CREATE: { label: 'Create', color: '#10B981' },
  UPDATE: { label: 'Update', color: '#3B82F6' },
  DELETE: { label: 'Delete', color: '#EF4444' },
  ACTION: { label: 'Action', color: '#F59E0B' },
  BULK: { label: 'Bulk', color: '#A855F7' },
};

export interface ActivityEntry {
  id: string;
  actorId: string | null;
  actorEmail: string | null;
  actorRole: AdminRole | null;
  method: string;
  path: string;
  resource: string;
  resourceId: string | null;
  action: ActivityAction;
  before: unknown;
  after: unknown;
  ip: string | null;
  userAgent: string | null;
  reverted: boolean;
  revertedAt: string | null;
  createdAt: string;
}

export interface ActivityListParams {
  actorId?: string;
  resource?: string;
  action?: ActivityAction;
  from?: string;
  to?: string;
  page?: number;
  pageSize?: number;
}

export interface ActivityListResponse {
  items: ActivityEntry[];
  total: number;
  page: number;
  pageSize: number;
}

export const activityApi = {
  list: (params: ActivityListParams = {}, cookieHeader?: string) => {
    const q = new URLSearchParams();
    if (params.actorId) q.set('actorId', params.actorId);
    if (params.resource) q.set('resource', params.resource);
    if (params.action) q.set('action', params.action);
    if (params.from) q.set('from', params.from);
    if (params.to) q.set('to', params.to);
    if (params.page) q.set('page', String(params.page));
    if (params.pageSize) q.set('pageSize', String(params.pageSize));
    return apiFetch<ActivityListResponse>(`/api/admin/activity${q.toString() ? '?' + q.toString() : ''}`, {
      cookieHeader,
    });
  },
  revert: (id: string) =>
    apiFetch<{ ok: boolean }>(`/api/admin/activity/${encodeURIComponent(id)}/revert`, { method: 'POST' }),
};
