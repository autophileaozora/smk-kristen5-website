import { useState, useEffect } from 'react';
import api from '../services/api';

const Categories = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState('create'); // 'create' or 'edit'
  const [currentCategory, setCurrentCategory] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState(null);
  const [toast, setToast] = useState(null);

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    type: 'topik', // 'jurusan' or 'topik'
    description: '',
  });

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [filterType, setFilterType] = useState(''); // '' = all, 'jurusan', 'topik'

  useEffect(() => {
    fetchCategories();
  }, []);

  // Debounce search input (wait 500ms after user stops typing)
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 500);

    return () => {
      clearTimeout(handler);
    };
  }, [searchQuery]);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const response = await api.get('/api/categories');
      setCategories(response.data.data.categories);
    } catch (error) {
      showToast(error.response?.data?.message || 'Gagal memuat kategori', 'error');
    } finally {
      setLoading(false);
    }
  };

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const openCreateModal = () => {
    setModalMode('create');
    setFormData({
      name: '',
      slug: '',
      type: 'topik',
      description: '',
    });
    setShowModal(true);
  };

  const openEditModal = (category) => {
    setModalMode('edit');
    setCurrentCategory(category);
    setFormData({
      name: category.name,
      slug: category.slug,
      type: category.type,
      description: category.description || '',
    });
    setShowModal(true);
  };

  const openDeleteModal = (category) => {
    setCategoryToDelete(category);
    setShowDeleteModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setCurrentCategory(null);
  };

  const closeDeleteModal = () => {
    setShowDeleteModal(false);
    setCategoryToDelete(null);
  };

  // Auto-generate slug from name
  const handleNameChange = (e) => {
    const name = e.target.value;
    const slug = name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
    
    setFormData({ ...formData, name, slug });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      if (modalMode === 'create') {
        await api.post('/api/categories', formData);
        showToast('Kategori berhasil dibuat!', 'success');
      } else {
        await api.put(`/api/categories/${currentCategory._id}`, formData);
        showToast('Kategori berhasil diupdate!', 'success');
      }

      fetchCategories();
      closeModal();
    } catch (error) {
      showToast(error.response?.data?.message || 'Gagal menyimpan kategori', 'error');
    }
  };

  const handleDelete = async () => {
    try {
      await api.delete(`/api/categories/${categoryToDelete._id}`);
      showToast('Kategori berhasil dihapus!', 'success');
      fetchCategories();
      closeDeleteModal();
    } catch (error) {
      showToast(error.response?.data?.message || 'Gagal menghapus kategori', 'error');
    }
  };

  // Filter categories
  const filteredCategories = categories.filter(cat => {
    // Filter by type
    if (filterType && cat.type !== filterType) {
      return false;
    }

    // Filter by search query
    if (debouncedSearch) {
      const query = debouncedSearch.toLowerCase();
      return (
        cat.name.toLowerCase().includes(query) ||
        cat.slug.toLowerCase().includes(query) ||
        (cat.description && cat.description.toLowerCase().includes(query))
      );
    }

    return true;
  });

  return (
    <div className="p-6">
      {/* Toast Notification */}
      {toast && (
        <div className={`fixed top-4 right-4 z-50 px-6 py-3 rounded-lg shadow-lg ${
          toast.type === 'success' ? 'bg-green-500' : 'bg-red-500'
        } text-white`}>
          {toast.message}
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Manajemen Kategori</h1>
          <p className="text-gray-600 mt-1">Kelola kategori artikel (Jurusan & Topik)</p>
        </div>
        <button
          onClick={openCreateModal}
          className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
        >
          <span className="text-xl">➕</span>
          <span>Tambah Kategori</span>
        </button>
      </div>

      {/* Search and Filter */}
      <div className="bg-white rounded-lg shadow mb-6 p-6">
        {/* Search Bar */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Cari Kategori
          </label>
          <input
            type="text"
            placeholder="Cari berdasarkan nama, slug, atau deskripsi..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-base"
          />
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-2">
          <button
            onClick={() => setFilterType('')}
            className={`px-4 py-2 rounded-lg transition-colors ${
              filterType === ''
                ? 'bg-primary-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Semua ({categories.length})
          </button>
          <button
            onClick={() => setFilterType('jurusan')}
            className={`px-4 py-2 rounded-lg transition-colors ${
              filterType === 'jurusan'
                ? 'bg-primary-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            📁 Jurusan ({categories.filter(c => c.type === 'jurusan').length})
          </button>
          <button
            onClick={() => setFilterType('topik')}
            className={`px-4 py-2 rounded-lg transition-colors ${
              filterType === 'topik'
                ? 'bg-primary-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            🏷️ Topik ({categories.filter(c => c.type === 'topik').length})
          </button>
        </div>

        {/* Reset Filter Button */}
        {(filterType || searchQuery) && (
          <div className="mt-4">
            <button
              onClick={() => {
                setFilterType('');
                setSearchQuery('');
              }}
              className="px-4 py-2 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
            >
              Reset Filter
            </button>
          </div>
        )}
      </div>

      {/* Categories Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden overflow-x-auto">
        {loading ? (
          <div className="p-8 text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
            <p className="mt-2 text-gray-600">Memuat kategori...</p>
          </div>
        ) : filteredCategories.length === 0 ? (
          <div className="p-8 text-center">
            <p className="text-gray-500">Belum ada kategori</p>
          </div>
        ) : (
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Nama
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Slug
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tipe
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Deskripsi
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Aksi
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredCategories.map((category) => (
                <tr key={category._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <span className="text-2xl mr-2">
                        {category.type === 'jurusan' ? '📁' : '🏷️'}
                      </span>
                      <span className="text-sm font-medium text-gray-900">
                        {category.name}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm text-gray-500 font-mono">
                      {category.slug}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      category.type === 'jurusan'
                        ? 'bg-purple-100 text-purple-800'
                        : 'bg-blue-100 text-blue-800'
                    }`}>
                      {category.type === 'jurusan' ? 'Jurusan' : 'Topik'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-sm text-gray-500 line-clamp-2">
                      {category.description || '-'}
                    </p>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      onClick={() => openEditModal(category)}
                      className="text-blue-600 hover:text-blue-900 mr-3"
                    >
                      ✏️ Edit
                    </button>
                    <button
                      onClick={() => openDeleteModal(category)}
                      className="text-red-600 hover:text-red-900"
                    >
                      🗑️ Hapus
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Create/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
            {/* Background overlay */}
            <div
              className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75"
              onClick={closeModal}
            ></div>

            {/* Modal panel */}
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <form onSubmit={handleSubmit}>
                {/* Header */}
                <div className="bg-white px-6 py-4 border-b">
                  <h3 className="text-lg font-semibold text-gray-900">
                    {modalMode === 'create' ? '➕ Tambah Kategori' : '✏️ Edit Kategori'}
                  </h3>
                </div>

                {/* Body */}
                <div className="bg-white px-6 py-4 space-y-4">
                  {/* Name */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Nama Kategori *
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={handleNameChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      placeholder="Contoh: Teknik Komputer Jaringan"
                      required
                    />
                  </div>

                  {/* Slug */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Slug (URL-friendly) *
                    </label>
                    <input
                      type="text"
                      value={formData.slug}
                      onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent font-mono text-sm"
                      placeholder="teknik-komputer-jaringan"
                      required
                    />
                    <p className="mt-1 text-xs text-gray-500">
                      Otomatis dibuat dari nama, bisa diedit manual
                    </p>
                  </div>

                  {/* Type */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Tipe *
                    </label>
                    <select
                      value={formData.type}
                      onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      required
                    >
                      <option value="jurusan">📁 Jurusan</option>
                      <option value="topik">🏷️ Topik</option>
                    </select>
                    <p className="mt-1 text-xs text-gray-500">
                      Jurusan: TKJ, RPL, MM, dll. | Topik: Berita, Pengumuman, Tutorial, dll.
                    </p>
                  </div>

                  {/* Description */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Deskripsi
                    </label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      placeholder="Deskripsi singkat tentang kategori ini..."
                    />
                  </div>
                </div>

                {/* Footer */}
                <div className="bg-gray-50 px-6 py-4 flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={closeModal}
                    className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                  >
                    {modalMode === 'create' ? '➕ Tambah' : '💾 Simpan'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && categoryToDelete && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
            {/* Background overlay */}
            <div
              className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75"
              onClick={closeDeleteModal}
            ></div>

            {/* Modal panel */}
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="bg-white px-6 py-4">
                <div className="flex items-center mb-4">
                  <span className="text-4xl mr-3">⚠️</span>
                  <h3 className="text-lg font-semibold text-gray-900">
                    Hapus Kategori?
                  </h3>
                </div>
                <p className="text-gray-600 mb-4">
                  Apakah Anda yakin ingin menghapus kategori <strong>{categoryToDelete.name}</strong>?
                </p>
                <p className="text-sm text-red-600">
                  ⚠️ Kategori yang masih digunakan oleh artikel tidak bisa dihapus!
                </p>
              </div>

              <div className="bg-gray-50 px-6 py-4 flex justify-end gap-3">
                <button
                  onClick={closeDeleteModal}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Batal
                </button>
                <button
                  onClick={handleDelete}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  🗑️ Hapus
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Categories;
