import { Link } from 'react-router-dom';

// Article Card Block - Customizable content card with hide/show options
const ArticleCardBlock = ({
  // Content
  image = '',
  imageAlt = 'Article image',
  tags = [
    { text: 'tkj', color: 'gray' },
    { text: 'berita terbaru', color: 'yellow' },
  ],
  date = 'Selasa, 24 July 2025',
  title = 'Cerita pengalaman menarik dan berkesan oleh alumni kami',
  description = 'SMK Kristen 5 Klaten telah memiliki sertifikat ISO 9008:2015 dan menggandeng mitra industri guna menjamin mutu pendidikan dan keselarasan dengan industri.',
  buttonText = 'BAGIKAN CERITAMU',
  buttonUrl = '#',
  // Visibility options
  showImage = true,
  showTags = true,
  showDate = true,
  showTitle = true,
  showDescription = true,
  showButton = true,
  // Styling
  mode = 'dark', // dark, light
  buttonColor = 'yellow', // yellow, primary, blue, green, white, custom
  buttonCustomColor = '#facc15',
  buttonVariant = 'solid', // solid, outline
  imageHeight = 'md', // sm, md, lg, auto
  imageFit = 'cover', // cover, contain
  imageRounded = 'lg', // none, sm, md, lg, xl, full
  titleSize = 'lg', // sm, md, lg, xl
  maxWidth = 'sm', // xs, sm, md, lg, full
  padding = 'md', // none, sm, md, lg
  align = 'left', // left, center
}) => {

  // Text colors based on mode
  const textColors = {
    dark: {
      title: 'text-white',
      description: 'text-gray-300',
      date: 'text-gray-400',
    },
    light: {
      title: 'text-gray-900',
      description: 'text-gray-600',
      date: 'text-gray-500',
    },
  };

  // Button colors
  const buttonColors = {
    yellow: {
      solid: 'bg-yellow-400 text-gray-900 hover:bg-yellow-500',
      outline: 'border-2 border-yellow-400 text-yellow-400 hover:bg-yellow-400 hover:text-gray-900',
    },
    primary: {
      solid: 'bg-primary-600 text-white hover:bg-primary-700',
      outline: 'border-2 border-primary-600 text-primary-600 hover:bg-primary-600 hover:text-white',
    },
    blue: {
      solid: 'bg-blue-600 text-white hover:bg-blue-700',
      outline: 'border-2 border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white',
    },
    green: {
      solid: 'bg-green-600 text-white hover:bg-green-700',
      outline: 'border-2 border-green-600 text-green-600 hover:bg-green-600 hover:text-white',
    },
    white: {
      solid: 'bg-white text-gray-900 hover:bg-gray-100',
      outline: 'border-2 border-white text-white hover:bg-white hover:text-gray-900',
    },
  };

  // Tag colors
  const tagColors = {
    gray: 'bg-gray-700 text-gray-200',
    yellow: 'bg-yellow-400 text-gray-900',
    primary: 'bg-primary-600 text-white',
    blue: 'bg-blue-600 text-white',
    green: 'bg-green-600 text-white',
    red: 'bg-red-600 text-white',
    purple: 'bg-purple-600 text-white',
    orange: 'bg-orange-500 text-white',
  };

  // Size classes
  const imageHeights = {
    sm: 'h-32',
    md: 'h-48',
    lg: 'h-64',
    auto: 'h-auto',
  };

  const imageFitClasses = {
    cover: 'object-cover',
    contain: 'object-contain',
    fill: 'object-fill',
    none: 'object-none',
  };

  const imageRoundedClasses = {
    none: 'rounded-none',
    sm: 'rounded-sm',
    md: 'rounded-md',
    lg: 'rounded-lg',
    xl: 'rounded-xl',
    full: 'rounded-full',
  };

  const titleSizes = {
    sm: 'text-lg',
    md: 'text-xl',
    lg: 'text-2xl',
    xl: 'text-3xl',
  };

  const maxWidths = {
    xs: 'max-w-xs',
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    full: 'max-w-full w-full',
  };

  const paddings = {
    none: 'p-0',
    sm: 'p-2',
    md: 'p-4',
    lg: 'p-6',
  };

  const colors = textColors[mode] || textColors.dark;
  const btnStyle = buttonColors[buttonColor]?.[buttonVariant] || buttonColors.yellow.solid;

  // Custom button style
  const customBtnStyle = buttonColor === 'custom' ? {
    backgroundColor: buttonVariant === 'solid' ? buttonCustomColor : 'transparent',
    borderColor: buttonCustomColor,
    borderWidth: buttonVariant === 'outline' ? '2px' : '0',
    color: buttonVariant === 'solid' ? '#1f2937' : buttonCustomColor,
  } : {};

  return (
    <div
      className={`${maxWidths[maxWidth]} ${paddings[padding]} ${
        align === 'center' ? 'mx-auto text-center' : ''
      }`}
    >
      {/* Image */}
      {showImage && image && (
        <div className={`overflow-hidden ${imageRoundedClasses[imageRounded] || 'rounded-lg'} mb-4`}>
          <img
            src={image}
            alt={imageAlt}
            className={`w-full ${imageHeights[imageHeight] || 'h-48'} ${imageFitClasses[imageFit] || 'object-cover'}`}
          />
        </div>
      )}

      {/* Tags & Date Row */}
      {(showTags || showDate) && (
        <div className={`flex flex-wrap items-center gap-2 mb-3 ${align === 'center' ? 'justify-center' : ''}`}>
          {showTags && tags.map((tag, idx) => (
            <span
              key={idx}
              className={`px-3 py-1 text-xs font-medium rounded-full ${
                tagColors[tag.color] || tagColors.gray
              }`}
            >
              {tag.text}
            </span>
          ))}
          {showDate && date && (
            <span className={`text-sm ${colors.date}`}>{date}</span>
          )}
        </div>
      )}

      {/* Title */}
      {showTitle && title && (
        <h3 className={`font-bold ${titleSizes[titleSize]} ${colors.title} mb-3 leading-tight`}>
          {title}
        </h3>
      )}

      {/* Description */}
      {showDescription && description && (
        <p className={`${colors.description} mb-4 leading-relaxed`}>
          {description}
        </p>
      )}

      {/* Button */}
      {showButton && buttonText && (
        <Link
          to={buttonUrl}
          className={`inline-block px-6 py-2.5 rounded-lg font-semibold text-sm tracking-wide transition-all duration-200 ${
            buttonColor === 'custom' ? '' : btnStyle
          }`}
          style={customBtnStyle}
        >
          {buttonText}
        </Link>
      )}
    </div>
  );
};

export default ArticleCardBlock;
