'use client';

import { useState, useEffect } from 'react';
import { ambilKatalogKursus } from '@/actions/kursus-siswa';
import { BookOpen, Video, Users, CheckCircle, Award } from 'lucide-react';
import Link from 'next/link';

export default function HalamanKatalogSiswa() {
  const [kursus, setKursus] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('SEMUA');

  useEffect(() => {
    memuatKatalog();
  }, [filter]);

  const memuatKatalog = async () => {
    setLoading(true);
    try {
      const data = await ambilKatalogKursus(filter);
      setKursus(data);
    } catch (error) {
      console.error('Katalog gagal dirender', error);
    } finally {
      setLoading(false);
    }
  };

  const TabsFilter = () => (
    <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
      {['SEMUA', 'VIDEO_REKAMAN', 'VIDEOCALL_LIVE'].map(t => (
        <button
          key={t}
          onClick={() => setFilter(t)}
          className={`px-5 py-2.5 rounded-full text-sm font-bold whitespace-nowrap transition-all duration-200 ${
            filter === t ? 'bg-indigo-600 text-white shadow-md shadow-indigo-200' : 'bg-white text-slate-600 border border-slate-200 hover:border-indigo-300 hover:text-indigo-600'
          }`}
        >
          {t === 'SEMUA' ? 'Jelajahi Semua' : t.replace('_', ' ')}
        </button>
      ))}
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-50 rounded-full blur-3xl opacity-50 -translate-y-1/2 translate-x-1/3"></div>
        <div className="relative z-10">
          <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight">Katalog Program Eksklusif</h1>
          <p className="text-slate-500 mt-3 text-lg max-w-2xl">Investasikan waktu Anda pada kurikulum yang dirancang sistematis oleh tenaga pendidik profesional untuk akselerasi pemahaman akademis.</p>
        </div>
      </div>

      <TabsFilter />

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
          {[1,2,3].map(i => <div key={i} className="h-[420px] bg-slate-100 rounded-3xl animate-pulse border border-slate-200"></div>)}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
          {kursus.map((k) => (
            <div key={k.id} className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden flex flex-col group hover:shadow-xl hover:shadow-indigo-100/50 hover:border-indigo-300 transition-all duration-300">
              <div className="h-52 bg-slate-50 flex items-center justify-center p-6 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-50/50 to-emerald-50/50 opacity-0 group-hover:opacity-100 transition duration-500"></div>
                {k.tipeKursus === 'VIDEO_REKAMAN' ? <Video className="w-20 h-20 text-indigo-300 group-hover:scale-110 transition duration-500 relative z-10" /> : <Users className="w-20 h-20 text-emerald-300 group-hover:scale-110 transition duration-500 relative z-10" />}
                
                {k.dimiliki && (
                  <div className="absolute top-4 right-4 z-20">
                    <span className="flex items-center gap-1.5 bg-emerald-500 text-white px-3 py-1.5 rounded-full text-xs font-bold shadow-sm">
                      <CheckCircle className="w-4 h-4" /> AKSES LENGKAP
                    </span>
                  </div>
                )}
              </div>
              
              <div className="p-7 flex flex-col flex-1">
                <div className="flex justify-between items-center mb-4">
                  <span className="text-xs font-black tracking-widest text-indigo-500 uppercase bg-indigo-50 px-2 py-1 rounded">
                    {k.tipeKursus.replace('_', ' ')}
                  </span>
                  <div className="flex items-center gap-1.5 text-xs font-bold text-slate-500">
                    <BookOpen className="w-4 h-4" /> {k._count.materiKursus} Sesi
                  </div>
                </div>
                
                <h3 className="text-xl font-bold text-slate-900 mb-3 leading-snug group-hover:text-indigo-700 transition">{k.judul}</h3>
                <p className="text-slate-500 text-sm line-clamp-2 mb-6 flex-1">{k.deskripsi}</p>
                
                <div className="flex items-center justify-between pt-6 border-t border-slate-100">
                  <div className="flex flex-col">
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-0.5">Nilai Investasi</span>
                    <span className={`text-xl font-black ${k.tipeAksesHarga === 'GRATIS' ? 'text-emerald-600' : 'text-amber-500'}`}>
                      {k.tipeAksesHarga === 'GRATIS' ? '100% GRATIS' : `${k.hargaRinCoin} RC`}
                    </span>
                  </div>
                  
                  <Link 
                    href={`/siswa/kursus/${k.slug}`} 
                    className={`px-6 py-3 rounded-xl font-bold text-sm transition-all shadow-sm ${
                      k.dimiliki 
                        ? 'bg-emerald-600 hover:bg-emerald-700 text-white' 
                        : 'bg-slate-900 hover:bg-indigo-600 text-white'
                    }`}
                  >
                    {k.dimiliki ? 'Mulai Sesi' : 'Inspeksi Kelas'}
                  </Link>
                </div>
              </div>
            </div>
          ))}
          {kursus.length === 0 && (
            <div className="col-span-full py-20 flex flex-col items-center justify-center text-slate-500 bg-white rounded-3xl border border-slate-200">
              <Award className="w-16 h-16 text-slate-300 mb-4" />
              <p className="text-lg font-medium">Algoritma belum mendeteksi kurikulum aktif di sektor ini.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
