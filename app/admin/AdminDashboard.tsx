'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'motion/react';
import { AnimatedNumber } from '../components/AnimatedNumber';
import {
  Users,
  Building2,
  Heart,
  Wallet,
  ArrowRight,
  ArrowUpRight,
  LayoutDashboard,
  ShieldCheck,
  LogOut,
  UserCheck,
  RefreshCw,
  AlertTriangle,
  MapPin,
  Phone,
  UserPlus,
  Sparkles,
  CheckCircle2,
  KeyRound,
  Lock,
  Eye,
  EyeOff,
  X,
  Check,
} from 'lucide-react';
import type { Zawiyah } from '@/lib/data/ssot';

interface Stats {
  totalJamaah: number;
  totalZawiyah: number;
  totalAgniaCare: number;
  totalLaki: number;
  totalPerempuan: number;
  totalKoperasi: number;
  totalAktif: number;
  totalDonatur?: number;
  topZawiyah: Zawiyah[];
  topPekerjaan: { label: string; count: number }[];
  pctLaki: number;
  pctPerempuan: number;
  pctAgniaCare: string;
  pctKoperasi: string;
  currentZawiyah?: Zawiyah | null;
  isScopedZawiyah?: boolean;
}

interface Props {
  stats: Stats;
  zawiyahList: Zawiyah[];
  currentUser?: any;
  isOfflineMode?: boolean;
}

