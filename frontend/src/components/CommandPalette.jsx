import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, FileText, Megaphone, Trophy, GraduationCap,
  BookOpen, Building2, Dribbble, Users, Video, Images, FilePlus,
  FolderOpen, UserCog, ClipboardList, Share2, Handshake, MousePointerClick,
  CalendarDays, CalendarCheck, School, Settings, Navigation, PanelBottom,
  Search, ExternalLink, Plus,
} from 'lucide-react';

const allCommands = [
  // Navigation
  { name: 'Dashboard', path: '/admin/dashboard', icon: LayoutDashboard, category: 'Navigasi' },
  { name: 'Artikel', path: '/admin/articles', icon: FileText, category: 'Konten' },
  { name: 'Kategori', path: '/admin/articles?tab=kategori', icon: FolderOpen, category: 'Konten' },
  { name: 'Halaman Kustom', path: '/admin/custom-pages', icon: FilePlus, category: 'Konten' },
  { name: 'Jurusan', path: '/admin/akademik?tab=jurusan', icon: GraduationCap, category: 'Akademik' },
  { name: 'Mata Pelajaran', path: '/admin/akademik?tab=mapel', icon: BookOpen, category: 'Akademik' },
  { name: 'Ekskul', path: '/admin/kesiswaan?tab=ekskul', icon: Dribbble, category: 'Kesiswaan' },
  { name: 'Prestasi', path: '/admin/kesiswaan?tab=prestasi', icon: Trophy, category: 'Kesiswaan' },
  { name: 'Alumni', path: '/admin/kesiswaan?tab=alumni', icon: Users, category: 'Kesiswaan' },
  { name: 'Fasilitas', path: '/admin/kesiswaan?tab=fasilitas', icon: Building2, category: 'Kesiswaan' },
  { name: 'Kegiatan', path: '/admin/kegiatan?tab=kegiatan', icon: CalendarDays, category: 'Kegiatan' },
  { name: 'Agenda', path: '/admin/kegiatan?tab=agenda', icon: CalendarCheck, category: 'Kegiatan' },
  { name: 'Hero Slides', path: '/admin/homepage?tab=hero-slides', icon: Images, category: 'Homepage' },
  { name: 'Video Hero', path: '/admin/homepage?tab=video-hero', icon: Video, category: 'Homepage' },
  { name: 'CTA', path: '/admin/homepage?tab=cta', icon: MousePointerClick, category: 'Homepage' },
  { name: 'Partner', path: '/admin/homepage?tab=partner', icon: Handshake, category: 'Homepage' },
  { name: 'Running Text', path: '/admin/homepage?tab=running-text', icon: Megaphone, category: 'Homepage' },
  { name: 'Pengaturan Website', path: '/admin/pengaturan?tab=website', icon: Settings, category: 'Pengaturan' },
  { name: 'Informasi Sekolah', path: '/admin/pengaturan?tab=sekolah', icon: School, category: 'Pengaturan' },
  { name: 'Navbar', path: '/admin/pengaturan?tab=navbar', icon: Navigation, category: 'Pengaturan' },
  { name: 'Footer', path: '/admin/pengaturan?tab=footer', icon: PanelBottom, category: 'Pengaturan' },
  { name: 'Sosial Media', path: '/admin/pengaturan?tab=sosmed', icon: Share2, category: 'Pengaturan' },
  { name: 'Manajemen User', path: '/admin/sistem?tab=users', icon: UserCog, category: 'Sistem' },
  { name: 'Audit Log', path: '/admin/sistem?tab=audit-log', icon: ClipboardList, category: 'Sistem' },
  // Quick actions
  { name: 'Buat Artikel Baru', path: '/admin/articles', action: 'create', icon: Plus, category: 'Aksi Cepat' },
  { name: 'Buat Halaman Baru', path: '/admin/custom-pages/create', icon: Plus, category: 'Aksi Cepat' },
  { name: 'Lihat Website', path: '/', external: true, icon: ExternalLink, category: 'Aksi Cepat' },
];

