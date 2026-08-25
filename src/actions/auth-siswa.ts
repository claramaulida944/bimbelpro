'use server';

import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';

export async function registrasiSiswaBaru(data: {
  nama: string;
  email: string;
  noTelepon: string;
  kataSandi: string;
}) {
  try {
    const { nama, email, noTelepon, kataSandi } = data;

    if (!nama || !email || !noTelepon || !kataSandi) {
      return { sukses: false, pesan: "Harap isi semua kolom pendaftaran." };
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return { sukses: false, pesan: "Format alamat email tidak valid." };
    }

    const emailSudahAda = await prisma.pengguna.findUnique({
      where: { email },
    });

    if (emailSudahAda) {
      return { sukses: false, pesan: "Alamat email sudah terdaftar. Silakan masuk." };
    }

    const passwordHash = await bcrypt.hash(kataSandi, 10);

    let formatTelepon = noTelepon.replace(/\D/g, '');
    if (formatTelepon.startsWith('0')) {
      formatTelepon = '62' + formatTelepon.substring(1);
    }

    await prisma.pengguna.create({
      data: {
        nama,
        email,
        noTelepon: formatTelepon,
        passwordHash,
        peran: 'SISWA',
        saldoRinCoin: 0,
      },
    });

    return { sukses: true, pesan: "Pendaftaran berhasil! Silakan masuk ke akun Anda." };
  } catch (error) {
    return { sukses: false, pesan: "Terjadi kesalahan server saat mendaftar. Silakan coba lagi." };
  }
}
