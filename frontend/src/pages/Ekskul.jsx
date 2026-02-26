import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import api from '../services/api';
import ImageUpload from '../components/ImageUpload';
import { MoreVertical, Edit3, Trash2, ToggleLeft, ToggleRight, X, ChevronDown } from 'lucide-react';

const Ekskul = ({ embedded = false, createTrigger = 0, externalSearch = '' }) => {
  const [ekskuls, setEkskuls] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState('create'); // 'create' or 'edit'
  const [currentEkskul, setCurrentEkskul] = useState(null);
  const [toast, setToast] = useState({ show: false, message: '', type: '' });
  const [cardMenu, setCardMenu] = useState(null); // { item, top, right }

  const openMenuFor = (e, item) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setCardMenu(prev => prev?.item._id === item._id ? null : { item, top: rect.bottom + 4, right: window.innerWidth - rect.right });
  };

  // Search and filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: 'lainnya',
    coach: '',
    schedule: '',
    location: '',
    achievements: [],
    image: '',
    isActive: true,
  });

  // Category options with colors
  const categories = [
    { value: 'olahraga', label: 'Olahraga', color: 'bg-green-100 text-green-800' },
    { value: 'seni', label: 'Seni', color: 'bg-purple-100 text-purple-800' },
    { value: 'akademik', label: 'Akademik', color: 'bg-blue-100 text-blue-800' },
    { value: 'keagamaan', label: 'Keagamaan', color: 'bg-yellow-100 text-yellow-800' },
    { value: 'teknologi', label: 'Teknologi', color: 'bg-orange-100 text-orange-800' },
    { value: 'lainnya', label: 'Lainnya', color: 'bg-gray-100 text-gray-800' },
  ];

  // Fetch ekskuls
  const fetchEkskuls = async () => {
    try {
      setLoading(true);
      const response = await api.get('/api/ekskul');
      setEkskuls(response.data.data.ekskuls);
    } catch (error) {
      showToast('Gagal memuat data ekstrakurikuler', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEkskuls();
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

  // Show toast notification
  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: '', type: '' }), 3000);
  };

  // Handle form input change
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };


  // Open create modal
  const openCreateModal = () => {
    setModalMode('create');
    setFormData({
      name: '',
      description: '',
      category: 'lainnya',
      coach: '',
      schedule: '',
      location: '',
      achievements: [],
      image: '',
      isActive: true,
    });
    setShowModal(true);
  };

  // Open edit modal
  const openEditModal = (ekskul) => {
    setModalMode('edit');
    setCurrentEkskul(ekskul);
    setFormData({
      name: ekskul.name,
      description: ekskul.description,
      category: ekskul.category,
      coach: ekskul.coach,
      schedule: ekskul.schedule,
      location: ekskul.location || '',
      achievements: Array.isArray(ekskul.achievements) ? ekskul.achievements : [],
      image: ekskul.image || '',
      isActive: ekskul.isActive,
    });
    setShowModal(true);
  };

  // Close modal
  const closeModal = () => {
    setShowModal(false);
    setCurrentEkskul(null);
    setFormData({
      name: '',
      description: '',
      category: 'lainnya',
      coach: '',
      schedule: '',
      location: '',
      achievements: [],
      image: '',
      isActive: true,
    });
  };

  // Handle form submit
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      if (modalMode === 'create') {
        await api.post('/api/ekskul', formData);
        showToast('Ekstrakurikuler berhasil ditambahkan!', 'success');
      } else {
        await api.put(`/api/ekskul/${currentEkskul._id}`, formData);
        showToast('Ekstrakurikuler berhasil diupdate!', 'success');
      }

      fetchEkskuls();
      closeModal();
    } catch (error) {
      showToast(error.response?.data?.message || 'Gagal menyimpan ekstrakurikuler', 'error');
    }
  };

  // Handle delete
  const handleDelete = async (id, name) => {
    if (!window.confirm(`Yakin ingin menghapus ekstrakurikuler "${name}"?`)) return;

    try {
      await api.delete(`/api/ekskul/${id}`);
      showToast('Ekstrakurikuler berhasil dihapus!', 'success');
      fetchEkskuls();
    } catch (error) {
      showToast(error.response?.data?.message || 'Gagal menghapus ekstrakurikuler', 'error');
    }
  };

  // Handle toggle active
  const handleToggleActive = async (id) => {
    try {
      await api.patch(`/api/ekskul/${id}/toggle-active`);
      fetchEkskuls();
      showToast('Status berhasil diubah!', 'success');
    } catch (error) {
      showToast('Gagal mengubah status', 'error');
    }
  };

  // Get category badge
  const getCategoryBadge = (category) => {
    const cat = categories.find(c => c.value === category);
    return cat ? `inline-block px-2 py-1 text-xs font-semibold rounded-full ${cat.color}` : '';
  };

  // Filter ekskuls based on search query
  const filteredEkskuls = ekskuls.filter(ekskul => {
    if (!debouncedSearch) return true;

    const query = debouncedSearch.toLowerCase();
    return (
      ekskul.name.toLowerCase().includes(query) ||
      ekskul.description.toLowerCase().includes(query) ||
      ekskul.coach.toLowerCase().includes(query) ||
      ekskul.schedule.toLowerCase().includes(query) ||
      (ekskul.location && ekskul.location.toLowerCase().includes(query)) ||
      categories.find(c => c.value === ekskul.category)?.label.toLowerCase().includes(query)
    );
  });

  return (
    <div className={embedded ? '' : 'p-6'}>
      {/* Toast Notification */}
      {toast.show && (
        <div className={`fixed top-4 right-4 z-50 px-6 py-3 rounded-lg shadow-lg ${
          toast.type === 'success' ? 'bg-green-500' : 'bg-red-500'
        } text-white`}>
          {toast.message}
        </div>
      )}

      {/* Header */}
      {!embedded ? (
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Ekstrakurikuler</h1>
          <p className="text-gray-600 mt-1">Kelola data ekstrakurikuler sekolah</p>
        </div>
        <button
          onClick={openCreateModal}
          className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition flex items-center gap-2"
        >
          <span>➕</span>
          Tambah Ekstrakurikuler
        </button>
      </div>
      ) : null}

      {/* Search Bar — non-embedded only */}
      {!embedded && (
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Cari Ekstrakurikuler
        </label>
        <input
          type="text"
          placeholder="Cari berdasarkan nama, kategori, pembina, jadwal, atau lokasi..."
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

      {/* Loading State */}
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        </div>
      ) : (
        /* Ekskul Grid */
        <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 ${embedded ? 'p-4' : 'gap-6'}`}>
          {filteredEkskuls.map((ekskul) => (
            <div key={ekskul._id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition">
              {/* Image */}
              {ekskul.image && (
                <img
                  src={ekskul.image}
                  alt={ekskul.name}
                  className="w-full h-48 object-cover"
                />
              )}
              {!ekskul.image && (
                <div className="w-full h-48 bg-gray-200 flex items-center justify-center">
                  <span className="text-gray-400 text-4xl">🎯</span>
                </div>
              )}

              {/* Content */}
              <div className="p-4">
                {/* Category + Aktif + ⋮ */}
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className={getCategoryBadge(ekskul.category)}>
                      {categories.find(c => c.value === ekskul.category)?.label}
                    </span>
                    <span className={`inline-flex items-center px-2 py-0.5 text-xs font-semibold rounded-full ${
                      ekskul.isActive
                        ? 'bg-green-100 text-green-700'
                        : 'bg-gray-100 text-gray-600'
                    }`}>
                      {ekskul.isActive ? '✓ Aktif' : '✗ Nonaktif'}
                    </span>
                  </div>

                  {/* ⋮ menu */}
                  <div className="flex-shrink-0">
                    <button
                      onClick={(e) => openMenuFor(e, ekskul)}
                      className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-black/[0.05] transition-colors"
                    >
                      <MoreVertical size={15} />
                    </button>
                  </div>
                </div>

                {/* Name */}
                <h3 className="font-bold text-lg text-gray-800 mb-2">{ekskul.name}</h3>

                {/* Description */}
                <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                  {ekskul.description}
                </p>

                {/* Info */}
                <div className="space-y-1 text-sm text-gray-600">
                  <div className="flex items-center gap-2">
                    <span>👤</span>
                    <span className="font-medium">{ekskul.coach}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span>📅</span>
                    <span>{ekskul.schedule}</span>
                  </div>
                  {ekskul.location && (
                    <div className="flex items-center gap-2">
                      <span>📍</span>
                      <span>{ekskul.location}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Card context menu — portal to body so it's never clipped */}
      {cardMenu && createPortal(
        <>
          <div className="fixed inset-0 z-40" onClick={() => setCardMenu(null)} />
          <div
            className="fixed z-50 bg-white/90 backdrop-blur-2xl border border-white/70 rounded-xl shadow-[0_8px_28px_rgba(0,0,0,0.12),inset_0_1px_0_rgba(255,255,255,0.9)] overflow-hidden py-1 min-w-[150px]"
            style={{ top: cardMenu.top, right: cardMenu.right }}
          >
            <button onClick={() => { openEditModal(cardMenu.item); setCardMenu(null); }} className="w-full px-4 py-2 text-left text-sm flex items-center gap-2.5 text-gray-700 hover:bg-black/[0.05]">
              <Edit3 size={13} className="text-blue-500" /> Edit
            </button>
            <button onClick={() => { handleToggleActive(cardMenu.item._id); setCardMenu(null); }} className="w-full px-4 py-2 text-left text-sm flex items-center gap-2.5 text-gray-700 hover:bg-black/[0.05]">
              {cardMenu.item.isActive ? <ToggleRight size={13} className="text-emerald-500" /> : <ToggleLeft size={13} className="text-gray-400" />}
              {cardMenu.item.isActive ? 'Nonaktifkan' : 'Aktifkan'}
            </button>
            <div className="h-px bg-gray-100 my-1" />
            <button onClick={() => { handleDelete(cardMenu.item._id, cardMenu.item.name); setCardMenu(null); }} className="w-full px-4 py-2 text-left text-sm flex items-center gap-2.5 text-red-500 hover:bg-red-50/60">
              <Trash2 size={13} /> Hapus
            </button>
          </div>
        </>,
        document.body
      )}

      {/* Modal */}
      {showModal && createPortal(
        <div className="fixed inset-0 bg-black/20 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-white/80 backdrop-blur-2xl border border-white/70 rounded-2xl shadow-[0_8px_40px_rgba(0,0,0,0.15),inset_0_1px_0_rgba(255,255,255,0.9)] max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-black/[0.06] sticky top-0 bg-white/80 backdrop-blur-2xl rounded-t-2xl">
              <h2 className="text-sm font-semibold text-gray-800">
                {modalMode === 'create' ? 'Tambah Ekstrakurikuler' : 'Edit Ekstrakurikuler'}
              </h2>
              <button
                onClick={closeModal}
                className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-black/5 rounded-lg transition-colors"
              >
                <X size={14} />
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleSubmit}>
              <div className="p-5 space-y-4">
                {/* Image Upload */}
                <ImageUpload
                  label="Gambar Ekstrakurikuler (Opsional)"
                  value={formData.image}
                  onChange={(url) => setFormData(prev => ({ ...prev, image: url }))}
                  folder="smk-kristen5/ekskul"
                  previewClassName="h-48 w-full object-cover"
                />

                {/* Name */}
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1.5">
                    Nama Ekstrakurikuler *
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 text-sm bg-white/60 border border-black/[0.08] rounded-xl focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 outline-none transition-all placeholder:text-gray-400"
                    placeholder="Contoh: Basket, Pramuka, Paduan Suara"
                  />
                </div>

                {/* Category */}
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1.5">
                    Kategori *
                  </label>
                  <div className="relative">
                    <select
                      name="category"
                      value={formData.category}
                      onChange={handleInputChange}
                      required
                      className="w-full px-3 py-2 text-sm bg-white/60 border border-black/[0.08] rounded-xl focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 outline-none transition-all appearance-none pr-8"
                    >
                      {categories.map(cat => (
                        <option key={cat.value} value={cat.value}>{cat.label}</option>
                      ))}
                    </select>
                    <ChevronDown size={13} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                  </div>
                </div>

                {/* Description */}
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1.5">
                    Deskripsi *
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    required
                    rows={4}
                    className="w-full px-3 py-2 text-sm bg-white/60 border border-black/[0.08] rounded-xl focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 outline-none transition-all placeholder:text-gray-400"
                    placeholder="Deskripsi ekstrakurikuler..."
                  />
                </div>

                {/* Coach */}
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1.5">
                    Pembina/Pelatih *
                  </label>
                  <input
                    type="text"
                    name="coach"
                    value={formData.coach}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 text-sm bg-white/60 border border-black/[0.08] rounded-xl focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 outline-none transition-all placeholder:text-gray-400"
                    placeholder="Nama pembina/pelatih"
                  />
                </div>

                {/* Schedule */}
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1.5">
                    Jadwal *
                  </label>
                  <input
                    type="text"
                    name="schedule"
                    value={formData.schedule}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 text-sm bg-white/60 border border-black/[0.08] rounded-xl focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 outline-none transition-all placeholder:text-gray-400"
                    placeholder="Contoh: Senin & Rabu, 15:00-17:00"
                  />
                </div>

                {/* Location */}
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1.5">
                    Lokasi (Opsional)
                  </label>
                  <input
                    type="text"
                    name="location"
                    value={formData.location}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 text-sm bg-white/60 border border-black/[0.08] rounded-xl focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 outline-none transition-all placeholder:text-gray-400"
                    placeholder="Contoh: Lapangan Basket, Aula"
                  />
                </div>

                {/* Prestasi */}
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1.5">
                    Prestasi (Opsional)
                  </label>
                  {formData.achievements.map((item, idx) => (
                    <div key={idx} className="flex gap-2 mb-2">
                      <input
                        type="text"
                        value={item.nama}
                        onChange={(e) => {
                          const updated = [...formData.achievements];
                          updated[idx] = { ...updated[idx], nama: e.target.value };
                          setFormData(prev => ({ ...prev, achievements: updated }));
                        }}
                        placeholder="Nama prestasi"
                        maxLength={200}
                        className="flex-1 px-3 py-2 text-sm bg-white/60 border border-black/[0.08] rounded-xl focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 outline-none transition-all"
                      />
                      <input
                        type="url"
                        value={item.link}
                        onChange={(e) => {
                          const updated = [...formData.achievements];
                          updated[idx] = { ...updated[idx], link: e.target.value };
                          setFormData(prev => ({ ...prev, achievements: updated }));
                        }}
                        placeholder="Link artikel (opsional)"
                        className="flex-1 px-3 py-2 text-sm bg-white/60 border border-black/[0.08] rounded-xl focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 outline-none transition-all"
                      />
                      <button
                        type="button"
                        onClick={() => setFormData(prev => ({ ...prev, achievements: prev.achievements.filter((_, i) => i !== idx) }))}
                        className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors flex-shrink-0"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, achievements: [...prev.achievements, { nama: '', link: '' }] }))}
                    className="text-xs text-blue-600 hover:text-blue-700 flex items-center gap-1 mt-1"
                  >
                    + Tambah Prestasi
                  </button>
                </div>

                {/* Active Status */}
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    name="isActive"
                    checked={formData.isActive}
                    onChange={handleInputChange}
                    className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                  />
                  <label className="ml-2 text-sm text-gray-700">
                    Aktif (tampilkan di website)
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
                  {modalMode === 'create' ? 'Tambah' : 'Update'}
                </button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}

      {/* Empty State */}
      {!loading && filteredEkskuls.length === 0 && (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">🎯</div>
          <h3 className="text-xl font-semibold text-gray-700 mb-2">
            {searchQuery ? 'Tidak ada ekstrakurikuler yang sesuai pencarian' : 'Belum ada ekstrakurikuler'}
          </h3>
          <p className="text-gray-500 mb-4">
            {searchQuery
              ? 'Coba ubah kata kunci pencarian atau tambahkan ekstrakurikuler baru'
              : 'Tambahkan ekstrakurikuler pertama sekarang!'}
          </p>
          {!searchQuery && (
            <button
              onClick={openCreateModal}
              className="bg-primary-600 text-white px-6 py-2 rounded-lg hover:bg-primary-700 transition"
            >
              Tambah Ekstrakurikuler
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default Ekskul;
