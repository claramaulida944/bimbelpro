'use client';

import { useState, useEffect } from 'react';
import { ambilSemuaUjianAdmin, simpanUjian, hapusUjian } from '@/actions/ujian-admin';
import { Plus, Edit2, Trash2, ShieldAlert, Users, FileText, ArrowRight, BarChart2 } from 'lucide-react';
import Link from 'next/link';

export default function HalamanUjianAdmin() {
  const [ujianList, setUjianList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [bukaModal, setBukaModal] = useState(false);
  const [formUjian, setFormUjian] = useState({
    id: '', judulUjian: '', deskripsi: '', durasiMenit: 90, biayaRinCoin: 0, wajibFullscreen: true, batasMaksimalPelanggaran: 3, apakahAktif: false
  });

  useEffect(() => {
    memuatData();
  }, []);

  const memuatData = async () => {
    setLoading(true);
    try {
      const data = await ambilSemuaUjianAdmin();
      setUjianList(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const tanganiSimpan = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await simpanUjian({
        id: formUjian.id || undefined,
        judulUjian: formUjian.judulUjian,
        deskripsi: formUjian.deskripsi,
        durasiMenit: Number(formUjian.durasiMenit),
        biayaRinCoin: Number(formUjian.biayaRinCoin),
        wajibFullscreen: formUjian.wajibFullscreen,
        batasMaksimalPelanggaran: Number(formUjian.batasMaksimalPelanggaran),
        apakahAktif: formUjian.apakahAktif
      });
      setBukaModal(false);
      memuatData();
    } catch (error) {
      alert('Kegagalan sistem saat merekam parameter simulasi ujian.');
    }
  };

  const tanganiHapus = async (id: string) => {
    if (confirm('Verifikasi Kritis: Apakah Anda yakin akan menghapus ujian ini secara permanen beserta seluruh bank soal dan nilai siswa?')) {
      try {
        await hapusUjian(id);
        memuatData();
      } catch (error) {
        alert('Gagal mengeksekusi penghapusan pada basis data.');
      }
    }
  };

  const bukaModalTambah = () => {
    setFormUjian({ id: '', judulUjian: '', deskripsi: '', durasiMenit: 90, biayaRinCoin: 0, wajibFullscreen: true, batasMaksimalPelanggaran: 3, apakahAktif: false });
    setBukaModal(true);
  };

  const bukaModalEdit = (u: any) => {
    setFormUjian({
      id: u.id, judulUjian: u.judulUjian, deskripsi: u.deskripsi || '', durasiMenit: u.durasiMenit, biayaRinCoin: u.biayaRinCoin, wajibFullscreen: u.wajibFullscreen, batasMaksimalPelanggaran: u.batasMaksimalPelanggaran, apakahAktif: u.apakahAktif
    });
    setBukaModal(true);
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Manajemen Simulasi Ujian & Anti-Curang</h1>
          <p className="text-slate-500 mt-1">Susun metrik evaluasi ketat dan atur toleransi pengawasan sistem ujian siswa.</p>
        </div>
        <button onClick={bukaModalTambah} className="flex items-center justify-center gap-2 bg-indigo-600 text-white px-5 py-2.5 rounded-xl font-bold hover:bg-indigo-700 transition shadow-sm border border-indigo-700">
          <Plus className="w-5 h-5" /> Inisialisasi Ujian Baru
        </button>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {[1,2,3].map(i => <div key={i} className="h-64 bg-slate-200 animate-pulse rounded-2xl border border-slate-300"></div>)}
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {ujianList.map(u => (
            <div key={u.id} className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden flex flex-col group">
              <div className="p-6 border-b border-slate-100 flex-1">
                <div className="flex justify-between items-start mb-4">
                  <span className={`px-2.5 py-1 text-xs font-bold rounded-full border ${u.apakahAktif ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-slate-100 text-slate-500 border-slate-200'}`}>
                    {u.apakahAktif ? 'Telah Dipublikasi' : 'Draf Tertutup'}
                  </span>
                  <span className={`px-2.5 py-1 text-xs font-bold rounded-full border ${u.wajibFullscreen ? 'bg-rose-50 text-rose-700 border-rose-200' : 'bg-slate-50 text-slate-600 border-slate-200'}`}>
                    {u.wajibFullscreen ? 'LOCKDOWN AKTIF' : 'NORMAL MODE'}
                  </span>
                </div>
                
                <h3 className="text-lg font-black text-slate-900 mb-2 leading-tight group-hover:text-indigo-700 transition-colors">{u.judulUjian}</h3>
                <p className="text-sm text-slate-500 mb-5 line-clamp-2">{u.deskripsi}</p>
                
                <div className="grid grid-cols-2 gap-4 mt-auto">
                  <div className="flex flex-col">
                    <span className="text-[10px] uppercase font-bold text-slate-400">Durasi</span>
                    <span className="text-sm font-semibold text-slate-700">{u.durasiMenit} Menit</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[10px] uppercase font-bold text-slate-400">Toleransi</span>
                    <span className="text-sm font-semibold text-slate-700">{u.batasMaksimalPelanggaran} Pelanggaran</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[10px] uppercase font-bold text-slate-400">Butir Soal</span>
                    <span className="text-sm font-semibold text-indigo-600 flex items-center gap-1"><FileText className="w-3.5 h-3.5"/> {u._count.bankSoal}</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[10px] uppercase font-bold text-slate-400">Riwayat Sesi</span>
                    <span className="text-sm font-semibold text-emerald-600 flex items-center gap-1"><Users className="w-3.5 h-3.5"/> {u._count.sesiUjianSiswa}</span>
                  </div>
                </div>
              </div>
              
              <div className="bg-slate-50 p-4 border-t border-slate-200 flex flex-col sm:flex-row gap-2 justify-between">
                <div className="flex gap-2">
                  <button onClick={() => bukaModalEdit(u)} className="p-2.5 bg-white border border-slate-300 rounded-lg text-slate-500 hover:text-indigo-600 hover:border-indigo-300 transition shadow-sm" title="Modifikasi Konfigurasi">
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button onClick={() => tanganiHapus(u.id)} className="p-2.5 bg-white border border-slate-300 rounded-lg text-slate-500 hover:text-rose-600 hover:border-rose-300 transition shadow-sm" title="Hapus Ujian">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                <div className="flex gap-2">
                  <Link href={`/admin/ujian/${u.id}/soal`} className="flex-1 flex justify-center items-center gap-1.5 px-3 py-2 bg-indigo-50 border border-indigo-200 text-indigo-700 text-sm font-bold rounded-lg hover:bg-indigo-600 hover:text-white transition shadow-sm">
                    Bank Soal
                  </Link>
                  <Link href={`/admin/ujian/${u.id}/laporan`} className="flex-1 flex justify-center items-center gap-1.5 px-3 py-2 bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm font-bold rounded-lg hover:bg-emerald-600 hover:text-white transition shadow-sm">
                    Laporan <BarChart2 className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            </div>
          ))}
          
          {ujianList.length === 0 && (
            <div className="col-span-full py-16 text-center text-slate-500 bg-white border border-dashed border-slate-300 rounded-2xl flex flex-col items-center">
              <ShieldAlert className="w-16 h-16 text-slate-300 mb-4" />
              <p className="font-medium text-lg">Pangkalan data simulasi ujian kosong. Sistem menunggu perintah inisialisasi pertama.</p>
            </div>
          )}
        </div>
      )}

      {bukaModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-slate-200 bg-slate-50">
              <h3 className="text-lg font-black text-slate-900 uppercase tracking-wide">{formUjian.id ? 'Ubah Parameter Evaluasi Ujian' : 'Deklarasi Evaluasi Ujian Baru'}</h3>
            </div>
            <form onSubmit={tanganiSimpan} className="p-6 space-y-5">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">Judul Resmi Simulasi</label>
                <input type="text" required value={formUjian.judulUjian} onChange={(e) => setFormUjian({...formUjian, judulUjian: e.target.value})} className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500" placeholder="Misal: TryOut Akbar SBMPTN Gel. 1" />
              </div>
              
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">Keterangan Objektif & Aturan Khusus</label>
                <textarea rows={3} value={formUjian.deskripsi} onChange={(e) => setFormUjian({...formUjian, deskripsi: e.target.value})} className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"></textarea>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1">Alokasi Waktu (Menit)</label>
                  <input type="number" min="1" required value={formUjian.durasiMenit} onChange={(e) => setFormUjian({...formUjian, durasiMenit: e.target.valueAsNumber})} className="w-full px-4 py-2 border border-slate-300 rounded-lg" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1">Tarif Premium (RinCoin)</label>
                  <input type="number" min="0" required value={formUjian.biayaRinCoin} onChange={(e) => setFormUjian({...formUjian, biayaRinCoin: e.target.valueAsNumber})} className="w-full px-4 py-2 border border-slate-300 rounded-lg text-amber-600 font-bold" />
                  <p className="text-[10px] text-slate-500 mt-1">Set 0 agar ujian 100% gratis.</p>
                </div>
              </div>

              <div className="bg-rose-50 p-5 rounded-xl border border-rose-200">
                <h4 className="text-sm font-black text-rose-800 mb-3 uppercase tracking-wider flex items-center gap-2"><ShieldAlert className="w-4 h-4"/> Konfigurasi Keamanan (Anti-Cheat Engine)</h4>
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <input type="checkbox" id="wajibFullscreen" checked={formUjian.wajibFullscreen} onChange={(e) => setFormUjian({...formUjian, wajibFullscreen: e.target.checked})} className="w-5 h-5 text-rose-600 rounded focus:ring-rose-600 border-rose-300" />
                    <div>
                      <label htmlFor="wajibFullscreen" className="text-sm font-bold text-rose-900 cursor-pointer">Wajibkan Mode Layar Penuh (Lockdown)</label>
                      <p className="text-xs text-rose-700">Jika aktif, siswa yang menekan tombol Escape/keluar fullscreen akan dicatat sebagai pelanggaran.</p>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-rose-900 mb-1">Batas Maksimal Toleransi Pelanggaran</label>
                    <input type="number" min="1" max="10" required value={formUjian.batasMaksimalPelanggaran} onChange={(e) => setFormUjian({...formUjian, batasMaksimalPelanggaran: e.target.valueAsNumber})} className="w-full px-4 py-2 border border-rose-300 rounded-lg text-rose-700 font-bold bg-white" />
                    <p className="text-xs text-rose-700 mt-1">Jika jumlah pelanggaran (pindah tab, hilang fokus) melebihi batas ini, ujian di-diskualifikasi otomatis.</p>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3 p-4 bg-emerald-50 rounded-xl border border-emerald-200">
                <input type="checkbox" id="apakahAktif" checked={formUjian.apakahAktif} onChange={(e) => setFormUjian({...formUjian, apakahAktif: e.target.checked})} className="w-5 h-5 text-emerald-600 rounded focus:ring-emerald-600 border-emerald-300" />
                <div>
                  <label htmlFor="apakahAktif" className="text-sm font-bold text-emerald-900 cursor-pointer">Publikasikan Ke Daftar Ujian Siswa</label>
                  <p className="text-xs text-emerald-700 mt-0.5">Setelah diaktifkan, kandidat dapat mendaftar dan mengeksekusi sesi ini.</p>
                </div>
              </div>

              <div className="pt-4 flex justify-end gap-3 border-t border-slate-100">
                <button type="button" onClick={() => setBukaModal(false)} className="px-5 py-2.5 text-slate-600 font-bold hover:bg-slate-100 rounded-xl transition">Batalkan Proses</button>
                <button type="submit" className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl transition shadow-md">Rekam Evaluasi Sistem</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
