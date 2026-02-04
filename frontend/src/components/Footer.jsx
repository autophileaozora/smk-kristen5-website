import { Link } from 'react-router-dom';
import { useSchoolLogo } from '../hooks/useContact';

const Footer = () => {
  const { logo: schoolLogo } = useSchoolLogo();

  return (
    <>
      <footer className="bg-gradient-to-br from-gray-900 to-gray-800 text-white py-12 px-5">
        <div className="max-w-[1400px] mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
            {/* School Info */}
            <div>
              <div className="flex items-center gap-3 mb-4">
                <img src={schoolLogo || '/logo.svg'} alt="Logo" className="w-12 h-12 object-contain" />
                <div>
                  <h3 className="russo text-lg text-yellow-300">SMK KRISTEN 5 KLATEN</h3>
                  <p className="text-xs text-gray-400">Sekolah Menengah Kejuruan</p>
                </div>
              </div>
              <p className="text-sm text-gray-300 leading-relaxed">
                Menyiapkan siswa masuk dunia kerja dengan kurikulum berbasis industri dan pembinaan karakter.
              </p>
            </div>

            {/* Quick Links */}
            <div>
              <h4 className="font-bold text-lg mb-4 text-yellow-300">Link Cepat</h4>
              <ul className="space-y-2 text-sm">
                <li><Link to="/" className="text-gray-300 hover:text-yellow-300 transition-colors">Beranda</Link></li>
                <li><Link to="/jurusan" className="text-gray-300 hover:text-yellow-300 transition-colors">Jurusan</Link></li>
                <li><Link to="/artikel" className="text-gray-300 hover:text-yellow-300 transition-colors">Artikel</Link></li>
                <li><Link to="/kontak" className="text-gray-300 hover:text-yellow-300 transition-colors">Kontak</Link></li>
              </ul>
            </div>

            {/* Contact Info */}
            <div>
              <h4 className="font-bold text-lg mb-4 text-yellow-300">Hubungi Kami</h4>
              <div className="space-y-2 text-sm text-gray-300">
                <p>Jl. Merbabu No.11, Klaten</p>
                <p>Email: info@smkkristen5klaten.sch.id</p>
                <p>Telp: (0272) 321234</p>
              </div>
            </div>
          </div>

          <div className="border-t border-gray-700 pt-6 text-center">
            <p className="text-sm text-gray-400">
              &copy; {new Date().getFullYear()} SMK Kristen 5 Klaten. All rights reserved.
            </p>
          </div>
        </div>
      </footer>

      {/* Russo One Font */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Russo+One&display=swap');
        .russo {
          font-family: 'Russo One', sans-serif;
          font-weight: 400;
        }
      `}</style>
    </>
  );
};

export default Footer;
