'use client';

import React, { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Users, Building2, ZoomIn, ZoomOut, RotateCcw, MapPin, Eye, MousePointer } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import {
  INDONESIA_PROVINCES,
  ZAWIYAH_NODES,
  CORRIDOR_ARCS,
  MAP_DIMENSIONS,
  CLUSTER_HUBS,
  ClusterHub,
  ZawiyahMapNode,
} from '../data/indonesiaMapData';

interface NusantaraZawiyahMapProps {
  selectedClusterName?: string | null;
  onSelectCluster?: (clusterName: string | null) => void;
  onHoverCluster?: (clusterName: string | null) => void;
}

// Map klaster → highlight provinces
const KLASTER_PROVINCES: Record<string, string[]> = {
  'Priangan Timur (Pusat Tarekat)': ['id-jb'],
  'Megapolitan Jabodetabek & Banten': ['id-jk', 'id-bt', 'id-jb'],
  'Pantura & Kawasan Industri': ['id-jb'],
  'Jawa Tengah & DI Yogyakarta': ['id-jt', 'id-yo'],
  'Bandung Raya & Priangan Barat': ['id-jb'],
  'Jawa Timur & Indonesia Timur': ['id-ji', 'id-nb', 'id-sn'],
  'Sumatera & Kalimantan': ['id-la', 'id-su', 'id-ki', 'id-kt'],
};

