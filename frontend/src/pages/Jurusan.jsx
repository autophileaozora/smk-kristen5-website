import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import api from '../services/api';
import ImageUpload from '../components/ImageUpload';
import RichTextEditor from '../components/RichTextEditor';
import { GraduationCap, MoreVertical, Edit3, Trash2, ToggleLeft, ToggleRight, X, ChevronDown } from 'lucide-react';

const ActiveBadge = ({ active }) => (
  <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium ${
    active
      ? 'bg-emerald-400/12 text-emerald-700 border border-emerald-400/22'
      : 'bg-gray-400/12 text-gray-500 border border-gray-400/18'
  }`}>
    {active ? 'Aktif' : 'Nonaktif'}
  </span>
);

const Jurusan = ({ embedded = false, createTrigger = 0, externalSearch = '' }) => {
  const [jurusans, setJurusans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState('create');
  const [currentJurusan, setCurrentJurusan] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [jurusanToDelete, setJurusanToDelete] = useState(null);
  const [toast, setToast] = useState(null);
  const [cardMenu, setCardMenu] = useState(null); // { item, top, right }

  const openMenuFor = (e, item) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setCardMenu(prev => prev?.item._id === item._id ? null : { item, top: rect.bottom + 4, right: window.innerWidth - rect.right });
  };

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

  const [lightboxImg, setLightboxImg] = useState(null);

  useEffect(() => {
    fetchJurusans();
  }, []);

  // Open create modal when pill "+" is clicked from parent
  useEffect(() => {
    if (createTrigger > 0) openCreateModal();
  }, [createTrigger]);

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
      detailLinkText: '',
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
      detailLinkText: jurusan.detailLinkText || '',
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
        submitData.append('detailLinkText', formData.detailLinkText);
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
    <div className={embedded ? '' : 'p-6'}>
      {/* Toast Notification */}
      {toast && (
        <div className={`fixed top-4 right-4 z-50 px-6 py-3 rounded-lg shadow-lg ${
          toast.type === 'success' ? 'bg-green-500' : 'bg-red-500'
        } text-white`}>
          {toast.message}
        </div>
      )}

      {/* Header — standalone only */}
      {!embedded && (
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
      )}

      {/* Jurusan Grid */}
      <div className={embedded ? '' : 'bg-white rounded-lg shadow'}>
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
          <div className={`grid grid-cols-1 md:grid-cols-2 gap-3 ${embedded ? 'p-4' : 'p-6'}`}>
            {jurusans.filter(j => !externalSearch || j.name.toLowerCase().includes(externalSearch.toLowerCase()) || j.code?.toLowerCase().includes(externalSearch.toLowerCase())).map((jurusan) => (
              <div
                key={jurusan._id}
                className="group relative bg-white/70 backdrop-blur-sm rounded-xl border border-white/70 hover:border-white/95 hover:shadow-[0_4px_20px_rgba(0,0,0,0.09),inset_0_1px_0_rgba(255,255,255,0.95)] p-4 transition-all duration-200 shadow-[0_1px_8px_rgba(0,0,0,0.06),inset_0_1px_0_rgba(255,255,255,0.85)]"
              >
                {/* Top row: logo + info + ⋮ */}
                <div className="flex items-start gap-3">
                  {/* Logo / placeholder */}
                  {jurusan.logo ? (
                    <img
                      src={jurusan.logo}
                      alt={jurusan.name}
                      className="w-12 h-12 object-contain rounded-xl border border-gray-100 bg-white flex-shrink-0 p-1"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center flex-shrink-0">
                      <GraduationCap size={20} className="text-gray-400" />
                    </div>
                  )}

                  {/* Name + code + status */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-semibold text-gray-900 leading-tight">{jurusan.name}</span>
                      <ActiveBadge active={jurusan.isActive} />
                    </div>
                    <p className="text-xs text-gray-400 font-mono mt-0.5">{jurusan.code}</p>
                    {jurusan.headOfDepartment && (
                      <p className="text-xs text-gray-500 mt-1 truncate">Kepala: {jurusan.headOfDepartment}</p>
                    )}
                  </div>

                  {/* ⋮ card menu */}
                  <div className="flex-shrink-0">
                    <button
                      onClick={(e) => openMenuFor(e, jurusan)}
                      className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-black/[0.05] transition-colors"
                    >
                      <MoreVertical size={15} />
                    </button>
                  </div>
                </div>

                {/* Description */}
                {jurusan.description && (
                  <div
                    className="mt-3 text-xs text-gray-500 line-clamp-2 prose prose-xs max-w-none"
                    dangerouslySetInnerHTML={{ __html: jurusan.description }}
                  />
                )}

                {/* Background card thumbnail */}
                {jurusan.backgroundImage && (
                  <div className="mt-3 flex items-center gap-2">
                    <img
                      src={jurusan.backgroundImage}
                      alt="bg"
                      className="w-9 h-9 object-cover rounded-lg border border-gray-100"
                    />
                    <span className="text-xs text-gray-400">Background card</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Card context menu — portal to body so it's never clipped */}
      {cardMenu && createPortal(
        <>
          <div className="fixed inset-0 z-40" onClick={() => setCardMenu(null)} />
          <div
            className="fixed z-50 bg-white/90 backdrop-blur-2xl border border-white/70 rounded-xl shadow-[0_8px_28px_rgba(0,0,0,0.12),inset_0_1px_0_rgba(255,255,255,0.9)] overflow-hidden py-1 min-w-[160px]"
            style={{ top: cardMenu.top, right: cardMenu.right }}
          >
            <button onClick={() => { openEditModal(cardMenu.item); setCardMenu(null); }} className="w-full px-4 py-2 text-left text-sm flex items-center gap-2.5 text-gray-700 hover:bg-black/[0.05]">
              <Edit3 size={13} className="text-blue-500" /> Edit
            </button>
            <button onClick={() => { toggleActive(cardMenu.item._id, cardMenu.item.isActive); setCardMenu(null); }} className="w-full px-4 py-2 text-left text-sm flex items-center gap-2.5 text-gray-700 hover:bg-black/[0.05]">
              {cardMenu.item.isActive ? <ToggleRight size={13} className="text-emerald-500" /> : <ToggleLeft size={13} className="text-gray-400" />}
              {cardMenu.item.isActive ? 'Nonaktifkan' : 'Aktifkan'}
            </button>
            <div className="h-px bg-gray-100 my-1" />
            <button onClick={() => { openDeleteModal(cardMenu.item); setCardMenu(null); }} className="w-full px-4 py-2 text-left text-sm flex items-center gap-2.5 text-red-500 hover:bg-red-50/60">
              <Trash2 size={13} /> Hapus
            </button>
          </div>
        </>,
        document.body
      )}

      {/* Create/Edit Modal */}
      {showModal && createPortal(
        <div className="fixed inset-0 bg-black/20 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-white/80 backdrop-blur-2xl border border-white/70 rounded-2xl shadow-[0_8px_40px_rgba(0,0,0,0.15),inset_0_1px_0_rgba(255,255,255,0.9)] max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <form onSubmit={handleSubmit}>
              {/* Header */}
              <div className="flex items-center justify-between px-5 py-4 border-b border-black/[0.06] sticky top-0 bg-white/80 backdrop-blur-2xl rounded-t-2xl">
                <h3 className="text-sm font-semibold text-gray-800">
                  {modalMode === 'create' ? 'Tambah Jurusan' : 'Edit Jurusan'}
                </h3>
                <button
                  type="button"
                  onClick={closeModal}
                  className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-black/5 rounded-lg transition-colors"
                >
                  <X size={14} />
                </button>
              </div>

              {/* Body */}
              <div className="p-5 space-y-4">
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
                    <label className="block text-xs font-medium text-gray-500 mb-1.5">
                      Nama Jurusan *
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-3 py-2 text-sm bg-white/60 border border-black/[0.08] rounded-xl focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 outline-none transition-all placeholder:text-gray-400"
                      placeholder="Teknik Komputer Jaringan"
                      required
                    />
                  </div>

                  {/* Code */}
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1.5">
                      Kode Jurusan *
                    </label>
                    <input
                      type="text"
                      value={formData.code}
                      onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                      className="w-full px-3 py-2 text-sm bg-white/60 border border-black/[0.08] rounded-xl focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 outline-none transition-all placeholder:text-gray-400"
                      placeholder="TKJ"
                      required
                    />
                  </div>
                </div>

                {/* Description */}
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1.5">
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
                  <label className="block text-xs font-medium text-gray-500 mb-1.5">
                    Deskripsi Singkat (untuk tampilan accordion homepage)
                  </label>
                  <textarea
                    value={formData.shortDescription}
                    onChange={(e) => setFormData({ ...formData, shortDescription: e.target.value })}
                    rows={3}
                    maxLength={300}
                    className="w-full px-3 py-2 text-sm bg-white/60 border border-black/[0.08] rounded-xl focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 outline-none transition-all placeholder:text-gray-400"
                    placeholder="Deskripsi singkat untuk ditampilkan di accordion homepage (maksimal 300 karakter)..."
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    {formData.shortDescription.length}/300 karakter
                  </p>
                </div>

                {/* Detail Link Text */}
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1.5">
                    Teks Link Detail (homepage accordion)
                  </label>
                  <input
                    type="text"
                    value={formData.detailLinkText}
                    onChange={(e) => setFormData({ ...formData, detailLinkText: e.target.value })}
                    className="w-full px-3 py-2 text-sm bg-white/60 border border-black/[0.08] rounded-xl focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 outline-none transition-all placeholder:text-gray-400"
                    placeholder="Lihat Detail Jurusan"
                  />
                  <p className="text-xs text-gray-400 mt-1">Teks tombol link di bawah prospek karir pada homepage. Kosongkan untuk menggunakan default.</p>
                </div>

                {/* Vision */}
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1.5">
                    Visi
                  </label>
                  <textarea
                    value={formData.vision}
                    onChange={(e) => setFormData({ ...formData, vision: e.target.value })}
                    rows={2}
                    className="w-full px-3 py-2 text-sm bg-white/60 border border-black/[0.08] rounded-xl focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 outline-none transition-all placeholder:text-gray-400"
                    placeholder="Visi jurusan..."
                  />
                </div>

                {/* Mission */}
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1.5">
                    Misi
                  </label>
                  <textarea
                    value={formData.mission}
                    onChange={(e) => setFormData({ ...formData, mission: e.target.value })}
                    rows={3}
                    className="w-full px-3 py-2 text-sm bg-white/60 border border-black/[0.08] rounded-xl focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 outline-none transition-all placeholder:text-gray-400"
                    placeholder="Misi jurusan..."
                  />
                </div>

                {/* Head of Department */}
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1.5">
                    Kepala Jurusan
                  </label>
                  <input
                    type="text"
                    value={formData.headOfDepartment}
                    onChange={(e) => setFormData({ ...formData, headOfDepartment: e.target.value })}
                    className="w-full px-3 py-2 text-sm bg-white/60 border border-black/[0.08] rounded-xl focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 outline-none transition-all placeholder:text-gray-400"
                    placeholder="Nama kepala jurusan"
                  />
                </div>

                {/* Competencies */}
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1.5">
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
                          className="flex-1 px-3 py-2 text-sm bg-white/60 border border-black/[0.08] rounded-xl focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 outline-none transition-all placeholder:text-gray-400"
                          placeholder="Contoh: Pemrograman Web"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            const newCompetencies = formData.competencies.filter((_, i) => i !== index);
                            setFormData({ ...formData, competencies: newCompetencies });
                          }}
                          className="px-3 py-2 bg-red-50 text-red-600 rounded-xl hover:bg-red-100 transition-colors"
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
                      className="w-full px-3 py-2 border-2 border-dashed border-gray-300 rounded-xl text-gray-600 hover:border-blue-400 hover:text-blue-600 transition-colors text-sm"
                    >
                      + Tambah Kompetensi
                    </button>
                  </div>
                </div>

                {/* Career Prospects */}
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1.5">
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
                          className="flex-1 px-3 py-2 text-sm bg-white/60 border border-black/[0.08] rounded-xl focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 outline-none transition-all placeholder:text-gray-400"
                          placeholder="Contoh: Web Developer"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            const newCareers = formData.careerProspects.filter((_, i) => i !== index);
                            setFormData({ ...formData, careerProspects: newCareers });
                          }}
                          className="px-3 py-2 bg-red-50 text-red-600 rounded-xl hover:bg-red-100 transition-colors"
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
                      className="w-full px-3 py-2 border-2 border-dashed border-gray-300 rounded-xl text-gray-600 hover:border-blue-400 hover:text-blue-600 transition-colors text-sm"
                    >
                      + Tambah Prospek Karir
                    </button>
                  </div>
                </div>

                {/* Gallery */}
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1.5">
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
                            className="w-full h-24 object-cover rounded-lg border cursor-pointer"
                            onClick={() => setLightboxImg(item.url)}
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
                      className="w-full px-3 py-2 text-sm bg-white/60 border border-black/[0.08] rounded-xl focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 outline-none transition-all"
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
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <label htmlFor="isActive" className="ml-2 text-sm text-gray-700">
                    Aktifkan jurusan ini
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
                  {modalMode === 'create' ? 'Tambah' : 'Simpan'}
                </button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && jurusanToDelete && createPortal(
        <div className="fixed inset-0 bg-black/20 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-white/80 backdrop-blur-2xl border border-white/70 rounded-2xl shadow-[0_8px_40px_rgba(0,0,0,0.15),inset_0_1px_0_rgba(255,255,255,0.9)] max-w-sm w-full">
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-black/[0.06] rounded-t-2xl">
              <h3 className="text-sm font-semibold text-gray-800">Hapus Jurusan?</h3>
              <button
                onClick={closeDeleteModal}
                className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-black/5 rounded-lg transition-colors"
              >
                <X size={14} />
              </button>
            </div>

            {/* Body */}
            <div className="p-5 space-y-4">
              <p className="text-sm text-gray-600">
                Apakah Anda yakin ingin menghapus jurusan <strong>{jurusanToDelete.name} ({jurusanToDelete.code})</strong>?
              </p>
              <p className="text-xs text-red-500">
                Data yang terkait dengan jurusan ini mungkin terpengaruh!
              </p>
            </div>

            {/* Footer */}
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
      {lightboxImg && createPortal(
        <div
          className="fixed inset-0 bg-black/85 z-[60] flex items-center justify-center p-4"
          onClick={() => setLightboxImg(null)}
        >
          <div className="relative max-w-4xl max-h-full" onClick={e => e.stopPropagation()}>
            <img
              src={lightboxImg}
              alt="Preview"
              className="max-w-full max-h-[85vh] object-contain rounded-xl shadow-2xl"
            />
            <button
              onClick={() => setLightboxImg(null)}
              className="absolute -top-3 -right-3 w-8 h-8 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center text-gray-700 hover:bg-white shadow-lg transition-colors"
            >
              <X size={14} />
            </button>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
};

export default Jurusan;
