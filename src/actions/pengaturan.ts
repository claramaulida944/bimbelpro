'use server';

import { prisma } from '@/lib/prisma';
import { enkripsiTeks, dekripsiTeks } from '@/lib/crypto';
import { revalidatePath } from 'next/cache';

/**
 * Mengambil semua baris pengaturan dari database.
 * Melakukan dekripsi otomatis pada nilai yang bersifat rahasia.
 * @returns {Promise<Record<string, string>>} Objek pengaturan dengan key-value
 */
export async function ambilSemuaPengaturan(): Promise<Record<string, string>> {
  const daftarPengaturan = await prisma.pengaturanSistem.findMany();
  const hasil: Record<string, string> = {};

  for (const peng of daftarPengaturan) {
    if (peng.adalahRahasia && peng.nilai !== '') {
      try {
        hasil[peng.kunci] = dekripsiTeks(peng.nilai);
      } catch (error) {
        console.error(`Gagal mendekripsi pengaturan ${peng.kunci}:`, error);
        hasil[peng.kunci] = '';
      }
    } else {
      hasil[peng.kunci] = peng.nilai;
    }
  }

  return hasil;
}

/**
 * Menyimpan pengaturan ke dalam database.
 * Melakukan enkripsi otomatis pada nilai yang bersifat rahasia.
 * @param {Record<string, string>} dataPengaturan Data pengaturan baru
 */
export async function simpanPengaturan(dataPengaturan: Record<string, string>) {
  const daftarPengaturanLama = await prisma.pengaturanSistem.findMany();
  
  // Mapping tipe rahasia untuk mempermudah pengecekan
  const mapRahasia: Record<string, boolean> = {};
  daftarPengaturanLama.forEach((peng) => {
    mapRahasia[peng.kunci] = peng.adalahRahasia;
  });

  for (const [kunci, nilai] of Object.entries(dataPengaturan)) {
    let nilaiSimpan = nilai;
    const adalahRahasia = mapRahasia[kunci] ?? false;

    // Hanya enkripsi jika tipe rahasia dan nilai tidak kosong
    if (adalahRahasia && nilai !== '') {
      try {
        nilaiSimpan = enkripsiTeks(nilai);
      } catch (error) {
        console.error(`Gagal mengenkripsi pengaturan ${kunci}:`, error);
        throw new Error(`Gagal memproses keamanan data untuk ${kunci}`);
      }
    }

    // Jika nilainya kosong dan ini rahasia, abaikan pembaruan (asumsi admin tidak mengubah key lama)
    if (adalahRahasia && nilai === '') {
      continue;
    }

    await prisma.pengaturanSistem.updateMany({
      where: { kunci },
      data: { nilai: nilaiSimpan },
    });
  }

  revalidatePath('/admin/pengaturan');
  return { sukses: true, pesan: 'Pengaturan berhasil disimpan secara permanen dan aman.' };
}
