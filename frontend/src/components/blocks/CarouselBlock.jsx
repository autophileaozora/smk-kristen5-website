import { useState, useEffect } from 'react';
import useSwipe from '../../hooks/useSwipe';

const CarouselBlock = ({
  slides = [
    { image: 'https://via.placeholder.com/800x400', title: 'Slide 1', description: 'Description 1' },
    { image: 'https://via.placeholder.com/800x400', title: 'Slide 2', description: 'Description 2' },
    { image: 'https://via.placeholder.com/800x400', title: 'Slide 3', description: 'Description 3' },
  ],
  autoplay = true,
  interval = 5000,
  showIndicators = true,
  showControls = true,
  height = '400px',
}) => {
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    if (!autoplay || slides.length <= 1) return;

    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, interval);

    return () => clearInterval(timer);
  }, [autoplay, interval, slides.length]);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  };

  const goToSlide = (index) => {
    setCurrentSlide(index);
  };

  const swipeHandlers = useSwipe({ onLeft: nextSlide, onRight: prevSlide });

  if (slides.length === 0) {
    return (
      <div className="my-8 p-8 bg-gray-100 rounded-lg text-center text-gray-500">
        <p>No slides available</p>
      </div>
    );
  }

  return (
    <div className="my-8 relative rounded-lg overflow-hidden group" style={{ height }} {...swipeHandlers}>
      {/* Slides */}
      <div className="relative w-full h-full">
        {slides.map((slide, index) => (
          <div
            key={index}
            className={`absolute inset-0 transition-opacity duration-500 ${
              index === currentSlide ? 'opacity-100' : 'opacity-0'
            }`}
          >
            <img
              src={slide.image}
              alt={slide.title || `Slide ${index + 1}`}
              loading="lazy"
              className="w-full h-full object-cover"
            />
            {/* Overlay Content */}
            {(slide.title || slide.description) && (
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent flex items-end">
                <div className="p-6 md:p-8 text-white max-w-3xl">
                  {slide.title && (
                    <h3 className="text-2xl md:text-4xl font-bold mb-2">{slide.title}</h3>
                  )}
                  {slide.description && (
                    <p className="text-base md:text-lg opacity-90">{slide.description}</p>
                  )}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Previous Button */}
      {showControls && slides.length > 1 && (
        <button
          onClick={prevSlide}
          className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white text-gray-800 rounded-full p-2 opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
        >
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
      )}

      {/* Next Button */}
      {showControls && slides.length > 1 && (
        <button
          onClick={nextSlide}
          className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white text-gray-800 rounded-full p-2 opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
        >
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      )}

      {/* Indicators */}
      {showIndicators && slides.length > 1 && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
          {slides.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`w-2 h-2 rounded-full transition-all ${
                index === currentSlide
                  ? 'bg-white w-8'
                  : 'bg-white/50 hover:bg-white/75'
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default CarouselBlock;
