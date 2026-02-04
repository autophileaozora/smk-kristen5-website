import { useState, useEffect } from 'react';
import api from '../services/api';

const CTAManagement = () => {
  const [cta, setCTA] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState(null);
  const [uploading, setUploading] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    primaryButtonText: '',
    primaryButtonLink: '',
    secondaryButtonText: '',
    secondaryButtonLink: '',
    backgroundImage: '',
  });

  useEffect(() => {
    fetchCTA();
  }, []);

  const fetchCTA = async () => {
    try {
      setLoading(true);
      // Try to get active CTA first
      const activeRes = await api.get('/api/cta/active');

      if (activeRes.data.data.cta) {
        const ctaData = activeRes.data.data.cta;
        setCTA(ctaData);
        setFormData({
          title: ctaData.title || '',
          description: ctaData.description || '',
          primaryButtonText: ctaData.primaryButtonText || '',
          primaryButtonLink: ctaData.primaryButtonLink || '',
          secondaryButtonText: ctaData.secondaryButtonText || '',
          secondaryButtonLink: ctaData.secondaryButtonLink || '',
          backgroundImage: ctaData.backgroundImage || '',
        });
      } else {
        // If no active CTA, create one
        await createDefaultCTA();
      }
    } catch (error) {
      showToast(error.response?.data?.message || 'Gagal memuat CTA', 'error');
    } finally {
      setLoading(false);
    }
  };

  const createDefaultCTA = async () => {
    try {
      const defaultData = {
        title: 'MARI DISKUSIKAN BAKAT & MINAT KAMU, KAMI AKAN MEMBANTU MENEMUKAN SESUAI PASSION ANDA',
        description: 'SMK Kristen 5 Klaten telah memiliki sertifikat ISO 9008:2015 dan menggandeng mitra industri guna menjamin mutu pendidikan dan keselarasan dengan industri.',
        primaryButtonText: 'DAFTAR SEKARANG',
        primaryButtonLink: '/pendaftaran',
        secondaryButtonText: 'LAYANAN INFORMASI',
        secondaryButtonLink: '/kontak',
        backgroundImage: '',
        isActive: true,
      };

      const response = await api.post('/api/cta', defaultData);
      const ctaData = response.data.data.cta;
      setCTA(ctaData);
      setFormData({
        title: ctaData.title || '',
        description: ctaData.description || '',
        primaryButtonText: ctaData.primaryButtonText || '',
        primaryButtonLink: ctaData.primaryButtonLink || '',
        secondaryButtonText: ctaData.secondaryButtonText || '',
        secondaryButtonLink: ctaData.secondaryButtonLink || '',
        backgroundImage: ctaData.backgroundImage || '',
      });
    } catch (error) {
      showToast('Gagal membuat CTA default', 'error');
    }
  };

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleBackgroundUpload = async (e) => {
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
      const uploadFormData = new FormData();
      uploadFormData.append('image', file);

      const response = await api.post('/api/upload/image?folder=smk-kristen5/cta', uploadFormData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      // Update form data with new image URL
      const imageUrl = response.data.data.url;
      const newFormData = { ...formData, backgroundImage: imageUrl };
      setFormData(newFormData);

      // Auto-save to database
      await api.put(`/api/cta/${cta._id}`, newFormData);
      showToast('Background berhasil diupload dan disimpan!', 'success');

      // Refresh CTA data
      fetchCTA();
    } catch (error) {
      showToast(error.response?.data?.message || 'Gagal upload background', 'error');
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.title || !formData.primaryButtonText || !formData.primaryButtonLink) {
      showToast('Mohon lengkapi semua field yang wajib diisi', 'error');
      return;
    }

    try {
      setSaving(true);
      await api.put(`/api/cta/${cta._id}`, formData);
      showToast('CTA berhasil diupdate!', 'success');
      fetchCTA();
    } catch (error) {
      showToast(error.response?.data?.message || 'Gagal update CTA', 'error');
    } finally {
      setSaving(false);
    }
  };

  const removeBackground = async () => {
    try {
      setSaving(true);
      const newFormData = { ...formData, backgroundImage: '' };
      setFormData(newFormData);

      // Auto-save to database
      await api.put(`/api/cta/${cta._id}`, newFormData);
      showToast('Background berhasil dihapus!', 'success');

      // Refresh CTA data
      fetchCTA();
    } catch (error) {
      showToast(error.response?.data?.message || 'Gagal menghapus background', 'error');
    } finally {
      setSaving(false);
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
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Edit CTA Section</h1>
        <p className="text-gray-600 mt-1">Kelola Call-to-Action section di homepage</p>
      </div>

      {/* Form */}
      {loading ? (
        <div className="bg-white rounded-lg shadow p-8 text-center">
          <div className="inline-block w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="mt-2 text-gray-600">Memuat data...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Form Section */}
          <div className="bg-white rounded-lg shadow">
            <div className="p-4 border-b">
              <h2 className="font-semibold text-gray-900">Konten CTA</h2>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              {/* Title */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Judul CTA <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="MARI DISKUSIKAN BAKAT & MINAT KAMU, KAMI AKAN MEMBANTU MENEMUKAN SESUAI PASSION ANDA"
                  rows="3"
                  required
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Deskripsi
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="SMK Kristen 5 Klaten telah memiliki sertifikat ISO 9008:2015..."
                  rows="3"
                />
              </div>

              {/* Primary Button Section */}
              <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                <h3 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
                  <span className="w-6 h-6 bg-yellow-400 rounded text-xs flex items-center justify-center text-gray-900 font-bold">1</span>
                  Button Utama (Kuning)
                </h3>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Teks Button <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.primaryButtonText}
                      onChange={(e) => setFormData({ ...formData, primaryButtonText: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm"
                      placeholder="DAFTAR SEKARANG"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Link Button <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.primaryButtonLink}
                      onChange={(e) => setFormData({ ...formData, primaryButtonLink: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm"
                      placeholder="/pendaftaran"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Secondary Button Section */}
              <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                <h3 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
                  <span className="w-6 h-6 bg-white border-2 border-gray-400 rounded text-xs flex items-center justify-center text-gray-600 font-bold">2</span>
                  Button Sekunder (Outline)
                </h3>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Teks Button
                    </label>
                    <input
                      type="text"
                      value={formData.secondaryButtonText}
                      onChange={(e) => setFormData({ ...formData, secondaryButtonText: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm"
                      placeholder="LAYANAN INFORMASI"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Link Button
                    </label>
                    <input
                      type="text"
                      value={formData.secondaryButtonLink}
                      onChange={(e) => setFormData({ ...formData, secondaryButtonLink: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm"
                      placeholder="/kontak"
                    />
                  </div>
                </div>
                <p className="text-xs text-gray-500 mt-2">Kosongkan jika tidak ingin menampilkan button sekunder</p>
              </div>

              {/* Background Image */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Background Image
                </label>

                {formData.backgroundImage ? (
                  <div className="space-y-2">
                    <div className="relative">
                      <img
                        src={formData.backgroundImage}
                        alt="Background preview"
                        className="w-full h-40 object-cover rounded-lg"
                      />
                      <button
                        type="button"
                        onClick={removeBackground}
                        className="absolute top-2 right-2 px-3 py-1 bg-red-500 text-white text-sm rounded-lg hover:bg-red-600"
                      >
                        Hapus
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-primary-500 transition-colors">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleBackgroundUpload}
                      className="hidden"
                      id="background-upload"
                      disabled={uploading}
                    />
                    <label
                      htmlFor="background-upload"
                      className="cursor-pointer"
                    >
                      {uploading ? (
                        <div className="flex flex-col items-center">
                          <div className="w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full animate-spin"></div>
                          <p className="mt-2 text-sm text-gray-600">Mengupload...</p>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center">
                          <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          <p className="mt-2 text-sm text-gray-600">Klik untuk upload</p>
                          <p className="text-xs text-gray-500">PNG, JPG up to 5MB</p>
                        </div>
                      )}
                    </label>
                  </div>
                )}
              </div>

              {/* Submit Button */}
              <div className="pt-4 border-t">
                <button
                  type="submit"
                  disabled={saving}
                  className="w-full px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {saving ? 'Menyimpan...' : 'Simpan Perubahan'}
                </button>
              </div>
            </form>
          </div>

          {/* Preview Section */}
          <div className="bg-white rounded-lg shadow">
            <div className="p-4 border-b">
              <h2 className="font-semibold text-gray-900">Preview</h2>
            </div>
            <div className="p-4">
              <div
                className="relative rounded-lg overflow-hidden min-h-[300px] flex items-center"
                style={{
                  backgroundImage: formData.backgroundImage ? `url(${formData.backgroundImage})` : 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)',
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                }}
              >
                {/* Overlay */}
                <div className="absolute inset-0 bg-black/50"></div>
                <div
                  className="absolute inset-0"
                  style={{
                    background: 'linear-gradient(90deg, rgba(30, 30, 30, 0.8) 0%, rgba(30, 30, 30, 0.6) 50%, rgba(255, 221, 85, 0.4) 100%)',
                  }}
                ></div>

                {/* Content */}
                <div className="relative z-10 p-6 max-w-md">
                  <h2 className="text-lg font-bold text-yellow-300 leading-tight uppercase" style={{ fontFamily: "'Russo One', sans-serif" }}>
                    {formData.title || 'JUDUL CTA ANDA'}
                  </h2>
                  {formData.description && (
                    <p className="text-white/90 text-xs mt-3 leading-relaxed">
                      {formData.description}
                    </p>
                  )}
                  <div className="flex gap-3 mt-4 flex-wrap">
                    <button className="bg-yellow-400 text-black px-4 py-2 rounded text-xs font-semibold uppercase">
                      {formData.primaryButtonText || 'BUTTON UTAMA'}
                    </button>
                    {formData.secondaryButtonText && (
                      <button className="bg-transparent text-white px-4 py-2 border-2 border-white rounded text-xs font-semibold uppercase">
                        {formData.secondaryButtonText}
                      </button>
                    )}
                  </div>
                </div>
              </div>
              <p className="text-xs text-gray-500 mt-3 text-center">
                Preview ini adalah gambaran kasar. Tampilan sebenarnya mungkin sedikit berbeda.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CTAManagement;
