import { useState, useEffect, useRef } from 'react';
import api from '../../services/api';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import { useSchoolProfile } from '../../contexts/SchoolProfileContext';

const Kontak = () => {
  const { contact, socialMedia: socialMediaList, loading: contactLoading } = useSchoolProfile();
  const [navbarVisible, setNavbarVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const scrollTimeout = useRef(null);

  const [formData, setFormData] = useState({
    namaLengkap: '',
    email: '',
    pertanyaan: ''
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [submitStatus, setSubmitStatus] = useState(null);

  // Fallback defaults when contact data not yet loaded
  const contactInfo = contact || {
    address: 'Jl. Opak, Metuk, Tegalyoso, Dusun 1, Tegalyoso, Kec. Klaten Sel., Kabupaten Klaten, Jawa Tengah 57424',
    phone: '(0272) 325260',
    whatsapp: '08881082xx',
    email: 'smkrisma@sch.id',
    operatingHours: { weekdays: '07:00 - 16:00', saturday: '07:00 - 14:00', sunday: 'Tutup' },
    socialMedia: { instagram: '', facebook: '', youtube: '', twitter: '' },
    mapUrl: '',
    heroImage: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=1920&q=80'
  };

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      // Show navbar when at top
      if (currentScrollY < 100) {
        clearTimeout(scrollTimeout.current);
        setNavbarVisible(true);
      }
      // Hide navbar on scroll down
      else if (currentScrollY > lastScrollY && currentScrollY > 100) {
        clearTimeout(scrollTimeout.current);
        scrollTimeout.current = setTimeout(() => {
          setNavbarVisible(false);
        }, 300);
      }
      // Show navbar on scroll up
      else if (currentScrollY < lastScrollY) {
        clearTimeout(scrollTimeout.current);
        setNavbarVisible(true);
      }
      setLastScrollY(currentScrollY);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastScrollY]);

  // Form validation
  const validateForm = () => {
    const newErrors = {};

    if (!formData.namaLengkap.trim()) {
      newErrors.namaLengkap = 'Nama lengkap harus diisi';
    } else if (formData.namaLengkap.trim().length < 3) {
      newErrors.namaLengkap = 'Nama lengkap minimal 3 karakter';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email harus diisi';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Format email tidak valid';
    }

    if (!formData.pertanyaan.trim()) {
      newErrors.pertanyaan = 'Pertanyaan harus diisi';
    } else if (formData.pertanyaan.trim().length < 10) {
      newErrors.pertanyaan = 'Pertanyaan minimal 10 karakter';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setSubmitStatus(null);

    try {
      await new Promise(resolve => setTimeout(resolve, 2000));
      setSubmitStatus('success');
      setFormData({
        namaLengkap: '',
        email: '',
        pertanyaan: ''
      });

      setTimeout(() => {
        setSubmitStatus(null);
      }, 5000);
    } catch (error) {
      console.error('Error submitting form:', error);
      setSubmitStatus('error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar activePage="kontak" visible={navbarVisible} />

      {/* Hero Section with Image Background */}
      <section className="relative pt-16 h-[70vh] md:h-[75vh] flex items-center justify-center overflow-hidden">
        {/* Background Image with Overlay */}
        <div className="absolute inset-0">
          <img
            src={contactInfo.heroImage}
            alt="Contact Hero"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#0D76BE]/90 to-[#0D76BE]/70"></div>
        </div>

        {/* Hero Content */}
        <div className="relative z-10 max-w-[1400px] mx-auto px-6 lg:px-16 text-center text-white">
          <h1 className="text-4xl md:text-6xl font-bold mb-4 drop-shadow-lg">Hubungi Kami</h1>
          <p className="text-lg md:text-2xl text-white/90 max-w-2xl mx-auto drop-shadow">
            Kami siap membantu Anda. Jangan ragu untuk menghubungi kami kapan saja.
          </p>
        </div>
      </section>

      {/* Contact Info Cards - Left Aligned */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-[1400px] mx-auto px-6 lg:px-16">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Address Card */}
            <div className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <svg className="w-6 h-6 text-[#0D76BE]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2">Alamat</h3>
                  <p className="text-gray-600 text-sm leading-relaxed">
                    {contactInfo.address}
                  </p>
                </div>
              </div>
            </div>

            {/* Contact Card */}
            <div className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <svg className="w-6 h-6 text-[#0D76BE]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2">Telepon</h3>
                  <div className="text-gray-600 text-sm space-y-1">
                    <p className="font-semibold">{contactInfo.phone}</p>
                    <p>WA: {contactInfo.whatsapp}</p>
                    <p>{contactInfo.email}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Operating Hours Card */}
            <div className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <svg className="w-6 h-6 text-[#0D76BE]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2">Jam Operasional</h3>
                  <div className="text-gray-600 text-sm space-y-1">
                    <div className="flex justify-between">
                      <span className="font-medium">Sen - Jum</span>
                      <span>{contactInfo.operatingHours.weekdays}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium">Sabtu</span>
                      <span>{contactInfo.operatingHours.saturday}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium">Minggu</span>
                      <span className="text-red-600">{contactInfo.operatingHours.sunday}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Map and Form Section */}
      <section className="py-16 bg-white">
        <div className="max-w-[1400px] mx-auto px-6 lg:px-16">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Google Maps */}
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Lokasi Kami</h2>
              <div className="bg-gray-100 rounded-lg shadow-lg overflow-hidden h-[500px]">
                <iframe
                  src={contactInfo.mapUrl}
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  allowFullScreen=""
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  title="SMK Kristen 5 Klaten Location"
                ></iframe>
              </div>
            </div>

            {/* Contact Form */}
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Form untuk Bertanya</h2>

              {/* Success Message */}
              {submitStatus === 'success' && (
                <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-start gap-3">
                  <svg className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div>
                    <p className="text-green-800 font-semibold">Terima kasih!</p>
                    <p className="text-green-700 text-sm">Pesan Anda telah berhasil dikirim. Kami akan segera menghubungi Anda.</p>
                  </div>
                </div>
              )}

              {/* Error Message */}
              {submitStatus === 'error' && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
                  <svg className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div>
                    <p className="text-red-800 font-semibold">Terjadi kesalahan</p>
                    <p className="text-red-700 text-sm">Maaf, pesan Anda gagal dikirim. Silakan coba lagi.</p>
                  </div>
                </div>
              )}

              <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-lg p-6 space-y-5">
                {/* Nama Lengkap */}
                <div>
                  <label htmlFor="namaLengkap" className="block text-sm font-semibold text-gray-700 mb-2">
                    Nama Lengkap <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="namaLengkap"
                    name="namaLengkap"
                    value={formData.namaLengkap}
                    onChange={handleChange}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                      errors.namaLengkap ? 'border-red-500 bg-red-50' : 'border-gray-300'
                    }`}
                    placeholder="Masukkan nama lengkap Anda"
                  />
                  {errors.namaLengkap && (
                    <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      {errors.namaLengkap}
                    </p>
                  )}
                </div>

                {/* Email */}
                <div>
                  <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2">
                    Email <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                      errors.email ? 'border-red-500 bg-red-50' : 'border-gray-300'
                    }`}
                    placeholder="nama@email.com"
                  />
                  {errors.email && (
                    <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      {errors.email}
                    </p>
                  )}
                </div>

                {/* Pertanyaan */}
                <div>
                  <label htmlFor="pertanyaan" className="block text-sm font-semibold text-gray-700 mb-2">
                    Pertanyaan <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    id="pertanyaan"
                    name="pertanyaan"
                    value={formData.pertanyaan}
                    onChange={handleChange}
                    rows="6"
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none ${
                      errors.pertanyaan ? 'border-red-500 bg-red-50' : 'border-gray-300'
                    }`}
                    placeholder="Tulis pertanyaan atau pesan Anda di sini..."
                  ></textarea>
                  {errors.pertanyaan && (
                    <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      {errors.pertanyaan}
                    </p>
                  )}
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 bg-[#0d76be] hover:bg-[#0a5a91] text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      <span>Mengirim...</span>
                    </>
                  ) : (
                    <>
                      <span>Kirim</span>
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                      </svg>
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* Social Media Section - Bottom of Page */}
      {socialMediaList.filter(s => s.isActive).length > 0 && (
      <section className="py-16 bg-gray-50">
        <div className="max-w-[1400px] mx-auto px-6 lg:px-16">
          <div className="text-center mb-10">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Ikuti Kami di Sosial Media</h2>
            <p className="text-gray-600 text-lg">Tetap terhubung dengan kami melalui platform sosial media</p>
          </div>
          <div className="flex items-center justify-center gap-6 flex-wrap">
            {socialMediaList
              .filter(s => s.isActive)
              .sort((a, b) => (a.order || 0) - (b.order || 0))
              .map(social => (
                <a
                  key={social._id}
                  href={social.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex flex-col items-center gap-3 p-6 bg-white rounded-lg shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-1"
                >
                  <div className="w-16 h-16 rounded-lg overflow-hidden flex items-center justify-center group-hover:scale-110 transition-transform bg-gray-100">
                    <img src={social.icon} alt={social.name} className="w-full h-full object-cover" />
                  </div>
                  <span className="text-gray-700 font-semibold group-hover:text-blue-600 transition-colors">{social.name}</span>
                </a>
              ))}
          </div>
        </div>
      </section>
      )}

      <Footer />
    </div>
  );
};

export default Kontak;
