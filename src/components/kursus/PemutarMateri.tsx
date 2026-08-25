'use client';

import { Video, FileText, ExternalLink } from 'lucide-react';

interface PropsPemutar {
  tipeMateri: 'VIDEO_STREAM' | 'EMBED_YOUTUBE' | 'LINK_ZOOM' | 'EBOOK_PDF';
  kontenUrl?: string | null;
  kontenTeks?: string | null;
}

export default function PemutarMateri({ tipeMateri, kontenUrl, kontenTeks }: PropsPemutar) {
  if (tipeMateri === 'EMBED_YOUTUBE' && kontenUrl) {
    // Ekstrak ID YouTube dengan Regex yang andal untuk berbagai format link
    let ytId = '';
    const regexId = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/i;
    const match = kontenUrl.match(regexId);
    if (match && match[1]) {
      ytId = match[1];
    }

    return (
      <div className="w-full aspect-video rounded-xl shadow-sm border border-slate-200 overflow-hidden bg-black">
        {ytId ? (
          <iframe 
            src={`https://www.youtube.com/embed/${ytId}?rel=0`} 
            title="Pemutar Video Rekaman"
            className="w-full h-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
            allowFullScreen
          ></iframe>
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center text-slate-400">
            <Video className="w-12 h-12 mb-2 opacity-50" />
            <p>Tautan YouTube tidak terdeteksi dengan valid.</p>
          </div>
        )}
      </div>
    );
  }

  if (tipeMateri === 'VIDEO_STREAM' && kontenUrl) {
    return (
      <div className="w-full aspect-video rounded-xl shadow-sm border border-slate-200 overflow-hidden bg-black flex items-center justify-center">
        <video 
          controls 
          controlsList="nodownload" 
          onContextMenu={(e) => e.preventDefault()}
          className="w-full h-full"
          src={kontenUrl}
        >
          Peramban Anda tidak mendukung pemutar video HTML5.
        </video>
      </div>
    );
  }

  if (tipeMateri === 'LINK_ZOOM' && kontenUrl) {
    return (
      <div className="w-full aspect-video rounded-xl shadow-sm border border-slate-200 bg-indigo-50 flex flex-col items-center justify-center p-6 text-center">
        <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center shadow-sm mb-6 border border-indigo-100">
          <Video className="w-10 h-10 text-indigo-600" />
        </div>
        <h3 className="text-xl font-bold text-slate-900 mb-2">Sesi Kelas Interaktif</h3>
        <p className="text-slate-600 mb-8 max-w-md">
          Kelas ini diselenggarakan secara langsung. Silakan klik tombol di bawah untuk bergabung ke ruang konferensi virtual.
        </p>
        <a 
          href={kontenUrl} 
          target="_blank" 
          rel="noreferrer"
          className="inline-flex items-center gap-2 bg-indigo-600 text-white px-8 py-3 rounded-xl font-medium hover:bg-indigo-700 transition shadow-sm"
        >
          Buka Ruang Zoom / Videocall
          <ExternalLink className="w-5 h-5" />
        </a>
      </div>
    );
  }

  if (tipeMateri === 'EBOOK_PDF') {
    return (
      <div className="w-full min-h-[500px] rounded-xl shadow-sm border border-slate-200 bg-white p-8">
        <div className="flex items-center gap-3 mb-6 border-b border-slate-100 pb-4">
          <FileText className="w-6 h-6 text-slate-500" />
          <h3 className="font-semibold text-slate-700">Materi Modul Teks</h3>
        </div>
        <div className="prose prose-slate max-w-none text-slate-700 whitespace-pre-wrap">
          {kontenTeks || 'Belum ada konten teks untuk materi ini.'}
        </div>
        {kontenUrl && (
          <div className="mt-8 pt-6 border-t border-slate-100">
            <a 
              href={kontenUrl} 
              target="_blank" 
              rel="noreferrer"
              className="inline-flex items-center gap-2 text-indigo-600 hover:text-indigo-800 font-medium transition"
            >
              Unduh Lampiran Modul Tambahan <ExternalLink className="w-4 h-4" />
            </a>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="w-full aspect-video rounded-xl shadow-sm border border-slate-200 bg-slate-100 flex flex-col items-center justify-center text-slate-400">
      <Video className="w-12 h-12 mb-2 opacity-30" />
      <p>Tidak ada konten yang dapat diputar.</p>
    </div>
  );
}
