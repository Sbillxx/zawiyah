'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { Search, Filter, X, ChevronLeft, ChevronRight, ArrowLeft, Users, Heart, Wallet } from 'lucide-react';
import type { Jamaah, Zawiyah } from '@/lib/data/ssot';

interface Props {
  jamaahList: Jamaah[];
  zawiyahList: Zawiyah[];
}

export default function AdminJamaah({ jamaahList, zawiyahList }: Props) {
  const [search, setSearch] = useState('');
  const [filterZawiyah, setFilterZawiyah] = useState('ALL');
  const [filterGender, setFilterGender] = useState('ALL');
  const [filterAgnia, setFilterAgnia] = useState('ALL');
  const [currentPage, setCurrentPage] = useState(1);
  const [selected, setSelected] = useState<Jamaah | null>(null);
  const PER_PAGE = 15;

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    const result = jamaahList.filter((j) => {
      const matchSearch = !search ||
        j.nama.toLowerCase().includes(q) ||
        j.id.toLowerCase().includes(q) ||
        j.telepon.includes(search) ||
        j.alamat.toLowerCase().includes(q) ||
        j.pekerjaan.toLowerCase().includes(q);
      const matchZawiyah = filterZawiyah === 'ALL' || j.zawiyah === filterZawiyah;
      const matchGender = filterGender === 'ALL' || j.jenisKelamin === filterGender;
      const matchAgnia = filterAgnia === 'ALL' || (filterAgnia === 'YA' ? j.agniaCare === 'Ya' : j.agniaCare !== 'Ya');
      return matchSearch && matchZawiyah && matchGender && matchAgnia;
    });
    return result;
  }, [search, filterZawiyah, filterGender, filterAgnia, jamaahList]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PER_PAGE));
  const safePage = Math.min(currentPage, totalPages);
  const paginated = filtered.slice((safePage - 1) * PER_PAGE, safePage * PER_PAGE);

  const uniqueZawiyah = useMemo(() => [...new Set(jamaahList.map((j) => j.zawiyah))].sort(), [jamaahList]);
  const hasFilters = search || filterZawiyah !== 'ALL' || filterGender !== 'ALL' || filterAgnia !== 'ALL';
  const clearFilters = () => { setSearch(''); setFilterZawiyah('ALL'); setFilterGender('ALL'); setFilterAgnia('ALL'); setCurrentPage(1); };

  return (
    <div className="min-h-screen bg-[#FBF9F5] dark:bg-[#131D12] font-sans">
      <header className="sticky top-0 z-40 border-b border-[#243324]/10 dark:border-white/10 bg-[#FBF9F5]/90 dark:bg-[#131D12]/90 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Link href="/admin" className="flex items-center gap-1.5 text-sm text-[#657351] dark:text-[#A3B59E] hover:text-[#243324] dark:hover:text-[#F4EFE6] transition-colors">
              <ArrowLeft className="w-4 h-4" /> Dashboard
            </Link>
            <span className="text-[#243324]/20 dark:text-white/20">/</span>
            <h1 className="font-display text-lg text-[#1F2B1D] dark:text-[#F4EFE6] font-light">Data Jamaah</h1>
          </div>
          <div className="flex items-center gap-2 text-xs text-[#657351] dark:text-[#A3B59E]">
            <Users className="w-3.5 h-3.5" />
            <span className="font-display text-base font-light text-[#1F2B1D] dark:text-[#F4EFE6]">{filtered.length.toLocaleString('id-ID')}</span>
            <span>/ {jamaahList.length.toLocaleString('id-ID')} jamaah</span>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-5">
        <div className="glass-panel rounded-2xl p-4 space-y-4">
          <div className="flex items-center gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#657351] dark:text-[#A3B59E]" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Cari nama, ID, telepon, atau alamat..."
                className="w-full pl-9 pr-4 py-2.5 bg-transparent border border-[#243324]/15 dark:border-white/15 rounded-xl text-sm text-[#243324] dark:text-[#F4EFE6] placeholder-[#A3B59E] focus:outline-none focus:border-[#1F2B1D] dark:focus:border-white/40 transition-colors"
              />
            </div>
            {hasFilters && (
              <button onClick={clearFilters} className="flex items-center gap-1.5 px-3 py-2.5 rounded-xl border border-[#243324]/15 dark:border-white/15 text-xs text-[#657351] dark:text-[#A3B59E] hover:text-[#243324] dark:hover:text-[#F4EFE6] hover:border-[#243324]/30 dark:hover:border-white/30 transition-all">
                <X className="w-3.5 h-3.5" /> Reset
              </button>
            )}
          </div>
          <div className="flex flex-wrap gap-2 items-center">
            <div className="flex items-center gap-1.5">
              <Filter className="w-3.5 h-3.5 text-[#657351] dark:text-[#A3B59E]" />
              <span className="text-xs text-[#657351] dark:text-[#A3B59E] font-medium">Filter:</span>
            </div>
            <select value={filterZawiyah} onChange={(e) => { setFilterZawiyah(e.target.value); setCurrentPage(1); }} className="px-3 py-1.5 text-xs border border-[#243324]/15 dark:border-white/15 rounded-lg bg-transparent text-[#243324] dark:text-[#F4EFE6] focus:outline-none focus:border-[#1F2B1D] dark:focus:border-white/40 transition-colors cursor-pointer">
              <option value="ALL">Semua Zawiyah</option>
              {uniqueZawiyah.map((z) => <option key={z} value={z}>{z}</option>)}
            </select>
            <select value={filterGender} onChange={(e) => { setFilterGender(e.target.value); setCurrentPage(1); }} className="px-3 py-1.5 text-xs border border-[#243324]/15 dark:border-white/15 rounded-lg bg-transparent text-[#243324] dark:text-[#F4EFE6] focus:outline-none focus:border-[#1F2B1D] dark:focus:border-white/40 transition-colors cursor-pointer">
              <option value="ALL">Semua Gender</option>
              <option value="Laki-laki">Laki-laki</option>
              <option value="Perempuan">Perempuan</option>
            </select>
            <select value={filterAgnia} onChange={(e) => { setFilterAgnia(e.target.value); setCurrentPage(1); }} className="px-3 py-1.5 text-xs border border-[#243324]/15 dark:border-white/15 rounded-lg bg-transparent text-[#243324] dark:text-[#F4EFE6] focus:outline-none focus:border-[#1F2B1D] dark:focus:border-white/40 transition-colors cursor-pointer">
              <option value="ALL">Semua Status Agnia</option>
              <option value="YA">Peserta Agnia Care</option>
              <option value="TIDAK">Non Peserta</option>
            </select>
          </div>
        </div>

        <div className="glass-panel rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#243324]/10 dark:border-white/10">
                  <th className="text-left px-5 py-3.5 text-xs font-semibold text-[#657351] dark:text-[#A3B59E] uppercase tracking-wider whitespace-nowrap">ID</th>
                  <th className="text-left px-5 py-3.5 text-xs font-semibold text-[#657351] dark:text-[#A3B59E] uppercase tracking-wider">Nama</th>
                  <th className="text-left px-5 py-3.5 text-xs font-semibold text-[#657351] dark:text-[#A3B59E] uppercase tracking-wider hidden md:table-cell">Zawiyah</th>
                  <th className="text-left px-5 py-3.5 text-xs font-semibold text-[#657351] dark:text-[#A3B59E] uppercase tracking-wider hidden sm:table-cell">Gender</th>
                  <th className="text-left px-5 py-3.5 text-xs font-semibold text-[#657351] dark:text-[#A3B59E] uppercase tracking-wider hidden lg:table-cell">Pekerjaan</th>
                  <th className="text-left px-5 py-3.5 text-xs font-semibold text-[#657351] dark:text-[#A3B59E] uppercase tracking-wider hidden lg:table-cell">Agnia</th>
                  <th className="text-left px-5 py-3.5 text-xs font-semibold text-[#657351] dark:text-[#A3B59E] uppercase tracking-wider">Status</th>
                </tr>
              </thead>
              <tbody>
                {paginated.map((j, idx) => (
                  <tr
                    key={j.id}
                    onClick={() => setSelected(j)}
                    className={`border-b border-[#243324]/5 dark:border-white/5 cursor-pointer transition-colors hover:bg-[#243324]/4 dark:hover:bg-white/4 ${idx % 2 !== 0 ? 'bg-[#243324]/2 dark:bg-white/2' : ''}`}
                  >
                    <td className="px-5 py-3.5 font-mono text-xs text-[#657351] dark:text-[#A3B59E] whitespace-nowrap">{j.id}</td>
                    <td className="px-5 py-3.5 font-medium text-[#1F2B1D] dark:text-[#F4EFE6] max-w-[180px] truncate">{j.nama}</td>
                    <td className="px-5 py-3.5 hidden md:table-cell text-[#4A5D44] dark:text-[#CBD7C7] max-w-[160px] truncate text-xs">{j.zawiyah}</td>
                    <td className="px-5 py-3.5 hidden sm:table-cell">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${j.jenisKelamin === 'Laki-laki' ? 'bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300' : 'bg-pink-50 text-pink-700 dark:bg-pink-950 dark:text-pink-300'}`}>
                        {j.jenisKelamin === 'Laki-laki' ? 'L' : 'P'}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 hidden lg:table-cell text-[#4A5D44] dark:text-[#CBD7C7] text-xs max-w-[140px] truncate">{j.pekerjaan}</td>
                    <td className="px-5 py-3.5 hidden lg:table-cell">
                      {j.agniaCare === 'Ya' && <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" />}
                    </td>
                    <td className="px-5 py-3.5">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${j.status === 'Aktif' ? 'bg-[#e6f4ea] text-[#006948] dark:bg-[#1F3D2A] dark:text-[#68DBA9]' : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'}`}>
                        {j.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="flex items-center justify-between px-5 py-4 border-t border-[#243324]/10 dark:border-white/10">
            <p className="text-xs text-[#657351] dark:text-[#A3B59E]">Halaman {safePage} dari {totalPages} · {filtered.length.toLocaleString('id-ID')} hasil</p>
            <div className="flex items-center gap-2">
              <button onClick={() => setCurrentPage((p) => Math.max(1, p - 1))} disabled={safePage === 1} className="p-1.5 rounded-lg border border-[#243324]/15 dark:border-white/15 disabled:opacity-30 hover:border-[#243324]/30 dark:hover:border-white/30 transition-all">
                <ChevronLeft className="w-4 h-4 text-[#243324] dark:text-[#F4EFE6]" />
              </button>
              <span className="px-3 py-1 text-xs bg-[#1F2B1D] text-[#F4EFE6] rounded-lg font-medium">{safePage}</span>
              <button onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))} disabled={safePage === totalPages} className="p-1.5 rounded-lg border border-[#243324]/15 dark:border-white/15 disabled:opacity-30 hover:border-[#243324]/30 dark:hover:border-white/30 transition-all">
                <ChevronRight className="w-4 h-4 text-[#243324] dark:text-[#F4EFE6]" />
              </button>
            </div>
          </div>
        </div>
      </main>

      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#131D12]/60 backdrop-blur-sm" onClick={() => setSelected(null)}>
          <div className="glass-panel rounded-3xl p-6 max-w-lg w-full space-y-5 shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-start justify-between">
              <div>
                <h2 className="font-display text-xl text-[#1F2B1D] dark:text-[#F4EFE6] font-light">{selected.nama}</h2>
                <p className="text-xs font-mono text-[#657351] dark:text-[#A3B59E] mt-0.5">{selected.id}</p>
              </div>
              <button onClick={() => setSelected(null)} className="p-1.5 rounded-xl hover:bg-[#243324]/8 dark:hover:bg-white/8 transition-colors">
                <X className="w-4 h-4 text-[#657351] dark:text-[#A3B59E]" />
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              <span className={`px-3 py-1 rounded-full text-xs font-semibold ${selected.jenisKelamin === 'Laki-laki' ? 'bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300' : 'bg-pink-50 text-pink-700 dark:bg-pink-950 dark:text-pink-300'}`}>{selected.jenisKelamin}</span>
              <span className={`px-3 py-1 rounded-full text-xs font-semibold ${selected.status === 'Aktif' ? 'bg-[#e6f4ea] text-[#006948] dark:bg-[#1F3D2A] dark:text-[#68DBA9]' : 'bg-gray-100 text-gray-600'}`}>{selected.status}</span>
              {selected.agniaCare === 'Ya' && <span className="flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 dark:bg-rose-950 dark:text-rose-300"><Heart className="w-3 h-3 fill-current" /> Agnia Care</span>}
              {selected.koperasi === 'Ya' && <span className="flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-300"><Wallet className="w-3 h-3" /> Koperasi</span>}
            </div>
            <div className="grid grid-cols-2 gap-3 text-sm">
              {[
                { label: 'Zawiyah', value: selected.zawiyah },
                { label: 'Pekerjaan', value: selected.pekerjaan },
                { label: 'Status Nikah', value: selected.statusPernikahan },
                { label: 'Tgl Lahir', value: selected.tanggalLahir },
                { label: 'Telepon', value: selected.telepon || '—' },
                { label: 'Email', value: selected.email || '—' },
              ].map((item) => (
                <div key={item.label} className="space-y-0.5">
                  <p className="text-[10px] text-[#657351] dark:text-[#A3B59E] uppercase tracking-wider font-semibold">{item.label}</p>
                  <p className="text-[#243324] dark:text-[#F4EFE6] text-xs leading-relaxed">{item.value}</p>
                </div>
              ))}
            </div>
            {selected.alamat && (
              <div className="p-3 rounded-xl bg-[#243324]/5 dark:bg-white/5 space-y-0.5">
                <p className="text-[10px] text-[#657351] dark:text-[#A3B59E] uppercase tracking-wider font-semibold">Alamat</p>
                <p className="text-xs text-[#243324] dark:text-[#F4EFE6] leading-relaxed">{selected.alamat}</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
