import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { MoreVertical, X } from 'lucide-react';
import api from '../services/api';

const SocialMedia = ({ embedded = false, createTrigger = 0 }) => {
  const [socialMedia, setSocialMedia] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState('create');
  const [currentSocialMedia, setCurrentSocialMedia] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [socialMediaToDelete, setSocialMediaToDelete] = useState(null);
  const [toast, setToast] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [rowMenu, setRowMenu] = useState(null);

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    url: '',
    icon: '',
    isActive: true,
    order: 1,
  });

  useEffect(() => {
    fetchSocialMedia();
  }, []);

  useEffect(() => {
    if (createTrigger > 0) openCreateModal();
  }, [createTrigger]);

  const fetchSocialMedia = async () => {
    try {
      setLoading(true);
      const response = await api.get('/api/social-media');
      setSocialMedia(response.data.data.socialMedia);
    } catch (error) {
      showToast(error.response?.data?.message || 'Gagal memuat sosial media', 'error');
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
      url: '',
      icon: '',
      isActive: true,
      order: socialMedia.length + 1,
    });
    setShowModal(true);
  };

  const openEditModal = (item) => {
    setModalMode('edit');
    setCurrentSocialMedia(item);
    setFormData({
      name: item.name,
      url: item.url,
      icon: item.icon,
      isActive: item.isActive,
      order: item.order,
    });
    setShowModal(true);
  };

  const openDeleteModal = (item) => {
    setSocialMediaToDelete(item);
    setShowDeleteModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setCurrentSocialMedia(null);
  };

  const closeDeleteModal = () => {
    setShowDeleteModal(false);
    setSocialMediaToDelete(null);
  };

  const handleIconUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      showToast('Hanya file gambar yang diperbolehkan', 'error');
      return;
    }

    // Validate file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      showToast('Ukuran file maksimal 2MB', 'error');
      return;
    }

    try {
      setUploading(true);
      const formData = new FormData();
      formData.append('image', file);

      const response = await api.post('/api/upload/image', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      setFormData(prev => ({ ...prev, icon: response.data.data.url }));
      showToast('Icon berhasil diupload', 'success');
    } catch (error) {
      showToast(error.response?.data?.message || 'Gagal upload icon', 'error');
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name || !formData.url || !formData.icon) {
      showToast('Nama, URL, dan Icon harus diisi', 'error');
      return;
    }

    try {
      if (modalMode === 'create') {
        await api.post('/api/social-media', formData);
        showToast('Sosial media berhasil dibuat!', 'success');
      } else {
        await api.put(`/api/social-media/${currentSocialMedia._id}`, formData);
        showToast('Sosial media berhasil diupdate!', 'success');
      }

      fetchSocialMedia();
      closeModal();
    } catch (error) {
      showToast(error.response?.data?.message || 'Gagal menyimpan sosial media', 'error');
    }
  };

  const handleDelete = async () => {
    try {
      await api.delete(`/api/social-media/${socialMediaToDelete._id}`);
      showToast('Sosial media berhasil dihapus!', 'success');
      fetchSocialMedia();
      closeDeleteModal();
    } catch (error) {
      showToast(error.response?.data?.message || 'Gagal menghapus sosial media', 'error');
    }
  };

  const toggleActive = async (id, currentStatus) => {
    try {
      await api.put(`/api/social-media/${id}`, { isActive: !currentStatus });
      showToast('Status berhasil diubah!', 'success');
      fetchSocialMedia();
    } catch (error) {
      showToast(error.response?.data?.message || 'Gagal mengubah status', 'error');
    }
  };

  return (
    <div className={embedded ? '' : 'p-6'}>
      {/* Toast Notification */}
      {toast && (
        <div className={`fixed top-4 right-4 z-50 px-6 py-3 rounded-lg shadow-lg ${
          toast.type === 'success' ? 'bg-green-500' : 'bg-red-500'
        } text-white`}>
          {toast.message}
        </div>
      )}

      {/* Header */}
      {!embedded && (
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Sosial Media</h1>
          <p className="text-gray-600 mt-1">Kelola link sosial media sekolah</p>
        </div>
        <button
          onClick={openCreateModal}
          className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
        >
          <span className="text-xl">➕</span>
          <span>Tambah Sosial Media</span>
        </button>
      </div>
      )}

      {/* Social Media Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden overflow-x-auto">
        {loading ? (
          <div className="p-8 text-center">
            <div className="inline-block w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full animate-spin"></div>
            <p className="mt-2 text-gray-600">Memuat data...</p>
          </div>
        ) : socialMedia.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <p>Belum ada sosial media. Klik tombol "Tambah Sosial Media" untuk mulai.</p>
          </div>
        ) : (
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Icon</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nama</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">URL</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Urutan</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Aksi</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {socialMedia.map((item) => (
                <tr key={item._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <img src={item.icon} alt={item.name} className="w-8 h-8 object-contain" />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{item.name}</div>
                  </td>
                  <td className="px-6 py-4">
                    <a href={item.url} target="_blank" rel="noopener noreferrer" className="text-sm text-primary-600 hover:underline truncate block max-w-xs">
                      {item.url}
                    </a>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{item.order}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <button
                      onClick={() => toggleActive(item._id, item.isActive)}
                      className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        item.isActive
                          ? 'bg-green-100 text-green-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {item.isActive ? 'Aktif' : 'Nonaktif'}
                    </button>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <button
                      onClick={(e) => {
                        const r = e.currentTarget.getBoundingClientRect();
                        setRowMenu({ item, top: r.bottom + 4, right: window.innerWidth - r.right });
                      }}
                      className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
                    >
                      <MoreVertical size={15} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Context Menu Portal */}
      {rowMenu && createPortal(
        <>
          <div className="fixed inset-0 z-40" onClick={() => setRowMenu(null)} />
          <div
            className="fixed z-50 bg-white/80 backdrop-blur-2xl border border-white/70 rounded-xl shadow-[0_8px_28px_rgba(0,0,0,0.12),inset_0_1px_0_rgba(255,255,255,0.9)] py-1 min-w-[150px] overflow-hidden"
            style={{ top: rowMenu.top, right: rowMenu.right }}
          >
            <button
              onClick={() => { openEditModal(rowMenu.item); setRowMenu(null); }}
              className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-black/[0.05] transition-colors"
            >
              Edit
            </button>
            <button
              onClick={() => { openDeleteModal(rowMenu.item); setRowMenu(null); }}
              className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 transition-colors"
            >
              Hapus
            </button>
          </div>
        </>,
        document.body
      )}

      {/* Create/Edit Modal */}
      {showModal && createPortal(
        <div className="fixed inset-0 bg-black/20 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-white/80 backdrop-blur-2xl border border-white/70 rounded-2xl shadow-[0_8px_40px_rgba(0,0,0,0.15),inset_0_1px_0_rgba(255,255,255,0.9)] max-w-md w-full">
            <div className="flex items-center justify-between px-5 py-4 border-b border-black/[0.06]">
              <h2 className="text-sm font-semibold text-gray-800">
                {modalMode === 'create' ? 'Tambah Sosial Media' : 'Edit Sosial Media'}
              </h2>
              <button
                type="button"
                onClick={closeModal}
                className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-black/5 rounded-lg transition-colors"
              >
                <X size={14} />
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="p-5 space-y-4">
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1.5">
                    Nama Platform <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-2 text-sm bg-white/60 border border-black/[0.08] rounded-xl focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 outline-none transition-all placeholder:text-gray-400"
                    placeholder="Contoh: Facebook, Instagram, YouTube"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1.5">
                    URL <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="url"
                    value={formData.url}
                    onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                    className="w-full px-3 py-2 text-sm bg-white/60 border border-black/[0.08] rounded-xl focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 outline-none transition-all placeholder:text-gray-400"
                    placeholder="https://..."
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1.5">
                    Icon <span className="text-red-500">*</span>
                  </label>
                  <div className="flex items-center gap-4">
                    {formData.icon && (
                      <img src={formData.icon} alt="Preview" className="w-16 h-16 object-contain border rounded-lg p-2" />
                    )}
                    <div className="flex-1">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleIconUpload}
                        className="w-full px-3 py-2 text-sm bg-white/60 border border-black/[0.08] rounded-xl focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 outline-none transition-all placeholder:text-gray-400"
                      />
                      {uploading && (
                        <p className="text-sm text-gray-600 mt-1">Mengupload...</p>
                      )}
                    </div>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Format: JPG, PNG, SVG (Max 2MB)</p>
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1.5">
                    Urutan
                  </label>
                  <input
                    type="number"
                    value={formData.order}
                    onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) })}
                    className="w-full px-3 py-2 text-sm bg-white/60 border border-black/[0.08] rounded-xl focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 outline-none transition-all placeholder:text-gray-400"
                    min="1"
                  />
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
                    Tampilkan di website
                  </label>
                </div>
              </div>

              <div className="flex justify-end gap-2 px-5 pb-5 pt-2 border-t border-black/[0.06]">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-4 py-2 text-xs text-gray-600 hover:bg-black/5 rounded-xl transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors"
                  disabled={uploading}
                >
                  {uploading ? 'Mengupload...' : 'Simpan'}
                </button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && socialMediaToDelete && createPortal(
        <div className="fixed inset-0 bg-black/20 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-white/80 backdrop-blur-2xl border border-white/70 rounded-2xl shadow-[0_8px_40px_rgba(0,0,0,0.15),inset_0_1px_0_rgba(255,255,255,0.9)] max-w-sm w-full">
            <div className="flex items-center justify-between px-5 py-4 border-b border-black/[0.06]">
              <h2 className="text-sm font-semibold text-gray-800">Konfirmasi Hapus</h2>
              <button
                type="button"
                onClick={closeDeleteModal}
                className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-black/5 rounded-lg transition-colors"
              >
                <X size={14} />
              </button>
            </div>
            <div className="p-5 space-y-4">
              <p className="text-sm text-gray-600">
                Apakah Anda yakin ingin menghapus <strong>{socialMediaToDelete.name}</strong>?
              </p>
            </div>
            <div className="flex justify-end gap-2 px-5 pb-5 pt-2 border-t border-black/[0.06]">
              <button
                onClick={closeDeleteModal}
                className="px-4 py-2 text-xs text-gray-600 hover:bg-black/5 rounded-xl transition-colors"
              >
                Batal
              </button>
              <button
                onClick={handleDelete}
                className="px-4 py-2 text-xs bg-red-500 text-white rounded-xl hover:bg-red-600 transition-colors"
              >
                Hapus
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
};

export default SocialMedia;
