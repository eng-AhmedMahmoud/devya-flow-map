import { Shell } from '@/components/ui/shell';
import { UserCreateForm } from '@/components/users/user-create-form';

export const dynamic = 'force-dynamic';

export default function NewUserPage() {
  return (
    <Shell>
      <UserCreateForm />
    </Shell>
  );
}
