import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';

const NewsGridBlock = ({
  title = '',
  showFeatured = true,
  showTopList = true,
  topListTitle = 'TOP 5 BERITA',
  showBottomSection = true,
  bottomSectionTitle = 'BERITA UTAMA',
  limit = 6,
  category = '',
  jurusan = '',
  variant = 'default', // default, simple, featured-only
  backgroundColor = 'white',
  fetchFromAPI = true,
  customArticles = [],
}) => {
  const [articles, setArticles] = useState(customArticles);
  const [loading, setLoading] = useState(fetchFromAPI);

  useEffect(() => {
    if (fetchFromAPI) {
      const fetchArticles = async () => {
        try {
          let url = `/api/articles/public?limit=${limit}`;
          if (category) url += `&category=${category}`;
          if (jurusan) url += `&jurusan=${jurusan}`;
          const res = await api.get(url);
          setArticles(res.data.data?.articles || []);
        } catch (error) {
          console.error('Error fetching articles:', error);
        } finally {
          setLoading(false);
        }
      };
      fetchArticles();
    }
  }, [fetchFromAPI, limit, category, jurusan]);

  const bgClasses = {
    white: 'bg-white',
    light: 'bg-gray-50',
    dark: 'bg-gray-900',
  };

  const textClasses = {
    white: 'text-gray-900',
    light: 'text-gray-900',
    dark: 'text-white',
  };

  if (loading) {
    return (
      <div className={`py-12 px-4 ${bgClasses[backgroundColor]}`}>
        <div className="flex justify-center">
          <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
      </div>
    );
  }

  // Simple variant - just a grid of cards
  if (variant === 'simple') {
    return (
      <section className={`py-10 lg:py-16 px-4 lg:px-10 ${bgClasses[backgroundColor]}`}>
        <div className="max-w-[1200px] mx-auto">
          {title && (
            <div className="mb-6">
              <h2 className={`text-lg font-bold ${textClasses[backgroundColor]}`}>{title}</h2>
              <div className="w-12 h-1 bg-[#0d76be] mt-2 rounded-full"></div>
            </div>
          )}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {articles.map((article, idx) => (
              <Link
                key={idx}
                to={`/artikel/${article.slug}`}
                className="group block bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow overflow-hidden"
              >
                <div className="h-48 overflow-hidden">
                  <img
                    src={article.featuredImage || 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=400&h=300&fit=crop'}
                    alt={article.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <div className="p-4">
                  <span className="text-xs text-[#0d76be] font-medium">
                    {article.categoryJurusan?.name || article.categoryTopik?.name || 'Berita'}
                  </span>
                  <h3 className="text-sm font-semibold text-gray-900 mt-1 line-clamp-2 group-hover:text-[#0d76be] transition-colors">
                    {article.title}
                  </h3>
                  <p className="text-xs text-gray-500 mt-2 line-clamp-2">{article.excerpt}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>
    );
  }

  // Featured-only variant - just the featured article with secondary ones
  if (variant === 'featured-only') {
    return (
      <section className={`py-10 lg:py-16 px-4 lg:px-10 ${bgClasses[backgroundColor]}`}>
        <div className="max-w-[1200px] mx-auto">
          {title && (
            <div className="mb-6">
              <h2 className={`text-lg font-bold ${textClasses[backgroundColor]}`}>{title}</h2>
              <div className="w-12 h-1 bg-[#0d76be] mt-2 rounded-full"></div>
            </div>
          )}

          <div className="flex flex-col lg:flex-row gap-6">
            {/* Main Featured */}
            {articles[0] && (
              <Link
                to={`/artikel/${articles[0].slug}`}
                className="flex-1 relative rounded-xl overflow-hidden group"
              >
                <div className="relative h-[280px] lg:h-[400px]">
                  <img
                    src={articles[0].featuredImage || 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=800&h=600&fit=crop'}
                    alt={articles[0].title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent"></div>
                  <div className="absolute bottom-0 left-0 right-0 p-6">
                    <span className="text-yellow-400 text-xs font-medium">
                      {articles[0].categoryJurusan?.name || articles[0].categoryTopik?.name || 'Berita'}
                    </span>
                    <h2 className="text-xl lg:text-2xl font-bold text-white mt-2 line-clamp-2">
                      {articles[0].title}
                    </h2>
                    <p className="text-sm text-gray-300 mt-2 line-clamp-2 hidden lg:block">
                      {articles[0].excerpt}
                    </p>
                  </div>
                </div>
              </Link>
            )}

            {/* Secondary articles */}
            <div className="w-full lg:w-[350px] space-y-4">
              {articles.slice(1, 4).map((article, idx) => (
                <Link
                  key={idx}
                  to={`/artikel/${article.slug}`}
                  className="flex gap-4 group"
                >
                  <div className="w-24 h-20 flex-shrink-0 rounded-lg overflow-hidden">
                    <img
                      src={article.featuredImage || 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=200&h=150&fit=crop'}
                      alt={article.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <span className="text-[10px] text-[#0d76be] font-medium">
                      {article.categoryJurusan?.name || article.categoryTopik?.name || 'Berita'}
                    </span>
                    <h4 className="text-sm font-medium text-gray-900 line-clamp-2 group-hover:text-[#0d76be] transition-colors">
                      {article.title}
                    </h4>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>
    );
  }

  // Default variant - full layout with featured, top list, and bottom section
  return (
    <section className={`py-10 lg:py-16 px-4 lg:px-10 ${bgClasses[backgroundColor]}`}>
      <div className="max-w-[1200px] mx-auto">
        {title && (
          <div className="mb-6">
            <h2 className={`text-lg font-bold ${textClasses[backgroundColor]}`}>{title}</h2>
            <div className="w-12 h-1 bg-[#0d76be] mt-2 rounded-full"></div>
          </div>
        )}

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Left - Main Featured with smaller articles */}
          <div className="flex-1">
            {/* Main Featured Article */}
            {showFeatured && articles[0] && (
              <Link to={`/artikel/${articles[0].slug}`} className="relative rounded-xl overflow-hidden mb-4 block group">
                <div className="relative h-[220px] sm:h-[280px] lg:h-[320px]">
                  <img
                    src={articles[0].featuredImage || 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=800&h=600&fit=crop'}
                    alt={articles[0].title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-gradient-to-r from-[#1e1e1e]/95 via-[#1e1e1e]/70 to-transparent lg:to-transparent to-[#1e1e1e]/30"></div>

                  <div className="absolute inset-0 p-4 lg:p-6 flex flex-col justify-center max-w-full lg:max-w-[55%]">
                    <h2 className="text-base sm:text-xl lg:text-2xl font-bold text-white leading-tight mb-2 lg:mb-3 line-clamp-2 lg:line-clamp-none">
                      {articles[0].title}
                    </h2>
                    <span className="text-yellow-400 text-[10px] lg:text-xs font-medium mb-2 lg:mb-3">
                      {articles[0].categoryJurusan?.name || articles[0].categoryTopik?.name || 'Berita'}
                    </span>
                    <p className="text-xs lg:text-sm text-gray-300 leading-relaxed line-clamp-2 lg:line-clamp-4 hidden sm:block">
                      {articles[0].excerpt || 'Berita terbaru dari SMK Kristen 5 Klaten.'}
                    </p>
                  </div>
                </div>
              </Link>
            )}

            {/* Smaller articles below */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 lg:gap-4">
              {articles.slice(1, 3).map((article, idx) => (
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
                      src={article.featuredImage || 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=200&h=150&fit=crop'}
                      alt={article.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                </Link>
              ))}
            </div>
          </div>

          {/* Right - TOP 5 BERITA */}
          {showTopList && (
            <div className="w-full lg:w-[280px] flex-shrink-0 mt-6 lg:mt-0">
              <div className="flex items-center gap-2 mb-4 lg:mb-6">
                <div className="w-1 h-5 lg:h-6 bg-[#0d76be] rounded-full"></div>
                <h3 className="text-base lg:text-lg font-bold text-gray-900">{topListTitle}</h3>
              </div>

              <div className="space-y-4 lg:space-y-5">
                {articles.slice(0, 5).map((article, idx) => (
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
          )}
        </div>

        {/* BERITA UTAMA - Bottom section */}
        {showBottomSection && (
          <div className="mt-8 lg:mt-12">
            <div className="mb-4 lg:mb-6">
              <h3 className="text-base lg:text-lg font-bold text-gray-900">{bottomSectionTitle}</h3>
              <div className="w-10 lg:w-12 h-1 bg-[#0d76be] mt-2 rounded-full"></div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6 md:gap-8">
              {articles.slice(0, 3).map((article, idx) => (
                <Link
                  key={idx}
                  to={`/artikel/${article.slug}`}
                  className="group"
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
        )}
      </div>
    </section>
  );
};

export default NewsGridBlock;
