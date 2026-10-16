'use client';

import React, { useRef } from 'react';
import { motion, useScroll, useTransform } from 'motion/react';
import { AnimatedNumber } from './AnimatedNumber';
import { REPORT_METADATA } from '../data/reportData';
import { IMAGES } from '../assets/images';

export const FoodSharingSection: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start end', 'end start'],
  });

  const imageScale = useTransform(scrollYProgress, [0, 0.5, 1], [0.95, 1, 0.98]);

  return (
    <section
      ref={containerRef}
      className="relative min-h-screen py-24 px-4 sm:px-8 lg:px-12 flex flex-col justify-center border-t border-[#243324]/10 dark:border-white/10 bg-[#FBF9F5] dark:bg-[#131D12] text-[#243324] dark:text-[#F4EFE6] transition-colors duration-400"
    >
      <div className="max-w-6xl mx-auto w-full space-y-16">
        {/* Headline */}
        <div className="space-y-4 max-w-4xl">
          <p className="text-sm font-medium tracking-wide text-[#657351] dark:text-[#A3B59E]">
            Food Equity
          </p>
          <h2 className="font-display text-4xl sm:text-6xl lg:text-7xl text-[#1F2B1D] dark:text-[#F4EFE6] font-normal leading-[1.02] tracking-tight">
            Turning pure London honey into nourishing food for local neighbours.
          </h2>
          <p className="text-lg sm:text-xl text-[#4A5D44] dark:text-[#CBD7C7] font-light leading-relaxed">
            Rather than selling honey exclusively at high-end boutiques, our community harvest model routes thousands of jars directly to Southwark, Islington, and Hackney food pantries.
          </p>
        </div>

        {/* Visual & Metric Integration */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Main Visual */}
          <motion.div
            style={{ scale: imageScale }}
            className="lg:col-span-6 h-[440px] sm:h-[520px] rounded-[2.5rem] sm:rounded-[3.5rem] overflow-hidden shadow-lg relative"
          >
            <img
              src={IMAGES.honeyHarvest}
              alt="Hands lifting fresh golden honey frame in rooftop apiary"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#1F2B1D]/75 via-transparent to-transparent" />
            <div className="absolute bottom-8 left-8 right-8 text-white">
              <p className="font-display text-2xl sm:text-3xl font-light">
                Unfiltered, cold-extracted honey rich in native London pollen.
              </p>
            </div>
          </motion.div>

          {/* Impact Stats */}
          <div className="lg:col-span-6 space-y-6">
            <div className="p-8 sm:p-10 rounded-[2.5rem] bg-[#F5F2EB] dark:bg-[#233522] border border-[#243324]/10 dark:border-white/12 shadow-sm space-y-3 transition-colors duration-400">
              <div className="font-display text-5xl sm:text-6xl text-[#1F2B1D] dark:text-[#F4EFE6] font-light tracking-tight">
                <AnimatedNumber value={REPORT_METADATA.jarsDonated} />
              </div>
              <p className="text-base text-[#1F2B1D] dark:text-[#F4EFE6] font-medium">Jars Donated to Food Banks</p>
              <p className="text-sm text-[#4A5D44] dark:text-[#CBD7C7] font-light leading-relaxed">
                Directly distributed to local families facing food insecurity, accompanied by nutritional and wildflower guides.
              </p>
            </div>

            <div className="p-8 sm:p-10 rounded-[2.5rem] bg-[#F5F2EB] dark:bg-[#233522] border border-[#243324]/10 dark:border-white/12 shadow-sm space-y-3 transition-colors duration-400">
              <div className="font-display text-5xl sm:text-6xl text-[#1F2B1D] dark:text-[#F4EFE6] font-light tracking-tight">
                <AnimatedNumber value={REPORT_METADATA.honeyHarvestKg} suffix=" kg" />
              </div>
              <p className="text-base text-[#1F2B1D] dark:text-[#F4EFE6] font-medium">Total 2026 Raw Harvest</p>
              <p className="text-sm text-[#4A5D44] dark:text-[#CBD7C7] font-light leading-relaxed">
                Extracted sustainably leaving at least 15 kg of surplus winter honey inside each hive for winter colony sustenance.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
