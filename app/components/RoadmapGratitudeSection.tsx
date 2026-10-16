'use client';

import React from 'react';
import { motion } from 'motion/react';
import { STRATEGIC_ROADMAP, REPORT_METADATA } from '../data/reportData';

export const RoadmapGratitudeSection: React.FC = () => {
  return (
    <section className="relative min-h-screen py-24 px-4 sm:px-8 lg:px-12 flex flex-col justify-center border-t border-[#243324]/10 dark:border-white/10 bg-white dark:bg-[#131D12] text-[#243324] dark:text-[#F4EFE6] transition-colors duration-400">
      <div className="max-w-6xl mx-auto w-full space-y-20">
        {/* Section Headline */}
        <div className="space-y-4 max-w-4xl">
          <p className="text-sm font-medium tracking-wide text-[#657351] dark:text-[#A3B59E]">
            Strategic Horizons
          </p>
          <h2 className="font-display text-4xl sm:text-6xl lg:text-7xl text-[#1F2B1D] dark:text-[#F4EFE6] font-normal leading-[1.02] tracking-tight">
            Our 2027 vision for a greener, wilder London.
          </h2>
          <p className="text-lg sm:text-xl text-[#4A5D44] dark:text-[#CBD7C7] font-light leading-relaxed">
            Four key commitments to expand bio-corridors into underserved neighborhoods and launch accredited green apprenticeships.
          </p>
        </div>

        {/* 4 Strategic Pillars - Sandstone Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
          {STRATEGIC_ROADMAP.map((goal, idx) => (
            <motion.div
              key={goal.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-40px' }}
              transition={{ type: 'spring', stiffness: 100, damping: 20, delay: idx * 0.08 }}
              className="p-8 sm:p-10 rounded-[2.5rem] bg-[#F5F2EB] dark:bg-[#233522] border border-[#243324]/10 dark:border-white/12 shadow-sm space-y-4 flex flex-col justify-between transition-colors duration-400"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold uppercase tracking-wider text-[#657351] dark:text-[#A3B59E]">
                    {goal.pillar}
                  </span>
                </div>
                <h3 className="font-display text-2xl sm:text-3xl text-[#1F2B1D] dark:text-[#F4EFE6]">
                  {goal.title}
                </h3>
                <p className="text-base text-[#4A5D44] dark:text-[#CBD7C7] font-light leading-relaxed">
                  {goal.description}
                </p>
              </div>

              <div className="pt-4 border-t border-[#243324]/10 dark:border-white/10 flex items-baseline justify-between">
                <span className="text-xs text-[#657351] dark:text-[#A3B59E] uppercase tracking-wider">Pledge Target</span>
                <span className="font-display text-2xl sm:text-3xl text-[#1F2B1D] dark:text-[#F4EFE6] font-medium">
                  {goal.metric}
                </span>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Founder Letter / Closing Statement */}
        <div className="p-10 sm:p-14 rounded-[2.5rem] sm:rounded-[3.5rem] bg-[#1F2B1D] dark:bg-[#1E2E1D] text-white shadow-xl space-y-8 border border-transparent dark:border-white/10 transition-colors duration-400">
          <div className="max-w-3xl space-y-6">
            <blockquote className="font-display text-2xl sm:text-4xl text-white dark:text-[#F4EFE6] font-light leading-snug">
              “{REPORT_METADATA.founderQuote}”
            </blockquote>
            <div>
              <p className="text-lg font-medium text-[#E8DCC4]">{REPORT_METADATA.founder}</p>
              <p className="text-sm text-white/70 dark:text-[#F4EFE6]/70 font-light">{REPORT_METADATA.founderTitle}</p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <footer className="pt-8 border-t border-[#243324]/10 dark:border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#657351] dark:text-[#A3B59E] font-light">
          <p>© 2026 The Urban Hive Project. Registered UK Charity {REPORT_METADATA.charityNumber}.</p>
          <p>Crafted for London’s living urban ecosystem.</p>
        </footer>
      </div>
    </section>
  );
};
