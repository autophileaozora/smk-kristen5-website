import { useState, useEffect } from 'react';
import api from '../services/api';

const SiteSettings = ({ embedded = false, section = 'general', saveTrigger = 0 }) => {
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState(null);
  const [uploading, setUploading] = useState(false);

  const [formData, setFormData] = useState({
    siteName: '',
    siteTagline: '',
    favicon: '',
    ogImage: '',
    metaTitle: '',
    metaDescription: '',
    metaKeywords: '',
    googleAnalyticsId: '',
    homepageSections: {
      whyTitle: '',
      whyHeading: '',
      whyDescription: '',
      whyButtonText: '',
      whyButtonUrl: '',
      statsHeading: '',
      foundingYear: 1999,
      accelerateTitle: '',
      accelerateDescription: '',
      testimonialsTitle: '',
      testimonialsDescription: '',
      testimonialsButtonText: '',
      newsTopTitle: '',
      newsMainTitle: '',
      eventsTitle: '',
      eventsDescription: '',
      eventsButtonText: '',
    },
  });

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const res = await api.get('/api/site-settings');
      const data = res.data.data.settings;
      setSettings(data);
      setFormData({
        siteName: data.siteName || '',
        siteTagline: data.siteTagline || '',
        favicon: data.favicon || '',
        ogImage: data.ogImage || '',
        metaTitle: data.metaTitle || '',
        metaDescription: data.metaDescription || '',
        metaKeywords: data.metaKeywords || '',
        googleAnalyticsId: data.googleAnalyticsId || '',
        homepageSections: {
          whyTitle: data.homepageSections?.whyTitle || '',
          whyHeading: data.homepageSections?.whyHeading || '',
          whyDescription: data.homepageSections?.whyDescription || '',
          whyButtonText: data.homepageSections?.whyButtonText || '',
          whyButtonUrl: data.homepageSections?.whyButtonUrl || '',
          statsHeading: data.homepageSections?.statsHeading || '',
          foundingYear: data.homepageSections?.foundingYear || 1999,
          accelerateTitle: data.homepageSections?.accelerateTitle || '',
          accelerateDescription: data.homepageSections?.accelerateDescription || '',
          testimonialsTitle: data.homepageSections?.testimonialsTitle || '',
          testimonialsDescription: data.homepageSections?.testimonialsDescription || '',
          testimonialsButtonText: data.homepageSections?.testimonialsButtonText || '',
          newsTopTitle: data.homepageSections?.newsTopTitle || '',
          newsMainTitle: data.homepageSections?.newsMainTitle || '',
          eventsTitle: data.homepageSections?.eventsTitle || '',
          eventsDescription: data.homepageSections?.eventsDescription || '',
          eventsButtonText: data.homepageSections?.eventsButtonText || '',
          ekskulHeroTitle: data.homepageSections?.ekskulHeroTitle || '',
          ekskulHeroSubtitle: data.homepageSections?.ekskulHeroSubtitle || '',
          fasilitasHeroTitle: data.homepageSections?.fasilitasHeroTitle || '',
          fasilitasHeroSubtitle: data.homepageSections?.fasilitasHeroSubtitle || '',
        },
      });
    } catch (error) {
      showToast(error.response?.data?.message || 'Gagal memuat pengaturan', 'error');
    } finally {
      setLoading(false);
    }
  };

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleImageUpload = async (e, field) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      showToast('Hanya file gambar yang diperbolehkan', 'error');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      showToast('Ukuran file maksimal 5MB', 'error');
      return;
    }

    try {
      setUploading(true);
      const uploadData = new FormData();
      uploadData.append('image', file);

      const res = await api.post('/api/upload/image', uploadData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      setFormData((prev) => ({ ...prev, [field]: res.data.data.url }));
      showToast('Gambar berhasil diupload');
    } catch (error) {
      showToast(error.response?.data?.message || 'Gagal upload gambar', 'error');
    } finally {
      setUploading(false);
    }
  };

  const doSave = async () => {
    try {
      setSaving(true);
      await api.put('/api/site-settings', formData);
      showToast('Pengaturan berhasil disimpan');
      fetchSettings();
    } catch (error) {
      showToast(error.response?.data?.message || 'Gagal menyimpan pengaturan', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    await doSave();
  };

  useEffect(() => {
    if (saveTrigger > 0) doSave();
  }, [saveTrigger]);

  const updateHP = (field, value) => {
    setFormData(prev => ({
      ...prev,
      homepageSections: { ...prev.homepageSections, [field]: value },
    }));
  };

  const [expandedSections, setExpandedSections] = useState({
    whyChooseUs: true,
    accelerate: false,
    testimonials: false,
    news: false,
    events: false,
  });

  const toggleSection = (key) => {
    setExpandedSections(prev => ({ ...prev, [key]: !prev[key] }));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className={embedded ? '' : 'p-6'}>
      {/* Toast */}
      {toast && (
        <div
          className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-lg shadow-lg ${
            toast.type === 'error' ? 'bg-red-500' : 'bg-green-500'
          } text-white`}
        >
          {toast.message}
        </div>
      )}

      {/* Header */}
      {!embedded && (
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Pengaturan Website</h1>
        <p className="text-gray-600">Kelola pengaturan umum website</p>
      </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
          {/* Beranda Tab */}
          {section === 'beranda' && (
            <div className="space-y-4">
              <p className="text-sm text-gray-500 mb-4">
                Kelola teks dan konten yang tampil di halaman beranda. Kosongkan field untuk menggunakan teks default.
              </p>

              {/* Why Choose Us */}
              <div className="border rounded-lg overflow-hidden">
                <button type="button" onClick={() => toggleSection('whyChooseUs')} className="w-full flex justify-between items-center px-4 py-3 bg-gray-50 hover:bg-gray-100 text-left">
                  <span className="font-medium text-gray-700">Mengapa Memilih Kami (Why Choose Us)</span>
                  <span className="text-gray-400">{expandedSections.whyChooseUs ? '▼' : '▶'}</span>
                </button>
                {expandedSections.whyChooseUs && (
                  <div className="p-4 space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Judul Kecil</label>
                      <input type="text" value={formData.homepageSections.whyTitle} onChange={(e) => updateHP('whyTitle', e.target.value)} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500" placeholder="MENGAPA SEKOLAH DI KRISMA" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Judul Utama</label>
                      <input type="text" value={formData.homepageSections.whyHeading} onChange={(e) => updateHP('whyHeading', e.target.value)} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500" placeholder="SEKOLAH BINAAN DAIHATSU DAN MATERI BERDASARKAN INDUSTRIAL" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Deskripsi</label>
                      <textarea value={formData.homepageSections.whyDescription} onChange={(e) => updateHP('whyDescription', e.target.value)} rows={3} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500" placeholder="SMK Kristen 5 Klaten telah memiliki sertifikat ISO 9008:2015..." />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Teks Tombol</label>
                        <input type="text" value={formData.homepageSections.whyButtonText} onChange={(e) => updateHP('whyButtonText', e.target.value)} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500" placeholder="Baca Profil Sekolah" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">URL Tombol</label>
                        <input type="text" value={formData.homepageSections.whyButtonUrl} onChange={(e) => updateHP('whyButtonUrl', e.target.value)} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500" placeholder="/tentang" />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Judul Partner/Alumni</label>
                      <input type="text" value={formData.homepageSections.statsHeading} onChange={(e) => updateHP('statsHeading', e.target.value)} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500" placeholder="ALUMNI KAMI TELAH BEKERJA DI TOP COMPANY" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Tahun Berdiri</label>
                      <input type="number" value={formData.homepageSections.foundingYear} onChange={(e) => updateHP('foundingYear', parseInt(e.target.value) || 1999)} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500" placeholder="1999" />
                      <p className="text-xs text-gray-500 mt-1">
                        Akan ditampilkan sebagai: <strong>{new Date().getFullYear() - (formData.homepageSections.foundingYear || 1999)} Tahun Pengabdian</strong>
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Accelerate */}
              <div className="border rounded-lg overflow-hidden">
                <button type="button" onClick={() => toggleSection('accelerate')} className="w-full flex justify-between items-center px-4 py-3 bg-gray-50 hover:bg-gray-100 text-left">
                  <span className="font-medium text-gray-700">Potensi (Accelerate Section)</span>
                  <span className="text-gray-400">{expandedSections.accelerate ? '▼' : '▶'}</span>
                </button>
                {expandedSections.accelerate && (
                  <div className="p-4 space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Judul</label>
                      <input type="text" value={formData.homepageSections.accelerateTitle} onChange={(e) => updateHP('accelerateTitle', e.target.value)} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500" placeholder="ACCELERATE YOUR ENTIRE POTENTIAL" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Deskripsi</label>
                      <textarea value={formData.homepageSections.accelerateDescription} onChange={(e) => updateHP('accelerateDescription', e.target.value)} rows={4} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500" placeholder="MULAI DARI HARI PERTAMA, PROSES BELAJAR..." />
                    </div>
                  </div>
                )}
              </div>

              {/* Testimonials */}
              <div className="border rounded-lg overflow-hidden">
                <button type="button" onClick={() => toggleSection('testimonials')} className="w-full flex justify-between items-center px-4 py-3 bg-gray-50 hover:bg-gray-100 text-left">
                  <span className="font-medium text-gray-700">Testimoni Alumni</span>
                  <span className="text-gray-400">{expandedSections.testimonials ? '▼' : '▶'}</span>
                </button>
                {expandedSections.testimonials && (
                  <div className="p-4 space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Judul</label>
                      <input type="text" value={formData.homepageSections.testimonialsTitle} onChange={(e) => updateHP('testimonialsTitle', e.target.value)} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500" placeholder="Cerita pengalaman menarik dan berkesan oleh alumni kami" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Deskripsi</label>
                      <textarea value={formData.homepageSections.testimonialsDescription} onChange={(e) => updateHP('testimonialsDescription', e.target.value)} rows={3} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500" placeholder="SMK Kristen 5 Klaten telah memiliki sertifikat ISO 9008:2015..." />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Teks Tombol</label>
                      <input type="text" value={formData.homepageSections.testimonialsButtonText} onChange={(e) => updateHP('testimonialsButtonText', e.target.value)} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500" placeholder="BAGIKAN CERITAMU" />
                    </div>
                  </div>
                )}
              </div>

              {/* News */}
              <div className="border rounded-lg overflow-hidden">
                <button type="button" onClick={() => toggleSection('news')} className="w-full flex justify-between items-center px-4 py-3 bg-gray-50 hover:bg-gray-100 text-left">
                  <span className="font-medium text-gray-700">Berita (News Section)</span>
                  <span className="text-gray-400">{expandedSections.news ? '▼' : '▶'}</span>
                </button>
                {expandedSections.news && (
                  <div className="p-4 space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Judul Sidebar Berita</label>
                      <input type="text" value={formData.homepageSections.newsTopTitle} onChange={(e) => updateHP('newsTopTitle', e.target.value)} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500" placeholder="TOP 5 BERITA" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Judul Berita Utama</label>
                      <input type="text" value={formData.homepageSections.newsMainTitle} onChange={(e) => updateHP('newsMainTitle', e.target.value)} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500" placeholder="BERITA UTAMA" />
                    </div>
                  </div>
                )}
              </div>

              {/* Events */}
              <div className="border rounded-lg overflow-hidden">
                <button type="button" onClick={() => toggleSection('events')} className="w-full flex justify-between items-center px-4 py-3 bg-gray-50 hover:bg-gray-100 text-left">
                  <span className="font-medium text-gray-700">Agenda (Events Section)</span>
                  <span className="text-gray-400">{expandedSections.events ? '▼' : '▶'}</span>
                </button>
                {expandedSections.events && (
                  <div className="p-4 space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Judul</label>
                      <input type="text" value={formData.homepageSections.eventsTitle} onChange={(e) => updateHP('eventsTitle', e.target.value)} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500" placeholder="KEGIATAN SISWA DAN GURU" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Deskripsi</label>
                      <textarea value={formData.homepageSections.eventsDescription} onChange={(e) => updateHP('eventsDescription', e.target.value)} rows={3} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500" placeholder="AGENDA YANG AKAN HADIR DI SMK KRISTEN 5 KLATEN..." />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Teks Tombol</label>
                      <input type="text" value={formData.homepageSections.eventsButtonText} onChange={(e) => updateHP('eventsButtonText', e.target.value)} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500" placeholder="LIHAT SEMUA AGENDA" />
                    </div>
                  </div>
                )}
              </div>

              {/* Ekskul Page Hero */}
              <div className="border border-gray-200 rounded-xl overflow-hidden">
                <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
                  <h3 className="font-semibold text-gray-800 text-sm">Hero Halaman Ekstrakulikuler</h3>
                  <p className="text-xs text-gray-500 mt-0.5">Teks yang tampil di bagian atas halaman /ekskul</p>
                </div>
                <div className="p-4 space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Judul</label>
                    <input type="text" value={formData.homepageSections.ekskulHeroTitle} onChange={(e) => updateHP('ekskulHeroTitle', e.target.value)} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500" placeholder="EKSTRAKULIKULER" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Subjudul</label>
                    <textarea value={formData.homepageSections.ekskulHeroSubtitle} onChange={(e) => updateHP('ekskulHeroSubtitle', e.target.value)} rows={2} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500" placeholder="Kembangkan potensi dan bakatmu bersama ekstrakulikuler pilihan..." />
                  </div>
                </div>
              </div>

              {/* Fasilitas Page Hero */}
              <div className="border border-gray-200 rounded-xl overflow-hidden">
                <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
                  <h3 className="font-semibold text-gray-800 text-sm">Hero Halaman Fasilitas</h3>
                  <p className="text-xs text-gray-500 mt-0.5">Teks yang tampil di bagian atas halaman /fasilitas</p>
                </div>
                <div className="p-4 space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Judul</label>
                    <input type="text" value={formData.homepageSections.fasilitasHeroTitle} onChange={(e) => updateHP('fasilitasHeroTitle', e.target.value)} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500" placeholder="FASILITAS SEKOLAH" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Subjudul</label>
                    <textarea value={formData.homepageSections.fasilitasHeroSubtitle} onChange={(e) => updateHP('fasilitasHeroSubtitle', e.target.value)} rows={2} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500" placeholder="Menunjang kegiatan belajar mengajar dengan fasilitas modern..." />
                  </div>
                </div>
              </div>

            </div>
          )}

          {/* SEO Tab */}
          {section === 'seo' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Nama Website</label>
                  <input
                    type="text"
                    value={formData.siteName}
                    onChange={(e) => setFormData({ ...formData, siteName: e.target.value })}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="SMK Kristen 5 Klaten"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Tagline</label>
                  <input
                    type="text"
                    value={formData.siteTagline}
                    onChange={(e) => setFormData({ ...formData, siteTagline: e.target.value })}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="Sekolah Menengah Kejuruan"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Favicon</label>
                <div className="flex items-center gap-4">
                  {formData.favicon && (
                    <img src={formData.favicon} alt="Favicon" className="w-8 h-8" />
                  )}
                  <label className="cursor-pointer px-4 py-2 bg-gray-100 rounded-lg hover:bg-gray-200">
                    <span>{formData.favicon ? 'Ganti' : 'Upload'} Favicon</span>
                    <input type="file" accept="image/*" onChange={(e) => handleImageUpload(e, 'favicon')} className="hidden" />
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Gambar Open Graph (OG Image)
                </label>
                <p className="text-xs text-gray-500 mb-3">
                  Gambar yang muncul saat link website dibagikan ke WhatsApp, Telegram, Facebook, dll. Ukuran ideal: <strong>1200 x 630 piksel</strong>.
                </p>
                <div className="flex items-start gap-4">
                  {formData.ogImage && (
                    <img src={formData.ogImage} alt="OG Image Preview" className="w-40 h-[84px] object-cover rounded-lg border border-gray-200" />
                  )}
                  <div className="flex flex-col gap-2">
                    <label className={`cursor-pointer px-4 py-2 bg-gray-100 rounded-lg hover:bg-gray-200 text-sm ${uploading ? 'opacity-50 cursor-not-allowed' : ''}`}>
                      <span>{formData.ogImage ? 'Ganti' : 'Upload'} OG Image</span>
                      <input type="file" accept="image/*" onChange={(e) => handleImageUpload(e, 'ogImage')} className="hidden" disabled={uploading} />
                    </label>
                    {formData.ogImage && (
                      <button
                        type="button"
                        onClick={() => setFormData(prev => ({ ...prev, ogImage: '' }))}
                        className="text-xs text-red-500 hover:text-red-700 text-left"
                      >
                        Hapus gambar
                      </button>
                    )}
                  </div>
                </div>
              </div>

              <hr className="border-gray-200" />

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Meta Title
                </label>
                <input
                  type="text"
                  value={formData.metaTitle}
                  onChange={(e) =>
                    setFormData({ ...formData, metaTitle: e.target.value })
                  }
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="SMK Kristen 5 Klaten - Sekolah Kejuruan Terbaik"
                />
                <p className="text-xs text-gray-500 mt-1">
                  {formData.metaTitle.length}/60 karakter (rekomendasi)
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Meta Description
                </label>
                <textarea
                  value={formData.metaDescription}
                  onChange={(e) =>
                    setFormData({ ...formData, metaDescription: e.target.value })
                  }
                  rows={3}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="Deskripsi singkat tentang website..."
                />
                <p className="text-xs text-gray-500 mt-1">
                  {formData.metaDescription.length}/160 karakter (rekomendasi)
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Meta Keywords
                </label>
                <input
                  type="text"
                  value={formData.metaKeywords}
                  onChange={(e) =>
                    setFormData({ ...formData, metaKeywords: e.target.value })
                  }
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="smk, klaten, kejuruan, tkj, tkro, akl, bdp"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Google Analytics ID
                </label>
                <input
                  type="text"
                  value={formData.googleAnalyticsId}
                  onChange={(e) =>
                    setFormData({ ...formData, googleAnalyticsId: e.target.value })
                  }
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="G-XXXXXXXXXX atau UA-XXXXXXXX-X"
                />
              </div>
            </div>
          )}


      </form>
    </div>
  );
};

export default SiteSettings;
