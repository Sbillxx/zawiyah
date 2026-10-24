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
  Users,
  Heart,
  Wallet,
  Plus,
  Pencil,
  Trash2,
  Loader2,
  CheckCircle2,
  AlertCircle,
  AlertTriangle,
  Eye,
  RefreshCw
} from 'lucide-react';
import type { Jamaah, Zawiyah } from '@/lib/data/ssot';

interface Props {
  jamaahList: Jamaah[];
  zawiyahList: Zawiyah[];
}

interface ToastState {
  type: 'success' | 'error';
  message: string;
}

const INITIAL_FORM: Partial<Jamaah> = {
  nama: '',
  zawiyah: '',
  jenisKelamin: 'Laki-laki',
  statusPernikahan: 'Menikah',
  tempatLahir: '',
  tanggalLahir: '',
  email: '',
  telepon: '',
  ktp: '',
  kk: '',
  alamat: '',
  pekerjaan: 'Wiraswasta',
  koperasi: 'Tidak',
  agniaCare: 'Tidak',
  status: 'Aktif',
};

export default function AdminJamaah({ jamaahList: initialList, zawiyahList }: Props) {
  const [list, setList] = useState<Jamaah[]>(initialList);
  const [search, setSearch] = useState('');
  const [filterZawiyah, setFilterZawiyah] = useState('ALL');
  const [filterGender, setFilterGender] = useState('ALL');
  const [filterAgnia, setFilterAgnia] = useState('ALL');
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [currentPage, setCurrentPage] = useState(1);
  const [selected, setSelected] = useState<Jamaah | null>(null);

  // Modals state
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingJamaah, setEditingJamaah] = useState<Jamaah | null>(null);
  const [deletingJamaah, setDeletingJamaah] = useState<Jamaah | null>(null);
  const [formData, setFormData] = useState<Partial<Jamaah>>(INITIAL_FORM);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [toast, setToast] = useState<ToastState | null>(null);

  const PER_PAGE = 15;

  const showToast = (type: 'success' | 'error', message: string) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 4000);
  };

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return list.filter((j) => {
      const matchSearch =
        !search ||
        j.nama.toLowerCase().includes(q) ||
        j.id.toLowerCase().includes(q) ||
        (j.telepon && j.telepon.includes(search)) ||
        (j.alamat && j.alamat.toLowerCase().includes(q)) ||
        (j.pekerjaan && j.pekerjaan.toLowerCase().includes(q));
      const matchZawiyah = filterZawiyah === 'ALL' || j.zawiyah === filterZawiyah;
      const matchGender = filterGender === 'ALL' || j.jenisKelamin === filterGender;
      const matchAgnia =
        filterAgnia === 'ALL' || (filterAgnia === 'YA' ? j.agniaCare === 'Ya' : j.agniaCare !== 'Ya');
      const matchStatus = filterStatus === 'ALL' || j.status === filterStatus;
      return matchSearch && matchZawiyah && matchGender && matchAgnia && matchStatus;
    });
  }, [search, filterZawiyah, filterGender, filterAgnia, filterStatus, list]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PER_PAGE));
  const safePage = Math.min(currentPage, totalPages);
  const paginated = filtered.slice((safePage - 1) * PER_PAGE, safePage * PER_PAGE);

  const uniqueZawiyah = useMemo(() => {
    const fromList = list.map((j) => j.zawiyah);
    const fromMaster = zawiyahList.map((z) => z.nama);
    return [...new Set([...fromList, ...fromMaster])].filter(Boolean).sort();
  }, [list, zawiyahList]);

  const hasFilters =
    search ||
    filterZawiyah !== 'ALL' ||
    filterGender !== 'ALL' ||
    filterAgnia !== 'ALL' ||
    filterStatus !== 'ALL';

  const clearFilters = () => {
    setSearch('');
    setFilterZawiyah('ALL');
    setFilterGender('ALL');
    setFilterAgnia('ALL');
    setFilterStatus('ALL');
    setCurrentPage(1);
  };

  // Open Add Modal
  const handleOpenAdd = () => {
    const defaultZawiyah = zawiyahList[0]?.nama || 'Zawiyah Pusat Tasikmalaya';
    setFormData({ ...INITIAL_FORM, zawiyah: defaultZawiyah });
    setErrorMessage('');
    setIsAddOpen(true);
  };

  // Open Edit Modal
  const handleOpenEdit = (jamaah: Jamaah) => {
    setEditingJamaah(jamaah);
    setFormData({ ...jamaah });
    setErrorMessage('');
  };

  // Open Delete Modal
  const handleOpenDelete = (jamaah: Jamaah) => {
    setDeletingJamaah(jamaah);
    setErrorMessage('');
  };

  // Submit Create (POST)
  const handleSubmitAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.nama?.trim()) {
      setErrorMessage('Nama jamaah wajib diisi.');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage('');
    try {
      const res = await fetch('/api/jamaah', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const result = await res.json();

      if (!res.ok || !result.success) {
        throw new Error(result.message || 'Gagal menambahkan jamaah.');
      }

      setList((prev) => [result.data, ...prev]);
      setIsAddOpen(false);
      showToast('success', result.message || 'Jamaah berhasil ditambahkan ke TiDB Cloud!');
    } catch (err: any) {
      setErrorMessage(err.message || 'Terjadi kesalahan sistem.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Submit Edit (PUT)
  const handleSubmitEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingJamaah) return;
    if (!formData.nama?.trim()) {
      setErrorMessage('Nama jamaah tidak boleh kosong.');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage('');
    try {
      const res = await fetch('/api/jamaah', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: editingJamaah.id,
          ...formData,
        }),
      });
      const result = await res.json();

      if (!res.ok || !result.success) {
        throw new Error(result.message || 'Gagal memperbarui data jamaah.');
      }

      // Update local state
      const updated: Jamaah = {
        ...editingJamaah,
        ...(formData as Jamaah),
      };
      setList((prev) => prev.map((j) => (j.id === editingJamaah.id ? updated : j)));
      if (selected && selected.id === editingJamaah.id) {
        setSelected(updated);
      }
      setEditingJamaah(null);
      showToast('success', result.message || 'Perubahan berhasil disimpan ke database!');
    } catch (err: any) {
      setErrorMessage(err.message || 'Terjadi kesalahan sistem.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Submit Delete (DELETE)
  const handleSubmitDelete = async (hardDelete: boolean) => {
    if (!deletingJamaah) return;

    setIsSubmitting(true);
    setErrorMessage('');
    try {
      const res = await fetch(`/api/jamaah?id=${encodeURIComponent(deletingJamaah.id)}&hard=${hardDelete}`, {
        method: 'DELETE',
      });
      const result = await res.json();

      if (!res.ok || !result.success) {
        throw new Error(result.message || 'Gagal menghapus jamaah.');
      }

      if (hardDelete) {
        setList((prev) => prev.filter((j) => j.id !== deletingJamaah.id));
      } else {
        setList((prev) =>
          prev.map((j) => (j.id === deletingJamaah.id ? { ...j, status: 'Nonaktif' } : j))
        );
      }

      if (selected && selected.id === deletingJamaah.id) {
        setSelected(null);
      }
      setDeletingJamaah(null);
      showToast('success', result.message || 'Data jamaah berhasil diproses.');
    } catch (err: any) {
      setErrorMessage(err.message || 'Terjadi kesalahan saat menghapus.');
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
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Link
              href="/admin"
              className="flex items-center gap-1.5 text-sm text-[#657351] dark:text-[#A3B59E] hover:text-[#243324] dark:hover:text-[#F4EFE6] transition-colors"
            >
              <ArrowLeft className="w-4 h-4" /> Dashboard
            </Link>
            <span className="text-[#243324]/20 dark:text-white/20">/</span>
            <h1 className="font-display text-lg text-[#1F2B1D] dark:text-[#F4EFE6] font-light">
              Manajemen Data Jamaah
            </h1>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2 text-xs text-[#657351] dark:text-[#A3B59E] px-3 py-1.5 rounded-xl bg-[#243324]/5 dark:bg-white/5">
              <Users className="w-3.5 h-3.5" />
              <span className="font-display text-base font-light text-[#1F2B1D] dark:text-[#F4EFE6]">
                {filtered.length.toLocaleString('id-ID')}
              </span>
              <span>/ {list.length.toLocaleString('id-ID')}</span>
            </div>

            <button
              onClick={handleOpenAdd}
              className="flex items-center gap-2 px-4 py-2 bg-[#1F2B1D] dark:bg-[#85E7B7] text-[#F4EFE6] dark:text-[#131D12] text-xs font-semibold rounded-xl hover:opacity-90 active:scale-95 transition-all shadow-sm"
            >
              <Plus className="w-4 h-4" />
              <span>Tambah Jamaah</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-5">
        {/* Filter & Search Bar */}
        <div className="glass-panel rounded-2xl p-4 space-y-4">
          <div className="flex items-center gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#657351] dark:text-[#A3B59E]" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Cari nama, nomor ID, telepon, alamat, atau pekerjaan..."
                className="w-full pl-9 pr-4 py-2.5 bg-transparent border border-[#243324]/15 dark:border-white/15 rounded-xl text-sm text-[#243324] dark:text-[#F4EFE6] placeholder-[#A3B59E] focus:outline-none focus:border-[#1F2B1D] dark:focus:border-white/40 transition-colors"
              />
            </div>
            {hasFilters && (
              <button
                onClick={clearFilters}
                className="flex items-center gap-1.5 px-3 py-2.5 rounded-xl border border-[#243324]/15 dark:border-white/15 text-xs text-[#657351] dark:text-[#A3B59E] hover:text-[#243324] dark:hover:text-[#F4EFE6] hover:border-[#243324]/30 dark:hover:border-white/30 transition-all"
              >
                <X className="w-3.5 h-3.5" /> Reset
              </button>
            )}
          </div>

          <div className="flex flex-wrap gap-2 items-center">
            <div className="flex items-center gap-1.5 mr-1">
              <Filter className="w-3.5 h-3.5 text-[#657351] dark:text-[#A3B59E]" />
              <span className="text-xs text-[#657351] dark:text-[#A3B59E] font-medium">Filter:</span>
            </div>
            <select
              value={filterZawiyah}
              onChange={(e) => {
                setFilterZawiyah(e.target.value);
                setCurrentPage(1);
              }}
              className="px-3 py-1.5 text-xs border border-[#243324]/15 dark:border-white/15 rounded-lg bg-transparent text-[#243324] dark:text-[#F4EFE6] focus:outline-none focus:border-[#1F2B1D] dark:focus:border-white/40 transition-colors cursor-pointer"
            >
              <option value="ALL">Semua Zawiyah ({uniqueZawiyah.length})</option>
              {uniqueZawiyah.map((z) => (
                <option key={z} value={z}>
                  {z}
                </option>
              ))}
            </select>
            <select
              value={filterGender}
              onChange={(e) => {
                setFilterGender(e.target.value);
                setCurrentPage(1);
              }}
              className="px-3 py-1.5 text-xs border border-[#243324]/15 dark:border-white/15 rounded-lg bg-transparent text-[#243324] dark:text-[#F4EFE6] focus:outline-none focus:border-[#1F2B1D] dark:focus:border-white/40 transition-colors cursor-pointer"
            >
              <option value="ALL">Semua Gender</option>
              <option value="Laki-laki">Laki-laki</option>
              <option value="Perempuan">Perempuan</option>
            </select>
            <select
              value={filterAgnia}
              onChange={(e) => {
                setFilterAgnia(e.target.value);
                setCurrentPage(1);
              }}
              className="px-3 py-1.5 text-xs border border-[#243324]/15 dark:border-white/15 rounded-lg bg-transparent text-[#243324] dark:text-[#F4EFE6] focus:outline-none focus:border-[#1F2B1D] dark:focus:border-white/40 transition-colors cursor-pointer"
            >
              <option value="ALL">Semua Agnia Care</option>
              <option value="YA">Peserta Agnia Care</option>
              <option value="TIDAK">Non Peserta</option>
            </select>
            <select
              value={filterStatus}
              onChange={(e) => {
                setFilterStatus(e.target.value);
                setCurrentPage(1);
              }}
              className="px-3 py-1.5 text-xs border border-[#243324]/15 dark:border-white/15 rounded-lg bg-transparent text-[#243324] dark:text-[#F4EFE6] focus:outline-none focus:border-[#1F2B1D] dark:focus:border-white/40 transition-colors cursor-pointer"
            >
              <option value="ALL">Semua Status</option>
              <option value="Aktif">Aktif</option>
              <option value="Nonaktif">Nonaktif</option>
            </select>
          </div>
        </div>

        {/* Data Table with Action Column */}
        <div className="glass-panel rounded-2xl overflow-hidden border border-[#243324]/10 dark:border-white/10">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#243324]/10 dark:border-white/10 bg-[#243324]/5 dark:bg-white/5">
                  <th className="text-left px-5 py-3.5 text-xs font-semibold text-[#657351] dark:text-[#A3B59E] uppercase tracking-wider whitespace-nowrap">
                    ID
                  </th>
                  <th className="text-left px-5 py-3.5 text-xs font-semibold text-[#657351] dark:text-[#A3B59E] uppercase tracking-wider">
                    Nama Jamaah
                  </th>
                  <th className="text-left px-5 py-3.5 text-xs font-semibold text-[#657351] dark:text-[#A3B59E] uppercase tracking-wider hidden md:table-cell">
                    Zawiyah
                  </th>
                  <th className="text-left px-5 py-3.5 text-xs font-semibold text-[#657351] dark:text-[#A3B59E] uppercase tracking-wider hidden sm:table-cell">
                    Gender
                  </th>
                  <th className="text-left px-5 py-3.5 text-xs font-semibold text-[#657351] dark:text-[#A3B59E] uppercase tracking-wider hidden lg:table-cell">
                    Pekerjaan
                  </th>
                  <th className="text-left px-5 py-3.5 text-xs font-semibold text-[#657351] dark:text-[#A3B59E] uppercase tracking-wider hidden lg:table-cell">
                    Agnia
                  </th>
                  <th className="text-left px-5 py-3.5 text-xs font-semibold text-[#657351] dark:text-[#A3B59E] uppercase tracking-wider">
                    Status
                  </th>
                  <th className="text-center px-5 py-3.5 text-xs font-semibold text-[#657351] dark:text-[#A3B59E] uppercase tracking-wider">
                    Aksi
                  </th>
                </tr>
              </thead>
              <tbody>
                {paginated.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="text-center py-12 text-[#657351] dark:text-[#A3B59E]">
                      Tidak ada data jamaah yang cocok dengan pencarian / filter.
                    </td>
                  </tr>
                ) : (
                  paginated.map((j, idx) => (
                    <tr
                      key={j.id}
                      className={`border-b border-[#243324]/5 dark:border-white/5 transition-colors hover:bg-[#243324]/4 dark:hover:bg-white/4 ${
                        idx % 2 !== 0 ? 'bg-[#243324]/2 dark:bg-white/2' : ''
                      }`}
                    >
                      <td
                        onClick={() => setSelected(j)}
                        className="px-5 py-3.5 font-mono text-xs text-[#657351] dark:text-[#A3B59E] whitespace-nowrap cursor-pointer hover:underline"
                      >
                        {j.id}
                      </td>
                      <td
                        onClick={() => setSelected(j)}
                        className="px-5 py-3.5 font-medium text-[#1F2B1D] dark:text-[#F4EFE6] max-w-[180px] truncate cursor-pointer hover:underline"
                      >
                        {j.nama}
                      </td>
                      <td
                        onClick={() => setSelected(j)}
                        className="px-5 py-3.5 hidden md:table-cell text-[#4A5D44] dark:text-[#CBD7C7] max-w-[160px] truncate text-xs cursor-pointer"
                      >
                        {j.zawiyah}
                      </td>
                      <td onClick={() => setSelected(j)} className="px-5 py-3.5 hidden sm:table-cell cursor-pointer">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                            j.jenisKelamin === 'Laki-laki'
                              ? 'bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300'
                              : 'bg-pink-50 text-pink-700 dark:bg-pink-950 dark:text-pink-300'
                          }`}
                        >
                          {j.jenisKelamin === 'Laki-laki' ? 'L' : 'P'}
                        </span>
                      </td>
                      <td
                        onClick={() => setSelected(j)}
                        className="px-5 py-3.5 hidden lg:table-cell text-[#4A5D44] dark:text-[#CBD7C7] text-xs max-w-[140px] truncate cursor-pointer"
                      >
                        {j.pekerjaan}
                      </td>
                      <td onClick={() => setSelected(j)} className="px-5 py-3.5 hidden lg:table-cell cursor-pointer">
                        {j.agniaCare === 'Ya' ? (
                          <span className="flex items-center gap-1 text-[11px] font-medium text-rose-600 dark:text-rose-400">
                            <Heart className="w-3.5 h-3.5 fill-rose-500 text-rose-500" /> Ya
                          </span>
                        ) : (
                          <span className="text-[11px] text-[#A3B59E]">—</span>
                        )}
                      </td>
                      <td onClick={() => setSelected(j)} className="px-5 py-3.5 cursor-pointer">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                            j.status === 'Aktif'
                              ? 'bg-[#e6f4ea] text-[#006948] dark:bg-[#1F3D2A] dark:text-[#68DBA9]'
                              : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'
                          }`}
                        >
                          {j.status}
                        </span>
                      </td>

                      {/* Actions Column */}
                      <td className="px-5 py-3.5 text-center">
                        <div className="flex items-center justify-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                          <button
                            onClick={() => setSelected(j)}
                            title="Lihat Detail"
                            className="p-1.5 rounded-lg border border-[#243324]/10 dark:border-white/10 text-[#657351] dark:text-[#A3B59E] hover:text-[#1F2B1D] dark:hover:text-white hover:bg-[#243324]/5 dark:hover:bg-white/5 transition-colors"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleOpenEdit(j)}
                            title="Edit Data"
                            className="p-1.5 rounded-lg border border-[#243324]/10 dark:border-white/10 text-amber-600 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-950/40 transition-colors"
                          >
                            <Pencil className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleOpenDelete(j)}
                            title="Hapus / Nonaktifkan"
                            className="p-1.5 rounded-lg border border-[#243324]/10 dark:border-white/10 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination Footer */}
          <div className="flex items-center justify-between px-5 py-4 border-t border-[#243324]/10 dark:border-white/10">
            <p className="text-xs text-[#657351] dark:text-[#A3B59E]">
              Halaman {safePage} dari {totalPages} · {filtered.length.toLocaleString('id-ID')} hasil
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={safePage === 1}
                className="p-1.5 rounded-lg border border-[#243324]/15 dark:border-white/15 disabled:opacity-30 hover:border-[#243324]/30 dark:hover:border-white/30 transition-all"
              >
                <ChevronLeft className="w-4 h-4 text-[#243324] dark:text-[#F4EFE6]" />
              </button>
              <span className="px-3 py-1 text-xs bg-[#1F2B1D] text-[#F4EFE6] dark:bg-[#85E7B7] dark:text-[#131D12] rounded-lg font-medium">
                {safePage}
              </span>
              <button
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={safePage === totalPages}
                className="p-1.5 rounded-lg border border-[#243324]/15 dark:border-white/15 disabled:opacity-30 hover:border-[#243324]/30 dark:hover:border-white/30 transition-all"
              >
                <ChevronRight className="w-4 h-4 text-[#243324] dark:text-[#F4EFE6]" />
              </button>
            </div>
          </div>
        </div>
      </main>

      {/* MODAL: Tambah Jamaah Baru */}
      {isAddOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto"
          onClick={() => !isSubmitting && setIsAddOpen(false)}
        >
          <div
            className="glass-panel rounded-3xl p-6 sm:p-7 max-w-2xl w-full my-8 space-y-5 shadow-2xl border border-white/20"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between border-b border-[#243324]/10 dark:border-white/10 pb-4">
              <div>
                <h2 className="font-display text-xl text-[#1F2B1D] dark:text-[#F4EFE6] font-medium flex items-center gap-2">
                  <Plus className="w-5 h-5 text-[#85E7B7]" /> Tambah Jamaah Baru
                </h2>
                <p className="text-xs text-[#657351] dark:text-[#A3B59E] mt-0.5">
                  Input data jamaah baru untuk disimpan langsung ke database TiDB Cloud.
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

            <form onSubmit={handleSubmitAdd} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                {/* Nama Lengkap */}
                <div className="sm:col-span-2 space-y-1">
                  <label className="font-semibold text-[#1F2B1D] dark:text-[#F4EFE6]">
                    Nama Lengkap <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.nama || ''}
                    onChange={(e) => setFormData({ ...formData, nama: e.target.value })}
                    placeholder="Contoh: H. Ahmad Syahid"
                    className="w-full px-3 py-2 border border-[#243324]/15 dark:border-white/15 rounded-xl bg-transparent text-[#1F2B1D] dark:text-[#F4EFE6] focus:outline-none focus:border-[#1F2B1D] dark:focus:border-white/40"
                  />
                </div>

                {/* Cabang Zawiyah */}
                <div className="space-y-1">
                  <label className="font-semibold text-[#1F2B1D] dark:text-[#F4EFE6]">Cabang Zawiyah</label>
                  <select
                    value={formData.zawiyah || ''}
                    onChange={(e) => setFormData({ ...formData, zawiyah: e.target.value })}
                    className="w-full px-3 py-2 border border-[#243324]/15 dark:border-white/15 rounded-xl bg-transparent text-[#1F2B1D] dark:text-[#F4EFE6] focus:outline-none focus:border-[#1F2B1D] dark:focus:border-white/40 cursor-pointer"
                  >
                    {uniqueZawiyah.map((z) => (
                      <option key={z} value={z} className="dark:bg-[#1a251a]">
                        {z}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Jenis Kelamin */}
                <div className="space-y-1">
                  <label className="font-semibold text-[#1F2B1D] dark:text-[#F4EFE6]">Jenis Kelamin</label>
                  <select
                    value={formData.jenisKelamin || 'Laki-laki'}
                    onChange={(e) => setFormData({ ...formData, jenisKelamin: e.target.value })}
                    className="w-full px-3 py-2 border border-[#243324]/15 dark:border-white/15 rounded-xl bg-transparent text-[#1F2B1D] dark:text-[#F4EFE6] focus:outline-none focus:border-[#1F2B1D] dark:focus:border-white/40 cursor-pointer"
                  >
                    <option value="Laki-laki" className="dark:bg-[#1a251a]">
                      Laki-laki
                    </option>
                    <option value="Perempuan" className="dark:bg-[#1a251a]">
                      Perempuan
                    </option>
                  </select>
                </div>

                {/* Telepon */}
                <div className="space-y-1">
                  <label className="font-semibold text-[#1F2B1D] dark:text-[#F4EFE6]">No. Telepon / WhatsApp</label>
                  <input
                    type="text"
                    value={formData.telepon || ''}
                    onChange={(e) => setFormData({ ...formData, telepon: e.target.value })}
                    placeholder="08123456789"
                    className="w-full px-3 py-2 border border-[#243324]/15 dark:border-white/15 rounded-xl bg-transparent text-[#1F2B1D] dark:text-[#F4EFE6] focus:outline-none focus:border-[#1F2B1D] dark:focus:border-white/40"
                  />
                </div>

                {/* Email */}
                <div className="space-y-1">
                  <label className="font-semibold text-[#1F2B1D] dark:text-[#F4EFE6]">Email (Opsional)</label>
                  <input
                    type="email"
                    value={formData.email || ''}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="ahmad@example.com"
                    className="w-full px-3 py-2 border border-[#243324]/15 dark:border-white/15 rounded-xl bg-transparent text-[#1F2B1D] dark:text-[#F4EFE6] focus:outline-none focus:border-[#1F2B1D] dark:focus:border-white/40"
                  />
                </div>

                {/* Pekerjaan */}
                <div className="space-y-1">
                  <label className="font-semibold text-[#1F2B1D] dark:text-[#F4EFE6]">Pekerjaan</label>
                  <input
                    type="text"
                    value={formData.pekerjaan || ''}
                    onChange={(e) => setFormData({ ...formData, pekerjaan: e.target.value })}
                    placeholder="Wirausaha / PNS / Karyawan"
                    className="w-full px-3 py-2 border border-[#243324]/15 dark:border-white/15 rounded-xl bg-transparent text-[#1F2B1D] dark:text-[#F4EFE6] focus:outline-none focus:border-[#1F2B1D] dark:focus:border-white/40"
                  />
                </div>

                {/* Status Pernikahan */}
                <div className="space-y-1">
                  <label className="font-semibold text-[#1F2B1D] dark:text-[#F4EFE6]">Status Pernikahan</label>
                  <select
                    value={formData.statusPernikahan || 'Menikah'}
                    onChange={(e) => setFormData({ ...formData, statusPernikahan: e.target.value })}
                    className="w-full px-3 py-2 border border-[#243324]/15 dark:border-white/15 rounded-xl bg-transparent text-[#1F2B1D] dark:text-[#F4EFE6] focus:outline-none focus:border-[#1F2B1D] dark:focus:border-white/40 cursor-pointer"
                  >
                    <option value="Menikah" className="dark:bg-[#1a251a]">
                      Menikah
                    </option>
                    <option value="Belum Menikah" className="dark:bg-[#1a251a]">
                      Belum Menikah
                    </option>
                    <option value="Cerai Hidup" className="dark:bg-[#1a251a]">
                      Cerai Hidup
                    </option>
                    <option value="Cerai Mati" className="dark:bg-[#1a251a]">
                      Cerai Mati
                    </option>
                  </select>
                </div>

                {/* Agnia Care */}
                <div className="space-y-1">
                  <label className="font-semibold text-[#1F2B1D] dark:text-[#F4EFE6]">Peserta Agnia Care?</label>
                  <select
                    value={formData.agniaCare || 'Tidak'}
                    onChange={(e) => setFormData({ ...formData, agniaCare: e.target.value })}
                    className="w-full px-3 py-2 border border-[#243324]/15 dark:border-white/15 rounded-xl bg-transparent text-[#1F2B1D] dark:text-[#F4EFE6] focus:outline-none focus:border-[#1F2B1D] dark:focus:border-white/40 cursor-pointer"
                  >
                    <option value="Tidak" className="dark:bg-[#1a251a]">
                      Tidak
                    </option>
                    <option value="Ya" className="dark:bg-[#1a251a]">
                      Ya (Peserta)
                    </option>
                  </select>
                </div>

                {/* Anggota Koperasi */}
                <div className="space-y-1">
                  <label className="font-semibold text-[#1F2B1D] dark:text-[#F4EFE6]">Anggota Koperasi?</label>
                  <select
                    value={formData.koperasi || 'Tidak'}
                    onChange={(e) => setFormData({ ...formData, koperasi: e.target.value })}
                    className="w-full px-3 py-2 border border-[#243324]/15 dark:border-white/15 rounded-xl bg-transparent text-[#1F2B1D] dark:text-[#F4EFE6] focus:outline-none focus:border-[#1F2B1D] dark:focus:border-white/40 cursor-pointer"
                  >
                    <option value="Tidak" className="dark:bg-[#1a251a]">
                      Tidak
                    </option>
                    <option value="Ya" className="dark:bg-[#1a251a]">
                      Ya (Anggota Penuh)
                    </option>
                  </select>
                </div>

                {/* Alamat Lengkap */}
                <div className="sm:col-span-2 space-y-1">
                  <label className="font-semibold text-[#1F2B1D] dark:text-[#F4EFE6]">Alamat Lengkap</label>
                  <textarea
                    rows={2}
                    value={formData.alamat || ''}
                    onChange={(e) => setFormData({ ...formData, alamat: e.target.value })}
                    placeholder="Kp. / Desa, Kecamatan, Kab / Kota"
                    className="w-full px-3 py-2 border border-[#243324]/15 dark:border-white/15 rounded-xl bg-transparent text-[#1F2B1D] dark:text-[#F4EFE6] focus:outline-none focus:border-[#1F2B1D] dark:focus:border-white/40"
                  />
                </div>
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
                      <span>Menyimpan ke TiDB...</span>
                    </>
                  ) : (
                    <span>Simpan Jamaah</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: Edit Data Jamaah */}
      {editingJamaah && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto"
          onClick={() => !isSubmitting && setEditingJamaah(null)}
        >
          <div
            className="glass-panel rounded-3xl p-6 sm:p-7 max-w-2xl w-full my-8 space-y-5 shadow-2xl border border-white/20"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between border-b border-[#243324]/10 dark:border-white/10 pb-4">
              <div>
                <h2 className="font-display text-xl text-[#1F2B1D] dark:text-[#F4EFE6] font-medium flex items-center gap-2">
                  <Pencil className="w-5 h-5 text-amber-500" /> Edit Data Jamaah
                </h2>
                <p className="text-xs text-[#657351] dark:text-[#A3B59E] mt-0.5">
                  ID: <span className="font-mono font-semibold text-[#1F2B1D] dark:text-[#F4EFE6]">{editingJamaah.id}</span>
                </p>
              </div>
              <button
                disabled={isSubmitting}
                onClick={() => setEditingJamaah(null)}
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

            <form onSubmit={handleSubmitEdit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                {/* Nama */}
                <div className="sm:col-span-2 space-y-1">
                  <label className="font-semibold text-[#1F2B1D] dark:text-[#F4EFE6]">
                    Nama Lengkap <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.nama || ''}
                    onChange={(e) => setFormData({ ...formData, nama: e.target.value })}
                    className="w-full px-3 py-2 border border-[#243324]/15 dark:border-white/15 rounded-xl bg-transparent text-[#1F2B1D] dark:text-[#F4EFE6] focus:outline-none focus:border-[#1F2B1D] dark:focus:border-white/40"
                  />
                </div>

                {/* Cabang Zawiyah */}
                <div className="space-y-1">
                  <label className="font-semibold text-[#1F2B1D] dark:text-[#F4EFE6]">Cabang Zawiyah</label>
                  <select
                    value={formData.zawiyah || ''}
                    onChange={(e) => setFormData({ ...formData, zawiyah: e.target.value })}
                    className="w-full px-3 py-2 border border-[#243324]/15 dark:border-white/15 rounded-xl bg-transparent text-[#1F2B1D] dark:text-[#F4EFE6] focus:outline-none focus:border-[#1F2B1D] dark:focus:border-white/40 cursor-pointer"
                  >
                    {uniqueZawiyah.map((z) => (
                      <option key={z} value={z} className="dark:bg-[#1a251a]">
                        {z}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Jenis Kelamin */}
                <div className="space-y-1">
                  <label className="font-semibold text-[#1F2B1D] dark:text-[#F4EFE6]">Jenis Kelamin</label>
                  <select
                    value={formData.jenisKelamin || 'Laki-laki'}
                    onChange={(e) => setFormData({ ...formData, jenisKelamin: e.target.value })}
                    className="w-full px-3 py-2 border border-[#243324]/15 dark:border-white/15 rounded-xl bg-transparent text-[#1F2B1D] dark:text-[#F4EFE6] focus:outline-none focus:border-[#1F2B1D] dark:focus:border-white/40 cursor-pointer"
                  >
                    <option value="Laki-laki" className="dark:bg-[#1a251a]">
                      Laki-laki
                    </option>
                    <option value="Perempuan" className="dark:bg-[#1a251a]">
                      Perempuan
                    </option>
                  </select>
                </div>

                {/* Telepon */}
                <div className="space-y-1">
                  <label className="font-semibold text-[#1F2B1D] dark:text-[#F4EFE6]">No. Telepon</label>
                  <input
                    type="text"
                    value={formData.telepon || ''}
                    onChange={(e) => setFormData({ ...formData, telepon: e.target.value })}
                    className="w-full px-3 py-2 border border-[#243324]/15 dark:border-white/15 rounded-xl bg-transparent text-[#1F2B1D] dark:text-[#F4EFE6] focus:outline-none focus:border-[#1F2B1D] dark:focus:border-white/40"
                  />
                </div>

                {/* Email */}
                <div className="space-y-1">
                  <label className="font-semibold text-[#1F2B1D] dark:text-[#F4EFE6]">Email</label>
                  <input
                    type="email"
                    value={formData.email || ''}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-3 py-2 border border-[#243324]/15 dark:border-white/15 rounded-xl bg-transparent text-[#1F2B1D] dark:text-[#F4EFE6] focus:outline-none focus:border-[#1F2B1D] dark:focus:border-white/40"
                  />
                </div>

                {/* Pekerjaan */}
                <div className="space-y-1">
                  <label className="font-semibold text-[#1F2B1D] dark:text-[#F4EFE6]">Pekerjaan</label>
                  <input
                    type="text"
                    value={formData.pekerjaan || ''}
                    onChange={(e) => setFormData({ ...formData, pekerjaan: e.target.value })}
                    className="w-full px-3 py-2 border border-[#243324]/15 dark:border-white/15 rounded-xl bg-transparent text-[#1F2B1D] dark:text-[#F4EFE6] focus:outline-none focus:border-[#1F2B1D] dark:focus:border-white/40"
                  />
                </div>

                {/* Status Keaktifan */}
                <div className="space-y-1">
                  <label className="font-semibold text-[#1F2B1D] dark:text-[#F4EFE6]">Status Jamaah</label>
                  <select
                    value={formData.status || 'Aktif'}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="w-full px-3 py-2 border border-[#243324]/15 dark:border-white/15 rounded-xl bg-transparent text-[#1F2B1D] dark:text-[#F4EFE6] focus:outline-none focus:border-[#1F2B1D] dark:focus:border-white/40 cursor-pointer"
                  >
                    <option value="Aktif" className="dark:bg-[#1a251a]">
                      Aktif
                    </option>
                    <option value="Nonaktif" className="dark:bg-[#1a251a]">
                      Nonaktif
                    </option>
                  </select>
                </div>

                {/* Agnia Care */}
                <div className="space-y-1">
                  <label className="font-semibold text-[#1F2B1D] dark:text-[#F4EFE6]">Peserta Agnia Care</label>
                  <select
                    value={formData.agniaCare || 'Tidak'}
                    onChange={(e) => setFormData({ ...formData, agniaCare: e.target.value })}
                    className="w-full px-3 py-2 border border-[#243324]/15 dark:border-white/15 rounded-xl bg-transparent text-[#1F2B1D] dark:text-[#F4EFE6] focus:outline-none focus:border-[#1F2B1D] dark:focus:border-white/40 cursor-pointer"
                  >
                    <option value="Tidak" className="dark:bg-[#1a251a]">
                      Tidak
                    </option>
                    <option value="Ya" className="dark:bg-[#1a251a]">
                      Ya
                    </option>
                  </select>
                </div>

                {/* Koperasi */}
                <div className="space-y-1">
                  <label className="font-semibold text-[#1F2B1D] dark:text-[#F4EFE6]">Anggota Koperasi</label>
                  <select
                    value={formData.koperasi || 'Tidak'}
                    onChange={(e) => setFormData({ ...formData, koperasi: e.target.value })}
                    className="w-full px-3 py-2 border border-[#243324]/15 dark:border-white/15 rounded-xl bg-transparent text-[#1F2B1D] dark:text-[#F4EFE6] focus:outline-none focus:border-[#1F2B1D] dark:focus:border-white/40 cursor-pointer"
                  >
                    <option value="Tidak" className="dark:bg-[#1a251a]">
                      Tidak
                    </option>
                    <option value="Ya" className="dark:bg-[#1a251a]">
                      Ya
                    </option>
                  </select>
                </div>

                {/* Alamat */}
                <div className="sm:col-span-2 space-y-1">
                  <label className="font-semibold text-[#1F2B1D] dark:text-[#F4EFE6]">Alamat Lengkap</label>
                  <textarea
                    rows={2}
                    value={formData.alamat || ''}
                    onChange={(e) => setFormData({ ...formData, alamat: e.target.value })}
                    className="w-full px-3 py-2 border border-[#243324]/15 dark:border-white/15 rounded-xl bg-transparent text-[#1F2B1D] dark:text-[#F4EFE6] focus:outline-none focus:border-[#1F2B1D] dark:focus:border-white/40"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-4 border-t border-[#243324]/10 dark:border-white/10">
                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={() => setEditingJamaah(null)}
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
                      <span>Menyimpan Perubahan...</span>
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

      {/* MODAL: Konfirmasi Hapus Data */}
      {deletingJamaah && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          onClick={() => !isSubmitting && setDeletingJamaah(null)}
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
                  Hapus Data Jamaah
                </h3>
                <p className="text-xs text-[#657351] dark:text-[#A3B59E]">
                  {deletingJamaah.nama} ({deletingJamaah.id})
                </p>
              </div>
            </div>

            <p className="text-xs text-[#657351] dark:text-[#CBD7C7] leading-relaxed">
              Pilih tindakan yang diinginkan. Anda disarankan memilih{' '}
              <strong className="text-[#1F2B1D] dark:text-[#F4EFE6]">Nonaktifkan</strong> agar riwayat keanggotaan
              dan statistik tetap aman.
            </p>

            {errorMessage && (
              <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/50 flex items-center gap-2 text-rose-700 dark:text-rose-300 text-xs">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            <div className="flex flex-col gap-2 pt-2">
              <button
                type="button"
                disabled={isSubmitting}
                onClick={() => handleSubmitDelete(false)}
                className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-semibold shadow-sm transition-all active:scale-98 disabled:opacity-50"
              >
                {isSubmitting ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <span>Nonaktifkan Jamaah (Disarankan)</span>
                )}
              </button>

              <button
                type="button"
                disabled={isSubmitting}
                onClick={() => handleSubmitDelete(true)}
                className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl border border-rose-300 dark:border-rose-800 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-xs font-semibold transition-all active:scale-98 disabled:opacity-50"
              >
                {isSubmitting ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <span>Hapus Permanen dari Database</span>
                )}
              </button>

              <button
                type="button"
                disabled={isSubmitting}
                onClick={() => setDeletingJamaah(null)}
                className="w-full py-2 text-center text-xs text-[#657351] dark:text-[#A3B59E] hover:text-[#1F2B1D] dark:hover:text-[#F4EFE6] transition-colors"
              >
                Batal
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: Detail View Jamaah */}
      {selected && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          onClick={() => setSelected(null)}
        >
          <div
            className="glass-panel rounded-3xl p-6 sm:p-7 max-w-lg w-full space-y-5 shadow-2xl border border-white/20"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between">
              <div>
                <h2 className="font-display text-xl text-[#1F2B1D] dark:text-[#F4EFE6] font-medium">
                  {selected.nama}
                </h2>
                <p className="text-xs font-mono text-[#657351] dark:text-[#A3B59E] mt-0.5">{selected.id}</p>
              </div>
              <button
                onClick={() => setSelected(null)}
                className="p-1.5 rounded-xl hover:bg-[#243324]/8 dark:hover:bg-white/8 transition-colors"
              >
                <X className="w-4 h-4 text-[#657351] dark:text-[#A3B59E]" />
              </button>
            </div>

            <div className="flex flex-wrap gap-2">
              <span
                className={`px-3 py-1 rounded-full text-xs font-semibold ${
                  selected.jenisKelamin === 'Laki-laki'
                    ? 'bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300'
                    : 'bg-pink-50 text-pink-700 dark:bg-pink-950 dark:text-pink-300'
                }`}
              >
                {selected.jenisKelamin}
              </span>
              <span
                className={`px-3 py-1 rounded-full text-xs font-semibold ${
                  selected.status === 'Aktif'
                    ? 'bg-[#e6f4ea] text-[#006948] dark:bg-[#1F3D2A] dark:text-[#68DBA9]'
                    : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'
                }`}
              >
                {selected.status}
              </span>
              {selected.agniaCare === 'Ya' && (
                <span className="flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 dark:bg-rose-950 dark:text-rose-300">
                  <Heart className="w-3 h-3 fill-current" /> Agnia Care
                </span>
              )}
              {selected.koperasi === 'Ya' && (
                <span className="flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-300">
                  <Wallet className="w-3 h-3" /> Koperasi
                </span>
              )}
            </div>

            <div className="grid grid-cols-2 gap-3 text-sm">
              {[
                { label: 'Zawiyah', value: selected.zawiyah },
                { label: 'Pekerjaan', value: selected.pekerjaan },
                { label: 'Status Nikah', value: selected.statusPernikahan },
                { label: 'Tgl Lahir', value: selected.tanggalLahir || '—' },
                { label: 'Telepon', value: selected.telepon || '—' },
                { label: 'Email', value: selected.email || '—' },
              ].map((item) => (
                <div key={item.label} className="space-y-0.5">
                  <p className="text-[10px] text-[#657351] dark:text-[#A3B59E] uppercase tracking-wider font-semibold">
                    {item.label}
                  </p>
                  <p className="text-[#243324] dark:text-[#F4EFE6] text-xs leading-relaxed">{item.value}</p>
                </div>
              ))}
            </div>

            {selected.alamat && (
              <div className="p-3 rounded-xl bg-[#243324]/5 dark:bg-white/5 space-y-0.5">
                <p className="text-[10px] text-[#657351] dark:text-[#A3B59E] uppercase tracking-wider font-semibold">
                  Alamat
                </p>
                <p className="text-xs text-[#243324] dark:text-[#F4EFE6] leading-relaxed">{selected.alamat}</p>
              </div>
            )}

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#243324]/10 dark:border-white/10">
              <button
                onClick={() => {
                  const target = selected;
                  setSelected(null);
                  handleOpenEdit(target);
                }}
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl border border-amber-300 dark:border-amber-700 text-amber-700 dark:text-amber-400 text-xs font-medium hover:bg-amber-50 dark:hover:bg-amber-950/40 transition-colors"
              >
                <Pencil className="w-3.5 h-3.5" /> Edit Data
              </button>
              <button
                onClick={() => {
                  const target = selected;
                  setSelected(null);
                  handleOpenDelete(target);
                }}
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl border border-rose-300 dark:border-rose-700 text-rose-700 dark:text-rose-400 text-xs font-medium hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" /> Hapus
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
