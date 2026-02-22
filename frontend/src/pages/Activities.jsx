import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { MoreVertical, Settings, Edit3, Trash2, ChevronDown, Check, Plus, X } from 'lucide-react';
import api from '../services/api';

const Activities = ({ embedded = false, createTrigger = 0 }) => {
  const [tabs, setTabs] = useState([]);
  const [settings, setSettings] = useState({
    globalLink: '/kegiatan',
    globalButtonText: 'Explore Kegiatan Siswa',
    sectionTitle: 'Pembelajaran & Kegiatan',
    sectionSubtitle: 'Berbagai aktivitas pembelajaran dan kegiatan siswa',
    slideDuration: 4000,
  });
  const [loading, setLoading] = useState(true);
  const [activeTabId, setActiveTabId] = useState(null);
  const [toast, setToast] = useState(null);
  const [uploading, setUploading] = useState(false);

  // Tab Modal
  const [showTabModal, setShowTabModal] = useState(false);
  const [tabModalMode, setTabModalMode] = useState('create');
  const [currentTab, setCurrentTab] = useState(null);
  const [tabFormData, setTabFormData] = useState({
    name: '',
    order: 0,
    isActive: true,
  });

  // Item Modal
  const [showItemModal, setShowItemModal] = useState(false);
  const [itemModalMode, setItemModalMode] = useState('create');
  const [currentItem, setCurrentItem] = useState(null);
  const [itemFormData, setItemFormData] = useState({
    title: '',
    description: '',
    image: '',
    order: 0,
  });

  // Delete Modal
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleteType, setDeleteType] = useState(null);

  // Settings Modal
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [settingsFormData, setSettingsFormData] = useState({
    globalLink: '',
    globalButtonText: '',
    sectionTitle: '',
    sectionSubtitle: '',
    slideDuration: 4000,
  });

  // Tab select dropdown
  const [showTabSelect, setShowTabSelect] = useState(false);

  // Item portal menu
  const [itemMenu, setItemMenu] = useState(null);

  const openItemMenuFor = (e, item) => {
    e.stopPropagation();
    const rect = e.currentTarget.getBoundingClientRect();
    setItemMenu(prev =>
      prev?.item._id === item._id
        ? null
        : { item, top: rect.bottom + 4, right: window.innerWidth - rect.right }
    );
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (createTrigger > 0) openCreateItemModal();
  }, [createTrigger]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [tabsRes, settingsRes] = await Promise.all([
        api.get('/api/activities/tabs/all'),
        api.get('/api/activities/settings'),
      ]);
      setTabs(tabsRes.data.data.tabs);
      if (settingsRes.data.data.settings) {
        setSettings(settingsRes.data.data.settings);
      }
      if (tabsRes.data.data.tabs.length > 0 && !activeTabId) {
        setActiveTabId(tabsRes.data.data.tabs[0]._id);
      }
    } catch (error) {
      showToast(error.response?.data?.message || 'Gagal memuat data', 'error');
    } finally {
      setLoading(false);
    }
  };

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  // ==================== TAB FUNCTIONS ====================

  const openCreateTabModal = () => {
    setTabModalMode('create');
    setTabFormData({
      name: '',
      order: tabs.length,
      isActive: true,
    });
    setShowTabModal(true);
  };

  const openEditTabModal = (tab) => {
    setTabModalMode('edit');
    setCurrentTab(tab);
    setTabFormData({
      name: tab.name,
      order: tab.order,
      isActive: tab.isActive,
    });
    setShowTabModal(true);
  };

  const closeTabModal = () => {
    setShowTabModal(false);
    setCurrentTab(null);
  };

  const handleTabSubmit = async (e) => {
    e.preventDefault();

    if (!tabFormData.name) {
      showToast('Nama tab harus diisi', 'error');
      return;
    }

    try {
      if (tabModalMode === 'create') {
        const response = await api.post('/api/activities/tabs', tabFormData);
        showToast('Tab berhasil dibuat!', 'success');
        setActiveTabId(response.data.data.tab._id);
      } else {
        await api.put(`/api/activities/tabs/${currentTab._id}`, tabFormData);
        showToast('Tab berhasil diupdate!', 'success');
      }
      fetchData();
      closeTabModal();
    } catch (error) {
      showToast(error.response?.data?.message || 'Gagal menyimpan tab', 'error');
    }
  };

  const handleDeleteTab = async () => {
    try {
      await api.delete(`/api/activities/tabs/${deleteTarget._id}`);
      showToast('Tab berhasil dihapus!', 'success');
      if (activeTabId === deleteTarget._id) {
        setActiveTabId(tabs.length > 1 ? tabs.find(t => t._id !== deleteTarget._id)?._id : null);
      }
      fetchData();
      closeDeleteModal();
    } catch (error) {
      showToast(error.response?.data?.message || 'Gagal menghapus tab', 'error');
    }
  };

  // ==================== ITEM FUNCTIONS ====================

  const openCreateItemModal = () => {
    if (!activeTabId) {
      showToast('Pilih tab terlebih dahulu', 'error');
      return;
    }
    setItemModalMode('create');
    const activeTab = tabs.find(t => t._id === activeTabId);
    setItemFormData({
      title: '',
      description: '',
      image: '',
      order: activeTab?.items?.length || 0,
    });
    setShowItemModal(true);
  };

  const openEditItemModal = (item) => {
    setItemModalMode('edit');
    setCurrentItem(item);
    setItemFormData({
      title: item.title,
      description: item.description || '',
      image: item.image,
      order: item.order,
    });
    setShowItemModal(true);
  };

  const closeItemModal = () => {
    setShowItemModal(false);
    setCurrentItem(null);
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      showToast('Hanya file gambar yang diperbolehkan', 'error');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      showToast('Ukuran file maksimal 5MB', 'error');
      return;
    }

    try {
      setUploading(true);
      const uploadFormData = new FormData();
      uploadFormData.append('image', file);

      const response = await api.post('/api/upload/image', uploadFormData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      setItemFormData(prev => ({ ...prev, image: response.data.data.url }));
      showToast('Gambar berhasil diupload', 'success');
    } catch (error) {
      showToast(error.response?.data?.message || 'Gagal upload gambar', 'error');
    } finally {
      setUploading(false);
    }
  };

  const handleItemSubmit = async (e) => {
    e.preventDefault();

    if (!itemFormData.title) {
      showToast('Judul harus diisi', 'error');
      return;
    }

    try {
      const formData = new FormData();
      formData.append('title', itemFormData.title);
      formData.append('description', itemFormData.description);
      formData.append('order', itemFormData.order);

      // If there's a new image file, we already uploaded it via handleImageUpload
      // So we just need to include the URL or use the uploaded file

      if (itemModalMode === 'create') {
        if (!itemFormData.image) {
          showToast('Gambar harus diupload', 'error');
          return;
        }
        // For creation, use direct JSON since image is already uploaded
        await api.post(`/api/activities/tabs/${activeTabId}/items`, {
          title: itemFormData.title,
          description: itemFormData.description,
          order: itemFormData.order,
          image: itemFormData.image,
        });
        showToast('Item berhasil ditambahkan!', 'success');
      } else {
        await api.put(`/api/activities/tabs/${activeTabId}/items/${currentItem._id}`, {
          title: itemFormData.title,
          description: itemFormData.description,
          order: itemFormData.order,
          ...(itemFormData.image && { image: itemFormData.image }),
        });
        showToast('Item berhasil diupdate!', 'success');
      }
      fetchData();
      closeItemModal();
    } catch (error) {
      showToast(error.response?.data?.message || 'Gagal menyimpan item', 'error');
    }
  };

  const handleDeleteItem = async () => {
    try {
      await api.delete(`/api/activities/tabs/${activeTabId}/items/${deleteTarget._id}`);
      showToast('Item berhasil dihapus!', 'success');
      fetchData();
      closeDeleteModal();
    } catch (error) {
      showToast(error.response?.data?.message || 'Gagal menghapus item', 'error');
    }
  };

  // ==================== DELETE MODAL ====================

  const openDeleteModal = (target, type) => {
    setDeleteTarget(target);
    setDeleteType(type);
    setShowDeleteModal(true);
  };

  const closeDeleteModal = () => {
    setShowDeleteModal(false);
    setDeleteTarget(null);
    setDeleteType(null);
  };

  const handleDelete = () => {
    if (deleteType === 'tab') {
      handleDeleteTab();
    } else if (deleteType === 'item') {
      handleDeleteItem();
    }
  };

  // ==================== SETTINGS MODAL ====================

  const openSettingsModal = () => {
    setSettingsFormData({
      globalLink: settings.globalLink || '/kegiatan',
      globalButtonText: settings.globalButtonText || 'Explore Kegiatan Siswa',
      sectionTitle: settings.sectionTitle || 'Pembelajaran & Kegiatan',
      sectionSubtitle: settings.sectionSubtitle || 'Berbagai aktivitas pembelajaran dan kegiatan siswa',
      slideDuration: settings.slideDuration || 4000,
    });
    setShowSettingsModal(true);
  };

  const closeSettingsModal = () => {
    setShowSettingsModal(false);
  };

  const handleSettingsSubmit = async (e) => {
    e.preventDefault();

    try {
      await api.put('/api/activities/settings', settingsFormData);
      showToast('Pengaturan berhasil disimpan!', 'success');
      setSettings(settingsFormData);
      closeSettingsModal();
    } catch (error) {
      showToast(error.response?.data?.message || 'Gagal menyimpan pengaturan', 'error');
    }
  };

  // Get active tab data
  const activeTab = tabs.find(t => t._id === activeTabId);

  return (
    <div className={embedded ? 'p-4' : 'p-6'}>
      {/* Toast Notification */}
      {toast && (
        <div className={`fixed top-4 right-4 z-50 px-6 py-3 rounded-lg shadow-lg ${
          toast.type === 'success' ? 'bg-green-500' : 'bg-red-500'
        } text-white`}>
          {toast.message}
        </div>
      )}

      {/* Header */}
      {!embedded && (
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Pembelajaran & Kegiatan</h1>
          <p className="text-gray-600 mt-1">Kelola konten section aktivitas di homepage</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={openSettingsModal}
            className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
          >
            <span>Pengaturan</span>
          </button>
          <button
            onClick={openCreateTabModal}
            className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
          >
            <span className="text-xl">+</span>
            <span>Tambah Tab</span>
          </button>
        </div>
      </div>
      )}

      {loading ? (
        <div className="bg-white rounded-lg shadow p-8 text-center">
          <div className="inline-block w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="mt-2 text-gray-600">Memuat data...</p>
        </div>
      ) : (
        <>
          {/* Tab select — inline */}
          <div className="mb-4">
            {tabs.length === 0 ? (
              <p className="text-sm text-gray-500">Belum ada tab. Tambah tab baru lewat tombol +</p>
            ) : (
              <div className="relative">
                  <button
                    onClick={() => setShowTabSelect(v => !v)}
                    className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-black/[0.04] border border-black/[0.08] text-gray-700 text-sm font-medium hover:bg-black/[0.07] transition-all"
                  >
                    <span>{activeTab?.name || 'Pilih Tab'}</span>
                    {activeTab && !activeTab.isActive && (
                      <span className="text-xs text-gray-400 font-normal">(Nonaktif)</span>
                    )}
                    <ChevronDown size={13} className={`transition-transform duration-200 ${showTabSelect ? 'rotate-180' : ''}`} />
                  </button>

                  {showTabSelect && (
                    <>
                      <div className="fixed inset-0 z-20" onClick={() => setShowTabSelect(false)} />
                      <div className="absolute left-0 mt-2 bg-white/80 backdrop-blur-2xl border border-white/70 rounded-xl shadow-[0_8px_32px_rgba(0,0,0,0.12),inset_0_1px_0_rgba(255,255,255,0.9)] overflow-hidden py-1 min-w-[220px] z-30">
                        {tabs.map(tab => (
                          <div
                            key={tab._id}
                            className={`flex items-center gap-1 pr-2 text-sm transition-colors ${
                              activeTabId === tab._id ? 'bg-blue-400/10' : 'hover:bg-black/[0.03]'
                            }`}
                          >
                            <button
                              onClick={() => { setActiveTabId(tab._id); setShowTabSelect(false); }}
                              className={`flex-1 px-4 py-2 text-left flex items-center gap-2.5 ${
                                activeTabId === tab._id ? 'text-blue-600' : 'text-gray-700'
                              }`}
                            >
                              {activeTabId === tab._id
                                ? <Check size={13} className="text-blue-600 flex-shrink-0" />
                                : <span className="w-[13px] flex-shrink-0" />
                              }
                              <span className="flex-1">{tab.name}</span>
                              {!tab.isActive && <span className="text-xs text-gray-400">(Nonaktif)</span>}
                            </button>
                            <button
                              onClick={(e) => { e.stopPropagation(); openSettingsModal(); setShowTabSelect(false); }}
                              className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-black/[0.05] transition-colors"
                              title="Pengaturan Halaman"
                            >
                              <Settings size={13} />
                            </button>
                            <button
                              onClick={(e) => { e.stopPropagation(); openEditTabModal(tab); setShowTabSelect(false); }}
                              className="p-1.5 rounded-lg text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                              title="Edit Tab"
                            >
                              <Edit3 size={13} />
                            </button>
                            <button
                              onClick={(e) => { e.stopPropagation(); openDeleteModal(tab, 'tab'); setShowTabSelect(false); }}
                              className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                              title="Hapus Tab"
                            >
                              <Trash2 size={13} />
                            </button>
                          </div>
                        ))}
                        <div className="my-1 border-t border-black/[0.06]" />
                        <button
                          onClick={() => { openCreateTabModal(); setShowTabSelect(false); }}
                          className="w-full px-4 py-2 text-left text-sm flex items-center gap-2.5 text-blue-600 hover:bg-blue-50/60 transition-colors"
                        >
                          <Plus size={13} /> Tambah Tab
                        </button>
                      </div>
                    </>
                  )}
              </div>
            )}
          </div>

          {/* Active Tab Content */}
          {activeTab && (
            <div className="bg-white rounded-lg shadow">
              {activeTab.items && activeTab.items.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
                  {activeTab.items.sort((a, b) => a.order - b.order).map((item) => (
                    <div
                      key={item._id}
                      onClick={() => openEditItemModal(item)}
                      className="border border-gray-200 rounded-lg overflow-hidden cursor-pointer hover:border-gray-300 hover:shadow-sm transition-all"
                    >
                      <div className="relative aspect-video">
                        <img
                          src={item.image}
                          alt={item.title}
                          className="w-full h-full object-cover"
                        />
                        {/* MoreVertical action button */}
                        <button
                          onClick={(e) => openItemMenuFor(e, item)}
                          className="absolute top-2 right-2 w-7 h-7 rounded-full bg-blue-600 text-white flex items-center justify-center shadow-md hover:bg-blue-700 transition-colors z-10"
                        >
                          <MoreVertical size={13} />
                        </button>
                      </div>
                      <div className="p-3">
                        <h3 className="font-medium text-gray-900">{item.title}</h3>
                        {item.description && (
                          <p className="text-sm text-gray-600 mt-1 line-clamp-2">{item.description}</p>
                        )}
                        <p className="text-xs text-gray-400 mt-2">Urutan: {item.order}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-8 text-center text-gray-500">
                  <p>Belum ada item dalam tab ini. Klik "Tambah Item" untuk mulai.</p>
                </div>
              )}
            </div>
          )}
        </>
      )}

      {/* Item action portal */}
      {itemMenu && createPortal(
        <>
          <div className="fixed inset-0 z-40" onClick={() => setItemMenu(null)} />
          <div
            className="fixed z-50 bg-white/80 backdrop-blur-2xl border border-white/70 rounded-xl shadow-[0_8px_28px_rgba(0,0,0,0.12),inset_0_1px_0_rgba(255,255,255,0.9)] py-1 min-w-[190px]"
            style={{ top: itemMenu.top, right: itemMenu.right }}
          >
            <button
              onClick={() => { openEditItemModal(itemMenu.item); setItemMenu(null); }}
              className="w-full px-4 py-2 text-left text-sm flex items-center gap-2.5 text-gray-700 hover:bg-black/[0.05] transition-colors"
            >
              <Edit3 size={13} className="text-gray-400" /> Edit Item
            </button>
            <button
              onClick={() => { openDeleteModal(itemMenu.item, 'item'); setItemMenu(null); }}
              className="w-full px-4 py-2 text-left text-sm flex items-center gap-2.5 text-red-600 hover:bg-red-50/60 transition-colors"
            >
              <Trash2 size={13} /> Hapus Item
            </button>
          </div>
        </>,
        document.body
      )}

      {/* Tab Modal */}
      {showTabModal && (
        <div className="fixed inset-0 bg-black/20 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-white/80 backdrop-blur-2xl border border-white/70 rounded-2xl shadow-[0_8px_40px_rgba(0,0,0,0.15),inset_0_1px_0_rgba(255,255,255,0.9)] max-w-lg w-full">
            <div className="flex items-center justify-between px-5 py-4 border-b border-black/[0.06]">
              <h2 className="text-sm font-semibold text-gray-800">
                {tabModalMode === 'create' ? 'Tambah Tab' : 'Edit Tab'}
              </h2>
              <button
                type="button"
                onClick={closeTabModal}
                className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-black/5 rounded-lg transition-colors"
              >
                <X size={14} />
              </button>
            </div>

            <form onSubmit={handleTabSubmit}>
              <div className="p-5 space-y-4">
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1.5">
                    Nama Tab <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={tabFormData.name}
                    onChange={(e) => setTabFormData({ ...tabFormData, name: e.target.value })}
                    className="w-full px-3 py-2 text-sm bg-white/60 border border-black/[0.08] rounded-xl focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 outline-none transition-all placeholder:text-gray-400"
                    placeholder="Contoh: BELAJAR"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1.5">
                    Urutan
                  </label>
                  <input
                    type="number"
                    value={tabFormData.order}
                    onChange={(e) => setTabFormData({ ...tabFormData, order: parseInt(e.target.value) })}
                    className="w-full px-3 py-2 text-sm bg-white/60 border border-black/[0.08] rounded-xl focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 outline-none transition-all placeholder:text-gray-400"
                    min="0"
                  />
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="tabIsActive"
                    checked={tabFormData.isActive}
                    onChange={(e) => setTabFormData({ ...tabFormData, isActive: e.target.checked })}
                    className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                  />
                  <label htmlFor="tabIsActive" className="ml-2 text-sm text-gray-700">
                    Tampilkan di website
                  </label>
                </div>
              </div>

              <div className="flex justify-end gap-2 px-5 pb-5 pt-2 border-t border-black/[0.06]">
                <button
                  type="button"
                  onClick={closeTabModal}
                  className="px-4 py-2 text-xs text-gray-600 hover:bg-black/5 rounded-xl transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors"
                >
                  Simpan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Item Modal */}
      {showItemModal && (
        <div className="fixed inset-0 bg-black/20 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-white/80 backdrop-blur-2xl border border-white/70 rounded-2xl shadow-[0_8px_40px_rgba(0,0,0,0.15),inset_0_1px_0_rgba(255,255,255,0.9)] max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-5 py-4 border-b border-black/[0.06] sticky top-0 bg-white/80 backdrop-blur-2xl rounded-t-2xl">
              <h2 className="text-sm font-semibold text-gray-800">
                {itemModalMode === 'create' ? 'Tambah Item' : 'Edit Item'}
              </h2>
              <button
                type="button"
                onClick={closeItemModal}
                className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-black/5 rounded-lg transition-colors"
              >
                <X size={14} />
              </button>
            </div>

            <form onSubmit={handleItemSubmit}>
              <div className="p-5 space-y-4">
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1.5">
                    Gambar <span className="text-red-500">*</span>
                  </label>
                  <div className="space-y-2">
                    {itemFormData.image && (
                      <img
                        src={itemFormData.image}
                        alt="Preview"
                        className="w-full h-48 object-cover rounded-lg border"
                      />
                    )}
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="w-full px-3 py-2 text-sm bg-white/60 border border-black/[0.08] rounded-xl focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 outline-none transition-all"
                    />
                    {uploading && (
                      <p className="text-sm text-gray-600">Mengupload...</p>
                    )}
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Format: JPG, PNG (Max 5MB)</p>
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1.5">
                    Judul <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={itemFormData.title}
                    onChange={(e) => setItemFormData({ ...itemFormData, title: e.target.value })}
                    className="w-full px-3 py-2 text-sm bg-white/60 border border-black/[0.08] rounded-xl focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 outline-none transition-all placeholder:text-gray-400"
                    placeholder="Contoh: Praktek Laboratorium"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1.5">
                    Deskripsi (Opsional)
                  </label>
                  <textarea
                    value={itemFormData.description}
                    onChange={(e) => setItemFormData({ ...itemFormData, description: e.target.value })}
                    className="w-full px-3 py-2 text-sm bg-white/60 border border-black/[0.08] rounded-xl focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 outline-none transition-all placeholder:text-gray-400"
                    rows="3"
                    placeholder="Deskripsi singkat kegiatan..."
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1.5">
                    Urutan
                  </label>
                  <input
                    type="number"
                    value={itemFormData.order}
                    onChange={(e) => setItemFormData({ ...itemFormData, order: parseInt(e.target.value) })}
                    className="w-full px-3 py-2 text-sm bg-white/60 border border-black/[0.08] rounded-xl focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 outline-none transition-all placeholder:text-gray-400"
                    min="0"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 px-5 pb-5 pt-2 border-t border-black/[0.06]">
                <button
                  type="button"
                  onClick={closeItemModal}
                  className="px-4 py-2 text-xs text-gray-600 hover:bg-black/5 rounded-xl transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors"
                  disabled={uploading}
                >
                  {uploading ? 'Mengupload...' : 'Simpan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Settings Modal */}
      {showSettingsModal && (
        <div className="fixed inset-0 bg-black/20 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-white/80 backdrop-blur-2xl border border-white/70 rounded-2xl shadow-[0_8px_40px_rgba(0,0,0,0.15),inset_0_1px_0_rgba(255,255,255,0.9)] max-w-lg w-full">
            <div className="flex items-center justify-between px-5 py-4 border-b border-black/[0.06]">
              <h2 className="text-sm font-semibold text-gray-800">
                Pengaturan Section
              </h2>
              <button
                type="button"
                onClick={closeSettingsModal}
                className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-black/5 rounded-lg transition-colors"
              >
                <X size={14} />
              </button>
            </div>

            <form onSubmit={handleSettingsSubmit}>
              <div className="p-5 space-y-4">
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1.5">
                    Judul Section
                  </label>
                  <input
                    type="text"
                    value={settingsFormData.sectionTitle}
                    onChange={(e) => setSettingsFormData({ ...settingsFormData, sectionTitle: e.target.value })}
                    className="w-full px-3 py-2 text-sm bg-white/60 border border-black/[0.08] rounded-xl focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 outline-none transition-all placeholder:text-gray-400"
                    placeholder="Pembelajaran & Kegiatan"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1.5">
                    Subtitle Section
                  </label>
                  <input
                    type="text"
                    value={settingsFormData.sectionSubtitle}
                    onChange={(e) => setSettingsFormData({ ...settingsFormData, sectionSubtitle: e.target.value })}
                    className="w-full px-3 py-2 text-sm bg-white/60 border border-black/[0.08] rounded-xl focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 outline-none transition-all placeholder:text-gray-400"
                    placeholder="Berbagai aktivitas pembelajaran dan kegiatan siswa"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1.5">
                    Teks Tombol
                  </label>
                  <input
                    type="text"
                    value={settingsFormData.globalButtonText}
                    onChange={(e) => setSettingsFormData({ ...settingsFormData, globalButtonText: e.target.value })}
                    className="w-full px-3 py-2 text-sm bg-white/60 border border-black/[0.08] rounded-xl focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 outline-none transition-all placeholder:text-gray-400"
                    placeholder="Explore Kegiatan Siswa"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1.5">
                    Link Tombol
                  </label>
                  <input
                    type="text"
                    value={settingsFormData.globalLink}
                    onChange={(e) => setSettingsFormData({ ...settingsFormData, globalLink: e.target.value })}
                    className="w-full px-3 py-2 text-sm bg-white/60 border border-black/[0.08] rounded-xl focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 outline-none transition-all placeholder:text-gray-400"
                    placeholder="/kegiatan"
                  />
                  <p className="text-xs text-gray-500 mt-1">Contoh: /kegiatan atau https://example.com</p>
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1.5">
                    Durasi Slide Carousel (detik)
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="30"
                    value={Math.round((settingsFormData.slideDuration || 4000) / 1000)}
                    onChange={(e) => setSettingsFormData({ ...settingsFormData, slideDuration: Number(e.target.value) * 1000 })}
                    className="w-full px-3 py-2 text-sm bg-white/60 border border-black/[0.08] rounded-xl focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 outline-none transition-all placeholder:text-gray-400"
                  />
                  <p className="text-xs text-gray-500 mt-1">Carousel akan berganti slide setiap N detik secara otomatis. Default: 4 detik.</p>
                </div>
              </div>

              <div className="flex justify-end gap-2 px-5 pb-5 pt-2 border-t border-black/[0.06]">
                <button
                  type="button"
                  onClick={closeSettingsModal}
                  className="px-4 py-2 text-xs text-gray-600 hover:bg-black/5 rounded-xl transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors"
                >
                  Simpan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && deleteTarget && (
        <div className="fixed inset-0 bg-black/20 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-white/80 backdrop-blur-2xl border border-white/70 rounded-2xl shadow-[0_8px_40px_rgba(0,0,0,0.15),inset_0_1px_0_rgba(255,255,255,0.9)] max-w-sm w-full">
            <div className="flex items-center justify-between px-5 py-4 border-b border-black/[0.06]">
              <h2 className="text-sm font-semibold text-gray-800">Konfirmasi Hapus</h2>
              <button
                type="button"
                onClick={closeDeleteModal}
                className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-black/5 rounded-lg transition-colors"
              >
                <X size={14} />
              </button>
            </div>
            <div className="p-5 space-y-4">
              <p className="text-sm text-gray-600">
                Apakah Anda yakin ingin menghapus{' '}
                <strong>{deleteType === 'tab' ? `tab "${deleteTarget.name}"` : `item "${deleteTarget.title}"`}</strong>?
                {deleteType === 'tab' && (
                  <span className="block mt-2 text-sm text-red-600">
                    Semua item dalam tab ini juga akan terhapus!
                  </span>
                )}
              </p>
            </div>
            <div className="flex justify-end gap-2 px-5 pb-5 pt-2 border-t border-black/[0.06]">
              <button
                onClick={closeDeleteModal}
                className="px-4 py-2 text-xs text-gray-600 hover:bg-black/5 rounded-xl transition-colors"
              >
                Batal
              </button>
              <button
                onClick={handleDelete}
                className="px-4 py-2 text-xs bg-red-500 text-white rounded-xl hover:bg-red-600 transition-colors"
              >
                Hapus
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Activities;
