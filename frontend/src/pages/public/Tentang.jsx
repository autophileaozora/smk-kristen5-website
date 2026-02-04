import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';

const Tentang = () => {
  const [sections, setSections] = useState({
    sejarah: null,
    visiMisi: null,
  });
  const [contactInfo, setContactInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('sejarah');
  const [navbarVisible, setNavbarVisible] = useState(true);
  const scrollTimeout = useRef(null);
  const lastScrollY = useRef(0);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      // Show navbar when at top
      if (currentScrollY < 100) {
        clearTimeout(scrollTimeout.current);
        setNavbarVisible(true);
      }
      // Hide navbar on scroll down
      else if (currentScrollY > lastScrollY.current && currentScrollY > 100) {
        clearTimeout(scrollTimeout.current);
        scrollTimeout.current = setTimeout(() => {
          setNavbarVisible(false);
        }, 300);
      }
      // Show navbar on scroll up
      else if (currentScrollY < lastScrollY.current) {
        clearTimeout(scrollTimeout.current);
        setNavbarVisible(true);
      }
      lastScrollY.current = currentScrollY;
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [sejarahRes, visiMisiRes, contactRes] = await Promise.all([
          api.get('/api/about/sejarah').catch(() => ({ data: { data: { about: null } } })),
          api.get('/api/about/visi-misi').catch(() => ({ data: { data: { about: null } } })),
          api.get('/api/contact').catch(() => ({ data: { data: null } })),
        ]);

        setSections({
          sejarah: sejarahRes.data.data.about,
          visiMisi: visiMisiRes.data.data.about,
        });
        setContactInfo(contactRes.data.data);
      } catch (error) {
        console.error('Error fetching about data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-white">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-primary-600 border-t-transparent mx-auto"></div>
          <p className="mt-4 text-gray-600">Memuat...</p>
        </div>
      </div>
    );
  }

  const tabs = [
    { id: 'sejarah', label: 'SEJARAH', data: sections.sejarah },
    { id: 'visi-misi', label: 'VISI & MISI', data: sections.visiMisi },
    { id: 'sambutan', label: 'SAMBUTAN', data: contactInfo?.principal }
  ];

  return (
    <div className="min-h-screen bg-white">
      <Navbar activePage="" visible={navbarVisible} />

      {/* Hero Section - From Kontak */}
      <section className="relative pt-16 h-[70vh] md:h-[75vh] flex items-center justify-center overflow-hidden">
        {/* Background Image with Overlay */}
        <div className="absolute inset-0">
          <img
            src={sections.sejarah?.image || 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=1920&h=1080&fit=crop'}
            alt="Tentang SMK Kristen 5 Klaten"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#0D76BE]/90 to-[#0D76BE]/70"></div>
        </div>

        {/* Hero Content */}
        <div className="relative z-10 container mx-auto px-4 text-center text-white">
          <h1 className="text-4xl md:text-6xl font-bold mb-4 drop-shadow-lg">TENTANG KAMI</h1>
          <p className="text-lg md:text-2xl text-white/90 max-w-2xl mx-auto drop-shadow">
            Mengenal lebih dekat SMK Kristen 5 Klaten - Sejarah, Visi, Misi, dan Sambutan Kepala Sekolah
          </p>
        </div>
      </section>

      {/* Tabs Section */}
      <section className={`sticky z-40 bg-white border-b border-gray-200 shadow-sm transition-all duration-300 ${
        navbarVisible ? 'top-16 md:top-20' : 'top-0'
      }`}>
        <div className="container mx-auto px-4">
          <div className="flex overflow-x-auto">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-6 py-4 text-sm md:text-base font-semibold whitespace-nowrap transition-all ${
                  activeTab === tab.id
                    ? 'text-[#0D76BE] border-b-2 border-[#0D76BE]'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Content Sections */}
      <section className="py-12 md:py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">

            {/* Sejarah Tab */}
            {activeTab === 'sejarah' && sections.sejarah && (
              <div>
                <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-6">
                  {sections.sejarah.title}
                </h2>

                {sections.sejarah.image && (
                  <div className="mb-8">
                    <img
                      src={sections.sejarah.image}
                      alt={sections.sejarah.title}
                      className="w-full h-auto rounded-lg"
                    />
                  </div>
                )}

                <div
                  className="prose prose-lg max-w-none text-gray-700 leading-relaxed"
                  dangerouslySetInnerHTML={{ __html: sections.sejarah.content }}
                />
              </div>
            )}

            {/* Visi Misi Tab */}
            {activeTab === 'visi-misi' && sections.visiMisi && (
              <div>
                <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-6">
                  {sections.visiMisi.title}
                </h2>

                {sections.visiMisi.image && (
                  <div className="mb-8">
                    <img
                      src={sections.visiMisi.image}
                      alt={sections.visiMisi.title}
                      className="w-full h-auto rounded-lg"
                    />
                  </div>
                )}

                <div
                  className="prose prose-lg max-w-none text-gray-700 leading-relaxed"
                  dangerouslySetInnerHTML={{ __html: sections.visiMisi.content }}
                />
              </div>
            )}

            {/* Sambutan Tab */}
            {activeTab === 'sambutan' && contactInfo?.principal && (
              <div>
                <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-6">
                  Sambutan Kepala Sekolah
                </h2>

                {/* Principal Photo and Info */}
                <div className="mb-8">
                  <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
                    {contactInfo.principal.photo && (
                      <div className="flex-shrink-0">
                        <img
                          src={contactInfo.principal.photo}
                          alt={contactInfo.principal.name || 'Kepala Sekolah'}
                          className="w-48 h-48 object-cover rounded-lg"
                        />
                      </div>
                    )}
                    <div className="flex-1 text-center md:text-left">
                      <h3 className="text-xl font-bold text-gray-900 mb-1">
                        {contactInfo.principal.name}
                      </h3>
                      <p className="text-base text-gray-600">
                        {contactInfo.principal.title}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="prose prose-lg max-w-none text-gray-700 leading-relaxed whitespace-pre-wrap">
                  {contactInfo.principal.message}
                </div>

                <div className="mt-8 text-right pt-6 border-t border-gray-200">
                  <p className="text-gray-900 font-semibold">
                    {contactInfo.principal.name}
                  </p>
                  <p className="text-gray-600 text-sm">{contactInfo.principal.title}</p>
                </div>
              </div>
            )}

          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Tentang;
