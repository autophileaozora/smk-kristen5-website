import { useState, useEffect, useRef } from 'react';
import api from '../../services/api';
import { useLanguage } from '../../contexts/LanguageContext';
import T from '../../components/T';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';

const FasilitasList = () => {
  const [fasilitas, setFasilitas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('Semua');
  const [categories, setCategories] = useState([]);
  const { t } = useLanguage();

  // Navbar state
  const [navbarVisible, setNavbarVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const scrollTimeout = useRef(null);

  useEffect(() => {
    fetchFasilitas();
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      // Show navbar when at top
      if (currentScrollY < 100) {
        clearTimeout(scrollTimeout.current);
        setNavbarVisible(true);
      }
      // Hide navbar on scroll down
      else if (currentScrollY > lastScrollY && currentScrollY > 100) {
        clearTimeout(scrollTimeout.current);
        scrollTimeout.current = setTimeout(() => {
          setNavbarVisible(false);
        }, 300);
      }
      // Show navbar on scroll up
      else if (currentScrollY < lastScrollY) {
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

  const fetchFasilitas = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/api/fasilitas/active`);
      const data = response.data?.data?.fasilitas || response.data?.data || [];
      setFasilitas(data);

      // Extract unique categories
      const uniqueCategories = [...new Set(data.map((item) => item.category).filter(Boolean))];
      setCategories(uniqueCategories);
    } catch (error) {
      console.error('Error fetching fasilitas:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredFasilitas =
    selectedCategory === 'Semua'
      ? fasilitas
      : fasilitas.filter((item) => item.category === selectedCategory);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 font-poppins">
      {/* Russo One Font */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700;800&family=Russo+One&display=swap');
        .russo {
          font-family: 'Russo One', sans-serif;
        }
      `}</style>

      {/* Navbar */}
      <Navbar activePage="fasilitas" visible={navbarVisible} />

      {/* Hero Section */}
      <section className="relative pt-16 bg-gradient-to-r from-[#2e41e4] to-[#0d76be] overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-24 -right-24 w-96 h-96 bg-white/5 rounded-full"></div>
          <div className="absolute -bottom-32 -left-32 w-[500px] h-[500px] bg-white/5 rounded-full"></div>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-white/[0.02] rounded-full"></div>
        </div>

        <div className="relative z-10 max-w-[1400px] mx-auto px-6 lg:px-16 py-20 md:py-28 text-center text-white">
          <h1 className="russo text-3xl md:text-5xl lg:text-6xl mb-4 drop-shadow-lg">
            {t('facility.title').toUpperCase()}
          </h1>
          <p className="text-base md:text-lg lg:text-xl text-white/90 max-w-2xl mx-auto leading-relaxed">
            {t('facility.subtitle')}
          </p>
        </div>
      </section>

      {/* Category Filter */}
      <section className="bg-white shadow-sm sticky top-16 z-30">
        <div className="max-w-[1400px] mx-auto px-6 lg:px-16 py-4">
          <div className="flex flex-wrap items-center justify-center gap-2 md:gap-3">
            <button
              onClick={() => setSelectedCategory('Semua')}
              className={`px-5 py-2 text-sm font-medium transition-all ${
                selectedCategory === 'Semua'
                  ? 'bg-[#0d76be] text-white rounded-full'
                  : 'bg-gray-100 text-gray-600 rounded-full hover:bg-gray-200'
              }`}
            >
              {t('facility.allCategories')}
            </button>
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-5 py-2 text-sm font-medium transition-all ${
                  selectedCategory === category
                    ? 'bg-[#0d76be] text-white rounded-full'
                    : 'bg-gray-100 text-gray-600 rounded-full hover:bg-gray-200'
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Facilities Grid */}
      <section className="py-12">
        <div className="max-w-[1400px] mx-auto px-6 lg:px-16">
          {filteredFasilitas.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredFasilitas.map((item) => (
                <div
                  key={item._id}
                  className="bg-white rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden group"
                >
                  {/* Image */}
                  <div className="relative h-52 overflow-hidden">
                    <img
                      src={item.image?.url || item.image || '/placeholder.jpg'}
                      alt={item.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    {item.category && (
                      <span className="absolute top-3 left-3 bg-gray-900/80 backdrop-blur-sm text-white text-xs font-semibold px-3 py-1 rounded-full">
                        {item.category}
                      </span>
                    )}
                  </div>

                  {/* Content */}
                  <div className="p-5">
                    {/* Tags row */}
                    {(item.category || item.isActive) && (
                      <div className="flex flex-wrap gap-2 mb-3">
                        {item.category && (
                          <span className="px-3 py-1 text-xs font-medium rounded-full bg-gray-900 text-white">
                            {item.category}
                          </span>
                        )}
                        {item.isActive && (
                          <span className="px-3 py-1 text-xs font-medium rounded-full bg-[#0d76be] text-white">
                            Aktif
                          </span>
                        )}
                      </div>
                    )}

                    <h3 className="text-lg font-bold text-gray-900 mb-2 leading-snug group-hover:text-[#0d76be] transition-colors">
                      <T>{item.name}</T>
                    </h3>

                    {item.description && (
                      <p className="text-gray-500 text-sm mb-4 leading-relaxed"
                         style={{ display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                        <T>{item.description}</T>
                      </p>
                    )}

                    {/* Meta row */}
                    <div className="flex flex-wrap items-center gap-4">
                      {item.location && (
                        <div className="flex items-center gap-1.5 text-[#0d76be]">
                          <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                          <span className="text-sm">{item.location}</span>
                        </div>
                      )}
                      {item.capacity && (
                        <div className="flex items-center gap-1.5 text-[#0d76be]">
                          <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                          </svg>
                          <span className="text-sm">{item.capacity}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <svg
                className="w-16 h-16 text-gray-300 mx-auto mb-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                />
              </svg>
              <p className="text-gray-600 text-lg">{t('facility.noFacilities')}</p>
              {selectedCategory !== 'Semua' && (
                <button
                  onClick={() => setSelectedCategory('Semua')}
                  className="mt-4 px-6 py-2 bg-[#0d76be] hover:bg-[#0a5a91] text-white rounded-full transition-colors text-sm font-medium"
                >
                  {t('facility.viewAll')}
                </button>
              )}
            </div>
          )}
        </div>
      </section>

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default FasilitasList;
