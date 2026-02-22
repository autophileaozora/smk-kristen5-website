import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { MoreVertical, X } from 'lucide-react';
import api from '../services/api';

const Partner = ({ embedded = false, createTrigger = 0 }) => {
  const [partners, setPartners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState('create');
  const [currentPartner, setCurrentPartner] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [partnerToDelete, setPartnerToDelete] = useState(null);
  const [toast, setToast] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [rowMenu, setRowMenu] = useState(null);

  const currentYear = new Date().getFullYear();

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    logo: '',
    startYear: currentYear,
    endYear: '',
    location: '',
    description: '',
    isActive: true,
    order: 1,
  });

  useEffect(() => {
    fetchPartners();
  }, []);

  useEffect(() => {
    if (createTrigger > 0) openCreateModal();
  }, [createTrigger]);

  const fetchPartners = async () => {
    try {
      setLoading(true);
      const response = await api.get('/api/partners');
      setPartners(response.data.data.partners);
    } catch (error) {
      showToast(error.response?.data?.message || 'Gagal memuat partner', 'error');
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
      logo: '',
      startYear: currentYear,
      endYear: '',
      location: '',
      description: '',
      isActive: true,
      order: partners.length + 1,
    });
    setShowModal(true);
  };

  const openEditModal = (partner) => {
    setModalMode('edit');
    setCurrentPartner(partner);
    setFormData({
      name: partner.name,
      logo: partner.logo,
      startYear: partner.startYear,
      endYear: partner.endYear || '',
      location: partner.location,
      description: partner.description || '',
      isActive: partner.isActive,
      order: partner.order,
    });
    setShowModal(true);
  };

  const openDeleteModal = (partner) => {
    setPartnerToDelete(partner);
    setShowDeleteModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setCurrentPartner(null);
  };

  const closeDeleteModal = () => {
    setShowDeleteModal(false);
    setPartnerToDelete(null);
  };

  const handleLogoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      showToast('Hanya file gambar yang diperbolehkan', 'error');
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      showToast('Ukuran file maksimal 2MB', 'error');
      return;
    }

    try {
      setUploading(true);
      const uploadFormData = new FormData();
      uploadFormData.append('image', file);

      const response = await api.post('/api/upload/image', uploadFormData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      setFormData(prev => ({ ...prev, logo: response.data.data.url }));
      showToast('Logo berhasil diupload', 'success');
    } catch (error) {
      showToast(error.response?.data?.message || 'Gagal upload logo', 'error');
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name || !formData.logo || !formData.location) {
      showToast('Nama, Logo, dan Lokasi harus diisi', 'error');
      return;
    }

    // Ensure startYear and order are valid numbers
    const startYearNum = parseInt(formData.startYear) || currentYear;
    const orderNum = parseInt(formData.order) || 1;
    const endYearNum = formData.endYear ? parseInt(formData.endYear) : null;

    if (isNaN(startYearNum) || startYearNum < 1900) {
      showToast('Tahun mulai harus berupa angka yang valid', 'error');
      return;
    }

    try {
      const submitData = {
        name: formData.name.trim(),
        logo: formData.logo,
        startYear: startYearNum,
        endYear: endYearNum,
        location: formData.location.trim(),
        description: formData.description?.trim() || '',
        isActive: Boolean(formData.isActive),
        order: orderNum,
      };

      console.log('Submitting partner data:', submitData);

      if (modalMode === 'create') {
        await api.post('/api/partners', submitData);
        showToast('Partner berhasil dibuat!', 'success');
      } else {
        await api.put(`/api/partners/${currentPartner._id}`, submitData);
        showToast('Partner berhasil diupdate!', 'success');
      }

      fetchPartners();
      closeModal();
    } catch (error) {
      console.error('Partner save error:', error.response?.data || error);
      showToast(error.response?.data?.message || 'Gagal menyimpan partner', 'error');
    }
  };

  const handleDelete = async () => {
    try {
      await api.delete(`/api/partners/${partnerToDelete._id}`);
      showToast('Partner berhasil dihapus!', 'success');
      fetchPartners();
      closeDeleteModal();
    } catch (error) {
      showToast(error.response?.data?.message || 'Gagal menghapus partner', 'error');
    }
  };

  const toggleActive = async (id, currentStatus) => {
    try {
      await api.put(`/api/partners/${id}`, { isActive: !currentStatus });
      showToast('Status berhasil diubah!', 'success');
      fetchPartners();
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
          <h1 className="text-2xl font-bold text-gray-900">Partner Kerjasama</h1>
          <p className="text-gray-600 mt-1">Kelola partner dan perusahaan kerjasama</p>
        </div>
        <button
          onClick={openCreateModal}
          className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
        >
          <span className="text-xl">➕</span>
          <span>Tambah Partner</span>
        </button>
      </div>
      )}

      {/* Partners Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden overflow-x-auto">
        {loading ? (
          <div className="p-8 text-center">
            <div className="inline-block w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full animate-spin"></div>
            <p className="mt-2 text-gray-600">Memuat data...</p>
          </div>
        ) : partners.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <p>Belum ada partner. Klik tombol "Tambah Partner" untuk mulai.</p>
          </div>
        ) : (
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Logo</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nama</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Lokasi</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Periode</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Urutan</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Aksi</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {partners.map((partner) => (
                <tr key={partner._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <img src={partner.logo} alt={partner.name} className="w-16 h-16 object-contain" />
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm font-medium text-gray-900">{partner.name}</div>
                    {partner.description && (
                      <div className="text-xs text-gray-500 mt-1 line-clamp-2">{partner.description}</div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{partner.location}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {partner.startYear} - {partner.endYear || 'Sekarang'}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{partner.order}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <button
                      onClick={() => toggleActive(partner._id, partner.isActive)}
                      className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        partner.isActive
                          ? 'bg-green-100 text-green-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {partner.isActive ? 'Aktif' : 'Nonaktif'}
                    </button>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <button
                      onClick={(e) => {
                        const r = e.currentTarget.getBoundingClientRect();
                        setRowMenu({ partner, top: r.bottom + 4, right: window.innerWidth - r.right });
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
            className="fixed z-50 bg-white/90 backdrop-blur-xl border border-white/70 rounded-xl shadow-[0_8px_28px_rgba(0,0,0,0.12)] py-1 min-w-[130px]"
            style={{ top: rowMenu.top, right: rowMenu.right }}
          >
            <button
              onClick={() => { openEditModal(rowMenu.partner); setRowMenu(null); }}
              className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-black/[0.05] transition-colors"
            >
              Edit
            </button>
            <button
              onClick={() => { openDeleteModal(rowMenu.partner); setRowMenu(null); }}
              className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 transition-colors"
            >
              Hapus
            </button>
          </div>
        </>,
        document.body
      )}

      {/* Create/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/20 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-white/80 backdrop-blur-2xl border border-white/70 rounded-2xl shadow-[0_8px_40px_rgba(0,0,0,0.15),inset_0_1px_0_rgba(255,255,255,0.9)] max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-5 py-4 border-b border-black/[0.06] sticky top-0 bg-white/80 backdrop-blur-2xl rounded-t-2xl">
              <h2 className="text-sm font-semibold text-gray-800">
                {modalMode === 'create' ? 'Tambah Partner' : 'Edit Partner'}
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
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <label className="block text-xs font-medium text-gray-500 mb-1.5">
                      Nama Perusahaan <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-3 py-2 text-sm bg-white/60 border border-black/[0.08] rounded-xl focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 outline-none transition-all placeholder:text-gray-400"
                      placeholder="PT. Contoh Indonesia"
                      required
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-xs font-medium text-gray-500 mb-1.5">
                      Logo <span className="text-red-500">*</span>
                    </label>
                    <div className="flex items-center gap-4">
                      {formData.logo && (
                        <img src={formData.logo} alt="Preview" className="w-24 h-24 object-contain border rounded-lg p-2" />
                      )}
                      <div className="flex-1">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleLogoUpload}
                          className="w-full px-3 py-2 text-sm bg-white/60 border border-black/[0.08] rounded-xl focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 outline-none transition-all placeholder:text-gray-400"
                        />
                        {uploading && (
                          <p className="text-sm text-gray-600 mt-1">Mengupload...</p>
                        )}
                      </div>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">Format: JPG, PNG (Max 2MB)</p>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1.5">
                      Tahun Mulai <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      value={formData.startYear}
                      onChange={(e) => setFormData({ ...formData, startYear: e.target.value ? parseInt(e.target.value) : currentYear })}
                      className="w-full px-3 py-2 text-sm bg-white/60 border border-black/[0.08] rounded-xl focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 outline-none transition-all placeholder:text-gray-400"
                      min="1900"
                      max={currentYear + 10}
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1.5">
                      Tahun Selesai (Opsional)
                    </label>
                    <input
                      type="number"
                      value={formData.endYear}
                      onChange={(e) => setFormData({ ...formData, endYear: e.target.value })}
                      className="w-full px-3 py-2 text-sm bg-white/60 border border-black/[0.08] rounded-xl focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 outline-none transition-all placeholder:text-gray-400"
                      min="1900"
                      max={currentYear + 10}
                      placeholder="Kosongkan jika masih aktif"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-xs font-medium text-gray-500 mb-1.5">
                      Lokasi <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.location}
                      onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                      className="w-full px-3 py-2 text-sm bg-white/60 border border-black/[0.08] rounded-xl focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 outline-none transition-all placeholder:text-gray-400"
                      placeholder="Jakarta, Indonesia"
                      required
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-xs font-medium text-gray-500 mb-1.5">
                      Deskripsi (Opsional)
                    </label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      className="w-full px-3 py-2 text-sm bg-white/60 border border-black/[0.08] rounded-xl focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 outline-none transition-all placeholder:text-gray-400"
                      rows="3"
                      maxLength="500"
                      placeholder="Deskripsi singkat kerjasama..."
                    />
                    <p className="text-xs text-gray-500 mt-1">{formData.description.length}/500 karakter</p>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1.5">
                      Urutan
                    </label>
                    <input
                      type="number"
                      value={formData.order}
                      onChange={(e) => setFormData({ ...formData, order: e.target.value ? parseInt(e.target.value) : 1 })}
                      className="w-full px-3 py-2 text-sm bg-white/60 border border-black/[0.08] rounded-xl focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 outline-none transition-all placeholder:text-gray-400"
                      min="1"
                    />
                  </div>

                  <div className="flex items-center pt-6">
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
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && partnerToDelete && (
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
                Apakah Anda yakin ingin menghapus <strong>{partnerToDelete.name}</strong>?
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
        </div>
      )}
    </div>
  );
};

export default Partner;
