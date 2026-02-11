const HeroBlock = ({
  title = 'Welcome',
  subtitle = 'This is a hero section',
  backgroundImage,
  height = 'lg',
  overlay = true,
  overlayStyle = 'gradient', // gradient, dark, light, none
  textAlign = 'center', // center, left, right
  className = '',
  children,
}) => {
  const predefinedHeights = {
    sm: 'h-64',
    md: 'h-96',
    lg: 'h-[500px]',
    xl: 'h-[600px]',
    full: 'h-screen',
  };

  // Check if height is a predefined value or custom (like '600px', '400px')
  const isCustomHeight = height && !predefinedHeights[height];
  const heightClass = isCustomHeight ? '' : (predefinedHeights[height] || predefinedHeights.lg);

  const backgroundStyle = {
    ...(backgroundImage ? { backgroundImage: `url(${backgroundImage})` } : {}),
    ...(isCustomHeight ? { height: height } : {}),
  };

  // Overlay styles matching homepage design
  const overlayStyles = {
    gradient: {
      background: 'linear-gradient(160deg, rgba(63, 43, 150, 0.85) 0%, rgba(30, 64, 175, 0.8) 30%, rgba(13, 118, 190, 0.75) 60%, rgba(56, 189, 248, 0.7) 100%)'
    },
    dark: {
      background: 'rgba(0, 0, 0, 0.5)'
    },
    light: {
      background: 'rgba(255, 255, 255, 0.3)'
    },
    blue: {
      background: 'linear-gradient(135deg, rgba(13, 118, 190, 0.8) 0%, rgba(30, 64, 175, 0.7) 100%)'
    },
    purple: {
      background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.8) 0%, rgba(63, 43, 150, 0.7) 100%)'
    },
    none: {}
  };

  // Text alignment classes
  const textAlignClasses = {
    center: 'text-center items-center justify-center',
    left: 'text-left items-start justify-center pl-4 sm:pl-8 lg:pl-16',
    right: 'text-right items-end justify-center pr-4 sm:pr-8 lg:pr-16',
  };

  const contentAlignClass = textAlignClasses[textAlign] || textAlignClasses.center;

  return (
    <div
      className={`relative ${heightClass} bg-gradient-to-br from-blue-600 to-purple-700 bg-cover bg-center flex ${contentAlignClass} ${className}`}
      style={backgroundStyle}
    >
      {overlay && overlayStyle !== 'none' && (
        <div
          className="absolute inset-0"
          style={overlayStyles[overlayStyle] || overlayStyles.gradient}
        />
      )}

      <div className={`relative z-10 text-white px-4 max-w-4xl ${textAlign === 'center' ? 'mx-auto' : ''}`}>
        <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-4 drop-shadow-lg">
          {title}
        </h1>
        {subtitle && (
          <p className="text-lg sm:text-xl md:text-2xl text-white/90 drop-shadow">
            {subtitle}
          </p>
        )}
        {children && (
          <div className="mt-8">
            {children}
          </div>
        )}
      </div>
    </div>
  );
};

export default HeroBlock;
