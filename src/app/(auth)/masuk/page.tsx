'use client';

import React, { useState, Suspense } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Loader2, AlertCircle, Bot, ShieldCheck, Coins } from 'lucide-react';
import Link from 'next/link';

function MasukForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams?.get('callbackUrl') || '/';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const tanganiMasuk = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (!email || !password) {
      setError('Email dan kata sandi wajib diisi.');
      setLoading(false);
      return;
    }

    try {
      const hasil = await signIn('credentials', {
        redirect: false,
        email,
        password,
      });

      if (hasil?.error) {
        setError(hasil.error);
      } else {
        router.push(callbackUrl === '/' ? '/siswa' : callbackUrl);
        router.refresh();
      }
    } catch (err) {
      setError('Terjadi kesalahan jaringan. Silakan coba lagi.');
    } finally {
      setLoading(false);
    }
  };

  const tanganiGoogleLogin = () => {
    signIn('google', { callbackUrl: '/siswa' });
  };

  return (
    <div className="min-h-screen bg-slate-50 flex font-sans">
      {/* Kolom Kiri: Visual Showcase (Hanya Desktop) */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-indigo-50 via-white to-blue-50 border-r border-slate-200 p-12 flex-col justify-between relative overflow-hidden">
        {/* Dekorasi Latar */}
        <div className="absolute top-[-10%] right-[-10%] w-96 h-96 bg-indigo-200/40 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-[-10%] left-[-10%] w-80 h-80 bg-blue-200/40 rounded-full blur-3xl pointer-events-none"></div>
        
        <div className="relative z-10">
          <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">
            Bimbel<span className="text-indigo-600">Pro</span>
          </h1>
          <p className="mt-4 text-lg text-slate-600 max-w-md leading-relaxed">
            Platform edukasi cerdas masa depan yang dirancang khusus untuk mewujudkan potensi terbaikmu.
          </p>

          <div className="mt-12 space-y-6">
            <div className="flex items-start gap-4 p-4 rounded-2xl bg-white/80 backdrop-blur border border-indigo-100 shadow-sm transition hover:shadow-md">
              <div className="w-12 h-12 rounded-full bg-indigo-100 flex items-center justify-center shrink-0">
                <Bot className="text-indigo-600 w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-semibold text-slate-900">AI Tutor RinaSensei</h3>
                <p className="mt-1 text-sm text-slate-600 leading-relaxed">
                  Tutor pintar 24/7 yang siap bantu pecahkan soal sulit dan rekomendasikan materi.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4 p-4 rounded-2xl bg-white/80 backdrop-blur border border-blue-100 shadow-sm transition hover:shadow-md">
              <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center shrink-0">
                <ShieldCheck className="text-blue-600 w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-semibold text-slate-900">Simulasi CBT Anti-Curang</h3>
                <p className="mt-1 text-sm text-slate-600 leading-relaxed">
                  Ujian nasional & kompetensi berstandar ketat dengan analisis kelemahan topik.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4 p-4 rounded-2xl bg-white/80 backdrop-blur border border-amber-100 shadow-sm transition hover:shadow-md">
              <div className="w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center shrink-0">
                <Coins className="text-amber-600 w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-semibold text-slate-900">Ekosistem RinCoin</h3>
                <p className="mt-1 text-sm text-slate-600 leading-relaxed">
                  Akses materi dan simulasi ujian hemat tanpa komitmen langganan kaku.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="relative z-10 mt-12">
          <blockquote className="text-slate-600 italic border-l-4 border-indigo-400 pl-4">
            "Dipercaya oleh ribuan siswa untuk meraih kelulusan impian."
          </blockquote>
        </div>
      </div>

      {/* Kolom Kanan: Form Autentikasi */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12">
        <div className="w-full max-w-md">
          {/* Logo Mobile */}
          <div className="lg:hidden text-center mb-8">
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
              Bimbel<span className="text-indigo-600">Pro</span>
            </h1>
          </div>

          <div className="text-center mb-8">
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900">Selamat Datang Kembali!</h2>
            <p className="mt-2 text-sm text-slate-600">
              Silakan masuk untuk melanjutkan perjalanan belajarmu.
            </p>
          </div>

          <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-slate-200">
            <button
              onClick={tanganiGoogleLogin}
              className="w-full flex items-center justify-center gap-3 py-2.5 px-4 rounded-xl border border-slate-300 bg-white text-slate-700 font-medium hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-1 transition-all"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M22.56 12.25C22.56 11.47 22.49 10.72 22.36 10H12V14.26H17.92C17.66 15.63 16.88 16.81 15.69 17.6V20.35H19.26C21.36 18.42 22.56 15.6 22.56 12.25Z" fill="#4285F4"/>
                <path d="M12 23C14.97 23 17.46 22.02 19.26 20.35L15.69 17.6C14.71 18.26 13.46 18.66 12 18.66C9.18001 18.66 6.80001 16.75 5.96001 14.2H2.30001V17.03C4.10001 20.61 7.74 23 12 23Z" fill="#34A853"/>
                <path d="M5.96001 14.2C5.74001 13.54 5.61001 12.79 5.61001 12C5.61001 11.21 5.74001 10.46 5.96001 9.8V6.97H2.30001C1.56001 8.45 1.13001 10.16 1.13001 12C1.13001 13.84 1.56001 15.55 2.30001 17.03L5.96001 14.2Z" fill="#FBBC05"/>
                <path d="M12 5.34C13.62 5.34 15.07 5.9 16.21 6.99L19.34 3.86C17.46 2.11 14.97 1 12 1C7.74 1 4.10001 3.39 2.30001 6.97L5.96001 9.8C6.80001 7.25 9.18001 5.34 12 5.34Z" fill="#EA4335"/>
              </svg>
              Lanjutkan dengan Google
            </button>

            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-200"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-slate-500">atau masuk dengan email</span>
              </div>
            </div>

            <form className="space-y-5" onSubmit={tanganiMasuk}>
              {error && (
                <div className="bg-rose-50 border border-rose-200 rounded-lg p-4 flex items-start space-x-3 text-rose-700">
                  <AlertCircle size={20} className="shrink-0 mt-0.5" />
                  <span className="text-sm font-medium">{error}</span>
                </div>
              )}

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-1">
                  Alamat Email
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all"
                  placeholder="anda@email.com"
                />
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-slate-700 mb-1">
                  Kata Sandi
                </label>
                <div className="relative">
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="current-password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all pr-12"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 focus:outline-none"
                    aria-label={showPassword ? 'Sembunyikan sandi' : 'Tampilkan sandi'}
                  >
                    {showPassword ? (
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
                      </svg>
                    ) : (
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex justify-center py-2.5 px-4 rounded-xl text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-70 disabled:cursor-not-allowed shadow-sm transition-all"
                >
                  {loading ? (
                    <span className="flex items-center space-x-2">
                      <Loader2 size={18} className="animate-spin" />
                      <span>Memproses...</span>
                    </span>
                  ) : (
                    'Masuk ke Akun'
                  )}
                </button>
              </div>
            </form>
          </div>

          <p className="mt-8 text-center text-sm text-slate-600">
            Belum punya akun?{' '}
            <Link href="/daftar" className="font-semibold text-indigo-600 hover:text-indigo-500 transition-colors">
              Daftar Sekarang
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default function MasukPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-slate-50"><Loader2 className="animate-spin text-indigo-600" size={32} /></div>}>
      <MasukForm />
    </Suspense>
  );
}
