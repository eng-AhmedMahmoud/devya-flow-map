import { isUserLocked, type AuthEventType, type ManagedUser, type UserRole } from '@/lib/users-api';

export const ROLE_META: Record<UserRole, { label: string; color: string }> = {
  SUPER_ADMIN: { label: 'Super admin', color: '#F97316' },
  ADMIN: { label: 'Admin', color: '#3B82F6' },
  TEAM: { label: 'Team', color: '#A3A3A3' },
  SALES_REP: { label: 'Sales rep', color: '#F59E0B' },
  SALES_MANAGER: { label: 'Sales manager', color: '#10B981' },
};

export const EVENT_META: Record<AuthEventType, { label: string; color: string }> = {
  LOGIN_SUCCESS: { label: 'Login', color: '#10B981' },
  LOGIN_FAILED: { label: 'Login failed', color: '#F59E0B' },
  LOGOUT: { label: 'Logout', color: '#A3A3A3' },
  ACCOUNT_LOCKED: { label: 'Account locked', color: '#EF4444' },
  ACCOUNT_UNLOCKED: { label: 'Account unlocked', color: '#10B981' },
  PASSWORD_CHANGED: { label: 'Password changed', color: '#3B82F6' },
  PASSWORD_RESET_REQUESTED: { label: 'Reset requested', color: '#F59E0B' },
  PASSWORD_RESET_COMPLETED: { label: 'Reset completed', color: '#10B981' },
  USER_CREATED: { label: 'User created', color: '#3B82F6' },
  USER_UPDATED: { label: 'User updated', color: '#3B82F6' },
  ROLE_CHANGED: { label: 'Role changed', color: '#F97316' },
  USER_DEACTIVATED: { label: 'Deactivated', color: '#EF4444' },
  USER_REACTIVATED: { label: 'Reactivated', color: '#10B981' },
};

function Pill({ label, color }: { label: string; color: string }) {
  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[11px] font-medium"
      style={{ color, background: `${color}1A`, border: `1px solid ${color}33` }}
    >
      <span className="h-1.5 w-1.5 rounded-full" style={{ background: color }} />
      {label}
    </span>
  );
}

export function RoleBadge({ role }: { role: UserRole }) {
  const meta = ROLE_META[role];
  return <Pill label={meta.label} color={meta.color} />;
}

export function UserStatusBadge({ user }: { user: Pick<ManagedUser, 'isActive' | 'lockedUntil'> }) {
  if (isUserLocked(user)) return <Pill label="Locked" color="#EF4444" />;
  if (user.isActive) return <Pill label="Active" color="#10B981" />;
  return <Pill label="Inactive" color="#A3A3A3" />;
}

export function EventBadge({ type }: { type: AuthEventType }) {
  const meta = EVENT_META[type] ?? { label: type, color: '#A3A3A3' };
  return <Pill label={meta.label} color={meta.color} />;
}

export function relativeTime(iso: string | null | undefined): string {
  if (!iso) return 'Never';
  const then = new Date(iso).getTime();
  if (Number.isNaN(then)) return '—';
  const diff = Date.now() - then;
  const future = diff < 0;
  const sec = Math.round(Math.abs(diff) / 1000);
  let text: string;
  if (sec < 45) return future ? 'in a moment' : 'just now';
  const min = Math.round(sec / 60);
  const hr = Math.round(min / 60);
  const day = Math.round(hr / 24);
  const mo = Math.round(day / 30);
  if (min < 60) text = `${min}m`;
  else if (hr < 24) text = `${hr}h`;
  else if (day < 30) text = `${day}d`;
  else if (mo < 12) text = `${mo}mo`;
  else text = `${Math.round(mo / 12)}y`;
  return future ? `in ${text}` : `${text} ago`;
}
