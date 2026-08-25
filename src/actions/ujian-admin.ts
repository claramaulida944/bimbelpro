'use server';

import { prisma } from '@/lib/prisma';
import { Prisma } from '@prisma/client';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { revalidatePath } from 'next/cache';

const cekAksesAdmin = async () => {
  const session = await getServerSession(authOptions);
  if (!session || session.user.peran !== 'ADMIN_PENGAJAR') {
    throw new Error('Akses ditolak. Hanya administrator pendidik yang berwenang.');
  }
  return session.user;
};

export async function ambilSemuaUjianAdmin() {
  await cekAksesAdmin();
  return prisma.simulasiUjian.findMany({
    include: {
      _count: {
        select: { bankSoal: true, sesiUjianSiswa: true }
      }
    },
    orderBy: { judulUjian: 'asc' }
  });
}

export async function simpanUjian(data: { id?: string, judulUjian: string, deskripsi?: string, durasiMenit: number, biayaRinCoin: number, wajibFullscreen: boolean, batasMaksimalPelanggaran: number, apakahAktif: boolean }) {
  const admin = await cekAksesAdmin();
  
  if (data.id) {
    await prisma.simulasiUjian.update({
      where: { id: data.id },
      data: {
        judulUjian: data.judulUjian,
        deskripsi: data.deskripsi,
        durasiMenit: data.durasiMenit,
        biayaRinCoin: data.biayaRinCoin,
        wajibFullscreen: data.wajibFullscreen,
        batasMaksimalPelanggaran: data.batasMaksimalPelanggaran,
        apakahAktif: data.apakahAktif,
      }
    });
  } else {
    await prisma.simulasiUjian.create({
      data: {
        judulUjian: data.judulUjian,
        deskripsi: data.deskripsi,
        durasiMenit: data.durasiMenit,
        biayaRinCoin: data.biayaRinCoin,
        wajibFullscreen: data.wajibFullscreen,
        batasMaksimalPelanggaran: data.batasMaksimalPelanggaran,
        apakahAktif: data.apakahAktif,
        idPembuat: admin.id
      }
    });
  }
  
  revalidatePath('/admin/ujian');
  return { sukses: true };
}

export async function hapusUjian(id: string) {
  await cekAksesAdmin();
  await prisma.simulasiUjian.delete({ where: { id } });
  revalidatePath('/admin/ujian');
  return { sukses: true };
}

export async function ambilBankSoalAdmin(idUjian: string) {
  await cekAksesAdmin();
  const ujian = await prisma.simulasiUjian.findUnique({
    where: { id: idUjian },
    include: {
      bankSoal: {
        orderBy: { id: 'asc' }
      }
    }
  });
  if (!ujian) throw new Error('Data simulasi ujian tidak ditemukan di pangkalan data.');
  return ujian;
}

export async function simpanButirSoal(data: { id?: string, idUjian: string, teksSoal: string, pilihanJawaban: { label: string, teks: string }[], kunciJawaban: string, pembahasan?: string, labelTopik: string }) {
  await cekAksesAdmin();
  
  if (data.id) {
    await prisma.bankSoal.update({
      where: { id: data.id },
      data: {
        teksSoal: data.teksSoal,
        pilihanJawaban: data.pilihanJawaban,
        kunciJawaban: data.kunciJawaban,
        pembahasan: data.pembahasan,
        labelTopik: data.labelTopik
      }
    });
  } else {
    await prisma.bankSoal.create({
      data: {
        idUjian: data.idUjian,
        teksSoal: data.teksSoal,
        pilihanJawaban: data.pilihanJawaban,
        kunciJawaban: data.kunciJawaban,
        pembahasan: data.pembahasan,
        labelTopik: data.labelTopik
      }
    });
  }
  
  revalidatePath(`/admin/ujian/${data.idUjian}/soal`);
  return { sukses: true };
}

export async function hapusButirSoal(idSoal: string, idUjian: string) {
  await cekAksesAdmin();
  await prisma.bankSoal.delete({ where: { id: idSoal } });
  revalidatePath(`/admin/ujian/${idUjian}/soal`);
  return { sukses: true };
}

