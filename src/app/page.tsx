import { prisma } from '@/lib/prisma';
import { Sparkles, ShieldCheck, BookOpen, Trophy, PlayCircle, Coins, LogIn, UserPlus, Star, ChevronRight, CheckCircle2, PhoneCall, ShieldAlert, Award } from 'lucide-react';
import Link from 'next/link';
import KalkulatorRinCoin from '@/components/landing/KalkulatorRinCoin';
import FaqAccordion from '@/components/landing/FaqAccordion';

export default async function LandingPage() {
  // Query data riil dari database (jika ada)
  const [daftarKursus, daftarUjian] = await Promise.all([
    prisma.kursus.findMany({
      where: { apakahAktif: true },
      take: 3,
      include: {
        materiKursus: { select: { id: true } }
      }
    }),
    prisma.simulasiUjian.findMany({
      where: { apakahAktif: true },
      take: 3,
      include: {
        bankSoal: { select: { id: true } }
      }
    })
  ]);

  // Katalog Fallback jika database masih kosong
  const kursusFallback = [
    {
      id: 'mock-1',
      judul: 'Persiapan Intensif UTBK-SNBT 2026: Tes Potensi Skolastik (TPS)',
      slug: 'persiapan-utbk-snb-tps',
      deskripsi: 'Kuasai seluruh subtes TPS mulai dari Penalaran Umum, Pengetahuan Kuantitatif, hingga Pemahaman Bacaan bersama RinaSensei.',
      tipeKursus: 'HYBRID',
      hargaRinCoin: 150,
      materiKursus: Array(24).fill(0)
    },
    {
      id: 'mock-2',
      judul: 'Matematika Kuantitatif Masterclass (Tingkat SMA/UTBK)',
      slug: 'matematika-kuantitatif-masterclass',
      deskripsi: 'Pembahasan rumus cepat matematika, trik logika aritmatika, dan tips pengerjaan soal sulit Aljabar dan Geometri.',
      tipeKursus: 'VIDEO_REKAMAN',
      hargaRinCoin: 80,
      materiKursus: Array(16).fill(0)
    },
    {
      id: 'mock-3',
      judul: 'Fisika Dasar Mekanika & Termodinamika (Tingkat SMA)',
      slug: 'fisika-dasar-mekanika-sma',
      deskripsi: 'Pemahaman konsep fisika secara logis, ilustratif, dan menyenangkan tanpa hafalan rumus mati.',
      tipeKursus: 'VIDEO_REKAMAN',
      hargaRinCoin: 50,
      materiKursus: Array(12).fill(0)
    }
  ];

  const ujianFallback = [
    {
      id: 'mock-u1',
      judulUjian: 'Tryout Akbar UTBK-SNBT Mandiri (TPS Lengkap)',
      durasiMenit: 195,
      biayaRinCoin: 30,
      wajibFullscreen: true,
      bankSoal: Array(150).fill(0)
    },
    {
      id: 'mock-u2',
      judulUjian: 'Kuis Harian 01: Penalaran Logika & Aritmatika',
      durasiMenit: 30,
      biayaRinCoin: 10,
      wajibFullscreen: false,
      bankSoal: Array(20).fill(0)
    },
    {
      id: 'mock-u3',
      judulUjian: 'Simulasi Seleksi Kedinasan SKD (TWK, TIU, TKP)',
      durasiMenit: 100,
      biayaRinCoin: 40,
      wajibFullscreen: true,
      bankSoal: Array(110).fill(0)
    }
  ];

  const kursusList = daftarKursus.length > 0 ? daftarKursus : kursusFallback;
  const ujianList = daftarUjian.length > 0 ? daftarUjian : ujianFallback;

  return (
    <div className="bg-slate-50 text-slate-800 font-sans min-h-screen">
      
      {/* Sticky Navigation Bar */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/80 px-6 py-4 flex items-center justify-between shadow-xs">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white font-extrabold text-xl">
            B
          </div>
          <div>
            <span className="text-lg font-black text-slate-900 tracking-tight">Bimbel<span className="text-indigo-600">Pro</span></span>
            <span className="text-[9px] font-black bg-indigo-50 border border-indigo-200 text-indigo-700 px-1.5 py-0.25 rounded ml-1.5">v2.0</span>
          </div>
        </div>

        {/* Links Tengah */}
        <nav className="hidden lg:flex items-center gap-6 text-xs font-bold text-slate-500 tracking-wide uppercase">
          <a href="#fitur" className="hover:text-indigo-600 transition">Fitur Unggulan</a>
          <a href="#katalog-kelas" className="hover:text-indigo-600 transition">Kelas & Video</a>
          <a href="#katalog-cbt" className="hover:text-indigo-600 transition">Simulasi CBT</a>
          <a href="#rina-ai" className="hover:text-indigo-600 transition">AI RinaSensei</a>
          <a href="#kalkulator" className="hover:text-indigo-600 transition">Kalkulator RinCoin</a>
          <a href="#solusi" className="hover:text-indigo-600 transition">Solusi Bimbel</a>
        </nav>

        {/* Tombol Kanan */}
        <div className="flex items-center gap-3">
          <Link 
            href="/masuk" 
            className="flex items-center gap-1.5 px-4.5 py-2.5 text-slate-600 hover:text-indigo-600 text-xs font-black uppercase tracking-wider transition"
          >
            <LogIn className="w-4 h-4" /> Masuk Akun
          </Link>
          <Link 
            href="/daftar" 
            className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-full text-xs font-bold shadow-xs transition"
          >
            <UserPlus className="w-4 h-4" /> Daftar Siswa
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative px-6 py-20 md:py-32 max-w-7xl mx-auto flex flex-col items-center text-center space-y-8 overflow-hidden">
        <div className="absolute top-10 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-indigo-100 rounded-full blur-3xl opacity-40 -z-10"></div>
        
        {/* Lencana Atas */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-white border border-slate-200 rounded-full shadow-xs text-xs font-bold text-indigo-600">
          <Sparkles className="w-4 h-4 text-indigo-500 animate-pulse" />
          <span>Ekosistem Bimbel Digital & Ujian Standar Nasional Terlengkap</span>
        </div>

        {/* Headline */}
        <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-slate-900 leading-tight max-w-4xl tracking-tight">
          Revolusi Cara Belajar dengan <br />
          <span className="text-indigo-600 bg-gradient-to-r from-indigo-600 to-indigo-800 bg-clip-text text-transparent">AI Pintar & Simulasi Ujian Presisi</span>
        </h1>

        {/* Subheadline */}
        <p className="text-sm sm:text-lg text-slate-500 max-w-2xl font-medium leading-relaxed">
          Tingkatkan kelulusan siswa dengan kelas interaktif, tryout CBT anti-curang, tutor cerdas RinaSensei 24/7, dan monetisasi fleksibel berbasis RinCoin.
        </p>

        {/* Tombol Aksi */}
        <div className="flex flex-col sm:flex-row items-center gap-4 pt-4">
          <Link 
            href="/daftar" 
            className="w-full sm:w-auto px-8 py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-full text-sm shadow-md hover:shadow-lg transition flex items-center justify-center gap-2"
          >
            Mulai Belajar Sekarang 🚀
          </Link>
          <a 
            href="#fitur" 
            className="w-full sm:w-auto px-8 py-4 bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 font-bold rounded-full text-sm shadow-xs transition flex items-center justify-center gap-2"
          >
            Lihat Demo Fitur 🎥
          </a>
        </div>

        {/* Lencana Kepercayaan */}
        <div className="grid grid-cols-3 gap-6 pt-12 md:pt-16 border-t border-slate-200/80 w-full max-w-3xl">
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 text-amber-500 text-base md:text-lg font-black">
              <Star className="w-4 h-4 fill-amber-500" /> 4.9/5
            </div>
            <div className="text-[10px] md:text-xs text-slate-400 font-bold uppercase tracking-wider mt-1">Rating Kepuasan</div>
          </div>
          <div className="text-center">
            <div className="text-slate-900 text-base md:text-lg font-black">98%</div>
            <div className="text-[10px] md:text-xs text-slate-400 font-bold uppercase tracking-wider mt-1">Tingkat Kelulusan</div>
          </div>
          <div className="text-center">
            <div className="text-slate-900 text-base md:text-lg font-black flex items-center justify-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span> 24/7
            </div>
            <div className="text-[10px] md:text-xs text-slate-400 font-bold uppercase tracking-wider mt-1">AI Availability</div>
          </div>
        </div>
      </section>

      {/* Bento Grid Showcase: 5 Pilar Keunggulan */}
      <section id="fitur" className="px-6 py-20 max-w-7xl mx-auto space-y-12">
        <div className="text-center space-y-2">
          <span className="text-[11px] font-black text-indigo-600 bg-indigo-50 border border-indigo-100 px-3 py-1 rounded-full uppercase tracking-wider">
            Ekosistem Kelas Dunia
          </span>
          <h2 className="text-2xl md:text-4xl font-black text-slate-900 tracking-tight">5 Pilar Keunggulan Platform Kami</h2>
          <p className="text-sm text-slate-500 max-w-md mx-auto font-medium">Sistem terpadu untuk mendidik, menguji, dan membimbing siswa ke tingkat tertinggi.</p>
        </div>

        {/* Bento Grid (Layout 12 Columns) */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
          
          {/* 1. AI Tutor RinaSensei (md:col-span-7) */}
          <div id="rina-ai" className="md:col-span-7 bg-gradient-to-br from-indigo-50/70 via-white to-blue-50/75 border border-slate-200/80 rounded-3xl p-6 md:p-8 flex flex-col justify-between shadow-xs hover:shadow-md transition duration-300">
            <div>
              <div className="flex items-center gap-2.5 mb-4 border-b border-indigo-100/50 pb-4">
                <div className="p-2.5 bg-indigo-600 rounded-xl text-white font-bold text-sm shadow">RS</div>
                <div>
                  <h3 className="font-black text-slate-950 text-sm leading-none">RinaSensei AI Chat</h3>
                  <span className="text-[9px] text-emerald-600 font-bold block mt-0.5">Tutor AI 24 Jam Aktif</span>
                </div>
              </div>
              <p className="text-xs md:text-sm text-slate-600 font-medium leading-relaxed mb-6">
                Butuh tanya rumus atau penjelasan singkat? RinaSensei AI dapat memberikan instruksi detail cara penyelesaian soal matematika atau fisika dalam hitungan detik.
              </p>
              
              {/* Dialog bubble */}
              <div className="space-y-3.5 bg-white p-4.5 rounded-2xl border border-indigo-100 shadow-sm max-w-lg">
                <div className="text-[11px] font-mono p-2.5 bg-slate-50 rounded-xl border border-slate-200 text-slate-500">
                  Siswa: "Tolong jabarkan rumus kecepatan gelombang..."
                </div>
                <div className="text-[11px] leading-relaxed p-2.5 bg-indigo-50 border border-indigo-100 text-indigo-800 rounded-xl">
                  <strong>RinaSensei:</strong> "Kecepatan gelombang dirumuskan dengan <span className="font-mono bg-white px-1 py-0.25 border border-indigo-200 rounded">v = f x λ</span>. Di mana <em>f</em> adalah frekuensi gelombang, dan <em>λ</em> adalah panjang gelombang..."
                </div>
              </div>
            </div>
            <div className="pt-6">
              <span className="text-xs font-bold text-indigo-600 flex items-center gap-1">Eksplor Tutor AI →</span>
            </div>
          </div>

          {/* 2. CBT Anti-Curang (md:col-span-5) */}
          <div className="md:col-span-5 bg-white border border-slate-200/80 rounded-3xl p-6 md:p-8 flex flex-col justify-between shadow-xs hover:shadow-md transition duration-300">
            <div>
              <div className="w-12 h-12 bg-rose-50 border border-rose-100 text-rose-600 rounded-2xl flex items-center justify-center mb-6">
                <ShieldCheck className="w-6 h-6" strokeWidth={2.5} />
              </div>
              <h3 className="text-lg font-black text-slate-900 mb-2">Simulasi CBT Anti-Curang</h3>
              <p className="text-xs md:text-sm text-slate-500 leading-relaxed font-medium">
                Sistem ujian dengan *Lockdown Mode* otomatis. Mendeteksi perpindahan tab browser, meminimalkan layar, membuka developer tools, dan memblokir klik kanan demi kejujuran akademik.
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-slate-100 flex items-center gap-2">
              <span className="text-[9px] font-black bg-rose-50 text-rose-700 border border-rose-200 px-2 py-0.5 rounded uppercase tracking-wider">Tab Focus Auto-Detect</span>
              <span className="text-[9px] font-black bg-rose-50 text-rose-700 border border-rose-200 px-2 py-0.5 rounded uppercase tracking-wider">Inspect Block</span>
            </div>
          </div>

          {/* 3. Kelas Video & Live (md:col-span-4) */}
          <div className="md:col-span-4 bg-white border border-slate-200/80 rounded-3xl p-6 md:p-8 flex flex-col justify-between shadow-xs hover:shadow-md transition duration-300">
            <div>
              <div className="w-12 h-12 bg-indigo-50 border border-indigo-100 text-indigo-600 rounded-2xl flex items-center justify-center mb-6">
                <PlayCircle className="w-6 h-6" strokeWidth={2.5} />
              </div>
              <h3 className="text-lg font-black text-slate-900 mb-2">Kelas Video & Live Call</h3>
              <p className="text-xs text-slate-500 leading-relaxed font-medium">
                Fleksibilitas belajar dengan ratusan video on-demand (VOD) terstruktur per bab, serta integrasi live videocall interaktif untuk kelas tatap muka bersama pengajar berpengalaman.
              </p>
            </div>
            <span className="text-xs font-bold text-indigo-600 mt-6">Akses Kelas Belajar →</span>
          </div>

          {/* 4. RinCoin Dompet (md:col-span-4) */}
          <div className="md:col-span-4 bg-white border border-slate-200/80 rounded-3xl p-6 md:p-8 flex flex-col justify-between shadow-xs hover:shadow-md transition duration-300">
            <div>
              <div className="w-12 h-12 bg-amber-50 border border-amber-100 text-amber-600 rounded-2xl flex items-center justify-center mb-6">
                <Coins className="w-6 h-6" strokeWidth={2.5} />
              </div>
              <h3 className="text-lg font-black text-slate-900 mb-2">Dompet RinCoin</h3>
              <p className="text-xs text-slate-500 leading-relaxed font-medium">
                Skema pembayaran mikro (*micropayments*) yang adil (1 RC = Rp 1.000). Bayar materi pelajaran secara eceran per bab tanpa dibebani biaya langganan bulanan penuh.
              </p>
            </div>
            <span className="text-xs font-bold text-amber-700 mt-6">Simulasi Tarif Konversi →</span>
          </div>

          {/* 5. WA Gateway (md:col-span-4) */}
          <div className="md:col-span-4 bg-white border border-slate-200/80 rounded-3xl p-6 md:p-8 flex flex-col justify-between shadow-xs hover:shadow-md transition duration-300">
            <div>
              <div className="w-12 h-12 bg-emerald-50 border border-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center mb-6">
                <Award className="w-6 h-6" strokeWidth={2.5} />
              </div>
              <h3 className="text-lg font-black text-slate-900 mb-2">WhatsApp Automation</h3>
              <p className="text-xs text-slate-500 leading-relaxed font-medium">
                Notifikasi otomatis langsung ke WhatsApp siswa atau orang tua untuk pengumuman jadwal, kuitansi pembelian saldo, hingga nilai rapot hasil ujian simulasi secara berkala.
              </p>
            </div>
            <span className="text-xs font-bold text-emerald-700 mt-6">WA Blast Gateway →</span>
          </div>

        </div>
      </section>

      {/* Katalog Pratinjau Kursus (Kelas & Video) */}
      <section id="katalog-kelas" className="px-6 py-20 bg-white border-y border-slate-200/80">
        <div className="max-w-7xl mx-auto space-y-12">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div className="space-y-2">
              <span className="text-[11px] font-black text-indigo-600 bg-indigo-50 border border-indigo-100 px-3 py-1 rounded-full uppercase tracking-wider">
                Video & Materi Belajar
              </span>
              <h2 className="text-2xl md:text-4xl font-black text-slate-900 tracking-tight">Katalog Kursus Unggulan</h2>
              <p className="text-sm text-slate-500 font-medium">Materi kurikulum terbaru yang disusun khusus oleh pengajar bersertifikat.</p>
            </div>
            <Link 
              href="/daftar" 
              className="inline-flex items-center gap-1 text-xs font-bold text-indigo-600 hover:underline uppercase tracking-wide shrink-0"
            >
              Lihat Semua Kursus <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          {/* Grid Kartu Kursus */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {kursusList.map((kursus) => (
              <div 
                key={kursus.id} 
                className="bg-white rounded-3xl border border-slate-200/70 p-6 flex flex-col justify-between shadow-xs hover:shadow-xl hover:border-indigo-200 transition-all duration-300"
              >
                <div>
                  <span className="inline-block text-[10px] font-bold bg-indigo-50 border border-indigo-100 text-indigo-700 px-2.5 py-0.5 rounded uppercase tracking-wider mb-4">
                    {kursus.tipeKursus.replace(/_/g, ' ')}
                  </span>
                  <h3 className="font-bold text-slate-900 text-base mb-2 line-clamp-2">{kursus.judul}</h3>
                  <p className="text-xs text-slate-500 leading-relaxed mb-6 line-clamp-3">{kursus.deskripsi}</p>
                </div>

                <div className="pt-4 border-t border-slate-100 flex items-center justify-between mt-auto">
                  <div className="text-sm font-black text-slate-900">
                    🪙 {kursus.hargaRinCoin} RC
                  </div>
                  <Link 
                    href="/daftar" 
                    className="px-4 py-2 bg-indigo-50 text-indigo-600 hover:bg-indigo-600 hover:text-white rounded-xl text-xs font-bold transition shadow-xs"
                  >
                    Beli Modul
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Katalog Pratinjau Tryout CBT */}
      <section id="katalog-cbt" className="px-6 py-20 max-w-7xl mx-auto space-y-12">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div className="space-y-2">
            <span className="text-[11px] font-black text-indigo-600 bg-indigo-50 border border-indigo-100 px-3 py-1 rounded-full uppercase tracking-wider">
              Evaluasi Terstandar
            </span>
            <h2 className="text-2xl md:text-4xl font-black text-slate-900 tracking-tight">Katalog Simulasi CBT</h2>
            <p className="text-sm text-slate-500 font-medium">Uji kompetensi akademik Anda dengan platform ujian terstandar nasional.</p>
          </div>
          <Link 
            href="/daftar" 
            className="inline-flex items-center gap-1 text-xs font-bold text-indigo-600 hover:underline uppercase tracking-wide shrink-0"
          >
            Lihat Semua Tryout <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Grid Kartu Ujian */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {ujianList.map((ujian) => (
            <div 
              key={ujian.id} 
              className="bg-white rounded-3xl border border-slate-200/70 p-6 flex flex-col justify-between shadow-xs hover:shadow-xl hover:border-indigo-200 transition-all duration-300"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="inline-block text-[10px] font-bold bg-slate-100 text-slate-600 border border-slate-200 px-2.5 py-0.5 rounded uppercase tracking-wider">
                    SIMULASI CBT
                  </span>
                  
                  {ujian.wajibFullscreen && (
                    <span className="inline-flex items-center gap-0.5 text-[9px] text-rose-600 font-black bg-rose-50 border border-rose-100 px-2 py-0.5 rounded">
                      Lockdown Mode
                    </span>
                  )}
                </div>
                
                <h3 className="font-bold text-slate-900 text-base mb-2 line-clamp-2">{ujian.judulUjian}</h3>
                
                <div className="space-y-1.5 text-xs text-slate-500 font-medium mb-6">
                  <div className="flex items-center gap-1.5">
                    <span>⏱️ Durasi:</span>
                    <span className="text-slate-700 font-bold">{ujian.durasiMenit} Menit</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span>📝 Total:</span>
                    <span className="text-slate-700 font-bold">{ujian.bankSoal ? ujian.bankSoal.length : 0} Soal</span>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-between mt-auto">
                <div className="text-sm font-black text-slate-900">
                  🪙 {ujian.biayaRinCoin} RC
                </div>
                <Link 
                  href="/daftar" 
                  className="px-4 py-2 bg-indigo-600 text-white hover:bg-indigo-700 rounded-xl text-xs font-bold transition shadow-xs"
                >
                  Mulai Ujian
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Widget Kalkulator RinCoin Interaktif */}
      <section id="kalkulator" className="px-6 py-20 bg-slate-100/60 border-t border-slate-200/80">
        <div className="max-w-7xl mx-auto space-y-12">
          <div className="text-center space-y-2">
            <h2 className="text-2xl md:text-4xl font-black text-slate-900 tracking-tight">Kalkulator Tarif RinCoin</h2>
            <p className="text-sm text-slate-500 max-w-md mx-auto font-medium">Bandingkan nominal RinCoin dengan kebutuhan belajar Anda secara eceran.</p>
          </div>
          <KalkulatorRinCoin />
        </div>
      </section>

      {/* Section Solusi Custom & White-Label */}
      <section id="solusi" className="px-6 py-20 max-w-7xl mx-auto">
        <div className="bg-gradient-to-br from-indigo-900 via-indigo-950 to-slate-950 rounded-3xl p-8 md:p-12 text-white relative overflow-hidden shadow-xl border border-indigo-950">
          <div className="absolute right-0 top-0 w-80 h-80 bg-indigo-500 rounded-full blur-3xl opacity-20 -z-10"></div>
          <div className="absolute left-1/3 bottom-0 w-72 h-72 bg-blue-500 rounded-full blur-3xl opacity-10 -z-10"></div>

          <div className="max-w-3xl space-y-6">
            <span className="text-[10px] font-black text-indigo-200 bg-indigo-800/60 border border-indigo-700 px-3 py-1 rounded-full uppercase tracking-wider">
              Kemitraan Lembaga & Sekolah
            </span>
            
            <h2 className="text-2xl sm:text-4xl font-black tracking-tight leading-tight">
              Ingin Platform Ini untuk Bimbel atau Sekolah Anda Sendiri?
            </h2>
            
            <p className="text-sm sm:text-base text-indigo-200 leading-relaxed font-medium">
              Kami menawarkan solusi *White-Label* lengkap. Kelola pengajar, materi, ujian CBT anti-contek, dan WhatsApp Blast dengan nama, logo, dan domain institusi Anda sendiri.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-bold pt-4 text-indigo-100">
              <div className="flex items-center gap-2.5">
                <CheckCircle2 className="w-5 h-5 text-indigo-400 shrink-0" />
                <span>Gunakan Brand Sendiri (White-Label)</span>
              </div>
              <div className="flex items-center gap-2.5">
                <CheckCircle2 className="w-5 h-5 text-indigo-400 shrink-0" />
                <span>Custom Domain (.sch.id / .com)</span>
              </div>
              <div className="flex items-center gap-2.5">
                <CheckCircle2 className="w-5 h-5 text-indigo-400 shrink-0" />
                <span>Atur Tarif & Monetisasi Mandiri</span>
              </div>
              <div className="flex items-center gap-2.5">
                <CheckCircle2 className="w-5 h-5 text-indigo-400 shrink-0" />
                <span> WhatsApp API Blast Terintegrasi</span>
              </div>
            </div>

            <div className="pt-6">
              <a 
                href="https://wa.me/6281234567890?text=Halo%20BimbelPro,%20saya%20tertarik%20konsultasi%20solusi%20white-label%20platform%20learning."
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-6 py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-xs shadow-md transition"
              >
                <PhoneCall className="w-4 h-4" /> Konsultasikan Kustomisasi Platform
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Accordion Section */}
      <section className="px-6 py-20 bg-white border-t border-slate-200/80">
        <div className="max-w-7xl mx-auto space-y-12">
          <div className="text-center space-y-2">
            <span className="text-[11px] font-black text-indigo-600 bg-indigo-50 border border-indigo-100 px-3 py-1 rounded-full uppercase tracking-wider">
              Tanya Jawab
            </span>
            <h2 className="text-2xl md:text-4xl font-black text-slate-900 tracking-tight">Pertanyaan yang Sering Diajukan</h2>
            <p className="text-sm text-slate-500 max-w-md mx-auto font-medium">Semua informasi penting seputar fitur dan keamanan BimbelPro.</p>
          </div>
          <FaqAccordion />
        </div>
      </section>

      {/* Footer Modern */}
      <footer className="bg-slate-900 text-white px-6 py-12 md:py-16 border-t border-slate-800">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
          
          <div className="md:col-span-5 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white font-extrabold text-xl">
                B
              </div>
              <span className="text-lg font-black tracking-tight text-white">Bimbel<span className="text-indigo-400">Pro</span></span>
            </div>
            <p className="text-xs text-slate-400 max-w-sm leading-relaxed">
              Platform bimbingan belajar masa depan. Mendukung pengerjaan CBT anti-cheat berstandar nasional, asisten kecerdasan buatan RinaSensei AI, dan kemudahan pembayaran mikro RinCoin.
            </p>
          </div>

          <div className="md:col-span-3 space-y-3 text-xs">
            <h4 className="font-bold text-slate-200 uppercase tracking-widest text-[10px]">Tautan Navigasi</h4>
            <div className="flex flex-col gap-2 text-slate-400">
              <a href="#fitur" className="hover:text-white transition">Fitur Utama</a>
              <a href="#katalog-kelas" className="hover:text-white transition">Katalog Video</a>
              <a href="#katalog-cbt" className="hover:text-white transition">Tryout CBT</a>
              <a href="#kalkulator" className="hover:text-white transition">Kalkulator RinCoin</a>
            </div>
          </div>

          <div className="md:col-span-4 space-y-3 text-xs">
            <h4 className="font-bold text-slate-200 uppercase tracking-widest text-[10px]">Kontak Bantuan</h4>
            <div className="text-slate-400 space-y-1.5 leading-relaxed">
              <p>📍 Jl. Pendidikan No. 45, Jakarta Selatan, Indonesia</p>
              <p>✉️ support@bimbelpro.com</p>
              <p>📞 +62 (21) 8888-9999</p>
            </div>
          </div>

        </div>

        <div className="max-w-7xl mx-auto pt-10 mt-10 border-t border-slate-800 text-center text-xs text-slate-500">
          <p>© {new Date().getFullYear()} BimbelPro v2.0. Hak Cipta Dilindungi Undang-Undang.</p>
        </div>
      </footer>

    </div>
  );
}
