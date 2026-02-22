import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { useSchoolLogo } from '../../hooks/useContact';
import useSwipe from '../../hooks/useSwipe';
import SEO from '../../components/SEO';
import Mascot3D from '../../components/Mascot3D';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
const HomepageFixed = () => {
  const navigate = useNavigate();
  const { logo: schoolLogo } = useSchoolLogo();

  const [data, setData] = useState({
    jurusans: [],
    articles: [],
    ekskuls: [],
    alumnis: [],
    partners: [],
    fasilitas: [],
    prestasi: [],
    heroSlides: [],
    heroSettings: { slideDuration: 5000, autoPlay: true, showIndicators: true },
    runningText: [],
    socialMedia: [],
    contact: null,
    cta: null,
    about: null,
    activityTabs: [],
    activitySettings: {
      globalLink: '/kegiatan',
      globalButtonText: 'Explore Kegiatan Siswa',
      sectionTitle: 'Pembelajaran & Kegiatan',
      sectionSubtitle: 'Berbagai aktivitas pembelajaran dan kegiatan siswa',
    },
    events: [],
    siteSettings: null,
  });
  const [loading, setLoading] = useState(true);
  const [navbarVisible, setNavbarVisible] = useState(true);
  const [activeProgram, setActiveProgram] = useState(0);
  const [activeActivityTab, setActiveActivityTab] = useState(0);
  const [activeActivitySlide, setActiveActivitySlide] = useState(0);
  const [activeEventFilter, setActiveEventFilter] = useState('semua');
  const [currentTestimonialSlide, setCurrentTestimonialSlide] = useState(0);
  const [currentHeroSlide, setCurrentHeroSlide] = useState(0);

  // Alumni review submission modal
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [reviewSubmitState, setReviewSubmitState] = useState('idle'); // idle | submitting | success | error
  const [reviewError, setReviewError] = useState('');
  const [reviewForm, setReviewForm] = useState({
    name: '', graduationYear: '', jurusan: '',
    currentOccupation: '', company: '', testimonial: '',
    photoFile: null, photoPreview: '',
  });

  const handleReviewPhotoChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setReviewForm((f) => ({ ...f, photoFile: file, photoPreview: URL.createObjectURL(file) }));
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    setReviewError('');
    const { name, graduationYear, jurusan, testimonial, photoFile } = reviewForm;
    if (!name || !graduationYear || !jurusan || !testimonial) {
      setReviewError('Nama, tahun lulus, jurusan, dan cerita wajib diisi.');
      return;
    }
    if (!photoFile) {
      setReviewError('Foto profil wajib diupload.');
      return;
    }
    setReviewSubmitState('submitting');
    try {
      const fd = new FormData();
      fd.append('photo', photoFile);
      fd.append('name', name.trim());
      fd.append('graduationYear', graduationYear);
      fd.append('jurusan', jurusan.trim());
      fd.append('currentOccupation', reviewForm.currentOccupation.trim());
      fd.append('company', reviewForm.company.trim());
      fd.append('testimonial', testimonial.trim());
      await api.post('/api/alumni-submissions', fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setReviewSubmitState('success');
    } catch (err) {
      setReviewError(err.response?.data?.message || 'Terjadi kesalahan, coba lagi.');
      setReviewSubmitState('idle');
    }
  };

  const closeReviewModal = () => {
    setShowReviewModal(false);
    setReviewSubmitState('idle');
    setReviewError('');
    setReviewForm({ name: '', graduationYear: '', jurusan: '', currentOccupation: '', company: '', testimonial: '', photoFile: null, photoPreview: '' });
  };

  const lastScrollY = useRef(0);

  // Fetch all homepage data in a single request
  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await api.get('/api/homepage');
        const d = res.data.data;

        setData({
          jurusans: d.jurusans || [],
          articles: d.articles || [],
          ekskuls: d.ekskuls || [],
          alumnis: d.alumni || [],
          partners: d.partners || [],
          fasilitas: d.fasilitas || [],
          prestasi: d.prestasis || [],
          heroSlides: d.heroSlides || [],
          heroSettings: d.heroSettings || { slideDuration: 5000, autoPlay: true, showIndicators: true },
          runningText: d.runningTexts || [],
          socialMedia: d.socialMedia || [],
          contact: d.contact || null,
          cta: d.cta || null,
          about: null,
          activityTabs: d.activityTabs || [],
          activitySettings: d.activitySettings || {
            globalLink: '/kegiatan',
            globalButtonText: 'Explore Kegiatan Siswa',
            sectionTitle: 'Pembelajaran & Kegiatan',
            sectionSubtitle: 'Berbagai aktivitas pembelajaran dan kegiatan siswa',
          },
          events: d.events || [],
          siteSettings: d.siteSettings || null,
        });
      } catch (error) {
        console.error('Error fetching homepage data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Navbar hide on scroll
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.pageYOffset;

      if (currentScrollY > 100) {
        if (currentScrollY > lastScrollY.current) {
          setNavbarVisible(false);
        } else {
          setNavbarVisible(true);
        }
      } else {
        setNavbarVisible(true);
      }

      lastScrollY.current = currentScrollY;
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Auto-slide testimonials on mobile
  useEffect(() => {
    const interval = setInterval(() => {
      if (window.innerWidth <= 992) {
        const totalDots = Math.ceil((data.alumnis || []).length / 3) || 1;
        setCurrentTestimonialSlide((prev) => (prev + 1) % totalDots);
      }
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  // Auto-rotate hero slides based on settings
  useEffect(() => {
    if (data.heroSlides.length > 1 && data.heroSettings.autoPlay) {
      const interval = setInterval(() => {
        setCurrentHeroSlide((prev) => (prev + 1) % data.heroSlides.length);
      }, data.heroSettings.slideDuration || 5000);

      return () => clearInterval(interval);
    }
  }, [data.heroSlides.length, data.heroSettings.slideDuration, data.heroSettings.autoPlay]);

  // Auto-rotate activity carousel
  useEffect(() => {
    const tabs = data.activityTabs.length > 0 ? data.activityTabs : null;
    if (!tabs) return;
    const currentTab = tabs[activeActivityTab] || tabs[0];
    const len = currentTab?.items?.length || 0;
    if (len <= 1) return;
    const duration = data.activitySettings?.slideDuration || 4000;
    const interval = setInterval(() => {
      setActiveActivitySlide((p) => (p + 1) % len);
    }, duration);
    return () => clearInterval(interval);
  }, [data.activityTabs, activeActivityTab, data.activitySettings?.slideDuration]);

  // Swipe handlers for carousels
  const heroSwipe = useSwipe({
    onLeft: () => setCurrentHeroSlide((p) => (p + 1) % (data.heroSlides.length || 1)),
    onRight: () => setCurrentHeroSlide((p) => (p - 1 + (data.heroSlides.length || 1)) % (data.heroSlides.length || 1)),
  });

  const activitySwipe = useSwipe({
    onLeft: () => {
      const tabs = data.activityTabs.length > 0 ? data.activityTabs : [{ items: [{},{},{},{}] }];
      const currentTab = tabs[activeActivityTab] || tabs[0];
      const len = currentTab?.items?.length || 1;
      setActiveActivitySlide((p) => (p + 1) % len);
    },
    onRight: () => {
      const tabs = data.activityTabs.length > 0 ? data.activityTabs : [{ items: [{},{},{},{}] }];
      const currentTab = tabs[activeActivityTab] || tabs[0];
      const len = currentTab?.items?.length || 1;
      setActiveActivitySlide((p) => (p - 1 + len) % len);
    },
  });

  const testimonialSwipe = useSwipe({
    onLeft: () => {
      const total = Math.ceil((data.alumnis || []).length / 3) || 1;
      setCurrentTestimonialSlide((p) => (p + 1) % total);
    },
    onRight: () => {
      const total = Math.ceil((data.alumnis || []).length / 3) || 1;
      setCurrentTestimonialSlide((p) => (p - 1 + total) % total);
    },
  });

  const accordionContainerRef = useRef(null);
  const accordionItemRefs = useRef([]);
  const toggleProgram = (index) => {
    if (activeProgram === index) {
      // Close current
      setActiveProgram(-1);
    } else if (activeProgram !== -1) {
      // Another is open: close first, wait for animation, then open new
      setActiveProgram(-1);
      setTimeout(() => {
        setActiveProgram(index);
        setTimeout(() => {
          const container = accordionContainerRef.current;
          const item = accordionItemRefs.current[index];
          if (container && item) {
            container.scrollTo({ top: item.offsetTop - container.offsetTop, behavior: 'smooth' });
          }
        }, 100);
      }, 350);
    } else {
      // None open: just open
      setActiveProgram(index);
      setTimeout(() => {
        const container = accordionContainerRef.current;
        const item = accordionItemRefs.current[index];
        if (container && item) {
          container.scrollTo({ top: item.offsetTop - container.offsetTop, behavior: 'smooth' });
        }
      }, 100);
    }
  };

  const switchActivityTab = (index) => {
    setActiveActivityTab(index);
    setActiveActivitySlide(0);
  };

  const filterEvents = (category) => {
    setActiveEventFilter(category);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="inline-block w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4"></div>
          <p className="text-gray-600">Memuat...</p>
        </div>
      </div>
    );
  }

  const hp = data.siteSettings?.homepageSections || {};

  return (
    <>
      <SEO
        title={data.siteSettings?.metaTitle || 'SMK Kristen 5 Klaten - Sekolah Menengah Kejuruan'}
        description={data.siteSettings?.metaDescription || 'SMK Kristen 5 Klaten menyiapkan siswa masuk dunia kerja dengan kurikulum berbasis industri'}
      />

      {/* Custom Styles */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700;800&family=Russo+One&display=swap');

        body {
          font-family: 'Poppins', sans-serif;
        }

        .russo {
          font-family: 'Russo One', sans-serif;
          font-weight: 400;
        }

        @keyframes scrollUp {
          0% { transform: translateY(0); }
          100% { transform: translateY(-50%); }
        }

        @keyframes scrollDown {
          0% { transform: translateY(-50%); }
          100% { transform: translateY(0); }
        }

        .animate-scroll-up {
          animation: scrollUp 30s linear infinite;
        }

        .animate-scroll-down {
          animation: scrollDown 30s linear infinite;
        }

        @keyframes gradientShift {
          0% { transform: translate(0, 0) rotate(0deg) scale(1); opacity: 0.8; }
          33% { transform: translate(30px, -20px) rotate(5deg) scale(1.05); opacity: 0.85; }
          66% { transform: translate(-20px, 30px) rotate(-5deg) scale(1.03); opacity: 0.9; }
          100% { transform: translate(0, 0) rotate(0deg) scale(1); opacity: 0.8; }
        }

        .animate-gradient {
          animation: gradientShift 15s ease-in-out infinite;
        }

        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }

        .animate-marquee {
          animation: marquee 30s linear infinite;
        }
      `}</style>

      {/* Fixed Navigation */}
      <Navbar activePage="beranda" visible={navbarVisible} />

      {/* Hero Section */}
      <section className="relative w-full min-h-[88vh] md:min-h-[600px] lg:min-h-[700px] overflow-hidden" {...heroSwipe}>
        {/* Background Images - Rotating slides */}
        {(() => {
          const defaultSlides = [
            {
              title: 'SMK YANG MENYIAPKAN SISWA MASUK DUNIA KERJA, BUKAN SEKADAR LULUS',
              subtitle: 'Kurikulum berbasis industri, praktik langsung, dan pembinaan karakter sejak kelas X.',
              backgroundImage: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=1920&h=1080&fit=crop',
              primaryButtonText: 'BAGIKAN CERITAMU',
              secondaryButtonText: 'LIHAT LEBIH LANJUT',
            },
          ];
          const slides = data.heroSlides.length > 0 ? data.heroSlides : defaultSlides;
          const currentSlide = slides[currentHeroSlide] || slides[0];

          return (
            <>
              {/* Background Images with fade transition */}
              {slides.map((slide, idx) => (
                <div
                  key={idx}
                  className={`absolute inset-0 bg-cover bg-center transition-opacity duration-1000 ${
                    idx === currentHeroSlide ? 'opacity-100' : 'opacity-0'
                  }`}
                  style={{ backgroundImage: `url('${slide.backgroundImage}')` }}
                ></div>
              ))}

              {/* Gradient Overlay */}
              <div
                className="absolute inset-0"
                style={{
                  background: 'linear-gradient(160deg, rgba(63, 43, 150, 0.85) 0%, rgba(30, 64, 175, 0.8) 30%, rgba(13, 118, 190, 0.75) 60%, rgba(56, 189, 248, 0.7) 100%)'
                }}
              ></div>

              {/* Hero Content - Centered on mobile, left on desktop */}
              <div className="absolute top-1/2 md:top-[55%] left-1/2 md:left-8 lg:left-16 -translate-x-1/2 md:translate-x-0 -translate-y-1/2 text-center md:text-left z-10 w-10/12 md:w-11/12 max-w-xl lg:max-w-2xl px-2 sm:px-4">
                <h1 className="russo text-2xl md:text-[20px] lg:text-[24px] leading-tight text-white uppercase mb-4 md:mb-3 drop-shadow-lg transition-all duration-500">
                  {currentSlide.title}
                </h1>
                <p className="text-sm sm:text-base md:text-lg leading-relaxed text-white/95 transition-all duration-500">
                  {currentSlide.subtitle}
                </p>
                <div className="flex flex-col md:flex-row items-center md:items-start gap-3 md:gap-4 mt-7 md:mt-9 flex-wrap">
                  <button className="w-full md:w-auto bg-gradient-to-br from-yellow-300 to-yellow-400 text-gray-900 px-5 md:px-8 py-3 md:py-[14px] rounded-lg text-[11px] md:text-xs font-semibold tracking-wide shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300">
                    {currentSlide.primaryButtonText || 'BAGIKAN CERITAMU'}
                  </button>
                  <button className="w-full md:w-auto bg-transparent text-yellow-300 px-5 md:px-8 py-3 md:py-[14px] border-2 border-yellow-300 rounded-lg text-[11px] md:text-xs font-semibold tracking-wide hover:bg-yellow-300/10 transition-all">
                    {currentSlide.secondaryButtonText || 'LIHAT LEBIH LANJUT'}
                  </button>
                </div>

                {/* Slide indicators */}
                {slides.length > 1 && data.heroSettings.showIndicators && (
                  <div className="flex justify-center md:justify-start gap-2 mt-6">
                    {slides.map((_, dotIdx) => (
                      <button
                        key={dotIdx}
                        onClick={() => setCurrentHeroSlide(dotIdx)}
                        className={`h-2 rounded-full transition-all ${
                          dotIdx === currentHeroSlide ? 'bg-yellow-300 w-6' : 'w-2 bg-white/50'
                        }`}
                      ></button>
                    ))}
                  </div>
                )}
              </div>
            </>
          );
        })()}

        {/* Wave SVG - Hidden for now, uncomment className to show */}
        <div className="hidden absolute bottom-0 left-0 w-full h-48 z-20">
          <svg viewBox="0 0 1978 275" preserveAspectRatio="none" className="absolute bottom-0 w-full h-full">
            <path fillRule="evenodd" clipRule="evenodd" d="M1978 219.45L1895.58 201.321C1813.17 183.193 1648.33 146.936 1483.5 146.936C1318.67 146.936 1153.83 183.193 989 219.45C824.167 256.661 659.333 292.918 494.5 265.248C329.667 238.532 164.833 146.936 82.4166 101.138L0 55.3395V275H82.4166C164.833 275 329.667 275 494.5 275C659.333 275 824.167 275 989 275C1153.83 275 1318.67 275 1483.5 275C1648.33 275 1813.17 275 1895.58 275H1978V219.45Z" fill="#f8f8f8"/>
          </svg>
        </div>
      </section>

      {/* Running Text - Below Hero */}
      {(data.runningText || []).length > 0 && (
        <div className="w-full bg-yellow-400 text-gray-900 py-2 sm:py-3 overflow-hidden">
          <div className="flex animate-marquee whitespace-nowrap">
            {(data.runningText || []).map((text, textIdx) => (
              <span key={textIdx} className="mx-4 sm:mx-8 text-xs sm:text-sm font-medium">
                📢 {text.text}
              </span>
            ))}
            {/* Duplicate for seamless loop */}
            {(data.runningText || []).map((text, textIdx) => (
              <span key={`dup-${textIdx}`} className="mx-4 sm:mx-8 text-xs sm:text-sm font-medium">
                📢 {text.text}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Why Section */}
      <div className="relative w-full overflow-hidden bg-gray-50">
        {/* Diagonal Overlay SVG */}
        <div
          className="absolute top-[-50px] right-0 w-[600px] h-[900px] z-10 pointer-events-none hidden lg:block"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='959' height='1228' viewBox='0 0 959 1228' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Crect width='547' height='1292' transform='matrix(0.616893 -0.787047 -0.787047 -0.616893 1016.87 1227.54)' fill='url(%23paint0_linear_1081_4501)'/%3E%3Cdefs%3E%3ClinearGradient id='paint0_linear_1081_4501' x1='263.766' y1='-0.000141328' x2='263.766' y2='1299.57' gradientUnits='userSpaceOnUse'%3E%3Cstop stop-color='%2355C6FF'/%3E%3Cstop offset='1' stop-color='%23FFFEFA' stop-opacity='0.4'/%3E%3C/linearGradient%3E%3C/defs%3E%3C/svg%3E")`,
            backgroundRepeat: 'no-repeat',
            backgroundSize: 'contain',
          }}
        ></div>

        <div className="relative z-20 max-w-[1400px] mx-auto px-6 lg:px-16 py-10 lg:py-20">
          <div className="flex flex-col lg:flex-row items-start gap-8 lg:gap-20">
            {/* Left Content - 50% */}
            <div className="w-full lg:w-1/2 lg:pr-10">
              <h3 className="text-xs lg:text-base font-extrabold text-gray-700 mb-2 tracking-wide">{hp.whyTitle || 'MENGAPA SEKOLAH DI KRISMA'}</h3>
              <h2 className="russo text-xl sm:text-2xl lg:text-[28px] leading-tight text-[#0d76be] mb-3 lg:mb-4">
                {hp.whyHeading || 'SEKOLAH BINAAN DAIHATSU DAN MATERI BERDASARKAN INDUSTRIAL'}
              </h2>
              <p className="text-sm lg:text-base leading-relaxed text-gray-700">
                {hp.whyDescription || 'SMK Kristen 5 Klaten telah memiliki sertifikat ISO 9008:2015 dan menggandeng mitra industri guna menjamin mutu pendidikan dan keselarasan dengan industri.'}
              </p>

              <Link to={hp.whyButtonUrl || '/tentang'} className="inline-flex items-center justify-center px-5 lg:px-7 py-2.5 lg:py-3 bg-[#0d76be] hover:bg-[#0a5a91] text-white rounded-lg mt-4 lg:mt-6 text-[11px] lg:text-xs font-semibold tracking-wide shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all">
                {hp.whyButtonText || 'Baca Profil Sekolah'}
              </Link>

              {/* Alumni Companies */}
              <div className="mt-6 lg:mt-10">
                <h4 className="text-[10px] lg:text-xs font-semibold text-gray-700 mb-3 lg:mb-5 tracking-wide">{hp.statsHeading || 'ALUMNI KAMI TELAH BEKERJA DI TOP COMPANY'}</h4>
                <div className="grid grid-cols-3 gap-2 lg:gap-4 max-w-[400px]">
                  {(data.partners || []).slice(0, 6).map((partner, idx) => (
                    <div key={idx} className="bg-white rounded-md p-1.5 lg:p-2.5 h-12 lg:h-16 flex items-center justify-center">
                      <img src={partner.logo} alt={partner.name} loading="lazy" className="max-w-full max-h-full object-contain" />
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Stats Cards - 50% */}
            <div className="w-full lg:w-1/2">
            <div className="grid grid-cols-2 gap-3 sm:gap-4 mt-0 lg:mt-24 w-full">
              <div className="bg-white rounded-xl lg:rounded-2xl p-4 lg:p-6 shadow-lg border-l-4 lg:border-l-[6px] border-[#008fd7] sm:aspect-square flex flex-col">
                <div className="russo text-2xl sm:text-3xl lg:text-[42px] leading-none text-gray-700">{(data.ekskuls || []).length}</div>
                <h4 className="text-xs sm:text-sm lg:text-base font-bold text-black mt-1 lg:mt-2 uppercase tracking-wide">Ekstrakurikuler</h4>
                <p className="text-xs lg:text-sm leading-relaxed text-gray-600 mt-1.5 lg:mt-2.5 hidden sm:block">
                  {(data.ekskuls || []).slice(0, 3).map(e => e.name).join(', ') || 'Loading...'}{(data.ekskuls || []).length > 3 ? ', dan lainnya' : ''}
                </p>
              </div>

              <div className="bg-white rounded-xl lg:rounded-2xl p-4 lg:p-6 shadow-lg border-l-4 lg:border-l-[6px] border-yellow-300 sm:aspect-square flex flex-col">
                <div className="russo text-2xl sm:text-3xl lg:text-[42px] leading-none text-gray-700">{(data.fasilitas || []).length}</div>
                <h4 className="text-xs sm:text-sm lg:text-base font-bold text-black mt-1 lg:mt-2 uppercase tracking-wide">Fasilitas</h4>
                <p className="text-xs lg:text-sm leading-relaxed text-gray-600 mt-1.5 lg:mt-2.5 hidden sm:block">
                  {(data.fasilitas || []).slice(0, 3).map(f => f.name).join(', ') || 'Loading...'}{(data.fasilitas || []).length > 3 ? ', dan lainnya' : ''}
                </p>
              </div>

              <div className="bg-white rounded-xl lg:rounded-2xl p-4 lg:p-6 shadow-lg border-l-4 lg:border-l-[6px] border-red-500 sm:aspect-square flex flex-col">
                <div className="russo text-2xl sm:text-3xl lg:text-[42px] leading-none text-gray-700">{new Date().getFullYear() - (hp.foundingYear || 1999)}</div>
                <h4 className="text-xs sm:text-sm lg:text-base font-bold text-black mt-1 lg:mt-2 uppercase tracking-wide">Tahun Melayani</h4>
                <p className="text-xs lg:text-sm leading-relaxed text-gray-600 mt-1.5 lg:mt-2.5 hidden sm:block">
                  {`Melayani pendidikan di Klaten sejak tahun ${hp.foundingYear || 1999}`}
                </p>
              </div>

              <div className="bg-white rounded-xl lg:rounded-2xl p-4 lg:p-6 shadow-lg border-l-4 lg:border-l-[6px] border-orange-600 sm:aspect-square flex flex-col">
                <div className="russo text-2xl sm:text-3xl lg:text-[42px] leading-none text-gray-700">{(data.jurusans || []).length}</div>
                <h4 className="text-xs sm:text-sm lg:text-base font-bold text-black mt-1 lg:mt-2 uppercase tracking-wide">Bidang Kompetensi</h4>
                <p className="text-xs lg:text-sm leading-relaxed text-gray-600 mt-1.5 lg:mt-2.5 hidden sm:block">
                  {(data.jurusans || []).slice(0, 3).map(j => j.name).join(', ') || 'Loading...'}{(data.jurusans || []).length > 3 ? '' : ''}
                </p>
              </div>
            </div>
            </div>
          </div>
        </div>
      </div>

      {/* Accelerate + Programs Section — seamless bg-gray-50 block */}
      <section className="bg-gray-50 pt-6 pb-0 px-4">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto pb-6">
          <div className="flex justify-center mb-1">
            <Mascot3D size={64} />
          </div>
          <h2 className="russo text-xl lg:text-2xl text-gray-700 mt-2">{hp.accelerateTitle || 'ACCELERATE YOUR ENTIRE POTENTIAL'}</h2>
          <p className="text-sm lg:text-base leading-relaxed text-gray-600 font-light mt-2">
            {hp.accelerateDescription || 'MULAI DARI HARI PERTAMA, PROSES BELAJAR, HINGGA LULUS, SETIAP GURU SIAP MEMBANTU SISWA SMK KRISTEN 5 KLATEN MENCAPAI IMPIAN DAN SKILL YANG DIBUTUHKAN OLEH PERUSAHAAN AGAR SIAP BEKERJA'}
          </p>
        </div>
      </section>

      {/* Programs Section */}
      <section className="flex flex-col lg:flex-row items-stretch bg-gray-50 border-t border-gray-300 relative lg:h-[600px] lg:max-h-[600px] overflow-hidden">
        {/* Left - Image with Gradient Background (Desktop Only) */}
        <div className="hidden lg:block relative w-1/2 h-full bg-gradient-to-b from-[#0a0a0a] to-[#1a1a2e] overflow-hidden flex-shrink-0">
          {/* Animated Gradient Glow */}
          <div
            className="absolute top-[-50%] left-[-20%] w-[140%] h-[200%] animate-gradient"
            style={{
              background: `radial-gradient(ellipse 800px 600px at 20% 40%, rgba(139, 92, 246, 0.25), transparent),
                          radial-gradient(ellipse 600px 500px at 80% 60%, rgba(56, 189, 248, 0.2), transparent),
                          radial-gradient(ellipse 700px 550px at 50% 80%, rgba(168, 85, 247, 0.15), transparent)`,
              filter: 'blur(80px)',
            }}
          ></div>

          {/* Image Container */}
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[85%] h-[420px] border border-white/20 rounded-xl p-2 bg-white/5 backdrop-blur-sm shadow-[0_8px_32px_rgba(139,92,246,0.2)] z-10">
            <img
              src={(data.jurusans || [])[activeProgram]?.backgroundImage || 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&h=600&fit=crop'}
              alt="Program"
              loading="lazy"
              className="w-full h-full rounded-lg object-cover transition-opacity duration-300"
            />
          </div>
        </div>

        {/* Right - Accordion */}
        <div ref={accordionContainerRef} className="flex-1 px-6 lg:px-16 py-10 flex flex-col justify-start gap-4 lg:overflow-y-auto lg:h-[600px] max-w-[1400px]">
          {(data.jurusans || []).slice(0, 5).map((jurusan, idx) => (
            <div key={idx} ref={el => accordionItemRefs.current[idx] = el} className="pb-4 border-b border-gray-300">
              <div
                className="flex justify-between items-center cursor-pointer hover:opacity-70 transition-opacity"
                onClick={() => toggleProgram(idx)}
              >
                <div>
                  <h3 className="russo text-xl lg:text-2xl text-gray-700">{jurusan.code || jurusan.name.slice(0, 4).toUpperCase()}</h3>
                  <h4 className="text-sm lg:text-base text-gray-700 font-medium mt-1.5">{jurusan.name}</h4>
                </div>
                <span className="text-4xl leading-none text-gray-700 cursor-pointer transition-transform">
                  {activeProgram === idx ? '−' : '+'}
                </span>
              </div>

              {/* Content */}
              <div
                className={`overflow-hidden transition-all duration-300 ${
                  activeProgram === idx ? 'max-h-[600px] pt-4' : 'max-h-0 pt-0'
                }`}
              >
                {/* Mobile Image */}
                <div className="lg:hidden w-full h-48 mb-4 rounded-lg overflow-hidden">
                  <img src={jurusan.backgroundImage || 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&h=600&fit=crop'} alt={jurusan.name} loading="lazy" className="w-full h-full object-cover" />
                </div>

                {/* Short Description (plain text) or fallback to full description */}
                {jurusan.shortDescription ? (
                  <p className="text-sm leading-relaxed text-gray-700 mb-4">
                    {jurusan.shortDescription}
                  </p>
                ) : (
                  <div
                    className="text-sm leading-relaxed text-gray-700 mb-4 prose prose-sm max-w-none"
                    dangerouslySetInnerHTML={{ __html: jurusan.description }}
                  />
                )}

                {/* Career Prospects */}
                {jurusan.careerProspects && jurusan.careerProspects.length > 0 && (
                  <div>
                    <h5 className="text-[11px] font-semibold text-gray-700 tracking-wide mb-2.5">PROSPEK KARIR:</h5>
                    <div className="flex flex-wrap gap-2">
                      {jurusan.careerProspects.map((career, cIdx) => (
                        <span key={cIdx} className="text-[11px] text-gray-600 bg-[#f6f3e4] px-4 py-1.5 rounded font-medium">
                          {career}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Activities Section */}
      <section className="bg-[#1e1e1e] py-10 lg:py-[60px] relative overflow-hidden">
        <div className="max-w-[1400px] mx-auto px-6 lg:px-16">
        <div className="text-center mb-6 lg:mb-8">
          <h2 className="text-base lg:text-lg font-bold text-white">{data.activitySettings?.sectionTitle || 'PEMBELAJARAN & KEGIATAN NYATA'}</h2>
          <p className="text-sm lg:text-base leading-relaxed text-[#6a6b6d] font-medium max-w-[600px] mx-auto mt-2 px-4">
            {data.activitySettings?.sectionSubtitle || 'SISWA DILATIH DAN DIDUKUNG DENGAN PROGRAM DAN KOMPETISI YANG MELATIH RASA DAN KEBERANIAN'}
          </p>
        </div>

        {/* Tabs */}
        {(() => {
          // Fallback data when no tabs from database
          const fallbackTabs = [
            { name: 'BELAJAR', items: [
              { title: 'Praktikum Lab Terpadu', description: 'Siswa mengerjakan proyek langsung di laboratorium dengan peralatan standar industri.', image: 'https://images.unsplash.com/photo-1562774053-701939374585?w=1200&h=600&fit=crop' },
              { title: 'Proyek Berbasis Masalah', description: 'Pembelajaran melalui studi kasus nyata untuk mengasah kemampuan analisis dan solusi.', image: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=1200&h=600&fit=crop' },
              { title: 'Bimbingan Intensif Ujian', description: 'Program persiapan ujian kompetensi dengan pendampingan guru berpengalaman.', image: 'https://images.unsplash.com/photo-1427504494785-3a9ca7044f45?w=1200&h=600&fit=crop' },
              { title: 'Kelas Sertifikasi Profesi', description: 'Pelatihan khusus untuk mendapatkan sertifikat kompetensi yang diakui industri.', image: 'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=1200&h=600&fit=crop' },
            ]},
            { name: 'BERAKSI', items: [
              { title: 'Bakti Sosial Masyarakat', description: 'Kegiatan pelayanan ke panti asuhan dan masyarakat sekitar untuk membangun kepedulian.', image: 'https://images.unsplash.com/photo-1559027615-cd4628902d4a?w=1200&h=600&fit=crop' },
              { title: 'Aksi Peduli Lingkungan', description: 'Program penghijauan dan pengelolaan sampah untuk kesadaran lingkungan hidup.', image: 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=1200&h=600&fit=crop' },
              { title: 'Perayaan Hari Besar', description: 'Pentas seni dan ibadah bersama dalam memperingati hari-hari penting nasional dan keagamaan.', image: 'https://images.unsplash.com/photo-1511578314322-379afb476865?w=1200&h=600&fit=crop' },
              { title: 'Latihan Kepemimpinan Siswa', description: 'Program pembentukan karakter melalui kegiatan OSIS dan organisasi kesiswaan.', image: 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=1200&h=600&fit=crop' },
            ]},
            { name: 'BERPENGALAMAN', items: [
              { title: 'Magang di Perusahaan', description: 'Praktik kerja langsung di perusahaan mitra selama 3-6 bulan sesuai bidang keahlian.', image: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=1200&h=600&fit=crop' },
              { title: 'Kunjungan Industri Rutin', description: 'Observasi langsung ke perusahaan untuk memahami dunia kerja profesional.', image: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=1200&h=600&fit=crop' },
              { title: 'Kompetisi Tingkat Nasional', description: 'Mengikuti lomba kompetensi siswa untuk mengukur kemampuan dan meraih prestasi.', image: 'https://images.unsplash.com/photo-1546519638-68e109498ffc?w=1200&h=600&fit=crop' },
              { title: 'Study Tour Edukatif', description: 'Kunjungan belajar ke institusi pendidikan dan tempat bersejarah di luar kota.', image: 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=1200&h=600&fit=crop' },
            ]},
          ];

          const tabs = data.activityTabs.length > 0 ? data.activityTabs : fallbackTabs;
          const currentTab = tabs[activeActivityTab] || tabs[0];
          const currentItems = currentTab?.items || [];
          const currentItem = currentItems[activeActivitySlide] || currentItems[0];

          return (
            <>
              <div className="flex justify-center gap-1 lg:gap-2 mb-4 border border-white rounded-full p-1 lg:p-1.5 w-fit mx-auto overflow-x-auto">
                {tabs.map((tab, idx) => (
                  <div
                    key={idx}
                    onClick={() => switchActivityTab(idx)}
                    className={`px-3 lg:px-7 py-2 lg:py-2.5 rounded-full text-[10px] lg:text-xs text-white font-medium cursor-pointer transition-all whitespace-nowrap ${
                      activeActivityTab === idx ? 'bg-[rgba(207,233,246,0.17)]' : ''
                    }`}
                  >
                    {tab.name}
                  </div>
                ))}
              </div>

              {currentItem && (
                <div className="w-full" {...activitySwipe}>
                  {/* Image wrapper with Union.svg overlays */}
                  <div className="relative w-full h-[250px] sm:h-[350px] lg:h-[450px] pt-3 lg:pt-5 pb-0 px-2 lg:px-10">
                    <div className="relative w-full h-full overflow-hidden">
                      {/* Union overlay - Left */}
                      <div
                        className="absolute left-[-10px] top-0 w-[45px] h-full z-20 pointer-events-none hidden lg:block"
                        style={{
                          backgroundImage: `url("data:image/svg+xml,%3Csvg width='102' height='460' viewBox='0 0 102 460' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M0.699201 61.8604L107.239 -4.68758e-06L107.239 459.091L-2.53722e-06 401.046L0.749997 400.64L-2.55498e-06 400.64L-1.73635e-05 61.8604L0.699201 61.8604Z' fill='%231E1E1E'/%3E%3C/svg%3E")`,
                          backgroundRepeat: 'no-repeat',
                          backgroundSize: '100% 100%',
                          transform: 'scaleX(-1)',
                        }}
                      ></div>

                      {/* Union overlay - Right */}
                      <div
                        className="absolute right-[-10px] top-0 w-[45px] h-full z-20 pointer-events-none hidden lg:block"
                        style={{
                          backgroundImage: `url("data:image/svg+xml,%3Csvg width='102' height='460' viewBox='0 0 102 460' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M0.699201 61.8604L107.239 -4.68758e-06L107.239 459.091L-2.53722e-06 401.046L0.749997 400.64L-2.55498e-06 400.64L-1.73635e-05 61.8604L0.699201 61.8604Z' fill='%231E1E1E'/%3E%3C/svg%3E")`,
                          backgroundRepeat: 'no-repeat',
                          backgroundSize: '100% 100%',
                        }}
                      ></div>

                      {/* Union overlay - Bottom */}
                      <div
                        className="absolute bottom-[-100px] left-1/2 w-[45px] h-[200px] z-20 pointer-events-none hidden lg:block"
                        style={{
                          backgroundImage: `url("data:image/svg+xml,%3Csvg width='102' height='460' viewBox='0 0 102 460' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M0.699201 61.8604L107.239 -4.68758e-06L107.239 459.091L-2.53722e-06 401.046L0.749997 400.64L-2.55498e-06 400.64L-1.73635e-05 61.8604L0.699201 61.8604Z' fill='%231E1E1E'/%3E%3C/svg%3E")`,
                          backgroundRepeat: 'no-repeat',
                          backgroundSize: '100% 100%',
                          transform: 'translateX(-50%) rotate(90deg)',
                        }}
                      ></div>

                      {/* Image */}
                      <img
                        src={currentItem.image}
                        alt={currentItem.title}
                        className="w-full h-full object-cover transition-all duration-500"
                      />
                    </div>
                  </div>

                  {/* Nav Dots - overlapping bottom of image */}
                  <div className="flex justify-center gap-2 -mt-1 lg:-mt-3 relative z-30 px-4 lg:px-10">
                    {currentItems.map((_, dot) => (
                      <button
                        key={dot}
                        className={`w-2 h-2 lg:w-2.5 lg:h-2.5 rounded-full border-0 transition-all ${
                          activeActivitySlide === dot ? 'bg-[#FDE047]' : 'bg-white/30'
                        }`}
                        onClick={() => setActiveActivitySlide(dot)}
                      ></button>
                    ))}
                  </div>

                  {/* Text content */}
                  <div className="pt-3 pb-6 lg:pb-8 px-2 lg:px-10 text-left">
                    <p className="text-sm lg:text-[15px] leading-relaxed font-medium">
                      <span className="text-white">{currentItem.title}. </span>
                      <span className="text-[#bbb]">{currentItem.description}</span>
                    </p>
                    <Link to={data.activitySettings?.globalLink || '/artikel'} className="text-[#008fd7] text-xs lg:text-sm font-medium mt-3 lg:mt-4 inline-block hover:text-[#00D9FF] transition-colors">
                      {data.activitySettings?.globalButtonText || 'Explore Kegiatan Siswa'} &gt;
                    </Link>
                  </div>
                </div>
              )}
            </>
          );
        })()}
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="bg-[#1e1e1e] py-10 lg:py-16 relative overflow-hidden">
        <div className="max-w-[1400px] mx-auto px-6 lg:px-16">
          <div className="flex flex-col lg:flex-row gap-8 lg:gap-10">
            {/* Left - Testimonials */}
            <div className="flex-1">
              {/* Desktop: Seamless infinite scrolling columns */}
              {(() => {
                const list = data.alumnis || [];
                // Need at least 2 items to look good; pad with repeats if very few
                const padded = list.length === 0 ? [] : list.length === 1 ? [...list, ...list, ...list] : list;
                const col1 = [...padded, ...padded]; // duplicate for seamless loop
                const col2 = [...[...padded].reverse(), ...[...padded].reverse()]; // reversed + duplicate
                const AlumniCard = ({ alumni, idx }) => (
                  <div key={idx} className="p-6 bg-transparent border border-white/10 rounded-lg flex-shrink-0">
                    <p className="text-sm leading-relaxed text-[#d9d9d9]">{alumni.testimonial}</p>
                    <div className="flex items-center gap-3.5 mt-5">
                      <img src={alumni.photo || 'https://via.placeholder.com/48'} alt={alumni.name} loading="lazy" className="w-12 h-12 rounded-full object-cover" />
                      <div>
                        <h4 className="text-sm font-semibold text-white">{alumni.name}</h4>
                        <span className="text-[11px] text-[#b8b8b8] block mt-0.5">{alumni.currentOccupation} - {alumni.company}</span>
                      </div>
                    </div>
                    <p className="text-right text-[11px] text-[#7a7a7a] font-medium mt-3 italic">-Lulusan {alumni.graduationYear}</p>
                  </div>
                );
                return (
                  <div className="hidden lg:grid grid-cols-2 gap-5 h-[600px] overflow-hidden">
                    {/* Column 1 — scrolls up */}
                    <div className="flex flex-col gap-5 animate-scroll-up">
                      {col1.map((alumni, idx) => <AlumniCard key={idx} alumni={alumni} idx={idx} />)}
                    </div>
                    {/* Column 2 — scrolls down, reversed order */}
                    <div className="flex flex-col gap-5 animate-scroll-down">
                      {col2.map((alumni, idx) => <AlumniCard key={idx} alumni={alumni} idx={idx} />)}
                    </div>
                  </div>
                );
              })()}

              {/* Mobile: 3 cards with slide */}
              <div className="lg:hidden" {...testimonialSwipe}>
                <div className="flex flex-col gap-4">
                  {(data.alumnis || []).slice(currentTestimonialSlide * 3, currentTestimonialSlide * 3 + 3).map((alumni, idx) => (
                    <div key={idx} className="p-4 bg-transparent border border-white/10 rounded-lg">
                      <p className="text-sm leading-relaxed text-[#d9d9d9]">{alumni.testimonial}</p>
                      <div className="flex items-center gap-3 mt-4">
                        <img src={alumni.photo || 'https://via.placeholder.com/48'} alt={alumni.name} loading="lazy" className="w-10 h-10 rounded-full object-cover" />
                        <div>
                          <h4 className="text-sm font-semibold text-white">{alumni.name}</h4>
                          <span className="text-[10px] text-[#b8b8b8] block mt-0.5">{alumni.currentOccupation} - {alumni.company}</span>
                        </div>
                      </div>
                      <p className="text-right text-[10px] text-[#7a7a7a] font-medium mt-2 italic">-Lulusan {alumni.graduationYear}</p>
                    </div>
                  ))}
                </div>

                {/* Mobile Navigation Dots */}
                {(() => {
                  const totalDots = Math.ceil((data.alumnis || []).length / 3);
                  if (totalDots <= 1) return null;
                  return (
                    <div className="flex justify-start gap-2 mt-4">
                      {Array.from({ length: totalDots }).map((_, dot) => (
                        <button
                          key={dot}
                          className={`w-2 h-2 rounded-full border-0 transition-all ${
                            currentTestimonialSlide === dot ? 'bg-yellow-300' : 'bg-white/30'
                          }`}
                          onClick={() => setCurrentTestimonialSlide(dot)}
                        ></button>
                      ))}
                    </div>
                  );
                })()}
              </div>
            </div>

            {/* Right - Info */}
            <div className="w-full lg:w-[400px] flex-shrink-0 order-first lg:order-last">
              <h2 className="russo text-xl sm:text-2xl lg:text-[28px] leading-snug text-white">
                {hp.testimonialsTitle || 'Cerita pengalaman menarik dan berkesan oleh alumni kami'}
              </h2>
              <p className="text-sm sm:text-base leading-relaxed text-white mt-3 lg:mt-5">
                {hp.testimonialsDescription || 'SMK Kristen 5 Klaten telah memiliki sertifikat ISO 9008:2015 dan menggandeng mitra industri guna menjamin mutu pendidikan dan keselarasan dengan industri.'}
              </p>
              <button
                onClick={() => setShowReviewModal(true)}
                className="inline-flex items-center px-5 lg:px-7 py-3 lg:py-3.5 bg-transparent border-2 border-yellow-300 text-yellow-300 text-[11px] lg:text-xs font-semibold rounded-lg mt-5 lg:mt-8 hover:bg-yellow-300/10 hover:-translate-y-0.5 transition-all tracking-wide"
              >
                {hp.testimonialsButtonText || 'BAGIKAN CERITAMU'}
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* News Section */}
      <section className="py-10 lg:py-16 max-w-[1400px] mx-auto px-6 lg:px-16">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Left - Main Featured with smaller articles */}
          <div className="flex-1">
            {/* Main Featured Article */}
            {data.articles[0] && (
              <Link to={`/artikel/${data.articles[0].slug}`} className="relative rounded-xl overflow-hidden mb-4 block group">
                <div className="relative h-[220px] sm:h-[280px] lg:h-[320px]">
                  <img
                    src={data.articles[0].featuredImage?.url || data.articles[0].featuredImage || 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=800&h=600&fit=crop'}
                    alt={data.articles[0].title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  {/* Dark overlay */}
                  <div className="absolute inset-0 bg-gradient-to-r from-[#1e1e1e]/95 via-[#1e1e1e]/70 to-transparent lg:to-transparent to-[#1e1e1e]/30"></div>

                  {/* Content on left */}
                  <div className="absolute inset-0 p-4 lg:p-6 flex flex-col justify-center max-w-full lg:max-w-[55%]">
                    <h2 className="text-base sm:text-xl lg:text-2xl font-bold text-white leading-tight mb-2 lg:mb-3 line-clamp-2 lg:line-clamp-none">
                      {data.articles[0].title}
                    </h2>
                    <span className="text-yellow-400 text-[10px] lg:text-xs font-medium mb-2 lg:mb-3">
                      {data.articles[0].categoryJurusan?.name || data.articles[0].categoryTopik?.name || 'Berita'}
                    </span>
                    <p className="text-xs lg:text-sm text-gray-300 leading-relaxed line-clamp-2 lg:line-clamp-4 hidden sm:block">
                      {data.articles[0].excerpt || 'SMK Kristen 5 Klaten telah memiliki sertifikat ISO 9008:2015 dan menggandeng mitra industri guna menjamin mutu pendidikan dan keselarasan dengan industri.'}
                    </p>
                  </div>
                </div>
              </Link>
            )}

            {/* Smaller articles below */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 lg:gap-4">
              {(data.articles || []).slice(1, 3).map((article, idx) => (
                <Link
                  key={idx}
                  to={`/artikel/${article.slug}`}
                  className="flex gap-3 bg-[#1e1e1e] rounded-lg overflow-hidden p-3 hover:bg-[#2a2a2a] transition-colors"
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-white font-medium leading-snug line-clamp-2 sm:line-clamp-3">
                      {article.title}
                    </p>
                    <span className="text-[10px] text-yellow-400 mt-2 block">
                      {article.categoryJurusan?.name || article.categoryTopik?.name || 'Berita'}
                    </span>
                  </div>
                  <div className="w-16 h-14 sm:w-20 sm:h-16 flex-shrink-0 rounded overflow-hidden">
                    <img
                      src={article.featuredImage?.url || article.featuredImage || 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=200&h=150&fit=crop'}
                      alt={article.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                </Link>
              ))}
            </div>
          </div>

          {/* Right - TOP 5 BERITA */}
          <div className="w-full lg:w-[280px] flex-shrink-0 mt-6 lg:mt-0">
            <div className="flex items-center gap-2 mb-4 lg:mb-6">
              <div className="w-1 h-5 lg:h-6 bg-[#0d76be] rounded-full"></div>
              <h3 className="text-base lg:text-lg font-bold text-gray-900">{hp.newsTopTitle || 'TOP 5 BERITA'}</h3>
            </div>

            <div className="space-y-4 lg:space-y-5">
              {(data.articles || []).slice(0, 5).map((article, idx) => (
                <Link
                  key={idx}
                  to={`/artikel/${article.slug}`}
                  className="flex gap-3 group"
                >
                  <span className="text-xl lg:text-2xl font-bold text-gray-200 group-hover:text-[#0d76be] transition-colors">
                    {String(idx + 1).padStart(2, '0')}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm lg:text-base font-medium text-gray-800 leading-snug group-hover:text-[#0d76be] transition-colors line-clamp-2 lg:line-clamp-3">
                      {article.title}
                    </p>
                    <span className="text-[10px] lg:text-xs text-[#0d76be] mt-1 block">
                      {article.categoryJurusan?.name || article.categoryTopik?.name || 'Berita'}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* BERITA UTAMA - Bottom section */}
        <div className="mt-8 lg:mt-12">
          <div className="mb-4 lg:mb-6">
            <h3 className="text-base lg:text-lg font-bold text-gray-900">{hp.newsMainTitle || 'BERITA UTAMA'}</h3>
            <div className="w-10 lg:w-12 h-1 bg-[#0d76be] mt-2 rounded-full"></div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6 md:gap-0">
            {(data.articles || []).slice(0, 3).map((article, idx) => (
              <Link
                key={idx}
                to={`/artikel/${article.slug}`}
                className={`group ${idx < 2 ? 'md:border-r md:border-gray-200 md:pr-6 md:mr-6' : ''}`}
              >
                <h4 className="text-sm lg:text-base font-semibold text-gray-800 leading-snug group-hover:text-[#0d76be] transition-colors line-clamp-2">
                  {article.title}
                </h4>
                <span className="text-[10px] lg:text-xs text-[#0d76be] mt-1 lg:mt-2 block">
                  {article.categoryJurusan?.name || article.categoryTopik?.name || 'Berita'}
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Events Section */}
      <section className="py-12 lg:py-20 relative" style={{ background: 'linear-gradient(to bottom, transparent 50px, rgba(13,118,190,0.15) 50%, rgba(13,118,190,0.31) 100%)' }}>
        <div className="max-w-[1400px] mx-auto px-6 lg:px-16">
        <div className="text-center mb-6 lg:mb-8">
          <h2 className="text-base lg:text-lg font-bold text-black">{hp.eventsTitle || 'KEGIATAN SISWA DAN GURU'}</h2>
          <p className="text-sm lg:text-base leading-relaxed text-gray-600 font-medium max-w-3xl mx-auto mt-2 px-2">
            {hp.eventsDescription || 'AGENDA YANG AKAN HADIR DI SMK KRISTEN 5 KLATEN, BAIK ACARA DI SEKOLAH ATAUPUN LUAR SEKOLAH'}
          </p>
        </div>

        {/* Tabs */}
        <div className="flex justify-center gap-1 lg:gap-2 mb-8 lg:mb-10 border border-[#62B4DD] rounded-full p-1 lg:p-1.5 w-fit mx-auto">
          {[
            { key: 'semua', label: 'Semua' },
            { key: 'akademik', label: 'Akademik' },
            { key: 'non akademik', label: 'Non Akademik' },
          ].map((tab, idx) => (
            <div
              key={idx}
              onClick={() => filterEvents(tab.key)}
              className={`px-3 sm:px-5 lg:px-8 py-2 lg:py-2.5 rounded-full text-[10px] sm:text-xs font-medium cursor-pointer transition-all whitespace-nowrap ${
                activeEventFilter === tab.key
                  ? 'bg-[rgba(207,233,246,0.5)] text-gray-700'
                  : 'text-[#0d76be]'
              }`}
            >
              {tab.label}
            </div>
          ))}
        </div>

        {/* Events Grid */}
        {(() => {
          const filteredEvents = (data.events || []).filter(event => {
            if (activeEventFilter === 'semua') return true;
            if (activeEventFilter === 'akademik') return event.category === 'akademik';
            if (activeEventFilter === 'non akademik') return event.category === 'non-akademik';
            return true;
          });

          const formatEventDate = (dateString) => {
            const date = new Date(dateString);
            const days = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
            const months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
            return {
              day: String(date.getDate()).padStart(2, '0'),
              month: months[date.getMonth()],
              fullDate: `${days[date.getDay()]}, ${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear()}`
            };
          };

          return (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 lg:gap-5 mb-8 lg:mb-10">
              {filteredEvents.length > 0 ? (
                filteredEvents.slice(0, 6).map((event, idx) => {
                  const dateInfo = formatEventDate(event.eventDate);
                  return (
                    <div
                      key={event._id || idx}
                      className="flex gap-3 lg:gap-4 items-start p-3 lg:p-5 bg-white/40 backdrop-blur-xl border border-white/80 rounded-xl shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all"
                    >
                      <div className="bg-[#f6efe4] px-3 sm:px-5 lg:px-6 py-3 sm:py-4 lg:py-5 rounded-lg text-center flex-shrink-0">
                        <div className="russo text-xl sm:text-2xl lg:text-[26px] leading-none text-black">
                          {dateInfo.day}
                        </div>
                        <div className="text-[10px] lg:text-xs text-gray-700 mt-1 font-medium">{dateInfo.month.toUpperCase()}</div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <span className={`text-[10px] lg:text-[11px] font-semibold uppercase tracking-wide ${
                          event.category === 'akademik' ? 'text-[#008fd7]' : 'text-purple-600'
                        }`}>
                          {event.category === 'akademik' ? 'AKADEMIK' : 'NON AKADEMIK'}
                        </span>
                        <h4 className="text-sm lg:text-base font-semibold text-black mt-0.5 line-clamp-1">{event.title}</h4>
                        <div className="flex flex-row flex-wrap gap-3 lg:gap-5 mt-2 lg:mt-3 text-xs lg:text-sm text-gray-700">
                          <div className="flex items-center gap-1.5">
                            <span>📅</span>
                            <span>{dateInfo.fullDate}</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <span>🕐</span>
                            <span>{event.startTime} - {event.endTime}</span>
                          </div>
                          {event.location && (
                            <div className="flex items-center gap-1.5">
                              <span>📍</span>
                              <span>{event.location}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="col-span-2 text-center py-8">
                  <p className="text-gray-600">{'Belum ada agenda yang tersedia.'}</p>
                </div>
              )}
            </div>
          );
        })()}


        <button className="flex items-center justify-center px-5 lg:px-7 py-3 lg:py-3.5 bg-[#0d76be] hover:bg-[#0a5a91] text-white text-[11px] lg:text-xs font-semibold rounded-lg mx-auto shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all tracking-wide">
          {hp.eventsButtonText || 'LIHAT SEMUA AGENDA'}
        </button>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative min-h-[400px] lg:h-[550px] overflow-hidden flex">
        <img
          src={data.cta?.backgroundImage || 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=1920&h=1080&fit=crop'}
          alt="CTA Background"
          className="absolute inset-0 w-full h-full object-cover z-10"
        />
        <div className="absolute inset-0 bg-black/55 z-20"></div>
        <div
          className="absolute inset-0 z-30 hidden lg:block"
          style={{
            background: 'linear-gradient(90deg, rgba(30, 30, 30, 0.7) 0%, rgba(30, 30, 30, 0.7) 47%, rgba(255, 221, 85, 0.7) 47%, rgba(255, 221, 85, 0.7) 100%)',
          }}
        ></div>
        {/* Mobile gradient */}
        <div className="absolute inset-0 z-30 lg:hidden bg-gradient-to-b from-[#1e1e1e]/60 via-[#1e1e1e]/70 to-[rgba(255,221,85,0.7)]"></div>

        <div className="relative z-40 flex items-center justify-center w-full min-h-[400px] lg:min-h-[550px] px-4 sm:px-6 lg:px-20 lg:pl-[50%] py-16 lg:py-0">
          <div className="max-w-[550px] text-center lg:text-left">
            <h2 className="russo text-xl sm:text-2xl lg:text-[28px] leading-snug text-white uppercase">
              {data.cta?.title || 'MARI DISKUSIKAN BAKAT & MINAT KAMU, KAMI AKAN MEMBANTU MENEMUKAN SESUAI PASSION ANDA'}
            </h2>
            <p className="text-sm sm:text-base lg:text-lg leading-relaxed text-white/90 mt-3 lg:mt-4">
              {data.cta?.description || 'SMK Kristen 5 Klaten telah memiliki sertifikat ISO 9008:2015 dan menggandeng mitra industri guna menjamin mutu pendidikan dan keselarasan dengan industri.'}
            </p>
            <div className="flex gap-3 lg:gap-4 mt-5 lg:mt-7 flex-wrap justify-center lg:justify-start">
              <Link
                to={data.cta?.primaryButtonLink || '/pendaftaran'}
                className="bg-gradient-to-br from-yellow-300 to-yellow-400 text-gray-900 px-5 lg:px-7 py-3 lg:py-3.5 rounded-lg text-[11px] lg:text-xs font-semibold uppercase tracking-wide shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all"
              >
                {data.cta?.primaryButtonText || 'DAFTAR SEKARANG'}
              </Link>
              {(data.cta?.secondaryButtonText || !data.cta) && (
                <Link
                  to={data.cta?.secondaryButtonLink || '/kontak'}
                  className="bg-transparent text-white px-5 lg:px-7 py-3 lg:py-3.5 border-2 border-white rounded-lg text-[11px] lg:text-xs font-semibold uppercase tracking-wide hover:bg-white/10 hover:-translate-y-0.5 transition-all"
                >
                  {data.cta?.secondaryButtonText || 'LAYANAN INFORMASI'}
                </Link>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <Footer />

      {/* Alumni Review Submission Modal */}
      {showReviewModal && (
        <div className="fixed inset-0 bg-black/60 z-[100] flex items-center justify-center p-4" onClick={(e) => e.target === e.currentTarget && closeReviewModal()}>
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl flex flex-col max-h-[90vh]">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <div>
                <h2 className="text-lg font-bold text-gray-800">Bagikan Ceritamu</h2>
                <p className="text-xs text-gray-500 mt-0.5">Ceritamu akan ditampilkan setelah diverifikasi admin</p>
              </div>
              <button onClick={closeReviewModal} className="text-gray-400 hover:text-gray-600 transition-colors p-1">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {reviewSubmitState === 'success' ? (
              /* Success state */
              <div className="flex flex-col items-center justify-center py-12 px-6 text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                  <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-gray-800 mb-2">Terima Kasih!</h3>
                <p className="text-gray-500 text-sm leading-relaxed max-w-xs">
                  Ceritamu sedang menunggu persetujuan kami dan akan segera tampil di halaman ini.
                </p>
                <button onClick={closeReviewModal} className="mt-6 px-6 py-2.5 bg-[#0d76be] hover:bg-[#0a5a91] text-white text-sm font-semibold rounded-lg transition-colors">
                  Tutup
                </button>
              </div>
            ) : (
              /* Form */
              <form onSubmit={handleReviewSubmit} className="overflow-y-auto flex-1">
                <div className="px-6 py-5 space-y-4">
                  {/* Photo upload */}
                  <div className="flex flex-col items-center">
                    <label className="cursor-pointer group relative">
                      <div className={`w-20 h-20 rounded-full border-2 border-dashed flex items-center justify-center overflow-hidden transition-colors ${reviewForm.photoPreview ? 'border-transparent' : 'border-gray-300 group-hover:border-[#0d76be]'}`}>
                        {reviewForm.photoPreview ? (
                          <img src={reviewForm.photoPreview} alt="preview" className="w-full h-full object-cover" />
                        ) : (
                          <div className="text-center">
                            <svg className="w-7 h-7 text-gray-400 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                          </div>
                        )}
                      </div>
                      {reviewForm.photoPreview && (
                        <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                          <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                        </div>
                      )}
                      <input type="file" accept="image/*" className="hidden" onChange={handleReviewPhotoChange} />
                    </label>
                    <p className="text-xs text-gray-500 mt-2">Foto Profil <span className="text-red-500">*</span></p>
                  </div>

                  {/* Name */}
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Nama Lengkap <span className="text-red-500">*</span></label>
                    <input
                      type="text"
                      value={reviewForm.name}
                      onChange={(e) => setReviewForm((f) => ({ ...f, name: e.target.value }))}
                      placeholder="Nama kamu"
                      maxLength={100}
                      className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#0d76be]/40 focus:border-[#0d76be]"
                    />
                  </div>

                  {/* Year + Jurusan */}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">Tahun Lulus <span className="text-red-500">*</span></label>
                      <input
                        type="number"
                        value={reviewForm.graduationYear}
                        onChange={(e) => setReviewForm((f) => ({ ...f, graduationYear: e.target.value }))}
                        placeholder={String(new Date().getFullYear() - 2)}
                        min={1990}
                        max={new Date().getFullYear()}
                        className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#0d76be]/40 focus:border-[#0d76be]"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">Jurusan <span className="text-red-500">*</span></label>
                      <input
                        type="text"
                        value={reviewForm.jurusan}
                        onChange={(e) => setReviewForm((f) => ({ ...f, jurusan: e.target.value }))}
                        placeholder="Jurusanmu"
                        maxLength={100}
                        className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#0d76be]/40 focus:border-[#0d76be]"
                      />
                    </div>
                  </div>

                  {/* Occupation + Company */}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">Pekerjaan / Jabatan</label>
                      <input
                        type="text"
                        value={reviewForm.currentOccupation}
                        onChange={(e) => setReviewForm((f) => ({ ...f, currentOccupation: e.target.value }))}
                        placeholder="UI/UX Designer"
                        maxLength={200}
                        className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#0d76be]/40 focus:border-[#0d76be]"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">Perusahaan / Institusi</label>
                      <input
                        type="text"
                        value={reviewForm.company}
                        onChange={(e) => setReviewForm((f) => ({ ...f, company: e.target.value }))}
                        placeholder="PT Contoh"
                        maxLength={200}
                        className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#0d76be]/40 focus:border-[#0d76be]"
                      />
                    </div>
                  </div>

                  {/* Testimonial */}
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Ceritamu <span className="text-red-500">*</span>
                      <span className="text-gray-400 font-normal ml-1">({reviewForm.testimonial.length}/1000)</span>
                    </label>
                    <textarea
                      value={reviewForm.testimonial}
                      onChange={(e) => setReviewForm((f) => ({ ...f, testimonial: e.target.value }))}
                      placeholder="Ceritakan pengalamanmu selama bersekolah di sini, pencapaian, atau pesan untuk adik kelas..."
                      rows={4}
                      maxLength={1000}
                      className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#0d76be]/40 focus:border-[#0d76be] resize-none"
                    />
                  </div>

                  {/* Error */}
                  {reviewError && (
                    <p className="text-sm text-red-500 bg-red-50 border border-red-100 rounded-lg px-3 py-2">{reviewError}</p>
                  )}
                </div>

                {/* Footer actions */}
                <div className="px-6 py-4 border-t border-gray-100 flex gap-3">
                  <button type="button" onClick={closeReviewModal} className="flex-1 py-2.5 text-sm text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors font-medium">
                    Batal
                  </button>
                  <button
                    type="submit"
                    disabled={reviewSubmitState === 'submitting'}
                    className="flex-1 py-2.5 text-sm bg-[#0d76be] hover:bg-[#0a5a91] disabled:opacity-60 text-white rounded-lg font-semibold transition-colors flex items-center justify-center gap-2"
                  >
                    {reviewSubmitState === 'submitting' ? (
                      <>
                        <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                        </svg>
                        Mengirim...
                      </>
                    ) : 'Kirim Ceritamu'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default HomepageFixed;
