import crypto from 'crypto';

/**
 * Modul Enkripsi dan Dekripsi menggunakan AES-256-GCM
 * Memerlukan APP_ENCRYPTION_KEY sepanjang 32 karakter di dalam Environment Variables.
 */

const ALGORITMA = 'aes-256-gcm';
const PANJANG_IV = 16;
const PANJANG_TAG = 16;

/**
 * Mengambil kunci enkripsi dari environment variable
 * Akan melemparkan error jika kunci tidak ditemukan atau panjangnya tidak sesuai
 * @returns {Buffer} Buffer kunci enkripsi berukuran 32 byte
 */
const dapatkanKunciEnkripsi = (): Buffer => {
  const kunci = process.env.APP_ENCRYPTION_KEY;
  if (!kunci) {
    throw new Error('APP_ENCRYPTION_KEY tidak ditemukan di environment variables.');
  }
  if (kunci.length !== 32) {
    throw new Error('APP_ENCRYPTION_KEY harus tepat 32 karakter.');
  }
  return Buffer.from(kunci, 'utf-8');
};

/**
 * Mengenkripsi teks biasa menjadi teks tersandi
 * @param {string} teksBiasa Teks yang ingin dienkripsi
 * @returns {string} Teks tersandi dengan format iv:authTag:encryptedData (hex)
 */
export const enkripsiTeks = (teksBiasa: string): string => {
  const kunci = dapatkanKunciEnkripsi();
  const iv = crypto.randomBytes(PANJANG_IV);
  const cipher = crypto.createCipheriv(ALGORITMA, kunci, iv);
  
  let dataTerenkripsi = cipher.update(teksBiasa, 'utf8', 'hex');
  dataTerenkripsi += cipher.final('hex');
  
  const authTag = cipher.getAuthTag().toString('hex');
  
  return `${iv.toString('hex')}:${authTag}:${dataTerenkripsi}`;
};

/**
 * Mendekripsi teks tersandi kembali menjadi teks biasa
 * @param {string} teksTersandi Teks tersandi dengan format iv:authTag:encryptedData (hex)
 * @returns {string} Teks biasa hasil dekripsi
 */
export const dekripsiTeks = (teksTersandi: string): string => {
  const kunci = dapatkanKunciEnkripsi();
  const bagian = teksTersandi.split(':');
  
  if (bagian.length !== 3) {
    throw new Error('Format teks tersandi tidak valid. Harus berupa iv:authTag:encryptedData');
  }
  
  const [ivHex, authTagHex, dataTerenkripsiHex] = bagian;
  
  const iv = Buffer.from(ivHex, 'hex');
  const authTag = Buffer.from(authTagHex, 'hex');
  
  const decipher = crypto.createDecipheriv(ALGORITMA, kunci, iv);
  decipher.setAuthTag(authTag);
  
  let teksBiasa = decipher.update(dataTerenkripsiHex, 'hex', 'utf8');
  teksBiasa += decipher.final('utf8');
  
  return teksBiasa;
};
