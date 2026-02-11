// Timeline Block - Display school history or milestones
const TimelineBlock = ({
  title = 'Sejarah Kami',
  subtitle = '',
  items = [
    { year: '1990', title: 'Pendirian Sekolah', description: 'SMK Kristen 5 Klaten didirikan', icon: '🏫' },
    { year: '2000', title: 'Akreditasi A', description: 'Mendapat akreditasi A dari BAN-SM', icon: '🏆' },
    { year: '2010', title: 'Pembangunan Gedung Baru', description: 'Perluasan fasilitas sekolah', icon: '🏗️' },
    { year: '2020', title: 'Sertifikasi ISO', description: 'Mendapat sertifikat ISO 9001:2015', icon: '📜' },
  ],
  variant = 'alternating', // alternating, left, right, compact
  showIcons = true,
  lineColor = 'primary',
  backgroundColor = 'white',
}) => {

  const bgClasses = {
    white: 'bg-white',
    gray: 'bg-gray-50',
    dark: 'bg-gray-900 text-white',
    gradient: 'bg-gradient-to-b from-primary-50 to-white',
  };

  const lineColors = {
    primary: 'bg-primary-500',
    blue: 'bg-blue-500',
    gray: 'bg-gray-300',
    gradient: 'bg-gradient-to-b from-primary-500 to-blue-500',
  };

  const dotColors = {
    primary: 'bg-primary-500 border-primary-200',
    blue: 'bg-blue-500 border-blue-200',
    gray: 'bg-gray-500 border-gray-200',
    gradient: 'bg-primary-500 border-primary-200',
  };

  if (variant === 'compact') {
    return (
      <section className={`py-12 px-4 ${bgClasses[backgroundColor] || bgClasses.white}`}>
        <div className="max-w-4xl mx-auto">
          {(title || subtitle) && (
            <div className="text-center mb-10">
              {title && <h2 className="text-3xl font-bold mb-2">{title}</h2>}
              {subtitle && (
                <p className={`text-lg ${backgroundColor === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                  {subtitle}
                </p>
              )}
            </div>
          )}

          <div className="relative">
            {/* Vertical Line */}
            <div
              className={`absolute left-4 top-0 bottom-0 w-0.5 ${lineColors[lineColor] || lineColors.primary}`}
            />

            <div className="space-y-6">
              {items.map((item, idx) => (
                <div key={idx} className="relative pl-12">
                  {/* Dot */}
                  <div
                    className={`absolute left-2 w-5 h-5 rounded-full border-4 ${
                      dotColors[lineColor] || dotColors.primary
                    }`}
                  />

                  <div
                    className={`p-4 rounded-lg ${
                      backgroundColor === 'dark' ? 'bg-gray-800' : 'bg-white shadow-md'
                    }`}
                  >
                    <div className="flex items-center gap-3 mb-1">
                      {showIcons && item.icon && <span className="text-xl">{item.icon}</span>}
                      <span className="text-sm font-bold text-primary-600">{item.year}</span>
                    </div>
                    <h3 className="font-bold text-lg">{item.title}</h3>
                    {item.description && (
                      <p className={`mt-1 text-sm ${backgroundColor === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                        {item.description}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    );
  }

  // Alternating / Left / Right variants
  return (
    <section className={`py-12 px-4 ${bgClasses[backgroundColor] || bgClasses.white}`}>
      <div className="max-w-5xl mx-auto">
        {(title || subtitle) && (
          <div className="text-center mb-12">
            {title && <h2 className="text-3xl font-bold mb-2">{title}</h2>}
            {subtitle && (
              <p className={`text-lg ${backgroundColor === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                {subtitle}
              </p>
            )}
          </div>
        )}

        <div className="relative">
          {/* Center Line (hidden on mobile) */}
          <div
            className={`hidden md:block absolute left-1/2 transform -translate-x-1/2 top-0 bottom-0 w-1 ${
              lineColors[lineColor] || lineColors.primary
            }`}
          />

          {/* Mobile Line */}
          <div
            className={`md:hidden absolute left-4 top-0 bottom-0 w-0.5 ${
              lineColors[lineColor] || lineColors.primary
            }`}
          />

          <div className="space-y-8">
            {items.map((item, idx) => {
              const isLeft = variant === 'left' || (variant === 'alternating' && idx % 2 === 0);
              const isRight = variant === 'right' || (variant === 'alternating' && idx % 2 !== 0);

              return (
                <div key={idx} className="relative">
                  {/* Mobile Layout */}
                  <div className="md:hidden relative pl-12">
                    <div
                      className={`absolute left-2 w-5 h-5 rounded-full border-4 ${
                        dotColors[lineColor] || dotColors.primary
                      }`}
                    />
                    <div
                      className={`p-4 rounded-lg ${
                        backgroundColor === 'dark' ? 'bg-gray-800' : 'bg-white shadow-lg'
                      }`}
                    >
                      <div className="flex items-center gap-3 mb-2">
                        {showIcons && item.icon && <span className="text-2xl">{item.icon}</span>}
                        <span className="text-sm font-bold text-primary-600 bg-primary-100 px-2 py-1 rounded">
                          {item.year}
                        </span>
                      </div>
                      <h3 className="font-bold text-lg">{item.title}</h3>
                      {item.description && (
                        <p className={`mt-2 ${backgroundColor === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                          {item.description}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Desktop Layout */}
                  <div className="hidden md:flex items-center">
                    {/* Left Content */}
                    <div className={`w-1/2 ${isLeft ? 'pr-8 text-right' : ''}`}>
                      {isLeft && (
                        <div
                          className={`inline-block p-6 rounded-xl ${
                            backgroundColor === 'dark' ? 'bg-gray-800' : 'bg-white shadow-lg'
                          }`}
                        >
                          <div className="flex items-center justify-end gap-3 mb-2">
                            <span className="text-sm font-bold text-primary-600 bg-primary-100 px-3 py-1 rounded-full">
                              {item.year}
                            </span>
                            {showIcons && item.icon && <span className="text-2xl">{item.icon}</span>}
                          </div>
                          <h3 className="font-bold text-xl">{item.title}</h3>
                          {item.description && (
                            <p className={`mt-2 ${backgroundColor === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                              {item.description}
                            </p>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Center Dot */}
                    <div className="relative z-10">
                      <div
                        className={`w-6 h-6 rounded-full border-4 ${dotColors[lineColor] || dotColors.primary}`}
                      />
                    </div>

                    {/* Right Content */}
                    <div className={`w-1/2 ${isRight ? 'pl-8' : ''}`}>
                      {isRight && (
                        <div
                          className={`inline-block p-6 rounded-xl ${
                            backgroundColor === 'dark' ? 'bg-gray-800' : 'bg-white shadow-lg'
                          }`}
                        >
                          <div className="flex items-center gap-3 mb-2">
                            {showIcons && item.icon && <span className="text-2xl">{item.icon}</span>}
                            <span className="text-sm font-bold text-primary-600 bg-primary-100 px-3 py-1 rounded-full">
                              {item.year}
                            </span>
                          </div>
                          <h3 className="font-bold text-xl">{item.title}</h3>
                          {item.description && (
                            <p className={`mt-2 ${backgroundColor === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                              {item.description}
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};

export default TimelineBlock;
