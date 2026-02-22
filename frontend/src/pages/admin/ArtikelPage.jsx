import { lazy, Suspense, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { ChevronLeft, ChevronRight, ChevronDown, Check } from 'lucide-react';

const Articles = lazy(() => import('../Articles'));
const Categories = lazy(() => import('../Categories'));

const TabLoading = () => (
  <div className="flex items-center justify-center h-48">
    <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
  </div>
);

const ArtikelPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get('tab') || 'artikel';

  const [page, setPage] = useState(1);
  const [paginationMeta, setPaginationMeta] = useState({ pages: 1, total: 0 });
  const [showTabDropdown, setShowTabDropdown] = useState(false);

  const tabs = [
    { id: 'artikel', label: 'Semua Artikel' },
    { id: 'kategori', label: 'Kategori' },
  ];

  const handleTabChange = (tabId) => {
    setSearchParams({ tab: tabId }, { replace: true });
    setPage(1);
  };

  const pageNumbers = Array.from({ length: paginationMeta.pages }, (_, i) => i + 1)
    .filter(p => p === 1 || p === paginationMeta.pages || Math.abs(p - page) <= 1)
    .reduce((acc, p, idx, arr) => {
      if (idx > 0 && p - arr[idx - 1] > 1) acc.push('...');
      acc.push(p);
      return acc;
    }, []);

  return (
    <div className="flex flex-col h-full">

      {/* ── Blue header ────────────────────────────────────────────────── */}
      <div className="bg-blue-600 text-white px-6 lg:px-8 py-4 flex items-center justify-between flex-shrink-0">
        <div>
          <h1 className="text-xl font-bold leading-tight">Artikel</h1>
          <p className="text-sm text-blue-200 leading-tight mt-0.5">Kelola artikel dan kategori konten</p>
        </div>

        {/* Glass select dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowTabDropdown(v => !v)}
            className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/20 backdrop-blur-sm border border-white/40 text-white text-sm font-medium hover:bg-white/28 transition-all"
          >
            <span>{tabs.find(t => t.id === activeTab)?.label}</span>
            <ChevronDown size={14} className={`transition-transform duration-200 ${showTabDropdown ? 'rotate-180' : ''}`} />
          </button>

          {showTabDropdown && (
            <>
              {/* Backdrop to close */}
              <div className="fixed inset-0 z-20" onClick={() => setShowTabDropdown(false)} />

              <div className="absolute right-0 mt-2 bg-white/80 backdrop-blur-2xl border border-white/70 rounded-xl shadow-[0_8px_32px_rgba(0,0,0,0.12),inset_0_1px_0_rgba(255,255,255,0.9)] overflow-hidden py-1 min-w-[160px] z-30">
                {tabs.map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => { handleTabChange(tab.id); setShowTabDropdown(false); }}
                    className={`w-full px-4 py-2 text-left text-sm flex items-center gap-2.5 transition-colors ${
                      activeTab === tab.id
                        ? 'text-blue-600 bg-blue-400/10'
                        : 'text-gray-700 hover:bg-black/[0.05]'
                    }`}
                  >
                    {activeTab === tab.id
                      ? <Check size={13} className="text-blue-600 flex-shrink-0" />
                      : <span className="w-[13px] flex-shrink-0" />
                    }
                    <span>{tab.label}</span>
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {/* ── Content area — relative so pagination can float above ──────── */}
      <div className="flex-1 overflow-hidden bg-gradient-to-br from-slate-100 via-blue-50/40 to-slate-100 relative p-3 lg:p-4">

        {/* Glass scrollable panel — full height */}
        <div className="h-full bg-white/55 backdrop-blur-2xl rounded-2xl border border-white/75 shadow-[0_4px_32px_rgba(0,0,0,0.08),inset_0_1px_0_rgba(255,255,255,0.9),inset_0_-1px_0_rgba(0,0,0,0.03)] overflow-y-auto">
          <Suspense fallback={<TabLoading />}>
            {activeTab === 'artikel' && (
              <Articles
                embedded
                externalPage={page}
                onPageChange={setPage}
                onPaginationChange={setPaginationMeta}
              />
            )}
            {activeTab === 'kategori' && <Categories embedded />}
          </Suspense>
        </div>

        {/* ── Floating glass pagination — overlays the white panel ──────── */}
        {activeTab === 'artikel' && paginationMeta.pages > 0 && (
          <div className="absolute bottom-5 left-5 right-5 lg:bottom-6 lg:left-6 lg:right-6 z-20 bg-gradient-to-b from-white/60 to-white/40 backdrop-blur-2xl border border-white/70 shadow-[0_8px_32px_rgba(0,0,0,0.10),0_2px_8px_rgba(0,0,0,0.06),inset_0_1px_0_rgba(255,255,255,0.85),inset_0_-1px_0_rgba(0,0,0,0.04)] rounded-2xl px-5 py-2.5 flex items-center justify-between">
            <p className="text-sm text-gray-500/80">
              Halaman{' '}
              <span className="font-semibold text-gray-800">{page}</span>
              {' '}dari{' '}
              <span className="font-semibold text-gray-800">{paginationMeta.pages}</span>
              {paginationMeta.total > 0 && (
                <span className="text-xs text-gray-400/70 ml-2">({paginationMeta.total} artikel)</span>
              )}
            </p>

            <div className="flex items-center gap-1">
              <button
                onClick={() => setPage(p => p - 1)}
                disabled={page <= 1}
                className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium bg-black/[0.05] border border-black/10 rounded-xl disabled:opacity-30 hover:bg-black/[0.09] text-gray-600 transition-all"
              >
                <ChevronLeft size={13} /> Prev
              </button>

              {pageNumbers.map((p, i) =>
                p === '...' ? (
                  <span key={`dots-${i}`} className="w-8 h-8 text-xs text-gray-400/60 flex items-center justify-center">…</span>
                ) : (
                  <button
                    key={p}
                    onClick={() => setPage(p)}
                    className={`w-8 h-8 text-xs font-medium rounded-xl transition-all ${
                      page === p
                        ? 'bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-[0_2px_8px_rgba(59,130,246,0.45),inset_0_1px_0_rgba(255,255,255,0.2)]'
                        : 'bg-black/[0.05] border border-black/10 text-gray-600 hover:bg-black/[0.09]'
                    }`}
                  >
                    {p}
                  </button>
                )
              )}

              <button
                onClick={() => setPage(p => p + 1)}
                disabled={page >= paginationMeta.pages}
                className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium bg-black/[0.05] border border-black/10 rounded-xl disabled:opacity-30 hover:bg-black/[0.09] text-gray-600 transition-all"
              >
                Next <ChevronRight size={13} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ArtikelPage;
