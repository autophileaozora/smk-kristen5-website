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
    subtitle: '',
    buttonText: '',
    buttonLink: '',
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
        setCTA(activeRes.data.data.cta);
        setFormData({
          title: activeRes.data.data.cta.title,
          subtitle: activeRes.data.data.cta.subtitle || '',
          buttonText: activeRes.data.data.cta.buttonText,
          buttonLink: activeRes.data.data.cta.buttonLink,
          backgroundImage: activeRes.data.data.cta.backgroundImage || '',
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
        title: 'MARI DISKUSIKAN BAKAT & MINAT KAMU,\nKAMI AKAN MEMBANTU MENEMUKAN SESUAI\nPASSION ANDA',
        subtitle: 'Kami siap membantu Anda menemukan jurusan yang tepat',
        buttonText: 'Diskusi',
        buttonLink: '/kontak',
        backgroundImage: '',
        isActive: true,
      };

      const response = await api.post('/api/cta', defaultData);
      setCTA(response.data.data.cta);
      setFormData({
        title: response.data.data.cta.title,
        subtitle: response.data.data.cta.subtitle || '',
        buttonText: response.data.data.cta.buttonText,
        buttonLink: response.data.data.cta.buttonLink,
        backgroundImage: response.data.data.cta.backgroundImage || '',
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

    if (!formData.title || !formData.buttonText || !formData.buttonLink) {
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
        <div className="bg-white rounded-lg shadow">
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {/* Title */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Judul CTA <span className="text-red-500">*</span>
                <span className="text-xs text-gray-500 ml-2">(Gunakan \n untuk membuat baris baru)</span>
              </label>
              <textarea
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="MARI DISKUSIKAN BAKAT & MINAT KAMU,\nKAMI AKAN MEMBANTU MENEMUKAN SESUAI\nPASSION ANDA"
                rows="4"
                required
              />
              <p className="text-xs text-gray-500 mt-1">Teks besar yang akan ditampilkan di tengah section</p>
            </div>

            {/* Subtitle */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Subtitle
              </label>
              <input
                type="text"
                value={formData.subtitle}
                onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="Kami siap membantu Anda menemukan jurusan yang tepat"
              />
              <p className="text-xs text-gray-500 mt-1">Teks kecil di bawah judul (seperti text di bawah KOMPETENSI JURUSAN)</p>
            </div>

            {/* Button Text */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Teks Button <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.buttonText}
                onChange={(e) => setFormData({ ...formData, buttonText: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="Diskusi"
                required
              />
              <p className="text-xs text-gray-500 mt-1">Teks yang muncul di button kuning</p>
            </div>

            {/* Button Link */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Link Button <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.buttonLink}
                onChange={(e) => setFormData({ ...formData, buttonLink: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="/kontak atau /daftar"
                required
              />
              <p className="text-xs text-gray-500 mt-1">Halaman tujuan saat button diklik</p>
            </div>

            {/* Background Image */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Background Parallax
              </label>

              {formData.backgroundImage ? (
                <div className="space-y-2">
                  <div className="relative">
                    <img
                      src={formData.backgroundImage}
                      alt="Background preview"
                      className="w-full h-48 object-cover rounded-lg"
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
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-primary-500 transition-colors">
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
                        <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <p className="mt-2 text-sm text-gray-600">Klik untuk upload background image</p>
                        <p className="text-xs text-gray-500 mt-1">PNG, JPG up to 5MB</p>
                      </div>
                    )}
                  </label>
                </div>
              )}
              <p className="text-xs text-gray-500 mt-1">Gambar parallax di background CTA section (optional)</p>
            </div>

            {/* Submit Button */}
            <div className="flex gap-3 pt-4 border-t">
              <button
                type="submit"
                disabled={saving}
                className="flex-1 px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {saving ? 'Menyimpan...' : 'Simpan Perubahan'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default CTAManagement;
