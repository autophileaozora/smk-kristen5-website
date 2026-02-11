import { useState } from 'react';
import LazyImage from '../LazyImage';

const GalleryBlock = ({
  images = [
    { src: 'https://via.placeholder.com/400', alt: 'Image 1', caption: '' },
    { src: 'https://via.placeholder.com/400', alt: 'Image 2', caption: '' },
    { src: 'https://via.placeholder.com/400', alt: 'Image 3', caption: '' },
  ],
  columns = 3,
  gap = 'md',
  rounded = true,
  lightbox = true,
}) => {
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [currentImage, setCurrentImage] = useState(0);

  const columnClasses = {
    2: 'grid-cols-1 sm:grid-cols-2',
    3: 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3',
    4: 'grid-cols-2 md:grid-cols-4',
    5: 'grid-cols-2 md:grid-cols-3 lg:grid-cols-5',
  };

  const gapClasses = {
    sm: 'gap-2',
    md: 'gap-4',
    lg: 'gap-6',
  };

  const openLightbox = (index) => {
    if (lightbox) {
      setCurrentImage(index);
      setLightboxOpen(true);
    }
  };

  const closeLightbox = () => {
    setLightboxOpen(false);
  };

  const nextImage = () => {
    setCurrentImage((prev) => (prev + 1) % images.length);
  };

  const prevImage = () => {
    setCurrentImage((prev) => (prev - 1 + images.length) % images.length);
  };

  return (
    <>
      <div className={`grid ${columnClasses[columns] || columnClasses[3]} ${gapClasses[gap] || gapClasses.md} my-8`}>
        {images.map((image, index) => (
          <div
            key={index}
            className={`relative overflow-hidden ${rounded ? 'rounded-lg' : ''} cursor-pointer group`}
            onClick={() => openLightbox(index)}
          >
            <LazyImage
              src={image.src}
              alt={image.alt}
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
            />
            {image.caption && (
              <div className="absolute bottom-0 left-0 right-0 bg-black/70 text-white p-2 text-sm">
                {image.caption}
              </div>
            )}
            {lightbox && (
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                <svg
                  className="w-12 h-12 text-white opacity-0 group-hover:opacity-100 transition-opacity"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v6m3-3H7" />
                </svg>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Lightbox Modal */}
      {lightbox && lightboxOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center p-4"
          onClick={closeLightbox}
        >
          {/* Close Button */}
          <button
            onClick={closeLightbox}
            className="absolute top-4 right-4 text-white hover:text-gray-300 z-10"
          >
            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          {/* Previous Button */}
          {images.length > 1 && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                prevImage();
              }}
              className="absolute left-4 text-white hover:text-gray-300 z-10"
            >
              <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
          )}

          {/* Image */}
          <div className="max-w-6xl max-h-full" onClick={(e) => e.stopPropagation()}>
            <img
              src={images[currentImage].src}
              alt={images[currentImage].alt}
              className="max-w-full max-h-[90vh] object-contain"
            />
            {images[currentImage].caption && (
              <p className="text-white text-center mt-4">{images[currentImage].caption}</p>
            )}
          </div>

          {/* Next Button */}
          {images.length > 1 && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                nextImage();
              }}
              className="absolute right-4 text-white hover:text-gray-300 z-10"
            >
              <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          )}

          {/* Image Counter */}
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 text-white">
            {currentImage + 1} / {images.length}
          </div>
        </div>
      )}
    </>
  );
};

export default GalleryBlock;
