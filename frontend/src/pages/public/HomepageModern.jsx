import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import { useSchoolLogo } from '../../hooks/useContact';

const HomepageModern = () => {
  // Get school logo from contact info
  const { logo: schoolLogo } = useSchoolLogo();

  // State management
  const [data, setData] = useState({
    runningTexts: [],
    jurusans: [],
    prestasis: [],
    ekskuls: [],
    alumnis: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [expandedEkskul, setExpandedEkskul] = useState(0);

  // Refs
  const jurusanRef = useRef(null);

  // Fetch all data
  useEffect(() => {
    fetchData();
  }, []);

  // Scroll effects
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
      
      // Parallax effect for jurusan cards
      if (jurusanRef.current && data.jurusans.length > 0) {
        const cards = jurusanRef.current.querySelectorAll('.jurusan-card');
        cards.forEach((card, index) => {
          const rect = card.getBoundingClientRect();
          const scrollPercent = (window.innerHeight - rect.top) / window.innerHeight;
          
          if (scrollPercent > 0 && scrollPercent < 1) {
            const translateY = (1 - scrollPercent) * 50;
            card.style.transform = `translateY(${translateY}px)`;
            card.style.opacity = scrollPercent;
          }
        });
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [data.jurusans.length]);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [runningTextRes, jurusanRes, prestasiRes, ekskulRes, alumniRes] = await Promise.all([
        api.get('/api/running-text/active').catch(() => ({ data: { data: { runningTexts: [] } } })),
        api.get('/api/jurusan').catch(() => ({ data: { data: { jurusans: [] } } })),
        api.get('/api/prestasi').catch(() => ({ data: { data: { prestasis: [] } } })),
        api.get('/api/ekskul/active').catch(() => ({ data: { data: { ekskuls: [] } } })),
        api.get('/api/alumni/featured').catch(() => ({ data: { data: { alumnis: [] } } })),
      ]);

      setData({
        runningTexts: runningTextRes.data.data.runningTexts || [],
        jurusans: (jurusanRes.data.data.jurusans || []).filter(j => j.isActive),
        prestasis: (prestasiRes.data.data.prestasis || []).filter(p => p.isActive).slice(0, 6),
        ekskuls: ekskulRes.data.data.ekskuls || [],
        alumnis: alumniRes.data.data.alumnis || [],
      });
    } catch (err) {
      console.error('Error fetching data:', err);
      setError('Failed to load content. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const getLevelGradient = (level) => {
    const gradients = {
      internasional: 'from-purple-500 to-pink-500',
      nasional: 'from-blue-500 to-cyan-500',
      provinsi: 'from-green-500 to-emerald-500',
      kabupaten: 'from-yellow-500 to-orange-500',
      sekolah: 'from-gray-500 to-slate-500',
      lainnya: 'from-gray-400 to-gray-500',
    };
    return gradients[level] || 'from-blue-500 to-cyan-500';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Modern Navbar */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled 
          ? 'bg-white/80 backdrop-blur-lg shadow-lg' 
          : 'bg-transparent'
      }`}>
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-20">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-3 group">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform overflow-hidden">
                <img src={schoolLogo} alt="SMK Kristen 5" className="w-full h-full object-contain" />
              </div>
              <div>
                <h1 className="font-bold text-lg text-slate-800 leading-tight">SMK Kristen 5</h1>
                <p className="text-xs text-slate-500">Klaten</p>
              </div>
            </Link>

            {/* Desktop Menu */}
            <div className="hidden md:flex items-center gap-8">
              <Link to="/" className="text-slate-700 hover:text-blue-600 font-medium transition-colors">
                Beranda
              </Link>
              <Link to="/jurusan" className="text-slate-700 hover:text-blue-600 font-medium transition-colors">
                Jurusan
              </Link>
              <Link to="/artikel" className="text-slate-700 hover:text-blue-600 font-medium transition-colors">
                Artikel
              </Link>
              <Link to="/tentang" className="text-slate-700 hover:text-blue-600 font-medium transition-colors">
                Tentang
              </Link>
              <Link 
                to="/kontak" 
                className="px-6 py-2.5 rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-semibold hover:shadow-lg hover:scale-105 transition-all"
              >
                Hubungi Kami
              </Link>
            </div>

            {/* Mobile Menu Button */}
            <button 
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-lg hover:bg-slate-100"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-white border-t">
            <div className="container mx-auto px-4 py-4 space-y-3">
              <Link to="/" className="block py-2 text-slate-700 hover:text-blue-600">Beranda</Link>
              <Link to="/jurusan" className="block py-2 text-slate-700 hover:text-blue-600">Jurusan</Link>
              <Link to="/artikel" className="block py-2 text-slate-700 hover:text-blue-600">Artikel</Link>
              <Link to="/tentang" className="block py-2 text-slate-700 hover:text-blue-600">Tentang</Link>
              <Link to="/kontak" className="block py-2 px-4 bg-blue-500 text-white rounded-lg text-center">
                Hubungi Kami
              </Link>
            </div>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20">
        {/* Animated Background */}
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 via-indigo-500/20 to-purple-500/20"></div>
          <div className="absolute top-1/4 -left-20 w-96 h-96 bg-blue-400 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob"></div>
          <div className="absolute top-1/3 -right-20 w-96 h-96 bg-indigo-400 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>
          <div className="absolute bottom-1/4 left-1/2 w-96 h-96 bg-purple-400 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-4000"></div>
        </div>

        {/* Hero Content */}
        <div className="relative container mx-auto px-4 text-center">
          <div className="inline-block px-4 py-2 bg-blue-100 text-blue-700 rounded-full text-sm font-semibold mb-6">
            🎓 Selamat Datang di SMK Kristen 5 Klaten
          </div>
          
          <h1 className="text-5xl md:text-7xl font-bold text-slate-800 mb-6 leading-tight">
            Wujudkan Masa Depan
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500">
              Cemerlang Bersama Kami
            </span>
          </h1>
          
          <p className="text-xl text-slate-600 mb-12 max-w-3xl mx-auto leading-relaxed">
            Membangun generasi unggul dengan karakter kuat dan kompetensi profesional di era digital
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link 
              to="/daftar" 
              className="px-8 py-4 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-full font-bold text-lg hover:shadow-2xl hover:scale-105 transition-all"
            >
              Daftar Sekarang →
            </Link>
            <Link 
              to="/jurusan" 
              className="px-8 py-4 bg-white text-slate-800 rounded-full font-bold text-lg hover:shadow-xl hover:scale-105 transition-all border-2 border-slate-200"
            >
              Lihat Jurusan
            </Link>
          </div>

          {/* Stats */}
          <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto">
            {[
              { label: 'Siswa Aktif', value: '1000+' },
              { label: 'Jurusan', value: data.jurusans.length },
              { label: 'Prestasi', value: '50+' },
              { label: 'Alumni Sukses', value: '500+' },
            ].map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-indigo-600">
                  {stat.value}
                </div>
                <div className="text-sm text-slate-600 mt-1">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Running Text */}
      {data.runningTexts.length > 0 && (
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 py-3 overflow-hidden">
          <div className="animate-marquee whitespace-nowrap">
            {[...data.runningTexts, ...data.runningTexts].map((text, index) => (
              <span key={index} className="text-white mx-8 text-sm font-medium">
                ✨ {text.text}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Jurusan Section */}
      <section className="py-24 relative overflow-hidden">
        <div className="container mx-auto px-4">
          {/* Section Header */}
          <div className="text-center mb-16">
            <span className="inline-block px-4 py-2 bg-blue-100 text-blue-700 rounded-full text-sm font-semibold mb-4">
              🎯 Program Keahlian
            </span>
            <h2 className="text-4xl md:text-5xl font-bold text-slate-800 mb-4">
              Pilih Jurusan Impianmu
            </h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              Temukan program keahlian yang sesuai dengan passion dan bakatmu
            </p>
          </div>

          {loading ? (
            <div className="text-center py-20">
              <div className="inline-block w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
              <p className="mt-4 text-slate-600">Memuat data...</p>
            </div>
          ) : data.jurusans.length === 0 ? (
            <div className="text-center py-20 bg-white rounded-3xl shadow-lg">
              <div className="text-6xl mb-4">📚</div>
              <h3 className="text-xl font-bold text-slate-800 mb-2">Belum Ada Jurusan</h3>
              <p className="text-slate-600">Data jurusan akan segera ditambahkan</p>
            </div>
          ) : (
            <div ref={jurusanRef} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {data.jurusans.map((jurusan, index) => (
                <Link
                  key={jurusan._id}
                  to={`/jurusan/${jurusan.slug}`}
                  className="jurusan-card group relative h-[500px] rounded-3xl overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-500"
                  style={{ opacity: 0, transform: 'translateY(50px)' }}
                >
                  {/* Background Image */}
                  <div 
                    className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-110"
                    style={{
                      backgroundImage: jurusan.backgroundImage 
                        ? `url(${jurusan.backgroundImage})`
                        : `url(https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=500&h=500&fit=crop)`,
                    }}
                  >
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/50 to-transparent"></div>
                  </div>

                  {/* Content */}
                  <div className="relative h-full p-8 flex flex-col justify-between">
                    {/* Badge */}
                    <div className="inline-flex items-center gap-2 self-start px-4 py-2 rounded-full bg-white/20 backdrop-blur-sm">
                      <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse"></span>
                      <span className="text-white text-sm font-semibold">{jurusan.code || 'TKJ'}</span>
                    </div>

                    {/* Title & Description */}
                    <div>
                      <h3 className="text-3xl font-bold text-white mb-3 group-hover:text-blue-300 transition-colors">
                        {jurusan.name}
                      </h3>
                      <p className="text-white/80 text-sm line-clamp-2 mb-4">
                        {jurusan.description}
                      </p>
                      
                      {/* Competencies */}
                      {jurusan.competencies && jurusan.competencies.length > 0 && (
                        <div className="flex flex-wrap gap-2 mb-4">
                          {jurusan.competencies.slice(0, 3).map((comp, idx) => (
                            <span key={idx} className="text-xs px-3 py-1 rounded-full bg-blue-500/30 text-blue-100 backdrop-blur-sm">
                              {comp}
                            </span>
                          ))}
                        </div>
                      )}

                      {/* CTA */}
                      <div className="inline-flex items-center gap-2 text-white font-semibold group-hover:gap-4 transition-all">
                        <span>Pelajari Lebih Lanjut</span>
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
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

      {/* CTA Section */}
      <section className="py-24 bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600 relative overflow-hidden">
        {/* Decorative Elements */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full filter blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-white/10 rounded-full filter blur-3xl"></div>
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Siap Memulai Perjalanan Karirmu?
            </h2>
            <p className="text-xl text-white/90 mb-12">
              Bergabunglah dengan ribuan siswa yang telah meraih kesuksesan bersama kami
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link 
                to="/daftar" 
                className="px-8 py-4 bg-white text-blue-600 rounded-full font-bold text-lg hover:shadow-2xl hover:scale-105 transition-all"
              >
                Daftar Sekarang
              </Link>
              <Link 
                to="/kontak" 
                className="px-8 py-4 bg-white/20 backdrop-blur-sm text-white rounded-full font-bold text-lg hover:bg-white/30 transition-all border-2 border-white/30"
              >
                Hubungi Kami
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Prestasi Section */}
      <section className="py-24 bg-slate-50">
        <div className="container mx-auto px-4">
          {/* Section Header */}
          <div className="text-center mb-16">
            <span className="inline-block px-4 py-2 bg-yellow-100 text-yellow-700 rounded-full text-sm font-semibold mb-4">
              🏆 Prestasi
            </span>
            <h2 className="text-4xl md:text-5xl font-bold text-slate-800 mb-4">
              Pencapaian Luar Biasa
            </h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              Bukti dedikasi dan kerja keras siswa-siswi kami di berbagai kompetisi
            </p>
          </div>

          {loading ? (
            <div className="text-center py-20">
              <div className="inline-block w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : data.prestasis.length === 0 ? (
            <div className="text-center py-20 bg-white rounded-3xl shadow-lg">
              <div className="text-6xl mb-4">🏅</div>
              <h3 className="text-xl font-bold text-slate-800 mb-2">Belum Ada Prestasi</h3>
              <p className="text-slate-600">Prestasi akan segera ditambahkan</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {data.prestasis.map((prestasi) => (
                <div
                  key={prestasi._id}
                  className="group bg-white rounded-3xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300"
                >
                  {/* Image */}
                  <div className="relative h-64 overflow-hidden">
                    <div 
                      className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-110"
                      style={{
                        backgroundImage: prestasi.image 
                          ? `url(${prestasi.image})`
                          : 'url(https://images.unsplash.com/photo-1552664730-d307ca884978?w=600&h=400&fit=crop)',
                      }}
                    >
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                    </div>
                    
                    {/* Badge */}
                    <div className="absolute top-4 left-4">
                      <span className={`px-4 py-2 rounded-full bg-gradient-to-r ${getLevelGradient(prestasi.level)} text-white text-sm font-bold shadow-lg`}>
                        {prestasi.level.toUpperCase()}
                      </span>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-6">
                    <h3 className="text-xl font-bold text-slate-800 mb-2 group-hover:text-blue-600 transition-colors">
                      {prestasi.title}
                    </h3>
                    <p className="text-slate-600 text-sm mb-4 line-clamp-2">
                      {prestasi.description}
                    </p>
                    
                    <div className="flex items-center gap-4 text-xs text-slate-500">
                      <span className="flex items-center gap-1">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        {new Date(prestasi.achievementDate).toLocaleDateString('id-ID')}
                      </span>
                      {prestasi.location && (
                        <span className="flex items-center gap-1">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                          {prestasi.location}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Ekstrakurikuler Section */}
      <section className="py-24 bg-white">
        <div className="container mx-auto px-4">
          {/* Section Header */}
          <div className="text-center mb-16">
            <span className="inline-block px-4 py-2 bg-green-100 text-green-700 rounded-full text-sm font-semibold mb-4">
              🎨 Ekstrakurikuler
            </span>
            <h2 className="text-4xl md:text-5xl font-bold text-slate-800 mb-4">
              Kembangkan Bakatmu
            </h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              Berbagai kegiatan menarik untuk mengasah kemampuan di luar akademik
            </p>
          </div>

          {loading ? (
            <div className="text-center py-20">
              <div className="inline-block w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : data.ekskuls.length === 0 ? (
            <div className="text-center py-20 bg-slate-50 rounded-3xl">
              <div className="text-6xl mb-4">🎯</div>
              <h3 className="text-xl font-bold text-slate-800 mb-2">Belum Ada Ekstrakurikuler</h3>
              <p className="text-slate-600">Data ekstrakurikuler akan segera ditambahkan</p>
            </div>
          ) : (
            <div className="max-w-4xl mx-auto space-y-4">
              {data.ekskuls.map((ekskul, index) => (
                <div
                  key={ekskul._id}
                  className="bg-slate-50 rounded-2xl overflow-hidden hover:shadow-lg transition-all"
                >
                  <button
                    onClick={() => setExpandedEkskul(expandedEkskul === index ? -1 : index)}
                    className="w-full flex items-center justify-between p-6 text-left"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold">
                        {String(index + 1).padStart(2, '0')}
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-slate-800">{ekskul.name}</h3>
                        {ekskul.coach && (
                          <p className="text-sm text-slate-500">Pembina: {ekskul.coach}</p>
                        )}
                      </div>
                    </div>
                    <svg 
                      className={`w-6 h-6 text-slate-400 transition-transform ${expandedEkskul === index ? 'rotate-180' : ''}`}
                      fill="none" 
                      stroke="currentColor" 
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>

                  {expandedEkskul === index && (
                    <div className="px-6 pb-6">
                      <div className="border-t pt-6">
                        {ekskul.image && (
                          <img
                            src={ekskul.image}
                            alt={ekskul.name}
                            className="w-full h-64 object-cover rounded-xl mb-4"
                          />
                        )}
                        <p className="text-slate-700 mb-4">{ekskul.description}</p>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                          {ekskul.schedule && (
                            <div className="flex items-center gap-2 text-slate-600">
                              <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                              <span>{ekskul.schedule}</span>
                            </div>
                          )}
                          {ekskul.location && (
                            <div className="flex items-center gap-2 text-slate-600">
                              <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                              </svg>
                              <span>{ekskul.location}</span>
                            </div>
                          )}
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

      {/* Testimoni Alumni */}
      <section className="py-24 bg-slate-50">
        <div className="container mx-auto px-4">
          {/* Section Header */}
          <div className="text-center mb-16">
            <span className="inline-block px-4 py-2 bg-purple-100 text-purple-700 rounded-full text-sm font-semibold mb-4">
              💬 Testimoni
            </span>
            <h2 className="text-4xl md:text-5xl font-bold text-slate-800 mb-4">
              Cerita Alumni Kami
            </h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              Dengarkan pengalaman dan kesuksesan alumni SMK Kristen 5 Klaten
            </p>
          </div>

          {loading ? (
            <div className="text-center py-20">
              <div className="inline-block w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : data.alumnis.length === 0 ? (
            <div className="text-center py-20 bg-white rounded-3xl shadow-lg">
              <div className="text-6xl mb-4">👥</div>
              <h3 className="text-xl font-bold text-slate-800 mb-2">Belum Ada Testimoni</h3>
              <p className="text-slate-600">Testimoni alumni akan segera ditambahkan</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {data.alumnis.map((alumni) => (
                <div
                  key={alumni._id}
                  className="bg-white rounded-3xl p-8 shadow-lg hover:shadow-2xl transition-all"
                >
                  {/* Quote Icon */}
                  <div className="text-blue-500 mb-4">
                    <svg className="w-10 h-10" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
                    </svg>
                  </div>

                  {/* Testimonial */}
                  <p className="text-slate-700 mb-6 leading-relaxed">
                    {alumni.testimonial}
                  </p>

                  {/* Profile */}
                  <div className="flex items-center gap-4 pt-6 border-t">
                    <div className="w-14 h-14 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 overflow-hidden">
                      {alumni.photo ? (
                        <img src={alumni.photo} alt={alumni.name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-white font-bold text-xl">
                          {alumni.name.charAt(0)}
                        </div>
                      )}
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-800">{alumni.name}</h4>
                      <p className="text-sm text-slate-500">{alumni.jurusan} • {alumni.graduationYear}</p>
                      {alumni.currentOccupation && (
                        <p className="text-xs text-blue-600 mt-1">{alumni.currentOccupation}</p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-white py-16">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
            {/* About */}
            <div className="md:col-span-2">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center overflow-hidden bg-white">
                  <img src={schoolLogo} alt="SMK Kristen 5" className="w-full h-full object-contain" />
                </div>
                <div>
                  <h3 className="font-bold text-lg">SMK Kristen 5 Klaten</h3>
                  <p className="text-sm text-slate-400">Membangun Generasi Unggul</p>
                </div>
              </div>
              <p className="text-slate-400 leading-relaxed mb-4">
                Lembaga pendidikan kejuruan terkemuka yang berkomitmen menghasilkan lulusan berkompeten dan berkarakter.
              </p>
              <div className="flex gap-3">
                <a href="#" className="w-10 h-10 rounded-full bg-slate-800 hover:bg-blue-600 flex items-center justify-center transition-colors">
                  <span className="sr-only">Facebook</span>
                  📘
                </a>
                <a href="#" className="w-10 h-10 rounded-full bg-slate-800 hover:bg-blue-600 flex items-center justify-center transition-colors">
                  <span className="sr-only">Instagram</span>
                  📷
                </a>
                <a href="#" className="w-10 h-10 rounded-full bg-slate-800 hover:bg-blue-600 flex items-center justify-center transition-colors">
                  <span className="sr-only">YouTube</span>
                  📺
                </a>
              </div>
            </div>

            {/* Links */}
            <div>
              <h4 className="font-bold mb-4">Akademik</h4>
              <ul className="space-y-2 text-slate-400">
                <li><Link to="/jurusan" className="hover:text-white transition-colors">Program Keahlian</Link></li>
                <li><Link to="/prestasi" className="hover:text-white transition-colors">Prestasi</Link></li>
                <li><Link to="/ekskul" className="hover:text-white transition-colors">Ekstrakurikuler</Link></li>
                <li><Link to="/alumni" className="hover:text-white transition-colors">Alumni</Link></li>
              </ul>
            </div>

            {/* Contact */}
            <div>
              <h4 className="font-bold mb-4">Kontak</h4>
              <ul className="space-y-3 text-slate-400 text-sm">
                <li className="flex items-start gap-2">
                  <span>📍</span>
                  <span>Jl. Merbabu No. 11, Klaten, Jawa Tengah</span>
                </li>
                <li className="flex items-center gap-2">
                  <span>📞</span>
                  <span>+62 812-3456-7890</span>
                </li>
                <li className="flex items-center gap-2">
                  <span>📧</span>
                  <span>info@smkkristen5klaten.sch.id</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Copyright */}
          <div className="border-t border-slate-800 pt-8 text-center text-slate-400 text-sm">
            <p>&copy; {new Date().getFullYear()} SMK Kristen 5 Klaten. All rights reserved.</p>
          </div>
        </div>
      </footer>

      {/* Custom Animations */}
      <style jsx>{`
        @keyframes marquee {
          0% { transform: translateX(0%); }
          100% { transform: translateX(-50%); }
        }
        .animate-marquee {
          display: inline-block;
          animation: marquee 30s linear infinite;
        }
        @keyframes blob {
          0%, 100% { transform: translate(0, 0) scale(1); }
          25% { transform: translate(20px, -50px) scale(1.1); }
          50% { transform: translate(-20px, 20px) scale(0.9); }
          75% { transform: translate(50px, 50px) scale(1.05); }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
      `}</style>
    </div>
  );
};

export default HomepageModern;
