import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import useAuthStore from '../store/authStore';
import api from '../services/api';

const Sidebar = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [pendingArticlesCount, setPendingArticlesCount] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const location = useLocation();
  const navigate = useNavigate();
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
    // Refresh count every 30 seconds
    const interval = setInterval(fetchPendingCount, 30000);
    return () => clearInterval(interval);
  }, [user]);

  // Navigation items based on role
  const navigationItems = user?.role === 'administrator' ? [
    { name: 'Dashboard', path: '/admin/dashboard', icon: '📊' },
    { name: 'Artikel', path: '/admin/articles', icon: '📝', badge: pendingArticlesCount },
    { name: 'Running Text', path: '/admin/running-text', icon: '📢' },
    { name: 'Prestasi', path: '/admin/prestasi', icon: '🏆' },
    { name: 'Jurusan', path: '/admin/jurusan', icon: '🎓' },
    { name: 'Mata Pelajaran', path: '/admin/mata-pelajaran', icon: '📚' },
    { name: 'Fasilitas', path: '/admin/fasilitas', icon: '🏢' },
    { name: 'Ekskul', path: '/admin/ekskul', icon: '⚽' },
    { name: 'Alumni', path: '/admin/alumni', icon: '👥' },
    { name: 'Video Hero', path: '/admin/video-hero', icon: '🎬' },
    { name: 'Kategori', path: '/admin/categories', icon: '📁' },
    { name: 'Manajemen User', path: '/admin/users', icon: '👤' },
    { name: 'Audit Log', path: '/admin/audit-logs', icon: '📋' },
    { name: 'Kontak', path: '/admin/kontak', icon: '📞' },
  ] : [
    { name: 'Dashboard', path: '/admin/dashboard', icon: '📊' },
    { name: 'Artikel Saya', path: '/admin/my-articles', icon: '📝' },
    { name: 'Running Text', path: '/admin/running-text', icon: '📢' },
    { name: 'Prestasi', path: '/admin/prestasi', icon: '🏆' },
  ];

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 rounded-md bg-white shadow-lg"
      >
        <svg
          className="w-6 h-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          {isMobileMenuOpen ? (
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          ) : (
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 6h16M4 12h16M4 18h16"
            />
          )}
        </svg>
      </button>

      {/* Overlay for mobile */}
      {isMobileMenuOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-30"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed top-0 left-0 h-screen bg-white shadow-lg z-40
          transition-transform duration-300 ease-in-out
          ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
          lg:translate-x-0 lg:static
          w-64 flex flex-col
        `}
      >
        {/* Logo/Header */}
        <div className="p-6 border-b border-gray-200">
          <h1 className="text-xl font-bold text-primary-600">
            {user?.role === 'administrator' ? 'KRISMA DASHBOARD' : 'SMK Kristen 5 Klaten'}
          </h1>
          {user?.role !== 'administrator' && (
            <p className="text-sm text-gray-500 mt-1">Admin Siswa</p>
          )}
          {user?.role === 'administrator' && (
            <div className="mt-3">
              <input
                type="text"
                placeholder="Cari menu atau pengaturan..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto p-4 space-y-1">
          {navigationItems
            .filter(item => item.name.toLowerCase().includes(searchQuery.toLowerCase()))
            .map((item) => (
            <Link
              key={item.path}
              to={item.path}
              onClick={() => setIsMobileMenuOpen(false)}
              className={`
                flex items-center justify-between px-4 py-3 rounded-lg
                transition-colors duration-200
                ${
                  isActive(item.path)
                    ? 'bg-primary-50 text-primary-700'
                    : 'text-gray-700 hover:bg-gray-50'
                }
              `}
            >
              <div className="flex items-center space-x-3">
                <span className="text-xl">{item.icon}</span>
                <span className="font-medium">{item.name}</span>
              </div>
              {item.badge > 0 && (
                <span className="inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white bg-red-500 rounded-full">
                  {item.badge}
                </span>
              )}
            </Link>
          ))}
        </nav>

        {/* Footer Actions */}
        <div className="border-t border-gray-200">
          {/* User Info with Settings Icon */}
          <Link
            to="/admin/profile"
            onClick={() => setIsMobileMenuOpen(false)}
            className="p-4 flex items-center justify-between hover:bg-gray-50 transition-colors cursor-pointer group"
          >
            <div className="flex items-center space-x-3 flex-1 min-w-0">
              <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center flex-shrink-0">
                <span className="text-primary-600 font-semibold">
                  {user?.name?.charAt(0).toUpperCase()}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {user?.name}
                </p>
                <p className="text-xs text-gray-500 truncate">
                  {user?.email}
                </p>
              </div>
            </div>
            {/* Settings Icon */}
            <div className="ml-2 p-2 rounded-lg group-hover:bg-gray-100 transition-colors">
              <svg className="w-5 h-5 text-gray-600 group-hover:text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
          </Link>

          {/* Logout Button */}
          <div className="p-4 pt-0">
            <button
              onClick={handleLogout}
              className="w-full flex items-center justify-center space-x-3 px-4 py-3 rounded-lg text-red-600 hover:bg-red-50 transition-colors"
            >
              <span className="text-xl">🚪</span>
              <span className="font-medium">Logout</span>
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