export async function ambilLaporanAnalitikUjianAdmin(idUjian: string) {
  await cekAksesAdmin();
  
  const ujian = await prisma.simulasiUjian.findUnique({
    where: { id: idUjian },
    select: { judulUjian: true, batasMaksimalPelanggaran: true },
  });
  
  if (!ujian) throw new Error('Ujian tidak ditemukan.');

  const sesiSiswa = await prisma.sesiUjianSiswa.findMany({
    where: { idUjian },
    include: {
      siswa: { select: { nama: true, email: true } },
      logPelanggaran: { orderBy: { waktuTerjadi: 'desc' } }
    },
    orderBy: { waktuMulai: 'desc' }
  });

  const selesaiAtauDiskualifikasi = sesiSiswa.filter(s => s.status === 'SELESAI' || s.status === 'DIDISKUALIFIKASI_CURANG');
  
  const rataRataNilai = selesaiAtauDiskualifikasi.length > 0 
    ? selesaiAtauDiskualifikasi.reduce((acc, curr) => acc + curr.nilaiAkhir, 0) / selesaiAtauDiskualifikasi.length 
    : 0;
    
  const nilaiTertinggi = selesaiAtauDiskualifikasi.length > 0 
    ? Math.max(...selesaiAtauDiskualifikasi.map(s => s.nilaiAkhir)) 
    : 0;
    
  const nilaiTerendah = selesaiAtauDiskualifikasi.length > 0 
    ? Math.min(...selesaiAtauDiskualifikasi.map(s => s.nilaiAkhir)) 
    : 0;

  const totalDiskualifikasi = selesaiAtauDiskualifikasi.filter(s => s.status === 'DIDISKUALIFIKASI_CURANG').length;

  // Agregasi Topik Salah (Kelemahan Topik Global)
  // Untuk ini, kita butuh bankSoal untuk mencocokkan lembarJawaban dengan kunci.
  const bankSoal = await prisma.bankSoal.findMany({ where: { idUjian } });
  
  const rekapKelemahanTopik: Record<string, { totalSoalDikerjakan: number, totalSalah: number }> = {};
  
  selesaiAtauDiskualifikasi.forEach(sesi => {
    if (sesi.lembarJawaban) {
      const jawabanSiswa = sesi.lembarJawaban as Record<string, string>;
      bankSoal.forEach(soal => {
        const topiknya = soal.labelTopik || 'Umum';
        if (!rekapKelemahanTopik[topiknya]) {
          rekapKelemahanTopik[topiknya] = { totalSoalDikerjakan: 0, totalSalah: 0 };
        }
        rekapKelemahanTopik[topiknya].totalSoalDikerjakan++;
        
        if (jawabanSiswa[soal.id] !== soal.kunciJawaban) {
          rekapKelemahanTopik[topiknya].totalSalah++;
        }
      });
    }
  });

  const kelemahanTopikList = Object.keys(rekapKelemahanTopik).map(topik => {
    const data = rekapKelemahanTopik[topik];
    return {
      topik,
      persentaseKesalahan: data.totalSoalDikerjakan > 0 ? (data.totalSalah / data.totalSoalDikerjakan) * 100 : 0
    };
  }).sort((a, b) => b.persentaseKesalahan - a.persentaseKesalahan);

  return {
    judulUjian: ujian.judulUjian,
    batasMaksimalPelanggaran: ujian.batasMaksimalPelanggaran,
    statistik: {
      jumlahPeserta: sesiSiswa.length,
      rataRataNilai: rataRataNilai.toFixed(1),
      nilaiTertinggi: nilaiTertinggi.toFixed(1),
      nilaiTerendah: nilaiTerendah.toFixed(1),
      totalDiskualifikasi
    },
    kelemahanTopik: kelemahanTopikList,
    sesiSiswa
  };
}

export async function izinkanUjianUlangSiswa(hasilUjianId: string) {
  const admin = await cekAksesAdmin();

  const sesi = await prisma.sesiUjianSiswa.findUnique({
    where: { id: hasilUjianId },
    include: { siswa: true, ujian: true }
  });

  if (!sesi) {
    throw new Error('Data sesi ujian siswa tidak ditemukan.');
  }

  // Update status menjadi DIRESET_PENGAJAR agar siswa terbebas dari diskualifikasi/selesai dan dapat mengulang sesi.
  await prisma.sesiUjianSiswa.update({
    where: { id: hasilUjianId },
    data: {
      status: 'DIRESET_PENGAJAR',
      nilaiAkhir: 0,
      jumlahBenar: 0,
      jumlahSalah: 0,
      totalPelanggaran: 0,
      waktuSelesai: null,
      lembarJawaban: Prisma.DbNull
    }
  });

  // Hapus log pelanggaran lama dari sesi ini
  await prisma.logPelanggaranUjian.deleteMany({
    where: { idSesiUjian: hasilUjianId }
  });

  console.log(`[Ujian Admin] Pengajar ${admin.nama} mengizinkan ujian ulang untuk siswa ${sesi.siswa.nama} (Ujian: ${sesi.ujian.judulUjian})`);

  revalidatePath('/admin/ujian');
  revalidatePath('/siswa/ujian');
  revalidatePath(`/admin/ujian/${sesi.idUjian}/laporan`);
  revalidatePath(`/siswa/ujian/${sesi.idUjian}/instruksi`);

  return { sukses: true, pesan: `Izin ujian ulang berhasil diberikan. Siswa ${sesi.siswa.nama} dapat kembali mengerjakan ujian.` };
}

