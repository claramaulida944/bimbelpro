'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { ambilKatalogUjianSiswa, mulaiSesiUjian } from '@/actions/ujian-siswa';
import Link from 'next/link';

type SesiUjian = {
  id: string;
  status: 'SEDANG_DIKERJAKAN' | 'SELESAI' | 'DIDISKUALIFIKASI_CURANG' | 'DIRESET_PENGAJAR';
  nilaiAkhir: number;
};

type DetailUjian = {
  id: string;
  judulUjian: string;
  deskripsi: string | null;
  durasiMenit: number;
  biayaRinCoin: number;
  wajibFullscreen: boolean;
  batasMaksimalPelanggaran: number;
  _count: { bankSoal: number };
  sesiUjianSiswa: SesiUjian[];
};

export default function InstruksiUjianPage() {
  const params = useParams() as { id: string };
  const router = useRouter();
  const [ujian, setUjian] = useState<DetailUjian | null>(null);
  const [memuat, setMemuat] = useState(true);
  const [error, setError] = useState('');
  const [prosesMulai, setProsesMulai] = useState(false);
  const [errorMulai, setErrorMulai] = useState('');

  useEffect(() => {
    const muatDetail = async () => {
      try {
        const katalog = await ambilKatalogUjianSiswa();
        const dataUjian = katalog.find((u: any) => u.id === params.id);
        
        if (!dataUjian) {
          setError('Ujian tidak ditemukan atau sedang tidak aktif.');
        } else {
          setUjian(dataUjian as DetailUjian);
        }
      } catch (err: any) {
        setError(err.message || 'Gagal memuat detail ujian.');
      } finally {
        setMemuat(false);
      }
    };
    muatDetail();
  }, [params.id]);

  const handleMulaiUjian = async () => {
    if (!ujian) return;
    setProsesMulai(true);
    setErrorMulai('');
    
    try {
      if (ujian.wajibFullscreen) {
        if (document.documentElement.requestFullscreen) {
          await document.documentElement.requestFullscreen();
        }
      }
      
      const { idSesi } = await mulaiSesiUjian(ujian.id);
      router.push(`/siswa/ujian/${ujian.id}/kerjakan?sesi=${idSesi}`);
    } catch (err: any) {
      setErrorMulai(err.message || 'Terjadi kesalahan saat memulai sesi ujian.');
      // Exit fullscreen if failed
      if (document.fullscreenElement) {
        document.exitFullscreen().catch(() => {});
      }
    } finally {
      setProsesMulai(false);
    }
  };

  if (memuat) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-50">
        <div className="text-center text-slate-600 font-medium animate-pulse">
          Mempersiapkan detail ujian...
        </div>
      </div>
    );
  }

  if (error || !ujian) {
    return (
      <div className="min-h-screen bg-slate-50 p-6 md:p-12">
        <div className="max-w-2xl mx-auto bg-white rounded-xl shadow-sm border border-slate-200 p-8 text-center">
          <div className="text-rose-600 mb-4">
            <svg className="w-12 h-12 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-slate-900 mb-2">Kesalahan Akses</h2>
          <p className="text-slate-600 mb-6">{error}</p>
          <Link href="/siswa/ujian" className="px-4 py-2 bg-slate-100 text-slate-700 hover:bg-slate-200 rounded-lg font-medium transition-colors">
            Kembali ke Katalog
          </Link>
        </div>
      </div>
    );
  }

  const sesiTerakhir = ujian.sesiUjianSiswa?.[0];
  const isDiskualifikasi = sesiTerakhir?.status === 'DIDISKUALIFIKASI_CURANG';
  const isReset = sesiTerakhir?.status === 'DIRESET_PENGAJAR';
  const isSelesai = sesiTerakhir?.status === 'SELESAI';

  return (
    <div className="min-h-screen bg-slate-50 p-6 md:p-12">
      <div className="max-w-3xl mx-auto">
        <div className="mb-6">
          <Link href="/siswa/ujian" className="text-slate-500 hover:text-indigo-600 font-medium flex items-center gap-2 text-sm transition-colors">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Kembali ke Katalog
          </Link>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="bg-slate-900 p-8 text-white">
            <h1 className="text-2xl font-bold mb-2">{ujian.judulUjian}</h1>
            <p className="text-slate-300 mb-6">{ujian.deskripsi || 'Tidak ada deskripsi spesifik untuk ujian ini.'}</p>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-slate-800/50 p-3 rounded-lg border border-slate-700/50">
                <div className="text-xs text-slate-400 mb-1">Durasi</div>
                <div className="font-semibold text-lg">{ujian.durasiMenit} Menit</div>
              </div>
              <div className="bg-slate-800/50 p-3 rounded-lg border border-slate-700/50">
                <div className="text-xs text-slate-400 mb-1">Total Soal</div>
                <div className="font-semibold text-lg">{ujian._count.bankSoal} Soal</div>
              </div>
              <div className="bg-slate-800/50 p-3 rounded-lg border border-slate-700/50">
                <div className="text-xs text-slate-400 mb-1">Biaya Pendaftaran</div>
                <div className="font-semibold text-lg">
                  {ujian.biayaRinCoin === 0 ? <span className="text-emerald-400">Gratis</span> : <span className="text-amber-400">{ujian.biayaRinCoin} RC</span>}
                </div>
              </div>
              <div className="bg-slate-800/50 p-3 rounded-lg border border-slate-700/50">
                <div className="text-xs text-slate-400 mb-1">Toleransi</div>
                <div className="font-semibold text-lg">{ujian.batasMaksimalPelanggaran}x</div>
              </div>
            </div>
          </div>

          <div className="p-8">
            <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
              <svg className="w-5 h-5 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              Protokol Keamanan & Anti-Cheat
            </h2>
            
            <div className="bg-rose-50 border border-rose-200 rounded-xl p-5 mb-8">
              <ul className="space-y-3 text-sm text-slate-700">
                <li className="flex items-start gap-3">
                  <svg className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                  <span><strong>Dilarang Keluar Layar Penuh (Fullscreen):</strong> Sistem akan otomatis meminta izin layar penuh. Jika Anda keluar secara sengaja, sistem akan mencatatnya sebagai pelanggaran.</span>
                </li>
                <li className="flex items-start gap-3">
                  <svg className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                  <span><strong>Dilarang Berpindah Tab atau Aplikasi:</strong> Mengganti tab browser atau meminimalkan jendela ujian akan langsung dicatat sebagai pelanggaran keamanan.</span>
                </li>
                <li className="flex items-start gap-3">
                  <svg className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                  <span><strong>Fungsi Browser Dibatasi:</strong> Klik kanan (Context Menu) dan tombol *Developer Tools* (F12, Inspect, dll) dinonaktifkan sepenuhnya.</span>
                </li>
                <li className="flex items-start gap-3">
                  <svg className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                  <span>Jika pelanggaran mencapai <strong>{ujian.batasMaksimalPelanggaran} kali</strong>, ujian Anda akan otomatis <strong>Dihentikan dan Didiskualifikasi</strong>. Nilai akan otomatis menjadi 0.</span>
                </li>
              </ul>
            </div>

            {/* Banners for Retake Authorization */}
            {isDiskualifikasi && (
              <div className="mb-6 p-5 bg-rose-50 border-2 border-rose-200 rounded-xl flex items-start gap-4">
                <div className="p-2 bg-rose-100 rounded-lg text-rose-600 shrink-0">
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-bold text-rose-800 text-base">Sesi Ujian Anda Dihentikan</h3>
                  <p className="text-rose-600 text-sm mt-0.5">Sesi ujian Anda dihentikan karena diskualifikasi protokol keamanan. Silakan hubungi pengajar/admin untuk membuka izin ujian ulang.</p>
                </div>
              </div>
            )}

            {isReset && (
              <div className="mb-6 p-5 bg-emerald-50 border-2 border-emerald-200 rounded-xl flex items-start gap-4">
                <div className="p-2 bg-emerald-100 rounded-lg text-emerald-600 shrink-0">
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-bold text-emerald-800 text-base">Izin Ujian Ulang Aktif</h3>
                  <p className="text-emerald-600 text-sm mt-0.5">Pengajar telah memberikan izin pengerjaan ulang. Anda dapat memulai kembali ujian.</p>
                </div>
              </div>
            )}

            {isSelesai && (
              <div className="mb-6 p-5 bg-slate-50 border border-slate-200 rounded-xl flex items-start gap-4">
                <div className="p-2 bg-slate-200 rounded-lg text-slate-600 shrink-0">
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-bold text-slate-800 text-base">Ujian Telah Selesai</h3>
                  <p className="text-slate-600 text-sm mt-0.5">Anda sudah menuntaskan ujian ini. Nilai Anda telah direkapitulasi secara permanen.</p>
                </div>
              </div>
            )}

            {errorMulai && (
              <div className="mb-6 p-4 bg-rose-50 border border-rose-200 text-rose-600 rounded-xl text-sm font-medium">
                {errorMulai}
              </div>
            )}

            <div className="flex flex-col items-center border-t border-slate-100 pt-8 mt-4">
              <p className="text-sm text-slate-500 mb-4 text-center">
                Dengan menekan tombol di bawah ini, Anda menyetujui pemotongan saldo (jika ada) <br/> dan patuh pada seluruh protokol keamanan ujian.
              </p>
              
              <button
                onClick={handleMulaiUjian}
                disabled={prosesMulai || (isDiskualifikasi && !isReset) || isSelesai}
                className="w-full md:w-auto px-8 py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-lg shadow-sm transition-all disabled:bg-slate-200 disabled:text-slate-400 disabled:border-slate-200 disabled:shadow-none disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {prosesMulai ? (
                  <>
                    <svg className="animate-spin w-5 h-5 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Memproses Sesi...
                  </>
                ) : isReset ? (
                  'Mulai Ujian Ulang'
                ) : (
                  'Mulai Ujian Sekarang'
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
