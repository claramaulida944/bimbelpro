'use client';

import React, { useEffect, useState } from 'react';
import { ambilKatalogUjianSiswa } from '@/actions/ujian-siswa';
import Link from 'next/link';

// Definisikan tipe sesuai struktur Prisma yang dikembalikan
type UjianSiswa = {
  id: string;
  judulUjian: string;
  deskripsi: string | null;
  durasiMenit: number;
  biayaRinCoin: number;
  wajibFullscreen: boolean;
  batasMaksimalPelanggaran: number;
  _count: { bankSoal: number };
  sesiUjianSiswa: Array<{
    id: string;
    nilaiAkhir: number;
    status: string;
  }>;
};

export default function KatalogUjianSiswa() {
  const [daftarUjian, setDaftarUjian] = useState<UjianSiswa[]>([]);
  const [memuat, setMemuat] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const muatData = async () => {
      try {
        const data = await ambilKatalogUjianSiswa();
        setDaftarUjian(data as UjianSiswa[]);
      } catch (err: any) {
        setError(err.message || 'Gagal memuat katalog ujian.');
      } finally {
        setMemuat(false);
      }
    };
    muatData();
  }, []);

  if (memuat) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-50">
        <div className="text-center text-slate-600 font-medium animate-pulse">
          Memuat katalog ujian...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 max-w-4xl mx-auto">
        <div className="bg-red-50 text-red-600 p-4 rounded-xl shadow-sm border border-red-200">
          <p className="font-semibold">Terjadi Kesalahan</p>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 p-6 md:p-12">
      <div className="max-w-6xl mx-auto">
        <header className="mb-10">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Simulasi Ujian Nasional & Kompetensi</h1>
          <p className="text-slate-600">Pilih simulasi ujian yang tersedia untuk mengukur kemampuan Anda secara akurat.</p>
        </header>

        {daftarUjian.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8 text-center text-slate-500">
            Belum ada ujian yang tersedia saat ini.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {daftarUjian.map((ujian) => {
              const sesiTerakhir = ujian.sesiUjianSiswa[0];
              const sudahSelesai = sesiTerakhir && (sesiTerakhir.status === 'SELESAI' || sesiTerakhir.status === 'DIDISKUALIFIKASI_CURANG');
              const isReset = sesiTerakhir && sesiTerakhir.status === 'DIRESET_PENGAJAR';

              return (
                <div key={ujian.id} className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 flex flex-col transition-all hover:shadow-md">
                  <div className="mb-4 flex-grow">
                    <h2 className="text-xl font-bold text-slate-900 mb-2">{ujian.judulUjian}</h2>
                    {ujian.deskripsi && (
                      <p className="text-sm text-slate-600 mb-4 line-clamp-2">{ujian.deskripsi}</p>
                    )}
                    
                    <div className="flex flex-col gap-2 text-sm text-slate-600">
                      <div className="flex items-center gap-2">
                        <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span>{ujian.durasiMenit} Menit</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                        </svg>
                        <span>{ujian._count.bankSoal} Soal</span>
                      </div>
                      {ujian.wajibFullscreen && (
                        <div className="flex items-center gap-2 text-rose-600 mt-1 font-medium">
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                          </svg>
                          <span>Anti-Cheat Ketat Diaktifkan</span>
                        </div>
                      )}
                      {isReset && (
                        <div className="flex items-center gap-2 text-emerald-600 mt-1 font-medium animate-pulse">
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 1121.21 8H18.5" />
                          </svg>
                          <span>Izin Ujian Ulang Aktif</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="pt-4 border-t border-slate-100 flex items-center justify-between mt-auto">
                    <div className="font-semibold text-slate-900">
                      {ujian.biayaRinCoin === 0 ? (
                        <span className="text-emerald-600">Gratis</span>
                      ) : (
                        <span className="flex items-center gap-1 text-amber-500">
                          <span className="text-lg">{ujian.biayaRinCoin}</span> RC
                        </span>
                      )}
                    </div>

                    {isReset ? (
                      <Link 
                        href={`/siswa/ujian/${ujian.id}/instruksi`}
                        className="px-4 py-2 bg-emerald-600 text-white hover:bg-emerald-700 rounded-lg text-sm font-semibold transition-colors shadow-sm"
                      >
                        Ikuti Ulang
                      </Link>
                    ) : sudahSelesai ? (
                      <Link 
                        href={`/siswa/ujian/${ujian.id}/hasil/${sesiTerakhir.id}`}
                        className="px-4 py-2 bg-indigo-50 text-indigo-600 hover:bg-indigo-100 rounded-lg text-sm font-semibold transition-colors"
                      >
                        Lihat Nilai ({sesiTerakhir.nilaiAkhir.toFixed(1)})
                      </Link>
                    ) : (
                      <Link 
                        href={`/siswa/ujian/${ujian.id}/instruksi`}
                        className="px-4 py-2 bg-indigo-600 text-white hover:bg-indigo-700 rounded-lg text-sm font-semibold transition-colors shadow-sm"
                      >
                        Ikuti Ujian
                      </Link>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
