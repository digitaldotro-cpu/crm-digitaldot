import type { ReactNode } from 'react';
import { Card } from '@/components/ui/card';

export function StatCard({ label, value, helper }: { label: string; value: ReactNode; helper?: string }) {
  return (
    <Card>
      <p className="text-xs uppercase tracking-wide text-muted">{label}</p>
      <p className="mt-2 text-2xl font-bold text-foreground">{value}</p>
      {helper ? <p className="mt-1 text-xs text-muted">{helper}</p> : null}
    </Card>
  );
}