const CommandPalette = ({ isOpen, onClose }) => {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef(null);
  const listRef = useRef(null);
  const navigate = useNavigate();

  // Filter commands based on query
  const filteredCommands = query === ''
    ? allCommands
    : allCommands.filter((cmd) =>
        cmd.name.toLowerCase().includes(query.toLowerCase()) ||
        cmd.category.toLowerCase().includes(query.toLowerCase())
      );

  // Group by category
  const grouped = filteredCommands.reduce((acc, cmd) => {
    if (!acc[cmd.category]) acc[cmd.category] = [];
    acc[cmd.category].push(cmd);
    return acc;
  }, {});

  // Flat list for keyboard navigation
  const flatList = Object.values(grouped).flat();

  // Focus input when opened
  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  // Scroll selected item into view
  useEffect(() => {
    const el = listRef.current?.querySelector(`[data-index="${selectedIndex}"]`);
    el?.scrollIntoView({ block: 'nearest' });
  }, [selectedIndex]);

  const handleKeyDown = (e) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % flatList.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev - 1 + flatList.length) % flatList.length);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      const cmd = flatList[selectedIndex];
      if (cmd) executeCommand(cmd);
    } else if (e.key === 'Escape') {
      onClose();
    }
  };

  const executeCommand = (cmd) => {
    onClose();
    if (cmd.external) {
      window.open(cmd.path, '_blank');
    } else {
      navigate(cmd.path);
    }
  };

  if (!isOpen) return null;

  let globalIndex = 0;

  return (
    <div className="fixed inset-0 z-[100] overflow-y-auto">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />

      {/* Dialog */}
      <div className="relative min-h-screen flex items-start justify-center pt-[15vh] px-4">
        <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl overflow-hidden">
          {/* Search Input */}
          <div className="flex items-center px-4 border-b border-gray-200">
            <Search size={18} className="text-gray-400 flex-shrink-0" />
            <input
              ref={inputRef}
              type="text"
              placeholder="Cari menu, halaman, atau aksi..."
              value={query}
              onChange={(e) => { setQuery(e.target.value); setSelectedIndex(0); }}
              onKeyDown={handleKeyDown}
              className="flex-1 px-3 py-4 text-sm text-gray-900 placeholder-gray-400 bg-transparent outline-none"
            />
            <kbd className="hidden sm:inline-flex items-center px-1.5 py-0.5 text-[10px] font-medium text-gray-400 bg-gray-100 border border-gray-200 rounded">
              ESC
            </kbd>
          </div>

          {/* Results */}
          <div ref={listRef} className="max-h-80 overflow-y-auto p-2">
            {flatList.length === 0 ? (
              <div className="py-8 text-center text-sm text-gray-500">
                Tidak ada hasil untuk "{query}"
              </div>
            ) : (
              Object.entries(grouped).map(([category, items]) => (
                <div key={category}>
                  <p className="px-3 pt-3 pb-1 text-[10px] font-semibold text-gray-400 uppercase tracking-wider">
                    {category}
                  </p>
                  {items.map((cmd) => {
                    const thisIndex = globalIndex++;
                    const Icon = cmd.icon;
                    return (
                      <button
                        key={cmd.name + cmd.path}
                        data-index={thisIndex}
                        onClick={() => executeCommand(cmd)}
                        onMouseEnter={() => setSelectedIndex(thisIndex)}
                        className={`
                          w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg text-sm transition-colors
                          ${thisIndex === selectedIndex
                            ? 'bg-gradient-to-r from-blue-50 to-purple-50 text-blue-700'
                            : 'text-gray-700 hover:bg-gray-50'
                          }
                        `}
                      >
                        <Icon size={16} className={thisIndex === selectedIndex ? 'text-blue-500' : 'text-gray-400'} />
                        <span className="flex-1 text-left font-medium">{cmd.name}</span>
                        {thisIndex === selectedIndex && (
                          <span className="text-[10px] text-gray-400">Enter ↵</span>
                        )}
                      </button>
                    );
                  })}
                </div>
              ))
            )}
          </div>

          {/* Footer hint */}
          <div className="border-t border-gray-100 px-4 py-2 flex items-center justify-between text-[10px] text-gray-400">
            <div className="flex items-center space-x-3">
              <span>↑↓ Navigasi</span>
              <span>↵ Pilih</span>
              <span>Esc Tutup</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CommandPalette;
