import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { useSchoolProfile } from '../../contexts/SchoolProfileContext';

const SearchPage = () => {
  const navigate = useNavigate();
  const { contact: contactData } = useSchoolProfile();
  const [searchQuery, setSearchQuery] = useState('');
  const [results, setResults] = useState({
    articles: [],
    jurusans: [],
    ekskuls: [],
    fasilitas: [],
    prestasi: [],
    alumni: [],
    events: [],
    contact: null,
  });
  const [loading, setLoading] = useState(false);
  const inputRef = useRef(null);

  // Focus input on mount
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  // Search function with debounce
  useEffect(() => {
    if (!searchQuery.trim()) {
      setResults({
        articles: [],
        jurusans: [],
        ekskuls: [],
        fasilitas: [],
        prestasi: [],
        alumni: [],
        events: [],
        contact: null,
      });
      return;
    }

    const debounceTimer = setTimeout(async () => {
      setLoading(true);
      try {
        const [
          articlesRes,
          jurusansRes,
          ekskulRes,
          fasilitasRes,
          prestasiRes,
          alumniRes,
          eventsRes,
        ] = await Promise.all([
          api.get(`/api/articles/public?search=${encodeURIComponent(searchQuery)}&limit=5`).catch(() => ({ data: { data: { articles: [] } } })),
          api.get('/api/jurusan').catch(() => ({ data: { data: { jurusans: [] } } })),
          api.get('/api/ekskul').catch(() => ({ data: { data: { ekskuls: [] } } })),
          api.get('/api/fasilitas').catch(() => ({ data: { data: { fasilitas: [] } } })),
          api.get('/api/prestasi').catch(() => ({ data: { data: { prestasis: [] } } })),
          api.get('/api/alumni').catch(() => ({ data: { data: { alumni: [] } } })),
          api.get('/api/events').catch(() => ({ data: { data: { events: [] } } })),
        ]);

        const articles = articlesRes.data.data?.articles || [];
        const allJurusans = jurusansRes.data.data?.jurusans || [];
        const allEkskuls = ekskulRes.data.data?.ekskuls || [];
        const allFasilitas = fasilitasRes.data.data?.fasilitas || [];
        const allPrestasi = prestasiRes.data.data?.prestasis || [];
        const allAlumni = alumniRes.data.data?.alumni || [];
        const allEvents = eventsRes.data.data?.events || [];
        const contact = contactData;

        const query = searchQuery.toLowerCase();

        // Filter jurusans
        const filteredJurusans = allJurusans.filter(j =>
          j.name?.toLowerCase().includes(query) ||
          j.code?.toLowerCase().includes(query) ||
          j.description?.toLowerCase().includes(query) ||
          j.shortDescription?.toLowerCase().includes(query)
        );

        // Filter ekskuls
        const filteredEkskuls = allEkskuls.filter(e =>
          e.name?.toLowerCase().includes(query) ||
          e.description?.toLowerCase().includes(query) ||
          e.category?.toLowerCase().includes(query)
        );

        // Filter fasilitas
        const filteredFasilitas = allFasilitas.filter(f =>
          f.name?.toLowerCase().includes(query) ||
          f.description?.toLowerCase().includes(query)
        );

        // Filter prestasi
        const filteredPrestasi = allPrestasi.filter(p =>
          p.title?.toLowerCase().includes(query) ||
          p.description?.toLowerCase().includes(query) ||
          p.event?.toLowerCase().includes(query) ||
          p.level?.toLowerCase().includes(query)
        );

        // Filter alumni
        const filteredAlumni = allAlumni.filter(a =>
          a.name?.toLowerCase().includes(query) ||
          a.company?.toLowerCase().includes(query) ||
          a.currentOccupation?.toLowerCase().includes(query) ||
          a.testimonial?.toLowerCase().includes(query)
        );

        // Filter events
        const filteredEvents = allEvents.filter(e =>
          e.title?.toLowerCase().includes(query) ||
          e.description?.toLowerCase().includes(query) ||
          e.location?.toLowerCase().includes(query) ||
          e.category?.toLowerCase().includes(query)
        );

        // Check if contact info matches search
        const contactMatches = contact && (
          query.includes('kontak') ||
          query.includes('alamat') ||
          query.includes('telepon') ||
          query.includes('telpon') ||
          query.includes('telp') ||
          query.includes('email') ||
          query.includes('lokasi') ||
          query.includes('hubungi') ||
          query.includes('whatsapp') ||
          query.includes('wa') ||
          contact.phone?.toLowerCase().includes(query) ||
          contact.email?.toLowerCase().includes(query) ||
          contact.address?.toLowerCase().includes(query)
        );

        setResults({
          articles,
          jurusans: filteredJurusans.slice(0, 3),
          ekskuls: filteredEkskuls.slice(0, 3),
          fasilitas: filteredFasilitas.slice(0, 3),
          prestasi: filteredPrestasi.slice(0, 3),
          alumni: filteredAlumni.slice(0, 3),
          events: filteredEvents.slice(0, 3),
          contact: contactMatches ? contact : null,
        });
      } catch (error) {
        console.error('Search error:', error);
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => clearTimeout(debounceTimer);
  }, [searchQuery]);

  const handleClose = () => {
    navigate(-1);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Escape') {
      handleClose();
    }
  };

  const hasResults = () => {
    return (
      results.articles.length > 0 ||
      results.jurusans.length > 0 ||
      results.ekskuls.length > 0 ||
      results.fasilitas.length > 0 ||
      results.prestasi.length > 0 ||
      results.alumni.length > 0 ||
      results.events.length > 0 ||
      results.contact
    );
  };

  return (
    <div
      className="fixed inset-0 z-[9999] flex flex-col overflow-hidden"
      onKeyDown={handleKeyDown}
    >
      {/* Transparent overlay background */}
      <div
        className="absolute inset-0 bg-[rgba(30,30,30,0.85)] backdrop-blur-md"
        onClick={handleClose}
      ></div>

      {/* Search Content */}
      <div className="relative z-10 w-full max-w-3xl mx-auto pt-16 sm:pt-24 px-4 sm:px-6 flex flex-col h-full">
        {/* Close button */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 sm:top-8 sm:right-0 text-white/80 hover:text-white transition-colors"
        >
          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Search Input */}
        <div className="relative flex-shrink-0">
          <div className="flex items-center gap-4 bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl px-6 py-4">
            <svg className="w-6 h-6 text-white/70 flex-shrink-0" viewBox="0 0 25 25" fill="currentColor">
              <path d="M24.6582 21.6162L19.79 16.748C19.5703 16.5283 19.2725 16.4062 18.96 16.4062H18.1641C19.5117 14.6826 20.3125 12.5146 20.3125 10.1562C20.3125 4.5459 15.7666 0 10.1562 0C4.5459 0 0 4.5459 0 10.1562C0 15.7666 4.5459 20.3125 10.1562 20.3125C12.5146 20.3125 14.6826 19.5117 16.4062 18.1641V18.96C16.4062 19.2725 16.5283 19.5703 16.748 19.79L21.6162 24.6582C22.0752 25.1172 22.8174 25.1172 23.2715 24.6582L24.6533 23.2764C25.1123 22.8174 25.1123 22.0752 24.6582 21.6162ZM10.1562 16.4062C6.7041 16.4062 3.90625 13.6133 3.90625 10.1562C3.90625 6.7041 6.69922 3.90625 10.1562 3.90625C13.6084 3.90625 16.4062 6.69922 16.4062 10.1562C16.4062 13.6084 13.6133 16.4062 10.1562 16.4062Z"/>
            </svg>
            <input
              ref={inputRef}
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari artikel, jurusan, ekskul, kontak..."
              className="flex-1 bg-transparent text-white text-lg sm:text-xl placeholder-white/50 outline-none"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="text-white/50 hover:text-white transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
        </div>

        {/* Search Results - Scrollable */}
        <div className="mt-6 sm:mt-8 flex-1 overflow-y-auto pb-8 custom-scrollbar">
          <style>{`
            .custom-scrollbar::-webkit-scrollbar {
              width: 6px;
            }
            .custom-scrollbar::-webkit-scrollbar-track {
              background: rgba(255,255,255,0.1);
              border-radius: 3px;
            }
            .custom-scrollbar::-webkit-scrollbar-thumb {
              background: rgba(255,255,255,0.3);
              border-radius: 3px;
            }
            .custom-scrollbar::-webkit-scrollbar-thumb:hover {
              background: rgba(255,255,255,0.5);
            }
          `}</style>

          {loading && (
            <div className="flex items-center justify-center py-8">
              <div className="w-8 h-8 border-3 border-white/30 border-t-white rounded-full animate-spin"></div>
            </div>
          )}

          {!loading && searchQuery && hasResults() && (
            <div className="space-y-6">
              {/* Contact Info */}
              {results.contact && (
                <div>
                  <h3 className="text-white/60 text-xs font-semibold uppercase tracking-wider mb-3 flex items-center gap-2">
                    <span>📞</span> Informasi Kontak
                  </h3>
                  <Link
                    to="/kontak"
                    className="block bg-gradient-to-r from-blue-500/20 to-purple-500/20 hover:from-blue-500/30 hover:to-purple-500/30 backdrop-blur-sm border border-white/20 rounded-xl p-4 transition-all"
                  >
                    <h4 className="text-white font-medium">Hubungi SMK Kristen 5 Klaten</h4>
                    <div className="mt-2 space-y-1 text-white/70 text-sm">
                      {results.contact.phone && (
                        <p className="flex items-center gap-2">
                          <span>📱</span> {results.contact.phone}
                        </p>
                      )}
                      {results.contact.email && (
                        <p className="flex items-center gap-2">
                          <span>✉️</span> {results.contact.email}
                        </p>
                      )}
                      {results.contact.address && (
                        <p className="flex items-center gap-2">
                          <span>📍</span> {results.contact.address}
                        </p>
                      )}
                    </div>
                  </Link>
                </div>
              )}

              {/* Jurusan Results */}
              {results.jurusans.length > 0 && (
                <div>
                  <h3 className="text-white/60 text-xs font-semibold uppercase tracking-wider mb-3 flex items-center gap-2">
                    <span>🎓</span> Jurusan
                  </h3>
                  <div className="space-y-2">
                    {results.jurusans.map((jurusan, idx) => (
                      <Link
                        key={idx}
                        to={`/jurusan/${jurusan.slug}`}
                        className="block bg-white/5 hover:bg-white/10 backdrop-blur-sm border border-white/10 rounded-xl p-4 transition-all"
                      >
                        <div className="flex items-center gap-2">
                          <span className="text-yellow-400 font-bold">{jurusan.code || jurusan.name?.slice(0, 4).toUpperCase()}</span>
                          <h4 className="text-white font-medium">{jurusan.name}</h4>
                        </div>
                        <p className="text-white/60 text-sm mt-1 line-clamp-2">{jurusan.shortDescription || jurusan.description}</p>
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {/* Ekskul Results */}
              {results.ekskuls.length > 0 && (
                <div>
                  <h3 className="text-white/60 text-xs font-semibold uppercase tracking-wider mb-3 flex items-center gap-2">
                    <span>⚽</span> Ekstrakurikuler
                  </h3>
                  <div className="space-y-2">
                    {results.ekskuls.map((ekskul, idx) => (
                      <div
                        key={idx}
                        className="block bg-white/5 hover:bg-white/10 backdrop-blur-sm border border-white/10 rounded-xl p-4 transition-all"
                      >
                        <div className="flex items-center gap-3">
                          {ekskul.image && (
                            <img src={ekskul.image} alt={ekskul.name} className="w-12 h-12 rounded-lg object-cover" />
                          )}
                          <div>
                            <h4 className="text-white font-medium">{ekskul.name}</h4>
                            {ekskul.category && (
                              <span className="text-blue-400 text-xs">{ekskul.category}</span>
                            )}
                          </div>
                        </div>
                        {ekskul.description && (
                          <p className="text-white/60 text-sm mt-2 line-clamp-2">{ekskul.description}</p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Fasilitas Results */}
              {results.fasilitas.length > 0 && (
                <div>
                  <h3 className="text-white/60 text-xs font-semibold uppercase tracking-wider mb-3 flex items-center gap-2">
                    <span>🏢</span> Fasilitas
                  </h3>
                  <div className="space-y-2">
                    {results.fasilitas.map((fas, idx) => (
                      <div
                        key={idx}
                        className="block bg-white/5 hover:bg-white/10 backdrop-blur-sm border border-white/10 rounded-xl p-4 transition-all"
                      >
                        <div className="flex items-center gap-3">
                          {fas.image && (
                            <img src={fas.image} alt={fas.name} className="w-12 h-12 rounded-lg object-cover" />
                          )}
                          <div>
                            <h4 className="text-white font-medium">{fas.name}</h4>
                            {fas.description && (
                              <p className="text-white/60 text-sm line-clamp-1">{fas.description}</p>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Prestasi Results */}
              {results.prestasi.length > 0 && (
                <div>
                  <h3 className="text-white/60 text-xs font-semibold uppercase tracking-wider mb-3 flex items-center gap-2">
                    <span>🏆</span> Prestasi
                  </h3>
                  <div className="space-y-2">
                    {results.prestasi.map((p, idx) => (
                      <div
                        key={idx}
                        className="block bg-white/5 hover:bg-white/10 backdrop-blur-sm border border-white/10 rounded-xl p-4 transition-all"
                      >
                        <div className="flex items-center gap-3">
                          {p.image && (
                            <img src={p.image} alt={p.title} className="w-12 h-12 rounded-lg object-cover" />
                          )}
                          <div>
                            <h4 className="text-white font-medium">{p.title}</h4>
                            <div className="flex items-center gap-2 mt-1">
                              {p.level && (
                                <span className="text-yellow-400 text-xs bg-yellow-400/10 px-2 py-0.5 rounded">{p.level}</span>
                              )}
                              {p.event && (
                                <span className="text-white/60 text-xs">{p.event}</span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Events/Agenda Results */}
              {results.events.length > 0 && (
                <div>
                  <h3 className="text-white/60 text-xs font-semibold uppercase tracking-wider mb-3 flex items-center gap-2">
                    <span>📅</span> Agenda & Kegiatan
                  </h3>
                  <div className="space-y-2">
                    {results.events.map((event, idx) => (
                      <div
                        key={idx}
                        className="block bg-white/5 hover:bg-white/10 backdrop-blur-sm border border-white/10 rounded-xl p-4 transition-all"
                      >
                        <div className="flex items-start gap-3">
                          <div className="bg-blue-500/20 px-3 py-2 rounded-lg text-center flex-shrink-0">
                            <div className="text-white font-bold">
                              {new Date(event.eventDate).getDate()}
                            </div>
                            <div className="text-white/60 text-xs">
                              {['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'][new Date(event.eventDate).getMonth()]}
                            </div>
                          </div>
                          <div>
                            <span className={`text-xs font-medium ${event.category === 'akademik' ? 'text-blue-400' : 'text-purple-400'}`}>
                              {event.category === 'akademik' ? 'AKADEMIK' : 'NON AKADEMIK'}
                            </span>
                            <h4 className="text-white font-medium">{event.title}</h4>
                            <p className="text-white/60 text-xs mt-1">
                              {event.startTime} - {event.endTime} {event.location && `• ${event.location}`}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Alumni Results */}
              {results.alumni.length > 0 && (
                <div>
                  <h3 className="text-white/60 text-xs font-semibold uppercase tracking-wider mb-3 flex items-center gap-2">
                    <span>👥</span> Alumni
                  </h3>
                  <div className="space-y-2">
                    {results.alumni.map((alumni, idx) => (
                      <div
                        key={idx}
                        className="block bg-white/5 hover:bg-white/10 backdrop-blur-sm border border-white/10 rounded-xl p-4 transition-all"
                      >
                        <div className="flex items-center gap-3">
                          {alumni.photo && (
                            <img src={alumni.photo} alt={alumni.name} className="w-12 h-12 rounded-full object-cover" />
                          )}
                          <div>
                            <h4 className="text-white font-medium">{alumni.name}</h4>
                            <p className="text-white/60 text-sm">
                              {alumni.currentOccupation} {alumni.company && `di ${alumni.company}`}
                            </p>
                            {alumni.graduationYear && (
                              <span className="text-yellow-400 text-xs">Alumni {alumni.graduationYear}</span>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Article Results */}
              {results.articles.length > 0 && (
                <div>
                  <h3 className="text-white/60 text-xs font-semibold uppercase tracking-wider mb-3 flex items-center gap-2">
                    <span>📝</span> Artikel
                  </h3>
                  <div className="space-y-2">
                    {results.articles.map((article, idx) => (
                      <Link
                        key={idx}
                        to={`/artikel/${article.slug}`}
                        className="flex gap-4 bg-white/5 hover:bg-white/10 backdrop-blur-sm border border-white/10 rounded-xl p-4 transition-all"
                      >
                        {article.featuredImage && (
                          <img
                            src={article.featuredImage}
                            alt={article.title}
                            className="w-16 h-16 sm:w-20 sm:h-20 object-cover rounded-lg flex-shrink-0"
                          />
                        )}
                        <div className="flex-1 min-w-0">
                          <h4 className="text-white font-medium line-clamp-2">{article.title}</h4>
                          <p className="text-white/60 text-sm mt-1 line-clamp-2 hidden sm:block">{article.excerpt}</p>
                          <span className="text-yellow-400 text-xs mt-2 block">
                            {article.categoryJurusan?.name || article.categoryTopik?.name || 'Berita'}
                          </span>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {!loading && searchQuery && !hasResults() && (
            <div className="text-center py-12">
              <p className="text-white/60 text-lg">Tidak ada hasil untuk "{searchQuery}"</p>
              <p className="text-white/40 text-sm mt-2">Coba kata kunci lain</p>
            </div>
          )}

          {!searchQuery && (
            <div className="text-center py-12">
              <p className="text-white/40 text-sm">Ketik untuk mulai mencari...</p>
              <div className="flex flex-wrap justify-center gap-2 mt-6">
                {['TKJ', 'TKRO', 'Ekskul', 'Fasilitas', 'Kontak', 'Prestasi', 'Pendaftaran'].map((keyword) => (
                  <button
                    key={keyword}
                    onClick={() => setSearchQuery(keyword)}
                    className="px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-full text-white/70 text-sm transition-colors"
                  >
                    {keyword}
                  </button>
                ))}
              </div>
              <div className="mt-8 grid grid-cols-2 sm:grid-cols-4 gap-3 text-left max-w-xl mx-auto">
                <div className="bg-white/5 rounded-lg p-3">
                  <span className="text-lg">🎓</span>
                  <p className="text-white/60 text-xs mt-1">Jurusan</p>
                </div>
                <div className="bg-white/5 rounded-lg p-3">
                  <span className="text-lg">⚽</span>
                  <p className="text-white/60 text-xs mt-1">Ekskul</p>
                </div>
                <div className="bg-white/5 rounded-lg p-3">
                  <span className="text-lg">🏢</span>
                  <p className="text-white/60 text-xs mt-1">Fasilitas</p>
                </div>
                <div className="bg-white/5 rounded-lg p-3">
                  <span className="text-lg">📞</span>
                  <p className="text-white/60 text-xs mt-1">Kontak</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SearchPage;