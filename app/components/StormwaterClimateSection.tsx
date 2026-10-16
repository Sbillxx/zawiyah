'use client';

import React, { useRef } from 'react';
import { motion, useScroll, useTransform } from 'motion/react';
import { REPORT_METADATA } from '../data/reportData';
import { IMAGES } from '../assets/images';

export const StormwaterClimateSection: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start end', 'end start'],
  });

  const imageY = useTransform(scrollYProgress, [0, 1], ['-22%', '0%'], { clamp: true });

  return (
    <section
      ref={containerRef}
      className="relative min-h-screen py-24 px-4 sm:px-8 lg:px-12 flex flex-col justify-center border-t border-[#243324]/10 dark:border-white/10 bg-[#FBF9F5] dark:bg-[#131D12] text-[#243324] dark:text-[#F4EFE6] transition-colors duration-400"
    >
      <div className="max-w-6xl mx-auto w-full space-y-16">
        {/* Section Headline */}
        <div className="space-y-4 max-w-4xl">
          <p className="text-sm font-medium tracking-wide text-[#657351] dark:text-[#A3B59E]">
            Climate Resilience
          </p>
          <h2 className="font-display text-4xl sm:text-6xl lg:text-7xl text-[#1F2B1D] dark:text-[#F4EFE6] font-normal leading-[1.02] tracking-tight">
            Urban sponge roofs absorb stormwater before it overwhelms London.
          </h2>
          <p className="text-lg sm:text-xl text-[#4A5D44] dark:text-[#CBD7C7] font-light leading-relaxed">
            By planting living soil and hardy wildflowers over bare rooftop asphalt, our 52 sanctuaries act as natural rain sponges and cool the surrounding city air.
          </p>
        </div>

        {/* Visual & Metrics Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Main Visual Image with Parallax Scroll */}
          <div className="lg:col-span-7 h-[420px] sm:h-[500px] rounded-[2.5rem] sm:rounded-[3.5rem] overflow-hidden shadow-lg relative bg-[#1F2B1D]">
            <motion.img
              style={{ y: imageY }}
              src={IMAGES.rooftopHaven}
              alt="Engineered green roof with sedum mats and bio-swales"
              className="absolute top-0 left-0 w-full h-[135%] object-cover object-center max-w-none will-change-transform"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#1F2B1D]/80 via-transparent to-transparent pointer-events-none z-10" />
            <div className="absolute bottom-8 left-8 right-8 text-white z-20">
              <p className="font-display text-2xl sm:text-3xl font-light">
                Lowering building thermal gain by 3.8°C during peak summer heat waves.
              </p>
            </div>
          </div>

          {/* Key Metric Highlights - Slide in from right */}
          <div className="lg:col-span-5 space-y-8">
            <motion.div
              initial={{ opacity: 0, x: 60 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: '-50px' }}
              transition={{ duration: 0.7, ease: [0.21, 0.47, 0.32, 0.98] }}
              className="p-8 sm:p-10 rounded-[2.5rem] bg-[#F5F2EB] dark:bg-[#233522] border border-[#243324]/10 dark:border-white/12 shadow-sm space-y-3 transition-colors duration-400"
            >
              <div className="font-display text-5xl sm:text-6xl text-[#1F2B1D] dark:text-[#F4EFE6] font-light tracking-tight">
                {REPORT_METADATA.stormwaterLitres.toLocaleString('en-GB')} L
              </div>
              <p className="text-base text-[#1F2B1D] dark:text-[#F4EFE6] font-medium">Stormwater Captured in 2026</p>
              <p className="text-sm text-[#4A5D44] dark:text-[#CBD7C7] font-light leading-relaxed">
                Filtered and slowly released through root zones, preventing municipal sewer overflow into the River Thames.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 60 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: '-50px' }}
              transition={{ duration: 0.7, delay: 0.15, ease: [0.21, 0.47, 0.32, 0.98] }}
              className="p-8 sm:p-10 rounded-[2.5rem] bg-[#F5F2EB] dark:bg-[#233522] border border-[#243324]/10 dark:border-white/12 shadow-sm space-y-3 transition-colors duration-400"
            >
              <div className="font-display text-5xl sm:text-6xl text-[#1F2B1D] dark:text-[#F4EFE6] font-light tracking-tight">
                24.6
              </div>
              <p className="text-base text-[#1F2B1D] dark:text-[#F4EFE6] font-medium">Native Plant Species Per Roof</p>
              <p className="text-sm text-[#4A5D44] dark:text-[#CBD7C7] font-light leading-relaxed">
                Borage, wild marjoram, bird’s-foot trefoil, and viper’s bugloss providing nectar from March to late October.
              </p>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
};

