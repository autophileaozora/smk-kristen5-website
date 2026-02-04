import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useSchoolLogo } from '../hooks/useContact';
import api from '../services/api';

const Footer = () => {
  const { logo: schoolLogo } = useSchoolLogo();
  const [jurusans, setJurusans] = useState([]);
  const [socialMedia, setSocialMedia] = useState([]);
  const [contact, setContact] = useState(null);

  useEffect(() => {
    const fetchFooterData = async () => {
      try {
        const [jurusanRes, socialMediaRes, contactRes] = await Promise.all([
          api.get('/api/jurusan').catch(() => ({ data: { data: { jurusans: [] } } })),
          api.get('/api/social-media').catch(() => ({ data: { data: { socialMedia: [] } } })),
          api.get('/api/contact').catch(() => ({ data: { data: null } })),
        ]);

        setJurusans(jurusanRes.data.data?.jurusans || []);
        setSocialMedia(socialMediaRes.data.data?.socialMedia || []);
        setContact(contactRes.data.data || null);
      } catch (error) {
        console.error('Error fetching footer data:', error);
      }
    };

    fetchFooterData();
  }, []);

  return (
    <>
      <footer className="bg-gradient-to-r from-[#3F24D9] via-[#1e58c4] to-[#008FD7] text-white py-10 lg:py-16 px-4 lg:px-10">
        <div className="max-w-[1100px] mx-auto">
          <div className="flex flex-col lg:flex-row gap-8 lg:gap-16 mb-6">
            {/* Brand */}
            <div className="max-w-xs">
              <div className="flex items-center gap-3 mb-3">
                <img src={schoolLogo || '/logo.svg'} alt="Logo" className="w-12 h-12 object-contain" />
                <h2 className="russo text-xl lg:text-[22px] leading-tight text-[#f6efe4]">
                  SMK KRISTEN 5<br />KLATEN
                </h2>
              </div>
              <p className="text-xs leading-relaxed text-gray-100">
                {contact?.address || 'Jl. Opak, Metuk, Tegalyoso, Dusun 1, Tegalyoso, Kec. Klaten Sel., Kabupaten Klaten, Jawa Tengah 57424'}
              </p>
            </div>

            {/* Links */}
            <div className="flex-1 grid grid-cols-1 sm:grid-cols-3 gap-8 lg:gap-10">
              <div>
                <h3 className="text-xs font-bold text-[#f6efe4] mb-2">JURUSAN</h3>
                <ul className="list-disc pl-5">
                  {jurusans.length > 0 ? (
                    jurusans.map((jurusan, idx) => (
                      <li key={idx} className="text-xs leading-relaxed text-gray-200 font-medium">{jurusan.name}</li>
                    ))
                  ) : (
                    <>
                      <li className="text-xs leading-relaxed text-gray-200 font-medium">Teknik Komputer dan Jaringan</li>
                      <li className="text-xs leading-relaxed text-gray-200 font-medium">Akuntansi dan Keuangan Lembaga</li>
                      <li className="text-xs leading-relaxed text-gray-200 font-medium">Otomatisasi dan Tata Kelola Perkantoran</li>
                    </>
                  )}
                </ul>
              </div>

              <div>
                <h3 className="text-xs font-bold text-[#f6efe4] mb-2">Social Media</h3>
                <ul className="list-disc pl-5">
                  {socialMedia.length > 0 ? (
                    socialMedia.map((social, idx) => (
                      <li key={idx} className="text-xs leading-relaxed text-gray-200 font-medium">
                        <a href={social.url} target="_blank" rel="noopener noreferrer" className="hover:text-yellow-300 transition-colors">
                          {social.platform.toUpperCase()}
                        </a>
                      </li>
                    ))
                  ) : (
                    <>
                      <li className="text-xs leading-relaxed text-gray-200 font-medium">WHATSAPP</li>
                      <li className="text-xs leading-relaxed text-gray-200 font-medium">INSTAGRAM</li>
                      <li className="text-xs leading-relaxed text-gray-200 font-medium">FACEBOOK</li>
                      <li className="text-xs leading-relaxed text-gray-200 font-medium">YOUTUBE</li>
                    </>
                  )}
                </ul>
              </div>

              <div>
                <h3 className="text-xs font-bold text-[#f6efe4] mb-2">Link lainnya</h3>
                <ul className="list-disc pl-5">
                  <li className="text-xs leading-relaxed text-gray-200 font-medium">Lowongan Kerja</li>
                  <li className="text-xs leading-relaxed text-gray-200 font-medium">BKK Krisma</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="w-full h-px bg-white/30 my-5"></div>

          <div className="text-xs text-white font-medium text-center lg:text-left">
            © {new Date().getFullYear()} SMK Kristen 5 Klaten. All rights reserved.
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
