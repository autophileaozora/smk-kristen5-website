import { lazy, Suspense, useState, useRef, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { ChevronDown, Check, Plus, Search, X, MoreVertical, SlidersHorizontal, Pencil, ImagePlus, Loader2 } from 'lucide-react';
import api from '../../services/api';

const Ekskul = lazy(() => import('../Ekskul'));
const Alumni = lazy(() => import('../Alumni'));
const Fasilitas = lazy(() => import('../Fasilitas'));
const AlumniSubmissions = lazy(() => import('../AlumniSubmissions'));

const TabLoading = () => (
  <div className="flex items-center justify-center h-48">
    <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
  </div>
);

const KesiswaanPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get('tab') || 'ekskul';
  const [showTabDropdown, setShowTabDropdown] = useState(false);
  const [pendingCount, setPendingCount] = useState(0);

  // Floating pill
  const [pillExpanded, setPillExpanded] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const pillSearchRef = useRef(null);

  useEffect(() => {
    if (showSearch && pillSearchRef.current) pillSearchRef.current.focus();
  }, [showSearch]);

  // Trigger create modal in child component
  const [createTrigger, setCreateTrigger] = useState(0);

  // Alumni filter visibility
  const [showAlumniFilter, setShowAlumniFilter] = useState(true);

  // Hero edit panel
  const [showHeroEdit, setShowHeroEdit] = useState(false);
  const [heroForm, setHeroForm] = useState({ title: '', subtitle: '', background: '' });
  const [heroSaving, setHeroSaving] = useState(false);
  const [heroUploading, setHeroUploading] = useState(false);
  const heroFileRef = useRef(null);
  const heroEditRef = useRef(null);

  const heroKey = activeTab === 'ekskul' ? 'ekskul' : 'fasilitas';
  const hasHeroEdit = activeTab === 'ekskul' || activeTab === 'fasilitas';

  // Load hero settings when panel opens
  useEffect(() => {
    if (!showHeroEdit) return;
    api.get('/api/site-settings').then((res) => {
      const hp = res.data?.data?.settings?.homepageSections || {};
      setHeroForm({
        title: hp[`${heroKey}HeroTitle`] || '',
        subtitle: hp[`${heroKey}HeroSubtitle`] || '',
        background: hp[`${heroKey}HeroBackground`] || '',
      });
    }).catch(() => {});
  }, [showHeroEdit, heroKey]);

  // Close hero panel on outside click
  useEffect(() => {
    if (!showHeroEdit) return;
    const handler = (e) => {
      if (heroEditRef.current && !heroEditRef.current.contains(e.target)) setShowHeroEdit(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [showHeroEdit]);

  const handleHeroImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setHeroUploading(true);
    try {
      const fd = new FormData();
      fd.append('image', file);
      const res = await api.post('/api/upload/image?folder=hero', fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setHeroForm(f => ({ ...f, background: res.data.data?.url || res.data.url || '' }));
    } catch {
      alert('Upload gagal, coba lagi.');
    } finally {
      setHeroUploading(false);
    }
  };

  const handleHeroSave = async () => {
    setHeroSaving(true);
    try {
      const res = await api.get('/api/site-settings');
      const hp = res.data?.data?.settings?.homepageSections || {};
      await api.put('/api/site-settings', {
        homepageSections: {
          ...hp,
          [`${heroKey}HeroTitle`]: heroForm.title,
          [`${heroKey}HeroSubtitle`]: heroForm.subtitle,
          [`${heroKey}HeroBackground`]: heroForm.background,
        },
      });
      setShowHeroEdit(false);
    } catch {
      alert('Gagal menyimpan, coba lagi.');
    } finally {
      setHeroSaving(false);
    }
  };

  // Reset search when tab changes
  useEffect(() => {
    setSearchQuery('');
    setShowSearch(false);
  }, [activeTab]);

  useEffect(() => {
    api.get('/api/alumni-submissions/count')
      .then((r) => setPendingCount(r.data.pending || 0))
      .catch(() => {});
  }, []);

  const tabs = [
    { id: 'ekskul', label: 'Ekskul' },
    { id: 'alumni', label: 'Alumni' },
    { id: 'fasilitas', label: 'Fasilitas' },
    { id: 'review-alumni', label: 'Review Alumni', badge: pendingCount || undefined },
  ];

  const handleTabChange = (tabId) => {
    setSearchParams({ tab: tabId }, { replace: true });
  };

  const handleCreate = () => {
    setCreateTrigger(c => c + 1);
  };

  // Review Alumni tab has no create action
  const hasCreate = activeTab !== 'review-alumni';

  return (
    <div className="flex flex-col h-full">

      {/* ── Blue header ──────────────────────────────────────────────────────── */}
      <div className="bg-blue-600 text-white px-6 lg:px-8 py-4 flex items-center justify-between flex-shrink-0">
        <div>
          <h1 className="text-xl font-bold leading-tight">Kesiswaan</h1>
          <p className="text-sm text-blue-200 leading-tight mt-0.5">Kelola ekskul, prestasi, alumni, dan fasilitas</p>
        </div>

        {/* Tab select dropdown */}
        <div className="relative flex-shrink-0">
          <button
            onClick={() => setShowTabDropdown(v => !v)}
            className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/20 backdrop-blur-sm border border-white/40 text-white text-sm font-medium hover:bg-white/28 transition-all"
          >
            <span>{tabs.find(t => t.id === activeTab)?.label}</span>
            {pendingCount > 0 && activeTab === 'review-alumni' && (
              <span className="w-4 h-4 bg-red-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center">
                {pendingCount}
              </span>
            )}
            <ChevronDown size={14} className={`transition-transform duration-200 ${showTabDropdown ? 'rotate-180' : ''}`} />
          </button>

          {showTabDropdown && (
            <>
              <div className="fixed inset-0 z-20" onClick={() => setShowTabDropdown(false)} />
              <div className="absolute right-0 mt-2 bg-white/80 backdrop-blur-2xl border border-white/70 rounded-xl shadow-[0_8px_32px_rgba(0,0,0,0.12),inset_0_1px_0_rgba(255,255,255,0.9)] overflow-hidden py-1 min-w-[180px] z-30">
                {tabs.map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => { handleTabChange(tab.id); setShowTabDropdown(false); }}
                    className={`w-full px-4 py-2 text-left text-sm flex items-center gap-2.5 transition-colors ${
                      activeTab === tab.id ? 'text-blue-600 bg-blue-400/10' : 'text-gray-700 hover:bg-black/[0.05]'
                    }`}
                  >
                    {activeTab === tab.id
                      ? <Check size={13} className="text-blue-600 flex-shrink-0" />
                      : <span className="w-[13px] flex-shrink-0" />
                    }
                    <span className="flex-1">{tab.label}</span>
                    {tab.badge > 0 && (
                      <span className="w-4 h-4 bg-red-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center">
                        {tab.badge}
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {/* ── Content area ─────────────────────────────────────────────────────── */}
      <div className="flex-1 overflow-hidden bg-gradient-to-br from-slate-100 via-blue-50/40 to-slate-100 p-3 lg:p-4 relative">

        {/* Glass scrollable panel */}
        <div className="h-full bg-white/55 backdrop-blur-2xl rounded-2xl border border-white/75 shadow-[0_4px_32px_rgba(0,0,0,0.08),inset_0_1px_0_rgba(255,255,255,0.9),inset_0_-1px_0_rgba(0,0,0,0.03)] overflow-y-auto">

          <Suspense fallback={<TabLoading />}>
            {activeTab === 'ekskul' && (
              <Ekskul embedded createTrigger={createTrigger} externalSearch={searchQuery} />
            )}
            {activeTab === 'alumni' && (
              <Alumni embedded createTrigger={createTrigger} externalSearch={searchQuery} filterVisible={showAlumniFilter} />
            )}
            {activeTab === 'fasilitas' && (
              <Fasilitas embedded createTrigger={createTrigger} externalSearch={searchQuery} />
            )}
            {activeTab === 'review-alumni' && (
              <AlumniSubmissions embedded onCountChange={setPendingCount} />
            )}
          </Suspense>

        </div>

        {/* ── Floating ⋮ pill — absolute, always visible ─────────────────────── */}
        <div ref={heroEditRef} className="absolute bottom-8 right-8 z-20 pointer-events-none">

          {/* Hero edit panel — floats above pill */}
          {showHeroEdit && (
            <div className="pointer-events-auto mb-3 w-80 bg-gradient-to-b from-white/80 to-white/60 backdrop-blur-2xl border border-white/80 rounded-2xl shadow-[0_8px_32px_rgba(0,0,0,0.14),inset_0_1px_0_rgba(255,255,255,0.9)] p-4 flex flex-col gap-3">
              <p className="text-[11px] font-semibold text-gray-500 uppercase tracking-widest">
                Edit Hero — {heroKey === 'ekskul' ? 'Ekstrakulikuler' : 'Fasilitas'}
              </p>

              {/* Title */}
              <div>
                <label className="block text-xs text-gray-500 mb-1">Judul</label>
                <input
                  type="text"
                  value={heroForm.title}
                  onChange={e => setHeroForm(f => ({ ...f, title: e.target.value }))}
                  className="w-full px-3 py-1.5 text-sm bg-black/[0.05] border border-black/10 rounded-xl focus:outline-none focus:ring-1 focus:ring-blue-400/50 text-gray-800"
                  placeholder="Judul hero..."
                />
              </div>

              {/* Subtitle */}
              <div>
                <label className="block text-xs text-gray-500 mb-1">Subjudul</label>
                <textarea
                  rows={2}
                  value={heroForm.subtitle}
                  onChange={e => setHeroForm(f => ({ ...f, subtitle: e.target.value }))}
                  className="w-full px-3 py-1.5 text-sm bg-black/[0.05] border border-black/10 rounded-xl focus:outline-none focus:ring-1 focus:ring-blue-400/50 text-gray-800 resize-none"
                  placeholder="Deskripsi singkat..."
                />
              </div>

              {/* Background image */}
              <div>
                <label className="block text-xs text-gray-500 mb-1">Background</label>
                <div
                  onClick={() => !heroUploading && heroFileRef.current?.click()}
                  className="relative w-full h-20 rounded-xl border-2 border-dashed border-black/15 overflow-hidden cursor-pointer hover:border-blue-400/60 transition-colors flex items-center justify-center bg-black/[0.03]"
                >
                  {heroForm.background ? (
                    <>
                      <img src={heroForm.background} alt="" className="absolute inset-0 w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                        <ImagePlus size={18} className="text-white" />
                      </div>
                    </>
                  ) : heroUploading ? (
                    <Loader2 size={18} className="text-blue-500 animate-spin" />
                  ) : (
                    <div className="flex flex-col items-center gap-1 text-gray-400">
                      <ImagePlus size={18} />
                      <span className="text-[10px]">Klik untuk upload</span>
                    </div>
                  )}
                </div>
                <input ref={heroFileRef} type="file" accept="image/*" className="hidden" onChange={handleHeroImageUpload} />
                {heroForm.background && (
                  <button
                    onClick={() => setHeroForm(f => ({ ...f, background: '' }))}
                    className="mt-1 text-[10px] text-red-400 hover:text-red-600 transition-colors"
                  >
                    Hapus background
                  </button>
                )}
              </div>

              {/* Actions */}
              <div className="flex gap-2 pt-1">
                <button
                  onClick={() => setShowHeroEdit(false)}
                  className="flex-1 py-1.5 text-xs text-gray-500 hover:text-gray-700 bg-black/[0.05] hover:bg-black/[0.09] rounded-xl transition-colors"
                >
                  Batal
                </button>
                <button
                  onClick={handleHeroSave}
                  disabled={heroSaving}
                  className="flex-1 py-1.5 text-xs text-white bg-blue-500 hover:bg-blue-600 rounded-xl transition-colors flex items-center justify-center gap-1.5 disabled:opacity-60"
                >
                  {heroSaving ? <Loader2 size={12} className="animate-spin" /> : null}
                  {heroSaving ? 'Menyimpan...' : 'Simpan'}
                </button>
              </div>
            </div>
          )}

          <div className="pointer-events-auto flex justify-end items-end">
              {pillExpanded ? (
                <div className="flex items-center gap-2 bg-gradient-to-b from-white/55 to-white/35 backdrop-blur-2xl border border-white/70 rounded-2xl px-3 py-2 shadow-[0_8px_32px_rgba(0,0,0,0.12),0_2px_8px_rgba(0,0,0,0.06),inset_0_1px_0_rgba(255,255,255,0.85),inset_0_-1px_0_rgba(0,0,0,0.04)]">

                  {/* Search input */}
                  {showSearch && (
                    <input
                      ref={pillSearchRef}
                      type="text"
                      value={searchQuery}
                      onChange={e => setSearchQuery(e.target.value)}
                      placeholder="Cari..."
                      className="w-44 px-2.5 py-1 text-xs rounded-xl bg-black/[0.05] border border-black/10 text-gray-700 placeholder-gray-400/60 focus:outline-none focus:ring-1 focus:ring-blue-400/40"
                    />
                  )}

                  {/* Filter toggle — alumni tab only */}
                  {activeTab === 'alumni' && (
                    <button
                      onClick={() => setShowAlumniFilter(v => !v)}
                      title="Filter"
                      className={`p-1.5 rounded-xl transition-all ${
                        showAlumniFilter
                          ? 'bg-blue-500/15 text-blue-600'
                          : 'text-gray-500/70 hover:text-gray-700 hover:bg-black/[0.05]'
                      }`}
                    >
                      <SlidersHorizontal size={15} />
                    </button>
                  )}

                  {/* Search toggle */}
                  <button
                    onClick={() => { setShowSearch(v => !v); if (showSearch) setSearchQuery(''); }}
                    title="Cari"
                    className={`p-1.5 rounded-xl transition-all ${
                      showSearch || searchQuery
                        ? 'bg-blue-500/15 text-blue-600'
                        : 'text-gray-500/70 hover:text-gray-700 hover:bg-black/[0.05]'
                    }`}
                  >
                    <Search size={15} />
                  </button>

                  {/* Edit hero — ekskul & fasilitas only */}
                  {hasHeroEdit && (
                    <button
                      onClick={() => setShowHeroEdit(v => !v)}
                      title="Edit Hero Section"
                      className={`p-1.5 rounded-xl transition-all ${
                        showHeroEdit
                          ? 'bg-blue-500/15 text-blue-600'
                          : 'text-gray-500/70 hover:text-gray-700 hover:bg-black/[0.05]'
                      }`}
                    >
                      <Pencil size={15} />
                    </button>
                  )}

                  {hasCreate && (
                    <>
                      <div className="w-px h-5 bg-black/[0.08]" />
                      <button
                        onClick={handleCreate}
                        title="Tambah baru"
                        className="p-1.5 rounded-xl text-blue-600 hover:bg-blue-400/15 transition-colors"
                      >
                        <Plus size={15} />
                      </button>
                    </>
                  )}

                  {/* Close */}
                  <button
                    onClick={() => { setPillExpanded(false); setShowSearch(false); setSearchQuery(''); }}
                    className="p-1.5 rounded-xl text-gray-400 hover:text-gray-600 hover:bg-black/[0.05] transition-colors"
                  >
                    <X size={15} />
                  </button>

                </div>
              ) : (
                <button
                  onClick={() => setPillExpanded(true)}
                  className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 shadow-[0_4px_16px_rgba(59,130,246,0.45),0_1px_4px_rgba(0,0,0,0.12),inset_0_1px_0_rgba(255,255,255,0.2)] text-white flex items-center justify-center hover:scale-105 active:scale-95 transition-transform"
                >
                  <MoreVertical size={16} />
                </button>
              )}
            </div>
          </div>

      </div>
    </div>
  );
};

export default KesiswaanPage;
