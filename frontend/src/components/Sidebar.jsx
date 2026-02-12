import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import useAuthStore from '../store/authStore';
import api from '../services/api';
import {
  LayoutDashboard, FileText, Megaphone, Trophy, GraduationCap,
  BookOpen, Building2, Dribbble, Users, Video, Images, FilePlus,
  FolderOpen, UserCog, ClipboardList, Share2, Handshake, MousePointerClick,
  CalendarDays, CalendarCheck, School, Settings, Navigation, PanelBottom,
  ChevronDown, ChevronRight, PanelLeftClose, PanelLeftOpen, Search,
  ExternalLink, LogOut, User,
} from 'lucide-react';

// SVG gradient definition component
const IconGradients = () => (
  <svg width="0" height="0" className="absolute">
    <defs>
      <linearGradient id="icon-grad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#3B82F6" />
        <stop offset="100%" stopColor="#8B5CF6" />
      </linearGradient>
      <linearGradient id="icon-grad-active" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#2563EB" />
        <stop offset="100%" stopColor="#7C3AED" />
      </linearGradient>
    </defs>
  </svg>
);

// Wrapper to apply gradient to lucide icons
const GradientIcon = ({ icon: Icon, size = 20, active = false, className = '' }) => (
  <Icon
    size={size}
    stroke={active ? 'url(#icon-grad-active)' : 'url(#icon-grad)'}
    strokeWidth={active ? 2.2 : 1.8}
    className={className}
  />
);

