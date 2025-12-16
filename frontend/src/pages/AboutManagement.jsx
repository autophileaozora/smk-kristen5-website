import { useState, useEffect } from 'react';
import api from '../services/api';
import RichTextEditor from '../components/RichTextEditor';

const AboutManagement = () => {
  const [aboutSections, setAboutSections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [currentSection, setCurrentSection] = useState(null);
  const [toast, setToast] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);

  const [formData, setFormData] = useState({
    section: 'sejarah',
    title: '',
    content: '',
    image: '',
    authorName: '',
    authorTitle: '',
    authorPhoto: '',
    isActive: true,
  });

  const sections = [
    { value: 'sejarah', label: 'Sejarah', icon: '📜' },
    { value: 'visi-misi', label: 'Visi & Misi', icon: '🎯' },
    { value: 'sambutan', label: 'Sambutan Kepala Sekolah', icon: '👤' },
  ];

  useEffect(() => {
    fetchAboutSections();
  }, []);

  const fetchAboutSections = async () => {
    try {
      setLoading(true);
      const response = await api.get('/api/about');
      setAboutSections(response.data.data.aboutSections || []);
    } catch (error) {
      showToast('Gagal memuat data', 'error');
      console.error('Error fetching about sections:', error);
    } finally {
      setLoading(false);
    }
  };

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleOpenModal = (section = null) => {
    if (section) {
      setCurrentSection(section);
      setFormData({
        section: section.section,
        title: section.title,
        content: section.content,
        image: section.image || '',
        authorName: section.authorName || '',
        authorTitle: section.authorTitle || '',
        authorPhoto: section.authorPhoto || '',
        isActive: section.isActive,
      });
    } else {
      setCurrentSection(null);
      setFormData({
        section: 'sejarah',
        title: '',
        content: '',
        image: '',
        authorName: '',
        authorTitle: '',
        authorPhoto: '',
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

    try {
      setUploading(true);
      const uploadFormData = new FormData();
      uploadFormData.append('file', file);

      const response = await api.post('/api/upload/image', uploadFormData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      setFormData((prev) => ({
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

  const handlePhotoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      showToast('File harus berupa gambar', 'error');
      return;
    }

    // Validate file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      showToast('Ukuran file maksimal 2MB', 'error');
      return;
    }

    try {
      setUploadingPhoto(true);
      const uploadFormData = new FormData();
      uploadFormData.append('file', file);

      const response = await api.post('/api/upload/image', uploadFormData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      setFormData((prev) => ({
        ...prev,
        authorPhoto: response.data.data.url,
      }));

      showToast('Foto berhasil diupload', 'success');
    } catch (error) {
      showToast('Gagal mengupload foto', 'error');
      console.error('Error uploading photo:', error);
    } finally {
      setUploadingPhoto(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.title || !formData.content) {
      showToast('Harap isi semua field yang wajib', 'error');
      return;
    }

    try {
      await api.post('/api/about', formData);

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

  return (
    <div className="p-6">
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
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Manajemen Tentang</h1>
        <p className="text-gray-600 mt-2">
          Kelola informasi sejarah, visi-misi, dan sambutan kepala sekolah
        </p>
      </div>

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

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-2xl font-bold text-gray-900">
                {currentSection ? 'Edit Section' : 'Buat Section Baru'}
              </h2>
            </div>

            <form onSubmit={handleSubmit} className="p-6">
              {/* Section */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Section *
                </label>
                <select
                  value={formData.section}
                  onChange={(e) =>
                    setFormData({ ...formData, section: e.target.value })
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
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
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
                  value={formData.content}
                  onChange={(value) =>
                    setFormData({ ...formData, content: value })
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
                {formData.image && (
                  <div className="mt-2">
                    <img
                      src={formData.image}
                      alt="Preview"
                      className="h-40 object-cover rounded-lg"
                    />
                  </div>
                )}
              </div>

              {/* Author fields for Sambutan section */}
              {formData.section === 'sambutan' && (
                <>
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Nama Kepala Sekolah
                    </label>
                    <input
                      type="text"
                      value={formData.authorName}
                      onChange={(e) =>
                        setFormData({ ...formData, authorName: e.target.value })
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      placeholder="Contoh: Dr. John Doe, M.Pd"
                      maxLength={100}
                    />
                  </div>

                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Jabatan
                    </label>
                    <input
                      type="text"
                      value={formData.authorTitle}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          authorTitle: e.target.value,
                        })
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      placeholder="Contoh: Kepala Sekolah"
                      maxLength={100}
                    />
                  </div>

                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Foto Kepala Sekolah
                    </label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handlePhotoUpload}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      disabled={uploadingPhoto}
                    />
                    {uploadingPhoto && (
                      <p className="text-sm text-gray-500 mt-2">
                        Mengupload...
                      </p>
                    )}
                    {formData.authorPhoto && (
                      <div className="mt-2">
                        <img
                          src={formData.authorPhoto}
                          alt="Author Preview"
                          className="h-40 w-40 object-cover rounded-lg"
                        />
                      </div>
                    )}
                  </div>
                </>
              )}

              {/* Active Status */}
              <div className="mb-6">
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={formData.isActive}
                    onChange={(e) =>
                      setFormData({ ...formData, isActive: e.target.checked })
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
};

export default AboutManagement;
