/**
 * ImageBlock — Page builder image component.
 * Supports standard layout AND Microsoft Word-style text wrapping:
 *  - none        : normal block (default)
 *  - square      : float left/right, text wraps in rectangular space
 *  - tight       : float + shape-outside for closer text wrapping
 *  - through     : float + shape-outside: border-box (text fills transparent areas)
 *  - topbottom   : centered block, text only above and below (clear both sides)
 */
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

  // Text wrapping (Word-style)
  wrapStyle = 'none',    // none | square | tight | through | topbottom
  floatSide = 'left',    // left | right  — applies when wrapStyle is square/tight/through
  wrapWidth = '40%',     // width of image when floating, e.g. "40%" or "300px"
  wrapMargin = '16px',   // space between image and surrounding text

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

  // ── FLOATING / TEXT WRAP modes ────────────────────────────────────────────
  // square, tight, through all use CSS float with varying shape-outside
  if (wrapStyle === 'square' || wrapStyle === 'tight' || wrapStyle === 'through') {
    const isLeft = floatSide !== 'right';

    let shapeOutside;
    if (wrapStyle === 'tight') shapeOutside = 'content-box';
    else if (wrapStyle === 'through') shapeOutside = 'border-box';

    const floatStyle = {
      float: isLeft ? 'left' : 'right',
      width: wrapWidth || '40%',
      maxWidth: '100%',
      margin: isLeft
        ? `0 ${wrapMargin} ${wrapMargin} 0`
        : `0 0 ${wrapMargin} ${wrapMargin}`,
      ...(shapeOutside ? { shapeOutside, shapeMargin: wrapMargin } : {}),
    };

    const imgStyle = maxHeight ? { maxHeight, width: '100%' } : {};

    return (
      <figure
        className={`${roundedClasses[rounded]} overflow-hidden ${className}`}
        style={floatStyle}
      >
        <img
          src={src}
          alt={alt}
          loading="lazy"
          className={`w-full h-auto ${fitClasses[objectFit] || 'object-cover'} ${roundedClasses[rounded]}`}
          style={imgStyle}
        />
        {caption && (
          <figcaption className="text-xs text-gray-500 mt-1 text-center">{caption}</figcaption>
        )}
      </figure>
    );
  }

  // ── TOP & BOTTOM mode ─────────────────────────────────────────────────────
  // Image sits as a block with clear:both — text flows only above/below
  if (wrapStyle === 'topbottom') {
    const tbStyle = {
      display: 'block',
      clear: 'both',
      width: wrapWidth && wrapWidth !== '40%' ? wrapWidth : 'auto',
      maxWidth: '100%',
      margin: `0 auto ${wrapMargin} auto`,
    };
    return (
      <figure className={`${className}`} style={tbStyle}>
        <img
          src={src}
          alt={alt}
          loading="lazy"
          className={`w-full h-auto ${roundedClasses[rounded]}`}
          style={maxHeight ? { maxHeight, width: '100%', objectFit: fitClasses[objectFit] || 'cover' } : {}}
        />
        {caption && (
          <figcaption className="text-sm text-gray-600 mt-2 text-center">{caption}</figcaption>
        )}
      </figure>
    );
  }

  // ── DEFAULT (none) ────────────────────────────────────────────────────────
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
