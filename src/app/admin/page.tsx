import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { Users, BookOpen, FileQuestion, CreditCard, ArrowRight, ShieldAlert, Coins, PlusCircle, Video, MessageSquare, BrainCircuit, Wallet, AlertTriangle, Fingerprint, ExternalLink, HelpCircle } from 'lucide-react';
import Link from 'next/link';

export default async function BerandaAdmin() {
  const session = await getServerSession(authOptions);
  
  const adminId = session?.user?.id;
  let admin = null;
  if (adminId) {
    admin = await prisma.pengguna.findUnique({ where: { id: adminId } });
  }

  // Live Database Queries via Promise.all
  const [
    totalSiswa,
    totalKursus,
    totalUjian,
    totalTransaksi,
    agregasiPendapatan,
    riwayatUjianTerbaru,
    transaksiTerbaru,
    siswaDiskualifikasi
  ] = await Promise.all([
    prisma.pengguna.count({ where: { peran: 'SISWA' } }),
    prisma.kursus.count(),
    prisma.simulasiUjian.count(),
    prisma.transaksiRinCoin.count({ where: { status: 'BERHASIL' } }),
    prisma.transaksiRinCoin.aggregate({
      _sum: { jumlahKoin: true },
      where: { status: 'BERHASIL' }
    }),
    prisma.sesiUjianSiswa.findMany({
      take: 5,
      orderBy: { waktuMulai: 'desc' },
      include: {
        siswa: { select: { nama: true, email: true } },
        ujian: { select: { judulUjian: true } }
      }
    }),
    prisma.transaksiRinCoin.findMany({
      take: 5,
      orderBy: { tanggalDibuat: 'desc' },
      include: {
        siswa: { select: { nama: true, email: true } }
      }
    }),
    prisma.sesiUjianSiswa.count({
      where: { status: 'DIDISKUALIFIKASI_CURANG' }
    })
  ]);

  const tanggalSekarang = new Intl.DateTimeFormat('id-ID', { dateStyle: 'full' }).format(new Date());

  const sirkulasiKoin = agregasiPendapatan._sum.jumlahKoin || 0;
  const estimasiRupiah = sirkulasiKoin * 1000; // Asumsi konversi: 1 RinCoin = Rp 1.000

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-7xl mx-auto pb-12">
      
      {/* Header Sapaan & Bar Aksi */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 bg-white p-6 md:p-8 rounded-3xl border border-slate-200/90 shadow-sm">
        <div>
          <h1 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight">
            Halo, {admin?.nama || session?.user?.name || 'Pengajar'}! 👋
          </h1>
          <p className="mt-1 text-sm text-slate-500 font-medium">
            Selamat datang di <span className="font-bold text-indigo-600">Admin Command Center</span> BimbelPro pada {tanggalSekarang}.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link 
            href="/admin/pengaturan"
            className="px-5 py-2.5 bg-white border border-slate-200 text-slate-700 text-sm font-bold rounded-xl hover:bg-slate-50 transition shadow-sm"
          >
            Pengaturan Sistem
          </Link>
          <Link 
            href="/admin/siswa"
            className="px-5 py-2.5 bg-indigo-600 text-white text-sm font-bold rounded-xl hover:bg-indigo-700 transition shadow-sm"
          >
            Kelola Siswa
          </Link>
        </div>
      </div>

      {/* Grid 4 Kartu KPI Premium */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* KPI 1: Siswa */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition duration-300 flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Total Siswa Terdaftar</p>
              <p className="text-3xl font-black text-slate-900 mt-2">{totalSiswa}</p>
            </div>
            <div className="p-3 rounded-xl bg-indigo-50 border border-indigo-100 text-indigo-600">
              <Users className="w-5 h-5" strokeWidth={2.5} />
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-indigo-600 font-bold">
            <span>Siswa Aktif Belajar</span>
            <Link href="/admin/siswa" className="hover:underline">Lihat Detail →</Link>
          </div>
        </div>

        {/* KPI 2: Kursus */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition duration-300 flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Kursus & Materi Aktif</p>
              <p className="text-3xl font-black text-slate-900 mt-2">{totalKursus}</p>
            </div>
            <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-100 text-emerald-600">
              <BookOpen className="w-5 h-5" strokeWidth={2.5} />
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-emerald-600 font-bold">
            <span>Materi Terpublikasi</span>
            <Link href="/admin/kursus" className="hover:underline">Kelola Kelas →</Link>
          </div>
        </div>

        {/* KPI 3: Ujian CBT */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition duration-300 flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Simulasi CBT & Ujian</p>
              <p className="text-3xl font-black text-slate-900 mt-2">{totalUjian}</p>
            </div>
            <div className="p-3 rounded-xl bg-amber-50 border border-amber-100 text-amber-600">
              <FileQuestion className="w-5 h-5" strokeWidth={2.5} />
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-bold">
            {siswaDiskualifikasi > 0 ? (
              <span className="text-rose-600 animate-pulse flex items-center gap-1">
                <ShieldAlert className="w-3.5 h-3.5" /> {siswaDiskualifikasi} Didiskualifikasi
              </span>
            ) : (
              <span className="text-slate-500">Integritas CBT Aman</span>
            )}
            <Link href="/admin/ujian" className="text-amber-600 hover:underline">Monitor Ujian →</Link>
          </div>
        </div>

        {/* KPI 4: RinCoin & Pendapatan */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition duration-300 flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Sirkulasi & Arus Kas</p>
              <p className="text-2xl font-black text-slate-900 mt-2">🪙 {sirkulasiKoin.toLocaleString('id-ID')} RC</p>
            </div>
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-100 text-rose-600">
              <Wallet className="w-5 h-5" strokeWidth={2.5} />
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-rose-600 font-bold">
            <span>Estimasi: Rp {estimasiRupiah.toLocaleString('id-ID')}</span>
            <Link href="/admin/keuangan" className="hover:underline">Analisis Kas →</Link>
          </div>
        </div>
      </div>

      {/* Bento Grid Operasional (2 Kolom - 7:5) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Kolom Kiri: Aktivitas Ujian & Integritas CBT Terkini (7/12) */}
        <div className="lg:col-span-7 bg-white border border-slate-200/90 shadow-sm rounded-3xl p-6 md:p-8 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-6">
              <h2 className="text-base font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
                <ShieldAlert className="w-5 h-5 text-indigo-600" /> Aktivitas Ujian & Integritas CBT Terkini
              </h2>
              <span className="text-[10px] font-black bg-indigo-50 border border-indigo-100 text-indigo-700 px-2.5 py-0.5 rounded-full">
                LIVE MONITOR
              </span>
            </div>

            {riwayatUjianTerbaru.length > 0 ? (
              <div className="space-y-4">
                {riwayatUjianTerbaru.map((sesi) => {
                  const isDiskualifikasi = sesi.status === 'DIDISKUALIFIKASI_CURANG';
                  const isReset = sesi.status === 'DIRESET_PENGAJAR';
                  const isSelesai = sesi.status === 'SELESAI';
                  const lulus = sesi.nilaiAkhir >= 70;

                  return (
                    <div 
                      key={sesi.id} 
                      className="p-4 bg-slate-50 border border-slate-200/80 rounded-2xl flex items-center justify-between gap-4 hover:border-slate-300 transition-all"
                    >
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-900 truncate text-sm">{sesi.siswa.nama}</span>
                          {isDiskualifikasi && (
                            <span className="inline-flex items-center gap-0.5 bg-rose-100 text-rose-700 border border-rose-200 text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider">
                              CURANG
                            </span>
                          )}
                          {isReset && (
                            <span className="inline-flex items-center gap-0.5 bg-amber-50 text-amber-700 border border-amber-200 text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider">
                              DIRESET
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-slate-500 font-semibold truncate mt-0.5">{sesi.ujian.judulUjian}</p>
                        <p className="text-[10px] text-slate-400 font-medium">Mulai: {new Date(sesi.waktuMulai).toLocaleTimeString('id-ID')}</p>
                      </div>

                      <div className="flex items-center gap-4 shrink-0">
                        <div className="text-right">
                          <span className="text-[10px] text-slate-400 block font-bold uppercase">Skor</span>
                          <span className={`text-base font-black ${
                            isDiskualifikasi ? 'text-rose-600' : isReset ? 'text-slate-400' : lulus ? 'text-emerald-600' : 'text-slate-700'
                          }`}>
                            {isDiskualifikasi ? '0.0' : isReset ? '-' : sesi.nilaiAkhir.toFixed(1)}
                          </span>
                        </div>
                        <Link 
                          href={`/admin/ujian/${sesi.idUjian}`}
                          title="Buka Ruang Ujian / Reset"
                          className="p-2.5 bg-white border border-slate-200 hover:bg-indigo-50 hover:text-indigo-600 rounded-xl text-slate-500 transition shadow-xs"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </Link>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="p-10 border border-dashed border-slate-200 rounded-2xl text-center space-y-3">
                <div className="w-12 h-12 bg-slate-50 text-slate-400 border border-slate-200 rounded-full flex items-center justify-center mx-auto">
                  <HelpCircle className="w-6 h-6" />
                </div>
                <div className="space-y-1">
                  <h4 className="font-bold text-slate-700 text-sm">Belum Ada Aktivitas Tercatat</h4>
                  <p className="text-xs text-slate-500 max-w-xs mx-auto">Siswa belum memulai simulasi CBT hari ini. Hasil pengerjaan akan terpampang langsung di sini.</p>
                </div>
              </div>
            )}
          </div>
          
          {riwayatUjianTerbaru.length > 0 && (
            <div className="pt-6 border-t border-slate-100 flex justify-end">
              <Link 
                href="/admin/ujian"
                className="text-xs font-bold text-indigo-600 hover:underline flex items-center gap-1"
              >
                Selengkapnya di Monitoring CBT <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          )}
        </div>

        {/* Kolom Kanan: Aksi Cepat & Arus Kas Terbaru (5/12) */}
        <div className="lg:col-span-5 space-y-8">
          
          {/* Bagian Aksi Cepat */}
          <div className="bg-white border border-slate-200/90 shadow-sm rounded-3xl p-6">
            <h3 className="text-xs font-black text-slate-900 uppercase tracking-widest border-b border-slate-100 pb-3 mb-4">
              Pusat Tindakan Cepat
            </h3>
            
            <div className="grid grid-cols-2 gap-4">
              <Link 
                href="/admin/ujian" 
                className="p-4 bg-slate-50 border border-slate-200 hover:border-indigo-200 hover:bg-indigo-50/30 rounded-2xl flex flex-col items-center justify-center text-center transition group"
              >
                <PlusCircle className="w-6 h-6 text-indigo-600 group-hover:scale-110 transition-transform mb-2" />
                <span className="text-[11px] font-black text-slate-700 uppercase tracking-wide">Buat CBT</span>
              </Link>
              
              <Link 
                href="/admin/kursus" 
                className="p-4 bg-slate-50 border border-slate-200 hover:border-indigo-200 hover:bg-indigo-50/30 rounded-2xl flex flex-col items-center justify-center text-center transition group"
              >
                <Video className="w-6 h-6 text-indigo-600 group-hover:scale-110 transition-transform mb-2" />
                <span className="text-[11px] font-black text-slate-700 uppercase tracking-wide">Tambah Kelas</span>
              </Link>

              <Link 
                href="/admin/whatsapp" 
                className="p-4 bg-slate-50 border border-slate-200 hover:border-indigo-200 hover:bg-indigo-50/30 rounded-2xl flex flex-col items-center justify-center text-center transition group"
              >
                <MessageSquare className="w-6 h-6 text-indigo-600 group-hover:scale-110 transition-transform mb-2" />
                <span className="text-[11px] font-black text-slate-700 uppercase tracking-wide">WA Broadcast</span>
              </Link>

              <Link 
                href="/admin/ai-generator" 
                className="p-4 bg-slate-50 border border-slate-200 hover:border-indigo-200 hover:bg-indigo-50/30 rounded-2xl flex flex-col items-center justify-center text-center transition group"
              >
                <BrainCircuit className="w-6 h-6 text-indigo-600 group-hover:scale-110 transition-transform mb-2" />
                <span className="text-[11px] font-black text-slate-700 uppercase tracking-wide">AI Generator Soal</span>
              </Link>
            </div>
          </div>

          {/* Bagian Log Transaksi Terbaru */}
          <div className="bg-white border border-slate-200/90 shadow-sm rounded-3xl p-6 flex flex-col justify-between min-h-[350px]">
            <div>
              <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
                <h3 className="text-xs font-black text-slate-900 uppercase tracking-widest">
                  Arus Kas RinCoin Terbaru
                </h3>
                <span className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-ping"></span>
              </div>

              {transaksiTerbaru.length > 0 ? (
                <div className="space-y-3">
                  {transaksiTerbaru.map((trx) => {
                    const isNegative = ['BELI_KURSUS', 'AKSES_MATERI', 'CHAT_AI_RINASENSEI', 'IKUT_SIMULASI_UJIAN'].includes(trx.tipeTransaksi);
                    const sign = isNegative ? '-' : '+';
                    const nominalColor = isNegative ? 'text-rose-600' : 'text-emerald-600';
                    const success = trx.status === 'BERHASIL';

                    return (
                      <div key={trx.id} className="p-3 bg-slate-50 border border-slate-200/80 rounded-xl flex items-center justify-between gap-3 text-xs">
                        <div className="min-w-0">
                          <span className="font-bold text-slate-800 truncate block">{trx.siswa?.nama || 'Siswa'}</span>
                          <span className="text-[9px] text-slate-400 uppercase tracking-wider block font-semibold">
                            {trx.tipeTransaksi.replace(/_/g, ' ')}
                          </span>
                        </div>

                        <div className="text-right shrink-0">
                          <span className={`font-black ${nominalColor} block`}>
                            {sign}{trx.jumlahKoin} RC
                          </span>
                          <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider inline-block ${
                            success ? 'bg-emerald-50 text-emerald-700' : trx.status === 'MENUNGGU_PEMBAYARAN' ? 'bg-amber-50 text-amber-700' : 'bg-rose-50 text-rose-700'
                          }`}>
                            {trx.status}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="p-10 border border-dashed border-slate-200 rounded-2xl text-center space-y-3">
                  <div className="w-10 h-10 bg-slate-50 text-slate-400 border border-slate-200 rounded-full flex items-center justify-center mx-auto">
                    <Coins className="w-5 h-5" />
                  </div>
                  <p className="text-xs text-slate-500 max-w-xs mx-auto">Belum ada transaksi saldo RinCoin terbaru yang tercatat.</p>
                </div>
              )}
            </div>

            {transaksiTerbaru.length > 0 && (
              <div className="pt-4 border-t border-slate-100 flex justify-end">
                <Link 
                  href="/admin/keuangan"
                  className="text-xs font-bold text-indigo-600 hover:underline flex items-center gap-1"
                >
                  Selengkapnya di Keuangan <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            )}
          </div>

        </div>

      </div>

    </div>
  );
}
