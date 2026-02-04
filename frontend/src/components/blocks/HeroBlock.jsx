const HeroBlock = ({
  title = 'Welcome',
  subtitle = 'This is a hero section',
  backgroundImage,
  height = 'lg',
  overlay = true,
  className = '',
  children,
}) => {
  const heights = {
    sm: 'h-64',
    md: 'h-96',
    lg: 'h-[500px]',
    xl: 'h-[600px]',
    full: 'h-screen',
  };

  const backgroundStyle = backgroundImage
    ? { backgroundImage: `url(${backgroundImage})` }
    : {};

  return (
    <div
      className={`relative ${heights[height]} bg-gradient-to-br from-blue-600 to-purple-700 bg-cover bg-center flex items-center justify-center ${className}`}
      style={backgroundStyle}
    >
      {overlay && (
        <div className="absolute inset-0 bg-black/40" />
      )}

      <div className="relative z-10 text-center text-white px-4 max-w-4xl mx-auto">
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4">
          {title}
        </h1>
        {subtitle && (
          <p className="text-xl md:text-2xl text-white/90">
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
