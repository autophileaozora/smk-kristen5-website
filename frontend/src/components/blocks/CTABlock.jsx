const CTABlock = ({
  title = 'Ready to Get Started?',
  description = 'Join us today and experience the difference.',
  buttonText = 'Get Started',
  buttonUrl = '#',
  secondaryButtonText = '',
  secondaryButtonUrl = '#',
  backgroundImage = '',
  backgroundColor = 'primary',
  textColor = 'white',
  layout = 'centered',
}) => {
  const bgColorClasses = {
    primary: 'bg-gradient-to-r from-primary-600 to-primary-700',
    blue: 'bg-gradient-to-r from-blue-600 to-blue-700',
    dark: 'bg-gradient-to-r from-gray-800 to-gray-900',
    success: 'bg-gradient-to-r from-green-600 to-green-700',
  };

  const textColorClasses = {
    white: 'text-white',
    black: 'text-gray-900',
  };

  const layoutClasses = {
    centered: 'text-center items-center',
    left: 'text-left items-start',
    split: 'text-left md:flex-row md:justify-between md:items-center',
  };

  return (
    <div className="my-8">
      <div
        className={`
          ${backgroundImage ? 'relative' : bgColorClasses[backgroundColor] || bgColorClasses.primary}
          rounded-lg overflow-hidden
        `}
      >
        {/* Background Image */}
        {backgroundImage && (
          <>
            <img
              src={backgroundImage}
              alt=""
              className="absolute inset-0 w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-black/50" />
          </>
        )}

        {/* Content */}
        <div className={`relative px-6 py-12 md:px-12 md:py-16`}>
          <div className={`flex flex-col gap-6 ${layoutClasses[layout] || layoutClasses.centered}`}>
            {/* Text Content */}
            <div className={layout === 'split' ? 'flex-1' : ''}>
              <h2 className={`text-3xl md:text-4xl font-bold mb-4 ${textColorClasses[textColor] || textColorClasses.white}`}>
                {title}
              </h2>
              <p className={`text-lg md:text-xl ${textColor === 'white' ? 'text-white/90' : 'text-gray-700'} max-w-2xl ${layout === 'centered' ? 'mx-auto' : ''}`}>
                {description}
              </p>
            </div>

            {/* Buttons */}
            <div className={`flex flex-wrap gap-4 ${layout === 'centered' ? 'justify-center' : 'justify-start'}`}>
              <a
                href={buttonUrl}
                className="px-8 py-3 bg-white text-primary-600 font-semibold rounded-lg hover:bg-gray-100 transition-colors shadow-lg"
              >
                {buttonText}
              </a>
              {secondaryButtonText && (
                <a
                  href={secondaryButtonUrl}
                  className={`px-8 py-3 border-2 ${textColor === 'white' ? 'border-white text-white hover:bg-white/10' : 'border-gray-900 text-gray-900 hover:bg-gray-100'} font-semibold rounded-lg transition-colors`}
                >
                  {secondaryButtonText}
                </a>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CTABlock;
