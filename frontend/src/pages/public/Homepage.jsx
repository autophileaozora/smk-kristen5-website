import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';

const Homepage = () => {
  // State for data from API
  const [runningTexts, setRunningTexts] = useState([]);
  const [jurusans, setJurusans] = useState([]);
  const [prestasis, setPrestasis] = useState([]);
  const [ekskuls, setEkskuls] = useState([]);
  const [alumnis, setAlumnis] = useState([]);
  const [loading, setLoading] = useState(true);

  // State for navbar scroll
  const [isScrolled, setIsScrolled] = useState(false);

  // State for ekspanded ekskul
  const [expandedEkskul, setExpandedEkskul] = useState(0);

  // Refs for carousels
  const jurusanScrollRef = useRef(null);
  const prestasiScrollRef = useRef(null);
  const alumniScrollRef = useRef(null);

  useEffect(() => {
    fetchAllData();
  }, []);

  useEffect(() => {
    // Handle navbar scroll and smooth parallax for Jurusan
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
      
      // Smooth parallax auto-scroll for Jurusan section
      if (jurusanScrollRef.current && jurusans.length > 0) {
        const section = jurusanScrollRef.current.parentElement.parentElement;
        const sectionTop = section.offsetTop;
        const sectionHeight = section.offsetHeight;
        const scrollY = window.scrollY;
        const windowHeight = window.innerHeight;
        
        // Start scrolling when section enters viewport
        const sectionStart = sectionTop - windowHeight;
        const sectionEnd = sectionTop + sectionHeight;
        
        if (scrollY > sectionStart && scrollY < sectionEnd) {
          // Calculate scroll progress (0 to 1)
          const progress = (scrollY - sectionStart) / (sectionEnd - sectionStart);
          
          // Calculate horizontal scroll amount
          const maxScroll = jurusanScrollRef.current.scrollWidth - jurusanScrollRef.current.clientWidth;
          const scrollAmount = progress * maxScroll * 1.2; // 1.2x multiplier for smoother effect
          
          // Apply horizontal scroll smoothly
          jurusanScrollRef.current.scrollLeft = scrollAmount;
        }
      }
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [jurusans.length]);

  const fetchAllData = async () => {
    try {
      setLoading(true);
      const [runningTextRes, jurusanRes, prestasiRes, ekskulRes, alumniRes] = await Promise.all([
        api.get('/api/running-text/active'),
        api.get('/api/jurusan'),
        api.get('/api/prestasi'),
        api.get('/api/ekskul/active'),
        api.get('/api/alumni/featured'),
      ]);

      setRunningTexts(runningTextRes.data.data.runningTexts || []);
      setJurusans(jurusanRes.data.data.jurusans.filter(j => j.isActive) || []);
      setPrestasis(prestasiRes.data.data.prestasis.filter(p => p.isActive).slice(0, 6) || []);
      setEkskuls(ekskulRes.data.data.ekskuls || []);
      setAlumnis(alumniRes.data.data.alumnis || []);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Get level badge color
  const getLevelBadgeColor = (level) => {
    const colors = {
      internasional: 'bg-purple-600',
      nasional: 'bg-blue-600',
      provinsi: 'bg-green-600',
      kabupaten: 'bg-yellow-600',
      sekolah: 'bg-gray-600',
      lainnya: 'bg-gray-500',
    };
    return colors[level] || 'bg-gray-500';
  };

  return (
    <div className="font-poppins">
      {/* Navbar */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled ? 'bg-white shadow-md' : 'bg-transparent'
      }`}>
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-20">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <img 
                src="/logo.svg" 
                alt="SMK Kristen 5 Klaten" 
                className="h-12 w-12"
              />
              <div className={`transition-colors ${isScrolled ? 'text-dark-gray' : 'text-white'}`}>
                <h1 className="font-russo text-lg leading-tight">SMK KRISTEN 5</h1>
                <p className="text-xs">KLATEN</p>
              </div>
            </div>

            {/* Menu */}
            <div className="hidden md:flex items-center gap-8">
              <Link 
                to="/" 
                className={`font-medium transition-colors ${
                  isScrolled ? 'text-dark-gray hover:text-blue-primary' : 'text-white hover:text-yellow-accent'
                }`}
              >
                Beranda
              </Link>
              <Link 
                to="/jurusan" 
                className={`font-medium transition-colors ${
                  isScrolled ? 'text-dark-gray hover:text-blue-primary' : 'text-white hover:text-yellow-accent'
                }`}
              >
                Jurusan
              </Link>
              <Link 
                to="/artikel" 
                className={`font-medium transition-colors ${
                  isScrolled ? 'text-dark-gray hover:text-blue-primary' : 'text-white hover:text-yellow-accent'
                }`}
              >
                Artikel
              </Link>
              <Link 
                to="/tentang" 
                className={`font-medium transition-colors ${
                  isScrolled ? 'text-dark-gray hover:text-blue-primary' : 'text-white hover:text-yellow-accent'
                }`}
              >
                Tentang
              </Link>
            </div>

            {/* CTA Button & Search */}
            <div className="flex items-center gap-4">
              <button className={`p-2 rounded-full transition-colors ${
                isScrolled ? 'hover:bg-gray-100' : 'hover:bg-white/20'
              }`}>
                <svg className={`w-5 h-5 ${isScrolled ? 'text-dark-gray' : 'text-white'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </button>
              <button className="bg-blue-secondary hover:bg-blue-primary text-white px-6 py-2 rounded-full font-medium transition-colors">
                HUBUNGI KAMI
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative h-screen">
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: 'url(https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=1920&h=1080&fit=crop)',
          }}
        >
          <div className="absolute inset-0 bg-black/60"></div>
        </div>
        <div className="relative h-full flex items-center justify-center text-center px-4">
          <div className="max-w-4xl">
            <h1 className="font-russo text-5xl md:text-7xl text-white mb-6">
              SMK KRISTEN 5 KLATEN
            </h1>
            <p className="text-xl md:text-2xl text-white/90 mb-8">
              Membangun Generasi Unggul dengan Karakter dan Kompetensi
            </p>
          </div>
        </div>
      </section>

      {/* Running Text */}
      {runningTexts.length > 0 && (
        <div className="bg-blue-primary py-3 overflow-hidden">
          <div className="animate-marquee whitespace-nowrap">
            {runningTexts.map((text, index) => (
              <span key={index} className="text-white mx-8">
                {text.text}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Kompetensi Jurusan Section - Horizontal Scroll with Sticky */}
      <section className="relative h-[300vh] bg-light-gray"> {/* 3x viewport height for scroll effect */}
        <div className="sticky top-0 h-screen flex items-center overflow-hidden">
          <div className="w-full">
            {/* Header */}
            <div className="container mx-auto px-4 mb-12">
              <h2 className="font-russo text-3xl md:text-4xl text-dark-gray mb-4">
                KOMPETENSI JURUSAN
              </h2>
              <p className="text-gray-600 max-w-3xl uppercase tracking-wide">
                PILIH JURUSAN YANG SESUAI DENGAN BAKAT & MINAT ANDA
              </p>
            </div>

            {loading ? (
              <div className="text-center py-12">
                <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-primary"></div>
              </div>
            ) : (
              <div className="container mx-auto px-4">
                <div 
                  ref={jurusanScrollRef}
                  className="flex gap-6 will-change-transform"
                >
                  {jurusans.map((jurusan, index) => (
                    <div
                      key={jurusan._id}
                      className="group relative flex-shrink-0 w-[450px] h-[550px] rounded-2xl overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-300"
                    >
                      {/* Background Image */}
                      <div 
                        className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-110"
                        style={{
                          backgroundImage: jurusan.backgroundImage 
                            ? `url(${jurusan.backgroundImage})`
                            : 'url(https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=450&h=550&fit=crop)',
                        }}
                      >
                        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-black/40"></div>
                      </div>

                      {/* Content */}
                      <div className="relative h-full p-8 flex flex-col justify-between">
                        {/* Top Badge */}
                        <div className="flex items-center gap-3">
                          <div className="bg-dark-gray backdrop-blur-sm px-5 py-3 rounded-lg shadow-lg">
                            <div className="text-white font-russo text-3xl leading-none">
                              {String(index + 1).padStart(2, '0')}
                            </div>
                          </div>
                          <div className="text-white uppercase text-xs font-bold tracking-widest leading-tight">
                            JURUSAN<br />
                            <span className="text-blue-secondary">{jurusan.code || 'TKJ'}</span>
                          </div>
                        </div>

                        {/* Bottom Content */}
                        <div className="space-y-5">
                          {/* Title */}
                          <h3 className="font-russo text-4xl text-white leading-tight group-hover:text-yellow-accent transition-colors">
                            {jurusan.name.toUpperCase()}
                          </h3>
                          
                          {/* Hashtags */}
                          <div className="flex flex-wrap gap-2">
                            {jurusan.competencies && jurusan.competencies.length > 0 ? (
                              jurusan.competencies.slice(0, 3).map((comp, idx) => (
                                <span 
                                  key={idx}
                                  className="text-yellow-accent text-sm font-bold uppercase tracking-wide"
                                >
                                  #{comp.replace(/\s+/g, '').toUpperCase()}
                                </span>
                              ))
                            ) : (
                              <>
                                <span className="text-yellow-accent text-sm font-bold">#TECHNOLOGY</span>
                                <span className="text-yellow-accent text-sm font-bold">#NETWORK</span>
                                <span className="text-yellow-accent text-sm font-bold">#ADMINISTRATOR</span>
                              </>
                            )}
                          </div>

                          {/* DAFTAR Button */}
                          <Link
                            to={`/jurusan/${jurusan.slug}`}
                            className="inline-flex items-center gap-2 text-white font-bold text-xl group-hover:text-yellow-accent transition-all"
                          >
                            <span className="font-russo tracking-wider">DAFTAR</span>
                            <svg 
                              className="w-6 h-6 transition-transform group-hover:translate-x-2" 
                              fill="none" 
                              stroke="currentColor" 
                              viewBox="0 0 24 24"
                              strokeWidth={3}
                            >
                              <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                            </svg>
                          </Link>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section 
        className="relative py-20 bg-cover bg-center"
        style={{
          backgroundImage: 'url(https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=1920&h=600&fit=crop)',
        }}
      >
        <div className="absolute inset-0 bg-blue-primary/90"></div>
        <div className="relative container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="flex-1 text-white">
              <h2 className="font-russo text-3xl md:text-4xl mb-4">
                RAGU ATAU BELUM TAU MINAT KAMU?
              </h2>
              <p className="text-xl mb-6">
                Kami siap membantu menyalurkan sesuai passion anak
              </p>
              <button className="bg-yellow-accent hover:bg-yellow-500 text-dark-gray px-8 py-3 rounded-full font-semibold transition-colors">
                DAFTAR SEKARANG
              </button>
            </div>
            <div className="text-white text-right">
              <p className="text-sm mb-2">DAPATKAN INFORMASI MELALUI KAMI</p>
              <p className="font-semibold">📞 +62 812-3456-7890</p>
              <p className="font-semibold">📧 info@smkkristen5klaten.sch.id</p>
              <p className="font-semibold">📍 Jl. Merbabu No. 11, Klaten</p>
            </div>
          </div>
        </div>
      </section>

      {/* Prestasi Section */}
      <section className="py-16 bg-cream">
        <div className="container mx-auto px-4">
          <h2 className="font-russo text-3xl md:text-4xl text-center text-dark-gray mb-4">
            PRESTASI
          </h2>
          <p className="text-center text-gray-600 mb-12 max-w-4xl mx-auto leading-relaxed">
            Prestasi adalah bukti nyata dari dedikasi, kerja keras, dan komitmen siswa-siswa kami dalam berbagai bidang. 
            Dari kompetisi akademik hingga lomba olahraga, siswa SMK Kristen 5 Klaten terus menunjukkan keunggulan 
            dan semangat juang yang luar biasa di tingkat lokal, nasional, hingga internasional.
          </p>

          {loading ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-primary"></div>
            </div>
          ) : (
            <div ref={prestasiScrollRef} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {prestasis.map((prestasi) => (
                <div
                  key={prestasi._id}
                  className="group relative h-[400px] rounded-lg overflow-hidden shadow-lg hover:shadow-2xl transition-shadow"
                >
                  {/* Background Image */}
                  <div 
                    className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-110"
                    style={{
                      backgroundImage: prestasi.image 
                        ? `url(${prestasi.image})`
                        : 'url(https://images.unsplash.com/photo-1552664730-d307ca884978?w=600&h=400&fit=crop)',
                    }}
                  >
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent"></div>
                  </div>

                  {/* Content */}
                  <div className="relative h-full p-6 flex flex-col justify-between">
                    {/* Badge */}
                    <div className="self-start">
                      <span className={`${getLevelBadgeColor(prestasi.level)} text-white text-xs font-bold px-3 py-1 rounded-full uppercase`}>
                        {prestasi.level}
                      </span>
                    </div>

                    {/* Title & Info */}
                    <div className="text-white">
                      <h3 className="font-bold text-xl mb-2 group-hover:text-yellow-accent transition-colors">
                        {prestasi.title}
                      </h3>
                      <p className="text-sm text-white/90 mb-3 line-clamp-2">
                        {prestasi.description}
                      </p>
                      <div className="flex items-center gap-4 text-xs text-white/80">
                        <span>📅 {new Date(prestasi.achievementDate).toLocaleDateString('id-ID')}</span>
                        {prestasi.location && <span>📍 {prestasi.location}</span>}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Ekstrakurikuler Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="font-russo text-3xl md:text-4xl text-center text-dark-gray mb-12">
            EKSTRAKURIKULER
          </h2>

          {loading ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-primary"></div>
            </div>
          ) : (
            <div className="max-w-4xl mx-auto space-y-4">
              {ekskuls.map((ekskul, index) => (
                <div key={ekskul._id} className="border rounded-lg overflow-hidden">
                  <button
                    onClick={() => setExpandedEkskul(expandedEkskul === index ? -1 : index)}
                    className="w-full flex items-center justify-between p-6 hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <span className="text-gray-400 font-mono text-sm">
                        {String(index + 1).padStart(3, '0')}
                      </span>
                      <h3 className="font-russo text-xl text-dark-gray">
                        {ekskul.name}
                      </h3>
                    </div>
                    <span className="text-2xl text-gray-400">
                      {expandedEkskul === index ? '−' : '+'}
                    </span>
                  </button>

                  {expandedEkskul === index && (
                    <div className="p-6 bg-gray-50 border-t">
                      <div className="flex flex-col md:flex-row gap-6">
                        {ekskul.image && (
                          <img
                            src={ekskul.image}
                            alt={ekskul.name}
                            className="w-full md:w-64 h-48 object-cover rounded-lg"
                          />
                        )}
                        <div className="flex-1">
                          <p className="text-gray-700 mb-4">{ekskul.description}</p>
                          <div className="space-y-2 text-sm text-gray-600">
                            {ekskul.coach && (
                              <p><span className="font-semibold">Pembina:</span> {ekskul.coach}</p>
                            )}
                            {ekskul.schedule && (
                              <p><span className="font-semibold">Jadwal:</span> {ekskul.schedule}</p>
                            )}
                            {ekskul.location && (
                              <p><span className="font-semibold">Lokasi:</span> {ekskul.location}</p>
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

      {/* Testimoni Alumni Section */}
      <section className="py-16 bg-cream">
        <div className="container mx-auto px-4">
          <h2 className="font-russo text-3xl md:text-4xl text-center text-dark-gray mb-4">
            TESTIMONI DAN CERITA ALUMNI
          </h2>
          <p className="text-center text-gray-600 mb-12 max-w-2xl mx-auto">
            Dengarkan langsung cerita dan pengalaman alumni kami yang telah sukses berkarir di berbagai bidang
          </p>

          {loading ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-primary"></div>
            </div>
          ) : (
            <div ref={alumniScrollRef} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {alumnis.map((alumni) => (
                <div
                  key={alumni._id}
                  className="bg-white rounded-lg p-6 shadow-lg hover:shadow-xl transition-shadow"
                >
                  <div className="flex items-start gap-4 mb-4">
                    <img
                      src={alumni.photo || 'https://i.pravatar.cc/150'}
                      alt={alumni.name}
                      className="w-16 h-16 rounded-full object-cover"
                    />
                    <div>
                      <h3 className="font-bold text-lg text-dark-gray">{alumni.name}</h3>
                      <p className="text-sm text-gray-600">{alumni.jurusan}</p>
                      <p className="text-xs text-gray-500">Lulusan {alumni.graduationYear}</p>
                    </div>
                  </div>
                  
                  <div className="relative">
                    <span className="text-4xl text-blue-primary opacity-20">"</span>
                    <p className="text-gray-700 text-sm leading-relaxed line-clamp-4">
                      {alumni.testimonial}
                    </p>
                    <span className="text-4xl text-blue-primary opacity-20 float-right">"</span>
                  </div>

                  {alumni.currentOccupation && (
                    <p className="mt-4 text-xs text-gray-600">
                      {alumni.currentOccupation}
                      {alumni.company && ` - ${alumni.company}`}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-dark-gray text-white py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            {/* Logo & Name */}
            <div>
              <div className="flex items-center gap-3 mb-4">
                <img src="/logo.svg" alt="SMK Kristen 5" className="h-12 w-12" />
                <div>
                  <h3 className="font-russo text-lg">SMK KRISTEN 5</h3>
                  <p className="text-xs text-gray-400">KLATEN</p>
                </div>
              </div>
              <p className="text-sm text-gray-400">
                Membangun generasi unggul dengan karakter dan kompetensi
              </p>
            </div>

            {/* Tentang */}
            <div>
              <h4 className="font-russo text-sm mb-4">TENTANG</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><Link to="/tentang" className="hover:text-yellow-accent transition-colors">Profil Sekolah</Link></li>
                <li><Link to="/visi-misi" className="hover:text-yellow-accent transition-colors">Visi & Misi</Link></li>
                <li><Link to="/fasilitas" className="hover:text-yellow-accent transition-colors">Fasilitas</Link></li>
              </ul>
            </div>

            {/* Akademik */}
            <div>
              <h4 className="font-russo text-sm mb-4">AKADEMIK</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><Link to="/jurusan" className="hover:text-yellow-accent transition-colors">Program Keahlian</Link></li>
                <li><Link to="/prestasi" className="hover:text-yellow-accent transition-colors">Prestasi</Link></li>
                <li><Link to="/ekstrakurikuler" className="hover:text-yellow-accent transition-colors">Ekstrakurikuler</Link></li>
              </ul>
            </div>

            {/* Hubungi Kami */}
            <div>
              <h4 className="font-russo text-sm mb-4">HUBUNGI KAMI</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li>📞 +62 812-3456-7890</li>
                <li>📧 info@smkkristen5klaten.sch.id</li>
                <li>📍 Jl. Merbabu No. 11, Klaten</li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-700 pt-8 text-center text-sm text-gray-400">
            <p>&copy; {new Date().getFullYear()} SMK Kristen 5 Klaten. All rights reserved.</p>
          </div>
        </div>
      </footer>

      {/* Custom CSS for animations */}
      <style jsx>{`
        @keyframes marquee {
          0% { transform: translateX(0%); }
          100% { transform: translateX(-100%); }
        }
        .animate-marquee {
          display: inline-block;
          animation: marquee 20s linear infinite;
        }
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  );
};

export default Homepage;
