'use client';

import React, { useRef } from 'react';
import { motion, useScroll, useTransform } from 'motion/react';
import { AnimatedNumber } from './AnimatedNumber';
import { REPORT_METADATA } from '../data/reportData';
import { IMAGES } from '../assets/images';

export const OverviewSection: React.FC = () => {
  const cardRef = useRef<HTMLDivElement>(null);

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
      className="relative bg-[#FBF9F5] dark:bg-[#131D12] text-[#243324] dark:text-[#F4EFE6] pt-14 sm:pt-20 pb-16 sm:pb-20 px-4 sm:px-8 lg:px-12 flex flex-col justify-between overflow-hidden transition-colors duration-400"
    >
      <div className="max-w-6xl mx-auto w-full space-y-12 sm:space-y-16">
        {/* Visual Showcase Card Container with Strong Parallax */}
        <div
          ref={cardRef}
          className="relative h-[480px] sm:h-[600px] lg:h-[700px] w-full rounded-[2.5rem] sm:rounded-[3.5rem] overflow-hidden shadow-2xl bg-[#1F2B1D]"
        >
          <motion.img
            style={{ y: imageY }}
            src={IMAGES.zawiyahSanctuaryHall}
            alt="Majelis Dzikir dan Pembinaan Ruhani Zawiyah Idrisiyyah"
            referrerPolicy="no-referrer"
            className="absolute top-0 left-0 w-full h-[135%] object-cover object-center max-w-none will-change-transform"
          />

          {/* Subtle bottom gradient overlay for legibility */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#1F2B1D]/90 via-[#1F2B1D]/30 to-transparent pointer-events-none z-10" />

          {/* Overlay Insight / "So What" */}
          <div className="absolute bottom-8 left-8 right-8 sm:bottom-12 sm:left-12 sm:right-12 z-20 flex flex-col sm:flex-row sm:items-end justify-between gap-6 text-[#F4EFE6]">
            <div className="max-w-3xl">
              <span className="inline-block text-xs uppercase tracking-widest text-[#E8DCC4] font-semibold mb-2 bg-[#1F2B1D]/60 backdrop-blur-md px-3.5 py-1 rounded-full border border-white/15">
                Pusat Pembinaan Ruhani & Khidmah Kejamaahan
              </span>
              <p className="font-display text-2xl sm:text-4xl lg:text-5xl leading-tight font-light text-[#F4EFE6] drop-shadow-md">
                Satu wadah terpadu untuk pembinaan ruhani salik, kemandirian ekonomi, dan khidmat sosial umat.
              </p>
            </div>
          </div>
        </div>

        {/* Quantitative Impact Highlights */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-40px' }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="w-full"
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 sm:gap-10 pt-4 pb-4 border-t border-[#243324]/10 dark:border-white/10">
            <div className="space-y-1">
              <div className="font-display text-4xl sm:text-6xl text-[#1F2B1D] dark:text-[#F4EFE6] font-light tracking-tight">
                <AnimatedNumber value={4307} />
              </div>
              <p className="text-base text-[#4A5D44] dark:text-[#CBD7C7] font-medium">Total Jamaah Terdata</p>
              <p className="text-sm text-[#657351] dark:text-[#A3B59E] font-light">
                Data terpusat dan terverifikasi seluruh nusantara
              </p>
            </div>

            <div className="space-y-1">
              <div className="font-display text-4xl sm:text-6xl text-[#1F2B1D] dark:text-[#F4EFE6] font-light tracking-tight">
                <AnimatedNumber value={86} />
              </div>
              <p className="text-base text-[#4A5D44] dark:text-[#CBD7C7] font-medium">Cabang Zawiyah Aktif</p>
              <p className="text-sm text-[#657351] dark:text-[#A3B59E] font-light">
                Tersebar di Jawa Barat, DKI, Jawa Tengah, Jatim & Luar Jawa
              </p>
            </div>

            <div className="space-y-1">
              <div className="font-display text-4xl sm:text-6xl text-[#1F2B1D] dark:text-[#F4EFE6] font-light tracking-tight">
                <AnimatedNumber value={453} />
              </div>
              <p className="text-base text-[#4A5D44] dark:text-[#CBD7C7] font-medium">Donatur & Peserta Agnia Care</p>
              <p className="text-sm text-[#657351] dark:text-[#A3B59E] font-light">
                Penyaluran filantropi, santunan dhuafa & beasiswa santri
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

