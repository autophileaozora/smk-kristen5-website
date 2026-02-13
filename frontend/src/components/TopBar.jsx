import { useLocation, Link } from 'react-router-dom';
import { ChevronRight, Search } from 'lucide-react';

// Route label mapping
const routeLabels = {
  'admin': 'Admin',
  'dashboard': 'Dashboard',
  'articles': 'Artikel',
  'my-articles': 'Artikel Saya',
  'custom-pages': 'Halaman Kustom',
  'akademik': 'Jurusan & Mapel',
  'kesiswaan': 'Kesiswaan',
  'kegiatan': 'Kegiatan & Agenda',
  'homepage': 'Homepage',
  'pengaturan': 'Pengaturan',
  'sistem': 'User & Log',
  'profile': 'Profil',
};

// Page title mapping (more descriptive)
const pageTitles = {
  '/admin/dashboard': 'Dashboard',
  '/admin/articles': 'Kelola Artikel',
  '/admin/my-articles': 'Artikel Saya',
  '/admin/custom-pages': 'Halaman Kustom',
  '/admin/akademik': 'Jurusan & Mata Pelajaran',
  '/admin/kesiswaan': 'Kesiswaan',
  '/admin/kegiatan': 'Kegiatan & Agenda',
  '/admin/homepage': 'Kelola Homepage',
  '/admin/pengaturan': 'Pengaturan',
  '/admin/sistem': 'User & Log',
  '/admin/profile': 'Profil Saya',
};

const TopBar = ({ onOpenCommandPalette }) => {
  const location = useLocation();

  // Build breadcrumb from path
  const pathSegments = location.pathname.split('/').filter(Boolean);
  const breadcrumbs = pathSegments.map((segment, index) => {
    const path = '/' + pathSegments.slice(0, index + 1).join('/');
    const label = routeLabels[segment] || segment;
    const isLast = index === pathSegments.length - 1;
    return { label, path, isLast };
  }).filter((b) => b.label !== 'Admin'); // Remove "Admin" from breadcrumb

  const pageTitle = pageTitles[location.pathname] || breadcrumbs[breadcrumbs.length - 1]?.label || 'Dashboard';

  return (
    <div className="bg-white border-b border-gray-200 sticky top-0 z-20">
      <div className="flex items-center justify-between px-6 lg:px-8 h-14">
        {/* Left: Breadcrumb */}
        <div className="flex flex-col justify-center min-w-0">
          <h1 className="text-lg font-semibold text-gray-900 truncate leading-tight">
            {pageTitle}
          </h1>
          <nav className="flex items-center space-x-1 text-xs text-gray-400 -mt-0.5">
            {breadcrumbs.map((crumb, index) => (
              <span key={crumb.path} className="flex items-center">
                {index > 0 && <ChevronRight size={12} className="mx-1 flex-shrink-0" />}
                {crumb.isLast ? (
                  <span className="text-gray-600 font-medium truncate">{crumb.label}</span>
                ) : (
                  <Link to={crumb.path} className="hover:text-blue-600 transition-colors truncate">
                    {crumb.label}
                  </Link>
                )}
              </span>
            ))}
          </nav>
        </div>

        {/* Right: Search shortcut */}
        <button
          onClick={onOpenCommandPalette}
          className="hidden sm:flex items-center space-x-3 px-3 py-1.5 text-sm text-gray-400 bg-gray-50 border border-gray-200 rounded-lg hover:bg-gray-100 hover:text-gray-600 transition-colors"
        >
          <Search size={14} />
          <span>Cari menu...</span>
          <kbd className="hidden md:inline-flex items-center px-1.5 py-0.5 text-[10px] font-medium text-gray-400 bg-white border border-gray-200 rounded">
            Ctrl+K
          </kbd>
        </button>
      </div>
    </div>
  );
};

export default TopBar;
