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
  }, [initialUser]);

  const isZawiyahAdmin = currentUser?.role === 'ADMIN_ZAWIYAH';

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
  // Ketua Zawiyah: Dashboard, Jamaah, Pengaturan, Keluar
  // Super Admin: Dashboard, Zawiyah, Jamaah, Donatur, Pengaturan, Keluar
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
        {
          id: 'pengaturan',
          label: 'Pengaturan',
          href: '/admin/pengaturan',
          icon: Settings,
          isActive: pathname.startsWith('/admin/pengaturan'),
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
        {
          id: 'pengaturan',
          label: 'Pengaturan',
          href: '/admin/pengaturan',
          icon: Settings,
          isActive: pathname.startsWith('/admin/pengaturan'),
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
    </>
  );
}
