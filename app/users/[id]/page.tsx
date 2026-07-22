import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { headers } from 'next/headers';
import { ArrowLeft, ShieldAlert } from 'lucide-react';
import { Shell } from '@/components/ui/shell';
import { PageHeader } from '@/components/ui/page-header';
import { UserDetail } from '@/components/users/user-detail';
import { RoleBadge, UserStatusBadge } from '@/components/users/user-badges';
import { ApiError } from '@/lib/api';
import { usersApi, type AppRegistryEntry, type UserDetailResponse } from '@/lib/users-api';

export const dynamic = 'force-dynamic';

export default async function UserDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const cookieHeader = (await headers()).get('cookie') ?? '';

  let data: UserDetailResponse | null = null;
  let apps: AppRegistryEntry[] = [];
  try {
    const [detail, registry] = await Promise.all([
      usersApi.get(id, cookieHeader),
      usersApi.appsRegistry(cookieHeader),
    ]);
    data = detail;
    apps = registry.apps;
  } catch (err) {
    if (err instanceof ApiError && err.status === 401) redirect(`/login?from=/users/${id}`);
    if (err instanceof ApiError && err.status === 404) notFound();
    if (!(err instanceof ApiError && err.status === 403)) throw err;
  }

  return (
    <Shell>
      <div className="mb-4">
        <Link href="/users" className="inline-flex items-center gap-1.5 text-xs text-ink-400 hover:text-white">
          <ArrowLeft className="h-3.5 w-3.5" />
          All users
        </Link>
      </div>

      {data === null ? (
        <div className="surface p-8 flex flex-col items-center text-center gap-3">
          <ShieldAlert className="h-8 w-8 text-amber-400" />
          <div className="text-white font-medium">You don&apos;t have access to user management.</div>
          <p className="text-sm text-ink-400 max-w-md">
            This area is limited to admin accounts. Ask a super admin if you think you should have access.
          </p>
        </div>
      ) : (
        <>
          <PageHeader
            title={data.user.name}
            subtitle={data.user.email}
            actions={
              <div className="flex items-center gap-2">
                <RoleBadge role={data.user.role} />
                <UserStatusBadge user={data.user} />
              </div>
            }
          />
          <UserDetail
            key={`${data.user.id}-${data.user.updatedAt}`}
            user={data.user}
            recentEvents={data.recentEvents}
            apps={apps}
          />
        </>
      )}
    </Shell>
  );
}
