import { useState, useEffect, useRef, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { useSchoolLogo } from '../../hooks/useContact';

const HomepageFixed = () => {
  const navigate = useNavigate();
  const { logo: schoolLogo } = useSchoolLogo();

  const [data, setData] = useState({
    runningTexts: [],
    jurusans: [],
    prestasis: [],
    ekskuls: [],
    alumnis: [],
    videoHero: null,
  });
  const [loading, setLoading] = useState(true);
  const [isScrolled, setIsScrolled] = useState(false);
  const [navbarVisible, setNavbarVisible] = useState(true);
  const [expandedEkskul, setExpandedEkskul] = useState(0);
  const [invitingSectionProgress, setInvitingSectionProgress] = useState(0);
  const [parallaxOffset, setParallaxOffset] = useState(0);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showSearchModal, setShowSearchModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isPrestasiPaused, setIsPrestasiPaused] = useState(false);
  const [isTestimoniPaused, setIsTestimoniPaused] = useState(false);
  const lastScrollY = useRef(0);
  const scrollTimeout = useRef(null);
  const jurusanSectionRef = useRef(null);
  const jurusanCardsRef = useRef(null);
  const invitingSectionRef = useRef(null);
  const row2Ref = useRef(null);
  const prestasiRef = useRef(null);
  const testimoniRef = useRef(null);
  const isDragging = useRef(false);
  const startX = useRef(0);
  const scrollLeft = useRef(0);

  useEffect(() => {
    // Add global styles to hide scrollbar and infinite scroll animation
    const style = document.createElement('style');
    style.textContent = `
      ::-webkit-scrollbar {
        width: 0px;
        height: 0px;
      }
      * {
        scrollbar-width: none;
        -ms-overflow-style: none;
      }
      @keyframes scroll-left {
        0% {
          transform: translateX(0);
        }
        100% {
          transform: translateX(-33.333%);
        }
      }
      @keyframes scroll-right {
        0% {
          transform: translateX(-33.333%);
        }
        100% {
          transform: translateX(0);
        }
      }
      .animate-scroll-left {
        animation: scroll-left 20s linear infinite;
      }
      .animate-scroll-right {
        animation: scroll-right 20s linear infinite;
      }
      .paused {
        animation-play-state: paused !important;
      }
      .dragging {
        cursor: grabbing !important;
        user-select: none;
      }
      .draggable {
        cursor: grab;
      }
    `;
    document.head.appendChild(style);

    return () => {
      document.head.removeChild(style);
    };
  }, []);

  useEffect(() => {
    fetchData();

    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      // Navbar visibility logic
      setIsScrolled(currentScrollY > 50);

      // Hide navbar when scrolling down with longer delay (500ms)
      if (currentScrollY > lastScrollY.current && currentScrollY > 100) {
        clearTimeout(scrollTimeout.current);
        scrollTimeout.current = setTimeout(() => {
          setNavbarVisible(false);
        }, 500);
      } else {
        clearTimeout(scrollTimeout.current);
        setNavbarVisible(true);
      }

      // Calculate inviting section scroll progress
      const invitingSection = invitingSectionRef.current;
      if (invitingSection) {
        const rect = invitingSection.getBoundingClientRect();
        const windowHeight = window.innerHeight;
        const sectionHeight = rect.height;

        // Section enters viewport at bottom (rect.top = windowHeight)
        // Section exits viewport at top (rect.bottom = 0)
        const totalScrollDistance = windowHeight + sectionHeight;
        const scrolled = windowHeight - rect.top;

        let progress = (scrolled / totalScrollDistance) * 100;
        progress = Math.max(0, Math.min(100, progress));

        setInvitingSectionProgress(progress);
      }

      // Calculate parallax offset for row 2
      const row2 = row2Ref.current;
      if (row2) {
        const rect = row2.getBoundingClientRect();
        const windowHeight = window.innerHeight;

        // Calculate parallax effect when element is in viewport
        if (rect.top < windowHeight && rect.bottom > 0) {
          const parallax = (windowHeight - rect.top) * 0.5; // 0.5 is the parallax speed
          setParallaxOffset(parallax);
        }
      }

      lastScrollY.current = currentScrollY;
    };

    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      window.removeEventListener('scroll', handleScroll);
      clearTimeout(scrollTimeout.current);
    };
  }, [data.jurusans.length]);

  const fetchData = async () => {
    try {
      setLoading(true);

      const [runningTextRes, jurusanRes, prestasiRes, ekskulRes, alumniRes, videoRes] = await Promise.all([
        api.get('/api/running-text/active').catch(() => ({ data: { data: { runningTexts: [] } } })),
        api.get('/api/jurusan').catch(() => ({ data: { data: { jurusans: [] } } })),
        api.get('/api/prestasi').catch(() => ({ data: { data: { prestasis: [] } } })),
        api.get('/api/ekskul/active').catch(() => ({ data: { data: { ekskuls: [] } } })),
        api.get('/api/alumni/featured').catch(() => ({ data: { data: { alumnis: [] } } })),
        api.get('/api/video-hero/active').catch(() => ({ data: { data: { videoHero: null } } })),
      ]);

      // Backend returns "alumni" not "alumnis"
      const alumniData = alumniRes.data.data.alumni || alumniRes.data.data.alumnis || [];

      // Backend returns "videos" array, get first active video
      const videoHeroData = videoRes.data.data.videos?.[0] || videoRes.data.data.videoHero || null;

      setData({
        runningTexts: runningTextRes.data.data.runningTexts || [],
        jurusans: (jurusanRes.data.data.jurusans || []).filter(j => j.isActive),
        prestasis: (prestasiRes.data.data.prestasis || []).slice(0, 6),
        ekskuls: ekskulRes.data.data.ekskuls || [],
        alumnis: alumniData,
        videoHero: videoHeroData,
      });
    } catch (err) {
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  // Check if prestasi needs scrolling (more cards than can fit in viewport)
  const prestasiNeedsScroll = data.prestasis.length > 3;

  // Auto-scroll effect for Prestasi
  useEffect(() => {
    if (!prestasiRef.current || isPrestasiPaused || !prestasiNeedsScroll) return;

    const scrollContainer = prestasiRef.current;
    let animationId;

    const scroll = () => {
      if (scrollContainer && !isPrestasiPaused) {
        scrollContainer.scrollLeft += 1;

        // Reset scroll when reaching 1/3 point (seamless loop)
        const maxScroll = scrollContainer.scrollWidth / 3;
        if (scrollContainer.scrollLeft >= maxScroll) {
          scrollContainer.scrollLeft = 0;
        }
      }
      animationId = requestAnimationFrame(scroll);
    };

    animationId = requestAnimationFrame(scroll);
    return () => cancelAnimationFrame(animationId);
  }, [isPrestasiPaused, prestasiNeedsScroll]);

  // Auto-scroll effect for Testimoni
  useEffect(() => {
    if (!testimoniRef.current || isTestimoniPaused || data.alumnis.length === 0) return;

    const scrollContainer = testimoniRef.current;
    let animationId;

    const scroll = () => {
      if (scrollContainer && !isTestimoniPaused) {
        scrollContainer.scrollLeft += 1;

        const maxScroll = scrollContainer.scrollWidth / 3;
        if (scrollContainer.scrollLeft >= maxScroll) {
          scrollContainer.scrollLeft = 0;
        }
      }
      animationId = requestAnimationFrame(scroll);
    };

    animationId = requestAnimationFrame(scroll);
    return () => cancelAnimationFrame(animationId);
  }, [isTestimoniPaused, data.alumnis.length]);

  // Drag and Press handlers
  const handleMouseDown = (e, ref, setPaused) => {
    if (!ref.current) return;
    isDragging.current = true;
    startX.current = e.pageX;
    scrollLeft.current = ref.current.scrollLeft;
    setPaused(true);
    ref.current.style.cursor = 'grabbing';
  };

  const handleTouchStart = (e, ref, setPaused) => {
    if (!ref.current) return;
    isDragging.current = true;
    startX.current = e.touches[0].pageX;
    scrollLeft.current = ref.current.scrollLeft;
    setPaused(true);
  };

  const handleMouseMove = (e, ref) => {
    if (!isDragging.current || !ref.current) return;
    e.preventDefault();
    const x = e.pageX;
    const walk = (x - startX.current) * 2;
    ref.current.scrollLeft = scrollLeft.current - walk;
  };

  const handleTouchMove = (e, ref) => {
    if (!isDragging.current || !ref.current) return;
    const x = e.touches[0].pageX;
    const walk = (x - startX.current) * 2;
    ref.current.scrollLeft = scrollLeft.current - walk;
  };

  const handleMouseUp = (ref, setPaused) => {
    if (!ref.current) return;
    isDragging.current = false;
    setPaused(false);
    ref.current.style.cursor = 'grab';
  };

  const handleTouchEnd = (setPaused) => {
    isDragging.current = false;
    setPaused(false);
  };

  return (
    <div className="min-h-screen bg-white font-poppins overflow-x-hidden">
      {/* Navbar - Transparent at hero, blue when scrolled */}
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
                onClick={() => setShowSearchModal(true)}
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

      {/* Hero Section - FIXED: Video Hero Support (YouTube) */}
      <section className="relative min-h-screen flex items-center overflow-hidden">
        <div className="absolute inset-0 overflow-hidden">
          {data.videoHero && data.videoHero.youtubeId ? (
            <>
              <iframe
                className="pointer-events-none border-0"
                src={`https://www.youtube.com/embed/${data.videoHero.youtubeId}?autoplay=1&mute=1&loop=1&playlist=${data.videoHero.youtubeId}&controls=0&showinfo=0&rel=0&modestbranding=1&playsinline=1`}
                title="Hero Video"
                allow="autoplay; encrypted-media"
                style={{
                  position: 'absolute',
                  top: '50%',
                  left: '50%',
                  width: '177.77777778vh',
                  height: '56.25vw',
                  minHeight: '100%',
                  minWidth: '100%',
                  transform: 'translate(-50%, -50%)',
                }}
              />
              <div className="absolute inset-0 bg-black/40 pointer-events-none"></div>
            </>
          ) : (
            <>
              <img
                src="https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=1920&h=1080&fit=crop"
                alt="Hero"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-black/40"></div>
            </>
          )}
        </div>

        <div className="relative container mx-auto px-4 pt-20 z-10">
          <div className="max-w-4xl">
            {/* Teks dan elemen di atas video dihapus */}
          </div>
        </div>
      </section>

      {/* Running Text - Below hero section */}
      {data.runningTexts.length > 0 && (
        <div className="bg-[#0D76BE] py-3 overflow-hidden">
          <div className="animate-marquee-fast whitespace-nowrap">
            {[...data.runningTexts, ...data.runningTexts, ...data.runningTexts].map((text, index) => (
              <span key={index} className="text-white mx-8 text-sm font-medium">
                ● {text.text}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Kompetensi Jurusan - Simple Grid */}
      {data.jurusans.length > 0 && (
        <section
          ref={jurusanSectionRef}
          data-section="jurusan"
          className="relative bg-white py-20"
        >
          <div className="container mx-auto px-4">
            <div className="mb-8 md:mb-12">
              <h2 className="text-3xl md:text-5xl font-bold text-gray-800 mb-1" style={{ fontFamily: 'Russo One, sans-serif' }}>KOMPETENSI JURUSAN</h2>
              <p className="text-gray-600 uppercase text-xs md:text-sm tracking-wide">
                PILIH JURUSAN YANG SESUAI DENGAN BAKAT & MINAT ANDA
              </p>
            </div>

            {loading ? (
              <div className="text-center py-20">
                <div className="inline-block w-12 h-12 border-4 border-yellow-400 border-t-transparent rounded-full animate-spin"></div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                {data.jurusans.map((jurusan, index) => (
                  <Link
                    key={jurusan._id}
                    to={`/jurusan/${jurusan.slug}`}
                    className="relative aspect-square rounded-xl md:rounded-2xl overflow-hidden group transition-all duration-300 cursor-pointer hover:shadow-2xl"
                  >
                    <div
                      className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-110"
                      style={{
                        backgroundImage: jurusan.backgroundImage
                          ? `url(${jurusan.backgroundImage})`
                          : 'url(https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=350&h=450&fit=crop)',
                      }}
                    >
                      <div className="absolute inset-0 bg-[#0D76BE]/40"></div>
                    </div>

                    <div className="relative h-full p-4 md:p-6 flex flex-col justify-between">
                      <div className="flex items-start gap-2 md:gap-3">
                        <div className="bg-gray-900 px-2 py-1 md:px-3 md:py-2 rounded-lg shadow-lg">
                          <div className="text-white text-base md:text-xl font-bold leading-none">
                            {String(index + 1).padStart(2, '0')}
                          </div>
                        </div>
                        <div className="text-white text-[10px] md:text-xs uppercase font-bold leading-tight">
                          JURUSAN<br />
                          <span className="text-white text-xs md:text-sm">{jurusan.code || 'TKJ'}</span>
                        </div>
                      </div>

                      <div>
                        <h3 className="text-lg md:text-2xl font-bold text-white mb-2 leading-tight">
                          {jurusan.name.toUpperCase()}
                        </h3>

                        <div className="flex flex-wrap gap-2 mb-3">
                          {jurusan.competencies && jurusan.competencies.length > 0 ? (
                            jurusan.competencies.slice(0, 3).map((comp, idx) => (
                              <span key={idx} className="text-yellow-400 text-xs font-bold uppercase">
                                #{comp.replace(/\s+/g, '')}
                              </span>
                            ))
                          ) : (
                            <>
                              <span className="text-yellow-400 text-xs font-bold">#TECHNOLOGY</span>
                              <span className="text-yellow-400 text-xs font-bold">#NETWORK</span>
                              <span className="text-yellow-400 text-xs font-bold">#ADMINISTRATOR</span>
                            </>
                          )}
                        </div>

                        <div className="inline-flex items-center gap-2 text-white font-bold text-base group-hover:text-yellow-400 transition-all opacity-0 group-hover:opacity-100">
                          <span>DAFTAR</span>
                          <svg className="w-5 h-5 transition-transform group-hover:translate-x-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                          </svg>
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </section>
      )}

      {/* Inviting Section - 3 Rows with Parallax Background */}
      <section ref={invitingSectionRef} className="h-screen flex flex-col relative overflow-hidden">
        {/* Parallax Background - Fixed to section */}
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: 'url(https://images.unsplash.com/photo-1502086223501-7ea6ecd79368?w=1920&h=600&fit=crop)',
            transform: `translateY(${parallaxOffset}px)`,
            height: '150%',
            top: '-25%',
            backgroundPosition: 'center center'
          }}
        />

        {/* Row 1: Black background with 2 columns - 22vh */}
        <div className="bg-black flex-shrink-0 relative z-10" style={{ height: '22vh' }}>
          <div className="container mx-auto px-4 h-full flex items-start pt-4 md:pt-8">
            <div className="grid grid-cols-1 md:grid-cols-10 gap-4 md:gap-12 w-full">
              <div className="text-white md:col-span-4">
                <h3 className="text-lg md:text-3xl font-bold leading-tight">
                  RAGU ATAU BELUM TAU MINAT BAKAT KAMU?
                </h3>
              </div>
              <div className="text-white md:col-span-6">
                <p className="text-sm md:text-lg leading-relaxed">
                  KAMI MENYEDIAKAN PLATFORM AGAR ANDA BISA MENEMUKAN BAKAT MINAT SESUAI PASSION ANDA
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Row 2: Transparent to show parallax background - 66vh */}
        <div
          ref={row2Ref}
          className="relative flex-shrink-0 z-10"
          style={{
            height: '66vh'
          }}
        >
          <div className="absolute inset-0 bg-black/30"></div>

          <div className="relative container mx-auto px-4 h-full flex items-center justify-center">
            <div className="max-w-4xl mx-auto text-center">
              <h2 className="text-xl md:text-4xl font-bold text-white mb-4 md:mb-8 leading-tight">
                MARI DISKUSIKAN BAKAT & MINAT KAMU,<br />
                KAMI AKAN MEMBANTU MENEMUKAN SESUAI<br />
                PASSION ANDA
              </h2>

              <Link
                to="/daftar"
                className="inline-block px-6 py-2.5 md:px-12 md:py-4 bg-yellow-400 hover:bg-yellow-500 text-white rounded-full font-bold text-sm md:text-lg transition-colors"
              >
                PENDAFTARAN
              </Link>
            </div>
          </div>
        </div>

        {/* Row 3: Black background with loading bar - 12vh */}
        <div className="bg-black flex-shrink-0 relative z-10" style={{ height: '12vh' }}>
          <div className="container mx-auto px-4 h-full flex items-center">
            {/* Loading bar - full width with container padding */}
            <div className="w-full">
              {/* Progress bar */}
              <div className="w-full h-3 bg-gray-800 overflow-hidden">
                <div
                  className="h-full bg-yellow-400 transition-all duration-300"
                  style={{ width: `${invitingSectionProgress}%` }}
                ></div>
              </div>
            </div>
          </div>
          {/* Loading text - bottom right corner with yellow color */}
          <p className="absolute bottom-4 right-8 text-yellow-400 font-semibold text-lg">
            {Math.round(invitingSectionProgress)}%
          </p>
        </div>
      </section>

      {/* Prestasi - Conditional auto-scroll */}
      <section className="py-20 bg-cream overflow-hidden">
        <div className="container mx-auto px-4 mb-12">
          <h2 className="text-3xl md:text-5xl font-bold text-gray-800 mb-1" style={{ fontFamily: 'Russo One, sans-serif' }}>PRESTASI</h2>
          <p className="text-xs md:text-base text-gray-700 mb-6 md:mb-8 max-w-4xl leading-relaxed">
            KAMI SUDAH MEMENANGKAN PENGHARGAAN DAN LOMBA YANG DIIKUTI OLEH SISWA-SISWA TERBAIK SMK KRISTEN 5 KLATEN
          </p>
        </div>

        {loading ? (
          <div className="text-center py-20">
            <div className="inline-block w-12 h-12 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : data.prestasis.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-2xl container mx-auto">
            <div className="text-5xl mb-4">🏆</div>
            <p className="text-gray-600">Belum ada data prestasi</p>
          </div>
        ) : (
          <div
            ref={prestasiRef}
            className="overflow-x-scroll"
            style={{
              cursor: 'grab',
              scrollbarWidth: 'none',
              msOverflowStyle: 'none',
              WebkitOverflowScrolling: 'touch'
            }}
            onMouseDown={(e) => handleMouseDown(e, prestasiRef, setIsPrestasiPaused)}
            onMouseMove={(e) => handleMouseMove(e, prestasiRef)}
            onMouseUp={() => handleMouseUp(prestasiRef, setIsPrestasiPaused)}
            onMouseLeave={() => handleMouseUp(prestasiRef, setIsPrestasiPaused)}
            onTouchStart={(e) => handleTouchStart(e, prestasiRef, setIsPrestasiPaused)}
            onTouchMove={(e) => handleTouchMove(e, prestasiRef)}
            onTouchEnd={() => handleTouchEnd(setIsPrestasiPaused)}
          >
            {prestasiNeedsScroll ? (
              <div className="flex gap-4 md:gap-6"
              >
                {[...data.prestasis, ...data.prestasis, ...data.prestasis].map((prestasi, index) => (
                  <div
                    key={`${prestasi._id}-${index}`}
                    className="flex-shrink-0 w-[280px] h-[280px] md:w-[400px] md:h-[400px] bg-gray-800 rounded-xl md:rounded-2xl overflow-hidden flex flex-col p-4 md:p-6 text-white"
                  >
                    {/* Zona A: Header Identitas */}
                    <div className="text-xs md:text-sm font-normal mb-1 md:mb-2">
                      {String(index % data.prestasis.length + 1).padStart(3, '0')} {prestasi.students || 'SISWA SMK'}, {prestasi.level?.toUpperCase() || '2024'}
                    </div>

                    {/* Separator */}
                    <div className="w-full h-px bg-white/30 mb-2 md:mb-3"></div>

                    {/* Zona B: Judul Prestasi Utama */}
                    <h3 className="text-sm md:text-lg font-bold leading-tight mb-2 md:mb-3">
                      {prestasi.title.toUpperCase()}
                    </h3>

                    {/* Zona C: Gambar Ilustrasi (Landscape) */}
                    <div className="w-full h-[120px] md:h-[180px] mb-2 md:mb-3">
                      <img
                        src={prestasi.image || 'https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?w=800&h=600&fit=crop'}
                        alt={prestasi.title}
                        className="w-full h-full object-cover"
                      />
                    </div>

                    {/* Zona D: Keterangan Proyek */}
                    <p className="text-xs md:text-sm font-normal line-clamp-2 md:line-clamp-3">
                      {prestasi.description?.toUpperCase() || 'PRESTASI LUAR BIASA DARI SISWA SMK KRISTEN 5 KLATEN'}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="container mx-auto px-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {data.prestasis.map((prestasi, index) => (
                    <div
                      key={prestasi._id}
                      className="w-full aspect-square bg-gray-800 rounded-xl md:rounded-2xl overflow-hidden flex flex-col p-4 md:p-6 text-white"
                    >
                      {/* Zona A: Header Identitas */}
                      <div className="text-xs md:text-sm font-normal mb-1 md:mb-2">
                        {String(index + 1).padStart(3, '0')} {prestasi.students || 'SISWA SMK'}, {prestasi.level?.toUpperCase() || '2024'}
                      </div>

                      {/* Separator */}
                      <div className="w-full h-px bg-white/30 mb-2 md:mb-3"></div>

                      {/* Zona B: Judul Prestasi Utama */}
                      <h3 className="text-sm md:text-lg font-bold leading-tight mb-2 md:mb-3">
                        {prestasi.title.toUpperCase()}
                      </h3>

                      {/* Zona C: Gambar Ilustrasi (Landscape) */}
                      <div className="w-full h-[45%] mb-2 md:mb-3">
                        <img
                          src={prestasi.image || 'https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?w=800&h=600&fit=crop'}
                          alt={prestasi.title}
                          className="w-full h-full object-cover"
                        />
                      </div>

                      {/* Zona D: Keterangan Proyek */}
                      <p className="text-xs md:text-sm font-normal line-clamp-2 md:line-clamp-3">
                        {prestasi.description?.toUpperCase() || 'PRESTASI LUAR BIASA DARI SISWA SMK KRISTEN 5 KLATEN'}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </section>

      {/* Ekstrakurikuler */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-5xl font-bold text-gray-800 mb-8 md:mb-16 text-right" style={{ fontFamily: 'Russo One, sans-serif' }}>EKSTRAKURIKULER</h2>

          {loading ? (
            <div className="text-center py-20">
              <div className="inline-block w-12 h-12 border-4 border-yellow-400 border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : data.ekskuls.length === 0 ? (
            <div className="text-center py-20 bg-gray-50 rounded-2xl">
              <div className="text-5xl mb-4">🎯</div>
              <p className="text-gray-600">Belum ada data ekstrakurikuler</p>
            </div>
          ) : (
            <div className="w-full md:w-4/5 md:ml-auto space-y-4 md:space-y-6">
              {data.ekskuls.map((ekskul, index) => (
                <div key={ekskul._id}>
                  <button
                    onClick={() => setExpandedEkskul(expandedEkskul === index ? -1 : index)}
                    className="w-full flex items-center justify-between py-4 md:py-8 text-left group border-b border-gray-200 focus:outline-none"
                  >
                    <div className="flex items-center gap-3 md:gap-6">
                      <span className="text-gray-400 text-sm md:text-lg font-bold">
                        {String(index + 1).padStart(3, '0')}
                      </span>
                      <h3 className="text-base md:text-2xl font-bold text-gray-800 group-hover:text-yellow-400 transition-colors">
                        {ekskul.name.toUpperCase()}
                      </h3>
                    </div>
                    <div className="text-2xl md:text-4xl text-gray-400">
                      {expandedEkskul === index ? '−' : '+'}
                    </div>
                  </button>

                  {expandedEkskul === index && (
                    <div className="py-4 md:py-8">
                      <div className="flex flex-col md:flex-row gap-4 md:gap-8">
                        {ekskul.image && (
                          <img
                            src={ekskul.image}
                            alt={ekskul.name}
                            className="w-full md:w-64 h-48 object-cover rounded-lg flex-shrink-0"
                          />
                        )}
                        <div className="flex-1">
                          <p className="text-sm md:text-base text-gray-700 mb-3 md:mb-4 leading-relaxed">{ekskul.description}</p>
                          <div className="space-y-2 text-xs md:text-sm text-gray-600">
                            {ekskul.schedule && (
                              <div>
                                <span className="font-semibold">JADWAL : </span>
                                <span>{ekskul.schedule}</span>
                              </div>
                            )}
                            {ekskul.location && (
                              <div>
                                <span className="font-semibold">DRESSCODE : </span>
                                <span>{ekskul.location}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Testimoni Alumni - 2 Rows with Infinite Scroll */}
      <section className="py-20 bg-cream overflow-hidden">
        <div className="container mx-auto px-4 mb-12">
          <h2 className="text-2xl md:text-5xl font-bold text-gray-800 mb-1" style={{ fontFamily: 'Russo One, sans-serif' }}>TESTIMONI DAN CERITA ALUMNI</h2>
          <p className="text-xs md:text-base text-gray-700">
            Mereka membuktikan menjadi berhasil adalah hal yang mungkin, kamu bisa menjadi generasi selanjutnya <span className="font-bold">KRISMA BISA</span>.
          </p>
        </div>

        {loading ? (
          <div className="text-center py-20">
            <div className="inline-block w-12 h-12 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : data.alumnis.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-2xl mx-4">
            <div className="text-5xl mb-4">👥</div>
            <p className="text-gray-600">Belum ada data testimoni</p>
          </div>
        ) : (
          <div
            ref={testimoniRef}
            className="overflow-x-scroll"
            style={{
              cursor: 'grab',
              scrollbarWidth: 'none',
              msOverflowStyle: 'none',
              WebkitOverflowScrolling: 'touch'
            }}
            onMouseDown={(e) => handleMouseDown(e, testimoniRef, setIsTestimoniPaused)}
            onMouseMove={(e) => handleMouseMove(e, testimoniRef)}
            onMouseUp={() => handleMouseUp(testimoniRef, setIsTestimoniPaused)}
            onMouseLeave={() => handleMouseUp(testimoniRef, setIsTestimoniPaused)}
            onTouchStart={(e) => handleTouchStart(e, testimoniRef, setIsTestimoniPaused)}
            onTouchMove={(e) => handleTouchMove(e, testimoniRef)}
            onTouchEnd={() => handleTouchEnd(setIsTestimoniPaused)}
          >
            <div className="flex gap-4 md:gap-6">
              {/* Duplicate cards for infinite scroll */}
              {[...data.alumnis, ...data.alumnis, ...data.alumnis].map((alumni, index) => (
                <div key={`testimoni-${index}`} className="bg-transparent rounded-xl md:rounded-2xl p-4 md:p-8 border border-gray-800 aspect-square flex flex-col flex-shrink-0 w-[280px] md:w-[400px]" style={{ borderWidth: '0.7px' }}>
                  <div className="flex items-center gap-3 md:gap-4 mb-4 md:mb-6 pb-4 md:pb-6 border-b border-gray-800" style={{ borderBottomWidth: '0.7px' }}>
                    <img
                      src={alumni.photo || 'https://i.pravatar.cc/150'}
                      alt={alumni.name}
                      className="w-12 h-12 md:w-16 md:h-16 rounded-full object-cover"
                    />
                    <div>
                      <h4 className="font-bold text-gray-800 text-sm md:text-base">{alumni.name}</h4>
                      <p className="text-[10px] md:text-xs text-gray-600 uppercase">
                        {alumni.currentOccupation || 'ALUMNI'}
                        {alumni.company && ` AT ${alumni.company.toUpperCase()}`}
                      </p>
                    </div>
                  </div>

                  <p className="text-gray-700 leading-relaxed text-sm md:text-lg mb-3 md:mb-4 flex-1">
                    {alumni.testimonial}
                  </p>

                  <div className="text-[10px] md:text-xs text-gray-500 italic">
                    -{alumni.jurusan || 'ALUMNI'} {alumni.graduationYear || '2022'}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </section>

      {/* Footer */}
      <footer className="bg-[#0D76BE] text-white py-12">
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

      {/* Animations */}
      <style>{`
        @keyframes marquee-fast {
          0% { transform: translateX(0%); }
          100% { transform: translateX(-50%); }
        }
        @keyframes scroll-left {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .animate-marquee-fast {
          display: inline-block;
          animation: marquee-fast 40s linear infinite;
        }
        .animate-scroll-left {
          animation: scroll-left 30s linear infinite;
        }
        .animate-scroll-left:hover {
          animation-play-state: paused;
        }
      `}</style>

      {/* Search Modal */}
      {showSearchModal && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => {
              setShowSearchModal(false);
              setSearchQuery('');
            }}
          ></div>

          {/* Modal Content */}
          <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl overflow-hidden animate-fadeIn">
            <div className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input
                  type="text"
                  placeholder="Cari artikel SMK KRISTEN 5 KLATEN..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter' && searchQuery.trim()) {
                      navigate(`/artikel?q=${encodeURIComponent(searchQuery.trim())}`);
                      setShowSearchModal(false);
                      setSearchQuery('');
                    }
                  }}
                  autoFocus
                  className="flex-1 text-lg outline-none"
                />
                <button
                  onClick={() => {
                    setShowSearchModal(false);
                    setSearchQuery('');
                  }}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="text-sm text-gray-500">
                Tekan <kbd className="px-2 py-1 bg-gray-100 rounded text-xs font-semibold">Enter</kbd> untuk mencari
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HomepageFixed;
