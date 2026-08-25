'use client';

import { useState, useEffect } from 'react';
import { ambilAksesMateriBelajar } from '@/actions/kursus-siswa';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import PemutarMateri from '@/components/kursus/PemutarMateri';
import { PlayCircle, CheckCircle, ChevronLeft, ChevronRight, Lock, BookOpen } from 'lucide-react';
import Link from 'next/link';

export default function RuangKelasSiswa() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  
  const slug = params.slug as string;
  const idTopik = searchParams.get('topik') || undefined;

  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [errorAkses, setErrorAkses] = useState<string | null>(null);

  useEffect(() => {
    memuatData();
  }, [slug, idTopik]);

  const memuatData = async () => {
    setLoading(true);
    setErrorAkses(null);
    try {
      const res = await ambilAksesMateriBelajar(slug, idTopik);
      setData(res);
    } catch (error: any) {
      setErrorAkses(error.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center text-slate-500 font-bold text-lg animate-pulse">Mengaktifkan sesi ruang kelas virtual...</div>;

  if (errorAkses) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center max-w-md mx-auto text-center space-y-6">
        <div className="w-24 h-24 bg-rose-50 border-2 border-rose-100 text-rose-600 rounded-full flex items-center justify-center mb-2 shadow-sm">
          <Lock className="w-12 h-12" />
        </div>
        <h1 className="text-3xl font-black text-slate-900">Restriksi Akses</h1>
        <p className="text-slate-600 font-medium">{errorAkses}</p>
        <Link href={`/siswa/kursus/${slug}`} className="bg-slate-900 text-white px-8 py-3.5 rounded-xl font-bold hover:bg-indigo-600 transition duration-300 shadow-md">
          Mundur ke Resepsi Kelas
        </Link>
      </div>
    );
  }

  const { kursus, materiAktif, dimiliki } = data;

  const cariMateriSamping = () => {
    const idx = kursus.materiKursus.findIndex((m: any) => m.id === materiAktif.id);
    return {
      prev: idx > 0 ? kursus.materiKursus[idx - 1] : null,
      next: idx < kursus.materiKursus.length - 1 ? kursus.materiKursus[idx + 1] : null
    };
  };

  const navigasi = cariMateriSamping();

  const handlePindahTopik = (id: string) => {
    router.push(`/siswa/kursus/${slug}/belajar?topik=${id}`);
  };

  return (
    <div className="flex flex-col lg:flex-row gap-8 max-w-[1500px] mx-auto min-h-[85vh] pb-12">
      
      {/* Inti Konsol Perender Materi */}
      <div className="flex-1 flex flex-col space-y-6 lg:pr-4">
        <Link href={`/siswa/kursus/${slug}`} className="inline-flex items-center gap-2 text-xs font-bold tracking-widest uppercase text-slate-400 hover:text-indigo-600 transition self-start bg-white px-4 py-2 rounded-lg border border-slate-200 shadow-sm">
          <ChevronLeft className="w-4 h-4" /> Tinggalkan Sesi
        </Link>
        
        <h1 className="text-3xl font-black text-slate-900">{materiAktif.judulMateri}</h1>
        
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <PemutarMateri 
            tipeMateri={materiAktif.tipeMateri} 
            kontenUrl={materiAktif.kontenUrl} 
            kontenTeks={materiAktif.kontenTeks} 
          />
        </div>

        <div className="flex items-center justify-between mt-2 bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
          {navigasi.prev ? (
            <button onClick={() => handlePindahTopik(navigasi.prev.id)} className="flex items-center gap-2 text-slate-500 font-bold hover:text-indigo-600 transition bg-slate-50 hover:bg-indigo-50 px-5 py-2.5 rounded-xl border border-slate-200 hover:border-indigo-200">
              <ChevronLeft className="w-5 h-5" /> Mundur
            </button>
          ) : <div />}

          {navigasi.next ? (
            <button onClick={() => handlePindahTopik(navigasi.next.id)} className="flex items-center gap-2 text-indigo-700 font-bold hover:text-white hover:bg-indigo-600 bg-indigo-50 px-6 py-2.5 rounded-xl border border-indigo-200 hover:border-transparent transition-all shadow-sm">
              Maju ke Modul {navigasi.next.urutan} <ChevronRight className="w-5 h-5" />
            </button>
          ) : (
            <div className="flex items-center gap-2 text-emerald-600 font-bold bg-emerald-50 px-6 py-2.5 rounded-xl border border-emerald-200">
              <CheckCircle className="w-5 h-5" /> Program Ditamatkan
            </div>
          )}
        </div>
      </div>

      {/* Navigasi Silabus Sidebar */}
      <div className="w-full lg:w-[400px] shrink-0 lg:h-[80vh] sticky top-24 flex flex-col bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-6 border-b border-slate-200 bg-slate-900 text-white">
          <h2 className="text-lg font-black flex items-center gap-2 tracking-wide">
            <BookOpen className="w-5 h-5 text-indigo-400" /> INDEKS SILABUS
          </h2>
          <p className="text-xs text-slate-400 mt-2 font-medium leading-relaxed">{kursus.judul}</p>
        </div>
        
        <div className="overflow-y-auto flex-1 p-3 space-y-1 bg-slate-50/50">
          {kursus.materiKursus.map((m: any, idx: number) => {
            const isAktif = m.id === materiAktif.id;
            const terkunci = !dimiliki && !m.apakahPratinjauGratis;

            return (
              <button
                key={m.id}
                onClick={() => { if (!terkunci) handlePindahTopik(m.id); }}
                disabled={terkunci}
                className={`w-full text-left flex items-start gap-4 p-4 rounded-2xl transition-all duration-200 ${
                  isAktif 
                    ? 'bg-white border border-indigo-300 shadow-sm ring-1 ring-indigo-50' 
                    : terkunci 
                      ? 'opacity-50 cursor-not-allowed hover:bg-slate-100 border border-transparent' 
                      : 'hover:bg-white hover:shadow-sm hover:border-slate-200 border border-transparent'
                }`}
              >
                <div className={`mt-0.5 shrink-0 w-8 h-8 rounded-full flex items-center justify-center border ${isAktif ? 'bg-indigo-50 text-indigo-600 border-indigo-200' : terkunci ? 'bg-slate-100 text-slate-400 border-slate-200' : 'bg-white text-slate-500 border-slate-300'}`}>
                  {terkunci ? <Lock className="w-4 h-4" /> : <PlayCircle className="w-4 h-4 ml-0.5" />}
                </div>
                <div>
                  <p className={`font-bold text-sm leading-snug ${isAktif ? 'text-indigo-900' : 'text-slate-700'}`}>
                    Modul {idx + 1}: {m.judulMateri}
                  </p>
                  <div className="flex items-center gap-2 mt-1.5">
                    <span className={`text-[9px] px-2 py-0.5 rounded uppercase font-black tracking-widest ${isAktif ? 'bg-indigo-100 text-indigo-700' : 'bg-slate-200 text-slate-500'}`}>
                      {m.tipeMateri.replace('_', ' ')}
                    </span>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

    </div>
  );
}
