const ImageBlock = ({
  src = '',
  alt = 'Image',
  caption = '',
  width = 'full',
  customWidth = '',
  alignment = 'center',
  rounded = 'md',
  objectFit = 'cover',
  maxHeight = '',
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

  const alignClasses = {
    left: '',
    center: 'mx-auto',
    right: 'ml-auto',
  };

  const fitClasses = {
    cover: 'object-cover',
    contain: 'object-contain',
    fill: 'object-fill',
    none: 'object-none',
  };

  if (!src) {
    return (
      <div className="bg-gray-200 flex items-center justify-center h-64 rounded-lg mb-4">
        <span className="text-gray-500">No image</span>
      </div>
    );
  }

  // Use customWidth (percentage) if set, otherwise fall back to width classes
  const figureStyle = customWidth ? { width: customWidth, maxWidth: '100%' } : {};
  const figureClass = customWidth
    ? `mb-4 ${alignClasses[alignment] || 'mx-auto'} ${className}`
    : `mb-4 ${widthClasses[width]} ${alignClasses[alignment] || ''} ${className}`;

  const imgStyle = maxHeight ? { maxHeight, width: '100%' } : {};
  const imgClass = maxHeight
    ? `${fitClasses[objectFit] || 'object-cover'} ${roundedClasses[rounded]}`
    : `w-full h-auto ${roundedClasses[rounded]}`;

  return (
    <figure className={figureClass} style={figureStyle}>
      <img
        src={src}
        alt={alt}
        loading="lazy"
        className={imgClass}
        style={imgStyle}
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
