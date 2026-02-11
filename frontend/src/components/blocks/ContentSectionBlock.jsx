const ContentSectionBlock = ({
  title = 'Section Title',
  subtitle = '',
  description = 'Enter your description here. This section supports rich content and multiple styling options.',
  buttonText = '',
  buttonUrl = '#',
  buttonVariant = 'outline', // solid, outline, ghost
  secondaryButtonText = '',
  secondaryButtonUrl = '#',
  backgroundImage = '',
  backgroundColor = 'dark', // dark, light, primary, gradient, transparent
  textAlign = 'left', // left, center, right
  padding = 'lg', // sm, md, lg, xl
  variant = 'default', // default, card, minimal, featured
  showDivider = false,
  children,
}) => {
  const bgClasses = {
    dark: 'bg-gray-900',
    light: 'bg-gray-50',
    white: 'bg-white',
    primary: 'bg-primary-600',
    gradient: 'bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900',
    'gradient-primary': 'bg-gradient-to-br from-primary-600 via-primary-700 to-primary-800',
    'gradient-blue': 'bg-gradient-to-br from-blue-600 via-blue-700 to-blue-800',
    transparent: 'bg-transparent',
  };

  const textClasses = {
    dark: 'text-white',
    light: 'text-gray-900',
    white: 'text-gray-900',
    primary: 'text-white',
    gradient: 'text-white',
    'gradient-primary': 'text-white',
    'gradient-blue': 'text-white',
    transparent: 'text-gray-900',
  };

  const subtitleClasses = {
    dark: 'text-gray-400',
    light: 'text-gray-600',
    white: 'text-gray-600',
    primary: 'text-primary-200',
    gradient: 'text-gray-400',
    'gradient-primary': 'text-primary-200',
    'gradient-blue': 'text-blue-200',
    transparent: 'text-gray-600',
  };

  const descriptionClasses = {
    dark: 'text-gray-300',
    light: 'text-gray-700',
    white: 'text-gray-700',
    primary: 'text-primary-100',
    gradient: 'text-gray-300',
    'gradient-primary': 'text-primary-100',
    'gradient-blue': 'text-blue-100',
    transparent: 'text-gray-700',
  };

  const paddingClasses = {
    sm: 'py-8 px-4',
    md: 'py-12 px-6',
    lg: 'py-16 px-8',
    xl: 'py-24 px-12',
  };

  const alignClasses = {
    left: 'text-left items-start',
    center: 'text-center items-center mx-auto',
    right: 'text-right items-end ml-auto',
  };

  const isDark = ['dark', 'primary', 'gradient', 'gradient-primary', 'gradient-blue'].includes(backgroundColor);

  const getButtonClasses = (variant, isPrimary = true) => {
    const baseClasses = 'inline-flex items-center justify-center px-6 py-3 font-semibold rounded-lg transition-all duration-200';

    if (variant === 'solid') {
      return `${baseClasses} ${isDark ? 'bg-white text-gray-900 hover:bg-gray-100' : 'bg-primary-600 text-white hover:bg-primary-700'} shadow-lg`;
    }
    if (variant === 'outline') {
      return `${baseClasses} ${isDark ? 'border-2 border-white/70 text-white hover:bg-white/10' : 'border-2 border-gray-900 text-gray-900 hover:bg-gray-100'}`;
    }
    if (variant === 'ghost') {
      return `${baseClasses} ${isDark ? 'text-white hover:bg-white/10' : 'text-primary-600 hover:bg-primary-50'}`;
    }
    return `${baseClasses} border-2 border-white/70 text-white hover:bg-white/10`;
  };

  const renderVariant = () => {
    switch (variant) {
      case 'card':
        return (
          <div className={`${bgClasses[backgroundColor]} rounded-2xl shadow-xl overflow-hidden`}>
            {backgroundImage && (
              <div className="relative">
                <img src={backgroundImage} alt="" className="w-full h-48 object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-gray-900/80 to-transparent" />
              </div>
            )}
            <div className={`${paddingClasses[padding]} ${alignClasses[textAlign]} flex flex-col max-w-3xl`}>
              {renderContent()}
            </div>
          </div>
        );

      case 'featured':
        return (
          <div className={`${bgClasses[backgroundColor]} relative overflow-hidden`}>
            {backgroundImage && (
              <>
                <img src={backgroundImage} alt="" className="absolute inset-0 w-full h-full object-cover" />
                <div className="absolute inset-0 bg-black/60" />
              </>
            )}
            <div className={`relative ${paddingClasses[padding]}`}>
              <div className={`max-w-4xl ${textAlign === 'center' ? 'mx-auto' : textAlign === 'right' ? 'ml-auto' : ''}`}>
                <div className={`${alignClasses[textAlign]} flex flex-col`}>
                  {/* Decorative element */}
                  <div className={`w-16 h-1 ${isDark ? 'bg-primary-500' : 'bg-primary-600'} mb-6 ${textAlign === 'center' ? 'mx-auto' : textAlign === 'right' ? 'ml-auto' : ''}`} />
                  {renderContent()}
                </div>
              </div>
            </div>
          </div>
        );

      case 'minimal':
        return (
          <div className={`${paddingClasses[padding]}`}>
            <div className={`max-w-3xl ${textAlign === 'center' ? 'mx-auto' : textAlign === 'right' ? 'ml-auto' : ''}`}>
              <div className={`${alignClasses[textAlign]} flex flex-col`}>
                {renderContent()}
              </div>
            </div>
          </div>
        );

      default:
        return (
          <div className={`${bgClasses[backgroundColor]} relative overflow-hidden`}>
            {backgroundImage && (
              <>
                <img src={backgroundImage} alt="" className="absolute inset-0 w-full h-full object-cover" />
                <div className="absolute inset-0 bg-black/50" />
              </>
            )}
            <div className={`relative ${paddingClasses[padding]}`}>
              <div className={`max-w-4xl ${textAlign === 'center' ? 'mx-auto' : textAlign === 'right' ? 'ml-auto' : ''}`}>
                <div className={`${alignClasses[textAlign]} flex flex-col`}>
                  {renderContent()}
                </div>
              </div>
            </div>
          </div>
        );
    }
  };

  const renderContent = () => (
    <>
      {/* Subtitle / Label */}
      {subtitle && (
        <p className={`text-sm font-semibold uppercase tracking-wider mb-3 ${subtitleClasses[backgroundColor]}`}>
          {subtitle}
        </p>
      )}

      {/* Title */}
      <h2 className={`text-3xl md:text-4xl lg:text-5xl font-bold mb-4 leading-tight ${textClasses[backgroundColor]}`}>
        {title}
      </h2>

      {/* Divider */}
      {showDivider && (
        <div className={`w-20 h-1 ${isDark ? 'bg-primary-500' : 'bg-primary-600'} my-6 ${textAlign === 'center' ? 'mx-auto' : textAlign === 'right' ? 'ml-auto' : ''}`} />
      )}

      {/* Description */}
      {description && (
        <div
          className={`text-lg md:text-xl leading-relaxed mb-8 max-w-2xl ${descriptionClasses[backgroundColor]} ${textAlign === 'center' ? 'mx-auto' : ''}`}
          dangerouslySetInnerHTML={{ __html: description }}
        />
      )}

      {/* Nested Children (blocks) */}
      {children && (
        <div className="my-6 w-full">
          {children}
        </div>
      )}

      {/* Buttons */}
      {(buttonText || secondaryButtonText) && (
        <div className={`flex flex-wrap gap-4 ${textAlign === 'center' ? 'justify-center' : textAlign === 'right' ? 'justify-end' : 'justify-start'}`}>
          {buttonText && (
            <a href={buttonUrl} className={getButtonClasses(buttonVariant, true)}>
              {buttonText}
            </a>
          )}
          {secondaryButtonText && (
            <a href={secondaryButtonUrl} className={getButtonClasses('ghost', false)}>
              {secondaryButtonText}
            </a>
          )}
        </div>
      )}
    </>
  );

  return (
    <div className="content-section-block">
      {renderVariant()}
    </div>
  );
};

export default ContentSectionBlock;
