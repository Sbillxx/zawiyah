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

  const reportTextColor = isScrolledPastHero
    ? isDark
      ? 'text-[#F4EFE6]'
      : 'text-[#1F2B1D]'
    : 'text-[#F4EFE6] drop-shadow-[0_1px_8px_rgba(0,0,0,0.4)]';

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 py-3 sm:py-4 px-4 sm:px-8 lg:px-12 pointer-events-none flex justify-end items-center transition-all duration-300 ${
        isScrolledPastHero
          ? 'bg-[#FBF9F5]/90 dark:bg-[#131D12]/90 backdrop-blur-md border-b border-[#243324]/10 dark:border-white/10 shadow-xs'
          : ''
      }`}
    >
      {/* Top Right: "2026 REPORT" & Sun/Moon Dark Mode Toggle */}
      <div className="pointer-events-auto flex items-center gap-2.5 sm:gap-4">
        <Link
          href="/login"
          className={`text-xs font-semibold px-3 py-1.5 rounded-full border transition-all duration-200 ${
            isScrolledPastHero
              ? 'bg-[#1F2B1D] text-[#F4EFE6] border-[#1F2B1D] hover:bg-[#2F3D2D]'
              : 'bg-black/25 hover:bg-black/40 text-[#F4EFE6] border-white/40 backdrop-blur-sm'
          }`}
        >
          Portal Admin
        </Link>
        <div className={`transition-colors duration-300 ${reportTextColor}`}>
          <span className="text-xs sm:text-sm font-medium tracking-widest uppercase select-none hidden xs:inline-block">
            SAJADA
          </span>
        </div>

        {/* Sun / Moon Theme Toggle Button - Only visible in hero section */}
        <AnimatePresence>
          {!isScrolledPastHero && (
            <motion.button
              id="theme-toggle-btn"
              type="button"
              onClick={toggleTheme}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8, pointerEvents: 'none' }}
              transition={{ duration: 0.25 }}
              aria-label={isDark ? 'Switch to light theme' : 'Switch to dark theme'}
              title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
              className="p-2 sm:p-2.5 rounded-full border border-white bg-black/20 hover:bg-black/35 transition-colors duration-200 cursor-pointer flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-white/50"
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
                    <Sun className="w-4 h-4 sm:w-4.5 sm:h-4.5 text-white" />
                  </motion.div>
                ) : (
                  <motion.div
                    key="moon-icon"
                    initial={{ rotate: 90, scale: 0.7, opacity: 0 }}
                    animate={{ rotate: 0, scale: 1, opacity: 1 }}
                    exit={{ rotate: -90, scale: 0.7, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="flex items-center justify-center"
                  >
                    <Moon className="w-4 h-4 sm:w-4.5 sm:h-4.5 text-white" />
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.button>
          )}
        </AnimatePresence>
      </div>
    </header>
  );
};


