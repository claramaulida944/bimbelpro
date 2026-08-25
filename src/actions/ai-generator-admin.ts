'use server';

import { panggilModelAI, ekstrakJsonDariTeks } from '@/lib/ai-provider';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

// ---------------------------------------------------------------------------
// HELPER: Perbaiki JSON non-standar dari model AI (single-quote, trailing comma)
// ---------------------------------------------------------------------------

/**
 * Mencoba memperbaiki JSON mentah dari model AI yang mengandung:
 * - Single-quoted property names: {'key': value} -> {"key": value}
 * - Single-quoted string values: {"key": 'val'} -> {"key": "val"}
 * - Trailing commas: [1, 2,] -> [1, 2]
 * - Komentar inline JS-style
 *
 * Jika tidak dapat diperbaiki, kembalikan string asli agar error asli tampil.
 */
function perbaikiJsonMentah(teks: string): string {
  let hasil = teks.trim();

  // 1. Hapus komentar JS-style (// ...) dan (/* ... */)
  hasil = hasil.replace(/\/\/[^\n]*/g, '');
  hasil = hasil.replace(/\/\*[\s\S]*?\*\//g, '');

  // 2. Ganti single-quoted property names menjadi double-quoted
  //    Pola: 'namaKunci': → "namaKunci":
  hasil = hasil.replace(/'([^'\\]*)'\s*:/g, '"$1":');

  // 3. Ganti single-quoted string values menjadi double-quoted
  //    Pola: : 'nilai' atau , 'nilai' atau [ 'nilai'
  //    Hati-hati jangan mengganti apostrof di tengah kata (don't, it's)
  hasil = hasil.replace(/:\s*'([^'\\]*)'/g, ': "$1"');
  hasil = hasil.replace(/,\s*'([^'\\]*)'/g, ', "$1"');
  hasil = hasil.replace(/\[\s*'([^'\\]*)'/g, '["$1"');

  // 4. Hapus trailing comma sebelum } atau ]
  hasil = hasil.replace(/,\s*([}\]])/g, '$1');

  return hasil;
}

/**
 * Parse JSON dengan fallback repair otomatis.
 * Urutan: direct parse → repair → extract + repair
 */
function parseJsonAman(teks: string): any {
  // Coba 1: parse langsung
  try {
    return JSON.parse(teks);
  } catch (_) {}

  // Coba 2: setelah repair
  try {
    return JSON.parse(perbaikiJsonMentah(teks));
  } catch (_) {}

  // Coba 3: ekstrak blok JSON lalu repair
  const diekstrak = ekstrakJsonDariTeks(teks);
  try {
    return JSON.parse(diekstrak);
  } catch (_) {}

  // Coba 4: ekstrak + repair
  return JSON.parse(perbaikiJsonMentah(diekstrak));
}


/**
 * Menyusun prompt untuk menghasilkan silabus dan isi modul bacaan lengkap berformat Markdown.
 */
export async function buatDrafMateriKursus(topikUtama: string, targetAudiens: string, detailKebutuhan?: string) {
  const session = await getServerSession(authOptions);
  if (!session?.user || session.user.peran !== 'ADMIN_PENGAJAR') {
    throw new Error('Akses ditolak. Hanya Admin/Pengajar yang diizinkan.');
  }

  const systemPrompt = `Anda adalah seorang desainer kurikulum dan ahli pendidikan (Pengajar Profesional) tingkat lanjut.
Tugas Anda adalah membuat kerangka silabus dan isi modul e-book/bacaan yang lengkap, berbobot, namun sangat mudah dipahami.
Target audiens: ${targetAudiens}.
Topik Utama: ${topikUtama}.
Kebutuhan Khusus: ${detailKebutuhan || 'Tidak ada spesifikasi khusus, buatkan yang komprehensif.'}

Format balasan WAJIB menggunakan struktur Markdown dengan komponen berikut:
1. Judul Modul (H1)
2. Ringkasan Singkat (Paragraf)
3. Tujuan Pembelajaran (Bullet points)
4. Daftar Isi Pokok Bahasan
5. Isi Materi (Bagi menjadi bab dan sub-bab H2 dan H3, berikan penjelasan terstruktur, contoh konkret, dan format tebal pada istilah penting).
6. Latihan Soal Ringan (Tanpa kunci jawaban di dalam materi)
7. Kesimpulan

DILARANG menampilkan proses berpikir atau catatan internal. Langsung berikan konten materi.
Tuliskan dalam Bahasa Indonesia baku yang profesional.`;

  const messages = [
    { role: 'system' as const, content: systemPrompt },
    { role: 'user' as const, content: 'Tolong buatkan draf materi sekarang berdasarkan parameter tersebut.' }
  ];

  try {
    const hasil = await panggilModelAI(messages, false);
    return { sukses: true, drafMarkdown: hasil.teks };
  } catch (err: any) {
    throw new Error(err.message || 'Gagal menghasilkan materi dengan AI.');
  }
}

/**
 * Meminta AI menghasilkan soal ujian berbentuk JSON murni.
 * TIDAK menggunakan json_object mode untuk menghindari HTTP 400 pada Groq.
 * Ekstraksi JSON dilakukan secara mandiri via parseJsonAman.
 */
