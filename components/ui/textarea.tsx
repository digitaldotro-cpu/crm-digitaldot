import type { TextareaHTMLAttributes } from 'react';
import { clsx } from 'clsx';

export function Textarea({ className, ...props }: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      className={clsx(
        'w-full rounded-md border border-line bg-white px-3 py-2 text-sm text-foreground outline-none ring-brand/20 placeholder:text-muted focus:ring-2',
        className
      )}
      {...props}
    />
  );
}
