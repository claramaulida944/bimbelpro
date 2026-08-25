import { prisma } from './prisma';
import { dekripsiTeks } from './crypto';

export type AiMessage = {
  role: 'system' | 'user' | 'assistant';
  content: string;
};

export type AiResponse = {
  teks: string;
  tokenDigunakan: number;
};

// ---------------------------------------------------------------------------
// SIMULASI
// ---------------------------------------------------------------------------
const SIMULASI_SOAL_JSON = JSON.stringify({
  daftarSoal: [
    {
      teksSoal: 'Siapakah penemu bola lampu yang mempatenkan desain komersial pertama?',
      pilihanJawaban: [
        { label: 'A', teks: 'Nikola Tesla' },
        { label: 'B', teks: 'Thomas Edison' },
        { label: 'C', teks: 'Albert Einstein' },
        { label: 'D', teks: 'Isaac Newton' },
        { label: 'E', teks: 'Alexander Graham Bell' },
      ],
      kunciJawaban: 'B',
      pembahasan: 'Thomas Edison mempatenkan bola lampu pijar komersial pertama pada 1879.',
      labelTopik: 'Sejarah Sains',
    },
  ],
});

// ---------------------------------------------------------------------------
// HELPER: Bersihkan markdown JSON
// ---------------------------------------------------------------------------
function bersihkanOutputJson(teks: string): string {
  return teks
    .replace(/^```json\s*/im, '')
    .replace(/^```\s*/im, '')
    .replace(/\s*```\s*$/im, '')
    .trim();
}

// ---------------------------------------------------------------------------
// HELPER: Ekstrak blok JSON dari teks bebas
// ---------------------------------------------------------------------------
export function ekstrakJsonDariTeks(teks: string): string {
  const blokMarkdown = teks.match(/```json\s*([\s\S]*?)```/i);
  if (blokMarkdown) return blokMarkdown[1].trim();

  const mulaiObjek = teks.indexOf('{');
  const akhirObjek = teks.lastIndexOf('}');
  if (mulaiObjek !== -1 && akhirObjek > mulaiObjek) {
    return teks.substring(mulaiObjek, akhirObjek + 1).trim();
  }
  return teks.trim();
}

// ---------------------------------------------------------------------------
// SANITIZER: Hapus Chain-of-Thought / Thinking Process
// Menangani: <think>...</think>, unclosed <think>, "Here's a thinking process"
// ---------------------------------------------------------------------------
export function bersihkanResponMentahAI(teks: string): string {
  if (!teks) return '';
  let bersih = teks;

  // 1. Hapus blok <think>...</think> yang tertutup (GREEDY agar tangkap semua)
  bersih = bersih.replace(/<think>[\s\S]*?<\/think>/gi, '');

  // 2. Tangani <think> yang TIDAK TERTUTUP (terpotong di tengah thinking)
  //    Cari posisi <think> terakhir dan ambil semua setelah </think> berikutnya
  if (/<think>/i.test(bersih)) {
    const endThinkMatch = bersih.match(/<\/think>([\s\S]*)/i);
    if (endThinkMatch) {
      // Ada </think> — ambil konten setelahnya
      bersih = endThinkMatch[1];
    } else {
      // Tidak ada </think> — model terpotong di tengah thinking
      // Hapus dari <think> ke akhir, sisakan apapun sebelum <think>
      bersih = bersih.replace(/<think>[\s\S]*/i, '');
    }
  }

  // 3. Hapus pola scratchpad "Here's a thinking process: ... [Output Generation]"
  if (/here'?s a thinking process/i.test(bersih)) {
    const bagian = bersih.split(/\[Output Generation\]/i);
    if (bagian.length > 1) {
      bersih = bagian[bagian.length - 1];
    } else {
      bersih = bersih.replace(
        /here'?s a thinking process:[\s\S]*?(?=\n\n(?:Halo|Selamat|Hai|Berikut|Baik|Tentu|[A-Z\u00C0-\u017F0-9#*\-]|\*\*))/i,
        '',
      );
    }
  }

  // 4. Hapus sisa marker teknis
  bersih = bersih.replace(/\[Output Generation\]/gi, '');
  bersih = bersih.replace(/\[Notebook sources?\]/gi, '');

  return bersih.trim();
}

// ---------------------------------------------------------------------------
// HELPER INTERNAL: Kirim satu request
// ---------------------------------------------------------------------------
async function kirimRequest(
  targetUrl: string,
  headers: Record<string, string>,
  model: string,
  pesan: AiMessage[],
  temperature: number,
  gunakanjsonMode: boolean,
  maxTokens: number,
): Promise<Response> {
  const payload: Record<string, unknown> = {
    model,
    messages: pesan,
    temperature,
    max_tokens: maxTokens,
    ...(gunakanjsonMode ? { response_format: { type: 'json_object' } } : {}),
  };
  return fetch(targetUrl, {
    method: 'POST',
    headers,
    body: JSON.stringify(payload),
  });
}

// ---------------------------------------------------------------------------
// FUNGSI UTAMA
// ---------------------------------------------------------------------------
export async function panggilModelAI(
  pesan: AiMessage[],
  formatJson: boolean = false,
): Promise<AiResponse> {
  // 1. Ambil konfigurasi dari DB
  const [providerSetting, apiKeySetting, modelSetting] = await Promise.all([
    prisma.pengaturanSistem.findUnique({ where: { kunci: 'AI_PROVIDER' } }),
    prisma.pengaturanSistem.findUnique({ where: { kunci: 'AI_API_KEY' } }),
    prisma.pengaturanSistem.findUnique({ where: { kunci: 'AI_MODEL' } }),
  ]);

  const providerRaw = (providerSetting?.nilai ?? '').toLowerCase().trim();
  let modelTarget   = (modelSetting?.nilai ?? '').trim().replace(/^models\//, '');
  let apiKey        = '';

  if (apiKeySetting?.nilai) {
    try { apiKey = dekripsiTeks(apiKeySetting.nilai); } catch (err) {
      console.error('[AI Provider] Gagal mendekripsi AI_API_KEY:', err);
    }
  }

  // 2. Mode simulasi
  if (!apiKey) {
    console.warn('[AI Provider] API Key kosong. Mode Simulasi aktif.');
    await new Promise((r) => setTimeout(r, 600));
    return {
      teks: formatJson ? SIMULASI_SOAL_JSON : 'Halo! Saya RinaSensei (Mode Simulasi). Kunci API belum dikonfigurasi oleh Admin.',
      tokenDigunakan: 0,
    };
  }

  // 3. Routing provider — Prefix-First
  let targetUrl: string;
  const extraHeaders: Record<string, string> = {};
  // max_tokens: Omit/lower to prevent Groq 413 TPM limit (free tier limit is 8000)
  let maxTokens = 3000;

  if (apiKey.startsWith('gsk_') || providerRaw.includes('groq')) {
    targetUrl = 'https://api.groq.com/openai/v1/chat/completions';
    if (!modelTarget) modelTarget = 'qwen/qwen3.6-27b';
    maxTokens = 5500; // Safe sweet spot under 8000 TPM but long enough for Qwen reasoning
  } else if (apiKey.startsWith('sk-or-') || providerRaw.includes('openrouter')) {
    targetUrl = 'https://openrouter.ai/api/v1/chat/completions';
    if (!modelTarget || modelTarget.includes('gpt') || modelTarget.includes('gemini')) {
      modelTarget = 'meta-llama/llama-3.3-70b-instruct:free';
    }
    extraHeaders['HTTP-Referer'] = 'https://bimbel-app.vercel.app';
    extraHeaders['X-Title']      = 'Bimbel RinaSensei';
  } else if (apiKey.startsWith('AIzaSy') || providerRaw.includes('gemini')) {
    targetUrl = 'https://generativelanguage.googleapis.com/v1beta/openai/chat/completions';
    if (!modelTarget || modelTarget.includes('gpt') || modelTarget.includes('llama')) {
      modelTarget = 'gemini-1.5-flash';
    }
    maxTokens = 4096;
  } else if (apiKey.startsWith('sk-') || providerRaw.includes('openai')) {
    targetUrl = 'https://api.openai.com/v1/chat/completions';
    if (!modelTarget || modelTarget.includes('llama') || modelTarget.includes('gemini')) {
      modelTarget = 'gpt-4o-mini';
    }
    maxTokens = 4096;
  } else {
    console.warn('[AI Provider] Provider tidak dikenali. Fallback OpenAI.');
    targetUrl   = 'https://api.openai.com/v1/chat/completions';
    modelTarget = modelTarget || 'gpt-4o-mini';
  }

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${apiKey}`,
    ...extraHeaders,
  };

  console.log(`[AI Provider] → ${targetUrl} | Model: ${modelTarget} | JSON: ${formatJson} | maxTokens: ${maxTokens}`);

  // 4. Kirim request — Fail-Safe JSON
  try {
    let respon = await kirimRequest(targetUrl, headers, modelTarget, pesan, 0.7, formatJson, maxTokens);

    // Retry tanpa json_object jika HTTP 400
    if (!respon.ok && respon.status === 400 && formatJson) {
      console.warn('[AI Provider] HTTP 400 pada JSON mode. Retry tanpa response_format...');
      respon = await kirimRequest(targetUrl, headers, modelTarget, pesan, 0.7, false, maxTokens);
    }

    if (!respon.ok) {
      const errData    = (await respon.json().catch(() => ({}))) as any;
      const pesanError = errData?.error?.message ?? errData?.message ?? respon.statusText;
      console.error(`[AI Provider] Kesalahan HTTP ${respon.status}: ${pesanError}`);
      throw new Error(`Error ${respon.status}: ${pesanError}`);
    }

    const data               = (await respon.json()) as any;
    const teksMentah: string = data?.choices?.[0]?.message?.content ?? '';
    const tokenDigunakan: number = data?.usage?.total_tokens ?? 0;

    console.log(`[AI Provider] Raw (100 char): ${teksMentah.substring(0, 100).replace(/\n/g, ' ')}`);

    // Sanitasi CoT lalu bersihkan markdown JSON
    let teks = bersihkanResponMentahAI(teksMentah);
    if (formatJson) teks = bersihkanOutputJson(ekstrakJsonDariTeks(teks));

    console.log(`[AI Provider] Berhasil. Token: ${tokenDigunakan}`);
    return { teks, tokenDigunakan };

  } catch (error: any) {
    console.error('[AI Provider] Kesalahan:', error?.message ?? error);
    if (formatJson) return { teks: JSON.stringify({ daftarSoal: [] }), tokenDigunakan: 0 };
    return {
      teks: `Maaf, RinaSensei mengalami kendala teknis (${error?.message ?? 'Kesalahan tidak diketahui'}). Periksa konfigurasi API Key.`,
      tokenDigunakan: 0,
    };
  }
}