export default function AdminDashboard({
  stats,
  zawiyahList = [],
  currentUser: initialUser,
  isOfflineMode = false,
}: Props) {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<any>(initialUser || null);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  // Credentials change modal state for Ketua Zawiyah
  const [isCredsModalOpen, setIsCredsModalOpen] = useState(false);
  const [credsForm, setCredsForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
    newUsername: '',
    newNoTelp: '',
  });
  const [credsLoading, setCredsLoading] = useState(false);
  const [credsError, setCredsError] = useState('');
  const [credsSuccess, setCredsSuccess] = useState('');
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);

  // Check current session if not provided by SSR
  useEffect(() => {
    async function checkAuth() {
      try {
        const res = await fetch('/api/auth/me');
        const data = await res.json();
        if (data.success && data.user) {
          setCurrentUser(data.user);
        }
      } catch (err) {
        // Not authenticated
      }
    }
    if (!initialUser) {
      checkAuth();
    }
  }, [initialUser]);

  const isZawiyahAdmin =
    currentUser?.role === 'ADMIN_ZAWIYAH' || stats.isScopedZawiyah === true;

  // Active zawiyah state for Ketua Zawiyah
  const [activeZawiyah, setActiveZawiyah] = useState<Zawiyah | null>(
    stats.currentZawiyah ||
    zawiyahList.find((z) => z.id === currentUser?.zawiyah_id) ||
    (isZawiyahAdmin ? zawiyahList.find((z) => z.id === 'ZW-004') : null) ||
    null
  );

  useEffect(() => {
    if (stats.currentZawiyah) {
      setActiveZawiyah(stats.currentZawiyah);
    } else if (currentUser?.zawiyah_id) {
      const found = zawiyahList.find((z) => z.id === currentUser.zawiyah_id);
      if (found) setActiveZawiyah(found);
    }
  }, [stats.currentZawiyah, currentUser, zawiyahList]);

  // Branch profile edit modal state for Ketua Zawiyah
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [profileForm, setProfileForm] = useState({
    nama: '',
    kota: '',
    pengurus: '',
    ketua_zawiyah: '',
    no_telp_ketua: '',
  });
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileError, setProfileError] = useState('');
  const [profileSuccess, setProfileSuccess] = useState('');

  const handleOpenEditProfile = () => {
    const z = activeZawiyah;
    setProfileForm({
      nama: z?.nama || '',
      kota: z?.kota || '',
      pengurus: z?.pengurus || z?.ketua_zawiyah || '',
      ketua_zawiyah: z?.ketua_zawiyah || z?.pengurus || '',
      no_telp_ketua: z?.no_telp_ketua || '',
    });
    setProfileError('');
    setProfileSuccess('');
    setIsProfileModalOpen(true);
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeZawiyah) return;
    setProfileError('');
    setProfileSuccess('');

    if (!profileForm.nama.trim() || !profileForm.kota.trim()) {
      setProfileError('Nama cabang zawiyah dan kota wajib diisi.');
      return;
    }

    setProfileLoading(true);
    try {
      const res = await fetch('/api/zawiyah', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: activeZawiyah.id,
          nama: profileForm.nama.trim(),
          kota: profileForm.kota.trim(),
          pengurus: profileForm.pengurus.trim() || profileForm.ketua_zawiyah.trim(),
          ketua_zawiyah: profileForm.ketua_zawiyah.trim() || profileForm.pengurus.trim(),
          no_telp_ketua: profileForm.no_telp_ketua.trim(),
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Gagal memperbarui profil cabang.');
      }

      setActiveZawiyah((prev: any) => ({
        ...prev,
        nama: profileForm.nama.trim(),
        kota: profileForm.kota.trim(),
        pengurus: profileForm.pengurus.trim(),
        ketua_zawiyah: profileForm.ketua_zawiyah.trim(),
        no_telp_ketua: profileForm.no_telp_ketua.trim(),
      }));

      setProfileSuccess('Profil dan kontak cabang berhasil diperbarui!');
      setTimeout(() => {
        setIsProfileModalOpen(false);
        setProfileSuccess('');
      }, 1500);
    } catch (err: any) {
      setProfileError(err.message || 'Terjadi kesalahan sistem.');
    } finally {
      setProfileLoading(false);
    }
  };

  const handleSaveCredentials = async (e: React.FormEvent) => {
    e.preventDefault();
    setCredsError('');
    setCredsSuccess('');

    if (!credsForm.currentPassword) {
      setCredsError('Kata sandi saat ini wajib diisi.');
      return;
    }

    if (credsForm.newPassword) {
      if (credsForm.newPassword.length < 6) {
        setCredsError('Kata sandi baru minimal 6 karakter.');
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
          newUsername: credsForm.newUsername || undefined,
          newNoTelp: credsForm.newNoTelp || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Gagal memperbarui kredensial.');
      }

      setCredsSuccess('Kredensial akun berhasil diperbarui!');
      if (credsForm.newUsername) {
        setCurrentUser((prev: any) => ({
          ...prev,
          username: credsForm.newUsername.toLowerCase(),
          is_password_default: 0,
        }));
      }
      setTimeout(() => {
        setIsCredsModalOpen(false);
        setCredsSuccess('');
      }, 1500);
    } catch (err: any) {
      setCredsError(err.message || 'Terjadi kesalahan sistem.');
    } finally {
      setCredsLoading(false);
    }
  };

  const handleLogout = async () => {
    if (!confirm('Yakin ingin keluar / ganti akun?')) return;
    setIsLoggingOut(true);
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } catch (err) {
      // ignore
    } finally {
      setIsLoggingOut(false);
      router.push('/login');
      router.refresh();
    }
  };

  const navItems = isZawiyahAdmin
    ? [
        { id: 'overview', label: 'Ringkasan Cabang', icon: LayoutDashboard, href: '/admin' },
        {
          id: 'jamaah',
          label: `Data Jamaah (${stats.totalJamaah})`,
          icon: Users,
          href: '/admin/jamaah',
        },
      ]
    : [
        { id: 'overview', label: 'Overview', icon: LayoutDashboard, href: '/admin' },
        { id: 'jamaah', label: 'Data Jamaah', icon: Users, href: '/admin/jamaah' },
        {
          id: 'donatur',
          label: `Donatur Agnia (${stats.totalDonatur || 146})`,
          icon: Heart,
          href: '/admin/donatur',
        },
        { id: 'zawiyah', label: 'Cabang Zawiyah', icon: Building2, href: '/admin/zawiyah' },
      ];

  const pusatCount = zawiyahList.filter((z) => z.tipe === 'Pusat').length || 1;
  const utamaCount = zawiyahList.filter((z) => z.tipe === 'Utama').length || 1;
  const cabangCount =
    zawiyahList.filter((z) => z.tipe === 'Cabang').length ||
    Math.max(0, stats.totalZawiyah - pusatCount - utamaCount);

  return (
    <div className="min-h-screen bg-[#FBF9F5] dark:bg-[#131D12] font-sans">
      {/* Top Bar - Clean, uncrowded, responsive */}
      <header className="sticky top-0 z-40 border-b border-[#243324]/10 dark:border-white/10 bg-[#FBF9F5]/90 dark:bg-[#131D12]/90 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-3">
          {/* Brand & Desktop Navigation */}
          <div className="flex items-center gap-3 sm:gap-5">
            <Link href="/" className="flex items-center gap-2 group">
              <div className="w-8 h-8 rounded-xl bg-[#1F2B1D] dark:bg-[#344732] flex items-center justify-center shadow-xs">
                <span className="text-[#F4EFE6] text-xs font-bold font-display">Z</span>
              </div>
              <div>
                <p className="text-xs font-bold text-[#243324] dark:text-[#F4EFE6] leading-none">SAJADA</p>
                <p className="text-[10px] text-[#657351] dark:text-[#A3B59E] leading-none">
                  {isZawiyahAdmin ? 'Portal Ketua Zawiyah' : 'Portal Admin'}
                </p>
              </div>
            </Link>

            <div className="hidden md:block w-px h-6 bg-[#243324]/10 dark:border-white/10" />

            {/* Desktop Navigation Links */}
            <nav className="hidden md:flex items-center gap-1">
              {navItems.map((item) => {
                const isItemActive = item.id === 'overview';
                return (
                  <Link
                    key={item.id}
                    href={item.href}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                      isItemActive
                        ? 'bg-[#1F2B1D] text-[#F4EFE6] dark:bg-[#344732]'
                        : 'text-[#4A5D44] dark:text-[#A3B59E] hover:bg-[#243324]/8 dark:hover:bg-white/8 hover:text-[#243324] dark:hover:text-[#F4EFE6]'
                    }`}
                  >
                    <item.icon className="w-3.5 h-3.5" />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* Right Header Actions */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Current user badge on tablet / desktop */}
            {currentUser && (
              <div className="hidden sm:flex items-center gap-2 px-3 py-1 rounded-xl bg-white/70 dark:bg-white/5 border border-[#243324]/10 dark:border-white/10 text-xs">
                <UserCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                <span className="font-medium text-[#1F2B1D] dark:text-[#F4EFE6] max-w-[150px] truncate">
                  {currentUser.nama_lengkap}
                </span>
                <span className="px-1.5 py-0.5 rounded text-[10px] bg-emerald-500/10 text-emerald-800 dark:text-emerald-300 font-medium">
                  {currentUser.role === 'ADMIN_ZAWIYAH' ? 'Ketua Zawiyah' : currentUser.role}
                </span>
              </div>
            )}

            {/* Logout on Desktop */}
            <button
              type="button"
              onClick={handleLogout}
              disabled={isLoggingOut}
              className="hidden sm:flex items-center gap-1.5 text-xs text-[#657351] dark:text-[#A3B59E] hover:text-[#243324] dark:hover:text-[#F4EFE6] transition-colors px-2.5 py-1.5 rounded-lg hover:bg-[#243324]/5 dark:hover:bg-white/5 border border-transparent hover:border-[#243324]/10 cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>{isLoggingOut ? 'Keluar...' : 'Ganti Akun'}</span>
            </button>

            {/* Link to public front page */}
            <Link
              href="/"
              className="text-xs font-medium text-[#657351] dark:text-[#A3B59E] hover:text-[#243324] dark:hover:text-[#F4EFE6] transition-colors px-2.5 py-1.5 rounded-lg hover:bg-black/5 dark:hover:bg-white/5"
            >
              ← Beranda
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6 sm:space-y-8 pb-24 md:pb-12">
        {/* Offline Warning Banner */}
        {isOfflineMode && (
          <div className="p-4 sm:p-5 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-900 dark:text-amber-200 text-xs sm:text-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-sm backdrop-blur-sm">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-700 dark:text-amber-300 flex items-center justify-center flex-shrink-0">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <p className="font-semibold text-amber-950 dark:text-amber-100">
                  Mode Cadangan Aktif
                </p>
                <p className="text-amber-800/90 dark:text-amber-300/80 text-xs mt-0.5">
                  Server database utama tidak terjangkau. Menampilkan snapshot data cadangan.
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => router.push('/admin')}
              className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-medium text-xs transition-all shadow-sm active:scale-95 cursor-pointer flex-shrink-0 flex items-center gap-1.5"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Muat Ulang</span>
            </button>
          </div>
        )}

        {/* HERO / WELCOME BANNER FOR KETUA ZAWIYAH */}
        {isZawiyahAdmin ? (
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#1F2B1D] via-[#243324] to-[#344732] text-[#F4EFE6] p-6 sm:p-8 shadow-xl border border-white/10">
            <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none" />
            <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
              <div className="space-y-3 max-w-2xl">
                {/* Clean, mature header badge & ID chip (replaces cramped rounded bubble) */}
                <div className="flex flex-wrap items-center gap-2 sm:gap-2.5">
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#85E7B7]/15 text-[#85E7B7] text-xs font-semibold tracking-wider uppercase">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#85E7B7] animate-pulse" />
                    <span>Portal Mandiri Cabang</span>
                  </div>
                  <span className="text-white/30 hidden sm:inline">•</span>
                  <span className="font-mono text-xs px-2.5 py-1 rounded-lg bg-white/10 text-white/90 border border-white/15 font-semibold tracking-wide whitespace-nowrap">
                    Kode: {activeZawiyah?.id || currentUser?.zawiyah_id || 'ZW-004'}
                  </span>
                </div>

                <div>
                  <h1 className="font-display text-2xl sm:text-4xl text-[#F4EFE6] font-light tracking-tight leading-tight">
                    {activeZawiyah?.nama || 'Zawiyah Karawang'}
                  </h1>
                </div>

                <div className="flex flex-wrap items-center gap-y-1.5 gap-x-4 text-xs sm:text-sm text-[#CBD7C7] pt-0.5">
                  <span className="flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span>Kota {activeZawiyah?.kota || 'Karawang'}</span>
                  </span>
                  <span className="text-white/30">•</span>
                  <span>
                    Ketua: <strong className="text-white font-medium">{activeZawiyah?.ketua_zawiyah || activeZawiyah?.pengurus || currentUser?.nama_lengkap}</strong>
                  </span>
                  {activeZawiyah?.no_telp_ketua && (
                    <>
                      <span className="text-white/30">•</span>
                      <span className="flex items-center gap-1.5 font-mono text-xs">
                        <Phone className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                        <span>{activeZawiyah.no_telp_ketua}</span>
                      </span>
                    </>
                  )}
                </div>
              </div>

              {/* Action Buttons / Options for Ketua Zawiyah */}
              <div className="flex flex-wrap items-center gap-2.5 shrink-0 pt-2 lg:pt-0">
                <Link
                  href="/admin/jamaah"
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#85E7B7] hover:bg-[#9BF0C6] text-[#131D12] text-xs font-semibold shadow-md active:scale-95 transition-all cursor-pointer"
                >
                  <Users className="w-4 h-4" />
                  <span>Kelola {stats.totalJamaah} Jamaah Cabang</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>

                {/* Option 1: Profil & Kontak Cabang */}
                <button
                  type="button"
                  onClick={handleOpenEditProfile}
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-[#F4EFE6] border border-white/15 text-xs font-medium transition-all active:scale-95 cursor-pointer"
                  title="Kelola Profil & Kontak Resmi Cabang"
                >
                  <Building2 className="w-4 h-4 text-[#85E7B7]" />
                  <span>Profil & Kontak</span>
                </button>

                {/* Option 2: Atur Akun & Sandi */}
                <button
                  type="button"
                  onClick={() => {
                    setCredsForm({
                      currentPassword: '',
                      newPassword: '',
                      confirmPassword: '',
                      newUsername: currentUser?.username || '',
                      newNoTelp: activeZawiyah?.no_telp_ketua || '',
                    });
                    setCredsError('');
                    setCredsSuccess('');
                    setIsCredsModalOpen(true);
                  }}
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-[#F4EFE6] border border-white/15 text-xs font-medium transition-all active:scale-95 cursor-pointer"
                  title="Atur Username & Kata Sandi Akun"
                >
                  <KeyRound className="w-4 h-4 text-[#85E7B7]" />
                  <span>Atur Akun & Sandi</span>
                </button>
              </div>
            </div>
          </div>
        ) : (
          /* Standard Super Admin Page Title */
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2">
            <div>
              <h1 className="font-display text-2xl sm:text-4xl text-[#1F2B1D] dark:text-[#F4EFE6] font-light leading-tight">
                Overview Kejamaahan
              </h1>
              <p className="text-[#657351] dark:text-[#A3B59E] mt-1 text-xs sm:text-sm">
                Ringkasan data terpusat dari {stats.totalJamaah.toLocaleString('id-ID')} jamaah di {stats.totalZawiyah} cabang zawiyah.
              </p>
            </div>
          </div>
        )}

        {/* Default Password Security Warning */}
        {isZawiyahAdmin && currentUser?.is_password_default === 1 && (
          <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-950 dark:text-amber-200 text-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xs">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-700 dark:text-amber-300 flex items-center justify-center shrink-0">
                <KeyRound className="w-4 h-4" />
              </div>
              <div>
                <strong className="font-semibold text-amber-950 dark:text-amber-100">Kata Sandi Bawaan Masih Aktif</strong>
                <p className="text-[11px] text-amber-800 dark:text-amber-300 mt-0.5">
                  Akun Anda saat ini menggunakan kata sandi awal (default). Demi keamanan data cabang, silakan perbarui kata sandi Anda.
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => {
                setCredsForm({
                  currentPassword: '',
                  newPassword: '',
                  confirmPassword: '',
                  newUsername: currentUser?.username || '',
                  newNoTelp: activeZawiyah?.no_telp_ketua || '',
                });
                setCredsError('');
                setCredsSuccess('');
                setIsCredsModalOpen(true);
              }}
              className="px-3.5 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-semibold text-xs shrink-0 cursor-pointer shadow-xs transition-all"
            >
              Ubah Sandi Sekarang
            </button>
          </div>
        )}

        {/* Metric Cards - Minimalist, mature, editorial aesthetic with Framer Motion */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-5">
          {/* 1. Total Jamaah */}
          <motion.div
            whileHover={{ y: -3, transition: { duration: 0.25, ease: 'easeOut' } }}
            className="relative glass-panel rounded-2xl p-5 border border-[#243324]/8 dark:border-white/10 hover:border-[#243324]/20 dark:hover:border-white/25 transition-all duration-300 shadow-xs hover:shadow-md flex flex-col justify-between overflow-hidden group"
          >
            <div className="absolute top-0 left-0 right-0 h-[2px] bg-[#1F2B1D]/40 dark:bg-[#68DBA9]/40 group-hover:h-[3px] transition-all" />

            <div>
              <div className="flex items-center justify-between">
                <div className="w-9 h-9 rounded-xl bg-[#1F2B1D]/6 dark:bg-[#68DBA9]/10 text-[#1F2B1D] dark:text-[#68DBA9] flex items-center justify-center">
                  <Users className="w-4 h-4" />
                </div>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-800 dark:text-emerald-300 text-[10px] font-semibold tracking-wide">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  {isZawiyahAdmin ? 'Cabang Anda' : 'Terdata'}
                </span>
              </div>

              <div className="font-display text-3xl sm:text-4xl text-[#1F2B1D] dark:text-[#F4EFE6] font-light tracking-tight mt-3">
                <AnimatedNumber value={stats.totalJamaah} locale="id-ID" />
              </div>
              <p className="text-xs sm:text-sm font-medium text-[#243324] dark:text-[#E8F0E5] mt-1">
                {isZawiyahAdmin ? 'Jamaah Binaan Cabang' : 'Total Jamaah'}
              </p>
            </div>

            <div className="mt-4 pt-3 border-t border-[#243324]/6 dark:border-white/6 flex items-center justify-between">
              <span className="text-[11px] text-[#657351] dark:text-[#A3B59E]">
                {stats.pctLaki}% L · {stats.pctPerempuan}% P
              </span>
              <span className="text-[10px] font-medium text-emerald-700 dark:text-emerald-300">
                {stats.totalAktif} Aktif
              </span>
            </div>
          </motion.div>

          {/* 2. Cabang Zawiyah / Status Cabang */}
          <motion.div
            whileHover={{ y: -3, transition: { duration: 0.25, ease: 'easeOut' } }}
            className="relative glass-panel rounded-2xl p-5 border border-[#243324]/8 dark:border-white/10 hover:border-[#243324]/20 dark:hover:border-white/25 transition-all duration-300 shadow-xs hover:shadow-md flex flex-col justify-between overflow-hidden group"
          >
            <div className="absolute top-0 left-0 right-0 h-[2px] bg-[#3B4D36]/40 dark:bg-[#A3B59E]/40 group-hover:h-[3px] transition-all" />

            {isZawiyahAdmin ? (
              <>
                <div>
                  <div className="flex items-center justify-between">
                    <div className="w-9 h-9 rounded-xl bg-[#3B4D36]/8 dark:bg-[#A3B59E]/10 text-[#3B4D36] dark:text-[#CBD7C7] flex items-center justify-center">
                      <Building2 className="w-4 h-4" />
                    </div>
                    <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 text-[10px] font-semibold">
                      Terdaftar
                    </span>
                  </div>

                  <div className="font-display text-2xl sm:text-3xl text-[#1F2B1D] dark:text-[#F4EFE6] font-light tracking-tight mt-3 truncate">
                    {activeZawiyah?.kota || 'Karawang'}
                  </div>
                  <p className="text-xs sm:text-sm font-medium text-[#243324] dark:text-[#E8F0E5] mt-1">
                    Wilayah Cabang
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-[#243324]/6 dark:border-white/6 flex items-center justify-between text-[11px] text-[#657351] dark:text-[#A3B59E]">
                  <span>Status: Aktif</span>
                  <Link
                    href="/admin/zawiyah"
                    className="inline-flex items-center gap-0.5 text-emerald-700 dark:text-emerald-300 hover:underline"
                  >
                    Profil Cabang →
                  </Link>
                </div>
              </>
            ) : (
              <>
                <div>
                  <div className="flex items-center justify-between">
                    <div className="w-9 h-9 rounded-xl bg-[#3B4D36]/8 dark:bg-[#A3B59E]/10 text-[#3B4D36] dark:text-[#CBD7C7] flex items-center justify-center">
                      <Building2 className="w-4 h-4" />
                    </div>
                    <Link
                      href="/admin/zawiyah"
                      className="inline-flex items-center gap-1 text-[11px] font-medium text-[#657351] dark:text-[#A3B59E] hover:text-[#1F2B1D] dark:hover:text-[#F4EFE6] transition-colors group/link"
                    >
                      <span>Cabang</span>
                      <ArrowUpRight className="w-3.5 h-3.5 group-hover/link:translate-x-0.5 group-hover/link:-translate-y-0.5 transition-transform" />
                    </Link>
                  </div>

                  <div className="font-display text-3xl sm:text-4xl text-[#1F2B1D] dark:text-[#F4EFE6] font-light tracking-tight mt-3">
                    <AnimatedNumber value={stats.totalZawiyah} locale="id-ID" />
                  </div>
                  <p className="text-xs sm:text-sm font-medium text-[#243324] dark:text-[#E8F0E5] mt-1">
                    Cabang Zawiyah
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-[#243324]/6 dark:border-white/6 space-y-1.5">
                  <div className="h-1.5 bg-[#243324]/6 dark:bg-white/6 rounded-full overflow-hidden flex gap-0.5">
                    <div
                      title="Zawiyah Pusat Tasikmalaya"
                      className="h-full bg-emerald-600 dark:bg-emerald-400 rounded-full"
                      style={{ width: `${Math.max(6, (pusatCount / stats.totalZawiyah) * 100)}%` }}
                    />
                    <div
                      title="Zawiyah Utama DKI Jakarta"
                      className="h-full bg-amber-500 dark:bg-amber-400 rounded-full"
                      style={{ width: `${Math.max(6, (utamaCount / stats.totalZawiyah) * 100)}%` }}
                    />
                    <div
                      title="Cabang Zawiyah"
                      className="h-full bg-[#C2B59B] dark:bg-[#4A5D44] rounded-full"
                      style={{ width: `${Math.max(40, (cabangCount / stats.totalZawiyah) * 100)}%` }}
                    />
                  </div>
                  <div className="flex justify-between items-center text-[11px] text-[#657351] dark:text-[#A3B59E]">
                    <span>{pusatCount} Pusat · {utamaCount} Utama Jakarta</span>
                    <span>{cabangCount} Cabang</span>
                  </div>
                </div>
              </>
            )}
          </motion.div>

          {/* 3. Peserta Agnia Care */}
          <motion.div
            whileHover={{ y: -3, transition: { duration: 0.25, ease: 'easeOut' } }}
            className="relative glass-panel rounded-2xl p-5 border border-[#243324]/8 dark:border-white/10 hover:border-rose-500/25 dark:hover:border-rose-500/30 transition-all duration-300 shadow-xs hover:shadow-md flex flex-col justify-between overflow-hidden group"
          >
            <div className="absolute top-0 left-0 right-0 h-[2px] bg-rose-500/50 dark:bg-rose-500/60 group-hover:h-[3px] transition-all" />

            <div>
              <div className="flex items-center justify-between">
                <div className="w-9 h-9 rounded-xl bg-rose-500/8 dark:bg-rose-500/15 text-rose-600 dark:text-rose-400 flex items-center justify-center">
                  <Heart className="w-4 h-4 fill-current" />
                </div>
                <span className="px-2 py-0.5 rounded-full bg-rose-500/10 text-rose-700 dark:text-rose-300 text-[10px] font-semibold tracking-wide">
                  Sosial
                </span>
              </div>

              <div className="font-display text-3xl sm:text-4xl text-[#1F2B1D] dark:text-[#F4EFE6] font-light tracking-tight mt-3">
                <AnimatedNumber value={stats.totalAgniaCare} locale="id-ID" />
              </div>
              <p className="text-xs sm:text-sm font-medium text-[#243324] dark:text-[#E8F0E5] mt-1">
                {isZawiyahAdmin ? 'Peserta Agnia Cabang' : 'Peserta Agnia Care'}
              </p>
            </div>

            <div className="mt-4 pt-3 border-t border-[#243324]/6 dark:border-white/6 flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-[#1F2B1D] dark:text-[#F4EFE6]">{stats.pctAgniaCare}% Jamaah</p>
                <p className="text-[11px] text-[#657351] dark:text-[#A3B59E]">Filantropi Agnia</p>
              </div>
              <div className="relative w-8 h-8 flex items-center justify-center">
                <Heart className="w-4 h-4 text-rose-500 fill-rose-500" />
              </div>
            </div>
          </motion.div>

          {/* 4. Anggota Koperasi */}
          <motion.div
            whileHover={{ y: -3, transition: { duration: 0.25, ease: 'easeOut' } }}
            className="relative glass-panel rounded-2xl p-5 border border-[#243324]/8 dark:border-white/10 hover:border-blue-500/25 dark:hover:border-blue-500/30 transition-all duration-300 shadow-xs hover:shadow-md flex flex-col justify-between overflow-hidden group"
          >
            <div className="absolute top-0 left-0 right-0 h-[2px] bg-blue-500/40 dark:bg-blue-400/50 group-hover:h-[3px] transition-all" />

            <div>
              <div className="flex items-center justify-between">
                <div className="w-9 h-9 rounded-xl bg-blue-500/8 dark:bg-blue-500/15 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                  <Wallet className="w-4 h-4" />
                </div>
                <span className="px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-700 dark:text-blue-300 text-[10px] font-semibold tracking-wide">
                  Ekonomi
                </span>
              </div>

              <div className="font-display text-3xl sm:text-4xl text-[#1F2B1D] dark:text-[#F4EFE6] font-light tracking-tight mt-3">
                <AnimatedNumber value={stats.totalKoperasi} locale="id-ID" />
              </div>
              <p className="text-xs sm:text-sm font-medium text-[#243324] dark:text-[#E8F0E5] mt-1">
                Anggota Koperasi
              </p>
            </div>

            <div className="mt-4 pt-3 border-t border-[#243324]/6 dark:border-white/6 space-y-1.5">
              <div className="flex justify-between items-center text-[11px]">
                <span className="text-[#657351] dark:text-[#A3B59E]">Rasio Penetrasi</span>
                <span className="font-semibold text-[#1F2B1D] dark:text-[#F4EFE6]">{stats.pctKoperasi}%</span>
              </div>
              <div className="h-1.5 bg-[#243324]/6 dark:bg-white/6 rounded-full overflow-hidden">
                <div
                  className="h-full bg-blue-500 dark:bg-blue-400 rounded-full"
                  style={{ width: `${Math.min(100, Math.max(6, parseFloat(stats.pctKoperasi) * 4))}%` }}
                />
              </div>
            </div>
          </motion.div>
        </div>

        {/* Gender Distribution + Profil Cabang / Top Zawiyah */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {/* Gender Card */}
          <div className="glass-panel rounded-2xl p-5 sm:p-6 space-y-5">
            <div>
              <h3 className="font-display text-lg sm:text-xl text-[#1F2B1D] dark:text-[#F4EFE6] font-light">
                {isZawiyahAdmin ? 'Demografi Gender Cabang' : 'Demografi Gender'}
              </h3>
              <p className="text-xs text-[#657351] dark:text-[#A3B59E] mt-0.5">
                {isZawiyahAdmin ? `Komposisi jamaah ${activeZawiyah?.nama || 'cabang'}` : 'Distribusi jenis kelamin jamaah nusantara'}
              </p>
            </div>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-1.5">
                  <span className="font-medium text-[#243324] dark:text-[#F4EFE6]">Laki-laki</span>
                  <span className="font-display text-lg text-[#1F2B1D] dark:text-[#F4EFE6]">{stats.pctLaki}%</span>
                </div>
                <div className="h-2.5 bg-[#243324]/10 dark:bg-white/10 rounded-full overflow-hidden">
                  <div className="h-full bg-[#1F2B1D] dark:bg-[#68DBA9] rounded-full" style={{ width: stats.pctLaki + '%' }} />
                </div>
                <p className="text-xs text-[#657351] dark:text-[#A3B59E] mt-1">{stats.totalLaki.toLocaleString('id-ID')} jiwa</p>
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1.5">
                  <span className="font-medium text-[#243324] dark:text-[#F4EFE6]">Perempuan</span>
                  <span className="font-display text-lg text-[#1F2B1D] dark:text-[#F4EFE6]">{stats.pctPerempuan}%</span>
                </div>
                <div className="h-2.5 bg-[#243324]/10 dark:bg-white/10 rounded-full overflow-hidden">
                  <div className="h-full bg-[#526848] dark:bg-[#A3B59E] rounded-full" style={{ width: stats.pctPerempuan + '%' }} />
                </div>
                <p className="text-xs text-[#657351] dark:text-[#A3B59E] mt-1">{stats.totalPerempuan.toLocaleString('id-ID')} jiwa</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3 pt-2 border-t border-[#243324]/10 dark:border-white/10">
              <div className="text-center">
                <p className="font-display text-xl sm:text-2xl text-[#1F2B1D] dark:text-[#F4EFE6]">{stats.pctAgniaCare}%</p>
                <p className="text-xs text-[#657351] dark:text-[#A3B59E]">Agnia Care</p>
              </div>
              <div className="text-center">
                <p className="font-display text-xl sm:text-2xl text-[#1F2B1D] dark:text-[#F4EFE6]">{stats.pctKoperasi}%</p>
                <p className="text-xs text-[#657351] dark:text-[#A3B59E]">Koperasi</p>
              </div>
            </div>
          </div>

          {/* Right Column: Profil & Akses Cabang (if Admin Zawiyah) OR Top 5 Zawiyah (if Super Admin) */}
          <div className="lg:col-span-2 glass-panel rounded-2xl p-5 sm:p-6 space-y-5">
            {isZawiyahAdmin ? (
              <>
                <div className="flex items-center justify-between border-b border-[#243324]/10 dark:border-white/10 pb-4">
                  <div>
                    <h3 className="font-display text-lg sm:text-xl text-[#1F2B1D] dark:text-[#F4EFE6] font-light">
                      Profil & Layanan Zawiyah
                    </h3>
                    <p className="text-xs text-[#657351] dark:text-[#A3B59E] mt-0.5">
                      Informasi resmi pengurus dan kontak zawiyah Anda
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={handleOpenEditProfile}
                    className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-[#1F2B1D]/5 dark:bg-white/10 hover:bg-[#1F2B1D]/10 text-xs font-medium text-[#1F2B1D] dark:text-[#F4EFE6] transition-colors cursor-pointer"
                  >
                    <Building2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                    <span>Kelola Profil & Kontak</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="p-4 rounded-xl border border-[#243324]/10 dark:border-white/10 bg-white/50 dark:bg-white/5 space-y-3">
                    <div>
                      <p className="text-[10px] text-[#657351] dark:text-[#A3B59E] uppercase tracking-wider font-semibold">
                        Ketua Zawiyah
                      </p>
                      <p className="text-sm font-semibold text-[#1F2B1D] dark:text-[#F4EFE6] mt-0.5">
                        {activeZawiyah?.ketua_zawiyah || activeZawiyah?.pengurus || currentUser?.nama_lengkap}
                      </p>
                    </div>
                    <div>
                      <p className="text-[10px] text-[#657351] dark:text-[#A3B59E] uppercase tracking-wider font-semibold">
                        Kontak WhatsApp / Telp
                      </p>
                      <p className="text-xs font-mono font-medium text-[#1F2B1D] dark:text-[#F4EFE6] mt-0.5">
                        {activeZawiyah?.no_telp_ketua || 'Belum diatur'}
                      </p>
                    </div>
                    <div>
                      <p className="text-[10px] text-[#657351] dark:text-[#A3B59E] uppercase tracking-wider font-semibold">
                        Kota / Kabupaten
                      </p>
                      <p className="text-xs text-[#1F2B1D] dark:text-[#F4EFE6] mt-0.5">
                        {activeZawiyah?.kota || 'Karawang'}
                      </p>
                    </div>
                  </div>

                  <div className="p-4 rounded-xl border border-emerald-500/20 bg-emerald-500/5 dark:bg-emerald-500/10 space-y-3 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center gap-1.5 text-emerald-800 dark:text-emerald-300 text-xs font-semibold">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                        <span>Kewenangan Pengurus Cabang</span>
                      </div>
                      <p className="text-xs text-[#243324] dark:text-[#CBD7C7] mt-1 leading-relaxed">
                        Anda memiliki hak akses penuh untuk mendaftarkan jamaah baru, memperbarui biodata, dan mengakomodir keaktifan majelis di {activeZawiyah?.nama || 'zawiyah ini'}.
                      </p>
                    </div>

                    <Link
                      href="/admin/jamaah"
                      className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#1F2B1D] dark:bg-[#85E7B7] text-[#F4EFE6] dark:text-[#131D12] text-xs font-semibold hover:opacity-90 transition-all shadow-xs"
                    >
                      <UserPlus className="w-4 h-4" />
                      <span>Buka Manajemen Jamaah Cabang</span>
                    </Link>
                  </div>
                </div>
              </>
            ) : (
              <>
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-display text-lg sm:text-xl text-[#1F2B1D] dark:text-[#F4EFE6] font-light">
                      Top 5 Cabang Zawiyah
                    </h3>
                    <p className="text-xs text-[#657351] dark:text-[#A3B59E] mt-0.5">
                      Berdasarkan jumlah jamaah terdaftar terbanyak
                    </p>
                  </div>
                  <Link
                    href="/admin/zawiyah"
                    className="flex items-center gap-1 text-xs font-medium text-[#4A5D44] dark:text-[#A3B59E] hover:text-[#1F2B1D] dark:hover:text-[#F4EFE6] transition-colors group"
                  >
                    Lihat semua <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                  </Link>
                </div>
                <div className="space-y-4">
                  {stats.topZawiyah.map((z, i) => {
                    const maxVal = stats.topZawiyah[0].jamaah || 1;
                    const pct = Math.round((z.jamaah / maxVal) * 100);
                    return (
                      <div key={z.id}>
                        <div className="flex items-center justify-between mb-1.5">
                          <div className="flex items-center gap-2.5">
                            <span className="w-6 h-6 rounded-lg bg-[#1F2B1D]/10 dark:bg-white/10 flex items-center justify-center text-xs font-bold text-[#1F2B1D] dark:text-[#F4EFE6]">
                              {i + 1}
                            </span>
                            <div>
                              <p className="text-sm font-medium text-[#243324] dark:text-[#F4EFE6] leading-tight line-clamp-1">
                                {z.nama}
                              </p>
                              <p className="text-[10px] text-[#657351] dark:text-[#A3B59E]">
                                {z.kota} · Ketua: {z.ketua_zawiyah || z.pengurus}
                              </p>
                            </div>
                          </div>
                          <span className="font-display text-xl text-[#1F2B1D] dark:text-[#F4EFE6] font-light">
                            {z.jamaah.toLocaleString('id-ID')}
                          </span>
                        </div>
                        <div className="h-1.5 bg-[#243324]/8 dark:bg-white/8 rounded-full overflow-hidden ml-8">
                          <div
                            className="h-full bg-gradient-to-r from-[#1F2B1D] to-[#4A5D44] dark:from-[#68DBA9] dark:to-[#A3B59E] rounded-full"
                            style={{ width: pct + '%' }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </>
            )}
          </div>
        </div>

        {/* Pekerjaan + Quick Links */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {/* Distribusi Profesi */}
          <div className="glass-panel rounded-2xl p-5 sm:p-6 space-y-5">
            <div>
              <h3 className="font-display text-lg sm:text-xl text-[#1F2B1D] dark:text-[#F4EFE6] font-light">
                Distribusi Profesi {isZawiyahAdmin ? 'Cabang' : ''}
              </h3>
              <p className="text-xs text-[#657351] dark:text-[#A3B59E] mt-0.5">
                Top pekerjaan jamaah {isZawiyahAdmin ? activeZawiyah?.nama : 'terbanyak'}
              </p>
            </div>
            <div className="space-y-3">
              {stats.topPekerjaan.length > 0 ? (
                stats.topPekerjaan.map((p, i) => {
                  const pct = Math.round((p.count / (stats.totalJamaah || 1)) * 100);
                  const colors = ['bg-[#1F2B1D]', 'bg-[#3B4D36]', 'bg-[#4A5D44]', 'bg-[#657351]', 'bg-[#8A9E80]', 'bg-[#A3B59E]'];
                  return (
                    <div key={p.label} className="flex items-center gap-3">
                      <div className={`w-2.5 h-2.5 rounded-full ${colors[i % colors.length]} flex-shrink-0`} />
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-baseline gap-2">
                          <p className="text-sm text-[#243324] dark:text-[#F4EFE6] truncate">{p.label}</p>
                          <div className="flex items-baseline gap-1.5 flex-shrink-0">
                            <span className="font-display text-base text-[#1F2B1D] dark:text-[#F4EFE6]">
                              {p.count.toLocaleString('id-ID')}
                            </span>
                            <span className="text-xs text-[#657351] dark:text-[#A3B59E]">({pct}%)</span>
                          </div>
                        </div>
                        <div className="h-1 bg-[#243324]/8 dark:bg-white/8 rounded-full mt-1 overflow-hidden">
                          <div className={`h-full ${colors[i % colors.length]} rounded-full`} style={{ width: pct + '%' }} />
                        </div>
                      </div>
                    </div>
                  );
                })
              ) : (
                <p className="text-xs text-[#657351] dark:text-[#A3B59E] py-4 text-center">
                  Belum ada data profesi jamaah tercatat di cabang ini.
                </p>
              )}
            </div>
          </div>

          {/* Akses Cepat */}
          <div className="space-y-4">
            <div className="glass-panel rounded-2xl p-5 sm:p-6 space-y-4">
              <h3 className="font-display text-lg sm:text-xl text-[#1F2B1D] dark:text-[#F4EFE6] font-light">
                {isZawiyahAdmin ? 'Menu Pengurus Cabang' : 'Akses Cepat Data Master'}
              </h3>
              <div className="space-y-3">
                {/* Data Master Jamaah / Jamaah Cabang */}
                <Link
                  href="/admin/jamaah"
                  className="flex items-center justify-between p-3.5 sm:p-4 rounded-xl border border-[#243324]/10 dark:border-white/10 hover:border-[#243324]/30 dark:hover:border-white/30 hover:bg-[#243324]/4 dark:hover:bg-white/4 transition-all group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-[#1F2B1D]/8 dark:bg-white/8 flex items-center justify-center">
                      <Users className="w-5 h-5 text-[#1F2B1D] dark:text-[#F4EFE6]" />
                    </div>
                    <div>
                      <p className="font-medium text-sm text-[#243324] dark:text-[#F4EFE6]">
                        {isZawiyahAdmin ? `Data Jamaah ${activeZawiyah?.nama || 'Cabang'}` : 'Data Master Jamaah'}
                      </p>
                      <p className="text-xs text-[#657351] dark:text-[#A3B59E]">
                        {stats.totalJamaah.toLocaleString('id-ID')} anggota binaan
                      </p>
                    </div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-[#657351] dark:text-[#A3B59E] group-hover:translate-x-1 transition-transform" />
                </Link>

                {/* Profil & Kontak Cabang (Modal untuk Ketua Zawiyah) ATAU Manajemen Cabang (Link untuk Super Admin) */}
                {isZawiyahAdmin ? (
                  <>
                    <button
                      type="button"
                      onClick={handleOpenEditProfile}
                      className="w-full flex items-center justify-between p-3.5 sm:p-4 rounded-xl border border-[#243324]/10 dark:border-white/10 hover:border-emerald-500/40 hover:bg-emerald-500/5 transition-all group cursor-pointer text-left"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-emerald-500/10 dark:bg-emerald-500/20 flex items-center justify-center shrink-0">
                          <Building2 className="w-5 h-5 text-emerald-700 dark:text-emerald-400" />
                        </div>
                        <div>
                          <p className="font-medium text-sm text-[#243324] dark:text-[#F4EFE6]">
                            Kelola Profil & Kontak Cabang
                          </p>
                          <p className="text-xs text-[#657351] dark:text-[#A3B59E]">
                            Ketua: {activeZawiyah?.ketua_zawiyah || activeZawiyah?.pengurus || currentUser?.nama_lengkap}
                          </p>
                        </div>
                      </div>
                      <ArrowRight className="w-4 h-4 text-[#657351] dark:text-[#A3B59E] group-hover:translate-x-1 transition-transform" />
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setCredsForm({
                          currentPassword: '',
                          newPassword: '',
                          confirmPassword: '',
                          newUsername: currentUser?.username || '',
                          newNoTelp: activeZawiyah?.no_telp_ketua || '',
                        });
                        setCredsError('');
                        setCredsSuccess('');
                        setIsCredsModalOpen(true);
                      }}
                      className="w-full flex items-center justify-between p-3.5 sm:p-4 rounded-xl border border-[#243324]/10 dark:border-white/10 hover:border-emerald-500/40 hover:bg-emerald-500/5 transition-all group cursor-pointer text-left"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-emerald-500/10 dark:bg-emerald-500/20 flex items-center justify-center shrink-0">
                          <KeyRound className="w-5 h-5 text-emerald-700 dark:text-emerald-400" />
                        </div>
                        <div>
                          <p className="font-medium text-sm text-[#243324] dark:text-[#F4EFE6]">
                            Atur Akun & Kata Sandi
                          </p>
                          <p className="text-xs text-[#657351] dark:text-[#A3B59E]">
                            Username: @{currentUser?.username || 'admin'}
                          </p>
                        </div>
                      </div>
                      <ArrowRight className="w-4 h-4 text-[#657351] dark:text-[#A3B59E] group-hover:translate-x-1 transition-transform" />
                    </button>
                  </>
                ) : (
                  <Link
                    href="/admin/zawiyah"
                    className="flex items-center justify-between p-3.5 sm:p-4 rounded-xl border border-[#243324]/10 dark:border-white/10 hover:border-[#243324]/30 dark:hover:border-white/30 hover:bg-[#243324]/4 dark:hover:bg-white/4 transition-all group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-emerald-500/10 dark:bg-emerald-500/20 flex items-center justify-center">
                        <Building2 className="w-5 h-5 text-emerald-700 dark:text-emerald-400" />
                      </div>
                      <div>
                        <p className="font-medium text-sm text-[#243324] dark:text-[#F4EFE6]">
                          Manajemen Cabang Zawiyah
                        </p>
                        <p className="text-xs text-[#657351] dark:text-[#A3B59E]">
                          {stats.totalZawiyah} cabang se-Indonesia
                        </p>
                      </div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-[#657351] dark:text-[#A3B59E] group-hover:translate-x-1 transition-transform" />
                  </Link>
                )}
              </div>
            </div>

            {/* System Info Box */}
            <div className="rounded-2xl bg-[#1F2B1D] dark:bg-[#1E2E1D] p-5 text-[#F4EFE6] space-y-2 border border-white/5">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-[#68DBA9]" />
                <span className="text-xs font-semibold text-[#68DBA9] uppercase tracking-wider">
                  {isZawiyahAdmin ? 'Akses Mandiri Cabang' : 'Sistem Administrasi Terpadu'}
                </span>
              </div>
              <p className="text-xs sm:text-sm text-[#F4EFE6]/80 leading-relaxed font-light">
                {isZawiyahAdmin
                  ? `Sistem SAJADA memberikan hak akses mandiri bagi Ketua Zawiyah untuk mengelola, menambah, dan memverifikasi jamaah di wilayah ${activeZawiyah?.kota || 'cabang'} secara langsung dan akurat.`
                  : 'Portal SAJADA mengintegrasikan pengelolaan data kejamaahan, jejaring 86 cabang zawiyah, dan program filantropi Agnia Care secara aman, transparan, dan terpusat.'}
              </p>
            </div>
          </div>
        </div>

      {/* MODAL: Kelola Profil & Kontak Cabang untuk Ketua Zawiyah */}
      {isProfileModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto"
          onClick={() => !profileLoading && setIsProfileModalOpen(false)}
        >
          <div
            className="glass-panel rounded-3xl p-6 sm:p-7 max-w-lg w-full space-y-5 shadow-2xl border border-white/20"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between border-b border-[#243324]/10 dark:border-white/10 pb-4">
              <div>
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-800 dark:text-emerald-300 text-xs font-medium mb-1">
                  <Building2 className="w-3.5 h-3.5" />
                  <span>Profil Cabang</span>
                </div>
                <h2 className="font-display text-xl text-[#1F2B1D] dark:text-[#F4EFE6] font-medium">
                  Kelola Profil & Kontak Cabang
                </h2>
                <p className="text-xs text-[#657351] dark:text-[#A3B59E] mt-0.5">
                  ID: <span className="font-mono font-semibold text-[#1F2B1D] dark:text-[#F4EFE6]">{activeZawiyah?.id}</span>
                </p>
              </div>
              <button
                disabled={profileLoading}
                onClick={() => setIsProfileModalOpen(false)}
                className="p-1.5 rounded-xl hover:bg-[#243324]/8 dark:hover:bg-white/8 transition-colors disabled:opacity-50 cursor-pointer"
              >
                <X className="w-4 h-4 text-[#657351] dark:text-[#A3B59E]" />
              </button>
            </div>

            {profileError && (
              <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/50 flex items-center gap-2 text-rose-700 dark:text-rose-300 text-xs">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>{profileError}</span>
              </div>
            )}

            {profileSuccess && (
              <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/50 flex items-center gap-2 text-emerald-700 dark:text-emerald-300 text-xs">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>{profileSuccess}</span>
              </div>
            )}

            <form onSubmit={handleSaveProfile} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="font-semibold text-[#1F2B1D] dark:text-[#F4EFE6]">
                  Nama Cabang Zawiyah <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={profileForm.nama}
                  onChange={(e) => setProfileForm({ ...profileForm, nama: e.target.value })}
                  placeholder="Contoh: Zawiyah Karawang"
                  className="w-full px-3 py-2 border border-[#243324]/15 dark:border-white/15 rounded-xl bg-transparent text-[#1F2B1D] dark:text-[#F4EFE6] focus:outline-none focus:border-[#1F2B1D] dark:focus:border-white/40"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-semibold text-[#1F2B1D] dark:text-[#F4EFE6]">
                    Kota / Kabupaten <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={profileForm.kota}
                    onChange={(e) => setProfileForm({ ...profileForm, kota: e.target.value })}
                    placeholder="Contoh: Karawang"
                    className="w-full px-3 py-2 border border-[#243324]/15 dark:border-white/15 rounded-xl bg-transparent text-[#1F2B1D] dark:text-[#F4EFE6] focus:outline-none focus:border-[#1F2B1D] dark:focus:border-white/40"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-[#1F2B1D] dark:text-[#F4EFE6]">
                    Nomor WhatsApp / Telp Cabang
                  </label>
                  <input
                    type="tel"
                    value={profileForm.no_telp_ketua}
                    onChange={(e) => setProfileForm({ ...profileForm, no_telp_ketua: e.target.value })}
                    placeholder="Contoh: 081512349876"
                    className="w-full px-3 py-2 border border-[#243324]/15 dark:border-white/15 rounded-xl bg-transparent text-[#1F2B1D] dark:text-[#F4EFE6] focus:outline-none focus:border-[#1F2B1D] dark:focus:border-white/40 font-mono"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-[#1F2B1D] dark:text-[#F4EFE6]">
                  Nama Ketua / Penanggung Jawab Cabang
                </label>
                <input
                  type="text"
                  value={profileForm.ketua_zawiyah}
                  onChange={(e) => setProfileForm({
                    ...profileForm,
                    ketua_zawiyah: e.target.value,
                    pengurus: e.target.value,
                  })}
                  placeholder="Contoh: Ust. Asep Saepudin, S.Pd.I."
                  className="w-full px-3 py-2 border border-[#243324]/15 dark:border-white/15 rounded-xl bg-transparent text-[#1F2B1D] dark:text-[#F4EFE6] focus:outline-none focus:border-[#1F2B1D] dark:focus:border-white/40"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-4 border-t border-[#243324]/10 dark:border-white/10">
                <button
                  type="button"
                  disabled={profileLoading}
                  onClick={() => setIsProfileModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-[#243324]/15 dark:border-white/15 text-xs text-[#657351] dark:text-[#A3B59E] hover:bg-black/5 dark:hover:bg-white/5 transition-all cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={profileLoading}
                  className="flex items-center gap-2 px-5 py-2 bg-[#1F2B1D] dark:bg-[#85E7B7] text-[#F4EFE6] dark:text-[#131D12] text-xs font-semibold rounded-xl hover:opacity-90 active:scale-95 transition-all disabled:opacity-50 cursor-pointer shadow-xs"
                >
                  {profileLoading ? 'Menyimpan...' : 'Simpan Profil & Kontak'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: Pengaturan Akun & Kata Sandi Ketua Zawiyah */}
      {isCredsModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto"
          onClick={() => !credsLoading && setIsCredsModalOpen(false)}
        >
          <div
            className="glass-panel rounded-3xl p-6 sm:p-7 max-w-md w-full space-y-5 shadow-2xl border border-white/20"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between border-b border-[#243324]/10 dark:border-white/10 pb-4">
              <div>
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-800 dark:text-emerald-300 text-xs font-medium mb-1">
                  <KeyRound className="w-3.5 h-3.5" />
                  <span>Keamanan Akun</span>
                </div>
                <h2 className="font-display text-xl text-[#1F2B1D] dark:text-[#F4EFE6] font-medium">
                  Pengaturan Akun & Sandi
                </h2>
                <p className="text-xs text-[#657351] dark:text-[#A3B59E] mt-0.5">
                  Kelola kredensial login dan kontak resmi Ketua Zawiyah.
                </p>
              </div>
              <button
                disabled={credsLoading}
                onClick={() => setIsCredsModalOpen(false)}
                className="p-1.5 rounded-xl hover:bg-[#243324]/8 dark:hover:bg-white/8 transition-colors disabled:opacity-50 cursor-pointer"
              >
                <X className="w-4 h-4 text-[#657351] dark:text-[#A3B59E]" />
              </button>
            </div>

            {credsError && (
              <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/50 flex items-center gap-2 text-rose-700 dark:text-rose-300 text-xs">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>{credsError}</span>
              </div>
            )}

            {credsSuccess && (
              <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/50 flex items-center gap-2 text-emerald-700 dark:text-emerald-300 text-xs">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>{credsSuccess}</span>
              </div>
            )}

            <form onSubmit={handleSaveCredentials} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="font-semibold text-[#1F2B1D] dark:text-[#F4EFE6]">
                  Username Login
                </label>
                <input
                  type="text"
                  value={credsForm.newUsername}
                  onChange={(e) => setCredsForm({ ...credsForm, newUsername: e.target.value })}
                  placeholder="Contoh: asep.radiana"
                  className="w-full px-3 py-2 border border-[#243324]/15 dark:border-white/15 rounded-xl bg-transparent text-[#1F2B1D] dark:text-[#F4EFE6] focus:outline-none focus:border-[#1F2B1D] dark:focus:border-white/40 font-mono text-xs"
                />
                <p className="text-[10px] text-[#657351] dark:text-[#A3B59E]">
                  Gunakan huruf kecil tanpa spasi.
                </p>
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-[#1F2B1D] dark:text-[#F4EFE6]">
                  Nomor WhatsApp Ketua
                </label>
                <input
                  type="tel"
                  value={credsForm.newNoTelp}
                  onChange={(e) => setCredsForm({ ...credsForm, newNoTelp: e.target.value })}
                  placeholder="Contoh: 08123456789"
                  className="w-full px-3 py-2 border border-[#243324]/15 dark:border-white/15 rounded-xl bg-transparent text-[#1F2B1D] dark:text-[#F4EFE6] focus:outline-none focus:border-[#1F2B1D] dark:focus:border-white/40 font-mono text-xs"
                />
              </div>

              <div className="pt-2 border-t border-[#243324]/10 dark:border-white/10 space-y-3">
                <div className="space-y-1">
                  <label className="font-semibold text-[#1F2B1D] dark:text-[#F4EFE6]">
                    Kata Sandi Saat Ini <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type={showOldPassword ? 'text' : 'password'}
                      required
                      value={credsForm.currentPassword}
                      onChange={(e) => setCredsForm({ ...credsForm, currentPassword: e.target.value })}
                      placeholder="Masukkan kata sandi saat ini"
                      className="w-full pl-3 pr-9 py-2 border border-[#243324]/15 dark:border-white/15 rounded-xl bg-transparent text-[#1F2B1D] dark:text-[#F4EFE6] focus:outline-none focus:border-[#1F2B1D] dark:focus:border-white/40 text-xs"
                    />
                    <button
                      type="button"
                      onClick={() => setShowOldPassword(!showOldPassword)}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#657351] dark:text-[#A3B59E] hover:text-[#1F2B1D] dark:hover:text-[#F4EFE6]"
                    >
                      {showOldPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                  <p className="text-[10px] text-[#657351] dark:text-[#A3B59E]">
                    Jika belum pernah diubah, sandi default adalah: <code className="font-mono bg-black/5 dark:bg-white/10 px-1 py-0.5 rounded">bismillah123</code>
                  </p>
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-[#1F2B1D] dark:text-[#F4EFE6]">
                    Kata Sandi Baru (Opsional)
                  </label>
                  <div className="relative">
                    <input
                      type={showNewPassword ? 'text' : 'password'}
                      value={credsForm.newPassword}
                      onChange={(e) => setCredsForm({ ...credsForm, newPassword: e.target.value })}
                      placeholder="Minimal 6 karakter (kosongkan jika tak ingin ganti)"
                      className="w-full pl-3 pr-9 py-2 border border-[#243324]/15 dark:border-white/15 rounded-xl bg-transparent text-[#1F2B1D] dark:text-[#F4EFE6] focus:outline-none focus:border-[#1F2B1D] dark:focus:border-white/40 text-xs"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#657351] dark:text-[#A3B59E] hover:text-[#1F2B1D] dark:hover:text-[#F4EFE6]"
                    >
                      {showNewPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>

                {credsForm.newPassword && (
                  <div className="space-y-1">
                    <label className="font-semibold text-[#1F2B1D] dark:text-[#F4EFE6]">
                      Konfirmasi Kata Sandi Baru
                    </label>
                    <input
                      type="password"
                      value={credsForm.confirmPassword}
                      onChange={(e) => setCredsForm({ ...credsForm, confirmPassword: e.target.value })}
                      placeholder="Ketik ulang kata sandi baru"
                      className="w-full px-3 py-2 border border-[#243324]/15 dark:border-white/15 rounded-xl bg-transparent text-[#1F2B1D] dark:text-[#F4EFE6] focus:outline-none focus:border-[#1F2B1D] dark:focus:border-white/40 text-xs"
                    />
                  </div>
                )}
              </div>

              <div className="flex items-center justify-end gap-2 pt-4 border-t border-[#243324]/10 dark:border-white/10">
                <button
                  type="button"
                  disabled={credsLoading}
                  onClick={() => setIsCredsModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-[#243324]/15 dark:border-white/15 text-xs text-[#657351] dark:text-[#A3B59E] hover:bg-black/5 dark:hover:bg-white/5 transition-all cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={credsLoading}
                  className="flex items-center gap-2 px-5 py-2 bg-[#1F2B1D] dark:bg-[#85E7B7] text-[#F4EFE6] dark:text-[#131D12] text-xs font-semibold rounded-xl hover:opacity-90 active:scale-95 transition-all disabled:opacity-50 cursor-pointer shadow-xs"
                >
                  {credsLoading ? 'Menyimpan...' : 'Simpan Kredensial'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      </main>
    </div>
  );
}
