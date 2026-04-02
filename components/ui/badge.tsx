import { clsx } from 'clsx';
import type { ReactNode } from 'react';

export function Badge({ children, tone = 'default' }: { children: ReactNode; tone?: 'default' | 'success' | 'warning' | 'danger' }) {
  return (
    <span
      className={clsx('inline-flex rounded-full px-2.5 py-1 text-xs font-medium', {
        'bg-slate-100 text-slate-700': tone === 'default',
        'bg-emerald-100 text-emerald-700': tone === 'success',
        'bg-amber-100 text-amber-700': tone === 'warning',
        'bg-rose-100 text-rose-700': tone === 'danger'
      })}
    >
      {children}
    </span>
  );
}
