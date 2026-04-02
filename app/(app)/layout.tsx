import { requireInternalUser } from '@/lib/auth/current-user';
import { AppShell } from '@/components/layout/app-shell';

export default async function InternalLayout({ children }: { children: React.ReactNode }) {
  const user = await requireInternalUser();

  return (
    <AppShell role={user.role} name={user.name}>
      {children}
    </AppShell>
  );
}