export const NusantaraZawiyahMap: React.FC<NusantaraZawiyahMapProps> = ({
  selectedClusterName,
  onSelectCluster,
  onHoverCluster,
}) => {
  const { isDark } = useTheme();
  const containerRef = useRef<HTMLDivElement>(null);

  // Zoom & Pan state
  const [zoom, setZoom] = useState<number>(1);
  const [pan, setPan] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const dragStartRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const panStartRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  // Touch pinch zoom state
  const touchDistanceRef = useRef<number | null>(null);

  // Selection & Hover state
  const [hoveredNode, setHoveredNode] = useState<ZawiyahMapNode | null>(null);
  const [selectedNode, setSelectedNode] = useState<ZawiyahMapNode | null>(null);
  const [hoveredHub, setHoveredHub] = useState<ClusterHub | null>(null);
  const [hoveredProvince, setHoveredProvince] = useState<string | null>(null);

  // Detail zoom threshold: when zoom >= 1.65 OR a specific cluster is active,
  // cluster bubbles break apart into all individual zawiyah branch pins!
  const isDetailZoom = zoom >= 1.65 || Boolean(selectedClusterName);

  // Active highlighted provinces
  const highlightedProvinces = useMemo(() => {
    const activeCluster = hoveredHub?.nama || selectedClusterName;
    if (!activeCluster) return new Set<string>();
    return new Set(KLASTER_PROVINCES[activeCluster] || []);
  }, [hoveredHub, selectedClusterName]);

  // Nodes to display:
  // If a cluster is explicitly selected, focus on its nodes.
  // Otherwise in detail zoom, show all nodes.
  const visibleNodes = useMemo(() => {
    if (selectedClusterName) {
      return ZAWIYAH_NODES.filter((n) => n.klaster === selectedClusterName);
    }
    return ZAWIYAH_NODES;
  }, [selectedClusterName]);

  // Arcs to display:
  const visibleCorridors = useMemo(() => {
    if (isDetailZoom && selectedClusterName) {
      const nodeNames = new Set(visibleNodes.map((n) => n.kota));
      return CORRIDOR_ARCS.filter(
        (arc) => nodeNames.has(arc.fromName) || nodeNames.has(arc.toName)
      );
    }
    return CORRIDOR_ARCS;
  }, [isDetailZoom, selectedClusterName, visibleNodes]);

  // Fly to target position & zoom
  const flyTo = useCallback((targetX: number, targetY: number, targetZoom: number) => {
    // Center point in SVG coords is (400, 175)
    // Offset calculation to align target in center
    const centerSvgX = 400;
    const centerSvgY = 175;
    const offsetX = (centerSvgX - targetX) * (targetZoom - 1);
    const offsetY = (centerSvgY - targetY) * (targetZoom - 1);

    setZoom(targetZoom);
    setPan({ x: offsetX, y: offsetY });
  }, []);

  // Reset to full archipelago overview
  const handleResetZoom = useCallback(() => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
    if (onSelectCluster) onSelectCluster(null);
    setSelectedNode(null);
  }, [onSelectCluster]);

  // Zoom controls
  const handleZoomIn = () => {
    setZoom((prev) => Math.min(4.0, parseFloat((prev + 0.35).toFixed(2))));
  };
  const handleZoomOut = () => {
    setZoom((prev) => {
      const next = Math.max(0.9, parseFloat((prev - 0.35).toFixed(2)));
      if (next <= 1) setPan({ x: 0, y: 0 });
      return next;
    });
  };

  // Click on a cluster bubble -> automatically zooms in & centers to reveal all individual branches!
  const handleClusterHubClick = (hub: ClusterHub) => {
    if (onSelectCluster) onSelectCluster(hub.nama);
    flyTo(hub.x, hub.y, hub.zoomTarget);
  };

  // Node click handler
  const handleNodeClick = (node: ZawiyahMapNode) => {
    if (selectedNode?.id === node.id) {
      setSelectedNode(null);
    } else {
      setSelectedNode(node);
      if (onSelectCluster && !selectedClusterName) {
        onSelectCluster(node.klaster);
      }
    }
  };

  // Wheel zoom with passive: false to smoothly zoom without page scrolling
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const handleWheelNative = (e: WheelEvent) => {
      e.preventDefault();
      const zoomFactor = e.deltaY < 0 ? 1.15 : 0.88;
      setZoom((prev) => {
        const next = Math.max(0.9, Math.min(4.2, prev * zoomFactor));
        if (next <= 1.05) {
          setPan({ x: 0, y: 0 });
        }
        return parseFloat(next.toFixed(2));
      });
    };

    el.addEventListener('wheel', handleWheelNative, { passive: false });
    return () => {
      el.removeEventListener('wheel', handleWheelNative);
    };
  }, []);

  // Mouse drag handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    // Only drag with left click
    if (e.button !== 0) return;
    setIsDragging(true);
    dragStartRef.current = { x: e.clientX, y: e.clientY };
    panStartRef.current = { ...pan };
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    const dx = e.clientX - dragStartRef.current.x;
    const dy = e.clientY - dragStartRef.current.y;
    setPan({
      x: panStartRef.current.x + dx,
      y: panStartRef.current.y + dy,
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Touch handlers for mobile pan & pinch-zoom
  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 1) {
      setIsDragging(true);
      dragStartRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
      panStartRef.current = { ...pan };
      touchDistanceRef.current = null;
    } else if (e.touches.length === 2) {
      setIsDragging(false);
      const dx = e.touches[0].clientX - e.touches[1].clientX;
      const dy = e.touches[0].clientY - e.touches[1].clientY;
      touchDistanceRef.current = Math.hypot(dx, dy);
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (e.touches.length === 1 && isDragging) {
      const dx = e.touches[0].clientX - dragStartRef.current.x;
      const dy = e.touches[0].clientY - dragStartRef.current.y;
      setPan({
        x: panStartRef.current.x + dx,
        y: panStartRef.current.y + dy,
      });
    } else if (e.touches.length === 2 && touchDistanceRef.current !== null) {
      const dx = e.touches[0].clientX - e.touches[1].clientX;
      const dy = e.touches[0].clientY - e.touches[1].clientY;
      const distance = Math.hypot(dx, dy);
      const scale = distance / touchDistanceRef.current;
      touchDistanceRef.current = distance;
      setZoom((prev) => Math.max(0.9, Math.min(4.0, parseFloat((prev * scale).toFixed(2)))));
    }
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
    touchDistanceRef.current = null;
  };

  // Size helper for pins
  const getNodeRadius = (node: ZawiyahMapNode, isSelected: boolean, isHovered: boolean) => {
    const isPusat = node.tipe === 'Pusat';
    const base = isPusat ? 5.5 : node.tipe === 'Cabang' ? 3.5 : 2.8;
    if (isSelected) return base + 2.5;
    if (isHovered) return base + 1.5;
    return base;
  };

  return (
    <div
      ref={containerRef}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      className={`relative w-full h-[560px] sm:h-[620px] lg:h-[680px] bg-[#FBF9F5] dark:bg-[#152014] overflow-hidden select-none transition-colors duration-400 ${
        isDragging ? 'cursor-grabbing' : 'cursor-grab'
      }`}
    >
      {/* Top Floating HUD: Mode Indicator & Quick Cluster Chips */}
      <div className="absolute top-4 left-4 right-4 z-20 flex flex-wrap items-center justify-between gap-2.5 pointer-events-none">
        {/* Left: Mode Badge */}
        <div className="pointer-events-auto flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/90 dark:bg-[#1E2C1C]/90 backdrop-blur-md border border-[#243324]/12 dark:border-white/15 shadow-sm text-xs text-[#243324] dark:text-[#F4EFE6]">
          <span className={`w-2 h-2 rounded-full ${isDetailZoom ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`} />
          <span className="font-medium">
            {isDetailZoom ? 'Mode Rinci: Seluruh Cabang Individual' : 'Mode Tinjauan: 7 Klaster Wilayah'}
          </span>
          <span className="hidden sm:inline text-[#657351] dark:text-[#A3B59E]">
            ({Math.round(zoom * 100)}%)
          </span>
        </div>

        {/* Right: Quick Zoom & Reset Controls */}
        <div className="pointer-events-auto flex items-center gap-1.5 bg-white/90 dark:bg-[#1E2C1C]/90 backdrop-blur-md rounded-2xl border border-[#243324]/12 dark:border-white/15 p-1 shadow-sm">
          <button
            onClick={handleZoomIn}
            className="p-1.5 text-[#243324] dark:text-[#F4EFE6] hover:bg-[#F5F2EB] dark:hover:bg-[#2A3D28] rounded-xl transition-colors cursor-pointer"
            title="Perbesar (Scroll ke atas)"
            aria-label="Perbesar"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
          <button
            onClick={handleZoomOut}
            className="p-1.5 text-[#243324] dark:text-[#F4EFE6] hover:bg-[#F5F2EB] dark:hover:bg-[#2A3D28] rounded-xl transition-colors cursor-pointer"
            title="Perkecil (Scroll ke bawah)"
            aria-label="Perkecil"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
          {(zoom > 1.05 || pan.x !== 0 || pan.y !== 0 || selectedClusterName) && (
            <button
              onClick={handleResetZoom}
              className="flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-[#3B4D36] dark:text-[#85E7B7] hover:bg-[#F5F2EB] dark:hover:bg-[#2A3D28] rounded-xl transition-colors cursor-pointer"
              title="Reset Tampilan Peta"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Reset</span>
            </button>
          )}
        </div>
      </div>

      {/* Cluster Quick Pills at Top Center */}
      <div className="absolute top-16 left-4 right-4 z-20 flex items-center justify-start sm:justify-center gap-1.5 overflow-x-auto no-scrollbar pointer-events-none py-1">
        {CLUSTER_HUBS.map((hub) => {
          const isSelected = selectedClusterName === hub.nama;
          return (
            <button
              key={hub.id}
              onClick={() => handleClusterHubClick(hub)}
              className={`pointer-events-auto shrink-0 px-2.5 py-1 rounded-full text-[11px] font-medium transition-all duration-200 cursor-pointer border ${
                isSelected
                  ? 'bg-[#243324] dark:bg-[#85E7B7] text-white dark:text-[#142013] border-[#243324] dark:border-[#85E7B7] shadow-sm scale-105'
                  : 'bg-white/85 dark:bg-[#1E2C1C]/85 backdrop-blur-sm text-[#4A5D44] dark:text-[#CBD7C7] hover:bg-white dark:hover:bg-[#283C26] border-[#243324]/10 dark:border-white/10'
              }`}
            >
              <span>{hub.singkatan}</span>
              <span className="ml-1 opacity-70">({hub.totalCabang})</span>
            </button>
          );
        })}
      </div>

      {/* SVG Canvas with Fluid GPU Pan & Zoom */}
      <div
        className="w-full h-full flex items-center justify-center origin-center transition-transform duration-150 ease-out p-2 sm:p-4"
        style={{
          transform: `translate3d(${pan.x}px, ${pan.y}px, 0) scale(${zoom})`,
          transformOrigin: '50% 50%',
        }}
      >
        <svg
          viewBox={MAP_DIMENSIONS.viewBox}
          className="w-full h-full max-h-[95%]"
          style={{ overflow: 'visible' }}
        >
          <defs>
            <filter id="softProvinceShadow" x="-5%" y="-5%" width="110%" height="110%">
              <feDropShadow dx="0" dy="0.5" stdDeviation="0.8" floodColor="#000000" floodOpacity={isDark ? 0.25 : 0.05} />
            </filter>
            <filter id="activeProvinceShadow" x="-10%" y="-10%" width="120%" height="120%">
              <feDropShadow dx="0" dy="1" stdDeviation="2" floodColor={isDark ? '#000000' : '#243324'} floodOpacity={isDark ? 0.45 : 0.16} />
            </filter>
            <filter id="hubBadgeShadow" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="2" stdDeviation="3" floodColor="#000000" floodOpacity={isDark ? 0.5 : 0.18} />
            </filter>
            <filter id="pusatGlow" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="2.5" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* 1. Indonesian Province Paths */}
          <g id="indonesia-provinces">
            {INDONESIA_PROVINCES.map((prov) => {
              const isHighlighted = highlightedProvinces.has(prov.id);
              const isHovered = hoveredProvince === prov.id;

              const fill = isDark
                ? isHighlighted
                  ? '#3A5236'
                  : isHovered
                  ? '#2B3D28'
                  : '#1E2C1C'
                : isHighlighted
                ? '#DCE8D8'
                : isHovered
                ? '#E8E2D5'
                : '#EAE4D9';

              const stroke = isDark
                ? isHighlighted
                  ? '#5A7A56'
                  : '#2A3928'
                : isHighlighted
                ? '#ADC3A8'
                : '#C8C2B3';

              return (
                <path
                  key={prov.id}
                  d={prov.path}
                  fill={fill}
                  stroke={stroke}
                  strokeWidth={isHighlighted ? 0.7 : 0.35}
                  strokeLinejoin="round"
                  strokeLinecap="round"
                  className="transition-colors duration-200"
                  filter={isHighlighted ? 'url(#activeProvinceShadow)' : 'url(#softProvinceShadow)'}
                  onMouseEnter={() => setHoveredProvince(prov.id)}
                  onMouseLeave={() => setHoveredProvince(null)}
                />
              );
            })}
          </g>

          {/* 2. Corridor Arcs (Flow from Pusat Tasikmalaya to regional nodes) */}
          <g id="corridor-arcs" className="pointer-events-none">
            {visibleCorridors.map((arc) => (
              <path
                key={arc.id}
                d={arc.d}
                fill="none"
                stroke={isDark ? '#557851' : '#9EB299'}
                strokeWidth={isDetailZoom ? '0.7' : '0.9'}
                strokeDasharray="4,3"
                strokeLinecap="round"
                opacity={0.65}
              >
                <animate
                  attributeName="stroke-dashoffset"
                  from="0"
                  to="-14"
                  dur="3s"
                  repeatCount="indefinite"
                />
              </path>
            ))}
          </g>

          {/* 3. CLUSTER BUBBLES (Rendered during Overview Mode when zoomed out) */}
          {/* As requested: In overview it shows 1 cluster badge (e.g. Priangan Timur: 16 Cabang),
              and zooming in reveals all 16 individual branches! */}
          <g id="cluster-bubbles" className={`transition-opacity duration-300 ${isDetailZoom ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}>
            {CLUSTER_HUBS.map((hub) => {
              const isHovered = hoveredHub?.id === hub.id;
              const isPriangan = hub.id === 'hub-priangan';

              return (
                <g
                  key={hub.id}
                  transform={`translate(${hub.x}, ${hub.y})`}
                  className="cursor-pointer group"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleClusterHubClick(hub);
                  }}
                  onMouseEnter={() => {
                    setHoveredHub(hub);
                    if (onHoverCluster) onHoverCluster(hub.nama);
                  }}
                  onMouseLeave={() => {
                    setHoveredHub(null);
                    if (onHoverCluster) onHoverCluster(null);
                  }}
                >
                  {/* Subtle Expanding Ring for Priangan Timur (Pusat Tarekat) */}
                  {isPriangan && (
                    <circle
                      r={14}
                      fill="none"
                      stroke={isDark ? '#85E7B7' : '#3B4D36'}
                      strokeWidth="0.8"
                      opacity="0.5"
                    >
                      <animate attributeName="r" from="12" to="26" dur="2.4s" repeatCount="indefinite" />
                      <animate attributeName="opacity" from="0.6" to="0" dur="2.4s" repeatCount="indefinite" />
                    </circle>
                  )}

                  {/* Cluster Badge Capsule */}
                  <g filter="url(#hubBadgeShadow)">
                    {/* Badge Pill Background */}
                    <rect
                      x={-28}
                      y={-12}
                      width={56}
                      height={24}
                      rx={12}
                      className="transition-all duration-200"
                      fill={
                        isDark
                          ? isHovered
                            ? '#2A3D28'
                            : '#1C291B'
                          : isHovered
                          ? '#1F2B1D'
                          : '#243324'
                      }
                      stroke={
                        isDark
                          ? isHovered
                            ? '#85E7B7'
                            : '#4A6846'
                          : isHovered
                          ? '#3B4D36'
                          : '#FFFFFF'
                      }
                      strokeWidth={1}
                    />

                    {/* Number Badge Circle */}
                    <circle
                      cx={-17}
                      cy={0}
                      r={8}
                      fill={isDark ? '#85E7B7' : '#F4EFE6'}
                    />

                    {/* Branch Count Number */}
                    <text
                      x={-17}
                      y={0.5}
                      textAnchor="middle"
                      dominantBaseline="middle"
                      className="text-[6.5px] font-black select-none pointer-events-none"
                      fill={isDark ? '#142013' : '#1F2B1D'}
                    >
                      {hub.totalCabang}
                    </text>

                    {/* "Cabang" label */}
                    <text
                      x={6}
                      y={-2}
                      textAnchor="middle"
                      dominantBaseline="middle"
                      className="text-[5.2px] font-semibold tracking-wide uppercase select-none pointer-events-none"
                      fill="#FFFFFF"
                    >
                      Cabang
                    </text>

                    {/* Jamaah count micro subtext */}
                    <text
                      x={6}
                      y={5}
                      textAnchor="middle"
                      dominantBaseline="middle"
                      className="text-[4px] font-normal select-none pointer-events-none opacity-80"
                      fill="#CBD7C7"
                    >
                      {hub.totalJamaah.toLocaleString('id-ID')} jmh
                    </text>
                  </g>

                  {/* Region Name Label underneath */}
                  <text
                    x={0}
                    y={19}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    className="text-[5.5px] font-bold tracking-wider uppercase select-none pointer-events-none"
                    fill={isDark ? '#85E7B7' : '#1F2B1D'}
                    stroke={isDark ? '#152014' : '#FBF9F5'}
                    strokeWidth="1.5"
                    strokeLinejoin="round"
                    paintOrder="stroke fill"
                  >
                    {hub.singkatan}
                  </text>
                </g>
              );
            })}
          </g>

          {/* 4. INDIVIDUAL ZAWIYAH BRANCH PINS */}
          {/* Always rendered, but full prominence when in detail zoom or focused cluster */}
          <g id="individual-zawiyah-nodes" className={`transition-opacity duration-300 ${isDetailZoom ? 'opacity-100' : 'opacity-30 pointer-events-none'}`}>
            {visibleNodes.map((node) => {
              const isSelected = selectedNode?.id === node.id;
              const isHovered = hoveredNode?.id === node.id;
              const radius = getNodeRadius(node, isSelected, isHovered);
              const isPusat = node.tipe === 'Pusat';

              return (
                <g
                  key={node.id}
                  transform={`translate(${node.x}, ${node.y})`}
                  className="cursor-pointer"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleNodeClick(node);
                  }}
                  onMouseEnter={() => {
                    setHoveredNode(node);
                    if (onHoverCluster) onHoverCluster(node.klaster);
                  }}
                  onMouseLeave={() => {
                    setHoveredNode(null);
                    if (onHoverCluster) onHoverCluster(null);
                  }}
                >
                  {/* Pulse ring on Pusat */}
                  {isPusat && (
                    <circle
                      r={radius + 5}
                      fill="none"
                      stroke={isDark ? '#85E7B7' : '#3B4D36'}
                      strokeWidth="0.8"
                      opacity="0.5"
                    >
                      <animate attributeName="r" from={radius + 3} to={radius + 14} dur="2.2s" repeatCount="indefinite" />
                      <animate attributeName="opacity" from="0.7" to="0" dur="2.2s" repeatCount="indefinite" />
                    </circle>
                  )}

                  {/* Selection indicator ring */}
                  {isSelected && (
                    <circle
                      r={radius + 3.5}
                      fill="none"
                      stroke={isDark ? '#85E7B7' : '#1F2B1D'}
                      strokeWidth="1.2"
                      opacity="0.8"
                    />
                  )}

                  {/* Main Pin Circle */}
                  <circle
                    r={radius}
                    fill={
                      isDark
                        ? isPusat
                          ? '#85E7B7'
                          : isSelected
                          ? '#85E7B7'
                          : isHovered
                          ? '#FFFFFF'
                          : node.tipe === 'Cabang'
                          ? '#E8C587'
                          : '#A3B59E'
                        : isPusat
                        ? '#1F2B1D'
                        : isSelected
                        ? '#142013'
                        : isHovered
                        ? '#000000'
                        : node.tipe === 'Cabang'
                        ? '#3B4D36'
                        : '#657351'
                    }
                    stroke={isDark ? '#152014' : '#FBF9F5'}
                    strokeWidth={isSelected ? 1.4 : isPusat ? 1.2 : 0.8}
                    filter={isPusat ? 'url(#pusatGlow)' : undefined}
                    className="transition-transform duration-150"
                  />

                  {/* Center Dot */}
                  <circle
                    r={isPusat ? 1.8 : 1}
                    fill={isDark ? '#152014' : '#FFFFFF'}
                    className="pointer-events-none"
                  />

                  {/* Special Label for Pusat */}
                  {isPusat && (
                    <text
                      y={-10}
                      textAnchor="middle"
                      dominantBaseline="middle"
                      className="text-[4.8px] font-bold tracking-wide pointer-events-none select-none"
                      fill={isDark ? '#85E7B7' : '#1F2B1D'}
                      stroke={isDark ? '#152014' : '#FBF9F5'}
                      strokeWidth="1.4"
                      strokeLinejoin="round"
                      paintOrder="stroke fill"
                    >
                      ★ PUSAT
                    </text>
                  )}

                  {/* When zoomed in close, display branch town label directly on the map */}
                  {zoom >= 2.2 && !isPusat && (
                    <text
                      y={radius + 5}
                      textAnchor="middle"
                      dominantBaseline="hanging"
                      className="text-[3.8px] font-semibold tracking-tight pointer-events-none select-none opacity-90"
                      fill={isDark ? '#CBD7C7' : '#243324'}
                      stroke={isDark ? '#152014' : '#FBF9F5'}
                      strokeWidth="0.8"
                      strokeLinejoin="round"
                      paintOrder="stroke fill"
                    >
                      {node.nama.replace('Zawiyah ', '').replace('Kabupaten ', 'Kab. ')}
                    </text>
                  )}
                </g>
              );
            })}
          </g>

          {/* 5. Major Island Region Watermarks */}
          <g id="island-watermarks" className="pointer-events-none select-none">
            {[
              { label: 'SUMATERA', x: 100, y: 165 },
              { label: 'KALIMANTAN', x: 340, y: 155 },
              { label: 'SULAWESI', x: 460, y: 155 },
              { label: 'JAWA', x: 260, y: 274 },
              { label: 'PAPUA', x: 680, y: 140 },
            ].map((island) => (
              <text
                key={island.label}
                x={island.x}
                y={island.y}
                textAnchor="middle"
                dominantBaseline="middle"
                className="text-[5.5px] font-semibold tracking-[0.3em] uppercase"
                fill={isDark ? '#506B4D' : '#B5AC9A'}
                opacity={0.35}
              >
                {island.label}
              </text>
            ))}
          </g>
        </svg>
      </div>

      {/* Hover Tooltip for Individual Nodes */}
      <AnimatePresence>
        {hoveredNode && !selectedNode && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 4 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="absolute pointer-events-none z-30 bg-[#1F2B1D] dark:bg-[#0D150C] text-white px-3.5 py-2.5 rounded-xl text-xs shadow-xl space-y-1 border border-white/15 max-w-[240px]"
            style={{
              left: `${(hoveredNode.x / MAP_DIMENSIONS.width) * 100}%`,
              top: `${((hoveredNode.y - 28) / MAP_DIMENSIONS.height) * 100}%`,
              transform: 'translate(-50%, -140%)',
            }}
          >
            <div className="font-semibold text-white text-[13px] leading-tight">
              {hoveredNode.nama}
            </div>
            <div className="text-[11px] text-[#CBD7C7] flex items-center gap-1.5">
              <MapPin className="w-3 h-3 text-emerald-400 shrink-0" />
              <span>{hoveredNode.kota}, {hoveredNode.provinsi}</span>
            </div>
            <div className="flex items-center justify-between text-[11px] pt-1 border-t border-white/10">
              <span className="flex items-center gap-1 text-emerald-300 font-semibold">
                <Users className="w-3 h-3" />
                {hoveredNode.jamaah} Jamaah
              </span>
              <span className="text-[#A3B59E] font-medium">
                {hoveredNode.tipe}
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Selected Node Details Glass Card */}
      <AnimatePresence>
        {selectedNode && (
          <motion.div
            initial={{ opacity: 0, x: 24, scale: 0.96 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 24, scale: 0.96 }}
            transition={{ type: 'spring', stiffness: 320, damping: 28 }}
            className="absolute top-4 right-4 max-h-[92%] w-[90%] sm:w-[350px] z-30 bg-white/95 dark:bg-[#1C291B]/95 backdrop-blur-md rounded-3xl border border-[#243324]/12 dark:border-white/15 shadow-2xl p-5 overflow-y-auto flex flex-col space-y-4 transition-colors duration-400"
          >
            {/* Header & Close */}
            <div className="flex items-start justify-between gap-2">
              <div className="space-y-1.5">
                <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-semibold tracking-wide uppercase ${
                  selectedNode.tipe === 'Pusat'
                    ? 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-800 dark:text-emerald-300'
                    : selectedNode.tipe === 'Cabang'
                    ? 'bg-[#3B4D36]/10 dark:bg-white/10 text-[#3B4D36] dark:text-[#85E7B7]'
                    : 'bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-300'
                }`}>
                  {selectedNode.tipe}
                </span>
                <h4 className="font-display text-xl text-[#1F2B1D] dark:text-[#F4EFE6] font-normal leading-snug">
                  {selectedNode.nama}
                </h4>
                <p className="text-xs text-[#657351] dark:text-[#A3B59E] font-light flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5" />
                  {selectedNode.kota}, {selectedNode.provinsi}
                </p>
              </div>
              <button
                onClick={() => setSelectedNode(null)}
                className="p-1.5 rounded-full hover:bg-[#243324]/8 dark:hover:bg-white/10 text-[#657351] dark:text-[#A3B59E] cursor-pointer shrink-0 transition-colors"
                aria-label="Tutup detail"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Metrics */}
            <div className="grid grid-cols-2 gap-2.5">
              <div className="p-3 rounded-2xl bg-[#FBF9F5] dark:bg-[#141E13] border border-[#243324]/6 dark:border-white/10">
                <div className="font-display text-2xl text-[#1F2B1D] dark:text-[#F4EFE6] font-normal">
                  {selectedNode.jamaah}
                </div>
                <div className="text-[11px] text-[#657351] dark:text-[#A3B59E] flex items-center gap-1">
                  <Users className="w-3 h-3" />
                  Jamaah Aktif
                </div>
              </div>
              <div className="p-3 rounded-2xl bg-[#FBF9F5] dark:bg-[#141E13] border border-[#243324]/6 dark:border-white/10">
                <div className="font-display text-2xl text-[#1F2B1D] dark:text-[#F4EFE6] font-normal">
                  {selectedNode.tipe}
                </div>
                <div className="text-[11px] text-[#657351] dark:text-[#A3B59E] flex items-center gap-1">
                  <Building2 className="w-3 h-3" />
                  Klasifikasi
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="p-3.5 rounded-2xl bg-[#E8EFE6]/70 dark:bg-[#233421] border border-[#3B4D36]/15 dark:border-white/10">
              <p className="text-xs text-[#3B4D36] dark:text-[#CBD7C7] leading-relaxed">
                {selectedNode.deskripsi}
              </p>
            </div>

            {/* Pengurus & Klaster badge */}
            <div className="space-y-1 text-[11px] text-[#657351] dark:text-[#A3B59E] pt-1">
              <div>
                Pembina/Pengurus: <span className="font-medium text-[#1F2B1D] dark:text-[#F4EFE6]">{selectedNode.pengurus}</span>
              </div>
              <div>
                Klaster Wilayah: <span className="font-medium text-[#1F2B1D] dark:text-[#F4EFE6]">{selectedNode.klaster}</span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Bottom Hint on How to Interact */}
      <div className="absolute bottom-3 left-4 right-4 pointer-events-none flex items-center justify-between text-[11px] text-[#657351] dark:text-[#A3B59E]">
        <div className="flex items-center gap-1.5 bg-white/70 dark:bg-[#141E13]/70 backdrop-blur-sm px-2.5 py-1 rounded-full border border-[#243324]/8 dark:border-white/10">
          <MousePointer className="w-3 h-3" />
          <span className="hidden sm:inline">Scroll mouse untuk zoom • Seret untuk geser peta • Klik klaster untuk melihat cabang</span>
          <span className="sm:hidden">Pinch / drag untuk jelajah peta</span>
        </div>
      </div>
    </div>
  );
};
