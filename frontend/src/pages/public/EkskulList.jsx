import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';

const categoryConfig = {
  olahraga:  { label: 'Olahraga',  badge: 'bg-green-600',  glass: 'bg-green-500/20 border-green-400/30 text-green-200' },
  seni:      { label: 'Seni',      badge: 'bg-purple-600', glass: 'bg-purple-500/20 border-purple-400/30 text-purple-200' },
  akademik:  { label: 'Akademik',  badge: 'bg-blue-600',   glass: 'bg-blue-500/20 border-blue-400/30 text-blue-200' },
  keagamaan: { label: 'Keagamaan', badge: 'bg-yellow-500', glass: 'bg-yellow-500/20 border-yellow-400/30 text-yellow-200' },
  teknologi: { label: 'Teknologi', badge: 'bg-orange-500', glass: 'bg-orange-500/20 border-orange-400/30 text-orange-200' },
  lainnya:   { label: 'Lainnya',   badge: 'bg-gray-500',   glass: 'bg-gray-500/20 border-gray-400/30 text-gray-200' },
};

const getCategoryLabel = (cat) => categoryConfig[cat]?.label || cat;
const getCategoryBadge = (cat) => categoryConfig[cat]?.badge || 'bg-gray-500';
const getCategoryGlass = (cat) => categoryConfig[cat]?.glass || 'bg-white/10 border-white/20 text-white/80';

