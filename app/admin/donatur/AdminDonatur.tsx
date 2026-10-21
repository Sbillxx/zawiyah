'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import {
  Search,
  Filter,
  X,
  ChevronLeft,
  ChevronRight,
  ArrowLeft,
  Heart,
  Building2,
  Phone,
  MapPin,
  UserCheck,
  CheckCircle2,
  Database,
  Users
} from 'lucide-react';
import type { Donatur } from '@/lib/data/ssot';

interface Props {
  donaturList: Donatur[];
}

export default function AdminDonatur({ donaturList }: Props) {
  const [search, setSearch] = useState('');
  const [filterKategori, setFilterKategori] = useState('ALL');
  const [filterJamaah, setFilterJamaah] = useState('ALL');
  const [currentPage, setCurrentPage] = useState(1);
  const [selected, setSelected] = useState<Donatur | null>(null);
  const PER_PAGE = 15;

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return donaturList.filter((d) => {
      const matchSearch =
        !search ||
        d.nama.toLowerCase().includes(q) ||
        d.id.toLowerCase().includes(q) ||
        (d.telepon && d.telepon.includes(search)) ||
        (d.alamat && d.alamat.toLowerCase().includes(q)) ||
        (d.zawiyah_nama && d.zawiyah_nama.toLowerCase().includes(q));

      const matchKategori = filterKategori === 'ALL' || d.kategori_donatur === filterKategori;
      const matchJamaah =
        filterJamaah === 'ALL' ||
        (filterJamaah === 'LINKED' ? !!d.jamaah_id : !d.jamaah_id);

      return matchSearch && matchKategori && matchJamaah;
    });
  }, [search, filterKategori, filterJamaah, donaturList]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PER_PAGE));
  const safePage = Math.min(currentPage, totalPages);
  const paginated = filtered.slice((safePage - 1) * PER_PAGE, safePage * PER_PAGE);

  const hasFilters = search || filterKategori !== 'ALL' || filterJamaah !== 'ALL';
  const clearFilters = () => {
    setSearch('');
    setFilterKategori('ALL');
    setFilterJamaah('ALL');
    setCurrentPage(1);
  };

  const totalPerorangan = donaturList.filter((d) => d.kategori_donatur === 'Perorangan').length;
  const totalLembaga = donaturList.filter((d) => d.kategori_donatur === 'Lembaga / Usaha').length;
  const totalLinked = donaturList.filter((d) => !!d.jamaah_id).length;

  return (
    <div className="min-h-screen bg-[#FBF9F5] dark:bg-[#131D12] font-sans">
      {/* Header bar */}
      <header className="sticky top-0 z-40 border-b border-[#243324]/10 dark:border-white/10 bg-[#FBF9F5]/90 dark:bg-[#131D12]/90 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Link
              href="/admin"
              className="flex items-center gap-1.5 text-sm text-[#657351] dark:text-[#A3B59E] hover:text-[#243324] dark:hover:text-[#F4EFE6] transition-colors"
            >
              <ArrowLeft className="w-4 h-4" /> Dashboard
            </Link>
            <span className="text-[#243324]/20 dark:text-white/20">/</span>
            <div className="flex items-center gap-2">
              <h1 className="font-display text-lg text-[#1F2B1D] dark:text-[#F4EFE6] font-light">
                Data Donatur Agnia Care
              </h1>
              <span className="px-2 py-0.5 rounded-full bg-rose-500/10 text-rose-700 dark:bg-rose-500/20 dark:text-rose-300 text-[11px] font-semibold">
                Kanwakil Jawa Barat
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2 text-xs text-[#657351] dark:text-[#A3B59E]">
            <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" />
            <span className="font-display text-base font-light text-[#1F2B1D] dark:text-[#F4EFE6]">
              {filtered.length}
            </span>
            <span>/ {donaturList.length} donatur</span>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* KPI Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="glass-panel rounded-2xl p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-rose-500/10 dark:bg-rose-500/20 flex items-center justify-center text-rose-600 dark:text-rose-400">
              <Heart className="w-5 h-5 fill-current" />
            </div>
            <div>
              <p className="font-display text-2xl text-[#1F2B1D] dark:text-[#F4EFE6] leading-none">
                {donaturList.length}
              </p>
              <p className="text-xs text-[#657351] dark:text-[#A3B59E] mt-0.5">Total Donatur MySQL</p>
            </div>
          </div>

          <div className="glass-panel rounded-2xl p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#1F2B1D]/10 dark:bg-white/10 flex items-center justify-center text-[#1F2B1D] dark:text-[#F4EFE6]">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <p className="font-display text-2xl text-[#1F2B1D] dark:text-[#F4EFE6] leading-none">
                {totalPerorangan}
              </p>
              <p className="text-xs text-[#657351] dark:text-[#A3B59E] mt-0.5">Donatur Perorangan</p>
            </div>
          </div>

          <div className="glass-panel rounded-2xl p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 dark:bg-amber-500/20 flex items-center justify-center text-amber-700 dark:text-amber-400">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <p className="font-display text-2xl text-[#1F2B1D] dark:text-[#F4EFE6] leading-none">
                {totalLembaga}
              </p>
              <p className="text-xs text-[#657351] dark:text-[#A3B59E] mt-0.5">Lembaga / Usaha / Toko</p>
            </div>
          </div>

          <div className="glass-panel rounded-2xl p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 dark:bg-emerald-500/20 flex items-center justify-center text-emerald-700 dark:text-emerald-400">
              <UserCheck className="w-5 h-5" />
            </div>
            <div>
              <p className="font-display text-2xl text-[#1F2B1D] dark:text-[#F4EFE6] leading-none">
                {totalLinked}
              </p>
              <p className="text-xs text-[#657351] dark:text-[#A3B59E] mt-0.5">Terhubung ke Jamaah</p>
            </div>
          </div>
        </div>

        {/* Filter & Search Bar */}
        <div className="glass-panel rounded-2xl p-4 space-y-4">
          <div className="flex items-center gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#657351] dark:text-[#A3B59E]" />
              <input
                type="text"
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setCurrentPage(1);
                }}
                placeholder="Cari nama donatur, ID '26..., nomor HP, atau alamat..."
                className="w-full pl-9 pr-4 py-2.5 bg-white/50 dark:bg-black/20 border border-[#243324]/15 dark:border-white/15 rounded-xl text-sm text-[#243324] dark:text-[#F4EFE6] placeholder-[#A3B59E] focus:outline-none focus:border-[#1F2B1D] dark:focus:border-white/40 transition-colors"
              />
            </div>
            {hasFilters && (
              <button
                type="button"
                onClick={clearFilters}
                className="flex items-center gap-1.5 px-3 py-2.5 rounded-xl border border-[#243324]/15 dark:border-white/15 text-xs text-[#657351] dark:text-[#A3B59E] hover:text-[#243324] dark:hover:text-[#F4EFE6] hover:border-[#243324]/30 dark:hover:border-white/30 transition-all cursor-pointer"
              >
                <X className="w-3.5 h-3.5" /> Reset
              </button>
            )}
          </div>

          <div className="flex flex-wrap gap-2 items-center">
            <div className="flex items-center gap-1.5">
              <Filter className="w-3.5 h-3.5 text-[#657351] dark:text-[#A3B59E]" />
              <span className="text-xs text-[#657351] dark:text-[#A3B59E] font-medium">Filter:</span>
            </div>

            <select
              value={filterKategori}
              onChange={(e) => {
                setFilterKategori(e.target.value);
                setCurrentPage(1);
              }}
              className="px-3 py-1.5 text-xs border border-[#243324]/15 dark:border-white/15 rounded-lg bg-white/60 dark:bg-black/30 text-[#243324] dark:text-[#F4EFE6] focus:outline-none focus:border-[#1F2B1D] dark:focus:border-white/40 transition-colors cursor-pointer"
            >
              <option value="ALL">Semua Kategori</option>
              <option value="Perorangan">Perorangan</option>
              <option value="Lembaga / Usaha">Lembaga / Usaha</option>
            </select>

            <select
              value={filterJamaah}
              onChange={(e) => {
                setFilterJamaah(e.target.value);
                setCurrentPage(1);
              }}
              className="px-3 py-1.5 text-xs border border-[#243324]/15 dark:border-white/15 rounded-lg bg-white/60 dark:bg-black/30 text-[#243324] dark:text-[#F4EFE6] focus:outline-none focus:border-[#1F2B1D] dark:focus:border-white/40 transition-colors cursor-pointer"
            >
              <option value="ALL">Semua Hubungan Jamaah</option>
              <option value="LINKED">Terhubung ke Master Jamaah ({totalLinked})</option>
              <option value="UNLINKED">Donatur Baru / Eksternal ({donaturList.length - totalLinked})</option>
            </select>
          </div>
        </div>

        {/* Data Table */}
        <div className="glass-panel rounded-2xl overflow-hidden border border-[#243324]/10 dark:border-white/10 shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-[#243324]/5 dark:bg-white/5 border-b border-[#243324]/10 dark:border-white/10 text-xs uppercase tracking-wider text-[#657351] dark:text-[#A3B59E]">
                <tr>
                  <th className="py-3.5 px-4 font-semibold">ID Donatur</th>
                  <th className="py-3.5 px-4 font-semibold">Nama Donatur</th>
                  <th className="py-3.5 px-4 font-semibold">Kategori</th>
                  <th className="py-3.5 px-4 font-semibold hidden md:table-cell">Kontak / Telepon</th>
                  <th className="py-3.5 px-4 font-semibold hidden lg:table-cell">Zawiyah / Lokasi</th>
                  <th className="py-3.5 px-4 font-semibold">Hubungan Jamaah</th>
                  <th className="py-3.5 px-4 font-semibold">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#243324]/5 dark:divide-white/5">
                {paginated.map((d) => (
                  <tr
                    key={d.id}
                    onClick={() => setSelected(d)}
                    className="hover:bg-[#243324]/4 dark:hover:bg-white/4 transition-colors cursor-pointer"
                  >
                    <td className="py-3.5 px-4 font-mono text-xs text-[#657351] dark:text-[#A3B59E]">
                      {d.id}
                    </td>
                    <td className="py-3.5 px-4">
                      <p className="font-medium text-[#1F2B1D] dark:text-[#F4EFE6] leading-tight">
                        {d.nama}
                      </p>
                      {d.pekerjaan && (
                        <p className="text-[11px] text-[#657351] dark:text-[#A3B59E] mt-0.5">
                          {d.pekerjaan}
                        </p>
                      )}
                    </td>
                    <td className="py-3.5 px-4">
                      {d.kategori_donatur === 'Lembaga / Usaha' ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-amber-500/10 text-amber-700 dark:bg-amber-500/20 dark:text-amber-300">
                          <Building2 className="w-3 h-3" /> Usaha / Toko
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-[#1F2B1D]/10 text-[#1F2B1D] dark:bg-white/10 dark:text-[#F4EFE6]">
                          {d.jenis_kelamin}
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 hidden md:table-cell text-xs text-[#4A5D44] dark:text-[#CBD7C7]">
                      {d.telepon ? (
                        <span className="font-mono">{d.telepon}</span>
                      ) : (
                        <span className="text-[#A3B59E] italic">—</span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 hidden lg:table-cell text-xs text-[#4A5D44] dark:text-[#CBD7C7] max-w-[200px] truncate">
                      {d.zawiyah_nama || d.alamat || 'Kanwakil Jawa Barat'}
                    </td>
                    <td className="py-3.5 px-4">
                      {d.jamaah_id ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/10 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300">
                          <CheckCircle2 className="w-3 h-3" /> {d.jamaah_id}
                        </span>
                      ) : (
                        <span className="inline-block px-2 py-0.5 rounded text-[10px] bg-[#243324]/5 dark:bg-white/5 text-[#657351] dark:text-[#A3B59E]">
                          Donatur Baru
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-[#e6f4ea] text-[#006948] dark:bg-[#1F3D2A] dark:text-[#68DBA9]">
                        {d.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination Controls */}
          <div className="flex items-center justify-between px-5 py-4 border-t border-[#243324]/10 dark:border-white/10">
            <p className="text-xs text-[#657351] dark:text-[#A3B59E]">
              Halaman {safePage} dari {totalPages} · {filtered.length} donatur ditemukan
            </p>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={safePage === 1}
                className="p-1.5 rounded-lg border border-[#243324]/15 dark:border-white/15 disabled:opacity-30 hover:border-[#243324]/30 dark:hover:border-white/30 transition-all cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4 text-[#243324] dark:text-[#F4EFE6]" />
              </button>
              <span className="px-3 py-1 text-xs bg-[#1F2B1D] text-[#F4EFE6] rounded-lg font-medium">
                {safePage}
              </span>
              <button
                type="button"
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={safePage === totalPages}
                className="p-1.5 rounded-lg border border-[#243324]/15 dark:border-white/15 disabled:opacity-30 hover:border-[#243324]/30 dark:hover:border-white/30 transition-all cursor-pointer"
              >
                <ChevronRight className="w-4 h-4 text-[#243324] dark:text-[#F4EFE6]" />
              </button>
            </div>
          </div>
        </div>
      </main>

      {/* Detail Modal */}
      {selected && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#131D12]/60 backdrop-blur-sm"
          onClick={() => setSelected(null)}
        >
          <div
            className="glass-panel rounded-3xl p-6 sm:p-7 max-w-lg w-full space-y-5 shadow-2xl border border-[#243324]/10 dark:border-white/15"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded bg-[#243324]/10 dark:bg-white/10 text-[#657351] dark:text-[#A3B59E]">
                  ID: {selected.id}
                </span>
                <h2 className="font-display text-2xl text-[#1F2B1D] dark:text-[#F4EFE6] font-light mt-1">
                  {selected.nama}
                </h2>
                <p className="text-xs text-[#657351] dark:text-[#A3B59E]">
                  {selected.kantor_wilayah} · No. Urut #{selected.no_urut}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSelected(null)}
                className="p-1.5 rounded-xl hover:bg-[#243324]/8 dark:hover:bg-white/8 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5 text-[#657351] dark:text-[#A3B59E]" />
              </button>
            </div>

            <div className="flex flex-wrap gap-2">
              <span className="px-3 py-1 rounded-full text-xs font-semibold bg-rose-500/10 text-rose-700 dark:bg-rose-500/20 dark:text-rose-300 flex items-center gap-1">
                <Heart className="w-3.5 h-3.5 fill-current" /> Agnia Care
              </span>
              <span className="px-3 py-1 rounded-full text-xs font-semibold bg-[#1F2B1D]/10 text-[#1F2B1D] dark:bg-white/10 dark:text-[#F4EFE6]">
                {selected.kategori_donatur}
              </span>
              {selected.jamaah_id && (
                <span className="px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-800 dark:bg-emerald-500/20 dark:text-emerald-300 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Terhubung: {selected.jamaah_id}
                </span>
              )}
            </div>

            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="space-y-0.5">
                <p className="text-[10px] text-[#657351] dark:text-[#A3B59E] uppercase tracking-wider font-semibold">
                  Jenis Kelamin
                </p>
                <p className="text-[#243324] dark:text-[#F4EFE6] text-xs">{selected.jenis_kelamin}</p>
              </div>

              <div className="space-y-0.5">
                <p className="text-[10px] text-[#657351] dark:text-[#A3B59E] uppercase tracking-wider font-semibold">
                  Telepon / WhatsApp
                </p>
                <p className="text-[#243324] dark:text-[#F4EFE6] text-xs font-mono">
                  {selected.telepon || '—'}
                </p>
              </div>

              <div className="space-y-0.5">
                <p className="text-[10px] text-[#657351] dark:text-[#A3B59E] uppercase tracking-wider font-semibold">
                  KTP
                </p>
                <p className="text-[#243324] dark:text-[#F4EFE6] text-xs font-mono">
                  {selected.ktp || '—'}
                </p>
              </div>

              <div className="space-y-0.5">
                <p className="text-[10px] text-[#657351] dark:text-[#A3B59E] uppercase tracking-wider font-semibold">
                  Pekerjaan
                </p>
                <p className="text-[#243324] dark:text-[#F4EFE6] text-xs">{selected.pekerjaan || '—'}</p>
              </div>

              <div className="space-y-0.5">
                <p className="text-[10px] text-[#657351] dark:text-[#A3B59E] uppercase tracking-wider font-semibold">
                  Cabang Zawiyah
                </p>
                <p className="text-[#243324] dark:text-[#F4EFE6] text-xs">
                  {selected.zawiyah_nama || '—'}
                </p>
              </div>

              <div className="space-y-0.5">
                <p className="text-[10px] text-[#657351] dark:text-[#A3B59E] uppercase tracking-wider font-semibold">
                  Parent Donatur
                </p>
                <p className="text-[#243324] dark:text-[#F4EFE6] text-xs">
                  {selected.parent_donatur || '—'}
                </p>
              </div>
            </div>

            {selected.alamat && (
              <div className="p-3.5 rounded-xl bg-[#243324]/5 dark:bg-white/5 space-y-0.5">
                <p className="text-[10px] text-[#657351] dark:text-[#A3B59E] uppercase tracking-wider font-semibold flex items-center gap-1">
                  <MapPin className="w-3 h-3" /> Alamat Lengkap
                </p>
                <p className="text-xs text-[#243324] dark:text-[#F4EFE6] leading-relaxed">
                  {selected.alamat}
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
