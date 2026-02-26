import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { MoreVertical, Edit3, Trash2, CheckCircle, XCircle, X, ChevronDown } from 'lucide-react';
import api from '../services/api';
import ImageUpload from '../components/ImageUpload';

const Fasilitas = ({ embedded = false, createTrigger = 0, externalSearch = '' }) => {
  const [fasilitass, setFasilitass] = useState([]);
  const [jurusans, setJurusans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState('create');
  const [currentFasilitas, setCurrentFasilitas] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [fasilitasToDelete, setFasilitasToDelete] = useState(null);
  const [toast, setToast] = useState(null);
  const [cardMenu, setCardMenu] = useState(null); // { item, top, right }

  const openMenuFor = (e, item) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setCardMenu(prev => prev?.item._id === item._id ? null : { item, top: rect.bottom + 4, right: window.innerWidth - rect.right });
  };

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

  useEffect(() => {
    if (createTrigger > 0) openCreateModal();
  }, [createTrigger]);

  useEffect(() => {
    if (embedded) setSearchQuery(externalSearch);
  }, [externalSearch, embedded]);

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

  const handleToggleActive = async (fasilitas) => {
    try {
      await api.put(`/api/fasilitas/${fasilitas._id}`, { isActive: !fasilitas.isActive });
      fetchFasilitass();
    } catch (error) {
      showToast('Gagal mengubah status fasilitas', 'error');
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
      {!embedded && (
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
      )}

      {/* Search Bar — non-embedded only */}
      {!embedded && (
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
      )}

      {/* Table */}
      <div className={`bg-white rounded-lg shadow overflow-hidden overflow-x-auto${embedded ? ' m-4' : ''}`}>
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
                      onClick={(e) => openMenuFor(e, fasilitas)}
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

      {/* Card context menu — portal to body so it's never clipped */}
      {cardMenu && createPortal(
        <>
          <div className="fixed inset-0 z-40" onClick={() => setCardMenu(null)} />
          <div
            className="fixed z-50 bg-white/80 backdrop-blur-2xl border border-white/70 rounded-xl shadow-[0_8px_28px_rgba(0,0,0,0.12),inset_0_1px_0_rgba(255,255,255,0.9)] py-1 min-w-[150px] overflow-hidden"
            style={{ top: cardMenu.top, right: cardMenu.right }}
          >
            <button onClick={() => { openEditModal(cardMenu.item); setCardMenu(null); }} className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-black/[0.05] transition-colors flex items-center gap-2">
              <Edit3 size={13} /> Edit
            </button>
            <button onClick={() => { handleToggleActive(cardMenu.item); setCardMenu(null); }} className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-black/[0.05] transition-colors flex items-center gap-2">
              {cardMenu.item.isActive ? <XCircle size={13} /> : <CheckCircle size={13} />}
              {cardMenu.item.isActive ? 'Nonaktifkan' : 'Aktifkan'}
            </button>
            <div className="h-px bg-black/[0.06] my-1" />
            <button onClick={() => { openDeleteModal(cardMenu.item); setCardMenu(null); }} className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 transition-colors flex items-center gap-2">
              <Trash2 size={13} /> Hapus
            </button>
          </div>
        </>,
        document.body
      )}

      {/* Create/Edit Modal */}
      {showModal && createPortal(
        <div className="fixed inset-0 bg-black/20 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-white/80 backdrop-blur-2xl border border-white/70 rounded-2xl shadow-[0_8px_40px_rgba(0,0,0,0.15),inset_0_1px_0_rgba(255,255,255,0.9)] max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-5 py-4 border-b border-black/[0.06] sticky top-0 bg-white/80 backdrop-blur-2xl rounded-t-2xl">
              <h2 className="text-sm font-semibold text-gray-800">
                {modalMode === 'create' ? 'Tambah Fasilitas' : 'Edit Fasilitas'}
              </h2>
              <button onClick={closeModal} className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-black/5 rounded-lg transition-colors">
                <X size={14} />
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="p-5 space-y-4">
                {/* Name */}
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1.5">
                    Nama Fasilitas *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-2 text-sm bg-white/60 border border-black/[0.08] rounded-xl focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 outline-none transition-all placeholder:text-gray-400"
                    required
                  />
                </div>

                {/* Description */}
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1.5">
                    Deskripsi *
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows="3"
                    className="w-full px-3 py-2 text-sm bg-white/60 border border-black/[0.08] rounded-xl focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 outline-none transition-all placeholder:text-gray-400"
                    required
                  />
                </div>

                {/* Category */}
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1.5">
                    Kategori *
                  </label>
                  <div className="relative">
                    <select
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      className="w-full px-3 py-2 text-sm bg-white/60 border border-black/[0.08] rounded-xl focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 outline-none transition-all appearance-none pr-8"
                      required
                    >
                      <option value="PUBLIC">Publik (Semua Jurusan)</option>
                      {jurusans.map((jurusan) => (
                        <option key={jurusan._id} value={jurusan.code}>
                          {jurusan.code} - {jurusan.name}
                        </option>
                      ))}
                    </select>
                    <ChevronDown size={13} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Pilih jurusan tertentu atau "Publik" untuk semua jurusan
                  </p>
                </div>

                {/* Location & Capacity */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1.5">
                      Lokasi (Opsional)
                    </label>
                    <input
                      type="text"
                      value={formData.location}
                      onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                      className="w-full px-3 py-2 text-sm bg-white/60 border border-black/[0.08] rounded-xl focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 outline-none transition-all placeholder:text-gray-400"
                      placeholder="Contoh: Lantai 2, Gedung A"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1.5">
                      Kapasitas
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={formData.capacity}
                      onChange={(e) => setFormData({ ...formData, capacity: e.target.value })}
                      className="w-full px-3 py-2 text-sm bg-white/60 border border-black/[0.08] rounded-xl focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 outline-none transition-all placeholder:text-gray-400"
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
                  <label className="block text-xs font-medium text-gray-500 mb-1.5">
                    Urutan Tampilan
                  </label>
                  <input
                    type="number"
                    value={formData.displayOrder}
                    onChange={(e) => setFormData({ ...formData, displayOrder: e.target.value })}
                    className="w-full px-3 py-2 text-sm bg-white/60 border border-black/[0.08] rounded-xl focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 outline-none transition-all placeholder:text-gray-400"
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
              </div>

              {/* Footer */}
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
                >
                  {modalMode === 'create' ? 'Buat' : 'Simpan'}
                </button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && createPortal(
        <div className="fixed inset-0 bg-black/20 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-white/80 backdrop-blur-2xl border border-white/70 rounded-2xl shadow-[0_8px_40px_rgba(0,0,0,0.15),inset_0_1px_0_rgba(255,255,255,0.9)] max-w-sm w-full">
            <div className="flex items-center justify-between px-5 py-4 border-b border-black/[0.06]">
              <h2 className="text-sm font-semibold text-gray-800">Konfirmasi Hapus</h2>
              <button onClick={closeDeleteModal} className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-black/5 rounded-lg transition-colors">
                <X size={14} />
              </button>
            </div>
            <div className="p-5">
              <p className="text-sm text-gray-600">
                Apakah Anda yakin ingin menghapus fasilitas "{fasilitasToDelete?.name}"?
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

export default Fasilitas;
