import { useState, useEffect } from 'react';
import api from '../services/api';

const FooterManagement = () => {
  const [columns, setColumns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showItemModal, setShowItemModal] = useState(false);
  const [editingColumn, setEditingColumn] = useState(null);
  const [editingItem, setEditingItem] = useState(null);
  const [editingColumnId, setEditingColumnId] = useState(null);
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

  const [columnForm, setColumnForm] = useState({
    title: '',
    type: 'links',
    width: 'auto',
    showTitle: true,
    showBullets: true,
    isActive: true,
    description: '',
    logoUrl: '',
    logoSize: 'medium',
  });

  const [itemForm, setItemForm] = useState({
    type: 'link',
    content: '',
    url: '',
    icon: '',
    target: '_self',
  });

  const columnTypes = [
    { value: 'logo', label: 'Logo & Deskripsi' },
    { value: 'links', label: 'Link' },
    { value: 'social', label: 'Social Media' },
    { value: 'text', label: 'Teks' },
    { value: 'custom', label: 'Custom' },
  ];

  const itemTypes = [
    { value: 'text', label: 'Teks Biasa' },
    { value: 'link', label: 'Link' },
    { value: 'icon-link', label: 'Link dengan Icon' },
  ];

  const iconOptions = [
    { value: 'whatsapp', label: 'WhatsApp' },
    { value: 'instagram', label: 'Instagram' },
    { value: 'facebook', label: 'Facebook' },
    { value: 'youtube', label: 'YouTube' },
    { value: 'twitter', label: 'Twitter' },
    { value: 'tiktok', label: 'TikTok' },
    { value: 'linkedin', label: 'LinkedIn' },
    { value: 'email', label: 'Email' },
    { value: 'phone', label: 'Telepon' },
    { value: 'location', label: 'Lokasi' },
  ];

  const widthOptions = [
    { value: 'auto', label: 'Auto' },
    { value: '1', label: '1 Kolom' },
    { value: '2', label: '2 Kolom' },
    { value: '3', label: '3 Kolom' },
    { value: '4', label: '4 Kolom' },
  ];

  useEffect(() => {
    fetchColumns();
  }, []);

  const fetchColumns = async () => {
    try {
      const res = await api.get('/api/footer/all');
      setColumns(res.data.data.columns || []);
    } catch (error) {
      showToast('Gagal memuat data footer', 'error');
    } finally {
      setLoading(false);
    }
  };

  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: '', type: 'success' }), 3000);
  };

  const openColumnModal = (column = null) => {
    if (column) {
      setEditingColumn(column);
      setColumnForm({
        title: column.title || '',
        type: column.type || 'links',
        width: column.width || 'auto',
        showTitle: column.showTitle !== false,
        showBullets: column.showBullets !== false,
        isActive: column.isActive !== false,
        description: column.description || '',
        logoUrl: column.logoUrl || '',
        logoSize: column.logoSize || 'medium',
      });
    } else {
      setEditingColumn(null);
      setColumnForm({
        title: '',
        type: 'links',
        width: 'auto',
        showTitle: true,
        showBullets: true,
        isActive: true,
        description: '',
        logoUrl: '',
        logoSize: 'medium',
      });
    }
    setShowModal(true);
  };

  const openItemModal = (columnId, item = null) => {
    setEditingColumnId(columnId);
    if (item) {
      setEditingItem(item);
      setItemForm({
        type: item.type || 'link',
        content: item.content || '',
        url: item.url || '',
        icon: item.icon || '',
        target: item.target || '_self',
      });
    } else {
      setEditingItem(null);
      setItemForm({
        type: 'link',
        content: '',
        url: '',
        icon: '',
        target: '_self',
      });
    }
    setShowItemModal(true);
  };

  const handleSaveColumn = async () => {
    if (!columnForm.title.trim()) {
      showToast('Judul kolom harus diisi', 'error');
      return;
    }

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

  const handleSaveItem = async () => {
    if (!itemForm.content.trim()) {
      showToast('Konten item harus diisi', 'error');
      return;
    }

    try {
      const column = columns.find((c) => c._id === editingColumnId);
      let updatedItems = [...(column.items || [])];

      if (editingItem) {
        // Update existing item
        const itemIndex = updatedItems.findIndex((i) => i._id === editingItem._id);
        if (itemIndex > -1) {
          updatedItems[itemIndex] = { ...updatedItems[itemIndex], ...itemForm };
        }
      } else {
        // Add new item
        const maxOrder = updatedItems.reduce((max, i) => Math.max(max, i.order || 0), 0);
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

  const handleDeleteColumn = async (id) => {
    if (!window.confirm('Hapus kolom ini?')) return;
    try {
      await api.delete(`/api/footer/${id}`);
      showToast('Kolom berhasil dihapus');
      fetchColumns();
    } catch (error) {
      showToast('Gagal menghapus kolom', 'error');
    }
  };

  const handleDeleteItem = async (columnId, itemId) => {
    if (!window.confirm('Hapus item ini?')) return;
    try {
      const column = columns.find((c) => c._id === columnId);
      const updatedItems = column.items.filter((i) => i._id !== itemId);
      await api.put(`/api/footer/${columnId}`, { items: updatedItems });
      showToast('Item berhasil dihapus');
      fetchColumns();
    } catch (error) {
      showToast('Gagal menghapus item', 'error');
    }
  };

  const handleMoveColumn = async (index, direction) => {
    const newColumns = [...columns];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= newColumns.length) return;

    [newColumns[index], newColumns[targetIndex]] = [newColumns[targetIndex], newColumns[index]];

    const reorderData = newColumns.map((col, i) => ({ id: col._id, order: i + 1 }));

    try {
      await api.put('/api/footer/reorder/bulk', { columns: reorderData });
      fetchColumns();
    } catch (error) {
      showToast('Gagal mengubah urutan', 'error');
    }
  };

  const handleMoveItem = async (columnId, itemIndex, direction) => {
    const column = columns.find((c) => c._id === columnId);
    const items = [...(column.items || [])];
    const targetIndex = direction === 'up' ? itemIndex - 1 : itemIndex + 1;
    if (targetIndex < 0 || targetIndex >= items.length) return;

    [items[itemIndex], items[targetIndex]] = [items[targetIndex], items[itemIndex]];
    items.forEach((item, i) => (item.order = i + 1));

    try {
      await api.put(`/api/footer/${columnId}`, { items });
      fetchColumns();
    } catch (error) {
      showToast('Gagal mengubah urutan', 'error');
    }
  };

  const handleToggleActive = async (column) => {
    try {
      await api.put(`/api/footer/${column._id}`, { isActive: !column.isActive });
      fetchColumns();
    } catch (error) {
      showToast('Gagal mengubah status', 'error');
    }
  };

  const handleSeedDefault = async () => {
    try {
      await api.post('/api/footer/seed');
      showToast('Footer default berhasil dibuat');
      fetchColumns();
    } catch (error) {
      showToast(error.response?.data?.message || 'Gagal membuat footer default', 'error');
    }
  };

  const handleResetAndSeed = async () => {
    if (!window.confirm('Ini akan MENGHAPUS SEMUA kolom dan membuat ulang footer default. Lanjutkan?'))
      return;
    try {
      await api.delete('/api/footer/all');
      await api.post('/api/footer/seed');
      showToast('Footer berhasil di-reset ke default');
      fetchColumns();
    } catch (error) {
      showToast(error.response?.data?.message || 'Gagal reset footer', 'error');
    }
  };

  const getIconComponent = (iconName) => {
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

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Toast */}
      {toast.show && (
        <div
          className={`fixed top-4 right-4 z-50 px-6 py-3 rounded-lg shadow-lg ${
            toast.type === 'error' ? 'bg-red-500' : 'bg-green-500'
          } text-white`}
        >
          {toast.message}
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Manajemen Footer</h1>
          <p className="text-gray-600">Kelola kolom dan konten footer website</p>
        </div>
        <div className="flex gap-2">
          {columns.length === 0 ? (
            <button
              onClick={handleSeedDefault}
              className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
            >
              Buat Footer Default
            </button>
          ) : (
            <button
              onClick={handleResetAndSeed}
              className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600"
            >
              Reset ke Default
            </button>
          )}
          <button
            onClick={() => openColumnModal()}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            + Tambah Kolom
          </button>
        </div>
      </div>

      {/* Footer Preview */}
      {columns.length > 0 && (
        <div className="mb-6">
          <h2 className="text-sm font-semibold text-gray-600 mb-3">Preview Footer</h2>
          <div className="bg-gradient-to-r from-[#2e41e4] to-[#38bdf8] rounded-lg p-8 shadow-lg">
            <div
              className="grid gap-8"
              style={{
                gridTemplateColumns: columns
                  .filter((c) => c.isActive)
                  .map((c) => (c.width === 'auto' ? '1fr' : `${c.width}fr`))
                  .join(' '),
              }}
            >
              {columns
                .filter((c) => c.isActive)
                .sort((a, b) => a.order - b.order)
                .map((col) => (
                  <div key={col._id}>
                    {col.showTitle && (
                      <h3 className="text-white font-bold mb-4 text-sm uppercase tracking-wider">
                        {col.title}
                      </h3>
                    )}
                    {col.type === 'logo' && col.description && (
                      <p className="text-white/80 text-sm">{col.description}</p>
                    )}
                    {col.items && col.items.length > 0 && (
                      <ul className={`space-y-2 ${col.showBullets !== false ? 'list-disc pl-4' : 'list-none'}`}>
                        {col.items
                          .sort((a, b) => a.order - b.order)
                          .map((item, idx) => (
                            <li key={idx} className="flex items-center gap-2">
                              {item.icon && getIconComponent(item.icon)}
                              <span className="text-white/90 text-sm hover:text-white">
                                {item.content}
                              </span>
                            </li>
                          ))}
                      </ul>
                    )}
                  </div>
                ))}
            </div>
          </div>
        </div>
      )}

      {/* Columns List */}
      {columns.length > 0 && (
        <h2 className="text-sm font-semibold text-gray-600 mb-3">Daftar Kolom Footer</h2>
      )}
      <div className="space-y-4">
        {columns.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-12 text-center text-gray-500">
            <p className="text-4xl mb-4">📋</p>
            <p>Belum ada kolom footer. Klik "Buat Footer Default" atau "Tambah Kolom" untuk memulai.</p>
          </div>
        ) : (
          columns
            .sort((a, b) => a.order - b.order)
            .map((column, index) => (
              <div
                key={column._id}
                className={`bg-white rounded-lg shadow-md overflow-hidden ${
                  !column.isActive ? 'opacity-60' : ''
                }`}
              >
                {/* Column Header */}
                <div className="flex items-center justify-between p-4 bg-gray-50 border-b">
                  <div className="flex items-center gap-4">
                    <div className="flex flex-col gap-1">
                      <button
                        onClick={() => handleMoveColumn(index, 'up')}
                        disabled={index === 0}
                        className="text-gray-400 hover:text-gray-600 disabled:opacity-30"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                        </svg>
                      </button>
                      <button
                        onClick={() => handleMoveColumn(index, 'down')}
                        disabled={index === columns.length - 1}
                        className="text-gray-400 hover:text-gray-600 disabled:opacity-30"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </button>
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-800">{column.title}</h3>
                      <div className="flex items-center gap-2 text-xs text-gray-500">
                        <span className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded">
                          {columnTypes.find((t) => t.value === column.type)?.label || column.type}
                        </span>
                        <span>Lebar: {widthOptions.find((w) => w.value === column.width)?.label}</span>
                        <span>{column.items?.length || 0} item</span>
                        {column.showBullets === false && <span className="text-orange-600">No Bullet</span>}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleToggleActive(column)}
                      className={`px-3 py-1 rounded text-xs font-medium ${
                        column.isActive
                          ? 'bg-green-100 text-green-700 hover:bg-green-200'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      {column.isActive ? 'Aktif' : 'Nonaktif'}
                    </button>
                    <button
                      onClick={() => openColumnModal(column)}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </button>
                    <button
                      onClick={() => handleDeleteColumn(column._id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>

                {/* Column Items */}
                <div className="p-4">
                  {column.type === 'logo' ? (
                    <div className="text-sm text-gray-600">
                      <p className="font-medium">Deskripsi:</p>
                      <p className="text-gray-500">{column.description || 'Belum ada deskripsi'}</p>
                    </div>
                  ) : (
                    <>
                      {column.items && column.items.length > 0 ? (
                        <div className="space-y-2">
                          {column.items
                            .sort((a, b) => a.order - b.order)
                            .map((item, itemIndex) => (
                              <div
                                key={item._id || itemIndex}
                                className="flex items-center justify-between p-2 bg-gray-50 rounded"
                              >
                                <div className="flex items-center gap-3">
                                  <div className="flex flex-col">
                                    <button
                                      onClick={() => handleMoveItem(column._id, itemIndex, 'up')}
                                      disabled={itemIndex === 0}
                                      className="text-gray-400 hover:text-gray-600 disabled:opacity-30"
                                    >
                                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                                      </svg>
                                    </button>
                                    <button
                                      onClick={() => handleMoveItem(column._id, itemIndex, 'down')}
                                      disabled={itemIndex === column.items.length - 1}
                                      className="text-gray-400 hover:text-gray-600 disabled:opacity-30"
                                    >
                                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                      </svg>
                                    </button>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    {item.icon && (
                                      <span className="text-gray-500">{getIconComponent(item.icon)}</span>
                                    )}
                                    <span className="text-sm">{item.content}</span>
                                    {item.url && (
                                      <span className="text-xs text-gray-400 truncate max-w-[200px]">
                                        ({item.url})
                                      </span>
                                    )}
                                  </div>
                                </div>
                                <div className="flex gap-1">
                                  <button
                                    onClick={() => openItemModal(column._id, item)}
                                    className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                                  >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                    </svg>
                                  </button>
                                  <button
                                    onClick={() => handleDeleteItem(column._id, item._id)}
                                    className="p-1 text-red-600 hover:bg-red-50 rounded"
                                  >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                  </button>
                                </div>
                              </div>
                            ))}
                        </div>
                      ) : (
                        <p className="text-sm text-gray-500 text-center py-2">Belum ada item</p>
                      )}
                      <button
                        onClick={() => openItemModal(column._id)}
                        className="mt-3 w-full py-2 border-2 border-dashed border-gray-300 text-gray-500 rounded hover:border-blue-400 hover:text-blue-500 text-sm"
                      >
                        + Tambah Item
                      </button>
                    </>
                  )}
                </div>
              </div>
            ))
        )}
      </div>

      {/* Column Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="p-4 border-b flex justify-between items-center">
              <h2 className="text-lg font-semibold">
                {editingColumn ? 'Edit Kolom' : 'Tambah Kolom'}
              </h2>
              <button onClick={() => setShowModal(false)} className="text-gray-500 hover:text-gray-700">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="p-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Judul Kolom</label>
                <input
                  type="text"
                  value={columnForm.title}
                  onChange={(e) => setColumnForm({ ...columnForm, title: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Contoh: Link Lainnya"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tipe Kolom</label>
                <select
                  value={columnForm.type}
                  onChange={(e) => setColumnForm({ ...columnForm, type: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  {columnTypes.map((type) => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Lebar Kolom</label>
                <select
                  value={columnForm.width}
                  onChange={(e) => setColumnForm({ ...columnForm, width: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  {widthOptions.map((w) => (
                    <option key={w.value} value={w.value}>
                      {w.label}
                    </option>
                  ))}
                </select>
              </div>
              {columnForm.type === 'logo' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Deskripsi</label>
                  <textarea
                    value={columnForm.description}
                    onChange={(e) => setColumnForm({ ...columnForm, description: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    rows={3}
                    placeholder="Alamat atau deskripsi lainnya"
                  />
                </div>
              )}
              <div className="flex flex-wrap gap-4">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={columnForm.showTitle}
                    onChange={(e) => setColumnForm({ ...columnForm, showTitle: e.target.checked })}
                    className="rounded border-gray-300"
                  />
                  <span className="text-sm">Tampilkan Judul</span>
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={columnForm.showBullets}
                    onChange={(e) => setColumnForm({ ...columnForm, showBullets: e.target.checked })}
                    className="rounded border-gray-300"
                  />
                  <span className="text-sm">Tampilkan Bullet</span>
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={columnForm.isActive}
                    onChange={(e) => setColumnForm({ ...columnForm, isActive: e.target.checked })}
                    className="rounded border-gray-300"
                  />
                  <span className="text-sm">Aktif</span>
                </label>
              </div>
            </div>
            <div className="p-4 border-t flex gap-2 justify-end">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 border rounded-lg hover:bg-gray-50"
              >
                Batal
              </button>
              <button
                onClick={handleSaveColumn}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Simpan
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Item Modal */}
      {showItemModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg w-full max-w-lg">
            <div className="p-4 border-b flex justify-between items-center">
              <h2 className="text-lg font-semibold">{editingItem ? 'Edit Item' : 'Tambah Item'}</h2>
              <button onClick={() => setShowItemModal(false)} className="text-gray-500 hover:text-gray-700">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="p-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tipe Item</label>
                <select
                  value={itemForm.type}
                  onChange={(e) => setItemForm({ ...itemForm, type: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  {itemTypes.map((type) => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Konten/Label</label>
                <input
                  type="text"
                  value={itemForm.content}
                  onChange={(e) => setItemForm({ ...itemForm, content: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="Contoh: Tentang Kami"
                />
              </div>
              {(itemForm.type === 'link' || itemForm.type === 'icon-link') && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">URL</label>
                    <input
                      type="text"
                      value={itemForm.url}
                      onChange={(e) => setItemForm({ ...itemForm, url: e.target.value })}
                      className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                      placeholder="/tentang atau https://..."
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Target</label>
                    <select
                      value={itemForm.target}
                      onChange={(e) => setItemForm({ ...itemForm, target: e.target.value })}
                      className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="_self">Same Tab</option>
                      <option value="_blank">New Tab</option>
                    </select>
                  </div>
                </>
              )}
              {itemForm.type === 'icon-link' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Icon</label>
                  <select
                    value={itemForm.icon}
                    onChange={(e) => setItemForm({ ...itemForm, icon: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Pilih Icon</option>
                    {iconOptions.map((icon) => (
                      <option key={icon.value} value={icon.value}>
                        {icon.label}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>
            <div className="p-4 border-t flex gap-2 justify-end">
              <button
                onClick={() => setShowItemModal(false)}
                className="px-4 py-2 border rounded-lg hover:bg-gray-50"
              >
                Batal
              </button>
              <button
                onClick={handleSaveItem}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Simpan
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FooterManagement;
