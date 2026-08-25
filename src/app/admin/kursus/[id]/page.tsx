'use client';

import { useState, useEffect } from 'react';
import { ambilDetailKursusAdmin, simpanMateriKursus, hapusMateriKursus } from '@/actions/kursus-admin';
import { ArrowLeft, Plus, Video, Link as LinkIcon, FileText, LockOpen, Lock, Edit2, Trash2 } from 'lucide-react';
import Link from 'next/link';
import { useParams } from 'next/navigation';

export default function HalamanMateriKursusAdmin() {
  const params = useParams();
  const idKursus = params.id as string;
  
  const [kursus, setKursus] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  const [bukaModal, setBukaModal] = useState(false);
  const [formMateri, setFormMateri] = useState({
    id: '', judulMateri: '', tipeMateri: 'EMBED_YOUTUBE', kontenUrl: '', kontenTeks: '', urutan: 1, apakahPratinjauGratis: false
  });

  useEffect(() => {
    memuatData();
  }, [idKursus]);

  const memuatData = async () => {
    setLoading(true);
    try {
      const res = await ambilDetailKursusAdmin(idKursus);
      setKursus(res);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const tanganiSimpan = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await simpanMateriKursus({
        id: formMateri.id || undefined,
        idKursus,
        judulMateri: formMateri.judulMateri,
        tipeMateri: formMateri.tipeMateri as any,
        kontenUrl: formMateri.kontenUrl,
        kontenTeks: formMateri.kontenTeks,
        urutan: Number(formMateri.urutan),
        apakahPratinjauGratis: formMateri.apakahPratinjauGratis
      });
      setBukaModal(false);
      memuatData();
    } catch (error) {
      alert('Terdapat kesalahan teknis saat menyimpan modul silabus.');
    }
  };

  const tanganiHapus = async (id: string) => {
    if (confirm('Verifikasi keamanan: Hapus secara permanen materi dari silabus ini?')) {
      try {
        await hapusMateriKursus(id, idKursus);
        memuatData();
      } catch (error) {
        alert('Terdapat anomali, penghapusan gagal.');
      }
    }
  };

  const bukaModalTambah = () => {
    const nextUrutan = kursus?.materiKursus?.length ? Math.max(...kursus.materiKursus.map((m: any) => m.urutan)) + 1 : 1;
    setFormMateri({ id: '', judulMateri: '', tipeMateri: 'EMBED_YOUTUBE', kontenUrl: '', kontenTeks: '', urutan: nextUrutan, apakahPratinjauGratis: false });
    setBukaModal(true);
  };

  const bukaModalEdit = (m: any) => {
    setFormMateri({
      id: m.id, judulMateri: m.judulMateri, tipeMateri: m.tipeMateri, kontenUrl: m.kontenUrl || '', kontenTeks: m.kontenTeks || '', urutan: m.urutan, apakahPratinjauGratis: m.apakahPratinjauGratis
    });
    setBukaModal(true);
  };

  const ikonTipe = (tipe: string) => {
    if (tipe === 'EMBED_YOUTUBE' || tipe === 'VIDEO_STREAM') return <Video className="w-5 h-5 text-indigo-500" />;
    if (tipe === 'LINK_ZOOM') return <LinkIcon className="w-5 h-5 text-emerald-500" />;
    return <FileText className="w-5 h-5 text-amber-500" />;
  };

  if (loading) return <div className="p-8 text-slate-500 font-medium">Melakukan sinkronisasi kurikulum...</div>;
  if (!kursus) return <div className="p-8 text-rose-500 font-medium">Data kursus induk tidak terdeteksi di dalam database.</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/admin/kursus" className="p-2.5 bg-white rounded-xl shadow-sm border border-slate-200 text-slate-500 hover:text-indigo-600 transition">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Arsitektur Silabus: {kursus.judul}</h1>
          <p className="text-slate-500 mt-0.5 text-sm">Organisasikan hierarki materi pembelajaran secara sekuensial.</p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-6 flex justify-between items-center border-b border-slate-200 bg-slate-50">
          <h2 className="text-lg font-semibold text-slate-900">Modul Pembelajaran</h2>
          <button onClick={bukaModalTambah} className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg font-bold hover:bg-indigo-700 transition shadow-sm">
            <Plus className="w-4 h-4" /> Sisipkan Modul Topik
          </button>
        </div>
        
        <div className="divide-y divide-slate-100">
          {kursus.materiKursus.map((materi: any, idx: number) => (
            <div key={materi.id} className="p-5 flex items-center justify-between hover:bg-slate-50 transition group">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center font-bold text-slate-500 border border-slate-200">
                  {materi.urutan}
                </div>
                <div className="flex items-center justify-center w-12 h-12 bg-white border border-slate-200 rounded-xl shadow-sm">
                  {ikonTipe(materi.tipeMateri)}
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-lg">{materi.judulMateri}</h3>
                  <div className="flex items-center gap-3 mt-1.5">
                    <span className="text-xs text-slate-500 font-bold uppercase tracking-wider">{materi.tipeMateri.replace('_', ' ')}</span>
                    {materi.apakahPratinjauGratis ? (
                      <span className="flex items-center gap-1 text-[11px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100"><LockOpen className="w-3 h-3"/> PREVIEW GRATIS</span>
                    ) : (
                      <span className="flex items-center gap-1 text-[11px] font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded border border-amber-100"><Lock className="w-3 h-3"/> PRIVAT / TERKUNCI</span>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex gap-2 opacity-100 lg:opacity-0 lg:group-hover:opacity-100 transition">
                <button onClick={() => bukaModalEdit(materi)} className="p-2.5 bg-white border border-slate-200 text-slate-400 hover:text-indigo-600 rounded-lg shadow-sm" title="Edit Modul">
                  <Edit2 className="w-4 h-4" />
                </button>
                <button onClick={() => tanganiHapus(materi.id)} className="p-2.5 bg-white border border-slate-200 text-slate-400 hover:text-rose-600 rounded-lg shadow-sm" title="Hapus Modul">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
          {kursus.materiKursus.length === 0 && (
            <div className="p-16 text-center text-slate-500 bg-slate-50">
              Silabus utama belum terkonfigurasi. Mulai membangun struktur kurikulum sekarang.
            </div>
          )}
        </div>
      </div>

      {bukaModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-slate-200 bg-slate-50 rounded-t-2xl">
              <h3 className="text-lg font-bold text-slate-900">{formMateri.id ? 'Refaktor Silabus Modul' : 'Injeksi Modul Baru'}</h3>
            </div>
            <form onSubmit={tanganiSimpan} className="p-6 space-y-5">
              <div className="grid grid-cols-4 gap-4">
                <div className="col-span-3">
                  <label className="block text-sm font-medium text-slate-700 mb-1">Identitas Judul Topik</label>
                  <input type="text" required value={formMateri.judulMateri} onChange={(e) => setFormMateri({...formMateri, judulMateri: e.target.value})} className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500" />
                </div>
                <div className="col-span-1">
                  <label className="block text-sm font-medium text-slate-700 mb-1">Sekuensial Urutan</label>
                  <input type="number" min="1" required value={formMateri.urutan} onChange={(e) => setFormMateri({...formMateri, urutan: e.target.valueAsNumber})} className="w-full px-4 py-2 border border-slate-300 rounded-lg text-center font-bold text-indigo-600" />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Arsitektur Penyampaian Materi</label>
                <select value={formMateri.tipeMateri} onChange={(e) => setFormMateri({...formMateri, tipeMateri: e.target.value})} className="w-full px-4 py-2 border border-slate-300 rounded-lg bg-slate-50">
                  <option value="EMBED_YOUTUBE">Pemutar Platform YouTube (Iframe Wrapper)</option>
                  <option value="VIDEO_STREAM">Protokol Video Langsung (HTML5 MP4)</option>
                  <option value="LINK_ZOOM">Tautan Endpoint Konferensi (Zoom/Google Meet)</option>
                  <option value="EBOOK_PDF">Distribusi Dokumen Teks (Artikel/Ebook)</option>
                </select>
              </div>

              {(formMateri.tipeMateri === 'EMBED_YOUTUBE' || formMateri.tipeMateri === 'VIDEO_STREAM' || formMateri.tipeMateri === 'LINK_ZOOM') && (
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Endpoint Tautan Valid (URL)</label>
                  <input type="url" required placeholder="https://..." value={formMateri.kontenUrl} onChange={(e) => setFormMateri({...formMateri, kontenUrl: e.target.value})} className="w-full px-4 py-2 border border-slate-300 rounded-lg font-mono text-sm text-indigo-700" />
                </div>
              )}

              {(formMateri.tipeMateri === 'EBOOK_PDF') && (
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Naskah Konten Penjelasan</label>
                  <textarea rows={6} value={formMateri.kontenTeks} onChange={(e) => setFormMateri({...formMateri, kontenTeks: e.target.value})} className="w-full px-4 py-2 border border-slate-300 rounded-lg font-mono text-sm" placeholder="Dokumentasikan modul secara komprehensif di sini..."></textarea>
                  <div className="mt-4">
                    <label className="block text-sm font-medium text-slate-700 mb-1">Lampiran Eksternal Opsional (URL Akses Drive/PDF)</label>
                    <input type="url" placeholder="https://..." value={formMateri.kontenUrl} onChange={(e) => setFormMateri({...formMateri, kontenUrl: e.target.value})} className="w-full px-4 py-2 border border-slate-300 rounded-lg font-mono text-sm" />
                  </div>
                </div>
              )}

              <div className="flex items-center gap-3 pt-4 pb-2">
                <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-xl flex items-start gap-3 w-full">
                  <input type="checkbox" id="apakahPratinjauGratis" checked={formMateri.apakahPratinjauGratis} onChange={(e) => setFormMateri({...formMateri, apakahPratinjauGratis: e.target.checked})} className="w-5 h-5 text-emerald-600 rounded border-emerald-400 focus:ring-emerald-600 mt-0.5" />
                  <div>
                    <label htmlFor="apakahPratinjauGratis" className="text-sm font-bold text-emerald-900 cursor-pointer block">Otorisasi Mode Pratinjau (Free Preview)</label>
                    <p className="text-xs text-emerald-700 mt-1">Mengizinkan kandidat siswa mengevaluasi kualitas modul ini tanpa komitmen transaksi finansial.</p>
                  </div>
                </div>
              </div>

              <div className="pt-6 flex gap-3 justify-end border-t border-slate-100">
                <button type="button" onClick={() => setBukaModal(false)} className="px-5 py-2.5 text-slate-600 font-bold hover:bg-slate-100 rounded-lg transition">Gugurkan</button>
                <button type="submit" className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg shadow-sm transition">Rekam Modul</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
