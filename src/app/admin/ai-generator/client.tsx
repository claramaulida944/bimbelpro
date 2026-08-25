'use client';

import React, { useState } from 'react';
import { buatDrafBankSoalUjian, simpanBanyakSoalKeUjian, buatDrafMateriKursus } from '@/actions/ai-generator-admin';

type UjianPilihan = {
  id: string;
  judulUjian: string;
};

export default function AiGeneratorClient({ daftarUjian }: { daftarUjian: UjianPilihan[] }) {
  const [tabAktif, setTabAktif] = useState<'SOAL' | 'MATERI'>('SOAL');

  // State Tab 1: Soal
  const [idUjianTarget, setIdUjianTarget] = useState(daftarUjian[0]?.id || '');
  const [topikSoal, setTopikSoal] = useState('');
  const [tingkatKesulitan, setTingkatKesulitan] = useState('Sedang');
  const [jumlahSoal, setJumlahSoal] = useState(5);
  const [memprosesSoal, setMemprosesSoal] = useState(false);
  const [hasilSoal, setHasilSoal] = useState<any[]>([]);
  const [menyimpanSoal, setMenyimpanSoal] = useState(false);
  const [notifSoal, setNotifSoal] = useState({ pesan: '', tipe: '' });

  // State Tab 2: Materi
  const [judulMateri, setJudulMateri] = useState('');
  const [targetKelas, setTargetKelas] = useState('');
  const [catatanKhusus, setCatatanKhusus] = useState('');
  const [memprosesMateri, setMemprosesMateri] = useState(false);
  const [hasilMateri, setHasilMateri] = useState('');
  const [notifMateri, setNotifMateri] = useState({ pesan: '', tipe: '' });

  const handleGenerateSoal = async () => {
    if (!topikSoal.trim()) {
      setNotifSoal({ pesan: 'Topik soal wajib diisi.', tipe: 'error' });
      return;
    }
    setMemprosesSoal(true);
    setNotifSoal({ pesan: '', tipe: '' });
    setHasilSoal([]);

    try {
      const res = await buatDrafBankSoalUjian(topikSoal, tingkatKesulitan, jumlahSoal);
      if (res.sukses && res.daftarSoal) {
        setHasilSoal(res.daftarSoal);
        setNotifSoal({ pesan: 'Berhasil menghasilkan soal. Silakan tinjau dan simpan.', tipe: 'success' });
      }
    } catch (err: any) {
      setNotifSoal({ pesan: err.message || 'Gagal menghasilkan soal.', tipe: 'error' });
    } finally {
      setMemprosesSoal(false);
    }
  };

  const handleSimpanSoal = async () => {
    if (!idUjianTarget) {
      setNotifSoal({ pesan: 'Pilih ujian tujuan terlebih dahulu.', tipe: 'error' });
      return;
    }
    setMenyimpanSoal(true);
    setNotifSoal({ pesan: '', tipe: '' });

    try {
      const res = await simpanBanyakSoalKeUjian(idUjianTarget, hasilSoal);
      if (res.sukses) {
        setNotifSoal({ pesan: `Sukses! ${res.totalTersimpan} butir soal telah ditambahkan ke bank soal ujian.`, tipe: 'success' });
        setHasilSoal([]); // Kosongkan setelah sukses simpan
      }
    } catch (err: any) {
      setNotifSoal({ pesan: err.message || 'Gagal menyimpan soal ke database.', tipe: 'error' });
    } finally {
      setMenyimpanSoal(false);
    }
  };

  const handleGenerateMateri = async () => {
    if (!judulMateri.trim() || !targetKelas.trim()) {
      setNotifMateri({ pesan: 'Judul Modul dan Target Jenjang wajib diisi.', tipe: 'error' });
      return;
    }
    setMemprosesMateri(true);
    setNotifMateri({ pesan: '', tipe: '' });
    setHasilMateri('');

    try {
      const res = await buatDrafMateriKursus(judulMateri, targetKelas, catatanKhusus);
      if (res.sukses && res.drafMarkdown) {
        setHasilMateri(res.drafMarkdown);
        setNotifMateri({ pesan: 'Draf materi berhasil dibuat.', tipe: 'success' });
      }
    } catch (err: any) {
      setNotifMateri({ pesan: err.message || 'Gagal menghasilkan draf materi.', tipe: 'error' });
    } finally {
      setMemprosesMateri(false);
    }
  };

  const salinKeClipboard = () => {
    if (!hasilMateri) return;
    navigator.clipboard.writeText(hasilMateri).then(() => {
      setNotifMateri({ pesan: 'Teks materi berhasil disalin ke clipboard!', tipe: 'success' });
    }).catch(() => {
      setNotifMateri({ pesan: 'Gagal menyalin otomatis. Silakan salin manual.', tipe: 'error' });
    });
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
      {/* Tab Navigation */}
      <div className="flex border-b border-slate-200">
        <button
          onClick={() => setTabAktif('SOAL')}
          className={`flex-1 py-4 text-center font-bold text-sm transition-colors ${
            tabAktif === 'SOAL' ? 'bg-indigo-50 text-indigo-700 border-b-2 border-indigo-600' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-700'
          }`}
        >
          Generator Soal Ujian
        </button>
        <button
          onClick={() => setTabAktif('MATERI')}
          className={`flex-1 py-4 text-center font-bold text-sm transition-colors ${
            tabAktif === 'MATERI' ? 'bg-violet-50 text-violet-700 border-b-2 border-violet-600' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-700'
          }`}
        >
          Generator Modul Materi
        </button>
      </div>

      <div className="p-6 md:p-8">
        {/* TAB 1: SOAL UJIAN */}
        {tabAktif === 'SOAL' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="lg:col-span-4 space-y-5">
              <h2 className="font-bold text-slate-800 text-lg border-b border-slate-100 pb-2">Parameter Soal</h2>
              
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Target Ujian</label>
                <select
                  value={idUjianTarget}
                  onChange={(e) => setIdUjianTarget(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                >
                  <option value="" disabled>Pilih Ujian Tujuan...</option>
                  {daftarUjian.map(u => (
                    <option key={u.id} value={u.id}>{u.judulUjian}</option>
                  ))}
                </select>
                {daftarUjian.length === 0 && <p className="text-xs text-rose-500 mt-1">Belum ada ujian aktif. Buat terlebih dahulu.</p>}
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Topik/Materi Soal</label>
                <input
                  type="text"
                  value={topikSoal}
                  onChange={(e) => setTopikSoal(e.target.value)}
                  placeholder="Contoh: Turunan Fungsi Aljabar"
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              <div className="flex gap-4">
                <div className="flex-1">
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">Kesulitan</label>
                  <select
                    value={tingkatKesulitan}
                    onChange={(e) => setTingkatKesulitan(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  >
                    <option value="Mudah">Mudah</option>
                    <option value="Sedang">Sedang</option>
                    <option value="Sulit">Sulit</option>
                    <option value="HOTS (High Order Thinking Skills)">HOTS</option>
                  </select>
                </div>
                <div className="w-1/3">
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">Jumlah</label>
                  <input
                    type="number"
                    min={1}
                    max={10}
                    value={jumlahSoal}
                    onChange={(e) => setJumlahSoal(parseInt(e.target.value) || 1)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>
              </div>

              <button
                onClick={handleGenerateSoal}
                disabled={memprosesSoal}
                className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white rounded-xl font-bold shadow-sm transition-colors flex items-center justify-center gap-2 mt-4"
              >
                {memprosesSoal ? (
                  <><svg className="animate-spin w-5 h-5 text-white" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg> Menghasilkan Soal...</>
                ) : 'Hasilkan Soal dengan AI'}
              </button>

              {notifSoal.pesan && (
                <div className={`p-3 rounded-lg text-sm font-medium ${notifSoal.tipe === 'success' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-rose-50 text-rose-700 border border-rose-200'}`}>
                  {notifSoal.pesan}
                </div>
              )}
            </div>

            <div className="lg:col-span-8 bg-slate-50 rounded-xl p-6 border border-slate-200 min-h-[400px]">
              <div className="flex items-center justify-between mb-6">
                <h2 className="font-bold text-slate-800 text-lg">Pratinjau Hasil</h2>
                {hasilSoal.length > 0 && (
                  <button
                    onClick={handleSimpanSoal}
                    disabled={menyimpanSoal}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-400 text-white rounded-lg text-sm font-bold shadow-sm transition-colors"
                  >
                    {menyimpanSoal ? 'Menyimpan...' : 'Simpan Semua ke Bank Soal'}
                  </button>
                )}
              </div>

              {hasilSoal.length === 0 ? (
                <div className="flex h-full items-center justify-center text-slate-400 border-2 border-dashed border-slate-200 rounded-xl py-12">
                  Atur parameter dan klik hasilkan untuk melihat draf soal di sini.
                </div>
              ) : (
                <div className="space-y-6">
                  {hasilSoal.map((soal, idx) => (
                    <div key={idx} className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
                      <div className="flex flex-wrap items-center gap-2 mb-3">
                        <span className="text-xs font-semibold bg-slate-100 text-slate-600 px-2.5 py-1 rounded-md">Soal {idx + 1}</span>
                        <span className="text-xs font-bold bg-indigo-50 text-indigo-600 px-2.5 py-1 rounded-md">
                          {soal.labelTopik || 'Umum'}
                        </span>
                      </div>
                      <div className="font-bold text-slate-900 mb-3">{soal.teksSoal}</div>
                      
                      <div className="space-y-2 mb-4 pl-4">
                        {soal.pilihanJawaban?.map((opsi: any, optIdx: number) => {
                          const isBenar = opsi.label === soal.kunciJawaban;
                          return (
                            <div key={optIdx} className={`flex text-sm p-2 rounded-lg ${isBenar ? 'bg-emerald-50 border border-emerald-200 font-medium text-emerald-800' : 'text-slate-600 border border-transparent'}`}>
                              <span className="font-bold mr-2 w-6">{opsi.label}.</span>
                              <span>{opsi.teks}</span>
                              {isBenar && <span className="ml-auto text-emerald-600 text-xs font-bold px-2 py-0.5 bg-emerald-100 rounded-full">Kunci Jawaban</span>}
                            </div>
                          );
                        })}
                      </div>
                      
                      <div className="bg-slate-50 p-4 rounded-lg text-sm border border-slate-100">
                        <span className="font-bold text-slate-700 block mb-1">Pembahasan:</span>
                        <span className="text-slate-600">{soal.pembahasan || 'Tidak ada pembahasan.'}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 2: MATERI MODUL */}
        {tabAktif === 'MATERI' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="lg:col-span-4 space-y-5">
              <h2 className="font-bold text-slate-800 text-lg border-b border-slate-100 pb-2">Parameter Silabus/Modul</h2>
              
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Judul Modul / Topik Pembahasan</label>
                <input
                  type="text"
                  value={judulMateri}
                  onChange={(e) => setJudulMateri(e.target.value)}
                  placeholder="Contoh: Pengantar Sejarah Kemerdekaan RI"
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-violet-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Target Jenjang / Kelas</label>
                <input
                  type="text"
                  value={targetKelas}
                  onChange={(e) => setTargetKelas(e.target.value)}
                  placeholder="Contoh: Siswa SMA Kelas 11 IPA"
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-violet-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Poin Penting / Catatan Khusus (Opsional)</label>
                <textarea
                  value={catatanKhusus}
                  onChange={(e) => setCatatanKhusus(e.target.value)}
                  placeholder="Contoh: Jelaskan kronologi rengasdengklok secara mendetail."
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-violet-500 focus:outline-none min-h-[100px] resize-none"
                />
              </div>

              <button
                onClick={handleGenerateMateri}
                disabled={memprosesMateri}
                className="w-full py-3 bg-violet-600 hover:bg-violet-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white rounded-xl font-bold shadow-sm transition-colors flex items-center justify-center gap-2 mt-4"
              >
                {memprosesMateri ? (
                  <><svg className="animate-spin w-5 h-5 text-white" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg> Membaca Referensi...</>
                ) : 'Hasilkan Materi Pembelajaran'}
              </button>

              {notifMateri.pesan && (
                <div className={`p-3 rounded-lg text-sm font-medium ${notifMateri.tipe === 'success' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-rose-50 text-rose-700 border border-rose-200'}`}>
                  {notifMateri.pesan}
                </div>
              )}
            </div>

            <div className="lg:col-span-8 bg-slate-50 rounded-xl p-6 border border-slate-200 min-h-[400px] flex flex-col">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-bold text-slate-800 text-lg">Pratinjau Markdown</h2>
                {hasilMateri && (
                  <button
                    onClick={salinKeClipboard}
                    className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-lg text-sm font-bold shadow-sm transition-colors flex items-center gap-2"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                    </svg>
                    Salin Teks (Copy)
                  </button>
                )}
              </div>

              {hasilMateri ? (
                <textarea
                  readOnly
                  value={hasilMateri}
                  className="flex-1 w-full bg-white border border-slate-200 rounded-xl p-5 text-sm font-mono text-slate-700 focus:outline-none resize-none shadow-inner"
                />
              ) : (
                <div className="flex-1 flex items-center justify-center text-slate-400 border-2 border-dashed border-slate-200 rounded-xl">
                  Draf materi silabus Anda akan tampil di sini.
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
