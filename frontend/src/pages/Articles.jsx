import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import api from '../utils/api';
import useAuthStore from '../store/authStore';
import Modal from '../components/Modal';
import Toast from '../components/Toast';
import ImageUpload from '../components/ImageUpload';
import {
  Search, SlidersHorizontal, Plus, MoreVertical, MoreHorizontal, X,
  Eye, Edit3, Trash2, Check, CheckSquare, FileText,
  ThumbsUp, ThumbsDown, EyeOff, Send, ChevronLeft, ChevronRight,
} from 'lucide-react';

const Articles = ({ embedded = false, externalPage = 1, onPageChange, onPaginationChange }) => {
  const { user } = useAuthStore();
  const isAdmin = user?.role === 'administrator';

  const [articles, setArticles] = useState([]);
  const [categories, setCategories] = useState([]);
  const [jurusans, setJurusans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 9,
    total: 0,
    pages: 1,
  });

  const [activeViewTab, setActiveViewTab] = useState('articles');

  // Filters
  const [filters, setFilters] = useState({
    search: '',
    timeRange: '',
    categoryJurusan: [],
    categoryTopik: [],
    status: [],
  });

  const [showFilterDropdown, setShowFilterDropdown] = useState(false);
  const [debouncedSearch, setDebouncedSearch] = useState('');

  // Modals
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [showInternalLinkModal, setShowInternalLinkModal] = useState(false);
  const [selectedArticle, setSelectedArticle] = useState(null);

  // Internal linking
  const [internalLinkSearch, setInternalLinkSearch] = useState('');
  const [internalLinkSuggestions, setInternalLinkSuggestions] = useState([]);

  // Form data
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    excerpt: '',
    metaDescription: '',
    keywords: [],
    altText: '',
    faqs: [],
    categoryJurusan: '',
    categoryTopik: '',
    featuredImage: '',
    status: 'draft',
    metadata: { rank: '', level: '', studentName: '' },
  });

  const [toast, setToast] = useState(null);
  const [articleMenu, setArticleMenu] = useState(null); // { article, top, right }

  const openMenuFor = (e, article) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setArticleMenu(prev => prev?.article._id === article._id ? null : { article, top: rect.bottom + 4, right: window.innerWidth - rect.right });
  };
  const [showSearch, setShowSearch] = useState(false);
  const [showActions, setShowActions] = useState(false);

  // Bulk delete
  const [selectedArticles, setSelectedArticles] = useState([]);
  const [showBulkDeleteModal, setShowBulkDeleteModal] = useState(false);
  const [isSelectMode, setIsSelectMode] = useState(false);

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      day: 'numeric', month: 'short', year: 'numeric',
    });
  };

  const toggleArrayFilter = (filterKey, value) => {
    setFilters(prev => {
      const cur = prev[filterKey];
      return {
        ...prev,
        [filterKey]: cur.includes(value) ? cur.filter(v => v !== value) : [...cur, value],
      };
    });
  };

  const getActiveFiltersCount = () => {
    let c = 0;
    if (filters.search) c++;
    if (filters.timeRange) c++;
    c += filters.categoryJurusan.length + filters.categoryTopik.length + filters.status.length;
    return c;
  };

  const clearAllFilters = () => {
    setFilters({ search: '', timeRange: '', categoryJurusan: [], categoryTopik: [], status: [] });
    setDebouncedSearch('');
  };

  useEffect(() => {
    fetchArticles();
    fetchCategories();
    fetchJurusans();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pagination.page, externalPage, debouncedSearch, filters.timeRange, filters.categoryJurusan, filters.categoryTopik, filters.status]);

  useEffect(() => {
    const handler = setTimeout(() => setDebouncedSearch(filters.search), 500);
    return () => clearTimeout(handler);
  }, [filters.search]);

  useEffect(() => {
    const handler = setTimeout(() => searchInternalLinks(internalLinkSearch), 300);
    return () => clearTimeout(handler);
  }, [internalLinkSearch]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (e.target.closest('.filter-dropdown-container')) return;
      setArticleMenu(null);
      setShowFilterDropdown(false);
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  const fetchArticles = async () => {
    try {
      setLoading(true);
      const currentPage = embedded ? externalPage : pagination.page;
      const params = {
        page: currentPage,
        limit: pagination.limit,
        ...(debouncedSearch && { search: debouncedSearch }),
        ...(filters.categoryJurusan.length > 0 && { categoryJurusan: filters.categoryJurusan.join(',') }),
        ...(filters.categoryTopik.length > 0 && { categoryTopik: filters.categoryTopik.join(',') }),
        ...(filters.timeRange && { timeRange: filters.timeRange }),
        ...(filters.status.length > 0 && { status: filters.status.join(',') }),
      };
      const response = await api.get('/api/articles', { params });
      setArticles(response.data.data.articles);
      if (embedded) {
        // Only emit to parent — don't update internal pagination.page to avoid re-fetch loop
        if (onPaginationChange) {
          const { pages, total } = response.data.data.pagination;
          onPaginationChange({ pages, total });
        }
      } else {
        setPagination(prev => ({ ...prev, ...response.data.data.pagination }));
      }
    } catch (error) {
      showToast(error.response?.data?.message || 'Gagal memuat artikel', 'error');
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await api.get('/api/categories');
      setCategories(response.data.data.categories || []);
    } catch (error) {
      console.error('Failed to fetch categories:', error);
    }
  };

  const fetchJurusans = async () => {
    try {
      const response = await api.get('/api/jurusan');
      setJurusans(response.data.data.jurusans || []);
    } catch (error) {
      console.error('Failed to fetch jurusans:', error);
    }
  };

  const handleCreateArticle = async (e) => {
    e.preventDefault();
    try {
      await api.post('/api/articles', {
        title: formData.title,
        content: formData.content,
        excerpt: formData.excerpt,
        metaDescription: formData.metaDescription,
        keywords: formData.keywords,
        altText: formData.altText,
        faqs: formData.faqs.filter(f => f.question && f.answer),
        categoryJurusan: formData.categoryJurusan || null,
        categoryTopik: formData.categoryTopik || null,
        featuredImage: formData.featuredImage || null,
        status: formData.status,
        metadata: formData.metadata,
      });
      showToast('Artikel berhasil dibuat', 'success');
      setShowCreateModal(false);
      resetForm();
      fetchArticles();
    } catch (error) {
      showToast(error.response?.data?.message || 'Gagal membuat artikel', 'error');
    }
  };

  const handleUpdateArticle = async (e) => {
    e.preventDefault();
    try {
      await api.put(`/api/articles/${selectedArticle._id}`, {
        title: formData.title,
        content: formData.content,
        excerpt: formData.excerpt,
        metaDescription: formData.metaDescription,
        keywords: formData.keywords,
        altText: formData.altText,
        faqs: formData.faqs.filter(f => f.question && f.answer),
        categoryJurusan: formData.categoryJurusan || null,
        categoryTopik: formData.categoryTopik || null,
        featuredImage: formData.featuredImage || null,
        metadata: formData.metadata,
      });
      showToast('Artikel berhasil diupdate', 'success');
      setShowEditModal(false);
      resetForm();
      fetchArticles();
    } catch (error) {
      showToast(error.response?.data?.message || 'Gagal update artikel', 'error');
    }
  };

  const handleDeleteArticle = async () => {
    try {
      await api.delete(`/api/articles/${selectedArticle._id}`);
      showToast('Artikel berhasil dihapus', 'success');
      setShowDeleteModal(false);
      setSelectedArticle(null);
      fetchArticles();
    } catch (error) {
      showToast(error.response?.data?.message || 'Gagal menghapus artikel', 'error');
    }
  };

  const toggleSelectArticle = (id) => {
    setSelectedArticles(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  const toggleSelectAll = () => {
    setSelectedArticles(prev => prev.length === articles.length ? [] : articles.map(a => a._id));
  };

  const handleBulkDelete = async () => {
    try {
      await Promise.all(selectedArticles.map(id => api.delete(`/api/articles/${id}`)));
      showToast(`${selectedArticles.length} artikel berhasil dihapus`, 'success');
      setShowBulkDeleteModal(false);
      setSelectedArticles([]);
      setIsSelectMode(false);
      fetchArticles();
    } catch (error) {
      showToast(error.response?.data?.message || 'Gagal menghapus artikel', 'error');
    }
  };

  const cancelSelectMode = () => { setIsSelectMode(false); setSelectedArticles([]); };

  const handleSubmitForApproval = async (id) => {
    try { await api.patch(`/api/articles/${id}/submit`); showToast('Artikel diajukan untuk approval', 'success'); fetchArticles(); }
    catch (error) { showToast(error.response?.data?.message || 'Gagal submit', 'error'); }
  };

  const handleApproveArticle = async (id) => {
    try { await api.patch(`/api/articles/${id}/approve`); showToast('Artikel disetujui', 'success'); fetchArticles(); }
    catch (error) { showToast(error.response?.data?.message || 'Gagal approve', 'error'); }
  };

  const handleRejectArticle = async (id) => {
    try { await api.patch(`/api/articles/${id}/reject`); showToast('Artikel ditolak', 'success'); fetchArticles(); }
    catch (error) { showToast(error.response?.data?.message || 'Gagal reject', 'error'); }
  };

  const handleUnpublishArticle = async (id) => {
    try { await api.patch(`/api/articles/${id}/unpublish`); showToast('Artikel di-unpublish', 'success'); fetchArticles(); }
    catch (error) { showToast(error.response?.data?.message || 'Gagal unpublish', 'error'); }
  };

  const searchInternalLinks = async (query) => {
    if (query.length < 2) {
      setInternalLinkSuggestions([]);
      return;
    }
    try {
      const response = await api.get(`/api/articles/search/keywords?q=${encodeURIComponent(query)}`);
      setInternalLinkSuggestions(response.data.data.articles || []);
    } catch (error) {
      console.error('Error searching internal links:', error);
    }
  };

  const insertInternalLink = (article) => {
    const linkText = article.title;
    const linkUrl = `/artikel/${article.slug}`;
    const linkHTML = `<a href="${linkUrl}" target="_blank" rel="noopener noreferrer" style="color: #0d76be; text-decoration: underline;">${linkText}</a>`;
    
    // Insert link into editor at cursor position
    const currentContent = formData.content;
    const newContent = currentContent + ' ' + linkHTML;
    setFormData(f => ({ ...f, content: newContent }));
    
    showToast(`Link ke "${linkText}" berhasil ditambahkan`, 'success');
    setInternalLinkSearch('');
    setInternalLinkSuggestions([]);
  };

  const openEditModal = (article) => {
    setSelectedArticle(article);
    setFormData({
      title: article.title,
      content: article.content,
      excerpt: article.excerpt,
      metaDescription: article.metaDescription || '',
      keywords: article.keywords || [],
      altText: article.altText || '',
      faqs: article.faqs || [],
      categoryJurusan: article.categoryJurusan?._id || '',
      categoryTopik: article.categoryTopik?._id || '',
      featuredImage: article.featuredImage?.url || '',
      status: article.status,
      metadata: {
        rank: article.metadata?.rank || '',
        level: article.metadata?.level || '',
        studentName: article.metadata?.studentName || '',
      },
    });
    setShowEditModal(true);
  };

  const openPreviewModal = (article) => { setSelectedArticle(article); setShowPreviewModal(true); };
  const openDeleteModal = (article) => { setSelectedArticle(article); setShowDeleteModal(true); };

  const resetForm = () => {
    setFormData({ title: '', content: '', excerpt: '', metaDescription: '', keywords: [], altText: '', faqs: [], categoryJurusan: '', categoryTopik: '', featuredImage: '', status: 'draft', metadata: { rank: '', level: '', studentName: '' } });
    setSelectedArticle(null);
  };

  const showToast = (message, type) => setToast({ message, type });

  const getStatusBadge = (status) => {
    const config = {
      draft: 'bg-gray-400/12 text-gray-600 border border-gray-400/18 backdrop-blur-sm',
      pending: 'bg-amber-400/12 text-amber-700 border border-amber-400/22 backdrop-blur-sm',
      published: 'bg-emerald-400/12 text-emerald-700 border border-emerald-400/22 backdrop-blur-sm',
      rejected: 'bg-red-400/12 text-red-600 border border-red-400/18 backdrop-blur-sm',
    };
    const labels = { draft: 'Draft', pending: 'Pending', published: 'Published', rejected: 'Rejected' };
    return (
      <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${config[status]}`}>
        {labels[status]}
      </span>
    );
  };

  const canEdit = (article) => {
    if (isAdmin) return true;
    if (article.author._id !== user.id) return false;
    return ['draft', 'rejected'].includes(article.status);
  };

  const canDelete = (article) => {
    if (isAdmin) return true;
    if (article.author._id !== user.id) return false;
    return article.status !== 'published';
  };

  const quillModules = {
    toolbar: [
      [{ header: [1, 2, 3, false] }],
      ['bold', 'italic', 'underline', 'strike'],
      [{ list: 'ordered' }, { list: 'bullet' }],
      [{ align: [] }],
      ['link', 'image'],
      ['clean'],
    ],
  };

  // ── Article card ─────────────────────────────────────────────────────────
  const ArticleCard = ({ article }) => {
    const selected = selectedArticles.includes(article._id);
    return (
      <div
        className={`group relative bg-white/70 backdrop-blur-sm rounded-xl overflow-hidden transition-all duration-200 shadow-[0_1px_8px_rgba(0,0,0,0.06),inset_0_1px_0_rgba(255,255,255,0.85)] ${
          isSelectMode
            ? `cursor-pointer border ${selected ? 'border-blue-400/60 ring-2 ring-blue-400/20 shadow-[0_2px_16px_rgba(59,130,246,0.12),inset_0_1px_0_rgba(255,255,255,0.85)]' : 'border-white/70 hover:border-white/90'}`
            : 'border border-white/70 hover:border-white/95 hover:shadow-[0_4px_20px_rgba(0,0,0,0.09),inset_0_1px_0_rgba(255,255,255,0.9)]'
        }`}
        onClick={() => isSelectMode && toggleSelectArticle(article._id)}
      >
        {/* Select checkbox */}
        {isSelectMode && (
          <div className="absolute top-3 left-3 z-10">
            <div className={`w-5 h-5 rounded-md flex items-center justify-center border-2 backdrop-blur-sm shadow-sm ${selected ? 'bg-blue-500 border-blue-500' : 'bg-white/70 border-white/80'}`}>
              {selected && <Check size={11} className="text-white" strokeWidth={3} />}
            </div>
          </div>
        )}

        {/* Image */}
        {article.featuredImage ? (
          <div className="h-40 overflow-hidden bg-gray-100">
            <img
              src={typeof article.featuredImage === 'string' ? article.featuredImage : article.featuredImage.url}
              alt={article.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          </div>
        ) : (
          <div className="h-40 bg-black/[0.03] flex items-center justify-center">
            <FileText size={36} className="text-gray-300/60" />
          </div>
        )}

        {/* Content */}
        <div className="p-4">
          <div className="flex items-start justify-between mb-2">
            {getStatusBadge(article.status)}

            {!isSelectMode && (
              <button
                onClick={(e) => { e.stopPropagation(); openMenuFor(e, article); }}
                className="p-1 hover:bg-black/[0.06] rounded-lg transition-colors"
              >
                <MoreVertical size={15} className="text-gray-400/70" />
              </button>
            )}
          </div>

          <h3 className="text-sm font-semibold text-gray-900 line-clamp-2 mb-1 leading-snug">
            {article.title}
          </h3>

          {article.excerpt && (
            <p className="text-xs text-gray-500 line-clamp-2 mb-3 leading-relaxed">
              {article.excerpt}
            </p>
          )}

          <div className="flex items-center justify-between text-[11px] text-gray-400/80 pt-2 border-t border-black/[0.05]">
            <span className="truncate max-w-[120px]">{article.author?.name}</span>
            <span className="flex-shrink-0">{formatDate(article.createdAt)}</span>
          </div>
        </div>
      </div>
    );
  };

  // ── EMBEDDED mode (inside ArtikelPage white panel with overflow-y-auto) ──
  if (embedded) {
    const filterCount = getActiveFiltersCount();

    // Shared filter dropdown content (reused inside glass pill)
    const FilterDropdown = () => (
      <div
        className="absolute right-0 mt-2 w-72 bg-white rounded-xl shadow-xl border border-gray-200 z-50 max-h-96 overflow-y-auto filter-dropdown-container"
        onClick={e => e.stopPropagation()}
      >
        <div className="p-4">
          <div className="flex items-center justify-between mb-4 pb-3 border-b sticky top-0 bg-white z-10">
            <h3 className="font-semibold text-gray-900 text-sm">Filter Artikel</h3>
            <button onClick={() => setShowFilterDropdown(false)} className="px-3 py-1 bg-blue-600 text-white text-xs rounded-lg hover:bg-blue-700">Terapkan</button>
          </div>
          <div className="mb-4">
            <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Berdasarkan Waktu</h4>
            <div className="space-y-1">
              {[{ value: '', label: 'Semua Waktu' }, { value: 'today', label: 'Hari Ini' }, { value: 'week', label: 'Minggu Ini' }, { value: 'month', label: 'Bulan Ini' }, { value: 'year', label: 'Tahun Ini' }].map(opt => (
                <label key={opt.value} className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-2 rounded-lg">
                  <input type="radio" name="timeRange" checked={filters.timeRange === opt.value} onChange={() => setFilters(f => ({ ...f, timeRange: opt.value }))} className="w-3.5 h-3.5 text-blue-600" />
                  <span className="text-sm text-gray-700">{opt.label}</span>
                </label>
              ))}
            </div>
          </div>
          <div className="mb-4">
            <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Jurusan {filters.categoryJurusan.length > 0 && <span className="text-blue-600">({filters.categoryJurusan.length})</span>}</h4>
            <div className="space-y-1 max-h-28 overflow-y-auto">
              {jurusans.length > 0 ? jurusans.map(j => (
                <label key={j._id} className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-2 rounded-lg">
                  <input type="checkbox" checked={filters.categoryJurusan.includes(j._id)} onChange={() => toggleArrayFilter('categoryJurusan', j._id)} className="w-3.5 h-3.5 text-blue-600 rounded" />
                  <span className="text-sm text-gray-700">{j.code} - {j.name}</span>
                </label>
              )) : <p className="text-xs text-gray-400 italic px-2">Belum ada jurusan</p>}
            </div>
          </div>
          <div className="mb-4">
            <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Topik {filters.categoryTopik.length > 0 && <span className="text-blue-600">({filters.categoryTopik.length})</span>}</h4>
            <div className="space-y-1 max-h-28 overflow-y-auto">
              {categories.filter(c => c.type === 'topik').length > 0 ? categories.filter(c => c.type === 'topik').map(cat => (
                <label key={cat._id} className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-2 rounded-lg">
                  <input type="checkbox" checked={filters.categoryTopik.includes(cat._id)} onChange={() => toggleArrayFilter('categoryTopik', cat._id)} className="w-3.5 h-3.5 text-blue-600 rounded" />
                  <span className="text-sm text-gray-700">{cat.name}</span>
                </label>
              )) : <p className="text-xs text-gray-400 italic px-2">Belum ada topik</p>}
            </div>
          </div>
          <div className="mb-2">
            <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Status {filters.status.length > 0 && <span className="text-blue-600">({filters.status.length})</span>}</h4>
            <div className="space-y-1">
              {['draft', 'pending', 'published', 'rejected'].map(s => (
                <label key={s} className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-2 rounded-lg">
                  <input type="checkbox" checked={filters.status.includes(s)} onChange={() => toggleArrayFilter('status', s)} className="w-3.5 h-3.5 text-blue-600 rounded" />
                  <span className="text-sm text-gray-700 capitalize">{s}</span>
                </label>
              ))}
            </div>
          </div>
          {filterCount > 0 && (
            <div className="mt-3 pt-3 border-t sticky bottom-0 bg-white">
              <button onClick={clearAllFilters} className="w-full py-1.5 text-sm text-red-500 hover:bg-red-50 rounded-lg font-medium">Hapus Semua Filter</button>
            </div>
          )}
        </div>
      </div>
    );

    return (
      <>
        {/* ── Select mode bar (full-width sticky, only when active) ──────── */}
        {isSelectMode && (
          <div className="sticky top-0 z-20 bg-white/90 backdrop-blur-sm border-b border-gray-100 px-4 py-2 flex items-center gap-2">
            <span className="text-xs text-gray-500 whitespace-nowrap">{selectedArticles.length} dipilih</span>
            <button onClick={toggleSelectAll} className="text-xs px-2 py-1 bg-blue-50 text-blue-600 rounded-lg font-medium">
              {selectedArticles.length === articles.length ? 'Batal Semua' : 'Pilih Semua'}
            </button>
            {selectedArticles.length > 0 && (
              <button onClick={() => setShowBulkDeleteModal(true)} className="text-xs px-2 py-1 bg-red-50 text-red-600 rounded-lg font-medium">
                Hapus ({selectedArticles.length})
              </button>
            )}
            <button onClick={cancelSelectMode} className="text-xs px-2 py-1 border border-gray-200 text-gray-500 rounded-lg ml-auto">Batal</button>
          </div>
        )}

        {/* ── Floating glass action pill (h-0 sticky so it overlays cards) ── */}
        <div className="sticky top-3 z-10 h-0 overflow-visible flex justify-end pr-3 pointer-events-none">
          <div className="pointer-events-auto">
            {!showActions ? (
              /* Collapsed — vertical dots, blue glass so it's clearly a button */
              <button
                onClick={() => setShowActions(true)}
                className="bg-gradient-to-br from-blue-500 to-blue-600 backdrop-blur-xl border border-blue-400/40 shadow-[0_4px_18px_rgba(59,130,246,0.45),inset_0_1px_0_rgba(255,255,255,0.25)] rounded-2xl p-2.5 text-white transition-all duration-200 hover:shadow-[0_6px_24px_rgba(59,130,246,0.55)] hover:scale-105 active:scale-95"
                title="Aksi"
              >
                <MoreVertical size={18} />
              </button>
            ) : (
              /* Expanded — liquid Apple glass pill */
              <div className="bg-gradient-to-b from-white/55 to-white/35 backdrop-blur-2xl border border-white/70 shadow-[0_8px_32px_rgba(0,0,0,0.12),0_2px_8px_rgba(0,0,0,0.06),inset_0_1px_0_rgba(255,255,255,0.85),inset_0_-1px_0_rgba(0,0,0,0.04)] rounded-2xl px-2.5 py-2 flex items-center gap-1.5">

                {/* Search input — inline, only when toggled */}
                {showSearch && (
                  <div className="relative">
                    <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400/70 pointer-events-none" />
                    <input
                      autoFocus
                      type="text"
                      placeholder="cari judul artikel..."
                      value={filters.search}
                      onChange={(e) => setFilters(f => ({ ...f, search: e.target.value }))}
                      className="w-52 pl-7 pr-3 py-1.5 text-sm bg-black/[0.06] border border-black/10 rounded-xl focus:outline-none focus:border-blue-400/50 focus:bg-black/[0.04] placeholder-gray-400/60 text-gray-700"
                    />
                  </div>
                )}

                <div className="w-px h-4 bg-black/10" />

                {/* Search toggle */}
                <button
                  onClick={() => { setShowSearch(v => !v); if (showSearch) setFilters(f => ({ ...f, search: '' })); }}
                  className={`p-1.5 rounded-xl transition-all duration-150 ${showSearch || filters.search ? 'bg-blue-500/15 text-blue-600 shadow-[inset_0_1px_2px_rgba(0,0,0,0.08)]' : 'text-gray-500/80 hover:bg-black/[0.06] hover:text-gray-700'}`}
                  title="Cari"
                >
                  <Search size={16} />
                </button>

                {/* Filter */}
                <div className="relative filter-dropdown-container">
                  <button
                    onClick={(e) => { e.stopPropagation(); setShowFilterDropdown(v => !v); }}
                    className={`relative p-1.5 rounded-xl transition-all duration-150 ${showFilterDropdown || filterCount > 0 ? 'bg-blue-500/15 text-blue-600 shadow-[inset_0_1px_2px_rgba(0,0,0,0.08)]' : 'text-gray-500/80 hover:bg-black/[0.06] hover:text-gray-700'}`}
                    title="Filter"
                  >
                    <SlidersHorizontal size={16} />
                    {filterCount > 0 && (
                      <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-blue-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center shadow-[0_1px_4px_rgba(59,130,246,0.5)]">
                        {filterCount}
                      </span>
                    )}
                  </button>
                  {showFilterDropdown && <FilterDropdown />}
                </div>

                {/* Add article */}
                <button
                  onClick={() => setShowCreateModal(true)}
                  className="p-1.5 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 hover:from-blue-500/90 hover:to-blue-700 text-white transition-all shadow-[0_2px_8px_rgba(59,130,246,0.40),inset_0_1px_0_rgba(255,255,255,0.2)] hover:shadow-[0_3px_12px_rgba(59,130,246,0.50)]"
                  title="Buat Artikel"
                >
                  <Plus size={16} />
                </button>

                {/* Select mode */}
                {!isSelectMode && (
                  <button
                    onClick={() => setIsSelectMode(true)}
                    className="p-1.5 rounded-xl text-gray-500/80 hover:bg-black/[0.06] hover:text-gray-700 transition-all duration-150"
                    title="Pilih Multiple"
                  >
                    <CheckSquare size={16} />
                  </button>
                )}

                {/* Divider + Close */}
                <div className="w-px h-4 bg-black/10 mx-0.5" />
                <button
                  onClick={() => { setShowActions(false); setShowSearch(false); setFilters(f => ({ ...f, search: '' })); }}
                  className="p-1.5 rounded-xl text-gray-400/70 hover:bg-black/[0.06] hover:text-gray-600 transition-all duration-150"
                  title="Tutup"
                >
                  <X size={14} />
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Active filter pills */}
        {filterCount > 0 && (
          <div className="px-4 pt-3 pb-2 pr-14 flex flex-wrap gap-1.5 items-center">
            {filters.search && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-blue-50 text-blue-700 rounded-full text-xs font-medium">
                "{filters.search}"<button onClick={() => setFilters(f => ({ ...f, search: '' }))} className="ml-0.5 hover:text-blue-900">×</button>
              </span>
            )}
            {filters.timeRange && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-emerald-50 text-emerald-700 rounded-full text-xs font-medium">
                {filters.timeRange === 'today' ? 'Hari Ini' : filters.timeRange === 'week' ? 'Minggu Ini' : filters.timeRange === 'month' ? 'Bulan Ini' : 'Tahun Ini'}
                <button onClick={() => setFilters(f => ({ ...f, timeRange: '' }))} className="ml-0.5">×</button>
              </span>
            )}
            {filters.categoryJurusan.map(id => { const j = jurusans.find(x => x._id === id); return j ? <span key={id} className="inline-flex items-center gap-1 px-2.5 py-1 bg-violet-50 text-violet-700 rounded-full text-xs font-medium">{j.code}<button onClick={() => toggleArrayFilter('categoryJurusan', id)} className="ml-0.5">×</button></span> : null; })}
            {filters.categoryTopik.map(id => { const c = categories.find(x => x._id === id); return c ? <span key={id} className="inline-flex items-center gap-1 px-2.5 py-1 bg-indigo-50 text-indigo-700 rounded-full text-xs font-medium">{c.name}<button onClick={() => toggleArrayFilter('categoryTopik', id)} className="ml-0.5">×</button></span> : null; })}
            {filters.status.map(s => (
              <span key={s} className="inline-flex items-center gap-1 px-2.5 py-1 bg-amber-50 text-amber-700 rounded-full text-xs font-medium capitalize">
                {s}<button onClick={() => toggleArrayFilter('status', s)} className="ml-0.5">×</button>
              </span>
            ))}
            <button onClick={clearAllFilters} className="text-xs text-red-500 hover:text-red-700 font-medium">Hapus semua</button>
          </div>
        )}

        {/* ── Article cards ────────────────────────────────────────────── */}
        <div className="p-4 pb-24 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {loading ? (
            Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="bg-gray-100 rounded-xl h-[230px] animate-pulse" />
            ))
          ) : articles.length === 0 ? (
            <div className="col-span-3 py-16 text-center">
              <FileText size={40} className="mx-auto text-gray-200 mb-3" />
              <p className="text-sm text-gray-400">Belum ada artikel</p>
              <button onClick={() => setShowCreateModal(true)} className="mt-4 px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700">
                Buat Artikel Pertama
              </button>
            </div>
          ) : (
            articles.map(a => <ArticleCard key={a._id} article={a} />)
          )}
        </div>

        {/* Article context menu — portal to body so it's never clipped */}
        {articleMenu && createPortal(
          <>
            <div className="fixed inset-0 z-40" onClick={() => setArticleMenu(null)} />
            <div
              className="fixed z-50 w-44 bg-white/80 backdrop-blur-2xl rounded-xl shadow-[0_8px_28px_rgba(0,0,0,0.12),inset_0_1px_0_rgba(255,255,255,0.9)] border border-white/70 overflow-hidden py-1"
              style={{ top: articleMenu.top, right: articleMenu.right }}
            >
              <button onClick={() => { openPreviewModal(articleMenu.article); setArticleMenu(null); }} className="w-full px-3 py-2 text-left text-sm text-gray-700 hover:bg-black/[0.05] flex items-center gap-2.5 transition-colors">
                <Eye size={14} className="text-gray-400/70" /><span>Preview</span>
              </button>
              {canEdit(articleMenu.article) && (
                <button onClick={() => { openEditModal(articleMenu.article); setArticleMenu(null); }} className="w-full px-3 py-2 text-left text-sm text-gray-700 hover:bg-black/[0.05] flex items-center gap-2.5 transition-colors">
                  <Edit3 size={14} className="text-gray-400/70" /><span>Edit</span>
                </button>
              )}
              {!isAdmin && articleMenu.article.status === 'draft' && articleMenu.article.author._id === user.id && (
                <button onClick={() => { handleSubmitForApproval(articleMenu.article._id); setArticleMenu(null); }} className="w-full px-3 py-2 text-left text-sm text-emerald-700 hover:bg-emerald-400/10 flex items-center gap-2.5 transition-colors">
                  <Send size={14} /><span>Submit for Approval</span>
                </button>
              )}
              {isAdmin && articleMenu.article.status === 'draft' && (
                <button onClick={() => { handleApproveArticle(articleMenu.article._id); setArticleMenu(null); }} className="w-full px-3 py-2 text-left text-sm text-emerald-700 hover:bg-emerald-400/10 flex items-center gap-2.5 transition-colors">
                  <ThumbsUp size={14} /><span>Publish</span>
                </button>
              )}
              {isAdmin && articleMenu.article.status === 'pending' && (
                <>
                  <button onClick={() => { handleApproveArticle(articleMenu.article._id); setArticleMenu(null); }} className="w-full px-3 py-2 text-left text-sm text-emerald-700 hover:bg-emerald-400/10 flex items-center gap-2.5 transition-colors">
                    <ThumbsUp size={14} /><span>Approve & Publish</span>
                  </button>
                  <button onClick={() => { handleRejectArticle(articleMenu.article._id); setArticleMenu(null); }} className="w-full px-3 py-2 text-left text-sm text-red-600 hover:bg-red-400/10 flex items-center gap-2.5 transition-colors">
                    <ThumbsDown size={14} /><span>Reject</span>
                  </button>
                </>
              )}
              {isAdmin && articleMenu.article.status === 'published' && (
                <button onClick={() => { handleUnpublishArticle(articleMenu.article._id); setArticleMenu(null); }} className="w-full px-3 py-2 text-left text-sm text-amber-700 hover:bg-amber-400/10 flex items-center gap-2.5 transition-colors">
                  <EyeOff size={14} /><span>Unpublish</span>
                </button>
              )}
              {canDelete(articleMenu.article) && (
                <>
                  <div className="border-t border-black/[0.06] my-1" />
                  <button onClick={() => { openDeleteModal(articleMenu.article); setArticleMenu(null); }} className="w-full px-3 py-2 text-left text-sm text-red-600 hover:bg-red-400/10 flex items-center gap-2.5 transition-colors">
                    <Trash2 size={14} /><span>Hapus</span>
                  </button>
                </>
              )}
            </div>
          </>,
          document.body
        )}

        {/* Modals */}
        {createPortal(<Modal
          isOpen={showCreateModal || showEditModal}
          onClose={() => { showCreateModal ? setShowCreateModal(false) : setShowEditModal(false); resetForm(); }}
          title={showCreateModal ? 'Buat Artikel Baru' : 'Edit Artikel'}
          size="xl"
        >
          <form onSubmit={showCreateModal ? handleCreateArticle : handleUpdateArticle} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Judul Artikel *</label>
              <input type="text" value={formData.title} onChange={(e) => setFormData(f => ({ ...f, title: e.target.value }))} required className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" placeholder="Masukkan judul artikel..." />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Kategori Jurusan (Opsional)</label>
              <select value={formData.categoryJurusan} onChange={(e) => setFormData(f => ({ ...f, categoryJurusan: e.target.value }))} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500">
                <option value="">Pilih Jurusan (Opsional)</option>
                {jurusans.map(j => <option key={j._id} value={j._id}>{j.code} - {j.name}</option>)}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Kategori Topik (Opsional)</label>
              <select value={formData.categoryTopik} onChange={(e) => setFormData(f => ({ ...f, categoryTopik: e.target.value }))} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500">
                <option value="">Pilih Topik (Opsional)</option>
                {categories.filter(c => c.type === 'topik').map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
              </select>
            </div>

            {(() => {
              const selectedTopik = categories.find(c => c._id === formData.categoryTopik);
              if (selectedTopik?.slug?.toLowerCase() !== 'prestasi') return null;
              return (
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 space-y-3">
                  <p className="text-sm font-semibold text-amber-800">Informasi Prestasi</p>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-amber-700 mb-1">Peringkat</label>
                      <select value={formData.metadata.rank} onChange={(e) => setFormData(f => ({ ...f, metadata: { ...f.metadata, rank: e.target.value } }))} className="w-full px-3 py-2 border border-amber-200 rounded-lg text-sm bg-white">
                        <option value="">Pilih peringkat...</option>
                        {['Juara I','Juara II','Juara III','Harapan I','Harapan II','Medali Emas','Medali Perak','Medali Perunggu','Finalis'].map(r => <option key={r} value={r}>{r}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-amber-700 mb-1">Tingkat</label>
                      <select value={formData.metadata.level} onChange={(e) => setFormData(f => ({ ...f, metadata: { ...f.metadata, level: e.target.value } }))} className="w-full px-3 py-2 border border-amber-200 rounded-lg text-sm bg-white">
                        <option value="">Pilih tingkat...</option>
                        {['Kabupaten/Kota','Provinsi','Nasional','Internasional'].map(l => <option key={l} value={l}>{l}</option>)}
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-amber-700 mb-1">Nama Siswa / Tim</label>
                    <input type="text" value={formData.metadata.studentName} onChange={(e) => setFormData(f => ({ ...f, metadata: { ...f.metadata, studentName: e.target.value } }))} className="w-full px-3 py-2 border border-amber-200 rounded-lg text-sm bg-white" placeholder="Contoh: Imanuel Damanik / Tim A" />
                  </div>
                </div>
              );
            })()}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Ringkasan (Excerpt)</label>
              <textarea value={formData.excerpt} onChange={(e) => setFormData(f => ({ ...f, excerpt: e.target.value }))} rows={3} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" placeholder="Ringkasan singkat artikel..." />
            </div>

            {/* SEO Fields */}
            <div className="border-t pt-4 mt-4">
              <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                <span>🔍 SEO Settings</span>
                <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded">Penting</span>
              </h3>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Meta Description</label>
                <textarea 
                  value={formData.metaDescription} 
                  onChange={(e) => setFormData(f => ({ ...f, metaDescription: e.target.value.substring(0, 160) }))} 
                  rows={2} 
                  maxLength="160"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm" 
                  placeholder="Deskripsi singkat untuk search engine (max 160 karakter)..." 
                />
                <p className="text-xs text-gray-500 mt-1">{formData.metaDescription.length}/160 karakter</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 mt-3">Keywords (Tags)</label>
                <input 
                  type="text"
                  value={formData.keywords.join(', ')}
                  onChange={(e) => setFormData(f => ({ ...f, keywords: e.target.value.split(',').map(k => k.trim()).filter(k => k) }))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
                  placeholder="Pisahkan dengan koma: SEO, artikel, SMK, jurusan..."
                />
                <p className="text-xs text-gray-500 mt-1">Masukkan kata kunci yang relevan, pisahkan dengan koma</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 mt-3">Alt Text untuk Gambar</label>
                <input 
                  type="text"
                  value={formData.altText}
                  onChange={(e) => setFormData(f => ({ ...f, altText: e.target.value.substring(0, 125) }))}
                  maxLength="125"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
                  placeholder="Deskripsi gambar untuk SEO dan aksesibilitas (max 125 karakter)..."
                />
                <p className="text-xs text-gray-500 mt-1">{formData.altText.length}/125 karakter</p>
              </div>

              <button
                type="button"
                onClick={() => setShowInternalLinkModal(true)}
                className="w-full mt-3 px-4 py-2 border-2 border-blue-500 text-blue-600 rounded-lg hover:bg-blue-50 text-sm font-medium transition-colors flex items-center justify-center gap-2"
              >
                <span>🔗</span>
                Tambah Internal Link
              </button>
            </div>

            {/* FAQ Section */}
            <div className="border-t pt-4 mt-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                  <span>❓ FAQ</span>
                  <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded">Featured Snippet</span>
                </h3>
                <button
                  type="button"
                  onClick={() => setFormData(f => ({ ...f, faqs: [...f.faqs, { question: '', answer: '' }] }))}
                  className="text-xs px-3 py-1.5 bg-green-600 text-white rounded-lg hover:bg-green-700"
                >
                  + Tambah FAQ
                </button>
              </div>
              {formData.faqs.length === 0 ? (
                <p className="text-xs text-gray-400 italic">FAQ membantu artikel muncul di Featured Snippet Google.</p>
              ) : (
                <div className="space-y-3">
                  {formData.faqs.map((faq, idx) => (
                    <div key={idx} className="border border-gray-200 rounded-lg p-3 bg-gray-50">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-xs font-medium text-gray-500">FAQ #{idx + 1}</span>
                        <button
                          type="button"
                          onClick={() => setFormData(f => ({ ...f, faqs: f.faqs.filter((_, i) => i !== idx) }))}
                          className="text-xs text-red-400 hover:text-red-600"
                        >Hapus</button>
                      </div>
                      <input
                        type="text"
                        value={faq.question}
                        onChange={(e) => setFormData(f => { const u = [...f.faqs]; u[idx] = { ...u[idx], question: e.target.value }; return { ...f, faqs: u }; })}
                        className="w-full px-3 py-1.5 border border-gray-300 rounded text-sm mb-2 focus:ring-2 focus:ring-green-400"
                        placeholder="Pertanyaan..."
                      />
                      <textarea
                        value={faq.answer}
                        onChange={(e) => setFormData(f => { const u = [...f.faqs]; u[idx] = { ...u[idx], answer: e.target.value }; return { ...f, faqs: u }; })}
                        rows={2}
                        className="w-full px-3 py-1.5 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-green-400"
                        placeholder="Jawaban..."
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Konten Artikel *</label>
              <ReactQuill theme="snow" value={formData.content} onChange={(content) => setFormData(f => ({ ...f, content }))} modules={quillModules} className="bg-white" style={{ height: '300px', marginBottom: '50px' }} />
            </div>

            <ImageUpload label="Gambar Unggulan" value={formData.featuredImage} onChange={(url) => setFormData(f => ({ ...f, featuredImage: url }))} folder="smk-kristen5/articles" previewClassName="h-48 w-full object-cover" />

            <div className="flex gap-3 pt-4">
              <button type="button" onClick={() => { showCreateModal ? setShowCreateModal(false) : setShowEditModal(false); resetForm(); }} className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm font-medium">Batal</button>
              <button type="submit" className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium">{showCreateModal ? 'Buat Artikel' : 'Update Artikel'}</button>
            </div>
          </form>
        </Modal>, document.body)}

        {createPortal(<Modal isOpen={showPreviewModal} onClose={() => { setShowPreviewModal(false); setSelectedArticle(null); }} title="Preview Artikel" size="xl">
          {selectedArticle && (
            <div className="prose max-w-none">
              {selectedArticle.featuredImage && (
                <img src={typeof selectedArticle.featuredImage === 'string' ? selectedArticle.featuredImage : selectedArticle.featuredImage.url} alt={selectedArticle.title} className="w-full h-64 object-cover rounded-lg mb-4" />
              )}
              <h1>{selectedArticle.title}</h1>
              <div className="text-sm text-gray-500 mb-4 flex gap-2 flex-wrap">
                {selectedArticle.categoryJurusan && <span>{selectedArticle.categoryJurusan.name}</span>}
                {selectedArticle.categoryTopik && <span>{selectedArticle.categoryTopik.name}</span>}
                <span>{selectedArticle.author?.name}</span>
              </div>
              <div dangerouslySetInnerHTML={{ __html: selectedArticle.content }} />
            </div>
          )}
        </Modal>, document.body)}

        {createPortal(<Modal isOpen={showDeleteModal} onClose={() => { setShowDeleteModal(false); setSelectedArticle(null); }} title="Konfirmasi Hapus" size="sm">
          <div className="space-y-4">
            <p className="text-gray-600">Hapus artikel <span className="font-semibold">"{selectedArticle?.title}"</span>?</p>
            <p className="text-sm text-red-600">Aksi ini tidak dapat dibatalkan.</p>
            <div className="flex gap-3 pt-2">
              <button onClick={() => { setShowDeleteModal(false); setSelectedArticle(null); }} className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm">Batal</button>
              <button onClick={handleDeleteArticle} className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm">Hapus</button>
            </div>
          </div>
        </Modal>, document.body)}

        {createPortal(<Modal isOpen={showBulkDeleteModal} onClose={() => setShowBulkDeleteModal(false)} title="Konfirmasi Hapus Multiple" size="sm">
          <div className="space-y-4">
            <p className="text-gray-600">Hapus <span className="font-semibold text-red-600">{selectedArticles.length} artikel</span>?</p>
            <p className="text-sm text-red-600 font-semibold">Aksi ini tidak dapat dibatalkan!</p>
            <div className="flex gap-3 pt-2">
              <button onClick={() => setShowBulkDeleteModal(false)} className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm">Batal</button>
              <button onClick={handleBulkDelete} className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm font-semibold">Hapus {selectedArticles.length} Artikel</button>
            </div>
          </div>
        </Modal>, document.body)}

        {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      </>
    );
  }

  // ── FULL PAGE mode ─────────────────────────────────────────────────────────
  const filterCount = getActiveFiltersCount();

  return (
    <div className="-mx-4 -my-6 lg:-mx-8">

      {/* ── Combined sticky header ─────────────────────────────────────── */}
      <div className="sticky top-0 z-20 shadow-sm">
        {/* Blue page header */}
        <div className="bg-blue-600 text-white px-6 lg:px-8 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold leading-tight">
              {isAdmin ? 'Artikel' : 'Artikel Saya'}
            </h1>
            <p className="text-sm text-blue-200 leading-tight">
              {isAdmin ? 'Kelola artikel dan kategori konten' : 'Artikel yang Anda buat'}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveViewTab('articles')}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
                activeViewTab === 'articles' ? 'border border-white text-white' : 'text-white/60 hover:text-white border border-transparent'
              }`}
            >
              Semua Artikel
            </button>
            <button
              onClick={() => setActiveViewTab('categories')}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
                activeViewTab === 'categories' ? 'border border-white text-white' : 'text-white/60 hover:text-white border border-transparent'
              }`}
            >
              Kategori
            </button>
          </div>
        </div>

        {/* Search + action toolbar */}
        <div className="bg-white border-b border-gray-100 px-6 py-3 flex items-center gap-2.5">
          {/* Select mode info */}
          {isSelectMode && (
            <div className="flex items-center gap-2 mr-1">
              <span className="text-xs text-gray-500 whitespace-nowrap">{selectedArticles.length} dipilih</span>
              <button onClick={toggleSelectAll} className="text-xs px-2 py-1 bg-blue-50 text-blue-600 rounded-lg font-medium">
                {selectedArticles.length === articles.length ? 'Batal Semua' : 'Pilih Semua'}
              </button>
              {selectedArticles.length > 0 && (
                <button onClick={() => setShowBulkDeleteModal(true)} className="text-xs px-2 py-1 bg-red-50 text-red-600 rounded-lg font-medium">
                  Hapus ({selectedArticles.length})
                </button>
              )}
              <button onClick={cancelSelectMode} className="text-xs px-2 py-1 border border-gray-200 text-gray-500 rounded-lg">Batal</button>
              <div className="w-px h-5 bg-gray-200 mx-1" />
            </div>
          )}

          {/* Search input */}
          <div className="flex-1 relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            <input
              type="text"
              placeholder="cari judul artikel..."
              value={filters.search}
              onChange={(e) => setFilters(f => ({ ...f, search: e.target.value }))}
              className="w-full pl-8 pr-4 py-2 text-sm bg-amber-50/70 border border-amber-100 rounded-lg focus:outline-none focus:border-amber-300 placeholder-gray-400"
            />
          </div>

          {/* Filter button */}
          <div className="relative filter-dropdown-container">
            <button
              onClick={(e) => { e.stopPropagation(); setShowFilterDropdown(v => !v); }}
              className={`relative p-2 rounded-lg border transition-colors ${
                showFilterDropdown || filterCount > 0
                  ? 'border-blue-200 bg-blue-50 text-blue-600'
                  : 'border-gray-200 hover:bg-gray-50 text-gray-500'
              }`}
            >
              <SlidersHorizontal size={16} />
              {filterCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-blue-600 text-white text-[9px] font-bold rounded-full flex items-center justify-center">
                  {filterCount}
                </span>
              )}
            </button>

            {/* Filter dropdown */}
            {showFilterDropdown && (
              <div
                className="absolute right-0 mt-2 w-72 bg-white rounded-xl shadow-xl border border-gray-200 z-30 max-h-96 overflow-y-auto filter-dropdown-container"
                onClick={e => e.stopPropagation()}
              >
                <div className="p-4">
                  <div className="flex items-center justify-between mb-4 pb-3 border-b sticky top-0 bg-white z-10">
                    <h3 className="font-semibold text-gray-900 text-sm">Filter Artikel</h3>
                    <button
                      onClick={() => setShowFilterDropdown(false)}
                      className="px-3 py-1 bg-blue-600 text-white text-xs rounded-lg hover:bg-blue-700"
                    >
                      Terapkan
                    </button>
                  </div>

                  {/* Time range */}
                  <div className="mb-4">
                    <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Berdasarkan Waktu</h4>
                    <div className="space-y-1">
                      {[
                        { value: '', label: 'Semua Waktu' },
                        { value: 'today', label: 'Hari Ini' },
                        { value: 'week', label: 'Minggu Ini' },
                        { value: 'month', label: 'Bulan Ini' },
                        { value: 'year', label: 'Tahun Ini' },
                      ].map((opt) => (
                        <label key={opt.value} className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-2 rounded-lg">
                          <input type="radio" name="timeRange" checked={filters.timeRange === opt.value} onChange={() => setFilters(f => ({ ...f, timeRange: opt.value }))} className="w-3.5 h-3.5 text-blue-600" />
                          <span className="text-sm text-gray-700">{opt.label}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Jurusan */}
                  <div className="mb-4">
                    <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                      Jurusan {filters.categoryJurusan.length > 0 && <span className="text-blue-600">({filters.categoryJurusan.length})</span>}
                    </h4>
                    <div className="space-y-1 max-h-28 overflow-y-auto">
                      {jurusans.length > 0 ? jurusans.map(j => (
                        <label key={j._id} className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-2 rounded-lg">
                          <input type="checkbox" checked={filters.categoryJurusan.includes(j._id)} onChange={() => toggleArrayFilter('categoryJurusan', j._id)} className="w-3.5 h-3.5 text-blue-600 rounded" />
                          <span className="text-sm text-gray-700">{j.code} - {j.name}</span>
                        </label>
                      )) : <p className="text-xs text-gray-400 italic px-2">Belum ada jurusan</p>}
                    </div>
                  </div>

                  {/* Topik */}
                  <div className="mb-4">
                    <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                      Topik {filters.categoryTopik.length > 0 && <span className="text-blue-600">({filters.categoryTopik.length})</span>}
                    </h4>
                    <div className="space-y-1 max-h-28 overflow-y-auto">
                      {categories.filter(c => c.type === 'topik').length > 0 ? categories.filter(c => c.type === 'topik').map(cat => (
                        <label key={cat._id} className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-2 rounded-lg">
                          <input type="checkbox" checked={filters.categoryTopik.includes(cat._id)} onChange={() => toggleArrayFilter('categoryTopik', cat._id)} className="w-3.5 h-3.5 text-blue-600 rounded" />
                          <span className="text-sm text-gray-700">{cat.name}</span>
                        </label>
                      )) : <p className="text-xs text-gray-400 italic px-2">Belum ada topik</p>}
                    </div>
                  </div>

                  {/* Status */}
                  <div className="mb-2">
                    <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                      Status {filters.status.length > 0 && <span className="text-blue-600">({filters.status.length})</span>}
                    </h4>
                    <div className="space-y-1">
                      {['draft', 'pending', 'published', 'rejected'].map(s => (
                        <label key={s} className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-2 rounded-lg">
                          <input type="checkbox" checked={filters.status.includes(s)} onChange={() => toggleArrayFilter('status', s)} className="w-3.5 h-3.5 text-blue-600 rounded" />
                          <span className="text-sm text-gray-700 capitalize">{s}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {filterCount > 0 && (
                    <div className="mt-3 pt-3 border-t sticky bottom-0 bg-white">
                      <button onClick={clearAllFilters} className="w-full py-1.5 text-sm text-red-500 hover:bg-red-50 rounded-lg font-medium">
                        Hapus Semua Filter
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Add article */}
          <button
            onClick={() => setShowCreateModal(true)}
            className="p-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white transition-colors"
            title="Buat Artikel"
          >
            <Plus size={16} />
          </button>

          {/* Select mode toggle */}
          {!isSelectMode && (
            <button
              onClick={() => setIsSelectMode(true)}
              className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50 text-gray-500 transition-colors"
              title="Pilih Multiple"
            >
              <CheckSquare size={16} />
            </button>
          )}
        </div>
      </div>

      {/* ── Main content panel ─────────────────────────────────────────── */}
      <div className="p-4">
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm">

          {/* Active filter pills */}
          {filterCount > 0 && (
            <div className="px-5 py-2.5 border-b border-gray-100 flex flex-wrap gap-1.5 items-center">
              {filters.search && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-blue-50 text-blue-700 rounded-full text-xs font-medium">
                  "{filters.search}"
                  <button onClick={() => setFilters(f => ({ ...f, search: '' }))} className="ml-0.5 hover:text-blue-900">×</button>
                </span>
              )}
              {filters.timeRange && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-emerald-50 text-emerald-700 rounded-full text-xs font-medium">
                  {filters.timeRange === 'today' ? 'Hari Ini' : filters.timeRange === 'week' ? 'Minggu Ini' : filters.timeRange === 'month' ? 'Bulan Ini' : 'Tahun Ini'}
                  <button onClick={() => setFilters(f => ({ ...f, timeRange: '' }))} className="ml-0.5">×</button>
                </span>
              )}
              {filters.categoryJurusan.map(id => {
                const j = jurusans.find(x => x._id === id);
                return j ? (
                  <span key={id} className="inline-flex items-center gap-1 px-2.5 py-1 bg-violet-50 text-violet-700 rounded-full text-xs font-medium">
                    {j.code}<button onClick={() => toggleArrayFilter('categoryJurusan', id)} className="ml-0.5">×</button>
                  </span>
                ) : null;
              })}
              {filters.categoryTopik.map(id => {
                const c = categories.find(x => x._id === id);
                return c ? (
                  <span key={id} className="inline-flex items-center gap-1 px-2.5 py-1 bg-indigo-50 text-indigo-700 rounded-full text-xs font-medium">
                    {c.name}<button onClick={() => toggleArrayFilter('categoryTopik', id)} className="ml-0.5">×</button>
                  </span>
                ) : null;
              })}
              {filters.status.map(s => (
                <span key={s} className="inline-flex items-center gap-1 px-2.5 py-1 bg-amber-50 text-amber-700 rounded-full text-xs font-medium capitalize">
                  {s}<button onClick={() => toggleArrayFilter('status', s)} className="ml-0.5">×</button>
                </span>
              ))}
              <button onClick={clearAllFilters} className="ml-auto text-xs text-red-500 hover:text-red-700 font-medium">Hapus semua</button>
            </div>
          )}

          {/* ── Articles view ─────────────────────────────────── */}
          {activeViewTab === 'articles' && (
            <div className="p-5">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {loading ? (
                  Array.from({ length: 6 }).map((_, i) => (
                    <div key={i} className="bg-gray-100 rounded-xl h-[230px] animate-pulse" />
                  ))
                ) : articles.length === 0 ? (
                  <div className="col-span-3 py-16 text-center">
                    <FileText size={40} className="mx-auto text-gray-200 mb-3" />
                    <p className="text-sm text-gray-400">Belum ada artikel</p>
                    <button onClick={() => setShowCreateModal(true)} className="mt-4 px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700">
                      Buat Artikel Pertama
                    </button>
                  </div>
                ) : (
                  articles.map(article => <ArticleCard key={article._id} article={article} />)
                )}
              </div>
            </div>
          )}

          {/* ── Categories view ───────────────────────────────── */}
          {activeViewTab === 'categories' && (
            <div className="p-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {categories.length === 0 ? (
                  <div className="col-span-3 py-16 text-center">
                    <p className="text-sm text-gray-400">Belum ada kategori</p>
                  </div>
                ) : (
                  categories.map(cat => (
                    <div key={cat._id} className="flex items-center gap-3 p-4 border border-gray-100 rounded-xl">
                      <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${cat.type === 'topik' ? 'bg-blue-50 text-blue-600' : 'bg-emerald-50 text-emerald-600'}`}>
                        <FileText size={16} />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">{cat.name}</p>
                        <p className="text-xs text-gray-400 capitalize">{cat.type}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* ── Sticky bottom bar (pagination) ───────────────── */}
          {activeViewTab === 'articles' && !loading && articles.length > 0 && (
            <div className="sticky bottom-0 z-10 bg-white border-t border-gray-100 px-5 py-3 flex items-center justify-between rounded-b-2xl">
              <p className="text-sm text-gray-500">
                Halaman <span className="font-semibold text-gray-800">{pagination.page}</span> dari <span className="font-semibold text-gray-800">{pagination.pages}</span>
              </p>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setPagination(p => ({ ...p, page: p.page - 1 }))}
                  disabled={pagination.page <= 1}
                  className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium border border-gray-200 rounded-lg disabled:opacity-40 hover:bg-gray-50 text-gray-600 transition-colors"
                >
                  <ChevronLeft size={13} /> Prev
                </button>

                {Array.from({ length: pagination.pages }, (_, i) => i + 1)
                  .filter(p => p === 1 || p === pagination.pages || Math.abs(p - pagination.page) <= 1)
                  .reduce((acc, p, idx, arr) => {
                    if (idx > 0 && p - arr[idx - 1] > 1) acc.push('...');
                    acc.push(p);
                    return acc;
                  }, [])
                  .map((p, i) =>
                    p === '...' ? (
                      <span key={`dots-${i}`} className="w-8 h-8 text-xs text-gray-400 flex items-center justify-center">…</span>
                    ) : (
                      <button
                        key={p}
                        onClick={() => setPagination(prev => ({ ...prev, page: p }))}
                        className={`w-8 h-8 text-xs font-medium rounded-lg transition-colors ${
                          pagination.page === p ? 'bg-blue-600 text-white' : 'border border-gray-200 text-gray-600 hover:bg-gray-50'
                        }`}
                      >
                        {p}
                      </button>
                    )
                  )}

                <button
                  onClick={() => setPagination(p => ({ ...p, page: p.page + 1 }))}
                  disabled={pagination.page >= pagination.pages}
                  className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium border border-gray-200 rounded-lg disabled:opacity-40 hover:bg-gray-50 text-gray-600 transition-colors"
                >
                  Next <ChevronRight size={13} />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── Modals ────────────────────────────────────────────────────────── */}
      {createPortal(<Modal
        isOpen={showCreateModal || showEditModal}
        onClose={() => { showCreateModal ? setShowCreateModal(false) : setShowEditModal(false); resetForm(); }}
        title={showCreateModal ? 'Buat Artikel Baru' : 'Edit Artikel'}
        size="xl"
      >
        <form onSubmit={showCreateModal ? handleCreateArticle : handleUpdateArticle} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Judul Artikel *</label>
            <input type="text" value={formData.title} onChange={(e) => setFormData(f => ({ ...f, title: e.target.value }))} required className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" placeholder="Masukkan judul artikel..." />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Kategori Jurusan (Opsional)</label>
            <select value={formData.categoryJurusan} onChange={(e) => setFormData(f => ({ ...f, categoryJurusan: e.target.value }))} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500">
              <option value="">Pilih Jurusan (Opsional)</option>
              {jurusans.map(j => <option key={j._id} value={j._id}>{j.code} - {j.name}</option>)}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Kategori Topik (Opsional)</label>
            <select value={formData.categoryTopik} onChange={(e) => setFormData(f => ({ ...f, categoryTopik: e.target.value }))} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500">
              <option value="">Pilih Topik (Opsional)</option>
              {categories.filter(c => c.type === 'topik').map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
            </select>
          </div>

          {(() => {
            const selectedTopik = categories.find(c => c._id === formData.categoryTopik);
            if (selectedTopik?.slug?.toLowerCase() !== 'prestasi') return null;
            return (
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 space-y-3">
                <p className="text-sm font-semibold text-amber-800">Informasi Prestasi</p>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-amber-700 mb-1">Peringkat</label>
                    <select value={formData.metadata.rank} onChange={(e) => setFormData(f => ({ ...f, metadata: { ...f.metadata, rank: e.target.value } }))} className="w-full px-3 py-2 border border-amber-200 rounded-lg text-sm bg-white">
                      <option value="">Pilih peringkat...</option>
                      {['Juara I','Juara II','Juara III','Harapan I','Harapan II','Medali Emas','Medali Perak','Medali Perunggu','Finalis'].map(r => <option key={r} value={r}>{r}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-amber-700 mb-1">Tingkat</label>
                    <select value={formData.metadata.level} onChange={(e) => setFormData(f => ({ ...f, metadata: { ...f.metadata, level: e.target.value } }))} className="w-full px-3 py-2 border border-amber-200 rounded-lg text-sm bg-white">
                      <option value="">Pilih tingkat...</option>
                      {['Kabupaten/Kota','Provinsi','Nasional','Internasional'].map(l => <option key={l} value={l}>{l}</option>)}
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-amber-700 mb-1">Nama Siswa / Tim</label>
                  <input type="text" value={formData.metadata.studentName} onChange={(e) => setFormData(f => ({ ...f, metadata: { ...f.metadata, studentName: e.target.value } }))} className="w-full px-3 py-2 border border-amber-200 rounded-lg text-sm bg-white" placeholder="Contoh: Imanuel Damanik / Tim A" />
                </div>
              </div>
            );
          })()}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Ringkasan (Excerpt)</label>
            <textarea value={formData.excerpt} onChange={(e) => setFormData(f => ({ ...f, excerpt: e.target.value }))} rows={3} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" placeholder="Ringkasan singkat artikel..." />
          </div>

          {/* FAQ Section */}
          <div className="border-t pt-4 mt-2">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                <span>❓ FAQ</span>
                <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded">Featured Snippet</span>
              </h3>
              <button
                type="button"
                onClick={() => setFormData(f => ({ ...f, faqs: [...f.faqs, { question: '', answer: '' }] }))}
                className="text-xs px-3 py-1.5 bg-green-600 text-white rounded-lg hover:bg-green-700"
              >
                + Tambah FAQ
              </button>
            </div>
            {formData.faqs.length === 0 ? (
              <p className="text-xs text-gray-400 italic">FAQ membantu artikel muncul di Featured Snippet Google.</p>
            ) : (
              <div className="space-y-3">
                {formData.faqs.map((faq, idx) => (
                  <div key={idx} className="border border-gray-200 rounded-lg p-3 bg-gray-50">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-xs font-medium text-gray-500">FAQ #{idx + 1}</span>
                      <button
                        type="button"
                        onClick={() => setFormData(f => ({ ...f, faqs: f.faqs.filter((_, i) => i !== idx) }))}
                        className="text-xs text-red-400 hover:text-red-600"
                      >Hapus</button>
                    </div>
                    <input
                      type="text"
                      value={faq.question}
                      onChange={(e) => setFormData(f => { const u = [...f.faqs]; u[idx] = { ...u[idx], question: e.target.value }; return { ...f, faqs: u }; })}
                      className="w-full px-3 py-1.5 border border-gray-300 rounded text-sm mb-2 focus:ring-2 focus:ring-green-400"
                      placeholder="Pertanyaan..."
                    />
                    <textarea
                      value={faq.answer}
                      onChange={(e) => setFormData(f => { const u = [...f.faqs]; u[idx] = { ...u[idx], answer: e.target.value }; return { ...f, faqs: u }; })}
                      rows={2}
                      className="w-full px-3 py-1.5 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-green-400"
                      placeholder="Jawaban..."
                    />
                  </div>
                ))}
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Konten Artikel *</label>
            <ReactQuill theme="snow" value={formData.content} onChange={(content) => setFormData(f => ({ ...f, content }))} modules={quillModules} className="bg-white" style={{ height: '300px', marginBottom: '50px' }} />
          </div>

          <ImageUpload label="Gambar Unggulan" value={formData.featuredImage} onChange={(url) => setFormData(f => ({ ...f, featuredImage: url }))} folder="smk-kristen5/articles" previewClassName="h-48 w-full object-cover" />

          <div className="flex gap-3 pt-4">
            <button type="button" onClick={() => { showCreateModal ? setShowCreateModal(false) : setShowEditModal(false); resetForm(); }} className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm font-medium">Batal</button>
            <button type="submit" className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium">{showCreateModal ? 'Buat Artikel' : 'Update Artikel'}</button>
          </div>
        </form>
      </Modal>, document.body)}

      {createPortal(<Modal isOpen={showPreviewModal} onClose={() => { setShowPreviewModal(false); setSelectedArticle(null); }} title="Preview Artikel" size="xl">
        {selectedArticle && (
          <div className="prose max-w-none">
            {selectedArticle.featuredImage && (
              <img src={typeof selectedArticle.featuredImage === 'string' ? selectedArticle.featuredImage : selectedArticle.featuredImage.url} alt={selectedArticle.title} className="w-full h-64 object-cover rounded-lg mb-4" />
            )}
            <h1>{selectedArticle.title}</h1>
            <div className="text-sm text-gray-500 mb-4 flex gap-2 flex-wrap">
              {selectedArticle.categoryJurusan && <span>{selectedArticle.categoryJurusan.name}</span>}
              {selectedArticle.categoryTopik && <span>{selectedArticle.categoryTopik.name}</span>}
              <span>{selectedArticle.author?.name}</span>
            </div>
            <div dangerouslySetInnerHTML={{ __html: selectedArticle.content }} />
          </div>
        )}
      </Modal>, document.body)}

      {createPortal(<Modal isOpen={showDeleteModal} onClose={() => { setShowDeleteModal(false); setSelectedArticle(null); }} title="Konfirmasi Hapus" size="sm">
        <div className="space-y-4">
          <p className="text-gray-600">Hapus artikel <span className="font-semibold">"{selectedArticle?.title}"</span>?</p>
          <p className="text-sm text-red-600">Aksi ini tidak dapat dibatalkan.</p>
          <div className="flex gap-3 pt-2">
            <button onClick={() => { setShowDeleteModal(false); setSelectedArticle(null); }} className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm">Batal</button>
            <button onClick={handleDeleteArticle} className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm">Hapus</button>
          </div>
        </div>
      </Modal>, document.body)}

      {createPortal(<Modal isOpen={showBulkDeleteModal} onClose={() => setShowBulkDeleteModal(false)} title="Konfirmasi Hapus Multiple" size="sm">
        <div className="space-y-4">
          <p className="text-gray-600">Hapus <span className="font-semibold text-red-600">{selectedArticles.length} artikel</span>?</p>
          <p className="text-sm text-red-600 font-semibold">Aksi ini tidak dapat dibatalkan!</p>
          <div className="flex gap-3 pt-2">
            <button onClick={() => setShowBulkDeleteModal(false)} className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm">Batal</button>
            <button onClick={handleBulkDelete} className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm font-semibold">Hapus {selectedArticles.length} Artikel</button>
          </div>
        </div>
      </Modal>, document.body)}

      {createPortal(<Modal isOpen={showInternalLinkModal} onClose={() => { setShowInternalLinkModal(false); setInternalLinkSearch(''); setInternalLinkSuggestions([]); }} title="🔗 Tambah Internal Link" size="md">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Cari Artikel untuk di-Link</label>
            <input
              type="text"
              placeholder="Ketik judul atau keyword artikel..."
              value={internalLinkSearch}
              onChange={(e) => setInternalLinkSearch(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {internalLinkSearch.length >= 2 && (
            <div className="border rounded-lg overflow-hidden max-h-80 overflow-y-auto">
              {internalLinkSuggestions.length > 0 ? (
                internalLinkSuggestions.map(article => (
                  <button
                    key={article._id}
                    onClick={() => insertInternalLink(article)}
                    className="w-full text-left px-4 py-3 hover:bg-blue-50 border-b last:border-b-0 transition-colors"
                  >
                    <p className="font-medium text-gray-900 truncate">{article.title}</p>
                    <p className="text-xs text-gray-500 truncate">{article.excerpt?.substring(0, 80)}...</p>
                  </button>
                ))
              ) : (
                <div className="px-4 py-6 text-center text-gray-500 text-sm">
                  Tidak ada artikel yang ditemukan
                </div>
              )}
            </div>
          )}

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm text-blue-800">
            <p className="font-semibold mb-1">💡 Tips:</p>
            <ul className="list-disc list-inside space-y-1 text-xs">
              <li>Internal link membantu SEO website</li>
              <li>Link akan ditambahkan di akhir konten artikel</li>
              <li>Gunakan untuk menghubungkan artikel terkait</li>
            </ul>
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => { setShowInternalLinkModal(false); setInternalLinkSearch(''); setInternalLinkSuggestions([]); }}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm font-medium"
            >
              Tutup
            </button>
          </div>
        </div>
      </Modal>, document.body)}

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
};

export default Articles;
