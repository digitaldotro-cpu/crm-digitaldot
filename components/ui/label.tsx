import type { ReactNode } from 'react';

export function Label({ htmlFor, children }: { htmlFor: string; children: ReactNode }) {
  return (
    <label htmlFor={htmlFor} className="mb-1 block text-xs font-semibold uppercase tracking-wide text-muted">
      {children}
    </label>
  );
}
