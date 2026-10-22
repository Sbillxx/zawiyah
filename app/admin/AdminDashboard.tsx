'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Users,
  Building2,
  Heart,
  Wallet,
  TrendingUp,
  ArrowRight,
  LayoutDashboard,
  Database,
  ShieldCheck,
  LogOut,
  UserCheck,
  KeyRound,
  CheckCircle2,
  Mail,
  UserPlus,
  RefreshCw,
  Plus,
  AlertTriangle
} from 'lucide-react';
import type { Zawiyah, UserAccount } from '@/lib/data/ssot';

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
}

interface Props {
  stats: Stats;
  zawiyahList: Zawiyah[];
  usersList?: UserAccount[];
  isOfflineMode?: boolean;
}

export default function AdminDashboard({ stats, usersList = [], isOfflineMode = false }: Props) {
  const router = useRouter();
  const [activeNav, setActiveNav] = useState('overview');
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [accounts, setAccounts] = useState<UserAccount[]>(usersList);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);

  // New user form state
  const [newUsername, setNewUsername] = useState('');
  const [newNama, setNewNama] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newPassword, setNewPassword] = useState('admin123');
  const [newRole, setNewRole] = useState('ADMIN_ZAWIYAH');
  const [formMsg, setFormMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Check current session
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
    checkAuth();
  }, []);

  // Fetch updated users list
  const refreshUsers = async () => {
    try {
      const res = await fetch('/api/users');
      const data = await res.json();
      if (data.success && data.users) {
        setAccounts(data.users);
      }
    } catch (err) {
      console.error('Failed refreshing users:', err);
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
      router.push('/login');
      router.refresh();
    }
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setFormMsg(null);

    try {
      const res = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: newUsername,
          nama_lengkap: newNama,
          email: newEmail,
          password: newPassword,
          role: newRole,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        setFormMsg({ type: 'error', text: data.message || 'Gagal menambahkan akun.' });
      } else {
        setFormMsg({ type: 'success', text: 'Akun berhasil ditambahkan ke database MySQL!' });
        setNewUsername('');
        setNewNama('');
        setNewEmail('');
        refreshUsers();
        setTimeout(() => setShowAddModal(false), 1200);
      }
    } catch (err: any) {
      setFormMsg({ type: 'error', text: 'Kesalahan server: ' + err.message });
    } finally {
      setIsSubmitting(false);
    }
  };

  const navItems = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'jamaah', label: 'Data Jamaah', icon: Users, href: '/admin/jamaah' },
    { id: 'donatur', label: 'Donatur Agnia (' + (stats.totalDonatur || 146) + ')', icon: Heart, href: '/admin/donatur' },
    { id: 'zawiyah', label: 'Cabang Zawiyah', icon: Building2, href: '/admin/zawiyah' },
    { id: 'users', label: 'Akun & Pengguna (' + accounts.length + ')', icon: ShieldCheck },
  ];

  const metricCards = [
    {
      label: 'Total Jamaah SSOT',
      value: stats.totalJamaah.toLocaleString('id-ID'),
      sub: 'Single Source of Truth MySQL',
      icon: Users,
      color: 'from-[#1F2B1D] to-[#3B4D36]',
      badge: 'LIVE',
    },
    {
      label: 'Cabang Zawiyah',
      value: stats.totalZawiyah.toString(),
      sub: 'Tersebar di seluruh Indonesia',
      icon: Building2,
      color: 'from-[#243324] to-[#4A5D44]',
      badge: null,
    },
    {
      label: 'Peserta Agnia Care',
      value: stats.totalAgniaCare.toLocaleString('id-ID'),
      sub: stats.pctAgniaCare + '% dari total jamaah',
      icon: Heart,
      color: 'from-[#3B2D1D] to-[#6B4D2A]',
      badge: null,
    },
    {
      label: 'Anggota Koperasi',
      value: stats.totalKoperasi.toLocaleString('id-ID'),
      sub: stats.pctKoperasi + '% dari total jamaah',
      icon: Wallet,
      color: 'from-[#1D2B3B] to-[#2A4D6B]',
      badge: null,
    },
  ];

  return (
    <div className="min-h-screen bg-[#FBF9F5] dark:bg-[#131D12] font-sans">
      {/* Top Bar */}
      <header className="sticky top-0 z-40 border-b border-[#243324]/10 dark:border-white/10 bg-[#FBF9F5]/90 dark:bg-[#131D12]/90 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-2 group">
              <div className="w-8 h-8 rounded-xl bg-[#1F2B1D] flex items-center justify-center">
                <span className="text-[#F4EFE6] text-xs font-bold">Z</span>
              </div>
              <div>
                <p className="text-xs font-semibold text-[#243324] dark:text-[#F4EFE6] leading-none">Zawiyah</p>
                <p className="text-[10px] text-[#657351] dark:text-[#A3B59E] leading-none">Admin Portal</p>
              </div>
            </Link>
            <div className="hidden sm:block w-px h-6 bg-[#243324]/10 dark:bg-white/10 mx-1" />
            <nav className="hidden sm:flex items-center gap-1">
              {navItems.map((item) => {
                const isItemActive = activeNav === item.id;
                if (item.href) {
                  return (
                    <Link
                      key={item.id}
                      href={item.href}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium text-[#4A5D44] dark:text-[#A3B59E] hover:bg-[#243324]/8 dark:hover:bg-white/8 hover:text-[#243324] dark:hover:text-[#F4EFE6] transition-all duration-200"
                    >
                      <item.icon className="w-3.5 h-3.5" />
                      {item.label}
                    </Link>
                  );
                }
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setActiveNav(item.id)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 cursor-pointer ${
                      isItemActive
                        ? 'bg-[#1F2B1D] text-[#F4EFE6]'
                        : 'text-[#4A5D44] dark:text-[#A3B59E] hover:bg-[#243324]/8 dark:hover:bg-white/8 hover:text-[#243324] dark:hover:text-[#F4EFE6]'
                    }`}
                  >
                    <item.icon className="w-3.5 h-3.5" />
                    {item.label}
                  </button>
                );
              })}
            </nav>
          </div>

          <div className="flex items-center gap-2.5">
            {/* Database status */}
            {isOfflineMode ? (
              <span className="hidden md:flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 dark:bg-amber-500/20 text-xs font-semibold text-amber-700 dark:text-amber-400 border border-amber-500/30">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                MySQL: Offline (Mode Cadangan)
              </span>
            ) : (
              <span className="hidden md:flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#e6f4ea] dark:bg-[#1F3D2A] text-xs font-semibold text-[#006948] dark:text-[#68DBA9] border border-[#006948]/20">
                <span className="w-1.5 h-1.5 rounded-full bg-[#006948] dark:bg-[#68DBA9] animate-pulse" />
                MySQL: dashboard_zawiyah
              </span>
            )}

            {/* Current user badge if authenticated */}
            {currentUser && (
              <div className="hidden sm:flex items-center gap-2 px-3 py-1 rounded-xl bg-white/70 dark:bg-white/5 border border-[#243324]/10 dark:border-white/10 text-xs">
                <UserCheck className="w-3.5 h-3.5 text-[#006948] dark:text-[#68DBA9]" />
                <span className="font-medium text-[#1F2B1D] dark:text-[#F4EFE6]">
                  {currentUser.nama_lengkap}
                </span>
                <span className="px-1.5 py-0.5 rounded text-[10px] bg-[#1F2B1D]/10 dark:bg-white/10 font-mono">
                  {currentUser.role}
                </span>
              </div>
            )}

            <button
              type="button"
              onClick={handleLogout}
              disabled={isLoggingOut}
              className="flex items-center gap-1.5 text-xs text-[#657351] dark:text-[#A3B59E] hover:text-[#243324] dark:hover:text-[#F4EFE6] transition-colors px-2.5 py-1.5 rounded-lg hover:bg-[#243324]/5 dark:hover:bg-white/5 border border-transparent hover:border-[#243324]/10 cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>{isLoggingOut ? 'Keluar...' : 'Ganti Akun'}</span>
            </button>
            <Link
              href="/"
              className="text-xs text-[#657351] dark:text-[#A3B59E] hover:text-[#243324] dark:hover:text-[#F4EFE6] transition-colors"
            >
              ← Beranda
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Offline Warning Banner */}
        {isOfflineMode && (
          <div className="p-4 sm:p-5 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-900 dark:text-amber-200 text-xs sm:text-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-sm backdrop-blur-sm">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-700 dark:text-amber-300 flex items-center justify-center flex-shrink-0">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <p className="font-semibold text-amber-950 dark:text-amber-100">
                  Mode Cadangan Demo Aktif (MySQL Offline)
                </p>
                <p className="text-amber-800/90 dark:text-amber-300/80 text-xs mt-0.5">
                  Server MySQL lokal di port 3306 tidak terdeteksi. Data yang tampil di bawah ini adalah data pratinjau snapshot.
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => router.push('/admin')}
              className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-medium text-xs transition-all shadow-sm active:scale-95 cursor-pointer flex-shrink-0 flex items-center gap-1.5"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Periksa Ulang MySQL</span>
            </button>
          </div>
        )}

        {/* TAB 1: OVERVIEW */}
        {activeNav === 'overview' && (
          <>
            {/* Page Title */}
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
              <div>
                <h1 className="font-display text-3xl sm:text-4xl lg:text-5xl text-[#1F2B1D] dark:text-[#F4EFE6] font-light leading-tight">
                  Overview Kejamaahan
                </h1>
                <p className="text-[#657351] dark:text-[#A3B59E] mt-1 text-sm sm:text-base">
                  Ringkasan data terpusat dari {stats.totalJamaah.toLocaleString('id-ID')} jamaah di {stats.totalZawiyah} cabang zawiyah.
                </p>
              </div>
              <div className="flex items-center gap-2 text-xs text-[#657351] dark:text-[#A3B59E]">
                <Database className="w-3.5 h-3.5 text-[#006948] dark:text-[#68DBA9]" />
                {/* <span className="font-semibold text-[#006948] dark:text-[#68DBA9]">MySQL Live Database: dashboard_zawiyah</span> */}
              </div>
            </div>

            {/* Metric Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-5">
              {metricCards.map((card) => (
                <div
                  key={card.label}
                  className={`relative rounded-2xl bg-gradient-to-br ${card.color} p-5 text-[#F4EFE6] overflow-hidden shadow-lg group hover:scale-[1.02] transition-transform duration-300`}
                >
                  {card.badge && (
                    <span className="absolute top-3 right-3 px-2 py-0.5 rounded-full bg-white/20 text-[10px] font-bold tracking-widest uppercase">
                      {card.badge}
                    </span>
                  )}
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-10 h-10 rounded-xl bg-white/15 flex items-center justify-center">
                      <card.icon className="w-5 h-5 text-[#F4EFE6]" />
                    </div>
                    <TrendingUp className="w-4 h-4 text-white/30 group-hover:text-white/60 transition-colors" />
                  </div>
                  <p className="font-display text-3xl sm:text-4xl font-light text-white leading-none tracking-tight">
                    {card.value}
                  </p>
                  <p className="text-sm font-medium text-white/80 mt-1">{card.label}</p>
                  <p className="text-xs text-white/50 mt-0.5">{card.sub}</p>
                </div>
              ))}
            </div>

            {/* Gender Distribution + Top Zawiyah */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
              {/* Gender Card */}
              <div className="glass-panel rounded-2xl p-6 space-y-5">
                <div>
                  <h3 className="font-display text-xl text-[#1F2B1D] dark:text-[#F4EFE6] font-light">Demografi Gender</h3>
                  <p className="text-xs text-[#657351] dark:text-[#A3B59E] mt-0.5">Distribusi jenis kelamin jamaah</p>
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
                      <div className="h-full bg-[#4A5D44] dark:bg-[#A3B59E] rounded-full" style={{ width: stats.pctPerempuan + '%' }} />
                    </div>
                    <p className="text-xs text-[#657351] dark:text-[#A3B59E] mt-1">{stats.totalPerempuan.toLocaleString('id-ID')} jiwa</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3 pt-2 border-t border-[#243324]/10 dark:border-white/10">
                  <div className="text-center">
                    <p className="font-display text-2xl text-[#1F2B1D] dark:text-[#F4EFE6]">{stats.pctAgniaCare}%</p>
                    <p className="text-xs text-[#657351] dark:text-[#A3B59E]">Agnia Care</p>
                  </div>
                  <div className="text-center">
                    <p className="font-display text-2xl text-[#1F2B1D] dark:text-[#F4EFE6]">{stats.pctKoperasi}%</p>
                    <p className="text-xs text-[#657351] dark:text-[#A3B59E]">Koperasi</p>
                  </div>
                </div>
              </div>

              {/* Top Zawiyah */}
              <div className="lg:col-span-2 glass-panel rounded-2xl p-6 space-y-5">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-display text-xl text-[#1F2B1D] dark:text-[#F4EFE6] font-light">Top 5 Cabang Zawiyah</h3>
                    <p className="text-xs text-[#657351] dark:text-[#A3B59E] mt-0.5">Berdasarkan jumlah jamaah terbanyak di database</p>
                  </div>
                  <Link href="/admin/zawiyah" className="flex items-center gap-1 text-xs font-medium text-[#4A5D44] dark:text-[#A3B59E] hover:text-[#1F2B1D] dark:hover:text-[#F4EFE6] transition-colors group">
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
                            <span className="w-6 h-6 rounded-lg bg-[#1F2B1D]/10 dark:bg-white/10 flex items-center justify-center text-xs font-bold text-[#1F2B1D] dark:text-[#F4EFE6]">{i + 1}</span>
                            <div>
                              <p className="text-sm font-medium text-[#243324] dark:text-[#F4EFE6] leading-tight line-clamp-1">{z.nama}</p>
                              <p className="text-[10px] text-[#657351] dark:text-[#A3B59E]">{z.kota} · {z.tipe}</p>
                            </div>
                          </div>
                          <span className="font-display text-xl text-[#1F2B1D] dark:text-[#F4EFE6] font-light">{z.jamaah.toLocaleString('id-ID')}</span>
                        </div>
                        <div className="h-1.5 bg-[#243324]/8 dark:bg-white/8 rounded-full overflow-hidden ml-8">
                          <div className="h-full bg-gradient-to-r from-[#1F2B1D] to-[#4A5D44] dark:from-[#68DBA9] dark:to-[#A3B59E] rounded-full" style={{ width: pct + '%' }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Pekerjaan + Quick Links */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
              <div className="glass-panel rounded-2xl p-6 space-y-5">
                <div>
                  <h3 className="font-display text-xl text-[#1F2B1D] dark:text-[#F4EFE6] font-light">Distribusi Profesi</h3>
                  <p className="text-xs text-[#657351] dark:text-[#A3B59E] mt-0.5">Top 6 pekerjaan jamaah terbanyak</p>
                </div>
                <div className="space-y-3">
                  {stats.topPekerjaan.map((p, i) => {
                    const pct = Math.round((p.count / stats.totalJamaah) * 100);
                    const colors = ['bg-[#1F2B1D]', 'bg-[#3B4D36]', 'bg-[#4A5D44]', 'bg-[#657351]', 'bg-[#8A9E80]', 'bg-[#A3B59E]'];
                    return (
                      <div key={p.label} className="flex items-center gap-3">
                        <div className={`w-2.5 h-2.5 rounded-full ${colors[i % colors.length]} flex-shrink-0`} />
                        <div className="flex-1 min-w-0">
                          <div className="flex justify-between items-baseline gap-2">
                            <p className="text-sm text-[#243324] dark:text-[#F4EFE6] truncate">{p.label}</p>
                            <div className="flex items-baseline gap-1.5 flex-shrink-0">
                              <span className="font-display text-base text-[#1F2B1D] dark:text-[#F4EFE6]">{p.count.toLocaleString('id-ID')}</span>
                              <span className="text-xs text-[#657351] dark:text-[#A3B59E]">({pct}%)</span>
                            </div>
                          </div>
                          <div className="h-1 bg-[#243324]/8 dark:bg-white/8 rounded-full mt-1 overflow-hidden">
                            <div className={`h-full ${colors[i % colors.length]} rounded-full`} style={{ width: pct + '%' }} />
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="space-y-4">
                <div className="glass-panel rounded-2xl p-6 space-y-4">
                  <h3 className="font-display text-xl text-[#1F2B1D] dark:text-[#F4EFE6] font-light">Akses Cepat</h3>
                  <div className="space-y-3">
                    <Link href="/admin/jamaah" className="flex items-center justify-between p-4 rounded-xl border border-[#243324]/10 dark:border-white/10 hover:border-[#243324]/30 dark:hover:border-white/30 hover:bg-[#243324]/4 dark:hover:bg-white/4 transition-all group">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-[#1F2B1D]/8 dark:bg-white/8 flex items-center justify-center">
                          <Users className="w-5 h-5 text-[#1F2B1D] dark:text-[#F4EFE6]" />
                        </div>
                        <div>
                          <p className="font-medium text-sm text-[#243324] dark:text-[#F4EFE6]">Data Master Jamaah</p>
                          <p className="text-xs text-[#657351] dark:text-[#A3B59E]">{stats.totalJamaah.toLocaleString('id-ID')} anggota terdaftar di MySQL</p>
                        </div>
                      </div>
                      <ArrowRight className="w-4 h-4 text-[#657351] dark:text-[#A3B59E] group-hover:translate-x-1 transition-transform" />
                    </Link>

                    <Link href="/admin/donatur" className="flex items-center justify-between p-4 rounded-xl border border-[#243324]/10 dark:border-white/10 hover:border-[#243324]/30 dark:hover:border-white/30 hover:bg-[#243324]/4 dark:hover:bg-white/4 transition-all group">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-rose-500/10 dark:bg-rose-500/20 flex items-center justify-center">
                          <Heart className="w-5 h-5 text-rose-600 dark:text-rose-400 fill-current" />
                        </div>
                        <div>
                          <p className="font-medium text-sm text-[#243324] dark:text-[#F4EFE6]">Donatur Agnia Care</p>
                          <p className="text-xs text-[#657351] dark:text-[#A3B59E]">{stats.totalDonatur || 146} donatur Kanwakil Jawa Barat di MySQL</p>
                        </div>
                      </div>
                      <ArrowRight className="w-4 h-4 text-[#657351] dark:text-[#A3B59E] group-hover:translate-x-1 transition-transform" />
                    </Link>

                    <button
                      type="button"
                      onClick={() => setActiveNav('users')}
                      className="w-full flex items-center justify-between p-4 rounded-xl border border-[#243324]/10 dark:border-white/10 hover:border-[#243324]/30 dark:hover:border-white/30 hover:bg-[#243324]/4 dark:hover:bg-white/4 transition-all group text-left cursor-pointer"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-[#1F2B1D]/8 dark:bg-white/8 flex items-center justify-center">
                          <ShieldCheck className="w-5 h-5 text-[#1F2B1D] dark:text-[#F4EFE6]" />
                        </div>
                        <div>
                          <p className="font-medium text-sm text-[#243324] dark:text-[#F4EFE6]">Kelola Akun Pengguna MySQL</p>
                          <p className="text-xs text-[#657351] dark:text-[#A3B59E]">{accounts.length} akun terdaftar di tabel `users`</p>
                        </div>
                      </div>
                      <ArrowRight className="w-4 h-4 text-[#657351] dark:text-[#A3B59E] group-hover:translate-x-1 transition-transform" />
                    </button>
                  </div>
                </div>

                <div className="rounded-2xl bg-[#1F2B1D] p-5 text-[#F4EFE6] space-y-2">
                  <div className="flex items-center gap-2">
                    <Database className="w-4 h-4 text-[#68DBA9]" />
                    <span className="text-xs font-semibold text-[#68DBA9] uppercase tracking-wider">MySQL Single Source of Truth</span>
                  </div>
                  <p className="text-sm text-[#F4EFE6]/80 leading-relaxed">
                    Terhubung langsung ke database MySQL <strong className="text-white">dashboard_zawiyah</strong>. Seluruh autentikasi akun menggunakan enkripsi bcrypt dan dicatat di tabel <strong className="text-[#68DBA9]">audit_logs</strong>.
                  </p>
                </div>
              </div>
            </div>
          </>
        )}

        {/* TAB 2: USER ACCOUNTS (AKUN PENGGUNA) */}
        {activeNav === 'users' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="font-display text-3xl sm:text-4xl text-[#1F2B1D] dark:text-[#F4EFE6] font-light">
                    Akun & Hak Akses
                  </h1>
                  <span className="px-2.5 py-0.5 rounded-full bg-[#e6f4ea] dark:bg-[#1F3D2A] text-xs font-semibold text-[#006948] dark:text-[#68DBA9] border border-[#006948]/20">
                    Live MySQL
                  </span>
                </div>
                <p className="text-[#657351] dark:text-[#A3B59E] mt-1 text-sm">
                  Daftar akun login yang tersimpan di tabel <code className="font-mono text-xs font-bold text-[#1F2B1D] dark:text-[#F4EFE6]">users</code> basis data <code className="font-mono text-xs font-bold text-[#1F2B1D] dark:text-[#F4EFE6]">dashboard_zawiyah</code>.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={refreshUsers}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-[#243324]/15 dark:border-white/15 bg-white/60 dark:bg-black/20 hover:bg-white text-xs font-medium text-[#243324] dark:text-[#F4EFE6] transition-colors cursor-pointer"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Refresh</span>
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddModal(true)}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#1F2B1D] hover:bg-[#2A3C27] text-xs font-medium text-[#F4EFE6] transition-all shadow-sm cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Tambah Akun Baru</span>
                </button>
              </div>
            </div>

            {/* Users Table */}
            <div className="glass-panel rounded-2xl overflow-hidden border border-[#243324]/10 dark:border-white/10 shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-[#243324]/5 dark:bg-white/5 border-b border-[#243324]/10 dark:border-white/10 text-xs uppercase tracking-wider text-[#657351] dark:text-[#A3B59E]">
                    <tr>
                      <th className="py-3.5 px-4 font-semibold">ID</th>
                      <th className="py-3.5 px-4 font-semibold">Username</th>
                      <th className="py-3.5 px-4 font-semibold">Nama Lengkap & Email</th>
                      <th className="py-3.5 px-4 font-semibold">Role / Akses</th>
                      <th className="py-3.5 px-4 font-semibold">Zawiyah / Divisi</th>
                      <th className="py-3.5 px-4 font-semibold">Status</th>
                      <th className="py-3.5 px-4 font-semibold">Password Default</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#243324]/5 dark:divide-white/5">
                    {accounts.map((acc) => {
                      let roleBadgeClass = 'bg-[#4A5D44]/15 text-[#384A33] dark:bg-[#4A5D44]/40 dark:text-[#CBD7C7]';
                      if (acc.role === 'SUPER_ADMIN') {
                        roleBadgeClass = 'bg-[#1F2B1D] text-[#F4EFE6] dark:bg-white/15 dark:text-[#F4EFE6]';
                      } else if (acc.role === 'ADMIN_DIVISI') {
                        roleBadgeClass = 'bg-rose-500/10 text-rose-700 dark:bg-rose-500/25 dark:text-rose-300';
                      }

                      return (
                        <tr key={acc.id} className="hover:bg-[#243324]/3 dark:hover:bg-white/3 transition-colors">
                          <td className="py-3.5 px-4 font-mono text-xs text-[#657351] dark:text-[#A3B59E]">
                            #{acc.id}
                          </td>
                          <td className="py-3.5 px-4 font-mono font-semibold text-[#1F2B1D] dark:text-[#F4EFE6]">
                            {acc.username}
                          </td>
                          <td className="py-3.5 px-4">
                            <p className="font-medium text-[#243324] dark:text-[#F4EFE6] leading-tight">
                              {acc.nama_lengkap}
                            </p>
                            <p className="text-xs text-[#657351] dark:text-[#A3B59E]">
                              {acc.email || '-'}
                            </p>
                          </td>
                          <td className="py-3.5 px-4">
                            <span className={`inline-block px-2 py-0.5 rounded-md text-[11px] font-semibold ${roleBadgeClass}`}>
                              {acc.role}
                            </span>
                          </td>
                          <td className="py-3.5 px-4 text-xs text-[#657351] dark:text-[#A3B59E]">
                            {acc.zawiyah_id || acc.divisi_id || 'Seluruh Cabang (Pusat)'}
                          </td>
                          <td className="py-3.5 px-4">
                            <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-700 dark:text-emerald-400">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 dark:bg-emerald-400" />
                              {acc.status}
                            </span>
                          </td>
                          <td className="py-3.5 px-4 font-mono text-xs text-[#657351] dark:text-[#A3B59E]">
                            admin123
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* MySQL Connection info box */}
            <div className="p-5 rounded-2xl bg-[#e6f4ea] dark:bg-[#1F3D2A] border border-[#006948]/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#006948] text-white flex items-center justify-center flex-shrink-0">
                  <Database className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-[#006948] dark:text-[#68DBA9]">
                    Database MySQL Aktif: dashboard_zawiyah (Port 3306)
                  </h4>
                  <p className="text-xs text-[#384A33] dark:text-[#CBD7C7] mt-0.5">
                    Semua akun di atas sinkron 1:1 dengan phpMyAdmin Anda di <code className="font-mono bg-white/40 dark:bg-black/20 px-1 rounded">localhost/phpmyadmin/</code>.
                  </p>
                </div>
              </div>
              <Link
                href="/login"
                className="px-4 py-2 rounded-xl bg-[#006948] hover:bg-[#005238] text-white text-xs font-medium transition-colors shadow-sm flex-shrink-0"
              >
                Uji Coba Login dengan Akun Ini →
              </Link>
            </div>
          </div>
        )}

        {/* Modal: Tambah Akun Baru */}
        {showAddModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="bg-[#FBF9F5] dark:bg-[#1A2619] border border-[#243324]/15 dark:border-white/15 rounded-3xl p-6 sm:p-8 w-full max-w-md shadow-2xl space-y-5">
              <div className="flex items-center justify-between border-b border-[#243324]/10 dark:border-white/10 pb-4">
                <div className="flex items-center gap-2">
                  <UserPlus className="w-5 h-5 text-[#1F2B1D] dark:text-[#F4EFE6]" />
                  <h3 className="font-display text-xl text-[#1F2B1D] dark:text-[#F4EFE6] font-light">
                    Tambah Akun Baru
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="text-sm text-[#657351] hover:text-[#1F2B1D] cursor-pointer"
                >
                  ✕
                </button>
              </div>

              {formMsg && (
                <div
                  className={`p-3 rounded-xl text-xs flex items-center gap-2 ${
                    formMsg.type === 'success'
                      ? 'bg-emerald-500/10 text-emerald-800 dark:text-emerald-300 border border-emerald-500/20'
                      : 'bg-red-500/10 text-red-700 dark:text-red-400 border border-red-500/20'
                  }`}
                >
                  {formMsg.type === 'success' ? <CheckCircle2 className="w-4 h-4" /> : null}
                  <span>{formMsg.text}</span>
                </div>
              )}

              <form onSubmit={handleCreateUser} className="space-y-4">
                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-[#4A5D44] dark:text-[#CBD7C7] uppercase">
                    Username
                  </label>
                  <input
                    type="text"
                    value={newUsername}
                    onChange={(e) => setNewUsername(e.target.value)}
                    placeholder="misal: admin_bandung"
                    required
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white/70 dark:bg-black/20 border border-[#243324]/15 dark:border-white/15 text-sm"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-[#4A5D44] dark:text-[#CBD7C7] uppercase">
                    Nama Lengkap
                  </label>
                  <input
                    type="text"
                    value={newNama}
                    onChange={(e) => setNewNama(e.target.value)}
                    placeholder="misal: Ust. Ahmad Fauzi"
                    required
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white/70 dark:bg-black/20 border border-[#243324]/15 dark:border-white/15 text-sm"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-[#4A5D44] dark:text-[#CBD7C7] uppercase">
                    Email
                  </label>
                  <input
                    type="email"
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    placeholder="misal: fauzi@idrisiyyah.org"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white/70 dark:bg-black/20 border border-[#243324]/15 dark:border-white/15 text-sm"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[11px] font-semibold text-[#4A5D44] dark:text-[#CBD7C7] uppercase">
                      Role
                    </label>
                    <select
                      value={newRole}
                      onChange={(e) => setNewRole(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-white/70 dark:bg-black/20 border border-[#243324]/15 dark:border-white/15 text-sm"
                    >
                      <option value="SUPER_ADMIN">SUPER_ADMIN</option>
                      <option value="ADMIN_EKSEKUTIF">ADMIN_EKSEKUTIF</option>
                      <option value="ADMIN_ZAWIYAH">ADMIN_ZAWIYAH</option>
                      <option value="ADMIN_DIVISI">ADMIN_DIVISI</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[11px] font-semibold text-[#4A5D44] dark:text-[#CBD7C7] uppercase">
                      Password
                    </label>
                    <input
                      type="text"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      required
                      className="w-full px-3.5 py-2.5 rounded-xl bg-white/70 dark:bg-black/20 border border-[#243324]/15 dark:border-white/15 text-sm font-mono"
                    />
                  </div>
                </div>

                <div className="pt-2 flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="px-4 py-2.5 rounded-xl border border-[#243324]/15 text-xs text-[#657351] hover:bg-black/5 cursor-pointer"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-5 py-2.5 rounded-xl bg-[#1F2B1D] hover:bg-[#2A3C27] text-xs font-medium text-[#F4EFE6] transition-all cursor-pointer shadow-md"
                  >
                    {isSubmitting ? 'Menyimpan ke MySQL...' : 'Simpan ke MySQL'}
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
