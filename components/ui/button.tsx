import type { ButtonHTMLAttributes } from 'react';
import { clsx } from 'clsx';

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';

const variantMap: Record<ButtonVariant, string> = {
  primary: 'bg-brand text-white hover:bg-brand-dark',
  secondary: 'bg-panel border border-line text-foreground hover:bg-background',
  ghost: 'text-foreground hover:bg-background',
  danger: 'bg-danger text-white hover:opacity-90'
};

export function Button({
  className,
  children,
  variant = 'primary',
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: ButtonVariant }) {
  return (
    <button
      className={clsx(
        'inline-flex h-10 items-center justify-center rounded-md px-4 text-sm font-medium transition focus:outline-none focus:ring-2 focus:ring-brand/40 disabled:cursor-not-allowed disabled:opacity-60',
        variantMap[variant],
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}
