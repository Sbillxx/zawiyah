'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Building2,
  KeyRound,
  UserCheck,
  MapPin,
  Phone,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Eye,
  EyeOff,
  ArrowLeft,
  Save,
  Database,
  Lock,
  Sparkles,
  Info
} from 'lucide-react';
import type { Zawiyah } from '@/lib/data/ssot';

interface Props {
  currentUser: any;
  activeZawiyah: Zawiyah | null;
  zawiyahList: Zawiyah[];
}

export default function AdminPengaturan({ currentUser, activeZawiyah: initialActiveZawiyah, zawiyahList }: Props) {
  const router = useRouter();
  const isZawiyahAdmin = currentUser?.role === 'ADMIN_ZAWIYAH';

  // 1. Profile State
  const [activeZawiyah, setActiveZawiyah] = useState<Zawiyah | null>(initialActiveZawiyah);
  const [profileForm, setProfileForm] = useState({
    nama: activeZawiyah?.nama || '',
    kota: activeZawiyah?.kota || '',
    ketua_zawiyah: activeZawiyah?.ketua_zawiyah || activeZawiyah?.pengurus || currentUser?.nama_lengkap || '',
    no_telp_ketua: activeZawiyah?.no_telp_ketua || '',
  });
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileSuccess, setProfileSuccess] = useState('');
  const [profileError, setProfileError] = useState('');

  // 2. Credentials State
  const [credsForm, setCredsForm] = useState({
    username: currentUser?.username || '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
    noTelp: activeZawiyah?.no_telp_ketua || '',
  });
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [credsLoading, setCredsLoading] = useState(false);
  const [credsSuccess, setCredsSuccess] = useState('');
  const [credsError, setCredsError] = useState('');
  const [isPasswordDefault, setIsPasswordDefault] = useState(currentUser?.is_password_default === 1);

  // Handle Save Profile & Contacts
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeZawiyah?.id) {
      setProfileError('ID Zawiyah tidak ditemukan untuk akun ini.');
      return;
    }

    setProfileLoading(true);
    setProfileError('');
    setProfileSuccess('');

    try {
      const res = await fetch('/api/zawiyah', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: activeZawiyah.id,
          nama: profileForm.nama.trim(),
          kota: profileForm.kota.trim(),
          ketua_zawiyah: profileForm.ketua_zawiyah.trim(),
          pengurus: profileForm.ketua_zawiyah.trim(),
          no_telp_ketua: profileForm.no_telp_ketua.trim(),
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Gagal memperbarui profil zawiyah.');
      }

      setProfileSuccess('Profil dan kontak cabang berhasil diperbarui di database!');
      setActiveZawiyah((prev: any) => ({
        ...prev,
        nama: profileForm.nama.trim(),
        kota: profileForm.kota.trim(),
        ketua_zawiyah: profileForm.ketua_zawiyah.trim(),
        pengurus: profileForm.ketua_zawiyah.trim(),
        no_telp_ketua: profileForm.no_telp_ketua.trim(),
      }));

      // Auto clear success notice
      setTimeout(() => setProfileSuccess(''), 4000);
    } catch (err: any) {
      setProfileError(err.message || 'Terjadi kesalahan sistem.');
    } finally {
      setProfileLoading(false);
    }
  };

  // Handle Save Credentials (Username & Password)
  const handleSaveCredentials = async (e: React.FormEvent) => {
    e.preventDefault();
    setCredsError('');
    setCredsSuccess('');

    if (!credsForm.currentPassword) {
      setCredsError('Kata sandi saat ini wajib diisi untuk verifikasi keamanan.');
      return;
    }

    if (credsForm.newPassword) {
      if (credsForm.newPassword.length < 6) {
        setCredsError('Kata sandi baru minimal harus 6 karakter.');
        return;
      }
      if (credsForm.newPassword !== credsForm.confirmPassword) {
        setCredsError('Konfirmasi kata sandi baru tidak cocok.');
        return;
      }
    }

    setCredsLoading(true);

    try {
      const res = await fetch('/api/auth/change-credentials', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentPassword: credsForm.currentPassword,
          newPassword: credsForm.newPassword || undefined,
          newUsername: credsForm.username !== currentUser?.username ? credsForm.username.toLowerCase() : undefined,
          newNoTelp: credsForm.noTelp || undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Gagal memperbarui kredensial akun.');
      }

      setCredsSuccess('Kredensial dan keamanan akun berhasil diperbarui!');
      setIsPasswordDefault(false);
      setCredsForm((prev) => ({
        ...prev,
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      }));

      // Auto clear success notice
      setTimeout(() => setCredsSuccess(''), 4000);
    } catch (err: any) {
      setCredsError(err.message || 'Terjadi kesalahan sistem.');
    } finally {
      setCredsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FBF9F5] dark:bg-[#131D12] text-[#243324] dark:text-[#F4EFE6] font-sans pb-28 md:pb-16 transition-colors duration-300">
      {/* Top Sticky Header */}
      <header className="sticky top-0 z-40 border-b border-[#243324]/10 dark:border-white/10 bg-[#FBF9F5]/90 dark:bg-[#131D12]/90 backdrop-blur-md">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            <Link
              href="/admin"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#243324]/6 dark:bg-white/8 hover:bg-[#243324]/12 dark:hover:bg-white/12 text-xs sm:text-sm font-medium text-[#4A5D44] dark:text-[#CBD7C7] hover:text-[#1F2B1D] dark:hover:text-white transition-all active:scale-95 cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4 shrink-0" />
              <span>Dashboard</span>
            </Link>
            <span className="text-[#243324]/20 dark:text-white/20 hidden sm:inline">/</span>
            <div className="truncate">
              <span className="font-display text-sm sm:text-base text-[#1F2B1D] dark:text-[#F4EFE6] font-medium">
                Pusat Pengaturan
              </span>
            </div>
          </div>

          {/* User Badge */}
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/80 dark:bg-[#1C291B] border border-[#243324]/10 dark:border-white/10 shadow-2xs text-xs">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="font-medium text-[#1F2B1D] dark:text-[#F4EFE6] truncate max-w-[140px] sm:max-w-[200px]">
              {currentUser?.nama_lengkap || 'Admin'}
            </span>
            <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-emerald-500/10 text-emerald-800 dark:text-emerald-300">
              {isZawiyahAdmin ? 'Ketua Zawiyah' : currentUser?.role}
            </span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Page Hero Title */}
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#1F2B1D]/6 dark:bg-white/10 text-xs font-semibold text-[#4A5D44] dark:text-[#CBD7C7] uppercase tracking-wider">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            <span>Manajemen Terpadu Akun & Cabang</span>
          </div>
          <h1 className="font-display text-2xl sm:text-4xl text-[#1F2B1D] dark:text-[#F4EFE6] font-normal tracking-tight">
            Pengaturan & Profil Cabang
          </h1>
          <p className="text-xs sm:text-sm text-[#657351] dark:text-[#A3B59E] max-w-2xl font-light leading-relaxed">
            Kelola identitas resmi zawiyah cabang, kontak pengurus yang tampil di peta nusantara, serta keamanan kata sandi akun login Anda secara tersentralisasi.
          </p>
        </div>

        {/* Security Alert if Password is Default */}
        {isPasswordDefault && (
          <div className="p-4 sm:p-5 rounded-2xl bg-amber-500/10 dark:bg-amber-500/15 border border-amber-500/30 text-amber-950 dark:text-amber-200 text-xs sm:text-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-sm">
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-700 dark:text-amber-300 flex items-center justify-center shrink-0 mt-0.5 sm:mt-0">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div className="space-y-0.5">
                <p className="font-semibold text-amber-900 dark:text-amber-100">
                  Akun Anda Masih Menggunakan Kata Sandi Default
                </p>
                <p className="text-xs text-amber-800/80 dark:text-amber-200/80 font-light leading-relaxed">
                  Demi keamanan data jamaah cabang, sangat disarankan segera mengganti kata sandi bawaan (<code className="px-1 py-0.5 bg-black/10 dark:bg-white/10 rounded font-mono">admin123</code>) pada formulir keamanan di bawah.
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
          {/* SECTION 1: PROFIL & KONTAK CABANG */}
          <div className="rounded-3xl bg-white/70 dark:bg-[#1A2619] border border-[#243324]/10 dark:border-white/10 p-6 sm:p-7 shadow-sm space-y-6">
            <div className="flex items-start justify-between border-b border-[#243324]/10 dark:border-white/10 pb-4">
              <div className="space-y-1">
                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-800 dark:text-emerald-300 text-xs font-semibold">
                  <Building2 className="w-3.5 h-3.5" />
                  <span>Profil & Kontak Cabang</span>
                </div>
                <h2 className="font-display text-lg sm:text-xl text-[#1F2B1D] dark:text-[#F4EFE6] font-medium">
                  Identitas Resmi Zawiyah
                </h2>
                <p className="text-xs text-[#657351] dark:text-[#A3B59E] font-light">
                  Data ini ditampilkan di direktori dan peta nusantara publik.
                </p>
              </div>

              {activeZawiyah?.id && (
                <span className="font-mono text-xs px-2.5 py-1 rounded-lg bg-[#243324]/6 dark:bg-white/10 text-[#243324] dark:text-white font-semibold">
                  {activeZawiyah.id}
                </span>
              )}
            </div>

            {/* Profile Feedback Notifications */}
            {profileError && (
              <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-700 dark:text-rose-300 text-xs flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>{profileError}</span>
              </div>
            )}
            {profileSuccess && (
              <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-800 dark:text-emerald-300 text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>{profileSuccess}</span>
              </div>
            )}

            <form onSubmit={handleSaveProfile} className="space-y-4 text-xs sm:text-sm">
              {/* Nama Cabang */}
              <div className="space-y-1.5">
                <label className="font-medium text-[#1F2B1D] dark:text-[#F4EFE6] flex items-center justify-between">
                  <span>Nama Cabang Zawiyah</span>
                  <span className="text-rose-500 text-xs">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={profileForm.nama}
                  onChange={(e) => setProfileForm({ ...profileForm, nama: e.target.value })}
                  placeholder="Contoh: Zawiyah Karawang"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#243324]/15 dark:border-white/15 bg-white/50 dark:bg-black/20 text-[#1F2B1D] dark:text-[#F4EFE6] focus:outline-none focus:border-[#1F2B1D] dark:focus:border-white/40 transition-colors"
                />
              </div>

              {/* Kota / Kabupaten */}
              <div className="space-y-1.5">
                <label className="font-medium text-[#1F2B1D] dark:text-[#F4EFE6] flex items-center justify-between">
                  <span>Kota / Kabupaten Wilayah</span>
                  <span className="text-rose-500 text-xs">*</span>
                </label>
                <div className="relative">
                  <MapPin className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#657351] dark:text-[#A3B59E]" />
                  <input
                    type="text"
                    required
                    value={profileForm.kota}
                    onChange={(e) => setProfileForm({ ...profileForm, kota: e.target.value })}
                    placeholder="Contoh: Karawang"
                    className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-[#243324]/15 dark:border-white/15 bg-white/50 dark:bg-black/20 text-[#1F2B1D] dark:text-[#F4EFE6] focus:outline-none focus:border-[#1F2B1D] dark:focus:border-white/40 transition-colors"
                  />
                </div>
              </div>

              {/* Nama Ketua / Pengurus */}
              <div className="space-y-1.5">
                <label className="font-medium text-[#1F2B1D] dark:text-[#F4EFE6] flex items-center justify-between">
                  <span>Nama Ketua / Penanggung Jawab Cabang</span>
                  <span className="text-rose-500 text-xs">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={profileForm.ketua_zawiyah}
                  onChange={(e) => setProfileForm({ ...profileForm, ketua_zawiyah: e.target.value })}
                  placeholder="Contoh: Ust. Abdul Muyhi"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#243324]/15 dark:border-white/15 bg-white/50 dark:bg-black/20 text-[#1F2B1D] dark:text-[#F4EFE6] focus:outline-none focus:border-[#1F2B1D] dark:focus:border-white/40 transition-colors"
                />
              </div>

              {/* Kontak WhatsApp Resmi */}
              <div className="space-y-1.5">
                <label className="font-medium text-[#1F2B1D] dark:text-[#F4EFE6]">
                  Nomor WhatsApp / Telp Resmi Cabang
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#657351] dark:text-[#A3B59E]" />
                  <input
                    type="tel"
                    value={profileForm.no_telp_ketua}
                    onChange={(e) => setProfileForm({ ...profileForm, no_telp_ketua: e.target.value })}
                    placeholder="Contoh: 081234567890"
                    className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-[#243324]/15 dark:border-white/15 bg-white/50 dark:bg-black/20 text-[#1F2B1D] dark:text-[#F4EFE6] focus:outline-none focus:border-[#1F2B1D] dark:focus:border-white/40 font-mono transition-colors"
                  />
                </div>
              </div>

              {/* Action Button */}
              <div className="pt-3 border-t border-[#243324]/10 dark:border-white/10 flex justify-end">
                <button
                  type="submit"
                  disabled={profileLoading}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#1F2B1D] dark:bg-[#85E7B7] text-[#F4EFE6] dark:text-[#131D12] text-xs font-semibold hover:opacity-90 active:scale-95 disabled:opacity-50 transition-all cursor-pointer shadow-sm"
                >
                  <Save className="w-4 h-4" />
                  <span>{profileLoading ? 'Menyimpan...' : 'Simpan Profil Cabang'}</span>
                </button>
              </div>
            </form>
          </div>

          {/* SECTION 2: KEAMANAN AKUN & KATA SANDI */}
          <div className="rounded-3xl bg-white/70 dark:bg-[#1A2619] border border-[#243324]/10 dark:border-white/10 p-6 sm:p-7 shadow-sm space-y-6">
            <div className="flex items-start justify-between border-b border-[#243324]/10 dark:border-white/10 pb-4">
              <div className="space-y-1">
                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-blue-500/10 text-blue-800 dark:text-blue-300 text-xs font-semibold">
                  <KeyRound className="w-3.5 h-3.5" />
                  <span>Keamanan Akun</span>
                </div>
                <h2 className="font-display text-lg sm:text-xl text-[#1F2B1D] dark:text-[#F4EFE6] font-medium">
                  Atur Akun & Kata Sandi
                </h2>
                <p className="text-xs text-[#657351] dark:text-[#A3B59E] font-light">
                  Ubah username akun atau perbarui kata sandi login Anda.
                </p>
              </div>

              <span className="font-mono text-xs px-2.5 py-1 rounded-lg bg-blue-500/10 text-blue-800 dark:text-blue-300 font-semibold">
                @{currentUser?.username}
              </span>
            </div>

            {/* Creds Feedback Notifications */}
            {credsError && (
              <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-700 dark:text-rose-300 text-xs flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>{credsError}</span>
              </div>
            )}
            {credsSuccess && (
              <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-800 dark:text-emerald-300 text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>{credsSuccess}</span>
              </div>
            )}

            <form onSubmit={handleSaveCredentials} className="space-y-4 text-xs sm:text-sm">
              {/* Username Login */}
              <div className="space-y-1.5">
                <label className="font-medium text-[#1F2B1D] dark:text-[#F4EFE6]">
                  Username Login
                </label>
                <input
                  type="text"
                  required
                  value={credsForm.username}
                  onChange={(e) => setCredsForm({ ...credsForm, username: e.target.value.toLowerCase().replace(/\s+/g, '_') })}
                  placeholder="Contoh: admin_karawang"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#243324]/15 dark:border-white/15 bg-white/50 dark:bg-black/20 text-[#1F2B1D] dark:text-[#F4EFE6] font-mono text-xs focus:outline-none focus:border-[#1F2B1D] dark:focus:border-white/40 transition-colors"
                />
              </div>

              {/* Verifikasi Kata Sandi Saat Ini */}
              <div className="space-y-1.5 pt-2 border-t border-[#243324]/10 dark:border-white/10">
                <label className="font-medium text-[#1F2B1D] dark:text-[#F4EFE6] flex items-center justify-between">
                  <span>Kata Sandi Saat Ini (Verifikasi)</span>
                  <span className="text-rose-500 text-xs">*</span>
                </label>
                <div className="relative">
                  <input
                    type={showOldPassword ? 'text' : 'password'}
                    required
                    value={credsForm.currentPassword}
                    onChange={(e) => setCredsForm({ ...credsForm, currentPassword: e.target.value })}
                    placeholder="Masukkan kata sandi saat ini"
                    className="w-full pl-3.5 pr-10 py-2.5 rounded-xl border border-[#243324]/15 dark:border-white/15 bg-white/50 dark:bg-black/20 text-[#1F2B1D] dark:text-[#F4EFE6] focus:outline-none focus:border-[#1F2B1D] dark:focus:border-white/40 transition-colors text-xs sm:text-sm"
                  />
                  <button
                    type="button"
                    onClick={() => setShowOldPassword(!showOldPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#657351] hover:text-[#1F2B1D] dark:hover:text-white p-1 cursor-pointer"
                  >
                    {showOldPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Kata Sandi Baru */}
              <div className="space-y-1.5">
                <label className="font-medium text-[#1F2B1D] dark:text-[#F4EFE6]">
                  Kata Sandi Baru (Opsional, min. 6 karakter)
                </label>
                <div className="relative">
                  <input
                    type={showNewPassword ? 'text' : 'password'}
                    value={credsForm.newPassword}
                    onChange={(e) => setCredsForm({ ...credsForm, newPassword: e.target.value })}
                    placeholder="Biarkan kosong jika tidak ingin mengganti"
                    className="w-full pl-3.5 pr-10 py-2.5 rounded-xl border border-[#243324]/15 dark:border-white/15 bg-white/50 dark:bg-black/20 text-[#1F2B1D] dark:text-[#F4EFE6] focus:outline-none focus:border-[#1F2B1D] dark:focus:border-white/40 transition-colors text-xs sm:text-sm"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#657351] hover:text-[#1F2B1D] dark:hover:text-white p-1 cursor-pointer"
                  >
                    {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Konfirmasi Kata Sandi Baru */}
              {credsForm.newPassword && (
                <div className="space-y-1.5 animate-in fade-in duration-200">
                  <label className="font-medium text-[#1F2B1D] dark:text-[#F4EFE6] flex items-center justify-between">
                    <span>Ulangi Kata Sandi Baru</span>
                    <span className="text-rose-500 text-xs">*</span>
                  </label>
                  <input
                    type="password"
                    required
                    value={credsForm.confirmPassword}
                    onChange={(e) => setCredsForm({ ...credsForm, confirmPassword: e.target.value })}
                    placeholder="Ketik ulang kata sandi baru"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#243324]/15 dark:border-white/15 bg-white/50 dark:bg-black/20 text-[#1F2B1D] dark:text-[#F4EFE6] focus:outline-none focus:border-[#1F2B1D] dark:focus:border-white/40 transition-colors text-xs sm:text-sm"
                  />
                </div>
              )}

              {/* Action Button */}
              <div className="pt-3 border-t border-[#243324]/10 dark:border-white/10 flex justify-end">
                <button
                  type="submit"
                  disabled={credsLoading}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#1F2B1D] dark:bg-[#85E7B7] text-[#F4EFE6] dark:text-[#131D12] text-xs font-semibold hover:opacity-90 active:scale-95 disabled:opacity-50 transition-all cursor-pointer shadow-sm"
                >
                  <Lock className="w-4 h-4" />
                  <span>{credsLoading ? 'Menyimpan...' : 'Perbarui Kredensial Akun'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Technical Session & Server Info Footer */}
        <div className="p-4 sm:p-5 rounded-2xl bg-[#243324]/4 dark:bg-white/5 border border-[#243324]/8 dark:border-white/10 text-xs text-[#657351] dark:text-[#A3B59E] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Database className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <span>Basis Data: <strong className="text-[#1F2B1D] dark:text-[#F4EFE6]">TiDB Cloud (AWS Singapore)</strong></span>
          </div>
          <div className="flex items-center gap-3">
            <span>Role: <strong className="text-[#1F2B1D] dark:text-[#F4EFE6]">{currentUser?.role || 'User'}</strong></span>
            <span>•</span>
            <span>ID Akun: <strong className="text-[#1F2B1D] dark:text-[#F4EFE6] font-mono">{currentUser?.id || '-'}</strong></span>
          </div>
        </div>
      </main>
    </div>
  );
}
