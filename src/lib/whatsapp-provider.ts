import { prisma } from '@/lib/prisma';
import { dekripsiTeks } from '@/lib/crypto';

/**
 * Format nomor telepon Indonesia menjadi standar internasional (62).
 */
export function formatNomorWhatsApp(noHp: string): string {
  // Hapus semua karakter non-digit
  let bersih = noHp.replace(/\D/g, '');
  
  // Ubah awalan 0 menjadi 62
  if (bersih.startsWith('0')) {
    bersih = '62' + bersih.substring(1);
  } else if (bersih.startsWith('62')) {
    // Tetap 62
  } else {
    // Jika tidak diawali 0 atau 62, asumsikan lokal dan tambahkan 62 jika panjang mencukupi
    if (bersih.length >= 9 && bersih.length <= 13) {
       bersih = '62' + bersih;
    }
  }
  return bersih;
}

/**
 * Mengganti variabel template dengan nilai aslinya.
 */
export function gantiVariabelTemplate(template: string, data: Record<string, string>): string {
  let hasil = template;
  for (const [key, value] of Object.entries(data)) {
    const regex = new RegExp(`{{${key}}}`, 'g');
    hasil = hasil.replace(regex, value);
  }
  return hasil;
}

/**
 * Mengirim pesan WhatsApp. Mendukung mode Sandbox/Simulasi jika kunci API kosong.
 */
export async function kirimPesanWhatsApp(noTujuan: string, pesanTeks: string): Promise<{ sukses: boolean, idRespon?: string, pesanError?: string, mode?: string, pesan?: string }> {
  try {
    const target = formatNomorWhatsApp(noTujuan);

    const pengaturan = await prisma.pengaturanSistem.findMany({
      where: {
        kunci: {
          in: ['WA_PROVIDER', 'WA_API_KEY', 'WA_SENDER_NUMBER']
        }
      }
    });

    const mapPengaturan = pengaturan.reduce((acc: any, curr: any) => {
      acc[curr.kunci] = curr.nilai;
      return acc;
    }, {} as Record<string, string>);

    const provider = mapPengaturan['WA_PROVIDER'] || 'FONNTE';
    const apiKeyEnkripsi = mapPengaturan['WA_API_KEY'];
    
    let apiKey = '';
    if (apiKeyEnkripsi) {
      try {
        apiKey = dekripsiTeks(apiKeyEnkripsi);
      } catch (e) {
        // Gagal dekripsi
      }
    }

    // MODE SIMULASI JIKA API KEY KOSONG
    if (!apiKey) {
      console.log(`[WA_SANDBOX] Mengirim pesan ke ${target}: ${pesanTeks}`);
      return { 
        sukses: true, 
        idRespon: 'SIMULASI_' + Date.now(), 
        mode: 'MOCK', 
        pesan: 'Pesan berhasil disimulasikan dalam mode sandbox.' 
      };
    }

    if (provider === 'FONNTE') {
      const form = new FormData();
      form.append('target', target);
      form.append('message', pesanTeks);

      const response = await fetch('https://api.fonnte.com/send', {
        method: 'POST',
        headers: {
          'Authorization': apiKey,
        },
        body: form
      });

      const responseData = await response.json();

      if (!response.ok || !responseData.status) {
         return { sukses: false, pesanError: responseData.reason || 'Gagal mengirim pesan via Fonnte.' };
      }

      return { sukses: true, idRespon: typeof responseData.id === 'object' ? responseData.id.join(',') : (responseData.id || 'FONNTE_SENT') };
    }

    return { sukses: false, pesanError: 'Provider WhatsApp tidak didukung.' };
  } catch (error: any) {
    return { sukses: false, pesanError: error.message || 'Terjadi kesalahan sistem internal.' };
  }
}
