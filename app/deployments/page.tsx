import { redirect } from 'next/navigation';
import { headers } from 'next/headers';
import { ShieldAlert } from 'lucide-react';
import { Shell } from '@/components/ui/shell';
import { PageHeader } from '@/components/ui/page-header';
import { DeploymentsDashboard } from '@/components/ops/deployments-dashboard';
import { api, ApiError } from '@/lib/api';
import { opsApi, type AppStatus } from '@/lib/ops-api';

export const dynamic = 'force-dynamic';

export default async function DeploymentsPage() {
  const cookieHeader = (await headers()).get('cookie') ?? undefined;

  let initial: AppStatus[] | null = null;
  let isSuperAdmin = false;
  try {
    const [status, me] = await Promise.all([
      opsApi.getStatus(cookieHeader),
      api.me(cookieHeader),
    ]);
    initial = status;
    isSuperAdmin = me.user.role === 'SUPER_ADMIN';
  } catch (err) {
    if (err instanceof ApiError && err.status === 401) redirect('/login?from=/deployments');
    if (!(err instanceof ApiError && err.status === 403)) throw err;
  }

  return (
    <Shell>
      <PageHeader
        title="Deployments"
        subtitle="Live status & deploy controls for every Devya app"
      />

      {initial === null ? (
        <NoAccess />
      ) : (
        <DeploymentsDashboard initial={initial} isSuperAdmin={isSuperAdmin} />
      )}
    </Shell>
  );
}

function NoAccess() {
  return (
    <div className="surface p-8 flex flex-col items-center text-center gap-3">
      <ShieldAlert className="h-8 w-8 text-amber-400" />
      <div className="text-white font-medium">You don&apos;t have access to deployments.</div>
      <p className="text-sm text-ink-400 max-w-md">
        This area is limited to admin accounts. Ask a super admin if you think you should have access.
      </p>
    </div>
  );
}
