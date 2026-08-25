'use client';

import { useState, useEffect } from 'react';
import { ambilSemuaKursusAdmin, simpanKursus, hapusKursus } from '@/actions/kursus-admin';
import { Plus, Edit2, Trash2, BookOpen, Users, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export default function HalamanKursusAdmin() {
  const [kursus, setKursus] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [bukaModal, setBukaModal] = useState(false);
  const [formKursus, setFormKursus] = useState({
    id: '', judul: '', slug: '', deskripsi: '', 
    tipeKursus: 'VIDEO_REKAMAN', tipeAksesHarga: 'GRATIS', hargaRinCoin: 0, apakahAktif: true
  });

  useEffect(() => {
    memuatData();
  }, []);

  const memuatData = async () => {
    setLoading(true);
    try {
      const data = await ambilSemuaKursusAdmin();
      setKursus(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const tanganiSimpan = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await simpanKursus({
        id: formKursus.id || undefined,
        judul: formKursus.judul,
        slug: formKursus.slug,
        deskripsi: formKursus.deskripsi,
        tipeKursus: formKursus.tipeKursus as any,
        tipeAksesHarga: formKursus.tipeAksesHarga as any,
        hargaRinCoin: formKursus.tipeAksesHarga === 'RINCOIN' ? Number(formKursus.hargaRinCoin) : 0,
        apakahAktif: formKursus.apakahAktif
      });
      setBukaModal(false);
      memuatData();
    } catch (error) {
      alert('Gagal merekam metadata kursus ke dalam sistem.');
    }
  };

  const tanganiHapus = async (id: string) => {
    if (confirm('Konfirmasi destruktif: Apakah Anda yakin ingin menghapus permanen kursus beserta seluruh materinya?')) {
      try {
        await hapusKursus(id);
        memuatData();
      } catch (error) {
        alert('Penghapusan gagal dilakukan.');
      }
    }
  };

  const bukaModalEdit = (k: any) => {
    setFormKursus({
      id: k.id, judul: k.judul, slug: k.slug, deskripsi: k.deskripsi || '',
      tipeKursus: k.tipeKursus, tipeAksesHarga: k.tipeAksesHarga, hargaRinCoin: k.hargaRinCoin || 0, apakahAktif: k.apakahAktif
    });
    setBukaModal(true);
  };

  const bukaModalTambah = () => {
    setFormKursus({ id: '', judul: '', slug: '', deskripsi: '', tipeKursus: 'VIDEO_REKAMAN', tipeAksesHarga: 'GRATIS', hargaRinCoin: 0, apakahAktif: true });
    setBukaModal(true);
  };

  if (loading && kursus.length === 0) return <div className="p-8 text-slate-500 font-medium">Memuat inventaris katalog kursus admin...</div>;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Manajemen Kursus Master</h1>
          <p className="text-slate-500 mt-1">Kelola pembuatan kursus, model harga, dan akses publik.</p>
        </div>
        <button onClick={bukaModalTambah} className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-indigo-700 transition">
          <Plus className="w-5 h-5" /> Buat Kelas Baru
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {kursus.map(k => (
          <div key={k.id} className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden flex flex-col">
            <div className="p-6 flex-1">
              <div className="flex justify-between items-start mb-4">
                <span className={`px-2.5 py-1 text-xs font-semibold rounded-full ${k.apakahAktif ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-slate-100 text-slate-600 border border-slate-200'}`}>
                  {k.apakahAktif ? 'Dipublikasi' : 'Mode Draf'}
                </span>
                <span className={`px-2.5 py-1 text-xs font-semibold rounded-full ${k.tipeAksesHarga === 'RINCOIN' ? 'bg-amber-50 text-amber-700 border border-amber-200' : 'bg-indigo-50 text-indigo-700 border border-indigo-200'}`}>
                  {k.tipeAksesHarga === 'RINCOIN' ? `${k.hargaRinCoin} Koin` : k.tipeAksesHarga}
                </span>
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2 line-clamp-1">{k.judul}</h3>
              <p className="text-sm text-slate-500 mb-4 line-clamp-2">{k.deskripsi}</p>
              
              <div className="flex items-center gap-4 text-sm text-slate-600 mt-auto">
                <div className="flex items-center gap-1.5"><BookOpen className="w-4 h-4 text-indigo-500"/> <span className="font-medium">{k._count.materiKursus} Topik</span></div>
                <div className="flex items-center gap-1.5"><Users className="w-4 h-4 text-emerald-500"/> <span className="font-medium">{k._count.langgananSiswa} Peserta</span></div>
              </div>
            </div>
            
            <div className="bg-slate-50 p-4 border-t border-slate-100 flex items-center justify-between">
              <div className="flex gap-2">
                <button onClick={() => bukaModalEdit(k)} className="p-2 bg-white border border-slate-200 rounded-lg text-slate-500 hover:text-indigo-600 transition" title="Ubah Konfigurasi Dasar">
                  <Edit2 className="w-4 h-4" />
                </button>
                <button onClick={() => tanganiHapus(k.id)} className="p-2 bg-white border border-slate-200 rounded-lg text-slate-500 hover:text-rose-600 transition" title="Hapus Permanen">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
              <Link href={`/admin/kursus/${k.id}`} className="flex items-center gap-1.5 text-sm font-bold text-indigo-600 hover:text-indigo-800 transition">
                Kelola Kurikulum <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        ))}
        {kursus.length === 0 && (
          <div className="col-span-full text-center py-12 bg-white border border-dashed border-slate-300 rounded-xl">
            <BookOpen className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-500">Pangkalan data kursus Anda masih kosong.</p>
          </div>
        )}
      </div>

      {bukaModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-slate-200">
              <h3 className="text-lg font-bold text-slate-900">{formKursus.id ? 'Modifikasi Konfigurasi Kursus' : 'Inisialisasi Kursus Baru'}</h3>
            </div>
            <form onSubmit={tanganiSimpan} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Judul Resmi Kursus</label>
                <input type="text" required value={formKursus.judul} onChange={(e) => {
                  const val = e.target.value;
                  setFormKursus({...formKursus, judul: val, slug: val.toLowerCase().replace(/[^a-z0-9]+/g, '-')});
                }} className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-indigo-600 focus:border-indigo-600" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Tautan URL Ramah SEO (Slug)</label>
                <input type="text" required value={formKursus.slug} onChange={(e) => setFormKursus({...formKursus, slug: e.target.value})} className="w-full px-4 py-2 border border-slate-300 rounded-lg bg-slate-50 font-mono text-sm" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Deskripsi & Objektif Pembelajaran</label>
                <textarea rows={3} value={formKursus.deskripsi} onChange={(e) => setFormKursus({...formKursus, deskripsi: e.target.value})} className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-indigo-600 focus:border-indigo-600"></textarea>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Metode Penyampaian</label>
                  <select value={formKursus.tipeKursus} onChange={(e) => setFormKursus({...formKursus, tipeKursus: e.target.value})} className="w-full px-4 py-2 border border-slate-300 rounded-lg">
                    <option value="VIDEO_REKAMAN">Rekaman Video (Asynchronous)</option>
                    <option value="VIDEOCALL_LIVE">Interaksi Live (Zoom/Meet)</option>
                    <option value="HYBRID">Kurikulum Campuran</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Model Monetisasi</label>
                  <select value={formKursus.tipeAksesHarga} onChange={(e) => setFormKursus({...formKursus, tipeAksesHarga: e.target.value})} className="w-full px-4 py-2 border border-slate-300 rounded-lg">
                    <option value="GRATIS">100% Gratis</option>
                    <option value="RINCOIN">Berbayar dengan Koin (RinCoin)</option>
                  </select>
                </div>
              </div>
              
              {formKursus.tipeAksesHarga === 'RINCOIN' && (
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Tarif Premium (RinCoin)</label>
                  <input type="number" min="1" required value={formKursus.hargaRinCoin} onChange={(e) => setFormKursus({...formKursus, hargaRinCoin: e.target.valueAsNumber})} className="w-full px-4 py-2 border border-slate-300 rounded-lg font-bold text-amber-600" />
                </div>
              )}

              <div className="flex items-center gap-2 pt-2 bg-slate-50 p-3 rounded-lg border border-slate-200">
                <input type="checkbox" id="apakahAktif" checked={formKursus.apakahAktif} onChange={(e) => setFormKursus({...formKursus, apakahAktif: e.target.checked})} className="w-5 h-5 text-indigo-600 rounded" />
                <label htmlFor="apakahAktif" className="text-sm font-medium text-slate-700 cursor-pointer">Buka Pendaftaran (Publikasikan ke Katalog)</label>
              </div>

              <div className="pt-6 flex gap-3 justify-end border-t border-slate-100">
                <button type="button" onClick={() => setBukaModal(false)} className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg font-medium transition">Batalkan Proses</button>
                <button type="submit" className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-bold transition shadow-sm">Simpan Metadata</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
