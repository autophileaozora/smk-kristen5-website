import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import ImageUpload from '../components/ImageUpload';
import RichTextEditor from '../components/RichTextEditor';

const Jurusan = () => {
  const [jurusans, setJurusans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState('create');
  const [currentJurusan, setCurrentJurusan] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [jurusanToDelete, setJurusanToDelete] = useState(null);
  const [toast, setToast] = useState(null);

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    description: '',
    shortDescription: '',
    vision: '',
    mission: '',
    headOfDepartment: '',
    logo: '',
    backgroundImage: '',
    subjects: [],
    facilities: [],
    careerProspects: [],
    competencies: [],
    gallery: [],
    isActive: true,
  });

  // Preview images for gallery only
  const [galleryFiles, setGalleryFiles] = useState([]);

  useEffect(() => {
    fetchJurusans();
  }, []);

  const fetchJurusans = async () => {
    try {
      setLoading(true);
      const response = await api.get('/api/jurusan');
      setJurusans(response.data.data.jurusans);
    } catch (error) {
      showToast(error.response?.data?.message || 'Gagal memuat jurusan', 'error');
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
      code: '',
      description: '',
      shortDescription: '',
      vision: '',
      mission: '',
      headOfDepartment: '',
      logo: '',
      backgroundImage: '',
      subjects: [],
      facilities: [],
      careerProspects: [],
      competencies: [],
      gallery: [],
      isActive: true,
    });
    setGalleryFiles([]);
    setShowModal(true);
  };

  const openEditModal = (jurusan) => {
    setModalMode('edit');
    setCurrentJurusan(jurusan);
    setFormData({
      name: jurusan.name,
      code: jurusan.code,
      description: jurusan.description,
      shortDescription: jurusan.shortDescription || '',
      vision: jurusan.vision || '',
      mission: jurusan.mission || '',
      headOfDepartment: jurusan.headOfDepartment || '',
      logo: jurusan.logo || '',
      backgroundImage: jurusan.backgroundImage || '',
      subjects: jurusan.subjects || [],
      facilities: jurusan.facilities || [],
      careerProspects: jurusan.careerProspects || [],
      competencies: jurusan.competencies || [],
      gallery: jurusan.gallery || [],
      isActive: jurusan.isActive,
    });
    setGalleryFiles([]);
    setShowModal(true);
  };

  const openDeleteModal = (jurusan) => {
    setJurusanToDelete(jurusan);
    setShowDeleteModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setCurrentJurusan(null);
  };

  const closeDeleteModal = () => {
    setShowDeleteModal(false);
    setJurusanToDelete(null);
  };


  const handleGalleryChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length > 0) {
      // Validate file sizes
      const invalidFiles = files.filter(file => file.size > 5 * 1024 * 1024);
      if (invalidFiles.length > 0) {
        showToast('Ukuran maksimal tiap foto adalah 5MB', 'error');
        return;
      }
      setGalleryFiles(files);
    }
  };

  const removeGalleryItem = (index) => {
    const newGallery = formData.gallery.filter((_, i) => i !== index);
    setFormData({ ...formData, gallery: newGallery });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      // If there are gallery files to upload, use FormData, otherwise use JSON
      if (galleryFiles.length > 0) {
        const submitData = new FormData();
        submitData.append('name', formData.name);
        submitData.append('code', formData.code);
        submitData.append('description', formData.description);
        submitData.append('shortDescription', formData.shortDescription);
        submitData.append('vision', formData.vision);
        submitData.append('mission', formData.mission);
        submitData.append('headOfDepartment', formData.headOfDepartment);
        submitData.append('isActive', formData.isActive);
        submitData.append('logo', formData.logo);
        submitData.append('backgroundImage', formData.backgroundImage);

        // Send arrays as JSON strings
        submitData.append('subjects', JSON.stringify(formData.subjects));
        submitData.append('facilities', JSON.stringify(formData.facilities));
        submitData.append('careerProspects', JSON.stringify(formData.careerProspects));
        submitData.append('competencies', JSON.stringify(formData.competencies));
        submitData.append('gallery', JSON.stringify(formData.gallery));

        // Append gallery files
        galleryFiles.forEach((file) => {
          submitData.append('galleryImages', file);
        });

        if (modalMode === 'create') {
          await api.post('/api/jurusan', submitData, {
            headers: { 'Content-Type': 'multipart/form-data' },
          });
          showToast('Jurusan berhasil dibuat!', 'success');
        } else {
          await api.put(`/api/jurusan/${currentJurusan._id}`, submitData, {
            headers: { 'Content-Type': 'multipart/form-data' },
          });
          showToast('Jurusan berhasil diupdate!', 'success');
        }
      } else {
        // No gallery files, send as JSON
        if (modalMode === 'create') {
          await api.post('/api/jurusan', formData);
          showToast('Jurusan berhasil dibuat!', 'success');
        } else {
          await api.put(`/api/jurusan/${currentJurusan._id}`, formData);
          showToast('Jurusan berhasil diupdate!', 'success');
        }
      }

      fetchJurusans();
      closeModal();
    } catch (error) {
      showToast(error.response?.data?.message || 'Gagal menyimpan jurusan', 'error');
    }
  };

  const handleDelete = async () => {
    try {
      await api.delete(`/api/jurusan/${jurusanToDelete._id}`);
      showToast('Jurusan berhasil dihapus!', 'success');
      fetchJurusans();
      closeDeleteModal();
    } catch (error) {
      showToast(error.response?.data?.message || 'Gagal menghapus jurusan', 'error');
    }
  };

  const toggleActive = async (id, currentStatus) => {
    try {
      await api.put(`/api/jurusan/${id}`, { isActive: !currentStatus });
      showToast('Status berhasil diubah!', 'success');
      fetchJurusans();
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
          <h1 className="text-2xl font-bold text-gray-900">Program Keahlian</h1>
          <p className="text-gray-600 mt-1">Kelola jurusan dan program keahlian sekolah</p>
        </div>
        <button
          onClick={openCreateModal}
          className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
        >
          <span className="text-xl">🎓</span>
          <span>Tambah Jurusan</span>
        </button>
      </div>

      {/* Jurusan Grid */}
      <div className="bg-white rounded-lg shadow">
        {loading ? (
          <div className="p-8 text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
            <p className="mt-2 text-gray-600">Memuat jurusan...</p>
          </div>
        ) : jurusans.length === 0 ? (
          <div className="p-8 text-center">
            <p className="text-gray-500">Belum ada jurusan</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6">
            {jurusans.map((jurusan) => (
              <div key={jurusan._id} className="border rounded-lg overflow-hidden hover:shadow-lg transition-shadow">
                {/* Header with Logo */}
                <div className="bg-gradient-to-r from-primary-600 to-primary-700 p-6 text-white">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        {jurusan.logo && (
                          <img
                            src={jurusan.logo}
                            alt={jurusan.name}
                            className="w-16 h-16 object-contain bg-white rounded-lg p-2"
                          />
                        )}
                        <div>
                          <h3 className="text-xl font-bold">{jurusan.name}</h3>
                          <p className="text-primary-100 text-sm">{jurusan.code}</p>
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => toggleActive(jurusan._id, jurusan.isActive)}
                      className={`px-3 py-1 text-xs font-semibold rounded-full cursor-pointer transition-colors ${
                        jurusan.isActive
                          ? 'bg-green-500 text-white hover:bg-green-600'
                          : 'bg-red-500 text-white hover:bg-red-600'
                      }`}
                    >
                      {jurusan.isActive ? '✅ Aktif' : '❌ Nonaktif'}
                    </button>
                  </div>
                </div>

                {/* Content */}
                <div className="p-6">
                  {/* Images Preview */}
                  {(jurusan.logo || jurusan.backgroundImage) && (
                    <div className="mb-4 flex gap-3">
                      {jurusan.logo && (
                        <div>
                          <p className="text-xs text-gray-500 mb-1">Logo</p>
                          <img
                            src={jurusan.logo}
                            alt="Logo"
                            className="w-16 h-16 object-contain border rounded"
                          />
                        </div>
                      )}
                      {jurusan.backgroundImage && (
                        <div>
                          <p className="text-xs text-gray-500 mb-1">Background Card</p>
                          <img
                            src={jurusan.backgroundImage}
                            alt="Background"
                            className="w-16 h-16 object-cover border rounded"
                          />
                        </div>
                      )}
                    </div>
                  )}

                  {/* Description */}
                  <div className="mb-4">
                    <h4 className="text-sm font-semibold text-gray-700 mb-1">Deskripsi</h4>
                    <div
                      className="text-sm text-gray-600 line-clamp-3 prose prose-sm max-w-none"
                      dangerouslySetInnerHTML={{ __html: jurusan.description }}
                    />
                  </div>

                  {/* Vision */}
                  {jurusan.vision && (
                    <div className="mb-4">
                      <h4 className="text-sm font-semibold text-gray-700 mb-1">Visi</h4>
                      <p className="text-sm text-gray-600 line-clamp-2">{jurusan.vision}</p>
                    </div>
                  )}

                  {/* Mission */}
                  {jurusan.mission && (
                    <div className="mb-4">
                      <h4 className="text-sm font-semibold text-gray-700 mb-1">Misi</h4>
                      <p className="text-sm text-gray-600 line-clamp-3">{jurusan.mission}</p>
                    </div>
                  )}

                  {/* Head of Department */}
                  {jurusan.headOfDepartment && (
                    <div className="mb-4 flex items-center gap-2 text-sm text-gray-600">
                      <span>👤 Kepala Jurusan:</span>
                      <span className="font-medium">{jurusan.headOfDepartment}</span>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex gap-2 pt-4 border-t">
                    <button
                      onClick={() => openEditModal(jurusan)}
                      className="flex-1 px-3 py-2 text-sm bg-blue-50 text-blue-600 rounded hover:bg-blue-100 transition-colors"
                    >
                      ✏️ Edit
                    </button>
                    <Link
                      to={`/admin/jurusan/${jurusan._id}/edit-layout`}
                      className="flex-1 px-3 py-2 text-sm bg-purple-50 text-purple-600 rounded hover:bg-purple-100 transition-colors text-center"
                    >
                      🧩 Layout
                    </Link>
                    <button
                      onClick={() => openDeleteModal(jurusan)}
                      className="flex-1 px-3 py-2 text-sm bg-red-50 text-red-600 rounded hover:bg-red-100 transition-colors"
                    >
                      🗑️ Hapus
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Create/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
            {/* Background overlay */}
            <div
              className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75"
              onClick={closeModal}
            ></div>

            {/* Modal panel */}
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-3xl sm:w-full">
              <form onSubmit={handleSubmit}>
                {/* Header */}
                <div className="bg-white px-6 py-4 border-b">
                  <h3 className="text-lg font-semibold text-gray-900">
                    {modalMode === 'create' ? '🎓 Tambah Jurusan' : '✏️ Edit Jurusan'}
                  </h3>
                </div>

                {/* Body */}
                <div className="bg-white px-6 py-4 space-y-4 max-h-[70vh] overflow-y-auto">
                  {/* Logo Upload */}
                  <ImageUpload
                    label="Logo Jurusan"
                    value={formData.logo}
                    onChange={(url) => setFormData(prev => ({ ...prev, logo: url }))}
                    folder="smk-kristen5/jurusan/logo"
                    previewClassName="h-32 w-32 object-contain"
                  />

                  {/* Background Image Upload */}
                  <ImageUpload
                    label="Background Card Homepage (600x600px)"
                    value={formData.backgroundImage}
                    onChange={(url) => setFormData(prev => ({ ...prev, backgroundImage: url }))}
                    folder="smk-kristen5/jurusan/background"
                    previewClassName="h-32 w-32 object-cover"
                  />

                  <div className="grid grid-cols-2 gap-4">
                    {/* Name */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Nama Jurusan *
                      </label>
                      <input
                        type="text"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        placeholder="Teknik Komputer Jaringan"
                        required
                      />
                    </div>

                    {/* Code */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Kode Jurusan *
                      </label>
                      <input
                        type="text"
                        value={formData.code}
                        onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        placeholder="TKJ"
                        required
                      />
                    </div>
                  </div>

                  {/* Description */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Deskripsi *
                    </label>
                    <RichTextEditor
                      value={formData.description}
                      onChange={(value) => setFormData({ ...formData, description: value })}
                      placeholder="Deskripsi lengkap tentang jurusan..."
                    />
                  </div>

                  {/* Short Description */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Deskripsi Singkat (untuk tampilan accordion homepage)
                    </label>
                    <textarea
                      value={formData.shortDescription}
                      onChange={(e) => setFormData({ ...formData, shortDescription: e.target.value })}
                      rows={3}
                      maxLength={300}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      placeholder="Deskripsi singkat untuk ditampilkan di accordion homepage (maksimal 300 karakter)..."
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      {formData.shortDescription.length}/300 karakter
                    </p>
                  </div>

                  {/* Vision */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Visi
                    </label>
                    <textarea
                      value={formData.vision}
                      onChange={(e) => setFormData({ ...formData, vision: e.target.value })}
                      rows={2}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      placeholder="Visi jurusan..."
                    />
                  </div>

                  {/* Mission */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Misi
                    </label>
                    <textarea
                      value={formData.mission}
                      onChange={(e) => setFormData({ ...formData, mission: e.target.value })}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      placeholder="Misi jurusan..."
                    />
                  </div>

                  {/* Head of Department */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Kepala Jurusan
                    </label>
                    <input
                      type="text"
                      value={formData.headOfDepartment}
                      onChange={(e) => setFormData({ ...formData, headOfDepartment: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      placeholder="Nama kepala jurusan"
                    />
                  </div>

                  {/* Competencies */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Kompetensi
                    </label>
                    <div className="space-y-2">
                      {formData.competencies.map((competency, index) => (
                        <div key={index} className="flex gap-2">
                          <input
                            type="text"
                            value={competency}
                            onChange={(e) => {
                              const newCompetencies = [...formData.competencies];
                              newCompetencies[index] = e.target.value;
                              setFormData({ ...formData, competencies: newCompetencies });
                            }}
                            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                            placeholder="Contoh: Pemrograman Web"
                          />
                          <button
                            type="button"
                            onClick={() => {
                              const newCompetencies = formData.competencies.filter((_, i) => i !== index);
                              setFormData({ ...formData, competencies: newCompetencies });
                            }}
                            className="px-3 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors"
                          >
                            🗑️
                          </button>
                        </div>
                      ))}
                      <button
                        type="button"
                        onClick={() => {
                          setFormData({ ...formData, competencies: [...formData.competencies, ''] });
                        }}
                        className="w-full px-3 py-2 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-primary-500 hover:text-primary-600 transition-colors"
                      >
                        + Tambah Kompetensi
                      </button>
                    </div>
                  </div>

                  {/* Career Prospects */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Prospek Karir
                    </label>
                    <div className="space-y-2">
                      {formData.careerProspects.map((career, index) => (
                        <div key={index} className="flex gap-2">
                          <input
                            type="text"
                            value={career}
                            onChange={(e) => {
                              const newCareers = [...formData.careerProspects];
                              newCareers[index] = e.target.value;
                              setFormData({ ...formData, careerProspects: newCareers });
                            }}
                            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                            placeholder="Contoh: Web Developer"
                          />
                          <button
                            type="button"
                            onClick={() => {
                              const newCareers = formData.careerProspects.filter((_, i) => i !== index);
                              setFormData({ ...formData, careerProspects: newCareers });
                            }}
                            className="px-3 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors"
                          >
                            🗑️
                          </button>
                        </div>
                      ))}
                      <button
                        type="button"
                        onClick={() => {
                          setFormData({ ...formData, careerProspects: [...formData.careerProspects, ''] });
                        }}
                        className="w-full px-3 py-2 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-primary-500 hover:text-primary-600 transition-colors"
                      >
                        + Tambah Prospek Karir
                      </button>
                    </div>
                  </div>

                  {/* Gallery */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Galeri Foto Jurusan
                    </label>

                    {/* Existing Gallery */}
                    {formData.gallery.length > 0 && (
                      <div className="grid grid-cols-3 gap-3 mb-3">
                        {formData.gallery.map((item, index) => (
                          <div key={index} className="relative group">
                            <img
                              src={item.url}
                              alt={item.caption || `Gallery ${index + 1}`}
                              className="w-full h-24 object-cover rounded-lg border"
                            />
                            <button
                              type="button"
                              onClick={() => removeGalleryItem(index)}
                              className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              ×
                            </button>
                            {item.caption && (
                              <p className="text-xs text-gray-600 mt-1 truncate">{item.caption}</p>
                            )}
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Upload New Gallery */}
                    <div>
                      <input
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={handleGalleryChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      />
                      <p className="mt-1 text-xs text-gray-500">
                        Upload multiple foto (maksimal 5MB per foto). Foto akan ditambahkan ke galeri.
                      </p>
                    </div>

                    {/* Gallery Preview */}
                    {galleryFiles.length > 0 && (
                      <div className="mt-3">
                        <p className="text-sm text-gray-700 mb-2">Foto yang akan diupload: {galleryFiles.length} foto</p>
                        <div className="grid grid-cols-4 gap-2">
                          {galleryFiles.map((file, index) => (
                            <img
                              key={index}
                              src={URL.createObjectURL(file)}
                              alt={`Preview ${index + 1}`}
                              className="w-full h-20 object-cover rounded border"
                            />
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Active Status */}
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="isActive"
                      checked={formData.isActive}
                      onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                      className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                    />
                    <label htmlFor="isActive" className="ml-2 text-sm text-gray-700">
                      Aktifkan jurusan ini
                    </label>
                  </div>
                </div>

                {/* Footer */}
                <div className="bg-gray-50 px-6 py-4 flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={closeModal}
                    className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                  >
                    {modalMode === 'create' ? '🎓 Tambah' : '💾 Simpan'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && jurusanToDelete && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
            <div
              className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75"
              onClick={closeDeleteModal}
            ></div>

            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="bg-white px-6 py-4">
                <div className="flex items-center mb-4">
                  <span className="text-4xl mr-3">⚠️</span>
                  <h3 className="text-lg font-semibold text-gray-900">
                    Hapus Jurusan?
                  </h3>
                </div>
                <p className="text-gray-600 mb-4">
                  Apakah Anda yakin ingin menghapus jurusan <strong>{jurusanToDelete.name} ({jurusanToDelete.code})</strong>?
                </p>
                <p className="text-sm text-red-600">
                  ⚠️ Data yang terkait dengan jurusan ini mungkin terpengaruh!
                </p>
              </div>

              <div className="bg-gray-50 px-6 py-4 flex justify-end gap-3">
                <button
                  onClick={closeDeleteModal}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Batal
                </button>
                <button
                  onClick={handleDelete}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  🗑️ Hapus
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Jurusan;
