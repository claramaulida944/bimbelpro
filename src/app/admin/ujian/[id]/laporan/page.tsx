'use client';

import { useState, useEffect } from 'react';
import { ambilLaporanAnalitikUjianAdmin } from '@/actions/ujian-admin';
import { useParams } from 'next/navigation';
import { ArrowLeft, BarChart3, Users, XCircle, Trophy, Activity, AlertTriangle, Fingerprint } from 'lucide-react';
import Link from 'next/link';

export default function LaporanAnalitikUjianAdmin() {
  const params = useParams();
  const idUjian = params.id as string;

  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  const [logTerpilih, setLogTerpilih] = useState<any[] | null>(null);

  useEffect(() => {
    memuatLaporan();
  }, [idUjian]);

  const memuatLaporan = async () => {
    setLoading(true);
    try {
      const res = await ambilLaporanAnalitikUjianAdmin(idUjian);
      setData(res);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="p-12 text-center text-slate-500 font-bold animate-pulse">Menghitung agregasi telemetri ujian siswa...</div>;
  if (!data) return <div className="p-12 text-center text-rose-500 font-bold bg-rose-50 rounded-2xl border border-rose-200">Kegagalan mengambil laporan analitik. Ujian tidak eksis.</div>;

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-12">
      <div className="flex items-center gap-4 bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
        <Link href="/admin/ujian" className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-500 hover:text-indigo-600 transition">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-black text-slate-900 uppercase tracking-wide">Pusat Analitik & Laporan Performa</h1>
          <p className="text-slate-500 font-medium">Ujian Simulasi Tertarget: <span className="text-indigo-600 font-bold">{data.judulUjian}</span></p>
        </div>
      </div>

      {/* Metrik Utama */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 flex flex-col">
          <div className="flex items-center gap-3 text-slate-500 mb-2">
            <Users className="w-5 h-5" /> <span className="text-xs font-bold uppercase tracking-widest">Partisipan Valid</span>
          </div>
          <div className="text-4xl font-black text-slate-900 mt-auto">{data.statistik.jumlahPeserta} <span className="text-sm text-slate-400 font-medium">Sesi</span></div>
        </div>
        <div className="bg-indigo-600 rounded-2xl p-6 shadow-md text-white flex flex-col relative overflow-hidden">
          <div className="absolute right-0 bottom-0 opacity-10 translate-x-1/4 translate-y-1/4"><Activity className="w-32 h-32" /></div>
          <div className="flex items-center gap-3 text-indigo-200 mb-2 relative z-10">
            <BarChart3 className="w-5 h-5" /> <span className="text-xs font-bold uppercase tracking-widest">Rata-rata Kelas</span>
          </div>
          <div className="text-4xl font-black mt-auto relative z-10">{data.statistik.rataRataNilai}</div>
        </div>
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 flex flex-col">
          <div className="flex items-center gap-3 text-slate-500 mb-2">
            <Trophy className="w-5 h-5 text-amber-500" /> <span className="text-xs font-bold uppercase tracking-widest">Peringkat Atas/Bawah</span>
          </div>
          <div className="mt-auto flex items-baseline gap-2">
            <span className="text-3xl font-black text-emerald-600">{data.statistik.nilaiTertinggi}</span>
            <span className="text-slate-400 font-black">/</span>
            <span className="text-xl font-bold text-rose-500">{data.statistik.nilaiTerendah}</span>
          </div>
        </div>
        <div className="bg-rose-50 rounded-2xl p-6 shadow-sm border border-rose-200 flex flex-col">
          <div className="flex items-center gap-3 text-rose-600 mb-2">
            <AlertTriangle className="w-5 h-5" /> <span className="text-xs font-bold uppercase tracking-widest">Indikasi Curang</span>
          </div>
          <div className="text-4xl font-black text-rose-700 mt-auto">{data.statistik.totalDiskualifikasi} <span className="text-sm text-rose-500 font-medium">Kasus Blacklist</span></div>
        </div>
      </div>

      {/* Grid Bawah: Kelemahan Topik & Tabel Sesi */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Kolom Kiri: Kelemahan Topik */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-6">
            <div className="mb-6 border-b border-slate-100 pb-4">
              <h3 className="text-lg font-black text-slate-900 uppercase tracking-wide">Peta Area Defisit Akademik</h3>
              <p className="text-xs text-slate-500 mt-1">Mengukur frekuensi kesalahan (error rate) per label topik spesifik dari seluruh pengerjaan siswa.</p>
            </div>
            
            <div className="space-y-5">
              {data.kelemahanTopik.length === 0 && (
                <div className="text-center py-8 text-slate-400 font-bold text-sm">Tidak ada data kesalahan relevan untuk direkapitulasi.</div>
              )}
              {data.kelemahanTopik.map((topik: any, i: number) => (
                <div key={topik.topik}>
                  <div className="flex justify-between text-sm font-bold mb-1.5">
                    <span className="text-slate-700 uppercase tracking-wider">{topik.topik}</span>
                    <span className={`${topik.persentaseKesalahan > 50 ? 'text-rose-600' : 'text-amber-600'}`}>Error {topik.persentaseKesalahan.toFixed(1)}%</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                    <div 
                      className={`h-2.5 rounded-full ${topik.persentaseKesalahan > 50 ? 'bg-rose-500' : topik.persentaseKesalahan > 30 ? 'bg-amber-500' : 'bg-emerald-500'}`} 
                      style={{ width: `${topik.persentaseKesalahan}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Kolom Kanan: Tabel Riwayat Sesi */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="p-6 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
              <h3 className="text-lg font-black text-slate-900 uppercase tracking-wide">Audit Tabel Sesi Siswa</h3>
              <span className="text-xs font-bold bg-indigo-100 text-indigo-700 px-3 py-1 rounded-full">Record Total: {data.sesiSiswa.length}</span>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200">
                    <th className="p-4 text-xs font-black text-slate-500 uppercase tracking-widest">Identitas Peserta</th>
                    <th className="p-4 text-xs font-black text-slate-500 uppercase tracking-widest text-center">Integritas</th>
                    <th className="p-4 text-xs font-black text-slate-500 uppercase tracking-widest text-center">Skor Akhir</th>
                    <th className="p-4 text-xs font-black text-slate-500 uppercase tracking-widest text-right">Tindakan Analisa</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {data.sesiSiswa.map((sesi: any) => (
                    <tr key={sesi.id} className="hover:bg-slate-50/50 transition">
                      <td className="p-4">
                        <div className="font-bold text-slate-900">{sesi.siswa.nama}</div>
                        <div className="text-xs text-slate-500 font-mono mt-0.5">{sesi.siswa.email}</div>
                      </td>
                      <td className="p-4 text-center">
                        {sesi.status === 'DIDISKUALIFIKASI_CURANG' ? (
                          <span className="inline-flex items-center gap-1 bg-rose-100 text-rose-700 px-2.5 py-1 rounded-md text-[10px] font-black uppercase tracking-wider">
                            <XCircle className="w-3 h-3" /> BLOCKED
                          </span>
                        ) : sesi.status === 'SEDANG_DIKERJAKAN' ? (
                          <span className="inline-flex items-center gap-1 bg-amber-100 text-amber-700 px-2.5 py-1 rounded-md text-[10px] font-black uppercase tracking-wider">
                            IN-PROGRESS
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 bg-emerald-100 text-emerald-700 px-2.5 py-1 rounded-md text-[10px] font-black uppercase tracking-wider">
                            VALID
                          </span>
                        )}
                        {sesi.totalPelanggaran > 0 && (
                          <div className="text-[10px] text-rose-500 font-bold mt-1">({sesi.totalPelanggaran} Kasus)</div>
                        )}
                      </td>
                      <td className="p-4 text-center">
                        <span className={`text-xl font-black ${sesi.nilaiAkhir >= 70 ? 'text-emerald-600' : 'text-rose-600'}`}>
                          {sesi.nilaiAkhir.toFixed(1)}
                        </span>
                      </td>
                      <td className="p-4 text-right">
                        {sesi.logPelanggaran.length > 0 ? (
                          <button 
                            onClick={() => setLogTerpilih(sesi.logPelanggaran)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-rose-50 text-rose-600 hover:bg-rose-600 hover:text-white border border-rose-200 transition rounded-lg text-xs font-bold shadow-sm"
                          >
                            <Fingerprint className="w-3.5 h-3.5" /> Investigasi Log
                          </button>
                        ) : (
                          <span className="text-xs font-bold text-slate-400 italic">Clear (Aman)</span>
                        )}
                      </td>
                    </tr>
                  ))}
                  {data.sesiSiswa.length === 0 && (
                    <tr>
                      <td colSpan={4} className="p-12 text-center text-slate-500 font-bold">Belum ada telemetri masuk dari peserta ujian.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* Modal Log Pelanggaran */}
      {logTerpilih && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full overflow-hidden border border-slate-200">
            <div className="p-6 bg-rose-600 text-white flex justify-between items-center">
              <h3 className="text-lg font-black uppercase tracking-wider flex items-center gap-2"><AlertTriangle className="w-5 h-5"/> Bukti Log Forensik Keamanan</h3>
              <button onClick={() => setLogTerpilih(null)} className="p-1 hover:bg-rose-700 rounded-lg transition"><XCircle className="w-6 h-6"/></button>
            </div>
            <div className="p-6 max-h-[60vh] overflow-y-auto bg-slate-50">
              <div className="space-y-4">
                {logTerpilih.map((log) => (
                  <div key={log.id} className="bg-white p-4 rounded-xl shadow-sm border border-rose-100 relative">
                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-rose-500 rounded-l-xl"></div>
                    <div className="flex justify-between items-start mb-2 pl-2">
                      <span className="text-xs font-black text-rose-700 bg-rose-50 px-2 py-0.5 rounded border border-rose-200">{log.tipePelanggaran.replace(/_/g, ' ')}</span>
                      <span className="text-[10px] font-bold text-slate-400">{new Date(log.waktuTerjadi).toLocaleString('id-ID')}</span>
                    </div>
                    <p className="text-sm font-medium text-slate-600 pl-2">{log.catatan}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
