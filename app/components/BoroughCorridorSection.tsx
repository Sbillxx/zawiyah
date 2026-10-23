'use client';

import React, { useState, useRef, useMemo } from 'react';
import { motion, useScroll, AnimatePresence } from 'motion/react';
import { MapPin, BarChart3, ZoomIn, ZoomOut, Compass } from 'lucide-react';
import { AnimatedNumber } from './AnimatedNumber';
import { BOROUGHS_DATA, REPORT_METADATA } from '../data/reportData';
import { BOROUGH_METRICS } from '../data/londonMapData';
import { LondonPollinatorMap } from './LondonPollinatorMap';

export const BoroughCorridorSection: React.FC = () => {
  const [selectedBorough, setSelectedBorough] = useState<string | null>(null);
  const [hoveredBorough, setHoveredBorough] = useState<string | null>(null);
  const [activeListIndex, setActiveListIndex] = useState<number>(0);
  const [viewMode, setViewMode] = useState<'map' | 'list'>('map');
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const containerRef = useRef<HTMLDivElement>(null);
  const cardContainerRef = useRef<HTMLDivElement>(null);

  useScroll({
    target: containerRef,
    offset: ['start end', 'end start'],
  });

  const activeBoroughInList = BOROUGHS_DATA[activeListIndex] || BOROUGHS_DATA[0];

  const handleSelectBoroughFromMap = (name: string | null) => {
    setSelectedBorough(name);
    if (name) {
      const idx = BOROUGHS_DATA.findIndex(
        (b) => b.borough.toLowerCase() === name.toLowerCase()
      );
      if (idx !== -1) {
        setActiveListIndex(idx);
      }
    }
  };

  const handleSelectBoroughFromList = (idx: number) => {
    setActiveListIndex(idx);
    const selected = BOROUGHS_DATA[idx];
    if (selected) {
      setSelectedBorough(selected.borough);
    }
  };

  const scrollToCardTop = () => {
    if (cardContainerRef.current && typeof window !== 'undefined') {
      const cardTop = cardContainerRef.current.getBoundingClientRect().top + window.scrollY - 75;
      window.scrollTo({ top: Math.max(0, cardTop), behavior: 'smooth' });
    }
  };

  const handleSwitchToMap = () => {
    setViewMode('map');
    if (cardContainerRef.current && typeof window !== 'undefined') {
      const cardTop = cardContainerRef.current.getBoundingClientRect().top + window.scrollY - 75;
      if (window.scrollY > cardTop) {
        window.scrollTo({ top: Math.max(0, cardTop), behavior: 'smooth' });
      }
    }
  };

  const handleViewBoroughOnMap = (boroughName: string) => {
    setSelectedBorough(boroughName);
    setViewMode('map');
    scrollToCardTop();
  };

  const handleZoomIn = () => setZoomLevel((prev) => Math.min(prev + 0.25, 2.5));
  const handleZoomOut = () => setZoomLevel((prev) => Math.max(prev - 0.25, 0.85));

  // Compute active display info for the bottom dark green bar
  const activeMetricsDisplay = useMemo(() => {
    const targetName = hoveredBorough || selectedBorough;
    if (targetName) {
      const key = targetName.toLowerCase();
      const metrics = BOROUGH_METRICS[key];
      if (metrics) {
        return {
          title: `${metrics.name} Borough Overview`,
          stats: `${metrics.sites} Sanctuaries • ${metrics.hives} Hives • ${metrics.wildflowerAreaSqM.toLocaleString('en-GB')} m² Wildflower Meadow • ${metrics.jarsDonated.toLocaleString('en-GB')} Donated Jars`,
        };
      }
      // Fallback lookup from BOROUGHS_DATA
      const item = BOROUGHS_DATA.find((b) => b.borough.toLowerCase() === targetName.toLowerCase());
      if (item) {
        return {
          title: `${item.borough} Borough Overview`,
          stats: `${item.sites} Sanctuaries • ${item.hives} Hives`,
        };
      }
    }

    return {
      title: 'All 11 Active Boroughs Overview',
      stats: `${REPORT_METADATA.totalSites} Sanctuaries • ${REPORT_METADATA.totalHives} Hives • ${REPORT_METADATA.meadowAreaSqM.toLocaleString('en-GB')} m² Wildflower Meadow • ${REPORT_METADATA.jarsDonated.toLocaleString('en-GB')} Donated Jars`,
    };
  }, [hoveredBorough, selectedBorough]);

  return (
    <section
      id="ecological-connectivity"
      ref={containerRef}
      className="relative min-h-screen py-20 sm:py-28 px-4 sm:px-8 lg:px-12 flex flex-col justify-center border-t border-[#243324]/10 dark:border-white/10 bg-[#F5F2EB] dark:bg-[#182417] text-[#243324] dark:text-[#F4EFE6] transition-colors duration-400"
    >
      <div className="max-w-6xl mx-auto w-full space-y-8 sm:space-y-10">
        {/* Section Headline / Strategic Context */}
        <div className="space-y-4 max-w-3xl">
          <p className="text-sm font-medium tracking-wide text-[#657351] dark:text-[#A3B59E]">
            Ecological Connectivity & Corridors
          </p>
          <h2 className="font-display text-4xl sm:text-5xl lg:text-6xl text-[#1F2B1D] dark:text-[#F4EFE6] font-normal leading-[1.05] tracking-tight">
            London’s fragmented rooftops are now a continuous pollinator highway.
          </h2>
          <p className="text-base sm:text-lg text-[#4A5D44] dark:text-[#D2CBBF] font-light leading-relaxed">
            By situating wildflower meadows within 2 km of royal parks and river corridors, 194 active hives connect 11 municipal boroughs into safe foraging networks.
          </p>
        </div>

        {/* Integrated Card Container Outlined with Dark Green (Background matching Hero Section #FBF9F5, soft shadow like Sector cards) */}
        <div
          ref={cardContainerRef}
          className="w-full bg-[#FBF9F5] dark:bg-[#152014] rounded-3xl sm:rounded-[2.5rem] border-2 border-[#243324] dark:border-[#384F35] shadow-lg overflow-hidden flex flex-col transition-colors duration-400"
        >
          {/* Left-Aligned Control Bar (Clean with NO dividing border line below) */}
          <div className="px-5 pt-5 pb-3 sm:px-8 sm:pt-6 sm:pb-4 flex flex-wrap items-center justify-between gap-4 bg-[#FBF9F5] dark:bg-[#152014] transition-colors duration-400">
            {/* Left-Aligned View Switcher */}
            <div className="flex items-center bg-white/90 dark:bg-[#202E1E] backdrop-blur-md rounded-2xl border border-[#243324]/15 dark:border-white/15 p-1 shadow-2xs gap-1">
              <button
                onClick={handleSwitchToMap}
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs sm:text-sm font-medium transition-all cursor-pointer ${viewMode === 'map'
                    ? 'bg-[#243324] dark:bg-[#344732] text-white dark:text-[#F4EFE6] shadow-xs'
                    : 'text-[#4A5D44] dark:text-[#CBD7C7] hover:text-[#1F2B1D] dark:hover:text-white hover:bg-[#F5F2EB] dark:hover:bg-[#2A3D28]'
                  }`}
              >
                <MapPin className="w-3.5 h-3.5" />
                <span>Interactive Map (52 Sites)</span>
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs sm:text-sm font-medium transition-all cursor-pointer ${viewMode === 'list'
                    ? 'bg-[#243324] dark:bg-[#344732] text-white dark:text-[#F4EFE6] shadow-xs'
                    : 'text-[#4A5D44] dark:text-[#CBD7C7] hover:text-[#1F2B1D] dark:hover:text-white hover:bg-[#F5F2EB] dark:hover:bg-[#2A3D28]'
                  }`}
              >
                <BarChart3 className="w-3.5 h-3.5" />
                <span>Borough Breakdown</span>
              </button>
            </div>

            {/* Right-Aligned Zoom Controls */}
            {viewMode === 'map' && (
              <div className="flex items-center bg-white/90 dark:bg-[#202E1E] backdrop-blur-md rounded-2xl border border-[#243324]/15 dark:border-white/15 p-1 shadow-2xs gap-1">
                <button
                  onClick={handleZoomIn}
                  className="p-1.5 text-[#243324] dark:text-[#F4EFE6] hover:bg-[#F5F2EB] dark:hover:bg-[#2A3D28] rounded-xl transition-colors cursor-pointer"
                  title="Zoom In"
                  aria-label="Zoom In"
                >
                  <ZoomIn className="w-4 h-4" />
                </button>
                <button
                  onClick={handleZoomOut}
                  className="p-1.5 text-[#243324] dark:text-[#F4EFE6] hover:bg-[#F5F2EB] dark:hover:bg-[#2A3D28] rounded-xl transition-colors cursor-pointer"
                  title="Zoom Out"
                  aria-label="Zoom Out"
                >
                  <ZoomOut className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>

          {/* Card Body: Map View or Borough Breakdown List */}
          <div className="relative w-full flex-1 bg-[#FBF9F5] dark:bg-[#152014] transition-colors duration-400">
            <AnimatePresence mode="wait">
              {viewMode === 'map' ? (
                <motion.div
                  key="map-content"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <LondonPollinatorMap
                    selectedBoroughName={selectedBorough}
                    onSelectBorough={handleSelectBoroughFromMap}
                    onHoverBorough={setHoveredBorough}
                    zoomLevel={zoomLevel}
                    onZoomIn={handleZoomIn}
                    onZoomOut={handleZoomOut}
                  />
                </motion.div>
              ) : (
                <motion.div
                  key="list-content"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="p-6 sm:p-8 lg:p-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start bg-[#FBF9F5] dark:bg-[#152014] transition-colors duration-400"
                >
                  {/* Borough Ranking & Selector */}
                  <div className="lg:col-span-7 space-y-3">
                    {BOROUGHS_DATA.map((item, idx) => {
                      const isSelected = activeListIndex === idx;
                      const barWidthPercent = (item.hives / 27) * 100;

                      return (
                        <button
                          key={item.borough}
                          onClick={() => handleSelectBoroughFromList(idx)}
                          className={`w-full text-left p-4 sm:p-5 rounded-2xl transition-all duration-200 flex items-center justify-between gap-4 cursor-pointer ${isSelected
                              ? 'bg-white dark:bg-[#223320] shadow-md border border-[#243324]/12 dark:border-white/20 scale-[1.01]'
                              : 'hover:bg-white/60 dark:hover:bg-[#1F2F1D] border border-[#243324]/6 dark:border-white/10 bg-white/40 dark:bg-[#1C2A1B]/60'
                            }`}
                        >
                          <div className="flex-1 space-y-1.5">
                            <div className="flex items-center justify-between text-sm sm:text-base font-medium text-[#1F2B1D] dark:text-[#F4EFE6]">
                              <span>{item.borough}</span>
                              <span className="font-light text-[#657351] dark:text-[#A3B59E]">{item.sites} sites</span>
                            </div>

                            {/* Proportional visual bar */}
                            <div className="w-full h-2 bg-[#243324]/10 dark:bg-white/15 rounded-full overflow-hidden">
                              <motion.div
                                className="h-full rounded-full bg-[#3B4D36] dark:bg-[#85E7B7]"
                                initial={{ width: 0 }}
                                animate={{ width: `${barWidthPercent}%` }}
                                transition={{ type: 'spring', stiffness: 100, damping: 20 }}
                              />
                            </div>
                          </div>

                          <div className="text-right shrink-0 pl-2">
                            <span className="font-display text-2xl sm:text-3xl text-[#1F2B1D] dark:text-[#F4EFE6] font-normal">
                              {item.hives}
                            </span>
                            <span className="block text-xs text-[#657351] dark:text-[#A3B59E]">hives</span>
                          </div>
                        </button>
                      );
                    })}
                  </div>

                  {/* Dynamic Borough Insight Panel */}
                  <div className="lg:col-span-5 lg:sticky lg:top-28 space-y-6">
                    <motion.div
                      key={activeBoroughInList.borough}
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ type: 'spring', stiffness: 120, damping: 20 }}
                      className="p-7 sm:p-8 rounded-3xl bg-white dark:bg-[#202E1E] border border-[#243324]/10 dark:border-white/15 shadow-md space-y-6 transition-colors duration-400"
                    >
                      <div className="space-y-1.5">
                        <p className="text-xs font-medium uppercase tracking-wider text-[#657351] dark:text-[#A3B59E]">
                          Borough Focus
                        </p>
                        <h3 className="font-display text-3xl sm:text-4xl text-[#1F2B1D] dark:text-[#F4EFE6]">
                          {activeBoroughInList.borough}
                        </h3>
                      </div>

                      <div className="grid grid-cols-2 gap-4 py-4 border-y border-[#243324]/10 dark:border-white/10">
                        <div>
                          <div className="font-display text-3xl sm:text-4xl text-[#1F2B1D] dark:text-[#F4EFE6]">
                            <AnimatedNumber value={activeBoroughInList.hives} />
                          </div>
                          <p className="text-xs text-[#657351] dark:text-[#A3B59E]">Active Hives</p>
                        </div>
                        <div>
                          <div className="font-display text-3xl sm:text-4xl text-[#1F2B1D] dark:text-[#F4EFE6]">
                            <AnimatedNumber value={activeBoroughInList.sites} />
                          </div>
                          <p className="text-xs text-[#657351] dark:text-[#A3B59E]">Rooftop Sanctuaries</p>
                        </div>
                      </div>

                      <p className="text-sm sm:text-base text-[#3B4D36] dark:text-[#D2CBBF] font-light leading-relaxed">
                        {activeBoroughInList.description}
                      </p>

                      <div className="pt-1 text-xs text-[#657351] dark:text-[#A3B59E] font-light">
                        Contributes to continuous cross-borough pollinator stepping stones within 2km foraging radius.
                      </div>

                      <button
                        onClick={() => handleViewBoroughOnMap(activeBoroughInList.borough)}
                        className="w-full py-3 px-4 rounded-xl bg-[#F5F2EB] dark:bg-[#2C3E2A] hover:bg-[#E8EFE6] dark:hover:bg-[#374D34] text-[#243324] dark:text-[#F4EFE6] font-medium text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer border border-[#243324]/10 dark:border-white/15"
                      >
                        <Compass className="w-3.5 h-3.5 text-[#3B4D36] dark:text-[#85E7B7]" />
                        <span>View {activeBoroughInList.borough} on Map</span>
                      </button>
                    </motion.div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Integrated Bottom Summary Card (Dark green background with sand/white text, live hover/selection updates) */}
          <div className="w-full bg-[#243324] dark:bg-[#0E170E] px-6 py-4.5 sm:px-8 sm:py-5 text-[#F5F2EB] flex items-center justify-between gap-3 border-t-2 border-[#243324] dark:border-[#384F35] mt-auto min-h-[72px] transition-colors duration-400">
            <div className="space-y-0.5">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeMetricsDisplay.title}
                  initial={{ opacity: 0, y: 3 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -3 }}
                  transition={{ duration: 0.15 }}
                >
                  <span className="text-xs font-semibold text-[#A3B899] dark:text-[#85E7B7] uppercase tracking-wider block">
                    {activeMetricsDisplay.title}
                  </span>
                  <p className="text-xs sm:text-sm text-[#F5F2EB] font-medium">
                    {activeMetricsDisplay.stats}
                  </p>
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
