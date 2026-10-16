'use client';

import React, { useState } from 'react';
import { motion } from 'motion/react';
import {
  Building2,
  GraduationCap,
  Store,
  Home,
  Droplets,
  Flower2,
  Sparkles,
  ThermometerSnowflake,
  SlidersHorizontal,
} from 'lucide-react';
import { IMAGES } from '../assets/images';

interface ArchetypeConfig {
  id: string;
  name: string;
  shortLabel: string;
  icon: React.ComponentType<{ className?: string }>;
  description: string;
  stormwaterPerSqM: number;
  baseSpecies: number;
  speciesMultiplier: number;
  honeyPerSqM: number;
  baseCoolingC: number;
  coolingScale: number;
  highlightInsight: string;
}

const ARCHETYPES: ArchetypeConfig[] = [
  {
    id: 'commercial',
    name: 'Commercial Office',
    shortLabel: 'Commercial Office',
    icon: Building2,
    description: 'Corporate towers & multi-tenant office rooftops with extensive flat sedum arrays.',
    stormwaterPerSqM: 420,
    baseSpecies: 18,
    speciesMultiplier: 0.65,
    honeyPerSqM: 0.165,
    baseCoolingC: 2.4,
    coolingScale: 2.5,
    highlightInsight: 'Cuts peak summer rooftop HVAC loads by ~14% while earning certified London corporate biodiversity credits.',
  },
  {
    id: 'school',
    name: 'School / Academy',
    shortLabel: 'School / Academy',
    icon: GraduationCap,
    description: 'Educational campuses featuring student-accessible nectar planters and biology roofs.',
    stormwaterPerSqM: 385,
    baseSpecies: 22,
    speciesMultiplier: 0.82,
    honeyPerSqM: 0.145,
    baseCoolingC: 2.1,
    coolingScale: 2.3,
    highlightInsight: 'Serves 350+ students in hands-on STEM ecology modules, gifting all harvested honey directly to school breakfast clubs.',
  },
  {
    id: 'market',
    name: 'Public Market',
    shortLabel: 'Public Market',
    icon: Store,
    description: 'Civic market halls and open retail rooftops with integrated rainwater collection.',
    stormwaterPerSqM: 435,
    baseSpecies: 20,
    speciesMultiplier: 0.72,
    honeyPerSqM: 0.205,
    baseCoolingC: 2.8,
    coolingScale: 2.6,
    highlightInsight: 'Lowers ambient pavement heat for bustling public squares while supplying weekly community pantry kitchens.',
  },
  {
    id: 'housing',
    name: 'Housing Estate',
    shortLabel: 'Housing Estate',
    icon: Home,
    description: 'Municipal social housing blocks with communal resident gardening terraces.',
    stormwaterPerSqM: 395,
    baseSpecies: 19,
    speciesMultiplier: 0.78,
    honeyPerSqM: 0.175,
    baseCoolingC: 2.6,
    coolingScale: 2.4,
    highlightInsight: 'Thermally insulates top-floor residences against extreme summer heatwaves and unites multi-generational volunteers.',
  },
];

