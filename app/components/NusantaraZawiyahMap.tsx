'use client';

import React, { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  X,
  Users,
  Building2,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  MapPin,
  MousePointer,
  ChevronLeft,
  ChevronRight,
  Crown,
  Building,
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import {
  INDONESIA_PROVINCES,
  ZAWIYAH_NODES,
  CORRIDOR_ARCS,
  MAP_DIMENSIONS,
  ZawiyahMapNode,
} from '../data/indonesiaMapData';

interface NusantaraZawiyahMapProps {
  selectedClusterName?: string | null;
  onSelectCluster?: (clusterName: string | null) => void;
  onHoverCluster?: (clusterName: string | null) => void;
  onSelectZawiyah?: (node: ZawiyahMapNode | null) => void;
}

export const NusantaraZawiyahMap: React.FC<NusantaraZawiyahMapProps> = ({
  onSelectZawiyah,
}) => {
  const { isDark } = useTheme();
  const containerRef = useRef<HTMLDivElement>(null);

  // Zoom & Pan state (Archipelago overview down to individual branch zoom)
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
  const [hoveredProvince, setHoveredProvince] = useState<string | null>(null);

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<'ALL' | 'Pusat' | 'Utama' | 'Cabang'>('ALL');

  // Inverse scale for pins: Keeps pins sharp, crisp, and constant size at all zoom levels
  const pinScale = useMemo(() => {
    return Math.max(0.18, parseFloat((1 / Math.pow(zoom, 0.72)).toFixed(4)));
  }, [zoom]);

  // Filtered nodes based on search & type
  const visibleNodes = useMemo(() => {
    let result = ZAWIYAH_NODES;
    if (typeFilter !== 'ALL') {
      result = result.filter((n) => n.tipe === typeFilter);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(
        (n) =>
          n.nama.toLowerCase().includes(q) ||
          n.kota.toLowerCase().includes(q) ||
          n.provinsi.toLowerCase().includes(q) ||
          n.pengurus.toLowerCase().includes(q)
      );
    }
    return result;
  }, [typeFilter, searchQuery]);

  // Arcs to display (interconnecting Pusat Tasikmalaya to Utama Jakarta & key regions)
  const visibleCorridors = useMemo(() => {
    return CORRIDOR_ARCS;
  }, []);

  // Smooth flyTo camera animation
  const flyTo = useCallback(
    (targetX: number, targetY: number, targetZoom: number) => {
      const el = containerRef.current;
      if (!el) return;

      const rect = el.getBoundingClientRect();
      const w = rect.width || 800;
      const h = rect.height || 500;

      const scaleX = w / MAP_DIMENSIONS.width;
      const scaleY = h / MAP_DIMENSIONS.height;
      const baseScale = Math.min(scaleX, scaleY);

      const targetPanX = w / 2 - targetX * baseScale * targetZoom;
      const targetPanY = h / 2 - targetY * baseScale * targetZoom;

      setZoom(targetZoom);
      setPan({
        x: parseFloat(targetPanX.toFixed(2)),
        y: parseFloat(targetPanY.toFixed(2)),
      });
    },
    []
  );

  // Focus handlers for 2 Pillars
  const handleFocusPusat = useCallback(() => {
    const pusatNode = ZAWIYAH_NODES.find((n) => n.tipe === 'Pusat');
    if (pusatNode) {
      flyTo(pusatNode.x, pusatNode.y, 4.8);
      setSelectedNode(pusatNode);
      if (onSelectZawiyah) onSelectZawiyah(pusatNode);
    }
  }, [flyTo, onSelectZawiyah]);

  const handleFocusUtama = useCallback(() => {
    const utamaNode = ZAWIYAH_NODES.find((n) => n.tipe === 'Utama');
    if (utamaNode) {
      flyTo(utamaNode.x, utamaNode.y, 4.8);
      setSelectedNode(utamaNode);
      if (onSelectZawiyah) onSelectZawiyah(utamaNode);
    }
  }, [flyTo, onSelectZawiyah]);

  // Reset to full archipelago overview
  const handleResetZoom = useCallback(() => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
    setSelectedNode(null);
    setSearchQuery('');
    setTypeFilter('ALL');
    if (onSelectZawiyah) onSelectZawiyah(null);
  }, [onSelectZawiyah]);

  // Zoom controls with adaptive steps
  const handleZoomIn = () => {
    setZoom((prev) => {
      const step = prev >= 5 ? 1.5 : prev >= 2.5 ? 1.0 : 0.6;
      return Math.min(12.0, parseFloat((prev + step).toFixed(2)));
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

  // Node click handler
  const handleNodeClick = (node: ZawiyahMapNode) => {
    if (selectedNode?.id === node.id) {
      setSelectedNode(null);
      if (onSelectZawiyah) onSelectZawiyah(null);
    } else {
      setSelectedNode(node);
      if (onSelectZawiyah) onSelectZawiyah(node);
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

  // Memoized Indonesian Province Paths
  const provinceElements = useMemo(() => {
    return INDONESIA_PROVINCES.map((prov) => {
      const isHovered = hoveredProvince === prov.id;

      const fill = isDark
        ? isHovered
          ? '#2A3C28'
          : '#1C291B'
        : isHovered
        ? '#E5E0D2'
        : '#EAE4D9';

      const stroke = isDark
        ? isHovered
          ? '#4B6B48'
          : '#283826'
        : isHovered
        ? '#BDB7A7'
        : '#C8C2B3';

      return (
        <path
          key={prov.id}
          d={prov.path}
          fill={fill}
          stroke={stroke}
          strokeWidth={0.5}
          className="transition-colors duration-150 cursor-pointer"
          onMouseEnter={() => setHoveredProvince(prov.id)}
          onMouseLeave={() => setHoveredProvince(null)}
        />
      );
    });
  }, [isDark, hoveredProvince]);

  // Memoized corridor flow arcs connecting Pusat to Utama & regions
  const corridorArcElements = useMemo(() => {
    return visibleCorridors.map((arc) => (
      <path
        key={arc.id}
        d={arc.d}
        fill="none"
        stroke={isDark ? '#85E7B7' : '#3B4D36'}
        strokeWidth={arc.id === 'arc-jakarta' ? 1.4 : 0.8}
        strokeDasharray={arc.id === 'arc-jakarta' ? '4 3' : '3 4'}
        opacity={isDark ? (arc.id === 'arc-jakarta' ? 0.75 : 0.4) : arc.id === 'arc-jakarta' ? 0.65 : 0.3}
        className="animate-[dash_25s_linear_infinite]"
      />
    ));
  }, [isDark, visibleCorridors]);

  // Active nodes for cyclical browsing inside the bottom sheet drawer
  const currentNodeIdx = useMemo(() => {
    if (!selectedNode) return -1;
    return visibleNodes.findIndex((n) => n.id === selectedNode.id);
  }, [selectedNode, visibleNodes]);

  const handlePrevNode = () => {
    if (visibleNodes.length === 0) return;
    const nextIdx = (currentNodeIdx - 1 + visibleNodes.length) % visibleNodes.length;
    const nextNode = visibleNodes[nextIdx];
    setSelectedNode(nextNode);
    flyTo(nextNode.x, nextNode.y, Math.max(3.5, zoom));
  };

  const handleNextNode = () => {
    if (visibleNodes.length === 0) return;
    const nextIdx = (currentNodeIdx + 1) % visibleNodes.length;
    const nextNode = visibleNodes[nextIdx];
    setSelectedNode(nextNode);
    flyTo(nextNode.x, nextNode.y, Math.max(3.5, zoom));
  };

  // Mouse & touch drag pan handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button !== 0) return;
    setIsDragging(true);
    dragStartRef.current = { x: e.clientX, y: e.clientY };
    panStartRef.current = { ...pan };
  };

  const pendingPanRef = useRef<{ x: number; y: number } | null>(null);
  const pendingZoomRef = useRef<number | null>(null);
  const rafIdRef = useRef<number | null>(null);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    const dx = e.clientX - dragStartRef.current.x;
    const dy = e.clientY - dragStartRef.current.y;
    pendingPanRef.current = {
      x: panStartRef.current.x + dx,
      y: panStartRef.current.y + dy,
    };

    if (!rafIdRef.current) {
      rafIdRef.current = requestAnimationFrame(() => {
        if (pendingPanRef.current) {
          setPan(pendingPanRef.current);
          pendingPanRef.current = null;
        }
        rafIdRef.current = null;
      });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    if (rafIdRef.current) {
      cancelAnimationFrame(rafIdRef.current);
      rafIdRef.current = null;
    }
  };

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
      pendingPanRef.current = {
        x: panStartRef.current.x + dx,
        y: panStartRef.current.y + dy,
      };

      if (!rafIdRef.current) {
        rafIdRef.current = requestAnimationFrame(() => {
          if (pendingPanRef.current) {
            setPan(pendingPanRef.current);
            pendingPanRef.current = null;
          }
          rafIdRef.current = null;
        });
      }
    } else if (e.touches.length === 2 && touchDistanceRef.current !== null) {
      const dx = e.touches[0].clientX - e.touches[1].clientX;
      const dy = e.touches[0].clientY - e.touches[1].clientY;
      const newDistance = Math.hypot(dx, dy);
      const ratio = newDistance / touchDistanceRef.current;

      pendingZoomRef.current = Math.max(0.9, Math.min(12.0, parseFloat((zoom * ratio).toFixed(2))));
      touchDistanceRef.current = newDistance;

      if (!rafIdRef.current) {
        rafIdRef.current = requestAnimationFrame(() => {
          if (pendingZoomRef.current !== null) {
            setZoom(pendingZoomRef.current);
            pendingZoomRef.current = null;
          }
          rafIdRef.current = null;
        });
      }
    }
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
    touchDistanceRef.current = null;
    if (rafIdRef.current) {
      cancelAnimationFrame(rafIdRef.current);
      rafIdRef.current = null;
    }
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
      className={`relative w-full h-[500px] sm:h-[620px] lg:h-[700px] bg-[#FBF9F5] dark:bg-[#152014] overflow-hidden select-none transition-colors duration-400 ${
        isDragging ? 'cursor-grabbing' : 'cursor-grab'
      }`}
    >
      {/* Top Floating HUD: Controls & Navigation */}
      <div className="absolute top-2.5 sm:top-4 left-2.5 sm:left-4 right-2.5 sm:right-4 z-20 flex flex-col gap-2 pointer-events-none">
        {/* Row 1: Status Pill & Zoom Controls */}
        <div className="flex items-center justify-between gap-2">
          {/* Left: Mode Badge */}
          <div className="pointer-events-auto flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/95 dark:bg-[#1E2C1C]/95 backdrop-blur-md border border-[#243324]/12 dark:border-white/15 shadow-xs text-xs text-[#243324] dark:text-[#F4EFE6]">
            <span className="w-2 h-2 rounded-full shrink-0 bg-emerald-500 animate-pulse" />
            <span className="font-medium whitespace-nowrap">
              <span>86 Titik Zawiyah Nusantara</span>
            </span>
            <span className="text-[#657351] dark:text-[#A3B59E] font-semibold text-[11px]">
              ({Math.round(zoom * 100)}%)
            </span>
          </div>

          {/* Right: Zoom Controls */}
          <div className="pointer-events-auto flex items-center gap-1 bg-white/95 dark:bg-[#1E2C1C]/95 backdrop-blur-md rounded-xl sm:rounded-2xl border border-[#243324]/12 dark:border-white/15 p-1 shadow-xs">
            <button
              onClick={handleZoomIn}
              className="p-1.5 text-[#243324] dark:text-[#F4EFE6] hover:bg-[#F5F2EB] dark:hover:bg-[#2A3D28] rounded-lg sm:rounded-xl transition-colors cursor-pointer"
              title="Perbesar"
              aria-label="Perbesar"
            >
              <ZoomIn className="w-4 h-4" />
            </button>
            <button
              onClick={handleZoomOut}
              className="p-1.5 text-[#243324] dark:text-[#F4EFE6] hover:bg-[#F5F2EB] dark:hover:bg-[#2A3D28] rounded-lg sm:rounded-xl transition-colors cursor-pointer"
              title="Perkecil"
              aria-label="Perkecil"
            >
              <ZoomOut className="w-4 h-4" />
            </button>
            {(zoom > 1.05 || pan.x !== 0 || pan.y !== 0 || selectedNode || searchQuery || typeFilter !== 'ALL') && (
              <button
                onClick={handleResetZoom}
                className="flex items-center gap-1 px-2 py-1 text-xs font-medium text-[#3B4D36] dark:text-[#85E7B7] hover:bg-[#F5F2EB] dark:hover:bg-[#2A3D28] rounded-lg sm:rounded-xl transition-colors cursor-pointer border-l border-[#243324]/10 dark:border-white/10"
                title="Reset Peta"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Reset</span>
              </button>
            )}
          </div>
        </div>

        {/* Row 2: 2 Pillar Quick Jump Chips & Search */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5 pointer-events-auto">
          {/* Semua Titik Button */}
          <button
            onClick={handleResetZoom}
            className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-200 cursor-pointer border whitespace-nowrap flex items-center gap-1.5 ${
              !selectedNode && typeFilter === 'ALL' && !searchQuery
                ? 'bg-[#243324] dark:bg-[#85E7B7] text-white dark:text-[#142013] border-[#243324] dark:border-[#85E7B7] shadow-xs'
                : 'bg-white/90 dark:bg-[#1E2C1C]/90 backdrop-blur-sm text-[#4A5D44] dark:text-[#CBD7C7] hover:bg-white dark:hover:bg-[#283C26] border-[#243324]/10 dark:border-white/10'
            }`}
          >
            <span>Semua Titik</span>
            <span className="opacity-70">(86)</span>
          </button>

          {/* Pillar 1: Zawiyah Pusat Tasikmalaya */}
          <button
            onClick={handleFocusPusat}
            className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-200 cursor-pointer border whitespace-nowrap flex items-center gap-1.5 ${
              selectedNode?.tipe === 'Pusat'
                ? 'bg-emerald-800 dark:bg-emerald-400 text-white dark:text-[#0C1A0B] border-emerald-700 dark:border-emerald-300 shadow-xs ring-2 ring-emerald-500/30'
                : 'bg-white/90 dark:bg-[#1E2C1C]/90 backdrop-blur-sm text-emerald-800 dark:text-emerald-300 hover:bg-white dark:hover:bg-[#283C26] border-emerald-700/25'
            }`}
          >
            <Crown className="w-3.5 h-3.5 text-amber-500 shrink-0" />
            <span>Pusat Tasikmalaya</span>
          </button>

          {/* Pillar 2: Zawiyah Utama DKI Jakarta */}
          <button
            onClick={handleFocusUtama}
            className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-200 cursor-pointer border whitespace-nowrap flex items-center gap-1.5 ${
              selectedNode?.tipe === 'Utama'
                ? 'bg-amber-700 dark:bg-amber-400 text-white dark:text-[#1A1205] border-amber-600 dark:border-amber-300 shadow-xs ring-2 ring-amber-500/30'
                : 'bg-white/90 dark:bg-[#1E2C1C]/90 backdrop-blur-sm text-amber-800 dark:text-amber-300 hover:bg-white dark:hover:bg-[#283C26] border-amber-600/25'
            }`}
          >
            <Building className="w-3.5 h-3.5 text-amber-600 dark:text-amber-300 shrink-0" />
            <span>Utama Jakarta</span>
          </button>

          {/* Filter Cabang Saja */}
          <button
            onClick={() => {
              setTypeFilter(typeFilter === 'Cabang' ? 'ALL' : 'Cabang');
              setSelectedNode(null);
            }}
            className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-200 cursor-pointer border whitespace-nowrap flex items-center gap-1.5 ${
              typeFilter === 'Cabang'
                ? 'bg-[#3B4D36] text-white border-[#3B4D36] shadow-xs'
                : 'bg-white/90 dark:bg-[#1E2C1C]/90 backdrop-blur-sm text-[#4A5D44] dark:text-[#CBD7C7] hover:bg-white dark:hover:bg-[#283C26] border-[#243324]/10 dark:border-white/10'
            }`}
          >
            <span>84 Cabang Lainnya</span>
          </button>
        </div>
      </div>

      {/* SVG Canvas with Fluid GPU Pan & Zoom */}
      <div
        className="w-full h-full flex items-center justify-center"
        style={{
          transform: `translate3d(${pan.x}px, ${pan.y}px, 0px) scale(${zoom})`,
          transformOrigin: 'center center',
          transition: isDragging ? 'none' : 'transform 0.45s cubic-bezier(0.16, 1, 0.3, 1)',
          willChange: 'transform',
        }}
      >
        <svg
          viewBox={MAP_DIMENSIONS.viewBox}
          className="w-full h-full max-h-[96%]"
          style={{ overflow: 'visible', shapeRendering: 'geometricPrecision' }}
        >
          <defs>
            <filter id="pusatGlow" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="2.5" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
            <filter id="utamaGlow" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="2.5" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
            <filter id="pinShadow" x="-30%" y="-30%" width="160%" height="160%">
              <feDropShadow dx="0" dy="1.2" stdDeviation="1.5" floodColor="#000000" floodOpacity={isDark ? 0.6 : 0.25} />
            </filter>
          </defs>

          {/* 1. Indonesian Province Paths */}
          <g id="indonesia-provinces">
            {provinceElements}
          </g>

          {/* 2. Corridor Arcs (Flow from Pusat Tasikmalaya to Jakarta and regional points) */}
          <g id="corridor-arcs" className="pointer-events-none">
            {corridorArcElements}
          </g>

          {/* 3. ALL 86 INDIVIDUAL ZAWIYAH PINS */}
          {/* Dynamically scaled with pinScale so pins stay sharp, crisp, and constant size at all zoom levels */}
          <g id="individual-zawiyah-nodes">
            {visibleNodes.map((node) => {
              const isSelected = selectedNode?.id === node.id;
              const isHovered = hoveredNode?.id === node.id;
              const isPusat = node.tipe === 'Pusat';
              const isUtama = node.tipe === 'Utama';

              // Visual hierarchy sizing: Pusat (7.2) > Utama (6.2) > Cabang (3.6)
              const baseRadius = isPusat ? 7.2 : isUtama ? 6.2 : isSelected ? 5.2 : isHovered ? 4.4 : 3.5;

              return (
                <g
                  key={node.id}
                  transform={`translate(${node.x}, ${node.y}) scale(${pinScale})`}
                  className="cursor-pointer"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleNodeClick(node);
                  }}
                  onMouseEnter={() => setHoveredNode(node)}
                  onMouseLeave={() => setHoveredNode(null)}
                >
                  {/* Invisible generous touch target circle for effortless mobile tapping */}
                  <circle
                    r={26}
                    fill="transparent"
                    className="cursor-pointer"
                  />

                  {/* Radiant Pulse ring on Zawiyah Pusat Tasikmalaya */}
                  {isPusat && (
                    <circle
                      r={baseRadius + 6}
                      fill="none"
                      stroke={isDark ? '#85E7B7' : '#059669'}
                      strokeWidth={1.2}
                      opacity="0.75"
                    >
                      <animate attributeName="r" from={baseRadius + 4} to={baseRadius + 20} dur="2.4s" repeatCount="indefinite" />
                      <animate attributeName="opacity" from="0.9" to="0" dur="2.4s" repeatCount="indefinite" />
                    </circle>
                  )}

                  {/* Radiant Pulse ring on Zawiyah Utama Jakarta */}
                  {isUtama && (
                    <circle
                      r={baseRadius + 5}
                      fill="none"
                      stroke={isDark ? '#FBD38D' : '#D97706'}
                      strokeWidth={1.2}
                      opacity="0.75"
                    >
                      <animate attributeName="r" from={baseRadius + 4} to={baseRadius + 18} dur="2.4s" repeatCount="indefinite" />
                      <animate attributeName="opacity" from="0.9" to="0" dur="2.4s" repeatCount="indefinite" />
                    </circle>
                  )}

                  {/* Selection indicator ring */}
                  {isSelected && (
                    <circle
                      r={baseRadius + 4}
                      fill="none"
                      stroke={isPusat ? '#10B981' : isUtama ? '#F59E0B' : isDark ? '#85E7B7' : '#243324'}
                      strokeWidth={1.5}
                      strokeDasharray="2.5 1.5"
                    />
                  )}

                  {/* Node Pin Marker Circle */}
                  <circle
                    r={baseRadius}
                    fill={
                      isPusat
                        ? isDark
                          ? '#10B981'
                          : '#047857'
                        : isUtama
                        ? isDark
                          ? '#F59E0B'
                          : '#D97706'
                        : isSelected
                        ? isDark
                          ? '#85E7B7'
                          : '#243324'
                        : isHovered
                        ? isDark
                          ? '#A3E635'
                          : '#3B4D36'
                        : isDark
                        ? '#658C62'
                        : '#3B4D36'
                    }
                    stroke={
                      isPusat
                        ? '#F59E0B'
                        : isUtama
                        ? '#FFFFFF'
                        : isDark
                        ? '#141E13'
                        : '#FFFFFF'
                    }
                    strokeWidth={isPusat ? 1.8 : isUtama ? 1.5 : 1}
                    filter={isPusat ? 'url(#pusatGlow)' : isUtama ? 'url(#utamaGlow)' : 'url(#pinShadow)'}
                    className="transition-all duration-200"
                  />

                  {/* Pin Center Core */}
                  <circle
                    r={isPusat ? 3.0 : isUtama ? 2.6 : 1.4}
                    fill={
                      isPusat
                        ? '#FDF0D5'
                        : isUtama
                        ? '#FFFBEB'
                        : isDark
                        ? '#152014'
                        : '#F5F2EB'
                    }
                  />

                  {/* Crown symbol on Pusat pin */}
                  {isPusat && (
                    <g transform="translate(-3.5, -3.5) scale(0.42)">
                      <path
                        d="M2 12l2.5-6 3.5 3 4-6 4 6 3.5-3 2.5 6H2z"
                        fill="#D97706"
                      />
                    </g>
                  )}

                  {/* Label Tooltip on Hover or Selection */}
                  {(isHovered || isSelected || isPusat || isUtama) && (
                    <g
                      transform={`translate(0, -${baseRadius + 7})`}
                      className="pointer-events-none transition-all duration-150"
                    >
                      <rect
                        x={-42}
                        y={-14}
                        width={84}
                        height={isPusat || isUtama ? 18 : 15}
                        rx={4}
                        fill={
                          isPusat
                            ? '#064E3B'
                            : isUtama
                            ? '#78350F'
                            : isDark
                            ? '#141E13'
                            : '#243324'
                        }
                        stroke={
                          isPusat
                            ? '#10B981'
                            : isUtama
                            ? '#F59E0B'
                            : isDark
                            ? '#85E7B7'
                            : '#F4EFE6'
                        }
                        strokeWidth={0.7}
                        filter="url(#pinShadow)"
                      />
                      <text
                        y={isPusat || isUtama ? -7 : -6}
                        textAnchor="middle"
                        className="text-[6.2px] font-bold select-none"
                        fill="#FFFFFF"
                      >
                        {isPusat ? '👑 ZW PUSAT TASIK' : isUtama ? '🏛️ ZW UTAMA JAKARTA' : node.nama.replace('Zawiyah ', '')}
                      </text>
                      <text
                        y={isPusat || isUtama ? -0.5 : 0.5}
                        textAnchor="middle"
                        className="text-[4.8px] font-medium select-none"
                        fill={isPusat ? '#85E7B7' : isUtama ? '#FDE68A' : isDark ? '#85E7B7' : '#D1D5DB'}
                      >
                        {node.jamaah} Jamaah • {node.kota}
                      </text>
                    </g>
                  )}
                </g>
              );
            })}
          </g>
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
            className="absolute bottom-2 left-2 right-2 sm:bottom-auto sm:top-4 sm:right-4 sm:left-auto sm:w-[350px] max-h-[58%] sm:max-h-[90%] z-30 bg-white/95 dark:bg-[#1C291B]/95 backdrop-blur-md rounded-2xl sm:rounded-3xl border border-[#243324]/12 dark:border-white/15 shadow-2xl p-4 sm:p-5 overflow-y-auto flex flex-col space-y-3 sm:space-y-4 transition-colors duration-400"
          >
            {/* Mobile Drag Handle Pill */}
            <div className="w-10 h-1 bg-black/15 dark:bg-white/20 rounded-full mx-auto sm:hidden -mt-1 mb-1 shrink-0" />

            {/* Header & Close */}
            <div className="flex items-start justify-between gap-2">
              <div className="space-y-1">
                <div className="flex items-center gap-1.5">
                  <span
                    className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wide uppercase ${
                      selectedNode.tipe === 'Pusat'
                        ? 'bg-emerald-100 dark:bg-emerald-900/50 text-emerald-800 dark:text-emerald-300 border border-emerald-500/30'
                        : selectedNode.tipe === 'Utama'
                        ? 'bg-amber-100 dark:bg-amber-900/50 text-amber-800 dark:text-amber-300 border border-amber-500/30'
                        : 'bg-[#3B4D36]/10 dark:bg-white/10 text-[#3B4D36] dark:text-[#85E7B7]'
                    }`}
                  >
                    {selectedNode.tipe === 'Pusat' && <Crown className="w-3 h-3 text-amber-500" />}
                    {selectedNode.tipe === 'Utama' && <Building className="w-3 h-3 text-amber-600" />}
                    <span>Zawiyah {selectedNode.tipe}</span>
                  </span>
                  <span className="text-xs text-[#657351] dark:text-[#A3B59E]">
                    {selectedNode.id}
                  </span>
                </div>
                <h4 className="font-display text-lg sm:text-xl text-[#1F2B1D] dark:text-[#F4EFE6] font-normal leading-snug">
                  {selectedNode.nama}
                </h4>
                <p className="text-xs text-[#657351] dark:text-[#A3B59E] font-light flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 shrink-0 text-emerald-700 dark:text-emerald-400" />
                  <span>{selectedNode.kota}, {selectedNode.provinsi}</span>
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
            <div className="grid grid-cols-2 gap-2 sm:gap-2.5">
              <div className="p-3 rounded-xl sm:rounded-2xl bg-[#FBF9F5] dark:bg-[#141E13] border border-[#243324]/6 dark:border-white/10">
                <div className="font-display text-xl sm:text-2xl text-[#1F2B1D] dark:text-[#F4EFE6] font-normal">
                  {selectedNode.jamaah.toLocaleString('id-ID')}
                </div>
                <div className="text-[11px] text-[#657351] dark:text-[#A3B59E] flex items-center gap-1 mt-0.5">
                  <Users className="w-3 h-3 shrink-0" />
                  <span>Jamaah Terdaftar</span>
                </div>
              </div>
              <div className="p-3 rounded-xl sm:rounded-2xl bg-[#FBF9F5] dark:bg-[#141E13] border border-[#243324]/6 dark:border-white/10">
                <div className="font-display text-xl sm:text-2xl text-[#1F2B1D] dark:text-[#F4EFE6] font-normal">
                  {selectedNode.tipe}
                </div>
                <div className="text-[11px] text-[#657351] dark:text-[#A3B59E] flex items-center gap-1 mt-0.5">
                  <Building2 className="w-3 h-3 shrink-0" />
                  <span>Status Pilar</span>
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="p-3 rounded-xl sm:rounded-2xl bg-[#E8EFE6]/70 dark:bg-[#233421] border border-[#3B4D36]/15 dark:border-white/10">
              <p className="text-xs text-[#3B4D36] dark:text-[#CBD7C7] leading-relaxed">
                {selectedNode.deskripsi}
              </p>
            </div>

            {/* Pengurus info */}
            <div className="text-xs text-[#657351] dark:text-[#A3B59E]">
              Penanggung Jawab / Pembina: <span className="font-medium text-[#1F2B1D] dark:text-[#F4EFE6]">{selectedNode.pengurus}</span>
            </div>

            {/* Interactive Cyclical Stepper / Navigation */}
            {visibleNodes.length > 1 && (
              <div className="flex items-center justify-between border-t border-[#243324]/10 dark:border-white/10 pt-2.5 text-xs text-[#657351] dark:text-[#A3B59E]">
                <button
                  onClick={handlePrevNode}
                  className="flex items-center gap-1 px-2.5 py-1 rounded-lg hover:bg-black/5 dark:hover:bg-white/10 text-[#243324] dark:text-[#F4EFE6] cursor-pointer font-medium transition-colors"
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span>Sebelumnya</span>
                </button>
                <span className="font-medium text-xs text-[#1F2B1D] dark:text-[#F4EFE6]">
                  {currentNodeIdx + 1} / {visibleNodes.length} Zawiyah
                </span>
                <button
                  onClick={handleNextNode}
                  className="flex items-center gap-1 px-2.5 py-1 rounded-lg hover:bg-black/5 dark:hover:bg-white/10 text-[#243324] dark:text-[#F4EFE6] cursor-pointer font-medium transition-colors"
                >
                  <span>Berikutnya</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Bottom Hint */}
      {!selectedNode && (
        <div className="absolute bottom-2.5 left-3 right-3 pointer-events-none flex items-center justify-between text-[11px] text-[#657351] dark:text-[#A3B59E]">
          <div className="flex items-center gap-1.5 bg-white/90 dark:bg-[#141E13]/90 backdrop-blur-sm px-3 py-1.5 rounded-full border border-[#243324]/8 dark:border-white/10 shadow-xs">
            <MousePointer className="w-3.5 h-3.5" />
            <span className="sm:hidden">Pinch / geser peta • Ketuk titik zawiyah untuk rincian</span>
            <span className="hidden sm:inline">Scroll untuk zoom • Seret untuk geser • Klik titik zawiyah untuk melihat data cabang</span>
          </div>
        </div>
      )}
    </div>
  );
};
