'use client';

import { useState } from 'react';
import { Coins, CheckCircle2, ChevronRight, ShoppingBag } from 'lucide-react';
import Link from 'next/link';

export default function KalkulatorRinCoin() {
  const [koin, setKoin] = useState(50);

  const konversiRupiah = koin * 1000;

  // Tentukan modul/layanan yang terbuka berdasarkan jumlah koin
  const dapatkanFiturTerbuka = (jumlahKoin: number) => {
    const list = [];
    if (jumlahKoin >= 10) {
      list.push({
        teks: 'Akses Tanya RinaSensei AI Chat (hingga 10-30x respons cerdas)',
        kategori: 'AI Tutor'
      });
    }
    if (jumlahKoin >= 30) {
      list.push({
        teks: 'Mengikuti 1x Ujian Simulasi CBT UTBK/Kedinasan dengan modul anti-cheat',
        kategori: 'Simulasi CBT'
      });
    }
    if (jumlahKoin >= 50) {
      list.push({
        teks: 'Akses Penuh 1 Modul/Bab Video Pembelajaran Rekaman (Video On-Demand)',
        kategori: 'Modul Video'
      });
    }
    if (jumlahKoin >= 100) {
      list.push({
        teks: 'Akses Penuh Kursus Premium Lengkap (Video Rekaman + E-Book)',
        kategori: 'Kelas Premium'
      });
    }
    if (jumlahKoin >= 150) {
      list.push({
        teks: 'Mengikuti 1 Sesi Kelas Live Call / Mentoring Interaktif bersama Tutor',
        kategori: 'Live Class'
      });
    }
    return list;
  };

  const fiturTerbuka = dapatkanFiturTerbuka(koin);

  return (
    <div className="bg-white rounded-3xl border border-slate-200/90 shadow-lg p-6 md:p-10 max-w-4xl mx-auto">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        
        {/* Kolom Slider (lg:col-span-7) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="space-y-2">
            <span className="text-[11px] font-black text-indigo-600 bg-indigo-50 border border-indigo-100 px-3 py-1 rounded-full uppercase tracking-wider">
              Kalkulator Tarif Fleksibel
            </span>
            <h3 className="text-2xl font-black text-slate-900 tracking-tight">Simulasi RinCoin Micropayments</h3>
            <p className="text-sm text-slate-500 font-medium">
              Geser slider di bawah ini untuk melihat konversi Rupiah dan layanan bimbel apa saja yang dapat Anda buka secara eceran tanpa biaya langganan bulanan.
            </p>
          </div>

          <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200/80 space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm font-bold text-slate-700">Jumlah RinCoin (RC):</span>
              <span className="text-2xl font-black text-indigo-600 flex items-center gap-1">
                🪙 {koin} RC
              </span>
            </div>
            
            <input 
              type="range" 
              min="10" 
              max="200" 
              step="10"
              value={koin} 
              onChange={(e) => setKoin(parseInt(e.target.value))}
              className="w-full h-2.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600 focus:outline-none"
            />
            
            <div className="flex justify-between text-xs text-slate-400 font-bold">
              <span>10 RC</span>
              <span>100 RC</span>
              <span>200 RC</span>
            </div>
          </div>

          <div className="p-5 bg-amber-50/50 border border-amber-200/70 rounded-2xl flex items-center justify-between gap-4">
            <div>
              <span className="text-[10px] font-black text-amber-800 uppercase tracking-widest block">Tarif Konversi Rupiah</span>
              <span className="text-xl font-black text-amber-700">Rp {konversiRupiah.toLocaleString('id-ID')}</span>
            </div>
            <span className="text-xs text-slate-500 font-semibold text-right max-w-[180px]">
              Setara dengan Rp 1.000 per 1 RinCoin (Flat & Adil)
            </span>
          </div>
        </div>

        {/* Kolom Akses Fitur (lg:col-span-5) */}
        <div className="lg:col-span-5 bg-slate-50 rounded-2xl p-6 border border-slate-200/80 flex flex-col justify-between h-full min-h-[320px]">
          <div>
            <h4 className="text-xs font-black text-slate-500 uppercase tracking-widest border-b border-slate-200 pb-3 mb-4">
              Layanan Terbuka ({fiturTerbuka.length})
            </h4>
            
            <div className="space-y-3.5">
              {fiturTerbuka.map((fitur, i) => (
                <div key={i} className="flex gap-2.5 items-start">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <div className="text-xs">
                    <span className="font-extrabold text-[10px] text-indigo-600 bg-indigo-50 border border-indigo-100/50 px-1.5 py-0.25 rounded mr-1">
                      {fitur.kategori}
                    </span>
                    <span className="text-slate-700 font-medium">{fitur.teks}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-6 border-t border-slate-200 mt-6">
            <Link 
              href="/daftar" 
              className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-xs text-center shadow transition flex items-center justify-center gap-1.5"
            >
              <ShoppingBag className="w-4 h-4" /> Beli RinCoin & Mulai <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

        </div>

      </div>
    </div>
  );
}
