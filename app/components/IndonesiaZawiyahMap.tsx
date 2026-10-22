'use client';

import React, { useState, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { MapPin, Users, HeartHandshake, Compass, Building, X } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import {
  INDONESIA_PROVINCES,
  ZAWIYAH_NODES,
  CORRIDOR_ARCS,
  MAP_DIMENSIONS,
  ZawiyahMapNode,
  ProvinceGeoData,
} from '../data/indonesiaMapData';

interface IndonesiaZawiyahMapProps {
  selectedClusterName?: string | null;
  onSelectCluster?: (clusterName: string | null) => void;
  onHoverCluster?: (clusterName: string | null) => void;
  zoomLevel: number;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onResetZoom?: () => void;
}

export const IndonesiaZawiyahMap: React.FC<IndonesiaZawiyahMapProps> = ({
  selectedClusterName,
  onSelectCluster,
  onHoverCluster,
  zoomLevel,
  onZoomIn,
  onZoomOut,
  onResetZoom,
}) => {
  const { isDark } = useTheme();
  const [selectedNode, setSelectedNode] = useState<ZawiyahMapNode | null>(null);
  const [hoveredNode, setHoveredNode] = useState<ZawiyahMapNode | null>(null);
  const [hoveredProvinceId, setHoveredProvinceId] = useState<string | null>(null);
  const [showCorridors, setShowCorridors] = useState<boolean>(true);

  const mapContainerRef = useRef<HTMLDivElement>(null);

  // Filtered nodes based on cluster filter if applied
  const displayedNodes = useMemo(() => {
    if (!selectedClusterName) return ZAWIYAH_NODES;
    return ZAWIYAH_NODES.filter(
      (n) => n.klaster.toLowerCase().includes(selectedClusterName.toLowerCase()) ||
             selectedClusterName.toLowerCase().includes(n.kota.toLowerCase())
    );
  }, [selectedClusterName]);

  const handleNodeClick = (node: ZawiyahMapNode) => {
    setSelectedNode(node);
    if (onSelectCluster) {
      onSelectCluster(node.klaster);
    }
  };

  const handleProvinceClick = (province: ProvinceGeoData) => {
    const matchingNode = ZAWIYAH_NODES.find(
      (n) => n.provinsi.toLowerCase() === province.name.toLowerCase()
    );
    if (matchingNode) {
      setSelectedNode(matchingNode);
      if (onSelectCluster) onSelectCluster(matchingNode.klaster);
    }
  };

  return (
    <div
      ref={mapContainerRef}
      className="relative w-full h-[520px] sm:h-[620px] lg:h-[680px] bg-[#F5F2EB] dark:bg-[#152014] overflow-hidden flex items-center justify-center transition-colors duration-400 select-none"
    >
      {/* Decorative Ocean Grid Texture */}
      <div className="absolute inset-0 opacity-[0.03] dark:opacity-[0.05] pointer-events-none bg-[radial-gradient(#243324_1px,transparent_1px)] dark:bg-[radial-gradient(#F4EFE6_1px,transparent_1px)] [background-size:20px_20px]" />

      {/* Map Header Overlay Controls */}
      <div className="absolute top-4 left-5 right-5 sm:top-6 sm:left-8 sm:right-8 z-20 flex flex-wrap items-center justify-between gap-3 pointer-events-none">
        <div className="pointer-events-auto flex items-center gap-2 bg-white/85 dark:bg-[#1E2E1D]/85 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-[#243324]/12 dark:border-white/12 shadow-xs">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-xs font-semibold text-[#1F2B1D] dark:text-[#F4EFE6]">
            Peta Sebaran Zawiyah Nusantara
          </span>
          <span className="text-[11px] text-[#657351] dark:text-[#A3B59E] border-l border-[#243324]/10 dark:border-white/10 pl-2 ml-1">
            86 Cabang • 4.307 Jamaah
          </span>
        </div>

        {/* Toggle Corridors */}
        <div className="pointer-events-auto flex items-center gap-2">
          <button
            onClick={() => setShowCorridors(!showCorridors)}
            className={`text-xs px-3 py-1.5 rounded-full border transition-all cursor-pointer flex items-center gap-1.5 shadow-2xs ${
              showCorridors
                ? 'bg-[#1F2B1D] dark:bg-[#344732] text-white border-transparent'
                : 'bg-white/80 dark:bg-[#1E2E1D]/80 text-[#4A5D44] dark:text-[#CBD7C7] border-[#243324]/10 dark:border-white/10'
            }`}
          >
            <Compass className="w-3.5 h-3.5" />
            <span>{showCorridors ? 'Sembunyikan Garis Hubung' : 'Tampilkan Garis Hubung'}</span>
          </button>
        </div>
      </div>

      {/* SVG Container with Smooth Zoom */}
      <div
        className="w-full h-full flex items-center justify-center transition-transform duration-300 ease-out"
        style={{
          transform: `scale(${zoomLevel})`,
          transformOrigin: 'center center',
        }}
      >
        <svg
          viewBox={MAP_DIMENSIONS.viewBox}
          className="w-full h-full max-h-full max-w-full drop-shadow-md"
          preserveAspectRatio="xMidYMid meet"
        >
          <defs>
            {/* Filter for province shadow */}
            <filter id="indonesiaShadow" x="-5%" y="-5%" width="115%" height="115%">
              <feDropShadow dx="0" dy="1.5" stdDeviation="1.5" floodColor="#000" floodOpacity="0.15" />
            </filter>
            {/* Filter for active glow */}
            <filter id="activeGlow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="3" result="glow" />
              <feComposite in="SourceGraphic" in2="glow" operator="over" />
            </filter>
            {/* Linear Gradient for Connecting Arcs */}
            <linearGradient id="arcGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#10B981" stopOpacity="0.85" />
              <stop offset="50%" stopColor="#34D399" stopOpacity="0.6" />
              <stop offset="100%" stopColor="#6EE7B7" stopOpacity="0.2" />
            </linearGradient>
          </defs>

          {/* 1. Indonesian Provinces Paths */}
          <g id="indonesia-provinces">
            {INDONESIA_PROVINCES.map((prov) => {
              const isHovered = hoveredProvinceId === prov.id;
              const hasZawiyah = ZAWIYAH_NODES.some(
                (n) => n.provinsi.toLowerCase() === prov.name.toLowerCase()
              );

              const fillStyle = isDark
                ? hasZawiyah
                  ? isHovered
                    ? '#2F452C'
                    : '#223321'
                  : '#182417'
                : hasZawiyah
                ? isHovered
                  ? '#D5E5D2'
                  : '#E2EBDD'
                : '#ECE7DC';

              const strokeStyle = isDark
                ? hasZawiyah
                  ? '#4A6945'
                  : '#283A26'
                : hasZawiyah
                ? '#94A691'
                : '#D8D1C4';

              return (
                <path
                  key={prov.id}
                  d={prov.path}
                  fill={fillStyle}
                  stroke={strokeStyle}
                  strokeWidth={hasZawiyah ? 0.75 : 0.5}
                  strokeLinejoin="round"
                  strokeLinecap="round"
                  className="cursor-pointer transition-colors duration-200"
                  filter="url(#indonesiaShadow)"
                  onMouseEnter={() => setHoveredProvinceId(prov.id)}
                  onMouseLeave={() => setHoveredProvinceId(null)}
                  onClick={() => handleProvinceClick(prov)}
                >
                  <title>{prov.name}</title>
                </path>
              );
            })}
          </g>

          {/* 2. Connecting Radiating Arcs from Tasikmalaya Pusat */}
          {showCorridors && (
            <g id="connecting-arcs" className="pointer-events-none select-none">
              {CORRIDOR_ARCS.map((arc) => (
                <g key={arc.id}>
                  {/* Glowing background arc */}
                  <path
                    d={arc.d}
                    fill="none"
                    stroke={isDark ? '#34D399' : '#059669'}
                    strokeWidth="1.6"
                    strokeDasharray="4 3"
                    className="opacity-45"
                  />
                  {/* Outer subtle halo */}
                  <path
                    d={arc.d}
                    fill="none"
                    stroke={isDark ? '#10B981' : '#10B981'}
                    strokeWidth="3.5"
                    className="opacity-15"
                  />
                </g>
              ))}
            </g>
          )}

          {/* 3. Epicenter Radar Wave Ring at Tasikmalaya (x: 226, y: 252) */}
          <g id="epicenter-radar" className="pointer-events-none">
            <circle
              cx={226}
              cy={252}
              r={14}
              fill="none"
              stroke={isDark ? '#34D399' : '#059669'}
              strokeWidth="0.8"
              className="animate-ping opacity-35"
              style={{ transformOrigin: '226px 252px', animationDuration: '3s' }}
            />
            <circle
              cx={226}
              cy={252}
              r={24}
              fill="none"
              stroke={isDark ? '#10B981' : '#10B981'}
              strokeWidth="0.6"
              className="animate-ping opacity-20"
              style={{ transformOrigin: '226px 252px', animationDuration: '4.5s' }}
            />
          </g>

          {/* 4. Zawiyah Pins */}
          <g id="zawiyah-pins">
            {displayedNodes.map((node) => {
              const isPusat = node.tipe === 'Pusat';
              const isSelected = selectedNode?.id === node.id;
              const isHovered = hoveredNode?.id === node.id;

              // Size based on importance / jamaah scale
              const baseRadius = isPusat ? 6 : node.jamaah > 200 ? 4.2 : 3.2;

              return (
                <g
                  key={node.id}
                  transform={`translate(${node.x}, ${node.y})`}
                  className="cursor-pointer group"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleNodeClick(node);
                  }}
                  onMouseEnter={() => setHoveredNode(node)}
                  onMouseLeave={() => setHoveredNode(null)}
                >
                  {/* Selection Outer Ring */}
                  {isSelected && (
                    <circle
                      r={baseRadius + 4}
                      fill="none"
                      stroke={isDark ? '#6EE7B7' : '#047857'}
                      strokeWidth="1.5"
                      className="animate-pulse opacity-90"
                    />
                  )}

                  {/* Pulsing Hover Ring */}
                  {isHovered && !isSelected && (
                    <circle
                      r={baseRadius + 3}
                      fill="none"
                      stroke={isDark ? '#CBD7C7' : '#3B4D36'}
                      strokeWidth="1"
                      className="opacity-70"
                    />
                  )}

                  {/* Pin Body */}
                  <circle
                    r={isSelected ? baseRadius + 1.5 : isHovered ? baseRadius + 1 : baseRadius}
                    className="transition-all duration-200"
                    fill={
                      isPusat
                        ? '#F59E0B' // Golden amber for Pusat
                        : isSelected
                        ? isDark ? '#34D399' : '#059669'
                        : isHovered
                        ? isDark ? '#F4EFE6' : '#1F2B1D'
                        : isDark ? '#6EE7B7' : '#1F2B1D'
                    }
                    stroke={isDark ? '#152014' : '#FFFFFF'}
                    strokeWidth={isPusat ? 1.5 : 1.0}
                    filter={isPusat || isSelected ? 'url(#activeGlow)' : undefined}
                  />

                  {/* Center Dot */}
                  <circle
                    r={isPusat ? 2.2 : 1.0}
                    fill={isPusat ? '#FFFFFF' : isDark ? '#152014' : '#FFFFFF'}
                    className="pointer-events-none"
                  />

                  {/* Label for key cities */}
                  {(isPusat || node.jamaah > 250 || isSelected) && (
                    <text
                      x={0}
                      y={-(baseRadius + 3)}
                      textAnchor="middle"
                      className={`text-[5.5px] font-bold select-none pointer-events-none transition-all ${
                        isDark ? 'fill-[#F4EFE6]' : 'fill-[#1F2B1D]'
                      }`}
                      style={{
                        paintOrder: 'stroke fill',
                        stroke: isDark ? '#152014' : '#FFFFFF',
                        strokeWidth: '1.2px',
                      }}
                    >
                      {node.kota}
                    </text>
                  )}
                </g>
              );
            })}
          </g>
        </svg>
      </div>

      {/* Hover Floating Tooltip */}
      <AnimatePresence>
        {hoveredNode && !selectedNode && (
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="absolute bottom-16 sm:bottom-20 left-1/2 -translate-x-1/2 z-30 pointer-events-none"
          >
            <div className="bg-[#1F2B1D]/95 dark:bg-[#1C2C1B]/95 text-white backdrop-blur-md px-4 py-2.5 rounded-2xl shadow-xl border border-white/15 flex items-center gap-3">
              <span className={`w-2.5 h-2.5 rounded-full ${hoveredNode.tipe === 'Pusat' ? 'bg-amber-400' : 'bg-emerald-400'}`} />
              <div>
                <p className="text-xs font-semibold">{hoveredNode.nama}</p>
                <p className="text-[11px] text-[#CBD7C7] flex items-center gap-2">
                  <span>{hoveredNode.kota}, {hoveredNode.provinsi}</span>
                  <span>•</span>
                  <span className="text-emerald-300 font-medium">{hoveredNode.jamaah} Jamaah</span>
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Selected Node Detailed Modal Card */}
      <AnimatePresence>
        {selectedNode && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ type: 'spring', stiffness: 200, damping: 25 }}
            className="absolute bottom-16 sm:bottom-20 left-4 right-4 sm:left-auto sm:right-8 sm:w-96 z-40"
          >
            <div className="bg-white/95 dark:bg-[#1E2E1D]/95 text-[#243324] dark:text-[#F4EFE6] backdrop-blur-xl p-5 sm:p-6 rounded-3xl shadow-2xl border border-[#243324]/12 dark:border-white/15 space-y-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                      selectedNode.tipe === 'Pusat'
                        ? 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/20'
                        : 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20'
                    }`}>
                      {selectedNode.tipe === 'Pusat' ? 'Zawiyah Pusat' : `Zawiyah ${selectedNode.tipe}`}
                    </span>
                    <span className="text-xs text-[#657351] dark:text-[#A3B59E]">
                      {selectedNode.kota}
                    </span>
                  </div>
                  <h4 className="font-display text-lg sm:text-xl font-semibold leading-tight text-[#1F2B1D] dark:text-[#F4EFE6]">
                    {selectedNode.nama}
                  </h4>
                </div>
                <button
                  onClick={() => setSelectedNode(null)}
                  className="p-1 rounded-full text-[#657351] hover:text-[#1F2B1D] dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <p className="text-xs text-[#4A5D44] dark:text-[#CBD7C7] font-light leading-relaxed">
                {selectedNode.deskripsi}
              </p>

              <div className="grid grid-cols-2 gap-2.5 pt-2 border-t border-[#243324]/10 dark:border-white/10">
                <div className="p-2.5 rounded-xl bg-[#F5F2EB] dark:bg-[#263825]">
                  <p className="text-[10px] uppercase tracking-wider text-[#657351] dark:text-[#A3B59E]">Total Jamaah</p>
                  <p className="font-display text-xl font-semibold text-[#1F2B1D] dark:text-[#F4EFE6]">{selectedNode.jamaah}</p>
                </div>
                <div className="p-2.5 rounded-xl bg-[#F5F2EB] dark:bg-[#263825]">
                  <p className="text-[10px] uppercase tracking-wider text-[#657351] dark:text-[#A3B59E]">Wilayah / Klaster</p>
                  <p className="text-xs font-medium text-[#1F2B1D] dark:text-[#F4EFE6] truncate">{selectedNode.klaster}</p>
                </div>
              </div>

              <div className="text-[11px] text-[#657351] dark:text-[#A3B59E] flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                <span>Pengurus: <strong className="text-[#1F2B1D] dark:text-[#F4EFE6]">{selectedNode.pengurus}</strong></span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Bottom Floating Stats Bar */}
      <div className="absolute bottom-3 left-4 right-4 sm:bottom-4 sm:left-8 sm:right-8 z-20 pointer-events-none">
        <div className="pointer-events-auto bg-[#1F2B1D]/90 dark:bg-[#1E2E1D]/90 text-white backdrop-blur-md px-4 sm:px-6 py-2.5 rounded-2xl border border-white/10 shadow-lg flex flex-col sm:flex-row items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-2">
            <MapPin className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            <span className="font-medium text-[#E8DCC4]">
              {selectedNode
                ? `${selectedNode.nama} • ${selectedNode.jamaah} Jamaah Terdata`
                : 'Jaringan 86 Zawiyah Seluruh Nusantara • Pusat: Zawiyah Pagendingan Tasikmalaya'}
            </span>
          </div>
          <span className="text-[11px] text-white/70">
            Klik salah satu titik zawiyah atau pulau untuk melihat detail pembinaan
          </span>
        </div>
      </div>
    </div>
  );
};
