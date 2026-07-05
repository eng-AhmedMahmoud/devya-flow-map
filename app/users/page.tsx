import Link from 'next/link';
import { redirect } from 'next/navigation';
import { headers } from 'next/headers';
import { Plus, ShieldAlert } from 'lucide-react';
import { Shell } from '@/components/ui/shell';
import { PageHeader } from '@/components/ui/page-header';
import { UsersTable } from '@/components/users/users-table';
import { api, ApiError } from '@/lib/api';
import { usersApi, type UserRole, type UsersListResponse } from '@/lib/users-api';

export const dynamic = 'force-dynamic';

const PAGE_SIZE = 20;
const ROLE_SET = new Set(['SUPER_ADMIN', 'ADMIN', 'TEAM', 'SALES_REP', 'SALES_MANAGER']);

interface SearchParams {
  search?: string;
  role?: string;
  active?: string;
  page?: string;
}

export default async function UsersPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const sp = await searchParams;
  const cookieHeader = (await headers()).get('cookie') ?? '';

  const search = sp.search?.trim() ?? '';
  const role = sp.role && ROLE_SET.has(sp.role.toUpperCase()) ? (sp.role.toUpperCase() as UserRole) : undefined;
  const active = sp.active === 'true' || sp.active === 'false' ? sp.active : undefined;
  const page = Math.max(Number(sp.page ?? 1) || 1, 1);

  let data: UsersListResponse | null = null;
  let currentRole: UserRole | null = null;
  try {
    const [list, me] = await Promise.all([
      usersApi.list({ search: search || undefined, role, active, page, pageSize: PAGE_SIZE }, cookieHeader),
      api.me(cookieHeader).catch(() => null),
    ]);
    data = list;
    currentRole = me?.user.role ?? null;
  } catch (err) {
    if (err instanceof ApiError && err.status === 401) redirect('/login?from=/users');
    if (!(err instanceof ApiError && err.status === 403)) throw err;
  }

  return (
    <Shell>
      <PageHeader
        title="Users"
        subtitle="Company staff accounts, roles and access."
        actions={
          data === null ? null : (
            <Link
              href="/users/new"
              className="inline-flex items-center gap-1.5 rounded-md border border-white/10 bg-white px-3.5 py-1.5 text-sm text-ink-900 font-medium hover:bg-ink-100"
            >
              <Plus className="h-4 w-4" />
              New user
            </Link>
          )
        }
      />

      {data === null ? (
        <NoAccess />
      ) : (
        <>
          <UsersTable
            users={data.users}
            total={data.total}
            filters={{ search, role: role ?? '', active: active ?? '' }}
            currentRole={currentRole}
          />
          {data.total > PAGE_SIZE ? (
            <Pagination
              total={data.total}
              page={page}
              pageSize={PAGE_SIZE}
              params={{ search, role: role ?? '', active: active ?? '' }}
            />
          ) : null}
        </>
      )}
    </Shell>
  );
}

function NoAccess() {
  return (
    <div className="surface p-8 flex flex-col items-center text-center gap-3">
      <ShieldAlert className="h-8 w-8 text-amber-400" />
      <div className="text-white font-medium">You don&apos;t have access to user management.</div>
      <p className="text-sm text-ink-400 max-w-md">
        This area is limited to admin accounts. Ask a super admin if you think you should have access.
      </p>
    </div>
  );
}

function Pagination({
  total,
  page,
  pageSize,
  params,
}: {
  total: number;
  page: number;
  pageSize: number;
  params: { search: string; role: string; active: string };
}) {
  const totalPages = Math.max(Math.ceil(total / pageSize), 1);
  const start = (page - 1) * pageSize + 1;
  const end = Math.min(page * pageSize, total);
  const href = (p: number) => {
    const q = new URLSearchParams();
    if (params.search) q.set('search', params.search);
    if (params.role) q.set('role', params.role);
    if (params.active) q.set('active', params.active);
    if (p > 1) q.set('page', String(p));
    return `/users${q.toString() ? `?${q.toString()}` : ''}`;
  };
  return (
    <div className="mt-4 flex items-center justify-between text-xs text-ink-400">
      <span>
        {start}–{end} of {total}
      </span>
      <div className="flex items-center gap-2">
        <a
          href={href(Math.max(page - 1, 1))}
          aria-disabled={page <= 1}
          className={`rounded-md border border-white/10 px-2.5 py-1 ${page <= 1 ? 'opacity-40 pointer-events-none' : 'hover:bg-white/5'}`}
        >
          Previous
        </a>
        <a
          href={href(Math.min(page + 1, totalPages))}
          aria-disabled={page >= totalPages}
          className={`rounded-md border border-white/10 px-2.5 py-1 ${page >= totalPages ? 'opacity-40 pointer-events-none' : 'hover:bg-white/5'}`}
        >
          Next
        </a>
      </div>
    </div>
  );
}
