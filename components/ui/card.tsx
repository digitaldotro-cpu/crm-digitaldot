import type { ReactNode } from 'react';
import { clsx } from 'clsx';

export function Card({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={clsx('rounded-xl border border-line bg-panel p-5 shadow-panel', className)}>{children}</div>;
}
