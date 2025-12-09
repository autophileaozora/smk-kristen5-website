import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import { useSchoolLogo } from '../../hooks/useContact';

const HomepageExact = () => {
  // Get school logo from contact info
  const { logo: schoolLogo } = useSchoolLogo();

  const [data, setData] = useState({
    runningTexts: [],
    jurusans: [],
    prestasis: [],
    ekskuls: [],
    alumnis: [],
  });
  const [loading, setLoading] = useState(true);
  const [isScrolled, setIsScrolled] = useState(false);
  const [expandedEkskul, setExpandedEkskul] = useState(0);
  const [scrollProgress, setScrollProgress] = useState(0);

  useEffect(() => {
    fetchData();
    
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
      
      // Calculate scroll progress for horizontal scroll
      const jurusanSection = document.querySelector('[data-section="jurusan"]');
      if (jurusanSection && data.jurusans.length > 0) {
        const rect = jurusanSection.getBoundingClientRect();
        const sectionHeight = jurusanSection.offsetHeight;
        const windowHeight = window.innerHeight;
        
        // Calculate progress (0 to 1)
        const scrolled = window.scrollY - jurusanSection.offsetTop + windowHeight;
        const total = sectionHeight;
        const progress = Math.max(0, Math.min(1, scrolled / total));
        
        setScrollProgress(progress);
      }
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [data.jurusans.length]);

  const fetchData = async () => {
    try {
      setLoading(true);
      
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
        prestasis: (prestasiRes.data.data.prestasis || []).slice(0, 3), // Remove isActive filter
        ekskuls: ekskulRes.data.data.ekskuls || [],
        alumnis: alumniRes.data.data.alumnis || [], // Show all featured
      });
      
      // Debug logging
      console.log('📊 DATA LOADED:');
      console.log('Prestasi:', prestasiRes.data.data.prestasis?.length || 0);
      console.log('Alumni:', alumniRes.data.data.alumnis?.length || 0);
      console.log('Jurusan:', jurusanRes.data.data.jurusans?.length || 0);
      console.log('Ekskul:', ekskulRes.data.data.ekskuls?.length || 0);
    } catch (err) {
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white font-poppins">
      {/* Navbar - Exact from hero_section.png */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled ? 'bg-white shadow-md' : 'bg-white/90 backdrop-blur-sm'
      }`}>
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-20">
            {/* Logo - Exact position */}
            <Link to="/" className="flex items-center gap-3">
              <img src={schoolLogo} alt="Logo" className="h-12 w-12 object-contain" />
              <div className="leading-tight">
                <div className="text-xs text-gray-600">SEKOLAH MENENGAH KEJURUAN</div>
                <div className="text-lg font-bold text-gray-800">KRISTEN 5 KLATEN</div>
                <div className="text-xs text-gray-500">SMK Krisma Bisa</div>
              </div>
            </Link>

            {/* Menu - Exact spacing */}
            <div className="hidden md:flex items-center gap-8">
              <Link to="/" className="text-gray-700 hover:text-cyan-500 transition-colors">Beranda</Link>
              <Link to="/jurusan" className="text-gray-700 hover:text-cyan-500 transition-colors">Jurusan</Link>
              <Link to="/artikel" className="text-gray-700 hover:text-cyan-500 transition-colors">Artikel</Link>
              <Link to="/kontak" className="text-gray-700 hover:text-cyan-500 transition-colors">Kontak</Link>
            </div>

            {/* Right - Search + CTA */}
            <div className="flex items-center gap-4">
              <button className="p-2 hover:bg-gray-100 rounded-full">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </button>
              <Link 
                to="/daftar" 
                className="px-6 py-2.5 bg-cyan-500 hover:bg-cyan-600 text-white rounded-full font-medium transition-colors"
              >
                PENDAFTARAN
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section - Exact from hero_section.png */}
      <section className="relative min-h-screen flex items-center pt-20">
        {/* Background Image with Overlay */}
        <div className="absolute inset-0">
          <img 
            src="https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=1920&h=1080&fit=crop" 
            alt="Hero" 
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black/40"></div>
        </div>

        {/* Content */}
        <div className="relative container mx-auto px-4">
          <div className="max-w-4xl">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full mb-6">
              <img src={schoolLogo} alt="Logo" className="h-8 w-8 object-contain" />
              <span className="text-white text-sm font-semibold">
                SEKOLAH MENENGAH KEJURUAN KRISTEN 5 KLATEN
              </span>
            </div>
            
            <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 leading-tight">
              SMK KRISTEN 5 MENGUCAPKAN SELAMAT HARI NATAL BAGI UMAT YANG MERAYAKAN
            </h1>
            
            <div className="flex gap-4 mt-8">
              <Link 
                to="/daftar" 
                className="px-8 py-3 bg-cyan-500 hover:bg-cyan-600 text-white rounded-full font-semibold transition-colors"
              >
                PENDAFTARAN
              </Link>
            </div>
          </div>
        </div>

        {/* Date Badge - Bottom Left */}
        <div className="absolute bottom-8 left-8 bg-cyan-500 px-6 py-3 rounded-lg">
          <div className="text-white text-sm">Date: 19/06/2025</div>
        </div>
      </section>

      {/* Running Text Ticker */}
      {data.runningTexts.length > 0 && (
        <div className="bg-cyan-500 py-3 overflow-hidden">
          <div className="animate-marquee whitespace-nowrap">
            {[...data.runningTexts, ...data.runningTexts].map((text, index) => (
              <span key={index} className="text-white mx-8 text-sm font-medium">
                ● {text.text}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Kompetensi Jurusan - Framer Horizontal Scroll */}
      <section 
        data-section="jurusan"
        className="relative bg-white"
        style={{ 
          // Adjusted height: more reasonable based on card count
          height: `${Math.max(data.jurusans.length * 80 + 100, 350)}vh` 
        }}
      >
        {/* Sticky Container */}
        <div className="sticky top-0 h-screen w-screen overflow-hidden flex items-center bg-white">
          <div className="w-full">
            {/* Container with proper padding */}
            <div className="container mx-auto px-4">
              {/* Header - Fixed */}
              <div className="mb-8">
                <h2 className="text-5xl font-bold text-gray-800 mb-4">KOMPETENSI JURUSAN</h2>
                <p className="text-gray-600 uppercase text-sm tracking-wide">
                  PILIH JURUSAN YANG SESUAI DENGAN BAKAT & MINAT ANDA
                </p>
              </div>

              {loading ? (
                <div className="text-center py-20">
                  <div className="inline-block w-12 h-12 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin"></div>
                </div>
              ) : data.jurusans.length === 0 ? (
                <div className="text-center py-20 bg-gray-50 rounded-2xl">
                  <div className="text-5xl mb-4">📚</div>
                  <p className="text-gray-600">Belum ada data jurusan</p>
                </div>
              ) : (
                <>
                  {/* Horizontal Scrolling Cards */}
                  <div 
                    className="flex gap-6 transition-transform duration-500 ease-out will-change-transform"
                    style={{
                      // Increased delay to 35% and reduced multiplier for smoother start
                      transform: `translateX(-${Math.max(0, (scrollProgress - 0.35) * 1.5) * (data.jurusans.length * 456)}px)`,
                    }}
                  >
                    {data.jurusans.map((jurusan, index) => (
                      <div
                        key={jurusan._id}
                        className="relative flex-shrink-0 w-[450px] h-[550px] rounded-2xl overflow-hidden group shadow-xl hover:shadow-2xl transition-shadow duration-300"
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
                          <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-black/40"></div>
                        </div>

                        {/* Content */}
                        <div className="relative h-full p-8 flex flex-col justify-between">
                          {/* Top Badge */}
                          <div className="flex items-start gap-3">
                            <div className="bg-gray-900 px-4 py-3 rounded-lg shadow-lg">
                              <div className="text-white text-2xl font-bold leading-none">
                                {String(index + 1).padStart(2, '0')}
                              </div>
                            </div>
                            <div className="text-white text-xs uppercase font-bold leading-tight">
                              JURUSAN<br />
                              <span className="text-cyan-400 text-sm">{jurusan.code || 'TKJ'}</span>
                            </div>
                          </div>

                          {/* Bottom Content */}
                          <div>
                            <h3 className="text-3xl font-bold text-white mb-3 leading-tight">
                              {jurusan.name.toUpperCase()}
                            </h3>
                            
                            {/* Hashtags */}
                            <div className="flex flex-wrap gap-2 mb-4">
                              {jurusan.competencies && jurusan.competencies.length > 0 ? (
                                jurusan.competencies.slice(0, 3).map((comp, idx) => (
                                  <span key={idx} className="text-yellow-400 text-sm font-bold uppercase">
                                    #{comp.replace(/\s+/g, '')}
                                  </span>
                                ))
                              ) : (
                                <>
                                  <span className="text-yellow-400 text-sm font-bold">#TECHNOLOGY</span>
                                  <span className="text-yellow-400 text-sm font-bold">#NETWORK</span>
                                  <span className="text-yellow-400 text-sm font-bold">#ADMINISTRATOR</span>
                                </>
                              )}
                            </div>

                            {/* DAFTAR Button */}
                            <Link
                              to={`/jurusan/${jurusan.slug}`}
                              className="inline-flex items-center gap-2 text-white font-bold text-lg hover:text-cyan-400 transition-colors"
                            >
                              <span>DAFTAR</span>
                              <svg className="w-6 h-6 transition-transform group-hover:translate-x-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                              </svg>
                            </Link>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Scroll Progress Indicator */}
                  {scrollProgress > 0 && scrollProgress < 1 && (
                    <div className="mt-8 flex justify-center">
                      <div className="bg-gray-200 h-1 w-64 rounded-full overflow-hidden">
                        <div 
                          className="bg-cyan-500 h-full transition-all duration-300"
                          style={{ width: `${scrollProgress * 100}%` }}
                        ></div>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Inviting Section - Exact from inviting.png */}
      <section 
        className="relative py-32 bg-cover bg-center"
        style={{
          backgroundImage: 'url(https://images.unsplash.com/photo-1502086223501-7ea6ecd79368?w=1920&h=600&fit=crop)',
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-blue-900/90 to-cyan-900/90"></div>
        
        <div className="relative container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <div className="text-right mb-8">
              <p className="text-white/80 text-sm mb-2">KAMI MENYEDIAKAN PLATFORM AGAR</p>
              <p className="text-white/80 text-sm mb-2">ANDA BISA MENEMUKAN BAKAT MINAT</p>
              <p className="text-white text-lg font-semibold">SESUAI PASSION ANDA</p>
            </div>

            <h2 className="text-5xl md:text-6xl font-bold text-white mb-6 leading-tight">
              MARI DISKUSIKAN BAKAT & MINAT KAMU,<br />
              KAMI AKAN MEMBANTU MENEMUKAN SESUAI<br />
              PASSION ANDA
            </h2>
            
            <Link 
              to="/daftar" 
              className="inline-block px-12 py-4 bg-cyan-500 hover:bg-cyan-600 text-white rounded-full font-bold text-lg transition-colors"
            >
              PENDAFTARAN
            </Link>

            {/* Loading Bar */}
            <div className="mt-16 max-w-2xl mx-auto">
              <div className="h-2 bg-white/20 rounded-full overflow-hidden">
                <div className="h-full bg-yellow-400 rounded-full" style={{ width: '54%' }}></div>
              </div>
              <div className="text-right mt-2 text-white text-sm">Loading 54%</div>
            </div>
          </div>

          {/* Side Text */}
          <div className="absolute top-8 left-8 text-white max-w-xs">
            <h3 className="text-3xl font-bold mb-4">RAGU ATAU BELUM TAU MINAT BAKAT KAMU?</h3>
          </div>
        </div>
      </section>

      {/* Prestasi - Exact from prestasi.png */}
      <section className="py-20 bg-cream">
        <div className="container mx-auto px-4">
          <h2 className="text-5xl font-bold text-gray-800 mb-4">PRESTASI</h2>
          <p className="text-gray-700 mb-12 max-w-4xl leading-relaxed">
            KAMI SUDAH MEMENANGKAN PENGHARGAAN DAN LOMBA YANG DIIKUTI OLEH SISWA-SISWA TERBAIK SMK KRISTEN 5 KLATEN, 
            JANGAN RAGU UNTUK IKUT DENGAN KAMI KARENA KAMI YAKIN KALIAN JUGA BISA MENJADI BAGIAN DARI SEJARAH KAMI 
            MENJADI SISWA YANG BERPRESTASI DAN CERDAS
          </p>

          {loading ? (
            <div className="text-center py-20">
              <div className="inline-block w-12 h-12 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : data.prestasis.length === 0 ? (
            <div className="text-center py-20 bg-white rounded-2xl">
              <div className="text-5xl mb-4">🏆</div>
              <p className="text-gray-600">Belum ada data prestasi</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {data.prestasis.map((prestasi, index) => (
                <div key={prestasi._id} className="bg-gray-800 rounded-2xl overflow-hidden">
                  <div className="p-6 text-white">
                    <div className="text-sm mb-2">
                      {String(index + 1).padStart(3, '0')} {prestasi.students || 'ANDRIAN IMANUEL SINAGA'}, TKJ 2022
                    </div>
                    <h3 className="text-2xl font-bold mb-4">
                      {prestasi.title}
                    </h3>
                  </div>
                  
                  <div 
                    className="relative h-64 bg-cover bg-center"
                    style={{
                      backgroundImage: prestasi.image 
                        ? `url(${prestasi.image})`
                        : 'url(https://images.unsplash.com/photo-1552664730-d307ca884978?w=600&h=400&fit=crop)',
                    }}
                  />
                  
                  <div className="p-6 text-white bg-gray-800">
                    <p className="text-sm">{prestasi.description}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Ekstrakurikuler - Exact from ekstrakurikuler.png */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-5xl font-bold text-gray-800 mb-16 text-right">EKSTRAKURIKULER</h2>

          {loading ? (
            <div className="text-center py-20">
              <div className="inline-block w-12 h-12 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : data.ekskuls.length === 0 ? (
            <div className="text-center py-20 bg-gray-50 rounded-2xl">
              <div className="text-5xl mb-4">🎯</div>
              <p className="text-gray-600">Belum ada data ekstrakurikuler</p>
            </div>
          ) : (
            <div className="max-w-6xl mx-auto space-y-6">
              {data.ekskuls.map((ekskul, index) => (
                <div key={ekskul._id} className="border-b border-gray-200">
                  <button
                    onClick={() => setExpandedEkskul(expandedEkskul === index ? -1 : index)}
                    className="w-full flex items-center justify-between py-8 text-left group"
                  >
                    <div className="flex items-center gap-6">
                      <span className="text-gray-400 text-2xl font-bold">
                        {String(index + 1).padStart(3, '0')}
                      </span>
                      <h3 className="text-3xl font-bold text-gray-800 group-hover:text-cyan-500 transition-colors">
                        {ekskul.name.toUpperCase()}
                      </h3>
                    </div>
                    <div className="text-4xl text-gray-400">
                      {expandedEkskul === index ? '−' : '+'}
                    </div>
                  </button>

                  {expandedEkskul === index && (
                    <div className="pb-8">
                      <div className="flex gap-8">
                        {ekskul.image && (
                          <img
                            src={ekskul.image}
                            alt={ekskul.name}
                            className="w-64 h-48 object-cover rounded-lg flex-shrink-0"
                          />
                        )}
                        <div className="flex-1">
                          <p className="text-gray-700 mb-4 leading-relaxed">{ekskul.description}</p>
                          <div className="space-y-2 text-sm text-gray-600">
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

      {/* Testimoni - Exact from testimoni.png */}
      <section className="py-20 bg-cream">
        <div className="container mx-auto px-4">
          <h2 className="text-5xl font-bold text-gray-800 mb-4">TESTIMONI DAN CERITA ALUMNI</h2>
          <p className="text-gray-700 mb-12">
            Mereka membuktikan menjadi berhasil adalah hal yang mungkin, kamu bisa menjadi generasi selanjutnya <span className="font-bold">KRISMA BISA</span>.
          </p>

          {loading ? (
            <div className="text-center py-20">
              <div className="inline-block w-12 h-12 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : data.alumnis.length === 0 ? (
            <div className="text-center py-20 bg-white rounded-2xl">
              <div className="text-5xl mb-4">👥</div>
              <p className="text-gray-600">Belum ada data testimoni</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {data.alumnis.map((alumni) => (
                <div key={alumni._id} className="bg-white rounded-2xl p-8 border border-gray-200">
                  <div className="flex items-center gap-4 mb-6 pb-6 border-b">
                    <img
                      src={alumni.photo || 'https://i.pravatar.cc/150'}
                      alt={alumni.name}
                      className="w-16 h-16 rounded-full object-cover"
                    />
                    <div>
                      <h4 className="font-bold text-gray-800 text-lg">{alumni.name}</h4>
                      <p className="text-sm text-gray-600 uppercase">
                        LEADER SOFTWARE ENGINEER AT {alumni.company || 'ALFAMART'}
                      </p>
                    </div>
                  </div>
                  
                  <p className="text-gray-700 leading-relaxed uppercase text-sm">
                    {alumni.testimonial}
                  </p>
                  
                  <div className="mt-6 text-xs text-gray-500 italic">
                    -{alumni.jurusan || 'ALUMNI SISTEM INFORMASI'} {alumni.graduationYear || '2022'}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Footer - Exact from footer.png */}
      <footer className="bg-gray-800 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
            {/* Logo Column */}
            <div>
              <div className="flex items-center gap-3 mb-6">
                <img src={schoolLogo} alt="Logo" className="h-16 w-16 object-contain" />
                <div>
                  <div className="text-2xl font-bold">SMK KRISTEN 5</div>
                  <div className="text-xl">KLATEN</div>
                </div>
              </div>
            </div>

            {/* Information */}
            <div>
              <h4 className="text-lg font-semibold mb-4">Information</h4>
              <ul className="space-y-3">
                <li><Link to="/sejarah" className="hover:text-cyan-400 transition-colors underline">Sejarah</Link></li>
                <li><Link to="/sambutan" className="hover:text-cyan-400 transition-colors underline">Sambutan Kepala Sekolah</Link></li>
              </ul>
            </div>

            {/* Penanggung Jawab */}
            <div>
              <h4 className="text-lg font-semibold mb-4">Penanggung Jawab</h4>
              <ul className="space-y-3">
                <li><Link to="/admin" className="hover:text-cyan-400 transition-colors underline">Admin Content</Link></li>
                <li><Link to="/login" className="hover:text-cyan-400 transition-colors underline">Login</Link></li>
              </ul>
            </div>

            {/* Link lainnya */}
            <div>
              <h4 className="text-lg font-semibold mb-4">Link lainnya</h4>
              <ul className="space-y-3">
                <li><a href="#" className="hover:text-cyan-400 transition-colors underline">Lowongan Kerja</a></li>
                <li><a href="#" className="hover:text-cyan-400 transition-colors underline">BKK Krisma</a></li>
              </ul>
            </div>
          </div>
        </div>
      </footer>

      {/* Animations */}
      <style jsx>{`
        @keyframes marquee {
          0% { transform: translateX(0%); }
          100% { transform: translateX(-50%); }
        }
        .animate-marquee {
          display: inline-block;
          animation: marquee 30s linear infinite;
        }
      `}</style>
    </div>
  );
};

export default HomepageExact;
