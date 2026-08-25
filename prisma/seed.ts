import { PrismaClient, PeranPengguna, KategoriPengaturan } from '@prisma/client';
import bcrypt from 'bcryptjs';
import 'dotenv/config';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';

const connectionString = `${process.env.DATABASE_URL}`;
const pool = new Pool({
  connectionString,
  ssl: connectionString.includes('supabase') ? { rejectUnauthorized: false } : undefined,
});
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('Memulai proses seeder database...');

  // 1. Buat akun Admin
  const emailAdmin = 'admin@bimbel.local';
  const passwordPlain = 'PasswordAdmin123!';
  const passwordHash = await bcrypt.hash(passwordPlain, 10);

  const admin = await prisma.pengguna.upsert({
    where: { email: emailAdmin },
    update: {},
    create: {
      nama: 'Administrator',
      email: emailAdmin,
      passwordHash: passwordHash,
      peran: PeranPengguna.ADMIN_PENGAJAR,
      saldoRinCoin: 0,
    },
  });

  console.log(`Akun admin berhasil dipastikan ada: ${admin.email}`);

  // 2. Pengaturan Sistem Default
  const pengaturanDefault = [
    // AI RinaSensei
    { kunci: 'AI_PROVIDER', nilai: 'OPENAI', kategori: KategoriPengaturan.AI_RINASENSEI, adalahRahasia: false },
    { kunci: 'AI_API_KEY', nilai: '', kategori: KategoriPengaturan.AI_RINASENSEI, adalahRahasia: true },
    { kunci: 'AI_MODEL', nilai: 'gpt-4o-mini', kategori: KategoriPengaturan.AI_RINASENSEI, adalahRahasia: false },
    { kunci: 'AI_BIAYA_PER_CHAT_RINCOIN', nilai: '0', kategori: KategoriPengaturan.AI_RINASENSEI, adalahRahasia: false },

    // Payment Gateway
    { kunci: 'PAYMENT_PROVIDER', nilai: 'MIDTRANS', kategori: KategoriPengaturan.PAYMENT_GATEWAY, adalahRahasia: false },
    { kunci: 'PAYMENT_SERVER_KEY', nilai: '', kategori: KategoriPengaturan.PAYMENT_GATEWAY, adalahRahasia: true },
    { kunci: 'PAYMENT_CLIENT_KEY', nilai: '', kategori: KategoriPengaturan.PAYMENT_GATEWAY, adalahRahasia: false },
    { kunci: 'PAYMENT_MERCHANT_ID', nilai: '', kategori: KategoriPengaturan.PAYMENT_GATEWAY, adalahRahasia: false },
    { kunci: 'PAYMENT_IS_PRODUCTION', nilai: 'false', kategori: KategoriPengaturan.PAYMENT_GATEWAY, adalahRahasia: false },

    // WhatsApp Gateway
    { kunci: 'WA_PROVIDER', nilai: 'FONNTE', kategori: KategoriPengaturan.WHATSAPP_GATEWAY, adalahRahasia: false },
    { kunci: 'WA_API_KEY', nilai: '', kategori: KategoriPengaturan.WHATSAPP_GATEWAY, adalahRahasia: true },
    { kunci: 'WA_SENDER_NUMBER', nilai: '', kategori: KategoriPengaturan.WHATSAPP_GATEWAY, adalahRahasia: false },

    // Video & Kelas
    { kunci: 'VIDEO_DEFAULT_TYPE', nilai: 'VIDEO_STREAM', kategori: KategoriPengaturan.VIDEO_PROVIDER, adalahRahasia: false },
    { kunci: 'FITUR_KELAS_VIDEO_AKTIF', nilai: 'true', kategori: KategoriPengaturan.VIDEO_PROVIDER, adalahRahasia: false },
    { kunci: 'FITUR_VIDEOCALL_AKTIF', nilai: 'true', kategori: KategoriPengaturan.VIDEO_PROVIDER, adalahRahasia: false },

    // Monetisasi & RinCoin
    { kunci: 'BIAYA_LANGGANAN_MINGGUAN', nilai: '50000', kategori: KategoriPengaturan.SISTEM_UMUM, adalahRahasia: false },
    { kunci: 'BIAYA_LANGGANAN_BULANAN', nilai: '150000', kategori: KategoriPengaturan.SISTEM_UMUM, adalahRahasia: false },
    { kunci: 'BIAYA_LANGGANAN_SEMESTER', nilai: '750000', kategori: KategoriPengaturan.SISTEM_UMUM, adalahRahasia: false },
    { kunci: 'NILAI_SATU_RINCOIN_RUPIAH', nilai: '1000', kategori: KategoriPengaturan.SISTEM_UMUM, adalahRahasia: false },
  ];

  for (const peng of pengaturanDefault) {
    await prisma.pengaturanSistem.upsert({
      where: { kunci: peng.kunci },
      update: {},
      create: {
        kunci: peng.kunci,
        nilai: peng.nilai,
        kategori: peng.kategori,
        adalahRahasia: peng.adalahRahasia,
      },
    });
  }

  console.log('Seeder selesai dan pengaturan default telah diisi.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
