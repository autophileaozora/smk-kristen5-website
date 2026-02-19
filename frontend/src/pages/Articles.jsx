import { useState, useEffect } from 'react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import api from '../utils/api';
import useAuthStore from '../store/authStore';
import Modal from '../components/Modal';
import Toast from '../components/Toast';
import Pagination from '../components/Pagination';
import ImageUpload from '../components/ImageUpload';

const Articles = ({ embedded = false }) => {
  const { user } = useAuthStore();
  const isAdmin = user?.role === 'administrator';

  const [articles, setArticles] = useState([]);
  const [categories, setCategories] = useState([]);
  const [jurusans, setJurusans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    pages: 1,
  });

  // Filters
  const [filters, setFilters] = useState({
    search: '',
    timeRange: '',
    categoryJurusan: [], // Array for multiple selection
    categoryTopik: [],   // Array for multiple selection
    status: [],          // Array for multiple selection
  });
  
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);
  
  // Debounced search state
  const [debouncedSearch, setDebouncedSearch] = useState('');

  // Modals
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [selectedArticle, setSelectedArticle] = useState(null);

  // Form data
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    excerpt: '',
    categoryJurusan: '',
    categoryTopik: '',
    featuredImage: '',
    status: 'draft',
    metadata: { rank: '', level: '', studentName: '' },
  });

  const [toast, setToast] = useState(null);
  const [openDropdown, setOpenDropdown] = useState(null); // Track which card's dropdown is open

  // Bulk delete states
  const [selectedArticles, setSelectedArticles] = useState([]);
  const [showBulkDeleteModal, setShowBulkDeleteModal] = useState(false);
  const [isSelectMode, setIsSelectMode] = useState(false);

  // Helper function to format date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const days = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
    const months = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
    
    const dayName = days[date.getDay()];
    const day = date.getDate();
    const month = months[date.getMonth()];
    const year = date.getFullYear();
    
    return `${dayName}, ${day} ${month} ${year}`;
  };

  // Helper functions for checkbox filters
  const toggleArrayFilter = (filterKey, value) => {
    setFilters(prev => {
      const currentArray = prev[filterKey];
      const newArray = currentArray.includes(value)
        ? currentArray.filter(v => v !== value)
        : [...currentArray, value];
      return { ...prev, [filterKey]: newArray };
    });
  };

  const getActiveFiltersCount = () => {
    let count = 0;
    if (filters.search) count++;
    if (filters.timeRange) count++;
    if (filters.categoryJurusan.length > 0) count += filters.categoryJurusan.length;
    if (filters.categoryTopik.length > 0) count += filters.categoryTopik.length;
    if (filters.status.length > 0) count += filters.status.length;
    return count;
  };

  const clearAllFilters = () => {
    setFilters({
      search: '',
      timeRange: '',
      categoryJurusan: [],
      categoryTopik: [],
      status: [],
    });
    setDebouncedSearch(''); // Also clear debounced search
  };

  useEffect(() => {
    fetchArticles();
    fetchCategories();
    fetchJurusans();
  }, [pagination.page, debouncedSearch, filters.timeRange, filters.categoryJurusan, filters.categoryTopik, filters.status]);

  // Debounce search input (wait 500ms after user stops typing)
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(filters.search);
    }, 500);

    return () => {
      clearTimeout(handler);
    };
  }, [filters.search]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      // Don't close if clicking inside the filter dropdown
      if (e.target.closest('.filter-dropdown-container')) {
        return;
      }
      setOpenDropdown(null);
      setShowFilterDropdown(false);
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  const fetchArticles = async () => {
    try {
      setLoading(true);
      const params = {
        page: pagination.page,
        limit: pagination.limit,
        ...(debouncedSearch && { search: debouncedSearch }),
        ...(filters.categoryJurusan.length > 0 && { categoryJurusan: filters.categoryJurusan.join(',') }),
        ...(filters.categoryTopik.length > 0 && { categoryTopik: filters.categoryTopik.join(',') }),
        ...(filters.timeRange && { timeRange: filters.timeRange }),
        ...(filters.status.length > 0 && { status: filters.status.join(',') }),
      };

      const response = await api.get('/api/articles', { params });
      setArticles(response.data.data.articles);
      setPagination({
        ...pagination,
        ...response.data.data.pagination,
      });
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
      // Prepare data - convert empty strings to null for optional fields
      const createData = {
        title: formData.title,
        content: formData.content,
        excerpt: formData.excerpt,
        categoryJurusan: formData.categoryJurusan || null,
        categoryTopik: formData.categoryTopik || null,
        featuredImage: formData.featuredImage || null,
        status: formData.status,
        metadata: formData.metadata,
      };

      await api.post('/api/articles', createData);
      showToast('Artikel berhasil dibuat', 'success');
      setShowCreateModal(false);
      resetForm();
      fetchArticles();
    } catch (error) {
      console.error('Create error:', error.response || error);
      showToast(error.response?.data?.message || 'Gagal membuat artikel', 'error');
    }
  };

  const handleUpdateArticle = async (e) => {
    e.preventDefault();
    try {
      // Prepare data - convert empty strings to null for optional fields
      const updateData = {
        title: formData.title,
        content: formData.content,
        excerpt: formData.excerpt,
        categoryJurusan: formData.categoryJurusan || null,
        categoryTopik: formData.categoryTopik || null,
        featuredImage: formData.featuredImage || null,
        metadata: formData.metadata,
      };

      await api.put(`/api/articles/${selectedArticle._id}`, updateData);
      showToast('Artikel berhasil diupdate', 'success');
      setShowEditModal(false);
      resetForm();
      fetchArticles();
    } catch (error) {
      console.error('Update error:', error.response || error);
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

  // Bulk delete functions
  const toggleSelectArticle = (articleId) => {
    setSelectedArticles(prev =>
      prev.includes(articleId)
        ? prev.filter(id => id !== articleId)
        : [...prev, articleId]
    );
  };

  const toggleSelectAll = () => {
    if (selectedArticles.length === articles.length) {
      setSelectedArticles([]);
    } else {
      setSelectedArticles(articles.map(article => article._id));
    }
  };

  const handleBulkDelete = async () => {
    try {
      await Promise.all(
        selectedArticles.map(id => api.delete(`/api/articles/${id}`))
      );
      showToast(`${selectedArticles.length} artikel berhasil dihapus`, 'success');
      setShowBulkDeleteModal(false);
      setSelectedArticles([]);
      setIsSelectMode(false);
      fetchArticles();
    } catch (error) {
      showToast(error.response?.data?.message || 'Gagal menghapus artikel', 'error');
    }
  };

  const cancelSelectMode = () => {
    setIsSelectMode(false);
    setSelectedArticles([]);
  };

  const handleSubmitForApproval = async (articleId) => {
    try {
      await api.patch(`/api/articles/${articleId}/submit`);
      showToast('Artikel berhasil diajukan untuk approval', 'success');
      fetchArticles();
    } catch (error) {
      showToast(error.response?.data?.message || 'Gagal submit artikel', 'error');
    }
  };

  const handleApproveArticle = async (articleId) => {
    try {
      await api.patch(`/api/articles/${articleId}/approve`);
      showToast('Artikel berhasil disetujui', 'success');
      fetchArticles();
    } catch (error) {
      showToast(error.response?.data?.message || 'Gagal approve artikel', 'error');
    }
  };

  const handleRejectArticle = async (articleId) => {
    try {
      await api.patch(`/api/articles/${articleId}/reject`);
      showToast('Artikel ditolak', 'success');
      fetchArticles();
    } catch (error) {
      showToast(error.response?.data?.message || 'Gagal reject artikel', 'error');
    }
  };

  const handleUnpublishArticle = async (articleId) => {
    try {
      await api.patch(`/api/articles/${articleId}/unpublish`);
      showToast('Artikel berhasil di-unpublish', 'success');
      fetchArticles();
    } catch (error) {
      showToast(error.response?.data?.message || 'Gagal unpublish artikel', 'error');
    }
  };

  const openEditModal = (article) => {
    setSelectedArticle(article);
    setFormData({
      title: article.title,
      content: article.content,
      excerpt: article.excerpt,
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

  const openPreviewModal = (article) => {
    setSelectedArticle(article);
    setShowPreviewModal(true);
  };

  const openDeleteModal = (article) => {
    setSelectedArticle(article);
    setShowDeleteModal(true);
  };

  const resetForm = () => {
    setFormData({
      title: '',
      content: '',
      excerpt: '',
      categoryJurusan: '',
      categoryTopik: '',
      featuredImage: '',
      status: 'draft',
      metadata: { rank: '', level: '', studentName: '' },
    });
    setSelectedArticle(null);
  };

  const showToast = (message, type) => {
    setToast({ message, type });
  };

  const getStatusBadge = (status) => {
    const badges = {
      draft: 'bg-gray-100 text-gray-800',
      pending: 'bg-yellow-100 text-yellow-800',
      published: 'bg-green-100 text-green-800',
      rejected: 'bg-red-100 text-red-800',
    };
    const labels = {
      draft: 'Draft',
      pending: 'Pending',
      published: 'Published',
      rejected: 'Rejected',
    };
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${badges[status]}`}>
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

  // Quill modules configuration
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

  return (
    <div className={embedded ? '' : 'space-y-6'}>
      {/* Header */}
      {!embedded ? (
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {isAdmin ? 'Manajemen Artikel' : 'Artikel Saya'}
          </h1>
          <p className="text-gray-600 mt-1">
            {isAdmin ? 'Kelola semua artikel' : 'Kelola artikel yang Anda buat'}
          </p>
        </div>
        <div className="flex items-center gap-3">
          {!isSelectMode ? (
            <>
              <button
                onClick={() => setIsSelectMode(true)}
                className="flex items-center gap-2 bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
                <span>Pilih Multiple</span>
              </button>
              <button
                onClick={() => setShowCreateModal(true)}
                className="flex items-center gap-2 bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700"
              >
                <span className="text-xl">+</span>
                <span>Buat Artikel</span>
              </button>
            </>
          ) : (
            <>
              <span className="text-sm text-gray-600 font-medium">
                {selectedArticles.length} artikel dipilih
              </span>
              <button
                onClick={toggleSelectAll}
                className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
              >
                {selectedArticles.length === articles.length ? 'Batal Pilih Semua' : 'Pilih Semua'}
              </button>
              {selectedArticles.length > 0 && (
                <button
                  onClick={() => setShowBulkDeleteModal(true)}
                  className="flex items-center gap-2 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                  <span>Hapus ({selectedArticles.length})</span>
                </button>
              )}
              <button
                onClick={cancelSelectMode}
                className="flex items-center gap-2 bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600"
              >
                Batal
              </button>
            </>
          )}
        </div>
      </div>
      ) : (
      <div className="flex items-center justify-end gap-2 mb-4">
        {!isSelectMode ? (
          <>
            <button
              onClick={() => setIsSelectMode(true)}
              className="flex items-center gap-2 bg-gray-600 text-white px-3 py-2 rounded-lg hover:bg-gray-700 text-sm"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              <span>Pilih</span>
            </button>
            <button
              onClick={() => setShowCreateModal(true)}
              className="flex items-center gap-2 bg-primary-600 text-white px-3 py-2 rounded-lg hover:bg-primary-700 text-sm"
            >
              <span>+</span>
              <span>Buat Artikel</span>
            </button>
          </>
        ) : (
          <>
            <span className="text-sm text-gray-600 font-medium">{selectedArticles.length} dipilih</span>
            <button onClick={toggleSelectAll} className="flex items-center gap-2 bg-blue-600 text-white px-3 py-2 rounded-lg hover:bg-blue-700 text-sm">
              {selectedArticles.length === articles.length ? 'Batal Semua' : 'Pilih Semua'}
            </button>
            {selectedArticles.length > 0 && (
              <button onClick={() => setShowBulkDeleteModal(true)} className="flex items-center gap-2 bg-red-600 text-white px-3 py-2 rounded-lg hover:bg-red-700 text-sm">
                Hapus ({selectedArticles.length})
              </button>
            )}
            <button onClick={cancelSelectMode} className="flex items-center gap-2 bg-gray-500 text-white px-3 py-2 rounded-lg hover:bg-gray-600 text-sm">
              Batal
            </button>
          </>
        )}
      </div>
      )}

      {/* Search + Filter */}
      <div className="bg-white rounded-lg shadow p-6">
        {/* Search Bar + Filter Button */}
        <div className="flex gap-3">
          {/* Search - Full Width */}
          <input
            type="text"
            placeholder="🔍 Cari judul artikel..."
            value={filters.search}
            onChange={(e) => setFilters({ ...filters, search: e.target.value })}
            className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-base"
          />

          {/* Filter Button */}
          <div className="relative filter-dropdown-container">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowFilterDropdown(!showFilterDropdown);
              }}
              className="flex items-center gap-2 px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors whitespace-nowrap"
            >
              <span className="text-lg">🎯</span>
              <span className="font-medium">Filter</span>
              {getActiveFiltersCount() > 0 && (
                <span className="ml-1 px-2 py-0.5 bg-primary-600 text-white text-xs rounded-full">
                  {getActiveFiltersCount()}
                </span>
              )}
            </button>

            {/* Filter Dropdown */}
            {showFilterDropdown && (
              <div 
                className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-xl border border-gray-200 z-20 max-h-96 overflow-y-auto"
                onClick={(e) => e.stopPropagation()} // Prevent dropdown from closing when clicking inside
              >
                <div className="p-4">
                  {/* Header */}
                  <div className="flex items-center justify-between mb-4 pb-3 border-b sticky top-0 bg-white z-10">
                    <h3 className="font-semibold text-gray-900">Filter Artikel</h3>
                    <button
                      onClick={() => setShowFilterDropdown(false)}
                      className="px-4 py-1.5 bg-primary-600 text-white text-sm rounded-lg hover:bg-primary-700 transition-colors"
                    >
                      Apply
                    </button>
                  </div>

                  {/* Time Range Section */}
                  <div className="mb-5">
                    <h4 className="text-sm font-medium text-gray-700 mb-2">📅 Berdasarkan Waktu</h4>
                    <div className="space-y-2">
                      {[
                        { value: '', label: 'Semua Waktu' },
                        { value: 'today', label: 'Hari Ini' },
                        { value: 'week', label: 'Minggu Ini' },
                        { value: 'month', label: 'Bulan Ini' },
                        { value: 'year', label: 'Tahun Ini' },
                      ].map((option) => (
                        <label key={option.value} className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-2 rounded">
                          <input
                            type="radio"
                            name="timeRange"
                            checked={filters.timeRange === option.value}
                            onChange={() => setFilters({ ...filters, timeRange: option.value })}
                            className="w-4 h-4 text-primary-600"
                          />
                          <span className="text-sm text-gray-700">{option.label}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Jurusan Section */}
                  <div className="mb-5">
                    <h4 className="text-sm font-medium text-gray-700 mb-2">
                      📁 Jurusan {filters.categoryJurusan.length > 0 && `(${filters.categoryJurusan.length} dipilih)`}
                    </h4>
                    <div className="space-y-2 max-h-32 overflow-y-auto">
                      {jurusans.length > 0 ? (
                        jurusans.map((jurusan) => (
                          <label key={jurusan._id} className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-2 rounded">
                            <input
                              type="checkbox"
                              checked={filters.categoryJurusan.includes(jurusan._id)}
                              onChange={() => toggleArrayFilter('categoryJurusan', jurusan._id)}
                              className="w-4 h-4 text-primary-600 rounded"
                            />
                            <span className="text-sm text-gray-700">{jurusan.code} - {jurusan.name}</span>
                          </label>
                        ))
                      ) : (
                        <p className="text-sm text-gray-500 italic">Belum ada jurusan</p>
                      )}
                    </div>
                  </div>

                  {/* Topik Section */}
                  <div className="mb-5">
                    <h4 className="text-sm font-medium text-gray-700 mb-2">
                      🏷️ Topik {filters.categoryTopik.length > 0 && `(${filters.categoryTopik.length} dipilih)`}
                    </h4>
                    <div className="space-y-2 max-h-32 overflow-y-auto">
                      {categories.filter(cat => cat.type === 'topik').length > 0 ? (
                        categories.filter(cat => cat.type === 'topik').map((cat) => (
                          <label key={cat._id} className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-2 rounded">
                            <input
                              type="checkbox"
                              checked={filters.categoryTopik.includes(cat._id)}
                              onChange={() => toggleArrayFilter('categoryTopik', cat._id)}
                              className="w-4 h-4 text-primary-600 rounded"
                            />
                            <span className="text-sm text-gray-700">{cat.name}</span>
                          </label>
                        ))
                      ) : (
                        <p className="text-sm text-gray-500 italic">Belum ada kategori topik</p>
                      )}
                    </div>
                  </div>

                  {/* Status Section */}
                  <div className="mb-3">
                    <h4 className="text-sm font-medium text-gray-700 mb-2">
                      📊 Status {filters.status.length > 0 && `(${filters.status.length} dipilih)`}
                    </h4>
                    <div className="space-y-2">
                      {[
                        { value: 'draft', label: 'Draft' },
                        { value: 'pending', label: 'Pending' },
                        { value: 'published', label: 'Published' },
                        { value: 'rejected', label: 'Rejected' },
                      ].map((option) => (
                        <label key={option.value} className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-2 rounded">
                          <input
                            type="checkbox"
                            checked={filters.status.includes(option.value)}
                            onChange={() => toggleArrayFilter('status', option.value)}
                            className="w-4 h-4 text-primary-600 rounded"
                          />
                          <span className="text-sm text-gray-700">{option.label}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Clear All Button at Bottom */}
                  {getActiveFiltersCount() > 0 && (
                    <div className="mt-4 pt-3 border-t sticky bottom-0 bg-white">
                      <button
                        onClick={clearAllFilters}
                        className="w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors font-medium"
                      >
                        Clear All Filters
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Active Filters Display */}
        {getActiveFiltersCount() > 0 && (
          <div className="mt-4 flex flex-wrap gap-2">
            <span className="text-sm text-gray-600">Filter aktif:</span>
            
            {filters.search && (
              <span className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                🔍 "{filters.search}"
                <button
                  onClick={() => setFilters({ ...filters, search: '' })}
                  className="hover:text-blue-900 font-bold"
                >
                  ✕
                </button>
              </span>
            )}
            
            {filters.timeRange && (
              <span className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">
                📅 {filters.timeRange === 'today' ? 'Hari Ini' : filters.timeRange === 'week' ? 'Minggu Ini' : filters.timeRange === 'month' ? 'Bulan Ini' : 'Tahun Ini'}
                <button
                  onClick={() => setFilters({ ...filters, timeRange: '' })}
                  className="hover:text-green-900 font-bold"
                >
                  ✕
                </button>
              </span>
            )}
            
            {filters.categoryJurusan.map(jurusanId => {
              const jurusan = jurusans.find(j => j._id === jurusanId);
              return jurusan ? (
                <span key={jurusanId} className="inline-flex items-center gap-1 px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm">
                  📁 {jurusan.code} - {jurusan.name}
                  <button
                    onClick={() => toggleArrayFilter('categoryJurusan', jurusanId)}
                    className="hover:text-purple-900 font-bold"
                  >
                    ✕
                  </button>
                </span>
              ) : null;
            })}
            
            {filters.categoryTopik.map(catId => {
              const cat = categories.find(c => c._id === catId);
              return cat ? (
                <span key={catId} className="inline-flex items-center gap-1 px-3 py-1 bg-indigo-100 text-indigo-800 rounded-full text-sm">
                  🏷️ {cat.name}
                  <button
                    onClick={() => toggleArrayFilter('categoryTopik', catId)}
                    className="hover:text-indigo-900 font-bold"
                  >
                    ✕
                  </button>
                </span>
              ) : null;
            })}
            
            {filters.status.map(status => (
              <span key={status} className="inline-flex items-center gap-1 px-3 py-1 bg-orange-100 text-orange-800 rounded-full text-sm">
                📊 {status === 'draft' ? 'Draft' : status === 'pending' ? 'Pending' : status === 'published' ? 'Published' : 'Rejected'}
                <button
                  onClick={() => toggleArrayFilter('status', status)}
                  className="hover:text-orange-900 font-bold"
                >
                  ✕
                </button>
              </span>
            ))}
            
            <button
              onClick={clearAllFilters}
              className="text-sm text-red-600 hover:text-red-800 font-medium"
            >
              Clear All
            </button>
          </div>
        )}
      </div>

      {/* Articles Grid */}
      {!loading && (
        <div className="mb-4 flex items-center justify-between">
          <p className="text-sm text-gray-600">
            Menampilkan {articles.length} dari {pagination.total} artikel
          </p>
          {pagination.pages > 1 && (
            <p className="text-sm text-gray-600">
              Halaman {pagination.page} dari {pagination.pages}
            </p>
          )}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          <div className="col-span-3 p-8 text-center text-gray-500">Loading...</div>
        ) : articles.length === 0 ? (
          <div className="col-span-3 p-8 text-center text-gray-500">
            Belum ada artikel
          </div>
        ) : (
          articles.map((article) => (
            <div
              key={article._id}
              onClick={() => isSelectMode && toggleSelectArticle(article._id)}
              className={`bg-white rounded-lg shadow hover:shadow-lg transition-all relative ${
                isSelectMode ? 'cursor-pointer' : ''
              } ${
                isSelectMode && selectedArticles.includes(article._id) ? 'ring-2 ring-blue-500' : ''
              }`}
            >
              {/* Select Mode Checkbox Overlay */}
              {isSelectMode && (
                <div className="absolute top-2 left-2 z-10 pointer-events-none">
                  <input
                    type="checkbox"
                    checked={selectedArticles.includes(article._id)}
                    onChange={() => {}}
                    className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                </div>
              )}

              {/* Featured Image */}
              {article.featuredImage && (
                <div className="relative overflow-hidden rounded-t-lg">
                  <img
                    src={typeof article.featuredImage === 'string' ? article.featuredImage : article.featuredImage.url}
                    alt={article.title}
                    className="w-full h-48 object-cover"
                  />
                </div>
              )}

              {/* Content */}
              <div className="p-4">
                {/* Header: Status Badge + Dropdown Menu */}
                <div className="flex items-start justify-between mb-2">
                  {getStatusBadge(article.status)}
                  
                  {/* 3-Dot Dropdown Menu */}
                  {!isSelectMode && (
                    <div className="relative">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setOpenDropdown(openDropdown === article._id ? null : article._id);
                        }}
                        className="p-1 hover:bg-gray-100 rounded-full transition-colors"
                      >
                        <span className="text-xl text-gray-600">⋮</span>
                      </button>

                    {/* Dropdown Menu */}
                    {openDropdown === article._id && (
                      <div className="absolute right-0 mt-1 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
                        <div className="py-1">
                          {/* Preview */}
                          <button
                            onClick={() => {
                              openPreviewModal(article);
                              setOpenDropdown(null);
                            }}
                            className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
                          >
                            <span>👁️</span>
                            <span>Preview</span>
                          </button>

                          {/* Edit */}
                          {canEdit(article) && (
                            <button
                              onClick={() => {
                                openEditModal(article);
                                setOpenDropdown(null);
                              }}
                              className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
                            >
                              <span>✏️</span>
                              <span>Edit</span>
                            </button>
                          )}

                          {/* Submit for Approval (Siswa) */}
                          {!isAdmin && article.status === 'draft' && article.author._id === user.id && (
                            <button
                              onClick={() => {
                                handleSubmitForApproval(article._id);
                                setOpenDropdown(null);
                              }}
                              className="w-full px-4 py-2 text-left text-sm text-green-700 hover:bg-green-50 flex items-center gap-2"
                            >
                              <span>📤</span>
                              <span>Submit for Approval</span>
                            </button>
                          )}

                          {/* Publish (Admin untuk draft) */}
                          {isAdmin && article.status === 'draft' && (
                            <button
                              onClick={() => {
                                handleApproveArticle(article._id);
                                setOpenDropdown(null);
                              }}
                              className="w-full px-4 py-2 text-left text-sm text-green-700 hover:bg-green-50 flex items-center gap-2"
                            >
                              <span>✓</span>
                              <span>Publish</span>
                            </button>
                          )}

                          {/* Approve (Admin untuk pending) */}
                          {isAdmin && article.status === 'pending' && (
                            <button
                              onClick={() => {
                                handleApproveArticle(article._id);
                                setOpenDropdown(null);
                              }}
                              className="w-full px-4 py-2 text-left text-sm text-green-700 hover:bg-green-50 flex items-center gap-2"
                            >
                              <span>✓</span>
                              <span>Approve & Publish</span>
                            </button>
                          )}

                          {/* Reject (Admin untuk draft dan pending) */}
                          {isAdmin && (article.status === 'pending' || article.status === 'draft') && (
                            <button
                              onClick={() => {
                                handleRejectArticle(article._id);
                                setOpenDropdown(null);
                              }}
                              className="w-full px-4 py-2 text-left text-sm text-red-700 hover:bg-red-50 flex items-center gap-2"
                            >
                              <span>✕</span>
                              <span>Reject</span>
                            </button>
                          )}

                          {/* Unpublish (Admin) */}
                          {isAdmin && article.status === 'published' && (
                            <button
                              onClick={() => {
                                handleUnpublishArticle(article._id);
                                setOpenDropdown(null);
                              }}
                              className="w-full px-4 py-2 text-left text-sm text-orange-700 hover:bg-orange-50 flex items-center gap-2"
                            >
                              <span>⏸️</span>
                              <span>Unpublish</span>
                            </button>
                          )}

                          {/* Divider */}
                          {canDelete(article) && (
                            <div className="border-t border-gray-200 my-1"></div>
                          )}

                          {/* Delete */}
                          {canDelete(article) && (
                            <button
                              onClick={() => {
                                openDeleteModal(article);
                                setOpenDropdown(null);
                              }}
                              className="w-full px-4 py-2 text-left text-sm text-red-700 hover:bg-red-50 flex items-center gap-2"
                            >
                              <span>🗑️</span>
                              <span>Hapus</span>
                            </button>
                          )}
                        </div>
                      </div>
                    )}
                    </div>
                  )}
                </div>

                {/* Title */}
                <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
                  {article.title}
                </h3>

                {/* Excerpt */}
                <p className="text-sm text-gray-600 mb-3 line-clamp-3">
                  {article.excerpt}
                </p>

                {/* Date */}
                <div className="text-xs text-gray-500 mb-3">
                  📅 {formatDate(article.createdAt)}
                </div>

                {/* Meta: Categories + Author */}
                <div className="flex items-center text-xs text-gray-500">
                  {article.categoryJurusan && (
                    <>
                      <span>📁 {article.categoryJurusan.name}</span>
                      <span className="mx-2">•</span>
                    </>
                  )}
                  {article.categoryTopik && (
                    <>
                      <span>🏷️ {article.categoryTopik.name}</span>
                      <span className="mx-2">•</span>
                    </>
                  )}
                  <span>✍️ {article.author?.name}</span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Pagination */}
      {!loading && articles.length > 0 && (
        <Pagination
          currentPage={pagination.page}
          totalPages={pagination.pages}
          onPageChange={(page) => setPagination({ ...pagination, page })}
        />
      )}

      {/* Create/Edit Modal */}
      <Modal
        isOpen={showCreateModal || showEditModal}
        onClose={() => {
          showCreateModal ? setShowCreateModal(false) : setShowEditModal(false);
          resetForm();
        }}
        title={showCreateModal ? 'Buat Artikel Baru' : 'Edit Artikel'}
        size="xl"
      >
        <form
          onSubmit={showCreateModal ? handleCreateArticle : handleUpdateArticle}
          className="space-y-4"
        >
          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Judul Artikel *
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
              placeholder="Masukkan judul artikel..."
            />
          </div>

          {/* Category Jurusan (Optional) */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Kategori Jurusan (Opsional)
            </label>
            <select
              value={formData.categoryJurusan}
              onChange={(e) => setFormData({ ...formData, categoryJurusan: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
            >
              <option value="">Pilih Jurusan (Opsional)</option>
              {jurusans.map((jurusan) => (
                <option key={jurusan._id} value={jurusan._id}>
                  {jurusan.code} - {jurusan.name}
                </option>
              ))}
            </select>
          </div>

          {/* Category Topik (Optional) */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Kategori Topik (Opsional)
            </label>
            <select
              value={formData.categoryTopik}
              onChange={(e) => setFormData({ ...formData, categoryTopik: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
            >
              <option value="">Pilih Topik (Opsional)</option>
              {categories.filter(cat => cat.type === 'topik').map((cat) => (
                <option key={cat._id} value={cat._id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          {/* Prestasi Metadata — conditional on topik slug */}
          {(() => {
            const selectedTopik = categories.find(c => c._id === formData.categoryTopik);
            if (selectedTopik?.slug?.toLowerCase() !== 'prestasi') return null;
            return (
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 space-y-3">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-lg">🏆</span>
                  <span className="text-sm font-semibold text-amber-800">Informasi Prestasi</span>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-amber-700 mb-1">Peringkat</label>
                    <select
                      value={formData.metadata.rank}
                      onChange={(e) => setFormData({ ...formData, metadata: { ...formData.metadata, rank: e.target.value } })}
                      className="w-full px-3 py-2 border border-amber-200 rounded-lg text-sm focus:ring-2 focus:ring-amber-400 bg-white"
                    >
                      <option value="">Pilih peringkat...</option>
                      <option value="Juara I">Juara I</option>
                      <option value="Juara II">Juara II</option>
                      <option value="Juara III">Juara III</option>
                      <option value="Harapan I">Harapan I</option>
                      <option value="Harapan II">Harapan II</option>
                      <option value="Medali Emas">Medali Emas</option>
                      <option value="Medali Perak">Medali Perak</option>
                      <option value="Medali Perunggu">Medali Perunggu</option>
                      <option value="Finalis">Finalis</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-amber-700 mb-1">Tingkat</label>
                    <select
                      value={formData.metadata.level}
                      onChange={(e) => setFormData({ ...formData, metadata: { ...formData.metadata, level: e.target.value } })}
                      className="w-full px-3 py-2 border border-amber-200 rounded-lg text-sm focus:ring-2 focus:ring-amber-400 bg-white"
                    >
                      <option value="">Pilih tingkat...</option>
                      <option value="Kabupaten/Kota">Kabupaten/Kota</option>
                      <option value="Provinsi">Provinsi</option>
                      <option value="Nasional">Nasional</option>
                      <option value="Internasional">Internasional</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-amber-700 mb-1">Nama Siswa / Tim</label>
                  <input
                    type="text"
                    value={formData.metadata.studentName}
                    onChange={(e) => setFormData({ ...formData, metadata: { ...formData.metadata, studentName: e.target.value } })}
                    className="w-full px-3 py-2 border border-amber-200 rounded-lg text-sm focus:ring-2 focus:ring-amber-400 bg-white"
                    placeholder="Contoh: Imanuel Damanik / Tim A"
                  />
                </div>
              </div>
            );
          })()}

          {/* Excerpt */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Ringkasan (Excerpt)
            </label>
            <textarea
              value={formData.excerpt}
              onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
              rows={3}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
              placeholder="Ringkasan singkat artikel..."
            />
          </div>

          {/* Content */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Konten Artikel *
            </label>
            <ReactQuill
              theme="snow"
              value={formData.content}
              onChange={(content) => setFormData({ ...formData, content })}
              modules={quillModules}
              className="bg-white"
              style={{ height: '300px', marginBottom: '50px' }}
            />
          </div>

          {/* Featured Image */}
          <ImageUpload
            label="Gambar Unggulan"
            value={formData.featuredImage}
            onChange={(url) => setFormData({ ...formData, featuredImage: url })}
            folder="smk-kristen5/articles"
            previewClassName="h-48 w-full object-cover"
          />

          {/* Buttons */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={() => {
                showCreateModal ? setShowCreateModal(false) : setShowEditModal(false);
                resetForm();
              }}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Batal
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
            >
              {showCreateModal ? 'Buat Artikel' : 'Update Artikel'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Preview Modal */}
      <Modal
        isOpen={showPreviewModal}
        onClose={() => {
          setShowPreviewModal(false);
          setSelectedArticle(null);
        }}
        title="Preview Artikel"
        size="xl"
      >
        {selectedArticle && (
          <div className="prose max-w-none">
            {selectedArticle.featuredImage && (
              <img
                src={typeof selectedArticle.featuredImage === 'string' ? selectedArticle.featuredImage : selectedArticle.featuredImage.url}
                alt={selectedArticle.title}
                className="w-full h-64 object-cover rounded-lg mb-4"
              />
            )}
            <h1>{selectedArticle.title}</h1>
            <div className="text-sm text-gray-600 mb-4">
              {selectedArticle.categoryJurusan && (
                <>
                  📁 {selectedArticle.categoryJurusan.name}
                  {' • '}
                </>
              )}
              {selectedArticle.categoryTopik && (
                <>
                  🏷️ {selectedArticle.categoryTopik.name}
                  {' • '}
                </>
              )}
              ✍️ {selectedArticle.author?.name}
            </div>
            <div dangerouslySetInnerHTML={{ __html: selectedArticle.content }} />
          </div>
        )}
      </Modal>

      {/* Delete Modal */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false);
          setSelectedArticle(null);
        }}
        title="Konfirmasi Hapus"
        size="sm"
      >
        <div className="space-y-4">
          <p className="text-gray-600">
            Apakah Anda yakin ingin menghapus artikel{' '}
            <span className="font-semibold">"{selectedArticle?.title}"</span>?
          </p>
          <p className="text-sm text-red-600">Aksi ini tidak dapat dibatalkan.</p>
          <div className="flex gap-3 pt-4">
            <button
              onClick={() => {
                setShowDeleteModal(false);
                setSelectedArticle(null);
              }}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Batal
            </button>
            <button
              onClick={handleDeleteArticle}
              className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
            >
              Hapus
            </button>
          </div>
        </div>
      </Modal>

      {/* Bulk Delete Modal */}
      <Modal
        isOpen={showBulkDeleteModal}
        onClose={() => setShowBulkDeleteModal(false)}
        title="Konfirmasi Hapus Multiple"
        size="sm"
      >
        <div className="space-y-4">
          <p className="text-gray-600">
            Apakah Anda yakin ingin menghapus{' '}
            <span className="font-semibold text-red-600">{selectedArticles.length} artikel</span>?
          </p>
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
            <p className="text-sm text-yellow-800">
              ⚠️ <strong>Perhatian:</strong> Semua artikel yang dipilih akan dihapus secara permanen dan tidak dapat dikembalikan.
            </p>
          </div>
          <p className="text-sm text-red-600 font-semibold">Aksi ini tidak dapat dibatalkan!</p>
          <div className="flex gap-3 pt-4">
            <button
              onClick={() => setShowBulkDeleteModal(false)}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Batal
            </button>
            <button
              onClick={handleBulkDelete}
              className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-semibold"
            >
              Hapus {selectedArticles.length} Artikel
            </button>
          </div>
        </div>
      </Modal>

      {/* Toast */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
};

export default Articles;
