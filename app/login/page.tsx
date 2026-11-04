'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'motion/react';
import {
  User,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Building2,
  Users,
  Heart,
  ChevronRight,
  Sun,
  Moon,
  Sparkles,
  Database,
  AlertTriangle
} from 'lucide-react';

interface DbUser {
  id: number;
  username: string;
  nama_lengkap: string;
  email: string;
  role: string;
  status: string;
  zawiyah_id?: string | null;
  divisi_id?: string | null;
}

const DEFAULT_ACCOUNTS = [
  {
    role: 'Super Admin',
    user: 'superadmin',
    pass: 'admin123',
    nama: 'Super Admin Yayasan',
    desc: 'Akses penuh seluruh cabang & data',
    badgeBg: 'bg-[#1F2B1D]/10 dark:bg-white/10',
    badgeText: 'text-[#1F2B1D] dark:text-[#F4EFE6]',
    icon: ShieldCheck,
  },
  {
    role: 'Eksekutif',
    user: 'eksekutif',
    pass: 'admin123',
    nama: 'BPH / Pimpinan Yayasan',
    desc: 'Laporan eksekutif & agregasi',
    badgeBg: 'bg-[#4A5D44]/15 dark:bg-[#4A5D44]/40',
    badgeText: 'text-[#384A33] dark:text-[#CBD7C7]',
    icon: Building2,
  },
  {
    role: 'Admin Zawiyah',
    user: 'admin_karawang',
    pass: 'admin123',
    nama: 'Ketua Zawiyah Karawang',
    desc: 'Pengurus cabang regional',
    badgeBg: 'bg-[#8F6A38]/15 dark:bg-[#8F6A38]/40',
    badgeText: 'text-[#7A5524] dark:text-[#E8DCC4]',
    icon: Users,
  },
  {
    role: 'Admin Divisi',
    user: 'admin_agnia',
    pass: 'admin123',
    nama: 'Admin Agnia Care',
    desc: 'Divisi kepedulian Agnia Care',
    badgeBg: 'bg-rose-500/10 dark:bg-rose-500/20',
    badgeText: 'text-rose-700 dark:text-rose-300',
    icon: Heart,
  },
];

