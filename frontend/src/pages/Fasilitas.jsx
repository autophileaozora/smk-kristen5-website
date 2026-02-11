import { useState, useEffect } from 'react';
import api from '../services/api';
import ImageUpload from '../components/ImageUpload';

const Fasilitas = () => {
  const [fasilitass, setFasilitass] = useState([]);
  const [jurusans, setJurusans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState('create');
  const [currentFasilitas, setCurrentFasilitas] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [fasilitasToDelete, setFasilitasToDelete] = useState(null);
  const [toast, setToast] = useState(null);

  // Search state
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: 'PUBLIC',
    location: '',
    capacity: '',
    image: '',
    isActive: true,
    displayOrder: 0,
  });

  useEffect(() => {
    fetchFasilitass();
    fetchJurusans();
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

  const fetchFasilitass = async () => {
    try {
      setLoading(true);
      const response = await api.get('/api/fasilitas');
      setFasilitass(response.data.data.fasilitas);
    } catch (error) {
      showToast(error.response?.data?.message || 'Gagal memuat fasilitas', 'error');
    } finally {
      setLoading(false);
    }
  };

  const fetchJurusans = async () => {
    try {
      const response = await api.get('/api/jurusan');
      setJurusans(response.data.data.jurusans);
    } catch (error) {
      console.error('Gagal memuat jurusan:', error);
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
      description: '',
      category: 'PUBLIC',
      location: '',
      capacity: '',
      image: '',
      isActive: true,
      displayOrder: 0,
    });
    setShowModal(true);
  };

  const openEditModal = (fasilitas) => {
    setModalMode('edit');
    setCurrentFasilitas(fasilitas);
    setFormData({
      name: fasilitas.name,
      description: fasilitas.description,
      category: fasilitas.category,
      location: fasilitas.location || '',
      capacity: fasilitas.capacity || '',
      image: fasilitas.image || '',
      isActive: fasilitas.isActive,
      displayOrder: fasilitas.displayOrder || 0,
    });
    setShowModal(true);
  };

  const openDeleteModal = (fasilitas) => {
    setFasilitasToDelete(fasilitas);
    setShowDeleteModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setCurrentFasilitas(null);
  };

  const closeDeleteModal = () => {
    setShowDeleteModal(false);
    setFasilitasToDelete(null);
  };


  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      if (modalMode === 'create') {
        await api.post('/api/fasilitas', formData);
        showToast('Fasilitas berhasil dibuat!', 'success');
      } else {
        await api.put(`/api/fasilitas/${currentFasilitas._id}`, formData);
        showToast('Fasilitas berhasil diupdate!', 'success');
      }

      fetchFasilitass();
      closeModal();
    } catch (error) {
      showToast(error.response?.data?.message || 'Gagal menyimpan fasilitas', 'error');
    }
  };

  const handleDelete = async () => {
    try {
      await api.delete(`/api/fasilitas/${fasilitasToDelete._id}`);
      showToast('Fasilitas berhasil dihapus!', 'success');
      fetchFasilitass();
      closeDeleteModal();
    } catch (error) {
      showToast(error.response?.data?.message || 'Gagal menghapus fasilitas', 'error');
    }
  };

  const getCategoryLabel = (category) => {
    if (category === 'PUBLIC') return 'Publik (Semua Jurusan)';
    return category;
  };

  // Filter fasilitas based on search query
  const filteredFasilitas = fasilitass.filter(fasilitas => {
    if (!debouncedSearch) return true;

    const query = debouncedSearch.toLowerCase();
    return (
      fasilitas.name.toLowerCase().includes(query) ||
      fasilitas.description.toLowerCase().includes(query) ||
      (fasilitas.location && fasilitas.location.toLowerCase().includes(query)) ||
      getCategoryLabel(fasilitas.category).toLowerCase().includes(query)
    );
  });

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {toast && (
        <div className={`fixed top-4 right-4 z-50 px-6 py-3 rounded-lg shadow-lg ${
          toast.type === 'success' ? 'bg-green-500' : 'bg-red-500'
        } text-white`}>
          {toast.message}
        </div>
      )}

      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Fasilitas</h1>
          <p className="text-gray-600">Kelola data fasilitas sekolah</p>
        </div>
        <button
          onClick={openCreateModal}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          + Tambah Fasilitas
        </button>
      </div>

      {/* Search Bar */}
      <div className="bg-white rounded-lg shadow p-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Cari Fasilitas
        </label>
        <input
          type="text"
          placeholder="Cari berdasarkan nama, kategori, lokasi, atau deskripsi..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-base"
        />
        {searchQuery && (
          <div className="mt-3">
            <button
              onClick={() => setSearchQuery('')}
              className="px-4 py-2 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
            >
              Clear Search
            </button>
          </div>
        )}
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden overflow-x-auto">
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : filteredFasilitas.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            {searchQuery ? 'Tidak ada fasilitas yang sesuai pencarian' : 'Belum ada fasilitas'}
          </div>
        ) : (
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Nama
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Kategori
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Lokasi
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Kapasitas
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Aksi
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredFasilitas.map((fasilitas) => (
                <tr key={fasilitas._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      {fasilitas.image && (
                        <img
                          src={fasilitas.image}
                          alt={fasilitas.name}
                          className="w-10 h-10 rounded-lg object-cover mr-3"
                        />
                      )}
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {fasilitas.name}
                        </div>
                        <div className="text-sm text-gray-500 line-clamp-1">
                          {fasilitas.description}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      fasilitas.category === 'PUBLIC'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-blue-100 text-blue-800'
                    }`}>
                      {getCategoryLabel(fasilitas.category)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {fasilitas.location || '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {fasilitas.capacity || '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      fasilitas.isActive
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {fasilitas.isActive ? 'Aktif' : 'Tidak Aktif'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      onClick={() => openEditModal(fasilitas)}
                      className="text-blue-600 hover:text-blue-900 mr-3"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => openDeleteModal(fasilitas)}
                      className="text-red-600 hover:text-red-900"
                    >
                      Hapus
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
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h2 className="text-xl font-bold mb-4">
                {modalMode === 'create' ? 'Tambah Fasilitas' : 'Edit Fasilitas'}
              </h2>

              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nama Fasilitas *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Deskripsi *
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows="3"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>

                {/* Category */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Kategori *
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  >
                    <option value="PUBLIC">Publik (Semua Jurusan)</option>
                    {jurusans.map((jurusan) => (
                      <option key={jurusan._id} value={jurusan.code}>
                        {jurusan.code} - {jurusan.name}
                      </option>
                    ))}
                  </select>
                  <p className="text-xs text-gray-500 mt-1">
                    Pilih jurusan tertentu atau "Publik" untuk semua jurusan
                  </p>
                </div>

                {/* Location & Capacity */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Lokasi (Opsional)
                    </label>
                    <input
                      type="text"
                      value={formData.location}
                      onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Contoh: Lantai 2, Gedung A"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Kapasitas
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={formData.capacity}
                      onChange={(e) => setFormData({ ...formData, capacity: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Contoh: 30"
                    />
                  </div>
                </div>

                {/* Image */}
                <ImageUpload
                  label="Gambar Fasilitas"
                  value={formData.image}
                  onChange={(url) => setFormData(prev => ({ ...prev, image: url }))}
                  folder="smk-kristen5/fasilitas"
                  previewClassName="h-48 w-full object-cover"
                />

                {/* Display Order */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Urutan Tampilan
                  </label>
                  <input
                    type="number"
                    value={formData.displayOrder}
                    onChange={(e) => setFormData({ ...formData, displayOrder: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                {/* Active Status */}
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="isActive"
                    checked={formData.isActive}
                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <label htmlFor="isActive" className="ml-2 text-sm text-gray-700">
                    Aktif
                  </label>
                </div>

                {/* Buttons */}
                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={closeModal}
                    className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    {modalMode === 'create' ? 'Buat' : 'Simpan'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h2 className="text-xl font-bold mb-4">Konfirmasi Hapus</h2>
            <p className="text-gray-600 mb-6">
              Apakah Anda yakin ingin menghapus fasilitas "{fasilitasToDelete?.name}"?
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={closeDeleteModal}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                Batal
              </button>
              <button
                onClick={handleDelete}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                Hapus
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Fasilitas;
