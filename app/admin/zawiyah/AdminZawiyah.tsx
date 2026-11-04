'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import {
  Search,
  ArrowLeft,
  Building2,
  ChevronDown,
  ArrowUpDown,
  Users,
  MapPin,
  User,
  Plus,
  Pencil,
  Trash2,
  X,
  Loader2,
  CheckCircle2,
  AlertCircle,
  AlertTriangle
} from 'lucide-react';
import type { Zawiyah } from '@/lib/data/ssot';

interface Props {
  zawiyahList: Zawiyah[];
}

interface ToastState {
  type: 'success' | 'error';
  message: string;
}

const TIPE_COLORS: Record<string, string> = {
  'Pusat': 'bg-[#1F2B1D] text-[#F4EFE6]',
  'Wilayah': 'bg-[#3B4D36] text-[#F4EFE6]',
  'Cabang': 'bg-[#E8DCC4] text-[#1F2B1D]',
};

const INITIAL_FORM: Partial<Zawiyah> = {
  nama: '',
  tipe: 'Cabang',
  kota: '',
  pengurus: '',
};

export default function AdminZawiyah({ zawiyahList: initialList }: Props) {
  const [list, setList] = useState<Zawiyah[]>(initialList);
  const [search, setSearch] = useState('');
  const [filterTipe, setFilterTipe] = useState('ALL');
  const [sortBy, setSortBy] = useState<'jamaah' | 'nama'>('jamaah');

  // Modals state
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingZawiyah, setEditingZawiyah] = useState<Zawiyah | null>(null);
  const [deletingZawiyah, setDeletingZawiyah] = useState<Zawiyah | null>(null);
  const [formData, setFormData] = useState<Partial<Zawiyah>>(INITIAL_FORM);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [toast, setToast] = useState<ToastState | null>(null);

  const showToast = (type: 'success' | 'error', message: string) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 4000);
  };

  const uniqueTipe = useMemo(
    () => [...new Set(list.map((z) => z.tipe))].filter(Boolean).sort(),
    [list]
  );

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return list
      .filter((z) => {
        const matchSearch =
          !search ||
          z.nama.toLowerCase().includes(q) ||
          z.kota.toLowerCase().includes(q) ||
          z.pengurus.toLowerCase().includes(q);
        const matchTipe = filterTipe === 'ALL' || z.tipe === filterTipe;
        return matchSearch && matchTipe;
      })
      .sort((a, b) =>
        sortBy === 'jamaah' ? b.jamaah - a.jamaah : a.nama.localeCompare(b.nama)
      );
  }, [search, filterTipe, sortBy, list]);

  const totalJamaahFiltered = filtered.reduce((acc, z) => acc + z.jamaah, 0);

  // Open Add Modal
  const handleOpenAdd = () => {
    setFormData(INITIAL_FORM);
    setErrorMessage('');
    setIsAddOpen(true);
  };

  // Open Edit Modal
  const handleOpenEdit = (zawiyah: Zawiyah) => {
    setEditingZawiyah(zawiyah);
    setFormData({ ...zawiyah });
    setErrorMessage('');
  };

  // Open Delete Modal
  const handleOpenDelete = (zawiyah: Zawiyah) => {
    setDeletingZawiyah(zawiyah);
    setErrorMessage('');
  };

  // Submit Add (POST)
  const handleSubmitAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.nama?.trim() || !formData.kota?.trim()) {
      setErrorMessage('Nama cabang dan kota wajib diisi.');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage('');
    try {
      const res = await fetch('/api/zawiyah', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const result = await res.json();

      if (!res.ok || !result.success) {
        throw new Error(result.message || 'Gagal menambahkan cabang zawiyah.');
      }

      setList((prev) => [result.data, ...prev]);
      setIsAddOpen(false);
      showToast('success', result.message || 'Cabang zawiyah berhasil ditambahkan ke TiDB Cloud!');
    } catch (err: any) {
      setErrorMessage(err.message || 'Terjadi kesalahan sistem.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Submit Edit (PUT)
  const handleSubmitEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingZawiyah) return;
    if (!formData.nama?.trim() || !formData.kota?.trim()) {
      setErrorMessage('Nama cabang dan kota wajib diisi.');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage('');
    try {
      const res = await fetch('/api/zawiyah', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: editingZawiyah.id,
          ...formData,
        }),
      });
      const result = await res.json();

      if (!res.ok || !result.success) {
        throw new Error(result.message || 'Gagal memperbarui data zawiyah.');
      }

      const updated: Zawiyah = {
        ...editingZawiyah,
        ...(formData as Zawiyah),
      };
      setList((prev) => prev.map((z) => (z.id === editingZawiyah.id ? updated : z)));
      setEditingZawiyah(null);
      showToast('success', result.message || 'Perubahan cabang zawiyah berhasil disimpan!');
    } catch (err: any) {
      setErrorMessage(err.message || 'Terjadi kesalahan sistem.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Submit Delete (DELETE)
  const handleSubmitDelete = async () => {
    if (!deletingZawiyah) return;

    setIsSubmitting(true);
    setErrorMessage('');
    try {
      const res = await fetch(`/api/zawiyah?id=${encodeURIComponent(deletingZawiyah.id)}`, {
        method: 'DELETE',
      });
      const result = await res.json();

      if (!res.ok || !result.success) {
        throw new Error(result.message || 'Gagal menghapus cabang zawiyah.');
      }

      setList((prev) => prev.filter((z) => z.id !== deletingZawiyah.id));
      setDeletingZawiyah(null);
      showToast('success', result.message || 'Cabang zawiyah berhasil dihapus.');
    } catch (err: any) {
      setErrorMessage(err.message || 'Terjadi kesalahan sistem saat menghapus.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FBF9F5] dark:bg-[#131D12] font-sans pb-16">
      {/* Toast Notification */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 px-4 py-3 rounded-2xl shadow-xl backdrop-blur-md animate-in slide-in-from-bottom-5 duration-300 border border-black/5 dark:border-white/10 bg-[#1F2B1D] text-[#F4EFE6]">
          {toast.type === 'success' ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          ) : (
            <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />
          )}
          <p className="text-sm font-medium">{toast.message}</p>
        </div>
      )}

      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-[#243324]/10 dark:border-white/10 bg-[#FBF9F5]/90 dark:bg-[#131D12]/90 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-14 sm:h-16 flex items-center justify-between gap-2 sm:gap-4">
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            <Link
              href="/admin"
              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-[#243324]/5 dark:bg-white/5 hover:bg-[#243324]/10 dark:hover:bg-white/10 text-xs sm:text-sm text-[#657351] dark:text-[#A3B59E] hover:text-[#243324] dark:hover:text-[#F4EFE6] transition-colors shrink-0"
              title="Kembali ke Dashboard"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="hidden sm:inline">Dashboard</span>
            </Link>
            <span className="hidden sm:inline text-[#243324]/20 dark:text-white/20">/</span>
            <h1 className="font-display text-base sm:text-lg text-[#1F2B1D] dark:text-[#F4EFE6] font-light truncate">
              Manajemen Cabang Zawiyah
            </h1>
          </div>

          <div className="flex items-center gap-2 text-xs text-[#657351] dark:text-[#A3B59E] px-2.5 py-1.5 rounded-xl bg-[#243324]/5 dark:bg-white/5 shrink-0">
            <Building2 className="w-3.5 h-3.5 text-[#4A5D44] dark:text-[#A3B59E]" />
            <span className="font-display font-medium text-[#1F2B1D] dark:text-[#F4EFE6]">
              {filtered.length}
            </span>
            <span className="hidden sm:inline">/ {list.length} cabang</span>
          </div>
        </div>
      </header>

{/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 pb-24 md:pb-12 space-y-6">
        <div className="flex flex-wrap gap-4">
          <div className="glass-panel rounded-xl px-4 py-2.5 flex items-center gap-2">
            <Building2 className="w-4 h-4 text-[#4A5D44] dark:text-[#A3B59E]" />
            <div>
              <p className="font-display text-xl text-[#1F2B1D] dark:text-[#F4EFE6] leading-none">
                {filtered.length}
              </p>
              <p className="text-[10px] text-[#657351] dark:text-[#A3B59E]">Cabang ditampilkan</p>
            </div>
          </div>
          <div className="glass-panel rounded-xl px-4 py-2.5 flex items-center gap-2">
            <Users className="w-4 h-4 text-[#4A5D44] dark:text-[#A3B59E]" />
            <div>
              <p className="font-display text-xl text-[#1F2B1D] dark:text-[#F4EFE6] leading-none">
                {totalJamaahFiltered.toLocaleString('id-ID')}
              </p>
              <p className="text-[10px] text-[#657351] dark:text-[#A3B59E]">Total jamaah tercatat</p>
            </div>
          </div>
        </div>

        {/* Filter and Search Bar */}
        <div className="glass-panel rounded-2xl p-4 space-y-3">
          <div className="flex items-center gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#657351] dark:text-[#A3B59E]" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Cari nama cabang, kota, atau pengurus..."
                className="w-full pl-9 pr-4 py-2.5 bg-transparent border border-[#243324]/15 dark:border-white/15 rounded-xl text-sm text-[#243324] dark:text-[#F4EFE6] placeholder-[#A3B59E] focus:outline-none focus:border-[#1F2B1D] dark:focus:border-white/40 transition-colors"
              />
            </div>
            {(search || filterTipe !== 'ALL') && (
              <button
                type="button"
                onClick={() => { setSearch(''); setFilterTipe('ALL'); }}
                className="flex items-center gap-1.5 px-3 py-2.5 rounded-xl border border-[#243324]/15 dark:border-white/15 text-xs text-[#657351] dark:text-[#A3B59E] hover:text-[#243324] dark:hover:text-[#F4EFE6] hover:border-[#243324]/30 dark:hover:border-white/30 transition-all cursor-pointer font-medium"
              >
                <X className="w-3.5 h-3.5" />
                <span className="hidden xs:inline">Reset</span>
              </button>
            )}
          </div>

          <div className="grid grid-cols-2 gap-2 sm:flex sm:items-center">
            {/* Tipe Selector */}
            <div className="relative flex items-center flex-1">
              <Building2 className="absolute left-3 w-3.5 h-3.5 text-[#657351] dark:text-[#A3B59E] pointer-events-none" />
              <select
                value={filterTipe}
                onChange={(e) => setFilterTipe(e.target.value)}
                className={`w-full pl-8 pr-7 py-2 text-xs rounded-xl border appearance-none transition-all cursor-pointer font-medium focus:outline-none truncate ${
                  filterTipe !== 'ALL'
                    ? 'bg-[#1F2B1D]/10 dark:bg-[#85E7B7]/15 border-[#1F2B1D]/30 dark:border-[#85E7B7]/30 text-[#1F2B1D] dark:text-[#85E7B7]'
                    : 'bg-white/70 dark:bg-black/20 border-[#243324]/10 dark:border-white/10 text-[#243324] dark:text-[#F4EFE6] hover:border-[#243324]/25'
                }`}
              >
                <option value="ALL">Semua Tipe</option>
                {uniqueTipe.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-2.5 w-3.5 h-3.5 text-[#657351] dark:text-[#A3B59E] pointer-events-none" />
            </div>

            {/* Sort Selector */}
            <div className="relative flex items-center flex-1">
              <ArrowUpDown className="absolute left-3 w-3.5 h-3.5 text-[#657351] dark:text-[#A3B59E] pointer-events-none" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as 'jamaah' | 'nama')}
                className="w-full pl-8 pr-7 py-2 text-xs rounded-xl border appearance-none transition-all cursor-pointer font-medium focus:outline-none truncate bg-white/70 dark:bg-black/20 border-[#243324]/10 dark:border-white/10 text-[#243324] dark:text-[#F4EFE6] hover:border-[#243324]/25"
              >
                <option value="jamaah">Urutkan: Jamaah Terbanyak</option>
                <option value="nama">Urutkan: Nama A-Z</option>
              </select>
              <ChevronDown className="absolute right-2.5 w-3.5 h-3.5 text-[#657351] dark:text-[#A3B59E] pointer-events-none" />
            </div>
          </div>
        </div>

        {/* Action & Summary Bar - Situated Between Filter and Grid */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-1 pt-1">
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-[#657351] dark:text-[#A3B59E]">
              Menampilkan <strong className="text-[#1F2B1D] dark:text-[#F4EFE6] font-semibold">{filtered.length}</strong> dari {list.length} cabang zawiyah
            </span>
            {(search || filterTipe !== 'ALL') && (
              <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-[#243324]/10 dark:bg-white/10 text-[#243324] dark:text-[#F4EFE6]">
                Tersaring
              </span>
            )}
          </div>

          <button
            onClick={handleOpenAdd}
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#1F2B1D] dark:bg-[#85E7B7] text-[#F4EFE6] dark:text-[#131D12] text-xs font-semibold shadow-md hover:bg-[#2F3D2D] dark:hover:bg-[#9BF0C6] active:scale-[0.98] transition-all cursor-pointer w-full sm:w-auto"
          >
            <Plus className="w-4 h-4" />
            <span>Tambah Cabang Zawiyah</span>
          </button>
        </div>

        {/* Zawiyah Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((z) => {
            const maxJamaah = filtered[0]?.jamaah || 1;
            const pct = Math.round((z.jamaah / maxJamaah) * 100);
            const tipeClass = TIPE_COLORS[z.tipe] || 'bg-[#E8DCC4] text-[#1F2B1D]';
            return (
              <div
                key={z.id}
                className="glass-panel rounded-2xl p-5 space-y-4 hover:shadow-xl transition-all duration-300 group flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <span className="font-mono text-[10px] text-[#657351] dark:text-[#A3B59E]">
                        {z.id}
                      </span>
                      <h3 className="font-medium text-[#1F2B1D] dark:text-[#F4EFE6] leading-snug line-clamp-2 text-sm mt-0.5">
                        {z.nama}
                      </h3>
                      <div className="flex items-center gap-1 mt-1.5">
                        <MapPin className="w-3 h-3 text-[#657351] dark:text-[#A3B59E] flex-shrink-0" />
                        <p className="text-xs text-[#657351] dark:text-[#A3B59E] truncate">{z.kota}</p>
                      </div>
                    </div>
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold flex-shrink-0 ${tipeClass}`}>
                      {z.tipe}
                    </span>
                  </div>

                  <div className="space-y-2 mt-4">
                    <div className="flex justify-between items-baseline">
                      <p className="text-xs text-[#657351] dark:text-[#A3B59E]">Jumlah Jamaah</p>
                      <p className="font-display text-2xl text-[#1F2B1D] dark:text-[#F4EFE6] font-light">
                        {z.jamaah.toLocaleString('id-ID')}
                      </p>
                    </div>
                    <div className="h-1.5 bg-[#243324]/8 dark:bg-white/8 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-[#1F2B1D] to-[#4A5D44] dark:from-[#68DBA9] dark:to-[#A3B59E] rounded-full transition-all duration-700"
                        style={{ width: pct + '%' }}
                      />
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 pt-3 mt-3 border-t border-[#243324]/8 dark:border-white/8">
                    <User className="w-3 h-3 text-[#657351] dark:text-[#A3B59E] flex-shrink-0" />
                    <p className="text-xs text-[#657351] dark:text-[#A3B59E] truncate">{z.pengurus}</p>
                  </div>
                </div>

                {/* Card Action Buttons */}
                <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#243324]/8 dark:border-white/8">
                  <button
                    onClick={() => handleOpenEdit(z)}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-amber-300 dark:border-amber-700 text-amber-700 dark:text-amber-400 text-xs font-medium hover:bg-amber-50 dark:hover:bg-amber-950/40 transition-colors"
                  >
                    <Pencil className="w-3 h-3" /> Edit
                  </button>
                  <button
                    onClick={() => handleOpenDelete(z)}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-rose-300 dark:border-rose-700 text-rose-700 dark:text-rose-400 text-xs font-medium hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                  >
                    <Trash2 className="w-3 h-3" /> Hapus
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {filtered.length === 0 && (
          <div className="glass-panel rounded-2xl p-12 text-center space-y-3">
            <Building2 className="w-10 h-10 text-[#A3B59E] mx-auto" />
            <p className="font-display text-xl text-[#657351] dark:text-[#A3B59E] font-light">
              Tidak ada cabang ditemukan
            </p>
            <p className="text-sm text-[#A3B59E]">Coba ubah filter atau kata kunci pencarian</p>
          </div>
        )}
      </main>

      {/* MODAL: Tambah Zawiyah Baru */}
      {isAddOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          onClick={() => !isSubmitting && setIsAddOpen(false)}
        >
          <div
            className="glass-panel rounded-3xl p-6 sm:p-7 max-w-lg w-full space-y-5 shadow-2xl border border-white/20"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between border-b border-[#243324]/10 dark:border-white/10 pb-4">
              <div>
                <h2 className="font-display text-xl text-[#1F2B1D] dark:text-[#F4EFE6] font-medium flex items-center gap-2">
                  <Plus className="w-5 h-5 text-[#85E7B7]" /> Tambah Cabang Zawiyah
                </h2>
                <p className="text-xs text-[#657351] dark:text-[#A3B59E] mt-0.5">
                  Tambahkan titik cabang baru ke database TiDB Cloud.
                </p>
              </div>
              <button
                disabled={isSubmitting}
                onClick={() => setIsAddOpen(false)}
                className="p-1.5 rounded-xl hover:bg-[#243324]/8 dark:hover:bg-white/8 transition-colors disabled:opacity-50"
              >
                <X className="w-4 h-4 text-[#657351] dark:text-[#A3B59E]" />
              </button>
            </div>

            {errorMessage && (
              <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/50 flex items-center gap-2 text-rose-700 dark:text-rose-300 text-xs">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            <form onSubmit={handleSubmitAdd} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="font-semibold text-[#1F2B1D] dark:text-[#F4EFE6]">
                  Nama Cabang Zawiyah <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.nama || ''}
                  onChange={(e) => setFormData({ ...formData, nama: e.target.value })}
                  placeholder="Contoh: Zawiyah Cikarang Bekasi"
                  className="w-full px-3 py-2 border border-[#243324]/15 dark:border-white/15 rounded-xl bg-transparent text-[#1F2B1D] dark:text-[#F4EFE6] focus:outline-none focus:border-[#1F2B1D] dark:focus:border-white/40"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-semibold text-[#1F2B1D] dark:text-[#F4EFE6]">Tipe Zawiyah</label>
                  <select
                    value={formData.tipe || 'Cabang'}
                    onChange={(e) => setFormData({ ...formData, tipe: e.target.value })}
                    className="w-full px-3 py-2 border border-[#243324]/15 dark:border-white/15 rounded-xl bg-transparent text-[#1F2B1D] dark:text-[#F4EFE6] focus:outline-none focus:border-[#1F2B1D] dark:focus:border-white/40 cursor-pointer"
                  >
                    <option value="Cabang" className="dark:bg-[#1a251a]">
                      Cabang
                    </option>
                    <option value="Wilayah" className="dark:bg-[#1a251a]">
                      Wilayah
                    </option>
                    <option value="Pusat" className="dark:bg-[#1a251a]">
                      Pusat
                    </option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-[#1F2B1D] dark:text-[#F4EFE6]">
                    Kota / Kabupaten <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.kota || ''}
                    onChange={(e) => setFormData({ ...formData, kota: e.target.value })}
                    placeholder="Contoh: Bekasi"
                    className="w-full px-3 py-2 border border-[#243324]/15 dark:border-white/15 rounded-xl bg-transparent text-[#1F2B1D] dark:text-[#F4EFE6] focus:outline-none focus:border-[#1F2B1D] dark:focus:border-white/40"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-[#1F2B1D] dark:text-[#F4EFE6]">
                  Nama Pengurus / Penanggung Jawab
                </label>
                <input
                  type="text"
                  value={formData.pengurus || ''}
                  onChange={(e) => setFormData({ ...formData, pengurus: e.target.value })}
                  placeholder="Contoh: Ust. Ahmad Fauzi"
                  className="w-full px-3 py-2 border border-[#243324]/15 dark:border-white/15 rounded-xl bg-transparent text-[#1F2B1D] dark:text-[#F4EFE6] focus:outline-none focus:border-[#1F2B1D] dark:focus:border-white/40"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-4 border-t border-[#243324]/10 dark:border-white/10">
                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={() => setIsAddOpen(false)}
                  className="px-4 py-2 rounded-xl border border-[#243324]/15 dark:border-white/15 text-xs text-[#657351] dark:text-[#A3B59E] hover:bg-[#243324]/5 dark:hover:bg-white/5 transition-all"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex items-center gap-2 px-5 py-2 bg-[#1F2B1D] dark:bg-[#85E7B7] text-[#F4EFE6] dark:text-[#131D12] text-xs font-semibold rounded-xl hover:opacity-90 active:scale-95 transition-all disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Menyimpan...</span>
                    </>
                  ) : (
                    <span>Simpan Cabang</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: Edit Data Zawiyah */}
      {editingZawiyah && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          onClick={() => !isSubmitting && setEditingZawiyah(null)}
        >
          <div
            className="glass-panel rounded-3xl p-6 sm:p-7 max-w-lg w-full space-y-5 shadow-2xl border border-white/20"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between border-b border-[#243324]/10 dark:border-white/10 pb-4">
              <div>
                <h2 className="font-display text-xl text-[#1F2B1D] dark:text-[#F4EFE6] font-medium flex items-center gap-2">
                  <Pencil className="w-5 h-5 text-amber-500" /> Edit Cabang Zawiyah
                </h2>
                <p className="text-xs text-[#657351] dark:text-[#A3B59E] mt-0.5">
                  ID: <span className="font-mono font-semibold text-[#1F2B1D] dark:text-[#F4EFE6]">{editingZawiyah.id}</span>
                </p>
              </div>
              <button
                disabled={isSubmitting}
                onClick={() => setEditingZawiyah(null)}
                className="p-1.5 rounded-xl hover:bg-[#243324]/8 dark:hover:bg-white/8 transition-colors disabled:opacity-50"
              >
                <X className="w-4 h-4 text-[#657351] dark:text-[#A3B59E]" />
              </button>
            </div>

            {errorMessage && (
              <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/50 flex items-center gap-2 text-rose-700 dark:text-rose-300 text-xs">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            <form onSubmit={handleSubmitEdit} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="font-semibold text-[#1F2B1D] dark:text-[#F4EFE6]">
                  Nama Cabang Zawiyah <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.nama || ''}
                  onChange={(e) => setFormData({ ...formData, nama: e.target.value })}
                  className="w-full px-3 py-2 border border-[#243324]/15 dark:border-white/15 rounded-xl bg-transparent text-[#1F2B1D] dark:text-[#F4EFE6] focus:outline-none focus:border-[#1F2B1D] dark:focus:border-white/40"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-semibold text-[#1F2B1D] dark:text-[#F4EFE6]">Tipe Zawiyah</label>
                  <select
                    value={formData.tipe || 'Cabang'}
                    onChange={(e) => setFormData({ ...formData, tipe: e.target.value })}
                    className="w-full px-3 py-2 border border-[#243324]/15 dark:border-white/15 rounded-xl bg-transparent text-[#1F2B1D] dark:text-[#F4EFE6] focus:outline-none focus:border-[#1F2B1D] dark:focus:border-white/40 cursor-pointer"
                  >
                    <option value="Cabang" className="dark:bg-[#1a251a]">
                      Cabang
                    </option>
                    <option value="Wilayah" className="dark:bg-[#1a251a]">
                      Wilayah
                    </option>
                    <option value="Pusat" className="dark:bg-[#1a251a]">
                      Pusat
                    </option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-[#1F2B1D] dark:text-[#F4EFE6]">
                    Kota / Kabupaten <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.kota || ''}
                    onChange={(e) => setFormData({ ...formData, kota: e.target.value })}
                    className="w-full px-3 py-2 border border-[#243324]/15 dark:border-white/15 rounded-xl bg-transparent text-[#1F2B1D] dark:text-[#F4EFE6] focus:outline-none focus:border-[#1F2B1D] dark:focus:border-white/40"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-[#1F2B1D] dark:text-[#F4EFE6]">
                  Nama Pengurus / Penanggung Jawab
                </label>
                <input
                  type="text"
                  value={formData.pengurus || ''}
                  onChange={(e) => setFormData({ ...formData, pengurus: e.target.value })}
                  className="w-full px-3 py-2 border border-[#243324]/15 dark:border-white/15 rounded-xl bg-transparent text-[#1F2B1D] dark:text-[#F4EFE6] focus:outline-none focus:border-[#1F2B1D] dark:focus:border-white/40"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-4 border-t border-[#243324]/10 dark:border-white/10">
                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={() => setEditingZawiyah(null)}
                  className="px-4 py-2 rounded-xl border border-[#243324]/15 dark:border-white/15 text-xs text-[#657351] dark:text-[#A3B59E] hover:bg-[#243324]/5 dark:hover:bg-white/5 transition-all"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex items-center gap-2 px-5 py-2 bg-[#1F2B1D] dark:bg-[#85E7B7] text-[#F4EFE6] dark:text-[#131D12] text-xs font-semibold rounded-xl hover:opacity-90 active:scale-95 transition-all disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Menyimpan...</span>
                    </>
                  ) : (
                    <span>Simpan Perubahan</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: Konfirmasi Hapus Zawiyah */}
      {deletingZawiyah && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          onClick={() => !isSubmitting && setDeletingZawiyah(null)}
        >
          <div
            className="glass-panel rounded-3xl p-6 max-w-md w-full space-y-5 shadow-2xl border border-rose-200/40 dark:border-rose-900/40"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-3 text-rose-600 dark:text-rose-400">
              <div className="p-2.5 rounded-2xl bg-rose-50 dark:bg-rose-950/60">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-display text-base font-semibold text-[#1F2B1D] dark:text-[#F4EFE6]">
                  Hapus Cabang Zawiyah?
                </h3>
                <p className="text-xs text-[#657351] dark:text-[#A3B59E]">
                  {deletingZawiyah.nama} ({deletingZawiyah.id})
                </p>
              </div>
            </div>

            <p className="text-xs text-[#657351] dark:text-[#CBD7C7] leading-relaxed">
              Apakah Anda yakin ingin menghapus cabang zawiyah ini? Data jamaah yang terhubung akan dilepaskan (id zawiyah diset kosong) agar data keanggotaan tidak hilang.
            </p>

            {errorMessage && (
              <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/50 flex items-center gap-2 text-rose-700 dark:text-rose-300 text-xs">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                disabled={isSubmitting}
                onClick={() => setDeletingZawiyah(null)}
                className="px-4 py-2 rounded-xl border border-[#243324]/15 dark:border-white/15 text-xs text-[#657351] dark:text-[#A3B59E] hover:bg-[#243324]/5 dark:hover:bg-white/5 transition-all"
              >
                Batal
              </button>
              <button
                type="button"
                disabled={isSubmitting}
                onClick={handleSubmitDelete}
                className="flex items-center gap-2 px-5 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold rounded-xl active:scale-95 transition-all disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Menghapus...</span>
                  </>
                ) : (
                  <span>Hapus Zawiyah</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
