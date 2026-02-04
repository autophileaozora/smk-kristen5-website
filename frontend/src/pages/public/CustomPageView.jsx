import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import PageRenderer from '../../components/PageRenderer';
import LoadingSpinner from '../../components/LoadingSpinner';
import SEO from '../../components/SEO';

const CustomPageView = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [page, setPage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchPage();
  }, [slug]);

  const fetchPage = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.get(`/api/custom-pages/public/${slug}`);

      if (response.data.success) {
        setPage(response.data.data);
      } else {
        setError('Page not found');
      }
    } catch (err) {
      console.error('Error fetching custom page:', err);
      if (err.response?.status === 404) {
        setError('Page not found');
      } else {
        setError('Failed to load page');
      }
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="pt-24 pb-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center py-20">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">404</h1>
            <p className="text-xl text-gray-600 mb-8">{error}</p>
            <button
              onClick={() => navigate('/')}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Kembali ke Beranda
            </button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <>
      <SEO
        title={page?.seo?.metaTitle || page?.title}
        description={page?.seo?.metaDescription || page?.description}
        keywords={page?.seo?.metaKeywords}
        image={page?.seo?.ogImage}
      />

      <div className="min-h-screen bg-gray-50">
        <Navbar />

        <main className="pt-24 pb-12">
          <PageRenderer blocks={page?.blocks || []} />
        </main>

        <Footer />
      </div>
    </>
  );
};

export default CustomPageView;
