'use client';

import React, { useEffect, useState } from 'react';
import { Bot, CreditCard, MessageSquare, Video, Coins, Eye, EyeOff, Save, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { ambilSemuaPengaturan, simpanPengaturan } from '@/actions/pengaturan';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const TABS = [
  { id: 'ai', label: 'AI RinaSensei', ikon: Bot },
  { id: 'payment', label: 'Payment Gateway', ikon: CreditCard },
  { id: 'wa', label: 'WhatsApp Blast', ikon: MessageSquare },
  { id: 'video', label: 'Video & Kelas', ikon: Video },
  { id: 'monetisasi', label: 'Monetisasi & RinCoin', ikon: Coins },
];

export default function PengaturanPage() {
  const [tabAktif, setTabAktif] = useState('ai');
  const [pengaturan, setPengaturan] = useState<Record<string, string>>({});
  const [loadingAmbil, setLoadingAmbil] = useState(true);
  const [loadingSimpan, setLoadingSimpan] = useState(false);
  const [notifikasi, setNotifikasi] = useState<{ tipe: 'sukses' | 'gagal', pesan: string } | null>(null);
  
  const [lihatRahasia, setLihatRahasia] = useState<Record<string, boolean>>({});

  useEffect(() => {
    async function muatData() {
      try {
        const data = await ambilSemuaPengaturan();
        setPengaturan(data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoadingAmbil(false);
      }
    }
    muatData();
  }, []);

  // Peta model default untuk setiap provider AI
  const MODEL_DEFAULT_PER_PROVIDER: Record<string, string> = {
    'Groq': 'qwen/qwen3.6-27b',
    'OpenRouter': 'meta-llama/llama-3.3-70b-instruct:free',
    'Google Gemini': 'gemini-1.5-flash',
    'OpenAI': 'gpt-4o-mini',
    'Custom': '',
  };

  // Peta placeholder API Key untuk setiap provider
  const PLACEHOLDER_API_KEY: Record<string, string> = {
    'Groq': 'Isi API Key Groq (contoh: gsk_...)',
    'OpenRouter': 'Isi API Key OpenRouter (contoh: sk-or-...)',
    'Google Gemini': 'Isi API Key Google AI Studio (contoh: AIzaSy...)',
    'OpenAI': 'Isi API Key OpenAI (contoh: sk-...)',
    'Custom': 'Isi API Key endpoint kustom Anda',
  };

  const tanganiPerubahan = (kunci: string, nilai: string) => {
    setPengaturan(prev => {
      const stateBaru = { ...prev, [kunci]: nilai };

      // Auto-fill model default saat provider AI diubah
      if (kunci === 'AI_PROVIDER' && MODEL_DEFAULT_PER_PROVIDER[nilai]) {
        stateBaru['AI_MODEL'] = MODEL_DEFAULT_PER_PROVIDER[nilai];
      }

      return stateBaru;
    });
  };

  const tanganiToggleRahasia = (kunci: string) => {
    setLihatRahasia(prev => ({ ...prev, [kunci]: !prev[kunci] }));
  };

  const tanganiSimpan = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoadingSimpan(true);
    setNotifikasi(null);
    try {
      const hasil = await simpanPengaturan(pengaturan);
      if (hasil.sukses) {
        setNotifikasi({ tipe: 'sukses', pesan: hasil.pesan });
        setTimeout(() => setNotifikasi(null), 3000);
      }
    } catch (error: any) {
      setNotifikasi({ tipe: 'gagal', pesan: error.message || 'Terjadi kesalahan saat menyimpan pengaturan.' });
    } finally {
      setLoadingSimpan(false);
    }
  };

  if (loadingAmbil) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="animate-spin text-indigo-600" size={32} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Pengaturan Sistem</h1>
        <p className="text-slate-500 mt-1">Kelola konfigurasi API pihak ketiga dan parameter sistem utama.</p>
      </div>

      {notifikasi && (
        <div className={cn(
          "p-4 rounded-xl flex items-center space-x-3",
          notifikasi.tipe === 'sukses' ? "bg-emerald-50 text-emerald-700 border border-emerald-200" : "bg-rose-50 text-rose-700 border border-rose-200"
        )}>
          {notifikasi.tipe === 'sukses' ? <CheckCircle2 size={20} /> : <AlertCircle size={20} />}
          <span className="font-medium text-sm">{notifikasi.pesan}</span>
        </div>
      )}

      <div className="bg-white shadow-sm rounded-xl border border-slate-200 overflow-hidden">
        <div className="flex overflow-x-auto border-b border-slate-200 bg-slate-50">
          {TABS.map(tab => {
            const Ikon = tab.ikon;
            const aktif = tabAktif === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setTabAktif(tab.id)}
                className={cn(
                  "flex items-center space-x-2 px-6 py-4 text-sm font-medium transition-colors border-b-2 whitespace-nowrap",
                  aktif ? "border-indigo-600 text-indigo-600 bg-white" : "border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                )}
              >
                <Ikon size={18} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        <form onSubmit={tanganiSimpan} className="p-6">
          <div className="space-y-6 max-w-2xl">
            {tabAktif === 'ai' && (
              <>
                <FieldSelect 
                  label="Provider AI" 
                  nilai={pengaturan['AI_PROVIDER'] || ''} 
                  onChange={(v: string) => tanganiPerubahan('AI_PROVIDER', v)}
                  opsi={[
                    { label: 'Groq Cloud (Gratis & Super Cepat)', nilai: 'Groq' },
                    { label: 'OpenRouter (Model AI Gratis)', nilai: 'OpenRouter' },
                    { label: 'Google Gemini', nilai: 'Google Gemini' },
                    { label: 'OpenAI', nilai: 'OpenAI' },
                    { label: 'Kustom / OpenAI Compatible', nilai: 'Custom' },
                  ]} 
                />
                {/* Info badge provider gratis */}
                {(pengaturan['AI_PROVIDER'] === 'Groq' || pengaturan['AI_PROVIDER'] === 'OpenRouter') && (
                  <div className="flex items-start gap-2 rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-700">
                    <span className="mt-0.5 text-base">🎉</span>
                    <div>
                      <span className="font-semibold">{pengaturan['AI_PROVIDER'] === 'Groq' ? 'Groq Cloud' : 'OpenRouter'}</span> menyediakan API gratis dengan kuota harian.
                      {pengaturan['AI_PROVIDER'] === 'Groq' && <span> Daftarkan kunci di <a href="https://console.groq.com" target="_blank" rel="noopener noreferrer" className="underline font-medium">console.groq.com</a>.</span>}
                      {pengaturan['AI_PROVIDER'] === 'OpenRouter' && <span> Daftarkan kunci di <a href="https://openrouter.ai/keys" target="_blank" rel="noopener noreferrer" className="underline font-medium">openrouter.ai/keys</a>.</span>}
                    </div>
                  </div>
                )}
                <FieldInputRahasia 
                  label="API Key" 
                  kunci="AI_API_KEY"
                  nilai={pengaturan['AI_API_KEY'] || ''} 
                  onChange={(v: string) => tanganiPerubahan('AI_API_KEY', v)}
                  lihat={lihatRahasia['AI_API_KEY']}
                  toggleLihat={() => tanganiToggleRahasia('AI_API_KEY')}
                  placeholder={
                    PLACEHOLDER_API_KEY[pengaturan['AI_PROVIDER'] || ''] ??
                    'Isi untuk mengubah kunci API lama (terenkripsi)'
                  }
                />
                <FieldInput 
                  label="Model Default" 
                  nilai={pengaturan['AI_MODEL'] || ''} 
                  onChange={(v: string) => tanganiPerubahan('AI_MODEL', v)}
                  keterangan={
                    pengaturan['AI_PROVIDER'] === 'Groq'
                      ? 'Model Groq aktif: qwen/qwen3.6-27b (direkomendasikan), openai/gpt-oss-120b, groq/compound-mini'
                      : pengaturan['AI_PROVIDER'] === 'OpenRouter'
                      ? 'Contoh: meta-llama/llama-3.3-70b-instruct:free, google/gemini-flash-1.5:free'
                      : pengaturan['AI_PROVIDER'] === 'Google Gemini'
                      ? 'Contoh: gemini-1.5-flash, gemini-1.5-pro, gemini-2.0-flash'
                      : pengaturan['AI_PROVIDER'] === 'OpenAI'
                      ? 'Contoh: gpt-4o-mini, gpt-4o, gpt-3.5-turbo'
                      : 'Masukkan nama model yang disediakan oleh endpoint kustom Anda.'
                  }
                />
                <FieldInput 
                  label="Biaya RinCoin per Chat" 
                  tipe="number"
                  nilai={pengaturan['AI_BIAYA_PER_CHAT_RINCOIN'] || '0'} 
                  onChange={(v: string) => tanganiPerubahan('AI_BIAYA_PER_CHAT_RINCOIN', v)}
                  keterangan="Isi 0 untuk memberikan akses chat AI secara gratis."
                />
              </>
            )}

            {tabAktif === 'payment' && (
              <>
                <FieldSelect 
                  label="Provider Pembayaran" 
                  nilai={pengaturan['PAYMENT_PROVIDER'] || ''} 
                  onChange={(v: string) => tanganiPerubahan('PAYMENT_PROVIDER', v)}
                  opsi={[{ label: 'Midtrans', nilai: 'MIDTRANS' }, { label: 'Xendit', nilai: 'XENDIT' }, { label: 'Tripay', nilai: 'TRIPAY' }]} 
                />
                <FieldInputRahasia 
                  label="Server Key" 
                  kunci="PAYMENT_SERVER_KEY"
                  nilai={pengaturan['PAYMENT_SERVER_KEY'] || ''} 
                  onChange={(v: string) => tanganiPerubahan('PAYMENT_SERVER_KEY', v)}
                  lihat={lihatRahasia['PAYMENT_SERVER_KEY']}
                  toggleLihat={() => tanganiToggleRahasia('PAYMENT_SERVER_KEY')}
                  placeholder="Isi untuk mengubah server key (terenkripsi)"
                />
                <FieldInput 
                  label="Client Key" 
                  nilai={pengaturan['PAYMENT_CLIENT_KEY'] || ''} 
                  onChange={(v: string) => tanganiPerubahan('PAYMENT_CLIENT_KEY', v)}
                />
                <FieldInput 
                  label="Merchant ID" 
                  nilai={pengaturan['PAYMENT_MERCHANT_ID'] || ''} 
                  onChange={(v: string) => tanganiPerubahan('PAYMENT_MERCHANT_ID', v)}
                />
                <FieldToggle 
                  label="Mode Produksi (Production)" 
                  nilai={pengaturan['PAYMENT_IS_PRODUCTION'] === 'true'} 
                  onChange={(v: boolean) => tanganiPerubahan('PAYMENT_IS_PRODUCTION', v ? 'true' : 'false')}
                  keterangan="Nonaktifkan (off) untuk mode uji coba (Sandbox)."
                />
              </>
            )}

            {tabAktif === 'wa' && (
              <>
                <FieldSelect 
                  label="Provider WhatsApp" 
                  nilai={pengaturan['WA_PROVIDER'] || ''} 
                  onChange={(v: string) => tanganiPerubahan('WA_PROVIDER', v)}
                  opsi={[{ label: 'Fonnte', nilai: 'FONNTE' }, { label: 'WhatsApp Business API (WABA)', nilai: 'WABA' }, { label: 'Twilio', nilai: 'TWILIO' }]} 
                />
                <FieldInputRahasia 
                  label="API Token/Key" 
                  kunci="WA_API_KEY"
                  nilai={pengaturan['WA_API_KEY'] || ''} 
                  onChange={(v: string) => tanganiPerubahan('WA_API_KEY', v)}
                  lihat={lihatRahasia['WA_API_KEY']}
                  toggleLihat={() => tanganiToggleRahasia('WA_API_KEY')}
                  placeholder="Isi untuk mengubah token (terenkripsi)"
                />
                <FieldInput 
                  label="Nomor Pengirim / Endpoint URL" 
                  nilai={pengaturan['WA_SENDER_NUMBER'] || ''} 
                  onChange={(v: string) => tanganiPerubahan('WA_SENDER_NUMBER', v)}
                />
              </>
            )}

            {tabAktif === 'video' && (
              <>
                <FieldSelect 
                  label="Tipe Video Default" 
                  nilai={pengaturan['VIDEO_DEFAULT_TYPE'] || ''} 
                  onChange={(v: string) => tanganiPerubahan('VIDEO_DEFAULT_TYPE', v)}
                  opsi={[{ label: 'Video Stream Sendiri', nilai: 'VIDEO_STREAM' }, { label: 'YouTube Embed', nilai: 'EMBED_YOUTUBE' }, { label: 'Zoom Link', nilai: 'LINK_ZOOM' }]} 
                />
                <FieldToggle 
                  label="Aktifkan Modul Kelas Video" 
                  nilai={pengaturan['FITUR_KELAS_VIDEO_AKTIF'] === 'true'} 
                  onChange={(v: boolean) => tanganiPerubahan('FITUR_KELAS_VIDEO_AKTIF', v ? 'true' : 'false')}
                />
                <FieldToggle 
                  label="Aktifkan Modul Live Videocall" 
                  nilai={pengaturan['FITUR_VIDEOCALL_AKTIF'] === 'true'} 
                  onChange={(v: boolean) => tanganiPerubahan('FITUR_VIDEOCALL_AKTIF', v ? 'true' : 'false')}
                />
              </>
            )}

            {tabAktif === 'monetisasi' && (
              <>
                <FieldInput 
                  label="Biaya Langganan Mingguan (Rp)" 
                  tipe="number"
                  nilai={pengaturan['BIAYA_LANGGANAN_MINGGUAN'] || '0'} 
                  onChange={(v: string) => tanganiPerubahan('BIAYA_LANGGANAN_MINGGUAN', v)}
                />
                <FieldInput 
                  label="Biaya Langganan Bulanan (Rp)" 
                  tipe="number"
                  nilai={pengaturan['BIAYA_LANGGANAN_BULANAN'] || '0'} 
                  onChange={(v: string) => tanganiPerubahan('BIAYA_LANGGANAN_BULANAN', v)}
                />
                <FieldInput 
                  label="Biaya Langganan Semester (Rp)" 
                  tipe="number"
                  nilai={pengaturan['BIAYA_LANGGANAN_SEMESTER'] || '0'} 
                  onChange={(v: string) => tanganiPerubahan('BIAYA_LANGGANAN_SEMESTER', v)}
                />
                <FieldInput 
                  label="Nilai 1 RinCoin (Rp)" 
                  tipe="number"
                  nilai={pengaturan['NILAI_SATU_RINCOIN_RUPIAH'] || '0'} 
                  onChange={(v: string) => tanganiPerubahan('NILAI_SATU_RINCOIN_RUPIAH', v)}
                  keterangan="Tarif dasar konversi uang riil ke koin virtual aplikasi."
                />
              </>
            )}
          </div>

          <div className="mt-8 pt-6 border-t border-slate-200">
            <button
              type="submit"
              disabled={loadingSimpan}
              className="flex items-center space-x-2 bg-indigo-600 text-white px-6 py-2.5 rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {loadingSimpan ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
              <span>Simpan Pengaturan</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Komponen Input Bantuan
function FieldInput({ label, nilai, onChange, tipe = "text", keterangan, placeholder }: any) {
  return (
    <div>
      <label className="block text-sm font-medium text-slate-700 mb-1.5">{label}</label>
      <input
        type={tipe}
        value={nilai}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full border border-slate-200 rounded-lg px-4 py-2 text-sm text-slate-900 bg-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-all shadow-sm"
      />
      {keterangan && <p className="mt-1.5 text-xs text-slate-500">{keterangan}</p>}
    </div>
  );
}

function FieldInputRahasia({ label, kunci, nilai, onChange, lihat, toggleLihat, placeholder }: any) {
  return (
    <div>
      <label className="block text-sm font-medium text-slate-700 mb-1.5">{label}</label>
      <div className="relative">
        <input
          type={lihat ? "text" : "password"}
          value={nilai}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full border border-slate-200 rounded-lg px-4 py-2 pr-12 text-sm text-slate-900 bg-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-all shadow-sm"
        />
        <button
          type="button"
          onClick={toggleLihat}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
        >
          {lihat ? <EyeOff size={18} /> : <Eye size={18} />}
        </button>
      </div>
    </div>
  );
}

function FieldSelect({ label, nilai, onChange, opsi }: any) {
  return (
    <div>
      <label className="block text-sm font-medium text-slate-700 mb-1.5">{label}</label>
      <select
        value={nilai}
        onChange={(e) => onChange(e.target.value)}
        className="w-full border border-slate-200 rounded-lg px-4 py-2 text-sm text-slate-900 bg-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-all shadow-sm appearance-none"
      >
        {opsi.map((o: any) => (
          <option key={o.nilai} value={o.nilai}>{o.label}</option>
        ))}
      </select>
    </div>
  );
}

function FieldToggle({ label, nilai, onChange, keterangan }: any) {
  return (
    <div className="flex items-start">
      <div className="flex items-center h-5">
        <button
          type="button"
          role="switch"
          aria-checked={nilai}
          onClick={() => onChange(!nilai)}
          className={cn(
            "relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2",
            nilai ? "bg-indigo-600" : "bg-slate-200"
          )}
        >
          <span
            aria-hidden="true"
            className={cn(
              "pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out",
              nilai ? "translate-x-4" : "translate-x-0"
            )}
          />
        </button>
      </div>
      <div className="ml-3 text-sm">
        <label className="font-medium text-slate-700 cursor-pointer" onClick={() => onChange(!nilai)}>
          {label}
        </label>
        {keterangan && <p className="text-slate-500 mt-0.5">{keterangan}</p>}
      </div>
    </div>
  );
}
