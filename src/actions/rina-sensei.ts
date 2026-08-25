'use server';

import { prisma } from '@/lib/prisma';
import { panggilModelAI } from '@/lib/ai-provider';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth'; // asumsikan path ini sesuai struktur app router standar

/**
 * Mengambil 30 riwayat pesan terakhir antara siswa dan RinaSensei
 */
export async function ambilRiwayatChatRinaSensei() {
  const session = await getServerSession(authOptions);
  
  if (!session?.user?.id) {
    throw new Error('Anda harus login terlebih dahulu.');
  }

  const riwayat = await prisma.logChatAI.findMany({
    where: {
      idSiswa: session.user.id
    },
    orderBy: {
      waktuKirim: 'asc'
    },
    take: 30
  });

  return riwayat;
}

/**
 * Mengirim pesan ke AI, mengecek saldo, melakukan pencarian rujukan materi.
 */
export async function kirimPesanKeRinaSensei(pesanTeks: string, konteksTopik?: string) {
  const session = await getServerSession(authOptions);
  
  if (!session?.user?.id) {
    throw new Error('Sesi telah berakhir, silakan login kembali.');
  }

  const idSiswa = session.user.id;

  // Cek biaya chat di pengaturan
  const settingBiaya = await prisma.pengaturanSistem.findUnique({
    where: { kunci: 'AI_BIAYA_PER_CHAT_RINCOIN' }
  });
  
  const biayaPerChat = settingBiaya ? parseInt(settingBiaya.nilai, 10) : 0;
  let saldoBaru = 0;

  // Transaksi pemotongan saldo (Idempoten & Atomik)
  if (biayaPerChat > 0) {
    const hasilTransaksi = await prisma.$transaction(async (tx) => {
      const siswa = await tx.pengguna.findUnique({
        where: { id: idSiswa },
        select: { saldoRinCoin: true }
      });

      if (!siswa || siswa.saldoRinCoin < biayaPerChat) {
        throw new Error(`Saldo RinCoin tidak cukup. Biaya per pesan adalah ${biayaPerChat} RC.`);
      }

      const siswaUpdate = await tx.pengguna.update({
        where: { id: idSiswa },
        data: {
          saldoRinCoin: {
            decrement: biayaPerChat
          }
        },
        select: { saldoRinCoin: true }
      });

      await tx.transaksiRinCoin.create({
        data: {
          idSiswa: idSiswa,
          jumlahKoin: -biayaPerChat,
          totalRupiah: 0,
          tipeTransaksi: 'CHAT_AI_RINASENSEI',
          status: 'BERHASIL',
          metadataTransaksi: { pesanChat: pesanTeks.substring(0, 50) }
        }
      });

      return siswaUpdate.saldoRinCoin;
    });
    
    saldoBaru = hasilTransaksi;
  } else {
    // Jika gratis, ambil saldo saat ini
    const siswa = await prisma.pengguna.findUnique({ where: { id: idSiswa }, select: { saldoRinCoin: true }});
    saldoBaru = siswa?.saldoRinCoin || 0;
  }

  // Cari rujukan materi (Pencarian teks sederhana berbasis kata kunci dari pesan siswa)
  // Kata kunci: ambil kata berukuran > 3 huruf dari pesan
  const kataKunci = pesanTeks.split(' ').filter(kata => kata.length > 3).slice(0, 3);
  let materiRujukan: any[] = [];
  
  if (kataKunci.length > 0) {
    const OR = kataKunci.map(kata => ({
      judulMateri: { contains: kata, mode: 'insensitive' as const }
    }));
    
    materiRujukan = await prisma.materiKursus.findMany({
      where: {
        OR: OR
      },
      include: {
        kursus: { select: { slug: true } }
      },
      take: 2
    });
  }

  // Susun payload AI
  const riwayatMentah = await prisma.logChatAI.findMany({
    where: { idSiswa: idSiswa },
    orderBy: { waktuKirim: 'desc' },
    take: 5
  });
  
  const pesanRiwayat = riwayatMentah.reverse().map(log => ({
    role: log.peranPengirim as 'user' | 'assistant',
    content: log.isiPesan
  }));

  const INSTRUKSI_SISTEM_RINA = `Kamu adalah RinaSensei, tutor AI pintar, ramah, dan interaktif di platform Bimbel Online.
Tugas utamamu adalah membantu siswa memahami konsep materi pelajaran dengan penjelasan terstruktur, analogi sederhana, dan memotivasi siswa.

ATURAN KETAT & WAJIB — WAJIB DIPATUHI TANPA PENGECUALIAN:
1. DILARANG KERAS menampilkan proses berpikir, catatan internal, draft, atau teks seperti "Here's a thinking process:", "Let me think", atau sejenisnya. Langsung berikan jawaban akhir.
2. DILARANG menggunakan bahasa Inggris, kecuali untuk istilah teknis mata pelajaran yang memang berbahasa Inggris (contoh: photosynthesis, integral, momentum).
3. Langsung berikan respon akhir dalam Bahasa Indonesia yang baku, sopan, komunikatif, dan memotivasi siswa.
4. Gunakan format yang terstruktur: paragraf pendek, *bullet points*, dan **tebal** untuk kata kunci penting.
5. Jika pertanyaan di luar konteks pendidikan, tolak dengan halus dan arahkan kembali ke pembelajaran.
${konteksTopik ? `6. Fokus pada topik sesi ini: ${konteksTopik}.` : ''}`;

  const pesanKeAI = [
    { role: 'system' as const, content: INSTRUKSI_SISTEM_RINA },
    ...pesanRiwayat,
    { role: 'user' as const, content: pesanTeks }
  ];

  // Eksekusi pemanggilan AI
  const hasilAI = await panggilModelAI(pesanKeAI, false);
  
  // Format referensi materi untuk disimpan ke JSON
  const referensiString = materiRujukan.length > 0 
    ? JSON.stringify(materiRujukan.map(m => m.id)) 
    : null;

  // Simpan Log Chat (Pertanyaan & Jawaban)
  await prisma.logChatAI.createMany({
    data: [
      {
        idSiswa: idSiswa,
        peranPengirim: 'user',
        isiPesan: pesanTeks,
        tokenDigunakan: 0
      },
      {
        idSiswa: idSiswa,
        peranPengirim: 'assistant',
        isiPesan: hasilAI.teks,
        tokenDigunakan: hasilAI.tokenDigunakan,
        referensiMateri: referensiString
      }
    ]
  });

  return {
    sukses: true,
    balasan: hasilAI.teks,
    materiRujukan: materiRujukan.map(m => ({
      id: m.id,
      judulMateri: m.judulMateri,
      tipeMateri: m.tipeMateri,
      slugKursus: m.kursus?.slug || ''
    })),
    sisaSaldo: saldoBaru
  };
}
