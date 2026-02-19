import { useState, useEffect } from 'react';
import api from '../services/api';

const MataPelajaran = ({ embedded = false }) => {
  const [mataPelajarans, setMataPelajarans] = useState([]);
  const [jurusans, setJurusans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState('create');
  const [currentMataPelajaran, setCurrentMataPelajaran] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [mataPelajaranToDelete, setMataPelajaranToDelete] = useState(null);
  const [toast, setToast] = useState(null);

  // Search state
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: 'PUBLIC',
    semester: '',
    hoursPerWeek: '',
    image: null,
    isActive: true,
    displayOrder: 0,
  });

  // Preview image
  const [imagePreview, setImagePreview] = useState(null);
  const [uploadingImage, setUploadingImage] = useState(false);

  useEffect(() => {
    fetchMataPelajarans();
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

  const fetchMataPelajarans = async () => {
    try {
      setLoading(true);
      const response = await api.get('/api/mata-pelajaran');
      setMataPelajarans(response.data.data.mataPelajaran);
    } catch (error) {
      showToast(error.response?.data?.message || 'Gagal memuat mata pelajaran', 'error');
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
      semester: '',
      hoursPerWeek: '',
      image: null,
      isActive: true,
      displayOrder: 0,
    });
    setImagePreview(null);
    setShowModal(true);
  };

  const openEditModal = (mataPelajaran) => {
    setModalMode('edit');
    setCurrentMataPelajaran(mataPelajaran);
    setFormData({
      name: mataPelajaran.name,
      description: mataPelajaran.description,
      category: mataPelajaran.category,
      semester: mataPelajaran.semester || '',
      hoursPerWeek: mataPelajaran.hoursPerWeek || '',
      image: null,
      isActive: mataPelajaran.isActive,
      displayOrder: mataPelajaran.displayOrder || 0,
    });
    setImagePreview(mataPelajaran.image || null);
    setShowModal(true);
  };

  const openDeleteModal = (mataPelajaran) => {
    setMataPelajaranToDelete(mataPelajaran);
    setShowDeleteModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setCurrentMataPelajaran(null);
    setImagePreview(null);
  };

  const closeDeleteModal = () => {
    setShowDeleteModal(false);
    setMataPelajaranToDelete(null);
  };

  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      showToast('Ukuran gambar maksimal 5MB', 'error');
      return;
    }

    setUploadingImage(true);
    try {
      const uploadData = new FormData();
      uploadData.append('image', file);
      const response = await api.post('/api/upload/image', uploadData);
      const url = response.data.data.url;
      setFormData(prev => ({ ...prev, image: url }));
      setImagePreview(url);
    } catch (error) {
      showToast(error.response?.data?.message || 'Gagal mengupload gambar', 'error');
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const submitData = {
        name: formData.name,
        description: formData.description,
        category: formData.category,
        isActive: formData.isActive,
        displayOrder: formData.displayOrder,
      };
      if (formData.semester) submitData.semester = formData.semester;
      if (formData.hoursPerWeek) submitData.hoursPerWeek = formData.hoursPerWeek;
      if (formData.image) submitData.image = formData.image;

      if (modalMode === 'create') {
        await api.post('/api/mata-pelajaran', submitData);
        showToast('Mata pelajaran berhasil dibuat!', 'success');
      } else {
        await api.put(`/api/mata-pelajaran/${currentMataPelajaran._id}`, submitData);
        showToast('Mata pelajaran berhasil diupdate!', 'success');
      }

      fetchMataPelajarans();
      closeModal();
    } catch (error) {
      showToast(error.response?.data?.message || 'Gagal menyimpan mata pelajaran', 'error');
    }
  };

  const handleDelete = async () => {
    try {
      await api.delete(`/api/mata-pelajaran/${mataPelajaranToDelete._id}`);
      showToast('Mata pelajaran berhasil dihapus!', 'success');
      fetchMataPelajarans();
      closeDeleteModal();
    } catch (error) {
      showToast(error.response?.data?.message || 'Gagal menghapus mata pelajaran', 'error');
    }
  };

  const getCategoryLabel = (category) => {
    if (category === 'PUBLIC') return 'Publik (Semua Jurusan)';
    return category;
  };

  // Filter mata pelajaran based on search query
  const filteredMataPelajaran = mataPelajarans.filter(mapel => {
    if (!debouncedSearch) return true;

    const query = debouncedSearch.toLowerCase();
    return (
      mapel.name.toLowerCase().includes(query) ||
      mapel.description.toLowerCase().includes(query) ||
      getCategoryLabel(mapel.category).toLowerCase().includes(query) ||
      (mapel.semester && mapel.semester.toString().includes(query))
    );
  });

  return (
    <div className={embedded ? '' : 'space-y-6'}>
      {/* Toast Notification */}
      {toast && (
        <div className={`fixed top-4 right-4 z-50 px-6 py-3 rounded-lg shadow-lg ${
          toast.type === 'success' ? 'bg-green-500' : 'bg-red-500'
        } text-white`}>
          {toast.message}
        </div>
      )}

      {/* Header */}
      {!embedded ? (
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Mata Pelajaran</h1>
          <p className="text-gray-600">Kelola data mata pelajaran sekolah</p>
        </div>
        <button
          onClick={openCreateModal}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          + Tambah Mata Pelajaran
        </button>
      </div>
      ) : (
      <div className="flex justify-end mb-4">
        <button
          onClick={openCreateModal}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
        >
          + Tambah Mata Pelajaran
        </button>
      </div>
      )}

      {/* Search Bar */}
      <div className="bg-white rounded-lg shadow p-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Cari Mata Pelajaran
        </label>
        <input
          type="text"
          placeholder="Cari berdasarkan nama, kategori, semester, atau deskripsi..."
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
        ) : filteredMataPelajaran.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            {searchQuery ? 'Tidak ada mata pelajaran yang sesuai pencarian' : 'Belum ada mata pelajaran'}
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
                  Semester
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Jam/Minggu
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
              {filteredMataPelajaran.map((mataPelajaran) => (
                <tr key={mataPelajaran._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      {mataPelajaran.image && (
                        <img
                          src={mataPelajaran.image}
                          alt={mataPelajaran.name}
                          className="w-10 h-10 rounded-lg object-cover mr-3"
                        />
                      )}
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {mataPelajaran.name}
                        </div>
                        <div className="text-sm text-gray-500 line-clamp-1">
                          {mataPelajaran.description}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      mataPelajaran.category === 'PUBLIC'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-blue-100 text-blue-800'
                    }`}>
                      {getCategoryLabel(mataPelajaran.category)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {mataPelajaran.semester || '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {mataPelajaran.hoursPerWeek || '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      mataPelajaran.isActive
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {mataPelajaran.isActive ? 'Aktif' : 'Tidak Aktif'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      onClick={() => openEditModal(mataPelajaran)}
                      className="text-blue-600 hover:text-blue-900 mr-3"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => openDeleteModal(mataPelajaran)}
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
                {modalMode === 'create' ? 'Tambah Mata Pelajaran' : 'Edit Mata Pelajaran'}
              </h2>

              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nama Mata Pelajaran *
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

                {/* Semester & Hours Per Week */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Semester
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="6"
                      value={formData.semester}
                      onChange={(e) => setFormData({ ...formData, semester: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="1-6"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Jam/Minggu
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={formData.hoursPerWeek}
                      onChange={(e) => setFormData({ ...formData, hoursPerWeek: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Contoh: 4"
                    />
                  </div>
                </div>

                {/* Image */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Gambar/Icon
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    disabled={uploadingImage}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50"
                  />
                  {uploadingImage && (
                    <p className="text-sm text-blue-600 mt-1">Mengupload gambar...</p>
                  )}
                  {imagePreview && !uploadingImage && (
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="mt-2 w-32 h-32 object-cover rounded-lg"
                    />
                  )}
                </div>

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
                    disabled={uploadingImage}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
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
              Apakah Anda yakin ingin menghapus mata pelajaran "{mataPelajaranToDelete?.name}"?
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

export default MataPelajaran;
