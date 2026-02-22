import { lazy, Suspense, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { ChevronDown, Check, Save, Plus, MoreVertical, X, RefreshCw, Monitor } from 'lucide-react';

const SiteSettings = lazy(() => import('../SiteSettings'));
const AboutManagement = lazy(() => import('../AboutManagement'));
const NavbarManagement = lazy(() => import('../NavbarManagement'));
const FooterManagement = lazy(() => import('../FooterManagement'));
const SocialMedia = lazy(() => import('../SocialMedia'));

const TabLoading = () => (
  <div className="flex items-center justify-center h-48">
    <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
  </div>
);

// Map outer tab id → SiteSettings section prop
const SITE_SETTINGS_SECTION = { beranda: 'beranda', seo: 'seo' };

const PengaturanPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get('tab') || 'beranda';

  const [showTabDropdown, setShowTabDropdown] = useState(false);
  const [pillOpen, setPillOpen] = useState(false);
  const [saveTrigger, setSaveTrigger] = useState(0);
  const [createTrigger, setCreateTrigger] = useState(0);
  const [resetTrigger, setResetTrigger] = useState(0);
  const [previewTrigger, setPreviewTrigger] = useState(0);
  const [footerPreviewTrigger, setFooterPreviewTrigger] = useState(0);

  const tabs = [
    { id: 'beranda', label: 'Beranda' },
    { id: 'seo', label: 'SEO' },
    { id: 'sekolah', label: 'Info Sekolah' },
    { id: 'navbar', label: 'Navbar' },
    { id: 'footer', label: 'Footer' },
    { id: 'sosmed', label: 'Sosial Media' },
  ];

  const hasSave = ['beranda', 'seo', 'sekolah', 'footer'].includes(activeTab);
  const hasCreate = ['navbar', 'footer', 'sosmed'].includes(activeTab);
  const hasReset = ['navbar'].includes(activeTab);

  // footer has both save + create → use pill; others → direct button
  const useExpandablePill = hasSave && hasCreate;
  const showPill = hasSave || hasCreate;

  const handleTabChange = (tabId) => {
    setSearchParams({ tab: tabId }, { replace: true });
    setPillOpen(false);
  };

  return (
    <div className="flex flex-col h-full">

      {/* ── Blue header ────────────────────────────────────────────────── */}
      <div className="bg-blue-600 text-white px-6 lg:px-8 py-4 flex items-center justify-between flex-shrink-0">
        <div>
          <h1 className="text-xl font-bold leading-tight">Pengaturan</h1>
          <p className="text-sm text-blue-200 leading-tight mt-0.5">Konfigurasi website, informasi sekolah, dan tampilan</p>
        </div>

        {/* Glass tab select dropdown */}
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

      {/* ── Content area ────────────────────────────────────────────────── */}
      <div className="flex-1 overflow-hidden bg-gradient-to-br from-slate-100 via-blue-50/40 to-slate-100 p-3 lg:p-4 relative">

        {/* Glass scrollable panel */}
        <div className="h-full bg-white/55 backdrop-blur-2xl rounded-2xl border border-white/75 shadow-[0_4px_32px_rgba(0,0,0,0.08),inset_0_1px_0_rgba(255,255,255,0.9),inset_0_-1px_0_rgba(0,0,0,0.03)] overflow-y-auto">
          <div className="p-4 pb-24">
            <Suspense fallback={<TabLoading />}>
              {['beranda', 'seo'].includes(activeTab) && (
                <SiteSettings
                  embedded
                  section={SITE_SETTINGS_SECTION[activeTab]}
                  saveTrigger={saveTrigger}
                />
              )}
              {activeTab === 'sekolah' && <AboutManagement embedded saveTrigger={saveTrigger} />}
              {activeTab === 'navbar' && <NavbarManagement embedded createTrigger={createTrigger} resetTrigger={resetTrigger} previewTrigger={previewTrigger} />}
              {activeTab === 'footer' && <FooterManagement embedded createTrigger={createTrigger} saveTrigger={saveTrigger} previewTrigger={footerPreviewTrigger} />}
              {activeTab === 'sosmed' && <SocialMedia embedded createTrigger={createTrigger} />}
            </Suspense>
          </div>
        </div>

        {/* ── Floating action pill ─────────────────────────────────────── */}
        {showPill && (
          <div className="absolute bottom-8 right-8 z-20">
            {useExpandablePill ? (
              pillOpen ? (
                <div className="flex items-center gap-1.5 bg-white/80 backdrop-blur-2xl border border-white/70 rounded-2xl px-2.5 py-2 shadow-[0_8px_28px_rgba(0,0,0,0.12),inset_0_1px_0_rgba(255,255,255,0.9)]">
                  <button
                    onClick={() => { setFooterPreviewTrigger(c => c + 1); setPillOpen(false); }}
                    title="Preview Footer"
                    className="p-1.5 rounded-xl text-blue-600 hover:bg-blue-50 transition-colors"
                  >
                    <Monitor size={15} />
                  </button>
                  <div className="w-px h-5 bg-black/[0.08]" />
                  <button
                    onClick={() => { setSaveTrigger(c => c + 1); setPillOpen(false); }}
                    title="Simpan"
                    className="p-1.5 rounded-xl text-blue-600 hover:bg-blue-50 transition-colors"
                  >
                    <Save size={15} />
                  </button>
                  <div className="w-px h-5 bg-black/[0.08]" />
                  <button
                    onClick={() => { setCreateTrigger(c => c + 1); setPillOpen(false); }}
                    title="Tambah Kolom"
                    className="p-1.5 rounded-xl text-blue-600 hover:bg-blue-50 transition-colors"
                  >
                    <Plus size={15} />
                  </button>
                  <div className="w-px h-5 bg-black/[0.08]" />
                  <button
                    onClick={() => setPillOpen(false)}
                    className="p-1.5 rounded-xl text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
                  >
                    <X size={15} />
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setPillOpen(true)}
                  className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 shadow-[0_4px_16px_rgba(59,130,246,0.45),0_1px_4px_rgba(0,0,0,0.12),inset_0_1px_0_rgba(255,255,255,0.2)] text-white flex items-center justify-center hover:scale-105 active:scale-95 transition-transform"
                >
                  <MoreVertical size={16} />
                </button>
              )
            ) : hasSave ? (
              /* Save-only tab: direct Save circle */
              <button
                onClick={() => setSaveTrigger(c => c + 1)}
                title="Simpan"
                className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 shadow-[0_4px_16px_rgba(59,130,246,0.45),0_1px_4px_rgba(0,0,0,0.12),inset_0_1px_0_rgba(255,255,255,0.2)] text-white flex items-center justify-center hover:scale-105 active:scale-95 transition-transform"
              >
                <Save size={16} />
              </button>
            ) : hasCreate && hasReset ? (
              /* Navbar: expandable pill with Preview, +, Reset */
              pillOpen ? (
                <div className="flex items-center gap-1.5 bg-white/80 backdrop-blur-2xl border border-white/70 rounded-2xl px-2.5 py-2 shadow-[0_8px_28px_rgba(0,0,0,0.12),inset_0_1px_0_rgba(255,255,255,0.9)]">
                  <button
                    onClick={() => { setPreviewTrigger(c => c + 1); setPillOpen(false); }}
                    title="Preview Navbar"
                    className="p-1.5 rounded-xl text-blue-600 hover:bg-blue-50 transition-colors"
                  >
                    <Monitor size={15} />
                  </button>
                  <div className="w-px h-5 bg-black/[0.08]" />
                  <button
                    onClick={() => { setCreateTrigger(c => c + 1); setPillOpen(false); }}
                    title="Tambah Menu"
                    className="p-1.5 rounded-xl text-blue-600 hover:bg-blue-50 transition-colors"
                  >
                    <Plus size={15} />
                  </button>
                  <div className="w-px h-5 bg-black/[0.08]" />
                  <button
                    onClick={() => { setResetTrigger(c => c + 1); setPillOpen(false); }}
                    title="Reset ke Default"
                    className="p-1.5 rounded-xl text-orange-500 hover:bg-orange-50 transition-colors"
                  >
                    <RefreshCw size={15} />
                  </button>
                  <div className="w-px h-5 bg-black/[0.08]" />
                  <button
                    onClick={() => setPillOpen(false)}
                    className="p-1.5 rounded-xl text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
                  >
                    <X size={15} />
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setPillOpen(true)}
                  className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 shadow-[0_4px_16px_rgba(59,130,246,0.45),0_1px_4px_rgba(0,0,0,0.12),inset_0_1px_0_rgba(255,255,255,0.2)] text-white flex items-center justify-center hover:scale-105 active:scale-95 transition-transform"
                >
                  <MoreVertical size={16} />
                </button>
              )
            ) : (
              /* Create-only (sosmed): direct + circle */
              <button
                onClick={() => setCreateTrigger(c => c + 1)}
                title="Tambah"
                className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 shadow-[0_4px_16px_rgba(59,130,246,0.45),0_1px_4px_rgba(0,0,0,0.12),inset_0_1px_0_rgba(255,255,255,0.2)] text-white flex items-center justify-center hover:scale-105 active:scale-95 transition-transform"
              >
                <Plus size={16} />
              </button>
            )}
          </div>
        )}

      </div>
    </div>
  );
};

export default PengaturanPage;
