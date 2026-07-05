import { appConfig } from './config';

export class ApiError extends Error {
  constructor(public status: number, public body: unknown, message: string) { super(message); }
}

export async function apiFetch<T>(path: string, init?: RequestInit & { cookieHeader?: string }): Promise<T> {
  const { cookieHeader, ...rest } = init ?? {};
  const headers: Record<string, string> = { 'Content-Type': 'application/json', ...(rest.headers as Record<string, string> | undefined) };
  if (cookieHeader) headers['cookie'] = cookieHeader;

  // Server-side calls go DIRECT to the backend (skip the same-origin rewrite to
  // avoid Vercel self-fetch deadlocks). Browser-side calls keep the rewrite so
  // the admin-origin cookie travels with the request.
  const isServer = typeof window === 'undefined';
  const base = isServer ? (process.env.API_PROXY_TARGET ?? 'https://api.devya-solutions.com') : appConfig.apiUrl;

  const res = await fetch(`${base}${path}`, {
    ...rest,
    headers,
    credentials: 'include',
    cache: 'no-store',
  });
  if (!res.ok) {
    let body: unknown = null;
    try { body = await res.json(); } catch {}
    const message = (body && typeof body === 'object' && 'error' in body && typeof (body as { error?: unknown }).error === 'string')
      ? (body as { error: string }).error : `Request failed with ${res.status}`;
    throw new ApiError(res.status, body, message);
  }
  if (res.status === 204) return undefined as T;
  return res.json() as Promise<T>;
}

// Typed surface
export type AdminRole = 'SUPER_ADMIN' | 'ADMIN' | 'TEAM' | 'SALES_REP' | 'SALES_MANAGER';
export interface AdminUser { id: string; email: string; name?: string; role: AdminRole; mustChangePassword?: boolean }
export type BookingImportance = 'LOW' | 'NORMAL' | 'HIGH' | 'CRITICAL';
export type BookingStatus =
  | 'PENDING'
  | 'COUNTER_PROPOSED'
  | 'CONFIRMED'
  | 'COMPLETED'
  | 'DECLINED'
  | 'CANCELLED';

export interface AdminBooking {
  id: string; calendarSlug: string; calendarLabel: string; calendarColor: string;
  clientName: string; clientEmail: string | null; clientPhone: string | null; company: string | null; notes: string | null;
  scheduledAt: string; durationMinutes: number;
  status: BookingStatus;
  importance: BookingImportance;
  importanceNote: string | null;
  googleEventId: string | null;
  acceptedByName: string | null;
  confirmedAt: string | null;
  proposedSlots: Array<{ scheduledAt: string; durationMinutes: number }> | null;
  clientPickUrl: string | null;
  createdAt: string; updatedAt: string;
}
export interface AdminBookingList { items: AdminBooking[]; total: number; limit: number; offset: number }

export type ContractStatus = 'DRAFT' | 'SENT' | 'VIEWED' | 'SIGNED' | 'DECLINED' | 'EXPIRED';

export interface AdminContractListItem {
  id: string;
  templateSlug: string;
  templateName: string;
  lang: 'en' | 'ar';
  title: string;
  clientName: string;
  clientEmail: string;
  clientCompany: string | null;
  status: ContractStatus;
  sentAt: string | null;
  firstViewedAt: string | null;
  lastViewedAt: string | null;
  signedAt: string | null;
  declinedAt: string | null;
  reminderCount: number;
  lastReminderAt: string | null;
  createdAt: string;
  updatedAt: string;
  pdfUrl: string | null;
  signToken: string;
  portalToken: string;
}

export interface AdminContractList {
  items: AdminContractListItem[];
  total: number;
  take: number;
  skip: number;
}

export interface ContractStatsSummary {
  total: number;
  byStatus: Record<ContractStatus, number>;
}

export interface ContractEvent {
  id: string;
  type: 'CREATED' | 'EMAIL_SENT' | 'VIEWED' | 'SIGNED' | 'DECLINED' | 'PDF_GENERATED' | 'DOWNLOADED' | 'REMINDER_SENT';
  meta: Record<string, unknown> | null;
  ip: string | null;
  userAgent: string | null;
  createdAt: string;
}

export interface ContractSignatureRecord {
  id: string;
  signerName: string;
  signerEmail: string;
  typedName: string | null;
  signatureSvg: string | null;
  vendorPayload: Record<string, unknown> | null;
  ip: string | null;
  userAgent: string | null;
  signedAt: string;
}

