'use client';

import React, { useState, useMemo, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Droplets } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import {
  ACTIVE_BOROUGHS,
  RIVER_THAMES_PATH,
  ALL_ROOFTOP_SITES,
  MAP_DIMENSIONS,
  BoroughGeoData,
} from '../data/londonMapData';
import { RooftopSite } from '../types';

interface LondonPollinatorMapProps {
  selectedBoroughName?: string | null;
  onSelectBorough?: (boroughName: string | null) => void;
  onHoverBorough?: (boroughName: string | null) => void;
  zoomLevel: number;
  onZoomIn: () => void;
  onZoomOut: () => void;
}

export const LondonPollinatorMap: React.FC<LondonPollinatorMapProps> = ({
  selectedBoroughName,
  onSelectBorough,
  onHoverBorough,
  zoomLevel,
}) => {
  const { isDark } = useTheme();
  const [selectedBoroughId, setSelectedBoroughId] = useState<string | null>(
    selectedBoroughName
      ? ACTIVE_BOROUGHS.find(
          (b) => b.name.toLowerCase() === selectedBoroughName.toLowerCase()
        )?.id || null
      : null
  );

  // Sync internal borough ID with prop if controlled
  useEffect(() => {
    if (selectedBoroughName === null || selectedBoroughName === undefined) {
      setSelectedBoroughId(null);
    } else {
      const match = ACTIVE_BOROUGHS.find(
        (b) => b.name.toLowerCase() === selectedBoroughName.toLowerCase()
      );
      setSelectedBoroughId(match ? match.id : null);
    }
  }, [selectedBoroughName]);

  const [hoveredBoroughId, setHoveredBoroughId] = useState<string | null>(null);
  const [selectedSite, setSelectedSite] = useState<RooftopSite | null>(null);
  const [hoveredSite, setHoveredSite] = useState<RooftopSite | null>(null);
  const panOffset = { x: 0, y: 0 };

  const mapContainerRef = useRef<HTMLDivElement>(null);

  // Filtered sites based on borough selection
  const filteredSites = useMemo(() => {
    return ALL_ROOFTOP_SITES.filter((site) => {
      if (!selectedBoroughId) return true;
      const selectedBorough = ACTIVE_BOROUGHS.find((b) => b.id === selectedBoroughId);
      return (
        selectedBorough &&
        site.borough.toLowerCase() === selectedBorough.name.toLowerCase()
      );
    });
  }, [selectedBoroughId]);

  const handleBoroughClick = (borough: BoroughGeoData) => {
    if (selectedBoroughId === borough.id) {
      setSelectedBoroughId(null);
      setSelectedSite(null);
      if (onSelectBorough) {
        onSelectBorough(null);
      }
    } else {
      setSelectedBoroughId(borough.id);
      setSelectedSite(null);
      if (onSelectBorough) {
        onSelectBorough(borough.name);
      }
    }
  };

  const handleBoroughMouseEnter = (borough: BoroughGeoData) => {
    setHoveredBoroughId(borough.id);
    if (onHoverBorough) {
      onHoverBorough(borough.name);
    }
  };

  const handleBoroughMouseLeave = () => {
    setHoveredBoroughId(null);
    if (onHoverBorough) {
      onHoverBorough(null);
    }
  };

  const handleSiteMouseEnter = (site: RooftopSite) => {
    setHoveredSite(site);
    if (onHoverBorough) {
      onHoverBorough(site.borough);
    }
  };

  const handleSiteMouseLeave = () => {
    setHoveredSite(null);
    if (hoveredBoroughId) {
      const b = ACTIVE_BOROUGHS.find((item) => item.id === hoveredBoroughId);
      if (b && onHoverBorough) {
        onHoverBorough(b.name);
        return;
      }
    }
    if (onHoverBorough) {
      onHoverBorough(null);
    }
  };

  return (
    <div
      className="relative w-full h-[540px] sm:h-[600px] lg:h-[650px] bg-[#FBF9F5] dark:bg-[#152014] overflow-hidden select-none px-2 sm:px-4 transition-colors duration-400"
      ref={mapContainerRef}
    >
      {/* SVG Map Canvas */}
      <div
        className="w-full h-full flex items-center justify-center transition-transform duration-300 ease-out origin-center p-2 sm:p-4"
        style={{
          transform: `scale(${zoomLevel}) translate(${panOffset.x}px, ${panOffset.y}px)`,
        }}
      >
        <svg
          viewBox={MAP_DIMENSIONS.viewBox}
          className="w-full h-full"
          style={{ overflow: 'visible' }}
        >
          <defs>
            {/* Soft Drop Shadow for Active Borough Polygons */}
            <filter id="boroughShadow" x="-5%" y="-5%" width="110%" height="110%">
              <feDropShadow dx="0" dy="1" stdDeviation="1" floodColor="#000000" floodOpacity={isDark ? 0.25 : 0.05} />
            </filter>
            <filter id="activeShadow" x="-10%" y="-10%" width="120%" height="120%">
              <feDropShadow dx="0" dy="2" stdDeviation="3" floodColor={isDark ? '#000000' : '#243324'} floodOpacity={isDark ? 0.45 : 0.18} />
            </filter>
          </defs>

          {/* 1. Borough Fill Polygons & Boundary Lines */}
          <g id="london-active-boroughs">
            {ACTIVE_BOROUGHS.map((borough) => {
              const isSelected = selectedBoroughId === borough.id;
              const isHovered = hoveredBoroughId === borough.id;

              const fillStyle = isDark
                ? isSelected
                  ? '#3D5439'
                  : isHovered
                  ? '#2B3D28'
                  : '#1E2C1C'
                : isSelected
                ? '#243324'
                : isHovered
                ? '#DCE8D8'
                : '#EAE4D9';

              const strokeStyle = isDark
                ? isSelected
                  ? '#85E7B7'
                  : isHovered
                  ? '#506B4D'
                  : '#334731'
                : isSelected
                ? '#142013'
                : '#243324';

              const strokeWidthVal = isSelected ? 1.2 : isHovered ? 0.9 : 0.75;

              return (
                <path
                  key={borough.id}
                  d={borough.svgPath}
                  fill={fillStyle}
                  stroke={strokeStyle}
                  strokeWidth={strokeWidthVal}
                  strokeLinejoin="round"
                  strokeLinecap="round"
                  className="cursor-pointer transition-colors duration-200"
                  filter={isSelected ? 'url(#activeShadow)' : 'url(#boroughShadow)'}
                  onMouseEnter={() => handleBoroughMouseEnter(borough)}
                  onMouseLeave={handleBoroughMouseLeave}
                  onClick={() => handleBoroughClick(borough)}
                />
              );
            })}
          </g>

          {/* 2. River Thames Ribbon (Continuous, unbroken, constant uniform 6px thickness across entire map) */}
          <g id="river-thames" className="pointer-events-none select-none">
            <path
              d={RIVER_THAMES_PATH}
              fill="none"
              stroke={isDark ? '#4D6B4A' : '#829c80'}
              strokeWidth="6"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </g>

          {/* 3. Borough Titles */}
          <g id="borough-titles" className="pointer-events-none select-none">
            {ACTIVE_BOROUGHS.map((borough) => {
              const isSelected = selectedBoroughId === borough.id;
              const isHovered = hoveredBoroughId === borough.id;

              const displayName =
                borough.name === 'Hammersmith and Fulham'
                  ? 'Hammersmith & Fulham'
                  : borough.name;

              const textStroke = isDark
                ? isSelected
                  ? '#1E2C1C'
                  : '#152014'
                : isSelected
                ? '#243324'
                : '#FBF9F5';

              const textFill = isDark
                ? isSelected
                  ? '#FFFFFF'
                  : isHovered
                  ? '#FFFFFF'
                  : '#DCE8D9'
                : isSelected
                ? '#FFFFFF'
                : isHovered
                ? '#142013'
                : '#243324';

              return (
                <text
                  key={`title-${borough.id}`}
                  x={borough.labelPos.x}
                  y={borough.labelPos.y}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  stroke={textStroke}
                  strokeWidth={isSelected ? '0' : '1.5'}
                  strokeLinejoin="round"
                  paintOrder="stroke fill"
                  className={`font-semibold tracking-tight transition-colors select-none ${
                    isSelected
                      ? 'text-[7.6px] font-bold'
                      : isHovered
                      ? 'text-[7.2px] font-bold'
                      : 'text-[6.8px]'
                  }`}
                  style={{ fill: textFill }}
                >
                  {displayName}
                </text>
              );
            })}
          </g>

          {/* 4. 52 Rooftop Site Pins */}
          <g id="rooftop-site-pins">
            {filteredSites.map((site) => {
              const isSelected = selectedSite?.id === site.id;
              const isHovered = hoveredSite?.id === site.id;

              return (
                <g
                  key={site.id}
                  transform={`translate(${site.x}, ${site.y})`}
                  className="cursor-pointer group"
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedSite(site);
                    const b = ACTIVE_BOROUGHS.find(
                      (item) => item.name.toLowerCase() === site.borough.toLowerCase()
                    );
                    if (b) {
                      setSelectedBoroughId(b.id);
                      if (onSelectBorough) onSelectBorough(b.name);
                    }
                  }}
                  onMouseEnter={() => handleSiteMouseEnter(site)}
                  onMouseLeave={handleSiteMouseLeave}
                >
                  {/* Stationary Selection Ring */}
                  {isSelected && (
                    <circle
                      r={7.5}
                      fill="none"
                      stroke={isDark ? '#85E7B7' : '#243324'}
                      strokeWidth="1.2"
                      className="opacity-70"
                    />
                  )}

                  {/* Main Location Pin Circle */}
                  <circle
                    r={isSelected ? 4.8 : isHovered ? 4.4 : 3.2}
                    className={`transition-all duration-150 ${
                      isDark
                        ? isSelected
                          ? 'fill-[#85E7B7] stroke-[#152014] stroke-[1.5]'
                          : isHovered
                          ? 'fill-[#F4EFE6] stroke-[#152014] stroke-[1.2]'
                          : 'fill-[#E6C285] stroke-[#152014] stroke-[0.9]'
                        : isSelected
                        ? 'fill-[#243324] stroke-[#FFFFFF] stroke-[1.5]'
                        : isHovered
                        ? 'fill-[#142013] stroke-[#FFFFFF] stroke-[1.2]'
                        : 'fill-[#243324] stroke-[#FBF9F5] stroke-[0.9]'
                    }`}
                  />

                  {/* Inner Center Dot */}
                  <circle
                    r={isSelected ? 1.5 : 1.0}
                    fill={isDark ? '#152014' : '#FFFFFF'}
                    className="pointer-events-none"
                  />
                </g>
              );
            })}
          </g>
        </svg>
      </div>

      {/* Hover Tooltip for Sites */}
      <AnimatePresence>
        {hoveredSite && !selectedSite && (
          <motion.div
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="absolute pointer-events-none z-30 bg-[#1F2B1D] dark:bg-[#0D150C] text-white px-3 py-2 rounded-xl text-xs shadow-xl space-y-0.5 border border-white/15"
            style={{
              left: `${((hoveredSite.x - MAP_DIMENSIONS.minX) / MAP_DIMENSIONS.width) * 100}%`,
              top: `${((hoveredSite.y - MAP_DIMENSIONS.minY) / MAP_DIMENSIONS.height) * 100}%`,
              transform: 'translate(-50%, -130%)',
            }}
          >
            <div className="font-semibold text-white">
              {hoveredSite.name}
            </div>
            <div className="flex items-center justify-between gap-3 text-[11px] text-[#CBD7C7]">
              <span>
                {hoveredSite.buildingType} • {hoveredSite.borough}
              </span>
              <span className="font-semibold text-emerald-300">{hoveredSite.hives} Hives</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Site Details Card */}
      <AnimatePresence>
        {selectedSite && (
          <motion.div
            initial={{ opacity: 0, x: 20, scale: 0.96 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 20, scale: 0.96 }}
            transition={{ type: 'spring', stiffness: 320, damping: 28 }}
            className="absolute top-4 right-4 max-h-[92%] w-[90%] sm:w-[340px] z-30 bg-white/95 dark:bg-[#1C291B]/95 backdrop-blur-md rounded-3xl border border-[#243324]/12 dark:border-white/15 shadow-2xl p-5 overflow-y-auto flex flex-col space-y-4 transition-colors duration-400"
          >
            {/* Header & Close Icon */}
            <div className="flex items-start justify-between gap-2">
              <div className="space-y-1">
                <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-semibold tracking-wide uppercase bg-[#3B4D36]/10 dark:bg-white/10 text-[#3B4D36] dark:text-[#85E7B7]">
                  {selectedSite.buildingType}
                </span>
                <h4 className="font-display text-xl text-[#1F2B1D] dark:text-[#F4EFE6] font-normal leading-snug">
                  {selectedSite.name}
                </h4>
                {selectedSite.addressSnippet && (
                  <p className="text-xs text-[#657351] dark:text-[#A3B59E] font-light">
                    {selectedSite.addressSnippet} • {selectedSite.borough}
                  </p>
                )}
              </div>
              <button
                onClick={() => setSelectedSite(null)}
                className="p-1.5 rounded-full hover:bg-[#243324]/8 dark:hover:bg-white/10 text-[#657351] dark:text-[#A3B59E] cursor-pointer shrink-0 transition-colors"
                aria-label="Close site details"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Key Metrics Grid */}
            <div className="grid grid-cols-2 gap-2.5">
              <div className="p-3 rounded-2xl bg-[#FBF9F5] dark:bg-[#141E13] border border-[#243324]/6 dark:border-white/10">
                <div className="font-display text-2xl text-[#1F2B1D] dark:text-[#F4EFE6] font-normal">
                  {selectedSite.hives}
                </div>
                <div className="text-[11px] text-[#657351] dark:text-[#A3B59E]">Active Hives</div>
              </div>
              <div className="p-3 rounded-2xl bg-[#FBF9F5] dark:bg-[#141E13] border border-[#243324]/6 dark:border-white/10">
                <div className="font-display text-2xl text-[#1F2B1D] dark:text-[#F4EFE6] font-normal">
                  {selectedSite.wildflowerAreaSqM}{' '}
                  <span className="text-xs font-sans font-light">m²</span>
                </div>
                <div className="text-[11px] text-[#657351] dark:text-[#A3B59E]">Wildflower Meadow</div>
              </div>
              <div className="p-3 rounded-2xl bg-[#FBF9F5] dark:bg-[#141E13] border border-[#243324]/6 dark:border-white/10">
                <div className="font-display text-2xl text-[#1F2B1D] dark:text-[#F4EFE6] font-normal">
                  {selectedSite.honeyHarvestKg}{' '}
                  <span className="text-xs font-sans font-light">kg</span>
                </div>
                <div className="text-[11px] text-[#657351] dark:text-[#A3B59E]">Raw Honey Yield</div>
              </div>
              <div className="p-3 rounded-2xl bg-[#FBF9F5] dark:bg-[#141E13] border border-[#243324]/6 dark:border-white/10">
                <div className="font-display text-2xl text-[#1F2B1D] dark:text-[#F4EFE6] font-normal">
                  {selectedSite.jarsDonated}
                </div>
                <div className="text-[11px] text-[#657351] dark:text-[#A3B59E]">Jars to Food Banks</div>
              </div>
            </div>

            {/* Environmental Co-Benefit: Stormwater */}
            <div className="p-3.5 rounded-2xl bg-[#E8EFE6]/70 dark:bg-[#233421] border border-[#3B4D36]/15 dark:border-white/10 flex items-center gap-3">
              <div className="p-2 rounded-xl bg-white dark:bg-[#141E13] text-[#3B4D36] dark:text-[#85E7B7] shadow-xs">
                <Droplets className="w-4 h-4 text-emerald-700 dark:text-[#85E7B7]" />
              </div>
              <div className="text-xs">
                <div className="font-semibold text-[#1F2B1D] dark:text-[#F4EFE6]">
                  {selectedSite.rainwaterL.toLocaleString('en-GB')} Litres
                </div>
                <div className="text-[#657351] dark:text-[#CBD7C7]">Stormwater absorbed from London sewers</div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

