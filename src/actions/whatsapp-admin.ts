'use server';

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { gantiVariabelTemplate, kirimPesanWhatsApp } from '@/lib/whatsapp-provider';

export async function ambilRiwayatPesanWA(filterStatus?: string, halaman: number = 1) {
  const perHalaman = 20;
  const lewati = (halaman - 1) * perHalaman;

  const where = filterStatus ? { status: filterStatus as any } : {};

  const riwayat = await prisma.antreanPesanWhatsApp.findMany({
    where,
    orderBy: { jadwalKirim: 'desc' },
    take: perHalaman,
    skip: lewati,
  });

  const total = await prisma.antreanPesanWhatsApp.count({ where });

  return { riwayat, total, totalHalaman: Math.ceil(total / perHalaman) };
}

export async function ambilStatistikPesanWA() {
  const terkirim = await prisma.antreanPesanWhatsApp.count({ where: { status: 'TERKIRIM' } });
  const gagal = await prisma.antreanPesanWhatsApp.count({ where: { status: 'GAGAL' } });
  const menunggu = await prisma.antreanPesanWhatsApp.count({ where: { status: 'MENUNGGU_PENGIRIMAN' } });

  return { terkirim, gagal, menunggu };
}

export async function kirimWhatsAppBlast(data: {
  targetAudiens: 'SEMUA_SISWA' | 'KURSUS_TERTENTU' | 'SALDO_MINIM';
  idKursus?: string;
  tipePesan: 'TAGIHAN' | 'JADWAL_KELAS' | 'PENGINGAT_UJIAN' | 'BLAST_UMUM';
  templatePesan: string;
}) {
  try {
    let queryWhere: any = { peran: 'SISWA', noTelepon: { not: null } };

    if (data.targetAudiens === 'KURSUS_TERTENTU' && data.idKursus) {
      queryWhere.langgananSiswa = {
        some: {
          kursusId: data.idKursus,
          statusLangganan: 'AKTIF'
        }
      };
    } else if (data.targetAudiens === 'SALDO_MINIM') {
      queryWhere.saldoRinCoin = { lt: 50 };
    }

    const daftarSiswa = await prisma.pengguna.findMany({
      where: queryWhere,
      select: {
        id: true,
        nama: true,
        email: true,
        noTelepon: true,
        saldoRinCoin: true
      }
    });

    if (daftarSiswa.length === 0) {
      throw new Error('Tidak ada siswa yang cocok dengan target audiens tersebut atau tidak ada yang memiliki nomor WhatsApp.');
    }

    let countSukses = 0;
    let countGagal = 0;

    for (const siswa of daftarSiswa) {
      if (!siswa.noTelepon) continue;

      const isiPesan = gantiVariabelTemplate(data.templatePesan, {
        nama: siswa.nama,
        email: siswa.email,
        saldo: siswa.saldoRinCoin.toString(),
        tanggal: new Date().toLocaleDateString('id-ID')
      });

      const resWA = await kirimPesanWhatsApp(siswa.noTelepon, isiPesan);

      const status = resWA.sukses ? 'TERKIRIM' : 'GAGAL';
      
      if (resWA.sukses) countSukses++;
      else countGagal++;

      await prisma.antreanPesanWhatsApp.create({
        data: {
          noTujuan: siswa.noTelepon,
          isiPesan: isiPesan,
          tipePesan: data.tipePesan,
          status: status,
          jadwalKirim: new Date(),
          dikirimPada: new Date(),
          logRespon: resWA.pesanError ? resWA.pesanError : (resWA.mode ? resWA.pesan : `ID: ${resWA.idRespon}`)
        }
      });
    }

    revalidatePath('/admin/whatsapp');
    return { sukses: true, totalTerkirim: countSukses, totalGagal: countGagal };
  } catch (error: any) {
    throw new Error(error.message || 'Terjadi kesalahan saat memproses siaran pesan WhatsApp.');
  }
}

export async function kirimPesanPersonal(
  idSiswa: string, 
  isiPesan: string, 
  tipePesan: 'TAGIHAN' | 'JADWAL_KELAS' | 'PENGINGAT_UJIAN' | 'BLAST_UMUM' = 'BLAST_UMUM'
) {
  try {
    const siswa = await prisma.pengguna.findUnique({
      where: { id: idSiswa }
    });

    if (!siswa) {
      throw new Error('Siswa tidak ditemukan.');
    }

    if (!siswa.noTelepon) {
      throw new Error('Siswa tidak memiliki nomor telepon yang terdaftar.');
    }

    const pesanAkhir = gantiVariabelTemplate(isiPesan, {
      nama: siswa.nama,
      email: siswa.email,
      saldo: siswa.saldoRinCoin.toString(),
      tanggal: new Date().toLocaleDateString('id-ID')
    });

    const resWA = await kirimPesanWhatsApp(siswa.noTelepon, pesanAkhir);

    const status = resWA.sukses ? 'TERKIRIM' : 'GAGAL';

    await prisma.antreanPesanWhatsApp.create({
      data: {
        noTujuan: siswa.noTelepon,
        isiPesan: pesanAkhir,
        tipePesan: tipePesan,
        status: status,
        jadwalKirim: new Date(),
        dikirimPada: new Date(),
        logRespon: resWA.pesanError ? resWA.pesanError : (resWA.mode ? resWA.pesan : `ID: ${resWA.idRespon}`)
      }
    });

    if (!resWA.sukses) {
       throw new Error(resWA.pesanError || 'Gagal mengirim pesan.');
    }

    return { sukses: true };
  } catch (error: any) {
    throw new Error(error.message || 'Terjadi kesalahan sistem.');
  }
}