export const RooftopCalculator: React.FC = () => {
  const [selectedArchetypeId, setSelectedArchetypeId] = useState<string>('commercial');
  const [areaSqM, setAreaSqM] = useState<number>(380);

  const archetype = ARCHETYPES.find((a) => a.id === selectedArchetypeId) || ARCHETYPES[0];

  // Calculated metrics
  const stormwaterLitres = Math.round(areaSqM * archetype.stormwaterPerSqM);
  const nativeSpeciesCount = Math.round(archetype.baseSpecies + Math.sqrt(areaSqM) * archetype.speciesMultiplier);
  const honeyKg = Math.round(areaSqM * archetype.honeyPerSqM * 10) / 10;
  const estimatedJars = Math.round(honeyKg / 0.454);
  const coolingCelsius = (archetype.baseCoolingC + (areaSqM / 1000) * archetype.coolingScale).toFixed(1);

  // Normalized percentages for strata progress bars
  const stormwaterPercent = Math.min(100, Math.max(10, (stormwaterLitres / 435000) * 100));
  const speciesPercent = Math.min(100, Math.max(12, (nativeSpeciesCount / 48) * 100));
  const honeyPercent = Math.min(100, Math.max(10, (honeyKg / 205) * 100));
  const coolingPercent = Math.min(100, Math.max(15, (parseFloat(coolingCelsius) / 5.4) * 100));

  const strataLayers = [
    {
      id: 'atmosphere',
      sublabel: 'Microclimate Cooling',
      metricValue: `-${coolingCelsius}°C`,
      metricDetail: 'Peak roof surface temperature drop',
      icon: ThermometerSnowflake,
      percent: coolingPercent,
      barColor: 'bg-[#48BF84]', // Balanced radiant emerald/mint green
      accentColor: 'text-[#85E7B7]',
      bgImage: IMAGES.strataThermalSky,
      imagePosition: 'object-top', // Align close to top so sky is visible
      altText: 'Atmospheric cool breeze across London green rooftop canopy',
    },
    {
      id: 'canopy',
      sublabel: 'Native Biodiversity',
      metricValue: `${nativeSpeciesCount}`,
      metricUnit: 'species',
      metricDetail: 'Native wildflowers & sedum varieties',
      icon: Flower2,
      percent: speciesPercent,
      barColor: 'bg-[#8EC641]', // Balanced lush meadow chartreuse
      accentColor: 'text-[#C9F08B]',
      bgImage: IMAGES.strataWildflowerCanopy,
      imagePosition: 'object-center', // Centered wildflower blooms
      altText: 'Vibrant native rooftop wildflower meadow in full bloom',
    },
    {
      id: 'apiary',
      sublabel: 'Community Harvest',
      metricValue: `${honeyKg.toFixed(1)} kg`,
      metricDetail: `~${estimatedJars} jars for local food banks`,
      icon: Sparkles,
      percent: honeyPercent,
      barColor: 'bg-[#F3B338]', // Balanced warm golden amber honey
      accentColor: 'text-[#FDE293]',
      bgImage: IMAGES.communityHarvest,
      imagePosition: 'object-center',
      altText: 'Community harvest produce and honey from rooftop gardens',
    },
    {
      id: 'substrate',
      sublabel: 'Stormwater Retention',
      metricValue: `${stormwaterLitres.toLocaleString('en-GB')}`,
      metricUnit: 'L / yr',
      metricDetail: 'Rainwater diverted from Thames sewers',
      icon: Droplets,
      percent: stormwaterPercent,
      barColor: 'bg-[#3EA8C8]', // Balanced clear rainwater azure
      accentColor: 'text-[#9CE1F4]',
      bgImage: IMAGES.strataSubstrateWater,
      imagePosition: 'object-bottom', // Fully anchored to bottom subterranean substrate
      altText: 'Sponge rooftop rainwater retention substrate',
    },
  ];

  return (
    <div
      id="rooftop-strata-calculator"
      className="mt-16 pt-12 border-t border-[#1F2B1D]/15 dark:border-white/15 space-y-10 transition-colors duration-400"
    >
      {/* Editorial Header */}
      <div className="space-y-3 max-w-3xl">
        <p className="text-sm font-medium tracking-wide text-[#657351] dark:text-[#A3B59E]">
          Interactive Simulator
        </p>
        <h3 className="font-display text-3xl sm:text-4xl lg:text-5xl text-[#1F2B1D] dark:text-[#F4EFE6] font-normal leading-[1.08] tracking-tight">
          Environmental Impact Calculator
        </h3>
        <p className="text-base sm:text-lg text-[#3B4D36] dark:text-[#CBD7C7] font-light leading-relaxed">
          Select a London building archetype and scale the rooftop area to forecast real-time returns across four ecological strata.
        </p>
      </div>

      {/* 2-Column Split: Controls on Left, 4 Strata Cards with Photo Backgrounds on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-start">
        {/* LEFT COLUMN: Controls (5 cols on lg) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Step 1: Building Archetype Selector */}
          <div className="space-y-3">
            <label className="block text-xs font-semibold uppercase tracking-wider text-[#1F2B1D] dark:text-[#F4EFE6]">
              1. Select Building Archetype
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-2.5">
              {ARCHETYPES.map((arch) => {
                const IconComponent = arch.icon;
                const isSelected = arch.id === selectedArchetypeId;
                return (
                  <button
                    key={arch.id}
                    type="button"
                    onClick={() => setSelectedArchetypeId(arch.id)}
                    className={`p-3.5 rounded-2xl flex items-center gap-3.5 text-left transition-all duration-200 cursor-pointer border ${
                      isSelected
                        ? 'bg-[#1F2B1D] dark:bg-[#384F35] text-[#F4EFE6] border-[#1F2B1D] dark:border-[#4B6B47] shadow-sm'
                        : 'bg-white/80 dark:bg-[#253924] text-[#243324] dark:text-[#F4EFE6] border-[#243324]/10 dark:border-white/12 hover:border-[#243324]/30 dark:hover:border-white/30 hover:bg-white dark:hover:bg-[#2E452C]'
                    }`}
                  >
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                        isSelected ? 'bg-white/15 text-[#E6C285]' : 'bg-[#1F2B1D]/5 dark:bg-white/10 text-[#657351] dark:text-[#A3B59E]'
                      }`}
                    >
                      <IconComponent className="w-5 h-5" />
                    </div>
                    <div className="min-w-0">
                      <div className="text-sm font-semibold leading-tight truncate">{arch.name}</div>
                      <div
                        className={`text-xs leading-tight pt-0.5 truncate ${
                          isSelected ? 'text-[#F4EFE6]/75' : 'text-[#657351] dark:text-[#A3B59E]'
                        }`}
                      >
                        {arch.id === 'commercial' && 'Offices & Commercial Towers'}
                        {arch.id === 'school' && 'Academy & Student STEM Roofs'}
                        {arch.id === 'market' && 'Trading Halls & Civic Centers'}
                        {arch.id === 'housing' && 'Municipal & Social Housing'}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Step 2: Continuous Rooftop Area Slider */}
          <div className="space-y-4 p-5 rounded-2xl bg-white dark:bg-[#253924] border border-[#243324]/10 dark:border-white/12 shadow-xs transition-colors duration-400">
            <div className="flex justify-between items-baseline">
              <div className="flex items-center gap-2">
                <SlidersHorizontal className="w-4 h-4 text-[#657351] dark:text-[#A3B59E]" />
                <label htmlFor="rooftop-slider" className="text-xs font-semibold uppercase tracking-wider text-[#1F2B1D] dark:text-[#F4EFE6]">
                  2. Rooftop Area
                </label>
              </div>
              <div className="font-display text-2xl text-[#1F2B1D] dark:text-[#F4EFE6] font-normal">
                {areaSqM} <span className="text-sm text-[#657351] dark:text-[#A3B59E] font-sans">m²</span>
              </div>
            </div>

            <div className="space-y-2">
              <input
                id="rooftop-slider"
                type="range"
                min="50"
                max="1000"
                step="10"
                value={areaSqM}
                onChange={(e) => setAreaSqM(Number(e.target.value))}
                className="w-full h-2 bg-[#E2DBD0] dark:bg-[#3B5439] rounded-full appearance-none cursor-pointer accent-[#1F2B1D] dark:accent-[#4A6D47]"
              />
              <div className="flex justify-between text-[11px] text-[#657351] dark:text-[#A3B59E] font-medium px-0.5">
                <span>50 m² (Pocket)</span>
                <span>500 m²</span>
                <span>1,000 m² (Canopy)</span>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Unified Strata Card with 4 Stacked Photo Layers (7 cols on lg) */}
        <div className="lg:col-span-7 space-y-2.5">
          <div className="text-xs font-semibold uppercase tracking-wider text-[#1F2B1D] dark:text-[#F4EFE6] pb-0.5">
            Live Returns by Rooftop Strata
          </div>

          {/* Single Unified Card with Stacked Image Layers */}
          <div className="rounded-3xl overflow-hidden border border-[#1F2B1D]/15 dark:border-white/15 shadow-xl shadow-[#1F2B1D]/10 divide-y divide-white/20">
            {strataLayers.map((layer) => {
              const Icon = layer.icon;
              return (
                <div
                  key={layer.id}
                  className="group relative overflow-hidden transition-all duration-300"
                >
                  {/* Photographic Background Asset with custom alignment */}
                  <img
                    src={layer.bgImage}
                    alt={layer.altText}
                    referrerPolicy="no-referrer"
                    className={`absolute inset-0 w-full h-full object-cover ${layer.imagePosition} group-hover:scale-105 transition-transform duration-700 ease-out`}
                  />

                  {/* Refined botanical dark scrim overlay with soft backdrop blur for rich depth */}
                  <div className="absolute inset-0 bg-gradient-to-r from-black/65 via-[#101B10]/52 to-black/42 backdrop-blur-[1.5px] z-10" />

                  {/* Foreground Content with full opacity high-contrast text */}
                  <div className="relative z-20 p-4 sm:p-5 text-white space-y-3">
                    {/* Top Row: Sublabel & Larger Top-Right Icon */}
                    <div className="flex items-center justify-between gap-4">
                      <div className="text-[11px] font-semibold tracking-wider uppercase text-white/95">
                        {layer.sublabel}
                      </div>
                      <Icon className={`w-6 h-6 ${layer.accentColor}`} />
                    </div>

                    {/* Middle Row: Primary Live Metric & Details */}
                    <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2">
                      <div className="flex items-baseline gap-2">
                        <span className="font-display text-2xl sm:text-3xl lg:text-4xl text-white font-medium tracking-tight drop-shadow-[0_2px_4px_rgba(0,0,0,0.95)]">
                          {layer.metricValue}
                        </span>
                        {layer.metricUnit && (
                          <span className="text-sm font-sans text-white font-normal drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]">
                            {layer.metricUnit}
                          </span>
                        )}
                      </div>
                      <div className="text-xs sm:text-sm text-white font-medium drop-shadow-[0_1px_3px_rgba(0,0,0,0.85)] sm:text-right max-w-xs">
                        {layer.metricDetail}
                      </div>
                    </div>

                    {/* Bottom Row: Dynamic Strata Progress Bar with Solid Crisp White Track */}
                    <div className="pt-0.5">
                      <div className="h-2 w-full rounded-full bg-white overflow-hidden shadow-xs">
                        <motion.div
                          className={`h-full rounded-full ${layer.barColor}`}
                          initial={{ width: 0 }}
                          animate={{ width: `${layer.percent}%` }}
                          transition={{ type: 'spring', stiffness: 85, damping: 22 }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
