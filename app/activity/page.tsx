import { redirect } from 'next/navigation';
import { headers } from 'next/headers';
import { ShieldAlert } from 'lucide-react';
import { Shell } from '@/components/ui/shell';
import { PageHeader } from '@/components/ui/page-header';
import { ActivityTable } from '@/components/activity/activity-table';
import { api, ApiError } from '@/lib/api';
import { activityApi, type ActivityAction, type ActivityListResponse } from '@/lib/activity-api';

export const dynamic = 'force-dynamic';

const PAGE_SIZE = 50;
const ACTION_SET = new Set(['CREATE', 'UPDATE', 'DELETE', 'ACTION', 'BULK']);

interface SearchParams {
  resource?: string;
  action?: string;
  from?: string;
  to?: string;
  page?: string;
}

export default async function ActivityPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const sp = await searchParams;
  const cookieHeader = (await headers()).get('cookie') ?? '';

  let me;
  try {
    me = await api.me(cookieHeader);
  } catch (err) {
    if (err instanceof ApiError && (err.status === 401 || err.status === 403)) {
      redirect('/login?from=/activity');
    }
    throw err;
  }

  if (me.user.role !== 'SUPER_ADMIN') {
    return (
      <Shell>
        <PageHeader title="Activity" subtitle="Audit log of every admin mutation." />
        <NoAccess />
      </Shell>
    );
  }

  const resource = sp.resource?.trim() || undefined;
  const action =
    sp.action && ACTION_SET.has(sp.action.toUpperCase()) ? (sp.action.toUpperCase() as ActivityAction) : undefined;
  const from = sp.from?.trim() || undefined;
  const to = sp.to?.trim() || undefined;
  const page = Math.max(Number(sp.page ?? 1) || 1, 1);

  let data: ActivityListResponse | null = null;
  try {
    data = await activityApi.list({ resource, action, from, to, page, pageSize: PAGE_SIZE }, cookieHeader);
  } catch (err) {
    if (err instanceof ApiError && err.status === 401) redirect('/login?from=/activity');
    if (!(err instanceof ApiError && err.status === 403)) throw err;
  }

  return (
    <Shell>
      <PageHeader title="Activity" subtitle="Audit log of every admin mutation — expand a row to inspect the diff." />

      {data === null ? (
        <NoAccess />
      ) : (
        <>
          <ActivityTable
            items={data.items}
            total={data.total}
            filters={{ resource: resource ?? '', action: action ?? '', from: from ?? '', to: to ?? '' }}
          />
          {data.total > PAGE_SIZE ? (
            <Pagination
              total={data.total}
              page={page}
              pageSize={PAGE_SIZE}
              params={{ resource: resource ?? '', action: action ?? '', from: from ?? '', to: to ?? '' }}
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
      <div className="text-white font-medium">Activity is limited to super admins.</div>
      <p className="text-sm text-ink-400 max-w-md">
        The audit log exposes before/after snapshots of every mutation, so only super admin accounts can view it.
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
  params: { resource: string; action: string; from: string; to: string };
}) {
  const totalPages = Math.max(Math.ceil(total / pageSize), 1);
  const start = (page - 1) * pageSize + 1;
  const end = Math.min(page * pageSize, total);
  const href = (p: number) => {
    const qp = new URLSearchParams();
    if (params.resource) qp.set('resource', params.resource);
    if (params.action) qp.set('action', params.action);
    if (params.from) qp.set('from', params.from);
    if (params.to) qp.set('to', params.to);
    if (p > 1) qp.set('page', String(p));
    return `/activity${qp.toString() ? `?${qp.toString()}` : ''}`;
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
