import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import {
  ChevronUp, ChevronDown, Pencil, Trash2, Eye, EyeOff,
  Link, X, ChevronRight, Monitor, Search, MoreHorizontal,
} from 'lucide-react';
import api from '../services/api';

const NavbarManagement = ({ embedded = false, createTrigger = 0, resetTrigger = 0, previewTrigger = 0 }) => {
  const [items, setItems] = useState([]);
  const [parents, setParents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [reordering, setReordering] = useState(false);
  const [expandedItems, setExpandedItems] = useState(new Set());
  const [openMenu, setOpenMenu] = useState(null); // { id, top, right }

  const openMenuFor = (id, e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setOpenMenu({ id, top: rect.bottom + 4, right: window.innerWidth - rect.right });
  };

  const toggleExpand = (id) =>
    setExpandedItems(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });

  const [formData, setFormData] = useState({
    label: '',
    url: '',
    parent: '',
    isDropdown: false,
    target: '_self',
    icon: '',
    isActive: true,
    isButton: false,
    buttonVariant: 'primary',
  });

  useEffect(() => {
    fetchItems();
    fetchParents();
  }, []);

  useEffect(() => {
    if (createTrigger > 0) openModal();
  }, [createTrigger]);

  useEffect(() => {
    if (resetTrigger > 0) {
      items.length === 0 ? handleSeedDefault() : handleResetAndSeed();
    }
  }, [resetTrigger]);

  useEffect(() => {
    if (previewTrigger > 0) setShowPreview(v => !v);
  }, [previewTrigger]);

  const fetchItems = async () => {
    try {
      setLoading(true);
      const res = await api.get('/api/navbar/all');
      setItems(res.data.data.items || []);
    } catch (error) {
      showToast(error.response?.data?.message || 'Gagal memuat menu', 'error');
    } finally {
      setLoading(false);
    }
  };

  const fetchParents = async () => {
    try {
      const res = await api.get('/api/navbar/parents');
      setParents(res.data.data.parents || []);
    } catch (error) {
      console.error('Failed to fetch parents:', error);
    }
  };

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const resetForm = () => {
    setFormData({
      label: '',
      url: '',
      parent: '',
      isDropdown: false,
      target: '_self',
      icon: '',
      isActive: true,
      isButton: false,
      buttonVariant: 'primary',
    });
    setEditingItem(null);
  };

  const openModal = (item = null) => {
    if (item) {
      setEditingItem(item);
      setFormData({
        label: item.label || '',
        url: item.url || '',
        parent: item.parent?._id || item.parent || '',
        isDropdown: item.isDropdown || false,
        target: item.target || '_self',
        icon: item.icon || '',
        isActive: item.isActive !== undefined ? item.isActive : true,
        isButton: item.isButton || false,
        buttonVariant: item.buttonVariant || 'primary',
      });
    } else {
      resetForm();
    }
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    resetForm();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.label.trim()) {
      showToast('Label tidak boleh kosong', 'error');
      return;
    }
    try {
      setSaving(true);
      const payload = { ...formData, parent: formData.parent || null };
      if (editingItem) {
        await api.put(`/api/navbar/${editingItem._id}`, payload);
        showToast('Menu berhasil diperbarui');
      } else {
        await api.post('/api/navbar', payload);
        showToast('Menu berhasil ditambahkan');
      }
      closeModal();
      fetchItems();
      fetchParents();
    } catch (error) {
      showToast(error.response?.data?.message || 'Gagal menyimpan menu', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (item) => {
    if (!window.confirm(`Hapus menu "${item.label}"?${item.isDropdown ? ' Semua submenu juga akan terhapus.' : ''}`)) return;
    try {
      await api.delete(`/api/navbar/${item._id}`);
      showToast('Menu berhasil dihapus');
      fetchItems();
      fetchParents();
    } catch (error) {
      showToast(error.response?.data?.message || 'Gagal menghapus menu', 'error');
    }
  };

  const handleToggleActive = async (item) => {
    try {
      await api.put(`/api/navbar/${item._id}`, { isActive: !item.isActive });
      showToast(`Menu ${!item.isActive ? 'diaktifkan' : 'dinonaktifkan'}`);
      fetchItems();
    } catch (error) {
      showToast(error.response?.data?.message || 'Gagal mengubah status', 'error');
    }
  };

  const handleMoveUp = async (item, siblings) => {
    const currentIndex = siblings.findIndex(s => s._id === item._id);
    if (currentIndex <= 0) return;
    try {
      setReordering(true);
      const prevItem = siblings[currentIndex - 1];
      await api.put('/api/navbar/reorder/bulk', {
        items: [
          { id: item._id, order: prevItem.order },
          { id: prevItem._id, order: item.order },
        ],
      });
      fetchItems();
    } catch (error) {
      showToast('Gagal mengubah urutan', 'error');
    } finally {
      setReordering(false);
    }
  };

  const handleMoveDown = async (item, siblings) => {
    const currentIndex = siblings.findIndex(s => s._id === item._id);
    if (currentIndex >= siblings.length - 1) return;
    try {
      setReordering(true);
      const nextItem = siblings[currentIndex + 1];
      await api.put('/api/navbar/reorder/bulk', {
        items: [
          { id: item._id, order: nextItem.order },
          { id: nextItem._id, order: item.order },
        ],
      });
      fetchItems();
    } catch (error) {
      showToast('Gagal mengubah urutan', 'error');
    } finally {
      setReordering(false);
    }
  };

  const handleSeedDefault = async () => {
    if (!window.confirm('Ini akan membuat menu default. Lanjutkan?')) return;
    try {
      await api.post('/api/navbar/seed');
      showToast('Menu default berhasil dibuat');
      fetchItems();
      fetchParents();
    } catch (error) {
      showToast(error.response?.data?.message || 'Gagal membuat menu default', 'error');
    }
  };

  const handleResetAndSeed = async () => {
    if (!window.confirm('Ini akan MENGHAPUS SEMUA menu dan membuat ulang menu default. Lanjutkan?')) return;
    try {
      await api.delete('/api/navbar/all');
      await api.post('/api/navbar/seed');
      showToast('Menu berhasil di-reset ke default');
      fetchItems();
      fetchParents();
    } catch (error) {
      showToast(error.response?.data?.message || 'Gagal reset menu', 'error');
    }
  };

  const topLevelItems = items.filter(item => !item.parent).sort((a, b) => a.order - b.order);
  const getChildren = (parentId) =>
    items.filter(item => (item.parent?._id || item.parent) === parentId).sort((a, b) => a.order - b.order);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // ── Shared input class ────────────────────────────────────────────────────
  const inputCls = 'w-full px-3 py-2 text-sm bg-white/60 border border-black/[0.08] rounded-xl focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 outline-none transition-all placeholder:text-gray-300';

  return (
    <div className={embedded ? '' : 'p-6'}>

      {/* ── Toast ─────────────────────────────────────────────────────────── */}
      {toast && (
        <div className={`fixed top-4 right-4 z-[60] px-4 py-2.5 rounded-xl shadow-lg backdrop-blur-sm text-sm font-medium text-white ${toast.type === 'error' ? 'bg-red-500/90' : 'bg-green-500/90'}`}>
          {toast.message}
        </div>
      )}

      {/* ── Standalone header ─────────────────────────────────────────────── */}
      {!embedded && (
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Manajemen Navbar</h1>
            <p className="text-sm text-gray-500">Kelola menu navigasi website</p>
          </div>
          <div className="flex gap-2">
            {items.length === 0 ? (
              <button onClick={handleSeedDefault} className="px-4 py-2 bg-gray-600 text-white rounded-lg text-sm hover:bg-gray-700">
                Buat Menu Default
              </button>
            ) : (
              <button onClick={handleResetAndSeed} className="px-4 py-2 bg-orange-500 text-white rounded-lg text-sm hover:bg-orange-600">
                Reset ke Default
              </button>
            )}
            <button onClick={() => openModal()} className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700">
              + Tambah Menu
            </button>
          </div>
        </div>
      )}

      {/* ── Menu list ─────────────────────────────────────────────────────── */}
      {items.length === 0 ? (
        <div className="py-16 text-center text-gray-400">
          <div className="w-12 h-12 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-3">
            <Monitor size={20} className="text-gray-300" />
          </div>
          <p className="text-sm">Belum ada menu navigasi.</p>
          <p className="text-xs mt-1 text-gray-300">Gunakan tombol + untuk menambahkan menu.</p>
        </div>
      ) : (
        <div className="space-y-1.5">
          {topLevelItems.map((item, index) => {
            const children = getChildren(item._id);
            return (
              <div
                key={item._id}
                className={`bg-white/55 backdrop-blur-sm border border-white/75 rounded-2xl shadow-[0_1px_6px_rgba(0,0,0,0.05),inset_0_1px_0_rgba(255,255,255,0.8)] transition-opacity ${!item.isActive ? 'opacity-50' : ''}`}
              >
                {/* Parent row */}
                <div className="flex items-center gap-2.5 px-3.5 py-3">

                  {/* Reorder */}
                  <div className="flex flex-col gap-0.5 flex-shrink-0">
                    <button
                      onClick={() => handleMoveUp(item, topLevelItems)}
                      disabled={index === 0 || reordering}
                      className="p-0.5 text-gray-300 hover:text-gray-500 disabled:opacity-20 transition-colors"
                    >
                      <ChevronUp size={13} />
                    </button>
                    <button
                      onClick={() => handleMoveDown(item, topLevelItems)}
                      disabled={index === topLevelItems.length - 1 || reordering}
                      className="p-0.5 text-gray-300 hover:text-gray-500 disabled:opacity-20 transition-colors"
                    >
                      <ChevronDown size={13} />
                    </button>
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-sm font-medium text-gray-800">{item.icon && <span className="mr-1">{item.icon}</span>}{item.label}</span>
                      {children.length > 0 && (
                        <button
                          onClick={() => toggleExpand(item._id)}
                          className="p-0.5 text-purple-300 hover:text-purple-500 transition-colors"
                        >
                          <ChevronRight
                            size={12}
                            className={`transition-transform duration-200 ${expandedItems.has(item._id) ? 'rotate-90' : ''}`}
                          />
                        </button>
                      )}
                      {item.isDropdown && (
                        <span className="px-1.5 py-px text-[10px] bg-purple-100/80 text-purple-600 rounded-md font-medium">Dropdown</span>
                      )}
                      {item.isButton && (
                        <span className="px-1.5 py-px text-[10px] bg-blue-100/80 text-blue-600 rounded-md font-medium">Button</span>
                      )}
                      {!item.isActive && (
                        <span className="px-1.5 py-px text-[10px] bg-gray-100 text-gray-400 rounded-md">Nonaktif</span>
                      )}
                    </div>
                    {item.url && (
                      <p className="text-[11px] text-gray-400 mt-0.5 flex items-center gap-1 truncate">
                        <Link size={9} className="flex-shrink-0" />
                        <span className="truncate">{item.url}</span>
                      </p>
                    )}
                  </div>

                  {/* Actions — three-dot menu */}
                  <div className="flex-shrink-0">
                    <button
                      onClick={e => openMenuFor(item._id, e)}
                      className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-black/5 rounded-xl transition-colors"
                    >
                      <MoreHorizontal size={15} />
                    </button>
                  </div>
                </div>

                {/* Submenu rows — only when expanded */}
                {children.length > 0 && expandedItems.has(item._id) && (
                  <div className="border-t border-black/[0.04] bg-purple-50/20 rounded-b-2xl overflow-hidden">
                    {children.map((child, childIndex) => (
                      <div
                        key={child._id}
                        className={`flex items-center gap-2.5 px-3.5 py-2.5 border-b border-black/[0.04] last:border-b-0 ${!child.isActive ? 'opacity-50' : ''}`}
                      >
                        {/* Reorder */}
                        <div className="flex flex-col gap-0.5 ml-5 flex-shrink-0">
                          <button
                            onClick={() => handleMoveUp(child, children)}
                            disabled={childIndex === 0 || reordering}
                            className="p-0.5 text-gray-300 hover:text-gray-500 disabled:opacity-20 transition-colors"
                          >
                            <ChevronUp size={11} />
                          </button>
                          <button
                            onClick={() => handleMoveDown(child, children)}
                            disabled={childIndex === children.length - 1 || reordering}
                            className="p-0.5 text-gray-300 hover:text-gray-500 disabled:opacity-20 transition-colors"
                          >
                            <ChevronDown size={11} />
                          </button>
                        </div>

                        {/* Info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1">
                            <span className="text-[13px] text-gray-700">{child.icon && <span className="mr-1">{child.icon}</span>}{child.label}</span>
                            <ChevronRight size={10} className="text-purple-200 flex-shrink-0" />
                          </div>
                          {child.url && (
                            <p className="text-[11px] text-gray-400 flex items-center gap-1 truncate">
                              <Link size={9} className="flex-shrink-0" />
                              <span className="truncate">{child.url}</span>
                            </p>
                          )}
                        </div>

                        {/* Actions — three-dot menu */}
                        <div className="flex-shrink-0">
                          <button
                            onClick={e => openMenuFor(child._id, e)}
                            className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-black/5 rounded-xl transition-colors"
                          >
                            <MoreHorizontal size={14} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* ── Preview modal ─────────────────────────────────────────────────── */}
      {showPreview && (
        <div
          className="fixed inset-0 bg-black/20 backdrop-blur-md z-50 flex items-start justify-center pt-20 p-4"
          onClick={() => setShowPreview(false)}
        >
          <div
            className="bg-white/75 backdrop-blur-2xl border border-white/70 rounded-2xl shadow-[0_8px_40px_rgba(0,0,0,0.14),inset_0_1px_0_rgba(255,255,255,0.9)] w-full max-w-4xl"
            onClick={e => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-3.5 border-b border-black/[0.06] rounded-t-2xl">
              <div className="flex items-center gap-2">
                <Monitor size={14} className="text-blue-500" />
                <span className="text-sm font-semibold text-gray-700">Preview Navbar</span>
              </div>
              <button
                onClick={() => setShowPreview(false)}
                className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-black/5 rounded-lg transition-colors"
              >
                <X size={14} />
              </button>
            </div>

            {/* Preview content */}
            <div className="p-4">
              <div className="bg-[#2e41e4] rounded-xl px-5 py-3.5 shadow-lg select-none">
                <div className="flex items-center justify-between gap-4">

                  {/* Logo */}
                  <div className="flex items-center gap-2.5 flex-shrink-0">
                    <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center text-sm">🏫</div>
                    <div>
                      <p className="text-[7px] uppercase tracking-wider text-white/60">Sekolah Menengah Kejuruan</p>
                      <p className="text-[11px] font-bold text-yellow-300">KRISTEN 5 KLATEN</p>
                    </div>
                  </div>

                  {/* Menu items */}
                  <div className="flex items-center gap-5 flex-1 justify-center">
                    {topLevelItems.filter(i => i.isActive && !i.isButton).map(item => {
                      const ch = getChildren(item._id).filter(c => c.isActive);
                      return (
                        <div key={item._id} className="relative group">
                          <span className="text-white text-xs cursor-pointer hover:text-yellow-300 flex items-center gap-0.5 transition-colors">
                            {item.label}
                            {item.isDropdown && ch.length > 0 && <ChevronDown size={10} />}
                          </span>
                          {item.isDropdown && ch.length > 0 && (
                            <div className="absolute top-full left-0 mt-2 bg-white/90 backdrop-blur-sm rounded-xl shadow-xl py-1.5 min-w-[140px] hidden group-hover:block z-[60] border border-white/50">
                              {ch.map(child => (
                                <div key={child._id} className="px-3 py-1.5 text-xs text-gray-700 hover:bg-gray-50 transition-colors">
                                  {child.label}
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  {/* Right: search + buttons */}
                  <div className="flex items-center gap-2.5 flex-shrink-0">
                    <Search size={14} className="text-white/70" />
                    {topLevelItems.filter(i => i.isActive && i.isButton).map(item => (
                      <span key={item._id} className="px-3 py-1 text-[11px] font-semibold text-yellow-300 border border-yellow-300 rounded-full">
                        {item.label}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
              <p className="text-[11px] text-gray-400 mt-2.5 text-center">Hover pada menu dropdown untuk melihat submenu</p>
            </div>
          </div>
        </div>
      )}

      {/* ── Edit / Add modal ──────────────────────────────────────────────── */}
      {showModal && (
        <div className="fixed inset-0 bg-black/20 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-white/80 backdrop-blur-2xl border border-white/70 rounded-2xl shadow-[0_8px_40px_rgba(0,0,0,0.15),inset_0_1px_0_rgba(255,255,255,0.9)] max-w-md w-full max-h-[90vh] overflow-auto">

            {/* Modal header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-black/[0.06]">
              <h2 className="text-sm font-semibold text-gray-800">
                {editingItem ? 'Edit Menu' : 'Tambah Menu'}
              </h2>
              <button
                onClick={closeModal}
                className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-black/5 rounded-lg transition-colors"
              >
                <X size={14} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1.5">Label *</label>
                <input
                  type="text"
                  value={formData.label}
                  onChange={e => setFormData({ ...formData, label: e.target.value })}
                  className={inputCls}
                  placeholder="Beranda"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1.5">URL</label>
                <input
                  type="text"
                  value={formData.url}
                  onChange={e => setFormData({ ...formData, url: e.target.value })}
                  className={inputCls}
                  placeholder="/"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1.5">Parent (untuk submenu)</label>
                <select
                  value={formData.parent}
                  onChange={e => setFormData({ ...formData, parent: e.target.value })}
                  className={inputCls}
                >
                  <option value="">-- Top Level --</option>
                  {parents.filter(p => p._id !== editingItem?._id).map(parent => (
                    <option key={parent._id} value={parent._id}>{parent.label}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1.5">Target</label>
                  <select
                    value={formData.target}
                    onChange={e => setFormData({ ...formData, target: e.target.value })}
                    className={inputCls}
                  >
                    <option value="_self">Same Tab</option>
                    <option value="_blank">New Tab</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1.5">Icon (opsional)</label>
                  <input
                    type="text"
                    value={formData.icon}
                    onChange={e => setFormData({ ...formData, icon: e.target.value })}
                    className={inputCls}
                    placeholder="🏠"
                  />
                </div>
              </div>

              <div className="space-y-3 pt-1">
                <label className="flex items-center gap-2.5 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={formData.isDropdown}
                    onChange={e => setFormData({ ...formData, isDropdown: e.target.checked })}
                    className="w-3.5 h-3.5 rounded text-blue-600 accent-blue-600"
                  />
                  <span className="text-xs text-gray-700">Jadikan Dropdown (memiliki submenu)</span>
                </label>

                <label className="flex items-center gap-2.5 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={formData.isButton}
                    onChange={e => setFormData({ ...formData, isButton: e.target.checked })}
                    className="w-3.5 h-3.5 rounded text-blue-600 accent-blue-600"
                  />
                  <span className="text-xs text-gray-700">Tampilkan sebagai Button</span>
                </label>

                {formData.isButton && (
                  <div className="pl-6">
                    <label className="block text-xs font-medium text-gray-500 mb-1.5">Button Style</label>
                    <select
                      value={formData.buttonVariant}
                      onChange={e => setFormData({ ...formData, buttonVariant: e.target.value })}
                      className={inputCls}
                    >
                      <option value="primary">Primary (Biru)</option>
                      <option value="secondary">Secondary (Abu)</option>
                      <option value="outline">Outline</option>
                    </select>
                  </div>
                )}

                <label className="flex items-center gap-2.5 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={formData.isActive}
                    onChange={e => setFormData({ ...formData, isActive: e.target.checked })}
                    className="w-3.5 h-3.5 rounded text-blue-600 accent-blue-600"
                  />
                  <span className="text-xs text-gray-700">Aktif (tampilkan di navbar)</span>
                </label>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-black/[0.06]">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-4 py-2 text-xs text-gray-600 hover:bg-black/5 rounded-xl transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-4 py-2 text-xs bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:opacity-50 transition-colors"
                >
                  {saving ? 'Menyimpan...' : editingItem ? 'Perbarui' : 'Simpan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Context menu portal ───────────────────────────────────────────── */}
      {openMenu && (() => {
        const target = items.find(i => i._id === openMenu.id);
        if (!target) return null;
        return createPortal(
          <>
            <div className="fixed inset-0 z-[90]" onClick={() => setOpenMenu(null)} />
            <div
              className="fixed bg-white/85 backdrop-blur-2xl border border-white/70 rounded-xl shadow-[0_4px_24px_rgba(0,0,0,0.12),inset_0_1px_0_rgba(255,255,255,0.9)] py-1 min-w-[150px] z-[100]"
              style={{ top: openMenu.top, right: openMenu.right }}
            >
              <button
                onClick={() => { handleToggleActive(target); setOpenMenu(null); }}
                className="w-full flex items-center gap-2.5 px-3 py-2 text-xs text-gray-700 hover:bg-black/[0.05] transition-colors"
              >
                {target.isActive ? <EyeOff size={13} className="text-gray-400" /> : <Eye size={13} className="text-emerald-500" />}
                {target.isActive ? 'Nonaktifkan' : 'Aktifkan'}
              </button>
              <button
                onClick={() => { openModal(target); setOpenMenu(null); }}
                className="w-full flex items-center gap-2.5 px-3 py-2 text-xs text-gray-700 hover:bg-black/[0.05] transition-colors"
              >
                <Pencil size={13} className="text-blue-400" />
                Edit
              </button>
              <div className="mx-2 my-0.5 h-px bg-black/[0.06]" />
              <button
                onClick={() => { handleDelete(target); setOpenMenu(null); }}
                className="w-full flex items-center gap-2.5 px-3 py-2 text-xs text-red-500 hover:bg-red-50 transition-colors"
              >
                <Trash2 size={13} />
                Hapus
              </button>
            </div>
          </>,
          document.body
        );
      })()}
    </div>
  );
};

export default NavbarManagement;
