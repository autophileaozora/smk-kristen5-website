import { useState, useEffect } from 'react';
import api from '../services/api';
import ImageUpload from '../components/ImageUpload';

const KontakManagement = () => {
  const [contactInfo, setContactInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState(null);

  const [formData, setFormData] = useState({
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

  useEffect(() => {
    fetchContactInfo();
  }, []);

  const fetchContactInfo = async () => {
    try {
      setLoading(true);
      const response = await api.get('/api/contact');
      const data = response.data.data;
      setContactInfo(data);
      setFormData({
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
    } finally {
      setLoading(false);
    }
  };

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    // Handle nested objects
    if (name.startsWith('operatingHours.')) {
      const key = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        operatingHours: {
          ...prev.operatingHours,
          [key]: value
        }
      }));
    } else if (name.startsWith('socialMedia.')) {
      const key = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        socialMedia: {
          ...prev.socialMedia,
          [key]: value
        }
      }));
    } else if (name.startsWith('principal.')) {
      const key = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        principal: {
          ...prev.principal,
          [key]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setSaving(true);
      await api.put('/api/contact', formData);
      showToast('Informasi kontak berhasil diperbarui', 'success');
      fetchContactInfo();
    } catch (error) {
      showToast(error.response?.data?.message || 'Gagal memperbarui informasi kontak', 'error');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Memuat data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Kelola Informasi Kontak</h1>
          <p className="mt-2 text-gray-600">Perbarui informasi kontak sekolah yang ditampilkan di halaman publik</p>
        </div>

        {/* Toast Notification */}
        {toast && (
          <div className={`fixed top-4 right-4 z-50 px-6 py-4 rounded-lg shadow-lg ${
            toast.type === 'success' ? 'bg-green-500' : 'bg-red-500'
          } text-white flex items-center gap-2`}>
            {toast.type === 'success' ? (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            ) : (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            )}
            <span>{toast.message}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
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
                  value={formData.address}
                  onChange={handleChange}
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
                    value={formData.phone}
                    onChange={handleChange}
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
                    value={formData.whatsapp}
                    onChange={handleChange}
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
                  value={formData.email}
                  onChange={handleChange}
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
                  value={formData.operatingHours.weekdays}
                  onChange={handleChange}
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
                    value={formData.operatingHours.saturday}
                    onChange={handleChange}
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
                    value={formData.operatingHours.sunday}
                    onChange={handleChange}
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
                  value={formData.socialMedia.instagram}
                  onChange={handleChange}
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
                  value={formData.socialMedia.facebook}
                  onChange={handleChange}
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
                  value={formData.socialMedia.youtube}
                  onChange={handleChange}
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
                  value={formData.socialMedia.twitter}
                  onChange={handleChange}
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
                value={formData.schoolLogo}
                onChange={(url) => setFormData(prev => ({ ...prev, schoolLogo: url }))}
                folder="smk-kristen5/logo"
                previewClassName="h-24 w-auto"
              />

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Google Maps Embed URL
                </label>
                <textarea
                  name="mapUrl"
                  value={formData.mapUrl}
                  onChange={handleChange}
                  rows="3"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm"
                  placeholder="https://www.google.com/maps/embed?pb=..."
                />
                <p className="mt-1 text-sm text-gray-500">
                  Dapatkan URL embed dari Google Maps → Share → Embed a map
                </p>
              </div>

              <ImageUpload
                label="Hero Image"
                value={formData.heroImage}
                onChange={(url) => setFormData(prev => ({ ...prev, heroImage: url }))}
                folder="smk-kristen5/hero"
                previewClassName="h-40 w-auto"
              />
            </div>
          </div>

          {/* Principal Information */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Informasi Kepala Sekolah</h2>
            <p className="text-sm text-gray-600 mb-4">
              Informasi ini akan ditampilkan di card "Sambutan Kepala Sekolah" pada halaman beranda
            </p>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nama Kepala Sekolah
                </label>
                <input
                  type="text"
                  name="principal.name"
                  value={formData.principal.name}
                  onChange={handleChange}
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
                  value={formData.principal.title}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Kepala Sekolah"
                />
              </div>

              <ImageUpload
                label="Foto Kepala Sekolah"
                value={formData.principal.photo}
                onChange={(url) => setFormData(prev => ({
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
                  value={formData.principal.message}
                  onChange={handleChange}
                  rows="4"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Tulis pesan sambutan singkat yang akan ditampilkan di card homepage (maksimal 100 karakter akan ditampilkan)"
                />
                <p className="mt-1 text-sm text-gray-500">
                  Pesan ini akan ditampilkan sebagai preview di card homepage. Untuk sambutan lengkap, gunakan halaman "About Management → Sambutan"
                </p>
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {saving ? (
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
    </div>
  );
};

export default KontakManagement;
