import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import Modal from '../components/Modal';
import Toast from '../components/Toast';
import {
  Search, Plus, MoreVertical, X,
  ChevronLeft, ChevronRight,
  Eye, Edit3, Copy, Trash2, FileText,
} from 'lucide-react';

const StatusBadge = ({ status }) => {
  const config = {
    draft:      'bg-gray-400/12 text-gray-600 border border-gray-400/18 backdrop-blur-sm',
    published:  'bg-emerald-400/12 text-emerald-700 border border-emerald-400/22 backdrop-blur-sm',
    archived:   'bg-amber-400/12 text-amber-700 border border-amber-400/22 backdrop-blur-sm',
  };
  const labels = { draft: 'Draft', published: 'Published', archived: 'Arsip' };
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium ${config[status] || config.draft}`}>
      {labels[status] || status}
    </span>
  );
};

const CustomPages = () => {
  const navigate = useNavigate();

  // ── State ──────────────────────────────────────────────────────────────────
  const [pages, setPages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [pageToDelete, setPageToDelete] = useState(null);
  const [toast, setToast] = useState(null);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, pages: 1 });
  const [debouncedSearch, setDebouncedSearch] = useState('');

  // Floating pill
  const [pillExpanded, setPillExpanded] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const searchRef = useRef(null);

  // ── Effects ────────────────────────────────────────────────────────────────
  useEffect(() => { fetchPages(); }, [pagination.page, debouncedSearch, statusFilter]);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchQuery);
      setPagination(p => ({ ...p, page: 1 }));
    }, 500);
    return () => clearTimeout(handler);
  }, [searchQuery]);

  useEffect(() => {
    if (showSearch && searchRef.current) searchRef.current.focus();
  }, [showSearch]);

  // ── Data ───────────────────────────────────────────────────────────────────
  const fetchPages = async () => {
    try {
      setLoading(true);
      const params = {
        page: pagination.page,
        limit: pagination.limit,
        ...(debouncedSearch && { search: debouncedSearch }),
        ...(statusFilter && { status: statusFilter }),
      };
      const response = await api.get('/api/custom-pages', { params });
      setPages(response.data.data.pages);
      setPagination(p => ({ ...p, ...response.data.data.pagination }));
    } catch (error) {
      showToast(error.response?.data?.message || 'Gagal memuat halaman custom', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDuplicate = async (pageId) => {
    try {
      await api.post(`/api/custom-pages/${pageId}/duplicate`);
      showToast('Halaman berhasil diduplikasi', 'success');
      fetchPages();
    } catch (error) {
      showToast(error.response?.data?.message || 'Gagal menduplikasi halaman', 'error');
    }
  };

  const handleDelete = async () => {
    try {
      await api.delete(`/api/custom-pages/${pageToDelete._id}`);
      showToast('Halaman berhasil dihapus', 'success');
      setShowDeleteModal(false);
      setPageToDelete(null);
      fetchPages();
    } catch (error) {
      showToast(error.response?.data?.message || 'Gagal menghapus halaman', 'error');
    }
  };

  const openDeleteModal = (page) => { setPageToDelete(page); setShowDeleteModal(true); };
  const showToast = (message, type = 'success') => setToast({ message, type });

  const formatDate = (dateString) =>
    new Date(dateString).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });

  const handleViewPage = (page) => {
    if (page.status === 'published') {
      window.open(`/page/${page.slug}`, '_blank');
    } else {
      showToast('Hanya halaman yang dipublikasikan yang bisa dilihat', 'warning');
    }
  };

  const clearFilters = () => {
    setSearchQuery('');
    setStatusFilter('');
    setPagination(p => ({ ...p, page: 1 }));
  };

  const hasActiveFilter = !!(searchQuery || statusFilter);

  // Pagination page numbers with ellipsis
  const pageNumbers = Array.from({ length: pagination.pages }, (_, i) => i + 1)
    .filter(p => p === 1 || p === pagination.pages || Math.abs(p - pagination.page) <= 1)
    .reduce((acc, p, idx, arr) => {
      if (idx > 0 && p - arr[idx - 1] > 1) acc.push('...');
      acc.push(p);
      return acc;
    }, []);

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="flex flex-col h-full">

      {/* ── Blue header ──────────────────────────────────────────────────────── */}
      <div className="bg-blue-600 text-white px-6 lg:px-8 py-4 flex items-center justify-between flex-shrink-0">
        <div>
          <h1 className="text-xl font-bold leading-tight">Halaman Kustom</h1>
          <p className="text-sm text-blue-200 leading-tight mt-0.5">Buat dan kelola halaman konten website</p>
        </div>
        <button
          onClick={() => navigate('/admin/custom-pages/create')}
          className="flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-white/20 backdrop-blur-sm border border-white/40 text-white text-sm font-medium hover:bg-white/28 transition-all"
        >
          <Plus size={15} />
          <span>Buat Halaman</span>
        </button>
      </div>

      {/* ── Content area ─────────────────────────────────────────────────────── */}
      <div className="flex-1 overflow-hidden bg-gradient-to-br from-slate-100 via-blue-50/40 to-slate-100 relative p-3 lg:p-4">

        {/* Glass scrollable panel */}
        <div className="h-full bg-white/55 backdrop-blur-2xl rounded-2xl border border-white/75 shadow-[0_4px_32px_rgba(0,0,0,0.08),inset_0_1px_0_rgba(255,255,255,0.9),inset_0_-1px_0_rgba(0,0,0,0.03)] overflow-y-auto">

          {/* Active filter chips */}
          {hasActiveFilter && (
            <div className="flex flex-wrap items-center gap-2 px-4 pt-4 pr-14">
              {searchQuery && (
                <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-blue-50/80 border border-blue-200/60 text-xs text-blue-700 font-medium">
                  Cari: "{searchQuery}"
                  <button onClick={() => setSearchQuery('')} className="text-blue-400 hover:text-blue-600">
                    <X size={11} />
                  </button>
                </span>
              )}
              {statusFilter && (
                <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-purple-50/80 border border-purple-200/60 text-xs text-purple-700 font-medium">
                  Status: {statusFilter}
                  <button
                    onClick={() => { setStatusFilter(''); setPagination(p => ({ ...p, page: 1 })); }}
                    className="text-purple-400 hover:text-purple-600"
                  >
                    <X size={11} />
                  </button>
                </span>
              )}
              <button onClick={clearFilters} className="text-xs text-gray-400 hover:text-gray-600 transition-colors">
                Hapus semua
              </button>
            </div>
          )}

          {/* ── Loading ── */}
          {loading ? (
            <div className="flex items-center justify-center h-48">
              <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
            </div>

          /* ── Empty state ── */
          ) : pages.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center px-6">
              <div className="w-16 h-16 rounded-2xl bg-blue-400/10 border border-blue-400/20 flex items-center justify-center mb-4">
                <FileText size={28} className="text-blue-500/60" />
              </div>
              <p className="text-gray-500 font-medium">
                {hasActiveFilter ? 'Tidak ada halaman yang sesuai filter' : 'Belum ada halaman custom'}
              </p>
              <p className="text-sm text-gray-400 mt-1">
                {hasActiveFilter
                  ? 'Coba ubah atau hapus filter yang aktif'
                  : 'Buat halaman pertama dengan tombol di atas'}
              </p>
              {hasActiveFilter && (
                <button
                  onClick={clearFilters}
                  className="mt-4 px-4 py-1.5 text-sm rounded-xl bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors"
                >
                  Hapus Filter
                </button>
              )}
            </div>

          /* ── Page cards ── */
          ) : (
            <div className={`p-3 lg:p-4 space-y-2 ${pagination.pages > 1 ? 'pb-24' : 'pb-16'}`}>
              {pages.map((page) => (
                <div
                  key={page._id}
                  className="group relative bg-white/70 backdrop-blur-sm rounded-xl border border-white/70 hover:border-white/95 hover:shadow-[0_4px_20px_rgba(0,0,0,0.09),inset_0_1px_0_rgba(255,255,255,0.95)] p-4 transition-all duration-200 shadow-[0_1px_8px_rgba(0,0,0,0.06),inset_0_1px_0_rgba(255,255,255,0.85)]"
                >
                  <div className="flex items-start justify-between gap-3">

                    {/* Icon + info */}
                    <div className="flex items-start gap-3 min-w-0 flex-1">
                      <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-blue-400/10 border border-blue-400/20 flex items-center justify-center">
                        <FileText size={17} className="text-blue-600/70" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-sm font-semibold text-gray-900 truncate">{page.title}</span>
                          <StatusBadge status={page.status} />
                        </div>
                        <p className="text-xs text-gray-400 font-mono mt-0.5">/{page.slug}</p>
                        {page.description && (
                          <p className="text-xs text-gray-500 mt-1 line-clamp-1">{page.description}</p>
                        )}
                        <p className="text-xs text-gray-400 mt-1.5">
                          {formatDate(page.createdAt)}
                          {page.createdBy && (
                            <span> · <span className="text-gray-500">{page.createdBy.name}</span></span>
                          )}
                        </p>
                      </div>
                    </div>

                    {/* Action buttons — reveal on hover */}
                    <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                      <button
                        onClick={() => handleViewPage(page)}
                        title="Lihat halaman"
                        className={`p-1.5 rounded-lg transition-colors ${
                          page.status === 'published'
                            ? 'text-blue-500 hover:bg-blue-400/12'
                            : 'text-gray-400 hover:bg-black/[0.05]'
                        }`}
                      >
                        <Eye size={15} />
                      </button>
                      <button
                        onClick={() => navigate(`/admin/custom-pages/${page._id}/edit`)}
                        title="Edit halaman"
                        className="p-1.5 rounded-lg text-emerald-600 hover:bg-emerald-400/12 transition-colors"
                      >
                        <Edit3 size={15} />
                      </button>
                      <button
                        onClick={() => handleDuplicate(page._id)}
                        title="Duplikasi halaman"
                        className="p-1.5 rounded-lg text-purple-500 hover:bg-purple-400/12 transition-colors"
                      >
                        <Copy size={15} />
                      </button>
                      <button
                        onClick={() => openDeleteModal(page)}
                        title="Hapus halaman"
                        className="p-1.5 rounded-lg text-red-500 hover:bg-red-400/12 transition-colors"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>

                  </div>
                </div>
              ))}
            </div>
          )}

          {/* ── Floating ⋮ pill — sticky inside scroll container ─────────────── */}
          <div className="sticky bottom-0 z-20 h-0 overflow-visible pointer-events-none px-4 pb-4">
            <div className="pointer-events-auto flex justify-end items-end translate-y-[-44px]">
              {pillExpanded ? (
                <div className="flex items-center gap-2 bg-gradient-to-b from-white/55 to-white/35 backdrop-blur-2xl border border-white/70 rounded-2xl px-3 py-2 shadow-[0_8px_32px_rgba(0,0,0,0.12),0_2px_8px_rgba(0,0,0,0.06),inset_0_1px_0_rgba(255,255,255,0.85),inset_0_-1px_0_rgba(0,0,0,0.04)]">

                  {/* Search input */}
                  {showSearch && (
                    <input
                      ref={searchRef}
                      type="text"
                      value={searchQuery}
                      onChange={e => setSearchQuery(e.target.value)}
                      placeholder="Cari halaman..."
                      className="w-44 px-2.5 py-1 text-xs rounded-xl bg-black/[0.05] border border-black/10 text-gray-700 placeholder-gray-400/60 focus:outline-none focus:ring-1 focus:ring-blue-400/40"
                    />
                  )}

                  {/* Search toggle */}
                  <button
                    onClick={() => setShowSearch(v => !v)}
                    title="Cari"
                    className={`p-1.5 rounded-xl transition-all ${
                      showSearch
                        ? 'bg-blue-500/15 text-blue-600'
                        : 'text-gray-500/70 hover:text-gray-700 hover:bg-black/[0.05]'
                    }`}
                  >
                    <Search size={15} />
                  </button>

                  <div className="w-px h-5 bg-black/[0.08]" />

                  {/* Status filter segmented */}
                  <div className="flex items-center gap-0.5 bg-black/[0.05] rounded-xl p-0.5">
                    {[
                      { v: '', l: 'Semua' },
                      { v: 'published', l: 'Published' },
                      { v: 'draft', l: 'Draft' },
                      { v: 'archived', l: 'Arsip' },
                    ].map(opt => (
                      <button
                        key={opt.v}
                        onClick={() => { setStatusFilter(opt.v); setPagination(p => ({ ...p, page: 1 })); }}
                        className={`px-2 py-1 rounded-lg text-[11px] font-medium transition-all duration-150 ${
                          statusFilter === opt.v
                            ? 'bg-white/90 shadow-sm text-gray-800'
                            : 'text-gray-500/80 hover:text-gray-700'
                        }`}
                      >
                        {opt.l}
                      </button>
                    ))}
                  </div>

                  <div className="w-px h-5 bg-black/[0.08]" />

                  {/* Create */}
                  <button
                    onClick={() => navigate('/admin/custom-pages/create')}
                    title="Buat halaman baru"
                    className="p-1.5 rounded-xl text-blue-600 hover:bg-blue-400/15 transition-colors"
                  >
                    <Plus size={15} />
                  </button>

                  {/* Close */}
                  <button
                    onClick={() => { setPillExpanded(false); setShowSearch(false); }}
                    className="p-1.5 rounded-xl text-gray-400 hover:text-gray-600 hover:bg-black/[0.05] transition-colors"
                  >
                    <X size={15} />
                  </button>

                </div>
              ) : (
                <button
                  onClick={() => setPillExpanded(true)}
                  className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 shadow-[0_4px_16px_rgba(59,130,246,0.45),0_1px_4px_rgba(0,0,0,0.12),inset_0_1px_0_rgba(255,255,255,0.2)] text-white flex items-center justify-center hover:scale-105 active:scale-95 transition-transform"
                >
                  <MoreVertical size={16} />
                </button>
              )}
            </div>
          </div>

        </div>{/* end glass panel */}

        {/* ── Floating glass pagination ─────────────────────────────────────── */}
        {pagination.pages > 1 && (
          <div className="absolute bottom-5 left-5 right-5 lg:bottom-6 lg:left-6 lg:right-6 z-20 bg-gradient-to-b from-white/60 to-white/40 backdrop-blur-2xl border border-white/70 shadow-[0_8px_32px_rgba(0,0,0,0.10),0_2px_8px_rgba(0,0,0,0.06),inset_0_1px_0_rgba(255,255,255,0.85),inset_0_-1px_0_rgba(0,0,0,0.04)] rounded-2xl px-5 py-2.5 flex items-center justify-between">
            <p className="text-sm text-gray-500/80">
              Halaman{' '}
              <span className="font-semibold text-gray-800">{pagination.page}</span>
              {' '}dari{' '}
              <span className="font-semibold text-gray-800">{pagination.pages}</span>
              {pagination.total > 0 && (
                <span className="text-xs text-gray-400/70 ml-2">({pagination.total} halaman)</span>
              )}
            </p>

            <div className="flex items-center gap-1">
              <button
                onClick={() => setPagination(p => ({ ...p, page: p.page - 1 }))}
                disabled={pagination.page <= 1}
                className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium bg-black/[0.05] border border-black/10 rounded-xl disabled:opacity-30 hover:bg-black/[0.09] text-gray-600 transition-all"
              >
                <ChevronLeft size={13} /> Prev
              </button>

              {pageNumbers.map((p, i) =>
                p === '...' ? (
                  <span key={`dots-${i}`} className="w-8 h-8 text-xs text-gray-400/60 flex items-center justify-center">…</span>
                ) : (
                  <button
                    key={p}
                    onClick={() => setPagination(prev => ({ ...prev, page: p }))}
                    className={`w-8 h-8 text-xs font-medium rounded-xl transition-all ${
                      pagination.page === p
                        ? 'bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-[0_2px_8px_rgba(59,130,246,0.45),inset_0_1px_0_rgba(255,255,255,0.2)]'
                        : 'bg-black/[0.05] border border-black/10 text-gray-600 hover:bg-black/[0.09]'
                    }`}
                  >
                    {p}
                  </button>
                )
              )}

              <button
                onClick={() => setPagination(p => ({ ...p, page: p.page + 1 }))}
                disabled={pagination.page >= pagination.pages}
                className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium bg-black/[0.05] border border-black/10 rounded-xl disabled:opacity-30 hover:bg-black/[0.09] text-gray-600 transition-all"
              >
                Next <ChevronRight size={13} />
              </button>
            </div>
          </div>
        )}

      </div>{/* end content area */}

      {/* ── Delete modal ─────────────────────────────────────────────────────── */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => { setShowDeleteModal(false); setPageToDelete(null); }}
        title="Konfirmasi Hapus"
        size="sm"
      >
        <div className="space-y-4">
          <p className="text-gray-600">
            Apakah Anda yakin ingin menghapus halaman{' '}
            <span className="font-semibold">"{pageToDelete?.title}"</span>?
          </p>
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
            <p className="text-sm text-yellow-800">
              <span className="font-semibold">Perhatian:</span> Halaman akan dihapus secara permanen dan tidak dapat dikembalikan.
            </p>
          </div>
          <div className="flex gap-3 pt-4">
            <button
              onClick={() => { setShowDeleteModal(false); setPageToDelete(null); }}
              className="flex-1 px-4 py-2 text-sm font-medium rounded-xl bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors"
            >
              Batal
            </button>
            <button
              onClick={handleDelete}
              className="flex-1 px-4 py-2 text-sm font-medium rounded-xl bg-red-500 text-white hover:bg-red-600 transition-colors"
            >
              Hapus
            </button>
          </div>
        </div>
      </Modal>

      {/* ── Toast ────────────────────────────────────────────────────────────── */}
      {toast && (
        <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />
      )}

    </div>
  );
};

export default CustomPages;
