import { apiFetch, ApiError } from './api';

export type UserRole = 'SUPER_ADMIN' | 'ADMIN' | 'TEAM' | 'SALES_REP' | 'SALES_MANAGER';

export const USER_ROLES: UserRole[] = ['SUPER_ADMIN', 'ADMIN', 'TEAM', 'SALES_REP', 'SALES_MANAGER'];

/** Org-wide delivery-team function — distinct from the access `role`. */
export type JobRole = 'PRODUCT_OWNER' | 'SCRUM_MASTER' | 'TECH_LEAD' | 'DEVELOPER' | 'DESIGNER' | 'TESTER';

export const JOB_ROLES: JobRole[] = ['PRODUCT_OWNER', 'SCRUM_MASTER', 'TECH_LEAD', 'DEVELOPER', 'DESIGNER', 'TESTER'];

export interface ManagedUser {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  jobRole: JobRole | null;
  isActive: boolean;
  lastLoginAt: string | null;
  passwordUpdatedAt: string | null;
  failedLoginCount: number;
  lockedUntil: string | null;
  mustChangePassword: boolean;
  avatarUrl: string | null;
  createdAt: string;
  updatedAt: string;
}

export type AuthEventType =
  | 'LOGIN_SUCCESS'
  | 'LOGIN_FAILED'
  | 'LOGOUT'
  | 'ACCOUNT_LOCKED'
  | 'ACCOUNT_UNLOCKED'
  | 'PASSWORD_CHANGED'
  | 'PASSWORD_RESET_REQUESTED'
  | 'PASSWORD_RESET_COMPLETED'
  | 'USER_CREATED'
  | 'USER_UPDATED'
  | 'ROLE_CHANGED'
  | 'USER_DEACTIVATED'
  | 'USER_REACTIVATED';

export interface AuthEvent {
  id: string;
  type: AuthEventType;
  userId: string | null;
  actorId: string | null;
  email: string | null;
  ip: string | null;
  userAgent: string | null;
  payload: Record<string, unknown> | null;
  createdAt: string;
}

export interface UsersListParams {
  search?: string;
  role?: UserRole;
  active?: 'true' | 'false';
  page?: number;
  pageSize?: number;
}

export interface UsersListResponse {
  users: ManagedUser[];
  total: number;
  page: number;
  pageSize: number;
}

export interface UserDetailResponse {
  user: ManagedUser;
  recentEvents: AuthEvent[];
}

export interface UserEventsResponse {
  events: AuthEvent[];
  total: number;
  page: number;
  pageSize: number;
}

export interface CreateUserBody {
  email: string;
  name: string;
  role: UserRole;
  jobRole?: JobRole;
  sendInvite?: boolean;
  avatarUrl?: string;
}

export interface CreateUserResponse {
  user: ManagedUser;
  inviteUrl: string | null;
  mailSent: boolean;
}

export interface UpdateUserBody {
  name?: string;
  role?: UserRole;
  /** `null` clears the job role. */
  jobRole?: JobRole | null;
  isActive?: boolean;
  mustChangePassword?: boolean;
  /** Empty string clears the current avatar. */
  avatarUrl?: string;
}

export interface ResetPasswordResponse {
  resetUrl: string;
  mailSent: boolean;
}

export interface RoleMatrixEntry {
  role: UserRole;
  label: string;
  summary: string;
  capabilities: string[];
}

export interface RolesMatrixResponse {
  roles: RoleMatrixEntry[];
}

export const usersApi = {
  list: (params: UsersListParams = {}, cookieHeader?: string) => {
    const q = new URLSearchParams();
    if (params.search) q.set('search', params.search);
    if (params.role) q.set('role', params.role);
    if (params.active) q.set('active', params.active);
    if (params.page) q.set('page', String(params.page));
    if (params.pageSize) q.set('pageSize', String(params.pageSize));
    return apiFetch<UsersListResponse>(`/api/admin/users${q.toString() ? '?' + q.toString() : ''}`, { cookieHeader });
  },
  get: (id: string, cookieHeader?: string) =>
    apiFetch<UserDetailResponse>(`/api/admin/users/${encodeURIComponent(id)}`, { cookieHeader }),
  events: (id: string, page?: number, cookieHeader?: string) =>
    apiFetch<UserEventsResponse>(
      `/api/admin/users/${encodeURIComponent(id)}/events${page ? `?page=${page}` : ''}`,
      { cookieHeader },
    ),
  create: (body: CreateUserBody) =>
    apiFetch<CreateUserResponse>('/api/admin/users', { method: 'POST', body: JSON.stringify(body) }),
  update: (id: string, body: UpdateUserBody) =>
    apiFetch<ManagedUser>(`/api/admin/users/${encodeURIComponent(id)}`, { method: 'PATCH', body: JSON.stringify(body) }),
  resetPassword: (id: string) =>
    apiFetch<ResetPasswordResponse>(`/api/admin/users/${encodeURIComponent(id)}/reset-password`, { method: 'POST' }),
  unlock: (id: string) =>
    apiFetch<ManagedUser>(`/api/admin/users/${encodeURIComponent(id)}/unlock`, { method: 'POST' }),
  remove: (id: string) =>
    apiFetch<void>(`/api/admin/users/${encodeURIComponent(id)}`, { method: 'DELETE' }),
  rolesMatrix: (cookieHeader?: string) =>
    apiFetch<RolesMatrixResponse>('/api/admin/users/roles/matrix', { cookieHeader }),
};

/** Backend errors are JSON `{ message }` (string or string[] for validation). */
export function usersApiErrorMessage(err: unknown, fallback: string): string {
  if (err instanceof ApiError) {
    if (err.status === 429) return 'Too many requests — try again in a moment.';
    const body = err.body;
    if (body && typeof body === 'object' && 'message' in body) {
      const m = (body as { message?: unknown }).message;
      if (typeof m === 'string' && m) return m;
      if (Array.isArray(m) && m.length > 0) return m.filter((x): x is string => typeof x === 'string').join(', ');
    }
    if (err.status === 403) return 'You do not have permission to do that — super admin only.';
    return err.message;
  }
  return err instanceof Error && err.message ? err.message : fallback;
}

export function isUserLocked(user: Pick<ManagedUser, 'lockedUntil'>): boolean {
  return Boolean(user.lockedUntil && new Date(user.lockedUntil).getTime() > Date.now());
}
