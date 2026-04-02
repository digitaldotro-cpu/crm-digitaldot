import type { SelectHTMLAttributes } from 'react';
import { clsx } from 'clsx';

export function Select({ className, children, ...props }: SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      className={clsx(
        'h-10 w-full rounded-md border border-line bg-white px-3 text-sm text-foreground outline-none ring-brand/20 focus:ring-2',
        className
      )}
      {...props}
    >
      {children}
    </select>
  );
}