export async function buatDrafBankSoalUjian(topikSoal: string, tingkatKesulitan: string, jumlahSoal: number) {
  const session = await getServerSession(authOptions);
  if (!session?.user || session.user.peran !== 'ADMIN_PENGAJAR') {
    throw new Error('Akses ditolak. Hanya Admin/Pengajar yang diizinkan.');
  }

  const pesan = [
    {
      role: 'system' as const,
      content: `Kamu adalah asisten pembuat soal ujian profesional yang sangat teliti.
Tugasmu: membuat TEPAT ${jumlahSoal} butir soal pilihan ganda tentang "${topikSoal}" tingkat "${tingkatKesulitan}".

PENTING: Jika model Anda memiliki fitur proses berpikir internal (thinking process), batasi dan buat proses berpikir tersebut sesingkat dan secepat mungkin (maksimal 2-3 baris saja). Segera selesaikan berpikir dan keluarkan JSON utama.

OUTPUT WAJIB: Hanya blok JSON berikut, tanpa teks lain, tanpa komentar, tanpa pengantar:
\`\`\`json
{
  "daftarSoal": [
    {
      "teksSoal": "Tulis pertanyaan soal selengkap mungkin di sini",
      "pilihanJawaban": [
        { "label": "A", "teks": "Isi pilihan A" },
        { "label": "B", "teks": "Isi pilihan B" },
        { "label": "C", "teks": "Isi pilihan C" },
        { "label": "D", "teks": "Isi pilihan D" },
        { "label": "E", "teks": "Isi pilihan E" }
      ],
      "kunciJawaban": "A",
      "pembahasan": "Tulis pembahasan lengkap di sini",
      "labelTopik": "${topikSoal}"
    }
  ]
}
\`\`\`
LARANGAN KERAS: Jangan tulis proses berpikir yang panjang atau catatan lain di luar blok JSON.`,

    },
    {
      role: 'user' as const,
      content: `Hasilkan ${jumlahSoal} soal tentang "${topikSoal}" (${tingkatKesulitan}). Langsung output JSON sekarang.`,
    },
  ];

  // Panggil AI tanpa json_object mode — hindari HTTP 400 Groq secara permanen
  const hasil = await panggilModelAI(pesan, false);

  // Log raw untuk debugging produksi
  console.log('[AI Generator] Raw response (200 char pertama):', hasil.teks.substring(0, 200));

  try {
    const parsedJson = parseJsonAman(hasil.teks);

    // Dukung skema: { daftarSoal: [] } dan { soal: [] } (backward-compat)
    const listSoal: any[] = parsedJson.daftarSoal ?? parsedJson.soal;

    if (!listSoal || !Array.isArray(listSoal) || listSoal.length === 0) {
      console.error('[AI Generator] listSoal tidak valid. parsedJson:', JSON.stringify(parsedJson).substring(0, 300));
      throw new Error('Struktur JSON dari AI tidak sesuai. Coba generate ulang.');
    }

    // Validasi setiap soal memiliki field wajib
    const soalValid = listSoal.filter(s =>
      s.teksSoal && s.teksSoal !== '...' &&
      Array.isArray(s.pilihanJawaban) && s.pilihanJawaban.length > 0 &&
      s.kunciJawaban
    );

    if (soalValid.length === 0) {
      throw new Error('AI mengembalikan soal tanpa konten yang valid. Coba generate ulang.');
    }

    console.log(`[AI Generator] Berhasil: ${soalValid.length} soal valid dari ${listSoal.length} total.`);
    return { sukses: true, daftarSoal: soalValid };
  } catch (err: any) {
    console.error('[AI Generator] Gagal memproses output AI:', err.message);
    console.error('[AI Generator] Teks mentah:', hasil.teks.substring(0, 500));
    throw new Error('Gagal memproses output AI: ' + (err.message || 'Format tidak valid.'));
  }
}

/**
 * Menyimpan array soal hasil generasi AI ke database BankSoal.
 */
export async function simpanBanyakSoalKeUjian(
  idUjian: string,
  daftarSoal: Array<{
    teksSoal: string;
    pilihanJawaban: any;
    kunciJawaban: string;
    pembahasan?: string;
    labelTopik?: string;
  }>
) {
  const session = await getServerSession(authOptions);
  if (!session?.user || session.user.peran !== 'ADMIN_PENGAJAR') {
    throw new Error('Akses ditolak. Hanya Admin/Pengajar yang diizinkan.');
  }

  if (!daftarSoal || daftarSoal.length === 0) {
    throw new Error('Daftar soal kosong.');
  }

  const ujian = await prisma.simulasiUjian.findUnique({ where: { id: idUjian } });
  if (!ujian) {
    throw new Error('Target Simulasi Ujian tidak ditemukan.');
  }

  try {
    const dataYangDisimpan = daftarSoal.map(soal => ({
      idUjian: idUjian,
      teksSoal: soal.teksSoal,
      pilihanJawaban: soal.pilihanJawaban,
      kunciJawaban: soal.kunciJawaban,
      pembahasan: soal.pembahasan || null,
      labelTopik: soal.labelTopik || null,
    }));

    const hasilInsert = await prisma.bankSoal.createMany({ data: dataYangDisimpan });
    return { sukses: true, totalTersimpan: hasilInsert.count };
  } catch (err: any) {
    console.error('[AI Generator] Kesalahan menyimpan soal:', err);
    throw new Error('Gagal menyimpan soal ke dalam bank soal.');
  }
}
