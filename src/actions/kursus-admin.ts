'use server';

import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { revalidatePath } from 'next/cache';

async function pastikanAdmin() {
  const session = await getServerSession(authOptions);
  if (!session || session.user.peran !== 'ADMIN_PENGAJAR') {
    throw new Error('Akses ditolak. Memerlukan peran Administrator.');
  }
}

export async function ambilSemuaKursusAdmin() {
  await pastikanAdmin();
  
  return await prisma.kursus.findMany({
    orderBy: { tanggalDibuat: 'desc' },
    include: {
      _count: {
        select: {
          materiKursus: true,
          langgananSiswa: true
        }
      }
    }
  });
}

export async function simpanKursus(data: { id?: string, judul: string, slug: string, deskripsi: string, tipeKursus: 'VIDEO_REKAMAN' | 'VIDEOCALL_LIVE' | 'HYBRID', tipeAksesHarga: 'GRATIS' | 'LANGGANAN' | 'RINCOIN', hargaRinCoin?: number, apakahAktif: boolean }) {
  await pastikanAdmin();
  
  if (data.id) {
    await prisma.kursus.update({
      where: { id: data.id },
      data: {
        judul: data.judul,
        slug: data.slug,
        deskripsi: data.deskripsi,
        tipeKursus: data.tipeKursus,
        tipeAksesHarga: data.tipeAksesHarga,
        hargaRinCoin: data.hargaRinCoin,
        apakahAktif: data.apakahAktif
      }
    });
  } else {
    await prisma.kursus.create({
      data: {
        judul: data.judul,
        slug: data.slug,
        deskripsi: data.deskripsi,
        tipeKursus: data.tipeKursus,
        tipeAksesHarga: data.tipeAksesHarga,
        hargaRinCoin: data.hargaRinCoin || 0,
        apakahAktif: data.apakahAktif,
        idPengajar: (await getServerSession(authOptions))!.user.id
      }
    });
  }
  
  revalidatePath('/admin/kursus');
  return { sukses: true };
}

export async function hapusKursus(id: string) {
  await pastikanAdmin();
  await prisma.kursus.delete({ where: { id } });
  revalidatePath('/admin/kursus');
  return { sukses: true };
}

export async function ambilDetailKursusAdmin(idKursus: string) {
  await pastikanAdmin();
  return await prisma.kursus.findUnique({
    where: { id: idKursus },
    include: {
      materiKursus: {
        orderBy: { urutan: 'asc' }
      }
    }
  });
}

export async function simpanMateriKursus(data: { id?: string, idKursus: string, judulMateri: string, tipeMateri: 'VIDEO_STREAM' | 'EMBED_YOUTUBE' | 'LINK_ZOOM' | 'EBOOK_PDF', kontenUrl?: string, kontenTeks?: string, urutan: number, apakahPratinjauGratis: boolean }) {
  await pastikanAdmin();
  
  if (data.id) {
    await prisma.materiKursus.update({
      where: { id: data.id },
      data: {
        judulMateri: data.judulMateri,
        tipeMateri: data.tipeMateri,
        kontenUrl: data.kontenUrl,
        kontenTeks: data.kontenTeks,
        urutan: data.urutan,
        apakahPratinjauGratis: data.apakahPratinjauGratis
      }
    });
  } else {
    await prisma.materiKursus.create({
      data: {
        idKursus: data.idKursus,
        judulMateri: data.judulMateri,
        tipeMateri: data.tipeMateri,
        kontenUrl: data.kontenUrl,
        kontenTeks: data.kontenTeks,
        urutan: data.urutan,
        apakahPratinjauGratis: data.apakahPratinjauGratis
      }
    });
  }
  
  revalidatePath(`/admin/kursus/${data.idKursus}`);
  return { sukses: true };
}

export async function hapusMateriKursus(idMateri: string, idKursus: string) {
  await pastikanAdmin();
  await prisma.materiKursus.delete({ where: { id: idMateri } });
  revalidatePath(`/admin/kursus/${idKursus}`);
  return { sukses: true };
}
