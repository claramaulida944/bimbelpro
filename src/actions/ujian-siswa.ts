'use server';

import { prisma } from '@/lib/prisma';
import { Prisma } from '@prisma/client';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';

const cekAksesSiswa = async () => {
  const session = await getServerSession(authOptions);
  if (!session || !session.user) {
    throw new Error('Identitas tidak divalidasi. Silakan masuk akun terlebih dahulu.');
  }
  return session.user;
};

export async function ambilKatalogUjianSiswa() {
  const user = await cekAksesSiswa();
  
  const ujianAktif = await prisma.simulasiUjian.findMany({
    where: { apakahAktif: true },
    include: {
      _count: { select: { bankSoal: true } },
      sesiUjianSiswa: {
        where: { idSiswa: user.id },
        orderBy: { nilaiAkhir: 'desc' },
        take: 1
      }
    },
    orderBy: { judulUjian: 'asc' }
  });
  
  return ujianAktif;
}

export async function mulaiSesiUjian(idUjian: string) {
  const user = await cekAksesSiswa();
  
  const ujian = await prisma.simulasiUjian.findUnique({
    where: { id: idUjian },
    include: { bankSoal: { select: { id: true, teksSoal: true, pilihanJawaban: true, labelTopik: true } } }
  });
  
  if (!ujian) throw new Error('Simulasi ujian tidak ditemukan.');
  if (!ujian.apakahAktif) throw new Error('Ujian ini sedang dinonaktifkan oleh administrator.');
  if (ujian.bankSoal.length === 0) throw new Error('Sistem gagal memulai: Bank soal ujian ini masih kosong.');

  // Cek apakah ada sesi yang telah diotorisasi untuk ujian ulang oleh pengajar (DIRESET_PENGAJAR)
  const sesiReset = await prisma.sesiUjianSiswa.findFirst({
    where: {
      idSiswa: user.id,
      idUjian: idUjian,
      status: 'DIRESET_PENGAJAR'
    }
  });

  if (sesiReset) {
    // Aktifkan kembali sesi dengan mereset waktu mulai, lembar jawaban, dan indikator kecurangan
    await prisma.sesiUjianSiswa.update({
      where: { id: sesiReset.id },
      data: {
        status: 'SEDANG_DIKERJAKAN',
        waktuMulai: new Date(),
        waktuSelesai: null,
        nilaiAkhir: 0,
        jumlahBenar: 0,
        jumlahSalah: 0,
        totalPelanggaran: 0,
        lembarJawaban: Prisma.DbNull
      }
    });
    return { idSesi: sesiReset.id, sisaWaktuDetik: ujian.durasiMenit * 60, bankSoal: ujian.bankSoal };
  }

  // Cek apakah ada sesi selesai / didiskualifikasi yang belum direset oleh pengajar
  const sesiLama = await prisma.sesiUjianSiswa.findFirst({
    where: {
      idSiswa: user.id,
      idUjian: idUjian,
      status: { in: ['SELESAI', 'DIDISKUALIFIKASI_CURANG'] }
    }
  });

  if (sesiLama) {
    throw new Error('Anda telah menyelesaikan simulasi ujian ini. Silakan hubungi pengajar atau administrator untuk membuka izin ujian ulang.');
  }

  const sesiBerjalan = await prisma.sesiUjianSiswa.findFirst({
    where: {
      idSiswa: user.id,
      idUjian: idUjian,
      status: 'SEDANG_DIKERJAKAN'
    }
  });

  if (sesiBerjalan) {
    const sisaWaktuDetik = (ujian.durasiMenit * 60) - Math.floor((Date.now() - sesiBerjalan.waktuMulai.getTime()) / 1000);
    if (sisaWaktuDetik <= 0) {
      await prisma.sesiUjianSiswa.update({
        where: { id: sesiBerjalan.id },
        data: { status: 'SELESAI', waktuSelesai: new Date() }
      });
      throw new Error('Sesi ujian sebelumnya telah mencapai batas waktu absolut.');
    }
    return { idSesi: sesiBerjalan.id, sisaWaktuDetik, bankSoal: ujian.bankSoal };
  }

  let idSesiBaru = '';

  if (ujian.biayaRinCoin > 0) {
    const trxResult = await prisma.$transaction(async (tx: any) => {
      const siswa = await tx.pengguna.findUnique({ where: { id: user.id } });
      if (!siswa || siswa.saldoRinCoin < ujian.biayaRinCoin) {
        throw new Error(`Saldo RinCoin tidak mencukupi. Simulasi ini membutuhkan koin sebesar ${ujian.biayaRinCoin} RC.`);
      }

      await tx.pengguna.update({
        where: { id: user.id },
        data: { saldoRinCoin: { decrement: ujian.biayaRinCoin } }
      });

      await tx.transaksiRinCoin.create({
        data: {
          idSiswa: user.id,
          jumlahKoin: -ujian.biayaRinCoin,
          totalRupiah: 0,
          tipeTransaksi: 'IKUT_SIMULASI_UJIAN',
          status: 'BERHASIL'
        }
      });

      const sesiBaru = await tx.sesiUjianSiswa.create({
        data: {
          idUjian,
          idSiswa: user.id,
          status: 'SEDANG_DIKERJAKAN',
          totalSoal: ujian.bankSoal.length,
          jumlahBenar: 0,
          jumlahSalah: 0
        }
      });
      
      return sesiBaru;
    });
    idSesiBaru = trxResult.id;
  } else {
    const sesiBaru = await prisma.sesiUjianSiswa.create({
      data: {
        idUjian,
        idSiswa: user.id,
        status: 'SEDANG_DIKERJAKAN',
        totalSoal: ujian.bankSoal.length,
        jumlahBenar: 0,
        jumlahSalah: 0
      }
    });
    idSesiBaru = sesiBaru.id;
  }

  return { idSesi: idSesiBaru, sisaWaktuDetik: ujian.durasiMenit * 60, bankSoal: ujian.bankSoal };
}

