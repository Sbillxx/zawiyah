'use client';

import React, { useState, useRef, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { MapPin, BarChart3, Users, Crown, Building, Search, X, ArrowUpRight } from 'lucide-react';
import { AnimatedNumber } from './AnimatedNumber';
import {
  ZAWIYAH_NODES,
  REGIONAL_CLUSTERS,
  ZawiyahMapNode,
} from '../data/indonesiaMapData';
import { NusantaraZawiyahMap } from './NusantaraZawiyahMap';

export const BoroughCorridorSection: React.FC = () => {
  const [viewMode, setViewMode] = useState<'map' | 'list'>('map');
  const [listSearch, setListSearch] = useState('');
  const [listTypeFilter, setListTypeFilter] = useState<'ALL' | 'Pusat' | 'Utama' | 'Cabang'>('ALL');
  const containerRef = useRef<HTMLDivElement>(null);
  const cardContainerRef = useRef<HTMLDivElement>(null);

  // Live nodes and DB statistics state
  const [liveNodes, setLiveNodes] = useState<ZawiyahMapNode[]>(ZAWIYAH_NODES);
  const [dbTotalJamaah, setDbTotalJamaah] = useState<number | null>(null);

  // Fetch live zawiyah and stats from TiDB Cloud database
  useEffect(() => {
    async function loadLiveZawiyah() {
      try {
        const res = await fetch('/api/zawiyah');
        const json = await res.json();
        if (json.success && Array.isArray(json.data) && json.data.length > 0) {
          const dbMap = new Map<string, any>(json.data.map((z: any) => [z.id, z]));
          setLiveNodes((prev) =>
            prev.map((node) => {
              const db = dbMap.get(node.id);
              if (db) {
                return {
                  ...node,
                  nama: db.nama || node.nama,
                  tipe: db.tipe || node.tipe,
                  kota: db.kota || node.kota,
                  jamaah: typeof db.jamaah === 'number' ? db.jamaah : node.jamaah,
                  pengurus: db.ketua_zawiyah || db.pengurus || node.pengurus,
                };
              }
              return node;
            })
          );
        }
      } catch (err) {
        console.warn('Could not fetch live zawiyah for map:', err);
      }

      try {
        const resStats = await fetch('/api/stats?global=true');
        const jsonStats = await resStats.json();
        if (jsonStats.success && jsonStats.stats) {
          setDbTotalJamaah(jsonStats.stats.totalJamaah);
        }
      } catch (err) {
        // ignore
      }
    }
    loadLiveZawiyah();
  }, []);

  // Totals synced with live database
  const totals = useMemo(() => {
    const totalJamaah = dbTotalJamaah || liveNodes.reduce((sum, n) => sum + n.jamaah, 0);
    const totalCabang = liveNodes.length;
    const pusatCount = liveNodes.filter((n) => n.tipe === 'Pusat').length;
    const utamaCount = liveNodes.filter((n) => n.tipe === 'Utama').length;
    const donaturCount = REGIONAL_CLUSTERS.reduce((sum, c) => sum + c.donaturAgnia, 0);
    return { totalJamaah, totalCabang, pusatCount, utamaCount, donaturCount };
  }, [liveNodes, dbTotalJamaah]);

  // Filtered list for list view
  const filteredList = useMemo(() => {
    let result = liveNodes;
    if (listTypeFilter !== 'ALL') {
      result = result.filter((n) => n.tipe === listTypeFilter);
    }
    if (listSearch.trim()) {
      const q = listSearch.toLowerCase().trim();
      result = result.filter(
        (n) =>
          n.nama.toLowerCase().includes(q) ||
          n.kota.toLowerCase().includes(q) ||
          n.provinsi.toLowerCase().includes(q) ||
          n.pengurus.toLowerCase().includes(q)
      );
    }
    return result;
  }, [liveNodes, listTypeFilter, listSearch]);

  const scrollToCardTop = () => {
    if (cardContainerRef.current && typeof window !== 'undefined') {
      const cardTop = cardContainerRef.current.getBoundingClientRect().top + window.scrollY - 75;
      window.scrollTo({ top: Math.max(0, cardTop), behavior: 'smooth' });
    }
  };

  const handleSwitchToMap = () => {
    setViewMode('map');
    scrollToCardTop();
  };

  const handleSelectZawiyahFromList = (node: ZawiyahMapNode) => {
    setViewMode('map');
    scrollToCardTop();
  };

  return (
    <section
      id="sebaran-zawiyah"
      ref={containerRef}
      className="relative min-h-screen py-14 sm:py-28 px-3 sm:px-8 lg:px-12 flex flex-col justify-center border-t border-[#243324]/10 dark:border-white/10 bg-[#F5F2EB] dark:bg-[#182417] text-[#243324] dark:text-[#F4EFE6] transition-colors duration-400"
    >
      <div className="max-w-6xl mx-auto w-full space-y-6 sm:space-y-10">
        {/* Section Headline */}
        <div className="space-y-3 sm:space-y-4 max-w-3xl">
          <p className="text-xs sm:text-sm font-semibold tracking-wider uppercase text-[#657351] dark:text-[#A3B59E]">
            Jejaring Dakwah & Sebaran Nusantara
          </p>
          <h2 className="font-display text-3xl sm:text-5xl lg:text-6xl text-[#1F2B1D] dark:text-[#F4EFE6] font-normal leading-[1.1] sm:leading-[1.05] tracking-tight">
            {totals.totalCabang || 109} Titik Zawiyah Menghubungkan Jamaah se-Indonesia.
          </h2>
          <p className="text-sm sm:text-lg text-[#4A5D44] dark:text-[#D2CBBF] font-light leading-relaxed">
            Berakar pada <strong className="font-semibold text-[#1F2B1D] dark:text-[#F4EFE6]">Zawiyah Pusat Tasikmalaya</strong> (Pagendingan) dan ditopang oleh <strong className="font-semibold text-[#1F2B1D] dark:text-[#F4EFE6]">Zawiyah Utama DKI Jakarta</strong>, jangkauan dakwah membentang ke seluruh cabang zawiyah mandiri di Sumatera, Jawa, Bali, Kalimantan, hingga Sulawesi.
          </p>
        </div>

        {/* Integrated Card Container */}
        <div
          ref={cardContainerRef}
          className="w-full bg-[#FBF9F5] dark:bg-[#152014] rounded-2xl sm:rounded-[2.5rem] border-2 border-[#243324] dark:border-[#384F35] shadow-lg overflow-hidden flex flex-col transition-colors duration-400"
        >
          {/* Control Bar */}
          <div className="px-3 pt-3.5 pb-2 sm:px-8 sm:pt-6 sm:pb-4 flex flex-wrap items-center justify-between gap-3 bg-[#FBF9F5] dark:bg-[#152014] transition-colors duration-400">
            {/* View Switcher */}
            <div className="w-full sm:w-auto grid grid-cols-2 sm:flex items-center bg-white/90 dark:bg-[#202E1E] backdrop-blur-md rounded-xl sm:rounded-2xl border border-[#243324]/15 dark:border-white/15 p-1 shadow-2xs gap-1">
              <button
                onClick={handleSwitchToMap}
                className={`flex items-center justify-center gap-1.5 sm:gap-2 px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg sm:rounded-xl text-xs sm:text-sm font-medium transition-all cursor-pointer ${
                  viewMode === 'map'
                    ? 'bg-[#243324] dark:bg-[#344732] text-white dark:text-[#F4EFE6] shadow-xs'
                    : 'text-[#4A5D44] dark:text-[#CBD7C7] hover:text-[#1F2B1D] dark:hover:text-white hover:bg-[#F5F2EB] dark:hover:bg-[#2A3D28]'
                }`}
              >
                <MapPin className="w-3.5 h-3.5 shrink-0" />
                <span>Peta Interaktif</span>
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`flex items-center justify-center gap-1.5 sm:gap-2 px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg sm:rounded-xl text-xs sm:text-sm font-medium transition-all cursor-pointer ${
                  viewMode === 'list'
                    ? 'bg-[#243324] dark:bg-[#344732] text-white dark:text-[#F4EFE6] shadow-xs'
                    : 'text-[#4A5D44] dark:text-[#CBD7C7] hover:text-[#1F2B1D] dark:hover:text-white hover:bg-[#F5F2EB] dark:hover:bg-[#2A3D28]'
                }`}
              >
                <BarChart3 className="w-3.5 h-3.5 shrink-0" />
                <span>Daftar Cabang ({totals.totalCabang || 109})</span>
              </button>
            </div>

            {/* Sub-info pill */}
            <div className="hidden sm:flex items-center gap-3 text-xs text-[#657351] dark:text-[#A3B59E]">
              <span className="flex items-center gap-1 font-medium">
                <Crown className="w-3.5 h-3.5 text-amber-500" />
                1 Pusat Tasikmalaya
              </span>
              <span>•</span>
              <span className="flex items-center gap-1 font-medium">
                <Building className="w-3.5 h-3.5 text-amber-600" />
                1 Utama Jakarta
              </span>
              <span>•</span>
              <span>84 Cabang Se-Nusantara</span>
            </div>
          </div>

          {/* Card Body: Map or Directory View */}
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
                  <NusantaraZawiyahMap nodes={liveNodes} />
                </motion.div>
              ) : (
                <motion.div
                  key="list-content"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="p-4 sm:p-8 space-y-5 bg-[#FBF9F5] dark:bg-[#152014] transition-colors duration-400"
                >
                  {/* Search and Filters */}
                  <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
                    {/* Search Input */}
                    <div className="relative flex-1">
                      <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#657351] dark:text-[#A3B59E]" />
                      <input
                        type="text"
                        value={listSearch}
                        onChange={(e) => setListSearch(e.target.value)}
                        placeholder="Cari nama zawiyah, kota, provinsi, atau pengurus..."
                        className="w-full pl-10 pr-9 py-2.5 rounded-xl border border-[#243324]/15 dark:border-white/15 bg-white/70 dark:bg-[#1C291B]/80 text-xs sm:text-sm text-[#243324] dark:text-[#F4EFE6] placeholder-[#657351]/60 focus:outline-none focus:border-[#243324] dark:focus:border-white/40"
                      />
                      {listSearch && (
                        <button
                          onClick={() => setListSearch('')}
                          className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-[#657351] hover:text-[#243324] cursor-pointer"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>

                    {/* Filter Pills */}
                    <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
                      <button
                        onClick={() => setListTypeFilter('ALL')}
                        className={`px-3 py-1.5 rounded-full text-xs font-medium cursor-pointer transition-all ${
                          listTypeFilter === 'ALL'
                            ? 'bg-[#243324] text-white dark:bg-[#85E7B7] dark:text-[#131D12]'
                            : 'bg-white/80 dark:bg-white/10 text-[#4A5D44] dark:text-[#CBD7C7]'
                        }`}
                      >
                        Semua ({ZAWIYAH_NODES.length})
                      </button>
                      <button
                        onClick={() => setListTypeFilter('Pusat')}
                        className={`px-3 py-1.5 rounded-full text-xs font-medium cursor-pointer transition-all flex items-center gap-1 ${
                          listTypeFilter === 'Pusat'
                            ? 'bg-emerald-800 text-white dark:bg-emerald-400 dark:text-[#0C1A0B]'
                            : 'bg-white/80 dark:bg-white/10 text-emerald-800 dark:text-emerald-300'
                        }`}
                      >
                        <Crown className="w-3 h-3 text-amber-400" />
                        Pusat (1)
                      </button>
                      <button
                        onClick={() => setListTypeFilter('Utama')}
                        className={`px-3 py-1.5 rounded-full text-xs font-medium cursor-pointer transition-all flex items-center gap-1 ${
                          listTypeFilter === 'Utama'
                            ? 'bg-amber-700 text-white dark:bg-amber-400 dark:text-[#1A1205]'
                            : 'bg-white/80 dark:bg-white/10 text-amber-800 dark:text-amber-300'
                        }`}
                      >
                        <Building className="w-3 h-3 text-amber-500" />
                        Utama (1)
                      </button>
                      <button
                        onClick={() => setListTypeFilter('Cabang')}
                        className={`px-3 py-1.5 rounded-full text-xs font-medium cursor-pointer transition-all ${
                          listTypeFilter === 'Cabang'
                            ? 'bg-[#3B4D36] text-white dark:bg-[#A3B59E] dark:text-[#131D12]'
                            : 'bg-white/80 dark:bg-white/10 text-[#4A5D44] dark:text-[#CBD7C7]'
                        }`}
                      >
                        Cabang (84)
                      </button>
                    </div>
                  </div>

                  {/* Zawiyah Directory Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5 max-h-[580px] overflow-y-auto pr-1">
                    {filteredList.map((item, idx) => {
                      const isPusat = item.tipe === 'Pusat';
                      const isUtama = item.tipe === 'Utama';

                      return (
                        <div
                          key={item.id}
                          className={`p-4 rounded-2xl border transition-all duration-200 flex flex-col justify-between space-y-3 ${
                            isPusat
                              ? 'bg-emerald-50/70 dark:bg-emerald-950/20 border-emerald-600/30 shadow-xs'
                              : isUtama
                              ? 'bg-amber-50/70 dark:bg-amber-950/20 border-amber-600/30 shadow-xs'
                              : 'bg-white/80 dark:bg-[#1E2C1C]/70 border-[#243324]/8 dark:border-white/10 hover:border-[#243324]/20'
                          }`}
                        >
                          <div className="space-y-1.5">
                            <div className="flex items-center justify-between gap-2">
                              <span
                                className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                                  isPusat
                                    ? 'bg-emerald-700 text-white'
                                    : isUtama
                                    ? 'bg-amber-600 text-white'
                                    : 'bg-[#243324]/10 dark:bg-white/10 text-[#243324] dark:text-[#F4EFE6]'
                                }`}
                              >
                                {isPusat && <Crown className="w-2.5 h-2.5 text-amber-300" />}
                                {isUtama && <Building className="w-2.5 h-2.5 text-amber-200" />}
                                <span>{item.tipe}</span>
                              </span>
                              <span className="font-display text-lg text-[#1F2B1D] dark:text-[#F4EFE6]">
                                {item.jamaah.toLocaleString('id-ID')} <span className="text-xs font-light text-[#657351] dark:text-[#A3B59E]">jamaah</span>
                              </span>
                            </div>

                            <h4 className="font-display text-base text-[#1F2B1D] dark:text-[#F4EFE6] font-normal leading-snug">
                              {item.nama}
                            </h4>

                            <p className="text-xs text-[#657351] dark:text-[#A3B59E] flex items-center gap-1">
                              <MapPin className="w-3 h-3 shrink-0" />
                              <span>{item.kota}, {item.provinsi}</span>
                            </p>
                          </div>

                          <div className="pt-2 border-t border-[#243324]/6 dark:border-white/6 flex items-center justify-between text-xs">
                            <span className="text-[11px] text-[#657351] dark:text-[#A3B59E] truncate max-w-[170px]">
                              {item.pengurus}
                            </span>
                            <button
                              onClick={() => handleSelectZawiyahFromList(item)}
                              className="inline-flex items-center gap-0.5 text-xs font-medium text-emerald-700 dark:text-emerald-400 hover:underline cursor-pointer"
                            >
                              <span>Peta</span>
                              <ArrowUpRight className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Bottom Bar: Total Stats Summary */}
          <div className="px-4 py-3 sm:px-8 sm:py-4 bg-[#EDE8DE] dark:bg-[#121B11] border-t border-[#243324]/10 dark:border-white/10 flex flex-wrap items-center justify-between gap-3 text-xs sm:text-sm">
            <div className="font-medium text-[#1F2B1D] dark:text-[#F4EFE6]">
              Jejaring Terpadu: 1 Pusat Pagendingan · 1 Utama DKI Jakarta · 84 Cabang
            </div>
            <div className="text-[#657351] dark:text-[#A3B59E] font-light">
              Total <strong className="font-semibold text-[#1F2B1D] dark:text-[#F4EFE6]">{totals.totalJamaah.toLocaleString('id-ID')}</strong> jamaah terdaftar di database
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
