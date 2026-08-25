import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { BookOpen, GraduationCap, PlayCircle, Trophy, Coins, Plus, Calendar, ArrowRight, MessageSquare, Sparkles, AlertCircle, CheckCircle, Compass } from 'lucide-react';
import Link from 'next/link';

export default async function BerandaSiswa() {
  const session = await getServerSession(authOptions);
  const siswaId = session?.user?.id;

  let siswa = null;
  let langgananAktif: any[] = [];
  let riwayatUjian: any[] = [];

  if (siswaId) {
    siswa = await prisma.pengguna.findUnique({
      where: { id: siswaId },
      include: {
        langgananSiswa: {
          where: { apakahAktif: true },
          include: {
            kursus: {
              include: {
                materiKursus: true
              }
            }
          }
        },
        riwayatUjian: {
          include: {
            ujian: {
              include: {
                bankSoal: true
              }
            }
          },
          orderBy: { waktuMulai: 'desc' }
        }
      }
    });

    if (siswa) {
      langgananAktif = siswa.langgananSiswa || [];
      riwayatUjian = siswa.riwayatUjian || [];
    }
  }

  const tanggalSekarang = new Intl.DateTimeFormat('id-ID', { dateStyle: 'full' }).format(new Date());

  // Hitung Metrik Belajar
  const totalKursus = langgananAktif.length;
  
  const ujianSelesaiSesi = riwayatUjian.filter((r: any) => r.status === 'SELESAI');
  const totalUjianSelesai = ujianSelesaiSesi.length;
  
  const rataRataNilai = totalUjianSelesai > 0
    ? (ujianSelesaiSesi.reduce((sum: number, r: any) => sum + r.nilaiAkhir, 0) / totalUjianSelesai).toFixed(1)
    : '0';

  const totalModul = langgananAktif.reduce((sum: number, l: any) => sum + (l.kursus?.materiKursus?.length || 0), 0);
  
  // Sertifikat diperoleh jika lulus (skor >= 70)
  const totalSertifikat = ujianSelesaiSesi.filter((r: any) => r.nilaiAkhir >= 70).length;

  const metrikBelajar = [
    { label: 'Kursus Diikuti', nilai: `${totalKursus} Kursus`, status: 'Aktif Belajar', ikon: BookOpen, warna: 'text-indigo-600', bg: 'bg-indigo-50 border-indigo-100' },
    { label: 'Ujian Selesai', nilai: `${totalUjianSelesai} Ujian`, status: `Rata-rata: ${rataRataNilai}`, ikon: Trophy, warna: 'text-amber-600', bg: 'bg-amber-50 border-amber-100' },
    { label: 'Modul & Video', nilai: `${totalModul} Bab`, status: 'Tersedia', ikon: PlayCircle, warna: 'text-rose-600', bg: 'bg-rose-50 border-rose-100' },
    { label: 'Sertifikat & Prestasi', nilai: `${totalSertifikat} Raihan`, status: 'Lulus Ujian KKM', ikon: GraduationCap, warna: 'text-emerald-600', bg: 'bg-emerald-50 border-emerald-100' },
  ];

  // Inisial avatar nama siswa
  const inisialNama = siswa?.nama
    ? siswa.nama.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2)
    : 'SW';

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-7xl mx-auto">
      
      {/* Bagian 1: Header Dasbor & Status Gamifikasi */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 bg-white p-6 md:p-8 rounded-3xl border border-slate-200/90 shadow-sm relative overflow-hidden">
        <div className="absolute right-0 top-0 w-24 h-24 bg-indigo-50 rounded-full blur-3xl opacity-60 -z-10"></div>
        <div className="absolute left-1/3 bottom-0 w-32 h-32 bg-blue-50 rounded-full blur-3xl opacity-50 -z-10"></div>
        
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-indigo-600 text-white font-extrabold text-xl flex items-center justify-center shadow-md shadow-indigo-100 shrink-0">
            {inisialNama}
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight">
              Halo, {siswa?.nama || session?.user?.name || 'Siswa'}! 👋
            </h1>
            <p className="mt-1 text-sm text-slate-500 font-medium flex items-center gap-1.5">
              <span>{tanggalSekarang}</span>
              <span className="text-slate-300">•</span>
              <span className="text-indigo-600 font-semibold">Semangat belajar hari ini! 🚀</span>
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Badge Saldo RinCoin */}
          <Link 
            href="/siswa/dompet"
            className="flex items-center gap-2.5 px-4 py-3 bg-amber-50 hover:bg-amber-100 border border-amber-200 text-amber-800 text-sm font-black rounded-2xl shadow-sm transition-colors cursor-pointer group"
          >
            <Coins className="w-5 h-5 text-amber-500 group-hover:scale-110 transition-transform" />
            <span>🪙 {siswa?.saldoRinCoin || 0} RC</span>
            <span className="text-xs px-2 py-0.5 bg-amber-200/60 border border-amber-300/40 rounded-lg text-amber-900 font-bold ml-1">+ Isi Saldo</span>
          </Link>
          
          {/* Lencana Target Mingguan */}
          <div className="flex items-center gap-2 px-4 py-3 bg-slate-50 border border-slate-200 text-slate-700 text-xs font-bold rounded-2xl">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
            <span>Target: 4 Jam / Minggu</span>
          </div>
        </div>
      </div>

      {/* Bagian 2: Grid Metrik Cepat */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {metrikBelajar.map((item, index) => {
          const Ikon = item.ikon;
          return (
            <div 
              key={index} 
              className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all hover:-translate-y-0.5 duration-300"
            >
              <div className="flex items-center gap-4">
                <div className={`p-3.5 rounded-2xl border ${item.bg} ${item.warna}`}>
                  <Ikon className="w-6 h-6" strokeWidth={2.5} />
                </div>
                <div>
                  <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest">{item.label}</p>
                  <p className="text-xl font-black text-slate-900 mt-1">{item.nilai}</p>
                  <p className="text-xs text-slate-500 font-medium mt-0.5">{item.status}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Bagian 3: Konten Utama Bento Grid (8:4) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Kolom Kiri (Lebar 67%) */}
        <div className="lg:col-span-8 space-y-8">
          
          {/* Kartu 1: Lanjutkan Pembelajaran Terakhir */}
          <div className="bg-white border border-slate-200/90 shadow-sm rounded-3xl p-6 md:p-8 hover:shadow-md transition-all">
            <div className="flex items-center justify-between mb-6 border-b border-slate-100 pb-4">
              <h2 className="text-lg font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-indigo-600" /> Lanjutkan Pembelajaran Terakhir
              </h2>
            </div>
            
            {langgananAktif.length > 0 ? (
              (() => {
                const kursusTerakhir = langgananAktif[0].kursus;
                const totalMateri = kursusTerakhir?.materiKursus?.length || 0;
                // Simulasi progress belajar (misal 65%)
                const progressPersen = 65;
                
                return (
                  <div className="space-y-6">
                    <div className="p-5 bg-slate-50 rounded-2xl border border-slate-200/80 flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div className="space-y-1">
                        <span className="text-[10px] font-bold bg-indigo-50 border border-indigo-200 text-indigo-700 px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                          {kursusTerakhir?.tipeKursus?.replace(/_/g, ' ') || 'KURSUS'}
                        </span>
                        <h3 className="text-lg font-black text-slate-900 pt-1">{kursusTerakhir?.judul || 'Judul Kursus'}</h3>
                        <p className="text-sm text-slate-500 font-medium">Materi terakhir: Bab 2 - Latihan Soal & Ringkasan</p>
                      </div>
                      <div className="text-right shrink-0">
                        <span className="text-xs text-slate-400 font-semibold">Total Modul:</span>
                        <span className="text-sm font-bold text-slate-800 ml-1.5">{totalMateri} Bab</span>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between items-center text-xs font-bold">
                        <span className="text-slate-500">Progres Belajar</span>
                        <span className="text-indigo-600">{progressPersen}% Selesai</span>
                      </div>
                      <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                        <div 
                          className="bg-indigo-600 h-full rounded-full transition-all duration-500" 
                          style={{ width: `${progressPersen}%` }}
                        ></div>
                      </div>
                    </div>

                    <div className="flex justify-end pt-2">
                      <Link 
                        href={`/siswa/kursus`}
                        className="inline-flex items-center gap-2 px-5 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-2xl text-sm transition shadow-sm"
                      >
                        Lanjutkan Belajar Sekarang <ArrowRight className="w-4 h-4" />
                      </Link>
                    </div>
                  </div>
                );
              })()
            ) : (
              // Fallback Onboarding jika belum mendaftar kursus
              <div className="p-6 bg-slate-50 border border-dashed border-slate-200 rounded-2xl text-center space-y-4">
                <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center mx-auto border border-indigo-100">
                  <Compass className="w-6 h-6" />
                </div>
                <div className="space-y-1.5 max-w-md mx-auto">
                  <h3 className="font-bold text-slate-800 text-base">Langkah Awal Belajar 🚀</h3>
                  <p className="text-sm text-slate-500 leading-relaxed">
                    Jelajahi berbagai materi bimbel interaktif, rekaman kelas, ebook berkualitas tinggi, dan kuis menantang untuk meningkatkan kesiapan akademik Anda.
                  </p>
                </div>
                <div className="pt-2">
                  <Link 
                    href="/siswa/kursus"
                    className="inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-xs transition shadow-sm"
                  >
                    Jelajahi Kursus Unggulan <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            )}
          </div>

          {/* Kartu 2: Simulasi Ujian & Rekomendasi CBT */}
          <div className="bg-white border border-slate-200/90 shadow-sm rounded-3xl p-6 md:p-8 hover:shadow-md transition-all">
            <div className="flex items-center justify-between mb-6 border-b border-slate-100 pb-4">
              <h2 className="text-lg font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
                <Trophy className="w-5 h-5 text-amber-600" /> Simulasi Ujian & Rekomendasi CBT
              </h2>
            </div>

            {riwayatUjian.length > 0 ? (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {riwayatUjian.slice(0, 2).map((sesi) => {
                    const lulus = sesi.nilaiAkhir >= 70;
                    const isDiskualifikasi = sesi.status === 'DIDISKUALIFIKASI_CURANG';
                    
                    return (
                      <div key={sesi.id} className="p-5 bg-slate-50 rounded-2xl border border-slate-200/80 relative flex flex-col justify-between">
                        <div>
                          <div className="flex justify-between items-start mb-3">
                            <span className="text-[10px] font-bold bg-slate-200 text-slate-700 px-2 py-0.5 rounded uppercase tracking-wider">
                              TRYOUT
                            </span>
                            
                            {isDiskualifikasi ? (
                              <span className="inline-flex items-center gap-0.5 text-xs text-rose-600 font-bold bg-rose-50 border border-rose-200 px-2 py-0.5 rounded-full">
                                <AlertCircle className="w-3 h-3" /> Gugur
                              </span>
                            ) : lulus ? (
                              <span className="inline-flex items-center gap-0.5 text-xs text-emerald-600 font-bold bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                                <CheckCircle className="w-3 h-3" /> Lulus
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-0.5 text-xs text-rose-500 font-bold bg-rose-50 border border-rose-200 px-2 py-0.5 rounded-full">
                                Evaluasi
                              </span>
                            )}
                          </div>

                          <h3 className="font-bold text-slate-800 text-sm line-clamp-1 mb-1">{sesi.ujian.judulUjian}</h3>
                          <p className="text-[11px] text-slate-500 font-medium">Dikerjakan: {new Date(sesi.waktuMulai).toLocaleDateString('id-ID', { dateStyle: 'medium' })}</p>
                        </div>

                        <div className="flex items-end justify-between mt-5 border-t border-slate-200/60 pt-3">
                          <div>
                            <span className="text-[10px] text-slate-400 block font-bold uppercase">Skor</span>
                            <span className="text-xl font-black text-slate-800">{isDiskualifikasi ? '0.0' : sesi.nilaiAkhir.toFixed(1)}</span>
                          </div>
                          
                          <Link 
                            href={`/siswa/ujian/${sesi.ujian.id}/hasil/${sesi.id}`}
                            className="text-xs font-bold text-indigo-600 hover:text-indigo-700 transition"
                          >
                            Detail Nilai →
                          </Link>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Analisis Topik Kelemahan Sederhana jika ada pengerjaan */}
                <div className="bg-amber-50/50 border border-amber-100 rounded-2xl p-4 flex gap-3">
                  <div className="p-2 bg-amber-50 rounded-xl text-amber-600 shrink-0">
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-black text-amber-900 uppercase tracking-wider">Rekomendasi RinaSensei</h4>
                    <p className="text-xs text-amber-700 font-medium mt-1 leading-relaxed">
                      Berdasarkan hasil latihan terakhir, tingkatkan fokus belajar Anda pada topik-topik dengan tingkat kesalahan tinggi. Hubungi RinaSensei AI jika butuh pembahasan interaktif.
                    </p>
                  </div>
                </div>

                <div className="flex justify-end">
                  <Link 
                    href="/siswa/ujian"
                    className="inline-flex items-center gap-1.5 px-5 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-2xl text-sm transition-colors border border-slate-300/80 shadow-sm"
                  >
                    Mulai Tryout Baru
                  </Link>
                </div>
              </div>
            ) : (
              // Fallback Onboarding jika belum ada riwayat ujian
              <div className="p-6 bg-slate-50 border border-dashed border-slate-200 rounded-2xl text-center space-y-4">
                <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-full flex items-center justify-center mx-auto border border-amber-100">
                  <Trophy className="w-6 h-6" />
                </div>
                <div className="space-y-1.5 max-w-md mx-auto">
                  <h3 className="font-bold text-slate-800 text-base">Coba Simulasi Ujian Pertama Anda 📝</h3>
                  <p className="text-sm text-slate-500 leading-relaxed">
                    Evaluasi kesiapan ujian Anda dengan platform CBT kami. Didukung modul anti-curang, batasan waktu, dan analisis detail sub-topik kelemahan setelah selesai.
                  </p>
                </div>
                <div className="pt-2">
                  <Link 
                    href="/siswa/ujian"
                    className="inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-xs transition shadow-sm"
                  >
                    Buka Katalog CBT <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            )}
          </div>
          
        </div>

        {/* Kolom Kanan (Lebar 33%) */}
        <div className="lg:col-span-4 space-y-8">
          
          {/* Kartu 3: RinaSensei AI Assistant Hub */}
          <div className="bg-gradient-to-br from-indigo-50/80 via-white to-blue-50/80 border border-indigo-100/90 rounded-3xl p-6 shadow-sm hover:shadow-md transition-all flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between border-b border-indigo-100/50 pb-4 mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center text-white font-bold text-lg shadow shadow-indigo-200 relative shrink-0">
                    RS
                    <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 rounded-full border-2 border-white animate-pulse"></span>
                  </div>
                  <div>
                    <h3 className="font-black text-slate-900 leading-tight">RinaSensei AI</h3>
                    <p className="text-[11px] text-emerald-600 font-bold flex items-center gap-1">
                      <span>Tutor Cerdas Aktif</span>
                    </p>
                  </div>
                </div>
                <Sparkles className="w-5 h-5 text-indigo-500" />
              </div>

              <p className="text-xs text-slate-600 font-medium leading-relaxed mb-5">
                Ada kesulitan dalam memahami materi pelajaran atau butuh tips cepat membahas soal? Tanyakan langsung pada Tutor AI Anda!
              </p>

              {/* 3 Tombol Topik Tanya Jawab */}
              <div className="space-y-2 mb-6">
                <Link 
                  href="/siswa/rina-sensei?tanya=bahas" 
                  className="w-full text-left px-4 py-3 bg-white border border-indigo-100/80 rounded-2xl text-xs font-bold text-slate-700 hover:bg-indigo-50 hover:text-indigo-700 transition flex items-center gap-2 shadow-xs"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-500"></span>
                  <span>💡 Bahas Soal Sulit</span>
                </Link>
                <Link 
                  href="/siswa/rina-sensei?tanya=rumus" 
                  className="w-full text-left px-4 py-3 bg-white border border-indigo-100/80 rounded-2xl text-xs font-bold text-slate-700 hover:bg-indigo-50 hover:text-indigo-700 transition flex items-center gap-2 shadow-xs"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-500"></span>
                  <span>📐 Rumus Matematika</span>
                </Link>
                <Link 
                  href="/siswa/rina-sensei?tanya=ringkas" 
                  className="w-full text-left px-4 py-3 bg-white border border-indigo-100/80 rounded-2xl text-xs font-bold text-slate-700 hover:bg-indigo-50 hover:text-indigo-700 transition flex items-center gap-2 shadow-xs"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-500"></span>
                  <span>📝 Ringkas Materi</span>
                </Link>
              </div>
            </div>

            <Link 
              href="/siswa/rina-sensei"
              className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-2xl text-xs text-center shadow-sm hover:shadow transition flex items-center justify-center gap-1.5"
            >
              <MessageSquare className="w-4 h-4" /> Buka Ruang Tanya AI
            </Link>
          </div>

          {/* Kartu 4: Jadwal Belajar & Pengumuman Kelas */}
          <div className="bg-white border border-slate-200/90 shadow-sm rounded-3xl p-6 hover:shadow-md transition-all">
            <div className="flex items-center justify-between mb-4 border-b border-slate-100 pb-3">
              <h3 className="font-black text-slate-900 uppercase tracking-wide text-xs flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-indigo-600" /> Agenda Belajar & Sesi
              </h3>
              <span className="text-[10px] font-bold text-slate-400">Terdekat</span>
            </div>

            <div className="space-y-4">
              <div className="p-3.5 bg-slate-50 border border-slate-200/60 rounded-xl flex items-start gap-3">
                <div className="p-2 bg-indigo-50 rounded-lg text-indigo-600 shrink-0 text-center font-bold text-[10px] leading-tight">
                  SAB <br/> <span className="text-sm">29</span>
                </div>
                <div>
                  <h4 className="font-bold text-xs text-slate-800">Live Video Class: Penalaran Matematika</h4>
                  <p className="text-[10px] text-slate-400 font-semibold mt-0.5">14:00 - 15:30 WIB (Zoom Call)</p>
                </div>
              </div>

              <div className="p-3.5 bg-slate-50 border border-slate-200/60 rounded-xl flex items-start gap-3">
                <div className="p-2 bg-amber-50 rounded-lg text-amber-600 shrink-0 text-center font-bold text-[10px] leading-tight">
                  SEN <br/> <span className="text-sm">31</span>
                </div>
                <div>
                  <h4 className="font-bold text-xs text-slate-800">Batas Ujian: Simulasi UTBK Mandiri</h4>
                  <p className="text-[10px] text-slate-400 font-semibold mt-0.5">Batas Akhir Tryout (CBT Portal)</p>
                </div>
              </div>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
