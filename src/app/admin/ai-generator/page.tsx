import React from 'react';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import AiGeneratorClient from './client';

export default async function AiGeneratorPage() {
  const session = await getServerSession(authOptions);
  
  if (!session?.user || session.user.peran !== 'ADMIN_PENGAJAR') {
    redirect('/login');
  }

  // Ambil daftar ujian aktif untuk dropdown generator soal
  const daftarUjian = await prisma.simulasiUjian.findMany({
    where: { apakahAktif: true },
    select: { id: true, judulUjian: true },
    orderBy: { judulUjian: 'asc' }
  });

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        <header className="mb-8">
          <h1 className="text-3xl font-extrabold text-slate-900 mb-2">AI Studio Pengajar</h1>
          <p className="text-slate-600">Otomatisasi penyusunan materi kursus dan bank soal menggunakan kecerdasan buatan.</p>
        </header>

        <AiGeneratorClient daftarUjian={daftarUjian} />
      </div>
    </div>
  );
}
