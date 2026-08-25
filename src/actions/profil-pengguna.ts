'use server';

import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { revalidatePath } from 'next/cache';

export async function ambilProfilSaya() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return { sukses: false, pesan: 'Sesi tidak valid. Silakan masuk kembali.', data: null };
    }

    const pengguna = await prisma.pengguna.findUnique({
      where: { email: session.user.email },
      select: {
        id: true,
        nama: true,
        email: true,
        noTelepon: true,
        peran: true,
        saldoRinCoin: true,
        tanggalDibuat: true,
        // passwordHash purposely omitted for safety
        _count: {
          select: {
            langgananSiswa: true,
            riwayatUjian: true
          }
        }
      },
    });

    if (!pengguna) {
      return { sukses: false, pesan: 'Profil tidak ditemukan.', data: null };
    }

    // In Prisma Schema we do not have fotoProfil natively unless it was added. 
    // In previous steps we learned it's not in schema. I'll omit fotoProfil from DB query.
    return { sukses: true, pesan: 'Berhasil.', data: pengguna };
  } catch (error) {
    return { sukses: false, pesan: 'Terjadi kesalahan server saat mengambil profil.', data: null };
  }
}

export async function perbaruiProfilSaya(data: { nama: string; email: string; noTelepon: string }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return { sukses: false, pesan: 'Akses ditolak.' };
    }

    const { nama, email, noTelepon } = data;

    if (!nama || !email) {
      return { sukses: false, pesan: 'Nama dan email wajib diisi.' };
    }

    // Cek duplikasi email jika berubah
    if (email !== session.user.email) {
      const emailExist = await prisma.pengguna.findUnique({ where: { email } });
      if (emailExist) {
        return { sukses: false, pesan: 'Email sudah digunakan akun lain.' };
      }
    }

    let formatTelepon = noTelepon.replace(/\D/g, '');
    if (formatTelepon.startsWith('0')) {
      formatTelepon = '62' + formatTelepon.substring(1);
    }

    await prisma.pengguna.update({
      where: { id: session.user.id },
      data: {
        nama,
        email,
        noTelepon: formatTelepon || null,
      },
    });

    revalidatePath('/');
    return { sukses: true, pesan: 'Profil berhasil diperbarui!' };
  } catch (error) {
    return { sukses: false, pesan: 'Terjadi kesalahan saat memperbarui profil.' };
  }
}

export async function ubahKataSandiSaya(data: { kataSandiLama: string; kataSandiBaru: string; konfirmasiKataSandi: string }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return { sukses: false, pesan: 'Akses ditolak.' };
    }

    const { kataSandiLama, kataSandiBaru, konfirmasiKataSandi } = data;

    if (!kataSandiLama || !kataSandiBaru || !konfirmasiKataSandi) {
      return { sukses: false, pesan: 'Semua kolom kata sandi wajib diisi.' };
    }

    if (kataSandiBaru !== konfirmasiKataSandi) {
      return { sukses: false, pesan: 'Kata sandi baru dan konfirmasi tidak cocok.' };
    }

    if (kataSandiBaru.length < 8) {
      return { sukses: false, pesan: 'Kata sandi baru minimal 8 karakter.' };
    }

    const pengguna = await prisma.pengguna.findUnique({
      where: { id: session.user.id },
      select: { passwordHash: true }
    });

    if (!pengguna || !pengguna.passwordHash) {
      return { sukses: false, pesan: 'Akun Anda tidak mendukung perubahan kata sandi (login via Google).' };
    }

    const sandiCocok = await bcrypt.compare(kataSandiLama, pengguna.passwordHash);
    if (!sandiCocok) {
      return { sukses: false, pesan: 'Kata sandi saat ini tidak sesuai.' };
    }

    const newPasswordHash = await bcrypt.hash(kataSandiBaru, 10);

    await prisma.pengguna.update({
      where: { id: session.user.id },
      data: { passwordHash: newPasswordHash }
    });

    return { sukses: true, pesan: 'Kata sandi berhasil diubah!' };
  } catch (error) {
    return { sukses: false, pesan: 'Terjadi kesalahan saat mengubah kata sandi.' };
  }
}
