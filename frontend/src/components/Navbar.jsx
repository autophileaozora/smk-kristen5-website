import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useSchoolLogo } from '../hooks/useContact';

const Navbar = ({ activePage = '', visible = true, className = '' }) => {
  const { logo: schoolLogo } = useSchoolLogo();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const isActive = (page) => activePage === page;

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-transform duration-300 ${!visible ? '-translate-y-full' : 'translate-y-0'} bg-[rgba(46,65,228,0.9)] shadow-lg backdrop-blur-sm ${className}`}>
      <div className="max-w-[1400px] mx-auto px-6 lg:px-16 py-4">
        <div className="flex justify-between items-center">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3">
            <img src={schoolLogo || '/logo.svg'} alt="Logo" className="w-10 h-10 object-contain" />
            <div className="text-white">
              <p className="text-[8px] leading-tight tracking-wider uppercase">Sekolah Menengah Kejuruan</p>
              <h1 className="russo text-base leading-tight text-yellow-300">KRISTEN 5 KLATEN</h1>
            </div>
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex gap-8 text-white text-sm">
            <Link
              to="/"
              className={isActive('beranda') ? 'font-bold text-yellow-300' : 'hover:font-bold hover:text-yellow-300 transition-all'}
            >
              Beranda
            </Link>
            <Link
              to="/jurusan"
              className={isActive('jurusan') ? 'font-bold text-yellow-300' : 'hover:font-bold hover:text-yellow-300 transition-all'}
            >
              Jurusan
            </Link>
            <Link
              to="/artikel"
              className={isActive('artikel') ? 'font-bold text-yellow-300' : 'hover:font-bold hover:text-yellow-300 transition-all'}
            >
              Artikel
            </Link>
            <Link
              to="/kontak"
              className={isActive('kontak') ? 'font-bold text-yellow-300' : 'hover:font-bold hover:text-yellow-300 transition-all'}
            >
              Kontak
            </Link>
          </div>

          {/* Right Side */}
          <div className="flex items-center gap-3 md:gap-5">
            <Link to="/search" className="hover:opacity-80 transition-opacity">
              <svg className="w-4 h-4 md:w-5 md:h-5 text-white" viewBox="0 0 25 25" fill="currentColor">
                <path d="M24.6582 21.6162L19.79 16.748C19.5703 16.5283 19.2725 16.4062 18.96 16.4062H18.1641C19.5117 14.6826 20.3125 12.5146 20.3125 10.1562C20.3125 4.5459 15.7666 0 10.1562 0C4.5459 0 0 4.5459 0 10.1562C0 15.7666 4.5459 20.3125 10.1562 20.3125C12.5146 20.3125 14.6826 19.5117 16.4062 18.1641V18.96C16.4062 19.2725 16.5283 19.5703 16.748 19.79L21.6162 24.6582C22.0752 25.1172 22.8174 25.1172 23.2715 24.6582L24.6533 23.2764C25.1123 22.8174 25.1123 22.0752 24.6582 21.6162ZM10.1562 16.4062C6.7041 16.4062 3.90625 13.6133 3.90625 10.1562C3.90625 6.7041 6.69922 3.90625 10.1562 3.90625C13.6084 3.90625 16.4062 6.69922 16.4062 10.1562C16.4062 13.6084 13.6133 16.4062 10.1562 16.4062Z"/>
              </svg>
            </Link>
            <button className="hidden md:block bg-transparent text-yellow-300 px-7 py-3 rounded-full text-xs font-semibold border-2 border-yellow-300 tracking-wide hover:bg-yellow-300/15 transition-all duration-300">
              PENDAFTARAN
            </button>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden flex flex-col gap-[5px] p-2 z-[1001]"
            >
              <span className={`w-6 h-[3px] bg-white rounded transition-all ${isMobileMenuOpen ? 'rotate-45 translate-y-2' : ''}`}></span>
              <span className={`w-6 h-[3px] bg-white rounded transition-all ${isMobileMenuOpen ? 'opacity-0' : ''}`}></span>
              <span className={`w-6 h-[3px] bg-white rounded transition-all ${isMobileMenuOpen ? '-rotate-45 -translate-y-2' : ''}`}></span>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <div className={`md:hidden fixed top-0 right-0 h-screen w-72 bg-[rgba(46,65,228,0.95)] backdrop-blur-2xl shadow-2xl transition-transform duration-300 z-[1000] ${isMobileMenuOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        <div className="flex flex-col gap-0 pt-20 px-8">
          <Link
            to="/"
            className={`${isActive('beranda') ? 'text-yellow-300 font-bold' : 'text-white hover:text-yellow-300 hover:font-bold hover:pl-3'} py-4 border-b border-white/10 text-sm transition-all`}
          >
            Beranda
          </Link>
          <Link
            to="/jurusan"
            className={`${isActive('jurusan') ? 'text-yellow-300 font-bold' : 'text-white hover:text-yellow-300 hover:font-bold hover:pl-3'} py-4 border-b border-white/10 text-sm transition-all`}
          >
            Jurusan
          </Link>
          <Link
            to="/artikel"
            className={`${isActive('artikel') ? 'text-yellow-300 font-bold' : 'text-white hover:text-yellow-300 hover:font-bold hover:pl-3'} py-4 border-b border-white/10 text-sm transition-all`}
          >
            Artikel
          </Link>
          <Link
            to="/kontak"
            className={`${isActive('kontak') ? 'text-yellow-300 font-bold' : 'text-white hover:text-yellow-300 hover:font-bold hover:pl-3'} py-4 border-b border-white/10 text-sm transition-all`}
          >
            Kontak
          </Link>
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
