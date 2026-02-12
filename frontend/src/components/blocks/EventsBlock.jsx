import { useState, useEffect } from 'react';
import api from '../../services/api';

const EventsBlock = ({
  title = 'KEGIATAN SISWA DAN GURU',
  subtitle = 'AGENDA YANG AKAN HADIR, BAIK ACARA DI SEKOLAH ATAUPUN LUAR SEKOLAH',
  showFilters = true,
  filterOptions = ['Semua', 'Akademik', 'Non Akademik'],
  limit = 6,
  columns = 2,
  variant = 'default', // default, compact, list
  backgroundColor = 'gradient', // gradient, white, light, dark
  showViewAllButton = true,
  viewAllText = 'LIHAT SEMUA AGENDA',
  viewAllUrl = '/agenda',
  fetchFromAPI = true,
  customEvents = [],
}) => {
  const [events, setEvents] = useState(customEvents);
  const [loading, setLoading] = useState(fetchFromAPI);
  const [activeFilter, setActiveFilter] = useState('semua');

  useEffect(() => {
    if (fetchFromAPI) {
      const fetchEvents = async () => {
        try {
          const res = await api.get('/api/events/upcoming');
          setEvents(res.data.data?.events || []);
        } catch (error) {
          console.error('Error fetching events:', error);
        } finally {
          setLoading(false);
        }
      };
      fetchEvents();
    }
  }, [fetchFromAPI]);

  const bgStyles = {
    gradient: { background: 'linear-gradient(to bottom, transparent 50px, rgba(13,118,190,0.15) 50%, rgba(13,118,190,0.31) 100%)' },
    white: {},
    light: {},
    dark: {},
  };

  const bgClasses = {
    gradient: '',
    white: 'bg-white',
    light: 'bg-gray-50',
    dark: 'bg-gray-900',
  };

  const textClasses = {
    gradient: 'text-black',
    white: 'text-gray-900',
    light: 'text-gray-900',
    dark: 'text-white',
  };

  const subtitleClasses = {
    gradient: 'text-gray-600',
    white: 'text-gray-600',
    light: 'text-gray-600',
    dark: 'text-gray-300',
  };

  const formatEventDate = (dateString) => {
    const date = new Date(dateString);
    const days = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
    return {
      day: String(date.getDate()).padStart(2, '0'),
      month: months[date.getMonth()],
      fullDate: `${days[date.getDay()]}, ${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear()}`
    };
  };

  const filteredEvents = events.filter(event => {
    if (activeFilter === 'semua') return true;
    if (activeFilter === 'akademik') return event.category === 'akademik';
    if (activeFilter === 'non akademik') return event.category === 'non-akademik';
    return true;
  });

  const colClasses = {
    1: 'grid-cols-1',
    2: 'grid-cols-1 lg:grid-cols-2',
    3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
  };

  if (loading) {
    return (
      <div className={`py-12 px-4 ${bgClasses[backgroundColor]}`} style={bgStyles[backgroundColor]}>
        <div className="flex justify-center">
          <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
      </div>
    );
  }

  // List variant - simple vertical list
  if (variant === 'list') {
    return (
      <div className={`py-10 lg:py-16 px-4 lg:px-10 ${bgClasses[backgroundColor]}`} style={bgStyles[backgroundColor]}>
        {(title || subtitle) && (
          <div className="text-center mb-6 lg:mb-8">
            {title && <h2 className={`text-base lg:text-lg font-bold ${textClasses[backgroundColor]}`}>{title}</h2>}
            {subtitle && (
              <p className={`text-sm lg:text-base leading-relaxed ${subtitleClasses[backgroundColor]} font-medium max-w-3xl mx-auto mt-2`}>
                {subtitle}
              </p>
            )}
          </div>
        )}

        <div className="max-w-2xl mx-auto space-y-3">
          {filteredEvents.slice(0, limit).map((event, idx) => {
            const dateInfo = formatEventDate(event.eventDate);
            return (
              <div
                key={event._id || idx}
                className="flex items-center gap-4 p-4 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="bg-primary-100 px-4 py-2 rounded text-center flex-shrink-0">
                  <div className="text-xl font-bold text-primary-700">{dateInfo.day}</div>
                  <div className="text-xs text-primary-600">{dateInfo.month}</div>
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-semibold text-gray-900 truncate">{event.title}</h4>
                  <p className="text-sm text-gray-500">{event.startTime} - {event.endTime}</p>
                </div>
                <span className={`text-xs px-2 py-1 rounded ${
                  event.category === 'akademik' ? 'bg-blue-100 text-blue-700' : 'bg-purple-100 text-purple-700'
                }`}>
                  {event.category === 'akademik' ? 'Akademik' : 'Non-Akademik'}
                </span>
              </div>
            );
          })}
        </div>

        {showViewAllButton && (
          <div className="text-center mt-6">
            <a href={viewAllUrl} className="text-primary-600 hover:text-primary-700 font-medium text-sm">
              {viewAllText} &rarr;
            </a>
          </div>
        )}
      </div>
    );
  }

  // Compact variant - smaller cards
  if (variant === 'compact') {
    return (
      <div className={`py-8 px-4 ${bgClasses[backgroundColor]}`} style={bgStyles[backgroundColor]}>
        {(title || subtitle) && (
          <div className="mb-6">
            {title && <h3 className={`text-sm font-bold ${textClasses[backgroundColor]}`}>{title}</h3>}
            {subtitle && (
              <p className={`text-xs ${subtitleClasses[backgroundColor]} mt-1`}>{subtitle}</p>
            )}
          </div>
        )}

        <div className="space-y-2">
          {filteredEvents.slice(0, limit).map((event, idx) => {
            const dateInfo = formatEventDate(event.eventDate);
            return (
              <div
                key={event._id || idx}
                className="flex items-center gap-3 p-3 bg-white/80 backdrop-blur rounded-lg"
              >
                <div className="bg-[#f6efe4] px-3 py-2 rounded text-center flex-shrink-0">
                  <div className="text-lg font-bold text-gray-800">{dateInfo.day}</div>
                  <div className="text-[10px] text-gray-600">{dateInfo.month}</div>
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-semibold text-gray-900 truncate">{event.title}</h4>
                  <p className="text-xs text-gray-500">{dateInfo.fullDate}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  // Default variant - full featured with filters
  return (
    <div className={`py-12 lg:py-20 px-4 lg:px-10 relative ${bgClasses[backgroundColor]}`} style={bgStyles[backgroundColor]}>
      {(title || subtitle) && (
        <div className="text-center mb-6 lg:mb-8">
          {title && <h2 className={`text-base lg:text-lg font-bold ${textClasses[backgroundColor]}`}>{title}</h2>}
          {subtitle && (
            <p className={`text-sm lg:text-base leading-relaxed ${subtitleClasses[backgroundColor]} font-medium max-w-3xl mx-auto mt-2 px-2`}>
              {subtitle}
            </p>
          )}
        </div>
      )}

      {/* Filters */}
      {showFilters && (
        <div className="flex justify-center gap-1 lg:gap-2 mb-8 lg:mb-10 border border-[#62B4DD] rounded-full p-1 lg:p-1.5 w-fit mx-auto">
          {filterOptions.map((tab, idx) => (
            <button
              key={idx}
              onClick={() => setActiveFilter(tab.toLowerCase())}
              className={`px-3 sm:px-5 lg:px-8 py-2 lg:py-2.5 rounded-full text-[10px] sm:text-xs font-medium cursor-pointer transition-all whitespace-nowrap ${
                activeFilter === tab.toLowerCase()
                  ? 'bg-[rgba(207,233,246,0.5)] text-gray-700'
                  : 'text-[#0d76be]'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      )}

      {/* Events Grid */}
      <div className={`grid ${colClasses[columns]} gap-3 lg:gap-5 max-w-[1100px] mx-auto mb-8 lg:mb-10`}>
        {filteredEvents.length > 0 ? (
          filteredEvents.slice(0, limit).map((event, idx) => {
            const dateInfo = formatEventDate(event.eventDate);
            return (
              <div
                key={event._id || idx}
                className="flex gap-3 lg:gap-4 items-start p-3 lg:p-5 bg-white/40 backdrop-blur-xl border border-white/80 rounded-xl shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all"
              >
                <div className="bg-[#f6efe4] px-3 sm:px-5 lg:px-6 py-3 sm:py-4 lg:py-5 rounded-lg text-center flex-shrink-0">
                  <div className="font-bold text-xl sm:text-2xl lg:text-[26px] leading-none text-black">
                    {dateInfo.day}
                  </div>
                  <div className="text-[10px] lg:text-xs text-gray-700 mt-1 font-medium">{dateInfo.month.toUpperCase()}</div>
                </div>
                <div className="flex-1 min-w-0">
                  <span className={`text-[10px] lg:text-[11px] font-semibold uppercase tracking-wide ${
                    event.category === 'akademik' ? 'text-[#008fd7]' : 'text-purple-600'
                  }`}>
                    {event.category === 'akademik' ? 'AKADEMIK' : 'NON AKADEMIK'}
                  </span>
                  <h4 className="text-sm lg:text-base font-semibold text-black mt-0.5 line-clamp-1">{event.title}</h4>
                  <div className="flex flex-row flex-wrap gap-3 lg:gap-5 mt-2 lg:mt-3 text-[11px] lg:text-xs text-gray-700">
                    <div className="flex items-center gap-1.5">
                      <span>📅</span>
                      <span>{dateInfo.fullDate}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span>🕐</span>
                      <span>{event.startTime} - {event.endTime}</span>
                    </div>
                    {event.location && (
                      <div className="flex items-center gap-1.5">
                        <span>📍</span>
                        <span>{event.location}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <div className={`${columns === 2 ? 'col-span-2' : columns === 3 ? 'col-span-3' : ''} text-center py-8`}>
            <p className="text-gray-600">Belum ada agenda yang tersedia.</p>
          </div>
        )}
      </div>

      {/* View All Button */}
      {showViewAllButton && (
        <a
          href={viewAllUrl}
          className="flex items-center justify-center px-6 lg:px-10 py-3 lg:py-3.5 bg-[#f6efe4] text-gray-700 text-[11px] lg:text-xs font-semibold rounded-lg mx-auto hover:bg-[#f0e5d4] hover:-translate-y-0.5 shadow-md hover:shadow-lg transition-all w-fit"
        >
          {viewAllText}
        </a>
      )}
    </div>
  );
};

export default EventsBlock;
