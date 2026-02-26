import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Info, AlertTriangle, X, MoreVertical } from 'lucide-react';
import api from '../services/api';

const HeroSlides = ({ embedded = false, createTrigger = 0, settingsTrigger = 0 }) => {
  const [slides, setSlides] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState('create');
  const [currentSlide, setCurrentSlide] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [toast, setToast] = useState({ show: false, message: '', type: '' });

  // Settings state
  const [settings, setSettings] = useState({
    slideDuration: 5000,
    autoPlay: true,
    showIndicators: true,
  });
  const [savingSettings, setSavingSettings] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [cardMenu, setCardMenu] = useState(null); // { slide, top, right }

  // Form state
  const [formData, setFormData] = useState({
    title: '',
    subtitle: '',
    backgroundImage: '',
    primaryButtonText: 'BAGIKAN CERITAMU',
    primaryButtonLink: '#',
    secondaryButtonText: 'LIHAT LEBIH LANJUT',
    secondaryButtonLink: '#',
    displayOrder: 0,
    isActive: false,
  });

  // Fetch slides
  const fetchSlides = async () => {
    try {
      setLoading(true);
      const response = await api.get('/api/hero-slides');
      setSlides(response.data.data.slides);
    } catch (error) {
      showToast('Gagal memuat data hero slides', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Fetch settings
  const fetchSettings = async () => {
    try {
      const response = await api.get('/api/hero-slides/settings/config');
      if (response.data.data?.settings) {
        setSettings(response.data.data.settings);
      }
    } catch (error) {
      console.error('Error fetching settings:', error);
    }
  };

  // Save settings
  const saveSettings = async () => {
    setSavingSettings(true);
    try {
      await api.put('/api/hero-slides/settings/config', settings);
      showToast('Pengaturan berhasil disimpan!', 'success');
    } catch (error) {
      showToast('Gagal menyimpan pengaturan', 'error');
    } finally {
      setSavingSettings(false);
    }
  };

  useEffect(() => {
    fetchSlides();
    fetchSettings();
  }, []);

  useEffect(() => {
    if (createTrigger > 0) openCreateModal();
  }, [createTrigger]);

  useEffect(() => {
    if (settingsTrigger > 0) setShowSettingsModal(true);
  }, [settingsTrigger]);

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

  // Handle image upload
  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      showToast('File harus berupa gambar', 'error');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      showToast('Ukuran file maksimal 5MB', 'error');
      return;
    }

    setUploading(true);
    const uploadData = new FormData();
    uploadData.append('image', file);

    try {
      const response = await api.post('/api/upload/image', uploadData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setFormData(prev => ({
        ...prev,
        backgroundImage: response.data.data.url
      }));
      showToast('Gambar berhasil diupload!', 'success');
    } catch (error) {
      showToast('Gagal upload gambar', 'error');
    } finally {
      setUploading(false);
    }
  };

  // Open create modal
  const openCreateModal = () => {
    setModalMode('create');
    setFormData({
      title: '',
      subtitle: '',
      backgroundImage: '',
      primaryButtonText: 'BAGIKAN CERITAMU',
      primaryButtonLink: '#',
      secondaryButtonText: 'LIHAT LEBIH LANJUT',
      secondaryButtonLink: '#',
      displayOrder: 0,
      isActive: false,
    });
    setShowModal(true);
  };

  // Open edit modal
  const openEditModal = (slide) => {
    setModalMode('edit');
    setCurrentSlide(slide);
    setFormData({
      title: slide.title,
      subtitle: slide.subtitle || '',
      backgroundImage: slide.backgroundImage,
      primaryButtonText: slide.primaryButtonText || 'BAGIKAN CERITAMU',
      primaryButtonLink: slide.primaryButtonLink || '#',
      secondaryButtonText: slide.secondaryButtonText || 'LIHAT LEBIH LANJUT',
      secondaryButtonLink: slide.secondaryButtonLink || '#',
      displayOrder: slide.displayOrder || 0,
      isActive: slide.isActive,
    });
    setShowModal(true);
  };

  // Close modal
  const closeModal = () => {
    setShowModal(false);
    setCurrentSlide(null);
    setFormData({
      title: '',
      subtitle: '',
      backgroundImage: '',
      primaryButtonText: 'BAGIKAN CERITAMU',
      primaryButtonLink: '#',
      secondaryButtonText: 'LIHAT LEBIH LANJUT',
      secondaryButtonLink: '#',
      displayOrder: 0,
      isActive: false,
    });
  };

  // Handle form submit
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.backgroundImage) {
      showToast('Gambar background wajib diisi', 'error');
      return;
    }

    try {
      if (modalMode === 'create') {
        await api.post('/api/hero-slides', formData);
        showToast('Hero slide berhasil ditambahkan!', 'success');
      } else {
        await api.put(`/api/hero-slides/${currentSlide._id}`, formData);
        showToast('Hero slide berhasil diupdate!', 'success');
      }

      fetchSlides();
      closeModal();
    } catch (error) {
      showToast(error.response?.data?.message || 'Gagal menyimpan hero slide', 'error');
    }
  };

  // Handle delete
  const handleDelete = async (id, title) => {
    if (!window.confirm(`Yakin ingin menghapus slide "${title}"?`)) return;

    try {
      await api.delete(`/api/hero-slides/${id}`);
      showToast('Hero slide berhasil dihapus!', 'success');
      fetchSlides();
    } catch (error) {
      showToast(error.response?.data?.message || 'Gagal menghapus hero slide', 'error');
    }
  };

  // Handle toggle active
  const handleToggleActive = async (id) => {
    try {
      await api.patch(`/api/hero-slides/${id}/toggle-active`);
      fetchSlides();
      showToast('Status berhasil diubah!', 'success');
    } catch (error) {
      showToast(error.response?.data?.message || 'Gagal mengubah status', 'error');
    }
  };

  // Open card context menu
  const openCardMenu = (e, slide) => {
    e.stopPropagation();
    const btn = e.currentTarget.getBoundingClientRect();
    setCardMenu({ slide, top: btn.bottom + 4, right: window.innerWidth - btn.right });
  };

  // Count active slides
  const activeCount = slides.filter(s => s.isActive).length;

  return (
    <div className={embedded ? 'p-4' : 'p-6'}>
      {/* Toast Notification */}
      {toast.show && (
        <div className={`fixed top-4 right-4 z-50 px-6 py-3 rounded-lg shadow-lg ${
          toast.type === 'success' ? 'bg-green-500' : 'bg-red-500'
        } text-white`}>
          {toast.message}
        </div>
      )}

      {/* Header */}
      {!embedded && (
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Hero Slides</h1>
          <p className="text-gray-600 mt-1">Kelola slide hero homepage (Max 5 aktif)</p>
          <p className="text-sm text-gray-500 mt-1">
            Slide Aktif: <span className={`font-semibold ${activeCount >= 5 ? 'text-red-600' : 'text-green-600'}`}>
              {activeCount}/5
            </span>
          </p>
        </div>
        <button
          onClick={openCreateModal}
          className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition flex items-center gap-2"
        >
          <span>➕</span>
          Tambah Hero Slide
        </button>
      </div>
      )}

      {/* Warning: max slides reached */}
      {activeCount >= 5 && (
        <div className="flex items-start gap-2.5 bg-amber-50 rounded-xl px-4 py-3 mb-4">
          <AlertTriangle size={15} className="flex-shrink-0 mt-0.5 text-amber-500" />
          <p className="text-sm text-amber-700">
            <strong>Maksimum 5 slide aktif tercapai.</strong> Nonaktifkan slide lain sebelum mengaktifkan yang baru.
          </p>
        </div>
      )}

      {/* Settings Panel — standalone mode only */}
      {!embedded && (
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">⚙️ Pengaturan Slide</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Durasi per Slide (detik)
            </label>
            <div className="flex items-center gap-2">
              <input
                type="range"
                min="1"
                max="15"
                value={settings.slideDuration / 1000}
                onChange={(e) => setSettings({ ...settings, slideDuration: parseInt(e.target.value) * 1000 })}
                className="flex-1"
              />
              <span className="text-lg font-semibold text-primary-600 w-12 text-center">
                {settings.slideDuration / 1000}s
              </span>
            </div>
          </div>
          <div className="flex items-center">
            <label className="flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.autoPlay}
                onChange={(e) => setSettings({ ...settings, autoPlay: e.target.checked })}
                className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
              />
              <span className="ml-2 text-sm text-gray-700">Auto Play</span>
            </label>
          </div>
          <div className="flex items-center">
            <label className="flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.showIndicators}
                onChange={(e) => setSettings({ ...settings, showIndicators: e.target.checked })}
                className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
              />
              <span className="ml-2 text-sm text-gray-700">Tampilkan Indikator</span>
            </label>
          </div>
        </div>
        <div className="mt-4 flex justify-end">
          <button
            onClick={saveSettings}
            disabled={savingSettings}
            className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition disabled:opacity-50"
          >
            {savingSettings ? 'Menyimpan...' : '💾 Simpan Pengaturan'}
          </button>
        </div>
      </div>
      )}

      {/* Info banner */}
      <div className="flex items-start gap-2.5 bg-blue-50 rounded-xl px-4 py-3 mb-4">
        <Info size={15} className="flex-shrink-0 mt-0.5 text-blue-500" />
        <p className="text-sm text-blue-700">
          Slide akan berganti otomatis setiap <strong>{settings.slideDuration / 1000} detik</strong> di homepage. Gunakan gambar dengan resolusi tinggi (minimal 1920x1080) untuk hasil terbaik.
        </p>
      </div>

      {/* Loading State */}
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        </div>
      ) : (
        /* Slides Grid */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {slides.map((slide) => (
            <div key={slide._id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition">
              {/* Background Image */}
              <div className="relative h-48">
                <img
                  src={slide.backgroundImage}
                  alt={slide.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                <div className="absolute bottom-3 left-3 right-3">
                  <h3 className="font-bold text-white text-sm line-clamp-2 drop-shadow">
                    {slide.title}
                  </h3>
                </div>
              </div>

              {/* Content */}
              <div className="p-4">
                {/* Status + Order + Menu */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleToggleActive(slide._id)}
                    className={`px-3 py-1 text-xs font-semibold rounded-full cursor-pointer ${
                      slide.isActive
                        ? 'bg-green-100 text-green-800 hover:bg-green-200'
                        : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                    }`}
                  >
                    {slide.isActive ? '✓ Aktif' : '✗ Nonaktif'}
                  </button>
                  <span className="px-3 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                    #{slide.displayOrder}
                  </span>
                  <div className="flex-1" />
                  <button
                    onClick={(e) => openCardMenu(e, slide)}
                    className="p-1 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
                  >
                    <MoreVertical size={15} />
                  </button>
                </div>

                {/* Subtitle */}
                {slide.subtitle && (
                  <p className="text-gray-600 text-sm mt-3 line-clamp-2">
                    {slide.subtitle}
                  </p>
                )}

                {/* Button labels */}
                <div className="flex gap-2 text-xs text-gray-500 mt-3">
                  <span className="bg-gray-100 px-2 py-1 rounded">{slide.primaryButtonText}</span>
                  <span className="bg-gray-100 px-2 py-1 rounded">{slide.secondaryButtonText}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {showModal && createPortal(
        <div className="fixed inset-0 bg-black/20 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-white/80 backdrop-blur-2xl border border-white/70 rounded-2xl shadow-[0_8px_40px_rgba(0,0,0,0.15),inset_0_1px_0_rgba(255,255,255,0.9)] max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-5 py-4 border-b border-black/[0.06] sticky top-0 bg-white/80 backdrop-blur-2xl rounded-t-2xl">
              <h2 className="text-sm font-semibold text-gray-800">
                {modalMode === 'create' ? 'Tambah Hero Slide' : 'Edit Hero Slide'}
              </h2>
              <button onClick={closeModal}
                className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-black/5 rounded-lg transition-colors">
                <X size={14} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-5 space-y-4">
              {/* Background Image */}
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1.5">Gambar Background *</label>
                <div className="flex items-center gap-3 mb-2">
                  <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" id="bg-image-upload" />
                  <label htmlFor="bg-image-upload"
                    className={`px-3 py-1.5 text-xs border border-dashed border-black/20 rounded-xl cursor-pointer hover:border-blue-400 hover:bg-blue-50/50 transition-colors ${uploading ? 'opacity-50 cursor-not-allowed' : ''}`}>
                    {uploading ? 'Mengupload...' : '📁 Upload Gambar'}
                  </label>
                  {formData.backgroundImage && <span className="text-xs text-green-600">✓ Gambar tersedia</span>}
                </div>
                <p className="text-xs text-gray-400 mb-1.5">atau masukkan URL gambar:</p>
                <input type="url" name="backgroundImage" value={formData.backgroundImage} onChange={handleInputChange}
                  className="w-full px-3 py-2 text-sm bg-white/60 border border-black/[0.08] rounded-xl focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 outline-none transition-all placeholder:text-gray-400"
                  placeholder="https://example.com/image.jpg" />
                <p className="text-xs text-gray-400 mt-1">Format: JPG, PNG. Rekomendasi: 1920x1080px</p>
              </div>

              {/* Image Preview */}
              {formData.backgroundImage && (
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1.5">Preview</label>
                  <div className="relative h-36 rounded-xl overflow-hidden">
                    <img src={formData.backgroundImage} alt="Preview" className="w-full h-full object-cover" />
                    <div className="absolute inset-0" style={{ background: 'linear-gradient(160deg,rgba(63,43,150,.85) 0%,rgba(30,64,175,.8) 30%,rgba(13,118,190,.75) 60%,rgba(56,189,248,.7) 100%)' }} />
                    <div className="absolute bottom-3 left-3 text-white max-w-[60%]">
                      <p className="font-bold text-xs">{formData.title || 'Judul Slide'}</p>
                      <p className="text-[10px] mt-0.5 opacity-80">{formData.subtitle || 'Subtitle slide...'}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Title */}
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1.5">Judul Slide *</label>
                <input type="text" name="title" value={formData.title} onChange={handleInputChange} required maxLength={200}
                  className="w-full px-3 py-2 text-sm bg-white/60 border border-black/[0.08] rounded-xl focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 outline-none transition-all placeholder:text-gray-400"
                  placeholder="SMK YANG MENYIAPKAN SISWA MASUK DUNIA KERJA" />
              </div>

              {/* Subtitle */}
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1.5">Subtitle (Opsional)</label>
                <textarea name="subtitle" value={formData.subtitle} onChange={handleInputChange} rows={2} maxLength={500}
                  className="w-full px-3 py-2 text-sm bg-white/60 border border-black/[0.08] rounded-xl focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 outline-none transition-all placeholder:text-gray-400 resize-none"
                  placeholder="Kurikulum berbasis industri, praktik langsung, dan pembinaan karakter sejak kelas X." />
              </div>

              {/* Primary Button */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1.5">Teks Tombol Utama</label>
                  <input type="text" name="primaryButtonText" value={formData.primaryButtonText} onChange={handleInputChange} maxLength={50}
                    className="w-full px-3 py-2 text-sm bg-white/60 border border-black/[0.08] rounded-xl focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 outline-none transition-all placeholder:text-gray-400"
                    placeholder="BAGIKAN CERITAMU" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1.5">Link Tombol Utama</label>
                  <input type="text" name="primaryButtonLink" value={formData.primaryButtonLink} onChange={handleInputChange}
                    className="w-full px-3 py-2 text-sm bg-white/60 border border-black/[0.08] rounded-xl focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 outline-none transition-all placeholder:text-gray-400"
                    placeholder="#" />
                </div>
              </div>

              {/* Secondary Button */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1.5">Teks Tombol Sekunder</label>
                  <input type="text" name="secondaryButtonText" value={formData.secondaryButtonText} onChange={handleInputChange} maxLength={50}
                    className="w-full px-3 py-2 text-sm bg-white/60 border border-black/[0.08] rounded-xl focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 outline-none transition-all placeholder:text-gray-400"
                    placeholder="LIHAT LEBIH LANJUT" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1.5">Link Tombol Sekunder</label>
                  <input type="text" name="secondaryButtonLink" value={formData.secondaryButtonLink} onChange={handleInputChange}
                    className="w-full px-3 py-2 text-sm bg-white/60 border border-black/[0.08] rounded-xl focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 outline-none transition-all placeholder:text-gray-400"
                    placeholder="#" />
                </div>
              </div>

              {/* Display Order */}
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1.5">Urutan Tampilan</label>
                <input type="number" name="displayOrder" value={formData.displayOrder} onChange={handleInputChange} min="0"
                  className="w-full px-3 py-2 text-sm bg-white/60 border border-black/[0.08] rounded-xl focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 outline-none transition-all"
                  placeholder="0" />
                <p className="text-xs text-gray-400 mt-1">Semakin kecil angka, semakin awal ditampilkan</p>
              </div>

              {/* Active Status */}
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" name="isActive" checked={formData.isActive} onChange={handleInputChange}
                  className="w-3.5 h-3.5 accent-blue-600 cursor-pointer" />
                <span className="text-xs text-gray-600">Aktif (tampilkan di homepage)</span>
              </label>

              {formData.isActive && modalMode === 'create' && activeCount >= 5 && (
                <div className="bg-amber-50 border border-amber-200/60 rounded-xl px-3 py-2.5">
                  <p className="text-xs text-amber-700">Sudah ada 5 slide aktif. Nonaktifkan slide lain terlebih dahulu.</p>
                </div>
              )}
            </form>

            <div className="flex justify-end gap-2 px-5 pb-5 pt-2 border-t border-black/[0.06]">
              <button type="button" onClick={closeModal}
                className="px-4 py-2 text-xs text-gray-600 hover:bg-black/5 rounded-xl transition-colors">Batal</button>
              <button onClick={handleSubmit}
                className="px-4 py-2 text-xs bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors">
                {modalMode === 'create' ? 'Tambah' : 'Simpan'}
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* Empty State */}
      {!loading && slides.length === 0 && (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">🖼️</div>
          <h3 className="text-xl font-semibold text-gray-700 mb-2">
            Belum ada hero slide
          </h3>
          <p className="text-gray-500 mb-4">
            Tambahkan slide untuk hero section homepage!
          </p>
          <button
            onClick={openCreateModal}
            className="bg-primary-600 text-white px-6 py-2 rounded-lg hover:bg-primary-700 transition"
          >
            Tambah Hero Slide
          </button>
        </div>
      )}

      {/* Card context menu */}
      {cardMenu && createPortal(
        <>
          <div className="fixed inset-0 z-40" onClick={() => setCardMenu(null)} />
          <div
            className="fixed z-50 bg-white/80 backdrop-blur-2xl border border-white/70 rounded-xl shadow-[0_8px_28px_rgba(0,0,0,0.12),inset_0_1px_0_rgba(255,255,255,0.9)] py-1 min-w-[160px] overflow-hidden"
            style={{ top: cardMenu.top, right: cardMenu.right }}
          >
            <button
              onClick={() => { openEditModal(cardMenu.slide); setCardMenu(null); }}
              className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-black/[0.05] transition-colors"
            >
              Edit
            </button>
            <div className="h-px bg-black/[0.06] mx-2" />
            <button
              onClick={() => { handleDelete(cardMenu.slide._id, cardMenu.slide.title); setCardMenu(null); }}
              className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 transition-colors"
            >
              Hapus
            </button>
          </div>
        </>,
        document.body
      )}

      {/* Settings Modal */}
      {showSettingsModal && createPortal(
        <div className="fixed inset-0 bg-black/20 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-white/80 backdrop-blur-2xl border border-white/70 rounded-2xl shadow-[0_8px_40px_rgba(0,0,0,0.15),inset_0_1px_0_rgba(255,255,255,0.9)] w-full max-w-sm">
            <div className="flex items-center justify-between px-5 py-4 border-b border-black/[0.06]">
              <h3 className="text-sm font-semibold text-gray-800">Pengaturan Slide</h3>
              <button onClick={() => setShowSettingsModal(false)}
                className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-black/5 rounded-lg transition-colors">
                <X size={14} />
              </button>
            </div>

            <div className="p-5 space-y-5">
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="text-xs text-gray-600">Durasi per Slide</label>
                  <span className="text-xs font-semibold text-blue-600">{settings.slideDuration / 1000}s</span>
                </div>
                <input type="range" min="1" max="15" value={settings.slideDuration / 1000}
                  onChange={(e) => setSettings({ ...settings, slideDuration: parseInt(e.target.value) * 1000 })}
                  className="w-full accent-blue-600" />
                <div className="flex justify-between text-xs text-gray-400 mt-1"><span>1s</span><span>15s</span></div>
              </div>

              <div className="space-y-3">
                <label className="flex items-center justify-between cursor-pointer">
                  <span className="text-xs text-gray-600">Auto Play</span>
                  <input type="checkbox" checked={settings.autoPlay}
                    onChange={(e) => setSettings({ ...settings, autoPlay: e.target.checked })}
                    className="w-3.5 h-3.5 accent-blue-600 cursor-pointer" />
                </label>
                <div className="h-px bg-black/[0.06]" />
                <label className="flex items-center justify-between cursor-pointer">
                  <span className="text-xs text-gray-600">Tampilkan Indikator</span>
                  <input type="checkbox" checked={settings.showIndicators}
                    onChange={(e) => setSettings({ ...settings, showIndicators: e.target.checked })}
                    className="w-3.5 h-3.5 accent-blue-600 cursor-pointer" />
                </label>
              </div>
            </div>

            <div className="flex justify-end gap-2 px-5 pb-5 pt-2 border-t border-black/[0.06]">
              <button onClick={() => setShowSettingsModal(false)}
                className="px-4 py-2 text-xs text-gray-600 hover:bg-black/5 rounded-xl transition-colors">Batal</button>
              <button onClick={async () => { await saveSettings(); setShowSettingsModal(false); }} disabled={savingSettings}
                className="px-4 py-2 text-xs bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors disabled:opacity-50">
                {savingSettings ? 'Menyimpan...' : 'Simpan'}
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
};

export default HeroSlides;