export interface AdminContractDetail extends AdminContractListItem {
  declineReason: string | null;
  expiresAt: string | null;
  valuesJson: Record<string, string>;
  vendorProvider: string | null;
  vendorDocumentId: string | null;
  vendorRecipientId: string | null;
  vendorSignUrl: string | null;
  vendorAuditUrl: string | null;
  signatures: ContractSignatureRecord[];
  events: ContractEvent[];
}

export const api = {
  me: (cookieHeader?: string) => apiFetch<{ user: AdminUser }>('/api/auth/me', { cookieHeader }),
  login: (email: string, password: string) =>
    apiFetch<{ user: AdminUser }>('/api/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) }),
  logout: () => apiFetch<void>('/api/auth/logout', { method: 'POST' }),
  forgotPassword: (email: string) =>
    apiFetch<{ ok: true }>('/api/auth/forgot-password', { method: 'POST', body: JSON.stringify({ email }) }),
  resetPassword: (token: string, newPassword: string) =>
    apiFetch<{ ok: true }>('/api/auth/reset-password', { method: 'POST', body: JSON.stringify({ token, newPassword }) }),
  changePassword: (currentPassword: string, newPassword: string) =>
    apiFetch<{ ok: true }>('/api/auth/change-password', { method: 'POST', body: JSON.stringify({ currentPassword, newPassword }) }),
  bookings: (params: { status?: string; calendarSlug?: string; search?: string; importance?: string; limit?: number; offset?: number } = {}, cookieHeader?: string) => {
    const q = new URLSearchParams();
    if (params.status) q.set('status', params.status);
    if (params.calendarSlug) q.set('calendarSlug', params.calendarSlug);
    if (params.search) q.set('search', params.search);
    if (params.importance) q.set('importance', params.importance);
    if (params.limit) q.set('limit', String(params.limit));
    if (params.offset) q.set('offset', String(params.offset));
    return apiFetch<AdminBookingList>(`/api/admin/bookings${q.toString() ? '?' + q.toString() : ''}`, { cookieHeader });
  },
  updateBooking: (
    id: string,
    body: {
      status?: AdminBooking['status'];
      notes?: string;
      importance?: BookingImportance;
      importanceNote?: string;
      /** User IDs to CC on confirmation email + add as Google Meet attendees. */
      notifyUserIds?: string[];
    },
  ) =>
    apiFetch<{ booking: AdminBooking }>(`/api/admin/bookings/${id}`, { method: 'PATCH', body: JSON.stringify(body) }),
  /**
   * Propose one or more alternative meeting times to the client and email them a
   * pick link. Moves the booking to COUNTER_PROPOSED. `acceptedByName` is the team
   * member who will own the resulting Meeting task once the client picks a slot.
   */
  counterProposeBooking: (
    id: string,
    body: {
      slots: Array<{ date: string; time: string; durationMinutes?: number }>;
      note?: string;
      acceptedByName: string;
    },
  ) =>
    apiFetch<{ booking: AdminBooking }>(`/api/admin/bookings/${id}/counter-propose`, {
      method: 'POST',
      body: JSON.stringify(body),
    }),
  deleteBooking: (id: string) => apiFetch<void>(`/api/admin/bookings/${id}`, { method: 'DELETE' }),

  contracts: (
    params: { status?: ContractStatus; clientEmail?: string; take?: number; skip?: number } = {},
    cookieHeader?: string,
  ) => {
    const q = new URLSearchParams();
    if (params.status) q.set('status', params.status);
    if (params.clientEmail) q.set('clientEmail', params.clientEmail);
    if (params.take) q.set('take', String(params.take));
    if (params.skip) q.set('skip', String(params.skip));
    return apiFetch<AdminContractList>(
      `/api/admin/contracts${q.toString() ? '?' + q.toString() : ''}`,
      { cookieHeader },
    );
  },
  contractStats: (cookieHeader?: string) =>
    apiFetch<ContractStatsSummary>('/api/admin/contracts/stats/summary', { cookieHeader }),
  contract: (id: string, cookieHeader?: string) =>
    apiFetch<AdminContractDetail>(`/api/admin/contracts/${encodeURIComponent(id)}`, { cookieHeader }),
  sendContract: (id: string) =>
    apiFetch<{ id: string }>(`/api/admin/contracts/${encodeURIComponent(id)}/send`, { method: 'POST' }),
  resendContract: (id: string) =>
    apiFetch<{ id: string }>(`/api/admin/contracts/${encodeURIComponent(id)}/resend`, { method: 'POST' }),
};
