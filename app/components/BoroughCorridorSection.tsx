'use client';

import React, { useState, useRef, useMemo } from 'react';
import { motion, useScroll, AnimatePresence } from 'motion/react';
import { MapPin, BarChart3, ZoomIn, ZoomOut, Compass, Users, Building2, HeartHandshake } from 'lucide-react';
import { AnimatedNumber } from './AnimatedNumber';
import {
  REGIONAL_CLUSTERS,
  ZAWIYAH_NODES,
  RegionalCluster,
} from '../data/indonesiaMapData';
import { IndonesiaZawiyahMap } from './IndonesiaZawiyahMap';

export const BoroughCorridorSection: React.FC = () => {
  const [selectedCluster, setSelectedCluster] = useState<string | null>(null);
  const [hoveredCluster, setHoveredCluster] = useState<string | null>(null);
  const [activeListIndex, setActiveListIndex] = useState<number>(0);
  const [viewMode, setViewMode] = useState<'map' | 'list'>('map');
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const containerRef = useRef<HTMLDivElement>(null);
  const cardContainerRef = useRef<HTMLDivElement>(null);

  useScroll({
    target: containerRef,
    offset: ['start end', 'end start'],
  });

  const activeClusterInList = REGIONAL_CLUSTERS[activeListIndex] || REGIONAL_CLUSTERS[0];

  const handleSelectClusterFromMap = (name: string | null) => {
    setSelectedCluster(name);
    if (name) {
      const idx = REGIONAL_CLUSTERS.findIndex(
        (c) => c.nama.toLowerCase().includes(name.toLowerCase()) || name.toLowerCase().includes(c.singkatan.toLowerCase())
      );
      if (idx !== -1) {
        setActiveListIndex(idx);
      }
    }
  };

  const handleSelectClusterFromList = (idx: number) => {
    setActiveListIndex(idx);
    const selected = REGIONAL_CLUSTERS[idx];
    if (selected) {
      setSelectedCluster(selected.nama);
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

  const handleViewClusterOnMap = (clusterName: string) => {
    setSelectedCluster(clusterName);
    setViewMode('map');
    scrollToCardTop();
  };

  const handleZoomIn = () => setZoomLevel((prev) => Math.min(prev + 0.25, 2.5));
  const handleZoomOut = () => setZoomLevel((prev) => Math.max(prev - 0.25, 0.85));
  const handleResetZoom = () => setZoomLevel(1);

  // Compute active display info for the bottom dark green bar
  const activeMetricsDisplay = useMemo(() => {
    const targetName = hoveredCluster || selectedCluster;
    if (targetName) {
      const cluster = REGIONAL_CLUSTERS.find(
        (c) => c.nama.toLowerCase().includes(targetName.toLowerCase()) ||
               c.singkatan.toLowerCase().includes(targetName.toLowerCase())
      );
      if (cluster) {
        return {
          title: `Wilayah ${cluster.nama}`,
          stats: `${cluster.totalCabang} Cabang Zawiyah • ${cluster.totalJamaah.toLocaleString('id-ID')} Jamaah Terdata • ${cluster.donaturAgnia} Donatur Agnia Care • Pusat: ${cluster.pusatWilayah}`,
        };
      }
    }

    return {
      title: 'Distribusi Jaringan 86 Cabang Zawiyah Nusantara',
      stats: '4.307 Jamaah Terdata • 86 Cabang Aktif • 146 Donatur Agnia Care Kanwakil Jabar • Pusat: Zawiyah Pagendingan Tasikmalaya',
    };
  }, [hoveredCluster, selectedCluster]);

  return (
    <section
      id="ecological-connectivity"
      ref={containerRef}
      className="relative min-h-screen py-20 sm:py-28 px-4 sm:px-8 lg:px-12 flex flex-col justify-center border-t border-[#243324]/10 dark:border-white/10 bg-[#F5F2EB] dark:bg-[#182417] text-[#243324] dark:text-[#F4EFE6] transition-colors duration-400"
    >
      <div className="max-w-6xl mx-auto w-full space-y-8 sm:space-y-10">
        {/* Section Headline / Strategic Context */}
        <div className="space-y-4 max-w-3xl">
          <p className="text-sm font-medium tracking-wide text-[#657351] dark:text-[#A3B59E] uppercase">
            Jaringan Dakwah & Sebaran Wilayah
          </p>
          <h2 className="font-display text-4xl sm:text-5xl lg:text-6xl text-[#1F2B1D] dark:text-[#F4EFE6] font-normal leading-[1.05] tracking-tight">
            Simpul zawiyah dan sebaran jamaah di seluruh penjuru nusantara.
          </h2>
          <p className="text-base sm:text-lg text-[#4A5D44] dark:text-[#D2CBBF] font-light leading-relaxed">
            Dari Zawiyah Pusat Pagendingan Tasikmalaya hingga 86 cabang zawiyah di Jawa Barat, DKI Jakarta, Jawa Tengah, Jawa Timur, dan luar pulau, seluruh simpul terhubung dalam satu koordinasi pembinaan ruhani dan khidmah umat.
          </p>
        </div>

        {/* Integrated Card Container */}
        <div
          ref={cardContainerRef}
          className="w-full bg-[#FBF9F5] dark:bg-[#152014] rounded-3xl sm:rounded-[2.5rem] border-2 border-[#243324] dark:border-[#384F35] shadow-lg overflow-hidden flex flex-col transition-colors duration-400"
        >
          {/* Left-Aligned Control Bar */}
          <div className="px-5 pt-5 pb-3 sm:px-8 sm:pt-6 sm:pb-4 flex flex-wrap items-center justify-between gap-4 bg-[#FBF9F5] dark:bg-[#152014] transition-colors duration-400">
            {/* View Switcher */}
            <div className="flex items-center bg-white/90 dark:bg-[#202E1E] backdrop-blur-md rounded-2xl border border-[#243324]/15 dark:border-white/15 p-1 shadow-2xs gap-1">
              <button
                onClick={handleSwitchToMap}
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs sm:text-sm font-medium transition-all cursor-pointer ${
                  viewMode === 'map'
                    ? 'bg-[#243324] dark:bg-[#344732] text-white dark:text-[#F4EFE6] shadow-xs'
                    : 'text-[#4A5D44] dark:text-[#CBD7C7] hover:text-[#1F2B1D] dark:hover:text-white hover:bg-[#F5F2EB] dark:hover:bg-[#2A3D28]'
                }`}
              >
                <MapPin className="w-3.5 h-3.5" />
                <span>Peta Jaringan Zawiyah</span>
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs sm:text-sm font-medium transition-all cursor-pointer ${
                  viewMode === 'list'
                    ? 'bg-[#243324] dark:bg-[#344732] text-white dark:text-[#F4EFE6] shadow-xs'
                    : 'text-[#4A5D44] dark:text-[#CBD7C7] hover:text-[#1F2B1D] dark:hover:text-white hover:bg-[#F5F2EB] dark:hover:bg-[#2A3D28]'
                }`}
              >
                <BarChart3 className="w-3.5 h-3.5" />
                <span>Sebaran Klaster Wilayah</span>
              </button>
            </div>

            {/* Right-Aligned Zoom Controls */}
            {viewMode === 'map' && (
              <div className="flex items-center bg-white/90 dark:bg-[#202E1E] backdrop-blur-md rounded-2xl border border-[#243324]/15 dark:border-white/15 p-1 shadow-2xs gap-1">
                <button
                  onClick={handleZoomIn}
                  className="p-1.5 text-[#243324] dark:text-[#F4EFE6] hover:bg-[#F5F2EB] dark:hover:bg-[#2A3D28] rounded-xl transition-colors cursor-pointer"
                  title="Perbesar Peta"
                  aria-label="Zoom In"
                >
                  <ZoomIn className="w-4 h-4" />
                </button>
                <button
                  onClick={handleZoomOut}
                  className="p-1.5 text-[#243324] dark:text-[#F4EFE6] hover:bg-[#F5F2EB] dark:hover:bg-[#2A3D28] rounded-xl transition-colors cursor-pointer"
                  title="Perkecil Peta"
                  aria-label="Zoom Out"
                >
                  <ZoomOut className="w-4 h-4" />
                </button>
                {zoomLevel !== 1 && (
                  <button
                    onClick={handleResetZoom}
                    className="px-2 py-1 text-[11px] text-[#243324] dark:text-[#F4EFE6] hover:bg-[#F5F2EB] dark:hover:bg-[#2A3D28] rounded-xl transition-colors cursor-pointer font-medium"
                    title="Reset Zoom"
                  >
                    Reset
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Card Body: Map View or Regional Breakdown List */}
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
                  <IndonesiaZawiyahMap
                    selectedClusterName={selectedCluster}
                    onSelectCluster={handleSelectClusterFromMap}
                    onHoverCluster={setHoveredCluster}
                    zoomLevel={zoomLevel}
                    onZoomIn={handleZoomIn}
                    onZoomOut={handleZoomOut}
                    onResetZoom={handleResetZoom}
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
                  {/* Regional Cluster Ranking & Selector */}
                  <div className="lg:col-span-7 space-y-3">
                    {REGIONAL_CLUSTERS.map((item, idx) => {
                      const isSelected = activeListIndex === idx;
                      const barWidthPercent = Math.min((item.totalJamaah / 3026) * 100, 100);

                      return (
                        <button
                          key={item.nama}
                          onClick={() => handleSelectClusterFromList(idx)}
                          className={`w-full text-left p-4 sm:p-5 rounded-2xl transition-all duration-200 flex items-center justify-between gap-4 cursor-pointer ${
                            isSelected
                              ? 'bg-white dark:bg-[#223320] shadow-md border border-[#243324]/12 dark:border-white/20 scale-[1.01]'
                              : 'hover:bg-white/60 dark:hover:bg-[#1F2F1D] border border-[#243324]/6 dark:border-white/10 bg-white/40 dark:bg-[#1C2A1B]/60'
                          }`}
                        >
                          <div className="flex-1 space-y-1.5">
                            <div className="flex items-center justify-between text-sm sm:text-base font-medium text-[#1F2B1D] dark:text-[#F4EFE6]">
                              <span>{item.nama}</span>
                              <span className="font-light text-[#657351] dark:text-[#A3B59E] text-xs">
                                {item.totalCabang} cabang
                              </span>
                            </div>

                            {/* Proportional visual bar */}
                            <div className="w-full h-2 bg-[#243324]/10 dark:bg-white/15 rounded-full overflow-hidden">
                              <motion.div
                                className="h-full rounded-full bg-emerald-600 dark:bg-emerald-400"
                                initial={{ width: 0 }}
                                animate={{ width: `${barWidthPercent}%` }}
                                transition={{ type: 'spring', stiffness: 100, damping: 20 }}
                              />
                            </div>
                          </div>

                          <div className="text-right shrink-0 pl-2">
                            <span className="font-display text-2xl sm:text-3xl text-[#1F2B1D] dark:text-[#F4EFE6] font-normal">
                              {item.totalJamaah.toLocaleString('id-ID')}
                            </span>
                            <span className="block text-xs text-[#657351] dark:text-[#A3B59E]">jamaah</span>
                          </div>
                        </button>
                      );
                    })}
                  </div>

                  {/* Dynamic Cluster Focus Panel */}
                  <div className="lg:col-span-5 lg:sticky lg:top-28 space-y-6">
                    <motion.div
                      key={activeClusterInList.nama}
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ type: 'spring', stiffness: 120, damping: 20 }}
                      className="p-7 sm:p-8 rounded-3xl bg-white dark:bg-[#202E1E] border border-[#243324]/10 dark:border-white/15 shadow-md space-y-6 transition-colors duration-400"
                    >
                      <div className="space-y-1.5">
                        <p className="text-xs font-semibold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
                          Fokus Wilayah
                        </p>
                        <h3 className="font-display text-2xl sm:text-3xl text-[#1F2B1D] dark:text-[#F4EFE6]">
                          {activeClusterInList.nama}
                        </h3>
                        <p className="text-xs text-[#657351] dark:text-[#A3B59E]">
                          Sentra: <strong>{activeClusterInList.pusatWilayah}</strong>
                        </p>
                      </div>

                      <div className="grid grid-cols-2 gap-3 py-3 border-y border-[#243324]/10 dark:border-white/10">
                        <div className="p-3 rounded-2xl bg-[#F5F2EB] dark:bg-[#263825]">
                          <div className="font-display text-2xl sm:text-3xl text-[#1F2B1D] dark:text-[#F4EFE6]">
                            <AnimatedNumber value={activeClusterInList.totalJamaah} />
                          </div>
                          <p className="text-xs text-[#657351] dark:text-[#A3B59E]">Jamaah Terdata</p>
                        </div>
                        <div className="p-3 rounded-2xl bg-[#F5F2EB] dark:bg-[#263825]">
                          <div className="font-display text-2xl sm:text-3xl text-[#1F2B1D] dark:text-[#F4EFE6]">
                            <AnimatedNumber value={activeClusterInList.totalCabang} />
                          </div>
                          <p className="text-xs text-[#657351] dark:text-[#A3B59E]">Cabang Zawiyah</p>
                        </div>
                      </div>

                      <p className="text-sm text-[#3B4D36] dark:text-[#D2CBBF] font-light leading-relaxed">
                        {activeClusterInList.deskripsi}
                      </p>

                      <div className="space-y-2 pt-1 border-t border-[#243324]/10 dark:border-white/10">
                        <p className="text-xs font-semibold text-[#1F2B1D] dark:text-[#F4EFE6]">Zawiyah Unggulan Wilayah:</p>
                        <div className="space-y-1">
                          {activeClusterInList.highlightZawiyah.map((z, i) => (
                            <p key={i} className="text-xs text-[#4A5D44] dark:text-[#CBD7C7] flex items-center gap-1.5">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                              <span>{z}</span>
                            </p>
                          ))}
                        </div>
                      </div>

                      <button
                        onClick={() => handleViewClusterOnMap(activeClusterInList.nama)}
                        className="w-full py-3 px-4 rounded-xl bg-[#F5F2EB] dark:bg-[#2C3E2A] hover:bg-[#E8EFE6] dark:hover:bg-[#374D34] text-[#243324] dark:text-[#F4EFE6] font-medium text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer border border-[#243324]/10 dark:border-white/15"
                      >
                        <Compass className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                        <span>Lihat {activeClusterInList.singkatan} di Peta</span>
                      </button>
                    </motion.div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Integrated Bottom Summary Card */}
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
