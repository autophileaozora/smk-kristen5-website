import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import Button from '../components/Button';
import Card from '../components/Card';
import Badge from '../components/Badge';
import LoadingSpinner from '../components/LoadingSpinner';
import EmptyState from '../components/EmptyState';
import Modal from '../components/Modal';
import Toast from '../components/Toast';
import Pagination from '../components/Pagination';

const CustomPages = () => {
  const navigate = useNavigate();

  // State management
  const [pages, setPages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [pageToDelete, setPageToDelete] = useState(null);
  const [toast, setToast] = useState(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    pages: 1,
  });

  // Debounced search
  const [debouncedSearch, setDebouncedSearch] = useState('');

  // Fetch pages on mount and when filters change
  useEffect(() => {
    fetchPages();
  }, [pagination.page, debouncedSearch, statusFilter]);

  // Debounce search input
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchQuery);
      setPagination({ ...pagination, page: 1 }); // Reset to page 1 on search
    }, 500);

    return () => clearTimeout(handler);
  }, [searchQuery]);

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
      setPagination({
        ...pagination,
        ...response.data.data.pagination,
      });
    } catch (error) {
      showToast(error.response?.data?.message || 'Gagal memuat halaman custom', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDuplicate = async (pageId) => {
    try {
      const response = await api.post(`/api/custom-pages/${pageId}/duplicate`);
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

  const openDeleteModal = (page) => {
    setPageToDelete(page);
    setShowDeleteModal(true);
  };

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      draft: { variant: 'default', label: 'Draft' },
      published: { variant: 'success', label: 'Published' },
      archived: { variant: 'warning', label: 'Archived' },
    };

    const config = statusConfig[status] || statusConfig.draft;
    return (
      <Badge variant={config.variant} size="sm">
        {config.label}
      </Badge>
    );
  };

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
    setPagination({ ...pagination, page: 1 });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Custom Pages</h1>
          <p className="text-gray-600 mt-1">Kelola halaman custom untuk website</p>
        </div>
        <Button
          variant="primary"
          onClick={() => navigate('/admin/custom-pages/create')}
          icon={
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
          }
        >
          Buat Halaman
        </Button>
      </div>

      {/* Search and Filter */}
      <Card>
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search */}
          <div className="flex-1">
            <div className="relative">
              <input
                type="text"
                placeholder="Cari judul atau slug..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-4 py-2 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <svg
                className="absolute left-3 top-3 w-5 h-5 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>
          </div>

          {/* Status Filter */}
          <div className="md:w-48">
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setPagination({ ...pagination, page: 1 });
              }}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Semua Status</option>
              <option value="draft">Draft</option>
              <option value="published">Published</option>
              <option value="archived">Archived</option>
            </select>
          </div>

          {/* Clear Filters */}
          {(searchQuery || statusFilter) && (
            <Button variant="ghost" onClick={clearFilters}>
              Clear
            </Button>
          )}
        </div>

        {/* Active Filters */}
        {(searchQuery || statusFilter) && (
          <div className="mt-4 flex flex-wrap gap-2 items-center">
            <span className="text-sm text-gray-600">Filter aktif:</span>
            {searchQuery && (
              <Badge variant="primary">
                Search: "{searchQuery}"
              </Badge>
            )}
            {statusFilter && (
              <Badge variant="info">
                Status: {statusFilter}
              </Badge>
            )}
          </div>
        )}
      </Card>

      {/* Content */}
      {loading ? (
        <LoadingSpinner fullScreen={false} text="Memuat halaman..." />
      ) : pages.length === 0 ? (
        <Card>
          <EmptyState
            icon="📄"
            title="Belum ada halaman custom"
            description={
              searchQuery || statusFilter
                ? 'Tidak ada halaman yang sesuai dengan filter'
                : 'Mulai buat halaman custom pertama Anda'
            }
            action={!searchQuery && !statusFilter ? () => navigate('/admin/custom-pages/create') : clearFilters}
            actionText={!searchQuery && !statusFilter ? 'Buat Halaman' : 'Clear Filter'}
          />
        </Card>
      ) : (
        <>
          {/* Results Info */}
          <div className="flex items-center justify-between text-sm text-gray-600">
            <p>
              Menampilkan {pages.length} dari {pagination.total} halaman
            </p>
            {pagination.pages > 1 && (
              <p>
                Halaman {pagination.page} dari {pagination.pages}
              </p>
            )}
          </div>

          {/* Table */}
          <Card padding="none">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Judul
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Slug
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Dibuat
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Aksi
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {pages.map((page) => (
                    <tr key={page._id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {page.title}
                            </div>
                            {page.description && (
                              <div className="text-xs text-gray-500 line-clamp-1">
                                {page.description}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-600 font-mono">
                          /{page.slug}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getStatusBadge(page.status)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-600">
                          {formatDate(page.createdAt)}
                        </div>
                        {page.createdBy && (
                          <div className="text-xs text-gray-400">
                            oleh {page.createdBy.name}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center justify-end gap-2">
                          {/* View Button */}
                          <button
                            onClick={() => handleViewPage(page)}
                            className="text-blue-600 hover:text-blue-900 p-1.5 rounded hover:bg-blue-50 transition-colors"
                            title="Lihat halaman"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                          </button>

                          {/* Edit Button */}
                          <button
                            onClick={() => navigate(`/admin/custom-pages/${page._id}/edit`)}
                            className="text-green-600 hover:text-green-900 p-1.5 rounded hover:bg-green-50 transition-colors"
                            title="Edit halaman"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                          </button>

                          {/* Duplicate Button */}
                          <button
                            onClick={() => handleDuplicate(page._id)}
                            className="text-purple-600 hover:text-purple-900 p-1.5 rounded hover:bg-purple-50 transition-colors"
                            title="Duplikasi halaman"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                            </svg>
                          </button>

                          {/* Delete Button */}
                          <button
                            onClick={() => openDeleteModal(page)}
                            className="text-red-600 hover:text-red-900 p-1.5 rounded hover:bg-red-50 transition-colors"
                            title="Hapus halaman"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>

          {/* Pagination */}
          {pagination.pages > 1 && (
            <Pagination
              currentPage={pagination.page}
              totalPages={pagination.pages}
              onPageChange={(page) => setPagination({ ...pagination, page })}
            />
          )}
        </>
      )}

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false);
          setPageToDelete(null);
        }}
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
            <Button
              variant="secondary"
              fullWidth
              onClick={() => {
                setShowDeleteModal(false);
                setPageToDelete(null);
              }}
            >
              Batal
            </Button>
            <Button
              variant="danger"
              fullWidth
              onClick={handleDelete}
            >
              Hapus
            </Button>
          </div>
        </div>
      </Modal>

      {/* Toast Notification */}
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

export default CustomPages;
