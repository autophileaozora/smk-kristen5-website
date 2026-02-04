import { useState, useEffect } from 'react';
import api from '../services/api';

const Activities = () => {
  const [tabs, setTabs] = useState([]);
  const [settings, setSettings] = useState({
    globalLink: '/kegiatan',
    globalButtonText: 'Explore Kegiatan Siswa',
    sectionTitle: 'Pembelajaran & Kegiatan',
    sectionSubtitle: 'Berbagai aktivitas pembelajaran dan kegiatan siswa',
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
  });

  useEffect(() => {
    fetchData();
  }, []);

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
    <div className="p-6">
      {/* Toast Notification */}
      {toast && (
        <div className={`fixed top-4 right-4 z-50 px-6 py-3 rounded-lg shadow-lg ${
          toast.type === 'success' ? 'bg-green-500' : 'bg-red-500'
        } text-white`}>
          {toast.message}
        </div>
      )}

      {/* Header */}
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

      {loading ? (
        <div className="bg-white rounded-lg shadow p-8 text-center">
          <div className="inline-block w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="mt-2 text-gray-600">Memuat data...</p>
        </div>
      ) : (
        <>
          {/* Tabs Navigation */}
          <div className="bg-white rounded-lg shadow mb-6">
            <div className="flex flex-wrap items-center gap-2 p-4 border-b">
              {tabs.length === 0 ? (
                <p className="text-gray-500">Belum ada tab. Klik "Tambah Tab" untuk mulai.</p>
              ) : (
                tabs.map((tab) => (
                  <div key={tab._id} className="flex items-center">
                    <button
                      onClick={() => setActiveTabId(tab._id)}
                      className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                        activeTabId === tab._id
                          ? 'bg-primary-600 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {tab.name}
                      {!tab.isActive && (
                        <span className="ml-2 text-xs opacity-70">(Nonaktif)</span>
                      )}
                    </button>
                    <button
                      onClick={() => openEditTabModal(tab)}
                      className="ml-1 p-1 text-gray-500 hover:text-primary-600"
                      title="Edit Tab"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                      </svg>
                    </button>
                    <button
                      onClick={() => openDeleteModal(tab, 'tab')}
                      className="p-1 text-gray-500 hover:text-red-600"
                      title="Hapus Tab"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Active Tab Content */}
          {activeTab && (
            <div className="bg-white rounded-lg shadow">
              <div className="flex items-center justify-between p-4 border-b">
                <h2 className="text-lg font-semibold text-gray-900">
                  Item dalam Tab: {activeTab.name}
                </h2>
                <button
                  onClick={openCreateItemModal}
                  className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  <span className="text-xl">+</span>
                  <span>Tambah Item</span>
                </button>
              </div>

              {activeTab.items && activeTab.items.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
                  {activeTab.items.sort((a, b) => a.order - b.order).map((item) => (
                    <div key={item._id} className="border rounded-lg overflow-hidden group">
                      <div className="relative aspect-video">
                        <img
                          src={item.image}
                          alt={item.title}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100">
                          <button
                            onClick={() => openEditItemModal(item)}
                            className="p-2 bg-white rounded-full text-primary-600 hover:bg-primary-100"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                            </svg>
                          </button>
                          <button
                            onClick={() => openDeleteModal(item, 'item')}
                            className="p-2 bg-white rounded-full text-red-600 hover:bg-red-100"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
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

      {/* Tab Modal */}
      {showTabModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">
                {tabModalMode === 'create' ? 'Tambah Tab' : 'Edit Tab'}
              </h2>

              <form onSubmit={handleTabSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nama Tab <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={tabFormData.name}
                    onChange={(e) => setTabFormData({ ...tabFormData, name: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="Contoh: BELAJAR"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Urutan
                  </label>
                  <input
                    type="number"
                    value={tabFormData.order}
                    onChange={(e) => setTabFormData({ ...tabFormData, order: parseInt(e.target.value) })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
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

                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={closeTabModal}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                  >
                    Simpan
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Item Modal */}
      {showItemModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">
                {itemModalMode === 'create' ? 'Tambah Item' : 'Edit Item'}
              </h2>

              <form onSubmit={handleItemSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
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
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    />
                    {uploading && (
                      <p className="text-sm text-gray-600">Mengupload...</p>
                    )}
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Format: JPG, PNG (Max 5MB)</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Judul <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={itemFormData.title}
                    onChange={(e) => setItemFormData({ ...itemFormData, title: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="Contoh: Praktek Laboratorium"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Deskripsi (Opsional)
                  </label>
                  <textarea
                    value={itemFormData.description}
                    onChange={(e) => setItemFormData({ ...itemFormData, description: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    rows="3"
                    placeholder="Deskripsi singkat kegiatan..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Urutan
                  </label>
                  <input
                    type="number"
                    value={itemFormData.order}
                    onChange={(e) => setItemFormData({ ...itemFormData, order: parseInt(e.target.value) })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    min="0"
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={closeItemModal}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                    disabled={uploading}
                  >
                    {uploading ? 'Mengupload...' : 'Simpan'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Settings Modal */}
      {showSettingsModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-lg w-full">
            <div className="p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">
                Pengaturan Section
              </h2>

              <form onSubmit={handleSettingsSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Judul Section
                  </label>
                  <input
                    type="text"
                    value={settingsFormData.sectionTitle}
                    onChange={(e) => setSettingsFormData({ ...settingsFormData, sectionTitle: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="Pembelajaran & Kegiatan"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Subtitle Section
                  </label>
                  <input
                    type="text"
                    value={settingsFormData.sectionSubtitle}
                    onChange={(e) => setSettingsFormData({ ...settingsFormData, sectionSubtitle: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="Berbagai aktivitas pembelajaran dan kegiatan siswa"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Teks Tombol
                  </label>
                  <input
                    type="text"
                    value={settingsFormData.globalButtonText}
                    onChange={(e) => setSettingsFormData({ ...settingsFormData, globalButtonText: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="Explore Kegiatan Siswa"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Link Tombol
                  </label>
                  <input
                    type="text"
                    value={settingsFormData.globalLink}
                    onChange={(e) => setSettingsFormData({ ...settingsFormData, globalLink: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="/kegiatan"
                  />
                  <p className="text-xs text-gray-500 mt-1">Contoh: /kegiatan atau https://example.com</p>
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={closeSettingsModal}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                  >
                    Simpan
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && deleteTarget && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Konfirmasi Hapus</h2>
            <p className="text-gray-600 mb-6">
              Apakah Anda yakin ingin menghapus{' '}
              <strong>{deleteType === 'tab' ? `tab "${deleteTarget.name}"` : `item "${deleteTarget.title}"`}</strong>?
              {deleteType === 'tab' && (
                <span className="block mt-2 text-sm text-red-600">
                  Semua item dalam tab ini juga akan terhapus!
                </span>
              )}
            </p>
            <div className="flex gap-3">
              <button
                onClick={closeDeleteModal}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Batal
              </button>
              <button
                onClick={handleDelete}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
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
