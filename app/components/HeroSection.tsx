'use client';

import React, { useRef } from 'react';
import { motion, useScroll, useTransform } from 'motion/react';
import { ChevronDown } from 'lucide-react';

export const HeroSection: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end start'],
  });

  const textY = useTransform(scrollYProgress, [0, 1], ['0%', '30%']);
  const opacity = useTransform(scrollYProgress, [0, 0.75], [1, 0]);

  const handleScrollToNext = () => {
    const nextSection = document.getElementById('overview-section');
    if (nextSection) {
      nextSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section
      ref={containerRef}
      id="hero-section"
      className="relative min-h-screen w-full flex flex-col justify-center items-center overflow-hidden px-4 sm:px-8 lg:px-12 text-center bg-[#141E13]"
    >
      {/* Background Video: Lebar Pas dengan Lebar Halaman (100% Width), Subtitle OFF */}
      <div className="absolute inset-0 w-full h-full overflow-hidden pointer-events-none z-0">
        <iframe
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-[56.25vw] min-h-full min-w-[177.78vh] object-cover pointer-events-none"
          src="https://www.youtube-nocookie.com/embed/9wDAZBxl_U4?autoplay=1&mute=1&loop=1&playlist=9wDAZBxl_U4&controls=0&showinfo=0&rel=0&iv_load_policy=3&cc_load_policy=3&disablekb=1&modestbranding=1&playsinline=1"
          title="Background video"
          frameBorder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          tabIndex={-1}
          aria-hidden="true"
        />
      </div>

      {/* Dark Green Gradient Overlay: Menjaga Teks Tetap Tajam & Kontras */}
      <div className="absolute inset-0 bg-[#141E13]/50 bg-[radial-gradient(ellipse_80%_80%_at_50%_-10%,rgba(65,95,60,0.3),rgba(20,30,19,0.7))] pointer-events-none z-10" />

      {/* Foreground Content: SAJADA & Tagline di Depan Video Background */}
      <motion.div
        style={{ y: textY, opacity }}
        className="relative z-20 max-w-5xl mx-auto w-full flex flex-col items-center justify-center space-y-6 sm:space-y-8 text-[#F4EFE6] drop-shadow-[0_2px_24px_rgba(0,0,0,0.5)]"
      >
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: 'spring', stiffness: 90, damping: 20 }}
          className="space-y-4 sm:space-y-6"
        >
          <p className="text-xs sm:text-sm md:text-base font-semibold tracking-widest uppercase text-[#F4EFE6]">
            Sistem Administrasi & Monitoring Jamaah Zawiyah
          </p>

          <h1 className="font-display text-5xl sm:text-7xl md:text-8xl lg:text-9xl tracking-tight leading-[0.95] text-[#F4EFE6] font-normal">
            SAJADA
          </h1>

          <p className="text-lg sm:text-xl md:text-2xl text-[#F4EFE6] font-light max-w-2xl mx-auto pt-1 leading-relaxed">
            Merajut ukhuwah dan khidmah jamaah di setiap zawiyah nusantara dalam satu saf ketakwaan.
          </p>
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
        className="absolute bottom-8 sm:bottom-12 z-20 flex flex-col items-center gap-2 text-[#F4EFE6] hover:text-white transition-colors cursor-pointer group"
      >
        <span className="text-xs font-semibold tracking-widest uppercase text-[#F4EFE6] group-hover:text-white">
          Scroll to explore
        </span>
        <ChevronDown className="w-5 h-5 text-[#F4EFE6] group-hover:translate-y-0.5 transition-transform" />
      </motion.button>
    </section>
  );
};
