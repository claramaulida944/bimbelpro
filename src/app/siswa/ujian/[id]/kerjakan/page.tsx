'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter, useSearchParams, useParams } from 'next/navigation';
import { mulaiSesiUjian, catatPelanggaranSiswa, kumpulkanJawabanUjian } from '@/actions/ujian-siswa';
import { useAntiCheat } from '@/hooks/useAntiCheat';

type BankSoal = {
  id: string;
  teksSoal: string;
  pilihanJawaban: any;
  labelTopik: string | null;
};

type UjianData = {
  idSesi: string;
  sisaWaktuDetik: number;
  bankSoal: BankSoal[];
};

export default function RuangUjianCBT() {
  const params = useParams() as { id: string };
  const router = useRouter();
  const searchParams = useSearchParams();
  const sesiParam = searchParams.get('sesi');
  
  const [dataUjian, setDataUjian] = useState<UjianData | null>(null);
  const [soalAktifIndex, setSoalAktifIndex] = useState(0);
  const [jawabanSiswa, setJawabanSiswa] = useState<Record<string, string>>({});
  const [raguRagu, setRaguRagu] = useState<Record<string, boolean>>({});
  const [sisaDetik, setSisaDetik] = useState(0);
  
  const [memuat, setMemuat] = useState(true);
  const [error, setError] = useState('');
  
  // Modals state
  const [tampilModalPeringatan, setTampilModalPeringatan] = useState(false);
  const [pesanPeringatan, setPesanPeringatan] = useState('');
  const [tampilModalKonfirmasi, setTampilModalKonfirmasi] = useState(false);
  const [tampilModalDiskualifikasi, setTampilModalDiskualifikasi] = useState(false);
  const [sedangKumpul, setSedangKumpul] = useState(false);
  
  // Reference for timer interval
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Load Data
  useEffect(() => {
    const init = async () => {
      try {
        const data = await mulaiSesiUjian(params.id);
        setDataUjian(data);
        setSisaDetik(data.sisaWaktuDetik);
        
        // Coba load state dari localStorage
        const savedState = localStorage.getItem(`ujian_bimbel_${data.idSesi}`);
        if (savedState) {
          const parsed = JSON.parse(savedState);
          if (parsed.jawaban) setJawabanSiswa(parsed.jawaban);
          if (parsed.raguRagu) setRaguRagu(parsed.raguRagu);
        }
      } catch (err: any) {
        setError(err.message || 'Gagal menyiapkan ruang ujian.');
      } finally {
        setMemuat(false);
      }
    };
    init();
  }, [params.id]);

  // Sync to Local Storage
  useEffect(() => {
    if (dataUjian) {
      localStorage.setItem(`ujian_bimbel_${dataUjian.idSesi}`, JSON.stringify({
        jawaban: jawabanSiswa,
        raguRagu: raguRagu
      }));
    }
  }, [jawabanSiswa, raguRagu, dataUjian]);

  // Timer Countdown
  useEffect(() => {
    if (!memuat && dataUjian && sisaDetik > 0 && !tampilModalDiskualifikasi) {
      timerRef.current = setInterval(() => {
        setSisaDetik((prev) => {
          if (prev <= 1) {
            clearInterval(timerRef.current!);
            handleKumpulOtomatis('Waktu Habis');
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [memuat, dataUjian, tampilModalDiskualifikasi]);

  const handleKumpulOtomatis = async (alasan: string) => {
    if (!dataUjian) return;
    setSedangKumpul(true);
    try {
      await kumpulkanJawabanUjian(dataUjian.idSesi, jawabanSiswa);
      localStorage.removeItem(`ujian_bimbel_${dataUjian.idSesi}`);
      if (document.fullscreenElement) {
        document.exitFullscreen().catch(() => {});
      }
      router.push(`/siswa/ujian/${params.id}/hasil/${dataUjian.idSesi}`);
    } catch (e) {
      console.error('Gagal kumpul otomatis:', e);
      // Fallback
      router.push(`/siswa/ujian`);
    }
  };

  const handleKumpulManual = async () => {
    if (!dataUjian) return;
    setSedangKumpul(true);
    try {
      await kumpulkanJawabanUjian(dataUjian.idSesi, jawabanSiswa);
      localStorage.removeItem(`ujian_bimbel_${dataUjian.idSesi}`);
      if (document.fullscreenElement) {
        document.exitFullscreen().catch(() => {});
      }
      router.push(`/siswa/ujian/${params.id}/hasil/${dataUjian.idSesi}`);
    } catch (e) {
      console.error('Gagal kumpul manual:', e);
      setSedangKumpul(false);
      alert('Gagal mengumpulkan jawaban. Pastikan koneksi stabil.');
    }
  };

  // Setup AntiCheat
  const { jumlahPelanggaran, isFullscreen } = useAntiCheat({
    idSesiUjian: dataUjian?.idSesi || sesiParam || '',
    batasMaksimalPelanggaran: 3, // Idealnya ambil dari data ujian, fallback 3
    wajibFullscreen: true,
    onPelanggaran: async (tipe, catatan, totalSekarang) => {
      if (!dataUjian?.idSesi) return;
      setPesanPeringatan(`Pelanggaran terdeteksi: ${catatan}. (Peringatan ${totalSekarang})`);
      setTampilModalPeringatan(true);
      await catatPelanggaranSiswa(dataUjian.idSesi, tipe as any, catatan);
    },
    onDiskualifikasi: async () => {
      setTampilModalDiskualifikasi(true);
      if (timerRef.current) clearInterval(timerRef.current);
      await handleKumpulOtomatis('Didiskualifikasi');
    }
  });

  if (memuat) {
    return <div className="flex h-screen items-center justify-center bg-slate-50"><div className="animate-pulse font-medium text-slate-600">Menyiapkan Ruang Ujian Lockdown...</div></div>;
  }

  if (error || !dataUjian) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-50 p-6">
        <div className="bg-white p-8 rounded-xl shadow-sm border border-rose-200 text-center max-w-lg">
          <h2 className="text-xl font-bold text-rose-600 mb-2">Akses Ditolak</h2>
          <p className="text-slate-600 mb-6">{error}</p>
          <button onClick={() => router.push('/siswa/ujian')} className="px-4 py-2 bg-slate-100 rounded-lg hover:bg-slate-200">Kembali ke Katalog</button>
        </div>
      </div>
    );
  }

  const soalSekarang = dataUjian.bankSoal[soalAktifIndex];
  const formatWaktu = (detik: number) => {
    const m = Math.floor(detik / 60).toString().padStart(2, '0');
    const s = (detik % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  const isWaktuKritis = sisaDetik < 300; // < 5 menit
  
  const jumlahTerjawab = Object.keys(jawabanSiswa).length;
  const jumlahRagu = Object.values(raguRagu).filter(Boolean).length;
  const jumlahKosong = dataUjian.bankSoal.length - jumlahTerjawab;

  return (
    <div className="fixed inset-0 z-[100] bg-slate-50 flex flex-col w-screen h-screen overflow-hidden select-none animate-in fade-in duration-300">
      {/* Top Bar */}
      <header className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between shrink-0 shadow-sm z-10">
        <div className="font-bold text-slate-900 text-lg flex items-center gap-2">
          <span className="w-2.5 h-2.5 bg-rose-600 rounded-full animate-pulse"></span>
          <span>CBT Lockdown Mode</span>
        </div>
        
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Sisa Waktu</span>
            <div className={`font-mono text-xl font-bold px-3 py-1 rounded-md ${isWaktuKritis ? 'bg-rose-100 text-rose-600 animate-pulse' : 'bg-slate-100 text-slate-700'}`}>
              {formatWaktu(sisaDetik)}
            </div>
          </div>
          
          <div className="flex items-center gap-2 bg-rose-50 px-3 py-1.5 rounded-lg border border-rose-100">
            <span className="text-xs font-medium text-rose-600">Pelanggaran:</span>
            <span className="text-sm font-bold text-rose-700">{jumlahPelanggaran} / {dataUjian?.bankSoal ? 5 : 5}</span>
          </div>
          
          <button 
            onClick={() => setTampilModalKonfirmasi(true)}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-semibold text-sm transition-colors shadow-sm"
          >
            Selesai Ujian
          </button>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Area Soal (Lebar 75%) */}
        <main className="w-full lg:w-3/4 overflow-y-auto p-6 md:p-10 flex flex-col">
          <div className="max-w-4xl mx-auto">
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8 mb-6">
              <div className="flex items-center justify-between mb-6 border-b border-slate-100 pb-4">
                <div className="text-lg font-bold text-slate-900">Soal No. {soalAktifIndex + 1}</div>
                {soalSekarang.labelTopik && (
                  <div className="text-xs font-medium bg-indigo-50 text-indigo-600 px-3 py-1 rounded-full border border-indigo-100">
                    {soalSekarang.labelTopik}
                  </div>
                )}
              </div>
              
              <div className="text-slate-800 text-lg mb-8 leading-relaxed whitespace-pre-wrap">
                {soalSekarang.teksSoal}
              </div>

              <div className="space-y-3">
                {Array.isArray(soalSekarang.pilihanJawaban) && soalSekarang.pilihanJawaban.map((pilihan: any, idx: number) => {
                  const labelOpsi = pilihan.label || pilihan.opsi;
                  const isChecked = jawabanSiswa[soalSekarang.id] === labelOpsi;
                  return (
                    <label 
                      key={idx} 
                      className={`flex items-start gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                        isChecked ? 'border-indigo-600 bg-indigo-50/50' : 'border-slate-200 hover:border-indigo-300 hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-center h-6">
                        <input
                          type="radio"
                          name={`soal-${soalSekarang.id}`}
                          value={labelOpsi}
                          checked={isChecked}
                          onChange={() => setJawabanSiswa(prev => ({ ...prev, [soalSekarang.id]: labelOpsi }))}
                          className="w-5 h-5 text-indigo-600 focus:ring-indigo-600 border-slate-300"
                        />
                      </div>
                      <div className="flex-1">
                        <span className="font-bold text-slate-700 mr-2">{labelOpsi}.</span>
                        <span className="text-slate-700">{pilihan.teks}</span>
                      </div>
                    </label>
                  );
                })}
              </div>
            </div>

            {/* Navigasi Bawah */}
            <div className="flex items-center justify-between bg-white rounded-xl shadow-sm border border-slate-200 p-4">
              <button
                onClick={() => setSoalAktifIndex(prev => Math.max(0, prev - 1))}
                disabled={soalAktifIndex === 0}
                className="px-6 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-medium disabled:opacity-50 transition-colors"
              >
                Sebelumnya
              </button>

              <label className="flex items-center gap-2 cursor-pointer px-4 py-2 rounded-lg hover:bg-amber-50 transition-colors">
                <input
                  type="checkbox"
                  checked={!!raguRagu[soalSekarang.id]}
                  onChange={(e) => setRaguRagu(prev => ({ ...prev, [soalSekarang.id]: e.target.checked }))}
                  className="w-5 h-5 text-amber-500 rounded focus:ring-amber-500 border-slate-300"
                />
                <span className="font-medium text-amber-600">Ragu-ragu</span>
              </label>

              <button
                onClick={() => setSoalAktifIndex(prev => Math.min(dataUjian.bankSoal.length - 1, prev + 1))}
                disabled={soalAktifIndex === dataUjian.bankSoal.length - 1}
                className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium disabled:opacity-50 transition-colors shadow-sm"
              >
                Selanjutnya
              </button>
            </div>
          </div>
        </main>

        {/* Panel Kisi Kanan (Lebar 25%) */}
        <aside className="w-full lg:w-1/4 bg-white border-t lg:border-t-0 lg:border-l border-slate-200 flex flex-col shrink-0 overflow-y-auto">
          <div className="p-4 border-b border-slate-100">
            <h3 className="font-bold text-slate-900">Navigasi Soal</h3>
          </div>
          <div className="flex-1 overflow-y-auto p-4">
            <div className="grid grid-cols-5 gap-2">
              {dataUjian.bankSoal.map((soal, index) => {
                const isTerjawab = !!jawabanSiswa[soal.id];
                const isRagu = !!raguRagu[soal.id];
                const isAktif = soalAktifIndex === index;
                
                let bgColor = 'bg-white border-slate-200 text-slate-600';
                if (isAktif) bgColor = 'bg-indigo-600 border-indigo-600 text-white ring-2 ring-indigo-200 ring-offset-1';
                else if (isRagu) bgColor = 'bg-amber-400 border-amber-500 text-white';
                else if (isTerjawab) bgColor = 'bg-indigo-100 border-indigo-200 text-indigo-700';

                return (
                  <button
                    key={soal.id}
                    onClick={() => setSoalAktifIndex(index)}
                    className={`h-10 rounded-md border font-medium text-sm flex items-center justify-center transition-all ${bgColor}`}
                  >
                    {index + 1}
                  </button>
                );
              })}
            </div>
          </div>
          <div className="p-4 border-t border-slate-100 text-xs space-y-2">
            <div className="flex items-center gap-2"><div className="w-4 h-4 bg-white border border-slate-200 rounded-sm"></div> <span className="text-slate-600">Belum Dijawab ({jumlahKosong})</span></div>
            <div className="flex items-center gap-2"><div className="w-4 h-4 bg-indigo-100 border border-indigo-200 rounded-sm"></div> <span className="text-slate-600">Sudah Dijawab ({jumlahTerjawab - jumlahRagu})</span></div>
            <div className="flex items-center gap-2"><div className="w-4 h-4 bg-amber-400 border border-amber-500 rounded-sm"></div> <span className="text-slate-600">Ragu-ragu ({jumlahRagu})</span></div>
          </div>
        </aside>
      </div>

      {/* Modal Peringatan Pelanggaran */}
      {tampilModalPeringatan && (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-8 text-center shadow-xl border border-rose-100">
            <div className="w-16 h-16 bg-rose-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-rose-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">Peringatan Keamanan!</h3>
            <p className="text-slate-600 mb-6">{pesanPeringatan}</p>
            <button 
              onClick={() => setTampilModalPeringatan(false)}
              className="w-full py-3 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-semibold transition-colors"
            >
              Saya Mengerti & Kembali ke Ujian
            </button>
          </div>
        </div>
      )}

      {/* Modal Diskualifikasi (Kunci Layar Penuh) */}
      {tampilModalDiskualifikasi && (
        <div className="fixed inset-0 bg-rose-600 z-50 flex flex-col items-center justify-center p-6 text-white text-center">
          <svg className="w-24 h-24 mb-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
          <h1 className="text-4xl font-extrabold mb-4">UJIAN DIHENTIKAN</h1>
          <p className="text-xl mb-8 max-w-2xl text-rose-100">
            Anda telah melebihi batas toleransi pelanggaran keamanan. Sistem mendiskualifikasi sesi ini secara otomatis dan jawaban Anda sedang diproses.
          </p>
          <div className="flex items-center gap-3 bg-rose-700 px-6 py-3 rounded-full font-medium">
            <svg className="animate-spin w-5 h-5 text-white" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
            Mengumpulkan Jawaban...
          </div>
        </div>
      )}

      {/* Modal Konfirmasi Pengumpulan */}
      {tampilModalKonfirmasi && !tampilModalDiskualifikasi && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-slate-200">
            <h3 className="text-xl font-bold text-slate-900 mb-4">Kumpulkan Ujian?</h3>
            <p className="text-slate-600 mb-6">Apakah Anda yakin ingin mengakhiri sesi ini? Waktu masih tersisa {formatWaktu(sisaDetik)}.</p>
            
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 mb-6 space-y-2">
              <div className="flex justify-between">
                <span className="text-slate-600 text-sm">Sudah Dijawab:</span>
                <span className="font-bold text-indigo-600">{jumlahTerjawab}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600 text-sm">Ragu-ragu:</span>
                <span className="font-bold text-amber-600">{jumlahRagu}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600 text-sm">Belum Dijawab:</span>
                <span className="font-bold text-rose-600">{jumlahKosong}</span>
              </div>
            </div>
            
            <div className="flex gap-3">
              <button 
                onClick={() => setTampilModalKonfirmasi(false)}
                disabled={sedangKumpul}
                className="flex-1 py-3 bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 rounded-xl font-medium transition-colors"
              >
                Batal
              </button>
              <button 
                onClick={handleKumpulManual}
                disabled={sedangKumpul}
                className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-semibold shadow-sm transition-colors flex items-center justify-center gap-2"
              >
                {sedangKumpul ? 'Memproses...' : 'Ya, Kumpulkan'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
