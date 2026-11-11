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
  AlertTriangle,
  UserCheck,
  KeyRound,
  Copy,
  Check,
  Sparkles
} from 'lucide-react';
import type { Zawiyah } from '@/lib/data/ssot';

interface Props {
  zawiyahList: Zawiyah[];
  currentUser?: any;
}

interface ToastState {
  type: 'success' | 'error';
  message: string;
}

const TIPE_COLORS: Record<string, string> = {
  'Pusat': 'bg-[#1F2B1D] text-[#85E7B7] border border-emerald-500/30',
  'Utama': 'bg-[#3A2C14] text-[#FBD38D] border border-amber-500/30',
  'Cabang': 'bg-[#E8DCC4] text-[#1F2B1D]',
};

const INITIAL_FORM: Partial<Zawiyah> = {
  nama: '',
  tipe: 'Cabang',
  kota: '',
  pengurus: '',
  ketua_zawiyah: '',
  no_telp_ketua: '',
};

export default function AdminZawiyah({ zawiyahList: initialList, currentUser }: Props) {
  const [list, setList] = useState<Zawiyah[]>(initialList);
  const [search, setSearch] = useState('');
  const [filterTipe, setFilterTipe] = useState('ALL');
  const [sortBy, setSortBy] = useState<'jamaah' | 'nama'>('jamaah');

  // Modals state
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingZawiyah, setEditingZawiyah] = useState<Zawiyah | null>(null);
  const [deletingZawiyah, setDeletingZawiyah] = useState<Zawiyah | null>(null);

  // Assign Ketua Zawiyah Modal state
  const [assignZawiyah, setAssignZawiyah] = useState<Zawiyah | null>(null);
  const [searchJamaahQuery, setSearchJamaahQuery] = useState('');
  const [searchJamaahResults, setSearchJamaahResults] = useState<any[]>([]);
  const [isSearchingJamaah, setIsSearchingJamaah] = useState(false);
  const [isAssigning, setIsAssigning] = useState(false);
  const [assignSuccessData, setAssignSuccessData] = useState<any | null>(null);
  const [copiedCreds, setCopiedCreds] = useState(false);
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
        sortBy === 'jamaah' ? Number(b.jamaah || 0) - Number(a.jamaah || 0) : a.nama.localeCompare(b.nama)
      );
  }, [search, filterTipe, sortBy, list]);

  const totalJamaahFiltered = filtered.reduce((acc, z) => acc + Number(z.jamaah || 0), 0);

  // Open Assign Ketua Modal
  const handleOpenAssignModal = async (zawiyah: Zawiyah) => {
    setAssignZawiyah(zawiyah);
    setSearchJamaahQuery('');
    setSearchJamaahResults([]);
    setAssignSuccessData(null);
    setCopiedCreds(false);
    setErrorMessage('');

    // Pre-load candidates (search by kota or recent)
    setIsSearchingJamaah(true);
    try {
      const res = await fetch(`/api/jamaah/search?q=${encodeURIComponent(zawiyah.kota)}&limit=10`);
      const data = await res.json();
      if (data.success && data.data) {
        setSearchJamaahResults(data.data.filter((j: any) => j.nama && j.nama.trim()));
      }
    } catch {
      // ignore
    } finally {
      setIsSearchingJamaah(false);
    }
  };

  const handleSearchJamaahSubmit = async (queryText: string) => {
    setSearchJamaahQuery(queryText);
    if (!queryText.trim()) return;

    setIsSearchingJamaah(true);
    try {
      const res = await fetch(`/api/jamaah/search?q=${encodeURIComponent(queryText.trim())}&limit=20`);
      const data = await res.json();
      if (data.success && data.data) {
        setSearchJamaahResults(data.data.filter((j: any) => j.nama && j.nama.trim()));
      }
    } catch (err: any) {
      console.warn('Search jamaah error:', err);
    } finally {
      setIsSearchingJamaah(false);
    }
  };

  const handleConfirmAssign = async (jamaah: any) => {
    if (!assignZawiyah) return;
    if (!confirm(`Yakin ingin menunjuk "${jamaah.nama}" (${jamaah.id}) sebagai Ketua ${assignZawiyah.nama}?`)) return;

    setIsAssigning(true);
    setErrorMessage('');
    try {
      const res = await fetch('/api/zawiyah/assign-ketua', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          zawiyah_id: assignZawiyah.id,
          jamaah_id: jamaah.id,
        }),
      });
      const result = await res.json();

      if (!res.ok || !result.success) {
        throw new Error(result.message || 'Gagal menunjuk Ketua Zawiyah.');
      }

      // Update local state list
      setList((prev) =>
        prev.map((z) =>
          z.id === assignZawiyah.id
            ? {
              ...z,
              ketua_zawiyah: jamaah.nama,
              ketua_jamaah_id: jamaah.id,
              no_telp_ketua: jamaah.telepon || z.no_telp_ketua,
              pengurus: jamaah.nama,
            }
            : z
        )
      );

      setAssignSuccessData(result.data);
      showToast('success', `${jamaah.nama} resmi ditunjuk sebagai Ketua ${assignZawiyah.nama}!`);
    } catch (err: any) {
      setErrorMessage(err.message || 'Terjadi kesalahan sistem saat penunjukan ketua.');
    } finally {
      setIsAssigning(false);
    }
  };

  const handleCopyCredentials = (credsText: string) => {
    navigator.clipboard.writeText(credsText);
    setCopiedCreds(true);
    setTimeout(() => setCopiedCreds(false), 3000);
  };

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
                className={`w-full pl-8 pr-7 py-2 text-xs rounded-xl border appearance-none transition-all cursor-pointer font-medium focus:outline-none truncate ${filterTipe !== 'ALL'
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
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="font-mono text-[10px] text-[#657351] dark:text-[#A3B59E]">
                          {z.id}
                        </span>
                        {currentUser?.zawiyah_id === z.id && (
                          <span className="px-2 py-0.5 rounded-full text-[9px] font-semibold bg-emerald-500/15 text-emerald-800 dark:text-emerald-300 border border-emerald-500/30">
                            Cabang Anda
                          </span>
                        )}
                      </div>
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

                  <div className="pt-3 mt-3 border-t border-[#243324]/8 dark:border-white/8 space-y-1 text-xs text-[#657351] dark:text-[#A3B59E]">
                    <div className="flex items-center gap-1.5">
                      <User className="w-3 h-3 text-[#4A5D44] dark:text-[#A3B59E] flex-shrink-0" />
                      <p className="truncate">
                        Ketua: <strong className="text-[#1F2B1D] dark:text-[#F4EFE6] font-medium">{z.ketua_zawiyah || z.pengurus}</strong>
                      </p>
                    </div>
                    {z.no_telp_ketua && (
                      <div className="flex items-center gap-1.5 font-mono text-[11px] pl-4">
                        <span>WA: {z.no_telp_ketua}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Card Action Buttons */}
                <div className="flex items-center justify-between gap-2 pt-3 border-t border-[#243324]/8 dark:border-white/8">
                  <button
                    type="button"
                    onClick={() => handleOpenAssignModal(z)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600/10 hover:bg-emerald-600/20 text-emerald-800 dark:text-emerald-300 border border-emerald-500/25 text-xs font-medium transition-colors cursor-pointer"
                    title="Tunjuk / Ganti Ketua Zawiyah dari Database Jamaah"
                  >
                    <UserCheck className="w-3.5 h-3.5" />
                    <span>{z.ketua_zawiyah ? 'Kelola Ketua' : 'Tunjuk Ketua'}</span>
                  </button>

                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => handleOpenEdit(z)}
                      className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-amber-300 dark:border-amber-700 text-amber-700 dark:text-amber-400 text-xs font-medium hover:bg-amber-50 dark:hover:bg-amber-950/40 transition-colors cursor-pointer"
                    >
                      <Pencil className="w-3 h-3" /> Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => handleOpenDelete(z)}
                      className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-rose-300 dark:border-rose-700 text-rose-700 dark:text-rose-400 text-xs font-medium hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-3 h-3" /> Hapus
                    </button>
                  </div>
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
                    <option value="Utama" className="dark:bg-[#1a251a]">
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
                  Nama Ketua Zawiyah
                </label>
                <input
                  type="text"
                  value={formData.ketua_zawiyah || ''}
                  onChange={(e) => setFormData({ ...formData, ketua_zawiyah: e.target.value, pengurus: e.target.value })}
                  placeholder="Contoh: Ust. Asep Saepudin, S.Pd.I."
                  className="w-full px-3 py-2 border border-[#243324]/15 dark:border-white/15 rounded-xl bg-transparent text-[#1F2B1D] dark:text-[#F4EFE6] focus:outline-none focus:border-[#1F2B1D] dark:focus:border-white/40"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-[#1F2B1D] dark:text-[#F4EFE6]">
                  No. Telepon / WhatsApp Ketua
                </label>
                <input
                  type="text"
                  value={formData.no_telp_ketua || ''}
                  onChange={(e) => setFormData({ ...formData, no_telp_ketua: e.target.value })}
                  placeholder="Contoh: 081512349876"
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
                    <option value="Utama" className="dark:bg-[#1a251a]">
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
      {/* MODAL: Tunjuk / Flagging Ketua Zawiyah dari Database Jamaah */}
      {assignZawiyah && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto"
          onClick={() => !isAssigning && setAssignZawiyah(null)}
        >
          <div
            className="glass-panel rounded-3xl p-6 sm:p-7 max-w-2xl w-full my-8 space-y-5 shadow-2xl border border-white/20"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between border-b border-[#243324]/10 dark:border-white/10 pb-4">
              <div>
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-800 dark:text-emerald-300 text-xs font-medium mb-1">
                  <UserCheck className="w-3.5 h-3.5" />
                  <span>Penunjukan Ketua Cabang</span>
                </div>
                <h2 className="font-display text-xl text-[#1F2B1D] dark:text-[#F4EFE6] font-medium">
                  {assignZawiyah.nama}
                </h2>
                <p className="text-xs text-[#657351] dark:text-[#A3B59E] mt-0.5">
                  Kota {assignZawiyah.kota} &bull; Ketua Saat Ini: <strong className="text-[#1F2B1D] dark:text-[#F4EFE6]">{assignZawiyah.ketua_zawiyah || 'Belum Ditunjuk'}</strong>
                </p>
              </div>
              <button
                disabled={isAssigning}
                onClick={() => setAssignZawiyah(null)}
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

            {/* Success Card with Provisioned Credentials */}
            {assignSuccessData ? (
              <div className="p-5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-950 dark:text-emerald-100 space-y-4 animate-in fade-in zoom-in-95 duration-200">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-sm">Ketua Zawiyah Berhasil Ditunjuk & Diberi Akses!</h3>
                    <p className="text-xs text-emerald-800 dark:text-emerald-300">
                      <strong>{assignSuccessData.jamaah.nama}</strong> ({assignSuccessData.jamaah.id}) resmi ditunjuk sebagai Ketua <strong>{assignSuccessData.zawiyah.nama}</strong>.
                    </p>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-white/80 dark:bg-black/30 border border-emerald-500/20 space-y-2 text-xs">
                  <p className="font-semibold text-[#1F2B1D] dark:text-[#F4EFE6]">
                    Kredensial Akun Login Ketua Zawiyah:
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 font-mono">
                    <div className="p-2 rounded-lg bg-[#243324]/5 dark:bg-white/5">
                      <span className="text-[10px] text-[#657351] dark:text-[#A3B59E] block">Username</span>
                      <strong className="text-sm text-[#1F2B1D] dark:text-[#F4EFE6]">{assignSuccessData.account.username}</strong>
                    </div>
                    <div className="p-2 rounded-lg bg-[#243324]/5 dark:bg-white/5">
                      <span className="text-[10px] text-[#657351] dark:text-[#A3B59E] block">Password Default</span>
                      <strong className="text-sm text-[#1F2B1D] dark:text-[#F4EFE6]">{assignSuccessData.account.defaultPassword || '(Password akun yang sudah ada)'}</strong>
                    </div>
                  </div>
                  <p className="text-[11px] text-[#657351] dark:text-[#A3B59E] italic pt-1">
                    * Ketua Zawiyah dapat mengganti kata sandi bawaan ini kapan saja melalui menu pengaturan akun di dashboard zawiyahnya.
                  </p>
                </div>

                <div className="flex items-center justify-between gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      const text = `Kredensial Akses SAJADA Ketua ${assignSuccessData.zawiyah.nama}\nNama: ${assignSuccessData.jamaah.nama}\nUsername: ${assignSuccessData.account.username}\nPassword: ${assignSuccessData.account.defaultPassword || 'Password sebelumnya'}\nLink: http://localhost:3000/login`;
                      handleCopyCredentials(text);
                    }}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#1F2B1D] dark:bg-[#85E7B7] text-[#F4EFE6] dark:text-[#131D12] text-xs font-semibold hover:opacity-90 transition-all cursor-pointer shadow-xs"
                  >
                    {copiedCreds ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedCreds ? 'Kredensial Disalin!' : 'Salin Kredensial untuk Ketua'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setAssignZawiyah(null)}
                    className="px-4 py-2 rounded-xl border border-[#243324]/15 dark:border-white/15 text-xs text-[#657351] dark:text-[#A3B59E] hover:bg-black/5 dark:hover:bg-white/5 transition-all cursor-pointer"
                  >
                    Tutup
                  </button>
                </div>
              </div>
            ) : (
              /* Search & Select Jamaah from Database */
              <div className="space-y-4 text-xs">
                <div>
                  <label className="font-semibold text-[#1F2B1D] dark:text-[#F4EFE6] block mb-1.5">
                    Cari Calon Ketua dari Database Jamaah:
                  </label>
                  <div className="flex items-center gap-2">
                    <div className="relative flex-1">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#657351] dark:text-[#A3B59E]" />
                      <input
                        type="text"
                        value={searchJamaahQuery}
                        onChange={(e) => setSearchJamaahQuery(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSearchJamaahSubmit(searchJamaahQuery)}
                        placeholder="Ketik nama jamaah, nomor ID (MBR...), nomor telepon, atau kota..."
                        className="w-full pl-9 pr-4 py-2 border border-[#243324]/15 dark:border-white/15 rounded-xl bg-transparent text-[#1F2B1D] dark:text-[#F4EFE6] focus:outline-none focus:border-[#1F2B1D] dark:focus:border-white/40"
                      />
                    </div>
                    <button
                      type="button"
                      disabled={isSearchingJamaah}
                      onClick={() => handleSearchJamaahSubmit(searchJamaahQuery)}
                      className="px-4 py-2 rounded-xl bg-[#1F2B1D] dark:bg-[#85E7B7] text-[#F4EFE6] dark:text-[#131D12] font-semibold hover:opacity-90 transition-all cursor-pointer disabled:opacity-50 shrink-0 flex items-center gap-1.5"
                    >
                      {isSearchingJamaah ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Search className="w-3.5 h-3.5" />}
                      <span>Cari</span>
                    </button>
                  </div>
                  <p className="text-[11px] text-[#657351] dark:text-[#A3B59E] mt-1">
                    * Ketua Zawiyah dapat dipilih dari jamaah zawiyah mana pun (fleksibel lintas cabang).
                  </p>
                </div>

                {/* Search Results List */}
                <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                  {isSearchingJamaah ? (
                    <div className="py-8 text-center text-[#657351] dark:text-[#A3B59E] flex items-center justify-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Mencari data jamaah di database...</span>
                    </div>
                  ) : searchJamaahResults.length > 0 ? (
                    searchJamaahResults.map((j) => (
                      <div
                        key={j.id}
                        className="p-3.5 rounded-xl border border-[#243324]/10 dark:border-white/10 hover:border-emerald-500/40 bg-white/60 dark:bg-white/5 hover:bg-emerald-500/5 transition-all flex items-center justify-between gap-3"
                      >
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-[10px] text-[#657351] dark:text-[#A3B59E]">{j.id}</span>
                            {j.is_ketua_zawiyah === 1 && (
                              <span className="px-1.5 py-0.2 rounded text-[9px] bg-amber-500/20 text-amber-800 dark:text-amber-300 font-medium">
                                Sudah Ketua ({j.ketua_di_zawiyah_nama || 'Cabang Lain'})
                              </span>
                            )}
                          </div>
                          <p className="font-semibold text-sm text-[#1F2B1D] dark:text-[#F4EFE6] truncate mt-0.5">
                            {j.nama || '(Nama Belum Diisi)'}
                          </p>
                          <p className="text-[11px] text-[#657351] dark:text-[#A3B59E] truncate">
                            Asal: {j.zawiyah || 'Pusat'} &bull; Telp: {j.telepon || '-'} &bull; Profesi: {j.pekerjaan || '-'}
                          </p>
                        </div>

                        <button
                          type="button"
                          disabled={isAssigning}
                          onClick={() => handleConfirmAssign(j)}
                          className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs transition-all shadow-xs shrink-0 cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
                        >
                          {isAssigning ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <UserCheck className="w-3.5 h-3.5" />}
                          <span>Tunjuk Ketua</span>
                        </button>
                      </div>
                    ))
                  ) : (
                    <div className="py-8 text-center text-[#657351] dark:text-[#A3B59E]">
                      Ketik nama jamaah di kolom pencarian di atas untuk memilih calon Ketua Zawiyah.
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-end pt-3 border-t border-[#243324]/10 dark:border-white/10">
                  <button
                    type="button"
                    onClick={() => setAssignZawiyah(null)}
                    className="px-4 py-2 rounded-xl border border-[#243324]/15 dark:border-white/15 text-xs text-[#657351] dark:text-[#A3B59E] hover:bg-[#243324]/5 dark:hover:bg-white/5 transition-all cursor-pointer"
                  >
                    Batal
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

    </div>
  );
}
