'use client';

import { useState, useEffect } from 'react';
import { ambilBankSoalAdmin, simpanButirSoal, hapusButirSoal } from '@/actions/ujian-admin';
import { useParams } from 'next/navigation';
import { ArrowLeft, Plus, CheckCircle2, Trash2, Edit2, AlertCircle, FileText, Settings2 } from 'lucide-react';
import Link from 'next/link';

export default function HalamanBankSoalAdmin() {
  const params = useParams();
  const idUjian = params.id as string;

  const [ujian, setUjian] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  const [bukaModal, setBukaModal] = useState(false);
  const [formSoal, setFormSoal] = useState({
    id: '',
    teksSoal: '',
    pilihanJawaban: [
      { label: 'A', teks: '' },
      { label: 'B', teks: '' },
      { label: 'C', teks: '' },
      { label: 'D', teks: '' },
      { label: 'E', teks: '' }
    ],
    kunciJawaban: 'A',
    pembahasan: '',
    labelTopik: ''
  });

  useEffect(() => {
    memuatBankSoal();
  }, [idUjian]);

  const memuatBankSoal = async () => {
    setLoading(true);
    try {
      const data = await ambilBankSoalAdmin(idUjian);
      setUjian(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const tanganiPilihanChange = (idx: number, teks: string) => {
    const opsiBaru = [...formSoal.pilihanJawaban];
    opsiBaru[idx].teks = teks;
    setFormSoal({ ...formSoal, pilihanJawaban: opsiBaru });
  };

  const tanganiSimpan = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await simpanButirSoal({
        id: formSoal.id || undefined,
        idUjian,
        teksSoal: formSoal.teksSoal,
        pilihanJawaban: formSoal.pilihanJawaban,
        kunciJawaban: formSoal.kunciJawaban,
        pembahasan: formSoal.pembahasan,
        labelTopik: formSoal.labelTopik || 'Umum'
      });
      setBukaModal(false);
      memuatBankSoal();
    } catch (error) {
      alert('Perekaman soal gagal dieksekusi sistem.');
    }
  };

  const tanganiHapus = async (id: string) => {
    if (confirm('Konfirmasi Distruktif: Menghapus butir soal ini akan mengubah struktur perhitungan nilai ujian ini. Lanjutkan?')) {
      try {
        await hapusButirSoal(id, idUjian);
        memuatBankSoal();
      } catch (error) {
        alert('Gagal menghapus butir soal.');
      }
    }
  };

  const editSoal = (s: any) => {
    setFormSoal({
      id: s.id,
      teksSoal: s.teksSoal,
      pilihanJawaban: typeof s.pilihanJawaban === 'string' ? JSON.parse(s.pilihanJawaban) : s.pilihanJawaban,
      kunciJawaban: s.kunciJawaban,
      pembahasan: s.pembahasan || '',
      labelTopik: s.labelTopik || ''
    });
    setBukaModal(true);
  };

  const tambahSoalBaru = () => {
    setFormSoal({
      id: '', teksSoal: '',
      pilihanJawaban: [
        { label: 'A', teks: '' }, { label: 'B', teks: '' }, { label: 'C', teks: '' }, { label: 'D', teks: '' }, { label: 'E', teks: '' }
      ],
      kunciJawaban: 'A', pembahasan: '', labelTopik: ''
    });
    setBukaModal(true);
  };

  if (loading) return <div className="p-12 text-center font-bold text-slate-500 animate-pulse">Menghubungkan ke Pangkalan Bank Soal...</div>;
  if (!ujian) return <div className="p-12 text-center text-rose-500 font-bold border border-rose-200 bg-rose-50 rounded-xl">Otorisasi ditolak. Simulasi ujian tidak ditemukan.</div>;

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex items-center gap-4">
        <Link href="/admin/ujian" className="p-3 bg-white rounded-xl shadow-sm border border-slate-200 text-slate-500 hover:text-indigo-600 transition">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-black text-slate-900 leading-tight">Bank Soal: {ujian.judulUjian}</h1>
          <p className="text-slate-500 text-sm mt-1">Struktur Evaluasi berisi {ujian.bankSoal.length} Butir Soal Valid.</p>
        </div>
        <button onClick={tambahSoalBaru} className="flex items-center gap-2 bg-indigo-600 text-white px-5 py-3 rounded-xl font-bold hover:bg-indigo-700 transition shadow-md border border-indigo-700">
          <Plus className="w-5 h-5" /> Injeksi Soal Baru
        </button>
      </div>

      <div className="space-y-6 mt-8">
        {ujian.bankSoal.map((soal: any, index: number) => {
          const opsi = typeof soal.pilihanJawaban === 'string' ? JSON.parse(soal.pilihanJawaban) : soal.pilihanJawaban;
          
          return (
            <div key={soal.id} className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 flex flex-col hover:border-indigo-200 hover:shadow-md transition">
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-3">
                  <span className="w-10 h-10 bg-indigo-50 text-indigo-700 border border-indigo-200 font-black rounded-lg flex items-center justify-center text-lg">
                    {index + 1}
                  </span>
                  <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-black uppercase tracking-wider px-3 py-1.5 rounded-md">
                    Topik: {soal.labelTopik || 'General'}
                  </span>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => editSoal(soal)} className="p-2 text-slate-400 hover:text-indigo-600 transition bg-slate-50 border border-slate-200 rounded-lg shadow-sm" title="Modifikasi Soal">
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button onClick={() => tanganiHapus(soal.id)} className="p-2 text-slate-400 hover:text-rose-600 transition bg-slate-50 border border-slate-200 rounded-lg shadow-sm" title="Hapus Permanen">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
              
              <div className="prose prose-slate max-w-none text-slate-800 font-medium whitespace-pre-wrap mb-6 border-b border-slate-100 pb-6">
                {soal.teksSoal}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                {opsi.map((o: any) => {
                  const isBenar = o.label === soal.kunciJawaban;
                  return (
                    <div key={o.label} className={`flex items-start gap-3 p-4 rounded-xl border ${isBenar ? 'bg-emerald-50 border-emerald-300 ring-1 ring-emerald-200' : 'bg-slate-50 border-slate-200'}`}>
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 text-xs font-black border ${isBenar ? 'bg-emerald-500 text-white border-emerald-600' : 'bg-white text-slate-500 border-slate-300'}`}>
                        {o.label}
                      </div>
                      <div className={`text-sm flex-1 mt-0.5 ${isBenar ? 'font-bold text-emerald-900' : 'text-slate-700 font-medium'}`}>
                        {o.teks || <span className="text-slate-400 italic">Opsi Kosong</span>}
                      </div>
                      {isBenar && <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />}
                    </div>
                  );
                })}
              </div>

              {soal.pembahasan && (
                <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
                  <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-1.5">
                    <FileText className="w-3.5 h-3.5" /> Pembahasan Teknis
                  </h4>
                  <p className="text-sm text-slate-600 whitespace-pre-wrap">{soal.pembahasan}</p>
                </div>
              )}
            </div>
          );
        })}

        {ujian.bankSoal.length === 0 && (
          <div className="bg-white border-2 border-dashed border-slate-300 rounded-3xl p-16 text-center flex flex-col items-center justify-center text-slate-500">
            <Settings2 className="w-16 h-16 text-slate-300 mb-4 animate-spin-slow" />
            <h3 className="text-xl font-bold text-slate-800 mb-2">Basis Data Kosong</h3>
            <p>Silakan injeksi butir soal baru agar sistem Auto-Grading dapat beroperasi.</p>
          </div>
        )}
      </div>

      {/* Modal Form Builder */}
      {bukaModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex justify-center items-start pt-10 px-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full mb-10 border border-slate-200">
            <div className="p-6 border-b border-slate-200 bg-slate-900 rounded-t-2xl text-white">
              <h3 className="text-xl font-black uppercase tracking-wide">{formSoal.id ? 'Modifikasi Logika Butir Soal' : 'Formulasi Butir Soal Baru'}</h3>
            </div>
            <form onSubmit={tanganiSimpan} className="p-6 space-y-6">
              
              <div className="grid grid-cols-3 gap-6">
                <div className="col-span-2">
                  <label className="block text-sm font-bold text-slate-700 mb-2">Redaksi Soal Utama</label>
                  <textarea rows={5} required value={formSoal.teksSoal} onChange={(e) => setFormSoal({...formSoal, teksSoal: e.target.value})} className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 font-medium text-slate-800" placeholder="Jabarkan pertanyaan secara eksplisit di sini..."></textarea>
                </div>
                <div className="col-span-1 bg-slate-50 p-4 rounded-xl border border-slate-200">
                  <label className="block text-sm font-bold text-slate-700 mb-2">Label Kelemahan Topik</label>
                  <input type="text" required value={formSoal.labelTopik} onChange={(e) => setFormSoal({...formSoal, labelTopik: e.target.value})} className="w-full px-4 py-2 border border-slate-300 rounded-lg text-sm font-bold uppercase text-indigo-700" placeholder="Misal: ALJABAR" />
                  <div className="mt-3 text-[11px] text-slate-500 flex gap-2 items-start">
                    <AlertCircle className="w-4 h-4 shrink-0 text-amber-500" />
                    Sistem analitik akan mengelompokkan persentase nilai error (kesalahan siswa) berdasarkan label identifikasi ini secara absolut.
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-4">Pemetaan Opsi Jawaban & Penetapan Kunci Valid</label>
                <div className="space-y-3">
                  {formSoal.pilihanJawaban.map((opsi, idx) => (
                    <div key={opsi.label} className={`flex items-start gap-4 p-3 rounded-xl border transition ${formSoal.kunciJawaban === opsi.label ? 'bg-indigo-50 border-indigo-300' : 'bg-white border-slate-200'}`}>
                      <div className="flex flex-col items-center justify-center pt-2">
                        <input 
                          type="radio" 
                          name="kunciJawaban" 
                          id={`kunci-${opsi.label}`} 
                          checked={formSoal.kunciJawaban === opsi.label}
                          onChange={() => setFormSoal({...formSoal, kunciJawaban: opsi.label})}
                          className="w-5 h-5 text-indigo-600 border-slate-300 focus:ring-indigo-600 cursor-pointer"
                        />
                        <label htmlFor={`kunci-${opsi.label}`} className="text-xs font-black text-slate-500 mt-1 cursor-pointer">KUNCI</label>
                      </div>
                      <div className="flex-1 flex gap-3">
                        <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center font-black text-slate-400 border border-slate-200 shrink-0">
                          {opsi.label}
                        </div>
                        <textarea 
                          rows={2}
                          required
                          value={opsi.teks}
                          onChange={(e) => tanganiPilihanChange(idx, e.target.value)}
                          className="w-full px-4 py-2 border border-slate-300 rounded-lg text-sm font-medium"
                          placeholder={`Ketik opsi ${opsi.label}...`}
                        ></textarea>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100">
                <label className="block text-sm font-bold text-slate-700 mb-2">Edukasi Pembahasan Detail (Ditampilkan pasca-ujian)</label>
                <textarea rows={4} value={formSoal.pembahasan} onChange={(e) => setFormSoal({...formSoal, pembahasan: e.target.value})} className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-sm" placeholder="Jelaskan mekanisme penyelesaian secara logis dan struktural..."></textarea>
              </div>

              <div className="pt-6 flex justify-end gap-3">
                <button type="button" onClick={() => setBukaModal(false)} className="px-6 py-3 text-slate-600 font-bold hover:bg-slate-100 rounded-xl transition">Abaikan Operasi</button>
                <button type="submit" className="px-8 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-black rounded-xl transition shadow-md tracking-wide">EKSEKUSI & SIMPAN</button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
