'use client';

import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { ambilProfilSaya, perbaruiProfilSaya, ubahKataSandiSaya } from '@/actions/profil-pengguna';
import { User, Lock, Mail, Phone, Loader2, Save, ShieldCheck } from 'lucide-react';

export default function HalamanProfilAdmin() {
  const { data: session, update } = useSession();
  const [loading, setLoading] = useState(true);
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [isSavingPassword, setIsSavingPassword] = useState(false);
  
  const [pesanProfil, setPesanProfil] = useState<{ tipe: 'sukses' | 'error', teks: string } | null>(null);
  const [pesanSandi, setPesanSandi] = useState<{ tipe: 'sukses' | 'error', teks: string } | null>(null);

  const [formDataProfil, setFormDataProfil] = useState({
    nama: '',
    email: '',
    noTelepon: '',
  });

  const [formDataSandi, setFormDataSandi] = useState({
    kataSandiLama: '',
    kataSandiBaru: '',
    konfirmasiKataSandi: '',
  });

  const [lihatSandiLama, setLihatSandiLama] = useState(false);
  const [lihatSandiBaru, setLihatSandiBaru] = useState(false);

  useEffect(() => {
    async function muatProfil() {
      const res = await ambilProfilSaya();
      if (res.sukses && res.data) {
        setFormDataProfil({
          nama: res.data.nama || '',
          email: res.data.email || '',
          noTelepon: res.data.noTelepon || '',
        });
      }
      setLoading(false);
    }
    muatProfil();
  }, []);

  const tanganiPerbaruiProfil = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingProfile(true);
    setPesanProfil(null);
    
    const res = await perbaruiProfilSaya(formDataProfil);
    if (res.sukses) {
      setPesanProfil({ tipe: 'sukses', teks: res.pesan });
      // Update sesi klien
      if (update) {
        await update({
          name: formDataProfil.nama,
          email: formDataProfil.email,
        });
      }
    } else {
      setPesanProfil({ tipe: 'error', teks: res.pesan });
    }
    
    setIsSavingProfile(false);
  };

  const tanganiUbahSandi = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingPassword(true);
    setPesanSandi(null);
    
    const res = await ubahKataSandiSaya(formDataSandi);
    if (res.sukses) {
      setPesanSandi({ tipe: 'sukses', teks: res.pesan });
      setFormDataSandi({
        kataSandiLama: '',
        kataSandiBaru: '',
        konfirmasiKataSandi: '',
      });
    } else {
      setPesanSandi({ tipe: 'error', teks: res.pesan });
    }
    
    setIsSavingPassword(false);
  };

  const ambilInisial = (nama: string) => {
    if (!nama) return 'AD';
    const parts = nama.split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return nama.substring(0, 2).toUpperCase();
  };
  
  const inisialPengguna = ambilInisial(formDataProfil.nama || session?.user?.name || '');
  const fotoProfil = session?.user?.image;

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <Loader2 className="w-10 h-10 text-indigo-600 animate-spin" />
        <p className="text-slate-500 font-medium">Memuat pengaturan profil...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Pengaturan Profil</h1>
        <p className="mt-2 text-slate-600">Kelola informasi pribadi dan pengaturan keamanan akun Admin Anda.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Kolom Kiri: Profil Pribadi */}
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex items-center gap-3 bg-slate-50/50">
              <div className="p-2 bg-indigo-100 text-indigo-600 rounded-lg">
                <User size={20} />
              </div>
              <h2 className="text-xl font-bold text-slate-800">Informasi Pribadi</h2>
            </div>
            
            <div className="p-6">
              {pesanProfil && (
                <div className={`p-4 mb-6 rounded-xl border flex items-start gap-3 ${pesanProfil.tipe === 'sukses' ? 'bg-emerald-50 border-emerald-200 text-emerald-800' : 'bg-rose-50 border-rose-200 text-rose-800'}`}>
                  <ShieldCheck className={`flex-shrink-0 mt-0.5 ${pesanProfil.tipe === 'sukses' ? 'text-emerald-500' : 'text-rose-500'}`} size={18} />
                  <p className="text-sm font-medium leading-relaxed">{pesanProfil.teks}</p>
                </div>
              )}

              <form onSubmit={tanganiPerbaruiProfil} className="space-y-5">
                <div className="flex items-center gap-6 mb-8">
                  {fotoProfil ? (
                    <img src={fotoProfil} alt="Avatar" className="w-20 h-20 rounded-full object-cover border-4 border-white shadow-sm flex-shrink-0" referrerPolicy="no-referrer" />
                  ) : (
                    <div className="w-20 h-20 rounded-full bg-indigo-100 border-4 border-white shadow-sm flex items-center justify-center text-3xl font-bold text-indigo-600 flex-shrink-0">
                      {inisialPengguna}
                    </div>
                  )}
                  <div>
                    <h3 className="font-semibold text-slate-900">Avatar Profil</h3>
                    <p className="text-sm text-slate-500 mt-1">
                      {fotoProfil ? "Menggunakan foto profil Google Anda." : "Avatar otomatis menggunakan inisial nama."}
                    </p>
                  </div>
                </div>

                <div className="space-y-2">
                  <label htmlFor="nama" className="text-sm font-semibold text-slate-700">Nama Lengkap</label>
                  <div className="relative">
                    <User className="absolute left-3 top-3 w-5 h-5 text-slate-400" />
                    <input 
                      type="text" 
                      id="nama" 
                      required
                      value={formDataProfil.nama}
                      onChange={(e) => setFormDataProfil({ ...formDataProfil, nama: e.target.value })}
                      className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-600 focus:border-indigo-600 transition-all text-sm font-medium text-slate-900" 
                      placeholder="Masukkan nama lengkap"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label htmlFor="email" className="text-sm font-semibold text-slate-700">Alamat Email</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 w-5 h-5 text-slate-400" />
                    <input 
                      type="email" 
                      id="email" 
                      required
                      value={formDataProfil.email}
                      onChange={(e) => setFormDataProfil({ ...formDataProfil, email: e.target.value })}
                      className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-600 focus:border-indigo-600 transition-all text-sm font-medium text-slate-900" 
                      placeholder="admin@bimbelpro.id"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label htmlFor="noTelepon" className="text-sm font-semibold text-slate-700">Nomor WhatsApp</label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-3 w-5 h-5 text-slate-400" />
                    <input 
                      type="tel" 
                      id="noTelepon" 
                      value={formDataProfil.noTelepon}
                      onChange={(e) => setFormDataProfil({ ...formDataProfil, noTelepon: e.target.value })}
                      className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-600 focus:border-indigo-600 transition-all text-sm font-medium text-slate-900" 
                      placeholder="Contoh: 628123456789"
                    />
                  </div>
                  <p className="text-xs text-slate-500 mt-1">Gunakan format 62 untuk notifikasi otomatis WhatsApp.</p>
                </div>

                <div className="pt-4 border-t border-slate-100 flex justify-end">
                  <button 
                    type="submit" 
                    disabled={isSavingProfile}
                    className="flex items-center justify-center gap-2 px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-xl transition-all shadow-sm disabled:opacity-70"
                  >
                    {isSavingProfile ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                    Simpan Perubahan
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>

        {/* Kolom Kanan: Keamanan */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex items-center gap-3 bg-slate-50/50">
              <div className="p-2 bg-rose-100 text-rose-600 rounded-lg">
                <Lock size={20} />
              </div>
              <h2 className="text-xl font-bold text-slate-800">Keamanan & Sandi</h2>
            </div>
            
            <div className="p-6">
              {pesanSandi && (
                <div className={`p-4 mb-6 rounded-xl border flex items-start gap-3 ${pesanSandi.tipe === 'sukses' ? 'bg-emerald-50 border-emerald-200 text-emerald-800' : 'bg-rose-50 border-rose-200 text-rose-800'}`}>
                  <ShieldCheck className={`flex-shrink-0 mt-0.5 ${pesanSandi.tipe === 'sukses' ? 'text-emerald-500' : 'text-rose-500'}`} size={18} />
                  <p className="text-sm font-medium leading-relaxed">{pesanSandi.teks}</p>
                </div>
              )}

              <form onSubmit={tanganiUbahSandi} className="space-y-4">
                <div className="space-y-2">
                  <label htmlFor="kataSandiLama" className="text-sm font-semibold text-slate-700">Kata Sandi Saat Ini</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 w-5 h-5 text-slate-400" />
                    <input 
                      type={lihatSandiLama ? "text" : "password"} 
                      id="kataSandiLama" 
                      required
                      value={formDataSandi.kataSandiLama}
                      onChange={(e) => setFormDataSandi({ ...formDataSandi, kataSandiLama: e.target.value })}
                      className="w-full pl-10 pr-12 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-600 focus:border-indigo-600 transition-all text-sm font-medium text-slate-900" 
                      placeholder="Masukkan kata sandi lama"
                    />
                    <button 
                      type="button" 
                      onClick={() => setLihatSandiLama(!lihatSandiLama)}
                      className="absolute right-3 top-3 text-xs font-semibold text-indigo-600 hover:text-indigo-800"
                    >
                      {lihatSandiLama ? 'SEMBUNYIKAN' : 'LIHAT'}
                    </button>
                  </div>
                </div>

                <div className="space-y-2 pt-2">
                  <label htmlFor="kataSandiBaru" className="text-sm font-semibold text-slate-700">Kata Sandi Baru</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 w-5 h-5 text-slate-400" />
                    <input 
                      type={lihatSandiBaru ? "text" : "password"} 
                      id="kataSandiBaru" 
                      required
                      minLength={8}
                      value={formDataSandi.kataSandiBaru}
                      onChange={(e) => setFormDataSandi({ ...formDataSandi, kataSandiBaru: e.target.value })}
                      className="w-full pl-10 pr-12 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-600 focus:border-indigo-600 transition-all text-sm font-medium text-slate-900" 
                      placeholder="Minimal 8 karakter"
                    />
                    <button 
                      type="button" 
                      onClick={() => setLihatSandiBaru(!lihatSandiBaru)}
                      className="absolute right-3 top-3 text-xs font-semibold text-indigo-600 hover:text-indigo-800"
                    >
                      {lihatSandiBaru ? 'SEMBUNYIKAN' : 'LIHAT'}
                    </button>
                  </div>
                </div>

                <div className="space-y-2">
                  <label htmlFor="konfirmasiKataSandi" className="text-sm font-semibold text-slate-700">Konfirmasi Kata Sandi Baru</label>
                  <div className="relative">
                    <ShieldCheck className="absolute left-3 top-3 w-5 h-5 text-slate-400" />
                    <input 
                      type={lihatSandiBaru ? "text" : "password"} 
                      id="konfirmasiKataSandi" 
                      required
                      minLength={8}
                      value={formDataSandi.konfirmasiKataSandi}
                      onChange={(e) => setFormDataSandi({ ...formDataSandi, konfirmasiKataSandi: e.target.value })}
                      className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-600 focus:border-indigo-600 transition-all text-sm font-medium text-slate-900" 
                      placeholder="Ulangi kata sandi baru"
                    />
                  </div>
                </div>

                <div className="pt-4 mt-4 border-t border-slate-100">
                  <button 
                    type="submit" 
                    disabled={isSavingPassword || formDataSandi.kataSandiBaru !== formDataSandi.konfirmasiKataSandi || formDataSandi.kataSandiBaru.length < 8}
                    className="w-full flex items-center justify-center gap-2 px-6 py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-sm font-semibold rounded-xl transition-all shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSavingPassword ? <Loader2 className="w-4 h-4 animate-spin" /> : <Lock className="w-4 h-4" />}
                    Perbarui Kata Sandi
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
