import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import { useLanguage } from '../../contexts/LanguageContext';
import T from '../../components/T';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';

const JurusanList = () => {
  const [jurusans, setJurusans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeIndex, setActiveIndex] = useState(null);
  const { t } = useLanguage();

  useEffect(() => {
    fetchJurusans();
  }, []);

  const fetchJurusans = async () => {
    try {
      const response = await api.get('/api/jurusan');
      setJurusans(response.data.data.jurusans || []);
    } catch (error) {
      console.error('Error fetching jurusans:', error);
    } finally {
      setLoading(false);
    }
  };

  // Gradient colors with glow effects
  const gradientColors = [
    { gradient: 'from-cyan-400 to-blue-500', solid: '#06b6d4', primary: '#06b6d4', glow: 'rgba(6, 182, 212, 0.4)' },
    { gradient: 'from-blue-500 to-indigo-600', solid: '#3b82f6', primary: '#3b82f6', glow: 'rgba(59, 130, 246, 0.4)' },
    { gradient: 'from-indigo-500 to-purple-600', solid: '#8b5cf6', primary: '#8b5cf6', glow: 'rgba(139, 92, 246, 0.4)' },
    { gradient: 'from-purple-500 to-pink-500', solid: '#a855f7', primary: '#a855f7', glow: 'rgba(168, 85, 247, 0.4)' },
    { gradient: 'from-pink-500 to-red-500', solid: '#ec4899', primary: '#ec4899', glow: 'rgba(236, 72, 153, 0.4)' },
    { gradient: 'from-cyan-500 to-teal-500', solid: '#14b8a6', primary: '#14b8a6', glow: 'rgba(20, 184, 166, 0.4)' },
  ];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="inline-block w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4"></div>
          <p className="text-gray-600 text-lg">{t('common.loading')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      {/* Styles */}
      <style>{`
        .vertical-text {
          writing-mode: vertical-rl;
          text-orientation: mixed;
        }

        /* Card Animations */
        @keyframes borderGlow {
          0%, 100% {
            opacity: 0.3;
            transform: rotate(0deg) scale(1);
          }
          50% {
            opacity: 0.6;
            transform: rotate(180deg) scale(1.1);
          }
        }

        @keyframes floatText {
          0%, 100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-5px);
          }
        }

        .card-glow {
          position: relative;
        }

        .card-glow::before {
          content: '';
          position: absolute;
          inset: -2px;
          border-radius: 1.5rem;
          padding: 2px;
          background: linear-gradient(45deg, rgba(255,255,255,0.1), rgba(255,255,255,0.5), rgba(255,255,255,0.1));
          -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
          -webkit-mask-composite: xor;
          mask-composite: exclude;
          opacity: 0;
          transition: opacity 0.3s ease;
        }

        .card-glow:hover::before {
          opacity: 1;
          animation: borderGlow 3s linear infinite;
        }

        /* Subtle pattern background */
        .h-screen.pt-24 {
          background-image:
            radial-gradient(circle at 20% 50%, rgba(59, 130, 246, 0.03) 0%, transparent 50%),
            radial-gradient(circle at 80% 80%, rgba(147, 51, 234, 0.03) 0%, transparent 50%);
        }
      `}</style>

      {/* Fixed Navbar */}
      <Navbar activePage="jurusan" />

      {/* Main Content - Horizontal Accordion */}
      <div className="h-screen pt-24 pb-5 px-5 flex gap-4">
        {jurusans.map((jurusan, index) => {
          const colors = gradientColors[index % gradientColors.length];
          const isActive = activeIndex === index;

          return (
            <div
              key={jurusan._id}
              className={`relative h-full transition-all duration-700 ease-[cubic-bezier(0.4,0,0.2,1)] cursor-pointer overflow-hidden rounded-3xl ${
                isActive ? 'flex-[4]' : 'flex-1'
              }`}
              onMouseEnter={() => setActiveIndex(index)}
              onMouseLeave={() => setActiveIndex(null)}
              style={{
                minWidth: isActive ? '45%' : '80px',
              }}
            >
              {/* Enhanced Apple Glassmorphism Background */}
              <div
                className="absolute inset-0 backdrop-blur-3xl rounded-3xl card-glow"
                style={{
                  background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.15), rgba(255, 255, 255, 0.05))',
                  border: '2px solid rgba(255, 255, 255, 0.6)',
                  boxShadow: `
                    0 8px 32px 0 rgba(31, 38, 135, 0.15),
                    inset 0 2px 4px 0 rgba(255, 255, 255, 0.4),
                    inset 0 -2px 4px 0 rgba(0, 0, 0, 0.05),
                    0 0 20px ${colors.glow || 'rgba(255, 255, 255, 0.1)'}
                  `
                }}
              ></div>

              {/* Glass Shine Effect */}
              <div
                className="absolute top-0 left-0 right-0 h-1/3 rounded-t-3xl"
                style={{
                  background: 'linear-gradient(180deg, rgba(255, 255, 255, 0.1) 0%, transparent 100%)',
                  pointerEvents: 'none'
                }}
              ></div>

              {/* Animated Border Glow */}
              <div
                className="absolute inset-0 rounded-3xl opacity-0 hover:opacity-100 transition-opacity duration-500"
                style={{
                  background: `linear-gradient(45deg, transparent, ${colors.primary || '#fff'}, transparent)`,
                  filter: 'blur(20px)',
                  animation: 'borderGlow 3s ease-in-out infinite'
                }}
              ></div>

              {/* Background with Gradient */}
              <div
                className={`absolute inset-0 bg-gradient-to-b ${colors.gradient} transition-all duration-700 rounded-3xl`}
                style={{
                  opacity: isActive ? 0.8 : 0.9,
                }}
              ></div>

              {/* Background Image Overlay */}
              <div
                className="absolute inset-0 bg-cover bg-center transition-all duration-700 mix-blend-overlay opacity-10 rounded-3xl"
                style={{
                  backgroundImage: `url(${jurusan.backgroundImage || 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=800&h=1200&fit=crop'})`,
                }}
              ></div>

              {/* Content for Active Item */}
              <div className={`absolute inset-0 flex flex-col justify-start p-8 lg:p-12 transition-all duration-500 ${
                isActive ? 'opacity-100' : 'opacity-0 pointer-events-none'
              }`}>
                <div className="relative z-10">
                  {/* Title */}
                  <h2 className="text-3xl lg:text-4xl font-bold mb-4 leading-tight text-white drop-shadow-lg">
                    <T>{jurusan.name}</T>
                  </h2>

                  {/* Description */}
                  <p className="text-white/90 text-sm lg:text-base mb-6 line-clamp-4 leading-relaxed max-w-lg drop-shadow">
                    <T>{jurusan.shortDescription || jurusan.description?.replace(/<[^>]*>/g, '').slice(0, 250) + '...'}</T>
                  </p>

                  {/* Button */}
                  <Link
                    to={`/jurusan/${jurusan.slug}`}
                    className="inline-block bg-white hover:bg-white/90 text-gray-900 px-6 py-2.5 lg:px-8 lg:py-3 rounded-xl text-xs lg:text-sm font-bold tracking-wide shadow-xl hover:shadow-2xl hover:scale-105 transition-all duration-300 relative z-20 overflow-hidden group"
                    onClick={(e) => {
                      e.stopPropagation();
                    }}
                  >
                    <span className="relative z-10">{t('home.viewProgramDetail')}</span>
                    <div className="absolute inset-0 bg-gray-100 transform translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
                  </Link>
                </div>
              </div>

              {/* Content for Inactive Items - Vertical Text */}
              <div className={`absolute inset-0 flex flex-col items-center justify-start pt-16 gap-1 transition-all duration-500 ${
                isActive ? 'opacity-0' : 'opacity-100'
              }`}>
                {/* Code - Vertical Stacked (Each letter on new line) */}
                {(jurusan.code || jurusan.name?.slice(0, 4).toUpperCase()).split('').map((letter, idx) => (
                  <span
                    key={idx}
                    className="text-5xl lg:text-6xl font-bold text-white tracking-wider"
                    style={{
                      textShadow: '0 2px 8px rgba(0, 0, 0, 0.15)',
                      opacity: 0.95,
                    }}
                  >
                    {letter}
                  </span>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer */}
      <Footer />

      {/* Mobile View - Responsive Layout */}
      <style>{`
        @media (max-width: 768px) {
          .h-screen.pt-24 {
            flex-direction: column !important;
            height: auto !important;
            min-height: 100vh;
            padding-top: 5rem !important;
          }

          .h-screen.pt-24 > div {
            flex: none !important;
            height: 140px !important;
            min-width: 100% !important;
            max-width: 100% !important;
          }

          .h-screen.pt-24 > div:hover {
            height: 400px !important;
          }

          /* Horizontal text for mobile */
          .h-screen.pt-24 > div span {
            display: inline !important;
            font-size: 2rem !important;
            margin: 0 0.25rem !important;
          }

          .h-screen.pt-24 > div > div:last-child {
            flex-direction: row !important;
            justify-content: center !important;
            align-items: center !important;
            padding-top: 0 !important;
            gap: 0.5rem !important;
          }
        }

        @media (max-width: 640px) {
          .h-screen.pt-24 {
            padding-left: 1rem !important;
            padding-right: 1rem !important;
            gap: 0.75rem !important;
          }

          .h-screen.pt-24 > div span {
            font-size: 1.5rem !important;
          }

          /* Button mobile sizing */
          .h-screen.pt-24 a {
            padding: 0.5rem 1.25rem !important;
            font-size: 0.75rem !important;
          }
        }
      `}</style>
    </div>
  );
};

export default JurusanList;
