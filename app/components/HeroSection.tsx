'use client';

import React, { useRef, useEffect } from 'react';
import { motion, useScroll, useTransform } from 'motion/react';
import { ChevronDown } from 'lucide-react';
const heroVideo = '/assets/images/video.mp4';

export const HeroSection: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.defaultMuted = true;
      videoRef.current.muted = true;
      const playPromise = videoRef.current.play();
      if (playPromise !== undefined) {
        playPromise.catch(() => {
          // Autoplay was prevented, wait for interaction or metadata
        });
      }
    }
  }, []);

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
      className="relative min-h-screen w-full flex flex-col justify-center items-center overflow-hidden px-4 sm:px-8 lg:px-12 text-center bg-[#1F2B1D]"
    >
      {/* Background Video from Assets */}
      <video
        ref={videoRef}
        autoPlay
        loop
        muted
        playsInline
        preload="auto"
        src={heroVideo}
        className="absolute inset-0 w-full h-full object-cover z-0"
      >
        <source src={heroVideo} type="video/mp4" />
      </video>

      {/* Dark Green Overlay at 30% Opacity */}
      <div className="absolute inset-0 bg-[#1F2B1D]/30 pointer-events-none z-10" />

      {/* Foreground Content in Sandstone Color */}
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
            Menghubungkan data-data jamaah di setiap zawiyah di nusantara.
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