/* ─── Apple Glass Modal ───────────────────────────────────────────── */
const EkskulModal = ({ ekskul, onClose }) => {
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    const onKey = (e) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => { document.body.style.overflow = ''; window.removeEventListener('keydown', onKey); };
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-[70] flex items-end sm:items-center justify-center p-0 sm:p-4"
      onClick={onClose}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />

      {/* Modal */}
      <div
        className="modal-glass-enter relative w-full sm:max-w-[440px] max-h-[92vh] sm:max-h-[88vh] overflow-hidden rounded-t-3xl sm:rounded-3xl flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Blurred background layer */}
        {ekskul.image && (
          <div
            className="absolute inset-0 bg-cover bg-center scale-110 transition-none"
            style={{ backgroundImage: `url(${ekskul.image})` }}
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/65 to-black/80 backdrop-blur-[28px]" />

        {/* Scrollable content */}
        <div className="relative z-10 overflow-y-auto flex-1 overscroll-contain">
          <div className="p-5 sm:p-6 pb-7">

            {/* Close button */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 w-8 h-8 bg-white/[0.12] border border-white/[0.18] backdrop-blur-sm rounded-full flex items-center justify-center text-white/70 hover:bg-white/20 hover:text-white transition-all z-10"
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
                <path d="M18 6L6 18M6 6l12 12" />
              </svg>
            </button>

            {/* Header — image thumb + title */}
            <div className="flex gap-4 mb-5 pr-10">
              {ekskul.image && (
                <div className="w-[88px] h-[88px] sm:w-24 sm:h-24 rounded-2xl overflow-hidden flex-shrink-0 shadow-[0_8px_24px_rgba(0,0,0,0.5)] border border-white/[0.18]">
                  <img src={ekskul.image} alt={ekskul.name} className="w-full h-full object-cover" />
                </div>
              )}
              <div className="flex flex-col justify-end gap-1.5">
                {ekskul.category && (
                  <span className={`inline-flex w-fit px-2.5 py-0.5 rounded-full text-[10px] font-semibold border backdrop-blur-sm ${getCategoryGlass(ekskul.category)}`}>
                    {getCategoryLabel(ekskul.category)}
                  </span>
                )}
                <h2 className="text-xl sm:text-2xl font-bold text-white leading-tight">{ekskul.name}</h2>
              </div>
            </div>

            {/* Stats chips */}
            {(ekskul.coach || ekskul.schedule || ekskul.location) && (
              <div className="flex flex-wrap gap-2 mb-4">
                {ekskul.coach && (
                  <div className="flex items-center gap-1.5 bg-white/[0.1] border border-white/[0.15] backdrop-blur-sm rounded-full px-3 py-1.5">
                    <svg className="w-3 h-3 text-white/50 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    <span className="text-[11px] text-white/75">{ekskul.coach}</span>
                  </div>
                )}
                {ekskul.schedule && (
                  <div className="flex items-center gap-1.5 bg-white/[0.1] border border-white/[0.15] backdrop-blur-sm rounded-full px-3 py-1.5">
                    <svg className="w-3 h-3 text-white/50 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <span className="text-[11px] text-white/75">{ekskul.schedule}</span>
                  </div>
                )}
                {ekskul.location && (
                  <div className="flex items-center gap-1.5 bg-white/[0.1] border border-white/[0.15] backdrop-blur-sm rounded-full px-3 py-1.5">
                    <svg className="w-3 h-3 text-white/50 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <span className="text-[11px] text-white/75">{ekskul.location}</span>
                  </div>
                )}
              </div>
            )}

            {/* Divider */}
            <div className="h-px bg-white/[0.1] mb-4" />

            {/* Description */}
            {ekskul.description && (
              <div className="bg-white/[0.07] border border-white/[0.1] backdrop-blur-sm rounded-2xl p-4 mb-3">
                <p className="text-[10px] font-semibold text-white/35 uppercase tracking-widest mb-2">Tentang</p>
                <p className="text-sm text-white/80 leading-relaxed">{ekskul.description}</p>
              </div>
            )}

            {/* Achievements */}
            {ekskul.achievements && ekskul.achievements.length > 0 && (
              <div className="bg-white/[0.07] border border-white/[0.1] backdrop-blur-sm rounded-2xl p-4 mb-4">
                <p className="text-[10px] font-semibold text-white/35 uppercase tracking-widest mb-3">Prestasi</p>
                <div className="space-y-2">
                  {ekskul.achievements.map((a, i) => (
                    <div key={i} className="flex items-start gap-2.5 bg-white/[0.06] border border-white/[0.08] rounded-xl px-3 py-2.5">
                      <span className="text-sm flex-shrink-0 mt-0.5">🏆</span>
                      {a.link ? (
                        <a href={a.link} target="_blank" rel="noopener noreferrer" className="text-xs text-yellow-300/90 hover:text-yellow-200 transition-colors leading-snug">{a.nama}</a>
                      ) : (
                        <span className="text-xs text-white/70 leading-snug">{a.nama}</span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  );
};

/* ─── Main Page ───────────────────────────────────────────────────── */
const EkskulList = () => {
  const [ekskuls, setEkskuls] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('Semua');
  const [categories, setCategories] = useState([]);
  const [heroTitle, setHeroTitle] = useState('EKSTRAKULIKULER');
  const [heroSubtitle, setHeroSubtitle] = useState('Kembangkan potensi dan bakatmu bersama ekstrakulikuler pilihan di SMK Kristen 5 Klaten');
  const [heroBackground, setHeroBackground] = useState('');
  const [navbarVisible, setNavbarVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const scrollTimeout = useRef(null);

  // Modal
  const [selectedEkskul, setSelectedEkskul] = useState(null);

  // Floating panel
  const [showPanel, setShowPanel] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const panelRef = useRef(null);
  const searchInputRef = useRef(null);

  useEffect(() => {
    fetchEkskuls();
    api.get('/api/site-settings').then((res) => {
      const hp = res.data?.data?.settings?.homepageSections || {};
      if (hp.ekskulHeroTitle) setHeroTitle(hp.ekskulHeroTitle);
      if (hp.ekskulHeroSubtitle) setHeroSubtitle(hp.ekskulHeroSubtitle);
      if (hp.ekskulHeroBackground) setHeroBackground(hp.ekskulHeroBackground);
    }).catch(() => {});
  }, []);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (panelRef.current && !panelRef.current.contains(e.target)) setShowPanel(false);
    };
    if (showPanel) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showPanel]);

  useEffect(() => {
    if (showPanel && searchInputRef.current) searchInputRef.current.focus();
  }, [showPanel]);

  useEffect(() => {
    const handleScroll = () => {
      const cur = window.scrollY;
      if (cur < 100) { clearTimeout(scrollTimeout.current); setNavbarVisible(true); }
      else if (cur > lastScrollY && cur > 100) { clearTimeout(scrollTimeout.current); scrollTimeout.current = setTimeout(() => setNavbarVisible(false), 300); }
      else if (cur < lastScrollY) { clearTimeout(scrollTimeout.current); setNavbarVisible(true); }
      setLastScrollY(cur);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => { window.removeEventListener('scroll', handleScroll); clearTimeout(scrollTimeout.current); };
  }, [lastScrollY]);

  const fetchEkskuls = async () => {
    try {
      setLoading(true);
      const res = await api.get('/api/ekskul/active');
      const data = res.data?.data?.ekskuls || [];
      setEkskuls(data);
      setCategories([...new Set(data.map((i) => i.category).filter(Boolean))]);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const filteredEkskuls = ekskuls.filter((item) => {
    const matchCat = selectedCategory === 'Semua' || item.category === selectedCategory;
    const q = searchQuery.toLowerCase();
    const matchQ = !q || item.name?.toLowerCase().includes(q) || item.description?.toLowerCase().includes(q);
    return matchCat && matchQ;
  });

  const activeFilterCount = (selectedCategory !== 'Semua' ? 1 : 0) + (searchQuery ? 1 : 0);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-blue-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 font-poppins">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700;800&family=Russo+One&display=swap');
        .russo { font-family: 'Russo One', sans-serif; }

        @keyframes panelSlideIn {
          from { opacity: 0; transform: scale(0.92) translateY(8px); }
          to   { opacity: 1; transform: scale(1) translateY(0); }
        }
        @keyframes modalGlassIn {
          from { opacity: 0; transform: scale(0.94) translateY(12px); }
          to   { opacity: 1; transform: scale(1) translateY(0); }
        }
        @keyframes modalGlassInMobile {
          from { opacity: 0; transform: translateY(100%); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .panel-enter { animation: panelSlideIn 0.18s cubic-bezier(0.34,1.56,0.64,1) forwards; }
        .modal-glass-enter { animation: modalGlassIn 0.22s cubic-bezier(0.34,1.4,0.64,1) forwards; }
        @media (max-width: 639px) {
          .modal-glass-enter { animation: modalGlassInMobile 0.28s cubic-bezier(0.32,0.72,0,1) forwards; }
        }
      `}</style>

      <Navbar activePage="ekskul" visible={navbarVisible} />

      {/* Hero */}
      <section
        className="relative pt-16 overflow-hidden"
        style={heroBackground ? { backgroundImage: `url(${heroBackground})`, backgroundSize: 'cover', backgroundPosition: 'center' } : {}}
      >
        {/* Gradient fallback / overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#2e41e4]/80 to-[#0d76be]/70" />
        {!heroBackground && (
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute -top-24 -right-24 w-96 h-96 bg-white/5 rounded-full" />
            <div className="absolute -bottom-32 -left-32 w-[500px] h-[500px] bg-white/5 rounded-full" />
          </div>
        )}
        <div className="relative z-10 max-w-[1400px] mx-auto px-6 lg:px-16 py-20 md:py-28 text-center text-white">
          <h1 className="russo text-3xl md:text-5xl lg:text-6xl mb-4 drop-shadow-lg">{heroTitle}</h1>
          <p className="text-base md:text-lg lg:text-xl text-white/90 max-w-2xl mx-auto leading-relaxed">{heroSubtitle}</p>
        </div>
      </section>

      {/* Active filter chips */}
      {activeFilterCount > 0 && (
        <div className="bg-white border-b border-gray-100 shadow-sm">
          <div className="max-w-[1400px] mx-auto px-6 lg:px-16 py-3 flex flex-wrap items-center gap-2">
            <span className="text-xs text-gray-400 font-medium mr-1">Filter aktif:</span>
            {selectedCategory !== 'Semua' && (
              <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium text-white ${getCategoryBadge(selectedCategory)}`}>
                {getCategoryLabel(selectedCategory)}
                <button onClick={() => setSelectedCategory('Semua')} className="opacity-70 hover:opacity-100">×</button>
              </span>
            )}
            {searchQuery && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
                "{searchQuery}"
                <button onClick={() => setSearchQuery('')} className="opacity-70 hover:opacity-100">×</button>
              </span>
            )}
            <button onClick={() => { setSelectedCategory('Semua'); setSearchQuery(''); }} className="ml-auto text-xs text-gray-400 hover:text-gray-600 transition-colors">
              Reset semua
            </button>
          </div>
        </div>
      )}

      {/* Grid */}
      <section className="py-12">
        <div className="max-w-[1400px] mx-auto px-6 lg:px-16">
          {filteredEkskuls.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredEkskuls.map((item) => (
                <div
                  key={item._id}
                  onClick={() => setSelectedEkskul(item)}
                  className="bg-white rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden group flex flex-col cursor-pointer hover:-translate-y-0.5"
                >
                  <div className="relative h-52 overflow-hidden bg-gradient-to-br from-blue-50 to-indigo-100 flex-shrink-0">
                    {item.image ? (
                      <img src={item.image} alt={item.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center"><span className="text-7xl select-none">🎯</span></div>
                    )}
                    {item.category && (
                      <span className={`absolute top-3 left-3 text-white text-xs font-semibold px-3 py-1 rounded-full shadow-sm ${getCategoryBadge(item.category)}`}>
                        {getCategoryLabel(item.category)}
                      </span>
                    )}
                    {/* Tap hint */}
                    <div className="absolute bottom-3 right-3 bg-black/40 backdrop-blur-sm text-white text-[10px] px-2 py-0.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                      Lihat detail
                    </div>
                  </div>
                  <div className="p-5 flex flex-col flex-1">
                    <h3 className="text-lg font-bold text-gray-900 mb-2 leading-snug group-hover:text-[#0d76be] transition-colors">{item.name}</h3>
                    {item.description && (
                      <p className="text-gray-500 text-sm mb-4 leading-relaxed flex-1"
                        style={{ display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                        {item.description}
                      </p>
                    )}
                    <div className="space-y-2 mt-auto">
                      {item.coach && (
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <svg className="w-4 h-4 flex-shrink-0 text-[#0d76be]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                          </svg>
                          <span className="line-clamp-1">{item.coach}</span>
                        </div>
                      )}
                      {item.schedule && (
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <svg className="w-4 h-4 flex-shrink-0 text-[#0d76be]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          <span className="line-clamp-1">{item.schedule}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <div className="text-7xl mb-4">🎯</div>
              <p className="text-gray-600 text-lg">Tidak ada ekstrakulikuler yang ditemukan.</p>
              {(selectedCategory !== 'Semua' || searchQuery) && (
                <button onClick={() => { setSelectedCategory('Semua'); setSearchQuery(''); }}
                  className="mt-4 px-6 py-2 bg-[#0d76be] hover:bg-[#0a5a91] text-white rounded-full transition-colors text-sm font-medium">
                  Reset Filter
                </button>
              )}
            </div>
          )}
        </div>
      </section>

      <Footer />

      {/* Floating panel */}
      <div ref={panelRef} className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-2">
        {showPanel && (
          <div className="panel-enter bg-gradient-to-b from-white/70 to-white/50 backdrop-blur-2xl border border-white/80 shadow-[0_8px_32px_rgba(0,0,0,0.14),inset_0_1px_0_rgba(255,255,255,0.9)] rounded-2xl p-3 w-72">
            {/* Admin edit shortcut */}
            <Link
              to="/admin/pengaturan?tab=website"
              className="flex items-center gap-2 w-full px-2 py-1.5 rounded-xl text-xs text-gray-500 hover:bg-black/[0.06] hover:text-gray-700 transition-all"
            >
              <svg className="w-3.5 h-3.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              Edit Hero Section
            </Link>
            <div className="h-px bg-black/[0.07] my-2" />
            <div className="flex items-center gap-2 mb-3">
              <div className="relative flex-1">
                <svg className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400/70 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input
                  ref={searchInputRef}
                  type="text"
                  placeholder="cari ekstrakulikuler..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-7 pr-6 py-1.5 text-sm bg-black/[0.06] border border-black/10 rounded-xl focus:outline-none focus:border-blue-400/50 focus:bg-black/[0.04] placeholder-gray-400/60 text-gray-700"
                />
                {searchQuery && (
                  <button onClick={() => setSearchQuery('')} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-xs">×</button>
                )}
              </div>
            </div>
            <div className="h-px bg-black/[0.07] mb-3" />
            <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest mb-2 px-0.5">Kategori</p>
            <div className="flex flex-wrap gap-1.5">
              <button
                onClick={() => setSelectedCategory('Semua')}
                className={`px-3 py-1 text-xs font-medium rounded-full transition-all ${selectedCategory === 'Semua' ? 'bg-[#0d76be] text-white shadow-sm' : 'bg-black/[0.06] text-gray-600 hover:bg-black/[0.1]'}`}
              >Semua</button>
              {categories.map((cat) => (
                <button key={cat}
                  onClick={() => setSelectedCategory(cat === selectedCategory ? 'Semua' : cat)}
                  className={`px-3 py-1 text-xs font-medium rounded-full transition-all ${selectedCategory === cat ? `${getCategoryBadge(cat)} text-white shadow-sm` : 'bg-black/[0.06] text-gray-600 hover:bg-black/[0.1]'}`}
                >{getCategoryLabel(cat)}</button>
              ))}
            </div>
            {activeFilterCount > 0 && (
              <>
                <div className="h-px bg-black/[0.07] mt-3 mb-2" />
                <button onClick={() => { setSelectedCategory('Semua'); setSearchQuery(''); }} className="w-full text-xs text-red-500/80 hover:text-red-600 font-medium text-center py-0.5 transition-colors">
                  Reset semua filter
                </button>
              </>
            )}
          </div>
        )}
        <button
          onClick={() => setShowPanel((v) => !v)}
          className={`relative w-11 h-11 rounded-full flex items-center justify-center transition-all duration-200 shadow-[0_4px_16px_rgba(0,0,0,0.15)] ${showPanel || activeFilterCount > 0 ? 'bg-[#0d76be] text-white shadow-[0_4px_20px_rgba(13,118,190,0.45)]' : 'bg-white/80 backdrop-blur-xl text-gray-600 hover:bg-white border border-black/10'}`}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
            <circle cx="12" cy="5" r="1.8" /><circle cx="12" cy="12" r="1.8" /><circle cx="12" cy="19" r="1.8" />
          </svg>
          {activeFilterCount > 0 && (
            <span className="absolute -top-1 -right-1 w-4 h-4 bg-orange-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center shadow-sm">
              {activeFilterCount}
            </span>
          )}
        </button>
      </div>

      {/* Apple Glass Modal */}
      {selectedEkskul && <EkskulModal ekskul={selectedEkskul} onClose={() => setSelectedEkskul(null)} />}
    </div>
  );
};

export default EkskulList;
