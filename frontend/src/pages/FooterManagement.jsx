import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import {
  ChevronUp, ChevronDown, Pencil, Trash2, Plus, X,
  MoreHorizontal, Monitor, Eye, EyeOff, LayoutTemplate,
} from 'lucide-react';
import api from '../services/api';

const FooterManagement = ({ embedded = false, createTrigger = 0, saveTrigger = 0, previewTrigger = 0 }) => {
  const [columns, setColumns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showItemModal, setShowItemModal] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [editingColumn, setEditingColumn] = useState(null);
  const [editingItem, setEditingItem] = useState(null);
  const [editingColumnId, setEditingColumnId] = useState(null);
  const [toast, setToast] = useState(null);
  const [openMenu, setOpenMenu] = useState(null); // { id, top, right, type, colId? }
  const [expandedCols, setExpandedCols] = useState(new Set());

  const [footerTextSettings, setFooterTextSettings] = useState({ footerText: '', footerDescription: '' });

  const [columnForm, setColumnForm] = useState({
    title: '', type: 'links', width: 'auto',
    showTitle: true, showBullets: true, isActive: true,
    description: '', logoUrl: '', logoSize: 'medium',
  });

  const [itemForm, setItemForm] = useState({
    type: 'link', content: '', url: '', icon: '', target: '_self',
  });

  const columnTypes = [
    { value: 'logo',   label: 'Logo & Deskripsi' },
    { value: 'links',  label: 'Link' },
    { value: 'social', label: 'Social Media' },
    { value: 'text',   label: 'Teks' },
    { value: 'custom', label: 'Custom' },
  ];

  const itemTypes = [
    { value: 'text',      label: 'Teks Biasa' },
    { value: 'link',      label: 'Link' },
    { value: 'icon-link', label: 'Link dengan Icon' },
  ];

  const iconOptions = [
    { value: 'whatsapp',  label: 'WhatsApp' },
    { value: 'instagram', label: 'Instagram' },
    { value: 'facebook',  label: 'Facebook' },
    { value: 'youtube',   label: 'YouTube' },
    { value: 'twitter',   label: 'Twitter' },
    { value: 'tiktok',    label: 'TikTok' },
    { value: 'linkedin',  label: 'LinkedIn' },
    { value: 'email',     label: 'Email' },
    { value: 'phone',     label: 'Telepon' },
    { value: 'location',  label: 'Lokasi' },
  ];

  const widthOptions = [
    { value: 'auto', label: 'Auto' },
    { value: '1',    label: '1 Kolom' },
    { value: '2',    label: '2 Kolom' },
    { value: '3',    label: '3 Kolom' },
    { value: '4',    label: '4 Kolom' },
  ];

  // ── Effects ───────────────────────────────────────────────────────────────
  useEffect(() => { fetchColumns(); fetchFooterTextSettings(); }, []);
  useEffect(() => { if (createTrigger > 0) openColumnModal(); }, [createTrigger]);
  useEffect(() => { if (saveTrigger > 0) handleSaveFooterText(); }, [saveTrigger]);
  useEffect(() => { if (previewTrigger > 0) setShowPreview(v => !v); }, [previewTrigger]);

  // ── Data fetching ─────────────────────────────────────────────────────────
  const fetchColumns = async () => {
    try {
      const res = await api.get('/api/footer/all');
      setColumns(res.data.data.columns || []);
    } catch { showToast('Gagal memuat data footer', 'error'); }
    finally { setLoading(false); }
  };

  const fetchFooterTextSettings = async () => {
    try {
      const res = await api.get('/api/site-settings');
      const s = res.data.data;
      setFooterTextSettings({ footerText: s.footerText || '', footerDescription: s.footerDescription || '' });
    } catch { /* silent */ }
  };

  // ── Helpers ───────────────────────────────────────────────────────────────
  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const toggleCol = (id) =>
    setExpandedCols(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });

  const openMenuFor = (id, e, extra = {}) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setOpenMenu({ id, top: rect.bottom + 4, right: window.innerWidth - rect.right, ...extra });
  };

  // ── Save footer text ──────────────────────────────────────────────────────
  const handleSaveFooterText = async () => {
    try {
      await api.put('/api/site-settings', footerTextSettings);
      showToast('Teks footer berhasil disimpan');
    } catch (error) {
      showToast(error.response?.data?.message || 'Gagal menyimpan teks footer', 'error');
    }
  };

  // ── Column modal ──────────────────────────────────────────────────────────
  const openColumnModal = (column = null) => {
    if (column) {
      setEditingColumn(column);
      setColumnForm({
        title: column.title || '', type: column.type || 'links', width: column.width || 'auto',
        showTitle: column.showTitle !== false, showBullets: column.showBullets !== false,
        isActive: column.isActive !== false, description: column.description || '',
        logoUrl: column.logoUrl || '', logoSize: column.logoSize || 'medium',
      });
    } else {
      setEditingColumn(null);
      setColumnForm({ title: '', type: 'links', width: 'auto', showTitle: true, showBullets: true, isActive: true, description: '', logoUrl: '', logoSize: 'medium' });
    }
    setShowModal(true);
  };

  const handleSaveColumn = async () => {
    if (!columnForm.title.trim()) { showToast('Judul kolom harus diisi', 'error'); return; }
    try {
      if (editingColumn) {
        await api.put(`/api/footer/${editingColumn._id}`, columnForm);
        showToast('Kolom berhasil diperbarui');
      } else {
        await api.post('/api/footer', columnForm);
        showToast('Kolom berhasil ditambahkan');
      }
      setShowModal(false);
      fetchColumns();
    } catch (error) {
      showToast(error.response?.data?.message || 'Gagal menyimpan kolom', 'error');
    }
  };

  // ── Item modal ────────────────────────────────────────────────────────────
  const openItemModal = (columnId, item = null) => {
    setEditingColumnId(columnId);
    if (item) {
      setEditingItem(item);
      setItemForm({ type: item.type || 'link', content: item.content || '', url: item.url || '', icon: item.icon || '', target: item.target || '_self' });
    } else {
      setEditingItem(null);
      setItemForm({ type: 'link', content: '', url: '', icon: '', target: '_self' });
    }
    setShowItemModal(true);
  };

  const handleSaveItem = async () => {
    if (!itemForm.content.trim()) { showToast('Konten item harus diisi', 'error'); return; }
    try {
      const column = columns.find(c => c._id === editingColumnId);
      let updatedItems = [...(column.items || [])];
      if (editingItem) {
        const idx = updatedItems.findIndex(i => i._id === editingItem._id);
        if (idx > -1) updatedItems[idx] = { ...updatedItems[idx], ...itemForm };
      } else {
        const maxOrder = updatedItems.reduce((m, i) => Math.max(m, i.order || 0), 0);
        updatedItems.push({ ...itemForm, order: maxOrder + 1 });
      }
      await api.put(`/api/footer/${editingColumnId}`, { items: updatedItems });
      showToast(editingItem ? 'Item berhasil diperbarui' : 'Item berhasil ditambahkan');
      setShowItemModal(false);
      fetchColumns();
    } catch (error) {
      showToast(error.response?.data?.message || 'Gagal menyimpan item', 'error');
    }
  };

  // ── Delete ────────────────────────────────────────────────────────────────
  const handleDeleteColumn = async (id) => {
    if (!window.confirm('Hapus kolom ini?')) return;
    try {
      await api.delete(`/api/footer/${id}`);
      showToast('Kolom berhasil dihapus');
      fetchColumns();
    } catch { showToast('Gagal menghapus kolom', 'error'); }
  };

  const handleDeleteItem = async (columnId, itemId) => {
    if (!window.confirm('Hapus item ini?')) return;
    try {
      const column = columns.find(c => c._id === columnId);
      const updatedItems = column.items.filter(i => i._id !== itemId);
      await api.put(`/api/footer/${columnId}`, { items: updatedItems });
      showToast('Item berhasil dihapus');
      fetchColumns();
    } catch { showToast('Gagal menghapus item', 'error'); }
  };

  // ── Reorder ───────────────────────────────────────────────────────────────
  const handleMoveColumn = async (index, dir) => {
    const newCols = [...columns];
    const target = dir === 'up' ? index - 1 : index + 1;
    if (target < 0 || target >= newCols.length) return;
    [newCols[index], newCols[target]] = [newCols[target], newCols[index]];
    try {
      await api.put('/api/footer/reorder/bulk', { columns: newCols.map((c, i) => ({ id: c._id, order: i + 1 })) });
      fetchColumns();
    } catch { showToast('Gagal mengubah urutan', 'error'); }
  };

  const handleMoveItem = async (columnId, itemIndex, dir) => {
    const column = columns.find(c => c._id === columnId);
    const its = [...(column.items || [])];
    const target = dir === 'up' ? itemIndex - 1 : itemIndex + 1;
    if (target < 0 || target >= its.length) return;
    [its[itemIndex], its[target]] = [its[target], its[itemIndex]];
    its.forEach((it, i) => (it.order = i + 1));
    try {
      await api.put(`/api/footer/${columnId}`, { items: its });
      fetchColumns();
    } catch { showToast('Gagal mengubah urutan', 'error'); }
  };

  const handleToggleActive = async (column) => {
    try {
      await api.put(`/api/footer/${column._id}`, { isActive: !column.isActive });
      fetchColumns();
    } catch { showToast('Gagal mengubah status', 'error'); }
  };

  const handleSeedDefault = async () => {
    try {
      await api.post('/api/footer/seed');
      showToast('Footer default berhasil dibuat');
      fetchColumns();
    } catch (error) { showToast(error.response?.data?.message || 'Gagal', 'error'); }
  };

  const handleResetAndSeed = async () => {
    if (!window.confirm('Ini akan MENGHAPUS SEMUA kolom dan membuat ulang footer default. Lanjutkan?')) return;
    try {
      await api.delete('/api/footer/all');
      await api.post('/api/footer/seed');
      showToast('Footer berhasil di-reset ke default');
      fetchColumns();
    } catch (error) { showToast(error.response?.data?.message || 'Gagal', 'error'); }
  };

  // ── Icon renderer (keep original SVGs) ───────────────────────────────────
  const getIconComponent = (iconName) => {
    const icons = {
      whatsapp: <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" /></svg>,
      instagram: <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" /></svg>,
      facebook: <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" /></svg>,
      youtube: <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" /></svg>,
      twitter: <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" /></svg>,
      email: <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>,
      phone: <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>,
      location: <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>,
    };
    return icons[iconName] || null;
  };

  const sortedColumns = [...columns].sort((a, b) => a.order - b.order);

  // ── Shared input class ────────────────────────────────────────────────────
  const inputCls = 'w-full px-3 py-2 text-sm bg-white/60 border border-black/[0.08] rounded-xl focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 outline-none transition-all placeholder:text-gray-300';

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

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
            <h1 className="text-2xl font-bold text-gray-800">Manajemen Footer</h1>
            <p className="text-sm text-gray-500">Kelola kolom dan konten footer website</p>
          </div>
          <div className="flex gap-2">
            {columns.length === 0
              ? <button onClick={handleSeedDefault} className="px-4 py-2 bg-gray-600 text-white rounded-lg text-sm hover:bg-gray-700">Buat Footer Default</button>
              : <button onClick={handleResetAndSeed} className="px-4 py-2 bg-orange-500 text-white rounded-lg text-sm hover:bg-orange-600">Reset ke Default</button>
            }
            <button onClick={() => openColumnModal()} className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700">+ Tambah Kolom</button>
          </div>
        </div>
      )}

      {/* ── Footer text settings ──────────────────────────────────────────── */}
      <div className="bg-white/55 backdrop-blur-sm border border-white/75 rounded-2xl shadow-[0_1px_6px_rgba(0,0,0,0.05),inset_0_1px_0_rgba(255,255,255,0.8)] p-4 mb-3">
        <p className="text-xs font-semibold text-gray-500 mb-3">Teks Copyright & Deskripsi</p>
        <div className="space-y-3">
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1.5">
              Teks Copyright <span className="font-normal text-gray-400">(nama sekolah / hak cipta)</span>
            </label>
            <input
              type="text"
              value={footerTextSettings.footerText}
              onChange={e => setFooterTextSettings({ ...footerTextSettings, footerText: e.target.value })}
              className={inputCls}
              placeholder="SMK Kristen 5 Klaten"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1.5">
              Deskripsi Footer <span className="font-normal text-gray-400">(tagline singkat)</span>
            </label>
            <textarea
              value={footerTextSettings.footerDescription}
              onChange={e => setFooterTextSettings({ ...footerTextSettings, footerDescription: e.target.value })}
              className={inputCls}
              rows={2}
              placeholder="Sekolah Menengah Kejuruan berstandar ISO di Klaten"
            />
          </div>
        </div>
      </div>

      {/* ── Column list ───────────────────────────────────────────────────── */}
      {columns.length === 0 ? (
        <div className="py-16 text-center text-gray-400">
          <div className="w-12 h-12 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-3">
            <LayoutTemplate size={20} className="text-gray-300" />
          </div>
          <p className="text-sm">Belum ada kolom footer.</p>
          <p className="text-xs mt-1 text-gray-300">Gunakan tombol + untuk menambahkan kolom.</p>
        </div>
      ) : (
        <div className="space-y-1.5">
          {sortedColumns.map((column, index) => {
            const sortedItems = [...(column.items || [])].sort((a, b) => (a.order || 0) - (b.order || 0));
            const isExpanded = expandedCols.has(column._id);
            const typeLabelShort = columnTypes.find(t => t.value === column.type)?.label || column.type;

            return (
              <div
                key={column._id}
                className={`bg-white/55 backdrop-blur-sm border border-white/75 rounded-2xl shadow-[0_1px_6px_rgba(0,0,0,0.05),inset_0_1px_0_rgba(255,255,255,0.8)] transition-opacity ${!column.isActive ? 'opacity-50' : ''}`}
              >
                {/* Column header row */}
                <div className="flex items-center gap-2.5 px-3.5 py-3">

                  {/* Reorder */}
                  <div className="flex flex-col gap-0.5 flex-shrink-0">
                    <button onClick={() => handleMoveColumn(index, 'up')} disabled={index === 0}
                      className="p-0.5 text-gray-300 hover:text-gray-500 disabled:opacity-20 transition-colors">
                      <ChevronUp size={13} />
                    </button>
                    <button onClick={() => handleMoveColumn(index, 'down')} disabled={index === sortedColumns.length - 1}
                      className="p-0.5 text-gray-300 hover:text-gray-500 disabled:opacity-20 transition-colors">
                      <ChevronDown size={13} />
                    </button>
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-sm font-medium text-gray-800">{column.title}</span>
                      <span className="px-1.5 py-px text-[10px] bg-blue-100/80 text-blue-600 rounded-md font-medium">{typeLabelShort}</span>
                      {column.items?.length > 0 && (
                        <button onClick={() => toggleCol(column._id)}
                          className="px-1.5 py-px text-[10px] bg-gray-100/80 text-gray-500 rounded-md hover:bg-gray-200 transition-colors">
                          {sortedItems.length} item {isExpanded ? '▲' : '▼'}
                        </button>
                      )}
                      {!column.isActive && <span className="px-1.5 py-px text-[10px] bg-gray-100 text-gray-400 rounded-md">Nonaktif</span>}
                    </div>
                    <p className="text-[11px] text-gray-400 mt-0.5">
                      Lebar: {widthOptions.find(w => w.value === column.width)?.label}
                      {column.showBullets === false && <span className="ml-2 text-orange-400">No bullet</span>}
                    </p>
                  </div>

                  {/* Three-dot menu */}
                  <div className="flex-shrink-0">
                    <button onClick={e => openMenuFor(column._id, e, { type: 'column' })}
                      className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-black/5 rounded-xl transition-colors">
                      <MoreHorizontal size={15} />
                    </button>
                  </div>
                </div>

                {/* Items list — expanded */}
                {isExpanded && (
                  <div className="border-t border-black/[0.04] bg-blue-50/20 rounded-b-2xl overflow-hidden">
                    {sortedItems.map((item, itemIndex) => (
                      <div key={item._id || itemIndex}
                        className="flex items-center gap-2.5 px-3.5 py-2.5 border-b border-black/[0.04] last:border-b-0">
                        {/* Item reorder */}
                        <div className="flex flex-col gap-0.5 ml-5 flex-shrink-0">
                          <button onClick={() => handleMoveItem(column._id, itemIndex, 'up')} disabled={itemIndex === 0}
                            className="p-0.5 text-gray-300 hover:text-gray-500 disabled:opacity-20 transition-colors">
                            <ChevronUp size={11} />
                          </button>
                          <button onClick={() => handleMoveItem(column._id, itemIndex, 'down')} disabled={itemIndex === sortedItems.length - 1}
                            className="p-0.5 text-gray-300 hover:text-gray-500 disabled:opacity-20 transition-colors">
                            <ChevronDown size={11} />
                          </button>
                        </div>

                        {/* Item info */}
                        <div className="flex-1 min-w-0 flex items-center gap-1.5">
                          {item.icon && <span className="text-gray-400 flex-shrink-0">{getIconComponent(item.icon)}</span>}
                          <span className="text-[13px] text-gray-700 truncate">{item.content}</span>
                          {item.url && <span className="text-[11px] text-gray-400 truncate">· {item.url}</span>}
                        </div>

                        {/* Item three-dot */}
                        <div className="flex-shrink-0">
                          <button onClick={e => openMenuFor(item._id || `${column._id}-${itemIndex}`, e, { type: 'item', columnId: column._id, item })}
                            className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-black/5 rounded-xl transition-colors">
                            <MoreHorizontal size={14} />
                          </button>
                        </div>
                      </div>
                    ))}

                    {/* Add item button */}
                    <button onClick={() => openItemModal(column._id)}
                      className="w-full flex items-center justify-center gap-1.5 py-2.5 text-xs text-blue-500 hover:text-blue-600 hover:bg-blue-50/50 transition-colors">
                      <Plus size={12} />
                      Tambah Item
                    </button>
                  </div>
                )}

                {/* Show "Tambah Item" even when collapsed if no items */}
                {!isExpanded && column.type !== 'logo' && sortedItems.length === 0 && (
                  <div className="border-t border-black/[0.04]">
                    <button onClick={() => { toggleCol(column._id); openItemModal(column._id); }}
                      className="w-full flex items-center justify-center gap-1.5 py-2.5 text-xs text-gray-400 hover:text-blue-500 hover:bg-blue-50/30 rounded-b-2xl transition-colors">
                      <Plus size={12} />
                      Tambah Item
                    </button>
                  </div>
                )}

                {/* Logo column description preview */}
                {column.type === 'logo' && !isExpanded && column.description && (
                  <div className="border-t border-black/[0.04] px-3.5 py-2 rounded-b-2xl">
                    <p className="text-[11px] text-gray-400 truncate">{column.description}</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* ── Preview modal ─────────────────────────────────────────────────── */}
      {showPreview && (
        <div className="fixed inset-0 bg-black/20 backdrop-blur-md z-50 flex items-start justify-center pt-16 p-4"
          onClick={() => setShowPreview(false)}>
          <div className="bg-white/75 backdrop-blur-2xl border border-white/70 rounded-2xl shadow-[0_8px_40px_rgba(0,0,0,0.14),inset_0_1px_0_rgba(255,255,255,0.9)] w-full max-w-4xl"
            onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between px-5 py-3.5 border-b border-black/[0.06] rounded-t-2xl">
              <div className="flex items-center gap-2">
                <Monitor size={14} className="text-blue-500" />
                <span className="text-sm font-semibold text-gray-700">Preview Footer</span>
              </div>
              <button onClick={() => setShowPreview(false)}
                className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-black/5 rounded-lg transition-colors">
                <X size={14} />
              </button>
            </div>
            <div className="p-4">
              <div className="bg-gradient-to-r from-[#2e41e4] to-[#38bdf8] rounded-xl p-6 shadow-lg">
                <div className="grid gap-6"
                  style={{ gridTemplateColumns: sortedColumns.filter(c => c.isActive).map(c => c.width === 'auto' ? '1fr' : `${c.width}fr`).join(' ') }}>
                  {sortedColumns.filter(c => c.isActive).map(col => (
                    <div key={col._id}>
                      {col.showTitle && <h3 className="text-white font-bold mb-3 text-xs uppercase tracking-wider">{col.title}</h3>}
                      {col.type === 'logo' && col.description && <p className="text-white/80 text-xs">{col.description}</p>}
                      {col.items && col.items.length > 0 && (
                        <ul className={`space-y-1.5 ${col.showBullets !== false ? 'list-disc pl-4' : 'list-none'}`}>
                          {[...col.items].sort((a, b) => (a.order || 0) - (b.order || 0)).map((item, idx) => (
                            <li key={idx} className="flex items-center gap-2">
                              {item.icon && <span className="text-white/70">{getIconComponent(item.icon)}</span>}
                              <span className="text-white/90 text-xs">{item.content}</span>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  ))}
                </div>
                {footerTextSettings.footerText && (
                  <div className="mt-6 pt-4 border-t border-white/20 text-center">
                    <p className="text-white/70 text-xs">{footerTextSettings.footerDescription}</p>
                    <p className="text-white/50 text-[11px] mt-1">© {new Date().getFullYear()} {footerTextSettings.footerText}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Column modal ──────────────────────────────────────────────────── */}
      {showModal && (
        <div className="fixed inset-0 bg-black/20 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-white/80 backdrop-blur-2xl border border-white/70 rounded-2xl shadow-[0_8px_40px_rgba(0,0,0,0.15),inset_0_1px_0_rgba(255,255,255,0.9)] max-w-md w-full max-h-[90vh] overflow-auto">
            <div className="flex items-center justify-between px-5 py-4 border-b border-black/[0.06]">
              <h2 className="text-sm font-semibold text-gray-800">{editingColumn ? 'Edit Kolom' : 'Tambah Kolom'}</h2>
              <button onClick={() => setShowModal(false)} className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-black/5 rounded-lg transition-colors">
                <X size={14} />
              </button>
            </div>
            <div className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1.5">Judul Kolom</label>
                <input type="text" value={columnForm.title}
                  onChange={e => setColumnForm({ ...columnForm, title: e.target.value })}
                  className={inputCls} placeholder="Contoh: Link Lainnya" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1.5">Tipe Kolom</label>
                  <div className="relative">
                    <select value={columnForm.type}
                      onChange={e => setColumnForm({ ...columnForm, type: e.target.value })}
                      className={`${inputCls} appearance-none pr-8`}>
                      {columnTypes.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                    </select>
                    <ChevronDown size={13} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1.5">Lebar Kolom</label>
                  <div className="relative">
                    <select value={columnForm.width}
                      onChange={e => setColumnForm({ ...columnForm, width: e.target.value })}
                      className={`${inputCls} appearance-none pr-8`}>
                      {widthOptions.map(w => <option key={w.value} value={w.value}>{w.label}</option>)}
                    </select>
                    <ChevronDown size={13} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                  </div>
                </div>
              </div>
              {columnForm.type === 'logo' && (
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1.5">Deskripsi</label>
                  <textarea value={columnForm.description}
                    onChange={e => setColumnForm({ ...columnForm, description: e.target.value })}
                    className={inputCls} rows={3} placeholder="Alamat atau deskripsi lainnya" />
                </div>
              )}
              <div className="flex flex-wrap gap-4 pt-1">
                {[
                  { key: 'showTitle', label: 'Tampilkan Judul' },
                  { key: 'showBullets', label: 'Tampilkan Bullet' },
                  { key: 'isActive', label: 'Aktif' },
                ].map(({ key, label }) => (
                  <label key={key} className="flex items-center gap-2 cursor-pointer select-none">
                    <input type="checkbox" checked={columnForm[key]}
                      onChange={e => setColumnForm({ ...columnForm, [key]: e.target.checked })}
                      className="w-3.5 h-3.5 rounded accent-blue-600" />
                    <span className="text-xs text-gray-700">{label}</span>
                  </label>
                ))}
              </div>
            </div>
            <div className="flex justify-end gap-2 px-5 pb-5 pt-2 border-t border-black/[0.06]">
              <button onClick={() => setShowModal(false)} className="px-4 py-2 text-xs text-gray-600 hover:bg-black/5 rounded-xl transition-colors">Batal</button>
              <button onClick={handleSaveColumn} className="px-4 py-2 text-xs bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors">Simpan</button>
            </div>
          </div>
        </div>
      )}

      {/* ── Item modal ────────────────────────────────────────────────────── */}
      {showItemModal && (
        <div className="fixed inset-0 bg-black/20 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-white/80 backdrop-blur-2xl border border-white/70 rounded-2xl shadow-[0_8px_40px_rgba(0,0,0,0.15),inset_0_1px_0_rgba(255,255,255,0.9)] max-w-md w-full">
            <div className="flex items-center justify-between px-5 py-4 border-b border-black/[0.06]">
              <h2 className="text-sm font-semibold text-gray-800">{editingItem ? 'Edit Item' : 'Tambah Item'}</h2>
              <button onClick={() => setShowItemModal(false)} className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-black/5 rounded-lg transition-colors">
                <X size={14} />
              </button>
            </div>
            <div className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1.5">Tipe Item</label>
                <div className="relative">
                  <select value={itemForm.type}
                    onChange={e => setItemForm({ ...itemForm, type: e.target.value })}
                    className={`${inputCls} appearance-none pr-8`}>
                    {itemTypes.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                  </select>
                  <ChevronDown size={13} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1.5">Konten / Label</label>
                <input type="text" value={itemForm.content}
                  onChange={e => setItemForm({ ...itemForm, content: e.target.value })}
                  className={inputCls} placeholder="Tentang Kami" />
              </div>
              {(itemForm.type === 'link' || itemForm.type === 'icon-link') && (
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1.5">URL</label>
                    <input type="text" value={itemForm.url}
                      onChange={e => setItemForm({ ...itemForm, url: e.target.value })}
                      className={inputCls} placeholder="/tentang" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1.5">Target</label>
                    <div className="relative">
                      <select value={itemForm.target}
                        onChange={e => setItemForm({ ...itemForm, target: e.target.value })}
                        className={`${inputCls} appearance-none pr-8`}>
                        <option value="_self">Same Tab</option>
                        <option value="_blank">New Tab</option>
                      </select>
                      <ChevronDown size={13} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                    </div>
                  </div>
                </div>
              )}
              {itemForm.type === 'icon-link' && (
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1.5">Icon</label>
                  <div className="relative">
                    <select value={itemForm.icon}
                      onChange={e => setItemForm({ ...itemForm, icon: e.target.value })}
                      className={`${inputCls} appearance-none pr-8`}>
                      <option value="">Pilih Icon</option>
                      {iconOptions.map(ic => <option key={ic.value} value={ic.value}>{ic.label}</option>)}
                    </select>
                    <ChevronDown size={13} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                  </div>
                </div>
              )}
            </div>
            <div className="flex justify-end gap-2 px-5 pb-5 pt-2 border-t border-black/[0.06]">
              <button onClick={() => setShowItemModal(false)} className="px-4 py-2 text-xs text-gray-600 hover:bg-black/5 rounded-xl transition-colors">Batal</button>
              <button onClick={handleSaveItem} className="px-4 py-2 text-xs bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors">Simpan</button>
            </div>
          </div>
        </div>
      )}

      {/* ── Context menu portal ───────────────────────────────────────────── */}
      {openMenu && (() => {
        if (openMenu.type === 'column') {
          const col = columns.find(c => c._id === openMenu.id);
          if (!col) return null;
          return createPortal(
            <>
              <div className="fixed inset-0 z-[90]" onClick={() => setOpenMenu(null)} />
              <div className="fixed bg-white/85 backdrop-blur-2xl border border-white/70 rounded-xl shadow-[0_4px_24px_rgba(0,0,0,0.12),inset_0_1px_0_rgba(255,255,255,0.9)] py-1 min-w-[160px] z-[100]"
                style={{ top: openMenu.top, right: openMenu.right }}>
                <button onClick={() => { toggleCol(col._id); openItemModal(col._id); setOpenMenu(null); }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-xs text-gray-700 hover:bg-black/[0.05] transition-colors">
                  <Plus size={13} className="text-blue-400" />Tambah Item
                </button>
                <button onClick={() => { handleToggleActive(col); setOpenMenu(null); }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-xs text-gray-700 hover:bg-black/[0.05] transition-colors">
                  {col.isActive ? <EyeOff size={13} className="text-gray-400" /> : <Eye size={13} className="text-emerald-500" />}
                  {col.isActive ? 'Nonaktifkan' : 'Aktifkan'}
                </button>
                <button onClick={() => { openColumnModal(col); setOpenMenu(null); }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-xs text-gray-700 hover:bg-black/[0.05] transition-colors">
                  <Pencil size={13} className="text-blue-400" />Edit Kolom
                </button>
                <div className="mx-2 my-0.5 h-px bg-black/[0.06]" />
                <button onClick={() => { handleDeleteColumn(col._id); setOpenMenu(null); }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-xs text-red-500 hover:bg-red-50 transition-colors">
                  <Trash2 size={13} />Hapus Kolom
                </button>
              </div>
            </>,
            document.body
          );
        }

        if (openMenu.type === 'item') {
          const { columnId, item } = openMenu;
          return createPortal(
            <>
              <div className="fixed inset-0 z-[90]" onClick={() => setOpenMenu(null)} />
              <div className="fixed bg-white/85 backdrop-blur-2xl border border-white/70 rounded-xl shadow-[0_4px_24px_rgba(0,0,0,0.12),inset_0_1px_0_rgba(255,255,255,0.9)] py-1 min-w-[140px] z-[100]"
                style={{ top: openMenu.top, right: openMenu.right }}>
                <button onClick={() => { openItemModal(columnId, item); setOpenMenu(null); }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-xs text-gray-700 hover:bg-black/[0.05] transition-colors">
                  <Pencil size={13} className="text-blue-400" />Edit
                </button>
                <div className="mx-2 my-0.5 h-px bg-black/[0.06]" />
                <button onClick={() => { handleDeleteItem(columnId, item._id); setOpenMenu(null); }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-xs text-red-500 hover:bg-red-50 transition-colors">
                  <Trash2 size={13} />Hapus
                </button>
              </div>
            </>,
            document.body
          );
        }

        return null;
      })()}
    </div>
  );
};

export default FooterManagement;
