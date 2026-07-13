'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState, useTransition } from 'react';
import {
  BookOpen,
  ExternalLink,
  History,
  Loader2,
  LogOut,
  Network,
  Rocket,
  Sparkles,
  UserCog,
} from 'lucide-react';
import { DevyaLogo } from './devya-logo';
import { api, type AdminRole, type AdminUser } from '@/lib/api';
import { cn } from '@/lib/utils';

// Business operations dashboard (bookings/clients/cms/contracts/invoices) lives
// on its own subdomain — this system dashboard only carries infra/monitoring.
const BUSINESS_ADMIN_URL =
  process.env.NEXT_PUBLIC_ADMIN_URL ?? 'https://admin.devya-solutions.com';

interface NavItem {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  exact?: boolean;
  superAdminOnly?: boolean;
}

const NAV: NavItem[] = [
  { href: '/', label: 'Ask Devya', icon: Sparkles, exact: true },
  { href: '/map', label: 'System Map', icon: Network },
  { href: '/users', label: 'Users', icon: UserCog },
  { href: '/deployments', label: 'Deployments', icon: Rocket },
  { href: '/activity', label: 'Activity', icon: History, superAdminOnly: true },
  { href: '/docs', label: 'Process Docs', icon: BookOpen },
];

// Cached across navigations — the sidebar only needs the role once per session.
let mePromise: Promise<{ user: AdminUser }> | null = null;

function useCurrentRole(): AdminRole | null {
  const [role, setRole] = useState<AdminRole | null>(null);
  useEffect(() => {
    let cancelled = false;
    mePromise ??= api.me();
    mePromise
      .then((res) => {
        if (!cancelled) setRole(res.user.role);
      })
      .catch(() => {
        mePromise = null;
      });
    return () => {
      cancelled = true;
    };
  }, []);
  return role;
}

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [pending, start] = useTransition();
  const role = useCurrentRole();

  const nav = NAV.filter((item) => !item.superAdminOnly || role === 'SUPER_ADMIN');

  function handleLogout() {
    start(async () => {
      try {
        await api.logout();
      } catch {
        // ignore — backend may already have cleared the session
      }
      router.push('/login');
      router.refresh();
    });
  }

  const isActive = (item: NavItem) =>
    item.exact ? pathname === item.href : pathname === item.href || pathname.startsWith(item.href + '/');

  return (
    <aside className="hidden lg:flex w-64 shrink-0 flex-col border-r border-white/5 bg-ink-950/60 backdrop-blur-md">
      <div className="px-5 py-5 flex items-center gap-2 border-b border-white/5">
        <DevyaLogo width={96} />
        <span className="inline-flex items-center rounded-full border border-white/10 bg-white/[0.03] px-2 py-0.5 text-[10px] uppercase tracking-wider text-ink-300">
          System
        </span>
      </div>

      <nav className="flex-1 overflow-y-auto px-3 py-5 space-y-6">
        <div>
          <div className="px-2 mb-2 text-[10px] uppercase tracking-wider text-ink-500 font-medium">
            Monitoring
          </div>
          <ul className="space-y-0.5">
            {nav.map((item) => (
              <NavLink key={item.href} item={item} active={isActive(item)} />
            ))}
          </ul>
        </div>

        <div>
          <div className="px-2 mb-2 text-[10px] uppercase tracking-wider text-ink-500 font-medium">
            Elsewhere
          </div>
          <ul className="space-y-0.5">
            <li>
              <a
                href={BUSINESS_ADMIN_URL}
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-between gap-2.5 rounded-md px-2.5 py-2 text-sm text-ink-200 hover:text-white hover:bg-white/[0.03] border border-transparent transition-colors ring-focus group"
              >
                <span className="flex items-center gap-2.5 min-w-0">
                  <ExternalLink className="h-4 w-4 shrink-0" />
                  <span className="truncate">Business admin</span>
                </span>
                <ExternalLink className="h-3 w-3 text-ink-500 group-hover:text-white shrink-0" />
              </a>
            </li>
          </ul>
        </div>
      </nav>

      <div className="px-3 pb-3 space-y-2">
        <button
          onClick={handleLogout}
          disabled={pending}
          className="w-full inline-flex items-center justify-center gap-2 rounded-md border border-white/10 bg-white/[0.02] px-3 py-2 text-sm text-ink-200 hover:bg-white/5 hover:border-white/20 transition-colors disabled:opacity-60"
        >
          {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : <LogOut className="h-4 w-4" />}
          Sign out
        </button>
      </div>
    </aside>
  );
}

function NavLink({ item, active }: { item: NavItem; active: boolean }) {
  const Icon = item.icon;
  return (
    <li>
      <Link
        href={item.href}
        className={cn(
          'flex items-center gap-2.5 rounded-md px-2.5 py-2 text-sm transition-colors ring-focus',
          active
            ? 'bg-white/[0.06] text-white border border-white/10'
            : 'text-ink-200 hover:text-white hover:bg-white/[0.03] border border-transparent',
        )}
      >
        <Icon className="h-4 w-4 shrink-0" />
        <span className="truncate">{item.label}</span>
      </Link>
    </li>
  );
}
