import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import { useSchoolLogo } from '../../hooks/useContact';

const Sejarah = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const { logo: schoolLogo } = useSchoolLogo();
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await api.get('/api/about/sejarah');
        setData(response.data.data.about);
      } catch (error) {
        console.error('Error fetching sejarah:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Memuat...</p>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Data tidak ditemukan</h2>
          <Link to="/" className="text-primary-600 hover:underline">
            Kembali ke Beranda
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navbar */}
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          isScrolled ? 'bg-white shadow-md py-3' : 'bg-transparent py-6'
        }`}
      >
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between">
            <Link to="/" className="flex items-center space-x-3">
              <img
                src={schoolLogo}
                alt="SMK Kristen 5 Klaten"
                className="h-12 w-12 object-contain"
              />
              <div className={`transition-colors ${isScrolled ? 'text-gray-900' : 'text-white'}`}>
                <div className="text-xl font-bold">SMK KRISTEN 5</div>
                <div className="text-sm">KLATEN</div>
              </div>
            </Link>

            <div className="hidden md:flex items-center space-x-6">
              <Link
                to="/"
                className={`transition-colors ${
                  isScrolled ? 'text-gray-700 hover:text-primary-600' : 'text-white hover:text-yellow-400'
                }`}
              >
                Beranda
              </Link>
              <Link
                to="/sejarah"
                className={`font-semibold ${
                  isScrolled ? 'text-primary-600' : 'text-yellow-400'
                }`}
              >
                Sejarah
              </Link>
              <Link
                to="/visi-misi"
                className={`transition-colors ${
                  isScrolled ? 'text-gray-700 hover:text-primary-600' : 'text-white hover:text-yellow-400'
                }`}
              >
                Visi & Misi
              </Link>
              <Link
                to="/sambutan"
                className={`transition-colors ${
                  isScrolled ? 'text-gray-700 hover:text-primary-600' : 'text-white hover:text-yellow-400'
                }`}
              >
                Sambutan
              </Link>
              <Link
                to="/artikel"
                className={`transition-colors ${
                  isScrolled ? 'text-gray-700 hover:text-primary-600' : 'text-white hover:text-yellow-400'
                }`}
              >
                Artikel
              </Link>
              <Link
                to="/kontak"
                className={`transition-colors ${
                  isScrolled ? 'text-gray-700 hover:text-primary-600' : 'text-white hover:text-yellow-400'
                }`}
              >
                Kontak
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 bg-gradient-to-br from-primary-600 to-primary-800 text-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">{data.title}</h1>
            <p className="text-xl text-gray-100">
              Perjalanan panjang SMK Kristen 5 Klaten dalam mencerdaskan generasi bangsa
            </p>
          </div>
        </div>
      </section>

      {/* Content Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            {data.image && (
              <div className="mb-8">
                <img
                  src={data.image}
                  alt={data.title}
                  className="w-full h-auto rounded-lg shadow-lg"
                />
              </div>
            )}

            <div className="bg-white rounded-lg shadow-lg p-8 md:p-12">
              <div className="prose prose-lg max-w-none">
                <div
                  className="text-gray-700 leading-relaxed whitespace-pre-line"
                  dangerouslySetInnerHTML={{ __html: data.content }}
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-800 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
            <div>
              <div className="flex items-center gap-3 mb-6">
                <img
                  src={schoolLogo}
                  alt="SMK Kristen 5 Klaten"
                  className="h-16 w-16 object-contain"
                />
                <div>
                  <div className="text-2xl font-bold">SMK KRISTEN 5</div>
                  <div className="text-xl">KLATEN</div>
                </div>
              </div>
            </div>

            <div>
              <h4 className="text-lg font-semibold mb-4">Information</h4>
              <ul className="space-y-3">
                <li>
                  <Link
                    to="/sejarah"
                    className="hover:text-yellow-400 transition-colors underline"
                  >
                    Sejarah
                  </Link>
                </li>
                <li>
                  <Link
                    to="/visi-misi"
                    className="hover:text-yellow-400 transition-colors underline"
                  >
                    Visi & Misi
                  </Link>
                </li>
                <li>
                  <Link
                    to="/sambutan"
                    className="hover:text-yellow-400 transition-colors underline"
                  >
                    Sambutan Kepala Sekolah
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="text-lg font-semibold mb-4">Penanggung Jawab</h4>
              <ul className="space-y-3">
                <li>
                  <Link
                    to="/admin"
                    className="hover:text-yellow-400 transition-colors underline"
                  >
                    Admin Content
                  </Link>
                </li>
                <li>
                  <Link
                    to="/login"
                    className="hover:text-yellow-400 transition-colors underline"
                  >
                    Login
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="text-lg font-semibold mb-4">Contact Us</h4>
              <p className="text-sm">SMK Kristen 5 Klaten</p>
              <p className="text-sm">Jl. Merbabu No. 13, Klaten</p>
              <p className="text-sm">Jawa Tengah, Indonesia</p>
            </div>
          </div>
        </div>
      </footer>

      {/* Copyright */}
      <div className="bg-[#0D76BE] text-white py-4">
        <div className="container mx-auto px-4 text-center text-sm">
          &copy; {new Date().getFullYear()} SMK Kristen 5 Klaten. All rights reserved.
        </div>
      </div>
    </div>
  );
};

export default Sejarah;
