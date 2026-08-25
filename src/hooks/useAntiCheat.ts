'use client';

import { useState, useEffect, useCallback } from 'react';

interface KonfigurasiAntiCheat {
  idSesiUjian: string;
  batasMaksimalPelanggaran: number;
  wajibFullscreen: boolean;
  onPelanggaran: (tipe: string, catatan: string, totalSekarang: number) => void;
  onDiskualifikasi: () => void;
}

export function useAntiCheat({
  idSesiUjian,
  batasMaksimalPelanggaran,
  wajibFullscreen,
  onPelanggaran,
  onDiskualifikasi
}: KonfigurasiAntiCheat) {
  const [jumlahPelanggaran, setJumlahPelanggaran] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [apakahTerkunci, setApakahTerkunci] = useState(false);

  const catatPelanggaran = useCallback(
    (tipe: string, catatan: string) => {
      if (apakahTerkunci) return;
      
      const pelanggaranBaru = jumlahPelanggaran + 1;
      setJumlahPelanggaran(pelanggaranBaru);
      
      onPelanggaran(tipe, catatan, pelanggaranBaru);
      
      if (pelanggaranBaru >= batasMaksimalPelanggaran) {
        setApakahTerkunci(true);
        onDiskualifikasi();
      }
    },
    [jumlahPelanggaran, apakahTerkunci, batasMaksimalPelanggaran, onPelanggaran, onDiskualifikasi]
  );

  const masukFullscreen = async () => {
    try {
      if (document.documentElement.requestFullscreen) {
        await document.documentElement.requestFullscreen();
      }
      setIsFullscreen(true);
    } catch (error) {
      console.error('Gagal masuk mode layar penuh:', error);
    }
  };

  useEffect(() => {
    if (apakahTerkunci) return;

    // 1. Deteksi Pindah Tab
    const tanganiVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        catatPelanggaran('PINDAH_TAB', 'Siswa terdeteksi berpindah tab browser');
      }
    };

    // 2. Deteksi Kehilangan Fokus
    const tanganiBlur = () => {
      catatPelanggaran('LAYAR_TIDAK_FOKUS', 'Jendela ujian kehilangan fokus atau membuka aplikasi lain');
    };

    // 3. Deteksi Keluar Fullscreen
    const tanganiFullscreenChange = () => {
      if (wajibFullscreen && !document.fullscreenElement) {
        setIsFullscreen(false);
        catatPelanggaran('KELUAR_FULLSCREEN', 'Siswa keluar dari mode layar penuh');
      } else {
        setIsFullscreen(!!document.fullscreenElement);
      }
    };

    // 4. Deteksi Klik Kanan
    const tanganiContextMenu = (e: MouseEvent) => {
      e.preventDefault();
      catatPelanggaran('KLIK_KANAN_TERDETEKSI', 'Mencoba membuka menu klik kanan');
    };

    // 5. Deteksi Shortcut DevTools & Inspeksi
    const tanganiKeyDown = (e: KeyboardEvent) => {
      const isF12 = e.key === 'F12';
      const isCtrlShiftI = e.ctrlKey && e.shiftKey && (e.key === 'I' || e.key === 'i');
      const isCtrlShiftJ = e.ctrlKey && e.shiftKey && (e.key === 'J' || e.key === 'j');
      const isCtrlShiftC = e.ctrlKey && e.shiftKey && (e.key === 'C' || e.key === 'c');
      const isCtrlU = e.ctrlKey && (e.key === 'U' || e.key === 'u');
      const isMacCmdOptI = e.metaKey && e.altKey && (e.key === 'I' || e.key === 'i');
      
      if (isF12 || isCtrlShiftI || isCtrlShiftJ || isCtrlShiftC || isCtrlU || isMacCmdOptI) {
        e.preventDefault();
        catatPelanggaran('AKSES_DEVTOOLS', 'Mencoba membuka inspect element / shortcut developer');
      }
    };

    document.addEventListener('visibilitychange', tanganiVisibilityChange);
    window.addEventListener('blur', tanganiBlur);
    document.addEventListener('fullscreenchange', tanganiFullscreenChange);
    document.addEventListener('contextmenu', tanganiContextMenu);
    document.addEventListener('keydown', tanganiKeyDown);

    return () => {
      document.removeEventListener('visibilitychange', tanganiVisibilityChange);
      window.removeEventListener('blur', tanganiBlur);
      document.removeEventListener('fullscreenchange', tanganiFullscreenChange);
      document.removeEventListener('contextmenu', tanganiContextMenu);
      document.removeEventListener('keydown', tanganiKeyDown);
    };
  }, [apakahTerkunci, catatPelanggaran, wajibFullscreen]);

  return { masukFullscreen, jumlahPelanggaran, isFullscreen, apakahTerkunci };
}
