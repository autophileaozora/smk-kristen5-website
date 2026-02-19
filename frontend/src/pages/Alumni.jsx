import { useState, useEffect } from 'react';
import api from '../services/api';
import ImageUpload from '../components/ImageUpload';

const Alumni = ({ embedded = false }) => {
  const [alumni, setAlumni] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState('create'); // 'create' or 'edit'
  const [currentAlumni, setCurrentAlumni] = useState(null);
  const [toast, setToast] = useState({ show: false, message: '', type: '' });

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
      ) : (
      <div className="flex justify-end mb-4">
        <button
          onClick={openCreateModal}
          className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition flex items-center gap-2 text-sm"
        >
          <span>➕</span>
          Tambah Alumni
        </button>
      </div>
      )}

      {/* Search and Filters */}
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

      {/* Loading State */}
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        </div>
      ) : (
        /* Alumni Grid */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
                {/* Badges */}
                <div className="flex gap-2 mb-3 flex-wrap">
                  <span className="inline-block px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                    {alumniData.graduationYear}
                  </span>
                  <span className="inline-block px-2 py-1 text-xs font-semibold rounded-full bg-purple-100 text-purple-800">
                    {alumniData.jurusan}
                  </span>
                  {alumniData.isFeatured && (
                    <span className="inline-block px-2 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800">
                      ⭐ Featured
                    </span>
                  )}
                </div>

                {/* Name */}
                <h3 className="font-bold text-lg text-gray-800 mb-2">{alumniData.name}</h3>

                {/* Info */}
                <div className="space-y-2 text-sm text-gray-600 mb-4">
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

                {/* Status Toggles */}
                <div className="flex gap-2 mb-4">
                  <button
                    onClick={() => handleTogglePublished(alumniData._id)}
                    className={`flex-1 px-2 py-1 text-xs font-semibold rounded-full cursor-pointer ${
                      alumniData.isPublished
                        ? 'bg-green-100 text-green-800 hover:bg-green-200'
                        : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                    }`}
                  >
                    {alumniData.isPublished ? '✓ Published' : '✗ Draft'}
                  </button>
                  <button
                    onClick={() => handleToggleFeatured(alumniData._id)}
                    className={`flex-1 px-2 py-1 text-xs font-semibold rounded-full cursor-pointer ${
                      alumniData.isFeatured
                        ? 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200'
                        : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                    }`}
                  >
                    {alumniData.isFeatured ? '⭐ Featured' : '☆ Feature'}
                  </button>
                </div>

                {/* Actions */}
                <div className="flex gap-2 pt-4 border-t">
                  <button
                    onClick={() => openEditModal(alumniData)}
                    className="flex-1 bg-blue-50 text-blue-600 px-3 py-2 rounded-lg hover:bg-blue-100 transition text-sm font-medium"
                  >
                    ✏️ Edit
                  </button>
                  <button
                    onClick={() => handleDelete(alumniData._id, alumniData.name)}
                    className="flex-1 bg-red-50 text-red-600 px-3 py-2 rounded-lg hover:bg-red-100 transition text-sm font-medium"
                  >
                    🗑️ Hapus
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex justify-between items-center p-6 border-b">
              <h2 className="text-xl font-bold text-gray-800">
                {modalMode === 'create' ? 'Tambah Alumni' : 'Edit Alumni'}
              </h2>
              <button
                onClick={closeModal}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
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
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nama Lengkap *
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="Nama lengkap alumni"
                />
              </div>

              {/* Graduation Year & Jurusan */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
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
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Jurusan *
                  </label>
                  <select
                    name="jurusan"
                    value={formData.jurusan}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                  >
                    <option value="">Pilih Jurusan</option>
                    {jurusans.map((jurusan) => (
                      <option key={jurusan._id} value={jurusan.code}>
                        {jurusan.code} - {jurusan.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Current Occupation */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Pekerjaan Saat Ini
                </label>
                <input
                  type="text"
                  name="currentOccupation"
                  value={formData.currentOccupation}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                  placeholder="Contoh: Software Engineer"
                />
              </div>

              {/* Company & University */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Perusahaan
                  </label>
                  <input
                    type="text"
                    name="company"
                    value={formData.company}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                    placeholder="Nama perusahaan"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Universitas
                  </label>
                  <input
                    type="text"
                    name="university"
                    value={formData.university}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                    placeholder="Jika melanjutkan kuliah"
                  />
                </div>
              </div>

              {/* LinkedIn */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  LinkedIn URL
                </label>
                <input
                  type="url"
                  name="linkedIn"
                  value={formData.linkedIn}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                  placeholder="https://linkedin.com/in/..."
                />
              </div>

              {/* Achievement */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Prestasi
                </label>
                <textarea
                  name="achievement"
                  value={formData.achievement}
                  onChange={handleInputChange}
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                  placeholder="Prestasi yang pernah diraih..."
                />
              </div>

              {/* Testimonial */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Testimonial
                </label>
                <textarea
                  name="testimonial"
                  value={formData.testimonial}
                  onChange={handleInputChange}
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                  placeholder="Testimoni tentang sekolah..."
                />
              </div>

              {/* Published & Featured */}
              <div className="flex gap-4">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    name="isPublished"
                    checked={formData.isPublished}
                    onChange={handleInputChange}
                    className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                  />
                  <label className="ml-2 text-sm text-gray-700">
                    Publish (tampilkan di website)
                  </label>
                </div>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    name="isFeatured"
                    checked={formData.isFeatured}
                    onChange={handleInputChange}
                    className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                  />
                  <label className="ml-2 text-sm text-gray-700">
                    Featured (tampilkan di homepage)
                  </label>
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={closeModal}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition"
                >
                  {modalMode === 'create' ? 'Tambah' : 'Update'}
                </button>
              </div>
            </form>
          </div>
        </div>
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
