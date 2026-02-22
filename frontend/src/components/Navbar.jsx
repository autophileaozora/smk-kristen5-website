import { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useSchoolLogo } from '../hooks/useContact';
import api from '../services/api';

const Navbar = ({ activePage = '', visible = true, className = '' }) => {
  const { logo: schoolLogo } = useSchoolLogo();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [menuItems, setMenuItems] = useState([]);
  const [openDropdown, setOpenDropdown] = useState(null);
  const [mobileOpenDropdown, setMobileOpenDropdown] = useState(null);
  const navRef = useRef(null);
  const location = useLocation();
  const navigate = useNavigate();

  // Default menu items as fallback
  const defaultMenuItems = [
    { _id: '1', label: 'Beranda', url: '/', isDropdown: false, children: [] },
    {
      _id: '2',
      label: 'Profil',
      url: '/page/profil',
      isDropdown: true,
      children: [
        { _id: 'profil-1', label: 'Sejarah', url: '/page/profil', target: '_self' },
        { _id: 'profil-2', label: 'Visi & Misi', url: '/page/profil#visi-misi', target: '_self' },
        { _id: 'profil-3', label: 'Sambutan Kepala Sekolah', url: '/page/profil#sambutan-kepala-sekolah', target: '_self' },
        { _id: 'profil-4', label: 'Tentang Kami', url: '/page/profil#tentang-kami', target: '_self' },
      ]
    },
    { _id: '3', label: 'Jurusan', url: '/jurusan', isDropdown: false, children: [] },
    {
      _id: '4',
      label: 'Informasi',
      url: '/artikel',
      isDropdown: true,
      children: [
        { _id: 'info-1', label: 'Prestasi', url: '/artikel?topik=prestasi', target: '_self' },
        { _id: 'info-2', label: 'Kegiatan', url: '/artikel?topik=kegiatan', target: '_self' },
        { _id: 'info-3', label: 'Semua Artikel', url: '/artikel', target: '_self' },
      ]
    },
    { _id: '5', label: 'Kontak', url: '/kontak', isDropdown: false, children: [] },
  ];

  // Fetch menu items from API and inject dynamic Jurusan data
  useEffect(() => {
    const fetchMenu = async () => {
      try {
        // Fetch navbar menu and jurusan data in parallel
        const [navbarRes, jurusanRes] = await Promise.all([
          api.get('/api/navbar'),
          api.get('/api/jurusan').catch(() => ({ data: { data: { jurusans: [] } } })),
        ]);

        let menu = defaultMenuItems;
        if (navbarRes.data.success && navbarRes.data.data.menu?.length > 0) {
          menu = navbarRes.data.data.menu;
        }

        // Get active jurusan list
        const jurusans = jurusanRes.data.data?.jurusans || [];
        const activeJurusans = jurusans.filter((j) => j.isActive !== false);

        // Inject jurusan as children into Jurusan menu item
        const updatedMenu = menu.map((item) => {
          if (item.label.toLowerCase() === 'jurusan' && activeJurusans.length > 0) {
            return {
              ...item,
              isDropdown: true,
              children: activeJurusans.map((jurusan, idx) => ({
                _id: jurusan._id || `jurusan-${idx}`,
                label: jurusan.shortName || jurusan.name,
                url: `/jurusan/${jurusan.slug || jurusan._id}`,
                target: '_self',
                order: idx + 1,
              })),
            };
          }
          return item;
        });

        setMenuItems(updatedMenu);
      } catch (error) {
        console.error('Failed to fetch navbar:', error);
        setMenuItems(defaultMenuItems);
      }
    };
    fetchMenu();
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      // Check if click is outside the entire nav
      if (navRef.current && !navRef.current.contains(event.target)) {
        setOpenDropdown(null);
      }
    };
    // Use 'click' instead of 'mousedown' to allow Link navigation to complete first
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  // Check if current path matches
  const isActive = (url) => {
    if (url === '/') return location.pathname === '/';
    return location.pathname.startsWith(url);
  };

  // Regular menu items (non-button)
  const regularItems = menuItems.filter((item) => !item.isButton);
  // Button items
  const buttonItems = menuItems.filter((item) => item.isButton);

  const renderMenuItem = (item, isMobile = false) => {
    const hasChildren = item.children && item.children.length > 0;
    const active = isActive(item.url);

    if (isMobile) {
      // Mobile item WITH children - toggleable dropdown
      if (hasChildren) {
        return (
          <div key={item._id}>
            <button
              onClick={() => setMobileOpenDropdown(mobileOpenDropdown === item._id ? null : item._id)}
              className={`${
                active ? 'text-yellow-300 font-bold' : 'text-white hover:text-yellow-300'
              } py-4 border-b border-white/10 text-sm transition-all w-full text-left flex justify-between items-center`}
            >
              <span>
                {item.icon && <span className="mr-2">{item.icon}</span>}
                {item.label}
              </span>
              <svg
                className={`w-4 h-4 transition-transform ${mobileOpenDropdown === item._id ? 'rotate-180' : ''}`}
                fill="none" stroke="currentColor" viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            {/* Mobile submenu - toggleable */}
            {mobileOpenDropdown === item._id && (
              <div className="pl-4 bg-white/5">
                {item.children.map((child) => (
                  <button
                    key={child._id}
                    onClick={() => {
                      setIsMobileMenuOpen(false);
                      setMobileOpenDropdown(null);
                      if (child.url.startsWith('http')) {
                        window.open(child.url, child.target || '_blank');
                      } else {
                        navigate(child.url);
                      }
                    }}
                    className={`${
                      isActive(child.url)
                        ? 'text-yellow-300 font-bold'
                        : 'text-white/80 hover:text-yellow-300'
                    } py-3 border-b border-white/5 text-sm transition-all block w-full text-left`}
                  >
                    ↳ {child.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        );
      }

      // Mobile item WITHOUT children - simple link
      return (
        <div key={item._id}>
          <Link
            to={item.url}
            onClick={() => { setIsMobileMenuOpen(false); setMobileOpenDropdown(null); }}
            className={`${
              active ? 'text-yellow-300 font-bold' : 'text-white hover:text-yellow-300 hover:pl-3'
            } py-4 border-b border-white/10 text-sm transition-all block`}
          >
            {item.icon && <span className="mr-2">{item.icon}</span>}
            {item.label}
          </Link>
        </div>
      );
    }

    // Desktop menu item
    if (hasChildren) {
      return (
        <div key={item._id} className="relative">
          <button
            onClick={() => setOpenDropdown(openDropdown === item._id ? null : item._id)}
            className={`${
              active ? 'font-bold text-yellow-300' : 'hover:text-yellow-300'
            } transition-all flex items-center gap-1 bg-transparent`}
            style={{ outline: 'none', border: 'none', boxShadow: 'none' }}
          >
            {item.icon && <span className="mr-1">{item.icon}</span>}
            {item.label}
            <svg
              className={`w-4 h-4 transition-transform ${openDropdown === item._id ? 'rotate-180' : ''}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {/* Dropdown */}
          {openDropdown === item._id && (
            <div className="absolute top-full left-0 mt-2 bg-white rounded-lg shadow-xl py-2 min-w-[180px] z-50">
              {item.children.map((child) => (
                <button
                  key={child._id}
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setOpenDropdown(null);
                    // Handle external links
                    if (child.url.startsWith('http')) {
                      window.open(child.url, child.target || '_blank');
                    } else {
                      navigate(child.url);
                    }
                  }}
                  className={`block w-full text-left px-4 py-2 text-sm ${
                    isActive(child.url)
                      ? 'bg-primary-50 text-primary-700 font-medium'
                      : 'text-gray-700 hover:bg-gray-50'
                  } transition-colors`}
                >
                  {child.icon && <span className="mr-2">{child.icon}</span>}
                  {child.label}
                </button>
              ))}
            </div>
          )}
        </div>
      );
    }

    return (
      <Link
        key={item._id}
        to={item.url}
        target={item.target}
        className={`${
          active ? 'font-bold text-yellow-300' : 'hover:text-yellow-300'
        } transition-all`}
      >
        {item.icon && <span className="mr-1">{item.icon}</span>}
        {item.label}
      </Link>
    );
  };

  return (
    <nav
      ref={navRef}
      className={`fixed top-0 left-0 right-0 z-50 transition-transform duration-300 ${
        !visible ? '-translate-y-full' : 'translate-y-0'
      } bg-[rgba(46,65,228,0.9)] shadow-lg backdrop-blur-sm ${className}`}
    >
      <div className="max-w-[1400px] mx-auto px-6 lg:px-16 py-4">
        <div className="flex justify-between items-center">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3">
            <img src={schoolLogo || '/logo.svg'} alt="Logo" className="w-10 h-10 object-contain" />
            <div className="text-white">
              <p className="text-[8px] leading-tight tracking-wider uppercase">
                Sekolah Menengah Kejuruan
              </p>
              <h1 className="russo text-base leading-tight text-yellow-300">KRISTEN 5 KLATEN</h1>
            </div>
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex gap-8 text-white text-sm items-center">
            {regularItems.map((item) => renderMenuItem(item))}
          </div>

          {/* Right Side */}
          <div className="flex items-center gap-3 md:gap-5">
            {/* Search — desktop only */}
            <Link to="/search" className="hidden md:block hover:opacity-80 transition-opacity">
              <svg className="w-5 h-5 text-white" viewBox="0 0 25 25" fill="currentColor">
                <path d="M24.6582 21.6162L19.79 16.748C19.5703 16.5283 19.2725 16.4062 18.96 16.4062H18.1641C19.5117 14.6826 20.3125 12.5146 20.3125 10.1562C20.3125 4.5459 15.7666 0 10.1562 0C4.5459 0 0 4.5459 0 10.1562C0 15.7666 4.5459 20.3125 10.1562 20.3125C12.5146 20.3125 14.6826 19.5117 16.4062 18.1641V18.96C16.4062 19.2725 16.5283 19.5703 16.748 19.79L21.6162 24.6582C22.0752 25.1172 22.8174 25.1172 23.2715 24.6582L24.6533 23.2764C25.1123 22.8174 25.1123 22.0752 24.6582 21.6162ZM10.1562 16.4062C6.7041 16.4062 3.90625 13.6133 3.90625 10.1562C3.90625 6.7041 6.69922 3.90625 10.1562 3.90625C13.6084 3.90625 16.4062 6.69922 16.4062 10.1562C16.4062 13.6084 13.6133 16.4062 10.1562 16.4062Z" />
              </svg>
            </Link>

            {/* Button Items (e.g., PENDAFTARAN) - only from API, no fallback */}
            {buttonItems.map((item) => (
              <Link
                key={item._id}
                to={item.url}
                target={item.target}
                className="hidden md:block bg-transparent text-yellow-300 px-7 py-3 rounded-full text-xs font-semibold border-2 border-yellow-300 tracking-wide hover:bg-yellow-300/15 transition-all duration-300"
              >
                {item.label}
              </Link>
            ))}

            {/* Mobile Menu Button */}
            <button
              onClick={() => { setIsMobileMenuOpen(!isMobileMenuOpen); if (isMobileMenuOpen) setMobileOpenDropdown(null); }}
              className="md:hidden flex flex-col gap-[5px] p-2 z-[1001]"
            >
              <span
                className={`w-6 h-[3px] bg-white rounded transition-all ${
                  isMobileMenuOpen ? 'rotate-45 translate-y-2' : ''
                }`}
              ></span>
              <span
                className={`w-6 h-[3px] bg-white rounded transition-all ${
                  isMobileMenuOpen ? 'opacity-0' : ''
                }`}
              ></span>
              <span
                className={`w-6 h-[3px] bg-white rounded transition-all ${
                  isMobileMenuOpen ? '-rotate-45 -translate-y-2' : ''
                }`}
              ></span>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <div
        className={`md:hidden fixed top-0 right-0 h-screen w-72 bg-[rgba(46,65,228,0.95)] backdrop-blur-2xl shadow-2xl transition-transform duration-300 z-[1000] overflow-y-auto ${
          isMobileMenuOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="flex flex-col gap-0 pt-20 px-8">
          {menuItems.map((item) => renderMenuItem(item, true))}

          {/* Mobile button items */}
          {buttonItems.map((item) => (
            <Link
              key={item._id}
              to={item.url}
              onClick={() => setIsMobileMenuOpen(false)}
              className="mt-6 text-center bg-transparent text-yellow-300 px-6 py-3 rounded-full text-sm font-semibold border-2 border-yellow-300 tracking-wide hover:bg-yellow-300/15 transition-all"
            >
              {item.label}
            </Link>
          ))}

          {/* Mobile: Search */}
          <div className="mt-6">
            <Link
              to="/search"
              onClick={() => setIsMobileMenuOpen(false)}
              className="flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 text-white px-4 py-3 rounded-full text-sm font-semibold transition-all border border-white/20"
            >
              <svg className="w-4 h-4" viewBox="0 0 25 25" fill="currentColor">
                <path d="M24.6582 21.6162L19.79 16.748C19.5703 16.5283 19.2725 16.4062 18.96 16.4062H18.1641C19.5117 14.6826 20.3125 12.5146 20.3125 10.1562C20.3125 4.5459 15.7666 0 10.1562 0C4.5459 0 0 4.5459 0 10.1562C0 15.7666 4.5459 20.3125 10.1562 20.3125C12.5146 20.3125 14.6826 19.5117 16.4062 18.1641V18.96C16.4062 19.2725 16.5283 19.5703 16.748 19.79L21.6162 24.6582C22.0752 25.1172 22.8174 25.1172 23.2715 24.6582L24.6533 23.2764C25.1123 22.8174 25.1123 22.0752 24.6582 21.6162ZM10.1562 16.4062C6.7041 16.4062 3.90625 13.6133 3.90625 10.1562C3.90625 6.7041 6.69922 3.90625 10.1562 3.90625C13.6084 3.90625 16.4062 6.69922 16.4062 10.1562C16.4062 13.6084 13.6133 16.4062 10.1562 16.4062Z" />
              </svg>
              <span>Cari</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Russo One Font */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Russo+One&display=swap');
        .russo {
          font-family: 'Russo One', sans-serif;
          font-weight: 400;
        }
      `}</style>
    </nav>
  );
};

export default Navbar;
