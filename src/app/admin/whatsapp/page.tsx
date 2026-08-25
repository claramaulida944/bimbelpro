'use client';

import React, { useState, useEffect } from 'react';
import { ambilRiwayatPesanWA, ambilStatistikPesanWA, kirimWhatsAppBlast } from '@/actions/whatsapp-admin';

export default function WhatsAppAdminPage() {
  const [statistik, setStatistik] = useState({ terkirim: 0, gagal: 0, menunggu: 0 });
  const [riwayat, setRiwayat] = useState<any[]>([]);
  
  const [targetAudiens, setTargetAudiens] = useState<'SEMUA_SISWA' | 'KURSUS_TERTENTU' | 'SALDO_MINIM'>('SEMUA_SISWA');
  const [tipePesan, setTipePesan] = useState<'TAGIHAN' | 'JADWAL_KELAS' | 'PENGINGAT_UJIAN' | 'BLAST_UMUM'>('BLAST_UMUM');
  const [templatePesan, setTemplatePesan] = useState('');
  
  const [memproses, setMemproses] = useState(false);
  const [notif, setNotif] = useState({ pesan: '', tipe: '' });

  useEffect(() => {
    muatData();
  }, []);

  const muatData = async () => {
    try {
      const stats = await ambilStatistikPesanWA();
      setStatistik(stats);
      
      const histori = await ambilRiwayatPesanWA();
      setRiwayat(histori.riwayat);
    } catch (err) {
      console.error(err);
    }
  };

  const handleKirimBlast = async () => {
    if (!templatePesan.trim()) {
      setNotif({ pesan: 'Teks pesan tidak boleh kosong.', tipe: 'error' });
      return;
    }
    
    if (!confirm('Apakah Anda yakin ingin mengirim pesan WhatsApp (Broadcast) ke target audiens terpilih? Aksi ini tidak dapat dibatalkan.')) return;
    
    setMemproses(true);
    setNotif({ pesan: '', tipe: '' });

    try {
      const res = await kirimWhatsAppBlast({
        targetAudiens,
        tipePesan,
        templatePesan
      });
      
      if (res.sukses) {
        setNotif({ pesan: `Berhasil! ${res.totalTerkirim} pesan terkirim, ${res.totalGagal} pesan gagal.`, tipe: 'success' });
        setTemplatePesan('');
        muatData();
      }
    } catch (err: any) {
      setNotif({ pesan: err.message || 'Terjadi kesalahan saat mengirim broadcast.', tipe: 'error' });
    } finally {
      setMemproses(false);
    }
  };

  const setTemplateCepat = (jenis: string) => {
    if (jenis === 'TAGIHAN') {
      setTipePesan('TAGIHAN');
      setTemplatePesan("Halo {{nama}}, ini adalah pengingat ramah bahwa Anda memiliki tagihan yang perlu diselesaikan. Saldo koin Anda saat ini adalah {{saldo}} RC. Terima kasih!");
    } else if (jenis === 'JADWAL') {
      setTipePesan('JADWAL_KELAS');
      setTemplatePesan("Halo {{nama}}, jangan lupa ya hari ini {{tanggal}} ada jadwal kelas Live Zoom baru untuk Anda. Persiapkan dirimu!");
    } else if (jenis === 'UJIAN') {
      setTipePesan('PENGINGAT_UJIAN');
      setTemplatePesan("Halo {{nama}}, waktu ujian simulasi Anda sudah dekat. Pastikan koneksi internet stabil dan masuk ke portal ujian tepat waktu.");
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Siaran WhatsApp & Notifikasi</h1>
        <p className="text-slate-600 mt-1">Kirim pengumuman massal dan pantau status pengiriman pesan ke siswa.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
          <p className="text-sm font-medium text-slate-500 mb-1">Total Pesan Terkirim</p>
          <div className="text-3xl font-bold text-slate-800 flex items-center gap-2">
            {statistik.terkirim} <span className="bg-emerald-100 text-emerald-700 text-xs px-2 py-1 rounded-full font-bold">SUKSES</span>
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
          <p className="text-sm font-medium text-slate-500 mb-1">Dalam Antrean</p>
          <div className="text-3xl font-bold text-slate-800 flex items-center gap-2">
            {statistik.menunggu} <span className="bg-amber-100 text-amber-700 text-xs px-2 py-1 rounded-full font-bold">PROSES</span>
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
          <p className="text-sm font-medium text-slate-500 mb-1">Pesan Gagal</p>
          <div className="text-3xl font-bold text-slate-800 flex items-center gap-2">
            {statistik.gagal} <span className="bg-rose-100 text-rose-700 text-xs px-2 py-1 rounded-full font-bold">ERROR</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-5 bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
          <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
            <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 24 24"><path d="M12.031 0C5.385 0 0 5.386 0 12.031c0 2.115.549 4.183 1.593 6.009L.428 22.37l4.46-1.168A11.97 11.97 0 0012.03 24c6.643 0 12.029-5.386 12.029-12.03S18.674 0 12.031 0zm0 22.012c-1.802 0-3.568-.484-5.116-1.401l-.367-.217-3.327.87.886-3.242-.239-.38C2.97 16.126 2.477 14.103 2.477 12.03c0-5.263 4.285-9.549 9.554-9.549 5.265 0 9.55 4.286 9.55 9.549 0 5.263-4.285 9.549-9.55 9.549v.032h.001zm5.228-7.14c-.287-.144-1.696-.838-1.958-.934-.263-.095-.454-.144-.644.143-.19.288-.737.935-.904 1.125-.167.19-.333.214-.62.072-1.284-.637-2.316-1.442-3.245-3.033-.166-.288-.016-.445.127-.588.13-.131.288-.336.43-.505.143-.168.192-.288.287-.48.095-.19.048-.359-.024-.504-.071-.144-.644-1.554-.881-2.128-.232-.56-.467-.485-.644-.494-.167-.008-.358-.01-.548-.01-.19 0-.5.071-.762.359-.262.288-1.002.981-1.002 2.392 0 1.411 1.026 2.775 1.168 2.966.143.19 2.021 3.086 4.897 4.327 1.801.776 2.43.834 3.393.702.59-.08 1.696-.693 1.934-1.363.238-.671.238-1.246.167-1.363-.07-.12-.262-.191-.548-.335z"/></svg>
            Buat Siaran Baru
          </h2>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">Target Audiens</label>
              <select
                value={targetAudiens}
                onChange={(e) => setTargetAudiens(e.target.value as any)}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-green-500 focus:outline-none"
              >
                <option value="SEMUA_SISWA">Semua Siswa Aktif</option>
                <option value="SALDO_MINIM">Siswa Saldo Minim (&lt; 50 RC)</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">Kategori Pesan</label>
              <select
                value={tipePesan}
                onChange={(e) => setTipePesan(e.target.value as any)}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-green-500 focus:outline-none"
              >
                <option value="BLAST_UMUM">Broadcast Umum</option>
                <option value="TAGIHAN">Pemberitahuan Tagihan</option>
                <option value="JADWAL_KELAS">Pengingat Jadwal Kelas</option>
                <option value="PENGINGAT_UJIAN">Pengingat Ujian</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">Template Cepat</label>
              <div className="flex flex-wrap gap-2">
                <button onClick={() => setTemplateCepat('TAGIHAN')} className="px-3 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-full text-xs font-semibold transition-colors">Tagihan</button>
                <button onClick={() => setTemplateCepat('JADWAL')} className="px-3 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-full text-xs font-semibold transition-colors">Jadwal Live</button>
                <button onClick={() => setTemplateCepat('UJIAN')} className="px-3 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-full text-xs font-semibold transition-colors">Ujian CBT</button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5 flex justify-between">
                Isi Pesan
                <span className="text-xs font-normal text-slate-500">Variabel: {`{{nama}}, {{email}}, {{saldo}}`}</span>
              </label>
              <textarea
                value={templatePesan}
                onChange={(e) => setTemplatePesan(e.target.value)}
                placeholder="Tulis pesan Anda di sini..."
                rows={6}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-green-500 focus:outline-none resize-none"
              ></textarea>
            </div>

            {notif.pesan && (
              <div className={`p-3 rounded-lg text-sm font-medium ${notif.tipe === 'success' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-rose-50 text-rose-700 border border-rose-200'}`}>
                {notif.pesan}
              </div>
            )}

            <button
              onClick={handleKirimBlast}
              disabled={memproses}
              className="w-full py-3 bg-green-600 hover:bg-green-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white rounded-xl font-bold shadow-sm transition-colors flex items-center justify-center gap-2"
            >
              {memproses ? (
                <><svg className="animate-spin w-5 h-5 text-white" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg> Memproses...</>
              ) : 'Kirim Broadcast WhatsApp Sekarang'}
            </button>
          </div>
        </div>

        <div className="lg:col-span-7 bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden flex flex-col">
          <div className="p-6 border-b border-slate-100">
            <h2 className="text-lg font-bold text-slate-800">Riwayat Pengiriman Terbaru</h2>
          </div>
          <div className="flex-1 overflow-x-auto">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200">
                <tr>
                  <th className="px-6 py-4">Nomor Tujuan</th>
                  <th className="px-6 py-4">Kategori</th>
                  <th className="px-6 py-4">Status & Log</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {riwayat.length === 0 ? (
                  <tr>
                     <td colSpan={3} className="px-6 py-12 text-center text-slate-400">Belum ada riwayat pengiriman pesan.</td>
                  </tr>
                ) : riwayat.map((r) => (
                  <tr key={r.id} className="hover:bg-slate-50">
                    <td className="px-6 py-4">
                      <div className="font-medium text-slate-900">{r.noTujuan}</div>
                      <div className="text-xs text-slate-500 truncate max-w-[200px]" title={r.isiPesan}>{r.isiPesan}</div>
                    </td>
                    <td className="px-6 py-4 text-slate-700 font-medium">
                      {r.tipePesan.replace('_', ' ')}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-block px-2.5 py-1 text-xs font-bold rounded-full mb-1 ${
                        r.status === 'TERKIRIM' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                        r.status === 'GAGAL' ? 'bg-rose-50 text-rose-700 border border-rose-200' :
                        'bg-amber-50 text-amber-700 border border-amber-200'
                      }`}>
                        {r.status}
                      </span>
                      <div className="text-[10px] text-slate-400 font-mono mt-1 w-32 truncate" title={r.logRespon || '-'}>
                        {r.logRespon || '-'}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
