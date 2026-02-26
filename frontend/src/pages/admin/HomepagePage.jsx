import { lazy, Suspense, useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { ChevronDown, Check, Plus, MoreVertical, Settings, X, Eye, Save } from 'lucide-react';

const HeroSlides = lazy(() => import('../HeroSlides'));
const CTAManagement = lazy(() => import('../CTAManagement'));
const Partner = lazy(() => import('../Partner'));
const RunningText = lazy(() => import('../RunningText'));

const TabLoading = () => (
  <div className="flex items-center justify-center h-48">
    <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
  </div>
);

const HomepagePage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get('tab') || 'hero-slides';
  const [showTabDropdown, setShowTabDropdown] = useState(false);
  const [createTrigger, setCreateTrigger] = useState(0);
  const [settingsTrigger, setSettingsTrigger] = useState(0);
  const [previewTrigger, setPreviewTrigger] = useState(0);
  const [saveTrigger, setSaveTrigger] = useState(0);
  const [pillOpen, setPillOpen] = useState(false);

  const tabs = [
    { id: 'hero-slides', label: 'Hero Slides' },
    { id: 'cta', label: 'CTA' },
    { id: 'partner', label: 'Partner' },
    { id: 'running-text', label: 'Running Text' },
  ];

  const hasCreate = !['cta', 'running-text'].includes(activeTab);
  const hasSettings = ['hero-slides', 'running-text'].includes(activeTab);
  const hasCTAPill = activeTab === 'cta';

  useEffect(() => {
    setPillOpen(false);
  }, [activeTab]);

  const handleTabChange = (tabId) => {
    setSearchParams({ tab: tabId }, { replace: true });
  };

  const handleCreate = () => setCreateTrigger(c => c + 1);

  return (
    <div className="flex flex-col h-full">

      {/* ── Blue header ──────────────────────────────────────────────────────── */}
      <div className="bg-blue-600 text-white px-6 lg:px-8 py-4 flex items-center justify-between flex-shrink-0">
        <div>
          <h1 className="text-xl font-bold leading-tight">Homepage</h1>
          <p className="text-sm text-blue-200 leading-tight mt-0.5">Kelola konten halaman utama website</p>
        </div>

        {/* Tab select dropdown */}
        <div className="relative flex-shrink-0">
          <button
            onClick={() => setShowTabDropdown(v => !v)}
            className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/20 backdrop-blur-sm border border-white/40 text-white text-sm font-medium hover:bg-white/28 transition-all"
          >
            <span>{tabs.find(t => t.id === activeTab)?.label}</span>
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
            {activeTab === 'hero-slides' && (
              <HeroSlides embedded createTrigger={createTrigger} settingsTrigger={settingsTrigger} />
            )}
            {activeTab === 'cta' && <CTAManagement embedded previewTrigger={previewTrigger} saveTrigger={saveTrigger} />}
            {activeTab === 'partner' && <Partner embedded createTrigger={createTrigger} />}
            {activeTab === 'running-text' && <RunningText embedded createTrigger={createTrigger} settingsTrigger={settingsTrigger} />}
          </Suspense>
        </div>

        {/* ── Floating pill ─────────────────────────────────────────────────── */}
        <div className="absolute bottom-8 right-8 z-20">
          {(hasSettings || hasCTAPill || hasCreate) && (
            pillOpen ? (
              <div className="flex items-center gap-1.5 bg-white/80 backdrop-blur-2xl border border-white/70 rounded-2xl px-2.5 py-2 shadow-[0_8px_28px_rgba(0,0,0,0.12),inset_0_1px_0_rgba(255,255,255,0.9)]">
                {hasSettings && (
                  <>
                    <button onClick={() => { handleCreate(); setPillOpen(false); }} title="Tambah Slide"
                      className="p-1.5 rounded-xl text-blue-600 hover:bg-blue-50 transition-colors">
                      <Plus size={15} />
                    </button>
                    <div className="w-px h-5 bg-black/[0.08]" />
                    <button onClick={() => { setSettingsTrigger(c => c + 1); setPillOpen(false); }} title="Pengaturan Slide"
                      className="p-1.5 rounded-xl text-gray-600 hover:bg-gray-100 transition-colors">
                      <Settings size={15} />
                    </button>
                    <div className="w-px h-5 bg-black/[0.08]" />
                  </>
                )}
                {hasCTAPill && (
                  <>
                    <button onClick={() => { setSaveTrigger(c => c + 1); setPillOpen(false); }} title="Simpan Perubahan"
                      className="p-1.5 rounded-xl text-blue-600 hover:bg-blue-50 transition-colors">
                      <Save size={15} />
                    </button>
                    <div className="w-px h-5 bg-black/[0.08]" />
                    <button onClick={() => { setPreviewTrigger(c => c + 1); setPillOpen(false); }} title="Preview"
                      className="p-1.5 rounded-xl text-gray-600 hover:bg-gray-100 transition-colors">
                      <Eye size={15} />
                    </button>
                    <div className="w-px h-5 bg-black/[0.08]" />
                  </>
                )}
                <button onClick={() => setPillOpen(false)}
                  className="p-1.5 rounded-xl text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors">
                  <X size={15} />
                </button>
              </div>
            ) : (
              <button
                onClick={() => hasCreate && !hasSettings && !hasCTAPill ? handleCreate() : setPillOpen(true)}
                className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 shadow-[0_4px_16px_rgba(59,130,246,0.45),0_1px_4px_rgba(0,0,0,0.12),inset_0_1px_0_rgba(255,255,255,0.2)] text-white flex items-center justify-center hover:scale-105 active:scale-95 transition-transform"
              >
                {hasCreate && !hasSettings && !hasCTAPill ? <Plus size={16} /> : <MoreVertical size={16} />}
              </button>
            )
          )}
        </div>

      </div>
    </div>
  );
};

export default HomepagePage;
