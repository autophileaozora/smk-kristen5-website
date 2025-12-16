import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import { useSchoolLogo } from '../../hooks/useContact';

const Tentang = () => {
  const [sections, setSections] = useState({
    sejarah: null,
    visiMisi: null,
    sambutan: null,
  });
  const [loading, setLoading] = useState(true);
  const { logo: schoolLogo } = useSchoolLogo();
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [sejarahRes, visiMisiRes, sambutanRes] = await Promise.all([
          api.get('/api/about/sejarah').catch(() => ({ data: { data: { about: null } } })),
          api.get('/api/about/visi-misi').catch(() => ({ data: { data: { about: null } } })),
          api.get('/api/about/sambutan').catch(() => ({ data: { data: { about: null } } })),
        ]);

        setSections({
          sejarah: sejarahRes.data.data.about,
          visiMisi: visiMisiRes.data.data.about,
          sambutan: sambutanRes.data.data.about,
        });
      } catch (error) {
        console.error('Error fetching about data:', error);
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
                to="/tentang"
                className={`font-semibold ${
                  isScrolled ? 'text-primary-600' : 'text-yellow-400'
                }`}
              >
                Tentang
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
            <h1 className="text-4xl md:text-5xl font-bold mb-4">Tentang Kami</h1>
            <p className="text-xl text-gray-100">
              Mengenal lebih dekat SMK Kristen 5 Klaten
            </p>
          </div>
        </div>
      </section>

      {/* Quick Navigation */}
      <section className="py-8 bg-white sticky top-16 z-40 shadow-md">
        <div className="container mx-auto px-4">
          <div className="flex justify-center space-x-4 md:space-x-8">
            <a
              href="#sejarah"
              className="px-4 py-2 text-sm md:text-base text-gray-700 hover:text-primary-600 transition-colors"
            >
              📜 Sejarah
            </a>
            <a
              href="#visi-misi"
              className="px-4 py-2 text-sm md:text-base text-gray-700 hover:text-primary-600 transition-colors"
            >
              🎯 Visi & Misi
            </a>
            <a
              href="#sambutan"
              className="px-4 py-2 text-sm md:text-base text-gray-700 hover:text-primary-600 transition-colors"
            >
              👤 Sambutan
            </a>
          </div>
        </div>
      </section>

      {/* Sejarah Section */}
      {sections.sejarah && (
        <section id="sejarah" className="py-16 scroll-mt-32">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
                {sections.sejarah.title}
              </h2>
              {sections.sejarah.image && (
                <div className="mb-8">
                  <img
                    src={sections.sejarah.image}
                    alt={sections.sejarah.title}
                    className="w-full h-auto rounded-lg shadow-lg"
                  />
                </div>
              )}
              <div className="bg-white rounded-lg shadow-lg p-8 md:p-12">
                <div
                  className="prose prose-lg max-w-none text-gray-700 leading-relaxed"
                  dangerouslySetInnerHTML={{ __html: sections.sejarah.content }}
                />
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Visi Misi Section */}
      {sections.visiMisi && (
        <section id="visi-misi" className="py-16 bg-gray-100 scroll-mt-32">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
                {sections.visiMisi.title}
              </h2>
              {sections.visiMisi.image && (
                <div className="mb-8">
                  <img
                    src={sections.visiMisi.image}
                    alt={sections.visiMisi.title}
                    className="w-full h-auto rounded-lg shadow-lg"
                  />
                </div>
              )}
              <div className="bg-white rounded-lg shadow-lg p-8 md:p-12">
                <div
                  className="prose prose-lg max-w-none text-gray-700 leading-relaxed"
                  dangerouslySetInnerHTML={{ __html: sections.visiMisi.content }}
                />
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Sambutan Section */}
      {sections.sambutan && (
        <section id="sambutan" className="py-16 scroll-mt-32">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
                {sections.sambutan.title}
              </h2>

              {/* Principal Photo and Info */}
              {(sections.sambutan.authorPhoto || sections.sambutan.authorName) && (
                <div className="bg-white rounded-lg shadow-lg p-8 md:p-12 mb-8">
                  <div className="flex flex-col md:flex-row items-center md:items-start gap-8">
                    {sections.sambutan.authorPhoto && (
                      <div className="flex-shrink-0">
                        <img
                          src={sections.sambutan.authorPhoto}
                          alt={sections.sambutan.authorName || 'Kepala Sekolah'}
                          className="w-48 h-48 object-cover rounded-lg shadow-md"
                        />
                      </div>
                    )}
                    {sections.sambutan.authorName && (
                      <div className="flex-1 text-center md:text-left">
                        <h3 className="text-2xl font-bold text-gray-900 mb-2">
                          {sections.sambutan.authorName}
                        </h3>
                        {sections.sambutan.authorTitle && (
                          <p className="text-lg text-gray-600 mb-4">
                            {sections.sambutan.authorTitle}
                          </p>
                        )}
                        <div className="h-1 w-20 bg-primary-600 mx-auto md:mx-0"></div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {sections.sambutan.image && (
                <div className="mb-8">
                  <img
                    src={sections.sambutan.image}
                    alt={sections.sambutan.title}
                    className="w-full h-auto rounded-lg shadow-lg"
                  />
                </div>
              )}

              <div className="bg-white rounded-lg shadow-lg p-8 md:p-12">
                <div
                  className="prose prose-lg max-w-none text-gray-700 leading-relaxed"
                  dangerouslySetInnerHTML={{ __html: sections.sambutan.content }}
                />

                {sections.sambutan.authorName && (
                  <div className="mt-12 text-right border-t pt-8">
                    <p className="text-gray-900 font-semibold">
                      {sections.sambutan.authorName}
                    </p>
                    {sections.sambutan.authorTitle && (
                      <p className="text-gray-600">{sections.sambutan.authorTitle}</p>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>
      )}

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
                  <Link to="/tentang" className="hover:text-yellow-400 transition-colors underline">
                    Tentang Kami
                  </Link>
                </li>
                <li>
                  <Link to="/jurusan" className="hover:text-yellow-400 transition-colors underline">
                    Jurusan
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="text-lg font-semibold mb-4">Penanggung Jawab</h4>
              <ul className="space-y-3">
                <li>
                  <Link to="/admin" className="hover:text-yellow-400 transition-colors underline">
                    Admin Content
                  </Link>
                </li>
                <li>
                  <Link to="/login" className="hover:text-yellow-400 transition-colors underline">
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

export default Tentang;
