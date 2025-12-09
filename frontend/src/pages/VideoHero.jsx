import { useState, useEffect } from 'react';
import api from '../services/api';

const VideoHero = () => {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState('create'); // 'create' or 'edit'
  const [currentVideo, setCurrentVideo] = useState(null);
  const [toast, setToast] = useState({ show: false, message: '', type: '' });

  // Form state
  const [formData, setFormData] = useState({
    title: '',
    youtubeUrl: '',
    description: '',
    displayOrder: 0,
    isActive: false,
  });

  // Extract YouTube ID from URL
  const extractYouTubeId = (url) => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
  };

  // Get YouTube thumbnail
  const getYouTubeThumbnail = (url) => {
    const videoId = extractYouTubeId(url);
    return videoId ? `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg` : null;
  };

  // Fetch videos
  const fetchVideos = async () => {
    try {
      setLoading(true);
      const response = await api.get('/api/video-hero');
      setVideos(response.data.data.videos);
    } catch (error) {
      showToast('Gagal memuat data video hero', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVideos();
  }, []);

  // Show toast notification
  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: '', type: '' }), 3000);
  };

  // Handle form input change
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  // Open create modal
  const openCreateModal = () => {
    setModalMode('create');
    setFormData({
      title: '',
      youtubeUrl: '',
      description: '',
      displayOrder: 0,
      isActive: false,
    });
    setShowModal(true);
  };

  // Open edit modal
  const openEditModal = (video) => {
    setModalMode('edit');
    setCurrentVideo(video);
    setFormData({
      title: video.title,
      youtubeUrl: video.youtubeUrl,
      description: video.description || '',
      displayOrder: video.displayOrder || 0,
      isActive: video.isActive,
    });
    setShowModal(true);
  };

  // Close modal
  const closeModal = () => {
    setShowModal(false);
    setCurrentVideo(null);
    setFormData({
      title: '',
      youtubeUrl: '',
      description: '',
      displayOrder: 0,
      isActive: false,
    });
  };

  // Handle form submit
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate YouTube URL
    if (!extractYouTubeId(formData.youtubeUrl)) {
      showToast('URL YouTube tidak valid', 'error');
      return;
    }

    try {
      if (modalMode === 'create') {
        await api.post('/api/video-hero', formData);
        showToast('Video hero berhasil ditambahkan!', 'success');
      } else {
        await api.put(`/api/video-hero/${currentVideo._id}`, formData);
        showToast('Video hero berhasil diupdate!', 'success');
      }

      fetchVideos();
      closeModal();
    } catch (error) {
      showToast(error.response?.data?.message || 'Gagal menyimpan video hero', 'error');
    }
  };

  // Handle delete
  const handleDelete = async (id, title) => {
    if (!window.confirm(`Yakin ingin menghapus video "${title}"?`)) return;

    try {
      await api.delete(`/api/video-hero/${id}`);
      showToast('Video hero berhasil dihapus!', 'success');
      fetchVideos();
    } catch (error) {
      showToast(error.response?.data?.message || 'Gagal menghapus video hero', 'error');
    }
  };

  // Handle toggle active
  const handleToggleActive = async (id) => {
    try {
      await api.patch(`/api/video-hero/${id}/toggle-active`);
      fetchVideos();
      showToast('Status berhasil diubah!', 'success');
    } catch (error) {
      showToast(error.response?.data?.message || 'Gagal mengubah status', 'error');
    }
  };

  // Count active videos
  const activeCount = videos.filter(v => v.isActive).length;

  return (
    <div className="p-6">
      {/* Toast Notification */}
      {toast.show && (
        <div className={`fixed top-4 right-4 z-50 px-6 py-3 rounded-lg shadow-lg ${
          toast.type === 'success' ? 'bg-green-500' : 'bg-red-500'
        } text-white`}>
          {toast.message}
        </div>
      )}

      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Video Hero</h1>
          <p className="text-gray-600 mt-1">Kelola video hero homepage (Max 3 aktif)</p>
          <p className="text-sm text-gray-500 mt-1">
            Video Aktif: <span className={`font-semibold ${activeCount >= 3 ? 'text-red-600' : 'text-green-600'}`}>
              {activeCount}/3
            </span>
          </p>
        </div>
        <button
          onClick={openCreateModal}
          className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition flex items-center gap-2"
        >
          <span>➕</span>
          Tambah Video Hero
        </button>
      </div>

      {/* Info Alert */}
      {activeCount >= 3 && (
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6">
          <div className="flex">
            <div className="flex-shrink-0">
              <span className="text-yellow-400 text-xl">⚠️</span>
            </div>
            <div className="ml-3">
              <p className="text-sm text-yellow-700">
                <strong>Maksimum 3 video aktif tercapai.</strong> Nonaktifkan video lain sebelum mengaktifkan yang baru.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Loading State */}
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        </div>
      ) : (
        /* Video Grid */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {videos.map((video) => (
            <div key={video._id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition">
              {/* Thumbnail */}
              {video.thumbnail && (
                <div className="relative">
                  <img
                    src={video.thumbnail}
                    alt={video.title}
                    className="w-full h-48 object-cover"
                  />
                  <div className="absolute inset-0 bg-black bg-opacity-30 flex items-center justify-center">
                    <a
                      href={video.youtubeUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-16 h-16 bg-red-600 rounded-full flex items-center justify-center hover:bg-red-700 transition"
                    >
                      <span className="text-white text-2xl ml-1">▶</span>
                    </a>
                  </div>
                </div>
              )}

              {/* Content */}
              <div className="p-4">
                {/* Status & Order */}
                <div className="flex justify-between items-start mb-3">
                  <button
                    onClick={() => handleToggleActive(video._id)}
                    className={`px-3 py-1 text-xs font-semibold rounded-full cursor-pointer ${
                      video.isActive
                        ? 'bg-green-100 text-green-800 hover:bg-green-200'
                        : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                    }`}
                  >
                    {video.isActive ? '✓ Aktif' : '✗ Nonaktif'}
                  </button>
                  <span className="px-3 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                    Order: {video.displayOrder}
                  </span>
                </div>

                {/* Title */}
                <h3 className="font-bold text-lg text-gray-800 mb-2 line-clamp-2">
                  {video.title}
                </h3>

                {/* Description */}
                {video.description && (
                  <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                    {video.description}
                  </p>
                )}

                {/* YouTube ID */}
                <div className="flex items-center gap-2 text-xs text-gray-500 mb-4">
                  <span>🎬</span>
                  <span className="font-mono">{video.youtubeId}</span>
                </div>

                {/* Actions */}
                <div className="flex gap-2 pt-4 border-t">
                  <button
                    onClick={() => openEditModal(video)}
                    className="flex-1 bg-blue-50 text-blue-600 px-3 py-2 rounded-lg hover:bg-blue-100 transition text-sm font-medium"
                  >
                    ✏️ Edit
                  </button>
                  <button
                    onClick={() => handleDelete(video._id, video.title)}
                    className="flex-1 bg-red-50 text-red-600 px-3 py-2 rounded-lg hover:bg-red-100 transition text-sm font-medium"
                  >
                    🗑️ Hapus
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex justify-between items-center p-6 border-b">
              <h2 className="text-xl font-bold text-gray-800">
                {modalMode === 'create' ? 'Tambah Video Hero' : 'Edit Video Hero'}
              </h2>
              <button
                onClick={closeModal}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {/* YouTube URL */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  YouTube URL *
                </label>
                <input
                  type="url"
                  name="youtubeUrl"
                  value={formData.youtubeUrl}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="https://www.youtube.com/watch?v=..."
                />
                <p className="text-xs text-gray-500 mt-1">
                  Format: youtube.com/watch?v=xxx atau youtu.be/xxx
                </p>
              </div>

              {/* Video Preview */}
              {formData.youtubeUrl && extractYouTubeId(formData.youtubeUrl) && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Preview
                  </label>
                  <div className="relative pb-[56.25%] h-0 rounded-lg overflow-hidden">
                    <iframe
                      src={`https://www.youtube.com/embed/${extractYouTubeId(formData.youtubeUrl)}`}
                      className="absolute top-0 left-0 w-full h-full"
                      frameBorder="0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  </div>
                </div>
              )}

              {/* Title */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Judul Video *
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  required
                  maxLength={150}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="Judul yang menarik untuk video"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Deskripsi (Opsional)
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows={3}
                  maxLength={300}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                  placeholder="Deskripsi singkat video..."
                />
              </div>

              {/* Display Order */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Urutan Tampilan
                </label>
                <input
                  type="number"
                  name="displayOrder"
                  value={formData.displayOrder}
                  onChange={handleInputChange}
                  min="0"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                  placeholder="0, 1, 2, dst. (lebih kecil = lebih awal)"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Semakin kecil angka, semakin awal ditampilkan
                </p>
              </div>

              {/* Active Status */}
              <div className="flex items-center">
                <input
                  type="checkbox"
                  name="isActive"
                  checked={formData.isActive}
                  onChange={handleInputChange}
                  className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                />
                <label className="ml-2 text-sm text-gray-700">
                  Aktif (tampilkan di homepage)
                </label>
              </div>

              {/* Warning if trying to activate when already 3 active */}
              {formData.isActive && modalMode === 'create' && activeCount >= 3 && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                  <p className="text-sm text-yellow-800">
                    ⚠️ Sudah ada 3 video aktif. Nonaktifkan video lain terlebih dahulu.
                  </p>
                </div>
              )}

              {/* Submit Buttons */}
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={closeModal}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition"
                >
                  {modalMode === 'create' ? 'Tambah' : 'Update'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Empty State */}
      {!loading && videos.length === 0 && (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">🎬</div>
          <h3 className="text-xl font-semibold text-gray-700 mb-2">
            Belum ada video hero
          </h3>
          <p className="text-gray-500 mb-4">
            Tambahkan video YouTube untuk hero section homepage!
          </p>
          <button
            onClick={openCreateModal}
            className="bg-primary-600 text-white px-6 py-2 rounded-lg hover:bg-primary-700 transition"
          >
            Tambah Video Hero
          </button>
        </div>
      )}
    </div>
  );
};

export default VideoHero;
