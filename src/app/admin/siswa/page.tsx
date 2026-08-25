'use client';

import React, { useState, useEffect } from 'react';
import { ambilDaftarSiswaAdmin, sesuaikanSaldoSiswa } from '@/actions/siswa-admin';
import { kirimPesanPersonal } from '@/actions/whatsapp-admin';

export default function DirektoriSiswaAdminPage() {
  const [daftarSiswa, setDaftarSiswa] = useState<any[]>([]);
  const [pencarian, setPencarian] = useState('');
  const [memuat, setMemuat] = useState(false);

  // State Modal Penyesuaian Saldo
  const [modalSaldoTerbuka, setModalSaldoTerbuka] = useState(false);
  const [siswaTerpilih, setSiswaTerpilih] = useState<any>(null);
  const [formSaldo, setFormSaldo] = useState({ tipe: 'TAMBAH' as 'TAMBAH'|'KURANG', jumlah: 0, alasan: '' });
  const [prosesSaldo, setProsesSaldo] = useState(false);
  
  // State Modal WA Personal
  const [modalWaTerbuka, setModalWaTerbuka] = useState(false);
  const [formWa, setFormWa] = useState({ pesan: '' });
  const [prosesWa, setProsesWa] = useState(false);

  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      muatData();
    }, 500);
    return () => clearTimeout(delayDebounce);
  }, [pencarian]);

  const muatData = async () => {
    setMemuat(true);
    try {
      const res = await ambilDaftarSiswaAdmin(pencarian);
      setDaftarSiswa(res.siswa);
    } catch (err) {
      console.error(err);
    } finally {
      setMemuat(false);
    }
  };

  const handleSimpanSaldo = async () => {
    if (!siswaTerpilih || formSaldo.jumlah <= 0 || !formSaldo.alasan.trim()) {
      alert('Mohon isi jumlah koin yang valid dan alasannya.');
      return;
    }
    setProsesSaldo(true);
    try {
      await sesuaikanSaldoSiswa(siswaTerpilih.id, formSaldo.jumlah, formSaldo.tipe, formSaldo.alasan);
      setModalSaldoTerbuka(false);
      muatData();
      alert('Saldo berhasil disesuaikan.');
    } catch (err: any) {
      alert(err.message || 'Gagal menyesuaikan saldo.');
    } finally {
      setProsesSaldo(false);
    }
  };

  const handleKirimWa = async () => {
    if (!siswaTerpilih || !formWa.pesan.trim()) {
      alert('Pesan tidak boleh kosong.');
      return;
    }
    setProsesWa(true);
    try {
      await kirimPesanPersonal(siswaTerpilih.id, formWa.pesan);
      setModalWaTerbuka(false);
      alert('Pesan berhasil masuk antrean untuk dikirim!');
    } catch (err: any) {
      alert(err.message || 'Gagal mengirim pesan.');
    } finally {
      setProsesWa(false);
    }
  };

  const bukaModalSaldo = (siswa: any) => {
    setSiswaTerpilih(siswa);
    setFormSaldo({ tipe: 'TAMBAH', jumlah: 0, alasan: '' });
    setModalSaldoTerbuka(true);
  };

  const bukaModalWa = (siswa: any) => {
    setSiswaTerpilih(siswa);
    setFormWa({ pesan: '' });
    setModalWaTerbuka(true);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Direktori Siswa</h1>
          <p className="text-slate-600 mt-1">Manajemen profil, pantau aktivitas belajar, dan penyesuaian koin siswa.</p>
        </div>
        <div className="relative">
          <input
            type="text"
            placeholder="Cari nama, email, nomor HP..."
            value={pencarian}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPencarian(e.target.value)}
            className="w-full sm:w-80 bg-white border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none shadow-sm"
          />
          <svg className="w-5 h-5 text-slate-400 absolute left-3 top-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200">
              <tr>
                <th className="px-6 py-4">Siswa</th>
                <th className="px-6 py-4">Kontak WA</th>
                <th className="px-6 py-4">Saldo RinCoin</th>
                <th className="px-6 py-4">Statistik</th>
                <th className="px-6 py-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {memuat ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-slate-400">
                    <svg className="animate-spin w-6 h-6 mx-auto mb-2 text-indigo-600" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                    Memuat data...
                  </td>
                </tr>
              ) : daftarSiswa.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-slate-400">Siswa tidak ditemukan.</td>
                </tr>
              ) : (
                daftarSiswa.map((siswa: any) => (
                  <tr key={siswa.id} className="hover:bg-slate-50">
                    <td className="px-6 py-4">
                      <div className="font-bold text-slate-900">{siswa.nama}</div>
                      <div className="text-xs text-slate-500">{siswa.email}</div>
                    </td>
                    <td className="px-6 py-4">
                      {siswa.noTelepon ? (
                        <a href={`https://wa.me/62${siswa.noTelepon.replace(/\D/g,'').replace(/^0|^62/,'')}`} target="_blank" rel="noopener noreferrer" className="text-green-600 hover:text-green-700 font-medium flex items-center gap-1">
                          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12.031 0C5.385 0 0 5.386 0 12.031c0 2.115.549 4.183 1.593 6.009L.428 22.37l4.46-1.168A11.97 11.97 0 0012.03 24c6.643 0 12.029-5.386 12.029-12.03S18.674 0 12.031 0zm0 22.012c-1.802 0-3.568-.484-5.116-1.401l-.367-.217-3.327.87.886-3.242-.239-.38C2.97 16.126 2.477 14.103 2.477 12.03c0-5.263 4.285-9.549 9.554-9.549 5.265 0 9.55 4.286 9.55 9.549 0 5.263-4.285 9.549-9.55 9.549v.032h.001z"/></svg>
                          {siswa.noTelepon}
                        </a>
                      ) : (
                        <span className="text-slate-400 text-xs italic">Belum diatur</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-50 text-amber-700 border border-amber-200 font-bold text-xs">
                        <svg className="w-3.5 h-3.5 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                        {siswa.saldoRinCoin} RC
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-4 text-xs font-medium text-slate-500">
                        <span title="Kursus Aktif">📚 {siswa._count.langgananSiswa} Kelas</span>
                        <span title="Ujian Diikuti">📝 {siswa._count.riwayatUjian} Ujian</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button onClick={() => bukaModalWa(siswa)} className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors" title="Kirim WA">
                          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" /></svg>
                        </button>
                        <button onClick={() => bukaModalSaldo(siswa)} className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors" title="Penyesuaian Koin">
                          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL PENYESUAIAN SALDO */}
      {modalSaldoTerbuka && siswaTerpilih && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-xl overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center">
              <h3 className="font-bold text-slate-900 text-lg">Sesuaikan Saldo RinCoin</h3>
              <button onClick={() => setModalSaldoTerbuka(false)} className="text-slate-400 hover:text-slate-600"><svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg></button>
            </div>
            <div className="p-6 space-y-4">
              <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 text-sm">
                Siswa: <span className="font-bold text-slate-800">{siswaTerpilih.nama}</span> <br/>
                Saldo Saat Ini: <span className="font-bold text-amber-600">{siswaTerpilih.saldoRinCoin} RC</span>
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Tipe Operasi</label>
                <div className="flex gap-4">
                  <label className="flex-1 cursor-pointer">
                    <input type="radio" className="peer sr-only" checked={formSaldo.tipe === 'TAMBAH'} onChange={() => setFormSaldo({...formSaldo, tipe: 'TAMBAH'})} />
                    <div className="text-center px-4 py-2 border-2 border-slate-200 rounded-lg peer-checked:border-indigo-600 peer-checked:bg-indigo-50 peer-checked:text-indigo-700 font-bold text-sm text-slate-600 transition-all">Tambah (+)</div>
                  </label>
                  <label className="flex-1 cursor-pointer">
                    <input type="radio" className="peer sr-only" checked={formSaldo.tipe === 'KURANG'} onChange={() => setFormSaldo({...formSaldo, tipe: 'KURANG'})} />
                    <div className="text-center px-4 py-2 border-2 border-slate-200 rounded-lg peer-checked:border-rose-600 peer-checked:bg-rose-50 peer-checked:text-rose-700 font-bold text-sm text-slate-600 transition-all">Kurangi (-)</div>
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Jumlah Koin (RC)</label>
                <input type="number" min={1} value={formSaldo.jumlah} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormSaldo({...formSaldo, jumlah: parseInt(e.target.value) || 0})} className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none" />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Alasan / Keterangan</label>
                <input type="text" placeholder="Contoh: Penyesuaian admin, bonus" value={formSaldo.alasan} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormSaldo({...formSaldo, alasan: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none" />
              </div>

              <button onClick={handleSimpanSaldo} disabled={prosesSaldo} className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 text-white rounded-xl font-bold shadow-sm transition-colors mt-2">
                {prosesSaldo ? 'Memproses...' : 'Eksekusi Penyesuaian Saldo'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL PESAN PERSONAL */}
      {modalWaTerbuka && siswaTerpilih && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-xl overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center">
              <h3 className="font-bold text-slate-900 text-lg flex items-center gap-2">
                <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 24 24"><path d="M12.031 0C5.385 0 0 5.386 0 12.031c0 2.115.549 4.183 1.593 6.009L.428 22.37l4.46-1.168A11.97 11.97 0 0012.03 24c6.643 0 12.029-5.386 12.029-12.03S18.674 0 12.031 0zm0 22.012c-1.802 0-3.568-.484-5.116-1.401l-.367-.217-3.327.87.886-3.242-.239-.38C2.97 16.126 2.477 14.103 2.477 12.03c0-5.263 4.285-9.549 9.554-9.549 5.265 0 9.55 4.286 9.55 9.549 0 5.263-4.285 9.549-9.55 9.549v.032h.001z"/></svg>
                Pesan Personal WA
              </h3>
              <button onClick={() => setModalWaTerbuka(false)} className="text-slate-400 hover:text-slate-600"><svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg></button>
            </div>
            <div className="p-6 space-y-4">
              <div className="bg-green-50 p-3 rounded-lg border border-green-200 text-sm">
                Ke: <span className="font-bold text-green-800">{siswaTerpilih.nama} ({siswaTerpilih.noTelepon || 'Tidak ada nomor'})</span>
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5 flex justify-between">
                  Tulis Pesan 
                  <span className="text-xs font-normal text-slate-500">Var: {`{{nama}}, {{saldo}}`}</span>
                </label>
                <textarea rows={5} value={formWa.pesan} onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setFormWa({...formWa, pesan: e.target.value})} placeholder={`Halo {{nama}}, ada yang bisa dibantu?`} className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-green-500 focus:outline-none resize-none" />
              </div>

              <button onClick={handleKirimWa} disabled={prosesWa || !siswaTerpilih.noTelepon} className="w-full py-2.5 bg-green-600 hover:bg-green-700 disabled:bg-slate-300 text-white rounded-xl font-bold shadow-sm transition-colors mt-2">
                {prosesWa ? 'Mengirim...' : 'Kirim Pesan Sekarang'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
