import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { MoreVertical, X, ChevronDown } from 'lucide-react';
import api from '../services/api';

const RunningText = ({ embedded = false, createTrigger = 0 }) => {
  const [runningTexts, setRunningTexts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState('create');
  const [currentText, setCurrentText] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [textToDelete, setTextToDelete] = useState(null);
  const [toast, setToast] = useState(null);
  const [rowMenu, setRowMenu] = useState(null);

  // Form state
  const [formData, setFormData] = useState({
    text: '',
    isActive: true,
    order: 1,
    link: '',
  });

  useEffect(() => {
    fetchRunningTexts();
  }, []);

  useEffect(() => {
    if (createTrigger > 0) openCreateModal();
  }, [createTrigger]);

  const fetchRunningTexts = async () => {
    try {
      setLoading(true);
      const response = await api.get('/api/running-text');
      setRunningTexts(response.data.data.runningTexts);
    } catch (error) {
      showToast(error.response?.data?.message || 'Gagal memuat running text', 'error');
    } finally {
      setLoading(false);
    }
  };

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const openCreateModal = () => {
    setModalMode('create');
    setFormData({
      text: '',
      isActive: true,
      order: runningTexts.length + 1,
      link: '',
    });
    setShowModal(true);
  };

  const openEditModal = (text) => {
    setModalMode('edit');
    setCurrentText(text);
    setFormData({
      text: text.text,
      isActive: text.isActive,
      order: text.order,
      link: text.link || '',
    });
    setShowModal(true);
  };

  const openDeleteModal = (text) => {
    setTextToDelete(text);
    setShowDeleteModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setCurrentText(null);
  };

  const closeDeleteModal = () => {
    setShowDeleteModal(false);
    setTextToDelete(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      if (modalMode === 'create') {
        await api.post('/api/running-text', formData);
        showToast('Running text berhasil dibuat!', 'success');
      } else {
        await api.put(`/api/running-text/${currentText._id}`, formData);
        showToast('Running text berhasil diupdate!', 'success');
      }

      fetchRunningTexts();
      closeModal();
    } catch (error) {
      showToast(error.response?.data?.message || 'Gagal menyimpan running text', 'error');
    }
  };

  const handleDelete = async () => {
    try {
      await api.delete(`/api/running-text/${textToDelete._id}`);
      showToast('Running text berhasil dihapus!', 'success');
      fetchRunningTexts();
      closeDeleteModal();
    } catch (error) {
      showToast(error.response?.data?.message || 'Gagal menghapus running text', 'error');
    }
  };

  const toggleActive = async (id, currentStatus) => {
    try {
      await api.put(`/api/running-text/${id}`, { isActive: !currentStatus });
      showToast('Status berhasil diubah!', 'success');
      fetchRunningTexts();
    } catch (error) {
      showToast(error.response?.data?.message || 'Gagal mengubah status', 'error');
    }
  };

  return (
    <div className={embedded ? '' : 'p-6'}>
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
          <h1 className="text-2xl font-bold text-gray-900">Running Text</h1>
          <p className="text-gray-600 mt-1">Kelola teks berjalan untuk pengumuman</p>
        </div>
        <button
          onClick={openCreateModal}
          className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
        >
          <span className="text-xl">➕</span>
          <span>Tambah Running Text</span>
        </button>
      </div>
      )}

      {/* Running Texts Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden overflow-x-auto">
        {loading ? (
          <div className="p-8 text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
            <p className="mt-2 text-gray-600">Memuat running text...</p>
          </div>
        ) : runningTexts.length === 0 ? (
          <div className="p-8 text-center">
            <p className="text-gray-500">Belum ada running text</p>
          </div>
        ) : (
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Urutan
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Teks
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Link
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Aksi
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {runningTexts.map((text) => (
                <tr key={text._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm font-medium text-gray-900">
                      #{text.order}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-sm text-gray-900 line-clamp-2">
                      {text.text}
                    </p>
                  </td>
                  <td className="px-6 py-4">
                    {text.link ? (
                      <a
                        href={text.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-blue-600 hover:text-blue-800 underline"
                      >
                        🔗 Link
                      </a>
                    ) : (
                      <span className="text-sm text-gray-400">-</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <button
                      onClick={() => toggleActive(text._id, text.isActive)}
                      className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full cursor-pointer transition-colors ${
                        text.isActive
                          ? 'bg-green-100 text-green-800 hover:bg-green-200'
                          : 'bg-red-100 text-red-800 hover:bg-red-200'
                      }`}
                    >
                      {text.isActive ? '✅ Aktif' : '❌ Nonaktif'}
                    </button>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    <button
                      onClick={(e) => {
                        const r = e.currentTarget.getBoundingClientRect();
                        setRowMenu({ text, top: r.bottom + 4, right: window.innerWidth - r.right });
                      }}
                      className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
                    >
                      <MoreVertical size={15} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Context Menu Portal */}
      {rowMenu && createPortal(
        <>
          <div className="fixed inset-0 z-40" onClick={() => setRowMenu(null)} />
          <div
            className="fixed z-50 bg-white/90 backdrop-blur-xl border border-white/70 rounded-xl shadow-[0_8px_28px_rgba(0,0,0,0.12)] py-1 min-w-[130px]"
            style={{ top: rowMenu.top, right: rowMenu.right }}
          >
            <button
              onClick={() => { openEditModal(rowMenu.text); setRowMenu(null); }}
              className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-black/[0.05] transition-colors"
            >
              Edit
            </button>
            <button
              onClick={() => { openDeleteModal(rowMenu.text); setRowMenu(null); }}
              className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 transition-colors"
            >
              Hapus
            </button>
          </div>
        </>,
        document.body
      )}

      {/* Create/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/20 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-white/80 backdrop-blur-2xl border border-white/70 rounded-2xl shadow-[0_8px_40px_rgba(0,0,0,0.15),inset_0_1px_0_rgba(255,255,255,0.9)] max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <form onSubmit={handleSubmit}>
              {/* Header */}
              <div className="flex items-center justify-between px-5 py-4 border-b border-black/[0.06] sticky top-0 bg-white/80 backdrop-blur-2xl rounded-t-2xl">
                <h3 className="text-sm font-semibold text-gray-800">
                  {modalMode === 'create' ? 'Tambah Running Text' : 'Edit Running Text'}
                </h3>
                <button
                  type="button"
                  onClick={closeModal}
                  className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-black/5 rounded-lg transition-colors"
                >
                  <X size={14} />
                </button>
              </div>

              {/* Body */}
              <div className="p-5 space-y-4">
                {/* Text */}
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1.5">
                    Teks *
                  </label>
                  <textarea
                    value={formData.text}
                    onChange={(e) => setFormData({ ...formData, text: e.target.value })}
                    rows={3}
                    className="w-full px-3 py-2 text-sm bg-white/60 border border-black/[0.08] rounded-xl focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 outline-none transition-all placeholder:text-gray-400"
                    placeholder="Masukkan teks pengumuman..."
                    required
                  />
                </div>

                {/* Link */}
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1.5">
                    Link (Opsional)
                  </label>
                  <input
                    type="url"
                    value={formData.link}
                    onChange={(e) => setFormData({ ...formData, link: e.target.value })}
                    className="w-full px-3 py-2 text-sm bg-white/60 border border-black/[0.08] rounded-xl focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 outline-none transition-all placeholder:text-gray-400"
                    placeholder="https://example.com"
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    Jika diisi, teks akan menjadi link yang bisa diklik
                  </p>
                </div>

                {/* Order */}
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1.5">
                    Urutan Tampil *
                  </label>
                  <input
                    type="number"
                    value={formData.order}
                    onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) })}
                    min="1"
                    className="w-full px-3 py-2 text-sm bg-white/60 border border-black/[0.08] rounded-xl focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 outline-none transition-all placeholder:text-gray-400"
                    required
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    Running text dengan urutan lebih kecil ditampilkan lebih dulu
                  </p>
                </div>

                {/* Active Status */}
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="isActive"
                    checked={formData.isActive}
                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                    className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                  />
                  <label htmlFor="isActive" className="ml-2 text-sm text-gray-700">
                    Aktifkan running text ini
                  </label>
                </div>
              </div>

              {/* Footer */}
              <div className="flex justify-end gap-2 px-5 pb-5 pt-2 border-t border-black/[0.06]">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-4 py-2 text-xs text-gray-600 hover:bg-black/5 rounded-xl transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors"
                >
                  {modalMode === 'create' ? 'Tambah' : 'Simpan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && textToDelete && (
        <div className="fixed inset-0 bg-black/20 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-white/80 backdrop-blur-2xl border border-white/70 rounded-2xl shadow-[0_8px_40px_rgba(0,0,0,0.15),inset_0_1px_0_rgba(255,255,255,0.9)] max-w-sm w-full">
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-black/[0.06]">
              <h3 className="text-sm font-semibold text-gray-800">Hapus Running Text?</h3>
              <button
                onClick={closeDeleteModal}
                className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-black/5 rounded-lg transition-colors"
              >
                <X size={14} />
              </button>
            </div>

            {/* Body */}
            <div className="p-5 space-y-4">
              <p className="text-sm text-gray-600">
                Apakah Anda yakin ingin menghapus running text ini?
              </p>
              <div className="bg-black/[0.04] p-3 rounded-xl">
                <p className="text-sm text-gray-700 line-clamp-2">
                  "{textToDelete.text}"
                </p>
              </div>
            </div>

            {/* Footer */}
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

export default RunningText;
