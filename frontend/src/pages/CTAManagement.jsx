import { useState, useEffect } from 'react';
import api from '../services/api';

const CTAManagement = () => {
  const [ctas, setCTAs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState('create');
  const [currentCTA, setCurrentCTA] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [ctaToDelete, setCTAToDelete] = useState(null);
  const [toast, setToast] = useState(null);
  const [uploading, setUploading] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    title: '',
    subtitle: '',
    buttonText: '',
    buttonLink: '',
    backgroundImage: '',
    backgroundColor: '#0D76BE',
    isActive: true,
  });

  useEffect(() => {
    fetchCTAs();
  }, []);

  const fetchCTAs = async () => {
    try {
      setLoading(true);
      const response = await api.get('/api/cta');
      setCTAs(response.data.data.ctas);
    } catch (error) {
      showToast(error.response?.data?.message || 'Gagal memuat CTA', 'error');
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
      subtitle: '',
      buttonText: '',
      buttonLink: '',
      backgroundImage: '',
      backgroundColor: '#0D76BE',
      isActive: true,
    });
    setShowModal(true);
  };

  const openEditModal = (cta) => {
    setModalMode('edit');
    setCurrentCTA(cta);
    setFormData({
      title: cta.title,
      subtitle: cta.subtitle || '',
      buttonText: cta.buttonText,
      buttonLink: cta.buttonLink,
      backgroundImage: cta.backgroundImage || '',
      backgroundColor: cta.backgroundColor || '#0D76BE',
      isActive: cta.isActive,
    });
    setShowModal(true);
  };

  const openDeleteModal = (cta) => {
    setCTAToDelete(cta);
    setShowDeleteModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setCurrentCTA(null);
  };

  const closeDeleteModal = () => {
    setShowDeleteModal(false);
    setCTAToDelete(null);
  };

  const handleBackgroundUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      showToast('Hanya file gambar yang diperbolehkan', 'error');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      showToast('Ukuran file maksimal 5MB', 'error');
      return;
    }

    try {
      setUploading(true);
      const uploadFormData = new FormData();
      uploadFormData.append('file', file);

      const response = await api.post('/api/upload/image', uploadFormData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      setFormData(prev => ({ ...prev, backgroundImage: response.data.data.url }));
      showToast('Background berhasil diupload', 'success');
    } catch (error) {
      showToast(error.response?.data?.message || 'Gagal upload background', 'error');
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.title || !formData.buttonText || !formData.buttonLink) {
      showToast('Title, Button Text, dan Button Link harus diisi', 'error');
      return;
    }

    try {
      if (modalMode === 'create') {
        await api.post('/api/cta', formData);
        showToast('CTA berhasil dibuat!', 'success');
      } else {
        await api.put(`/api/cta/${currentCTA._id}`, formData);
        showToast('CTA berhasil diupdate!', 'success');
      }

      fetchCTAs();
      closeModal();
    } catch (error) {
      showToast(error.response?.data?.message || 'Gagal menyimpan CTA', 'error');
    }
  };

  const handleDelete = async () => {
    try {
      await api.delete(`/api/cta/${ctaToDelete._id}`);
      showToast('CTA berhasil dihapus!', 'success');
      fetchCTAs();
      closeDeleteModal();
    } catch (error) {
      showToast(error.response?.data?.message || 'Gagal menghapus CTA', 'error');
    }
  };

  const toggleActive = async (id, currentStatus) => {
    try {
      await api.put(`/api/cta/${id}`, { isActive: !currentStatus });
      showToast('Status berhasil diubah!', 'success');
      fetchCTAs();
    } catch (error) {
      showToast(error.response?.data?.message || 'Gagal mengubah status', 'error');
    }
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
          <h1 className="text-2xl font-bold text-gray-900">CTA Management</h1>
          <p className="text-gray-600 mt-1">Kelola Call-to-Action section di homepage</p>
        </div>
        <button
          onClick={openCreateModal}
          className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
        >
          <span className="text-xl">➕</span>
          <span>Tambah CTA</span>
        </button>
      </div>

      {/* CTA Cards */}
      <div className="space-y-4">
        {loading ? (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <div className="inline-block w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full animate-spin"></div>
            <p className="mt-2 text-gray-600">Memuat data...</p>
          </div>
        ) : ctas.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-8 text-center text-gray-500">
            <p>Belum ada CTA. Klik tombol "Tambah CTA" untuk mulai.</p>
          </div>
        ) : (
          ctas.map((cta) => (
            <div key={cta._id} className="bg-white rounded-lg shadow overflow-hidden">
              <div className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-xl font-bold text-gray-900">{cta.title}</h3>
                      <button
                        onClick={() => toggleActive(cta._id, cta.isActive)}
                        className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          cta.isActive
                            ? 'bg-green-100 text-green-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {cta.isActive ? 'Aktif' : 'Nonaktif'}
                      </button>
                    </div>
                    {cta.subtitle && (
                      <p className="text-gray-600 mb-3">{cta.subtitle}</p>
                    )}
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">Button:</span>
                        <span>{cta.buttonText}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">Link:</span>
                        <a href={cta.buttonLink} target="_blank" rel="noopener noreferrer" className="text-primary-600 hover:underline">
                          {cta.buttonLink}
                        </a>
                      </div>
                    </div>
                    {cta.backgroundImage && (
                      <div className="mt-3">
                        <img src={cta.backgroundImage} alt="Background" className="h-24 w-auto rounded-lg object-cover" />
                      </div>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => openEditModal(cta)}
                      className="px-4 py-2 text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => openDeleteModal(cta)}
                      className="px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      Hapus
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Create/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">
                {modalMode === 'create' ? 'Tambah CTA' : 'Edit CTA'}
              </h2>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Title <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="Ragu atau belum tau minat bakat kamu?"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Subtitle
                  </label>
                  <textarea
                    value={formData.subtitle}
                    onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    rows="2"
                    maxLength="500"
                    placeholder="Deskripsi tambahan..."
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Button Text <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.buttonText}
                      onChange={(e) => setFormData({ ...formData, buttonText: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      placeholder="Konsultasi Sekarang"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Button Link <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.buttonLink}
                      onChange={(e) => setFormData({ ...formData, buttonLink: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      placeholder="/kontak atau https://..."
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Background Image (Optional)
                  </label>
                  <div className="flex items-center gap-4">
                    {formData.backgroundImage && (
                      <img src={formData.backgroundImage} alt="Preview" className="h-24 w-auto object-cover border rounded-lg" />
                    )}
                    <div className="flex-1">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleBackgroundUpload}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      />
                      {uploading && (
                        <p className="text-sm text-gray-600 mt-1">Mengupload...</p>
                      )}
                    </div>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Format: JPG, PNG (Max 5MB)</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Background Color
                  </label>
                  <div className="flex items-center gap-3">
                    <input
                      type="color"
                      value={formData.backgroundColor}
                      onChange={(e) => setFormData({ ...formData, backgroundColor: e.target.value })}
                      className="h-10 w-20 border border-gray-300 rounded cursor-pointer"
                    />
                    <input
                      type="text"
                      value={formData.backgroundColor}
                      onChange={(e) => setFormData({ ...formData, backgroundColor: e.target.value })}
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      placeholder="#0D76BE"
                    />
                  </div>
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="isActive"
                    checked={formData.isActive}
                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                    className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                  />
                  <label htmlFor="isActive" className="ml-2 text-sm text-gray-700">
                    Aktifkan CTA ini (CTA lain akan dinonaktifkan otomatis)
                  </label>
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={closeModal}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                    disabled={uploading}
                  >
                    {uploading ? 'Mengupload...' : 'Simpan'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && ctaToDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Konfirmasi Hapus</h2>
            <p className="text-gray-600 mb-6">
              Apakah Anda yakin ingin menghapus CTA <strong>{ctaToDelete.title}</strong>?
            </p>
            <div className="flex gap-3">
              <button
                onClick={closeDeleteModal}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Batal
              </button>
              <button
                onClick={handleDelete}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
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

export default CTAManagement;
