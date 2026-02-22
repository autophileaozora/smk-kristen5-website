import { lazy, Suspense, useState, useRef, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { ChevronDown, Check, Plus, Search, X, MoreVertical } from 'lucide-react';
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
              <Alumni embedded createTrigger={createTrigger} externalSearch={searchQuery} />
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
        <div className="absolute bottom-8 right-8 z-20 pointer-events-none">
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
