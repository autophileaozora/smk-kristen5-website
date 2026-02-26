import { lazy, Suspense, useState } from 'react';
import { createPortal } from 'react-dom';
import { useSearchParams } from 'react-router-dom';
import {
  ChevronDown, Check, ChevronLeft, ChevronRight,
  SlidersHorizontal, X, Search, MoreVertical, UserPlus,
} from 'lucide-react';

const Users    = lazy(() => import('../Users'));
const AuditLogs = lazy(() => import('../AuditLogs'));

const TabLoading = () => (
  <div className="flex items-center justify-center h-48">
    <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
  </div>
);

const SistemPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get('tab') || 'users';

  const [showTabDropdown, setShowTabDropdown] = useState(false);
  const [page, setPage] = useState(1);
  const [paginationMeta, setPaginationMeta] = useState({ pages: 1, total: 0 });
  const [pillOpen, setPillOpen] = useState(false);
  // panelOpen: null | 'filter' | 'search'
  const [panelOpen, setPanelOpen] = useState(null);
  const [createTrigger, setCreateTrigger] = useState(0);

  // Per-tab filter state
  const [usersFilters, setUsersFilters] = useState({ search: '', role: '', isActive: '' });
  const [auditFilters, setAuditFilters] = useState({ action: '', resource: '', status: '', startDate: '', endDate: '' });

  const tabs = [
    { id: 'users',     label: 'Manajemen User' },
    { id: 'audit-log', label: 'Audit Log' },
  ];

  const handleTabChange = (tabId) => {
    setSearchParams({ tab: tabId }, { replace: true });
    setPage(1);
    setPaginationMeta({ pages: 1, total: 0 });
    setPillOpen(false);
    setPanelOpen(null);
  };

  const handleUsersFilter = (key, value) => {
    setUsersFilters(prev => ({ ...prev, [key]: value }));
    setPage(1);
  };

  const handleAuditFilter = (key, value) => {
    setAuditFilters(prev => ({ ...prev, [key]: value }));
    setPage(1);
  };

  const pageNumbers = Array.from({ length: paginationMeta.pages }, (_, i) => i + 1)
    .filter(p => p === 1 || p === paginationMeta.pages || Math.abs(p - page) <= 1)
    .reduce((acc, p, idx, arr) => {
      if (idx > 0 && p - arr[idx - 1] > 1) acc.push('...');
      acc.push(p);
      return acc;
    }, []);

  const showPagination = paginationMeta.pages > 1;

  // Shared input / select styles for the filter panel
  const inputCls = 'w-full px-3 py-2 text-sm bg-white/60 border border-black/[0.08] rounded-xl focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 outline-none transition-all placeholder:text-gray-400';

  const Sel = ({ value, onChange, children, className = '' }) => (
    <div className={`relative ${className}`}>
      <select value={value} onChange={onChange} className={`${inputCls} appearance-none pr-8`}>
        {children}
      </select>
      <ChevronDown size={13} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
    </div>
  );

  // Active filter indicators (per icon)
  const usersSearchActive = !!usersFilters.search;
  const usersFilterActive = !!(usersFilters.role || usersFilters.isActive);
  const auditActive = !!(auditFilters.action || auditFilters.resource || auditFilters.status || auditFilters.startDate || auditFilters.endDate);
  const hasActiveFilter = activeTab === 'users' ? (usersSearchActive || usersFilterActive) : auditActive;

  return (
    <div className="flex flex-col h-full">

      {/* ── Blue header ────────────────────────────────────────────────── */}
      <div className="bg-blue-600 text-white px-6 lg:px-8 py-4 flex items-center justify-between flex-shrink-0">
        <div>
          <h1 className="text-xl font-bold leading-tight">User & Sistem</h1>
          <p className="text-sm text-blue-200 leading-tight mt-0.5">Kelola pengguna dan pantau aktivitas sistem</p>
        </div>

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
                    <span>{tab.label}</span>
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {/* ── Content area ────────────────────────────────────────────────── */}
      <div className="flex-1 overflow-hidden bg-gradient-to-br from-slate-100 via-blue-50/40 to-slate-100 relative p-3 lg:p-4">

        {/* Glass scrollable panel */}
        <div className="h-full bg-white/55 backdrop-blur-2xl rounded-2xl border border-white/75 shadow-[0_4px_32px_rgba(0,0,0,0.08),inset_0_1px_0_rgba(255,255,255,0.9),inset_0_-1px_0_rgba(0,0,0,0.03)] overflow-y-auto">
          <Suspense fallback={<TabLoading />}>
            {activeTab === 'users' && (
              <Users
                embedded
                filters={usersFilters}
                externalPage={page}
                onPageChange={setPage}
                onPaginationChange={setPaginationMeta}
                createTrigger={createTrigger}
              />
            )}
            {activeTab === 'audit-log' && (
              <AuditLogs
                embedded
                filters={auditFilters}
                externalPage={page}
                onPageChange={setPage}
                onPaginationChange={setPaginationMeta}
              />
            )}
          </Suspense>
        </div>

        {/* ── Floating pagination bar ──────────────────────────────────── */}
        {showPagination && (
          <div className="absolute bottom-5 left-5 right-5 lg:bottom-6 lg:left-6 lg:right-6 z-20 bg-gradient-to-b from-white/60 to-white/40 backdrop-blur-2xl border border-white/70 shadow-[0_8px_32px_rgba(0,0,0,0.10),0_2px_8px_rgba(0,0,0,0.06),inset_0_1px_0_rgba(255,255,255,0.85),inset_0_-1px_0_rgba(0,0,0,0.04)] rounded-2xl px-5 py-2.5 flex items-center justify-between">
            <p className="text-sm text-gray-500/80">
              Hal. <span className="font-semibold text-gray-800">{page}</span>
              {' '}/{' '}
              <span className="font-semibold text-gray-800">{paginationMeta.pages}</span>
              {paginationMeta.total > 0 && (
                <span className="text-xs text-gray-400/70 ml-1.5">({paginationMeta.total})</span>
              )}
            </p>

            <div className="flex items-center gap-1">
              <button onClick={() => setPage(p => p - 1)} disabled={page <= 1}
                className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium bg-black/[0.05] border border-black/10 rounded-xl disabled:opacity-30 hover:bg-black/[0.09] text-gray-600 transition-all">
                <ChevronLeft size={13} /> Prev
              </button>

              {pageNumbers.map((p, i) =>
                p === '...' ? (
                  <span key={`dots-${i}`} className="w-8 h-8 text-xs text-gray-400/60 flex items-center justify-center">…</span>
                ) : (
                  <button key={p} onClick={() => setPage(p)}
                    className={`w-8 h-8 text-xs font-medium rounded-xl transition-all ${
                      page === p
                        ? 'bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-[0_2px_8px_rgba(59,130,246,0.45),inset_0_1px_0_rgba(255,255,255,0.2)]'
                        : 'bg-black/[0.05] border border-black/10 text-gray-600 hover:bg-black/[0.09]'
                    }`}>
                    {p}
                  </button>
                )
              )}

              <button onClick={() => setPage(p => p + 1)} disabled={page >= paginationMeta.pages}
                className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium bg-black/[0.05] border border-black/10 rounded-xl disabled:opacity-30 hover:bg-black/[0.09] text-gray-600 transition-all">
                Next <ChevronRight size={13} />
              </button>
            </div>
          </div>
        )}

        {/* ── Backdrop (closes everything) ──────────────────────────────── */}
        {(pillOpen || panelOpen) && createPortal(
          <div className="fixed inset-0 z-30" onClick={() => { setPillOpen(false); setPanelOpen(null); }} />,
          document.body
        )}

        {/* ── Panel — fixed above pill row ──────────────────────────────── */}
        {pillOpen && panelOpen && createPortal(
          <div className="fixed bottom-[5.5rem] right-8 z-40 w-72 bg-white/80 backdrop-blur-2xl border border-white/70 rounded-2xl shadow-[0_8px_40px_rgba(0,0,0,0.14),inset_0_1px_0_rgba(255,255,255,0.9)] p-4 space-y-2">

            {/* Search panel — users only */}
            {activeTab === 'users' && panelOpen === 'search' && (
              <div className="relative">
                <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                <input
                  autoFocus
                  type="text"
                  value={usersFilters.search}
                  onChange={e => handleUsersFilter('search', e.target.value)}
                  className={`${inputCls} pl-8`}
                  placeholder="Cari nama atau email…"
                />
              </div>
            )}

            {/* Filter panel — users */}
            {activeTab === 'users' && panelOpen === 'filter' && (
              <>
                <div className="grid grid-cols-2 gap-2">
                  <Sel value={usersFilters.role} onChange={e => handleUsersFilter('role', e.target.value)}>
                    <option value="">Semua Role</option>
                    <option value="administrator">Administrator</option>
                    <option value="admin_siswa">Admin Siswa</option>
                  </Sel>
                  <Sel value={usersFilters.isActive} onChange={e => handleUsersFilter('isActive', e.target.value)}>
                    <option value="">Semua Status</option>
                    <option value="true">Aktif</option>
                    <option value="false">Nonaktif</option>
                  </Sel>
                </div>
                <button
                  onClick={() => { setUsersFilters({ search: '', role: '', isActive: '' }); setPage(1); }}
                  className="w-full mt-1 px-3 py-2 text-xs text-gray-500 hover:text-gray-700 hover:bg-black/[0.04] rounded-xl transition-colors text-center"
                >
                  Reset semua filter
                </button>
              </>
            )}

            {/* Filter panel — audit log */}
            {activeTab === 'audit-log' && panelOpen === 'filter' && (
              <>
                <div className="grid grid-cols-2 gap-2">
                  <Sel value={auditFilters.action} onChange={e => handleAuditFilter('action', e.target.value)}>
                    <option value="">Semua Aksi</option>
                    <option value="login">Login</option>
                    <option value="logout">Logout</option>
                    <option value="create">Create</option>
                    <option value="update">Update</option>
                    <option value="delete">Delete</option>
                    <option value="approve">Approve</option>
                    <option value="reject">Reject</option>
                    <option value="upload">Upload</option>
                    <option value="download">Download</option>
                  </Sel>
                  <Sel value={auditFilters.resource} onChange={e => handleAuditFilter('resource', e.target.value)}>
                    <option value="">Semua Resource</option>
                    <option value="user">User</option>
                    <option value="article">Artikel</option>
                    <option value="runningText">Running Text</option>
                    <option value="prestasi">Prestasi</option>
                    <option value="jurusan">Jurusan</option>
                    <option value="ekskul">Ekskul</option>
                    <option value="alumni">Alumni</option>
                    <option value="category">Kategori</option>
                    <option value="videoHero">Video Hero</option>
                  </Sel>
                </div>
                <Sel value={auditFilters.status} onChange={e => handleAuditFilter('status', e.target.value)}>
                  <option value="">Semua Status</option>
                  <option value="success">Berhasil</option>
                  <option value="failed">Gagal</option>
                </Sel>
                <div className="grid grid-cols-2 gap-2">
                  <input type="date" value={auditFilters.startDate}
                    onChange={e => handleAuditFilter('startDate', e.target.value)}
                    className={inputCls} />
                  <input type="date" value={auditFilters.endDate}
                    onChange={e => handleAuditFilter('endDate', e.target.value)}
                    className={inputCls} />
                </div>
                <button
                  onClick={() => { setAuditFilters({ action: '', resource: '', status: '', startDate: '', endDate: '' }); setPage(1); }}
                  className="w-full mt-1 px-3 py-2 text-xs text-gray-500 hover:text-gray-700 hover:bg-black/[0.04] rounded-xl transition-colors text-center"
                >
                  Reset semua filter
                </button>
              </>
            )}
          </div>,
          document.body
        )}

        {/* ── Floating pill — fixed so it never scrolls ─────────────────── */}
        <div className="fixed bottom-8 right-8 z-50">
          {pillOpen ? (
            /* Expanded horizontal glass pill */
            <div className="flex items-center gap-1 bg-white/80 backdrop-blur-2xl border border-white/70 rounded-full px-2 py-2 shadow-[0_4px_24px_rgba(0,0,0,0.12),inset_0_1px_0_rgba(255,255,255,0.9)]">

              {/* Filter icon */}
              <button
                onClick={() => setPanelOpen(v => v === 'filter' ? null : 'filter')}
                title="Filter"
                className={`w-9 h-9 rounded-full flex items-center justify-center transition-all relative ${
                  panelOpen === 'filter'
                    ? 'bg-blue-500 text-white shadow-[0_2px_8px_rgba(59,130,246,0.4)]'
                    : 'text-gray-600 hover:bg-black/[0.06]'
                }`}
              >
                <SlidersHorizontal size={15} />
                {panelOpen !== 'filter' && (activeTab === 'users' ? usersFilterActive : auditActive) && (
                  <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-amber-400 border border-white" />
                )}
              </button>

              {/* Search icon — users tab only */}
              {activeTab === 'users' && (
                <button
                  onClick={() => setPanelOpen(v => v === 'search' ? null : 'search')}
                  title="Cari"
                  className={`w-9 h-9 rounded-full flex items-center justify-center transition-all relative ${
                    panelOpen === 'search'
                      ? 'bg-blue-500 text-white shadow-[0_2px_8px_rgba(59,130,246,0.4)]'
                      : 'text-gray-600 hover:bg-black/[0.06]'
                  }`}
                >
                  <Search size={15} />
                  {panelOpen !== 'search' && usersSearchActive && (
                    <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-amber-400 border border-white" />
                  )}
                </button>
              )}

              {/* Add User — users tab only */}
              {activeTab === 'users' && (
                <button
                  onClick={() => { setCreateTrigger(c => c + 1); setPillOpen(false); setPanelOpen(null); }}
                  title="Tambah User"
                  className="w-9 h-9 rounded-full flex items-center justify-center text-gray-600 hover:bg-black/[0.06] transition-all"
                >
                  <UserPlus size={15} />
                </button>
              )}

              {/* Divider */}
              <div className="w-px h-5 bg-black/[0.08] mx-0.5" />

              {/* Close */}
              <button
                onClick={() => { setPillOpen(false); setPanelOpen(null); }}
                className="w-9 h-9 rounded-full flex items-center justify-center text-gray-400 hover:bg-black/[0.06] transition-all"
              >
                <X size={15} />
              </button>
            </div>
          ) : (
            /* Collapsed — three-dot circle */
            <button
              onClick={() => setPillOpen(true)}
              className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 text-white flex items-center justify-center hover:scale-105 active:scale-95 transition-transform shadow-[0_4px_16px_rgba(59,130,246,0.45),0_1px_4px_rgba(0,0,0,0.12),inset_0_1px_0_rgba(255,255,255,0.2)] relative"
            >
              <MoreVertical size={16} />
              {hasActiveFilter && (
                <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-amber-400 border-2 border-white" />
              )}
            </button>
          )}
        </div>

      </div>
    </div>
  );
};

export default SistemPage;
