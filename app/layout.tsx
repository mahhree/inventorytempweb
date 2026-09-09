import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'CardBerry TCG',
  description: 'Graded trading card collection showcase',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-ink-900 text-neutral-100 antialiased">{children}</body>
    </html>
  );
}
