import React from 'react';
import Link from 'next/link';
import { ambilHasilUjianSiswa } from '@/actions/ujian-siswa';
import { redirect } from 'next/navigation';

export default async function HasilUjianPage({ params }: { params: Promise<{ id: string, sesiId: string }> }) {
  const resolvedParams = await params;
  let hasilData;
  try {
    hasilData = await ambilHasilUjianSiswa(resolvedParams.sesiId);
  } catch (error) {
    redirect('/siswa/ujian');
  }

  if (!hasilData) {
    redirect('/siswa/ujian');
  }

  const { sesi, analisisTopik } = hasilData;

  const isDiskualifikasi = sesi.status === 'DIDISKUALIFIKASI_CURANG';

  return (
    <div className="min-h-screen bg-slate-50 py-10 px-4 md:px-12">
      <div className="max-w-4xl mx-auto space-y-6">
        
        {/* Header Section */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <div className={`p-8 text-white ${isDiskualifikasi ? 'bg-rose-600' : 'bg-indigo-600'}`}>
            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
              <div>
                <div className="flex items-center gap-2 mb-2 opacity-90 text-sm font-medium">
                  <Link href="/siswa/ujian" className="hover:underline flex items-center gap-1">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                    Katalog Ujian
                  </Link>
                  <span>/</span>
                  <span>Rapor Hasil</span>
                </div>
                <h1 className="text-3xl font-extrabold mb-2">{sesi.ujian.judulUjian}</h1>
                <p className="opacity-90">Selesai pada: {new Date(sesi.waktuSelesai || sesi.waktuMulai).toLocaleString('id-ID')}</p>
              </div>
              
              <div className="bg-white/20 p-6 rounded-2xl backdrop-blur-sm text-center min-w-[160px]">
                <div className="text-sm font-medium mb-1 opacity-90">NILAI AKHIR</div>
                <div className="text-5xl font-black">{sesi.nilaiAkhir.toFixed(1)}</div>
              </div>
            </div>
          </div>
          
          <div className="p-8">
            {isDiskualifikasi && (
              <div className="mb-8 p-4 bg-rose-50 border-2 border-rose-200 rounded-xl flex items-start gap-4">
                <div className="p-2 bg-rose-100 rounded-lg text-rose-600 shrink-0">
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-bold text-rose-800 text-lg">Didiskualifikasi Karena Kecurangan</h3>
                  <p className="text-rose-600 font-medium">Sistem mendeteksi {sesi.logPelanggaran.length} pelanggaran protokol keamanan selama ujian berlangsung. Nilai secara otomatis dihanguskan (0).</p>
                </div>
              </div>
            )}

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl text-center">
                <div className="text-slate-500 text-sm font-medium mb-1">Total Soal</div>
                <div className="text-2xl font-bold text-slate-900">{sesi.totalSoal}</div>
              </div>
              <div className="bg-emerald-50 border border-emerald-100 p-4 rounded-xl text-center">
                <div className="text-emerald-600 text-sm font-medium mb-1">Benar</div>
                <div className="text-2xl font-bold text-emerald-700">
                  {sesi.jumlahBenar}
                </div>
              </div>
              <div className="bg-rose-50 border border-rose-100 p-4 rounded-xl text-center">
                <div className="text-rose-600 text-sm font-medium mb-1">Salah</div>
                <div className="text-2xl font-bold text-rose-700">
                  {sesi.jumlahSalah}
                </div>
              </div>
              <div className="bg-slate-100 border border-slate-200 p-4 rounded-xl text-center">
                <div className="text-slate-600 text-sm font-medium mb-1">Kosong</div>
                <div className="text-2xl font-bold text-slate-700">
                  {sesi.totalSoal - sesi.jumlahBenar - sesi.jumlahSalah}
                </div>
              </div>
            </div>

            <h3 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
              <svg className="w-5 h-5 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              Analisis Kelemahan Topik
            </h3>
            
            {analisisTopik.length === 0 ? (
              <p className="text-slate-500 italic bg-slate-50 p-4 rounded-lg border border-slate-100">
                Ujian ini tidak memiliki pemetaan topik soal.
              </p>
            ) : (
              <div className="space-y-4">
                {analisisTopik.map((topik: any, index: number) => {
                  let colorClass = 'bg-indigo-600';
                  if (topik.persentase >= 80) colorClass = 'bg-emerald-500';
                  else if (topik.persentase < 50) colorClass = 'bg-rose-500';
                  else colorClass = 'bg-amber-500';

                  return (
                    <div key={index} className="bg-white border border-slate-200 p-4 rounded-xl">
                      <div className="flex justify-between items-center mb-2">
                        <span className="font-semibold text-slate-800">{topik.topik}</span>
                        <span className="font-bold text-slate-900">{topik.persentase}%</span>
                      </div>
                      <div className="w-full bg-slate-100 rounded-full h-2.5 mb-2 overflow-hidden">
                        <div className={`h-2.5 rounded-full ${colorClass}`} style={{ width: `${topik.persentase}%` }}></div>
                      </div>
                      <div className="text-xs text-slate-500 flex justify-between">
                        <span>{topik.benar} Benar / {topik.total} Total</span>
                        {topik.persentase < 50 && (
                          <span className="text-rose-600 font-medium">Perlu Peningkatan Lanjut</span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
            
            <div className="mt-10 flex justify-center">
              <Link 
                href="/siswa/ujian"
                className="px-8 py-3 bg-slate-900 text-white hover:bg-slate-800 rounded-xl font-bold shadow-sm transition-colors"
              >
                Tutup & Kembali
              </Link>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
