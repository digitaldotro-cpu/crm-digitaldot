'use client';

import type { ReactNode } from 'react';
import { usePathname } from 'next/navigation';
import type { SystemRole } from '@prisma/client';
import { Sidebar } from '@/components/layout/sidebar';
import { Topbar } from '@/components/layout/topbar';

export function AppShell({ children, role, name }: { children: ReactNode; role: SystemRole; name: string }) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-background text-foreground lg:flex">
      <Sidebar role={role} pathname={pathname} />
      <div className="flex-1">
        <Topbar name={name} role={role} />
        <main className="mx-auto max-w-7xl p-4 lg:p-6">{children}</main>
      </div>
    </div>
  );
}
