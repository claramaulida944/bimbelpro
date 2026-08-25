'use server';

import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { buatTagihanPembayaran } from '@/lib/payment-gateway';
import { revalidatePath } from 'next/cache';

export async function ambilDataDompetSiswa() {
  const session = await getServerSession(authOptions);
  
  if (!session || session.user.peran !== 'SISWA') {
    throw new Error('Sesi tidak valid atau tidak memiliki akses.');
  }

  const pengguna = await prisma.pengguna.findUnique({
    where: { id: session.user.id },
    select: { saldoRinCoin: true }
  });

  const paketAktif = await prisma.paketTopupKoin.findMany({
    where: { apakahAktif: true },
    orderBy: { hargaRupiah: 'asc' }
  });

  const riwayat = await prisma.transaksiRinCoin.findMany({
    where: { idSiswa: session.user.id },
    orderBy: { tanggalDibuat: 'desc' },
    take: 10
  });

  return {
    saldoRinCoin: pengguna?.saldoRinCoin || 0,
    paketAktif,
    riwayat
  };
}

export async function buatTransaksiTopup(idPaket: string) {
  const session = await getServerSession(authOptions);
  
  if (!session || session.user.peran !== 'SISWA') {
    throw new Error('Anda harus masuk sebagai siswa untuk melakukan top-up.');
  }

  const paket = await prisma.paketTopupKoin.findUnique({
    where: { id: idPaket }
  });

  if (!paket || !paket.apakahAktif) {
    throw new Error('Paket top-up tidak ditemukan atau sudah tidak aktif.');
  }

  const transaksi = await prisma.transaksiRinCoin.create({
    data: {
      idSiswa: session.user.id,
      jumlahKoin: paket.jumlahKoin,
      totalRupiah: paket.hargaRupiah,
      tipeTransaksi: 'TOPUP_SALDO',
      status: 'MENUNGGU_PEMBAYARAN'
    }
  });

  try {
    const hasilPembayaran = await buatTagihanPembayaran({
      idTransaksi: transaksi.id,
      totalRupiah: transaksi.totalRupiah,
      emailSiswa: session.user.email,
      namaSiswa: session.user.nama,
      namaPaket: `Top-up ${paket.jumlahKoin} RinCoin`
    });

    await prisma.transaksiRinCoin.update({
      where: { id: transaksi.id },
      data: {
        metadataTransaksi: {
          urlPembayaran: hasilPembayaran.urlPembayaran,
          tokenPembayaran: hasilPembayaran.tokenPembayaran || null
        }
      }
    });

    revalidatePath('/siswa/dompet');

    return {
      sukses: true,
      urlPembayaran: hasilPembayaran.urlPembayaran,
      idTransaksi: transaksi.id
    };
  } catch (error) {
    await prisma.transaksiRinCoin.update({
      where: { id: transaksi.id },
      data: { status: 'GAGAL' }
    });
    throw new Error('Gagal menginisialisasi tagihan pembayaran.');
  }
}
