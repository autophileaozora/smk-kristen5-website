// Team/Staff Block - Display teacher/staff profiles
const TeamBlock = ({
  title = 'Tim Kami',
  subtitle = '',
  members = [
    { name: 'Nama Lengkap', role: 'Kepala Sekolah', image: '', bio: '', social: {} },
    { name: 'Nama Lengkap', role: 'Wakil Kepala Sekolah', image: '', bio: '', social: {} },
    { name: 'Nama Lengkap', role: 'Guru', image: '', bio: '', social: {} },
  ],
  columns = 3,
  variant = 'card', // card, simple, circle
  showBio = false,
  showSocial = true,
  backgroundColor = 'white',
}) => {

  const bgClasses = {
    white: 'bg-white',
    gray: 'bg-gray-50',
    dark: 'bg-gray-900 text-white',
    primary: 'bg-primary-600 text-white',
    gradient: 'bg-gradient-to-r from-primary-600 to-blue-500 text-white',
  };

  const columnClasses = {
    2: 'grid-cols-1 sm:grid-cols-2',
    3: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4',
    5: 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-5',
  };

  const renderMember = (member, idx) => {
    const placeholder = `https://ui-avatars.com/api/?name=${encodeURIComponent(member.name)}&size=200&background=random`;

    if (variant === 'circle') {
      return (
        <div key={idx} className="text-center">
          <div className="w-32 h-32 mx-auto mb-4 rounded-full overflow-hidden shadow-lg">
            <img
              src={member.image || placeholder}
              alt={member.name}
              className="w-full h-full object-cover"
            />
          </div>
          <h3 className="font-bold text-lg">{member.name}</h3>
          <p className={`text-sm ${backgroundColor === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
            {member.role}
          </p>
          {showBio && member.bio && (
            <p className={`mt-2 text-sm ${backgroundColor === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
              {member.bio}
            </p>
          )}
          {showSocial && member.social && Object.keys(member.social).length > 0 && (
            <div className="flex justify-center gap-3 mt-3">
              {Object.entries(member.social).map(([platform, url]) => (
                <a
                  key={platform}
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-400 hover:text-primary-500 transition-colors"
                >
                  {getSocialIcon(platform)}
                </a>
              ))}
            </div>
          )}
        </div>
      );
    }

    if (variant === 'simple') {
      return (
        <div key={idx} className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full overflow-hidden flex-shrink-0">
            <img
              src={member.image || placeholder}
              alt={member.name}
              className="w-full h-full object-cover"
            />
          </div>
          <div>
            <h3 className="font-bold">{member.name}</h3>
            <p className={`text-sm ${backgroundColor === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
              {member.role}
            </p>
          </div>
        </div>
      );
    }

    // Default: card variant
    return (
      <div
        key={idx}
        className={`rounded-xl overflow-hidden shadow-lg transition-transform hover:-translate-y-1 ${
          backgroundColor === 'dark' ? 'bg-gray-800' : 'bg-white'
        }`}
      >
        <div className="aspect-[4/5] overflow-hidden">
          <img
            src={member.image || placeholder}
            alt={member.name}
            className="w-full h-full object-cover"
          />
        </div>
        <div className="p-4 text-center">
          <h3 className="font-bold text-lg">{member.name}</h3>
          <p className={`text-sm ${backgroundColor === 'dark' ? 'text-gray-300' : 'text-primary-600'}`}>
            {member.role}
          </p>
          {showBio && member.bio && (
            <p className={`mt-2 text-sm ${backgroundColor === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
              {member.bio}
            </p>
          )}
          {showSocial && member.social && Object.keys(member.social).length > 0 && (
            <div className="flex justify-center gap-3 mt-3">
              {Object.entries(member.social).map(([platform, url]) => (
                <a
                  key={platform}
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-400 hover:text-primary-500 transition-colors"
                >
                  {getSocialIcon(platform)}
                </a>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  };

  const getSocialIcon = (platform) => {
    const icons = {
      facebook: (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
        </svg>
      ),
      instagram: (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
        </svg>
      ),
      twitter: (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
        </svg>
      ),
      linkedin: (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
        </svg>
      ),
      email: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
      ),
    };
    return icons[platform] || null;
  };

  return (
    <section className={`py-12 px-4 ${bgClasses[backgroundColor] || bgClasses.white}`}>
      <div className="max-w-6xl mx-auto">
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

        <div className={`grid ${columnClasses[columns] || columnClasses[3]} gap-6`}>
          {members.map((member, idx) => renderMember(member, idx))}
        </div>
      </div>
    </section>
  );
};

export default TeamBlock;
