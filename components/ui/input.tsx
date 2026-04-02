import type { InputHTMLAttributes } from 'react';
import { clsx } from 'clsx';

export function Input({ className, ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={clsx(
        'h-10 w-full rounded-md border border-line bg-white px-3 text-sm text-foreground outline-none ring-brand/20 placeholder:text-muted focus:ring-2',
        className
      )}
      {...props}
    />
  );
}
