# Platform Bimbingan Belajar Online (LMS & CBT) Terintegrasi

Platform Bimbingan Belajar Online (LMS) berskala penuh yang dibangun menggunakan **Next.js 15 (App Router)**. Platform ini dilengkapi dengan sistem manajemen pembelajaran cerdas, ujian CBT (Computer Based Test) anti-curang, asisten AI interaktif, ekonomi virtual mandiri (RinCoin), serta sistem pengingat otomatis via WhatsApp Blast.

Sistem ini didesain sebagai solusi "jual-putus" (White-Label) yang siap di-_deploy_ dan dikelola mandiri oleh pemilik bimbingan belajar.

---

## 🌟 Fitur Unggulan

1. **Sistem Ekonomi Virtual (RinCoin)**
   Mata uang internal platform dengan rasio (1 RC = Rp 1.000). Siswa dapat mengisi ulang (Top-Up) saldo menggunakan *Payment Gateway* dinamis (Midtrans/Xendit) untuk membeli akses kursus dan berlangganan layanan.
2. **Ujian CBT & Anti-Cheat Engine (Lockdown Mode)**
   Modul ujian ketat yang mendeteksi segala aktivitas mencurigakan siswa (pergantian tab, klik kanan, keluar mode layar penuh, hingga layar tidak fokus). Sistem akan menghentikan ujian otomatis bila jumlah pelanggaran melebihi batas yang disetel. Dilengkapi dengan peta analisis kelemahan topik pada hasil laporan evaluasi.
3. **Modul AI RinaSensei (Tutor Virtual & Generator Silabus)**
   Fitur kecerdasan buatan dinamis yang siap dipasang API Key *provider* apa pun (kompatibel dengan standar antarmuka OpenAI). 
   - **Bagi Siswa**: *Chatbot* pembelajaran interaktif 24/7 yang mengenali konteks dan dapat merekomendasikan rujukan kelas otomatis berdasarkan kata kunci obrolan. Biaya konsultasi dipotong otomatis dari RinCoin.
   - **Bagi Pengajar**: Asisten *AI Studio* (Generator Soal JSON-murni & Generator Modul Markdown) yang mempercepat produksi bank soal dan silabus materi.
4. **WhatsApp Blast & Dispatcher Notifikasi**
   Sistem notifikasi *Broadcast* (pengingat ujian, jatuh tempo tagihan, dan jadwal *Live Zoom*) berbasis WhatsApp. Termasuk fitur *Sandbox Fallback* yang pintar (jika belum ada provider berlangganan, sistem otomatis menyimpan log sukses pura-pura agar antrean tidak tertahan/error).
5. **Dashboard Administrasi Holistik**
   Manajemen direktori master siswa, penyesuaian koin manual, pelaporan transaksi, hingga *switch* konfigurasi kredensial layanan pihak ketiga (Payment Gateway & AI) sepenuhnya diatur di dalam dasbor tanpa perlu mengubah *source code* secara *hardcoded*.

---

## 🛠 Kebutuhan Sistem (Prasyarat)

Sebelum menjalankan aplikasi, pastikan *environment* server Anda memenuhi spesifikasi berikut:

- **Node.js**: Versi `18.18.0` atau yang lebih baru (Rekomendasi: `v20.x`).
- **NPM / Yarn / pnpm**: *Package manager* standar untuk Node.
- **Database**: PostgreSQL (dapat menggunakan layanan *cloud* seperti Supabase, Neon, atau *instance* VPS lokal).
- **TypeScript**: Didukung penuh secara *native* pada kerangka proyek.

---

## 🚀 Panduan Instalasi Cepat (Quick Start)

Ikuti langkah-langkah di bawah ini untuk memulai aplikasi dalam lingkungan *development* (pengembangan):

**1. Kloning Repositori & Instalasi Dependensi**
```bash
git clone <URL_REPOSITORI_ANDA>
cd Bimbel
npm install
```

**2. Konfigurasi Variabel Lingkungan (.env)**
Salin berkas `.env.example` (jika ada) menjadi `.env`, lalu isi pengaturan wajib berikut ini:
```env
# Koneksi Database PostgreSQL
DATABASE_URL="postgresql://user:password@localhost:5432/bimbel_db?schema=public"

# Kunci Rahasia Autentikasi (Buat string acak 32 karakter yang kuat)
NEXTAUTH_SECRET="RAHASIA_PANJANG_UNTUK_TOKEN_SESSIONS_123!"

# URL Utama Aplikasi
NEXTAUTH_URL="http://localhost:3000"

# Kunci Enkripsi Master untuk Kredensial PengaturanSistem (Wajib 32 karakter)
APP_ENCRYPTION_KEY="KunciRahasia32KarakterYangKuat!!"
```