const Sidebar = ({ collapsed, onToggleCollapse }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [pendingArticlesCount, setPendingArticlesCount] = useState(0);
  const [openGroups, setOpenGroups] = useState({});
  const location = useLocation();
  const { user, logout } = useAuthStore();

  const isActive = (path) => location.pathname === path;

  // Fetch pending articles count for administrator
  useEffect(() => {
    const fetchPendingCount = async () => {
      if (user?.role === 'administrator') {
        try {
          const response = await api.get('/api/articles?status=pending&limit=1');
          if (response.data.success && response.data.data.pagination) {
            setPendingArticlesCount(response.data.data.pagination.total);
          }
        } catch (error) {
          console.error('Error fetching pending articles count:', error);
        }
      }
    };

    fetchPendingCount();
    const interval = setInterval(fetchPendingCount, 30000);
    return () => clearInterval(interval);
  }, [user]);

  // Menu structure - grouped by category
  const menuGroups = user?.role === 'administrator' ? [
    {
      id: 'main',
      items: [
        { name: 'Dashboard', path: '/admin/dashboard', icon: LayoutDashboard },
      ],
    },
    {
      id: 'konten',
      label: 'Konten',
      items: [
        { name: 'Artikel', path: '/admin/articles', icon: FileText, badge: pendingArticlesCount },
        { name: 'Custom Pages', path: '/admin/custom-pages', icon: FilePlus },
        { name: 'Kategori', path: '/admin/categories', icon: FolderOpen },
        { name: 'Running Text', path: '/admin/running-text', icon: Megaphone },
      ],
    },
    {
      id: 'akademik',
      label: 'Akademik',
      items: [
        { name: 'Jurusan', path: '/admin/jurusan', icon: GraduationCap },
        { name: 'Mata Pelajaran', path: '/admin/mata-pelajaran', icon: BookOpen },
        { name: 'Ekskul', path: '/admin/ekskul', icon: Dribbble },
        { name: 'Prestasi', path: '/admin/prestasi', icon: Trophy },
      ],
    },
    {
      id: 'sekolah',
      label: 'Sekolah',
      items: [
        { name: 'Informasi Sekolah', path: '/admin/about', icon: School },
        { name: 'Fasilitas', path: '/admin/fasilitas', icon: Building2 },
        { name: 'Alumni', path: '/admin/alumni', icon: Users },
        { name: 'Kegiatan', path: '/admin/activities', icon: CalendarDays },
        { name: 'Agenda', path: '/admin/events', icon: CalendarCheck },
      ],
    },
    {
      id: 'homepage',
      label: 'Homepage',
      items: [
        { name: 'Hero Slides', path: '/admin/hero-slides', icon: Images },
        { name: 'Video Hero', path: '/admin/video-hero', icon: Video },
        { name: 'CTA', path: '/admin/cta', icon: MousePointerClick },
        { name: 'Partner', path: '/admin/partners', icon: Handshake },
      ],
    },
    {
      id: 'tampilan',
      label: 'Tampilan',
      items: [
        { name: 'Pengaturan Website', path: '/admin/site-settings', icon: Settings },
        { name: 'Navbar', path: '/admin/navbar', icon: Navigation },
        { name: 'Footer', path: '/admin/footer', icon: PanelBottom },
        { name: 'Sosial Media', path: '/admin/social-media', icon: Share2 },
      ],
    },
    {
      id: 'sistem',
      label: 'Sistem',
      items: [
        { name: 'Manajemen User', path: '/admin/users', icon: UserCog },
        { name: 'Audit Log', path: '/admin/audit-logs', icon: ClipboardList },
      ],
    },
  ] : [
    {
      id: 'main',
      items: [
        { name: 'Dashboard', path: '/admin/dashboard', icon: LayoutDashboard },
      ],
    },
    {
      id: 'konten',
      label: 'Konten',
      items: [
        { name: 'Artikel Saya', path: '/admin/my-articles', icon: FileText },
        { name: 'Running Text', path: '/admin/running-text', icon: Megaphone },
        { name: 'Prestasi', path: '/admin/prestasi', icon: Trophy },
      ],
    },
  ];

  // Auto-expand group that contains the active route
  useEffect(() => {
    const newOpenGroups = {};
    menuGroups.forEach((group) => {
      if (group.items.some((item) => isActive(item.path))) {
        newOpenGroups[group.id] = true;
      }
    });
    setOpenGroups((prev) => ({ ...prev, ...newOpenGroups }));
  }, [location.pathname]);

  const toggleGroup = (groupId) => {
    if (collapsed) return; // Don't toggle when collapsed
    setOpenGroups((prev) => ({ ...prev, [groupId]: !prev[groupId] }));
  };

  const handleLogout = () => {
    logout();
    setIsMobileMenuOpen(false);
  };

  const renderMenuItem = (item) => {
    const active = isActive(item.path);
    return (
      <Link
        key={item.path}
        to={item.path}
        onClick={() => setIsMobileMenuOpen(false)}
        title={collapsed ? item.name : undefined}
        className={`
          group flex items-center justify-between rounded-lg transition-all duration-200
          ${collapsed ? 'px-3 py-2.5 mx-auto justify-center' : 'px-3 py-2.5'}
          ${active
            ? 'bg-gradient-to-r from-blue-50 to-purple-50 text-blue-700 shadow-sm'
            : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
          }
        `}
      >
        <div className={`flex items-center ${collapsed ? '' : 'space-x-3'}`}>
          <GradientIcon icon={item.icon} size={20} active={active} />
          {!collapsed && (
            <span className={`text-sm ${active ? 'font-semibold' : 'font-medium'}`}>
              {item.name}
            </span>
          )}
        </div>
        {!collapsed && item.badge > 0 && (
          <span className="inline-flex items-center justify-center w-5 h-5 text-[10px] font-bold text-white bg-red-500 rounded-full">
            {item.badge}
          </span>
        )}
        {collapsed && item.badge > 0 && (
          <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full" />
        )}
      </Link>
    );
  };

  const renderGroup = (group) => {
    // No label = top-level items (Dashboard)
    if (!group.label) {
      return (
        <div key={group.id} className="space-y-1">
          {group.items.map(renderMenuItem)}
        </div>
      );
    }

    const isOpen = openGroups[group.id];
    const hasActiveChild = group.items.some((item) => isActive(item.path));

    // Collapsed mode: show only icons, no group headers
    if (collapsed) {
      return (
        <div key={group.id} className="space-y-1 pt-2 border-t border-gray-100">
          {group.items.map(renderMenuItem)}
        </div>
      );
    }

    return (
      <div key={group.id} className="pt-3">
        <button
          onClick={() => toggleGroup(group.id)}
          className={`
            w-full flex items-center justify-between px-3 py-1.5 text-xs font-semibold uppercase tracking-wider rounded-md transition-colors
            ${hasActiveChild ? 'text-blue-600' : 'text-gray-400 hover:text-gray-600'}
          `}
        >
          <span>{group.label}</span>
          {isOpen ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
        </button>
        {isOpen && (
          <div className="mt-1 space-y-0.5">
            {group.items.map(renderMenuItem)}
          </div>
        )}
      </div>
    );
  };

  const sidebarContent = (
    <>
      <IconGradients />

      {/* Logo/Header */}
      <div className={`border-b border-gray-100 ${collapsed ? 'p-3' : 'p-5'}`}>
        <div className={`flex items-center ${collapsed ? 'justify-center' : 'justify-between'}`}>
          {collapsed ? (
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
              <span className="text-white font-bold text-sm">K5</span>
            </div>
          ) : (
            <>
              <div className="flex items-center space-x-3">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center flex-shrink-0">
                  <span className="text-white font-bold text-sm">K5</span>
                </div>
                <div>
                  <h1 className="text-sm font-bold text-gray-900 leading-tight">KRISMA</h1>
                  <p className="text-[10px] text-gray-400 font-medium">Dashboard</p>
                </div>
              </div>
              <button
                onClick={onToggleCollapse}
                className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors hidden lg:flex"
                title="Collapse sidebar"
              >
                <PanelLeftClose size={18} />
              </button>
            </>
          )}
        </div>

        {/* Collapse expand button (when collapsed) */}
        {collapsed && (
          <button
            onClick={onToggleCollapse}
            className="mt-3 w-full p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors hidden lg:flex justify-center"
            title="Expand sidebar"
          >
            <PanelLeftOpen size={18} />
          </button>
        )}
      </div>

      {/* Navigation */}
      <nav className={`flex-1 overflow-y-auto ${collapsed ? 'p-2' : 'p-3'} space-y-0.5`}>
        {menuGroups.map(renderGroup)}
      </nav>

      {/* Footer */}
      <div className="border-t border-gray-100">
        {/* View website link */}
        <a
          href="/"
          target="_blank"
          rel="noopener noreferrer"
          className={`flex items-center text-gray-500 hover:text-gray-700 hover:bg-gray-50 transition-colors ${
            collapsed ? 'justify-center p-3' : 'px-5 py-2.5 space-x-3'
          }`}
          title={collapsed ? 'Lihat Website' : undefined}
        >
          <ExternalLink size={16} />
          {!collapsed && <span className="text-xs font-medium">Lihat Website</span>}
        </a>

        {/* User Info */}
        <div className={`border-t border-gray-100 ${collapsed ? 'p-2' : 'p-3'}`}>
          <Link
            to="/admin/profile"
            onClick={() => setIsMobileMenuOpen(false)}
            className={`flex items-center rounded-lg hover:bg-gray-50 transition-colors ${
              collapsed ? 'justify-center p-2' : 'p-2 space-x-3'
            }`}
            title={collapsed ? user?.name : undefined}
          >
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center flex-shrink-0">
              <span className="text-white text-xs font-semibold">
                {user?.name?.charAt(0).toUpperCase()}
              </span>
            </div>
            {!collapsed && (
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">{user?.name}</p>
                <p className="text-[11px] text-gray-400 truncate">{user?.role === 'administrator' ? 'Administrator' : 'Staff'}</p>
              </div>
            )}
          </Link>

          {/* Logout */}
          <button
            onClick={handleLogout}
            className={`flex items-center text-gray-400 hover:text-red-500 transition-colors rounded-lg w-full mt-1 ${
              collapsed ? 'justify-center p-2' : 'px-2 py-2 space-x-3'
            }`}
            title={collapsed ? 'Logout' : undefined}
          >
            <LogOut size={16} />
            {!collapsed && <span className="text-xs font-medium">Logout</span>}
          </button>
        </div>
      </div>
    </>
  );

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 rounded-lg bg-white shadow-lg border border-gray-200"
      >
        <svg className="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          {isMobileMenuOpen ? (
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          ) : (
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          )}
        </svg>
      </button>

      {/* Mobile Overlay */}
      {isMobileMenuOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/40 backdrop-blur-sm z-30"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed top-0 left-0 h-screen bg-white border-r border-gray-200 z-40
          transition-all duration-300 ease-in-out
          ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
          lg:translate-x-0 lg:static
          ${collapsed ? 'w-[68px]' : 'w-64'}
          flex flex-col
        `}
      >
        {sidebarContent}
      </aside>
    </>
  );
};

export default Sidebar;
