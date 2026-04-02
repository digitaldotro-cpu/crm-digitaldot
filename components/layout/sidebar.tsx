import Link from 'next/link';
import { Home, Users, FolderKanban, ListTodo, Clock3, Wallet, UserRoundSearch, Laptop, Percent, KeyRound, FileStack, BookOpenText, ShieldAlert } from 'lucide-react';
import type { SystemRole } from '@prisma/client';
import { clsx } from 'clsx';

type NavItem = {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  roles?: SystemRole[];
};

const NAV_ITEMS: NavItem[] = [
  { href: '/dashboard', label: 'Dashboard', icon: Home },
  { href: '/clients', label: 'Clienti', icon: Users },
  { href: '/projects', label: 'Proiecte', icon: FolderKanban },
  { href: '/tasks', label: 'Taskuri', icon: ListTodo },
  { href: '/time', label: 'Time Tracking', icon: Clock3 },
  { href: '/finance', label: 'Financiar', icon: Wallet, roles: ['ADMIN', 'FINANCE'] },
  { href: '/leads', label: 'Leaduri', icon: UserRoundSearch },
  { href: '/assets', label: 'Echipamente', icon: Laptop },
  { href: '/commissions', label: 'Comisioane', icon: Percent },
  { href: '/secrets', label: 'Secrets Vault', icon: KeyRound, roles: ['ADMIN', 'PROJECT_MANAGER'] },
  { href: '/documents/templates', label: 'Template-uri', icon: FileStack, roles: ['ADMIN', 'PROJECT_MANAGER'] },
  { href: '/documents/instances', label: 'Documente', icon: FileStack },
  { href: '/knowledge', label: 'Knowledge Base', icon: BookOpenText },
  { href: '/audit', label: 'Audit', icon: ShieldAlert, roles: ['ADMIN'] }
];

export function Sidebar({ role, pathname }: { role: SystemRole; pathname: string }) {
  const entries = NAV_ITEMS.filter((item) => !item.roles || item.roles.includes(role));

  return (
    <aside className="hidden w-72 shrink-0 border-r border-line bg-white px-4 py-5 lg:block">
      <div className="mb-6 rounded-xl bg-brand-soft p-4">
        <p className="text-xs font-semibold uppercase tracking-wide text-brand-dark">CRM Digital Dot</p>
        <h1 className="mt-1 text-lg font-bold text-brand-dark">Operations Console</h1>
      </div>

      <nav className="space-y-1">
        {entries.map((item) => {
          const Icon = item.icon;
          const active = pathname === item.href || pathname.startsWith(`${item.href}/`);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={clsx(
                'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition',
                active ? 'bg-brand text-white' : 'text-slate-700 hover:bg-slate-100'
              )}
            >
              <Icon className="h-4 w-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