**3. Sinkronisasi Skema Database**
Gunakan Prisma ORM untuk mendorong (*push*) skema tabel ke dalam database PostgreSQL Anda:
```bash
npx prisma db push
```
*(Catatan: Pada tahap produksi, lebih disarankan menggunakan `npx prisma migrate deploy`)*

**4. Inisialisasi Data Awal (Seeding)**
Jalankan modul *seeder* bawaan untuk membuat konfigurasi default dan akun Administrator Pertama:
```bash
npx prisma db seed
```

**5. Jalankan Server Dev**
```bash
npm run dev
```
Aplikasi sekarang dapat diakses melalui `http://localhost:3000`.

---

## 🔐 Kredensial Pengguna Bawaan (Default Seeder)

Setelah Anda menjalankan proses *Seeding* (`npx prisma db seed`), Anda dapat langsung *login* ke Dasbor Admin menggunakan data berikut:

- **Peran**: Administrator / Pengajar Master
- **Email**: `admin@bimbel.local`
- **Kata Sandi**: `PasswordAdmin123!`

> **PENTING**: Segera ubah sandi ini atau hapus akun *default* setelah Anda berhasil masuk demi alasan keamanan pada lingkungan *Production*.

---

## ⚙️ Panduan Konfigurasi API Pihak Ketiga (Runtime)

Aplikasi ini dirancang untuk **TIDAK** menyimpan kredensial berharga (*API Key/Secret*) dalam variabel lingkungan yang bersifat statis untuk layanan pihak ketiga, demi kemudahan pengelolaan oleh operator non-teknis. Seluruh konfigurasi diatur dalam **Ruang Kendali Pengaturan** di Dasbor Admin (`/admin/pengaturan`), terenkripsi ganda di database.

### 1. Integrasi AI (OpenAI & Chatbot RinaSensei)
1. Pergi ke halaman **Pengaturan Sistem** > **Kecerdasan Buatan (AI)**.
2. Masukkan Provider Model (Misal: `https://api.openai.com/v1`).
3. Masukkan Identifier Model (Misal: `gpt-4o-mini`).
4. Masukkan **API Key** Rahasia OpenAI. Klik **Simpan**.

### 2. Integrasi Pembayaran (Payment Gateway)
Sistem mendukung provider lokal secara bergantian (Midtrans / Xendit).
1. Buka halaman **Pengaturan Sistem** > **Payment Gateway**.
2. Pilih penyedia layanan aktif.
3. Masukkan `Server Key` dan `Client Key`.
4. Salin URL **Webhook** (biasanya: `https://domain-anda.com/api/webhooks/pembayaran`) ke dalam panel konfigurasi Midtrans / Xendit *Dashboard* Anda.

### 3. Integrasi WhatsApp (Fonnte API)
Digunakan untuk fitur *WhatsApp Blast*.
1. Buka halaman **Pengaturan Sistem** > **Komunikasi (WhatsApp)**.
2. Masukkan **Token API** yang didapat dari akun Fonnte Anda.
3. (PENTING): Jika Anda membiarkan kolom API Key ini kosong, sistem akan secara adaptif masuk ke **Sandbox Mode**, artinya pesan akan dianggap 'sukses terkirim' secara virtual untuk menguji logika antrean.

---

## 🏗 Panduan Skalabilitas & Deploy Produksi

Karena dibangun sepenuhnya di atas ekosistem Next.js 15, aplikasi ini sangat optimal di-*deploy* ke infrastruktur komputasi awan modern (*Serverless* atau *Container*).

**Pilihan Deploy Mudah:**
- **Vercel / Netlify**: Sangat direkomendasikan karena aplikasi ini memakai pola *App Router* dan *Server Actions*.
- **Railway / Render**: Opsi terbaik jika Anda sekaligus membutuhkan basis data *PostgreSQL* dalam satu paket penagihan.
- **VPS Pribadi / Docker**: Didukung penuh untuk Anda yang ingin isolasi *instance*.

**Perintah Membangun (Build):**
Untuk mempersiapkan kompilasi ke *production build*, jalankan perintah berikut:
```bash
npm run build
```
*(Perintah ini akan melakukan validasi TypeScript yang ketat pada seluruh Rute, Server Actions, dan Komponen Klien. Pastikan tidak ada galat 'tipe data' yang terlewat).*

**Perintah Menjalankan Servis (Start):**
Setelah di-*build*, aplikasi dapat dijalankan secara persisten:
```bash
npm run start
```

---

*Hak Cipta © 2026. Proyek ini ditugaskan dan dibangun dengan standar kode kebersihan (Clean Code) setara rekayasawan senior penuh.*
