import LazyImage from '../LazyImage';

const ImageBlock = ({
  src = '',
  alt = 'Image',
  caption = '',
  width = 'full',
  rounded = 'md',
  className = '',
}) => {
  const widthClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    full: 'w-full',
  };

  const roundedClasses = {
    none: '',
    sm: 'rounded-sm',
    md: 'rounded-md',
    lg: 'rounded-lg',
    xl: 'rounded-xl',
    full: 'rounded-full',
  };

  if (!src) {
    return (
      <div className="bg-gray-200 flex items-center justify-center h-64 rounded-lg mb-4">
        <span className="text-gray-500">No image</span>
      </div>
    );
  }

  return (
    <figure className={`mb-4 ${widthClasses[width]} ${className}`}>
      <LazyImage
        src={src}
        alt={alt}
        className={`w-full h-auto ${roundedClasses[rounded]}`}
      />
      {caption && (
        <figcaption className="text-sm text-gray-600 mt-2 text-center">
          {caption}
        </figcaption>
      )}
    </figure>
  );
};

export default ImageBlock;
