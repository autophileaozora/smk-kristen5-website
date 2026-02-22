import { useState, useEffect } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';

// Pages that render their own full-height layout (no TopBar, no padding wrapper)
const FULLSCREEN_ROUTES = [
  '/admin/articles',
  '/admin/custom-pages',
  '/admin/akademik',
  '/admin/kesiswaan',
  '/admin/kegiatan',
  '/admin/homepage',
  '/admin/pengaturan',
  '/admin/sistem',
];
import Sidebar from '../components/Sidebar';
import CommandPalette from '../components/CommandPalette';
import useAuthStore from '../store/authStore';

const DashboardLayout = () => {
  const { isAuthenticated } = useAuthStore();
  const location = useLocation();
  const isFullscreen = FULLSCREEN_ROUTES.some(
    route => location.pathname === route || location.pathname.startsWith(route + '/')
  );
  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => {
    return localStorage.getItem('sidebar-collapsed') === 'true';
  });
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);

  // Persist sidebar state
  const toggleSidebar = () => {
    setSidebarCollapsed((prev) => {
      localStorage.setItem('sidebar-collapsed', !prev);
      return !prev;
    });
  };

  // Ctrl+K shortcut
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setCommandPaletteOpen(true);
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <Sidebar collapsed={sidebarCollapsed} onToggleCollapse={toggleSidebar} />

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <main className={`flex-1 ${isFullscreen ? 'overflow-hidden' : 'overflow-y-auto'}`}>
          {isFullscreen ? (
            <div className="h-full">
              <Outlet />
            </div>
          ) : (
            <div className="px-4 py-6 lg:px-8">
              <Outlet />
            </div>
          )}
        </main>
      </div>

      {/* Command Palette */}
      <CommandPalette
        isOpen={commandPaletteOpen}
        onClose={() => setCommandPaletteOpen(false)}
      />
    </div>
  );
};

export default DashboardLayout;
