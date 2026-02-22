import { useState, useEffect } from 'react';
import { Search, Plus, Edit3, Trash2, Tag, FolderOpen, X, MoreVertical, ChevronDown } from 'lucide-react';
import api from '../services/api';
import Modal from '../components/Modal';
import Toast from '../components/Toast';

const Categories = ({ embedded = false }) => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState('create');
  const [currentCategory, setCurrentCategory] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState(null);
  const [toast, setToast] = useState(null);

  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    type: 'topik',
    description: '',
  });

  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [filterType, setFilterType] = useState('');

  // Floating pill state (embedded)
  const [showActions, setShowActions] = useState(false);
  const [showSearch, setShowSearch] = useState(false);

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    const handler = setTimeout(() => setDebouncedSearch(searchQuery), 500);
    return () => clearTimeout(handler);
  }, [searchQuery]);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const response = await api.get('/api/categories');
      setCategories(response.data.data.categories);
    } catch (error) {
      showToastMsg(error.response?.data?.message || 'Gagal memuat kategori', 'error');
    } finally {
      setLoading(false);
    }
  };

  const showToastMsg = (message, type = 'success') => setToast({ message, type });

  const openCreateModal = () => {
    setModalMode('create');
    setFormData({ name: '', slug: '', type: 'topik', description: '' });
    setShowModal(true);
  };

  const openEditModal = (category) => {
    setModalMode('edit');
    setCurrentCategory(category);
    setFormData({
      name: category.name,
      slug: category.slug,
      type: category.type,
      description: category.description || '',
    });
    setShowModal(true);
  };

  const openDeleteModal = (category) => {
    setCategoryToDelete(category);
    setShowDeleteModal(true);
  };

  const handleNameChange = (e) => {
    const name = e.target.value;
    const slug = name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
    setFormData(f => ({ ...f, name, slug }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (modalMode === 'create') {
        await api.post('/api/categories', formData);
        showToastMsg('Kategori berhasil dibuat!', 'success');
      } else {
        await api.put(`/api/categories/${currentCategory._id}`, formData);
        showToastMsg('Kategori berhasil diupdate!', 'success');
      }
      fetchCategories();
      setShowModal(false);
      setCurrentCategory(null);
    } catch (error) {
      showToastMsg(error.response?.data?.message || 'Gagal menyimpan kategori', 'error');
    }
  };

  const handleDelete = async () => {
    try {
      await api.delete(`/api/categories/${categoryToDelete._id}`);
      showToastMsg('Kategori berhasil dihapus!', 'success');
      fetchCategories();
      setShowDeleteModal(false);
      setCategoryToDelete(null);
    } catch (error) {
      showToastMsg(error.response?.data?.message || 'Gagal menghapus kategori', 'error');
    }
  };

  const filteredCategories = categories.filter(cat => {
    if (filterType && cat.type !== filterType) return false;
    if (debouncedSearch) {
      const q = debouncedSearch.toLowerCase();
      return (
        cat.name.toLowerCase().includes(q) ||
        cat.slug.toLowerCase().includes(q) ||
        (cat.description && cat.description.toLowerCase().includes(q))
      );
    }
    return true;
  });

  // ── Type badge — glass tinted ─────────────────────────────────────────────
  const TypeBadge = ({ type }) => (
    <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-semibold backdrop-blur-sm ${
      type === 'jurusan'
        ? 'bg-violet-400/12 text-violet-700 border border-violet-400/22'
        : 'bg-blue-400/12 text-blue-700 border border-blue-400/22'
    }`}>
      {type === 'jurusan' ? 'Jurusan' : 'Topik'}
    </span>
  );

  // ── Category card — liquid glass ─────────────────────────────────────────
  const CategoryCard = ({ category }) => (
    <div className="group relative bg-white/70 backdrop-blur-sm rounded-xl overflow-hidden transition-all duration-200 shadow-[0_1px_8px_rgba(0,0,0,0.06),inset_0_1px_0_rgba(255,255,255,0.85)] border border-white/70 hover:border-white/95 hover:shadow-[0_4px_20px_rgba(0,0,0,0.09),inset_0_1px_0_rgba(255,255,255,0.9)]">
      <div className="p-4">
        <div className="flex items-start justify-between mb-3">
          <TypeBadge type={category.type} />
          <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity duration-150">
            <button
              onClick={() => openEditModal(category)}
              className="p-1.5 rounded-lg hover:bg-black/[0.06] text-gray-400/70 hover:text-gray-700 transition-colors"
              title="Edit"
            >
              <Edit3 size={14} />
            </button>
            <button
              onClick={() => openDeleteModal(category)}
              className="p-1.5 rounded-lg hover:bg-red-400/10 text-gray-400/70 hover:text-red-600 transition-colors"
              title="Hapus"
            >
              <Trash2 size={14} />
            </button>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <div className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${
            category.type === 'jurusan' ? 'bg-violet-400/10' : 'bg-blue-400/10'
          }`}>
            {category.type === 'jurusan'
              ? <FolderOpen size={17} className="text-violet-600/80" />
              : <Tag size={17} className="text-blue-600/80" />
            }
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-gray-900 truncate">{category.name}</p>
            <p className="text-[11px] text-gray-400/80 font-mono truncate">{category.slug}</p>
          </div>
        </div>

        {category.description && (
          <p className="text-xs text-gray-500/80 line-clamp-2 leading-relaxed border-t border-black/[0.05] pt-2 mt-3">
            {category.description}
          </p>
        )}
      </div>
    </div>
  );

  // ── EMBEDDED MODE ─────────────────────────────────────────────────────────
  if (embedded) {
    return (
      <>
        {/* ── Floating glass action pill ─────────────────────────────────── */}
        <div className="sticky top-3 z-10 h-0 overflow-visible flex justify-end pr-3 pointer-events-none">
          <div className="pointer-events-auto">
            {!showActions ? (
              <button
                onClick={() => setShowActions(true)}
                className="bg-gradient-to-br from-blue-500 to-blue-600 backdrop-blur-xl border border-blue-400/40 shadow-[0_4px_18px_rgba(59,130,246,0.45),inset_0_1px_0_rgba(255,255,255,0.25)] rounded-2xl p-2.5 text-white transition-all duration-200 hover:shadow-[0_6px_24px_rgba(59,130,246,0.55)] hover:scale-105 active:scale-95"
                title="Aksi"
              >
                <MoreVertical size={18} />
              </button>
            ) : (
              <div className="bg-gradient-to-b from-white/55 to-white/35 backdrop-blur-2xl border border-white/70 shadow-[0_8px_32px_rgba(0,0,0,0.12),0_2px_8px_rgba(0,0,0,0.06),inset_0_1px_0_rgba(255,255,255,0.85),inset_0_-1px_0_rgba(0,0,0,0.04)] rounded-2xl px-2.5 py-2 flex items-center gap-1.5">

                {/* Search input */}
                {showSearch && (
                  <div className="relative">
                    <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400/70 pointer-events-none" />
                    <input
                      autoFocus
                      type="text"
                      placeholder="cari kategori..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-44 pl-7 pr-3 py-1.5 text-sm bg-black/[0.06] border border-black/10 rounded-xl focus:outline-none focus:border-blue-400/50 focus:bg-black/[0.04] placeholder-gray-400/60 text-gray-700"
                    />
                  </div>
                )}

                <div className="w-px h-4 bg-black/10" />

                {/* Search toggle */}
                <button
                  onClick={() => { setShowSearch(v => !v); if (showSearch) setSearchQuery(''); }}
                  className={`p-1.5 rounded-xl transition-all duration-150 ${showSearch || searchQuery ? 'bg-blue-500/15 text-blue-600 shadow-[inset_0_1px_2px_rgba(0,0,0,0.08)]' : 'text-gray-500/80 hover:bg-black/[0.06] hover:text-gray-700'}`}
                  title="Cari"
                >
                  <Search size={16} />
                </button>

                {/* Type filter — mini segmented control */}
                <div className="flex items-center gap-0.5 bg-black/[0.05] rounded-xl p-0.5">
                  {[{ v: '', l: 'Semua' }, { v: 'jurusan', l: 'Jurusan' }, { v: 'topik', l: 'Topik' }].map(opt => (
                    <button
                      key={opt.v}
                      onClick={() => setFilterType(opt.v)}
                      className={`px-2 py-1 rounded-lg text-[11px] font-medium transition-all duration-150 ${
                        filterType === opt.v
                          ? 'bg-white/90 shadow-sm text-gray-800'
                          : 'text-gray-500/80 hover:text-gray-700'
                      }`}
                    >
                      {opt.l}
                    </button>
                  ))}
                </div>

                {/* Add */}
                <button
                  onClick={openCreateModal}
                  className="p-1.5 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 hover:from-blue-500/90 hover:to-blue-700 text-white transition-all shadow-[0_2px_8px_rgba(59,130,246,0.40),inset_0_1px_0_rgba(255,255,255,0.2)] hover:shadow-[0_3px_12px_rgba(59,130,246,0.50)]"
                  title="Tambah Kategori"
                >
                  <Plus size={16} />
                </button>

                {/* Divider + Close */}
                <div className="w-px h-4 bg-black/10 mx-0.5" />
                <button
                  onClick={() => { setShowActions(false); setShowSearch(false); setSearchQuery(''); setFilterType(''); }}
                  className="p-1.5 rounded-xl text-gray-400/70 hover:bg-black/[0.06] hover:text-gray-600 transition-all duration-150"
                  title="Tutup"
                >
                  <X size={14} />
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Active filter pill */}
        {(searchQuery || filterType) && (
          <div className="px-4 pt-3 pb-2 pr-14 flex flex-wrap gap-1.5 items-center">
            {searchQuery && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-blue-50 text-blue-700 rounded-full text-xs font-medium">
                "{searchQuery}"
                <button onClick={() => setSearchQuery('')} className="ml-0.5 hover:text-blue-900">×</button>
              </span>
            )}
            {filterType && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-violet-50 text-violet-700 rounded-full text-xs font-medium capitalize">
                {filterType}
                <button onClick={() => setFilterType('')} className="ml-0.5">×</button>
              </span>
            )}
            <button
              onClick={() => { setSearchQuery(''); setFilterType(''); }}
              className="text-xs text-red-500 hover:text-red-700 font-medium"
            >
              Hapus semua
            </button>
          </div>
        )}

        {/* ── Category grid ──────────────────────────────────────────────── */}
        <div className="p-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {loading ? (
            Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="bg-black/[0.04] rounded-xl h-[120px] animate-pulse" />
            ))
          ) : filteredCategories.length === 0 ? (
            <div className="col-span-3 py-16 text-center">
              <Tag size={40} className="mx-auto text-gray-200 mb-3" />
              <p className="text-sm text-gray-400">
                {searchQuery || filterType ? 'Tidak ada kategori yang sesuai' : 'Belum ada kategori'}
              </p>
              {!searchQuery && !filterType && (
                <button
                  onClick={openCreateModal}
                  className="mt-4 px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700"
                >
                  Tambah Kategori Pertama
                </button>
              )}
            </div>
          ) : (
            filteredCategories.map(cat => <CategoryCard key={cat._id} category={cat} />)
          )}
        </div>

        {/* ── Modals ─────────────────────────────────────────────────────── */}
        <Modal
          isOpen={showModal}
          onClose={() => { setShowModal(false); setCurrentCategory(null); }}
          title={modalMode === 'create' ? 'Tambah Kategori' : 'Edit Kategori'}
          size="md"
        >
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1.5">Nama Kategori *</label>
              <input
                type="text"
                value={formData.name}
                onChange={handleNameChange}
                required
                className="w-full px-3 py-2 text-sm bg-white/60 border border-black/[0.08] rounded-xl focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 outline-none transition-all placeholder:text-gray-400"
                placeholder="Contoh: Teknik Komputer Jaringan"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1.5">Slug *</label>
              <input
                type="text"
                value={formData.slug}
                onChange={(e) => setFormData(f => ({ ...f, slug: e.target.value }))}
                required
                className="w-full px-3 py-2 text-sm bg-white/60 border border-black/[0.08] rounded-xl focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 outline-none transition-all placeholder:text-gray-400 font-mono"
                placeholder="teknik-komputer-jaringan"
              />
              <p className="mt-1 text-xs text-gray-400">Otomatis dibuat dari nama, bisa diedit manual</p>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1.5">Tipe *</label>
              <div className="relative">
                <select
                  value={formData.type}
                  onChange={(e) => setFormData(f => ({ ...f, type: e.target.value }))}
                  className="w-full px-3 py-2 text-sm bg-white/60 border border-black/[0.08] rounded-xl focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 outline-none transition-all appearance-none pr-8"
                  required
                >
                  <option value="topik">Topik</option>
                  <option value="jurusan">Jurusan</option>
                </select>
                <ChevronDown size={13} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
              </div>
              <p className="mt-1 text-xs text-gray-400">Jurusan: TKJ, RPL, MM | Topik: Berita, Pengumuman, dll.</p>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1.5">Deskripsi</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData(f => ({ ...f, description: e.target.value }))}
                rows={3}
                className="w-full px-3 py-2 text-sm bg-white/60 border border-black/[0.08] rounded-xl focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 outline-none transition-all placeholder:text-gray-400"
                placeholder="Deskripsi singkat tentang kategori ini..."
              />
            </div>
            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => { setShowModal(false); setCurrentCategory(null); }}
                className="flex-1 px-4 py-2 text-xs text-gray-600 hover:bg-black/5 rounded-xl transition-colors"
              >
                Batal
              </button>
              <button
                type="submit"
                className="flex-1 px-4 py-2 text-xs bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors"
              >
                {modalMode === 'create' ? 'Tambah' : 'Simpan'}
              </button>
            </div>
          </form>
        </Modal>

        <Modal
          isOpen={showDeleteModal}
          onClose={() => { setShowDeleteModal(false); setCategoryToDelete(null); }}
          title="Hapus Kategori"
          size="sm"
        >
          <div className="space-y-4">
            <p className="text-sm text-gray-600">Hapus kategori <span className="font-semibold">"{categoryToDelete?.name}"</span>?</p>
            <p className="text-xs text-red-600">Kategori yang masih digunakan oleh artikel tidak bisa dihapus.</p>
            <div className="flex gap-2 pt-2">
              <button
                onClick={() => { setShowDeleteModal(false); setCategoryToDelete(null); }}
                className="flex-1 px-4 py-2 text-xs text-gray-600 hover:bg-black/5 rounded-xl transition-colors"
              >
                Batal
              </button>
              <button
                onClick={handleDelete}
                className="flex-1 px-4 py-2 text-xs bg-red-500 text-white rounded-xl hover:bg-red-600 transition-colors"
              >
                Hapus
              </button>
            </div>
          </div>
        </Modal>

        {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      </>
    );
  }

  // ── FULL PAGE MODE ─────────────────────────────────────────────────────────
  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Manajemen Kategori</h1>
          <p className="text-gray-600 mt-1">Kelola kategori artikel (Jurusan & Topik)</p>
        </div>
        <button
          onClick={openCreateModal}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
        >
          <Plus size={16} />
          <span>Tambah Kategori</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {loading ? (
          Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="bg-gray-100 rounded-xl h-[120px] animate-pulse" />
          ))
        ) : filteredCategories.length === 0 ? (
          <div className="col-span-3 py-16 text-center">
            <Tag size={40} className="mx-auto text-gray-200 mb-3" />
            <p className="text-sm text-gray-400">Belum ada kategori</p>
          </div>
        ) : (
          filteredCategories.map(cat => <CategoryCard key={cat._id} category={cat} />)
        )}
      </div>

      <Modal
        isOpen={showModal}
        onClose={() => { setShowModal(false); setCurrentCategory(null); }}
        title={modalMode === 'create' ? 'Tambah Kategori' : 'Edit Kategori'}
        size="md"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1.5">Nama Kategori *</label>
            <input type="text" value={formData.name} onChange={handleNameChange} required className="w-full px-3 py-2 text-sm bg-white/60 border border-black/[0.08] rounded-xl focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 outline-none transition-all placeholder:text-gray-400" placeholder="Contoh: Teknik Komputer Jaringan" />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1.5">Slug *</label>
            <input type="text" value={formData.slug} onChange={(e) => setFormData(f => ({ ...f, slug: e.target.value }))} required className="w-full px-3 py-2 text-sm bg-white/60 border border-black/[0.08] rounded-xl focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 outline-none transition-all placeholder:text-gray-400 font-mono" placeholder="teknik-komputer-jaringan" />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1.5">Tipe *</label>
            <div className="relative">
              <select value={formData.type} onChange={(e) => setFormData(f => ({ ...f, type: e.target.value }))} className="w-full px-3 py-2 text-sm bg-white/60 border border-black/[0.08] rounded-xl focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 outline-none transition-all appearance-none pr-8" required>
                <option value="topik">Topik</option>
                <option value="jurusan">Jurusan</option>
              </select>
              <ChevronDown size={13} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1.5">Deskripsi</label>
            <textarea value={formData.description} onChange={(e) => setFormData(f => ({ ...f, description: e.target.value }))} rows={3} className="w-full px-3 py-2 text-sm bg-white/60 border border-black/[0.08] rounded-xl focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 outline-none transition-all placeholder:text-gray-400" placeholder="Deskripsi singkat..." />
          </div>
          <div className="flex gap-2 pt-2">
            <button type="button" onClick={() => { setShowModal(false); setCurrentCategory(null); }} className="flex-1 px-4 py-2 text-xs text-gray-600 hover:bg-black/5 rounded-xl transition-colors">Batal</button>
            <button type="submit" className="flex-1 px-4 py-2 text-xs bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors">{modalMode === 'create' ? 'Tambah' : 'Simpan'}</button>
          </div>
        </form>
      </Modal>

      <Modal isOpen={showDeleteModal} onClose={() => { setShowDeleteModal(false); setCategoryToDelete(null); }} title="Hapus Kategori" size="sm">
        <div className="space-y-4">
          <p className="text-sm text-gray-600">Hapus kategori <span className="font-semibold">"{categoryToDelete?.name}"</span>?</p>
          <p className="text-xs text-red-600">Kategori yang masih digunakan oleh artikel tidak bisa dihapus.</p>
          <div className="flex gap-2 pt-2">
            <button onClick={() => { setShowDeleteModal(false); setCategoryToDelete(null); }} className="flex-1 px-4 py-2 text-xs text-gray-600 hover:bg-black/5 rounded-xl transition-colors">Batal</button>
            <button onClick={handleDelete} className="flex-1 px-4 py-2 text-xs bg-red-500 text-white rounded-xl hover:bg-red-600 transition-colors">Hapus</button>
          </div>
        </div>
      </Modal>

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
};

export default Categories;
