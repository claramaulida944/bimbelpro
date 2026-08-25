'use client';

import { useState } from 'react';
import { Plus, Minus, HelpCircle } from 'lucide-react';

type FaqItem = {
  tanya: string;
  jawab: string;
};

export default function FaqAccordion() {
  const [indeksTerbuka, setIndeksTerbuka] = useState<number | null>(null);

  const daftarFaq: FaqItem[] = [
    {
      tanya: 'Bagaimana RinaSensei AI membantu proses belajar?',
      jawab: 'RinaSensei AI bertindak sebagai tutor pribadi cerdas yang siaga 24/7. Siswa dapat menanyakan rumus matematika, pembahasan soal sulit, atau ringkasan bab sains. AI kami secara interaktif menguraikan cara penyelesaian langkah-demi-langkah dengan bahasa yang bersahabat dan mudah dipahami dalam hitungan detik.'
    },
    {
      tanya: 'Bagaimana platform CBT mendeteksi kecurangan?',
      jawab: 'Platform CBT kami dilengkapi dengan modul anti-cheat tangguh berbasis web (Lockdown Mode). Sistem akan secara otomatis mendeteksi dan mencatat pelanggaran apabila siswa keluar dari mode layar penuh (fullscreen), berpindah tab browser, membuka aplikasi lain, menggunakan developer tools (F12/Inspect), atau melakukan klik kanan. Jika pelanggaran melewati batas toleransi yang diatur pengajar, sesi ujian siswa akan langsung ditutup dan didiskualifikasi secara otomatis.'
    },
    {
      tanya: 'Apa itu RinCoin dan bagaimana cara kerjanya?',
      jawab: 'RinCoin (RC) adalah sistem mata uang digital platform yang dirancang untuk mewujudkan sistem pembayaran mikro (micropayments) yang adil. Nilai 1 RinCoin setara dengan Rp 1.000. Siswa tidak perlu berlangganan bulanan penuh; mereka cukup mengisi saldo RinCoin dan menggunakannya secara eceran hanya untuk materi yang ingin diakses (misal: 10 RC untuk chat AI, 30 RC untuk tryout CBT, atau 50 RC untuk akses satu bab video rekaman).'
    },
    {
      tanya: 'Bagaimana cara pengajar mengirim pengumuman lewat WhatsApp?',
      jawab: 'BimbelPro memiliki fitur WhatsApp Gateway otomatis. Melalui dasbor admin, pengajar dapat mengirim pesan massal (WA Blast) untuk pengumuman kelas, pengingat jadwal video call live, kuitansi top-up saldo RinCoin siswa, hingga laporan nilai hasil tryout CBT secara otomatis langsung ke nomor siswa atau orang tua.'
    },
    {
      tanya: 'Apakah sekolah atau lembaga bimbel saya bisa menggunakan sistem ini secara mandiri?',
      jawab: 'Tentu saja! Kami menyediakan solusi custom dan White-Label untuk sekolah, universitas, maupun lembaga bimbingan belajar. Anda dapat menggunakan brand/logo Anda sendiri, memasang domain kustom (misal: cbt.sekolahanda.sch.id), mengelola tim pengajar, serta mengatur skema tarif monetisasi RinCoin secara penuh.'
    }
  ];

  const toggleAccordion = (index: number) => {
    setIndeksTerbuka(indeksTerbuka === index ? null : index);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-4">
      {daftarFaq.map((faq, index) => {
        const apakahTerbuka = indeksTerbuka === index;
        return (
          <div 
            key={index} 
            className="bg-white border border-slate-200/80 rounded-2xl overflow-hidden shadow-xs hover:border-slate-300 transition duration-300"
          >
            <button
              onClick={() => toggleAccordion(index)}
              className="w-full flex items-center justify-between p-5 text-left font-bold text-slate-800 hover:text-indigo-600 transition duration-300 gap-4"
            >
              <span className="flex items-center gap-3 text-sm md:text-base">
                <HelpCircle className="w-5 h-5 text-slate-400 shrink-0" />
                {faq.tanya}
              </span>
              <div className="p-1 rounded-lg bg-slate-50 border border-slate-200 shrink-0">
                {apakahTerbuka ? (
                  <Minus className="w-4 h-4 text-indigo-600" />
                ) : (
                  <Plus className="w-4 h-4 text-indigo-600" />
                )}
              </div>
            </button>
            
            <div 
              className={`transition-all duration-300 ease-in-out overflow-hidden ${
                apakahTerbuka ? 'max-h-[300px] border-t border-slate-100' : 'max-h-0'
              }`}
            >
              <div className="p-5 text-xs md:text-sm text-slate-600 leading-relaxed bg-slate-50/50">
                {faq.jawab}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
