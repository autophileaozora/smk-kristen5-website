import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { MoreVertical, Edit3, Trash2, Eye, EyeOff, Star, X, ChevronDown } from 'lucide-react';
import api from '../services/api';
import ImageUpload from '../components/ImageUpload';

const Alumni = ({ embedded = false, createTrigger = 0, externalSearch = '', filterVisible = true }) => {
  const [alumni, setAlumni] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState('create'); // 'create' or 'edit'
  const [currentAlumni, setCurrentAlumni] = useState(null);
  const [toast, setToast] = useState({ show: false, message: '', type: '' });
  const [cardMenu, setCardMenu] = useState(null); // { item, top, right }

  const openMenuFor = (e, item) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setCardMenu(prev => prev?.item._id === item._id ? null : { item, top: rect.bottom + 4, right: window.innerWidth - rect.right });
  };

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [selectedYear, setSelectedYear] = useState('');
  const [selectedJurusan, setSelectedJurusan] = useState('');
  const [years, setYears] = useState([]);
  const [jurusans, setJurusans] = useState([]);

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    graduationYear: new Date().getFullYear(),
    jurusan: '',
    currentOccupation: '',
    company: '',
    university: '',
    achievement: '',
    testimonial: '',
    linkedIn: '',
    photo: '',
    isPublished: false,
    isFeatured: false,
  });

  // Fetch alumni
  const fetchAlumni = async () => {
    try {
      setLoading(true);
      const params = {};
      if (selectedYear) params.graduationYear = selectedYear;
      if (selectedJurusan) params.jurusan = selectedJurusan;
      if (debouncedSearch) params.search = debouncedSearch;

      const response = await api.get('/api/alumni', { params });
      setAlumni(response.data.data.alumni);
    } catch (error) {
      showToast('Gagal memuat data alumni', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Fetch available years
  const fetchYears = async () => {
    try {
      const response = await api.get('/api/alumni/years');
      setYears(response.data.data.years);
    } catch (error) {
      console.error('Failed to fetch years');
    }
  };

  // Fetch jurusans
  const fetchJurusans = async () => {
    try {
      const response = await api.get('/api/jurusan');
      setJurusans(response.data.data.jurusans);
    } catch (error) {
      console.error('Failed to fetch jurusans');
    }
  };

  useEffect(() => {
    fetchAlumni();
    fetchYears();
    fetchJurusans();
  }, [selectedYear, selectedJurusan, debouncedSearch]);

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
      graduationYear: new Date().getFullYear(),
      jurusan: '',
      currentOccupation: '',
      company: '',
      university: '',
      achievement: '',
      testimonial: '',
      linkedIn: '',
      photo: '',
      isPublished: false,
      isFeatured: false,
    });
    setShowModal(true);
  };

  // Open edit modal
  const openEditModal = (alumniData) => {
    setModalMode('edit');
    setCurrentAlumni(alumniData);
    setFormData({
      name: alumniData.name,
      graduationYear: alumniData.graduationYear,
      jurusan: alumniData.jurusan,
      currentOccupation: alumniData.currentOccupation || '',
      company: alumniData.company || '',
      university: alumniData.university || '',
      achievement: alumniData.achievement || '',
      testimonial: alumniData.testimonial || '',
      linkedIn: alumniData.linkedIn || '',
      photo: alumniData.photo || '',
      isPublished: alumniData.isPublished,
      isFeatured: alumniData.isFeatured,
    });
    setShowModal(true);
  };

  // Close modal
  const closeModal = () => {
    setShowModal(false);
    setCurrentAlumni(null);
    setFormData({
      name: '',
      graduationYear: new Date().getFullYear(),
      jurusan: '',
      currentOccupation: '',
      company: '',
      university: '',
      achievement: '',
      testimonial: '',
      linkedIn: '',
      photo: '',
      isPublished: false,
      isFeatured: false,
    });
  };

  // Handle form submit
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      if (modalMode === 'create') {
        await api.post('/api/alumni', formData);
        showToast('Alumni berhasil ditambahkan!', 'success');
      } else {
        await api.put(`/api/alumni/${currentAlumni._id}`, formData);
        showToast('Alumni berhasil diupdate!', 'success');
      }

      fetchAlumni();
      fetchYears();
      closeModal();
    } catch (error) {
      showToast(error.response?.data?.message || 'Gagal menyimpan alumni', 'error');
    }
  };

  // Handle delete
  const handleDelete = async (id, name) => {
    if (!window.confirm(`Yakin ingin menghapus alumni "${name}"?`)) return;

    try {
      await api.delete(`/api/alumni/${id}`);
      showToast('Alumni berhasil dihapus!', 'success');
      fetchAlumni();
      fetchYears();
    } catch (error) {
      showToast(error.response?.data?.message || 'Gagal menghapus alumni', 'error');
    }
  };

  // Handle toggle published
  const handleTogglePublished = async (id) => {
    try {
      await api.patch(`/api/alumni/${id}/toggle-published`);
      fetchAlumni();
      showToast('Status publikasi berhasil diubah!', 'success');
    } catch (error) {
      showToast('Gagal mengubah status', 'error');
    }
  };

  // Handle toggle featured
  const handleToggleFeatured = async (id) => {
    try {
      await api.patch(`/api/alumni/${id}/toggle-featured`);
      fetchAlumni();
      showToast('Status featured berhasil diubah!', 'success');
    } catch (error) {
      showToast('Gagal mengubah status', 'error');
    }
  };

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
          <h1 className="text-2xl font-bold text-gray-800">Alumni</h1>
          <p className="text-gray-600 mt-1">Kelola data alumni sekolah</p>
        </div>
        <button
          onClick={openCreateModal}
          className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition flex items-center gap-2"
        >
          <span>➕</span>
          Tambah Alumni
        </button>
      </div>
      ) : null}

      {/* Compact filter row — embedded only */}
      {embedded && filterVisible && (
        <div className="flex items-center gap-2 px-4 pt-4 pb-2 flex-wrap">
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(e.target.value)}
            className="px-2.5 py-1.5 text-xs bg-white/70 border border-black/[0.08] rounded-xl focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 outline-none transition-all text-gray-700"
          >
            <option value="">Semua Tahun</option>
            {years.map(year => (
              <option key={year} value={year}>{year}</option>
            ))}
          </select>
          <select
            value={selectedJurusan}
            onChange={(e) => setSelectedJurusan(e.target.value)}
            className="px-2.5 py-1.5 text-xs bg-white/70 border border-black/[0.08] rounded-xl focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 outline-none transition-all text-gray-700"
          >
            <option value="">Semua Jurusan</option>
            {jurusans.map((jurusan) => (
              <option key={jurusan._id} value={jurusan.code}>
                {jurusan.code} - {jurusan.name}
              </option>
            ))}
          </select>
          {(selectedYear || selectedJurusan) && (
            <button
              onClick={() => { setSelectedYear(''); setSelectedJurusan(''); }}
              className="px-2.5 py-1.5 text-xs text-gray-500 hover:text-gray-700 bg-black/[0.05] hover:bg-black/[0.08] rounded-xl transition-colors"
            >
              Reset
            </button>
          )}
        </div>
      )}

      {/* Search and Filters */}
      {!embedded && (
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        {/* Search Bar */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Cari Alumni
          </label>
          <input
            type="text"
            placeholder="Cari berdasarkan nama, pekerjaan, perusahaan, universitas..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-base"
          />
        </div>

        {/* Filters Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Filter by Tahun Lulus
            </label>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
            >
              <option value="">Semua Tahun</option>
              {years.map(year => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Filter by Jurusan
            </label>
            <select
              value={selectedJurusan}
              onChange={(e) => setSelectedJurusan(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
            >
              <option value="">Semua Jurusan</option>
              {jurusans.map((jurusan) => (
                <option key={jurusan._id} value={jurusan.code}>
                  {jurusan.code} - {jurusan.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Reset Filters Button */}
        {(selectedYear || selectedJurusan || searchQuery) && (
          <div className="mt-4">
            <button
              onClick={() => {
                setSelectedYear('');
                setSelectedJurusan('');
                setSearchQuery('');
              }}
              className="px-4 py-2 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
            >
              Reset Semua Filter
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
        /* Alumni Grid */
        <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6${embedded ? ' p-4' : ''}`}>
          {alumni.map((alumniData) => (
            <div key={alumniData._id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition">
              {/* Photo */}
              {alumniData.photo && (
                <img
                  src={alumniData.photo}
                  alt={alumniData.name}
                  className="w-full h-48 object-cover"
                />
              )}
              {!alumniData.photo && (
                <div className="w-full h-48 bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center">
                  <span className="text-6xl">👨‍🎓</span>
                </div>
              )}

              {/* Content */}
              <div className="p-4">
                {/* Header: badges + menu */}
                <div className="flex items-start justify-between mb-3">
                  <div className="flex gap-1.5 flex-wrap">
                    <span className="inline-block px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                      {alumniData.graduationYear}
                    </span>
                    <span className="inline-block px-2 py-1 text-xs font-semibold rounded-full bg-purple-100 text-purple-800">
                      {alumniData.jurusan}
                    </span>
                    {alumniData.isPublished
                      ? <span className="inline-block px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">Published</span>
                      : <span className="inline-block px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-500">Draft</span>
                    }
                    {alumniData.isFeatured && (
                      <span className="inline-block px-2 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800">⭐ Featured</span>
                    )}
                  </div>
                  <div className="flex-shrink-0 ml-2">
                    <button
                      onClick={(e) => openMenuFor(e, alumniData)}
                      className="p-1 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
                    >
                      <MoreVertical size={15} />
                    </button>
                  </div>
                </div>

                {/* Name */}
                <h3 className="font-bold text-lg text-gray-800 mb-2">{alumniData.name}</h3>

                {/* Info */}
                <div className="space-y-2 text-sm text-gray-600">
                  {alumniData.currentOccupation && (
                    <div className="flex items-start gap-2">
                      <span className="flex-shrink-0">💼</span>
                      <span className="line-clamp-2">{alumniData.currentOccupation}</span>
                    </div>
                  )}
                  {alumniData.company && (
                    <div className="flex items-start gap-2">
                      <span className="flex-shrink-0">🏢</span>
                      <span className="line-clamp-2">{alumniData.company}</span>
                    </div>
                  )}
                  {alumniData.university && (
                    <div className="flex items-start gap-2">
                      <span className="flex-shrink-0">🎓</span>
                      <span className="line-clamp-2">{alumniData.university}</span>
                    </div>
                  )}
                  {alumniData.linkedIn && (
                    <div className="flex items-start gap-2">
                      <span className="flex-shrink-0">🔗</span>
                      <a
                        href={alumniData.linkedIn}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline line-clamp-1"
                      >
                        LinkedIn
                      </a>
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
            className="fixed z-50 bg-white/80 backdrop-blur-2xl border border-white/70 rounded-xl shadow-[0_8px_28px_rgba(0,0,0,0.12),inset_0_1px_0_rgba(255,255,255,0.9)] py-1 min-w-[150px] overflow-hidden"
            style={{ top: cardMenu.top, right: cardMenu.right }}
          >
            <button onClick={() => { openEditModal(cardMenu.item); setCardMenu(null); }} className="w-full px-3 py-2 text-left flex items-center gap-2 text-gray-700 hover:bg-black/5">
              <Edit3 size={13} /> Edit
            </button>
            <button onClick={() => { handleTogglePublished(cardMenu.item._id); setCardMenu(null); }} className="w-full px-3 py-2 text-left flex items-center gap-2 text-gray-700 hover:bg-black/5">
              {cardMenu.item.isPublished ? <EyeOff size={13} /> : <Eye size={13} />}
              {cardMenu.item.isPublished ? 'Jadikan Draft' : 'Publikasikan'}
            </button>
            <button onClick={() => { handleToggleFeatured(cardMenu.item._id); setCardMenu(null); }} className="w-full px-3 py-2 text-left flex items-center gap-2 text-gray-700 hover:bg-black/5">
              <Star size={13} />
              {cardMenu.item.isFeatured ? 'Hapus Featured' : 'Jadikan Featured'}
            </button>
            <div className="h-px bg-black/[0.06] my-1" />
            <button onClick={() => { handleDelete(cardMenu.item._id, cardMenu.item.name); setCardMenu(null); }} className="w-full px-3 py-2 text-left flex items-center gap-2 text-red-600 hover:bg-red-50">
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
                {modalMode === 'create' ? 'Tambah Alumni' : 'Edit Alumni'}
              </h2>
              <button
                onClick={closeModal}
                className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-black/5 rounded-lg transition-colors"
              >
                <X size={14} />
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleSubmit} className="p-5 space-y-4">
              {/* Photo Upload */}
              <ImageUpload
                label="Foto Alumni (Opsional)"
                value={formData.photo}
                onChange={(url) => setFormData(prev => ({ ...prev, photo: url }))}
                folder="smk-kristen5/alumni"
                previewClassName="h-32 w-32 object-cover rounded-lg"
              />

              {/* Name */}
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1.5">
                  Nama Lengkap *
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 text-sm bg-white/60 border border-black/[0.08] rounded-xl focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 outline-none transition-all placeholder:text-gray-400"
                  placeholder="Nama lengkap alumni"
                />
              </div>

              {/* Graduation Year & Jurusan */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1.5">
                    Tahun Lulus *
                  </label>
                  <input
                    type="number"
                    name="graduationYear"
                    value={formData.graduationYear}
                    onChange={handleInputChange}
                    required
                    min="1900"
                    max={new Date().getFullYear()}
                    className="w-full px-3 py-2 text-sm bg-white/60 border border-black/[0.08] rounded-xl focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 outline-none transition-all placeholder:text-gray-400"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1.5">
                    Jurusan *
                  </label>
                  <div className="relative">
                    <select
                      name="jurusan"
                      value={formData.jurusan}
                      onChange={handleInputChange}
                      required
                      className="w-full px-3 py-2 text-sm bg-white/60 border border-black/[0.08] rounded-xl focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 outline-none transition-all appearance-none pr-8"
                    >
                      <option value="">Pilih Jurusan</option>
                      {jurusans.map((jurusan) => (
                        <option key={jurusan._id} value={jurusan.code}>
                          {jurusan.code} - {jurusan.name}
                        </option>
                      ))}
                    </select>
                    <ChevronDown size={13} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                  </div>
                </div>
              </div>

              {/* Current Occupation */}
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1.5">
                  Pekerjaan Saat Ini
                </label>
                <input
                  type="text"
                  name="currentOccupation"
                  value={formData.currentOccupation}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 text-sm bg-white/60 border border-black/[0.08] rounded-xl focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 outline-none transition-all placeholder:text-gray-400"
                  placeholder="Contoh: Software Engineer"
                />
              </div>

              {/* Company & University */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1.5">
                    Perusahaan
                  </label>
                  <input
                    type="text"
                    name="company"
                    value={formData.company}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 text-sm bg-white/60 border border-black/[0.08] rounded-xl focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 outline-none transition-all placeholder:text-gray-400"
                    placeholder="Nama perusahaan"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1.5">
                    Universitas
                  </label>
                  <input
                    type="text"
                    name="university"
                    value={formData.university}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 text-sm bg-white/60 border border-black/[0.08] rounded-xl focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 outline-none transition-all placeholder:text-gray-400"
                    placeholder="Jika melanjutkan kuliah"
                  />
                </div>
              </div>

              {/* LinkedIn */}
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1.5">
                  LinkedIn URL
                </label>
                <input
                  type="url"
                  name="linkedIn"
                  value={formData.linkedIn}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 text-sm bg-white/60 border border-black/[0.08] rounded-xl focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 outline-none transition-all placeholder:text-gray-400"
                  placeholder="https://linkedin.com/in/..."
                />
              </div>

              {/* Achievement */}
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1.5">
                  Prestasi
                </label>
                <textarea
                  name="achievement"
                  value={formData.achievement}
                  onChange={handleInputChange}
                  rows={3}
                  className="w-full px-3 py-2 text-sm bg-white/60 border border-black/[0.08] rounded-xl focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 outline-none transition-all placeholder:text-gray-400"
                  placeholder="Prestasi yang pernah diraih..."
                />
              </div>

              {/* Testimonial */}
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1.5">
                  Testimonial
                </label>
                <textarea
                  name="testimonial"
                  value={formData.testimonial}
                  onChange={handleInputChange}
                  rows={3}
                  className="w-full px-3 py-2 text-sm bg-white/60 border border-black/[0.08] rounded-xl focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 outline-none transition-all placeholder:text-gray-400"
                  placeholder="Testimoni tentang sekolah..."
                />
              </div>

              {/* Published & Featured */}
              <div className="grid grid-cols-2 gap-3">
                <label className="flex items-start gap-2.5 p-3 rounded-xl border border-black/[0.08] bg-white/60 cursor-pointer hover:bg-green-50/50 hover:border-green-200 transition-colors">
                  <input
                    type="checkbox"
                    name="isPublished"
                    checked={formData.isPublished}
                    onChange={handleInputChange}
                    className="mt-0.5 w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500 flex-shrink-0"
                  />
                  <div>
                    <p className="text-xs font-semibold text-gray-700">Publish</p>
                    <p className="text-[10px] text-gray-400 mt-0.5 leading-relaxed">Alumni tampil di halaman Cerita Alumni &amp; dapat ditemukan publik</p>
                  </div>
                </label>
                <label className="flex items-start gap-2.5 p-3 rounded-xl border border-black/[0.08] bg-white/60 cursor-pointer hover:bg-yellow-50/50 hover:border-yellow-200 transition-colors">
                  <input
                    type="checkbox"
                    name="isFeatured"
                    checked={formData.isFeatured}
                    onChange={handleInputChange}
                    className="mt-0.5 w-4 h-4 text-yellow-500 border-gray-300 rounded focus:ring-yellow-400 flex-shrink-0"
                  />
                  <div>
                    <p className="text-xs font-semibold text-gray-700">⭐ Featured</p>
                    <p className="text-[10px] text-gray-400 mt-0.5 leading-relaxed">Tampil di carousel testimoni homepage (harus Publish dulu)</p>
                  </div>
                </label>
              </div>

              {/* Modal Footer */}
              <div className="flex justify-end gap-2 pt-2 border-t border-black/[0.06]">
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
      {!loading && alumni.length === 0 && (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">👨‍🎓</div>
          <h3 className="text-xl font-semibold text-gray-700 mb-2">
            {(selectedYear || selectedJurusan || searchQuery) ? 'Tidak ada alumni yang sesuai filter' : 'Belum ada alumni'}
          </h3>
          <p className="text-gray-500 mb-4">
            {(selectedYear || selectedJurusan || searchQuery)
              ? 'Coba ubah filter pencarian atau tambahkan alumni baru'
              : 'Tambahkan alumni pertama sekarang!'}
          </p>
          {!(selectedYear || selectedJurusan || searchQuery) && (
            <button
              onClick={openCreateModal}
              className="bg-primary-600 text-white px-6 py-2 rounded-lg hover:bg-primary-700 transition"
            >
              Tambah Alumni
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default Alumni;
