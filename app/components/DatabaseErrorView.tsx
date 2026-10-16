'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'motion/react';
import {
  Database,
  RefreshCw,
  ExternalLink,
  AlertTriangle,
  CheckCircle2,
  ServerOff,
  Power,
  ChevronDown,
  ChevronUp,
  Eye,
  ArrowRight,
  Sun,
  Moon,
  HelpCircle,
  ShieldAlert
} from 'lucide-react';

interface Props {
  error?: Error | { message?: string; code?: string; details?: string } | string;
  reset?: () => void;
  returnUrl?: string;
  allowOfflineBypass?: boolean;
}

export default function DatabaseErrorView({
  error,
  reset,
  returnUrl = '/admin',
  allowOfflineBypass = true,
}: Props) {
  const router = useRouter();
  const [isRetrying, setIsRetrying] = useState(false);
  const [retryResult, setRetryResult] = useState<{ success: boolean; message: string } | null>(null);
  const [showTechnicalDetails, setShowTechnicalDetails] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);

  const errorMessage =
    typeof error === 'string'
      ? error
      : error?.message || 'Tidak dapat terhubung ke server MySQL di 127.0.0.1:3306.';

  // Theme toggle
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

  // Live connection test to backend
  const handleRetryConnection = async () => {
    setIsRetrying(true);
    setRetryResult(null);

    try {
      const startTime = Date.now();
      const res = await fetch('/api/db-test?t=' + Date.now());
      const data = await res.json();

      // Ensure minimal animation smooth feel
      const elapsed = Date.now() - startTime;
      if (elapsed < 600) {
        await new Promise((r) => setTimeout(r, 600 - elapsed));
      }

      if (data.mysql?.connected) {
        setRetryResult({
          success: true,
          message: 'Berhasil terhubung kembali ke MySQL! Memuat ulang sistem...',
        });
        setTimeout(() => {
          if (reset) {
            reset();
          } else {
            window.location.reload();
          }
        }, 1000);
      } else {
        setRetryResult({
          success: false,
          message: data.mysql?.error || 'Port 3306 belum merespons. Pastikan modul MySQL di XAMPP sudah di-Start.',
        });
      }
    } catch (err: any) {
      setRetryResult({
        success: false,
        message: 'Koneksi ke port 3306 masih ditolak (ECONNREFUSED). Silakan klik tombol Start pada MySQL di XAMPP.',
      });
    } finally {
      setIsRetrying(false);
    }
  };

  const handleOfflineMode = () => {
    // Add ?offline=true to bypass database error and view cached data
    const url = new URL(window.location.href);
    url.searchParams.set('offline', 'true');
    router.push(url.pathname + url.search);
  };

  return (
    <div className="relative min-h-screen bg-[#FBF9F5] dark:bg-[#131D12] text-[#243324] dark:text-[#F4EFE6] font-sans flex flex-col justify-between selection:bg-[#E8DCC4] dark:selection:bg-[#384F35] transition-colors duration-500 overflow-x-hidden">
      {/* Background ambient decorative glows */}
      <div className="pointer-events-none absolute -top-40 -left-40 w-96 h-96 rounded-full bg-red-500/10 dark:bg-red-500/15 blur-3xl" />
      <div className="pointer-events-none absolute top-1/2 -right-32 w-80 h-80 rounded-full bg-amber-500/10 dark:bg-amber-500/15 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-32 left-1/3 w-96 h-96 rounded-full bg-[#1F2B1D]/10 dark:bg-[#4A6D47]/10 blur-3xl" />

      {/* Top Header */}
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
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-500/10 dark:bg-red-500/20 border border-red-500/20 text-[11px] font-semibold text-red-700 dark:text-red-400">
            <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
            <span>Database Status: Offline</span>
          </div>

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

      {/* Main Content Area */}
      <main className="relative z-10 flex-1 flex items-center justify-center px-4 sm:px-6 py-8">
        <div className="w-full max-w-2xl space-y-6">
          {/* Main Error Glass Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.97, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.4, ease: 'easeOut' }}
            className="glass-panel rounded-3xl p-6 sm:p-10 shadow-2xl border border-red-500/20 dark:border-red-500/30 relative overflow-hidden bg-white/70 dark:bg-[#1A2619]/80 backdrop-blur-xl"
          >
            {/* Top red warning hairline */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-red-500/40 via-amber-500/60 to-red-500/40" />

            {/* Icon & Title Header */}
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5 text-center sm:text-left mb-6">
              <div className="relative">
                <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-br from-red-500/15 to-amber-500/15 border border-red-500/30 flex items-center justify-center text-red-600 dark:text-red-400 shadow-inner">
                  <Database className="w-8 h-8 sm:w-10 sm:h-10 animate-pulse" />
                </div>
                <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-red-500 text-white flex items-center justify-center border-2 border-[#FBF9F5] dark:border-[#131D12]">
                  <ServerOff className="w-3.5 h-3.5" />
                </div>
              </div>

              <div className="space-y-1.5 flex-1">
                <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-red-600 dark:text-red-400 uppercase tracking-wider">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  Koneksi Basis Data Terputus
                </div>
                <h1 className="font-display text-2xl sm:text-3xl text-[#1F2B1D] dark:text-[#F4EFE6] font-light tracking-tight">
                  Server MySQL Tidak Dapat Diakses
                </h1>
                <p className="text-xs sm:text-sm text-[#657351] dark:text-[#A3B59E] leading-relaxed">
                  Aplikasi tidak dapat menghubungi basis data MySQL <strong className="font-mono text-[#1F2B1D] dark:text-[#F4EFE6]">dashboard_zawiyah</strong> di <strong className="font-mono">127.0.0.1:3306</strong>.
                </p>
              </div>
            </div>

            {/* Dynamic Status / Feedback Notification */}
            <AnimatePresence mode="wait">
              {retryResult && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className={`mb-5 p-4 rounded-2xl border text-xs flex items-start gap-3 ${
                    retryResult.success
                      ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-800 dark:text-emerald-300'
                      : 'bg-red-500/10 border-red-500/30 text-red-700 dark:text-red-400'
                  }`}
                >
                  {retryResult.success ? (
                    <CheckCircle2 className="w-4 h-4 flex-shrink-0 text-emerald-600 mt-0.5" />
                  ) : (
                    <ShieldAlert className="w-4 h-4 flex-shrink-0 text-red-600 mt-0.5" />
                  )}
                  <div className="space-y-0.5">
                    <p className="font-semibold">
                      {retryResult.success ? 'Koneksi Pulih' : 'Koneksi Gagal'}
                    </p>
                    <p>{retryResult.message}</p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Troubleshooting Step-by-Step Card */}
            <div className="rounded-2xl bg-[#243324]/5 dark:bg-white/5 border border-[#243324]/10 dark:border-white/10 p-4 sm:p-5 space-y-3.5 mb-6">
              <h2 className="text-xs font-semibold uppercase tracking-wider text-[#4A5D44] dark:text-[#CBD7C7] flex items-center gap-1.5">
                <HelpCircle className="w-4 h-4 text-[#006948] dark:text-[#68DBA9]" />
                Langkah Cepat Mengaktifkan Kembali (XAMPP / MySQL)
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs">
                {/* Step 1 */}
                <div className="p-3 rounded-xl bg-white/60 dark:bg-black/20 border border-[#243324]/5 dark:border-white/5 space-y-1">
                  <div className="flex items-center gap-1.5 font-bold text-[#1F2B1D] dark:text-[#F4EFE6]">
                    <span className="w-5 h-5 rounded-full bg-[#1F2B1D] text-white flex items-center justify-center text-[10px]">
                      1
                    </span>
                    Buka XAMPP
                  </div>
                  <p className="text-[#657351] dark:text-[#A3B59E] text-[11px] leading-relaxed">
                    Buka aplikasi <strong>XAMPP Control Panel</strong> di komputer Anda.
                  </p>
                </div>

                {/* Step 2 */}
                <div className="p-3 rounded-xl bg-white/60 dark:bg-black/20 border border-[#243324]/5 dark:border-white/5 space-y-1">
                  <div className="flex items-center gap-1.5 font-bold text-[#1F2B1D] dark:text-[#F4EFE6]">
                    <span className="w-5 h-5 rounded-full bg-[#006948] text-white flex items-center justify-center text-[10px]">
                      2
                    </span>
                    Start MySQL
                  </div>
                  <p className="text-[#657351] dark:text-[#A3B59E] text-[11px] leading-relaxed">
                    Klik tombol <strong>Start</strong> di samping baris modul <strong>MySQL</strong>.
                  </p>
                </div>

                {/* Step 3 */}
                <div className="p-3 rounded-xl bg-white/60 dark:bg-black/20 border border-[#243324]/5 dark:border-white/5 space-y-1">
                  <div className="flex items-center gap-1.5 font-bold text-[#1F2B1D] dark:text-[#F4EFE6]">
                    <span className="w-5 h-5 rounded-full bg-[#8F6A38] text-white flex items-center justify-center text-[10px]">
                      3
                    </span>
                    Hubungkan Ulang
                  </div>
                  <p className="text-[#657351] dark:text-[#A3B59E] text-[11px] leading-relaxed">
                    Klik tombol <strong>Coba Hubungkan Ulang</strong> di bawah ini.
                  </p>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              {/* Primary Retry Button */}
              <button
                type="button"
                onClick={handleRetryConnection}
                disabled={isRetrying}
                className="flex-1 py-3 px-5 rounded-xl bg-[#1F2B1D] hover:bg-[#2A3C27] text-[#F4EFE6] font-medium text-xs sm:text-sm transition-all shadow-md active:scale-[0.98] disabled:opacity-60 flex items-center justify-center gap-2 cursor-pointer"
              >
                <RefreshCw className={`w-4 h-4 ${isRetrying ? 'animate-spin' : ''}`} />
                <span>{isRetrying ? 'Memeriksa Koneksi MySQL...' : 'Coba Hubungkan Ulang'}</span>
              </button>

              {/* phpMyAdmin Direct Link */}
              <a
                href="http://localhost/phpmyadmin/"
                target="_blank"
                rel="noopener noreferrer"
                className="py-3 px-4 rounded-xl border border-[#243324]/15 dark:border-white/15 bg-white/50 dark:bg-white/5 hover:bg-white dark:hover:bg-white/10 text-xs sm:text-sm font-medium text-[#243324] dark:text-[#F4EFE6] transition-colors flex items-center justify-center gap-1.5 cursor-pointer text-center"
              >
                <ExternalLink className="w-4 h-4 text-[#657351] dark:text-[#A3B59E]" />
                <span>Buka phpMyAdmin</span>
              </a>

              {/* Optional Offline Bypass Button */}
              {allowOfflineBypass && (
                <button
                  type="button"
                  onClick={handleOfflineMode}
                  className="py-3 px-4 rounded-xl border border-[#8F6A38]/30 bg-[#8F6A38]/10 hover:bg-[#8F6A38]/20 text-xs sm:text-sm font-medium text-[#7A5524] dark:text-[#E8DCC4] transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Eye className="w-4 h-4" />
                  <span>Mode Cadangan (Demo)</span>
                </button>
              )}
            </div>

            {/* Collapsible Technical Details */}
            <div className="mt-6 pt-4 border-t border-[#243324]/10 dark:border-white/10">
              <button
                type="button"
                onClick={() => setShowTechnicalDetails(!showTechnicalDetails)}
                className="w-full flex items-center justify-between text-left text-xs text-[#657351] dark:text-[#A3B59E] hover:text-[#1F2B1D] dark:hover:text-[#F4EFE6] transition-colors py-1 cursor-pointer"
              >
                <span className="font-mono text-[11px]">Detail Diagnosa Teknis</span>
                {showTechnicalDetails ? (
                  <ChevronUp className="w-3.5 h-3.5" />
                ) : (
                  <ChevronDown className="w-3.5 h-3.5" />
                )}
              </button>

              {showTechnicalDetails && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="mt-2.5 p-3 rounded-xl bg-black/5 dark:bg-black/30 font-mono text-[11px] text-[#4A5D44] dark:text-[#CBD7C7] space-y-1 overflow-x-auto border border-black/5"
                >
                  <p><span className="text-[#657351]">Target Host:</span> 127.0.0.1</p>
                  <p><span className="text-[#657351]">Target Port:</span> 3306 (MySQL)</p>
                  <p><span className="text-[#657351]">Database:</span> dashboard_zawiyah</p>
                  <p><span className="text-[#657351]">Pesan Kesalahan:</span> {errorMessage}</p>
                  <p><span className="text-[#657351]">Waktu Cek:</span> {new Date().toLocaleTimeString('id-ID')}</p>
                </motion.div>
              )}
            </div>
          </motion.div>

          {/* Bottom helpful links */}
          <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-[#657351] dark:text-[#A3B59E] px-2">
            <Link href="/login" className="hover:text-[#1F2B1D] dark:hover:text-[#F4EFE6] flex items-center gap-1 transition-colors">
              <span>Ke Halaman Login</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
            <p className="text-[11px] text-[#A3B59E] dark:text-[#657351]">
              Sistem Otomatis Deteksi Kegagalan Port 3306 · Zawiyah Idrisiyyah
            </p>
          </div>
        </div>
      </main>

      {/* Footer minimal info */}
      <footer className="relative z-20 w-full py-4 text-center text-[11px] text-[#657351] dark:text-[#A3B59E]/70">
        Status Server & Pemulihan Basis Data · Zawiyah Idrisiyyah
      </footer>
    </div>
  );
}
