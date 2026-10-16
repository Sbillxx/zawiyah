'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { Search, ArrowLeft, Building2, Users, MapPin, User } from 'lucide-react';
import type { Zawiyah } from '@/lib/data/ssot';

interface Props { zawiyahList: Zawiyah[] }

const TIPE_COLORS: Record<string, string> = {
  'Pusat': 'bg-[#1F2B1D] text-[#F4EFE6]',
  'Wilayah': 'bg-[#3B4D36] text-[#F4EFE6]',
  'Cabang': 'bg-[#E8DCC4] text-[#1F2B1D]',
};

export default function AdminZawiyah({ zawiyahList }: Props) {
  const [search, setSearch] = useState('');
  const [filterTipe, setFilterTipe] = useState('ALL');
  const [sortBy, setSortBy] = useState<'jamaah' | 'nama'>('jamaah');

  const uniqueTipe = useMemo(() => [...new Set(zawiyahList.map((z) => z.tipe))].sort(), [zawiyahList]);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return zawiyahList
      .filter((z) => {
        const matchSearch = !search || z.nama.toLowerCase().includes(q) || z.kota.toLowerCase().includes(q) || z.pengurus.toLowerCase().includes(q);
        const matchTipe = filterTipe === 'ALL' || z.tipe === filterTipe;
        return matchSearch && matchTipe;
      })
      .sort((a, b) => sortBy === 'jamaah' ? b.jamaah - a.jamaah : a.nama.localeCompare(b.nama));
  }, [search, filterTipe, sortBy, zawiyahList]);

  const totalJamaahFiltered = filtered.reduce((acc, z) => acc + z.jamaah, 0);

  return (
    <div className="min-h-screen bg-[#FBF9F5] dark:bg-[#131D12] font-sans">
      <header className="sticky top-0 z-40 border-b border-[#243324]/10 dark:border-white/10 bg-[#FBF9F5]/90 dark:bg-[#131D12]/90 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Link href="/admin" className="flex items-center gap-1.5 text-sm text-[#657351] dark:text-[#A3B59E] hover:text-[#243324] dark:hover:text-[#F4EFE6] transition-colors">
              <ArrowLeft className="w-4 h-4" /> Dashboard
            </Link>
            <span className="text-[#243324]/20 dark:text-white/20">/</span>
            <h1 className="font-display text-lg text-[#1F2B1D] dark:text-[#F4EFE6] font-light">Cabang Zawiyah</h1>
          </div>
          <div className="flex items-center gap-2 text-xs text-[#657351] dark:text-[#A3B59E]">
            <Building2 className="w-3.5 h-3.5" />
            <span className="font-display text-base font-light text-[#1F2B1D] dark:text-[#F4EFE6]">{filtered.length}</span>
            <span>/ {zawiyahList.length} cabang</span>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        <div className="flex flex-wrap gap-4">
          <div className="glass-panel rounded-xl px-4 py-2.5 flex items-center gap-2">
            <Building2 className="w-4 h-4 text-[#4A5D44] dark:text-[#A3B59E]" />
            <div>
              <p className="font-display text-xl text-[#1F2B1D] dark:text-[#F4EFE6] leading-none">{filtered.length}</p>
              <p className="text-[10px] text-[#657351] dark:text-[#A3B59E]">Cabang ditampilkan</p>
            </div>
          </div>
          <div className="glass-panel rounded-xl px-4 py-2.5 flex items-center gap-2">
            <Users className="w-4 h-4 text-[#4A5D44] dark:text-[#A3B59E]" />
            <div>
              <p className="font-display text-xl text-[#1F2B1D] dark:text-[#F4EFE6] leading-none">{totalJamaahFiltered.toLocaleString('id-ID')}</p>
              <p className="text-[10px] text-[#657351] dark:text-[#A3B59E]">Total jamaah</p>
            </div>
          </div>
        </div>

        <div className="glass-panel rounded-2xl p-4 flex flex-wrap gap-3 items-center">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#657351] dark:text-[#A3B59E]" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari nama cabang, kota, atau pengurus..."
              className="w-full pl-9 pr-4 py-2.5 bg-transparent border border-[#243324]/15 dark:border-white/15 rounded-xl text-sm text-[#243324] dark:text-[#F4EFE6] placeholder-[#A3B59E] focus:outline-none focus:border-[#1F2B1D] dark:focus:border-white/40 transition-colors"
            />
          </div>
          <select value={filterTipe} onChange={(e) => setFilterTipe(e.target.value)} className="px-3 py-2.5 text-sm border border-[#243324]/15 dark:border-white/15 rounded-xl bg-transparent text-[#243324] dark:text-[#F4EFE6] focus:outline-none focus:border-[#1F2B1D] dark:focus:border-white/40 cursor-pointer transition-colors">
            <option value="ALL">Semua Tipe</option>
            {uniqueTipe.map((t) => <option key={t} value={t}>{t}</option>)}
          </select>
          <select value={sortBy} onChange={(e) => setSortBy(e.target.value as 'jamaah' | 'nama')} className="px-3 py-2.5 text-sm border border-[#243324]/15 dark:border-white/15 rounded-xl bg-transparent text-[#243324] dark:text-[#F4EFE6] focus:outline-none focus:border-[#1F2B1D] dark:focus:border-white/40 cursor-pointer transition-colors">
            <option value="jamaah">Urutkan: Jamaah Terbanyak</option>
            <option value="nama">Urutkan: Nama A-Z</option>
          </select>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((z) => {
            const maxJamaah = filtered[0]?.jamaah || 1;
            const pct = Math.round((z.jamaah / maxJamaah) * 100);
            const tipeClass = TIPE_COLORS[z.tipe] || 'bg-[#E8DCC4] text-[#1F2B1D]';
            return (
              <div key={z.id} className="glass-panel rounded-2xl p-5 space-y-4 hover:shadow-xl transition-shadow duration-300 group">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-[#1F2B1D] dark:text-[#F4EFE6] leading-snug line-clamp-2 text-sm">{z.nama}</h3>
                    <div className="flex items-center gap-1 mt-1.5">
                      <MapPin className="w-3 h-3 text-[#657351] dark:text-[#A3B59E] flex-shrink-0" />
                      <p className="text-xs text-[#657351] dark:text-[#A3B59E] truncate">{z.kota}</p>
                    </div>
                  </div>
                  <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold flex-shrink-0 ${tipeClass}`}>{z.tipe}</span>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between items-baseline">
                    <p className="text-xs text-[#657351] dark:text-[#A3B59E]">Jumlah Jamaah</p>
                    <p className="font-display text-2xl text-[#1F2B1D] dark:text-[#F4EFE6] font-light">{z.jamaah.toLocaleString('id-ID')}</p>
                  </div>
                  <div className="h-1.5 bg-[#243324]/8 dark:bg-white/8 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-[#1F2B1D] to-[#4A5D44] dark:from-[#68DBA9] dark:to-[#A3B59E] rounded-full transition-all duration-700" style={{ width: pct + '%' }} />
                  </div>
                </div>
                <div className="flex items-center gap-1.5 pt-1 border-t border-[#243324]/8 dark:border-white/8">
                  <User className="w-3 h-3 text-[#657351] dark:text-[#A3B59E] flex-shrink-0" />
                  <p className="text-xs text-[#657351] dark:text-[#A3B59E] truncate">{z.pengurus}</p>
                </div>
              </div>
            );
          })}
        </div>

        {filtered.length === 0 && (
          <div className="glass-panel rounded-2xl p-12 text-center space-y-3">
            <Building2 className="w-10 h-10 text-[#A3B59E] mx-auto" />
            <p className="font-display text-xl text-[#657351] dark:text-[#A3B59E] font-light">Tidak ada cabang ditemukan</p>
            <p className="text-sm text-[#A3B59E]">Coba ubah filter atau kata kunci pencarian</p>
          </div>
        )}
      </main>
    </div>
  );
}
