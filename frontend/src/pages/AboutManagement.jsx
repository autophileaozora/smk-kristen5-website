import { useState, useEffect } from 'react';
import api from '../services/api';
import ImageUpload from '../components/ImageUpload';

const AboutManagement = ({ embedded = false, saveTrigger = 0 }) => {
  // ========== CONTACT STATE ==========
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
    mapUrl: '',
    heroImage: '',
    schoolLogo: '',
  });

  // ========== SHARED STATE ==========
  const [toast, setToast] = useState(null);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  // ========== DATA FETCHING ==========
  useEffect(() => {
    fetchContactInfo();
  }, []);

  const fetchContactInfo = async () => {
    try {
      setContactLoading(true);
      const response = await api.get('/api/contact');
      const data = response.data.data;
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
        mapUrl: data.mapUrl || '',
        heroImage: data.heroImage || '',
        schoolLogo: data.schoolLogo || '',
      });
    } catch (error) {
      showToast(error.response?.data?.message || 'Gagal memuat informasi kontak', 'error');
      console.error('Error fetching contact info:', error);
    } finally {
      setContactLoading(false);
    }
  };

  // ========== CONTACT HANDLERS ==========
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
    } else {
      setContactFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const doContactSave = async () => {
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

  const handleContactSubmit = async (e) => {
    e.preventDefault();
    await doContactSave();
  };

  useEffect(() => {
    if (saveTrigger > 0) doContactSave();
  }, [saveTrigger]);

  // ========== CONTACT FORM ==========
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
      <div>
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

        </form>
      </div>
    );
  };

  // ========== MAIN RENDER ==========
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
        <p className="text-gray-600 mt-2">Kelola informasi kontak sekolah</p>
      </div>
      )}

      {renderContactTab()}
    </div>
  );
};

export default AboutManagement;
