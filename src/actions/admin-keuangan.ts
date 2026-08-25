'use server';

import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { revalidatePath } from 'next/cache';

async function pastikanAdmin() {
  const session = await getServerSession(authOptions);
  if (!session || session.user.peran !== 'ADMIN_PENGAJAR') {
    throw new Error('Akses ditolak. Memerlukan otorisasi Administrator.');
  }
}

export async function ambilStatistikKeuangan() {
  await pastikanAdmin();

  const totalOmsetResult = await prisma.transaksiRinCoin.aggregate({
    where: {
      status: 'BERHASIL',
      tipeTransaksi: 'TOPUP_SALDO'
    },
    _sum: {
      totalRupiah: true
    }
  });

  const totalKoinBeredarResult = await prisma.pengguna.aggregate({
    where: {
      peran: 'SISWA'
    },
    _sum: {
      saldoRinCoin: true
    }
  });

  const totalTransaksiSukses = await prisma.transaksiRinCoin.count({
    where: {
      status: 'BERHASIL',
      tipeTransaksi: 'TOPUP_SALDO'
    }
  });

  return {
    totalPendapatan: totalOmsetResult._sum.totalRupiah || 0,
    totalRinCoinBeredar: totalKoinBeredarResult._sum.saldoRinCoin || 0,
    jumlahTransaksiSukses: totalTransaksiSukses
  };
}

export async function ambilSemuaTransaksi(filterStatus?: string, pencarian?: string) {
  await pastikanAdmin();

  const where: any = {};
  
  if (filterStatus && filterStatus !== 'SEMUA') {
    where.status = filterStatus;
  }
  
  if (pencarian) {
    where.siswa = {
      OR: [
        { nama: { contains: pencarian, mode: 'insensitive' } },
        { email: { contains: pencarian, mode: 'insensitive' } }
      ]
    };
  }

  const transaksi = await prisma.transaksiRinCoin.findMany({
    where,
    orderBy: { tanggalDibuat: 'desc' },
    include: {
      siswa: {
        select: {
          nama: true,
          email: true
        }
      }
    },
    take: 100 // Batasi 100 terakhir
  });

  return transaksi;
}

export async function ambilDaftarPaketTopupAdmin() {
  await pastikanAdmin();
  return await prisma.paketTopupKoin.findMany({
    orderBy: { hargaRupiah: 'asc' }
  });
}

export async function simpanPaketTopup(data: { id?: string, namaPaket: string, jumlahKoin: number, hargaRupiah: number, apakahAktif: boolean }) {
  await pastikanAdmin();
  
  if (data.id) {
    await prisma.paketTopupKoin.update({
      where: { id: data.id },
      data: {
        namaPaket: data.namaPaket,
        jumlahKoin: data.jumlahKoin,
        hargaRupiah: data.hargaRupiah,
        apakahAktif: data.apakahAktif
      }
    });
  } else {
    await prisma.paketTopupKoin.create({
      data: {
        namaPaket: data.namaPaket,
        jumlahKoin: data.jumlahKoin,
        hargaRupiah: data.hargaRupiah,
        apakahAktif: data.apakahAktif
      }
    });
  }
  
  revalidatePath('/admin/keuangan');
  return { sukses: true, pesan: 'Paket berhasil disimpan.' };
}

export async function hapusPaketTopup(id: string) {
  await pastikanAdmin();
  
  await prisma.paketTopupKoin.delete({
    where: { id }
  });
  
  revalidatePath('/admin/keuangan');
  return { sukses: true, pesan: 'Paket berhasil dihapus.' };
}
