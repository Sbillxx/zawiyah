'use client';

import React, { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Users, Building2, ZoomIn, ZoomOut, RotateCcw, MapPin, MousePointer, Info, ChevronLeft, ChevronRight } from 'lucide-react';
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

  // Zoom & Pan state (Supports deep mobile exploration up to 1300%)
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
  // cluster bubbles dissolve into individual zawiyah branch pins!
  const isDetailZoom = zoom >= 1.65 || Boolean(selectedClusterName);

  // Inverse scale for pins: Prevents pins from ballooning into giant blobs on zoom!
  // At zoom = 1, pinScale = 1.0. At zoom = 5.8, pinScale ≈ 0.25. At zoom = 10, pinScale ≈ 0.17.
  const pinScale = useMemo(() => {
    return Math.max(0.13, parseFloat((1 / Math.pow(zoom, 0.76)).toFixed(4)));
  }, [zoom]);

  // Active highlighted provinces
  const highlightedProvinces = useMemo(() => {
    const activeCluster = hoveredHub?.nama || selectedClusterName;
    if (!activeCluster) return new Set<string>();
    return new Set(KLASTER_PROVINCES[activeCluster] || []);
  }, [hoveredHub, selectedClusterName]);

  // Nodes to display
  const visibleNodes = useMemo(() => {
    if (selectedClusterName) {
      return ZAWIYAH_NODES.filter((n) => n.klaster === selectedClusterName);
    }
    return ZAWIYAH_NODES;
  }, [selectedClusterName]);

  // Arcs to display
  const visibleCorridors = useMemo(() => {
    if (isDetailZoom && selectedClusterName) {
      const nodeNames = new Set(visibleNodes.map((n) => n.kota));
      return CORRIDOR_ARCS.filter(
        (arc) => nodeNames.has(arc.fromName) || nodeNames.has(arc.toName)
      );
    }
    return CORRIDOR_ARCS;
  }, [isDetailZoom, selectedClusterName, visibleNodes]);

  // Active cluster nodes for cyclical browsing inside the bottom sheet drawer
  const activeClusterNodes = useMemo(() => {
    const cluster = selectedNode?.klaster || selectedClusterName;
    if (!cluster) return visibleNodes;
    return ZAWIYAH_NODES.filter((n) => n.klaster === cluster);
  }, [selectedNode, selectedClusterName, visibleNodes]);

  const currentNodeIdx = useMemo(() => {
    if (!selectedNode || activeClusterNodes.length === 0) return -1;
    return activeClusterNodes.findIndex((n) => n.id === selectedNode.id);
  }, [selectedNode, activeClusterNodes]);

  // Fly to target position & zoom with exact pixel centering for mobile and desktop
  const flyTo = useCallback((targetX: number, targetY: number, targetZoom: number) => {
    const container = containerRef.current;
    const rect = container?.getBoundingClientRect() || { width: 400, height: 480 };
    
    // Scale factor of SVG viewBox (793x288, center 396.5, 173) inside container
    const svgScale = Math.min(rect.width / 793, rect.height / 288);

    // Delta from SVG center (396.5, 173) to target
    const dxSvg = 396.5 - targetX;
    const dySvg = 173 - targetY;

    // Mobile magnification boost: On narrow screens (<640px), SVG horizontal scale is ~0.45.
    // Boost target zoom by 1.6x so cluster regions fill mobile portrait viewports with plenty of room!
    const isMobile = rect.width < 640;
    const effectiveZoom = isMobile
      ? Math.min(13.0, parseFloat((targetZoom * 1.6).toFixed(2)))
      : targetZoom;

    // Shift in screen pixels scaled by effectiveZoom
    const offsetX = dxSvg * svgScale * effectiveZoom;
    const offsetY = dySvg * svgScale * effectiveZoom;

    setZoom(effectiveZoom);
    setPan({ x: offsetX, y: offsetY });
  }, []);

  // Stepper handlers for cycling through branches in the active cluster
  const handlePrevNode = useCallback(() => {
    if (activeClusterNodes.length === 0) return;
    const newIdx = currentNodeIdx <= 0 ? activeClusterNodes.length - 1 : currentNodeIdx - 1;
    const target = activeClusterNodes[newIdx];
    setSelectedNode(target);
    flyTo(target.x, target.y, Math.max(zoom, 5.5));
  }, [activeClusterNodes, currentNodeIdx, flyTo, zoom]);

  const handleNextNode = useCallback(() => {
    if (activeClusterNodes.length === 0) return;
    const newIdx = currentNodeIdx >= activeClusterNodes.length - 1 ? 0 : currentNodeIdx + 1;
    const target = activeClusterNodes[newIdx];
    setSelectedNode(target);
    flyTo(target.x, target.y, Math.max(zoom, 5.5));
  }, [activeClusterNodes, currentNodeIdx, flyTo, zoom]);

  // Automatically fly to selected cluster when selectedClusterName changes
  useEffect(() => {
    if (!selectedClusterName) return;
    const hub = CLUSTER_HUBS.find(
      (h) => h.nama === selectedClusterName || h.singkatan === selectedClusterName
    );
    if (hub) {
      flyTo(hub.x, hub.y, hub.zoomTarget);
    }
  }, [selectedClusterName, flyTo]);

  // Reset to full archipelago overview
  const handleResetZoom = useCallback(() => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
    if (onSelectCluster) onSelectCluster(null);
    setSelectedNode(null);
  }, [onSelectCluster]);

  // Zoom controls with adaptive steps
  const handleZoomIn = () => {
    setZoom((prev) => {
      const step = prev >= 5 ? 1.5 : prev >= 2.5 ? 1.0 : 0.6;
      return Math.min(13.0, parseFloat((prev + step).toFixed(2)));
    });
  };
  const handleZoomOut = () => {
    setZoom((prev) => {
      const step = prev > 5 ? 1.5 : prev > 2.5 ? 1.0 : 0.6;
      const next = Math.max(0.9, parseFloat((prev - step).toFixed(2)));
      if (next <= 1.05) setPan({ x: 0, y: 0 });
      return next;
    });
  };

  // Click on a cluster bubble or chip -> zooms in deep & centers to reveal all branches cleanly
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

  // Native wheel zoom listener (passive: false)
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const handleWheelNative = (e: WheelEvent) => {
      e.preventDefault();
      const zoomFactor = e.deltaY < 0 ? 1.2 : 0.83;
      setZoom((prev) => {
        const next = Math.max(0.9, Math.min(12.0, prev * zoomFactor));
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

  // Touch handlers for mobile pan & pinch-zoom (with touch-action: none for silky smoothness)
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
      setZoom((prev) => Math.max(0.9, Math.min(12.0, parseFloat((prev * scale).toFixed(2)))));
    }
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
    touchDistanceRef.current = null;
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
      style={{ touchAction: 'none' }}
      className={`relative w-full h-[470px] sm:h-[600px] lg:h-[680px] bg-[#FBF9F5] dark:bg-[#152014] overflow-hidden select-none transition-colors duration-400 ${
        isDragging ? 'cursor-grabbing' : 'cursor-grab'
      }`}
    >
      {/* Top Floating HUD: Responsive Non-Colliding Layout for Mobile & Desktop */}
      <div className="absolute top-2.5 sm:top-4 left-2.5 sm:left-4 right-2.5 sm:right-4 z-20 flex flex-col gap-2 pointer-events-none">
        {/* Row 1: Mode Pill on Left, Zoom Controls on Right */}
        <div className="flex items-center justify-between gap-2">
          {/* Left: Mode Badge */}
          <div className="pointer-events-auto flex items-center gap-1.5 px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-full bg-white/95 dark:bg-[#1E2C1C]/95 backdrop-blur-md border border-[#243324]/12 dark:border-white/15 shadow-xs text-[11px] sm:text-xs text-[#243324] dark:text-[#F4EFE6]">
            <span className={`w-2 h-2 rounded-full shrink-0 ${isDetailZoom ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`} />
            <span className="font-medium whitespace-nowrap">
              {isDetailZoom ? (
                <span>
                  <span className="sm:hidden">Cabang Rinci</span>
                  <span className="hidden sm:inline">Mode Rinci: Cabang Individual</span>
                </span>
              ) : (
                <span>
                  <span className="sm:hidden">7 Klaster</span>
                  <span className="hidden sm:inline">Mode Tinjauan: 7 Klaster Wilayah</span>
                </span>
              )}
            </span>
            <span className="text-[#657351] dark:text-[#A3B59E] font-semibold text-[10px] sm:text-xs">
              ({Math.round(zoom * 100)}%)
            </span>
          </div>

          {/* Right: Quick Zoom & Reset Controls */}
          <div className="pointer-events-auto flex items-center gap-0.5 sm:gap-1 bg-white/95 dark:bg-[#1E2C1C]/95 backdrop-blur-md rounded-xl sm:rounded-2xl border border-[#243324]/12 dark:border-white/15 p-0.5 sm:p-1 shadow-xs">
            <button
              onClick={handleZoomIn}
              className="p-1 sm:p-1.5 text-[#243324] dark:text-[#F4EFE6] hover:bg-[#F5F2EB] dark:hover:bg-[#2A3D28] rounded-lg sm:rounded-xl transition-colors cursor-pointer"
              title="Perbesar"
              aria-label="Perbesar"
            >
              <ZoomIn className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </button>
            <button
              onClick={handleZoomOut}
              className="p-1 sm:p-1.5 text-[#243324] dark:text-[#F4EFE6] hover:bg-[#F5F2EB] dark:hover:bg-[#2A3D28] rounded-lg sm:rounded-xl transition-colors cursor-pointer"
              title="Perkecil"
              aria-label="Perkecil"
            >
              <ZoomOut className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </button>
            {(zoom > 1.05 || pan.x !== 0 || pan.y !== 0 || selectedClusterName) && (
              <button
                onClick={handleResetZoom}
                className="flex items-center gap-1 px-1.5 sm:px-2 py-0.5 sm:py-1 text-[10px] sm:text-xs font-medium text-[#3B4D36] dark:text-[#85E7B7] hover:bg-[#F5F2EB] dark:hover:bg-[#2A3D28] rounded-lg sm:rounded-xl transition-colors cursor-pointer border-l border-[#243324]/10 dark:border-white/10"
                title="Reset Peta"
              >
                <RotateCcw className="w-3 h-3" />
                <span className="hidden sm:inline">Reset</span>
              </button>
            )}
          </div>
        </div>

        {/* Row 2: Cluster Quick Chips (Clean Horizontally Scrollable Pills) */}
        <div className="flex items-center gap-1 sm:gap-1.5 overflow-x-auto no-scrollbar py-0.5 pointer-events-auto">
          {/* Overview 'Semua' pill */}
          <button
            onClick={handleResetZoom}
            className={`shrink-0 px-2.5 py-1 rounded-full text-[10px] sm:text-[11px] font-medium transition-all duration-200 cursor-pointer border whitespace-nowrap ${
              !selectedClusterName
                ? 'bg-[#243324] dark:bg-[#85E7B7] text-white dark:text-[#142013] border-[#243324] dark:border-[#85E7B7] shadow-xs scale-[1.03]'
                : 'bg-white/90 dark:bg-[#1E2C1C]/90 backdrop-blur-sm text-[#4A5D44] dark:text-[#CBD7C7] hover:bg-white dark:hover:bg-[#283C26] border-[#243324]/10 dark:border-white/10'
            }`}
          >
            <span>Semua</span>
            <span className="ml-1 opacity-70">(86)</span>
          </button>

          {CLUSTER_HUBS.map((hub) => {
            const isSelected = selectedClusterName === hub.nama;
            return (
              <button
                key={hub.id}
                onClick={() => {
                  if (isSelected) {
                    handleResetZoom();
                  } else {
                    handleClusterHubClick(hub);
                  }
                }}
                className={`shrink-0 px-2.5 py-1 rounded-full text-[10px] sm:text-[11px] font-medium transition-all duration-200 cursor-pointer border whitespace-nowrap ${
                  isSelected
                    ? 'bg-[#243324] dark:bg-[#85E7B7] text-white dark:text-[#142013] border-[#243324] dark:border-[#85E7B7] shadow-xs scale-[1.03]'
                    : 'bg-white/90 dark:bg-[#1E2C1C]/90 backdrop-blur-sm text-[#4A5D44] dark:text-[#CBD7C7] hover:bg-white dark:hover:bg-[#283C26] border-[#243324]/10 dark:border-white/10'
                }`}
              >
                <span>{hub.singkatan}</span>
                <span className="ml-1 opacity-70">({hub.totalCabang})</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* SVG Canvas with Fluid GPU Pan & Zoom */}
      <div
        className="w-full h-full flex items-center justify-center origin-center transition-transform duration-150 ease-out p-1 sm:p-4"
        style={{
          transform: `translate3d(${pan.x}px, ${pan.y}px, 0) scale(${zoom})`,
          transformOrigin: '50% 50%',
        }}
      >
        <svg
          viewBox={MAP_DIMENSIONS.viewBox}
          className="w-full h-full max-h-[96%]"
          style={{ overflow: 'visible' }}
        >
          <defs>
            <filter id="softProvinceShadow" x="-5%" y="-5%" width="110%" height="110%">
              <feDropShadow dx="0" dy="0.5" stdDeviation="0.8" floodColor="#000000" floodOpacity={isDark ? 0.25 : 0.05} />
            </filter>
            <filter id="activeProvinceShadow" x="-10%" y="-10%" width="120%" height="120%">
              <feDropShadow dx="0" dy="1" stdDeviation="2" floodColor={isDark ? '#000000' : '#243324'} floodOpacity={isDark ? 0.45 : 0.16} />
            </filter>
            <filter id="hubBadgeShadow" x="-30%" y="-30%" width="160%" height="160%">
              <feDropShadow dx="0" dy="1.5" stdDeviation="2" floodColor="#000000" floodOpacity={isDark ? 0.5 : 0.25} />
            </filter>
            <filter id="pusatGlow" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="2" result="blur" />
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
                strokeWidth={isDetailZoom ? '0.6' : '0.8'}
                strokeDasharray="4,3"
                strokeLinecap="round"
                opacity={isDetailZoom ? 0.35 : 0.65}
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
                      <animate attributeName="r" from={12} to="26" dur="2.4s" repeatCount="indefinite" />
                      <animate attributeName="opacity" from="0.6" to="0" dur="2.4s" repeatCount="indefinite" />
                    </circle>
                  )}

                  {/* Cluster Badge Capsule */}
                  <g filter="url(#hubBadgeShadow)">
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
          {/* Dynamically scaled with pinScale so pins stay sharp, crisp, and constant size at all zoom levels */}
          {/* NO static text labels rendered to prevent text collision/overlapping! */}
          <g id="individual-zawiyah-nodes" className={`transition-opacity duration-300 ${isDetailZoom ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
            {visibleNodes.map((node) => {
              const isSelected = selectedNode?.id === node.id;
              const isHovered = hoveredNode?.id === node.id;
              const isPusat = node.tipe === 'Pusat';
              const baseRadius = isPusat ? 6 : isSelected ? 5.2 : isHovered ? 4.5 : 3.6;

              return (
                <g
                  key={node.id}
                  transform={`translate(${node.x}, ${node.y}) scale(${pinScale})`}
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
                  {/* Invisible generous touch target circle for effortless mobile tapping */}
                  <circle
                    r={28}
                    fill="transparent"
                    className="cursor-pointer"
                  />

                  {/* Pulse ring on Pusat */}
                  {isPusat && (
                    <circle
                      r={baseRadius + 6}
                      fill="none"
                      stroke={isDark ? '#85E7B7' : '#3B4D36'}
                      strokeWidth={1}
                      opacity="0.6"
                    >
                      <animate attributeName="r" from={baseRadius + 4} to={baseRadius + 18} dur="2.2s" repeatCount="indefinite" />
                      <animate attributeName="opacity" from="0.8" to="0" dur="2.2s" repeatCount="indefinite" />
                    </circle>
                  )}

                  {/* Selection indicator ring */}
                  {isSelected && (
                    <circle
                      r={baseRadius + 3.5}
                      fill="none"
                      stroke={isDark ? '#85E7B7' : '#1F2B1D'}
                      strokeWidth={1.5}
                      opacity="0.9"
                    />
                  )}

                  {/* Main Pin Circle */}
                  <circle
                    r={baseRadius}
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
                    strokeWidth={isSelected ? 1.6 : isPusat ? 1.4 : 1.0}
                    filter={isPusat ? 'url(#pusatGlow)' : undefined}
                  />

                  {/* Center Dot */}
                  <circle
                    r={isPusat ? 2.0 : 1.2}
                    fill={isDark ? '#152014' : '#FFFFFF'}
                    className="pointer-events-none"
                  />

                  {/* Special Badge Label for Pusat */}
                  {isPusat && (
                    <g transform="translate(0, -12)">
                      <rect
                        x={-18}
                        y={-6}
                        width={36}
                        height={12}
                        rx={6}
                        fill={isDark ? '#142013' : '#FFFFFF'}
                        stroke={isDark ? '#85E7B7' : '#1F2B1D'}
                        strokeWidth={1}
                        filter="url(#hubBadgeShadow)"
                      />
                      <text
                        y={0.5}
                        textAnchor="middle"
                        dominantBaseline="middle"
                        className="text-[6px] font-bold tracking-wider select-none pointer-events-none"
                        fill={isDark ? '#85E7B7' : '#1F2B1D'}
                      >
                        ★ PUSAT
                      </text>
                    </g>
                  )}

                  {/* Desktop Hover Tooltip (Attached synchronously to pin, zero collision!) */}
                  {isHovered && !isPusat && (
                    <g transform="translate(0, -18)" className="pointer-events-none select-none hidden sm:block">
                      <g filter="url(#hubBadgeShadow)">
                        <rect
                          x={-44}
                          y={-14}
                          width={88}
                          height={23}
                          rx={6}
                          fill={isDark ? '#0D150C' : '#1F2B1D'}
                          stroke={isDark ? '#85E7B7' : '#FFFFFF'}
                          strokeWidth={1}
                        />
                        <polygon
                          points="-4,9 0,13 4,9"
                          fill={isDark ? '#0D150C' : '#1F2B1D'}
                        />
                        <text
                          y={-4.5}
                          textAnchor="middle"
                          dominantBaseline="middle"
                          className="text-[6.5px] font-bold select-none"
                          fill="#FFFFFF"
                        >
                          {node.nama.replace('Zawiyah ', '')}
                        </text>
                        <text
                          y={4.5}
                          textAnchor="middle"
                          dominantBaseline="middle"
                          className="text-[5.2px] font-medium select-none"
                          fill={isDark ? '#85E7B7' : '#A3E635'}
                        >
                          {node.jamaah} Jamaah • {node.kota}
                        </text>
                      </g>
                    </g>
                  )}
                </g>
              );
            })}
          </g>

          {/* 5. Major Island Region Watermarks (Faded out when zoomed in) */}
          {zoom < 2.2 && (
            <g id="island-watermarks" className="pointer-events-none select-none transition-opacity duration-300">
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
                  opacity={0.3}
                >
                  {island.label}
                </text>
              ))}
            </g>
          )}
        </svg>
      </div>

      {/* Floating Selected Node Drawer: Mobile Bottom Sheet / Desktop Top-Right Card */}
      <AnimatePresence>
        {selectedNode && (
          <motion.div
            initial={{ opacity: 0, y: 24, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 24, scale: 0.96 }}
            transition={{ type: 'spring', stiffness: 320, damping: 28 }}
            className="absolute bottom-2 left-2 right-2 sm:bottom-auto sm:top-4 sm:right-4 sm:left-auto sm:w-[350px] max-h-[56%] sm:max-h-[90%] z-30 bg-white/95 dark:bg-[#1C291B]/95 backdrop-blur-md rounded-2xl sm:rounded-3xl border border-[#243324]/12 dark:border-white/15 shadow-2xl p-3.5 sm:p-5 overflow-y-auto flex flex-col space-y-2.5 sm:space-y-4 transition-colors duration-400"
          >
            {/* Mobile Drag Handle Pill */}
            <div className="w-10 h-1 bg-black/15 dark:bg-white/20 rounded-full mx-auto sm:hidden -mt-0.5 mb-1 shrink-0" />

            {/* Header & Close */}
            <div className="flex items-start justify-between gap-2">
              <div className="space-y-0.5 sm:space-y-1">
                <div className="flex items-center gap-1.5">
                  <span className={`inline-block px-2 py-0.5 rounded-full text-[9px] sm:text-[10px] font-semibold tracking-wide uppercase ${
                    selectedNode.tipe === 'Pusat'
                      ? 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-800 dark:text-emerald-300'
                      : selectedNode.tipe === 'Cabang'
                      ? 'bg-[#3B4D36]/10 dark:bg-white/10 text-[#3B4D36] dark:text-[#85E7B7]'
                      : 'bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-300'
                  }`}>
                    {selectedNode.tipe}
                  </span>
                  <span className="text-[10px] sm:text-xs text-[#657351] dark:text-[#A3B59E]">
                    {selectedNode.klaster.split(' (')[0]}
                  </span>
                </div>
                <h4 className="font-display text-base sm:text-xl text-[#1F2B1D] dark:text-[#F4EFE6] font-normal leading-snug">
                  {selectedNode.nama}
                </h4>
                <p className="text-[10.5px] sm:text-xs text-[#657351] dark:text-[#A3B59E] font-light flex items-center gap-1">
                  <MapPin className="w-3 h-3 sm:w-3.5 sm:h-3.5 shrink-0" />
                  <span>{selectedNode.kota}, {selectedNode.provinsi}</span>
                </p>
              </div>
              <button
                onClick={() => setSelectedNode(null)}
                className="p-1 sm:p-1.5 rounded-full hover:bg-[#243324]/8 dark:hover:bg-white/10 text-[#657351] dark:text-[#A3B59E] cursor-pointer shrink-0 transition-colors"
                aria-label="Tutup detail"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Metrics */}
            <div className="grid grid-cols-2 gap-2 sm:gap-2.5">
              <div className="p-2 sm:p-3 rounded-xl sm:rounded-2xl bg-[#FBF9F5] dark:bg-[#141E13] border border-[#243324]/6 dark:border-white/10">
                <div className="font-display text-lg sm:text-2xl text-[#1F2B1D] dark:text-[#F4EFE6] font-normal">
                  {selectedNode.jamaah}
                </div>
                <div className="text-[9.5px] sm:text-[11px] text-[#657351] dark:text-[#A3B59E] flex items-center gap-1">
                  <Users className="w-2.5 h-2.5 sm:w-3 sm:h-3 shrink-0" />
                  <span>Jamaah Aktif</span>
                </div>
              </div>
              <div className="p-2 sm:p-3 rounded-xl sm:rounded-2xl bg-[#FBF9F5] dark:bg-[#141E13] border border-[#243324]/6 dark:border-white/10">
                <div className="font-display text-lg sm:text-2xl text-[#1F2B1D] dark:text-[#F4EFE6] font-normal">
                  {selectedNode.tipe}
                </div>
                <div className="text-[9.5px] sm:text-[11px] text-[#657351] dark:text-[#A3B59E] flex items-center gap-1">
                  <Building2 className="w-2.5 h-2.5 sm:w-3 sm:h-3 shrink-0" />
                  <span>Klasifikasi</span>
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="p-2 sm:p-3 rounded-xl sm:rounded-2xl bg-[#E8EFE6]/70 dark:bg-[#233421] border border-[#3B4D36]/15 dark:border-white/10">
              <p className="text-[10.5px] sm:text-xs text-[#3B4D36] dark:text-[#CBD7C7] leading-relaxed">
                {selectedNode.deskripsi}
              </p>
            </div>

            {/* Pengurus info */}
            <div className="text-[10px] sm:text-[11px] text-[#657351] dark:text-[#A3B59E]">
              Pembina: <span className="font-medium text-[#1F2B1D] dark:text-[#F4EFE6]">{selectedNode.pengurus}</span>
            </div>

            {/* Interactive Cluster Branch Stepper / Navigation */}
            {activeClusterNodes.length > 1 && (
              <div className="flex items-center justify-between border-t border-[#243324]/10 dark:border-white/10 pt-2 text-[10.5px] sm:text-xs text-[#657351] dark:text-[#A3B59E]">
                <button
                  onClick={handlePrevNode}
                  className="flex items-center gap-1 px-2 py-1 rounded-lg hover:bg-black/5 dark:hover:bg-white/10 text-[#243324] dark:text-[#F4EFE6] cursor-pointer font-medium transition-colors"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                  <span>Sebelumnya</span>
                </button>
                <span className="font-medium text-[10px] text-[#1F2B1D] dark:text-[#F4EFE6]">
                  {currentNodeIdx + 1} / {activeClusterNodes.length} Cabang
                </span>
                <button
                  onClick={handleNextNode}
                  className="flex items-center gap-1 px-2 py-1 rounded-lg hover:bg-black/5 dark:hover:bg-white/10 text-[#243324] dark:text-[#F4EFE6] cursor-pointer font-medium transition-colors"
                >
                  <span>Berikutnya</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Bottom Mobile Hint */}
      {!selectedNode && (
        <div className="absolute bottom-2.5 left-3 right-3 pointer-events-none flex items-center justify-between text-[10px] sm:text-[11px] text-[#657351] dark:text-[#A3B59E]">
          <div className="flex items-center gap-1.5 bg-white/85 dark:bg-[#141E13]/85 backdrop-blur-sm px-2.5 py-1 rounded-full border border-[#243324]/8 dark:border-white/10 shadow-xs">
            <MousePointer className="w-3 h-3" />
            <span className="sm:hidden">Pinch / geser peta • Ketuk titik untuk rincian</span>
            <span className="hidden sm:inline">Scroll mouse untuk zoom mendalam • Seret untuk geser • Hover titik untuk info</span>
          </div>
        </div>
      )}
    </div>
  );
};
