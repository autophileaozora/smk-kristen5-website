import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../../services/api';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import PageRenderer from '../../components/PageRenderer';

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
  const [navbarVisible, setNavbarVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      // Show navbar when at top
      if (currentScrollY < 100) {
        setNavbarVisible(true);
      }
      // Hide navbar on scroll down
      else if (currentScrollY > lastScrollY && currentScrollY > 100) {
        setNavbarVisible(false);
      }
      // Show navbar on scroll up
      else if (currentScrollY < lastScrollY) {
        setNavbarVisible(true);
      }
      setLastScrollY(currentScrollY);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastScrollY]);

  useEffect(() => {
    fetchJurusanDetail();
  }, [slug]);

  const fetchJurusanDetail = async () => {
    try {
      setLoading(true);

      // Fetch jurusan detail
      const jurusanRes = await api.get(`/api/jurusan`);
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

        // Fetch prestasi articles (articles with topik 'prestasi' for this jurusan)
        try {
          const prestasiRes = await api.get(`/api/articles/public?jurusanCode=${foundJurusan.code}&topikSlug=prestasi&limit=20`);
          filteredPrestasi = prestasiRes.data?.data?.articles || [];
        } catch (error) {
          console.error('Error fetching prestasi:', error);
        }

        // Fetch related alumni (filter by jurusan)
        try {
          const alumniRes = await api.get(`/api/alumni`);
          console.log('Alumni API Response:', alumniRes.data);
          const alumnis = alumniRes.data?.data?.alumni || [];
          filteredAlumni = alumnis.filter(a =>
            a.jurusan?.toLowerCase() === foundJurusan.code?.toLowerCase()
          );
          console.log('Filtered Alumni:', filteredAlumni);
        } catch (error) {
          console.error('Error fetching alumni:', error);
        }

        // Fetch mata pelajaran (all, not filtered by category)
        try {
          console.log('Fetching mata pelajaran for:', foundJurusan.code);
          const mataPelajaranRes = await api.get(`/api/mata-pelajaran`);
          console.log('Mata Pelajaran API Response:', mataPelajaranRes.data);
          mataPelajarans = mataPelajaranRes.data?.data?.mataPelajaran || [];
          console.log('Mata Pelajaran:', mataPelajarans);
        } catch (error) {
          console.error('Error fetching mata pelajaran:', error);
        }

        // Fetch fasilitas (filter by category = jurusan code OR PUBLIC)
        try {
          console.log('Fetching fasilitas for:', foundJurusan.code);
          const fasilitasRes = await api.get(`/api/fasilitas?category=${foundJurusan.code}`);
          console.log('Fasilitas API Response:', fasilitasRes.data);
          fasilitass = fasilitasRes.data?.data?.fasilitas || [];
          console.log('Fasilitas:', fasilitass);
        } catch (error) {
          console.error('Error fetching fasilitas:', error);
        }

        // Fetch articles (published articles for this jurusan)
        try {
          console.log('Fetching articles for:', foundJurusan.code);
          const articlesRes = await api.get(`/api/articles/public?jurusanCode=${foundJurusan.code}&limit=4`);
          console.log('Articles API Response:', articlesRes.data);
          articles = articlesRes.data?.data?.articles || [];
          console.log('Articles:', articles);
        } catch (error) {
          console.error('Error fetching articles:', error);
        }

        setRelatedData({
          prestasis: filteredPrestasi,
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
          <Link to="/" className="text-[#0d76be] hover:text-[#0a5a91] hover:underline transition-colors">Kembali ke Beranda</Link>
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
      <Navbar activePage="jurusan" visible={navbarVisible} />

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

        <div className="relative max-w-[1400px] mx-auto px-6 lg:px-16">
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
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-12 md:py-20">
        <div className="max-w-[1400px] mx-auto px-6 lg:px-16">
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
                  jurusan.blocks && jurusan.blocks.length > 0 ? (
                    <PageRenderer blocks={jurusan.blocks} />
                  ) : (
                  <div>
                    {/* Description */}
                    <div className="mb-8">
                      <h3 className="text-xl md:text-2xl font-bold text-gray-800 mb-4">Deskripsi</h3>
                      <div
                        className="article-content text-gray-700 leading-relaxed text-sm md:text-base"
                        dangerouslySetInnerHTML={{ __html: jurusan.description }}
                      />
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
                  )
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
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
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
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        {relatedData.prestasis.map(article => {
                          const meta = article.metadata || {};
                          const rankStyle = (() => {
                            const r = meta.rank || '';
                            if ((r === 'Juara I' || r === 'Medali Emas'))
                              return { background: 'linear-gradient(135deg, #f59e0b, #d97706)', color: '#fff' };
                            if ((r === 'Juara II' || r === 'Medali Perak'))
                              return { background: 'linear-gradient(135deg, #94a3b8, #64748b)', color: '#fff' };
                            if ((r === 'Juara III' || r === 'Medali Perunggu'))
                              return { background: 'linear-gradient(135deg, #cd7f32, #92400e)', color: '#fff' };
                            if (r) return { background: 'rgba(17,24,39,0.85)', color: '#fff' };
                            return null;
                          })();
                          const levelClass = (() => {
                            const l = meta.level || '';
                            if (l === 'Internasional') return 'bg-purple-500 text-white';
                            if (l === 'Nasional') return 'bg-orange-500 text-white';
                            if (l === 'Provinsi') return 'bg-green-500 text-white';
                            if (l.includes('Kabupaten')) return 'bg-blue-500 text-white';
                            return null;
                          })();
                          return (
                            <Link key={article._id} to={`/artikel/${article.slug}`} className="group relative rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 block">
                              <div className="relative h-64 overflow-hidden">
                                {article.featuredImage?.url ? (
                                  <img
                                    src={article.featuredImage.url}
                                    alt={article.title}
                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                  />
                                ) : (
                                  <div className="w-full h-full bg-gradient-to-br from-gray-700 to-gray-900" />
                                )}
                                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent" />
                                {rankStyle && (
                                  <div className="absolute top-3 right-3 px-3 py-1.5 rounded-lg text-xs font-bold tracking-wide shadow-lg" style={rankStyle}>
                                    {meta.rank}
                                  </div>
                                )}
                                <div className="absolute bottom-0 left-0 right-0 p-4">
                                  {levelClass && (
                                    <span className={`inline-block px-2.5 py-0.5 rounded-md text-xs font-bold mb-2 ${levelClass}`}>
                                      {meta.level}
                                    </span>
                                  )}
                                  <h4 className="text-white font-bold text-base leading-snug line-clamp-2 group-hover:text-amber-300 transition-colors">
                                    {article.title}
                                  </h4>
                                  {meta.studentName ? (
                                    <p className="text-white/70 text-xs mt-1.5 flex items-center gap-1">
                                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-3 h-3 flex-shrink-0">
                                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
                                      </svg>
                                      {meta.studentName}
                                    </p>
                                  ) : (
                                    <p className="text-white/50 text-xs mt-1.5">
                                      {new Date(article.publishedAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                                    </p>
                                  )}
                                </div>
                              </div>
                            </Link>
                          );
                        })}
                      </div>
                    ) : (
                      <p className="text-gray-600 text-sm md:text-base">Belum ada artikel prestasi untuk jurusan ini.</p>
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
            <div className="space-y-6">

              {/* Postingan */}
              <div className="rounded-xl px-5 py-4 border border-gray-200" style={{ backgroundColor: '#fffefb' }}>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-base font-bold text-gray-800 tracking-wide uppercase" style={{ fontFamily: 'Russo One, sans-serif' }}>
                    Postingan {jurusan.code?.toUpperCase()}
                  </h3>
                  {relatedData.posts.length > 0 && (
                    <Link to="/artikel" className="text-[#0d76be] text-sm font-semibold hover:text-[#0a5a91] transition-colors">
                      Lihat Lainnya
                    </Link>
                  )}
                </div>
                <div>
                  {relatedData.posts.length > 0 ? (
                    relatedData.posts.map((post, idx) => (
                      <div key={post._id}>
                        <Link to={`/artikel/${post.slug}`} className="flex gap-3 py-3 hover:opacity-70 transition-opacity">
                          {post.featuredImage?.url && (
                            <img
                              src={post.featuredImage.url}
                              alt={post.title}
                              className="w-20 h-20 rounded-lg object-cover flex-shrink-0"
                            />
                          )}
                          <div className="min-w-0">
                            <p className="text-xs text-gray-400 mb-1">
                              {new Date(post.publishedAt).toLocaleDateString('id-ID', {
                                day: 'numeric', month: 'long', year: 'numeric'
                              })}
                            </p>
                            <h4 className="text-sm font-bold text-gray-800 line-clamp-2 leading-snug">
                              {post.title}
                            </h4>
                            {post.excerpt && (
                              <p className="text-xs text-gray-500 mt-1 line-clamp-2">
                                {post.excerpt}
                              </p>
                            )}
                          </div>
                        </Link>
                        {idx < relatedData.posts.length - 1 && (
                          <div className="border-t border-gray-100" />
                        )}
                      </div>
                    ))
                  ) : (
                    <p className="text-gray-400 text-sm py-2">Belum ada postingan untuk jurusan ini.</p>
                  )}
                </div>
              </div>

              {/* Cerita Alumni */}
              <div className="rounded-xl px-5 py-4 border border-gray-200" style={{ backgroundColor: '#fffefb' }}>
                <h3 className="text-base font-bold text-gray-800 tracking-wide uppercase mb-4" style={{ fontFamily: 'Russo One, sans-serif' }}>
                  Cerita Alumni
                </h3>
                <div>
                  {relatedData.alumnis.length > 0 ? (
                    relatedData.alumnis.map((alumni, idx) => (
                      <div key={alumni._id}>
                        <div className="py-3">
                          <div className="flex items-center gap-3 mb-2">
                            <img
                              src={alumni.photo || 'https://i.pravatar.cc/150'}
                              alt={alumni.name}
                              className="w-12 h-12 rounded-full object-cover flex-shrink-0"
                            />
                            <div>
                              <h4 className="font-bold text-gray-800 text-sm">{alumni.name}</h4>
                              <p className="text-xs text-[#0d76be] uppercase font-medium">
                                {alumni.currentOccupation || 'ALUMNI'}
                              </p>
                            </div>
                          </div>
                          <p className="text-sm text-gray-600 line-clamp-3 leading-relaxed">{alumni.testimonial}</p>
                          <p className="text-xs text-gray-400 italic mt-1">
                            — {alumni.jurusan || 'ALUMNI'}, {alumni.graduationYear || '2022'}
                          </p>
                        </div>
                        {idx < relatedData.alumnis.length - 1 && (
                          <div className="border-t border-gray-100" />
                        )}
                      </div>
                    ))
                  ) : (
                    <p className="text-gray-400 text-xs py-2">Belum ada testimoni alumni dari jurusan ini.</p>
                  )}
                </div>
              </div>

            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
