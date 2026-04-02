'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import type { ReactNode } from 'react';
import { clsx } from 'clsx';
import { logoutAction } from '@/lib/services/auth-service';

const ITEMS = [
  { href: '/portal', label: 'Overview' }
];

export function PortalShell({ children, companyName, userName }: { children: ReactNode; companyName: string; userName: string }) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-line bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
          <div>
            <p className="text-xs uppercase tracking-wide text-muted">Client Portal</p>
            <p className="text-sm font-semibold text-foreground">{companyName}</p>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm text-muted">{userName}</span>
            <form action={logoutAction}>
              <button className="rounded-md border border-line px-3 py-2 text-sm font-medium">Logout</button>
            </form>
          </div>
        </div>
      </header>

      <div className="mx-auto grid max-w-6xl gap-4 px-4 py-5 md:grid-cols-[220px_1fr]">
        <aside className="rounded-xl border border-line bg-white p-3">
          <nav className="space-y-1">
            {ITEMS.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={clsx(
                  'block rounded-md px-3 py-2 text-sm',
                  pathname === item.href ? 'bg-brand text-white' : 'text-slate-700 hover:bg-slate-100'
                )}
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </aside>
        <main>{children}</main>
      </div>
    </div>
  );
}
