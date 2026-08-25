import React from 'react';
import SidebarAdmin from '@/components/layout/SidebarAdmin';

export const metadata = {
  title: 'Dasbor Admin - Bimbel Online',
  description: 'Ruang Kendali Administrator Bimbel Online',
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-slate-50 text-slate-900 font-sans">
      <SidebarAdmin />
      {/* 
        Main content wrapper with responsive left padding.
        pl-24 covers the 5rem width (w-20 -> 80px) plus some gap in desktop icon-only mode.
        Sidebar is absolute/fixed, so main needs padding to avoid overlap.
        Mobile (md: hidden) just uses regular padding, with pt-16 for the floating menu.
      */}
      <main className="flex-1 min-h-screen transition-all duration-300 ease-in-out p-4 pt-16 md:p-6 md:pl-28 lg:pl-28 min-w-0 overflow-x-hidden">
        <div className="max-w-6xl mx-auto pb-10">
          {children}
        </div>
      </main>
    </div>
  );
}
