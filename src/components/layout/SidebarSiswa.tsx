'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { signOut, useSession } from 'next-auth/react';
import { 
  LayoutDashboard, 
  GraduationCap, 
  FileQuestion, 
  Bot, 
  Wallet,
  LogOut,
  User,
  Menu,
  Coins,
  ChevronUp,
  Settings
} from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const navigasiMenu = [
  { nama: 'Dashboard', rute: '/siswa', ikon: LayoutDashboard },
  { nama: 'Kelas Saya', rute: '/siswa/kursus', ikon: GraduationCap },
  { nama: 'Simulasi Ujian CBT', rute: '/siswa/ujian', ikon: FileQuestion },
  { nama: 'AI RinaSensei', rute: '/siswa/rina-sensei', ikon: Bot },
  { nama: 'Dompet RinCoin', rute: '/siswa/dompet', ikon: Wallet },
];

export default function SidebarSiswa() {
  const pathname = usePathname();
  const { data: session } = useSession();
  
  const [apakahTerbuka, setApakahTerbuka] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [popoverBuka, setPopoverBuka] = useState(false);
  
  const sidebarRef = useRef<HTMLElement>(null);
  const popoverRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent | TouchEvent) {
      if (sidebarRef.current && !sidebarRef.current.contains(event.target as Node)) {
        setApakahTerbuka(false);
        setMobileOpen(false);
        setPopoverBuka(false);
      } else if (popoverRef.current && !popoverRef.current.contains(event.target as Node)) {
        // Popover menutup jika yang diklik bukan tombol profil
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('touchstart', handleClickOutside);
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, []);

  const tanganiKlikMenu = () => {
    if (!apakahTerbuka) {
      setApakahTerbuka(true);
    }
  };

  const tanganiKeluar = () => {
    signOut({ callbackUrl: '/masuk' });
  };

  const ambilInisial = (nama?: string | null): string => {
    if (!nama) return 'AD';
    const bagian = nama.trim().split(/\s+/);
    if (bagian.length === 1) return bagian[0].substring(0, 2).toUpperCase();
    return (bagian[0][0] + bagian[bagian.length - 1][0]).toUpperCase();
  };

  const namaPengguna = session?.user?.name || 'Siswa';
  const emailPengguna = session?.user?.email || '-';
  const inisialPengguna = ambilInisial(namaPengguna);
  const fotoProfil = session?.user?.image;

  return (
    <>
      <button 
        onClick={() => setMobileOpen(true)}
        className="md:hidden fixed top-4 left-4 z-40 p-2 bg-white rounded-lg shadow-sm border border-slate-200 text-slate-700"
        aria-label="Buka Menu"
      >
        <Menu size={24} />
      </button>

      {mobileOpen && (
        <div className="md:hidden fixed inset-0 bg-slate-900/20 z-40" aria-hidden="true" onClick={() => { setMobileOpen(false); setPopoverBuka(false); }} />
      )}

      <aside 
        ref={sidebarRef}
        className={cn(
          "fixed top-0 left-0 h-screen bg-white border-r border-slate-200 z-50 flex flex-col transition-all duration-300 ease-in-out",
          mobileOpen ? "translate-x-0 w-64" : "-translate-x-full md:translate-x-0",
          apakahTerbuka ? "md:w-64" : "md:w-20"
        )}
      >
        <div 
          className={cn(
            "h-16 flex items-center border-b border-slate-200 transition-all duration-300",
            apakahTerbuka || mobileOpen ? "px-6 justify-start" : "justify-center"
          )}
        >
          {apakahTerbuka || mobileOpen ? (
            <h1 className="text-2xl font-bold text-indigo-600 tracking-tight whitespace-nowrap">
              Bimbel<span className="text-emerald-500">Pro</span>
            </h1>
          ) : (
            <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white font-bold text-xl cursor-pointer" onClick={() => setApakahTerbuka(true)}>
              B<span className="text-emerald-400">P</span>
            </div>
          )}
        </div>
        
        <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-2 no-scrollbar">
          {navigasiMenu.map((item) => {
            const Ikon = item.ikon;
            const aktif = pathname === item.rute || (pathname.startsWith(`${item.rute}/`) && item.rute !== '/siswa');
            
            return (
              <Link
                key={item.rute}
                href={item.rute}
                onClick={tanganiKlikMenu}
                title={!apakahTerbuka && !mobileOpen ? item.nama : undefined}
                className={cn(
                  'flex items-center rounded-xl transition-all duration-300 text-sm font-medium',
                  apakahTerbuka || mobileOpen ? 'px-3 py-3 space-x-3' : 'justify-center p-3',
                  aktif 
                    ? 'bg-indigo-50 text-indigo-600 border border-indigo-600 shadow-sm' 
                    : 'text-slate-700 hover:bg-slate-50 hover:text-indigo-600 border border-transparent'
                )}
              >
                <Ikon size={22} className={cn('flex-shrink-0', aktif ? 'text-indigo-600' : 'text-slate-500')} />
                <span 
                  className={cn(
                    "whitespace-nowrap overflow-hidden transition-all duration-300",
                    apakahTerbuka || mobileOpen ? "opacity-100 max-w-full" : "opacity-0 max-w-0 hidden"
                  )}
                >
                  {item.nama}
                </span>
              </Link>
            );
          })}
        </nav>
        
        {/* Footer dengan Popover Interaktif */}
        <div className="relative p-3 border-t border-slate-200 bg-slate-50">
          
          {/* Popover Menu */}
          {popoverBuka && (
            <div 
              ref={popoverRef}
              className={cn(
                "absolute bottom-full mb-2 bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden transform transition-all z-50",
                apakahTerbuka || mobileOpen ? "left-3 right-3" : "left-16 w-56"
              )}
            >
              <div className="p-4 border-b border-slate-100">
                <p className="text-sm font-bold text-slate-900 truncate">
                  {namaPengguna}
                </p>
                <p className="text-xs text-slate-500 truncate mt-0.5">
                  {emailPengguna}
                </p>
                <span className="inline-block mt-2 px-2.5 py-0.5 bg-emerald-50 text-emerald-700 text-[10px] font-bold rounded-md border border-emerald-100 uppercase tracking-wider">
                  SISWA
                </span>
              </div>
              <div className="p-2 space-y-1">
                <Link
                  href="/siswa/profil"
                  onClick={() => setPopoverBuka(false)}
                  className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 rounded-lg transition-colors"
                >
                  <Settings size={18} className="text-slate-500" />
                  Pengaturan Profil
                </Link>
                <div className="border-t border-slate-100 my-1"></div>
                <button
                  onClick={tanganiKeluar}
                  className="w-full flex items-center gap-2 px-3 py-2 text-sm font-medium text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                >
                  <LogOut size={18} className="text-rose-600" />
                  Keluar Akun
                </button>
              </div>
            </div>
          )}

          {/* Tombol Profil */}
          <button 
            onClick={() => setPopoverBuka(!popoverBuka)}
            className={cn(
              "w-full flex items-center rounded-xl transition-all duration-300 hover:bg-slate-200/50 p-2 border border-transparent",
              popoverBuka && "bg-slate-200/50 border-slate-300",
              apakahTerbuka || mobileOpen ? "justify-between" : "justify-center"
            )}
            title="Profil Pengguna"
          >
            <div className="flex items-center gap-3">
              {fotoProfil ? (
                <img 
                  src={fotoProfil} 
                  alt={namaPengguna} 
                  className="w-10 h-10 rounded-full object-cover border border-emerald-200 flex-shrink-0"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-700 font-bold border border-emerald-200 flex items-center justify-center flex-shrink-0">
                  {inisialPengguna}
                </div>
              )}
              <div 
                className={cn(
                  "flex flex-col text-left whitespace-nowrap overflow-hidden transition-all duration-300",
                  apakahTerbuka || mobileOpen ? "opacity-100 max-w-[120px]" : "opacity-0 max-w-0 hidden"
                )}
              >
                <span className="text-sm font-bold text-slate-900 truncate">
                  {namaPengguna}
                </span>
                <span className="text-xs text-slate-500 truncate">Siswa</span>
              </div>
            </div>
            
            {(apakahTerbuka || mobileOpen) && (
              <ChevronUp 
                size={18} 
                className={cn(
                  "text-slate-400 transition-transform duration-300", 
                  popoverBuka && "rotate-180"
                )} 
              />
            )}
          </button>
        </div>
      </aside>
    </>
  );
}
