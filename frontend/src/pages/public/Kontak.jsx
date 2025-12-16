import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useSchoolLogo } from '../../hooks/useContact';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001';

const Kontak = () => {
  const navigate = useNavigate();
  const { logo: schoolLogo } = useSchoolLogo();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [navbarVisible, setNavbarVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [isScrolled, setIsScrolled] = useState(false);
  const scrollTimeout = useRef(null);

  const [formData, setFormData] = useState({
    namaLengkap: '',
    email: '',
    pertanyaan: ''
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [submitStatus, setSubmitStatus] = useState(null);
  const [contactLoading, setContactLoading] = useState(true);

  // Contact info state (fetched from API)
  const [contactInfo, setContactInfo] = useState({
    address: 'Jl. Opak, Metuk, Tegalyoso, Dusun 1, Tegalyoso, Kec. Klaten Sel., Kabupaten Klaten, Jawa Tengah 57424',
    phone: '(0272) 325260',
    whatsapp: '08881082xx',
    email: 'smkrisma@sch.id',
    operatingHours: {
      weekdays: '07:00 - 16:00',
      saturday: '07:00 - 14:00',
      sunday: 'Tutup'
    },
    socialMedia: {
      instagram: 'https://www.instagram.com/',
      facebook: 'https://www.facebook.com/',
      youtube: 'https://www.youtube.com/',
      twitter: 'https://www.twitter.com/'
    },
    mapUrl: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3953.6789!2d110.6078!3d-7.7123!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zN8KwNDInNDQuMyJTIDExMMKwMzYnMjguMSJF!5e0!3m2!1sen!2sid!4v1234567890',
    heroImage: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=1920&q=80'
  });

  // Fetch contact info on mount
  useEffect(() => {
    const fetchContactInfo = async () => {
      try {
        const response = await axios.get(`${API_URL}/api/contact`);
        if (response.data.success) {
          setContactInfo(response.data.data);
        }
      } catch (error) {
        console.error('Error fetching contact info:', error);
      } finally {
        setContactLoading(false);
      }
    };

    fetchContactInfo();
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      setIsScrolled(currentScrollY > 50);

      if (currentScrollY > lastScrollY && currentScrollY > 100) {
        clearTimeout(scrollTimeout.current);
        scrollTimeout.current = setTimeout(() => {
          setNavbarVisible(false);
        }, 500);
      } else {
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
      {/* Navbar - From Homepage */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        navbarVisible ? 'translate-y-0' : '-translate-y-full'
      } ${
        isScrolled ? 'bg-[#0D76BE] shadow-md' : 'bg-[#0D76BE]'
      }`}>
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16 md:h-20">
            <Link to="/" className="flex items-center gap-2 md:gap-3">
              <img
                src={schoolLogo}
                alt="SMK Kristen 5 Klaten"
                className="h-8 w-8 md:h-12 md:w-12 object-contain"
              />
              <div className="leading-tight">
                <div className="text-[10px] md:text-xs text-white">SEKOLAH MENENGAH KEJURUAN</div>
                <div className="text-sm md:text-lg font-bold text-white">KRISTEN 5 KLATEN</div>
                <div className="text-[10px] md:text-xs text-white/80">SMK Krisma Bisa</div>
              </div>
            </Link>

            <div className="hidden md:flex items-center gap-8">
              <Link to="/" className="text-white hover:text-yellow-400 transition-colors">Beranda</Link>
              <Link to="/jurusan" className="text-white hover:text-yellow-400 transition-colors">Jurusan</Link>
              <Link to="/artikel" className="text-white hover:text-yellow-400 transition-colors">Artikel</Link>
              <Link to="/kontak" className="text-white hover:text-yellow-400 transition-colors">Kontak</Link>
            </div>

            <div className="flex items-center gap-2 md:gap-4">
              <button
                onClick={() => navigate('/artikel')}
                className="hidden md:block p-1.5 md:p-2 rounded-full transition-colors hover:bg-white/10 text-white"
              >
                <svg className="w-4 h-4 md:w-5 md:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </button>
              <Link
                to="/daftar"
                className="hidden md:inline-block px-3 py-1.5 md:px-6 md:py-2.5 bg-yellow-400 hover:bg-yellow-500 text-white rounded-full font-medium transition-colors text-xs md:text-base"
              >
                PENDAFTARAN
              </Link>

              {/* Hamburger Menu Button - Mobile Only */}
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="md:hidden p-2 text-white focus:outline-none"
                aria-label="Toggle menu"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  {isMobileMenuOpen ? (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  ) : (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  )}
                </svg>
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Sidebar Menu */}
      {isMobileMenuOpen && (
        <>
          {/* Backdrop Overlay */}
          <div
            className="fixed inset-0 bg-black/50 z-40 md:hidden"
            onClick={() => setIsMobileMenuOpen(false)}
          ></div>

          {/* Sidebar */}
          <div className="fixed top-0 right-0 h-full w-[280px] bg-[#0D76BE] z-50 md:hidden transform transition-transform duration-300 ease-in-out shadow-2xl">
            <div className="flex flex-col h-full">
              {/* Sidebar Header */}
              <div className="flex items-center justify-between p-4 border-b border-white/20">
                <div className="flex items-center gap-2">
                  <img
                    src={schoolLogo}
                    alt="SMK Kristen 5 Klaten"
                    className="h-10 w-10 object-contain"
                  />
                  <div className="leading-tight">
                    <div className="text-sm font-bold text-white">SMK KRISTEN 5</div>
                    <div className="text-xs text-white/80">KLATEN</div>
                  </div>
                </div>
                <button
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="p-2 text-white hover:bg-white/10 rounded-full transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Menu Items */}
              <nav className="flex-1 overflow-y-auto p-4">
                <div className="space-y-2">
                  <Link
                    to="/"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="block px-4 py-3 text-white hover:bg-white/10 rounded-lg transition-colors font-medium"
                  >
                    Beranda
                  </Link>
                  <Link
                    to="/jurusan"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="block px-4 py-3 text-white hover:bg-white/10 rounded-lg transition-colors font-medium"
                  >
                    Jurusan
                  </Link>
                  <Link
                    to="/artikel"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="block px-4 py-3 text-white hover:bg-white/10 rounded-lg transition-colors font-medium"
                  >
                    Artikel
                  </Link>
                  <Link
                    to="/kontak"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="block px-4 py-3 text-white hover:bg-white/10 rounded-lg transition-colors font-medium"
                  >
                    Kontak
                  </Link>
                </div>

                {/* Search Bar */}
                <div className="mt-6">
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Cari..."
                      className="w-full px-4 py-3 pr-10 bg-white/10 text-white placeholder-white/60 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400"
                    />
                    <svg className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                </div>
              </nav>

              {/* Bottom Button */}
              <div className="p-4 border-t border-white/20">
                <Link
                  to="/daftar"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="block w-full px-6 py-3 bg-yellow-400 hover:bg-yellow-500 text-white text-center rounded-full font-bold transition-colors"
                >
                  PENDAFTARAN
                </Link>
              </div>
            </div>
          </div>
        </>
      )}

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
        <div className="relative z-10 container mx-auto px-4 text-center text-white">
          <h1 className="text-4xl md:text-6xl font-bold mb-4 drop-shadow-lg">Hubungi Kami</h1>
          <p className="text-lg md:text-2xl text-white/90 max-w-2xl mx-auto drop-shadow">
            Kami siap membantu Anda. Jangan ragu untuk menghubungi kami kapan saja.
          </p>
        </div>
      </section>

      {/* Contact Info Cards - Left Aligned */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
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
                  <h3 className="text-lg font-bold text-gray-900 mb-2">Kontak</h3>
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
        <div className="container mx-auto px-4">
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
                  className="w-full py-3 bg-[#0D76BE] hover:bg-[#0B5FA3] text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
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
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-10">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Ikuti Kami di Sosial Media</h2>
            <p className="text-gray-600 text-lg">Tetap terhubung dengan kami melalui platform sosial media</p>
          </div>

          <div className="flex items-center justify-center gap-6 flex-wrap">
            {/* Instagram */}
            {contactInfo.socialMedia.instagram && (
              <a
                href={contactInfo.socialMedia.instagram}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex flex-col items-center gap-3 p-6 bg-white rounded-lg shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-1"
              >
                <div className="w-16 h-16 bg-gradient-to-br from-purple-600 via-pink-600 to-orange-500 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                  <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                  </svg>
                </div>
                <span className="text-gray-700 font-semibold group-hover:text-pink-600 transition-colors">Instagram</span>
              </a>
            )}

            {/* Facebook */}
            {contactInfo.socialMedia.facebook && (
              <a
                href={contactInfo.socialMedia.facebook}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex flex-col items-center gap-3 p-6 bg-white rounded-lg shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-1"
              >
                <div className="w-16 h-16 bg-blue-600 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                  <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                  </svg>
                </div>
                <span className="text-gray-700 font-semibold group-hover:text-blue-600 transition-colors">Facebook</span>
              </a>
            )}

            {/* YouTube */}
            {contactInfo.socialMedia.youtube && (
              <a
                href={contactInfo.socialMedia.youtube}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex flex-col items-center gap-3 p-6 bg-white rounded-lg shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-1"
              >
                <div className="w-16 h-16 bg-red-600 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                  <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                  </svg>
                </div>
                <span className="text-gray-700 font-semibold group-hover:text-red-600 transition-colors">YouTube</span>
              </a>
            )}

            {/* Twitter */}
            {contactInfo.socialMedia.twitter && (
              <a
                href={contactInfo.socialMedia.twitter}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex flex-col items-center gap-3 p-6 bg-white rounded-lg shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-1"
              >
                <div className="w-16 h-16 bg-sky-500 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                  <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
                  </svg>
                </div>
                <span className="text-gray-700 font-semibold group-hover:text-sky-500 transition-colors">Twitter</span>
              </a>
            )}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-800 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
            <div>
              <div className="flex items-center gap-3 mb-6">
                <img
                  src={schoolLogo}
                  alt="SMK Kristen 5 Klaten"
                  className="h-16 w-16 object-contain"
                />
                <div>
                  <div className="text-2xl font-bold">SMK KRISTEN 5</div>
                  <div className="text-xl">KLATEN</div>
                </div>
              </div>
            </div>

            <div>
              <h4 className="text-lg font-semibold mb-4">Information</h4>
              <ul className="space-y-3">
                <li><Link to="/sejarah" className="hover:text-yellow-400 transition-colors underline">Sejarah</Link></li>
                <li><Link to="/sambutan" className="hover:text-yellow-400 transition-colors underline">Sambutan Kepala Sekolah</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="text-lg font-semibold mb-4">Penanggung Jawab</h4>
              <ul className="space-y-3">
                <li><Link to="/admin" className="hover:text-yellow-400 transition-colors underline">Admin Content</Link></li>
                <li><Link to="/login" className="hover:text-yellow-400 transition-colors underline">Login</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="text-lg font-semibold mb-4">Link lainnya</h4>
              <ul className="space-y-3">
                <li><a href="#" className="hover:text-yellow-400 transition-colors underline">Lowongan Kerja</a></li>
                <li><a href="#" className="hover:text-yellow-400 transition-colors underline">BKK Krisma</a></li>
              </ul>
            </div>
          </div>
        </div>
      </footer>

      {/* Copyright Section */}
      <div className="bg-[#0D76BE] text-white py-4">
        <div className="container mx-auto px-4">
          <div className="text-center text-sm">
            <p>&copy; {new Date().getFullYear()} SMK Kristen 5 Klaten. All rights reserved.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Kontak;
