'use server';

import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { revalidatePath } from 'next/cache';

export async function ambilKatalogKursus(filterTipe?: string) {
  const session = await getServerSession(authOptions);
  
  const where: any = { apakahAktif: true };
  if (filterTipe && filterTipe !== 'SEMUA') {
    where.tipeKursus = filterTipe;
  }

  const kursus = await prisma.kursus.findMany({
    where,
    orderBy: { tanggalDibuat: 'desc' },
    include: {
      _count: {
        select: { materiKursus: true }
      }
    }
  });

  let langganan: string[] = [];
  if (session?.user?.id) {
    const langgananSiswa = await prisma.langgananSiswa.findMany({
      where: {
        idSiswa: session.user.id,
        apakahAktif: true,
        tanggalBerakhir: { gte: new Date() }
      },
      select: { idKursus: true }
    });
    langganan = langgananSiswa.map((l: any) => l.idKursus).filter(Boolean) as string[];
  }

  return kursus.map((k: any) => ({
    ...k,
    dimiliki: langganan.includes(k.id)
  }));
}

export async function ambilDetailKursusSiswa(slug: string) {
  const session = await getServerSession(authOptions);
  
  const kursus = await prisma.kursus.findUnique({
    where: { slug, apakahAktif: true },
    include: {
      materiKursus: {
        orderBy: { urutan: 'asc' },
        select: {
          id: true,
          judulMateri: true,
          tipeMateri: true,
          apakahPratinjauGratis: true,
          urutan: true
        }
      }
    }
  });

  if (!kursus) return null;

  let dimiliki = false;
  if (session?.user?.id) {
    const langganan = await prisma.langgananSiswa.findFirst({
      where: {
        idSiswa: session.user.id,
        idKursus: kursus.id,
        apakahAktif: true,
        tanggalBerakhir: { gte: new Date() }
      }
    });
    if (langganan) dimiliki = true;
  }

  return { ...kursus, dimiliki };
}

export async function beliKursusDenganRinCoin(idKursus: string) {
  const session = await getServerSession(authOptions);
  
  if (!session || session.user.peran !== 'SISWA') {
    throw new Error('Silakan masuk sebagai siswa untuk membeli kursus.');
  }

  const kursus = await prisma.kursus.findUnique({
    where: { id: idKursus }
  });

  if (!kursus || kursus.tipeAksesHarga !== 'RINCOIN' || kursus.hargaRinCoin == null) {
    throw new Error('Kursus ini tidak dapat dibeli dengan RinCoin.');
  }

  const langgananEksis = await prisma.langgananSiswa.findFirst({
    where: {
      idSiswa: session.user.id,
      idKursus: kursus.id,
      apakahAktif: true,
      tanggalBerakhir: { gte: new Date() }
    }
  });

  if (langgananEksis) {
    throw new Error('Anda sudah memiliki akses ke kursus ini.');
  }

  await prisma.$transaction(async (tx: any) => {
    const pengguna = await tx.pengguna.findUnique({
      where: { id: session.user.id }
    });

    if (!pengguna) throw new Error('Pengguna tidak ditemukan.');
    if (pengguna.saldoRinCoin < kursus.hargaRinCoin!) {
      throw new Error('Saldo RinCoin Anda tidak mencukupi. Silakan lakukan top-up terlebih dahulu.');
    }

    // Pemotongan saldo
    await tx.pengguna.update({
      where: { id: pengguna.id },
      data: { saldoRinCoin: { decrement: kursus.hargaRinCoin! } }
    });

    // Pencatatan mutasi transaksi
    await tx.transaksiRinCoin.create({
      data: {
        idSiswa: pengguna.id,
        tipeTransaksi: 'BELI_KURSUS',
        status: 'BERHASIL',
        jumlahKoin: kursus.hargaRinCoin!,
        totalRupiah: kursus.hargaRinCoin! * 1000
      }
    });

    // Pendaftaran akses ke LanggananSiswa
    const setahunKeDepan = new Date();
    setahunKeDepan.setFullYear(setahunKeDepan.getFullYear() + 1);

    await tx.langgananSiswa.create({
      data: {
        idSiswa: pengguna.id,
        idKursus: kursus.id,
        paketLangganan: 'BULANAN',
        tanggalMulai: new Date(),
        tanggalBerakhir: setahunKeDepan,
        apakahAktif: true
      }
    });
  });

  revalidatePath(`/siswa/kursus/${kursus.slug}`);
  revalidatePath('/siswa/kursus');
  return { sukses: true, pesan: 'Kursus berhasil dibeli! Selamat belajar.' };
}

export async function ambilAksesMateriBelajar(slug: string, idMateriPilihan?: string) {
  const session = await getServerSession(authOptions);
  
  const kursus = await prisma.kursus.findUnique({
    where: { slug, apakahAktif: true },
    include: {
      materiKursus: {
        orderBy: { urutan: 'asc' }
      }
    }
  });

  if (!kursus) throw new Error('Kursus tidak ditemukan.');

  let dimiliki = false;
  if (session?.user?.id) {
    const langganan = await prisma.langgananSiswa.findFirst({
      where: {
        idSiswa: session.user.id,
        idKursus: kursus.id,
        apakahAktif: true,
        tanggalBerakhir: { gte: new Date() }
      }
    });
    if (langganan) dimiliki = true;
  }

  // Tentukan materi aktif
  let materiAktif = null;
  if (idMateriPilihan) {
    materiAktif = kursus.materiKursus.find((m: any) => m.id === idMateriPilihan);
  } else if (kursus.materiKursus.length > 0) {
    materiAktif = kursus.materiKursus[0];
  }

  if (materiAktif) {
    // Penjaga Gerbang Akses (Authorization Guard)
    if (!materiAktif.apakahPratinjauGratis && !dimiliki) {
      throw new Error('Anda tidak berhak mengakses materi ini. Silakan beli kursus terlebih dahulu.');
    }
  }

  return {
    kursus,
    materiAktif,
    dimiliki
  };
}
