'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  Building2,
  Users,
  Heart,
  LogOut,
  Settings,
  KeyRound,
  Eye,
  EyeOff,
  AlertTriangle,
  CheckCircle2,
  X,
} from 'lucide-react';

interface Props {
  initialUser?: any;
}

export function AdminBottomNav({ initialUser }: Props) {
  const pathname = usePathname();
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<any>(initialUser || null);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  // Settings / Atur Akun & Sandi Modal State
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [credsForm, setCredsForm] = useState({
    newUsername: '',
    newNoTelp: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [credsLoading, setCredsLoading] = useState(false);
  const [credsError, setCredsError] = useState('');
  const [credsSuccess, setCredsSuccess] = useState('');

  // Fetch session if not provided by SSR
  useEffect(() => {
    if (!initialUser) {
      fetch('/api/auth/me')
        .then((res) => res.json())
        .then((data) => {
          if (data.success && data.user) {
            setCurrentUser(data.user);
          }
        })
        .catch(() => {});
    }

    // Listen for custom trigger to open settings modal from other components
    const handleOpenSettingsEvent = (e: any) => {
      const details = e?.detail || {};
      setCredsForm((prev) => ({
        ...prev,
        newUsername: details.username || currentUser?.username || '',
        newNoTelp: details.noTelp || '',
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      }));
      setCredsError('');
      setCredsSuccess('');
      setIsSettingsOpen(true);
    };

    window.addEventListener('open-admin-settings', handleOpenSettingsEvent);
    return () => window.removeEventListener('open-admin-settings', handleOpenSettingsEvent);
  }, [initialUser, currentUser]);

  const isZawiyahAdmin = currentUser?.role === 'ADMIN_ZAWIYAH';

  const handleOpenSettingsModal = () => {
    setCredsForm({
      newUsername: currentUser?.username || '',
      newNoTelp: '',
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    });
    setCredsError('');
    setCredsSuccess('');
    setIsSettingsOpen(true);
  };

  const handleSaveCredentials = async (e: React.FormEvent) => {
    e.preventDefault();
    setCredsError('');
    setCredsSuccess('');

    if (!credsForm.currentPassword) {
      setCredsError('Verifikasi kata sandi saat ini wajib diisi.');
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

      setCredsSuccess('Kredensial dan akun berhasil diperbarui!');
      if (credsForm.newUsername) {
        setCurrentUser((prev: any) => ({
          ...prev,
          username: credsForm.newUsername.toLowerCase(),
        }));
      }
      setTimeout(() => {
        setIsSettingsOpen(false);
        setCredsSuccess('');
      }, 1500);
    } catch (err: any) {
      setCredsError(err.message || 'Terjadi kesalahan sistem.');
    } finally {
      setCredsLoading(false);
    }
  };

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } catch (err) {
      // ignore
    } finally {
      setIsLoggingOut(false);
      setShowLogoutConfirm(false);
      router.push('/login');
      router.refresh();
    }
  };

  // Nav items based on role
  // Ketua Zawiyah: Dashboard, Jamaah, Pengaturan (modal), Keluar
  // Super Admin: Dashboard, Zawiyah, Jamaah, Donatur, Keluar
  const navItems = isZawiyahAdmin
    ? [
        {
          id: 'dashboard',
          label: 'Dashboard',
          href: '/admin',
          icon: LayoutDashboard,
          isActive: pathname === '/admin',
        },
        {
          id: 'jamaah',
          label: 'Jamaah',
          href: '/admin/jamaah',
          icon: Users,
          isActive: pathname.startsWith('/admin/jamaah'),
        },
      ]
    : [
        {
          id: 'dashboard',
          label: 'Dashboard',
          href: '/admin',
          icon: LayoutDashboard,
          isActive: pathname === '/admin',
        },
        {
          id: 'zawiyah',
          label: 'Zawiyah',
          href: '/admin/zawiyah',
          icon: Building2,
          isActive: pathname.startsWith('/admin/zawiyah'),
        },
        {
          id: 'jamaah',
          label: 'Jamaah',
          href: '/admin/jamaah',
          icon: Users,
          isActive: pathname.startsWith('/admin/jamaah'),
        },
        {
          id: 'donatur',
          label: 'Donatur',
          href: '/admin/donatur',
          icon: Heart,
          isActive: pathname.startsWith('/admin/donatur'),
        },
      ];

  return (
    <>
      {/* Mobile Bottom Navigation Bar (Hidden on desktop md:) */}
      <div className="fixed bottom-0 left-0 right-0 z-40 md:hidden pointer-events-auto">
        <nav
          aria-label="Admin Mobile Navigation"
          className="bg-[#FBF9F5]/95 dark:bg-[#131D12]/95 backdrop-blur-xl border-t border-[#243324]/12 dark:border-white/12 shadow-[0_-4px_20px_rgba(0,0,0,0.06)] dark:shadow-[0_-4px_20px_rgba(0,0,0,0.3)] px-2 pt-2 pb-safe"
          style={{ paddingBottom: 'max(0.6rem, env(safe-area-inset-bottom))' }}
        >
          {/* Horizontally fluid container */}
          <div className="flex items-center justify-around gap-1 max-w-md mx-auto">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.id}
                  href={item.href}
                  className={`flex-1 min-w-[56px] flex flex-col items-center justify-center py-1.5 px-1 rounded-2xl transition-all duration-200 relative group cursor-pointer ${
                    item.isActive
                      ? 'text-[#1F2B1D] dark:text-[#68DBA9]'
                      : 'text-[#657351] dark:text-[#A3B59E] hover:text-[#1F2B1D] dark:hover:text-[#F4EFE6]'
                  }`}
                >
                  {/* Active Indicator Pill */}
                  {item.isActive && (
                    <span className="absolute -top-1 w-6 h-0.5 rounded-full bg-[#1F2B1D] dark:bg-[#68DBA9]" />
                  )}

                  <div
                    className={`w-10 h-7 flex items-center justify-center rounded-xl transition-all ${
                      item.isActive
                        ? 'bg-[#1F2B1D]/10 dark:bg-[#68DBA9]/20 scale-105'
                        : 'group-hover:bg-black/5 dark:group-hover:bg-white/5'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                  </div>

                  <span
                    className={`text-[10px] mt-0.5 tracking-tight transition-all ${
                      item.isActive ? 'font-bold' : 'font-medium'
                    }`}
                  >
                    {item.label}
                  </span>
                </Link>
              );
            })}

            {/* Menu Pengaturan / Atur Akun & Sandi untuk Ketua Zawiyah */}
            {isZawiyahAdmin && (
              <button
                type="button"
                onClick={handleOpenSettingsModal}
                aria-label="Atur Akun & Sandi"
                className={`flex-1 min-w-[56px] flex flex-col items-center justify-center py-1.5 px-1 rounded-2xl transition-all duration-200 cursor-pointer group ${
                  isSettingsOpen
                    ? 'text-emerald-700 dark:text-emerald-300'
                    : 'text-[#657351] dark:text-[#A3B59E] hover:text-emerald-700 dark:hover:text-emerald-300'
                }`}
              >
                <div
                  className={`w-10 h-7 flex items-center justify-center rounded-xl transition-all ${
                    isSettingsOpen
                      ? 'bg-emerald-500/20'
                      : 'group-hover:bg-emerald-500/10'
                  }`}
                >
                  <Settings className="w-4 h-4" />
                </div>
                <span className="text-[10px] mt-0.5 font-medium tracking-tight">
                  Pengaturan
                </span>
              </button>
            )}

            {/* Logout / Keluar button */}
            <button
              type="button"
              onClick={() => setShowLogoutConfirm(true)}
              aria-label="Ganti Akun atau Keluar"
              className="flex-1 min-w-[56px] flex flex-col items-center justify-center py-1.5 px-1 rounded-2xl text-[#657351] dark:text-[#A3B59E] hover:text-rose-600 dark:hover:text-rose-400 transition-all duration-200 cursor-pointer group"
            >
              <div className="w-10 h-7 flex items-center justify-center rounded-xl group-hover:bg-rose-500/10 transition-all">
                <LogOut className="w-4 h-4" />
              </div>
              <span className="text-[10px] mt-0.5 font-medium tracking-tight">
                Keluar
              </span>
            </button>
          </div>
        </nav>
      </div>

      {/* Confirmation Modal for Mobile Logout */}
      {showLogoutConfirm && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-sm rounded-3xl bg-[#FBF9F5] dark:bg-[#1E2E1D] p-5 shadow-2xl border border-[#243324]/12 dark:border-white/12 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-2xl bg-rose-500/10 flex items-center justify-center text-rose-600 dark:text-rose-400">
                  <LogOut className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-semibold text-sm text-[#1F2B1D] dark:text-[#F4EFE6]">
                    Ganti Akun / Keluar
                  </h4>
                  <p className="text-xs text-[#657351] dark:text-[#A3B59E]">
                    Akhiri sesi portal admin ini?
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowLogoutConfirm(false)}
                className="p-1 rounded-full text-[#657351] hover:text-[#1F2B1D] dark:hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-1">
              <button
                type="button"
                onClick={() => setShowLogoutConfirm(false)}
                className="py-2.5 px-4 rounded-xl border border-[#243324]/15 dark:border-white/15 text-xs font-semibold text-[#243324] dark:text-[#F4EFE6] hover:bg-black/5 dark:hover:bg-white/5 transition-colors cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleLogout}
                disabled={isLoggingOut}
                className="py-2.5 px-4 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold shadow-sm transition-all cursor-pointer flex items-center justify-center gap-1.5"
              >
                <span>{isLoggingOut ? 'Memproses...' : 'Ya, Keluar'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: Pengaturan Akun & Sandi Ketua Zawiyah */}
      {isSettingsOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto"
          onClick={() => !credsLoading && setIsSettingsOpen(false)}
        >
          <div
            className="rounded-3xl p-6 sm:p-7 max-w-md w-full space-y-5 shadow-2xl border border-[#243324]/15 dark:border-white/20 bg-[#FBF9F5] dark:bg-[#1E2E1D]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between border-b border-[#243324]/10 dark:border-white/10 pb-4">
              <div>
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-800 dark:text-emerald-300 text-xs font-medium mb-1">
                  <KeyRound className="w-3.5 h-3.5" />
                  <span>Keamanan Akun</span>
                </div>
                <h2 className="font-display text-xl text-[#1F2B1D] dark:text-[#F4EFE6] font-medium">
                  Atur Akun & Sandi
                </h2>
                <p className="text-xs text-[#657351] dark:text-[#A3B59E] mt-0.5">
                  Pengaturan akun login dan kontak WhatsApp Ketua Zawiyah.
                </p>
              </div>
              <button
                disabled={credsLoading}
                onClick={() => setIsSettingsOpen(false)}
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
              {/* Username Login */}
              <div className="space-y-1">
                <label className="font-semibold text-[#1F2B1D] dark:text-[#F4EFE6]">
                  Username Login (huruf kecil)
                </label>
                <input
                  type="text"
                  value={credsForm.newUsername}
                  onChange={(e) => setCredsForm({ ...credsForm, newUsername: e.target.value.toLowerCase() })}
                  placeholder="Contoh: asep.radiana"
                  className="w-full px-3 py-2 border border-[#243324]/15 dark:border-white/15 rounded-xl bg-transparent text-[#1F2B1D] dark:text-[#F4EFE6] focus:outline-none focus:border-[#1F2B1D] dark:focus:border-white/40 font-mono text-xs"
                />
              </div>

              {/* Nomor WhatsApp Ketua */}
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

              {/* Verifikasi Kata Sandi Saat Ini */}
              <div className="pt-2 border-t border-[#243324]/10 dark:border-white/10 space-y-3">
                <div className="space-y-1">
                  <label className="font-semibold text-[#1F2B1D] dark:text-[#F4EFE6]">
                    Verifikasi Kata Sandi Saat Ini <span className="text-rose-500">*</span>
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
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#657351] dark:text-[#A3B59E] hover:text-[#1F2B1D] dark:hover:text-[#F4EFE6] cursor-pointer"
                    >
                      {showOldPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                  <p className="text-[10px] text-[#657351] dark:text-[#A3B59E]">
                    Kata sandi bawaan default adalah: <code className="font-mono bg-black/5 dark:bg-white/10 px-1 py-0.5 rounded">bismillah123</code>
                  </p>
                </div>

                {/* Kata Sandi Baru */}
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
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#657351] dark:text-[#A3B59E] hover:text-[#1F2B1D] dark:hover:text-[#F4EFE6] cursor-pointer"
                    >
                      {showNewPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>

                {/* Konfirmasi Kata Sandi Baru */}
                {credsForm.newPassword && (
                  <div className="space-y-1">
                    <label className="font-semibold text-[#1F2B1D] dark:text-[#F4EFE6]">
                      Konfirmasi Kata Sandi Baru <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="password"
                      required
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
                  onClick={() => setIsSettingsOpen(false)}
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
    </>
  );
}
