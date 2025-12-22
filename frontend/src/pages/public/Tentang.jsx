import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import { useSchoolLogo } from '../../hooks/useContact';

const Tentang = () => {
  const [sections, setSections] = useState({
    sejarah: null,
    visiMisi: null,
  });
  const [contactInfo, setContactInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('sejarah');
  const { logo: schoolLogo } = useSchoolLogo();
  const [isScrolled, setIsScrolled] = useState(false);
  const [navbarVisible, setNavbarVisible] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const scrollTimeout = useRef(null);
  const lastScrollY = useRef(0);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      setIsScrolled(currentScrollY > 50);

      // Show navbar when at top
      if (currentScrollY < 100) {
        clearTimeout(scrollTimeout.current);
        setNavbarVisible(true);
      }
      // Hide navbar on scroll down
      else if (currentScrollY > lastScrollY.current && currentScrollY > 100) {
        clearTimeout(scrollTimeout.current);
        scrollTimeout.current = setTimeout(() => {
          setNavbarVisible(false);
        }, 300);
      }
      // Show navbar on scroll up
      else if (currentScrollY < lastScrollY.current) {
        clearTimeout(scrollTimeout.current);
        setNavbarVisible(true);
      }
      lastScrollY.current = currentScrollY;
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [sejarahRes, visiMisiRes, contactRes] = await Promise.all([
          api.get('/api/about/sejarah').catch(() => ({ data: { data: { about: null } } })),
          api.get('/api/about/visi-misi').catch(() => ({ data: { data: { about: null } } })),
          api.get('/api/contact').catch(() => ({ data: { data: null } })),
        ]);

        setSections({
          sejarah: sejarahRes.data.data.about,
          visiMisi: visiMisiRes.data.data.about,
        });
        setContactInfo(contactRes.data.data);
      } catch (error) {
        console.error('Error fetching about data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-white">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-primary-600 border-t-transparent mx-auto"></div>
          <p className="mt-4 text-gray-600">Memuat...</p>
        </div>
      </div>
    );
  }

  const tabs = [
    { id: 'sejarah', label: 'SEJARAH', data: sections.sejarah },
    { id: 'visi-misi', label: 'VISI & MISI', data: sections.visiMisi },
    { id: 'sambutan', label: 'SAMBUTAN', data: contactInfo?.principal }
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Navbar - From Homepage */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        navbarVisible ? 'translate-y-0' : '-translate-y-full'
      } ${
        isScrolled ? 'bg-[#0D76BE] shadow-md' : 'bg-transparent'
      }`}>
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16 md:h-20">
            <Link to="/" className="flex items-center gap-2 md:gap-3">
              <img
                src={schoolLogo}
                alt="Logo SMK Kristen 5 Klaten - SMK Krisma"
                className="h-8 w-8 md:h-12 md:w-12 object-contain"
                loading="eager"
              />
              <div className="leading-tight">
                <div className="text-[10px] md:text-xs text-white">SEKOLAH MENENGAH KEJURUAN</div>
                <div className="text-sm md:text-lg font-bold text-white">KRISTEN 5 KLATEN</div>
              </div>
            </Link>

            <div className="hidden md:flex items-center gap-8">
              <Link to="/" className="text-white hover:text-yellow-400 transition-colors">Beranda</Link>
              <Link to="/jurusan" className="text-white hover:text-yellow-400 transition-colors">Jurusan</Link>
              <Link to="/tentang" className="text-white hover:text-yellow-400 transition-colors">Tentang</Link>
              <Link to="/artikel" className="text-white hover:text-yellow-400 transition-colors">Artikel</Link>
              <Link to="/kontak" className="text-white hover:text-yellow-400 transition-colors">Kontak</Link>
            </div>

            <div className="flex items-center gap-2 md:gap-4">
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
                    to="/tentang"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="block px-4 py-3 text-white hover:bg-white/10 rounded-lg transition-colors font-medium"
                  >
                    Tentang
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

                {/* CTA Button */}
                <div className="mt-6">
                  <Link
                    to="/daftar"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="block w-full px-6 py-3 bg-yellow-400 hover:bg-yellow-500 text-gray-900 rounded-full font-bold text-center transition-colors"
                  >
                    PENDAFTARAN
                  </Link>
                </div>
              </nav>
            </div>
          </div>
        </>
      )}

      {/* Hero Section - From Kontak */}
      <section className="relative pt-16 h-[70vh] md:h-[75vh] flex items-center justify-center overflow-hidden">
        {/* Background Image with Overlay */}
        <div className="absolute inset-0">
          <img
            src={sections.sejarah?.image || 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=1920&h=1080&fit=crop'}
            alt="Tentang SMK Kristen 5 Klaten"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#0D76BE]/90 to-[#0D76BE]/70"></div>
        </div>

        {/* Hero Content */}
        <div className="relative z-10 container mx-auto px-4 text-center text-white">
          <h1 className="text-4xl md:text-6xl font-bold mb-4 drop-shadow-lg">TENTANG KAMI</h1>
          <p className="text-lg md:text-2xl text-white/90 max-w-2xl mx-auto drop-shadow">
            Mengenal lebih dekat SMK Kristen 5 Klaten - Sejarah, Visi, Misi, dan Sambutan Kepala Sekolah
          </p>
        </div>
      </section>

      {/* Tabs Section */}
      <section className={`sticky z-40 bg-white border-b border-gray-200 shadow-sm transition-all duration-300 ${
        navbarVisible ? 'top-16 md:top-20' : 'top-0'
      }`}>
        <div className="container mx-auto px-4">
          <div className="flex overflow-x-auto">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-6 py-4 text-sm md:text-base font-semibold whitespace-nowrap transition-all ${
                  activeTab === tab.id
                    ? 'text-[#0D76BE] border-b-2 border-[#0D76BE]'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Content Sections */}
      <section className="py-12 md:py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">

            {/* Sejarah Tab */}
            {activeTab === 'sejarah' && sections.sejarah && (
              <div>
                <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-6">
                  {sections.sejarah.title}
                </h2>

                {sections.sejarah.image && (
                  <div className="mb-8">
                    <img
                      src={sections.sejarah.image}
                      alt={sections.sejarah.title}
                      className="w-full h-auto rounded-lg"
                    />
                  </div>
                )}

                <div
                  className="prose prose-lg max-w-none text-gray-700 leading-relaxed"
                  dangerouslySetInnerHTML={{ __html: sections.sejarah.content }}
                />
              </div>
            )}

            {/* Visi Misi Tab */}
            {activeTab === 'visi-misi' && sections.visiMisi && (
              <div>
                <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-6">
                  {sections.visiMisi.title}
                </h2>

                {sections.visiMisi.image && (
                  <div className="mb-8">
                    <img
                      src={sections.visiMisi.image}
                      alt={sections.visiMisi.title}
                      className="w-full h-auto rounded-lg"
                    />
                  </div>
                )}

                <div
                  className="prose prose-lg max-w-none text-gray-700 leading-relaxed"
                  dangerouslySetInnerHTML={{ __html: sections.visiMisi.content }}
                />
              </div>
            )}

            {/* Sambutan Tab */}
            {activeTab === 'sambutan' && contactInfo?.principal && (
              <div>
                <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-6">
                  Sambutan Kepala Sekolah
                </h2>

                {/* Principal Photo and Info */}
                <div className="mb-8">
                  <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
                    {contactInfo.principal.photo && (
                      <div className="flex-shrink-0">
                        <img
                          src={contactInfo.principal.photo}
                          alt={contactInfo.principal.name || 'Kepala Sekolah'}
                          className="w-48 h-48 object-cover rounded-lg"
                        />
                      </div>
                    )}
                    <div className="flex-1 text-center md:text-left">
                      <h3 className="text-xl font-bold text-gray-900 mb-1">
                        {contactInfo.principal.name}
                      </h3>
                      <p className="text-base text-gray-600">
                        {contactInfo.principal.title}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="prose prose-lg max-w-none text-gray-700 leading-relaxed whitespace-pre-wrap">
                  {contactInfo.principal.message}
                </div>

                <div className="mt-8 text-right pt-6 border-t border-gray-200">
                  <p className="text-gray-900 font-semibold">
                    {contactInfo.principal.name}
                  </p>
                  <p className="text-gray-600 text-sm">{contactInfo.principal.title}</p>
                </div>
              </div>
            )}

          </div>
        </div>
      </section>

      {/* Footer - From Homepage */}
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

export default Tentang;
