import { requireClientUser } from '@/lib/auth/current-user';
import { prisma } from '@/lib/db/prisma';
import { PortalShell } from '@/components/layout/portal-shell';

export default async function PortalLayout({ children }: { children: React.ReactNode }) {
  const user = await requireClientUser();

  const company = await prisma.company.findUnique({
    where: {
      id: user.clientCompanyId ?? ''
    },
    select: {
      name: true
    }
  });

  return (
    <PortalShell companyName={company?.name ?? 'Client'} userName={user.name}>
      {children}
    </PortalShell>
  );
}