export default function LoginPage() {
  const router = useRouter();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successInfo, setSuccessInfo] = useState<string | null>(null);
  const [selectedDemo, setSelectedDemo] = useState<string | null>(null);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [dbUsers, setDbUsers] = useState<DbUser[]>([]);
  const [dbStatus, setDbStatus] = useState<'checking' | 'connected' | 'fallback'>('checking');

  // Fetch users from MySQL database on mount
  useEffect(() => {
    async function loadDbUsers() {
      try {
        const res = await fetch('/api/users');
        const json = await res.json();
        if (json.success && Array.isArray(json.users) && json.users.length > 0) {
          setDbUsers(json.users);
          setDbStatus('connected');
        } else {
          setDbStatus('fallback');
        }
      } catch (err) {
        console.warn('Cannot load users from DB, using fallback demo accounts:', err);
        setDbStatus('fallback');
      }
    }
    loadDbUsers();
  }, []);

  // Toggle dark class on root document
  const handleToggleTheme = () => {
    setIsDarkMode((prev) => {
      const next = !prev;
      if (next) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
      return next;
    });
  };

  const handleSelectAccount = (userAccount: { user: string; pass: string }) => {
    setUsername(userAccount.user);
    setPassword(userAccount.pass);
    setSelectedDemo(userAccount.user);
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!username.trim() || !password.trim()) {
      setError('Mohon masukkan username dan password.');
      return;
    }

    setIsLoading(true);

    try {
      // 1. Real POST request to backend MySQL authentication endpoint
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: username.trim(),
          password: password,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setIsLoading(false);
        setError(data.message || 'Kredensial tidak valid di database.');
        return;
      }

      // Successful login from database
      setSuccessInfo(`${data.user.nama_lengkap} (${data.user.role})`);
      setIsLoading(false);

      setTimeout(() => {
        router.push('/admin');
        router.refresh();
      }, 700);
    } catch (err: any) {
      setIsLoading(false);
      setError('Gagal menghubungkan ke server autentikasi: ' + err.message);
    }
  };

  // Format accounts list: merge DB users if available
  const accountsToDisplay = dbUsers.length > 0
    ? dbUsers.map((u) => {
        const roleClean = u.role.replace(/_/g, ' ');
        let icon = Users;
        let badgeBg = 'bg-[#4A5D44]/15 dark:bg-[#4A5D44]/40';
        let badgeText = 'text-[#384A33] dark:text-[#CBD7C7]';

        if (u.role === 'SUPER_ADMIN') {
          icon = ShieldCheck;
          badgeBg = 'bg-[#1F2B1D]/10 dark:bg-white/10';
          badgeText = 'text-[#1F2B1D] dark:text-[#F4EFE6]';
        } else if (u.role === 'ADMIN_EKSEKUTIF') {
          icon = Building2;
        } else if (u.role === 'ADMIN_DIVISI') {
          icon = Heart;
          badgeBg = 'bg-rose-500/10 dark:bg-rose-500/20';
          badgeText = 'text-rose-700 dark:text-rose-300';
        }

        return {
          role: roleClean,
          user: u.username,
          pass: 'admin123',
          nama: u.nama_lengkap,
          desc: u.email,
          badgeBg,
          badgeText,
          icon,
        };
      })
    : DEFAULT_ACCOUNTS;

  return (
    <div className="relative min-h-screen bg-[#FBF9F5] dark:bg-[#131D12] text-[#243324] dark:text-[#F4EFE6] font-sans flex flex-col justify-between selection:bg-[#E8DCC4] dark:selection:bg-[#384F35] selection:text-[#1F2B1D] dark:selection:text-[#F4EFE6] transition-colors duration-500 overflow-hidden">
      {/* Ambient background glows */}
      <div className="pointer-events-none absolute -top-40 -left-40 w-96 h-96 rounded-full bg-[#3B4D36]/10 dark:bg-[#4A6D47]/15 blur-3xl" />
      <div className="pointer-events-none absolute top-1/3 -right-32 w-80 h-80 rounded-full bg-[#E8DCC4]/40 dark:bg-[#203322]/30 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-32 left-1/4 w-96 h-96 rounded-full bg-[#657351]/10 dark:bg-[#1A2E1C]/25 blur-3xl" />

      {/* Header bar */}
      <header className="relative z-20 w-full max-w-6xl mx-auto px-6 py-6 flex items-center justify-between">
        <Link
          href="/"
          className="group flex items-center gap-2.5 text-xs sm:text-sm font-medium text-[#657351] dark:text-[#A3B59E] hover:text-[#1F2B1D] dark:hover:text-[#F4EFE6] transition-colors"
        >
          <span className="w-8 h-8 rounded-full border border-[#243324]/15 dark:border-white/15 flex items-center justify-center group-hover:-translate-x-0.5 transition-transform bg-[#FBF9F5]/80 dark:bg-[#131D12]/80 backdrop-blur-sm">
            ←
          </span>
          <span>Kembali ke Beranda</span>
        </Link>

        <div className="flex items-center gap-3">
          {/* Database connection badge */}
          {dbStatus === 'fallback' ? (
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 dark:bg-amber-500/20 border border-amber-500/30 text-[11px] font-semibold text-amber-700 dark:text-amber-400">
              <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
              <Database className="w-3.5 h-3.5" />
              <span>Sistem: Standby</span>
            </div>
          ) : (
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#e6f4ea] dark:bg-[#1F3D2A] border border-[#006948]/20 text-[11px] font-semibold text-[#006948] dark:text-[#68DBA9]">
              <span className="w-2 h-2 rounded-full bg-[#006948] dark:bg-[#68DBA9] animate-pulse" />
              <Database className="w-3.5 h-3.5" />
              <span>Sistem: Aktif</span>
            </div>
          )}

          <button
            type="button"
            onClick={handleToggleTheme}
            aria-label="Toggle theme"
            className="p-2 rounded-full border border-[#243324]/15 dark:border-white/15 bg-[#FBF9F5]/80 dark:bg-[#131D12]/80 hover:bg-[#243324]/5 dark:hover:bg-white/10 transition-colors text-[#243324] dark:text-[#F4EFE6] cursor-pointer"
          >
            {isDarkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>
        </div>
      </header>

      {/* Main Container */}
      <main className="relative z-10 flex-1 flex items-center justify-center px-4 sm:px-6 py-8">
        <div className="w-full max-w-[460px] space-y-6">
          {/* Main Glass Card */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, ease: 'easeOut' }}
            className="glass-panel rounded-3xl p-7 sm:p-9 shadow-2xl shadow-[#1F2B1D]/5 border border-[#243324]/10 dark:border-white/10 relative overflow-hidden"
          >
            {/* Top decorative subtle hairline glow */}
            <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#4A5D44]/40 dark:via-[#68DBA9]/40 to-transparent" />

            {/* Brand Monogram & Titles */}
            <div className="text-center space-y-3 mb-6">
              <div className="inline-flex items-center justify-center">
                <div className="w-12 h-12 rounded-2xl bg-[#1F2B1D] text-[#F4EFE6] flex items-center justify-center font-display text-2xl font-light shadow-md border border-[#1F2B1D]/20">
                  Z
                </div>
              </div>
              <div>
                <h1 className="font-display text-2xl sm:text-3xl text-[#1F2B1D] dark:text-[#F4EFE6] font-light tracking-tight leading-tight">
                  Portal Kejamaahan
                </h1>
                <p className="text-xs sm:text-sm text-[#657351] dark:text-[#A3B59E] mt-1.5 font-normal">
                  Masuk ke sistem administrasi dan monitoring terpadu
                </p>
              </div>
            </div>

            {/* Offline Database Warning Box */}
            {dbStatus === 'fallback' && (
              <div className="mb-5 p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/25 text-amber-800 dark:text-amber-200 text-xs flex items-start gap-2.5">
                <AlertTriangle className="w-4 h-4 flex-shrink-0 text-amber-600 dark:text-amber-400 mt-0.5" />
                <div className="space-y-0.5">
                  <p className="font-semibold text-amber-950 dark:text-amber-100">
                    Server Sedang Standby
                  </p>
                  <p className="text-[11px] text-amber-800/90 dark:text-amber-300/80 leading-relaxed">
                    Layanan data langsung belum tersambung. Anda tetap dapat masuk menggunakan pilihan akun di bawah.
                  </p>
                </div>
              </div>
            )}

            {/* Feedback Notifications */}
            <AnimatePresence mode="wait">
              {error && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mb-5 p-3.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-700 dark:text-red-400 text-xs flex items-center gap-2.5"
                >
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>{error}</span>
                </motion.div>
              )}

              {successInfo && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.96 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="mb-5 p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-800 dark:text-emerald-300 text-xs flex items-center gap-2.5"
                >
                  <CheckCircle2 className="w-4 h-4 flex-shrink-0 text-emerald-600 dark:text-emerald-400" />
                  <span>
                    Login diverifikasi di database: <strong>{successInfo}</strong>. Mengalihkan...
                  </span>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Login Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Username Input */}
              <div className="space-y-1.5">
                <label
                  htmlFor="login-username"
                  className="block text-[11px] font-semibold text-[#4A5D44] dark:text-[#CBD7C7] uppercase tracking-wider"
                >
                  Username / ID Akun
                </label>
                <div className="relative">
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#657351] dark:text-[#A3B59E]" />
                  <input
                    id="login-username"
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="misal: superadmin"
                    required
                    autoComplete="username"
                    disabled={isLoading || !!successInfo}
                    className="w-full pl-10 pr-4 py-2.5 sm:py-3 rounded-xl bg-white/50 dark:bg-black/20 border border-[#243324]/15 dark:border-white/15 text-sm text-[#243324] dark:text-[#F4EFE6] placeholder-[#A3B59E]/70 focus:outline-none focus:border-[#1F2B1D] dark:focus:border-[#68DBA9] focus:bg-white dark:focus:bg-[#1A2619] transition-all duration-200"
                  />
                </div>
              </div>

              {/* Password Input */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label
                    htmlFor="login-password"
                    className="block text-[11px] font-semibold text-[#4A5D44] dark:text-[#CBD7C7] uppercase tracking-wider"
                  >
                    Kata Sandi
                  </label>
                  <span className="text-[11px] text-[#657351] dark:text-[#A3B59E]">
                    Default: <span className="font-mono font-semibold">admin123</span>
                  </span>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#657351] dark:text-[#A3B59E]" />
                  <input
                    id="login-password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    autoComplete="current-password"
                    disabled={isLoading || !!successInfo}
                    className="w-full pl-10 pr-10 py-2.5 sm:py-3 rounded-xl bg-white/50 dark:bg-black/20 border border-[#243324]/15 dark:border-white/15 text-sm text-[#243324] dark:text-[#F4EFE6] placeholder-[#A3B59E]/70 focus:outline-none focus:border-[#1F2B1D] dark:focus:border-[#68DBA9] focus:bg-white dark:focus:bg-[#1A2619] transition-all duration-200"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label="Toggle password view"
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-[#657351] dark:text-[#A3B59E] hover:text-[#1F2B1D] dark:hover:text-[#F4EFE6] transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Remember checkbox */}
              <div className="flex items-center gap-2 pt-1">
                <input
                  id="remember-me"
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 rounded border-[#243324]/20 text-[#1F2B1D] focus:ring-[#1F2B1D] accent-[#1F2B1D] cursor-pointer"
                />
                <label
                  htmlFor="remember-me"
                  className="text-xs text-[#657351] dark:text-[#A3B59E] cursor-pointer select-none"
                >
                  Ingat sesi saya di peramban ini (24 jam)
                </label>
              </div>

              {/* Submit CTA */}
              <button
                type="submit"
                disabled={isLoading || !!successInfo}
                className="w-full mt-2 py-3.5 px-6 rounded-xl bg-[#1F2B1D] hover:bg-[#2A3C27] text-[#F4EFE6] font-medium text-sm transition-all duration-300 shadow-md hover:shadow-lg active:scale-[0.99] disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2 group cursor-pointer"
              >
                {isLoading ? (
                  <>
                    <svg
                      className="animate-spin h-4 w-4 text-[#F4EFE6]"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8v8H4z"
                      />
                    </svg>
                    <span>Memverifikasi Kredensial...</span>
                  </>
                ) : successInfo ? (
                  <>
                    <CheckCircle2 className="w-4 h-4 text-[#68DBA9]" />
                    <span>Membuka Dashboard...</span>
                  </>
                ) : (
                  <>
                    <span>Masuk ke Dashboard</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </button>
            </form>

            {/* Quick Demo Accounts Switcher from Database */}
            <div className="mt-6 pt-5 border-t border-[#243324]/10 dark:border-white/10 space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-semibold text-[#657351] dark:text-[#A3B59E] uppercase tracking-wider flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-[#657351] dark:text-[#A3B59E]" />
                  Pilih Akun Cepat ({accountsToDisplay.length})
                </span>
                <span className="text-[10px] text-[#A3B59E] dark:text-[#657351] italic">
                  Klik untuk autofill
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2">
                {accountsToDisplay.map((acc) => {
                  const isCurrent = selectedDemo === acc.user;
                  const Icon = acc.icon;
                  return (
                    <button
                      key={acc.user}
                      type="button"
                      onClick={() => handleSelectAccount(acc)}
                      className={`text-left p-2.5 rounded-xl border transition-all duration-200 cursor-pointer ${
                        isCurrent
                          ? 'border-[#1F2B1D] dark:border-white/30 bg-[#243324]/8 dark:bg-white/10 shadow-sm'
                          : 'border-[#243324]/10 dark:border-white/10 hover:border-[#243324]/25 dark:hover:border-white/20 hover:bg-[#243324]/4 dark:hover:bg-white/5'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span
                          className={`px-1.5 py-0.5 rounded-md text-[10px] font-semibold ${acc.badgeBg} ${acc.badgeText}`}
                        >
                          {acc.role}
                        </span>
                        <Icon className="w-3.5 h-3.5 text-[#657351] dark:text-[#A3B59E]" />
                      </div>
                      <p className="text-[11px] font-mono font-medium text-[#243324] dark:text-[#F4EFE6] truncate">
                        {acc.user}
                      </p>
                      <p className="text-[10px] text-[#657351] dark:text-[#A3B59E] truncate">
                        {acc.nama}
                      </p>
                    </button>
                  );
                })}
              </div>
            </div>
          </motion.div>

          {/* Direct bypass to dashboard */}
          <div className="text-center space-y-2">
            <Link
              href="/admin"
              className="inline-flex items-center gap-1.5 text-xs text-[#657351] dark:text-[#A3B59E] hover:text-[#1F2B1D] dark:hover:text-[#F4EFE6] transition-colors"
            >
              <span>Langsung masuk mode pratinjau (Guest)</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
            <p className="text-[11px] text-[#A3B59E] dark:text-[#657351]">
              © 2026 Yayasan Idrisiyyah · Hak Cipta Dilindungi
            </p>
          </div>
        </div>
      </main>

      {/* Footer minimal info */}
      <footer className="relative z-20 w-full py-4 text-center text-[11px] text-[#657351] dark:text-[#A3B59E]/70">
        Direktori Data Master & Cabang Zawiyah Seluruh Indonesia
      </footer>
    </div>
  );
}
