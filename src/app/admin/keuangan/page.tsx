'use client';

import { useState, useEffect } from 'react';
import { ambilStatistikKeuangan, ambilSemuaTransaksi, ambilDaftarPaketTopupAdmin, simpanPaketTopup, hapusPaketTopup } from '@/actions/admin-keuangan';
import { DollarSign, Coins, TrendingUp, Plus, Edit2, Trash2 } from 'lucide-react';

export default function HalamanKeuanganAdmin() {
  const [statistik, setStatistik] = useState<any>(null);
  const [transaksi, setTransaksi] = useState<any[]>([]);
  const [paket, setPaket] = useState<any[]>([]);
  
  const [loading, setLoading] = useState(true);
  
  // State form paket
  const [bukaModal, setBukaModal] = useState(false);
  const [formPaket, setFormPaket] = useState({ id: '', namaPaket: '', jumlahKoin: 0, hargaRupiah: 0, apakahAktif: true });

  useEffect(() => {
    memuatData();
  }, []);

  const memuatData = async () => {
    setLoading(true);
    try {
      const stat = await ambilStatistikKeuangan();
      const trx = await ambilSemuaTransaksi('SEMUA');
      const pkt = await ambilDaftarPaketTopupAdmin();
      setStatistik(stat);
      setTransaksi(trx);
      setPaket(pkt);
    } catch (error) {
      console.error('Gagal mengambil data administrasi keuangan', error);
    } finally {
      setLoading(false);
    }
  };

  const formatRupiah = (angka: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(angka);
  };

  const tanganiSimpanPaket = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await simpanPaketTopup({
        id: formPaket.id || undefined,
        namaPaket: formPaket.namaPaket,
        jumlahKoin: Number(formPaket.jumlahKoin),
        hargaRupiah: Number(formPaket.hargaRupiah),
        apakahAktif: formPaket.apakahAktif
      });
      setBukaModal(false);
      memuatData();
    } catch (error) {
      alert('Gagal menyimpan konfigurasi paket.');
    }
  };

  const tanganiHapusPaket = async (id: string) => {
    if (confirm('Anda yakin ingin menghapus paket ini? Tindakan ini tidak dapat dibatalkan.')) {
      try {
        await hapusPaketTopup(id);
        memuatData();
      } catch (error) {
        alert('Gagal menghapus paket.');
      }
    }
  };

  const tanganiEdit = (p: any) => {
    setFormPaket({ id: p.id, namaPaket: p.namaPaket, jumlahKoin: p.jumlahKoin, hargaRupiah: p.hargaRupiah, apakahAktif: p.apakahAktif });
    setBukaModal(true);
  };

  const bukaTambahModal = () => {
    setFormPaket({ id: '', namaPaket: '', jumlahKoin: 0, hargaRupiah: 0, apakahAktif: true });
    setBukaModal(true);
  };

  if (loading && !statistik) {
    return <div className="text-slate-500 font-medium">Memuat data keuangan sistem...</div>;
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Manajemen Keuangan & Koin</h1>
        <p className="text-slate-500 mt-1">Pantau arus kas pendapatan, distribusi koin beredar, dan manajemen harga paket.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-emerald-50 flex items-center justify-center border border-emerald-100">
            <DollarSign className="w-6 h-6 text-emerald-600" />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500">Total Pendapatan</p>
            <p className="text-2xl font-bold text-slate-900">{formatRupiah(statistik?.totalPendapatan || 0)}</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-amber-50 flex items-center justify-center border border-amber-100">
            <Coins className="w-6 h-6 text-amber-500" />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500">Total Koin Beredar</p>
            <p className="text-2xl font-bold text-slate-900">{statistik?.totalRinCoinBeredar || 0} RC</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-indigo-50 flex items-center justify-center border border-indigo-100">
            <TrendingUp className="w-6 h-6 text-indigo-600" />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500">Transaksi Sukses</p>
            <p className="text-2xl font-bold text-slate-900">{statistik?.jumlahTransaksiSukses || 0}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-slate-900">Paket Penjualan</h2>
            <button onClick={bukaTambahModal} className="text-sm flex items-center gap-1 bg-indigo-50 text-indigo-700 px-3 py-1.5 rounded-lg hover:bg-indigo-100 font-medium transition">
              <Plus className="w-4 h-4" /> Tambah
            </button>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 divide-y divide-slate-100">
            {paket.map((p) => (
              <div key={p.id} className="p-4 flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-slate-900">{p.namaPaket}</h3>
                  <p className="text-sm text-slate-500">{p.jumlahKoin} RC — {formatRupiah(p.hargaRupiah)}</p>
                  <span className={`inline-block mt-2 px-2 py-0.5 text-xs font-medium rounded-full ${p.apakahAktif ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-600'}`}>
                    {p.apakahAktif ? 'Aktif' : 'Nonaktif'}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={() => tanganiEdit(p)} className="p-2 text-slate-400 hover:text-indigo-600 transition bg-slate-50 rounded-lg" title="Edit">
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button onClick={() => tanganiHapusPaket(p.id)} className="p-2 text-slate-400 hover:text-rose-600 transition bg-slate-50 rounded-lg" title="Hapus">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
            {paket.length === 0 && <div className="p-6 text-center text-slate-500 text-sm">Belum ada paket koin terdaftar.</div>}
          </div>
        </div>

        <div className="lg:col-span-2 space-y-4">
          <h2 className="text-lg font-semibold text-slate-900">Audit Transaksi Siswa</h2>
          
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-200">
                <thead className="bg-slate-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Data Siswa</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Aliran Dana</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Status</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-slate-200">
                  {transaksi.map((t) => (
                    <tr key={t.id} className="hover:bg-slate-50">
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-slate-900">{t.siswa.nama}</div>
                        <div className="text-xs text-slate-500">{t.siswa.email}</div>
                        <div className="text-xs text-slate-400 mt-1">{new Date(t.tanggalDibuat).toLocaleString('id-ID')}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm font-bold text-amber-500">+{t.jumlahKoin} RC</div>
                        <div className="text-xs text-slate-500">{formatRupiah(t.totalRupiah)}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium ${
                          t.status === 'BERHASIL' ? 'bg-emerald-50 text-emerald-700' : 
                          t.status === 'MENUNGGU_PEMBAYARAN' ? 'bg-amber-50 text-amber-700' : 
                          'bg-rose-50 text-rose-700'
                        }`}>
                          {t.status.replace('_', ' ')}
                        </span>
                      </td>
                    </tr>
                  ))}
                  {transaksi.length === 0 && (
                    <tr><td colSpan={3} className="px-6 py-8 text-center text-slate-500">Pusat data belum mendeteksi riwayat transaksi.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {bukaModal && (
        <div className="fixed inset-0 bg-slate-900/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full">
            <div className="p-6 border-b border-slate-200">
              <h3 className="text-lg font-bold text-slate-900">{formPaket.id ? 'Ubah Konfigurasi Paket' : 'Buat Paket Baru'}</h3>
            </div>
            <form onSubmit={tanganiSimpanPaket} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Nama Paket Publik</label>
                <input type="text" required value={formPaket.namaPaket} onChange={(e) => setFormPaket({...formPaket, namaPaket: e.target.value})} className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-600 focus:border-indigo-600 text-slate-900" placeholder="Misal: Paket Cerdas" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Jumlah Koin (RC)</label>
                  <input type="number" required min="1" value={formPaket.jumlahKoin} onChange={(e) => setFormPaket({...formPaket, jumlahKoin: e.target.valueAsNumber})} className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-600 text-slate-900" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Harga (Rupiah)</label>
                  <input type="number" required min="0" value={formPaket.hargaRupiah} onChange={(e) => setFormPaket({...formPaket, hargaRupiah: e.target.valueAsNumber})} className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-600 text-slate-900" />
                </div>
              </div>
              <div className="flex items-center gap-3">
                <input type="checkbox" id="apakahAktif" checked={formPaket.apakahAktif} onChange={(e) => setFormPaket({...formPaket, apakahAktif: e.target.checked})} className="w-4 h-4 text-indigo-600 border-slate-300 rounded focus:ring-indigo-600" />
                <label htmlFor="apakahAktif" className="text-sm font-medium text-slate-700 cursor-pointer">Tersedia untuk dibeli siswa</label>
              </div>
              <div className="pt-4 flex gap-3 justify-end">
                <button type="button" onClick={() => setBukaModal(false)} className="px-4 py-2 text-slate-600 font-medium hover:bg-slate-50 rounded-lg transition">Batalkan</button>
                <button type="submit" className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg transition">Simpan Permanen</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
