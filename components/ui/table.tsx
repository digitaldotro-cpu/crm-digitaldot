import type { ReactNode } from 'react';

export function Table({ children }: { children: ReactNode }) {
  return <table className="w-full border-separate border-spacing-0 text-left text-sm">{children}</table>;
}

export function Th({ children }: { children: ReactNode }) {
  return <th className="border-b border-line px-3 py-2 text-xs font-semibold uppercase tracking-wide text-muted">{children}</th>;
}

export function Td({ children }: { children: ReactNode }) {
  return <td className="border-b border-line px-3 py-2 align-top text-sm text-foreground">{children}</td>;
}
