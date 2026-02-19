import { Link } from 'react-router-dom';

// Icon components (inline SVG, no external deps)
const ICONS = {
  calendar: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: '100%', height: '100%' }}>
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/>
      <line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
    </svg>
  ),
  user: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: '100%', height: '100%' }}>
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
    </svg>
  ),
  users: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: '100%', height: '100%' }}>
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/>
      <path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
    </svg>
  ),
  clock: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: '100%', height: '100%' }}>
      <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
    </svg>
  ),
  map: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: '100%', height: '100%' }}>
      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>
    </svg>
  ),
  tag: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: '100%', height: '100%' }}>
      <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/>
      <line x1="7" y1="7" x2="7.01" y2="7"/>
    </svg>
  ),
  star: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: '100%', height: '100%' }}>
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
    </svg>
  ),
  phone: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: '100%', height: '100%' }}>
      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 13 19.79 19.79 0 0 1 1.61 4.44a2 2 0 0 1 2-2.18h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/>
    </svg>
  ),
  mail: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: '100%', height: '100%' }}>
      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
      <polyline points="22,6 12,13 2,6"/>
    </svg>
  ),
  info: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: '100%', height: '100%' }}>
      <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
    </svg>
  ),
  link: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: '100%', height: '100%' }}>
      <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/>
      <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>
    </svg>
  ),
};

const MetaIcon = ({ name, color, size = 16 }) => (
  <span style={{ width: size, height: size, color, display: 'inline-block', flexShrink: 0 }}>
    {ICONS[name] || ICONS.info}
  </span>
);

/**
 * RichCardBlock - Fully customizable content card for the page builder.
 * Matches the design in the screenshot: image + overlay tag + tags row +
 * title + description + meta (icon+text) + CTA button.
 * All elements can be shown/hidden and fully styled.
 */
