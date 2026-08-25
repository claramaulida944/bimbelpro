'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ambilLaporanAnalitikUjianAdmin, izinkanUjianUlangSiswa } from '@/actions/ujian-admin';
import { ArrowLeft, Users, Trophy, AlertTriangle, Fingerprint, RefreshCw, XCircle, CheckCircle2, ChevronRight } from 'lucide-react';
import Link from 'next/link';

export default function DetailUjianAdmin() {
  const params = useParams();
  const idUjian = params.id as string;
  const router = useRouter();

  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [notif, setNotif] = useState({ tipe: '', pesan: '' });
  
  const [modalReset, setModalReset] = useState<{ buka: boolean, sesiId: string, namaSiswa: string }>({
    buka: false,
    sesiId: '',
    namaSiswa: ''
  });
  const [prosesReset, setProsesReset] = useState(false);
  const [logTerpilih, setLogTerpilih] = useState<any[] | null>(null);

  useEffect(() => {
    muatDataUjian();
  }, [idUjian]);

  const muatDataUjian = async () => {
    setLoading(true);
    try {
      const res = await ambilLaporanAnalitikUjianAdmin(idUjian);
      setData(res);
    } catch (error: any) {
      setNotif({ tipe: 'error', pesan: error.message || 'Gagal memuat data ujian.' });
    } finally {
      setLoading(false);
    }
  };

  const handleBukaModalReset = (sesiId: string, namaSiswa: string) => {
    setModalReset({ buka: true, sesiId, namaSiswa });
  };

  const handleIzinkanUlang = async () => {
    setProsesReset(true);
    try {
      const res = await izinkanUjianUlangSiswa(modalReset.sesiId);
      if (res.sukses) {
        setNotif({ tipe: 'success', pesan: res.pesan });
        setModalReset({ buka: false, sesiId: '', namaSiswa: '' });
        // Refresh data
        await muatDataUjian();
      }
    } catch (err: any) {
      setNotif({ tipe: 'error', pesan: err.message || 'Gagal memberikan izin ujian ulang.' });
    } finally {
      setProsesReset(false);
    }
  };

  if (loading) {
    return (
      <div className="p-12 text-center text-slate-500 font-bold animate-pulse">
        Menghubungkan ke server dan mengambil laporan analitik...
      </div>
    );
  }

  if (!data) {
    return (
      <div className="p-12 text-center text-rose-500 font-bold bg-rose-50 rounded-2xl border border-rose-200">
        Ujian tidak ditemukan atau Anda tidak memiliki hak akses.
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-4 bg-white p-6 rounded-2xl shadow-sm border border-slate-200 justify-between">
        <div className="flex items-center gap-4">
          <Link href="/admin/ujian" className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-500 hover:text-indigo-600 transition">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-black text-slate-900 uppercase tracking-wide">Detail & Administrasi Ujian</h1>
            <p className="text-slate-500 font-medium">
              Judul Simulasi: <span className="text-indigo-600 font-bold">{data.judulUjian}</span>
            </p>
          </div>
        </div>
        <Link 
          href={`/admin/ujian/${idUjian}/laporan`} 
          className="flex items-center justify-center gap-1.5 px-5 py-2.5 bg-indigo-50 border border-indigo-200 text-indigo-700 font-bold rounded-xl hover:bg-indigo-600 hover:text-white transition"
        >
          Lihat Analitik Kelemahan <ChevronRight className="w-4 h-4" />
        </Link>
      </div>

      {/* Toast Notification */}
      {notif.pesan && (
        <div className={`p-4 rounded-xl flex items-center space-x-3 border ${
          notif.tipe === 'success' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-rose-50 text-rose-700 border-rose-200'
        }`}>
          {notif.tipe === 'success' ? <CheckCircle2 className="w-5 h-5 shrink-0" /> : <XCircle className="w-5 h-5 shrink-0" />}
          <span className="font-semibold text-sm">{notif.pesan}</span>
        </div>
      )}

      {/* Grid Metrik Utama */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 flex flex-col">
          <div className="flex items-center gap-3 text-slate-500 mb-2">
            <Users className="w-5 h-5" />
            <span className="text-xs font-bold uppercase tracking-widest text-slate-400">Total Partisipan</span>
          </div>
          <div className="text-4xl font-black text-slate-900 mt-auto">{data.statistik.jumlahPeserta}</div>
        </div>
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 flex flex-col">
          <div className="flex items-center gap-3 text-slate-500 mb-2">
            <Trophy className="w-5 h-5 text-indigo-600" />
            <span className="text-xs font-bold uppercase tracking-widest text-slate-400">Rata-rata Nilai</span>
          </div>
          <div className="text-4xl font-black text-indigo-600 mt-auto">{data.statistik.rataRataNilai}</div>
        </div>
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 flex flex-col">
          <div className="flex items-center gap-3 text-slate-500 mb-2">
            <Trophy className="w-5 h-5 text-emerald-600" />
            <span className="text-xs font-bold uppercase tracking-widest text-slate-400">Nilai Tertinggi</span>
          </div>
          <div className="text-4xl font-black text-emerald-600 mt-auto">{data.statistik.nilaiTertinggi}</div>
        </div>
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 flex flex-col">
          <div className="flex items-center gap-3 text-slate-500 mb-2">
            <AlertTriangle className="w-5 h-5 text-rose-500" />
            <span className="text-xs font-bold uppercase tracking-widest text-slate-400">Didiskualifikasi</span>
          </div>
          <div className="text-4xl font-black text-rose-600 mt-auto">{data.statistik.totalDiskualifikasi}</div>
        </div>
      </div>

      {/* Bagian Utama: Daftar Peserta & Nilai Siswa */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-6 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
          <h3 className="text-lg font-black text-slate-900 uppercase tracking-wide">Daftar Peserta & Nilai Siswa</h3>
          <span className="text-xs font-bold bg-indigo-100 text-indigo-700 px-3 py-1 rounded-full">
            Total Sesi: {data.sesiSiswa.length}
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="p-4 text-xs font-black text-slate-500 uppercase tracking-widest">Nama Lengkap Siswa</th>
                <th className="p-4 text-xs font-black text-slate-500 uppercase tracking-widest text-center">Integritas CBT</th>
                <th className="p-4 text-xs font-black text-slate-500 uppercase tracking-widest text-center">Skor Akhir</th>
                <th className="p-4 text-xs font-black text-slate-500 uppercase tracking-widest text-center">Status Kelulusan</th>
                <th className="p-4 text-xs font-black text-slate-500 uppercase tracking-widest text-right">Aksi Administrasi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {data.sesiSiswa.map((sesi: any) => {
                const isDiskualifikasi = sesi.status === 'DIDISKUALIFIKASI_CURANG';
                const isSelesai = sesi.status === 'SELESAI';
                const isReset = sesi.status === 'DIRESET_PENGAJAR';
                
                // KKM Kelulusan sederhana: 70
                const lulus = sesi.nilaiAkhir >= 70;
                
                return (
                  <tr key={sesi.id} className="hover:bg-slate-50/50 transition">
                    <td className="p-4">
                      <div className="font-bold text-slate-900">{sesi.siswa.nama}</div>
                      <div className="text-xs text-slate-500 font-mono mt-0.5">{sesi.siswa.email}</div>
                    </td>
                    
                    <td className="p-4 text-center">
                      {isDiskualifikasi ? (
                        <span className="inline-flex items-center gap-1 bg-rose-100 text-rose-700 px-2.5 py-1 rounded-md text-[10px] font-black uppercase tracking-wider">
                          BLACKLIST
                        </span>
                      ) : isReset ? (
                        <span className="inline-flex items-center gap-1 bg-amber-50 text-amber-700 border border-amber-200 px-2.5 py-1 rounded-md text-[10px] font-black uppercase tracking-wider">
                          DIIZINKAN ULANG
                        </span>
                      ) : sesi.status === 'SEDANG_DIKERJAKAN' ? (
                        <span className="inline-flex items-center gap-1 bg-blue-100 text-blue-700 px-2.5 py-1 rounded-md text-[10px] font-black uppercase tracking-wider">
                          MENGERJAKAN
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 bg-emerald-100 text-emerald-700 px-2.5 py-1 rounded-md text-[10px] font-black uppercase tracking-wider">
                          AMAN
                        </span>
                      )}
                      {sesi.totalPelanggaran > 0 && (
                        <div className="text-[10px] text-rose-500 font-bold mt-1">({sesi.totalPelanggaran} Pelanggaran)</div>
                      )}
                    </td>
                    
                    <td className="p-4 text-center font-bold text-lg text-slate-800">
                      {isReset ? '-' : sesi.nilaiAkhir.toFixed(1)}
                    </td>
                    
                    <td className="p-4 text-center">
                      {isReset ? (
                        <span className="text-slate-400 text-xs italic">Menunggu pengerjaan ulang</span>
                      ) : isDiskualifikasi ? (
                        <span className="text-rose-600 font-bold text-xs">GUGUR</span>
                      ) : sesi.status === 'SEDANG_DIKERJAKAN' ? (
                        <span className="text-blue-500 font-bold text-xs">-</span>
                      ) : lulus ? (
                        <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-bold px-3 py-1 rounded-full">LULUS</span>
                      ) : (
                        <span className="bg-rose-50 text-rose-700 border border-rose-200 text-xs font-bold px-3 py-1 rounded-full">BELUM LULUS</span>
                      )}
                    </td>
                    
                    <td className="p-4 text-right space-x-2">
                      {sesi.logPelanggaran.length > 0 && (
                        <button 
                          onClick={() => setLogTerpilih(sesi.logPelanggaran)}
                          className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-bold border border-slate-300 transition"
                        >
                          <Fingerprint className="w-3.5 h-3.5" /> Log
                        </button>
                      )}
                      
                      {(isSelesai || isDiskualifikasi) && (
                        <button 
                          onClick={() => handleBukaModalReset(sesi.id, sesi.siswa.nama)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 border border-indigo-200 text-indigo-700 hover:bg-indigo-600 hover:text-white rounded-lg text-xs font-bold shadow-sm transition"
                        >
                          <RefreshCw className="w-3.5 h-3.5" /> Izinkan Ujian Ulang
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
              
              {data.sesiSiswa.length === 0 && (
                <tr>
                  <td colSpan={5} className="p-12 text-center text-slate-500 font-medium">
                    Belum ada siswa yang mendaftar atau mengerjakan simulasi ujian ini.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Log Pelanggaran */}
      {logTerpilih && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden border border-slate-200">
            <div className="p-6 bg-slate-900 text-white flex justify-between items-center">
              <h3 className="text-lg font-black uppercase tracking-wider flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-rose-500" /> Log Investigasi Kecurangan
              </h3>
              <button 
                onClick={() => setLogTerpilih(null)} 
                className="px-3 py-1 bg-slate-800 hover:bg-slate-700 rounded-lg text-sm font-bold text-white transition"
              >
                Tutup
              </button>
            </div>
            <div className="p-6 max-h-[60vh] overflow-y-auto bg-slate-50 space-y-4">
              {logTerpilih.map((log) => (
                <div key={log.id} className="bg-white p-4 rounded-xl shadow-sm border border-rose-100 relative">
                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-rose-500 rounded-l-xl"></div>
                  <div className="flex justify-between items-start mb-2 pl-2">
                    <span className="text-xs font-black text-rose-700 bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
                      {log.tipePelanggaran.replace(/_/g, ' ')}
                    </span>
                    <span className="text-[10px] font-bold text-slate-400">
                      {new Date(log.waktuTerjadi).toLocaleString('id-ID')}
                    </span>
                  </div>
                  <p className="text-sm font-medium text-slate-600 pl-2">{log.catatan}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Modal Konfirmasi Ujian Ulang */}
      {modalReset.buka && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 border border-slate-200">
            <h3 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
              <RefreshCw className="w-5 h-5 text-indigo-600" /> Izinkan Ujian Ulang?
            </h3>
            
            <p className="text-slate-600 text-sm mb-6 leading-relaxed">
              Apakah Anda yakin ingin memberikan izin ujian ulang untuk siswa bernama <strong className="text-slate-900">{modalReset.namaSiswa}</strong>?
              <br /><br />
              Sesi ujian lama, lembar jawaban, log pelanggaran, dan nilai dari sesi sebelumnya akan direset ke nol agar siswa dapat memulai pengerjaan dari awal.
            </p>
            
            <div className="flex gap-3 pt-4 border-t border-slate-100">
              <button 
                onClick={() => setModalReset({ buka: false, sesiId: '', namaSiswa: '' })}
                disabled={prosesReset}
                className="flex-1 py-2.5 bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 rounded-xl font-medium transition-colors"
              >
                Batal
              </button>
              <button 
                onClick={handleIzinkanUlang}
                disabled={prosesReset}
                className="flex-1 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-semibold shadow-sm transition-colors flex items-center justify-center gap-2"
              >
                {prosesReset ? 'Memproses...' : 'Ya, Izinkan Ulang'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
