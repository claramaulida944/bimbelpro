import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Bimbel.',
  description: 'Platform Bimbingan Belajar Modern Berbasis AI',
};

import NextAuthProvider from '@/components/NextAuthProvider';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id">
      <body>
        <NextAuthProvider>
          {children}
        </NextAuthProvider>
      </body>
    </html>
  );
}
