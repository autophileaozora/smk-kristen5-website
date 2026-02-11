import { useState, useEffect } from 'react';
import api from '../services/api';

const RunningText = () => {
  const [runningTexts, setRunningTexts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState('create');
  const [currentText, setCurrentText] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [textToDelete, setTextToDelete] = useState(null);
  const [toast, setToast] = useState(null);

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
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
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
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      onClick={() => openEditModal(text)}
                      className="text-blue-600 hover:text-blue-900 mr-3"
                    >
                      ✏️ Edit
                    </button>
                    <button
                      onClick={() => openDeleteModal(text)}
                      className="text-red-600 hover:text-red-900"
                    >
                      🗑️ Hapus
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Create/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
            {/* Background overlay */}
            <div
              className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75"
              onClick={closeModal}
            ></div>

            {/* Modal panel */}
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <form onSubmit={handleSubmit}>
                {/* Header */}
                <div className="bg-white px-6 py-4 border-b">
                  <h3 className="text-lg font-semibold text-gray-900">
                    {modalMode === 'create' ? '➕ Tambah Running Text' : '✏️ Edit Running Text'}
                  </h3>
                </div>

                {/* Body */}
                <div className="bg-white px-6 py-4 space-y-4">
                  {/* Text */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Teks *
                    </label>
                    <textarea
                      value={formData.text}
                      onChange={(e) => setFormData({ ...formData, text: e.target.value })}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      placeholder="Masukkan teks pengumuman..."
                      required
                    />
                  </div>

                  {/* Link */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Link (Opsional)
                    </label>
                    <input
                      type="url"
                      value={formData.link}
                      onChange={(e) => setFormData({ ...formData, link: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      placeholder="https://example.com"
                    />
                    <p className="mt-1 text-xs text-gray-500">
                      Jika diisi, teks akan menjadi link yang bisa diklik
                    </p>
                  </div>

                  {/* Order */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Urutan Tampil *
                    </label>
                    <input
                      type="number"
                      value={formData.order}
                      onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) })}
                      min="1"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
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
                <div className="bg-gray-50 px-6 py-4 flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={closeModal}
                    className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                  >
                    {modalMode === 'create' ? '➕ Tambah' : '💾 Simpan'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && textToDelete && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
            {/* Background overlay */}
            <div
              className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75"
              onClick={closeDeleteModal}
            ></div>

            {/* Modal panel */}
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="bg-white px-6 py-4">
                <div className="flex items-center mb-4">
                  <span className="text-4xl mr-3">⚠️</span>
                  <h3 className="text-lg font-semibold text-gray-900">
                    Hapus Running Text?
                  </h3>
                </div>
                <p className="text-gray-600 mb-4">
                  Apakah Anda yakin ingin menghapus running text ini?
                </p>
                <div className="bg-gray-100 p-3 rounded-lg">
                  <p className="text-sm text-gray-700 line-clamp-2">
                    "{textToDelete.text}"
                  </p>
                </div>
              </div>

              <div className="bg-gray-50 px-6 py-4 flex justify-end gap-3">
                <button
                  onClick={closeDeleteModal}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Batal
                </button>
                <button
                  onClick={handleDelete}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  🗑️ Hapus
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RunningText;
