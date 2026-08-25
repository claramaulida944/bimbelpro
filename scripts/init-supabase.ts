import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('⏳ Menghubungkan ke database Supabase...');
  try {
    // Verifikasi koneksi
    await prisma.$connect();
    console.log('✅ Koneksi ke database berhasil!');

    console.log('⏳ Memeriksa data admin default...');
    const adminEmail = 'admin@bimbel.local';
    const adminExisting = await prisma.pengguna.findUnique({
      where: { email: adminEmail },
    });

    if (!adminExisting) {
      console.log('➕ Menambahkan akun admin default...');
      const passwordHash = await bcrypt.hash('PasswordAdmin123!', 10);
      
      await prisma.pengguna.create({
        data: {
          nama: 'Administrator Utama',
          email: adminEmail,
          passwordHash: passwordHash,
          peran: 'ADMIN_PENGAJAR',
        },
      });
      console.log('✅ Akun admin default berhasil dibuat!');
    } else {
      console.log('ℹ️ Akun admin default sudah ada.');
    }

    console.log('⏳ Memeriksa pengaturan sistem default...');
    const pengaturanUmum = await prisma.pengaturanSistem.findFirst({
      where: { kategori: 'SISTEM_UMUM' }
    });

    if (!pengaturanUmum) {
      console.log('➕ Menginisialisasi pengaturan sistem...');
      await prisma.pengaturanSistem.create({
        data: {
          kunci: 'NAMA_BIMBEL',
          nilai: 'BimbelPro',
          kategori: 'SISTEM_UMUM',
          deskripsi: 'Nama platform bimbingan belajar',
        },
      });
      console.log('✅ Pengaturan sistem berhasil diinisialisasi!');
    } else {
      console.log('ℹ️ Pengaturan sistem sudah terinisialisasi.');
    }

    console.log('🎉 Inisialisasi Supabase selesai!');
  } catch (error) {
    console.error('❌ Gagal terhubung ke database atau melakukan inisialisasi:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