const RichCardBlock = ({
  // --- Image ---
  image = '',
  imageAlt = 'Card image',
  showImage = true,
  imageHeight = 'md',      // sm | md | lg | xl
  imageFit = 'cover',      // cover | contain

  // --- Overlay tag (on top of image, top-left) ---
  overlayTag = 'tag category',
  showOverlayTag = true,
  overlayTagBg = '#1f2937',
  overlayTagTextColor = '#ffffff',

  // --- Tags row (below image) ---
  // JSON string: [{"text":"...", "bg":"#1f2937", "color":"#fff"}, ...]
  tagsJson = '[{"text":"tag category","bg":"#1f2937","color":"#ffffff"},{"text":"tag category","bg":"#1f2937","color":"#ffffff"},{"text":"tag category","bg":"#1f2937","color":"#ffffff"}]',
  showTags = true,

  // --- Title ---
  title = 'Ini Contoh Judul Card',
  showTitle = true,
  titleColor = '#111827',
  titleSize = 'xl',           // base | lg | xl | 2xl | 3xl
  titleWeight = 'bold',       // normal | semibold | bold | extrabold

  // --- Description ---
  description = 'Ini contoh isi element card. SMK Kristen 5 Klaten telah memiliki sertifikat ISO 9008:2015 dan menggandeng mitra industri guna menjamin mutu pendidikan dan keselarasan dengan industri.',
  showDescription = true,
  descriptionColor = '#4b5563',
  descriptionClamp = '3',     // number of lines to clamp, 0 = no clamp

  // --- Meta row 1 (e.g. date) ---
  meta1Icon = 'calendar',     // calendar | clock | map | user | users | tag | star | phone | mail | info | link
  meta1Text = 'tanggal',
  showMeta1 = true,
  meta1Color = '#2563eb',

  // --- Meta row 2 (e.g. author/category) ---
  meta2Icon = 'user',
  meta2Text = 'keterangan lainnya',
  showMeta2 = true,
  meta2Color = '#2563eb',

  // --- CTA Button ---
  buttonText = 'BAGIKAN CERITAMU',
  buttonUrl = '#',
  buttonExternal = false,
  showButton = true,
  buttonBg = '#2563eb',
  buttonTextColor = '#ffffff',
  buttonVariant = 'solid',    // solid | outline
  showButtonArrow = true,
  buttonRadius = 'lg',        // none | sm | md | lg | xl | full

  // --- Card styling ---
  cardBg = '#ffffff',
  cardRadius = 'xl',          // none | sm | md | lg | xl | 2xl
  cardShadow = 'md',          // none | sm | md | lg | xl
  cardPadding = 'md',         // none | sm | md | lg
  maxWidth = 'sm',            // xs | sm | md | lg | xl | full
  centerCard = false,         // center card horizontally

  className = '',
}) => {
  // Parse tags JSON safely
  let tags = [];
  try { tags = typeof tagsJson === 'string' ? JSON.parse(tagsJson) : (Array.isArray(tagsJson) ? tagsJson : []); }
  catch { tags = []; }

  // Lookup maps
  const imgHeights = { sm: 'h-32', md: 'h-48', lg: 'h-64', xl: 'h-80' };
  const maxWidths = { xs: 'max-w-xs', sm: 'max-w-sm', md: 'max-w-md', lg: 'max-w-lg', xl: 'max-w-xl', full: 'w-full max-w-none' };
  const shadows = { none: '', sm: 'shadow-sm', md: 'shadow-md', lg: 'shadow-lg', xl: 'shadow-xl' };
  const radii = { none: 'rounded-none', sm: 'rounded-sm', md: 'rounded-md', lg: 'rounded-lg', xl: 'rounded-xl', '2xl': 'rounded-2xl' };
  const paddings = { none: 'p-0', sm: 'p-3', md: 'p-5', lg: 'p-7' };
  const titleSizes = { base: 'text-base', lg: 'text-lg', xl: 'text-xl', '2xl': 'text-2xl', '3xl': 'text-3xl' };
  const titleWeights = { normal: 'font-normal', semibold: 'font-semibold', bold: 'font-bold', extrabold: 'font-extrabold' };
  const btnRadii = { none: 'rounded-none', sm: 'rounded-sm', md: 'rounded-md', lg: 'rounded-lg', xl: 'rounded-xl', full: 'rounded-full' };

  // Description line clamp
  const clampNum = parseInt(descriptionClamp) || 0;
  const clampStyle = clampNum > 0
    ? { display: '-webkit-box', WebkitLineClamp: clampNum, WebkitBoxOrient: 'vertical', overflow: 'hidden' }
    : {};

  // Button styles
  const btnStyle = buttonVariant === 'outline'
    ? { border: `2px solid ${buttonBg}`, color: buttonBg, backgroundColor: 'transparent' }
    : { backgroundColor: buttonBg, color: buttonTextColor };

  // Wrapper classes
  const wrapperClass = [
    maxWidths[maxWidth] || maxWidths.sm,
    shadows[cardShadow] || shadows.md,
    radii[cardRadius] || radii.xl,
    'overflow-hidden',
    centerCard ? 'mx-auto' : '',
    className,
  ].join(' ');

  const ButtonEl = buttonExternal ? 'a' : Link;
  const btnProps = buttonExternal
    ? { href: buttonUrl, target: '_blank', rel: 'noopener noreferrer' }
    : { to: buttonUrl };

  return (
    <div className={wrapperClass} style={{ backgroundColor: cardBg }}>
      {/* Image */}
      {showImage && (
        <div className={`relative overflow-hidden ${imgHeights[imageHeight] || imgHeights.md}`}>
          {image ? (
            <img
              src={image}
              alt={imageAlt}
              loading="lazy"
              className={`w-full h-full ${imageFit === 'contain' ? 'object-contain' : 'object-cover'}`}
            />
          ) : (
            <div className="w-full h-full bg-gray-200 flex items-center justify-center">
              <span className="text-gray-400 text-sm">Gambar belum diset</span>
            </div>
          )}
          {/* Overlay tag */}
          {showOverlayTag && overlayTag && (
            <span
              className="absolute top-3 left-3 px-3 py-1 text-xs font-semibold rounded-full leading-tight"
              style={{ backgroundColor: overlayTagBg, color: overlayTagTextColor }}
            >
              {overlayTag}
            </span>
          )}
        </div>
      )}

      {/* Card body */}
      <div className={paddings[cardPadding] || paddings.md}>
        {/* Tags row */}
        {showTags && tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-3">
            {tags.map((tag, i) => (
              <span
                key={i}
                className="px-3 py-1 text-xs font-medium rounded-full leading-tight"
                style={{ backgroundColor: tag.bg || '#1f2937', color: tag.color || '#ffffff' }}
              >
                {tag.text}
              </span>
            ))}
          </div>
        )}

        {/* Title */}
        {showTitle && title && (
          <h3
            className={`${titleSizes[titleSize] || titleSizes.xl} ${titleWeights[titleWeight] || titleWeights.bold} mb-2 leading-snug`}
            style={{ color: titleColor }}
          >
            {title}
          </h3>
        )}

        {/* Description */}
        {showDescription && description && (
          <p
            className="text-sm leading-relaxed mb-4"
            style={{ ...clampStyle, color: descriptionColor }}
          >
            {description}
          </p>
        )}

        {/* Meta row */}
        {(showMeta1 || showMeta2) && (
          <div className="flex flex-wrap items-center gap-4 mb-4">
            {showMeta1 && meta1Text && (
              <div className="flex items-center gap-1.5">
                <MetaIcon name={meta1Icon} color={meta1Color} size={16} />
                <span className="text-sm" style={{ color: meta1Color }}>{meta1Text}</span>
              </div>
            )}
            {showMeta2 && meta2Text && (
              <div className="flex items-center gap-1.5">
                <MetaIcon name={meta2Icon} color={meta2Color} size={16} />
                <span className="text-sm" style={{ color: meta2Color }}>{meta2Text}</span>
              </div>
            )}
          </div>
        )}

        {/* Button */}
        {showButton && buttonText && (
          <ButtonEl
            {...btnProps}
            className={`inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold tracking-wide transition-all duration-200 ${btnRadii[buttonRadius] || btnRadii.lg}`}
            style={btnStyle}
          >
            {buttonText}
            {showButtonArrow && <span aria-hidden="true">→</span>}
          </ButtonEl>
        )}
      </div>
    </div>
  );
};

export default RichCardBlock;
