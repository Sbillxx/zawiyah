'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { SECTOR_DATA } from '../data/reportData';
import { RooftopCalculator } from './RooftopCalculator';

export const SectorImpactSection: React.FC = () => {
  const [selectedType, setSelectedType] = useState<string>(SECTOR_DATA[0].buildingType);
  const selectedSector = SECTOR_DATA.find((s) => s.buildingType === selectedType) || SECTOR_DATA[0];

  return (
    <section className="relative min-h-screen py-24 px-4 sm:px-8 lg:px-12 flex flex-col justify-center border-t border-[#243324]/10 dark:border-white/10 bg-[#F5F2EB] dark:bg-[#182417] text-[#243324] dark:text-[#F4EFE6] transition-colors duration-400">
      <div className="max-w-6xl mx-auto w-full space-y-12">
        {/* Headline */}
        <div className="space-y-4 max-w-4xl">
          <p className="text-sm font-medium tracking-wide text-[#657351] dark:text-[#A3B59E]">
            Sector Ecosystem
          </p>
          <h2 className="font-display text-4xl sm:text-6xl lg:text-7xl text-[#1F2B1D] dark:text-[#F4EFE6] font-normal leading-[1.02] tracking-tight">
            Commercial rooftops fund educational and civic biodiversity.
          </h2>
          <p className="text-lg sm:text-xl text-[#4A5D44] dark:text-[#CBD7C7] font-light leading-relaxed">
            Corporate office partnerships and luxury hotel apiaries generated £280,500 in sponsorships and 2.6 tonnes of honey, directly funding outdoor learning labs for schools and shared neighborhood gardens.
          </p>
        </div>

        {/* Sector Navigation Strip */}
        <div className="flex flex-wrap gap-2 sm:gap-3">
          {SECTOR_DATA.map((sector) => {
            const isSelected = selectedType === sector.buildingType;
            return (
              <button
                key={sector.buildingType}
                onClick={() => setSelectedType(sector.buildingType)}
                className={`px-5 py-3 rounded-full text-sm font-medium transition-all duration-200 cursor-pointer ${
                  isSelected
                    ? 'bg-[#1F2B1D] dark:bg-[#384E36] text-white dark:text-[#F4EFE6] shadow-sm'
                    : 'bg-white dark:bg-[#263925] text-[#3B4D36] dark:text-[#E2EBE0] hover:bg-white/80 dark:hover:bg-[#30482F] border border-[#243324]/10 dark:border-white/12'
                }`}
              >
                {sector.buildingType}
              </button>
            );
          })}
        </div>

        {/* Detailed Sector Spotlight Card - Slides in from right */}
        <AnimatePresence mode="wait">
          <motion.div
            key={selectedSector.buildingType}
            initial={{ opacity: 0, x: 60 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -60 }}
            transition={{ type: 'spring', stiffness: 120, damping: 20 }}
            className="p-8 sm:p-12 rounded-[2.5rem] bg-white dark:bg-[#243723] border border-[#243324]/10 dark:border-white/12 shadow-lg space-y-8 transition-colors duration-400"
          >
            <div className="flex flex-col md:flex-row md:items-baseline justify-between gap-4 border-b border-[#243324]/10 dark:border-white/10 pb-6">
              <div>
                <h3 className="font-display text-3xl sm:text-5xl text-[#1F2B1D] dark:text-[#F4EFE6]">
                  {selectedSector.buildingType}
                </h3>
                <p className="text-base sm:text-lg text-[#4A5D44] dark:text-[#CBD7C7] font-light pt-1">
                  {selectedSector.primaryRole}
                </p>
              </div>
              <div className="text-right">
                <span className="font-display text-4xl sm:text-5xl text-[#1F2B1D] dark:text-[#F4EFE6]">
                  {selectedSector.sites}
                </span>
                <span className="block text-xs uppercase tracking-wider text-[#657351] dark:text-[#A3B59E]">
                  Partner Locations
                </span>
              </div>
            </div>

            {/* 4-Stat Core Breakdown */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
              <div className="space-y-1">
                <div className="font-display text-3xl sm:text-4xl text-[#1F2B1D] dark:text-[#F4EFE6]">
                  {selectedSector.hives}
                </div>
                <p className="text-sm font-medium text-[#1F2B1D] dark:text-[#F4EFE6]">Active Hives</p>
                <p className="text-xs text-[#657351] dark:text-[#A3B59E]">Colonies managed</p>
              </div>

              <div className="space-y-1">
                <div className="font-display text-3xl sm:text-4xl text-[#1F2B1D] dark:text-[#F4EFE6]">
                  {selectedSector.wildflowerArea.toLocaleString('en-GB')} m²
                </div>
                <p className="text-sm font-medium text-[#1F2B1D] dark:text-[#F4EFE6]">Meadow Canopy</p>
                <p className="text-xs text-[#657351] dark:text-[#A3B59E]">Planted roof area</p>
              </div>

              <div className="space-y-1">
                <div className="font-display text-3xl sm:text-4xl text-[#1F2B1D] dark:text-[#F4EFE6]">
                  {selectedSector.honeyHarvestKg.toLocaleString('en-GB', { minimumFractionDigits: 1, maximumFractionDigits: 1 })} kg
                </div>
                <p className="text-sm font-medium text-[#1F2B1D] dark:text-[#F4EFE6]">Raw Harvest</p>
                <p className="text-xs text-[#657351] dark:text-[#A3B59E]">High-grade wildflower honey</p>
              </div>

              <div className="space-y-1">
                <div className="font-display text-3xl sm:text-4xl text-[#1F2B1D] dark:text-[#F4EFE6]">
                  £{selectedSector.corporateSponsorship.toLocaleString('en-GB')}
                </div>
                <p className="text-sm font-medium text-[#1F2B1D] dark:text-[#F4EFE6]">Direct Funding</p>
                <p className="text-xs text-[#657351] dark:text-[#A3B59E]">Charitable sponsorship</p>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Dynamic Rooftop Sanctuary Environmental Impact Calculator */}
        <RooftopCalculator />
      </div>
    </section>
  );
};
