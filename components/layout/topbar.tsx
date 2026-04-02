import { logoutAction } from '@/lib/services/auth-service';
import type { SystemRole } from '@prisma/client';

export function Topbar({ name, role }: { name: string; role: SystemRole }) {
  return (
    <header className="sticky top-0 z-20 border-b border-line bg-white/95 px-4 py-3 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between">
        <div>
          <p className="text-sm font-semibold text-foreground">{name}</p>
          <p className="text-xs uppercase tracking-wide text-muted">{role.replace('_', ' ')}</p>
        </div>

        <form action={logoutAction}>
          <button
            type="submit"
            className="rounded-md border border-line px-3 py-2 text-sm font-medium text-foreground hover:bg-background"
          >
            Logout
          </button>
        </form>
      </div>
    </header>
  );
}
