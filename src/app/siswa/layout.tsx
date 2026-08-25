import { ReactNode } from 'react';
import SidebarSiswa from '@/components/layout/SidebarSiswa';

export const metadata = {
  title: 'Dasbor Siswa - Bimbel Online',
  description: 'Portal Belajar Siswa Bimbel Online',
};

export default function LayoutSiswa({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen bg-slate-50 text-slate-900 font-sans">
      <SidebarSiswa />
      {/* 
        Main content wrapper with responsive left padding.
        pl-28 covers the 5rem width (w-20 -> 80px) plus gap in desktop icon-only mode.
        Sidebar is fixed, so main needs padding to avoid overlap.
        Mobile (md: hidden) just uses regular padding, with pt-16 for the floating menu.
      */}
      <main className="flex-1 min-h-screen transition-all duration-300 ease-in-out p-4 pt-16 md:p-6 md:pl-28 lg:pl-28 min-w-0 overflow-x-hidden">
        <div className="max-w-7xl mx-auto pb-10">
          {children}
        </div>
      </main>
    </div>
  );
}
