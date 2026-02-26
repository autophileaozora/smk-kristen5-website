import { useState, useEffect, useRef } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import api from '../../services/api';
import { useSchoolLogo } from '../../hooks/useContact';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';

const ArtikelDetail = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { logo: schoolLogo } = useSchoolLogo();

  const [article, setArticle] = useState(null);
  const [recentArticles, setRecentArticles] = useState([]);
  const [relatedArticles, setRelatedArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [readingTime, setReadingTime] = useState(0);

  // Navbar state
  const [navbarVisible, setNavbarVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [isScrolled, setIsScrolled] = useState(false);
  const scrollTimeout = useRef(null);

  useEffect(() => {
    fetchArticle();
    fetchRecentArticles();
    // Scroll to top when article changes
    window.scrollTo(0, 0);
  }, [slug]);

  useEffect(() => {
    if (article) {
      // Calculate reading time
      const time = calculateReadingTime(article.content);
      setReadingTime(time);

      // Fetch related articles based on category
      fetchRelatedArticles();
    }
  }, [article]);

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

  const fetchArticle = async () => {
    try {
      const response = await api.get(`/api/articles/slug/${slug}`);
      setArticle(response.data.data.article);
    } catch (error) {
      console.error('Error fetching article:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchRecentArticles = async () => {
    try {
      const response = await api.get(`/api/articles/public?limit=3`);
      // Filter out current article
      const filtered = (response.data.data.articles || []).filter(
        art => art.slug !== slug
      );
      setRecentArticles(filtered.slice(0, 3));
    } catch (error) {
      console.error('Error fetching recent articles:', error);
    }
  };


  const calculateReadingTime = (content) => {
    const wordsPerMinute = 200; // Average reading speed
    const textContent = content.replace(/<[^>]*>/g, ''); // Remove HTML tags
    const words = textContent.trim().split(/\s+/).length;
    const time = Math.ceil(words / wordsPerMinute);
    return time > 0 ? time : 1;
  };

  const fetchRelatedArticles = async () => {
    try {
      if (!article) return;

      // Use smart related articles endpoint
      const response = await api.get(`/api/articles/${article._id}/related`);
      const relatedArticles = response.data.data.articles || [];
      setRelatedArticles(relatedArticles.slice(0, 3));
    } catch (error) {
      console.error('Error fetching related articles:', error);
      // Fallback: try to fetch from public endpoint
      try {
        const response = await api.get(`/api/articles/public?limit=10`);
        const allArticles = response.data.data.articles || [];
        const related = allArticles.filter(art => {
          if (art.slug === slug) return false;
          if (article.categoryTopik && art.categoryTopik) {
            return art.categoryTopik._id === article.categoryTopik._id;
          }
          return false;
        });
        setRelatedArticles(related.slice(0, 3));
      } catch (fallbackError) {
        console.error('Fallback error fetching related articles:', fallbackError);
      }
    }
  };

  const scrollToSearch = () => {
    navigate('/artikel');
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(window.location.href);
    alert('Link artikel berhasil disalin!');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-blue-600"></div>
      </div>
    );
  }

  if (!article) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Tidak ada artikel yang ditemukan.</h2>
          <Link to="/artikel" className="text-blue-600 hover:underline">
            Kembali
          </Link>
        </div>
      </div>
    );
  }

  // Generate structured data for SEO
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    "headline": article.title,
    "image": article.featuredImage?.url,
    "datePublished": article.publishedAt,
    "dateModified": article.updatedAt || article.publishedAt,
    "author": {
      "@type": "Person",
      "name": article.author?.name || "Admin"
    },
    "description": article.metaDescription || article.excerpt,
    "articleBody": article.content?.replace(/<[^>]*>/g, '') || "",
    "publisher": {
      "@type": "Organization",
      "name": "SMK Kristen 5 Klaten",
      "logo": {
        "@type": "ImageObject",
        "url": "/logo.svg"
      }
    },
    "keywords": article.keywords?.join(", ") || ""
  };

  const baseUrl = import.meta.env.VITE_SITE_URL || 'https://smkkrisma.sch.id';
  const canonicalUrl = `${baseUrl}/artikel/${article.slug}`;
  const metaDescription = article.metaDescription || article.excerpt || "Baca artikel terbaru dari SMK Kristen 5 Klaten";

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      { "@type": "ListItem", "position": 1, "name": "Beranda", "item": baseUrl },
      { "@type": "ListItem", "position": 2, "name": "Artikel", "item": `${baseUrl}/artikel` },
      ...(article.categoryTopik ? [
        { "@type": "ListItem", "position": 3, "name": article.categoryTopik.name, "item": `${baseUrl}/artikel?topik=${article.categoryTopik.slug}` },
        { "@type": "ListItem", "position": 4, "name": article.title, "item": canonicalUrl }
      ] : [
        { "@type": "ListItem", "position": 3, "name": article.title, "item": canonicalUrl }
      ])
    ]
  };

  return (
    <div className="min-h-screen bg-gray-50 font-poppins">
      <Helmet>
        {/* Primary Meta Tags */}
        <title>{article.title} | SMK Kristen 5 Klaten</title>
        <meta name="title" content={`${article.title} | SMK Kristen 5 Klaten`} />
        <meta name="description" content={metaDescription} />
        <meta name="keywords" content={article.keywords?.join(", ") || "artikel, SMK Kristen 5 Klaten"} />
        
        {/* Canonical URL */}
        <link rel="canonical" href={canonicalUrl} />
        
        {/* Open Graph / Facebook */}
        <meta property="og:type" content="article" />
        <meta property="og:url" content={canonicalUrl} />
        <meta property="og:title" content={article.title} />
        <meta property="og:description" content={metaDescription} />
        {article.featuredImage?.url && <meta property="og:image" content={article.featuredImage.url} />}
        <meta property="article:published_time" content={article.publishedAt} />
        <meta property="article:modified_time" content={article.updatedAt || article.publishedAt} />
        <meta property="article:author" content={article.author?.name || "Admin"} />
        {article.keywords && article.keywords.map((keyword, idx) => (
          <meta key={idx} property="article:tag" content={keyword} />
        ))}
        
        {/* Twitter */}
        <meta property="twitter:card" content="summary_large_image" />
        <meta property="twitter:url" content={canonicalUrl} />
        <meta property="twitter:title" content={article.title} />
        <meta property="twitter:description" content={metaDescription} />
        {article.featuredImage?.url && <meta property="twitter:image" content={article.featuredImage.url} />}
        
        {/* Structured Data: BlogPosting */}
        <script type="application/ld+json">
          {JSON.stringify(structuredData)}
        </script>
        {/* Structured Data: BreadcrumbList */}
        <script type="application/ld+json">
          {JSON.stringify(breadcrumbSchema)}
        </script>
        {/* Structured Data: FAQPage */}
        {article.faqs && article.faqs.length > 0 && (
          <script type="application/ld+json">
            {JSON.stringify({
              "@context": "https://schema.org",
              "@type": "FAQPage",
              "mainEntity": article.faqs.map(faq => ({
                "@type": "Question",
                "name": faq.question,
                "acceptedAnswer": { "@type": "Answer", "text": faq.answer }
              }))
            })}
          </script>
        )}
      </Helmet>
      {/* Navbar */}
      <Navbar activePage="artikel" visible={navbarVisible} />

      {/* Main Content */}
      <div className="pt-20 md:pt-24 pb-16">
        <div className="max-w-[1400px] mx-auto px-6 lg:px-16">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-sm text-gray-600 mb-6 flex-wrap">
            <Link to="/" className="hover:text-blue-600 transition-colors">Beranda</Link>
            <span>/</span>
            <Link to="/artikel" className="hover:text-blue-600 transition-colors">Semua Artikel</Link>
            {article.categoryTopik && (
              <>
                <span>/</span>
                <span className="text-blue-600 font-medium">{article.categoryTopik.name}</span>
              </>
            )}
            <span>/</span>
            <span className="text-gray-800 font-medium line-clamp-1">{article.title}</span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Article Content */}
            <div className="lg:col-span-2">
              {/* Article Header */}
              <h1 className="text-2xl md:text-4xl font-bold text-gray-900 mb-4 leading-tight">
                {article.title}
              </h1>

              {/* Article Meta */}
              <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 mb-6 pb-6 border-b">
                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  <span>{article.author?.name || 'Admin'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <span>
                    {new Date(article.publishedAt).toLocaleDateString('id-ID', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric'
                    })}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>{readingTime} menit baca</span>
                </div>
                {article.categoryTopik && (
                  <div className="flex items-center gap-2">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                    </svg>
                    <span className="text-blue-600 font-medium">Kategori Berita - {article.categoryTopik.name}</span>
                  </div>
                )}
                {article.categoryJurusan && (
                  <div className="flex items-center gap-2">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                    <span className="text-purple-600 font-medium">{article.categoryJurusan.name}</span>
                  </div>
                )}
              </div>

              {/* Featured Image */}
              {article.featuredImage && (
                <div className="mb-8 w-full overflow-hidden rounded-lg shadow-lg">
                  <div className="relative w-full" style={{ paddingBottom: '56.25%' }}>
                    <img
                      src={article.featuredImage.url}
                      alt={article.altText || article.title}
                      title={article.altText || article.title}
                      className="absolute top-0 left-0 w-full h-full object-cover"
                      loading="lazy"
                    />
                  </div>
                </div>
              )}

              {/* Article Content */}
              <div
                className="article-content text-gray-800 leading-relaxed mb-8"
                dangerouslySetInnerHTML={{ __html: article.content }}
                style={{
                  fontSize: '1.125rem',
                  lineHeight: '1.8'
                }}
              />

              {/* FAQ Section */}
              {article.faqs && article.faqs.length > 0 && (
                <div className="border-t pt-6 mb-8">
                  <h2 className="text-xl font-bold text-gray-900 mb-4">Pertanyaan yang Sering Diajukan</h2>
                  <div className="space-y-3">
                    {article.faqs.map((faq, idx) => (
                      <details key={idx} className="group border border-gray-200 rounded-lg overflow-hidden">
                        <summary className="flex items-center justify-between px-4 py-3 cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors list-none">
                          <span className="font-medium text-gray-800 pr-4">{faq.question}</span>
                          <span className="text-gray-400 group-open:rotate-180 transition-transform shrink-0">▼</span>
                        </summary>
                        <div className="px-4 py-3 text-gray-700 leading-relaxed text-sm">
                          {faq.answer}
                        </div>
                      </details>
                    ))}
                  </div>
                </div>
              )}

              {/* Social Sharing */}
              <div className="border-t pt-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4">BAGIKAN ARTIKEL</h3>
                <div className="flex items-center gap-3">
                  <a
                    href={`https://www.instagram.com/`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center w-10 h-10 bg-gradient-to-br from-purple-600 via-pink-500 to-orange-400 rounded-lg hover:opacity-80 transition-opacity"
                  >
                    <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                    </svg>
                  </a>
                  <a
                    href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center w-10 h-10 bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                    </svg>
                  </a>
                  <a
                    href={`https://wa.me/?text=${encodeURIComponent(article.title + ' ' + window.location.href)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center w-10 h-10 bg-green-500 rounded-lg hover:bg-green-600 transition-colors"
                  >
                    <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                    </svg>
                  </a>
                  <button
                    onClick={copyToClipboard}
                    className="inline-flex items-center justify-center w-10 h-10 bg-gray-600 rounded-lg hover:bg-gray-700 transition-colors"
                  >
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-1 space-y-6">

              {/* Berita Terbaru */}
              <div className="rounded-xl px-5 py-4 border border-gray-200" style={{ backgroundColor: '#fffefb' }}>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-base font-bold text-gray-800 tracking-wide uppercase" style={{ fontFamily: 'Russo One, sans-serif' }}>BERITA TERBARU</h2>
                  {recentArticles.length > 0 && (
                    <Link to="/artikel" className="text-[#0d76be] text-sm font-semibold hover:text-[#0a5a91] transition-colors">
                      Lihat Lainnya
                    </Link>
                  )}
                </div>
                <div>
                  {recentArticles.length > 0 ? (
                    recentArticles.map((recentArticle, idx) => (
                      <div key={recentArticle._id}>
                        <Link to={`/artikel/${recentArticle.slug}`} className="flex gap-3 py-3 hover:opacity-70 transition-opacity">
                          <img
                            src={recentArticle.featuredImage?.url || '/placeholder.jpg'}
                            alt={recentArticle.title}
                            className="w-20 h-20 flex-shrink-0 rounded-lg object-cover"
                          />
                          <div className="min-w-0">
                            <p className="text-xs text-gray-400 mb-1">
                              {new Date(recentArticle.publishedAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                            </p>
                            <h3 className="text-sm font-bold text-gray-800 line-clamp-2 leading-snug">
                              {recentArticle.title}
                            </h3>
                          </div>
                        </Link>
                        {idx < recentArticles.length - 1 && <div className="border-t border-gray-100" />}
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-gray-400 py-2">Tidak ada artikel yang ditemukan.</p>
                  )}
                </div>
              </div>

              {/* Artikel Terkait */}
              <div className="rounded-xl px-5 py-4 border border-gray-200" style={{ backgroundColor: '#fffefb' }}>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-base font-bold text-gray-800 tracking-wide uppercase" style={{ fontFamily: 'Russo One, sans-serif' }}>ARTIKEL TERKAIT</h2>
                </div>
                <div>
                  {relatedArticles.length > 0 ? (
                    relatedArticles.map((relatedArticle, idx) => (
                      <div key={relatedArticle._id}>
                        <Link to={`/artikel/${relatedArticle.slug}`} className="flex gap-3 py-3 hover:opacity-70 transition-opacity">
                          <img
                            src={relatedArticle.featuredImage?.url || '/placeholder.jpg'}
                            alt={relatedArticle.title}
                            className="w-20 h-20 flex-shrink-0 rounded-lg object-cover"
                          />
                          <div className="min-w-0">
                            <p className="text-xs text-gray-400 mb-1">
                              {new Date(relatedArticle.publishedAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                            </p>
                            <h3 className="text-sm font-bold text-gray-800 line-clamp-2 leading-snug">
                              {relatedArticle.title}
                            </h3>
                          </div>
                        </Link>
                        {idx < relatedArticles.length - 1 && <div className="border-t border-gray-100" />}
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-gray-400 py-2">Tidak ada artikel yang ditemukan.</p>
                  )}
                </div>
              </div>

            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <Footer />

      {/* Article content image styles - supports float/size from editor */}
      <style>{`
        .article-content img {
          max-width: 100%;
          height: auto;
          border-radius: 0.5rem;
        }
        .article-content img[style*="float: left"] {
          margin-right: 1.5rem;
          margin-bottom: 1rem;
          border-radius: 0.5rem;
        }
        .article-content img[style*="float: right"] {
          margin-left: 1.5rem;
          margin-bottom: 1rem;
          border-radius: 0.5rem;
        }
        .article-content::after {
          content: "";
          display: table;
          clear: both;
        }
        .article-content p::after {
          content: "";
          display: table;
          clear: both;
        }
      `}</style>
    </div>
  );
};

export default ArtikelDetail;
