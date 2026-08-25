import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifikasiNotifikasiWebhook } from '@/lib/payment-gateway';

export async function POST(req: Request) {
  try {
    const payload = await req.json();
    
    // Mengekstrak dan memverifikasi notifikasi
    const verifikasi = await verifikasiNotifikasiWebhook(payload);
    
    if (!verifikasi.idTransaksi) {
      return NextResponse.json({ status: 'diabaikan', reason: 'id transaksi kosong' }, { status: 200 });
    }

    const idTransaksi = verifikasi.idTransaksi;

    // Mencari transaksi di database
    const transaksi = await prisma.transaksiRinCoin.findUnique({
      where: { id: idTransaksi }
    });

    if (!transaksi) {
      return NextResponse.json({ status: 'diabaikan', reason: 'transaksi tidak ditemukan' }, { status: 200 });
    }

    // Perlindungan Idempotensi: Cegah pengisian saldo berulang jika sudah diproses sebelumnya
    if (transaksi.status === 'BERHASIL') {
      return NextResponse.json({ status: 'sudah_diproses' }, { status: 200 });
    }

    if (verifikasi.statusSukses) {
      // Jalankan pembaruan data secara atomik
      await prisma.$transaction(async (tx) => {
        // Pemeriksaan ganda di dalam blok transaksi terisolasi
        const txCek = await tx.transaksiRinCoin.findUnique({
          where: { id: idTransaksi }
        });
        
        if (txCek && txCek.status !== 'BERHASIL') {
          await tx.transaksiRinCoin.update({
            where: { id: idTransaksi },
            data: { status: 'BERHASIL' }
          });
          
          await tx.pengguna.update({
            where: { id: transaksi.idSiswa },
            data: { saldoRinCoin: { increment: transaksi.jumlahKoin } }
          });
        }
      });
    } else if (verifikasi.rawStatus === 'deny' || verifikasi.rawStatus === 'cancel' || verifikasi.rawStatus === 'expire') {
      await prisma.transaksiRinCoin.update({
        where: { id: idTransaksi },
        data: { status: verifikasi.rawStatus === 'expire' ? 'KADALUARSA' : 'GAGAL' }
      });
    }

    return NextResponse.json({ status: 'ok' }, { status: 200 });
  } catch (error) {
    console.error('Terjadi kesalahan pada modul webhook:', error);
    // Mengembalikan kode 200 untuk menghindari rentetan 'retry' tanpa batas dari penyedia pembayaran jika terjadi kegagalan parsial
    return NextResponse.json({ status: 'kesalahan_ditangani' }, { status: 200 });
  }
}
