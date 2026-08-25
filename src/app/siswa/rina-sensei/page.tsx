'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import { Trash2, Send, BookOpen, Coins } from 'lucide-react';
import { kirimPesanKeRinaSensei, ambilRiwayatChatRinaSensei } from '@/actions/rina-sensei';

// ---------------------------------------------------------------------------
// TIPE DATA
// ---------------------------------------------------------------------------
type PesanChat = {
  id: string;
  peranPengirim: 'user' | 'assistant';
  isiPesan: string;
  parsedReferensi?: Array<{
    id: string;
    judulMateri: string;
    tipeMateri: string;
    slugKursus: string;
  }> | null;
};

// ---------------------------------------------------------------------------
// RENDERER MARKDOWN SEDERHANA (tanpa dependensi eksternal)
// ---------------------------------------------------------------------------
const TeksMarkdown = ({ teks }: { teks: string }) => {
  if (!teks) return null;
  const baris = teks.split('\n');

  return (
    <div className="prose-sm leading-relaxed text-slate-800 space-y-1">
      {baris.map((b, idx) => {
        // Heading H2/H3
        if (b.startsWith('## ')) {
          const konten = b.substring(3).replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
          return <h2 key={idx} className="text-base font-bold text-slate-900 mt-3 mb-1" dangerouslySetInnerHTML={{ __html: konten }} />;
        }
        if (b.startsWith('### ')) {
          const konten = b.substring(4).replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
          return <h3 key={idx} className="text-sm font-bold text-slate-800 mt-2 mb-0.5" dangerouslySetInnerHTML={{ __html: konten }} />;
        }
        // Bullet point
        if (b.trim().startsWith('- ') || b.trim().startsWith('* ')) {
          let konten = b.trim().substring(2);
          konten = konten.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>').replace(/\*(.*?)\*/g, '<em>$1</em>').replace(/`(.*?)`/g, '<code class="bg-slate-100 text-rose-600 px-1 py-0.5 rounded text-xs font-mono">$1</code>');
          return <li key={idx} className="ml-5 list-disc mb-0.5 text-[15px]" dangerouslySetInnerHTML={{ __html: konten }} />;
        }
        // Teks kosong → pemisah antar-paragraf
        if (!b.trim()) return <div key={idx} className="h-1" />;
        // Paragraf biasa
        let konten = b;
        konten = konten.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>').replace(/\*(.*?)\*/g, '<em>$1</em>').replace(/`(.*?)`/g, '<code class="bg-slate-100 text-rose-600 px-1 py-0.5 rounded text-xs font-mono">$1</code>');
        return <p key={idx} className="text-[15px] min-h-[1.2rem]" dangerouslySetInnerHTML={{ __html: konten }} />;
      })}
    </div>
  );
};

// ---------------------------------------------------------------------------
// KOMPONEN INDIKATOR MENGETIK
// ---------------------------------------------------------------------------
const IndikatorMenulis = () => (
  <div className="flex justify-start">
    <div className="flex gap-3 max-w-[80%]">
      <div className="w-9 h-9 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center text-xs font-bold shrink-0 mt-1 shadow-sm">
        RS
      </div>
      <div className="px-5 py-4 bg-white border border-slate-200 rounded-2xl rounded-tl-sm shadow-sm flex items-center gap-1.5">
        <span className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
        <span className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '160ms' }} />
        <span className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '320ms' }} />
      </div>
    </div>
  </div>
);

// ---------------------------------------------------------------------------
// QUICK PROMPT CHIPS
// ---------------------------------------------------------------------------
const CHIPS_CEPAT = [
  { emoji: '💡', teks: 'Jelaskan konsep Aljabar dasar' },
  { emoji: '📐', teks: 'Apa itu Teorema Pythagoras?' },
  { emoji: '🧬', teks: 'Struktur dan fungsi sel biologi' },
  { emoji: '⚡', teks: 'Rumus dasar Fisika Listrik' },
  { emoji: '🌍', teks: 'Ceritakan tentang Perang Dunia II' },
];

