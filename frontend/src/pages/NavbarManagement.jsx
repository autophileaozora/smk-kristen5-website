import { useState, useEffect } from 'react';
import api from '../services/api';

const NavbarManagement = ({ embedded = false }) => {
  const [items, setItems] = useState([]);
  const [parents, setParents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [reordering, setReordering] = useState(false);

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
      const payload = {
        ...formData,
        parent: formData.parent || null,
      };

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
    if (!window.confirm(`Hapus menu "${item.label}"? ${item.isDropdown ? 'Semua submenu juga akan terhapus.' : ''}`)) {
      return;
    }

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
    const currentIndex = siblings.findIndex((s) => s._id === item._id);
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
    const currentIndex = siblings.findIndex((s) => s._id === item._id);
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
      // Delete all first
      await api.delete('/api/navbar/all');
      // Then seed
      await api.post('/api/navbar/seed');
      showToast('Menu berhasil di-reset ke default');
      fetchItems();
      fetchParents();
    } catch (error) {
      showToast(error.response?.data?.message || 'Gagal reset menu', 'error');
    }
  };

  // Group items: top-level and children
  const topLevelItems = items.filter((item) => !item.parent).sort((a, b) => a.order - b.order);
  const getChildren = (parentId) =>
    items.filter((item) => (item.parent?._id || item.parent) === parentId).sort((a, b) => a.order - b.order);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className={embedded ? '' : 'p-6'}>
      {/* Toast */}
      {toast && (
        <div
          className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-lg shadow-lg ${
            toast.type === 'error' ? 'bg-red-500' : 'bg-green-500'
          } text-white`}
        >
          {toast.message}
        </div>
      )}

      {/* Header */}
      {!embedded ? (
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Manajemen Navbar</h1>
          <p className="text-gray-600">Kelola menu navigasi website</p>
        </div>
        <div className="flex gap-2">
          {items.length === 0 ? (
            <button
              onClick={handleSeedDefault}
              className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
            >
              🌱 Buat Menu Default
            </button>
          ) : (
            <button
              onClick={handleResetAndSeed}
              className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600"
            >
              🔄 Reset ke Default
            </button>
          )}
          <button
            onClick={() => openModal()}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            + Tambah Menu
          </button>
        </div>
      </div>
      ) : (
      <div className="flex items-center justify-end gap-2 mb-4">
        {items.length === 0 ? (
          <button
            onClick={handleSeedDefault}
            className="px-3 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 text-sm"
          >
            🌱 Buat Menu Default
          </button>
        ) : (
          <button
            onClick={handleResetAndSeed}
            className="px-3 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 text-sm"
          >
            🔄 Reset ke Default
          </button>
        )}
        <button
          onClick={() => openModal()}
          className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
        >
          + Tambah Menu
        </button>
      </div>
      )}

      {/* Navbar Preview */}
      {items.length > 0 && (
        <div className="mb-6">
          <h2 className="text-sm font-semibold text-gray-600 mb-3">Preview Navbar</h2>
          <div className="bg-[#2e41e4] rounded-lg p-4 shadow-lg">
            <div className="flex items-center justify-between">
              {/* Logo Preview */}
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                  <span className="text-white text-xl">🏫</span>
                </div>
                <div className="text-white">
                  <p className="text-[8px] uppercase tracking-wider opacity-80">Sekolah Menengah Kejuruan</p>
                  <p className="text-sm font-bold text-yellow-300">KRISTEN 5 KLATEN</p>
                </div>
              </div>

              {/* Menu Preview */}
              <div className="flex items-center gap-6">
                {topLevelItems
                  .filter((item) => item.isActive && !item.isButton)
                  .map((item) => {
                    const children = getChildren(item._id).filter((c) => c.isActive);
                    return (
                      <div key={item._id} className="relative group">
                        <span className="text-white text-sm cursor-pointer hover:text-yellow-300 flex items-center gap-1">
                          {item.label}
                          {item.isDropdown && children.length > 0 && (
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                          )}
                        </span>
                        {/* Dropdown Preview */}
                        {item.isDropdown && children.length > 0 && (
                          <div className="absolute top-full left-0 mt-2 bg-white rounded-lg shadow-xl py-2 min-w-[150px] hidden group-hover:block z-10">
                            {children.map((child) => (
                              <div
                                key={child._id}
                                className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                              >
                                {child.label}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })}
              </div>

              {/* Button & Search Preview */}
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 flex items-center justify-center">
                  <svg className="w-4 h-4 text-white" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                {topLevelItems
                  .filter((item) => item.isActive && item.isButton)
                  .map((item) => (
                    <span
                      key={item._id}
                      className="px-4 py-2 text-xs font-semibold text-yellow-300 border-2 border-yellow-300 rounded-full"
                    >
                      {item.label}
                    </span>
                  ))}
              </div>
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-2">
            * Hover pada menu dropdown untuk melihat submenu
          </p>
        </div>
      )}

      {/* Menu List */}
      {items.length > 0 && (
        <h2 className="text-sm font-semibold text-gray-600 mb-3">Daftar Menu</h2>
      )}
      <div className="bg-white rounded-lg shadow-md">
        {items.length === 0 ? (
          <div className="p-12 text-center text-gray-500">
            <p className="text-4xl mb-4">📋</p>
            <p>Belum ada menu. Klik "Buat Menu Default" atau "Tambah Menu" untuk memulai.</p>
          </div>
        ) : (
          <div className="divide-y">
            {topLevelItems.map((item, index) => {
              const children = getChildren(item._id);
              return (
                <div key={item._id}>
                  {/* Parent Item */}
                  <div
                    className={`flex items-center justify-between p-4 hover:bg-gray-50 ${
                      !item.isActive ? 'opacity-50' : ''
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      {/* Order Buttons */}
                      <div className="flex flex-col gap-1">
                        <button
                          onClick={() => handleMoveUp(item, topLevelItems)}
                          disabled={index === 0 || reordering}
                          className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-30"
                        >
                          ▲
                        </button>
                        <button
                          onClick={() => handleMoveDown(item, topLevelItems)}
                          disabled={index === topLevelItems.length - 1 || reordering}
                          className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-30"
                        >
                          ▼
                        </button>
                      </div>

                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-gray-800">{item.label}</span>
                          {item.isDropdown && (
                            <span className="px-2 py-0.5 text-xs bg-purple-100 text-purple-700 rounded">
                              Dropdown
                            </span>
                          )}
                          {item.isButton && (
                            <span className="px-2 py-0.5 text-xs bg-blue-100 text-blue-700 rounded">
                              Button
                            </span>
                          )}
                          {!item.isActive && (
                            <span className="px-2 py-0.5 text-xs bg-gray-100 text-gray-600 rounded">
                              Nonaktif
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-500">{item.url}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleToggleActive(item)}
                        className={`p-2 rounded ${
                          item.isActive
                            ? 'text-green-600 hover:bg-green-50'
                            : 'text-gray-400 hover:bg-gray-100'
                        }`}
                        title={item.isActive ? 'Nonaktifkan' : 'Aktifkan'}
                      >
                        {item.isActive ? '✓' : '○'}
                      </button>
                      <button
                        onClick={() => openModal(item)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded"
                        title="Edit"
                      >
                        ✏️
                      </button>
                      <button
                        onClick={() => handleDelete(item)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded"
                        title="Hapus"
                      >
                        🗑️
                      </button>
                    </div>
                  </div>

                  {/* Children (Submenu) */}
                  {children.length > 0 && (
                    <div className="pl-12 bg-gray-50 border-l-4 border-purple-200">
                      {children.map((child, childIndex) => (
                        <div
                          key={child._id}
                          className={`flex items-center justify-between p-3 border-b border-gray-100 last:border-b-0 ${
                            !child.isActive ? 'opacity-50' : ''
                          }`}
                        >
                          <div className="flex items-center gap-4">
                            <div className="flex flex-col gap-1">
                              <button
                                onClick={() => handleMoveUp(child, children)}
                                disabled={childIndex === 0 || reordering}
                                className="p-0.5 text-xs text-gray-400 hover:text-gray-600 disabled:opacity-30"
                              >
                                ▲
                              </button>
                              <button
                                onClick={() => handleMoveDown(child, children)}
                                disabled={childIndex === children.length - 1 || reordering}
                                className="p-0.5 text-xs text-gray-400 hover:text-gray-600 disabled:opacity-30"
                              >
                                ▼
                              </button>
                            </div>
                            <div>
                              <span className="text-gray-700">↳ {child.label}</span>
                              <p className="text-xs text-gray-500">{child.url}</p>
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleToggleActive(child)}
                              className={`p-1.5 rounded text-sm ${
                                child.isActive
                                  ? 'text-green-600 hover:bg-green-50'
                                  : 'text-gray-400 hover:bg-gray-100'
                              }`}
                            >
                              {child.isActive ? '✓' : '○'}
                            </button>
                            <button
                              onClick={() => openModal(child)}
                              className="p-1.5 text-blue-600 hover:bg-blue-50 rounded text-sm"
                            >
                              ✏️
                            </button>
                            <button
                              onClick={() => handleDelete(child)}
                              className="p-1.5 text-red-600 hover:bg-red-50 rounded text-sm"
                            >
                              🗑️
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
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-lg w-full max-h-[90vh] overflow-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold">
                  {editingItem ? 'Edit Menu' : 'Tambah Menu'}
                </h2>
                <button onClick={closeModal} className="text-gray-400 hover:text-gray-600">
                  ✕
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Label *
                  </label>
                  <input
                    type="text"
                    value={formData.label}
                    onChange={(e) => setFormData({ ...formData, label: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="Beranda"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    URL
                  </label>
                  <input
                    type="text"
                    value={formData.url}
                    onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="/"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Parent (untuk submenu)
                  </label>
                  <select
                    value={formData.parent}
                    onChange={(e) => setFormData({ ...formData, parent: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">-- Top Level --</option>
                    {parents
                      .filter((p) => p._id !== editingItem?._id)
                      .map((parent) => (
                        <option key={parent._id} value={parent._id}>
                          {parent.label}
                        </option>
                      ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Target
                    </label>
                    <select
                      value={formData.target}
                      onChange={(e) => setFormData({ ...formData, target: e.target.value })}
                      className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="_self">Same Tab</option>
                      <option value="_blank">New Tab</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Icon (opsional)
                    </label>
                    <input
                      type="text"
                      value={formData.icon}
                      onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                      className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                      placeholder="🏠"
                    />
                  </div>
                </div>

                <div className="space-y-3 pt-2">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.isDropdown}
                      onChange={(e) =>
                        setFormData({ ...formData, isDropdown: e.target.checked })
                      }
                      className="w-4 h-4 rounded text-blue-600"
                    />
                    <span className="text-sm text-gray-700">
                      Jadikan Dropdown (memiliki submenu)
                    </span>
                  </label>

                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.isButton}
                      onChange={(e) =>
                        setFormData({ ...formData, isButton: e.target.checked })
                      }
                      className="w-4 h-4 rounded text-blue-600"
                    />
                    <span className="text-sm text-gray-700">
                      Tampilkan sebagai Button
                    </span>
                  </label>

                  {formData.isButton && (
                    <div className="pl-7">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Button Style
                      </label>
                      <select
                        value={formData.buttonVariant}
                        onChange={(e) =>
                          setFormData({ ...formData, buttonVariant: e.target.value })
                        }
                        className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="primary">Primary (Biru)</option>
                        <option value="secondary">Secondary (Abu)</option>
                        <option value="outline">Outline</option>
                      </select>
                    </div>
                  )}

                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.isActive}
                      onChange={(e) =>
                        setFormData({ ...formData, isActive: e.target.checked })
                      }
                      className="w-4 h-4 rounded text-blue-600"
                    />
                    <span className="text-sm text-gray-700">Aktif (tampilkan di navbar)</span>
                  </label>
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t">
                  <button
                    type="button"
                    onClick={closeModal}
                    className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                  >
                    {saving ? 'Menyimpan...' : editingItem ? 'Perbarui' : 'Simpan'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default NavbarManagement;
