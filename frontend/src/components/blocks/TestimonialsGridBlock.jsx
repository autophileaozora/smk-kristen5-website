import { useState, useEffect } from 'react';
import api from '../../services/api';

const TestimonialsGridBlock = ({
  title = 'Cerita pengalaman menarik dan berkesan oleh alumni kami',
  description = 'SMK Kristen 5 Klaten telah memiliki sertifikat ISO 9008:2015 dan menggandeng mitra industri guna menjamin mutu pendidikan dan keselarasan dengan industri.',
  buttonText = 'BAGIKAN CERITAMU',
  buttonUrl = '#',
  columns = 2,
  limit = 6,
  variant = 'default', // default, scrolling, carousel, grid
  backgroundColor = 'dark', // dark, light, white
  showAnimation = true,
  fetchFromAPI = true,
  customTestimonials = [],
}) => {
  const [testimonials, setTestimonials] = useState(customTestimonials);
  const [loading, setLoading] = useState(fetchFromAPI);
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    if (fetchFromAPI) {
      const fetchAlumni = async () => {
        try {
          const res = await api.get('/api/alumni');
          setTestimonials(res.data.data?.alumni || []);
        } catch (error) {
          console.error('Error fetching alumni:', error);
        } finally {
          setLoading(false);
        }
      };
      fetchAlumni();
    }
  }, [fetchFromAPI]);

  // Auto-slide for carousel/mobile
  useEffect(() => {
    if (variant === 'carousel' || variant === 'default') {
      const interval = setInterval(() => {
        setCurrentSlide((prev) => (prev + 1) % Math.ceil(testimonials.length / 3));
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [testimonials.length, variant]);

  const bgClasses = {
    dark: 'bg-[rgba(30,30,30,0.95)]',
    light: 'bg-gray-100',
    white: 'bg-white',
  };

  const textClasses = {
    dark: 'text-white',
    light: 'text-gray-900',
    white: 'text-gray-900',
  };

  const subtextClasses = {
    dark: 'text-gray-300',
    light: 'text-gray-600',
    white: 'text-gray-600',
  };

  const cardBgClasses = {
    dark: 'bg-transparent border border-white/10',
    light: 'bg-white shadow-md',
    white: 'bg-gray-50 shadow-sm',
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

  const TestimonialCard = ({ testimonial, compact = false }) => (
    <div className={`${compact ? 'p-4' : 'p-6'} ${cardBgClasses[backgroundColor]} rounded-lg`}>
      <p className={`text-xs leading-relaxed ${backgroundColor === 'dark' ? 'text-[#d9d9d9]' : 'text-gray-600'}`}>
        {testimonial.testimonial}
      </p>
      <div className={`flex items-center gap-3 ${compact ? 'mt-4' : 'mt-5'}`}>
        <img
          src={testimonial.photo || 'https://via.placeholder.com/48'}
          alt={testimonial.name}
          className={`${compact ? 'w-10 h-10' : 'w-12 h-12'} rounded-full object-cover`}
        />
        <div>
          <h4 className={`${compact ? 'text-sm' : 'text-sm'} font-semibold ${textClasses[backgroundColor]}`}>
            {testimonial.name}
          </h4>
          <span className={`text-[11px] ${backgroundColor === 'dark' ? 'text-[#b8b8b8]' : 'text-gray-500'} block mt-0.5`}>
            {testimonial.currentOccupation} - {testimonial.company}
          </span>
        </div>
      </div>
      <p className={`text-right text-[11px] ${backgroundColor === 'dark' ? 'text-[#7a7a7a]' : 'text-gray-400'} font-medium mt-3 italic`}>
        -Alumni {testimonial.graduationYear}
      </p>
    </div>
  );

  // Grid variant - simple static grid
  if (variant === 'grid') {
    const colClasses = {
      1: 'grid-cols-1',
      2: 'grid-cols-1 md:grid-cols-2',
      3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
    };

    return (
      <div className={`py-10 lg:py-16 px-4 lg:px-10 ${bgClasses[backgroundColor]}`}>
        <div className="max-w-6xl mx-auto">
          {(title || description) && (
            <div className="text-center mb-8">
              {title && (
                <h2 className={`text-xl lg:text-2xl font-bold ${textClasses[backgroundColor]} mb-3`}>
                  {title}
                </h2>
              )}
              {description && (
                <p className={`text-sm ${subtextClasses[backgroundColor]} max-w-2xl mx-auto`}>
                  {description}
                </p>
              )}
            </div>
          )}
          <div className={`grid ${colClasses[columns]} gap-4 lg:gap-6`}>
            {testimonials.slice(0, limit).map((testimonial, idx) => (
              <TestimonialCard key={idx} testimonial={testimonial} />
            ))}
          </div>
          {buttonText && (
            <div className="text-center mt-8">
              <a
                href={buttonUrl}
                className={`inline-flex items-center px-6 py-3 ${
                  backgroundColor === 'dark'
                    ? 'bg-transparent border-2 border-[#c9a55b] text-white hover:bg-[#c9a55b]'
                    : 'bg-primary-600 text-white hover:bg-primary-700'
                } text-xs font-semibold rounded transition-all`}
              >
                {buttonText}
              </a>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Carousel variant - horizontal sliding
  if (variant === 'carousel') {
    const itemsPerSlide = 3;
    const totalSlides = Math.ceil(testimonials.length / itemsPerSlide);

    return (
      <div className={`py-10 lg:py-16 px-4 lg:px-10 ${bgClasses[backgroundColor]} overflow-hidden`}>
        <div className="max-w-6xl mx-auto">
          {(title || description) && (
            <div className="text-center mb-8">
              {title && (
                <h2 className={`text-xl lg:text-2xl font-bold ${textClasses[backgroundColor]} mb-3`}>
                  {title}
                </h2>
              )}
              {description && (
                <p className={`text-sm ${subtextClasses[backgroundColor]} max-w-2xl mx-auto`}>
                  {description}
                </p>
              )}
            </div>
          )}

          <div className="relative">
            <div
              className="flex transition-transform duration-500"
              style={{ transform: `translateX(-${currentSlide * 100}%)` }}
            >
              {Array.from({ length: totalSlides }).map((_, slideIdx) => (
                <div key={slideIdx} className="w-full flex-shrink-0 grid grid-cols-1 md:grid-cols-3 gap-4 px-2">
                  {testimonials.slice(slideIdx * itemsPerSlide, (slideIdx + 1) * itemsPerSlide).map((testimonial, idx) => (
                    <TestimonialCard key={idx} testimonial={testimonial} compact />
                  ))}
                </div>
              ))}
            </div>

            {/* Navigation dots */}
            <div className="flex justify-center gap-2 mt-6">
              {Array.from({ length: totalSlides }).map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentSlide(idx)}
                  className={`w-2 h-2 rounded-full transition-all ${
                    currentSlide === idx
                      ? backgroundColor === 'dark' ? 'bg-yellow-300' : 'bg-primary-600'
                      : backgroundColor === 'dark' ? 'bg-white/30' : 'bg-gray-300'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Default variant - two column scrolling (like homepage)
  return (
    <section className={`${bgClasses[backgroundColor]} py-10 lg:py-16 px-4 lg:px-10 relative overflow-hidden`}>
      <style>{`
        @keyframes scrollUp {
          0% { transform: translateY(0); }
          100% { transform: translateY(-50%); }
        }
        @keyframes scrollDown {
          0% { transform: translateY(-50%); }
          100% { transform: translateY(0); }
        }
        .animate-scroll-up {
          animation: scrollUp 30s linear infinite;
        }
        .animate-scroll-down {
          animation: scrollDown 30s linear infinite;
        }
      `}</style>

      <div className="max-w-[1400px] mx-auto">
        <div className="flex flex-col lg:flex-row gap-8 lg:gap-10">
          {/* Left - Testimonials */}
          <div className="flex-1">
            {/* Desktop: Scrolling columns */}
            <div className={`hidden lg:grid grid-cols-${columns} gap-5 h-[600px] overflow-hidden`}>
              {/* Column 1 - Scroll Up */}
              <div className={`flex flex-col gap-5 ${showAnimation ? 'animate-scroll-up' : ''}`}>
                {[...testimonials.slice(0, limit), ...testimonials.slice(0, limit)].map((testimonial, idx) => (
                  <TestimonialCard key={idx} testimonial={testimonial} />
                ))}
              </div>

              {/* Column 2 - Scroll Down (if 2 columns) */}
              {columns >= 2 && (
                <div className={`flex flex-col gap-5 ${showAnimation ? 'animate-scroll-down' : ''}`}>
                  {[...testimonials.slice(0, limit), ...testimonials.slice(0, limit)].map((testimonial, idx) => (
                    <TestimonialCard key={idx} testimonial={testimonial} />
                  ))}
                </div>
              )}
            </div>

            {/* Mobile: Sliding cards */}
            <div className="lg:hidden">
              <div className="flex flex-col gap-4">
                {testimonials.slice(currentSlide * 3, currentSlide * 3 + 3).map((testimonial, idx) => (
                  <TestimonialCard key={idx} testimonial={testimonial} compact />
                ))}
              </div>

              {/* Mobile Navigation Dots */}
              <div className="flex justify-start gap-2 mt-4">
                {Array.from({ length: Math.ceil(testimonials.length / 3) }).slice(0, 3).map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setCurrentSlide(idx)}
                    className={`w-2 h-2 rounded-full transition-all ${
                      currentSlide === idx
                        ? backgroundColor === 'dark' ? 'bg-yellow-300' : 'bg-primary-600'
                        : backgroundColor === 'dark' ? 'bg-white/30' : 'bg-gray-300'
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Right - Info */}
          <div className="w-full lg:w-[400px] flex-shrink-0 order-first lg:order-last">
            {title && (
              <h2 className={`text-xl sm:text-2xl lg:text-[28px] leading-snug font-bold ${textClasses[backgroundColor]}`}>
                {title}
              </h2>
            )}
            {description && (
              <p className={`text-xs sm:text-sm leading-relaxed ${subtextClasses[backgroundColor]} mt-3 lg:mt-5`}>
                {description}
              </p>
            )}
            {buttonText && (
              <a
                href={buttonUrl}
                className={`inline-flex items-center px-6 lg:px-8 py-2.5 lg:py-3 ${
                  backgroundColor === 'dark'
                    ? 'bg-transparent border-2 border-[#c9a55b] text-white hover:bg-[#c9a55b]'
                    : 'bg-primary-600 text-white hover:bg-primary-700'
                } text-[11px] lg:text-xs font-semibold rounded mt-5 lg:mt-8 transition-all`}
              >
                {buttonText}
              </a>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default TestimonialsGridBlock;
