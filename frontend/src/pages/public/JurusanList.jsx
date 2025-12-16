import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useSchoolLogo } from '../../hooks/useContact';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001';

const JurusanList = () => {
  const navigate = useNavigate();
  const { logo: schoolLogo } = useSchoolLogo();
  const [jurusans, setJurusans] = useState([]);
  const [loading, setLoading] = useState(true);
  const horizontalSectionRef = useRef(null);
  const containerRef = useRef(null);

  // Navbar state
  const [navbarVisible, setNavbarVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    fetchJurusans();
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      setIsScrolled(currentScrollY > 50);

      if (currentScrollY > lastScrollY && currentScrollY > 100) {
        setNavbarVisible(false);
      } else {
        setNavbarVisible(true);
      }
      setLastScrollY(currentScrollY);

      // Horizontal scroll on vertical scroll
      if (horizontalSectionRef.current && containerRef.current) {
        const section = horizontalSectionRef.current;
        const container = containerRef.current;
        const sectionTop = section.offsetTop;
        const sectionHeight = section.offsetHeight;
        const scrollPosition = currentScrollY - sectionTop;

        // Calculate scroll range
        const maxScroll = container.scrollWidth - container.offsetWidth;

        // Only apply horizontal scroll when in section bounds
        if (scrollPosition >= 0 && scrollPosition <= sectionHeight) {
          const scrollPercent = scrollPosition / sectionHeight;
          const horizontalScroll = scrollPercent * maxScroll;
          container.scrollLeft = horizontalScroll;
        }
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastScrollY]);

  const fetchJurusans = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/jurusan/active`);
      setJurusans(response.data.data.jurusans || []);
    } catch (error) {
      console.error('Error fetching jurusans:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="relative">
          <div className="w-20 h-20 border-4 border-t-blue-600 border-r-purple-600 border-b-pink-600 border-l-cyan-600 rounded-full animate-spin"></div>
        </div>
      </div>
    );
  }

  // Calculate section height based on scroll distance needed
  const cardWidth = 500; // approximate card width
  const gap = 32;
  const totalWidth = jurusans.length * (cardWidth + gap);
  const sectionHeight = totalWidth * 1.5; // Multiply for smooth scrolling

  // Futuristic gradient backgrounds for each card
  const gradients = [
    'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', // Purple-Blue
    'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)', // Pink-Red
    'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)', // Cyan-Blue
    'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)', // Green-Cyan
    'linear-gradient(135deg, #fa709a 0%, #fee140 100%)', // Pink-Yellow
    'linear-gradient(135deg, #30cfd0 0%, #330867 100%)', // Cyan-Purple
    'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)', // Mint-Pink
    'linear-gradient(135deg, #ff9a56 0%, #ff6a88 100%)', // Orange-Pink
  ];

  return (
    <div className="bg-gray-50 font-sans">
      {/* Navbar - From Homepage */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        navbarVisible ? 'translate-y-0' : '-translate-y-full'
      } ${
        isScrolled ? 'bg-[#0D76BE] shadow-md' : 'bg-[#0D76BE]'
      }`}>
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16 md:h-20">
            <Link to="/" className="flex items-center gap-2 md:gap-3 z-50">
              <img
                src={schoolLogo}
                alt="SMK Kristen 5 Klaten"
                className="h-8 w-8 md:h-12 md:w-12 object-contain"
              />
              <div className="leading-tight">
                <div className="text-[10px] md:text-xs text-white">SEKOLAH MENENGAH KEJURUAN</div>
                <div className="text-sm md:text-lg font-bold text-white">KRISTEN 5 KLATEN</div>
              </div>
            </Link>

            <div className="hidden md:flex items-center gap-6 lg:gap-8">
              <Link to="/" className="text-white/80 hover:text-white transition-colors relative group">
                Beranda
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-yellow-400 group-hover:w-full transition-all duration-300"></span>
              </Link>
              <Link to="/jurusan" className="text-white font-semibold relative group">
                Jurusan
                <span className="absolute bottom-0 left-0 w-full h-0.5 bg-yellow-400"></span>
              </Link>
              <Link to="/artikel" className="text-white/80 hover:text-white transition-colors relative group">
                Artikel
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-yellow-400 group-hover:w-full transition-all duration-300"></span>
              </Link>
              <Link to="/kontak" className="text-white/80 hover:text-white transition-colors relative group">
                Kontak
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-yellow-400 group-hover:w-full transition-all duration-300"></span>
              </Link>
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
          <div
            className="fixed inset-0 bg-black/50 z-40 md:hidden"
            onClick={() => setIsMobileMenuOpen(false)}
          ></div>
          <div className="fixed top-0 right-0 h-full w-[280px] bg-[#0D76BE] z-50 md:hidden transform transition-transform duration-300 ease-in-out shadow-2xl">
            <div className="flex flex-col h-full">
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
                    className="block px-4 py-3 text-white bg-white/10 rounded-lg transition-colors font-medium"
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
              </nav>

              <div className="p-4 border-t border-white/20">
                <Link
                  to="/daftar"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="block w-full px-6 py-3 bg-yellow-400 hover:bg-yellow-500 text-white rounded-full font-medium text-center transition-colors"
                >
                  PENDAFTARAN
                </Link>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Hero Section */}
      <section className="pt-24 md:pt-32 pb-12 px-4 md:px-8 min-h-screen flex items-center">
        <div className="container mx-auto max-w-7xl text-center">
          <div className="mb-8 flex justify-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#0D76BE] rounded-full mb-6">
              <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
              <span className="text-sm font-medium text-white">Program Keahlian</span>
            </div>
          </div>

          <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold mb-6 leading-none tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 animate-gradient-x">
            KRISMA
          </h1>

          <p className="text-xl md:text-2xl text-gray-800 font-bold max-w-2xl mb-4 mx-auto">
            SMK KRISTEN 5 KLATEN BISA
          </p>
          <p className="text-base text-gray-600 max-w-xl mb-8 mx-auto">
            Pilih program keahlian yang sesuai dengan minat dan bakatmu
          </p>

          <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
            </svg>
            <span>Scroll down to explore</span>
          </div>
        </div>
      </section>

      {/* Horizontal Scroll Section - Controlled by vertical scroll */}
      <section
        ref={horizontalSectionRef}
        className="relative bg-gray-50"
        style={{ height: `${sectionHeight}px` }}
      >
        <div className="sticky top-0 h-screen flex items-center overflow-hidden py-16">
          <div
            ref={containerRef}
            className="flex gap-6 md:gap-8 px-4 md:px-8 overflow-x-hidden"
            style={{ paddingRight: '50vw' }}
          >
            {jurusans.map((jurusan, index) => (
              <Link
                key={jurusan._id}
                to={`/jurusan/${jurusan.slug}`}
                className="flex-shrink-0 w-[400px] md:w-[480px] group"
              >
                <div className="relative rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500 h-[360px] md:h-[400px]">
                  {/* Futuristic Gradient Background */}
                  <div
                    className="absolute inset-0"
                    style={{
                      background: gradients[index % gradients.length]
                    }}
                  >
                    {/* Overlay for text readability */}
                    <div className="absolute inset-0 bg-black/10"></div>
                  </div>

                  {/* Content Overlay */}
                  <div className="relative h-full flex flex-col justify-between p-6 md:p-8">
                    {/* Top Section - Logo/Code */}
                    <div className="flex items-start justify-between">
                      <div>
                        {jurusan.logo ? (
                          <img
                            src={jurusan.logo}
                            alt={jurusan.code}
                            className="h-12 w-12 object-contain drop-shadow-lg"
                          />
                        ) : (
                          <div className="h-12 w-12 bg-white/20 backdrop-blur-md rounded-lg flex items-center justify-center border border-white/30">
                            <span className="text-xl font-bold text-white">{jurusan.code.substring(0, 2)}</span>
                          </div>
                        )}
                      </div>
                      <div className="px-3 py-1 bg-white/20 backdrop-blur-md rounded-full border border-white/30">
                        <span className="text-xs font-semibold text-white">{jurusan.code}</span>
                      </div>
                    </div>

                    {/* Bottom Section - Title and CTA */}
                    <div>
                      <h2 className="text-3xl md:text-4xl font-bold text-white mb-3 leading-tight group-hover:translate-x-2 transition-transform duration-300 drop-shadow-lg">
                        {jurusan.name}
                      </h2>

                      <div className="flex items-center gap-2">
                        <span className="text-xs text-white/90">
                          Kepala Kejuruan
                        </span>
                        <div className="flex items-center gap-2">
                          <div className="w-5 h-5 bg-white/30 backdrop-blur-sm rounded-full border border-white/50"></div>
                          <span className="text-xs font-semibold text-white">{jurusan.headOfDepartment || 'Belum Ditentukan'}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Hover Arrow */}
                  <div className="absolute top-1/2 right-6 -translate-y-1/2 opacity-0 group-hover:opacity-100 group-hover:translate-x-0 translate-x-4 transition-all duration-300">
                    <div className="w-10 h-10 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center border border-white/30">
                      <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                      </svg>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
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

export default JurusanList;