export async function catatPelanggaranSiswa(idSesiUjian: string, tipe: 'PINDAH_TAB' | 'LAYAR_TIDAK_FOKUS' | 'KELUAR_FULLSCREEN' | 'AKSES_DEVTOOLS' | 'KLIK_KANAN_TERDETEKSI', catatan?: string) {
  const user = await cekAksesSiswa();
  
  const sesi = await prisma.sesiUjianSiswa.findUnique({
    where: { id: idSesiUjian },
    include: { ujian: true }
  });
  
  if (!sesi || sesi.idSiswa !== user.id) throw new Error('Manipulasi sesi terdeteksi.');
  if (sesi.status !== 'SEDANG_DIKERJAKAN') return { diskualifikasi: sesi.status === 'DIDISKUALIFIKASI_CURANG' };

  await prisma.logPelanggaranUjian.create({
    data: {
      idSesiUjian,
      tipePelanggaran: tipe,
      catatan
    }
  });

  const totalPelanggaranBaru = sesi.totalPelanggaran + 1;
  const isDiskualifikasi = totalPelanggaranBaru >= sesi.ujian.batasMaksimalPelanggaran;

  await prisma.sesiUjianSiswa.update({
    where: { id: idSesiUjian },
    data: {
      totalPelanggaran: totalPelanggaranBaru,
      status: isDiskualifikasi ? 'DIDISKUALIFIKASI_CURANG' : 'SEDANG_DIKERJAKAN',
      waktuSelesai: isDiskualifikasi ? new Date() : null
    }
  });

  return { diskualifikasi: isDiskualifikasi };
}

export async function kumpulkanJawabanUjian(idSesiUjian: string, lembarJawaban: Record<string, string>) {
  const user = await cekAksesSiswa();
  
  const sesi = await prisma.sesiUjianSiswa.findUnique({
    where: { id: idSesiUjian },
    include: { ujian: { include: { bankSoal: true } } }
  });
  
  if (!sesi || sesi.idSiswa !== user.id) throw new Error('Akses pengumpulan ditolak sistem keamanan.');
  
  // Jika sudah diselesaikan sebelumnya, biarkan sukses langsung
  if (sesi.status === 'SELESAI') {
    return { sukses: true, idSesi: idSesiUjian };
  }

  // Jika didiskualifikasi secara otomatis, simpan lembar jawaban terakhir lalu biarkan sukses
  if (sesi.status === 'DIDISKUALIFIKASI_CURANG') {
    await prisma.sesiUjianSiswa.update({
      where: { id: idSesiUjian },
      data: {
        lembarJawaban
      }
    });
    return { sukses: true, idSesi: idSesiUjian };
  }

  if (sesi.status !== 'SEDANG_DIKERJAKAN') {
    throw new Error('Status ujian telah dikunci (Selesai/Diskualifikasi).');
  }

  let benar = 0;
  let salah = 0;
  
  sesi.ujian.bankSoal.forEach((soal: any) => {
    const jawabanSiswa = lembarJawaban[soal.id];
    if (jawabanSiswa === soal.kunciJawaban) {
      benar++;
    } else {
      salah++;
    }
  });
  
  const nilaiAkhir = sesi.ujian.bankSoal.length > 0 ? (benar / sesi.ujian.bankSoal.length) * 100 : 0;

  await prisma.sesiUjianSiswa.update({
    where: { id: idSesiUjian },
    data: {
      status: 'SELESAI',
      waktuSelesai: new Date(),
      jumlahBenar: benar,
      jumlahSalah: salah,
      nilaiAkhir,
      lembarJawaban // Simpan jawaban siswa untuk keperluan analitik
    }
  });

  return { sukses: true, idSesi: idSesiUjian };
}

export async function ambilHasilUjianSiswa(idSesiUjian: string) {
  const user = await cekAksesSiswa();
  
  const sesi = await prisma.sesiUjianSiswa.findUnique({
    where: { id: idSesiUjian },
    include: { ujian: { include: { bankSoal: true } }, logPelanggaran: true }
  });
  
  if (!sesi || sesi.idSiswa !== user.id) throw new Error('Akses dilarang. Ini bukan sesi Anda.');
  if (sesi.status === 'SEDANG_DIKERJAKAN') throw new Error('Ujian masih berstatus aktif, nilai belum dapat direkapitulasi.');
  
  // Kalkulasi analisis per Topik
  const rekapTopik: Record<string, { total: number, benar: number }> = {};
  const jawabanSiswa = sesi.lembarJawaban as Record<string, string> || {};
  
  sesi.ujian.bankSoal.forEach((soal: any) => {
    const topik = soal.labelTopik || 'Umum';
    if (!rekapTopik[topik]) {
      rekapTopik[topik] = { total: 0, benar: 0 };
    }
    rekapTopik[topik].total++;
    
    if (jawabanSiswa[soal.id] === soal.kunciJawaban) {
      rekapTopik[topik].benar++;
    }
  });
  
  const analisisTopik = Object.keys(rekapTopik).map((topik) => {
    const rt = rekapTopik[topik];
    const akurasi = rt.total > 0 ? (rt.benar / rt.total) * 100 : 0;
    return {
      topik,
      akurasi,
      persentase: akurasi,
      benar: rt.benar,
      total: rt.total
    };
  });
  
  return { sesi, analisisTopik, lembarJawaban: jawabanSiswa };
}

