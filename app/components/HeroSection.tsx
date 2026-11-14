'use client';

import React, { useState, useRef } from 'react';
import { motion, useScroll, useTransform } from 'motion/react';
import { ChevronDown, Play } from 'lucide-react';

export const HeroSection: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end start'],
  });

  const textY = useTransform(scrollYProgress, [0, 1], ['0%', '15%']);
  const opacity = useTransform(scrollYProgress, [0, 0.75], [1, 0]);

  const handleScrollToNext = () => {
    const nextSection = document.getElementById('overview-section');
    if (nextSection) {
      nextSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const videoId = '9wDAZBxl_U4';
  const posterUrl = `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;

  return (
    <section
      ref={containerRef}
      id="hero-section"
      className="relative min-h-screen w-full flex flex-col justify-center items-center overflow-hidden px-4 sm:px-8 lg:px-12 text-center pt-24 sm:pt-28 pb-16 sm:pb-24 bg-[#141E13] bg-[radial-gradient(ellipse_80%_80%_at_50%_-10%,rgba(65,95,60,0.35),rgba(20,30,19,1))]"
    >
      {/* Subtle Ambient Background Glow */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(59,88,54,0.18)_0,transparent_70%)] pointer-events-none z-0" />

      {/* Foreground Content */}
      <motion.div
        style={{ y: textY, opacity }}
        className="relative z-10 max-w-5xl mx-auto w-full flex flex-col items-center justify-center space-y-6 sm:space-y-8 text-[#F4EFE6] drop-shadow-[0_2px_24px_rgba(0,0,0,0.5)]"
      >
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: 'spring', stiffness: 90, damping: 20 }}
          className="space-y-4 sm:space-y-6"
        >
          <p className="text-xs sm:text-sm md:text-base font-semibold tracking-widest uppercase text-[#F4EFE6]">
            Sistem Administrasi Jamaah Zawiyah Idrisiyyah
          </p>

          <h1 className="font-display text-5xl sm:text-7xl md:text-8xl lg:text-9xl tracking-tight leading-[0.95] text-[#F4EFE6] font-normal">
            SAJADA
          </h1>

          <p className="text-lg sm:text-xl md:text-2xl text-[#F4EFE6] font-light max-w-2xl mx-auto pt-1 leading-relaxed">
            Merajut ukhuwah dan khidmah jamaah di setiap zawiyah nusantara dalam satu saf ketakwaan.
          </p>
        </motion.div>

        {/* Ultra-Lightweight Lite YouTube Embed (Zero Initial Memory, On-Demand Load) */}
        <motion.div
          initial={{ opacity: 0, y: 25, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ delay: 0.2, type: 'spring', stiffness: 90, damping: 20 }}
          className="w-full max-w-3xl sm:max-w-4xl mx-auto pt-2"
        >
          <div className="relative aspect-video w-full rounded-2xl sm:rounded-3xl overflow-hidden shadow-2xl shadow-black/80 border border-white/15 bg-black/70 backdrop-blur-xs">
            {!isPlaying ? (
              <button
                type="button"
                onClick={() => setIsPlaying(true)}
                aria-label="Putar video profil"
                className="relative w-full h-full group cursor-pointer overflow-hidden block text-left"
              >
                {/* High-res Video Poster Image */}
                <img
                  src={posterUrl}
                  alt="Thumbnail Video Zawiyah"
                  className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                  loading="eager"
                />

                {/* Ambient Dark Gradient on Poster */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-black/30 group-hover:via-black/20 transition-colors" />

                {/* Sleek Center Play Button */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-[#1F2B1D]/80 border border-white/30 backdrop-blur-md flex items-center justify-center text-[#F4EFE6] shadow-xl group-hover:scale-110 group-hover:bg-[#2C3E29] transition-all duration-300">
                    <Play className="w-7 h-7 sm:w-9 sm:h-9 ml-1 fill-current" />
                  </div>
                </div>

                {/* Bottom Badge Info */}
                <div className="absolute bottom-4 left-4 sm:bottom-6 sm:left-6 flex items-center gap-2 text-xs sm:text-sm text-[#F4EFE6]/90 font-medium bg-black/50 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-white/10">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span>Klik untuk memutar video</span>
                </div>
              </button>
            ) : (
              <iframe
                className="w-full h-full"
                src={`https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1&controls=1&rel=0&iv_load_policy=3&cc_load_policy=3&modestbranding=1&playsinline=1`}
                title="YouTube video player"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                referrerPolicy="strict-origin-when-cross-origin"
                allowFullScreen
              />
            )}
          </div>
        </motion.div>
      </motion.div>

      {/* Scroll Down Hint */}
      <motion.button
        type="button"
        onClick={handleScrollToNext}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: [0, 8, 0] }}
        transition={{
          opacity: { delay: 0.6, duration: 0.8 },
          y: { repeat: Infinity, duration: 2.4, ease: 'easeInOut' },
        }}
        className="relative z-10 mt-12 sm:mt-16 flex flex-col items-center gap-2 text-[#F4EFE6] hover:text-white transition-colors cursor-pointer group"
      >
        <span className="text-xs font-semibold tracking-widest uppercase text-[#F4EFE6] group-hover:text-white">
          Scroll to explore
        </span>
        <ChevronDown className="w-5 h-5 text-[#F4EFE6] group-hover:translate-y-0.5 transition-transform" />
      </motion.button>
    </section>
  );
};
