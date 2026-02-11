import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import api from '../../services/api';
import { useSchoolLogo } from '../../hooks/useContact';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';

const Artikel = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { logo: schoolLogo } = useSchoolLogo();

  const [articles, setArticles] = useState([]);
  const [featuredArticles, setFeaturedArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTopik, setSelectedTopik] = useState('');
  const [selectedJurusan, setSelectedJurusan] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [topikCategories, setTopikCategories] = useState([]);
  const [jurusanCategories, setJurusanCategories] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [showFilterModal, setShowFilterModal] = useState(false);
  const articlesPerPage = 12; // 3 columns × 4 rows

  // Navbar state
  const [navbarVisible, setNavbarVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [isScrolled, setIsScrolled] = useState(false);
  const scrollTimeout = useRef(null);
  const searchInputRef = useRef(null);

  useEffect(() => {
    fetchArticles();
    fetchTopikCategories();
    fetchJurusanCategories();

    // Read search query from URL parameter
    const params = new URLSearchParams(location.search);
    const queryParam = params.get('q');
    if (queryParam) {
      setSearchQuery(queryParam);
      // Scroll to search section
      setTimeout(() => {
        const searchSection = document.querySelector('.search-section');
        if (searchSection) {
          searchSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 500);
    }
  }, [location.search]);

  // Handle topik filter from URL parameter (e.g., ?topik=prestasi)
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const topikParam = params.get('topik');

    if (topikParam && topikCategories.length > 0) {
      // Find category by name (case insensitive)
      const matchedCategory = topikCategories.find(
        (cat) => cat.name.toLowerCase() === topikParam.toLowerCase() && cat.type === 'topik'
      );
      if (matchedCategory) {
        setSelectedTopik(matchedCategory._id);
        // Auto scroll to search section when filter is applied from URL
        setTimeout(() => {
          const searchSection = document.querySelector('.search-section');
          if (searchSection) {
            const navbarHeight = 72; // Account for fixed navbar
            const elementPosition = searchSection.getBoundingClientRect().top + window.pageYOffset;
            window.scrollTo({
              top: elementPosition - navbarHeight,
              behavior: 'smooth'
            });
          }
        }, 300);
      }
    } else if (!topikParam) {
      // Clear filter when no topik param
      setSelectedTopik('');
    }
  }, [location.search, topikCategories]);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      const lastScroll = lastScrollY;

      setIsScrolled(currentScrollY > 50);

      // Hide navbar when scrolling down with delay (500ms)
      if (currentScrollY > lastScroll && currentScrollY > 100) {
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
    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (scrollTimeout.current) {
        clearTimeout(scrollTimeout.current);
      }
    };
  }, [lastScrollY]);

  // Auto-slide carousel
  useEffect(() => {
    if (featuredArticles.length > 0) {
      const timer = setInterval(() => {
        setCurrentSlide((prev) => (prev + 1) % featuredArticles.length);
      }, 5000);
      return () => clearInterval(timer);
    }
  }, [featuredArticles.length]);

  const fetchArticles = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/api/articles/public?limit=100`);
      const allArticles = response.data?.data?.articles || [];

      // Get featured articles (first 5 for carousel)
      setFeaturedArticles(allArticles.slice(0, 5));

      // Get all articles
      setArticles(allArticles);
    } catch (error) {
      console.error('Error fetching articles:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchTopikCategories = async () => {
    try {
      const response = await api.get(`/api/categories/public`);
      setTopikCategories(response.data?.data?.categories || []);
    } catch (error) {
      console.error('Error fetching topik categories:', error);
    }
  };

  const fetchJurusanCategories = async () => {
    try {
      const response = await api.get(`/api/jurusan`);
      setJurusanCategories(response.data?.data?.jurusans || []);
    } catch (error) {
      console.error('Error fetching jurusan categories:', error);
    }
  };

  const handleSearch = () => {
    let filtered = articles;

    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter(article =>
        article.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        article.excerpt?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Filter by topik category
    if (selectedTopik) {
      console.log('Filtering by Topik:', selectedTopik);
      filtered = filtered.filter(article => {
        console.log('Article categoryTopik:', article.categoryTopik);
        return article.categoryTopik?._id === selectedTopik;
      });
    }

    // Filter by jurusan category
    if (selectedJurusan) {
      console.log('Filtering by Jurusan:', selectedJurusan);
      filtered = filtered.filter(article => {
        console.log('Article categoryJurusan:', article.categoryJurusan);
        return article.categoryJurusan?._id === selectedJurusan;
      });
    }

    // Filter by time period
    if (selectedTime) {
      const now = new Date();
      filtered = filtered.filter(article => {
        const publishDate = new Date(article.publishedAt);
        const diffTime = Math.abs(now - publishDate);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        switch (selectedTime) {
          case '7days':
            return diffDays <= 7;
          case '30days':
            return diffDays <= 30;
          case '90days':
            return diffDays <= 90;
          case '1year':
            return diffDays <= 365;
          default:
            return true;
        }
      });
    }

    return filtered;
  };

  const resetFilters = () => {
    setSearchQuery('');
    setSelectedTopik('');
    setSelectedJurusan('');
    setSelectedTime('');
    setCurrentPage(1);
  };

  const scrollToSearch = () => {
    const searchSection = document.querySelector('.search-section');
    if (searchSection) {
      searchSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
      // Focus after scroll completes
      setTimeout(() => {
        if (searchInputRef.current) {
          searchInputRef.current.focus();
        }
      }, 500);
    }
  };

  const filteredArticles = handleSearch();

  // Pagination
  const indexOfLastArticle = currentPage * articlesPerPage;
  const indexOfFirstArticle = indexOfLastArticle - articlesPerPage;
  const currentArticles = filteredArticles.slice(indexOfFirstArticle, indexOfLastArticle);
  const totalPages = Math.ceil(filteredArticles.length / articlesPerPage);

  const paginate = (pageNumber) => {
    setCurrentPage(pageNumber);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 font-poppins">
      {/* Navbar - Same as Homepage */}
      <Navbar activePage="artikel" visible={navbarVisible} />

      {/* Carousel Jumbotron - No gap with navbar */}
      <section className="relative h-[500px] md:h-[600px] overflow-hidden">
        {featuredArticles.length > 0 && featuredArticles.map((article, index) => (
          <div
            key={article._id}
            className={`absolute inset-0 transition-opacity duration-1000 ${
              index === currentSlide ? 'opacity-100' : 'opacity-0'
            }`}
          >
            {/* Background Image */}
            <div
              className="absolute inset-0 bg-cover bg-center"
              style={{
                backgroundImage: `url(${article.featuredImage?.url || '/placeholder.jpg'})`,
              }}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/60 to-transparent"></div>
            </div>

            {/* Content - Shifted right with proper top padding for navbar */}
            <div className="relative h-full max-w-[1400px] mx-auto px-6 lg:px-16 flex items-center">
              <div className="max-w-2xl text-white ml-4 md:ml-12 lg:ml-20">
                <div className="flex items-center gap-3 mb-4">
                  {article.categoryJurusan && (
                    <span className="bg-blue-600 px-4 py-1 rounded-full text-xs md:text-sm font-semibold">
                      {article.categoryJurusan.name}
                    </span>
                  )}
                  <span className="text-xs md:text-sm">
                    {new Date(article.publishedAt).toLocaleDateString('id-ID', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric'
                    })}
                  </span>
                </div>
                <h1 className="text-3xl md:text-5xl font-bold mb-4 leading-tight">
                  {article.title}
                </h1>
                <p className="text-base md:text-lg mb-6 line-clamp-3 text-white/90">
                  {article.excerpt}
                </p>
                <Link
                  to={`/artikel/${article.slug}`}
                  className="inline-flex items-center justify-center px-6 md:px-8 py-2.5 md:py-3 bg-[#0d76be] hover:bg-[#0a5a91] text-white rounded-full transition-colors font-medium text-xs md:text-sm"
                >
                  Baca Selengkapnya
                </Link>
              </div>
            </div>
          </div>
        ))}

        {/* Carousel Indicators */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex gap-3 z-10">
          {featuredArticles.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentSlide(index)}
              className={`h-2 rounded-full transition-all ${
                index === currentSlide ? 'w-8 bg-white' : 'w-2 bg-white/50'
              }`}
            />
          ))}
        </div>

        {/* Navigation Arrows */}
        <button
          onClick={() => setCurrentSlide((prev) => (prev - 1 + featuredArticles.length) % featuredArticles.length)}
          className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white/20 hover:bg-white/30 text-white p-2 md:p-3 rounded-full transition-colors backdrop-blur-sm"
        >
          <svg className="w-5 h-5 md:w-6 md:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <button
          onClick={() => setCurrentSlide((prev) => (prev + 1) % featuredArticles.length)}
          className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white/20 hover:bg-white/30 text-white p-2 md:p-3 rounded-full transition-colors backdrop-blur-sm"
        >
          <svg className="w-5 h-5 md:w-6 md:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </section>

      {/* Search and Filter Section - Apple Glass Design */}
      <section className="search-section bg-[#0D76BE] sticky top-16 z-40">
        <div className="container mx-auto px-4 py-5">
          <div className="relative w-full max-w-4xl mx-auto">
            {/* Glass Container */}
            <div className="relative flex items-center bg-white/20 backdrop-blur-xl border border-white/30 rounded-2xl shadow-lg shadow-black/5 overflow-hidden">
              {/* Search Icon - Left Side */}
              <div className="pl-5 pr-3 text-white/70">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>

              <input
                ref={searchInputRef}
                type="text"
                placeholder="Cari Berita SMK KRISTEN 5 KLATEN"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1 bg-transparent py-4 pr-4 text-white placeholder-white/60 focus:outline-none text-sm"
              />

              {/* Divider */}
              <div className="h-8 w-px bg-white/30"></div>

              {/* Filter Button - Proper Button Style */}
              <button
                onClick={() => setShowFilterModal(!showFilterModal)}
                className={`flex items-center gap-2 px-5 py-4 transition-all ${
                  showFilterModal || selectedTopik || selectedJurusan || selectedTime
                    ? 'bg-white/30 text-white'
                    : 'text-white/80 hover:bg-white/10 hover:text-white'
                }`}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                </svg>
                <span className="text-sm font-medium">Filter</span>
              {(selectedTopik || selectedJurusan || selectedTime) && (
                <span className="bg-yellow-400 text-gray-900 text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                  {[selectedTopik, selectedJurusan, selectedTime].filter(Boolean).length}
                </span>
              )}
              </button>
            </div>
          </div>

          {/* Active Filter Tags */}
          {(selectedTopik || selectedJurusan || selectedTime) && (
            <div className="flex flex-wrap items-center gap-2 mt-3 max-w-4xl mx-auto">
              <span className="text-white/70 text-xs">Filter aktif:</span>
              {selectedTopik && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full text-white text-xs">
                  {topikCategories.find(c => c._id === selectedTopik)?.name || 'Topik'}
                  <button
                    onClick={() => setSelectedTopik('')}
                    className="hover:bg-white/20 rounded-full p-0.5"
                  >
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </span>
              )}
              {selectedJurusan && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full text-white text-xs">
                  {jurusanCategories.find(j => j._id === selectedJurusan)?.name || 'Jurusan'}
                  <button
                    onClick={() => setSelectedJurusan('')}
                    className="hover:bg-white/20 rounded-full p-0.5"
                  >
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </span>
              )}
              {selectedTime && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full text-white text-xs">
                  {selectedTime === '7days' ? '7 Hari Terakhir' :
                   selectedTime === '30days' ? '30 Hari Terakhir' :
                   selectedTime === '90days' ? '3 Bulan Terakhir' : '1 Tahun Terakhir'}
                  <button
                    onClick={() => setSelectedTime('')}
                    className="hover:bg-white/20 rounded-full p-0.5"
                  >
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </span>
              )}
              <button
                onClick={resetFilters}
                className="text-yellow-300 hover:text-yellow-200 text-xs font-medium ml-2"
              >
                Hapus Semua
              </button>
            </div>
          )}
        </div>
      </section>

      {/* Filter Overlay Modal */}
      {showFilterModal && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40"
            onClick={() => setShowFilterModal(false)}
          />

          {/* Filter Panel - Fixed position overlay */}
          <div className="fixed left-0 right-0 top-[132px] z-50 px-4 animate-slideDown">
            <div className="max-w-4xl mx-auto">
              <div className="bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-gray-100 overflow-hidden">
                {/* Header */}
                <div className="bg-gradient-to-r from-[#0D76BE] to-[#0a5a91] px-6 py-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
                      <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="text-white font-semibold">Filter Artikel</h3>
                      <p className="text-white/70 text-xs">Temukan artikel yang Anda cari</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowFilterModal(false)}
                    className="w-8 h-8 bg-white/20 hover:bg-white/30 rounded-lg flex items-center justify-center transition-colors"
                  >
                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                {/* Filter Content */}
                <div className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                    {/* Time Filter */}
                    <div className="space-y-2">
                      <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                        <svg className="w-4 h-4 text-[#0D76BE]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        Waktu Publikasi
                      </label>
                      <select
                        value={selectedTime}
                        onChange={(e) => setSelectedTime(e.target.value)}
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0D76BE] focus:border-transparent transition-all text-sm"
                      >
                        <option value="">Semua Waktu</option>
                        <option value="7days">7 Hari Terakhir</option>
                        <option value="30days">30 Hari Terakhir</option>
                        <option value="90days">3 Bulan Terakhir</option>
                        <option value="1year">1 Tahun Terakhir</option>
                      </select>
                    </div>

                    {/* Jurusan Filter */}
                    <div className="space-y-2">
                      <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                        <svg className="w-4 h-4 text-[#0D76BE]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                        </svg>
                        Jurusan
                      </label>
                      <select
                        value={selectedJurusan}
                        onChange={(e) => setSelectedJurusan(e.target.value)}
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0D76BE] focus:border-transparent transition-all text-sm"
                      >
                        <option value="">Semua Jurusan</option>
                        {jurusanCategories.map((jurusan) => (
                          <option key={jurusan._id} value={jurusan._id}>
                            {jurusan.code} - {jurusan.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Topik Filter */}
                    <div className="space-y-2">
                      <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                        <svg className="w-4 h-4 text-[#0D76BE]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                        </svg>
                        Topik
                      </label>
                      <select
                        value={selectedTopik}
                        onChange={(e) => setSelectedTopik(e.target.value)}
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0D76BE] focus:border-transparent transition-all text-sm"
                      >
                        <option value="">Semua Topik</option>
                        {topikCategories.filter(cat => cat.type === 'topik').map((category) => (
                          <option key={category._id} value={category._id}>
                            {category.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Filter Actions */}
                  <div className="flex items-center justify-between mt-6 pt-5 border-t border-gray-100">
                    <button
                      onClick={resetFilters}
                      className="flex items-center gap-2 px-4 py-2 text-sm text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                      </svg>
                      Reset Filter
                    </button>
                    <div className="flex items-center gap-4">
                      <span className="text-sm text-gray-500">
                        <span className="font-semibold text-[#0D76BE]">{filteredArticles.length}</span> artikel ditemukan
                      </span>
                      <button
                        onClick={() => setShowFilterModal(false)}
                        className="px-6 py-2.5 bg-[#0d76be] hover:bg-[#0a5a91] text-white text-sm font-medium rounded-full transition-colors"
                      >
                        Terapkan Filter
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Animation styles */}
          <style>{`
            @keyframes slideDown {
              from {
                opacity: 0;
                transform: translateY(-10px);
              }
              to {
                opacity: 1;
                transform: translateY(0);
              }
            }
            .animate-slideDown {
              animation: slideDown 0.2s ease-out;
            }
          `}</style>
        </>
      )}

      {/* Articles Grid */}
      <section className="py-12">
        <div className="container mx-auto px-8 md:px-12 lg:px-16">
          {currentArticles.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {currentArticles.map((article) => (
                <Link
                  key={article._id}
                  to={`/artikel/${article.slug}`}
                  className="group"
                >
                  {/* Image */}
                  <div className="relative h-48 overflow-hidden rounded-lg mb-3">
                    <img
                      src={article.featuredImage?.url || '/placeholder.jpg'}
                      alt={article.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                    />
                  </div>

                  {/* Content */}
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <p className="text-xs text-gray-500">
                        {new Date(article.publishedAt).toLocaleDateString('id-ID', {
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric'
                        })}
                      </p>
                      {article.categoryTopik && (
                        <span className="text-xs font-semibold text-blue-600 bg-blue-50 px-2 py-1 rounded">
                          {article.categoryTopik.name}
                        </span>
                      )}
                    </div>
                    <h3 className="text-sm md:text-base font-semibold text-gray-800 line-clamp-2 group-hover:text-blue-600 transition-colors">
                      {article.title}
                    </h3>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <p className="text-gray-600 text-lg">Tidak ada artikel yang ditemukan.</p>
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center mt-12">
              <div className="flex gap-2">
                {currentPage > 1 && (
                  <button
                    onClick={() => paginate(currentPage - 1)}
                    className="px-4 py-2 bg-gray-100 text-gray-700 font-medium rounded-full hover:bg-gray-200 transition-colors text-sm"
                  >
                    &laquo;
                  </button>
                )}
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNumber) => (
                  <button
                    key={pageNumber}
                    onClick={() => paginate(pageNumber)}
                    className={`w-10 h-10 font-medium rounded-full transition-colors text-sm ${
                      currentPage === pageNumber
                        ? 'bg-[#0d76be] text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {pageNumber}
                  </button>
                ))}
                {currentPage < totalPages && (
                  <button
                    onClick={() => paginate(currentPage + 1)}
                    className="px-4 py-2 bg-gray-100 text-gray-700 font-medium rounded-full hover:bg-gray-200 transition-colors text-sm"
                  >
                    &raquo;
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default Artikel;
