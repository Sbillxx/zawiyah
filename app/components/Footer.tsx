'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowUp, ArrowRight } from 'lucide-react';

export const Footer: React.FC = () => {
  const scrollToTop = () => {
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <footer className="relative bg-[#F5F2EB] dark:bg-[#121B11] text-[#243324] dark:text-[#F4EFE6] border-t border-[#243324]/10 dark:border-white/10 transition-colors duration-400">
      <div className="max-w-6xl mx-auto px-4 sm:px-8 lg:px-12">
        {/* Top Editorial Identity Block */}
        <div className="pt-16 sm:pt-24 pb-12 sm:pb-16 border-b border-[#243324]/10 dark:border-white/10">
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8">
            <div className="space-y-3 max-w-2xl">
              <span className="text-xs uppercase tracking-widest font-medium text-[#657351] dark:text-[#A3B59E] block">
                Yayasan Idrisiyyah • Tarekat Idrisiyyah
              </span>
              <h2 className="font-display text-4xl sm:text-5xl lg:text-6xl text-[#1F2B1D] dark:text-[#F4EFE6] font-normal tracking-tight">
                SAJADA
              </h2>
              <p className="text-sm sm:text-base text-[#4A5D44] dark:text-[#CBD7C7] font-light leading-relaxed">
                Sistem Administrasi Jamaah Zawiyah — merajut ukhuwah, pembinaan ruhani, dan khidmah kejamaahan di 86 cabang zawiyah se-Nusantara dalam satu saf ketakwaan.
              </p>
            </div>

            <div className="flex items-center gap-3 shrink-0">
              <Link
                href="/login"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#1F2B1D] dark:bg-[#F4EFE6] text-[#F4EFE6] dark:text-[#1F2B1D] text-xs font-medium tracking-wide hover:opacity-90 active:scale-[0.98] transition-all cursor-pointer shadow-xs"
              >
                <span>Portal Pengurus</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>

        {/* Institutional Directory (Clean 3-column, quiet dignity, no AI badges) */}
        <div className="py-12 sm:py-16 grid grid-cols-1 md:grid-cols-3 gap-10 sm:gap-12 text-xs sm:text-sm">
          {/* Column 1: Dua Pilar Utama */}
          <div className="space-y-4">
            <h4 className="text-xs uppercase tracking-wider font-semibold text-[#1F2B1D] dark:text-[#F4EFE6]">
              Pusat Kejamaahan
            </h4>
            <div className="space-y-4 text-[#4A5D44] dark:text-[#CBD7C7] font-light leading-relaxed">
              <div>
                <strong className="font-medium text-[#1F2B1D] dark:text-[#F4EFE6] block">
                  Zawiyah Pusat Pagendingan
                </strong>
                <span>Pondok Pesantren Pagendingan, Cisayong, Kab. Tasikmalaya, Jawa Barat 46153</span>
              </div>
              <div>
                <strong className="font-medium text-[#1F2B1D] dark:text-[#F4EFE6] block">
                  Zawiyah Utama DKI Jakarta
                </strong>
                <span>Sentra Koordinasi Ibu Kota & Kemitraan Strategis Nasional</span>
              </div>
            </div>
          </div>

          {/* Column 2: Navigasi Ringkas */}
          <div className="space-y-4">
            <h4 className="text-xs uppercase tracking-wider font-semibold text-[#1F2B1D] dark:text-[#F4EFE6]">
              Akses Portal
            </h4>
            <ul className="space-y-2.5 text-[#4A5D44] dark:text-[#CBD7C7] font-light">
              <li>
                <a href="#overview-section" className="hover:text-[#1F2B1D] dark:hover:text-white transition-colors">
                  Overview Kejamaahan
                </a>
              </li>
              <li>
                <a href="#sebaran-zawiyah" className="hover:text-[#1F2B1D] dark:hover:text-white transition-colors">
                  Peta Sebaran 86 Zawiyah
                </a>
              </li>
              <li>
                <Link href="/login" className="hover:text-[#1F2B1D] dark:hover:text-white transition-colors">
                  Autentikasi Pengurus
                </Link>
              </li>
              <li>
                <Link href="/admin" className="hover:text-[#1F2B1D] dark:hover:text-white transition-colors">
                  Dashboard Administrasi
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Khidmah & Jejaring */}
          <div className="space-y-4">
            <h4 className="text-xs uppercase tracking-wider font-semibold text-[#1F2B1D] dark:text-[#F4EFE6]">
              Jejaring Nusantara
            </h4>
            <p className="text-[#4A5D44] dark:text-[#CBD7C7] font-light leading-relaxed">
              Membina 4.309 jamaah yang tersebar di 86 cabang zawiyah mandiri di Sumatera, Jawa, Bali, Kalimantan, hingga Sulawesi, dengan dukungan filantropi terpadu Agnia Care.
            </p>
            <p className="text-[11px] text-[#657351] dark:text-[#A3B59E]">
              Data tunggal terverifikasi • Single Source of Truth
            </p>
          </div>
        </div>

        {/* Bottom Legal Bar */}
        <div className="py-6 border-t border-[#243324]/10 dark:border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#657351] dark:text-[#A3B59E] font-light">
          <div>
            © {new Date().getFullYear()} Yayasan Idrisiyyah. Hak cipta dilindungi.
          </div>

          <button
            onClick={scrollToTop}
            className="flex items-center gap-1.5 text-xs text-[#243324] dark:text-[#F4EFE6] hover:underline cursor-pointer"
          >
            <span>Kembali ke atas</span>
            <ArrowUp className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </footer>
  );
};
