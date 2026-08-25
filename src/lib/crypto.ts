import crypto from 'crypto';

const ALGORITHM_CBC = 'aes-256-cbc';
const ALGORITHM_GCM = 'aes-256-gcm';
const KEY = (process.env.APP_ENCRYPTION_KEY || process.env.ENCRYPTION_KEY || 'default_32_byte_secret_key_2026!').slice(0, 32).padEnd(32, '0');

/**
 * Mengenkripsi teks biasa menjadi teks tersandi
 * @param {string} teksBiasa Teks yang ingin dienkripsi
 * @returns {string} Teks tersandi dengan format iv:encryptedData (hex)
 */
export function enkripsiTeks(teksBiasa: string): string {
  if (!teksBiasa) return '';
  try {
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv(ALGORITHM_CBC, Buffer.from(KEY), iv);
    let encrypted = cipher.update(teksBiasa);
    encrypted = Buffer.concat([encrypted, cipher.final()]);
    return `${iv.toString('hex')}:${encrypted.toString('hex')}`;
  } catch (error) {
    console.error('Encryption failed:', error);
    return teksBiasa;
  }
}

/**
 * Mendekripsi teks tersandi kembali menjadi teks biasa
 * Mendukung pembacaan format baru (CBC - 2 bagian) dan format lama (GCM - 3 bagian) secara aman
 * @param {string} teksTersandi Teks tersandi
 * @returns {string} Teks biasa hasil dekripsi
 */
export function dekripsiTeks(teksTersandi: string): string {
  if (!teksTersandi) return '';
  if (!teksTersandi.includes(':')) return teksTersandi; // Teks tidak terenkripsi

  const bagian = teksTersandi.split(':');

  // Format baru: AES-256-CBC (iv:encryptedData)
  if (bagian.length === 2) {
    try {
      const [ivHex, encryptedHex] = bagian;
      if (!ivHex || !encryptedHex) return teksTersandi;
      const iv = Buffer.from(ivHex, 'hex');
      const encryptedText = Buffer.from(encryptedHex, 'hex');
      const decipher = crypto.createDecipheriv(ALGORITHM_CBC, Buffer.from(KEY), iv);
      let decrypted = decipher.update(encryptedText);
      decrypted = Buffer.concat([decrypted, decipher.final()]);
      return decrypted.toString();
    } catch (error) {
      console.warn('Gagal mendekripsi teks CBC:', error);
      return '';
    }
  }

  // Format lama: AES-256-GCM (iv:authTag:encryptedData)
  if (bagian.length === 3) {
    try {
      const [ivHex, authTagHex, dataTerenkripsiHex] = bagian;
      if (!ivHex || !authTagHex || !dataTerenkripsiHex) return teksTersandi;
      const iv = Buffer.from(ivHex, 'hex');
      const authTag = Buffer.from(authTagHex, 'hex');
      const decipher = crypto.createDecipheriv(ALGORITHM_GCM, Buffer.from(KEY), iv.slice(0, 12)); // IV untuk GCM biasanya 12 byte
      decipher.setAuthTag(authTag);
      let teksBiasa = decipher.update(dataTerenkripsiHex, 'hex', 'utf8');
      teksBiasa += decipher.final('utf8');
      return teksBiasa;
    } catch (error) {
      try {
        // Fallback coba didekripsi menggunakan iv utuh jika iv hex 16 byte
        const [ivHex, authTagHex, dataTerenkripsiHex] = bagian;
        const iv = Buffer.from(ivHex, 'hex');
        const authTag = Buffer.from(authTagHex, 'hex');
        const decipher = crypto.createDecipheriv(ALGORITHM_GCM, Buffer.from(KEY), iv);
        decipher.setAuthTag(authTag);
        let teksBiasa = decipher.update(dataTerenkripsiHex, 'hex', 'utf8');
        teksBiasa += decipher.final('utf8');
        return teksBiasa;
      } catch (errInner) {
        console.warn('Gagal mendekripsi teks GCM:', errInner);
        return '';
      }
    }
  }

  return teksTersandi;
}

// Ekspor alias untuk kecocokan jika dipanggil dengan nama encrypt/decrypt
export { enkripsiTeks as encrypt, dekripsiTeks as decrypt };
