'use client';

import Link from 'next/link';
import React, { useState } from 'react';
import { motion, useScroll, useMotionValueEvent, AnimatePresence } from 'motion/react';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

export const Navbar: React.FC = () => {
  const { scrollY } = useScroll();
  const { isDark, toggleTheme } = useTheme();
  const [isScrolledPastHero, setIsScrolledPastHero] = useState(false);

  useMotionValueEvent(scrollY, 'change', (latest) => {
    // Switch state once user scrolls past 70% of the viewport (exiting the hero section)
    const threshold = typeof window !== 'undefined' ? window.innerHeight * 0.7 : 550;
    setIsScrolledPastHero(latest >= threshold);
  });

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 py-3 sm:py-4 px-4 sm:px-8 lg:px-12 pointer-events-none flex justify-between items-center transition-all duration-300 ${
        isScrolledPastHero
          ? 'bg-[#FBF9F5]/90 dark:bg-[#131D12]/90 backdrop-blur-md border-b border-[#243324]/10 dark:border-white/10 shadow-xs'
          : ''
      }`}
    >
      {/* Top Left: SAJADA Logo appears when scrolled past hero */}
      <div className="pointer-events-auto">
        <AnimatePresence>
          {isScrolledPastHero && (
            <motion.div
              initial={{ opacity: 0, x: -12 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -12 }}
              transition={{ duration: 0.2 }}
            >
              <Link href="/" className="flex items-center gap-2 group">
                <span className="font-display font-semibold text-lg tracking-wider text-[#1F2B1D] dark:text-[#F4EFE6] group-hover:opacity-80 transition-opacity">
                  SAJADA
                </span>
                <span className="text-[10px] tracking-widest uppercase px-2 py-0.5 rounded-full bg-[#243324]/10 dark:bg-white/10 text-[#4A5D44] dark:text-[#CBD7C7] font-medium hidden sm:inline-block">
                  Zawiyah
                </span>
              </Link>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Top Right: Portal Admin & Persistent Sun/Moon Theme Toggle */}
      <div className="pointer-events-auto flex items-center gap-2.5 sm:gap-3.5">
        <Link
          href="/login"
          className={`text-xs font-semibold px-3.5 py-1.5 rounded-full border transition-all duration-200 ${
            isScrolledPastHero
              ? 'bg-[#1F2B1D] text-[#F4EFE6] border-[#1F2B1D] hover:bg-[#2F3D2D] dark:bg-[#2A3D28] dark:border-[#3A5237] dark:hover:bg-[#344C32]'
              : 'bg-black/25 hover:bg-black/40 text-[#F4EFE6] border-white/40 backdrop-blur-sm'
          }`}
        >
          Portal Admin
        </Link>

        {/* Sun / Moon Theme Toggle Button - Always visible & accessible */}
        <button
          id="theme-toggle-btn"
          type="button"
          onClick={toggleTheme}
          aria-label={isDark ? 'Switch to light theme' : 'Switch to dark theme'}
          title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
          className={`p-2 sm:p-2.5 rounded-full border transition-all duration-200 cursor-pointer flex items-center justify-center focus:outline-none focus:ring-2 ${
            isScrolledPastHero
              ? isDark
                ? 'border-white/20 bg-white/10 hover:bg-white/20 text-[#F4EFE6] focus:ring-white/30'
                : 'border-[#243324]/20 bg-black/5 hover:bg-black/10 text-[#1F2B1D] focus:ring-[#1F2B1D]/30'
              : 'border-white/40 bg-black/25 hover:bg-black/40 text-white backdrop-blur-sm focus:ring-white/50'
          }`}
        >
          <AnimatePresence mode="wait" initial={false}>
            {isDark ? (
              <motion.div
                key="sun-icon"
                initial={{ rotate: -90, scale: 0.7, opacity: 0 }}
                animate={{ rotate: 0, scale: 1, opacity: 1 }}
                exit={{ rotate: 90, scale: 0.7, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="flex items-center justify-center"
              >
                <Sun className={`w-4 h-4 sm:w-4.5 sm:h-4.5 ${isScrolledPastHero ? 'text-amber-300' : 'text-white'}`} />
              </motion.div>
            ) : (
              <motion.div
                key="moon-icon"
                initial={{ rotate: 90, scale: 0.7, opacity: 0 }}
                animate={{ rotate: 0, scale: 1, opacity: 1 }}
                exit={{ rotate: 90, scale: 0.7, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="flex items-center justify-center"
              >
                <Moon className={`w-4 h-4 sm:w-4.5 sm:h-4.5 ${isScrolledPastHero ? 'text-[#1F2B1D]' : 'text-white'}`} />
              </motion.div>
            )}
          </AnimatePresence>
        </button>
      </div>
    </header>
  );
};


