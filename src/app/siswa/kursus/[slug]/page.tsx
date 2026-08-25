'use client';

import { useState, useEffect } from 'react';
import { ambilDetailKursusSiswa, beliKursusDenganRinCoin } from '@/actions/kursus-siswa';
import { useParams, useRouter } from 'next/navigation';
import { PlayCircle, Lock, LockOpen, ArrowRight, BookOpen, AlertTriangle, ShieldCheck } from 'lucide-react';
import Link from 'next/link';

export default function DetailKursusSiswa() {
  const params = useParams();
  const router = useRouter();
  const slug = params.slug as string;
  
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [memproses, setMemproses] = useState(false);

  useEffect(() => {
    memuatData();
  }, [slug]);

  const memuatData = async () => {
    try {
      const res = await ambilDetailKursusSiswa(slug);
      setData(res);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const tanganiBeli = async () => {
    if (!confirm(`Konfirmasi Finansial: Apakah Anda yakin memotong ${data.hargaRinCoin} RinCoin dari saldo Anda untuk berinvestasi di kelas ini?`)) return;
    
    setMemproses(true);
    try {
      const res = await beliKursusDenganRinCoin(data.id);
      if (res.sukses) {
        alert(res.pesan);
        router.push(`/siswa/kursus/${data.slug}/belajar`);
      }
    } catch (error: any) {
      alert(error.message || 'Transaksi dibatalkan sistem akibat kegagalan internal.');
    } finally {
      setMemproses(false);
    }
  };

  if (loading) return <div className="p-12 text-center text-slate-500 font-bold text-lg animate-pulse">Mengumpulkan data struktur kurikulum...</div>;
  if (!data) return <div className="p-12 text-center text-rose-500 font-bold text-lg border border-rose-200 bg-rose-50 rounded-2xl max-w-xl mx-auto mt-10">Kesalahan 404: Arsitektur kursus tidak teridentifikasi.</div>;

  return (
    <div className="max-w-6xl mx-auto pb-12">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Panel Dokumentasi Utama */}
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="h-64 bg-slate-900 flex flex-col justify-end p-8 text-white relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-tr from-indigo-900/80 to-transparent"></div>
              <div className="relative z-10">
                <span className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 backdrop-blur-md rounded border border-white/20 text-[10px] font-black uppercase tracking-widest mb-4">
                  <BookOpen className="w-3.5 h-3.5" /> {data.tipeKursus.replace('_', ' ')}
                </span>
                <h1 className="text-3xl sm:text-4xl font-black text-white mb-2 leading-tight">{data.judul}</h1>
              </div>
            </div>
            <div className="p-8">
              <h2 className="text-lg font-black text-slate-900 mb-4 uppercase tracking-wide">Objektif & Deskripsi Pembelajaran</h2>
              <div className="prose prose-slate max-w-none text-slate-600 leading-relaxed text-justify">
                {data.deskripsi}
              </div>
            </div>
          </div>

          <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-8">
            <div className="flex items-center justify-between mb-8 border-b border-slate-100 pb-4">
              <h2 className="text-xl font-black text-slate-900 uppercase tracking-wide">Arsitektur Kurikulum</h2>
              <div className="text-xs font-bold text-indigo-700 bg-indigo-50 border border-indigo-100 px-3 py-1.5 rounded-full">
                {data.materiKursus.length} Modul Terstruktur
              </div>
            </div>
            
            <div className="space-y-3">
              {data.materiKursus.map((m: any, idx: number) => {
                const terbuka = data.dimiliki || m.apakahPratinjauGratis;
                return (
                  <div key={m.id} className={`flex items-center justify-between p-5 rounded-2xl border transition-all duration-300 ${terbuka ? 'bg-white border-slate-200 hover:border-indigo-300 hover:shadow-md' : 'bg-slate-50 border-slate-100'}`}>
                    <div className="flex items-center gap-5">
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold shadow-sm border ${terbuka ? 'bg-indigo-50 text-indigo-600 border-indigo-100' : 'bg-slate-100 text-slate-400 border-slate-200'}`}>
                        {terbuka ? <PlayCircle className="w-6 h-6 ml-0.5" /> : <Lock className="w-5 h-5" />}
                      </div>
                      <div>
                        <h3 className={`font-bold text-lg ${terbuka ? 'text-slate-900' : 'text-slate-500'}`}>{idx + 1}. {m.judulMateri}</h3>
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mt-1">{m.tipeMateri.replace('_', ' ')}</p>
                      </div>
                    </div>
                    {m.apakahPratinjauGratis && !data.dimiliki && (
                      <span className="text-xs font-black text-emerald-600 bg-emerald-50 border border-emerald-100 px-3 py-1.5 rounded-lg flex items-center gap-1.5 shadow-sm">
                        <LockOpen className="w-4 h-4" /> PREVIEW TERBUKA
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Panel Telemetri & Checkout */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-8 sticky top-24">
            <h3 className="text-sm font-black text-slate-400 mb-6 uppercase tracking-widest border-b border-slate-100 pb-4">Protokol Akses</h3>
            
            <div className="flex justify-between items-end mb-8">
              <span className="text-slate-500 font-bold">Investasi Standar</span>
              <span className={`text-4xl font-black ${data.tipeAksesHarga === 'GRATIS' ? 'text-emerald-600' : 'text-amber-500'}`}>
                {data.tipeAksesHarga === 'GRATIS' ? '100% GRATIS' : `${data.hargaRinCoin} RC`}
              </span>
            </div>

            {data.dimiliki ? (
              <div className="space-y-4 mt-8">
                <div className="bg-emerald-50 text-emerald-800 p-5 rounded-2xl flex items-start gap-4 border border-emerald-200 shadow-sm">
                  <ShieldCheck className="w-6 h-6 shrink-0 mt-0.5 text-emerald-600" />
                  <p className="text-sm font-bold">Otorisasi tervalidasi. Anda memiliki hak akses penuh tanpa batas ke seluruh kurikulum di kelas ini.</p>
                </div>
                <Link href={`/siswa/kursus/${data.slug}/belajar`} className="flex items-center justify-center gap-2 w-full bg-slate-900 hover:bg-indigo-600 text-white font-bold py-4 rounded-2xl transition-all duration-300 shadow-md">
                  Inisiasi Ruang Belajar <ArrowRight className="w-5 h-5" />
                </Link>
              </div>
            ) : (
              <div className="space-y-4 mt-8">
                {data.tipeAksesHarga === 'RINCOIN' && (
                  <div className="bg-slate-50 p-5 rounded-2xl text-xs font-medium text-slate-600 border border-slate-200 flex gap-3">
                    <AlertTriangle className="w-5 h-5 shrink-0 text-amber-500 mt-0.5" />
                    <div>Sistem akan mengevaluasi kecukupan saldo RinCoin Anda sebelum mengeksekusi kontrak transaksi cerdas ini secara atomik.</div>
                  </div>
                )}
                
                {data.tipeAksesHarga === 'GRATIS' ? (
                  <button className="flex items-center justify-center gap-2 w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-4 rounded-2xl transition shadow-md">
                    Klaim Akses Terbuka <ArrowRight className="w-5 h-5" />
                  </button>
                ) : (
                  <button 
                    onClick={tanganiBeli}
                    disabled={memproses}
                    className="flex items-center justify-center gap-2 w-full bg-amber-500 hover:bg-amber-600 text-white font-bold py-4 rounded-2xl transition shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {memproses ? 'Menjalankan Protokol...' : 'Otorisasi Transaksi (Beli)'}
                  </button>
                )}
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
