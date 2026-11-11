'use client';

import React, { useRef } from 'react';
import { motion, useScroll, useTransform } from 'motion/react';
import { AnimatedNumber } from './AnimatedNumber';
import { REPORT_METADATA } from '../data/reportData';
import { IMAGES } from '../assets/images';

export const OverviewSection: React.FC = () => {
  const cardRef = useRef<HTMLDivElement>(null);

  // Dynamic live stats synced with database
  const [stats, setStats] = React.useState({
    totalJamaah: 6373,
    totalZawiyah: 109,
    totalDonatur: 146,
  });

  React.useEffect(() => {
    async function fetchStats() {
      try {
        const res = await fetch('/api/stats?global=true');
        const json = await res.json();
        if (json.success && json.stats) {
          setStats({
            totalJamaah: json.stats.totalJamaah || 6373,
            totalZawiyah: json.stats.totalZawiyah || 109,
            totalDonatur: json.stats.totalDonatur || json.stats.totalAgniaCare || 146,
          });
        }
      } catch (err) {
        console.warn('OverviewSection: fetch stats error, using fallback:', err);
      }
    }
    fetchStats();
  }, []);

  // Smooth parallax scroll tracking mapped safely to card entry and exit
  const { scrollYProgress } = useScroll({
    target: cardRef,
    offset: ['start end', 'end start'],
  });

  // Clamped parallax ensures the image is always 100% visible and anchored
  const imageY = useTransform(scrollYProgress, [0, 1], ['-22%', '0%'], { clamp: true });

  return (
    <section
      id="overview-section"
      className="relative bg-[#FBF9F5] dark:bg-[#131D12] text-[#243324] dark:text-[#F4EFE6] pt-10 sm:pt-20 pb-12 sm:pb-20 px-4 sm:px-8 lg:px-12 flex flex-col justify-between overflow-hidden transition-colors duration-400"
    >
      <div className="max-w-6xl mx-auto w-full space-y-8 sm:space-y-16">
        {/* Visual Showcase Card Container with Responsive Height & Padding */}
        <div
          ref={cardRef}
          className="relative h-[360px] sm:h-[520px] lg:h-[660px] w-full rounded-2xl sm:rounded-[3rem] overflow-hidden shadow-2xl bg-[#1F2B1D]"
        >
          <motion.img
            style={{ y: imageY }}
            src={IMAGES.zawiyahSanctuaryHall}
            alt="Majelis Dzikir dan Pembinaan Ruhani Zawiyah Idrisiyyah"
            referrerPolicy="no-referrer"
            className="absolute top-0 left-0 w-full h-[135%] object-cover object-center max-w-none will-change-transform"
          />

          {/* Subtle bottom gradient overlay for legibility */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#1F2B1D]/95 via-[#1F2B1D]/40 to-transparent pointer-events-none z-10" />

          {/* Overlay Insight / "So What" */}
          <div className="absolute bottom-5 sm:bottom-10 left-4 sm:left-10 right-4 sm:right-10 z-20 flex flex-col sm:flex-row sm:items-end justify-between gap-3 sm:gap-6 text-[#F4EFE6]">
            <div className="max-w-3xl">
              <span className="inline-block text-[10px] sm:text-xs uppercase tracking-wider text-[#E8DCC4] font-semibold mb-2 bg-[#1F2B1D]/70 backdrop-blur-md px-3 py-1 rounded-full border border-white/15">
                Pusat Pembinaan Ruhani & Khidmah Kejamaahan
              </span>
              <p className="font-display text-base sm:text-3xl lg:text-5xl leading-snug sm:leading-tight font-light text-[#F4EFE6] drop-shadow-md">
                Satu wadah terpadu untuk pembinaan ruhani salik, kemandirian ekonomi, dan khidmat sosial umat.
              </p>
            </div>
          </div>
        </div>

        {/* Quantitative Impact Highlights with Immediate Visibility */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '0px' }}
          transition={{ duration: 0.5 }}
          className="w-full"
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-10 pt-4 pb-4 border-t border-[#243324]/10 dark:border-white/10">
            <div className="space-y-1">
              <div className="font-display text-3xl sm:text-6xl text-[#1F2B1D] dark:text-[#F4EFE6] font-light tracking-tight">
                <AnimatedNumber value={stats.totalJamaah} />
              </div>
              <p className="text-sm sm:text-base text-[#4A5D44] dark:text-[#CBD7C7] font-medium">Total Jamaah Terdata</p>
              <p className="text-xs sm:text-sm text-[#657351] dark:text-[#A3B59E] font-light">
                Data terpusat dan terverifikasi seluruh nusantara
              </p>
            </div>

            <div className="space-y-1">
              <div className="font-display text-3xl sm:text-6xl text-[#1F2B1D] dark:text-[#F4EFE6] font-light tracking-tight">
                <AnimatedNumber value={stats.totalZawiyah} />
              </div>
              <p className="text-sm sm:text-base text-[#4A5D44] dark:text-[#CBD7C7] font-medium">Cabang Zawiyah Aktif</p>
              <p className="text-xs sm:text-sm text-[#657351] dark:text-[#A3B59E] font-light">
                Tersebar di Jawa Barat, DKI, Jawa Tengah, Jatim & Luar Jawa
              </p>
            </div>

            <div className="space-y-1">
              <div className="font-display text-3xl sm:text-6xl text-[#1F2B1D] dark:text-[#F4EFE6] font-light tracking-tight">
                <AnimatedNumber value={stats.totalDonatur} />
              </div>
              <p className="text-sm sm:text-base text-[#4A5D44] dark:text-[#CBD7C7] font-medium">Donatur & Peserta Agnia Care</p>
              <p className="text-xs sm:text-sm text-[#657351] dark:text-[#A3B59E] font-light">
                Penyaluran filantropi, santunan dhuafa & beasiswa santri
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};
