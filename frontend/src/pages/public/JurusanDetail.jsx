import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001';

export default function JurusanDetail() {
  const { slug } = useParams();
  const [jurusan, setJurusan] = useState(null);
  const [activeTab, setActiveTab] = useState('informasi');
  const [relatedData, setRelatedData] = useState({
    prestasis: [],
    alumnis: [],
    posts: [],
    mataPelajarans: [],
    fasilitass: []
  });
  const [loading, setLoading] = useState(true);
  const [isScrolled, setIsScrolled] = useState(false);
  const [navbarVisible, setNavbarVisible] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      setIsScrolled(currentScrollY > 50);

      // Simple navbar hide on scroll down
      if (currentScrollY > 100) {
        setNavbarVisible(false);
      } else {
        setNavbarVisible(true);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    fetchJurusanDetail();
  }, [slug]);

  const fetchJurusanDetail = async () => {
    try {
      setLoading(true);

      // Fetch jurusan detail
      const jurusanRes = await axios.get(`${API_URL}/api/jurusan`);
      console.log('API Response:', jurusanRes.data);
      const jurusans = jurusanRes.data.data.jurusans;
      console.log('All Jurusans:', jurusans);
      console.log('Looking for slug:', slug);
      const foundJurusan = jurusans.find(j => {
        console.log('Comparing:', j.slug, 'with', slug);
        return j.slug === slug;
      });
      console.log('Found Jurusan:', foundJurusan);
      setJurusan(foundJurusan);

      if (foundJurusan) {
        // Initialize empty arrays for all data
        let filteredPrestasi = [];
        let filteredAlumni = [];
        let mataPelajarans = [];
        let fasilitass = [];
        let articles = [];

        // Fetch related prestasi (filter by jurusan if available)
        try {
          const prestasiRes = await axios.get(`${API_URL}/api/prestasi`);
          console.log('Prestasi API Response:', prestasiRes.data);
          const prestasis = prestasiRes.data?.data?.prestasis || [];
          filteredPrestasi = prestasis.filter(p =>
            p.jurusan?.toUpperCase() === foundJurusan.code?.toUpperCase() || p.jurusan === null
          );
          console.log('Filtered Prestasi:', filteredPrestasi);
        } catch (error) {
          console.error('Error fetching prestasi:', error);
        }

        // Fetch related alumni (filter by jurusan)
        try {
          const alumniRes = await axios.get(`${API_URL}/api/alumni`);
          console.log('Alumni API Response:', alumniRes.data);
          const alumnis = alumniRes.data?.data?.alumni || [];
          filteredAlumni = alumnis.filter(a =>
            a.jurusan?.toLowerCase() === foundJurusan.code?.toLowerCase()
          );
          console.log('Filtered Alumni:', filteredAlumni);
        } catch (error) {
          console.error('Error fetching alumni:', error);
        }

        // Fetch mata pelajaran (filter by category = jurusan code OR PUBLIC)
        try {
          console.log('Fetching mata pelajaran for:', foundJurusan.code);
          const mataPelajaranRes = await axios.get(`${API_URL}/api/mata-pelajaran?category=${foundJurusan.code}`);
          console.log('Mata Pelajaran API Response:', mataPelajaranRes.data);
          mataPelajarans = mataPelajaranRes.data?.data?.mataPelajaran || [];
          console.log('Mata Pelajaran:', mataPelajarans);
        } catch (error) {
          console.error('Error fetching mata pelajaran:', error);
        }

        // Fetch fasilitas (filter by category = jurusan code OR PUBLIC)
        try {
          console.log('Fetching fasilitas for:', foundJurusan.code);
          const fasilitasRes = await axios.get(`${API_URL}/api/fasilitas?category=${foundJurusan.code}`);
          console.log('Fasilitas API Response:', fasilitasRes.data);
          fasilitass = fasilitasRes.data?.data?.fasilitas || [];
          console.log('Fasilitas:', fasilitass);
        } catch (error) {
          console.error('Error fetching fasilitas:', error);
        }

        // Fetch articles (published articles for this jurusan)
        try {
          console.log('Fetching articles for:', foundJurusan.code);
          const articlesRes = await axios.get(`${API_URL}/api/articles/public?jurusanCode=${foundJurusan.code}&limit=4`);
          console.log('Articles API Response:', articlesRes.data);
          articles = articlesRes.data?.data?.articles || [];
          console.log('Articles:', articles);
        } catch (error) {
          console.error('Error fetching articles:', error);
        }

        setRelatedData({
          prestasis: filteredPrestasi.slice(0, 4),
          alumnis: filteredAlumni.slice(0, 3),
          posts: articles,
          mataPelajarans: mataPelajarans,
          fasilitass: fasilitass
        });

        console.log('Final relatedData set:', {
          prestasisCount: filteredPrestasi.length,
          alumnisCount: filteredAlumni.length,
          postsCount: articles.length,
          mataPelajaransCount: mataPelajarans.length,
          fasilitassCount: fasilitass.length
        });
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="inline-block w-12 h-12 border-4 border-yellow-400 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!jurusan) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Jurusan tidak ditemukan</h2>
          <Link to="/" className="text-blue-600 hover:underline">Kembali ke Beranda</Link>
        </div>
      </div>
    );
  }

  const tabs = [
    { id: 'informasi', label: 'INFORMASI' },
    { id: 'mata-pelajaran', label: 'MATA PELAJARAN' },
    { id: 'fasilitas', label: 'FASILITAS' },
    { id: 'prestasi', label: 'PRESTASI' },
    { id: 'galeri', label: 'GALERI' }
  ];

  return (
    <div className="min-h-screen bg-white font-poppins overflow-x-hidden">
      {/* Navbar - Same as Homepage */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        navbarVisible ? 'translate-y-0' : '-translate-y-full'
      } ${
        isScrolled ? 'bg-[#0D76BE] shadow-md' : 'bg-[#0D76BE]'
      }`}>
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16 md:h-20">
            <Link to="/" className="flex items-center gap-2 md:gap-3">
              <div className="h-8 w-8 md:h-12 md:w-12 bg-white rounded-lg flex items-center justify-center text-[#0D76BE] font-bold text-xs md:text-base">
                SMK
              </div>
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
              <button className="hidden md:block p-1.5 md:p-2 rounded-full transition-colors hover:bg-white/10 text-white">
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

              {/* Hamburger Menu */}
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="md:hidden p-2 text-white focus:outline-none"
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

      {/* Mobile Menu - Same as Homepage */}
      {isMobileMenuOpen && (
        <>
          <div
            className="fixed inset-0 bg-black/50 z-40 md:hidden"
            onClick={() => setIsMobileMenuOpen(false)}
          ></div>
          <div className="fixed top-0 right-0 h-full w-[280px] bg-[#0D76BE] z-50 md:hidden">
            <div className="flex flex-col h-full">
              <div className="flex items-center justify-between p-4 border-b border-white/20">
                <div className="flex items-center gap-2">
                  <div className="h-10 w-10 bg-white rounded-lg flex items-center justify-center text-[#0D76BE] font-bold text-sm">
                    SMK
                  </div>
                  <div className="leading-tight">
                    <div className="text-sm font-bold text-white">SMK KRISTEN 5</div>
                    <div className="text-xs text-white/80">KLATEN</div>
                  </div>
                </div>
                <button
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="p-2 text-white hover:bg-white/10 rounded-full"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <nav className="flex-1 overflow-y-auto p-4">
                <div className="space-y-2">
                  <Link to="/" onClick={() => setIsMobileMenuOpen(false)} className="block px-4 py-3 text-white hover:bg-white/10 rounded-lg">Beranda</Link>
                  <Link to="/jurusan" onClick={() => setIsMobileMenuOpen(false)} className="block px-4 py-3 text-white hover:bg-white/10 rounded-lg">Jurusan</Link>
                  <Link to="/artikel" onClick={() => setIsMobileMenuOpen(false)} className="block px-4 py-3 text-white hover:bg-white/10 rounded-lg">Artikel</Link>
                  <Link to="/kontak" onClick={() => setIsMobileMenuOpen(false)} className="block px-4 py-3 text-white hover:bg-white/10 rounded-lg">Kontak</Link>
                </div>
              </nav>
              <div className="p-4 border-t border-white/20">
                <Link to="/daftar" onClick={() => setIsMobileMenuOpen(false)} className="block w-full px-6 py-3 bg-yellow-400 hover:bg-yellow-500 text-white text-center rounded-full font-bold">
                  PENDAFTARAN
                </Link>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Hero Section with Breadcrumb */}
      <section className="relative pt-24 md:pt-28 pb-12 md:pb-16 bg-gradient-to-br from-blue-600 to-blue-800">
        <div className="absolute inset-0 overflow-hidden">
          <div
            className="absolute inset-0 bg-cover bg-center opacity-20"
            style={{
              backgroundImage: jurusan.backgroundImage
                ? `url(${jurusan.backgroundImage})`
                : 'url(https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1920&h=600&fit=crop)'
            }}
          />
        </div>

        <div className="relative container mx-auto px-4">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-white/80 text-sm md:text-base mb-6">
            <Link to="/" className="hover:text-white flex items-center gap-1">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
              </svg>
              home
            </Link>
            <span>/</span>
            <Link to="/jurusan" className="hover:text-white">jurusan</Link>
            <span>/</span>
            <span className="text-white font-medium">{jurusan.code?.toLowerCase() || 'teknik komputer dan jaringan'}</span>
          </div>

          {/* Title */}
          <div className="flex items-start gap-4">
            <div className="bg-white p-4 rounded-xl shadow-lg">
              <svg className="w-8 h-8 md:w-12 md:h-12 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.356-.257l4-1.714a1 1 0 11.788 1.838L7.667 9.088l1.94.831a1 1 0 00.787 0l7-3a1 1 0 000-1.838l-7-3zM3.31 9.397L5 10.12v4.102a8.969 8.969 0 00-1.05-.174 1 1 0 01-.89-.89 11.115 11.115 0 01.25-3.762zM9.3 16.573A9.026 9.026 0 007 14.935v-3.957l1.818.78a3 3 0 002.364 0l5.508-2.361a11.026 11.026 0 01.25 3.762 1 1 0 01-.89.89 8.968 8.968 0 00-5.35 2.524 1 1 0 01-1.4 0zM6 18a1 1 0 001-1v-2.065a8.935 8.935 0 00-2-.712V17a1 1 0 001 1z" />
              </svg>
            </div>
            <div>
              <h1 className="text-3xl md:text-5xl font-bold text-white mb-2" style={{ fontFamily: 'Russo One, sans-serif' }}>
                {jurusan.name?.toUpperCase()}
              </h1>
              <p className="text-white/90 text-sm md:text-base">
                {jurusan.description || 'Program keahlian yang fokus pada teknologi komputer dan jaringan'}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-12 md:py-20">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Content */}
            <div className="lg:col-span-2">
              {/* Tab Navigation */}
              <div className="bg-white mb-8">
                <div className="flex overflow-x-auto scrollbar-hide border-b border-gray-200">
                  {tabs.map(tab => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      style={{ outline: 'none', boxShadow: 'none', border: 'none', borderBottom: activeTab === tab.id ? '4px solid #2563eb' : 'none' }}
                      className={`px-4 md:px-6 py-3 md:py-4 text-sm md:text-base font-bold whitespace-nowrap transition-colors ${
                        activeTab === tab.id
                          ? 'text-blue-600'
                          : 'text-gray-500 hover:text-gray-800'
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Tab Content */}
              <div className="bg-white">
                {activeTab === 'informasi' && (
                  <div className="prose max-w-none">
                    {/* Description */}
                    <div className="mb-8">
                      <h3 className="text-xl md:text-2xl font-bold text-gray-800 mb-4">Deskripsi</h3>
                      <p className="text-gray-700 leading-relaxed text-sm md:text-base">
                        {jurusan.description}
                      </p>
                    </div>

                    {/* Visi */}
                    {jurusan.vision && (
                      <div className="mb-8">
                        <h3 className="text-xl md:text-2xl font-bold text-gray-800 mb-4">Visi</h3>
                        <p className="text-gray-700 leading-relaxed text-sm md:text-base">
                          {jurusan.vision}
                        </p>
                      </div>
                    )}

                    {/* Misi */}
                    {jurusan.mission && (
                      <div className="mb-8">
                        <h3 className="text-xl md:text-2xl font-bold text-gray-800 mb-4">Misi</h3>
                        <p className="text-gray-700 leading-relaxed text-sm md:text-base">
                          {jurusan.mission}
                        </p>
                      </div>
                    )}

                    {/* Kepala Jurusan */}
                    {jurusan.headOfDepartment && (
                      <div className="mb-8">
                        <h3 className="text-xl md:text-2xl font-bold text-gray-800 mb-4">Kepala Jurusan</h3>
                        <p className="text-gray-700 leading-relaxed text-sm md:text-base font-semibold">
                          {jurusan.headOfDepartment}
                        </p>
                      </div>
                    )}

                    {/* Kompetensi */}
                    <div className="mb-8">
                      <h3 className="text-xl md:text-2xl font-bold text-gray-800 mb-4">Kompetensi</h3>
                      <div className="flex flex-wrap gap-2">
                        {jurusan.competencies && jurusan.competencies.length > 0 ? (
                          jurusan.competencies.map((comp, idx) => (
                            <span key={idx} className="px-4 py-2 bg-blue-100 text-blue-600 rounded-full text-sm font-semibold">
                              {comp}
                            </span>
                          ))
                        ) : (
                          <p className="text-gray-600 text-sm">Belum ada data kompetensi.</p>
                        )}
                      </div>
                    </div>

                    {/* Prospek Karir */}
                    {jurusan.careerProspects && jurusan.careerProspects.length > 0 && (
                      <div className="mb-8">
                        <h3 className="text-xl md:text-2xl font-bold text-gray-800 mb-4">Prospek Karir</h3>
                        <ul className="list-disc list-inside space-y-2">
                          {jurusan.careerProspects.map((career, idx) => (
                            <li key={idx} className="text-gray-700 text-sm md:text-base">
                              {career}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}

                {activeTab === 'mata-pelajaran' && (
                  <div>
                    <h3 className="text-xl md:text-2xl font-bold text-gray-800 mb-6">Mata Pelajaran</h3>
                    {relatedData.mataPelajarans.length > 0 ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                        {relatedData.mataPelajarans.map((mataPelajaran) => (
                          <div key={mataPelajaran._id} className="border border-gray-200 rounded-lg p-4 md:p-6 hover:shadow-lg transition-shadow">
                            {mataPelajaran.image && (
                              <img
                                src={mataPelajaran.image}
                                alt={mataPelajaran.name}
                                className="w-full h-32 md:h-40 object-cover rounded-lg mb-4"
                              />
                            )}
                            <h4 className="text-lg md:text-xl font-bold text-gray-800 mb-2">{mataPelajaran.name}</h4>
                            <p className="text-gray-600 text-sm md:text-base mb-3">{mataPelajaran.description}</p>
                            <div className="flex flex-wrap gap-2 text-xs md:text-sm text-gray-500">
                              {mataPelajaran.semester && (
                                <span className="px-3 py-1 bg-blue-100 text-blue-600 rounded-full font-semibold">
                                  Semester {mataPelajaran.semester}
                                </span>
                              )}
                              {mataPelajaran.hoursPerWeek && (
                                <span className="px-3 py-1 bg-green-100 text-green-600 rounded-full font-semibold">
                                  {mataPelajaran.hoursPerWeek} Jam/Minggu
                                </span>
                              )}
                              <span className={`px-3 py-1 rounded-full font-semibold ${
                                mataPelajaran.category === 'PUBLIC'
                                  ? 'bg-purple-100 text-purple-600'
                                  : 'bg-yellow-100 text-yellow-600'
                              }`}>
                                {mataPelajaran.category === 'PUBLIC' ? 'Umum' : mataPelajaran.category}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-gray-600 text-sm md:text-base">Belum ada data mata pelajaran untuk jurusan ini.</p>
                    )}
                  </div>
                )}

                {activeTab === 'fasilitas' && (
                  <div>
                    <h3 className="text-xl md:text-2xl font-bold text-gray-800 mb-6">Fasilitas</h3>
                    {relatedData.fasilitass.length > 0 ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                        {relatedData.fasilitass.map((fasilitas) => (
                          <div key={fasilitas._id} className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition-shadow">
                            {fasilitas.image && (
                              <img
                                src={fasilitas.image}
                                alt={fasilitas.name}
                                className="w-full h-48 md:h-56 object-cover"
                              />
                            )}
                            <div className="p-4 md:p-6">
                              <h4 className="text-lg md:text-xl font-bold text-gray-800 mb-2">{fasilitas.name}</h4>
                              <p className="text-gray-600 text-sm md:text-base mb-3">{fasilitas.description}</p>
                              <div className="space-y-2 text-xs md:text-sm text-gray-500">
                                {fasilitas.location && (
                                  <div className="flex items-center gap-2">
                                    <span className="font-semibold">📍 Lokasi:</span>
                                    <span>{fasilitas.location}</span>
                                  </div>
                                )}
                                {fasilitas.capacity && (
                                  <div className="flex items-center gap-2">
                                    <span className="font-semibold">👥 Kapasitas:</span>
                                    <span>{fasilitas.capacity} orang</span>
                                  </div>
                                )}
                                <div className="pt-2">
                                  <span className={`px-3 py-1 rounded-full font-semibold ${
                                    fasilitas.category === 'PUBLIC'
                                      ? 'bg-purple-100 text-purple-600'
                                      : 'bg-yellow-100 text-yellow-600'
                                  }`}>
                                    {fasilitas.category === 'PUBLIC' ? 'Umum' : fasilitas.category}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-gray-600 text-sm md:text-base">Belum ada data fasilitas untuk jurusan ini.</p>
                    )}
                  </div>
                )}

                {activeTab === 'prestasi' && (
                  <div>
                    <h3 className="text-xl md:text-2xl font-bold text-gray-800 mb-6">Prestasi</h3>
                    {relatedData.prestasis.length > 0 ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {relatedData.prestasis.map(prestasi => (
                          <div key={prestasi._id} className="bg-gray-800 text-white rounded-xl p-4 md:p-6">
                            <div className="text-xs md:text-sm font-normal mb-2">
                              {prestasi.students || 'SISWA'}, {prestasi.level?.toUpperCase() || '2024'}
                            </div>
                            <div className="w-full h-px bg-white/30 mb-3"></div>
                            <h4 className="text-sm md:text-lg font-bold mb-3">{prestasi.title?.toUpperCase()}</h4>
                            {prestasi.image && (
                              <div className="w-full h-32 md:h-40 mb-3">
                                <img src={prestasi.image} alt={prestasi.title} className="w-full h-full object-cover rounded" />
                              </div>
                            )}
                            <p className="text-xs md:text-sm line-clamp-2">{prestasi.description?.toUpperCase()}</p>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-gray-600 text-sm md:text-base">Belum ada data prestasi untuk jurusan ini.</p>
                    )}
                  </div>
                )}

                {activeTab === 'galeri' && (
                  <div>
                    <h3 className="text-xl md:text-2xl font-bold text-gray-800 mb-6">Galeri Foto</h3>
                    {jurusan.gallery && jurusan.gallery.length > 0 ? (
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        {jurusan.gallery.map((item, index) => (
                          <div key={index} className="relative group overflow-hidden rounded-lg shadow-md hover:shadow-xl transition-shadow">
                            <img
                              src={item.url}
                              alt={item.caption || `Gallery ${index + 1}`}
                              className="w-full h-48 md:h-64 object-cover"
                            />
                            {item.caption && (
                              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent text-white p-3">
                                <p className="text-sm md:text-base font-medium">{item.caption}</p>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-gray-600 text-sm md:text-base">Belum ada foto di galeri.</p>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Right Sidebar */}
            <div className="space-y-8">
              {/* Postingan */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl md:text-2xl font-bold text-gray-800" style={{ fontFamily: 'Russo One, sans-serif' }}>
                    POSTINGAN {jurusan.code?.toUpperCase()}
                  </h3>
                  {relatedData.posts.length > 0 && (
                    <Link to="/artikel" className="text-blue-600 text-sm hover:underline">
                      LIHAT LAINNYA
                    </Link>
                  )}
                </div>
                <div className="space-y-4">
                  {relatedData.posts.length > 0 ? (
                    relatedData.posts.map(post => (
                      <div key={post._id} className="bg-white rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow">
                        {post.featuredImage?.url && (
                          <img
                            src={post.featuredImage.url}
                            alt={post.title}
                            className="w-full h-32 object-cover"
                          />
                        )}
                        <div className="p-4">
                          <p className="text-xs text-gray-500 mb-1">
                            {new Date(post.publishedAt).toLocaleDateString('id-ID', {
                              day: 'numeric',
                              month: 'long',
                              year: 'numeric'
                            })}
                          </p>
                          <h4 className="text-sm font-bold text-gray-800 line-clamp-2">
                            {post.title}
                          </h4>
                          {post.excerpt && (
                            <p className="text-xs text-gray-600 mt-2 line-clamp-2">
                              {post.excerpt}
                            </p>
                          )}
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-gray-600 text-sm">Belum ada postingan untuk jurusan ini.</p>
                  )}
                </div>
              </div>

              {/* Cerita Alumni */}
              <div>
                <h3 className="text-xl md:text-2xl font-bold text-gray-800 mb-4" style={{ fontFamily: 'Russo One, sans-serif' }}>
                  CERITA ALUMNI
                </h3>
                <div className="space-y-4">
                  {relatedData.alumnis.length > 0 ? (
                    relatedData.alumnis.map(alumni => (
                      <div key={alumni._id} className="bg-transparent rounded-xl p-4 border border-gray-800" style={{ borderWidth: '0.7px' }}>
                        <div className="flex items-center gap-3 mb-4 pb-4 border-b border-gray-800" style={{ borderBottomWidth: '0.7px' }}>
                          <img
                            src={alumni.photo || 'https://i.pravatar.cc/150'}
                            alt={alumni.name}
                            className="w-12 h-12 rounded-full object-cover"
                          />
                          <div>
                            <h4 className="font-bold text-gray-800 text-sm">{alumni.name}</h4>
                            <p className="text-xs text-gray-600 uppercase">
                              {alumni.currentOccupation || 'ALUMNI'}
                            </p>
                          </div>
                        </div>
                        <p className="text-sm text-gray-700 line-clamp-3">{alumni.testimonial}</p>
                        <div className="text-xs text-gray-500 italic mt-2">
                          -{alumni.jurusan || 'ALUMNI'} {alumni.graduationYear || '2022'}
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-gray-600 text-sm">Belum ada testimoni alumni dari jurusan ini.</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer - Same as Homepage */}
      <footer className="bg-[#0D76BE] text-white py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 md:gap-12">
            <div>
              <div className="flex items-center gap-3 mb-6">
                <div className="h-12 w-12 md:h-16 md:w-16 bg-yellow-400 rounded-lg flex items-center justify-center text-white font-bold text-lg md:text-xl">
                  SMK
                </div>
                <div>
                  <div className="text-lg md:text-2xl font-bold">SMK KRISTEN 5</div>
                  <div className="text-base md:text-xl">KLATEN</div>
                </div>
              </div>
            </div>

            <div>
              <h4 className="text-base md:text-lg font-semibold mb-4">Information</h4>
              <ul className="space-y-3">
                <li><Link to="/sejarah" className="text-sm md:text-base hover:text-yellow-400 transition-colors underline">Sejarah</Link></li>
                <li><Link to="/sambutan" className="text-sm md:text-base hover:text-yellow-400 transition-colors underline">Sambutan Kepala Sekolah</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="text-base md:text-lg font-semibold mb-4">Penanggung Jawab</h4>
              <ul className="space-y-3">
                <li><Link to="/admin" className="text-sm md:text-base hover:text-yellow-400 transition-colors underline">Admin Content</Link></li>
                <li><Link to="/login" className="text-sm md:text-base hover:text-yellow-400 transition-colors underline">Login</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="text-base md:text-lg font-semibold mb-4">Kontak</h4>
              <p className="text-sm md:text-base">Jl. Contoh No. 123, Klaten</p>
              <p className="text-sm md:text-base">Telp: (0272) 123456</p>
            </div>
          </div>

          <div className="border-t border-white/20 mt-8 pt-8 text-center">
            <p className="text-xs md:text-sm">&copy; 2024 SMK Kristen 5 Klaten. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
