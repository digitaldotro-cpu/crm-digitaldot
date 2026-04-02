import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'CRM Digital Dot',
  description: 'CRM intern + client portal pentru operatiuni agentie.'
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ro">
      <body>{children}</body>
    </html>
  );
}
