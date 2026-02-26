import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useSchoolLogo } from '../hooks/useContact';
import { useSchoolProfile } from '../contexts/SchoolProfileContext';
import api from '../services/api';

const Footer = () => {
  const { logo: schoolLogo } = useSchoolLogo();
  const { contact, socialMedia: contextSocialMedia } = useSchoolProfile();
  const [columns, setColumns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [siteSettings, setSiteSettings] = useState({});

  // Fallback data for backwards compatibility
  const [jurusans, setJurusans] = useState([]);

  useEffect(() => {
    const fetchFooterData = async () => {
      try {
        // Try to fetch dynamic footer columns first
        const [footerRes, settingsRes] = await Promise.all([
          api.get('/api/footer').catch(() => ({ data: { data: { columns: [] } } })),
          api.get('/api/site-settings').catch(() => ({ data: { data: {} } })),
        ]);
        const footerColumns = footerRes.data.data?.columns || [];
        setSiteSettings(settingsRes.data.data?.settings || {});

        if (footerColumns.length > 0) {
          setColumns(footerColumns);
        } else {
          // Fallback: only fetch jurusan (social-media comes from context)
          const jurusanRes = await api.get('/api/jurusan').catch(() => ({ data: { data: { jurusans: [] } } }));
          setJurusans(jurusanRes.data.data?.jurusans || []);
        }
      } catch (error) {
        console.error('Error fetching footer data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchFooterData();
  }, []);

  // Icon components
  const getIcon = (iconName) => {
    const icons = {
      whatsapp: (
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
        </svg>
      ),
      instagram: (
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
        </svg>
      ),
      facebook: (
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
        </svg>
      ),
      youtube: (
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
          <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
        </svg>
      ),
      twitter: (
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
        </svg>
      ),
      tiktok: (
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z" />
        </svg>
      ),
      linkedin: (
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
          <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
        </svg>
      ),
      email: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
      ),
      phone: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
        </svg>
      ),
      location: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      ),
    };
    return icons[iconName] || null;
  };

  // Render item based on type
  const renderItem = (item) => {
    const content = (
      <span className="flex items-center gap-2">
        {item.icon && <span className="text-white/70">{getIcon(item.icon)}</span>}
        <span>{item.content}</span>
      </span>
    );

    if (item.type === 'link' || item.type === 'icon-link') {
      const isExternal = item.url?.startsWith('http');
      if (isExternal) {
        return (
          <a
            href={item.url}
            target={item.target || '_blank'}
            rel="noopener noreferrer"
            className="hover:text-yellow-300 transition-colors"
          >
            {content}
          </a>
        );
      }
      return (
        <Link to={item.url || '#'} className="hover:text-yellow-300 transition-colors">
          {content}
        </Link>
      );
    }

    return content;
  };

  // Dynamic footer with columns from API
  const renderDynamicFooter = () => {
    const activeColumns = columns.filter((col) => col.isActive).sort((a, b) => a.order - b.order);

    // Build grid template from column widths
    const gridTemplate = activeColumns
      .map((col) => {
        const w = col.width === 'auto' ? 1 : parseInt(col.width) || 1;
        return `${w}fr`;
      })
      .join(' ');

    return (
      <div className="mb-6">
        <style>{`
          @media (min-width: 1024px) {
            .footer-dynamic-grid {
              grid-template-columns: ${gridTemplate} !important;
            }
          }
        `}</style>
        <div className="footer-dynamic-grid grid grid-cols-1 sm:grid-cols-2 gap-8 lg:gap-10">
          {activeColumns.map((column) => (
            <div key={column._id} className="sm:col-span-1">
                {/* Logo Column */}
                {column.type === 'logo' ? (
                  <div>
                    <div className="flex items-center gap-3 mb-3">
                      <img src={schoolLogo || '/logo.svg'} alt="Logo" className="w-12 h-12 object-contain" />
                      {column.showTitle && (
                        <h2 className="russo text-xl lg:text-[22px] leading-tight text-[#f6efe4]">
                          {column.title.split(' ').slice(0, 2).join(' ')}<br/>
                          {column.title.split(' ').slice(2).join(' ')}
                        </h2>
                      )}
                    </div>
                    {column.description && (
                      <p className="text-xs leading-relaxed text-gray-100">{column.description}</p>
                    )}
                  </div>
                ) : (
                  /* Other Column Types */
                  <div>
                    {column.showTitle && (
                      <h3 className="text-xs font-bold text-[#f6efe4] mb-3 uppercase tracking-wider">
                        {column.title}
                      </h3>
                    )}
                    {column.items && column.items.length > 0 && (
                      <ul className={`${column.showBullets !== false ? 'list-disc pl-5' : 'list-none pl-0'} space-y-1`}>
                        {column.items
                          .sort((a, b) => a.order - b.order)
                          .map((item, idx) => (
                            <li key={item._id || idx} className="text-xs leading-relaxed text-gray-200 font-medium">
                              {renderItem(item)}
                            </li>
                          ))}
                      </ul>
                    )}
                  </div>
                )}
            </div>
          ))}
        </div>
      </div>
    );
  };

  // Static fallback footer
  const renderStaticFooter = () => (
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
            {contextSocialMedia.length > 0 ? (
              contextSocialMedia.map((social, idx) => (
                <li key={idx} className="text-xs leading-relaxed text-gray-200 font-medium">
                  <a href={social.url} target="_blank" rel="noopener noreferrer" className="hover:text-yellow-300 transition-colors">
                    {social.platform?.toUpperCase() || social.name?.toUpperCase() || 'SOCIAL MEDIA'}
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
  );

  return (
    <>
      <footer className="bg-gradient-to-r from-[#3F24D9] via-[#1e58c4] to-[#008FD7] text-white py-10 lg:py-16">
        <div className="max-w-[1400px] mx-auto px-6 lg:px-16">
          {columns.length > 0 ? renderDynamicFooter() : renderStaticFooter()}

          <div className="w-full h-px bg-white/30 my-5"></div>

          <div className="text-xs text-white font-medium text-center lg:text-left">
            {siteSettings.footerText || `© ${new Date().getFullYear()} SMK Kristen 5 Klaten. All rights reserved.`}
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
