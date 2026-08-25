'use client';

import { useState, useEffect } from 'react';
import { ambilDataDompetSiswa, buatTransaksiTopup } from '@/actions/dompet';
import { Coins, AlertCircle, ArrowRight, Wallet as WalletIcon, Clock, CheckCircle2, XCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function HalamanDompetSiswa() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [memprosesPaket, setMemprosesPaket] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    memuatData();
  }, []);

  const memuatData = async () => {
    try {
      const hasil = await ambilDataDompetSiswa();
      setData(hasil);
    } catch (error) {
      console.error('Gagal mengambil data dompet', error);
    } finally {
      setLoading(false);
    }
  };

  const tanganiBeli = async (idPaket: string) => {
    setMemprosesPaket(idPaket);
    try {
      const respon = await buatTransaksiTopup(idPaket);
      if (respon.sukses && respon.urlPembayaran) {
        window.location.href = respon.urlPembayaran;
      }
    } catch (error) {
      alert('Terjadi kesalahan saat memproses tagihan.');
    } finally {
      setMemprosesPaket(null);
    }
  };

  const formatRupiah = (angka: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(angka);
  };

  if (loading) {
    return <div className="text-slate-500 font-medium">Memuat data dompet...</div>;
  }

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Dompet RinCoin</h1>
        <p className="text-slate-500 mt-1">Kelola saldo koin Anda untuk membeli layanan premium secara instan.</p>
      </div>

      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-amber-50 flex items-center justify-center border border-amber-100">
            <WalletIcon className="w-8 h-8 text-amber-500" />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500">Saldo Saat Ini</p>
            <div className="text-3xl font-bold text-slate-900 flex items-center gap-2">
              {data?.saldoRinCoin || 0} <span className="text-amber-500">RC</span>
            </div>
          </div>
        </div>
        <div className="bg-indigo-50 text-indigo-700 px-4 py-3 rounded-lg flex items-start gap-3">
          <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
          <div className="text-sm">
            <p className="font-semibold">Nilai Konversi Resmi</p>
            <p className="mt-0.5">1 RinCoin setara dengan Rp 1.000</p>
          </div>
        </div>
      </div>

      <div>
        <h2 className="text-lg font-semibold text-slate-900 mb-4">Pilih Paket Top-up</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {data?.paketAktif?.map((paket: any) => (
            <div key={paket.id} className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden flex flex-col hover:border-indigo-300 transition-colors">
              <div className="p-6 flex-1 flex flex-col items-center text-center">
                <Coins className="w-12 h-12 text-amber-400 mb-4" />
                <h3 className="text-xl font-bold text-slate-900 mb-1">{paket.namaPaket}</h3>
                <div className="text-2xl font-black text-amber-500 mb-4">{paket.jumlahKoin} RC</div>
                <div className="mt-auto text-lg font-medium text-slate-600">
                  {formatRupiah(paket.hargaRupiah)}
                </div>
              </div>
              <div className="p-4 bg-slate-50 border-t border-slate-100">
                <button
                  onClick={() => tanganiBeli(paket.id)}
                  disabled={memprosesPaket !== null}
                  className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2.5 rounded-lg transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {memprosesPaket === paket.id ? 'Memproses...' : 'Beli Sekarang'}
                  {memprosesPaket !== paket.id && <ArrowRight className="w-4 h-4" />}
                </button>
              </div>
            </div>
          ))}
          {data?.paketAktif?.length === 0 && (
            <div className="col-span-full py-8 text-center text-slate-500 bg-white rounded-xl border border-dashed border-slate-300">
              Belum ada paket top-up yang tersedia saat ini.
            </div>
          )}
        </div>
      </div>

      <div>
        <h2 className="text-lg font-semibold text-slate-900 mb-4">Riwayat Transaksi</h2>
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200">
              <thead className="bg-slate-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Tanggal</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Tipe</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Koin</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Nominal</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-slate-200">
                {data?.riwayat?.map((tr: any) => (
                  <tr key={tr.id} className="hover:bg-slate-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                      {new Date(tr.tanggalDibuat).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900 font-medium">
                      {tr.tipeTransaksi.replace('_', ' ')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-amber-600 font-semibold">
                      +{tr.jumlahKoin} RC
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                      {formatRupiah(tr.totalRupiah)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {tr.status === 'BERHASIL' && <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700"><CheckCircle2 className="w-3.5 h-3.5"/> Sukses</span>}
                      {tr.status === 'MENUNGGU_PEMBAYARAN' && <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-amber-50 text-amber-700"><Clock className="w-3.5 h-3.5"/> Menunggu</span>}
                      {(tr.status === 'GAGAL' || tr.status === 'KADALUARSA') && <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-rose-50 text-rose-700"><XCircle className="w-3.5 h-3.5"/> Gagal</span>}
                    </td>
                  </tr>
                ))}
                {data?.riwayat?.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-6 py-8 text-center text-sm text-slate-500">Belum ada riwayat transaksi.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
