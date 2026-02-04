import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { useSchoolLogo } from '../../hooks/useContact';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001';

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
      const response = await axios.get(`${API_URL}/api/articles/public?limit=100`);
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
      const response = await axios.get(`${API_URL}/api/categories/public`);
      setTopikCategories(response.data?.data?.categories || []);
    } catch (error) {
      console.error('Error fetching topik categories:', error);
    }
  };

  const fetchJurusanCategories = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/jurusan`);
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

      {/* Carousel Jumbotron */}
      <section className="relative h-[500px] md:h-[600px] overflow-hidden mt-16 md:mt-20">
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

            {/* Content - Top Left */}
            <div className="relative h-full container mx-auto px-4 flex items-start pt-12 md:pt-20">
              <div className="max-w-2xl text-white">
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
                <p className="text-base md:text-lg mb-6 line-clamp-3">
                  {article.excerpt}
                </p>
                <Link
                  to={`/artikel/${article.slug}`}
                  className="inline-block bg-blue-600 text-white px-6 md:px-8 py-2 md:py-3 rounded-full hover:bg-blue-700 transition-colors font-semibold text-sm md:text-base"
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

      {/* Search and Filter Section */}
      <section className="search-section bg-[#0D76BE] border-b border-[#0D76BE] sticky top-16 z-40">
        <div className="container mx-auto px-4 py-6">
          <div className="relative w-full max-w-4xl mx-auto">
            {/* Search Icon - Left Side */}
            <div className="absolute left-5 top-1/2 transform -translate-y-1/2 text-gray-400">
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
              className="w-full pl-14 pr-28 py-3 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent"
            />

            {/* Divider */}
            <div className="absolute right-16 top-1/2 transform -translate-y-1/2 h-6 w-px bg-gray-300"></div>

            {/* Filter Button */}
            <button
              onClick={() => setShowFilterModal(!showFilterModal)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 flex items-center gap-1.5 px-3 py-1.5 hover:bg-gray-50 rounded-full transition-colors"
            >
              <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
              </svg>
              <span className="text-sm text-gray-600">Filter</span>
              {(selectedTopik || selectedJurusan || selectedTime) && (
                <span className="bg-blue-600 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
                  {[selectedTopik, selectedJurusan, selectedTime].filter(Boolean).length}
                </span>
              )}
            </button>
          </div>
        </div>
      </section>

      {/* Filter Modal */}
      {showFilterModal && (
        <section className="bg-white border-b shadow-lg">
          <div className="container mx-auto px-4 py-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Time Filter */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Waktu Publikasi
                </label>
                <select
                  value={selectedTime}
                  onChange={(e) => setSelectedTime(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                >
                  <option value="">Semua Waktu</option>
                  <option value="7days">7 Hari Terakhir</option>
                  <option value="30days">30 Hari Terakhir</option>
                  <option value="90days">3 Bulan Terakhir</option>
                  <option value="1year">1 Tahun Terakhir</option>
                </select>
              </div>

              {/* Jurusan Filter */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Jurusan
                </label>
                <select
                  value={selectedJurusan}
                  onChange={(e) => setSelectedJurusan(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
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
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Topik
                </label>
                <select
                  value={selectedTopik}
                  onChange={(e) => setSelectedTopik(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
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
            <div className="flex justify-between items-center mt-4 pt-4 border-t">
              <button
                onClick={resetFilters}
                className="text-sm text-gray-600 hover:text-gray-800 font-medium"
              >
                Reset Filter
              </button>
              <div className="text-sm text-gray-600">
                Menampilkan {filteredArticles.length} artikel
              </div>
            </div>
          </div>
        </section>
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
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNumber) => (
                  <button
                    key={pageNumber}
                    onClick={() => paginate(pageNumber)}
                    className={`px-4 py-2 font-semibold rounded transition-colors ${
                      currentPage === pageNumber
                        ? 'bg-yellow-400 text-gray-800'
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                  >
                    {pageNumber}
                  </button>
                ))}
                {currentPage < totalPages && (
                  <button
                    onClick={() => paginate(currentPage + 1)}
                    className="px-4 py-2 bg-gray-200 text-gray-700 font-semibold rounded hover:bg-gray-300 transition-colors"
                  >
                    »
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
