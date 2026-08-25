import { prisma } from '@/lib/prisma';
import { dekripsiTeks } from '@/lib/crypto';

interface KonfigurasiPembayaran {
  provider: string;
  serverKey: string;
  clientKey: string;
  isProduction: boolean;
}

export async function ambilKonfigurasiPembayaran(): Promise<KonfigurasiPembayaran> {
  const pengaturan = await prisma.pengaturanSistem.findMany({
    where: {
      kunci: {
        in: ['PAYMENT_PROVIDER', 'PAYMENT_SERVER_KEY', 'PAYMENT_CLIENT_KEY', 'PAYMENT_IS_PRODUCTION']
      }
    }
  });

  const config: Record<string, string> = {};
  for (const peng of pengaturan) {
    if (peng.adalahRahasia && peng.nilai !== '') {
      try {
        config[peng.kunci] = dekripsiTeks(peng.nilai);
      } catch (error) {
        console.error(`Gagal mendekripsi ${peng.kunci}`, error);
        config[peng.kunci] = '';
      }
    } else {
      config[peng.kunci] = peng.nilai;
    }
  }

  return {
    provider: config['PAYMENT_PROVIDER'] || 'MANUAL_TRANSFER',
    serverKey: config['PAYMENT_SERVER_KEY'] || '',
    clientKey: config['PAYMENT_CLIENT_KEY'] || '',
    isProduction: config['PAYMENT_IS_PRODUCTION'] === 'true'
  };
}

interface PermintaanTagihan {
  idTransaksi: string;
  totalRupiah: number;
  emailSiswa: string;
  namaSiswa: string;
  namaPaket: string;
}

export async function buatTagihanPembayaran(data: PermintaanTagihan) {
  const config = await ambilKonfigurasiPembayaran();

  if (config.provider === 'MIDTRANS' && config.serverKey) {
    const midtransUrl = config.isProduction 
      ? 'https://app.midtrans.com/snap/v1/transactions' 
      : 'https://app.sandbox.midtrans.com/snap/v1/transactions';
      
    const authString = Buffer.from(config.serverKey + ':').toString('base64');

    const payload = {
      transaction_details: {
        order_id: data.idTransaksi,
        gross_amount: data.totalRupiah
      },
      customer_details: {
        first_name: data.namaSiswa,
        email: data.emailSiswa
      },
      item_details: [
        {
          id: data.idTransaksi,
          price: data.totalRupiah,
          quantity: 1,
          name: data.namaPaket
        }
      ]
    };

    try {
      const respons = await fetch(midtransUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': `Basic ${authString}`
        },
        body: JSON.stringify(payload)
      });

      if (!respons.ok) {
        const errorData = await respons.json();
        console.error('Gagal membuat tagihan Midtrans:', errorData);
        throw new Error('Gagal menghubungi penyedia layanan pembayaran.');
      }

      const hasil = await respons.json();
      return {
        urlPembayaran: hasil.redirect_url,
        tokenPembayaran: hasil.token
      };
    } catch (error) {
      console.error('Kesalahan jaringan saat membuat tagihan Midtrans:', error);
      // Akan melanjutkan ke simulasi fallback jika gagal (atau bisa throw)
    }
  }

  // Fallback / Mode Simulasi jika tidak terkonfigurasi
  return {
    urlPembayaran: `/siswa/dompet/simulasi-bayar?id=${data.idTransaksi}`
  };
}

export async function verifikasiNotifikasiWebhook(payload: Record<string, any>) {
  const order_id = payload.order_id;
  const transaction_status = payload.transaction_status;
  const fraud_status = payload.fraud_status;
  const gross_amount = parseInt(payload.gross_amount || '0', 10);

  let statusSukses = false;

  if (transaction_status === 'capture') {
    if (fraud_status === 'accept') {
      statusSukses = true;
    }
  } else if (transaction_status === 'settlement') {
    statusSukses = true;
  }

  return {
    idTransaksi: order_id,
    statusSukses,
    rawStatus: transaction_status,
    jumlahKotor: gross_amount
  };
}
