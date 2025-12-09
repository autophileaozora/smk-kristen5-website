import { useState, useEffect } from 'react';
import api from '../services/api';
import ImageUpload from '../components/ImageUpload';

const Prestasi = () => {
  const [prestasis, setPrestasis] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState('create');
  const [currentPrestasi, setCurrentPrestasi] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [prestasiToDelete, setPrestasiToDelete] = useState(null);
  const [toast, setToast] = useState(null);

  // Form state
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'akademik',
    level: 'sekolah',
    date: '',
    participants: '',
    image: '',
  });

  useEffect(() => {
    fetchPrestasis();
  }, []);

  const fetchPrestasis = async () => {
    try {
      setLoading(true);
      const response = await api.get('/api/prestasi');
      setPrestasis(response.data.data.prestasis);
    } catch (error) {
      showToast(error.response?.data?.message || 'Gagal memuat prestasi', 'error');
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
      title: '',
      description: '',
      category: 'akademik',
      level: 'sekolah',
      date: '',
      participants: '',
      image: '',
    });
    setShowModal(true);
  };

  const openEditModal = (prestasi) => {
    setModalMode('edit');
    setCurrentPrestasi(prestasi);
    setFormData({
      title: prestasi.title,
      description: prestasi.description,
      category: prestasi.category,
      level: prestasi.level,
      date: prestasi.date ? prestasi.date.split('T')[0] : '',
      participants: prestasi.participants,
      image: prestasi.image || '',
    });
    setShowModal(true);
  };

  const openDeleteModal = (prestasi) => {
    setPrestasiToDelete(prestasi);
    setShowDeleteModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setCurrentPrestasi(null);
  };

  const closeDeleteModal = () => {
    setShowDeleteModal(false);
    setPrestasiToDelete(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      if (modalMode === 'create') {
        await api.post('/api/prestasi', formData);
        showToast('Prestasi berhasil dibuat!', 'success');
      } else {
        await api.put(`/api/prestasi/${currentPrestasi._id}`, formData);
        showToast('Prestasi berhasil diupdate!', 'success');
      }

      fetchPrestasis();
      closeModal();
    } catch (error) {
      showToast(error.response?.data?.message || 'Gagal menyimpan prestasi', 'error');
    }
  };

  const handleDelete = async () => {
    try {
      await api.delete(`/api/prestasi/${prestasiToDelete._id}`);
      showToast('Prestasi berhasil dihapus!', 'success');
      fetchPrestasis();
      closeDeleteModal();
    } catch (error) {
      showToast(error.response?.data?.message || 'Gagal menghapus prestasi', 'error');
    }
  };

  const getCategoryBadge = (category) => {
    const badges = {
      akademik: 'bg-blue-100 text-blue-800',
      olahraga: 'bg-green-100 text-green-800',
      seni: 'bg-purple-100 text-purple-800',
      teknologi: 'bg-orange-100 text-orange-800',
      lainnya: 'bg-gray-100 text-gray-800',
    };
    return badges[category] || badges.lainnya;
  };

  const getLevelBadge = (level) => {
    const badges = {
      sekolah: 'bg-yellow-100 text-yellow-800',
      kecamatan: 'bg-blue-100 text-blue-800',
      kabupaten: 'bg-green-100 text-green-800',
      provinsi: 'bg-purple-100 text-purple-800',
      nasional: 'bg-red-100 text-red-800',
      internasional: 'bg-pink-100 text-pink-800',
    };
    return badges[level] || badges.sekolah;
  };

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
          <h1 className="text-2xl font-bold text-gray-900">Prestasi</h1>
          <p className="text-gray-600 mt-1">Kelola pencapaian dan penghargaan sekolah</p>
        </div>
        <button
          onClick={openCreateModal}
          className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
        >
          <span className="text-xl">🏆</span>
          <span>Tambah Prestasi</span>
        </button>
      </div>

      {/* Prestasi Grid */}
      <div className="bg-white rounded-lg shadow">
        {loading ? (
          <div className="p-8 text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
            <p className="mt-2 text-gray-600">Memuat prestasi...</p>
          </div>
        ) : prestasis.length === 0 ? (
          <div className="p-8 text-center">
            <p className="text-gray-500">Belum ada prestasi</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
            {prestasis.map((prestasi) => (
              <div key={prestasi._id} className="border rounded-lg overflow-hidden hover:shadow-lg transition-shadow">
                {/* Image */}
                {prestasi.image && (
                  <div className="h-48 bg-gray-200 overflow-hidden">
                    <img
                      src={prestasi.image}
                      alt={prestasi.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}

                {/* Content */}
                <div className="p-4">
                  {/* Badges */}
                  <div className="flex gap-2 mb-2">
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getCategoryBadge(prestasi.category)}`}>
                      {prestasi.category}
                    </span>
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getLevelBadge(prestasi.level)}`}>
                      {prestasi.level}
                    </span>
                  </div>

                  {/* Title */}
                  <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">
                    {prestasi.title}
                  </h3>

                  {/* Description */}
                  <p className="text-sm text-gray-600 mb-3 line-clamp-3">
                    {prestasi.description}
                  </p>

                  {/* Meta */}
                  <div className="text-xs text-gray-500 space-y-1">
                    <div>📅 {new Date(prestasi.date).toLocaleDateString('id-ID')}</div>
                    <div>👥 {prestasi.participants}</div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 mt-4">
                    <button
                      onClick={() => openEditModal(prestasi)}
                      className="flex-1 px-3 py-2 text-sm bg-blue-50 text-blue-600 rounded hover:bg-blue-100 transition-colors"
                    >
                      ✏️ Edit
                    </button>
                    <button
                      onClick={() => openDeleteModal(prestasi)}
                      className="flex-1 px-3 py-2 text-sm bg-red-50 text-red-600 rounded hover:bg-red-100 transition-colors"
                    >
                      🗑️ Hapus
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
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
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full">
              <form onSubmit={handleSubmit}>
                {/* Header */}
                <div className="bg-white px-6 py-4 border-b">
                  <h3 className="text-lg font-semibold text-gray-900">
                    {modalMode === 'create' ? '🏆 Tambah Prestasi' : '✏️ Edit Prestasi'}
                  </h3>
                </div>

                {/* Body */}
                <div className="bg-white px-6 py-4 space-y-4 max-h-[70vh] overflow-y-auto">
                  {/* Image Upload */}
                  <ImageUpload
                    label="Gambar Prestasi"
                    value={formData.image}
                    onChange={(url) => setFormData(prev => ({ ...prev, image: url }))}
                    folder="smk-kristen5/prestasi"
                    previewClassName="h-48 w-auto"
                  />

                  {/* Title */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Judul Prestasi *
                    </label>
                    <input
                      type="text"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      placeholder="Contoh: Juara 1 Lomba Coding Tingkat Nasional"
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
                      rows={4}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      placeholder="Jelaskan prestasi ini..."
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    {/* Category */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Kategori *
                      </label>
                      <select
                        value={formData.category}
                        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        required
                      >
                        <option value="akademik">Akademik</option>
                        <option value="olahraga">Olahraga</option>
                        <option value="seni">Seni</option>
                        <option value="teknologi">Teknologi</option>
                        <option value="lainnya">Lainnya</option>
                      </select>
                    </div>

                    {/* Level */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Tingkat *
                      </label>
                      <select
                        value={formData.level}
                        onChange={(e) => setFormData({ ...formData, level: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        required
                      >
                        <option value="sekolah">Sekolah</option>
                        <option value="kecamatan">Kecamatan</option>
                        <option value="kabupaten">Kabupaten</option>
                        <option value="provinsi">Provinsi</option>
                        <option value="nasional">Nasional</option>
                        <option value="internasional">Internasional</option>
                      </select>
                    </div>
                  </div>

                  {/* Date */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Tanggal Prestasi *
                    </label>
                    <input
                      type="date"
                      value={formData.date}
                      onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      required
                    />
                  </div>

                  {/* Participants */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Peserta *
                    </label>
                    <input
                      type="text"
                      value={formData.participants}
                      onChange={(e) => setFormData({ ...formData, participants: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      placeholder="Contoh: Ahmad Rizki (XII RPL 1)"
                      required
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
                    {modalMode === 'create' ? '🏆 Tambah' : '💾 Simpan'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && prestasiToDelete && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
            <div
              className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75"
              onClick={closeDeleteModal}
            ></div>

            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="bg-white px-6 py-4">
                <div className="flex items-center mb-4">
                  <span className="text-4xl mr-3">⚠️</span>
                  <h3 className="text-lg font-semibold text-gray-900">
                    Hapus Prestasi?
                  </h3>
                </div>
                <p className="text-gray-600 mb-4">
                  Apakah Anda yakin ingin menghapus prestasi <strong>{prestasiToDelete.title}</strong>?
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

export default Prestasi;