// ---------------------------------------------------------------------------
// HALAMAN UTAMA
// ---------------------------------------------------------------------------
export default function RinaSenseiChatPage() {
  const [riwayat, setRiwayat]         = useState<PesanChat[]>([]);
  const [inputPesan, setInputPesan]   = useState('');
  const [sedangKetik, setSedangKetik] = useState(false);
  const [memuatAwal, setMemuatAwal]   = useState(true);
  const [saldoAktif, setSaldoAktif]   = useState<number | null>(null);
  const [pesanError, setPesanError]   = useState('');

  const scrollRef   = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-scroll ke pesan terbaru
  const gulirKeBawah = useCallback(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
    }
  }, []);

  useEffect(() => { gulirKeBawah(); }, [riwayat, sedangKetik, gulirKeBawah]);

  // Muat riwayat awal
  useEffect(() => {
    (async () => {
      try {
        const data = await ambilRiwayatChatRinaSensei();
        setRiwayat(
          data.map((d: any) => ({
            id: d.id,
            peranPengirim: d.peranPengirim as 'user' | 'assistant',
            isiPesan: d.isiPesan,
          }))
        );
      } catch (err: any) {
        setPesanError(err.message || 'Gagal memuat riwayat obrolan.');
      } finally {
        setMemuatAwal(false);
      }
    })();
  }, []);

  // Kirim pesan
  const handleKirim = async () => {
    if (!inputPesan.trim() || sedangKetik) return;
    const teks = inputPesan.trim();
    setInputPesan('');
    setPesanError('');
    if (textareaRef.current) textareaRef.current.style.height = 'auto';

    // Tambah bubble user secara optimis
    setRiwayat(prev => [...prev, { id: Date.now().toString(), peranPengirim: 'user', isiPesan: teks }]);
    setSedangKetik(true);

    try {
      const hasil = await kirimPesanKeRinaSensei(teks);
      if (hasil.sisaSaldo !== undefined) setSaldoAktif(hasil.sisaSaldo);
      setRiwayat(prev => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          peranPengirim: 'assistant',
          isiPesan: hasil.balasan,
          parsedReferensi: hasil.materiRujukan,
        },
      ]);
    } catch (err: any) {
      setPesanError(err.message || 'Gagal mengirim pesan. Coba lagi.');
    } finally {
      setSedangKetik(false);
    }
  };

  // Keyboard handler: Enter kirim, Shift+Enter baris baru
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleKirim(); }
  };

  // Auto-resize textarea
  const handleInputText = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInputPesan(e.target.value);
    e.target.style.height = 'auto';
    e.target.style.height = `${Math.min(e.target.scrollHeight, 160)}px`;
  };

  // Reset percakapan (hanya state lokal)
  const handleReset = () => {
    if (sedangKetik) return;
    setRiwayat([]);
    setPesanError('');
  };

  // --------------------------------------------------------------------------
  // RENDER LOADING AWAL
  // --------------------------------------------------------------------------
  if (memuatAwal) {
    return (
      <div className="flex h-[calc(100vh-3rem)] items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-3">
          <div className="w-14 h-14 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center text-xl font-extrabold animate-pulse">
            RS
          </div>
          <p className="text-sm font-medium text-slate-500">Memanggil RinaSensei...</p>
        </div>
      </div>
    );
  }

  // --------------------------------------------------------------------------
  // RENDER UTAMA
  // --------------------------------------------------------------------------
  return (
    <div className="h-[calc(100vh-2.5rem)] md:h-[calc(100vh-3rem)] flex flex-col bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">

      {/* ── HEADER ─────────────────────────────────────────────────────────── */}
      <header className="px-5 py-3.5 bg-white border-b border-slate-200 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          {/* Avatar + lampu status online */}
          <div className="relative">
            <div className="w-11 h-11 bg-gradient-to-br from-indigo-500 to-indigo-700 text-white rounded-full flex items-center justify-center text-sm font-extrabold shadow-md">
              RS
            </div>
            <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 border-2 border-white rounded-full" />
          </div>
          <div>
            <h1 className="font-bold text-slate-900 text-base leading-tight">RinaSensei</h1>
            <p className="text-xs text-emerald-600 font-medium">● Online · Siap Membantu</p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          {/* Badge saldo RinCoin */}
          {saldoAktif !== null && (
            <div className="flex items-center gap-1.5 bg-amber-50 border border-amber-200 px-3 py-1.5 rounded-lg">
              <Coins size={14} className="text-amber-500" />
              <span className="text-xs font-bold text-amber-700">{saldoAktif} RC</span>
            </div>
          )}
          {/* Tombol reset percakapan */}
          <button
            type="button"
            onClick={handleReset}
            disabled={sedangKetik || riwayat.length === 0}
            title="Reset percakapan"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-500 hover:text-rose-600 hover:bg-rose-50 border border-slate-200 hover:border-rose-200 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <Trash2 size={14} />
            <span className="hidden sm:inline">Reset</span>
          </button>
        </div>
      </header>

      {/* ── AREA PERCAKAPAN ─────────────────────────────────────────────────── */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 md:px-8 py-6 space-y-6 bg-slate-50/50 scroll-smooth">

        {/* Pesan selamat datang */}
        {riwayat.length === 0 && (
          <div className="flex justify-center mt-4">
            <div className="bg-white border border-indigo-100 shadow-sm rounded-2xl p-7 max-w-lg text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-indigo-700 text-white rounded-full flex items-center justify-center mx-auto mb-4 text-2xl font-extrabold shadow-md">
                RS
              </div>
              <h2 className="text-lg font-bold text-slate-900 mb-1.5">Halo! Aku RinaSensei 👋</h2>
              <p className="text-sm text-slate-500 mb-5 leading-relaxed">
                Asisten belajarmu yang siap membantu 24/7.<br />Ada konsep yang belum kamu pahami? Tanyakan saja!
              </p>
              {/* Quick chips di welcome screen */}
              <div className="flex flex-wrap gap-2 justify-center">
                {CHIPS_CEPAT.map((chip, idx) => (
                  <button
                    key={idx}
                    onClick={() => setInputPesan(chip.teks)}
                    className="px-3 py-1.5 bg-slate-50 hover:bg-indigo-50 hover:text-indigo-600 text-slate-600 text-xs font-medium rounded-full transition-colors border border-slate-200 hover:border-indigo-200"
                  >
                    {chip.emoji} {chip.teks}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Daftar pesan */}
        {riwayat.map((chat) => {
          const isUser = chat.peranPengirim === 'user';
          return (
            <div key={chat.id} className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
              <div className={`flex gap-3 max-w-[88%] md:max-w-[78%] ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>

                {/* Avatar AI */}
                {!isUser && (
                  <div className="w-9 h-9 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center text-xs font-bold shrink-0 mt-1 shadow-sm">
                    RS
                  </div>
                )}

                <div className="flex flex-col gap-2">
                  {/* Bubble pesan */}
                  <div className={`px-5 py-4 shadow-sm text-[15px] leading-relaxed ${
                    isUser
                      ? 'bg-indigo-600 text-white rounded-2xl rounded-tr-sm'
                      : 'bg-white border border-slate-200 text-slate-800 rounded-2xl rounded-tl-sm'
                  }`}>
                    {isUser
                      ? <p className="whitespace-pre-wrap">{chat.isiPesan}</p>
                      : <TeksMarkdown teks={chat.isiPesan} />
                    }
                  </div>

                  {/* Kartu referensi materi */}
                  {!isUser && chat.parsedReferensi && chat.parsedReferensi.length > 0 && (
                    <div className="bg-white border border-indigo-100 rounded-xl p-4 shadow-sm">
                      <div className="text-xs font-bold text-indigo-600 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                        <BookOpen size={14} />
                        Rekomendasi Materi Terkait
                      </div>
                      <div className="space-y-2">
                        {chat.parsedReferensi.map((ref) => (
                          <div key={ref.id} className="flex items-center justify-between bg-slate-50 border border-slate-100 p-2.5 rounded-lg">
                            <div>
                              <h4 className="font-semibold text-slate-800 text-sm line-clamp-1">{ref.judulMateri}</h4>
                              <span className="text-xs text-slate-500 capitalize">{ref.tipeMateri.replace('_', ' ').toLowerCase()}</span>
                            </div>
                            <Link
                              href={`/siswa/kursus/${ref.slugKursus}`}
                              className="px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-md text-xs font-semibold transition-colors shrink-0 ml-3"
                            >
                              Buka
                            </Link>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}

        {/* Indikator mengetik */}
        {sedangKetik && <IndikatorMenulis />}
      </div>

      {/* ── NOTIFIKASI ERROR ────────────────────────────────────────────────── */}
      {pesanError && (
        <div className="shrink-0 bg-rose-50 border-t border-rose-100 px-6 py-2 text-sm text-rose-600 font-medium text-center">
          {pesanError}
        </div>
      )}

      {/* ── AREA INPUT BAWAH ────────────────────────────────────────────────── */}
      <div className="shrink-0 px-4 md:px-6 pt-3 pb-4 bg-white border-t border-slate-200">

        {/* Quick Prompt Chips */}
        {riwayat.length > 0 && (
          <div className="flex gap-2 mb-3 overflow-x-auto pb-1 scrollbar-hide">
            {CHIPS_CEPAT.map((chip, idx) => (
              <button
                key={idx}
                onClick={() => { setInputPesan(chip.teks); textareaRef.current?.focus(); }}
                disabled={sedangKetik}
                className="whitespace-nowrap px-3 py-1.5 bg-slate-50 hover:bg-indigo-50 hover:text-indigo-600 text-slate-600 text-xs font-medium rounded-full transition-colors border border-slate-200 hover:border-indigo-200 disabled:opacity-40 disabled:cursor-not-allowed shrink-0"
              >
                {chip.emoji} {chip.teks}
              </button>
            ))}
          </div>
        )}

        {/* Input dock */}
        <div className="flex items-end gap-3 max-w-4xl mx-auto">
          <textarea
            ref={textareaRef}
            value={inputPesan}
            onChange={handleInputText}
            onKeyDown={handleKeyDown}
            disabled={sedangKetik}
            placeholder="Tanyakan materi yang membingungkanmu... (Enter untuk kirim, Shift+Enter untuk baris baru)"
            className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 resize-none transition-all disabled:opacity-60 disabled:cursor-not-allowed placeholder:text-slate-400"
            rows={1}
            style={{ maxHeight: '160px' }}
          />
          <button
            onClick={handleKirim}
            disabled={!inputPesan.trim() || sedangKetik}
            title="Kirim pesan"
            className="p-3 bg-indigo-600 hover:bg-indigo-700 active:scale-95 disabled:bg-slate-300 text-white rounded-xl transition-all shrink-0 shadow-sm"
          >
            <Send size={18} />
          </button>
        </div>

        <p className="text-center mt-2 text-[11px] text-slate-400">
          RinaSensei dapat membuat kesalahan. Selalu verifikasi fakta yang penting.
        </p>
      </div>

    </div>
  );
}
