import { useState, useEffect } from 'react';
import api from '../services/api';
import RichTextEditor from '../components/RichTextEditor';
import ImageUpload from '../components/ImageUpload';

const AboutManagement = ({ embedded = false }) => {
  const [activeTab, setActiveTab] = useState('about');

  // ========== ABOUT TAB STATE ==========
  const [aboutSections, setAboutSections] = useState([]);
  const [aboutLoading, setAboutLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [currentSection, setCurrentSection] = useState(null);
  const [uploading, setUploading] = useState(false);

  const [aboutFormData, setAboutFormData] = useState({
    section: 'sejarah',
    title: '',
    content: '',
    image: '',
    isActive: true,
  });

  const sections = [
    { value: 'sejarah', label: 'Sejarah', icon: '📜' },
    { value: 'visi-misi', label: 'Visi & Misi', icon: '🎯' },
  ];

  // ========== CONTACT TAB STATE ==========
  const [contactInfo, setContactInfo] = useState(null);
  const [contactLoading, setContactLoading] = useState(true);
  const [contactSaving, setContactSaving] = useState(false);

  const [contactFormData, setContactFormData] = useState({
    address: '',
    phone: '',
    whatsapp: '',
    email: '',
    operatingHours: {
      weekdays: '07:00 - 16:00',
      saturday: '07:00 - 14:00',
      sunday: 'Tutup'
    },
    socialMedia: {
      instagram: '',
      facebook: '',
      youtube: '',
      twitter: ''
    },
    mapUrl: '',
    heroImage: '',
    schoolLogo: '',
    principal: {
      name: '',
      title: 'Kepala Sekolah',
      photo: '',
      message: ''
    }
  });

  // ========== SHARED STATE ==========
  const [toast, setToast] = useState(null);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  // ========== DATA FETCHING ==========
  useEffect(() => {
    fetchAboutSections();
    fetchContactInfo();
  }, []);

  const fetchAboutSections = async () => {
    try {
      setAboutLoading(true);
      const response = await api.get('/api/about');
      setAboutSections(response.data.data.aboutSections || []);
    } catch (error) {
      showToast('Gagal memuat data tentang', 'error');
      console.error('Error fetching about sections:', error);
    } finally {
      setAboutLoading(false);
    }
  };

  const fetchContactInfo = async () => {
    try {
      setContactLoading(true);
      const response = await api.get('/api/contact');
      const data = response.data.data;
      setContactInfo(data);
      setContactFormData({
        address: data.address || '',
        phone: data.phone || '',
        whatsapp: data.whatsapp || '',
        email: data.email || '',
        operatingHours: data.operatingHours || {
          weekdays: '07:00 - 16:00',
          saturday: '07:00 - 14:00',
          sunday: 'Tutup'
        },
        socialMedia: data.socialMedia || {
          instagram: '',
          facebook: '',
          youtube: '',
          twitter: ''
        },
        mapUrl: data.mapUrl || '',
        heroImage: data.heroImage || '',
        schoolLogo: data.schoolLogo || '',
        principal: data.principal || {
          name: '',
          title: 'Kepala Sekolah',
          photo: '',
          message: ''
        }
      });
    } catch (error) {
      showToast(error.response?.data?.message || 'Gagal memuat informasi kontak', 'error');
      console.error('Error fetching contact info:', error);
    } finally {
      setContactLoading(false);
    }
  };

  // ========== ABOUT TAB HANDLERS ==========
  const handleOpenModal = (section = null) => {
    if (section) {
      setCurrentSection(section);
      setAboutFormData({
        section: section.section,
        title: section.title,
        content: section.content,
        image: section.image || '',
        isActive: section.isActive,
      });
    } else {
      setCurrentSection(null);
      setAboutFormData({
        section: 'sejarah',
        title: '',
        content: '',
        image: '',
        isActive: true,
      });
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setCurrentSection(null);
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      showToast('File harus berupa gambar', 'error');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      showToast('Ukuran file maksimal 5MB', 'error');
      return;
    }

    try {
      setUploading(true);
      const uploadFormData = new FormData();
      uploadFormData.append('image', file);

      const response = await api.post('/api/upload/image?folder=smk-kristen5/about', uploadFormData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      setAboutFormData((prev) => ({
        ...prev,
        image: response.data.data.url,
      }));

      showToast('Gambar berhasil diupload', 'success');
    } catch (error) {
      showToast('Gagal mengupload gambar', 'error');
      console.error('Error uploading image:', error);
    } finally {
      setUploading(false);
    }
  };

  const handleAboutSubmit = async (e) => {
    e.preventDefault();

    if (!aboutFormData.title || !aboutFormData.content) {
      showToast('Harap isi semua field yang wajib', 'error');
      return;
    }

    try {
      await api.post('/api/about', aboutFormData);

      showToast(
        `Section ${currentSection ? 'berhasil diupdate' : 'berhasil dibuat'}`,
        'success'
      );

      fetchAboutSections();
      handleCloseModal();
    } catch (error) {
      showToast('Terjadi kesalahan', 'error');
      console.error('Error saving about section:', error);
    }
  };

  const handleDelete = async (section) => {
    if (!confirm(`Apakah Anda yakin ingin menghapus section ${section}?`)) {
      return;
    }

    try {
      await api.delete(`/api/about/${section}`);
      showToast('Section berhasil dihapus', 'success');
      fetchAboutSections();
    } catch (error) {
      showToast('Gagal menghapus section', 'error');
      console.error('Error deleting about section:', error);
    }
  };

  // ========== CONTACT TAB HANDLERS ==========
  const handleContactChange = (e) => {
    const { name, value } = e.target;

    if (name.startsWith('operatingHours.')) {
      const key = name.split('.')[1];
      setContactFormData(prev => ({
        ...prev,
        operatingHours: {
          ...prev.operatingHours,
          [key]: value
        }
      }));
    } else if (name.startsWith('socialMedia.')) {
      const key = name.split('.')[1];
      setContactFormData(prev => ({
        ...prev,
        socialMedia: {
          ...prev.socialMedia,
          [key]: value
        }
      }));
    } else if (name.startsWith('principal.')) {
      const key = name.split('.')[1];
      setContactFormData(prev => ({
        ...prev,
        principal: {
          ...prev.principal,
          [key]: value
        }
      }));
    } else {
      setContactFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleContactSubmit = async (e) => {
    e.preventDefault();

    try {
      setContactSaving(true);
      await api.put('/api/contact', contactFormData);
      showToast('Informasi kontak berhasil diperbarui', 'success');
      fetchContactInfo();
    } catch (error) {
      showToast(error.response?.data?.message || 'Gagal memperbarui informasi kontak', 'error');
    } finally {
      setContactSaving(false);
    }
  };

  // ========== LOADING STATE ==========
  const loading = aboutLoading && contactLoading;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Memuat data...</p>
        </div>
      </div>
    );
  }

  // ========== TAB CONTENT: ABOUT ==========
  const renderAboutTab = () => (
    <div>
      {/* Sections Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        {sections.map((section) => {
          const existingSection = aboutSections.find(
            (s) => s.section === section.value
          );

          return (
            <div
              key={section.value}
              className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <span className="text-4xl">{section.icon}</span>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      {section.label}
                    </h3>
                    <p className="text-sm text-gray-500">
                      {existingSection ? 'Sudah diatur' : 'Belum diatur'}
                    </p>
                  </div>
                </div>
                {existingSection && (
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium ${
                      existingSection.isActive
                        ? 'bg-green-100 text-green-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}
                  >
                    {existingSection.isActive ? 'Aktif' : 'Nonaktif'}
                  </span>
                )}
              </div>

              {existingSection && (
                <div className="mb-4">
                  <h4 className="font-medium text-gray-900 mb-2">
                    {existingSection.title}
                  </h4>
                  <p className="text-sm text-gray-600 line-clamp-3">
                    {existingSection.content}
                  </p>
                </div>
              )}

              <div className="flex space-x-2">
                <button
                  onClick={() => handleOpenModal(existingSection)}
                  className="flex-1 bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors"
                >
                  {existingSection ? 'Edit' : 'Buat'}
                </button>
                {existingSection && (
                  <button
                    onClick={() => handleDelete(existingSection.section)}
                    className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                  >
                    Hapus
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Sambutan Kepala Sekolah from Contact */}
      {contactInfo?.principal && (
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <span className="text-4xl">👤</span>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  Sambutan Kepala Sekolah
                </h3>
                <p className="text-sm text-gray-500">
                  Data diambil dari tab Kontak
                </p>
              </div>
            </div>
            <button
              onClick={() => setActiveTab('contact')}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
            >
              Edit di Tab Kontak
            </button>
          </div>

          <div className="flex items-start space-x-4">
            {contactInfo.principal.photo && (
              <img
                src={contactInfo.principal.photo}
                alt={contactInfo.principal.name}
                className="w-24 h-24 rounded-lg object-cover"
              />
            )}
            <div className="flex-1">
              <h4 className="font-medium text-gray-900 mb-1">
                {contactInfo.principal.name}
              </h4>
              <p className="text-sm text-gray-500 mb-2">
                {contactInfo.principal.title}
              </p>
              <p className="text-sm text-gray-600 line-clamp-3">
                {contactInfo.principal.message}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-2xl font-bold text-gray-900">
                {currentSection ? 'Edit Section' : 'Buat Section Baru'}
              </h2>
            </div>

            <form onSubmit={handleAboutSubmit} className="p-6">
              {/* Section */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Section *
                </label>
                <select
                  value={aboutFormData.section}
                  onChange={(e) =>
                    setAboutFormData({ ...aboutFormData, section: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  disabled={currentSection !== null}
                >
                  {sections.map((section) => (
                    <option key={section.value} value={section.value}>
                      {section.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Title */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Judul *
                </label>
                <input
                  type="text"
                  value={aboutFormData.title}
                  onChange={(e) =>
                    setAboutFormData({ ...aboutFormData, title: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="Masukkan judul"
                  maxLength={200}
                />
              </div>

              {/* Content */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Konten *
                </label>
                <RichTextEditor
                  value={aboutFormData.content}
                  onChange={(value) =>
                    setAboutFormData({ ...aboutFormData, content: value })
                  }
                  placeholder="Masukkan konten"
                />
              </div>

              {/* Image Upload */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Gambar
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  disabled={uploading}
                />
                {uploading && (
                  <p className="text-sm text-gray-500 mt-2">Mengupload...</p>
                )}
                {aboutFormData.image && (
                  <div className="mt-2">
                    <img
                      src={aboutFormData.image}
                      alt="Preview"
                      className="h-40 object-cover rounded-lg"
                    />
                  </div>
                )}
              </div>

              {/* Active Status */}
              <div className="mb-6">
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={aboutFormData.isActive}
                    onChange={(e) =>
                      setAboutFormData({ ...aboutFormData, isActive: e.target.checked })
                    }
                    className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                  />
                  <span className="text-sm font-medium text-gray-700">
                    Aktif
                  </span>
                </label>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                >
                  Simpan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );

  // ========== TAB CONTENT: CONTACT ==========
  const renderContactTab = () => {
    if (contactLoading) {
      return (
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Memuat data kontak...</p>
          </div>
        </div>
      );
    }

    return (
      <div className="max-w-5xl">
        {/* Form */}
        <form onSubmit={handleContactSubmit} className="space-y-6">
          {/* Basic Information */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Informasi Dasar</h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Alamat Lengkap
                </label>
                <textarea
                  name="address"
                  value={contactFormData.address}
                  onChange={handleContactChange}
                  rows="3"
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Masukkan alamat lengkap sekolah"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nomor Telepon
                  </label>
                  <input
                    type="text"
                    name="phone"
                    value={contactFormData.phone}
                    onChange={handleContactChange}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="(0272) 325260"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    WhatsApp
                  </label>
                  <input
                    type="text"
                    name="whatsapp"
                    value={contactFormData.whatsapp}
                    onChange={handleContactChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="08881082xx"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  name="email"
                  value={contactFormData.email}
                  onChange={handleContactChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="smkrisma@sch.id"
                />
              </div>
            </div>
          </div>

          {/* Operating Hours */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Jam Operasional</h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Senin - Jumat
                </label>
                <input
                  type="text"
                  name="operatingHours.weekdays"
                  value={contactFormData.operatingHours.weekdays}
                  onChange={handleContactChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="07:00 - 16:00"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Sabtu
                  </label>
                  <input
                    type="text"
                    name="operatingHours.saturday"
                    value={contactFormData.operatingHours.saturday}
                    onChange={handleContactChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="07:00 - 14:00"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Minggu
                  </label>
                  <input
                    type="text"
                    name="operatingHours.sunday"
                    value={contactFormData.operatingHours.sunday}
                    onChange={handleContactChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Tutup"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Social Media */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Sosial Media</h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Instagram URL
                </label>
                <input
                  type="url"
                  name="socialMedia.instagram"
                  value={contactFormData.socialMedia.instagram}
                  onChange={handleContactChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="https://www.instagram.com/smkkrisma"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Facebook URL
                </label>
                <input
                  type="url"
                  name="socialMedia.facebook"
                  value={contactFormData.socialMedia.facebook}
                  onChange={handleContactChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="https://www.facebook.com/smkkrisma"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  YouTube URL
                </label>
                <input
                  type="url"
                  name="socialMedia.youtube"
                  value={contactFormData.socialMedia.youtube}
                  onChange={handleContactChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="https://www.youtube.com/@smkkrisma"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Twitter/X URL
                </label>
                <input
                  type="url"
                  name="socialMedia.twitter"
                  value={contactFormData.socialMedia.twitter}
                  onChange={handleContactChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="https://www.twitter.com/smkkrisma"
                />
              </div>
            </div>
          </div>

          {/* Map and Hero Image */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Peta & Gambar</h2>

            <div className="space-y-4">
              <ImageUpload
                label="Logo Sekolah"
                value={contactFormData.schoolLogo}
                onChange={(url) => setContactFormData(prev => ({ ...prev, schoolLogo: url }))}
                folder="smk-kristen5/logo"
                previewClassName="h-24 w-auto"
              />

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Google Maps Embed URL
                </label>
                <textarea
                  name="mapUrl"
                  value={contactFormData.mapUrl}
                  onChange={handleContactChange}
                  rows="3"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm"
                  placeholder="https://www.google.com/maps/embed?pb=..."
                />
                <p className="mt-1 text-sm text-gray-500">
                  Dapatkan URL embed dari Google Maps &rarr; Share &rarr; Embed a map
                </p>
              </div>

              <ImageUpload
                label="Hero Image"
                value={contactFormData.heroImage}
                onChange={(url) => setContactFormData(prev => ({ ...prev, heroImage: url }))}
                folder="smk-kristen5/hero"
                previewClassName="h-40 w-auto"
              />
            </div>
          </div>

          {/* Principal Information */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Informasi Kepala Sekolah</h2>
            <p className="text-sm text-gray-600 mb-4">
              Informasi ini akan ditampilkan di card &quot;Sambutan Kepala Sekolah&quot; pada halaman beranda
            </p>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nama Kepala Sekolah
                </label>
                <input
                  type="text"
                  name="principal.name"
                  value={contactFormData.principal.name}
                  onChange={handleContactChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Contoh: Drs. Suparno, M.Pd"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Jabatan
                </label>
                <input
                  type="text"
                  name="principal.title"
                  value={contactFormData.principal.title}
                  onChange={handleContactChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Kepala Sekolah"
                />
              </div>

              <ImageUpload
                label="Foto Kepala Sekolah"
                value={contactFormData.principal.photo}
                onChange={(url) => setContactFormData(prev => ({
                  ...prev,
                  principal: { ...prev.principal, photo: url }
                }))}
                folder="smk-kristen5/principal"
                previewClassName="h-32 w-32 rounded-lg object-cover"
              />

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Pesan Sambutan (Ringkas)
                </label>
                <textarea
                  name="principal.message"
                  value={contactFormData.principal.message}
                  onChange={handleContactChange}
                  rows="4"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Tulis pesan sambutan singkat yang akan ditampilkan di card homepage (maksimal 100 karakter akan ditampilkan)"
                />
                <p className="mt-1 text-sm text-gray-500">
                  Pesan ini akan ditampilkan sebagai preview di card homepage. Untuk sambutan lengkap, gunakan halaman &quot;About Management &rarr; Sambutan&quot;
                </p>
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={contactSaving}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {contactSaving ? (
                <>
                  <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span>Menyimpan...</span>
                </>
              ) : (
                <>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Simpan Perubahan</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    );
  };

  // ========== MAIN RENDER ==========
  const tabs = [
    { id: 'about', label: 'Tentang', icon: '📖' },
    { id: 'contact', label: 'Kontak', icon: '📞' },
  ];

  return (
    <div className={embedded ? '' : 'p-6'}>
      {/* Toast Notification */}
      {toast && (
        <div
          className={`fixed top-4 right-4 z-50 px-6 py-3 rounded-lg shadow-lg ${
            toast.type === 'success'
              ? 'bg-green-500 text-white'
              : 'bg-red-500 text-white'
          }`}
        >
          {toast.message}
        </div>
      )}

      {/* Header */}
      {!embedded && (
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Informasi Sekolah</h1>
        <p className="text-gray-600 mt-2">
          Kelola informasi tentang sekolah dan kontak
        </p>
      </div>
      )}

      {/* Tab Navigation */}
      <div className="mb-6 border-b border-gray-200">
        <nav className="flex space-x-8" aria-label="Tabs">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`
                flex items-center space-x-2 py-3 px-1 border-b-2 font-medium text-sm transition-colors
                ${
                  activeTab === tab.id
                    ? 'border-primary-600 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }
              `}
            >
              <span>{tab.icon}</span>
              <span>{tab.label}</span>
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === 'about' && renderAboutTab()}
      {activeTab === 'contact' && renderContactTab()}
    </div>
  );
};

export default AboutManagement;
