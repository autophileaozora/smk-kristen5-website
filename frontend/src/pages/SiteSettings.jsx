import { useState, useEffect } from 'react';
import api from '../services/api';

const SiteSettings = ({ embedded = false }) => {
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [activeTab, setActiveTab] = useState('general');

  const [formData, setFormData] = useState({
    siteName: '',
    siteTagline: '',
    logo: '',
    logoLight: '',
    favicon: '',
    email: '',
    phone: '',
    whatsapp: '',
    address: '',
    googleMapsUrl: '',
    googleMapsEmbed: '',
    metaTitle: '',
    metaDescription: '',
    metaKeywords: '',
    googleAnalyticsId: '',
    footerText: '',
    footerDescription: '',
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
        logo: data.logo || '',
        logoLight: data.logoLight || '',
        favicon: data.favicon || '',
        email: data.email || '',
        phone: data.phone || '',
        whatsapp: data.whatsapp || '',
        address: data.address || '',
        googleMapsUrl: data.googleMapsUrl || '',
        googleMapsEmbed: data.googleMapsEmbed || '',
        metaTitle: data.metaTitle || '',
        metaDescription: data.metaDescription || '',
        metaKeywords: data.metaKeywords || '',
        googleAnalyticsId: data.googleAnalyticsId || '',
        footerText: data.footerText || '',
        footerDescription: data.footerDescription || '',
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

  const handleSubmit = async (e) => {
    e.preventDefault();
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

  const tabs = [
    { id: 'general', label: 'Umum', icon: '⚙️' },
    { id: 'beranda', label: 'Beranda', icon: '🏠' },
    { id: 'seo', label: 'SEO', icon: '🔍' },
  ];

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

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow-md">
        <div className="border-b">
          <div className="flex">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-6 py-4 text-sm font-medium transition-colors ${
                  activeTab === tab.id
                    ? 'border-b-2 border-blue-600 text-blue-600'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <span className="mr-2">{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          {/* General Tab */}
          {activeTab === 'general' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nama Website
                  </label>
                  <input
                    type="text"
                    value={formData.siteName}
                    onChange={(e) =>
                      setFormData({ ...formData, siteName: e.target.value })
                    }
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="SMK Kristen 5 Klaten"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tagline
                  </label>
                  <input
                    type="text"
                    value={formData.siteTagline}
                    onChange={(e) =>
                      setFormData({ ...formData, siteTagline: e.target.value })
                    }
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="Sekolah Menengah Kejuruan"
                  />
                </div>
              </div>

              {/* Logo Upload */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Logo Utama
                  </label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
                    {formData.logo ? (
                      <div className="relative">
                        <img
                          src={formData.logo}
                          alt="Logo"
                          className="max-h-24 mx-auto"
                        />
                        <button
                          type="button"
                          onClick={() => setFormData({ ...formData, logo: '' })}
                          className="absolute top-0 right-0 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center"
                        >
                          ×
                        </button>
                      </div>
                    ) : (
                      <label className="cursor-pointer block text-center">
                        <span className="text-gray-500">Klik untuk upload</span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => handleImageUpload(e, 'logo')}
                          className="hidden"
                        />
                      </label>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Logo Light (untuk background gelap)
                  </label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 bg-gray-800">
                    {formData.logoLight ? (
                      <div className="relative">
                        <img
                          src={formData.logoLight}
                          alt="Logo Light"
                          className="max-h-24 mx-auto"
                        />
                        <button
                          type="button"
                          onClick={() => setFormData({ ...formData, logoLight: '' })}
                          className="absolute top-0 right-0 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center"
                        >
                          ×
                        </button>
                      </div>
                    ) : (
                      <label className="cursor-pointer block text-center">
                        <span className="text-gray-400">Klik untuk upload</span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => handleImageUpload(e, 'logoLight')}
                          className="hidden"
                        />
                      </label>
                    )}
                  </div>
                </div>
              </div>

              {/* Favicon */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Favicon
                </label>
                <div className="flex items-center gap-4">
                  {formData.favicon && (
                    <img src={formData.favicon} alt="Favicon" className="w-8 h-8" />
                  )}
                  <label className="cursor-pointer px-4 py-2 bg-gray-100 rounded-lg hover:bg-gray-200">
                    <span>{formData.favicon ? 'Ganti' : 'Upload'} Favicon</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleImageUpload(e, 'favicon')}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>
            </div>
          )}

          {/* Beranda Tab */}
          {activeTab === 'beranda' && (
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
            </div>
          )}

          {/* Contact Tab - removed, managed in Info Sekolah → Kontak */}

          {activeTab === '_contact_removed' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="info@smkkrisma.sch.id"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Telepon
                  </label>
                  <input
                    type="text"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="(0272) 123456"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    WhatsApp
                  </label>
                  <input
                    type="text"
                    value={formData.whatsapp}
                    onChange={(e) =>
                      setFormData({ ...formData, whatsapp: e.target.value })
                    }
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="6281234567890"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Alamat
                </label>
                <textarea
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="Jl. Contoh No. 123, Klaten, Jawa Tengah"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Google Maps URL
                </label>
                <input
                  type="url"
                  value={formData.googleMapsUrl}
                  onChange={(e) =>
                    setFormData({ ...formData, googleMapsUrl: e.target.value })
                  }
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="https://maps.google.com/..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Google Maps Embed Code
                </label>
                <textarea
                  value={formData.googleMapsEmbed}
                  onChange={(e) =>
                    setFormData({ ...formData, googleMapsEmbed: e.target.value })
                  }
                  rows={4}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 font-mono text-sm"
                  placeholder='<iframe src="..."></iframe>'
                />
              </div>
            </div>
          )}

          {/* SEO Tab */}
          {activeTab === 'seo' && (
            <div className="space-y-6">
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

          {/* Footer Tab - removed, managed in Pengaturan → Footer */}
          {activeTab === '_footer_removed' && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Footer Text (Copyright)
                </label>
                <input
                  type="text"
                  value={formData.footerText}
                  onChange={(e) =>
                    setFormData({ ...formData, footerText: e.target.value })
                  }
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="© 2024 SMK Kristen 5 Klaten. All rights reserved."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Footer Description
                </label>
                <textarea
                  value={formData.footerDescription}
                  onChange={(e) =>
                    setFormData({ ...formData, footerDescription: e.target.value })
                  }
                  rows={3}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="Deskripsi singkat untuk footer..."
                />
              </div>
            </div>
          )}

          {/* Submit Button */}
          <div className="mt-8 pt-6 border-t">
            <button
              type="submit"
              disabled={saving || uploading}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {saving ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Menyimpan...</span>
                </>
              ) : (
                <>
                  <span>💾</span>
                  <span>Simpan Pengaturan</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SiteSettings;
