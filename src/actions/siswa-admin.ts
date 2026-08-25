'use server';

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

export async function ambilDaftarSiswaAdmin(pencarian?: string, halaman: number = 1) {
  const perHalaman = 10;
  const lewati = (halaman - 1) * perHalaman;

  let where: any = { peran: 'SISWA' };

  if (pencarian) {
    where = {
      ...where,
      OR: [
        { nama: { contains: pencarian, mode: 'insensitive' } },
        { email: { contains: pencarian, mode: 'insensitive' } },
        { noTelepon: { contains: pencarian, mode: 'insensitive' } }
      ]
    };
  }

  const siswa = await prisma.pengguna.findMany({
    where,
    select: {
      id: true,
      nama: true,
      email: true,
      noTelepon: true,
      saldoRinCoin: true,
      tanggalDibuat: true,
      _count: {
        select: {
          langgananSiswa: true,
          riwayatUjian: true,
        }
      }
    },
    orderBy: {
      tanggalDibuat: 'desc'
    },
    take: perHalaman,
    skip: lewati,
  });

  const total = await prisma.pengguna.count({ where });

  return {
    siswa,
    total,
    totalHalaman: Math.ceil(total / perHalaman)
  };
}

export async function sesuaikanSaldoSiswa(idSiswa: string, jumlahKoin: number, tipe: 'TAMBAH' | 'KURANG', alasan: string) {
  try {
    if (jumlahKoin <= 0) {
      throw new Error('Jumlah koin harus lebih dari 0.');
    }

    await prisma.$transaction(async (tx: any) => {
      const penggunaSaatIni = await tx.pengguna.findUnique({
        where: { id: idSiswa },
        select: { saldoRinCoin: true }
      });

      if (!penggunaSaatIni) {
        throw new Error('Siswa tidak ditemukan.');
      }

      if (tipe === 'KURANG' && penggunaSaatIni.saldoRinCoin < jumlahKoin) {
        throw new Error('Saldo siswa tidak mencukupi untuk dikurangi.');
      }

      const updateData = tipe === 'TAMBAH' 
        ? { increment: jumlahKoin } 
        : { decrement: jumlahKoin };

      await tx.pengguna.update({
        where: { id: idSiswa },
        data: {
          saldoRinCoin: updateData
        }
      });

      await tx.transaksiRinCoin.create({
        data: {
          idSiswa: idSiswa,
          jumlahKoin: jumlahKoin,
          totalRupiah: jumlahKoin * 1000,
          tipeTransaksi: 'TOPUP_SALDO', // Menggunakan enum yang ada, metadata menandai admin
          status: 'BERHASIL',
          idReferensi: `ADMIN_ADJUSTMENT_${Date.now()}`,
          metadataTransaksi: {
            tipeOperasi: tipe,
            alasan: alasan,
            disesuaikanOleh: 'ADMIN'
          }
        }
      });
    });

    revalidatePath('/admin/siswa');
    return { sukses: true, pesan: 'Saldo berhasil disesuaikan!' };
  } catch (error: any) {
    throw new Error(error.message || 'Terjadi kesalahan sistem saat menyesuaikan saldo.');
  }
}

export async function ambilDetailProfilSiswaAdmin(idSiswa: string) {
  const profil = await prisma.pengguna.findUnique({
    where: { id: idSiswa, peran: 'SISWA' },
    include: {
      langgananSiswa: {
        include: { kursus: { select: { judul: true } } },
        orderBy: { tanggalMulai: 'desc' },
      },
      riwayatUjian: {
        include: { ujian: { select: { judulUjian: true } } },
        orderBy: { waktuSelesai: 'desc' },
        take: 5
      },
      transaksiRinCoin: {
        orderBy: { tanggalDibuat: 'desc' },
        take: 10
      }
    }
  });

  if (!profil) {
    throw new Error('Profil siswa tidak ditemukan.');
  }

  return profil;
}
