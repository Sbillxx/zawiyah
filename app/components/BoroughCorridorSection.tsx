'use client';

import React, { useState, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { MapPin, BarChart3, Compass, Users } from 'lucide-react';
import { AnimatedNumber } from './AnimatedNumber';
import {
  REGIONAL_CLUSTERS,
  ZAWIYAH_NODES,
} from '../data/indonesiaMapData';
import { NusantaraZawiyahMap } from './NusantaraZawiyahMap';

export const BoroughCorridorSection: React.FC = () => {
  const [selectedCluster, setSelectedCluster] = useState<string | null>(null);
  const [hoveredCluster, setHoveredCluster] = useState<string | null>(null);
  const [activeListIndex, setActiveListIndex] = useState<number>(0);
  const [viewMode, setViewMode] = useState<'map' | 'list'>('map');
  const containerRef = useRef<HTMLDivElement>(null);
  const cardContainerRef = useRef<HTMLDivElement>(null);

  const activeClusterInList = REGIONAL_CLUSTERS[activeListIndex] || REGIONAL_CLUSTERS[0];

  // Total jamaah & cabang across all clusters
  const totals = useMemo(() => {
    const totalJamaah = ZAWIYAH_NODES.reduce((sum, n) => sum + n.jamaah, 0);
    const totalCabang = ZAWIYAH_NODES.length;
    const totalDonatur = REGIONAL_CLUSTERS.reduce((sum, c) => sum + c.donaturAgnia, 0);
    return { totalJamaah, totalCabang, totalDonatur };
  }, []);

  const handleSelectClusterFromMap = (name: string | null) => {
    setSelectedCluster(name);
    if (name) {
      const idx = REGIONAL_CLUSTERS.findIndex(
        (c) => c.nama === name || c.singkatan === name
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

  // Bottom bar metrics display
  const activeMetricsDisplay = useMemo(() => {
    const target = hoveredCluster || selectedCluster;
    if (target) {
      const cluster = REGIONAL_CLUSTERS.find(
        (c) => c.nama === target || c.singkatan === target
      );
      if (cluster) {
        return {
          title: `Klaster ${cluster.singkatan}`,
          stats: `${cluster.totalCabang} Cabang • ${cluster.totalJamaah.toLocaleString('id-ID')} Jamaah • ${cluster.donaturAgnia} Donatur Agnia Care`,
        };
      }
    }

    return {
      title: 'Seluruh Jaringan Zawiyah Nusantara',
      stats: `${totals.totalCabang} Titik Zawiyah • ${totals.totalJamaah.toLocaleString('id-ID')} Jamaah • ${totals.totalDonatur} Donatur Agnia Care`,
    };
  }, [hoveredCluster, selectedCluster, totals]);

  return (
    <section
      id="sebaran-zawiyah"
      ref={containerRef}
      className="relative min-h-screen py-14 sm:py-28 px-3 sm:px-8 lg:px-12 flex flex-col justify-center border-t border-[#243324]/10 dark:border-white/10 bg-[#F5F2EB] dark:bg-[#182417] text-[#243324] dark:text-[#F4EFE6] transition-colors duration-400"
    >
      <div className="max-w-6xl mx-auto w-full space-y-6 sm:space-y-10">
        {/* Section Headline */}
        <div className="space-y-3 sm:space-y-4 max-w-3xl">
          <p className="text-xs sm:text-sm font-medium tracking-wide text-[#657351] dark:text-[#A3B59E]">
            Jaringan Dakwah & Sebaran Wilayah
          </p>
          <h2 className="font-display text-3xl sm:text-5xl lg:text-6xl text-[#1F2B1D] dark:text-[#F4EFE6] font-normal leading-[1.1] sm:leading-[1.05] tracking-tight">
            Jaringan zawiyah menghubungkan jamaah dari Sumatera hingga Nusa Tenggara.
          </h2>
          <p className="text-sm sm:text-lg text-[#4A5D44] dark:text-[#D2CBBF] font-light leading-relaxed">
            Dari Zawiyah Pusat Pagendingan Tasikmalaya, koridor dakwah menghubungkan 86 cabang di 7 klaster wilayah — tersebar di Jawa Barat, DKI Jakarta, Jawa Tengah, Jawa Timur, hingga Sumatera dan Kalimantan.
          </p>
        </div>

        {/* Integrated Card Container */}
        <div
          ref={cardContainerRef}
          className="w-full bg-[#FBF9F5] dark:bg-[#152014] rounded-2xl sm:rounded-[2.5rem] border-2 border-[#243324] dark:border-[#384F35] shadow-lg overflow-hidden flex flex-col transition-colors duration-400"
        >
          {/* Control Bar */}
          <div className="px-3 pt-3.5 pb-2 sm:px-8 sm:pt-6 sm:pb-4 flex flex-wrap items-center justify-between gap-3 bg-[#FBF9F5] dark:bg-[#152014] transition-colors duration-400">
            {/* View Switcher: Symmetrical 2-column on mobile, inline flex on desktop */}
            <div className="w-full sm:w-auto grid grid-cols-2 sm:flex items-center bg-white/90 dark:bg-[#202E1E] backdrop-blur-md rounded-xl sm:rounded-2xl border border-[#243324]/15 dark:border-white/15 p-1 shadow-2xs gap-1">
              <button
                onClick={handleSwitchToMap}
                className={`flex items-center justify-center gap-1.5 sm:gap-2 px-2.5 py-1.5 sm:px-3.5 sm:py-1.5 rounded-lg sm:rounded-xl text-xs sm:text-sm font-medium transition-all cursor-pointer ${viewMode === 'map'
                    ? 'bg-[#243324] dark:bg-[#344732] text-white dark:text-[#F4EFE6] shadow-xs'
                    : 'text-[#4A5D44] dark:text-[#CBD7C7] hover:text-[#1F2B1D] dark:hover:text-white hover:bg-[#F5F2EB] dark:hover:bg-[#2A3D28]'
                  }`}
              >
                <MapPin className="w-3.5 h-3.5 shrink-0" />
                <span className="truncate">Peta Jaringan</span>
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`flex items-center justify-center gap-1.5 sm:gap-2 px-2.5 py-1.5 sm:px-3.5 sm:py-1.5 rounded-lg sm:rounded-xl text-xs sm:text-sm font-medium transition-all cursor-pointer ${viewMode === 'list'
                    ? 'bg-[#243324] dark:bg-[#344732] text-white dark:text-[#F4EFE6] shadow-xs'
                    : 'text-[#4A5D44] dark:text-[#CBD7C7] hover:text-[#1F2B1D] dark:hover:text-white hover:bg-[#F5F2EB] dark:hover:bg-[#2A3D28]'
                  }`}
              >
                <BarChart3 className="w-3.5 h-3.5 shrink-0" />
                <span className="truncate">Klaster Wilayah</span>
              </button>
            </div>

            {/* Section Sub-info */}
            {viewMode === 'map' && (
              <div className="hidden sm:flex items-center gap-2 text-xs text-[#657351] dark:text-[#A3B59E]">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                <span>Interaktif: Scroll Mouse untuk Zoom & Seret untuk Geser</span>
              </div>
            )}
          </div>

          {/* Card Body: Map or List View */}
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
                  <NusantaraZawiyahMap
                    selectedClusterName={selectedCluster}
                    onSelectCluster={handleSelectClusterFromMap}
                    onHoverCluster={setHoveredCluster}
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
                  {/* Cluster Ranking & Selector */}
                  <div className="lg:col-span-7 space-y-3">
                    {REGIONAL_CLUSTERS.map((item, idx) => {
                      const isSelected = activeListIndex === idx;
                      const maxJamaah = Math.max(...REGIONAL_CLUSTERS.map((c) => c.totalJamaah));
                      const barWidthPercent = (item.totalJamaah / maxJamaah) * 100;

                      return (
                        <button
                          key={item.nama}
                          onClick={() => handleSelectClusterFromList(idx)}
                          className={`w-full text-left p-4 sm:p-5 rounded-2xl transition-all duration-200 flex items-center justify-between gap-4 cursor-pointer ${isSelected
                              ? 'bg-white dark:bg-[#223320] shadow-md border border-[#243324]/12 dark:border-white/20 scale-[1.01]'
                              : 'hover:bg-white/60 dark:hover:bg-[#1F2F1D] border border-[#243324]/6 dark:border-white/10 bg-white/40 dark:bg-[#1C2A1B]/60'
                            }`}
                        >
                          <div className="flex-1 space-y-1.5">
                            <div className="flex items-center justify-between text-sm sm:text-base font-medium text-[#1F2B1D] dark:text-[#F4EFE6]">
                              <span>{item.singkatan}</span>
                              <span className="font-light text-[#657351] dark:text-[#A3B59E]">{item.totalCabang} cabang</span>
                            </div>

                            {/* Proportional bar */}
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
                              {item.totalJamaah.toLocaleString('id-ID')}
                            </span>
                            <span className="block text-xs text-[#657351] dark:text-[#A3B59E]">jamaah</span>
                          </div>
                        </button>
                      );
                    })}
                  </div>

                  {/* Dynamic Cluster Insight Panel */}
                  <div className="lg:col-span-5 lg:sticky lg:top-28 space-y-6">
                    <motion.div
                      key={activeClusterInList.nama}
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ type: 'spring', stiffness: 120, damping: 20 }}
                      className="p-7 sm:p-8 rounded-3xl bg-white dark:bg-[#202E1E] border border-[#243324]/10 dark:border-white/15 shadow-md space-y-6 transition-colors duration-400"
                    >
                      <div className="space-y-1.5">
                        <p className="text-xs font-medium uppercase tracking-wider text-[#657351] dark:text-[#A3B59E]">
                          Fokus Klaster
                        </p>
                        <h3 className="font-display text-3xl sm:text-4xl text-[#1F2B1D] dark:text-[#F4EFE6]">
                          {activeClusterInList.singkatan}
                        </h3>
                      </div>

                      <div className="grid grid-cols-2 gap-4 py-4 border-y border-[#243324]/10 dark:border-white/10">
                        <div>
                          <div className="font-display text-3xl sm:text-4xl text-[#1F2B1D] dark:text-[#F4EFE6]">
                            <AnimatedNumber value={activeClusterInList.totalJamaah} />
                          </div>
                          <p className="text-xs text-[#657351] dark:text-[#A3B59E] flex items-center gap-1">
                            <Users className="w-3 h-3" />
                            Jamaah Aktif
                          </p>
                        </div>
                        <div>
                          <div className="font-display text-3xl sm:text-4xl text-[#1F2B1D] dark:text-[#F4EFE6]">
                            <AnimatedNumber value={activeClusterInList.totalCabang} />
                          </div>
                          <p className="text-xs text-[#657351] dark:text-[#A3B59E]">Cabang Zawiyah</p>
                        </div>
                      </div>

                      <p className="text-sm sm:text-base text-[#3B4D36] dark:text-[#D2CBBF] font-light leading-relaxed">
                        {activeClusterInList.deskripsi}
                      </p>

                      {/* Highlight zawiyah list */}
                      <div className="space-y-1.5">
                        <p className="text-xs font-medium text-[#657351] dark:text-[#A3B59E] uppercase tracking-wider">Zawiyah Utama</p>
                        <ul className="space-y-1">
                          {activeClusterInList.highlightZawiyah.map((z) => (
                            <li key={z} className="text-xs text-[#4A5D44] dark:text-[#CBD7C7] flex items-center gap-1.5">
                              <span className="w-1.5 h-1.5 rounded-full bg-[#3B4D36] dark:bg-[#85E7B7] shrink-0" />
                              {z}
                            </li>
                          ))}
                        </ul>
                      </div>

                      <button
                        onClick={() => handleViewClusterOnMap(activeClusterInList.nama)}
                        className="w-full py-3 px-4 rounded-xl bg-[#F5F2EB] dark:bg-[#2C3E2A] hover:bg-[#E8EFE6] dark:hover:bg-[#374D34] text-[#243324] dark:text-[#F4EFE6] font-medium text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer border border-[#243324]/10 dark:border-white/15"
                      >
                        <Compass className="w-3.5 h-3.5 text-[#3B4D36] dark:text-[#85E7B7]" />
                        <span>Lihat di Peta Nusantara</span>
                      </button>
                    </motion.div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Bottom Summary Bar */}
          <div className="w-full bg-[#243324] dark:bg-[#0E170E] px-4 py-3 sm:px-8 sm:py-5 text-[#F5F2EB] flex items-center justify-between gap-3 border-t-2 border-[#243324] dark:border-[#384F35] mt-auto min-h-[58px] sm:min-h-[72px] transition-colors duration-400">
            <div className="space-y-0.5">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeMetricsDisplay.title}
                  initial={{ opacity: 0, y: 3 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -3 }}
                  transition={{ duration: 0.15 }}
                >
                  <span className="text-[10px] sm:text-xs font-semibold text-[#A3B899] dark:text-[#85E7B7] uppercase tracking-wider block">
                    {activeMetricsDisplay.title}
                  </span>
                  <p className="text-[11px] sm:text-sm text-[#F5F2EB] font-medium leading-snug">
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
