import { useState, useEffect } from 'react';
import api from '../../services/api';

const PartnersBlock = ({
  title = 'ALUMNI KAMI TELAH BEKERJA DI TOP COMPANY',
  subtitle = '',
  columns = 3,
  gap = 'md',
  variant = 'default', // default, compact, marquee
  showTitle = true,
  backgroundColor = 'white',
  logoHeight = 'md', // sm, md, lg
  fetchFromAPI = true,
  customPartners = [], // Manual list if not fetching from API
  limit = 6,
}) => {
  const [partners, setPartners] = useState(customPartners);
  const [loading, setLoading] = useState(fetchFromAPI);

  useEffect(() => {
    if (fetchFromAPI) {
      const fetchPartners = async () => {
        try {
          const res = await api.get('/api/partners');
          setPartners(res.data.data?.partners || []);
        } catch (error) {
          console.error('Error fetching partners:', error);
        } finally {
          setLoading(false);
        }
      };
      fetchPartners();
    }
  }, [fetchFromAPI]);

  const bgClasses = {
    white: 'bg-white',
    light: 'bg-gray-50',
    dark: 'bg-gray-900',
    transparent: 'bg-transparent',
  };

  const textClasses = {
    white: 'text-gray-700',
    light: 'text-gray-700',
    dark: 'text-white',
    transparent: 'text-gray-700',
  };

  const gapClasses = {
    sm: 'gap-2',
    md: 'gap-4',
    lg: 'gap-6',
  };

  const colClasses = {
    2: 'grid-cols-2',
    3: 'grid-cols-3',
    4: 'grid-cols-2 sm:grid-cols-4',
    5: 'grid-cols-3 sm:grid-cols-5',
    6: 'grid-cols-3 sm:grid-cols-6',
  };

  const heightClasses = {
    sm: 'h-10 lg:h-12',
    md: 'h-12 lg:h-16',
    lg: 'h-16 lg:h-20',
  };

  const displayPartners = partners.slice(0, limit);

  if (loading) {
    return (
      <div className={`py-8 px-4 ${bgClasses[backgroundColor]}`}>
        <div className="flex justify-center">
          <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
      </div>
    );
  }

  // Marquee variant - continuous scrolling
  if (variant === 'marquee') {
    return (
      <div className={`py-8 overflow-hidden ${bgClasses[backgroundColor]}`}>
        {showTitle && title && (
          <h4 className={`text-xs lg:text-sm font-semibold ${textClasses[backgroundColor]} mb-6 tracking-wide text-center`}>
            {title}
          </h4>
        )}
        <div className="relative">
          <div className="flex animate-marquee whitespace-nowrap">
            {[...displayPartners, ...displayPartners].map((partner, idx) => (
              <div
                key={idx}
                className={`mx-4 lg:mx-8 ${heightClasses[logoHeight]} w-24 lg:w-32 flex-shrink-0 flex items-center justify-center`}
              >
                <img
                  src={partner.logo}
                  alt={partner.name}
                  className="max-w-full max-h-full object-contain grayscale hover:grayscale-0 transition-all"
                />
              </div>
            ))}
          </div>
        </div>
        {subtitle && (
          <p className={`text-xs ${textClasses[backgroundColor]} mt-4 text-center opacity-70`}>
            {subtitle}
          </p>
        )}
      </div>
    );
  }

  // Compact variant - minimal styling
  if (variant === 'compact') {
    return (
      <div className={`py-6 px-4 ${bgClasses[backgroundColor]}`}>
        {showTitle && title && (
          <p className={`text-[10px] lg:text-xs font-semibold ${textClasses[backgroundColor]} mb-4 tracking-wide`}>
            {title}
          </p>
        )}
        <div className={`flex flex-wrap ${gapClasses[gap]} items-center`}>
          {displayPartners.map((partner, idx) => (
            <div
              key={idx}
              className={`${heightClasses[logoHeight]} px-2 flex items-center justify-center`}
            >
              <img
                src={partner.logo}
                alt={partner.name}
                className="max-h-full object-contain grayscale hover:grayscale-0 transition-all"
              />
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Default variant - grid with cards
  return (
    <div className={`py-8 px-4 ${bgClasses[backgroundColor]}`}>
      {showTitle && title && (
        <h4 className={`text-[10px] lg:text-xs font-semibold ${textClasses[backgroundColor]} mb-4 lg:mb-5 tracking-wide`}>
          {title}
        </h4>
      )}
      <div className={`grid ${colClasses[columns] || colClasses[3]} ${gapClasses[gap]} max-w-[600px]`}>
        {displayPartners.map((partner, idx) => (
          <div
            key={idx}
            className={`bg-white rounded-md p-2 lg:p-3 ${heightClasses[logoHeight]} flex items-center justify-center shadow-sm hover:shadow-md transition-shadow`}
          >
            <img
              src={partner.logo}
              alt={partner.name}
              className="max-w-full max-h-full object-contain"
            />
          </div>
        ))}
      </div>
      {subtitle && (
        <p className={`text-xs ${textClasses[backgroundColor]} mt-4 opacity-70`}>
          {subtitle}
        </p>
      )}
    </div>
  );
};

export default PartnersBlock;
