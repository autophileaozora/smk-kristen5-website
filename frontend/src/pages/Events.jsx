import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { MoreVertical, Edit3, Trash2, CheckCircle, XCircle, X, ChevronDown } from 'lucide-react';
import api from '../services/api';

const Events = ({ embedded = false, createTrigger = 0 }) => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState('create');
  const [currentEvent, setCurrentEvent] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [eventToDelete, setEventToDelete] = useState(null);
  const [toast, setToast] = useState(null);
  const [showPast, setShowPast] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'akademik',
    eventDate: '',
    startTime: '07:00',
    endTime: '12:00',
    location: '',
    isActive: true,
    order: 0,
  });

  const [eventMenu, setEventMenu] = useState(null);

  const openMenuFor = (e, event) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setEventMenu(prev =>
      prev?.event._id === event._id
        ? null
        : { event, top: rect.bottom + 4, right: window.innerWidth - rect.right }
    );
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  useEffect(() => {
    if (createTrigger > 0) openCreateModal();
  }, [createTrigger]);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const response = await api.get('/api/events/all');
      setEvents(response.data.data.events);
    } catch (error) {
      showToast(error.response?.data?.message || 'Gagal memuat events', 'error');
    } finally {
      setLoading(false);
    }
  };

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('id-ID', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatDateForInput = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toISOString().split('T')[0];
  };

  const openCreateModal = () => {
    setModalMode('create');
    setFormData({
      title: '',
      description: '',
      category: 'akademik',
      eventDate: '',
      startTime: '07:00',
      endTime: '12:00',
      location: '',
      isActive: true,
      order: events.length,
    });
    setShowModal(true);
  };

  const openEditModal = (event) => {
    setModalMode('edit');
    setCurrentEvent(event);
    setFormData({
      title: event.title,
      description: event.description || '',
      category: event.category,
      eventDate: formatDateForInput(event.eventDate),
      startTime: event.startTime,
      endTime: event.endTime,
      location: event.location || '',
      isActive: event.isActive,
      order: event.order,
    });
    setShowModal(true);
  };

  const openDeleteModal = (event) => {
    setEventToDelete(event);
    setShowDeleteModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setCurrentEvent(null);
  };

  const closeDeleteModal = () => {
    setShowDeleteModal(false);
    setEventToDelete(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.title || !formData.eventDate) {
      showToast('Judul dan tanggal harus diisi', 'error');
      return;
    }

    try {
      if (modalMode === 'create') {
        await api.post('/api/events', formData);
        showToast('Event berhasil dibuat!', 'success');
      } else {
        await api.put(`/api/events/${currentEvent._id}`, formData);
        showToast('Event berhasil diupdate!', 'success');
      }
      fetchEvents();
      closeModal();
    } catch (error) {
      showToast(error.response?.data?.message || 'Gagal menyimpan event', 'error');
    }
  };

  const handleDelete = async () => {
    try {
      await api.delete(`/api/events/${eventToDelete._id}`);
      showToast('Event berhasil dihapus!', 'success');
      fetchEvents();
      closeDeleteModal();
    } catch (error) {
      showToast(error.response?.data?.message || 'Gagal menghapus event', 'error');
    }
  };

  const toggleActive = async (id, currentStatus) => {
    try {
      await api.put(`/api/events/${id}`, { isActive: !currentStatus });
      showToast('Status berhasil diubah!', 'success');
      fetchEvents();
    } catch (error) {
      showToast(error.response?.data?.message || 'Gagal mengubah status', 'error');
    }
  };

  const getCategoryBadge = (category) => {
    if (category === 'akademik') {
      return <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-700 rounded">Akademik</span>;
    }
    return <span className="px-2 py-1 text-xs font-medium bg-purple-100 text-purple-700 rounded">Non Akademik</span>;
  };

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
          <h1 className="text-2xl font-bold text-gray-900">Agenda & Kegiatan</h1>
          <p className="text-gray-600 mt-1">Kelola jadwal kegiatan siswa dan guru</p>
        </div>
        <button
          onClick={openCreateModal}
          className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
        >
          <span className="text-xl">+</span>
          <span>Tambah Event</span>
        </button>
      </div>
      )}

      {/* Events Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden overflow-x-auto">
        {loading ? (
          <div className="p-8 text-center">
            <div className="inline-block w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full animate-spin"></div>
            <p className="mt-2 text-gray-600">Memuat data...</p>
          </div>
        ) : events.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <p>Belum ada event. Klik "Tambah Event" untuk mulai.</p>
          </div>
        ) : (
          <table className="w-full min-w-[800px]">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tanggal</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Judul</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Kategori</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Waktu</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Lokasi</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Aksi</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {events.filter((event) => {
                const isPast = new Date(event.eventDate) < new Date(new Date().setHours(0, 0, 0, 0));
                return showPast ? isPast : !isPast;
              }).map((event) => (
                <tr key={event._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {formatDate(event.eventDate)}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm font-medium text-gray-900">{event.title}</div>
                    {event.description && (
                      <div className="text-xs text-gray-500 mt-1 line-clamp-1">{event.description}</div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getCategoryBadge(event.category)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{event.startTime} - {event.endTime}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{event.location || '-'}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <button
                      onClick={() => toggleActive(event._id, event.isActive)}
                      className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        event.isActive
                          ? 'bg-green-100 text-green-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {event.isActive ? 'Aktif' : 'Nonaktif'}
                    </button>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button
                      onClick={(e) => { e.stopPropagation(); openMenuFor(e, event); }}
                      className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
                    >
                      <MoreVertical size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Past Events Toggle */}
      <div className="flex justify-end mt-3">
        <button
          onClick={() => setShowPast((p) => !p)}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium border transition-colors ${
            showPast
              ? 'bg-gray-700 text-white border-gray-700 hover:bg-gray-800'
              : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-50'
          }`}
        >
          <span>{showPast ? '📅' : '🕐'}</span>
          <span>{showPast ? 'Lihat Agenda Mendatang' : 'Lihat Agenda Berlalu'}</span>
        </button>
      </div>

      {/* Row action portal */}
      {eventMenu && createPortal(
        <>
          <div className="fixed inset-0 z-40" onClick={() => setEventMenu(null)} />
          <div
            className="fixed z-50 bg-white/80 backdrop-blur-2xl border border-white/70 rounded-xl shadow-[0_8px_28px_rgba(0,0,0,0.12),inset_0_1px_0_rgba(255,255,255,0.9)] py-1 min-w-[160px]"
            style={{ top: eventMenu.top, right: eventMenu.right }}
          >
            <button
              onClick={() => { openEditModal(eventMenu.event); setEventMenu(null); }}
              className="w-full px-4 py-2 text-left text-sm flex items-center gap-2.5 text-gray-700 hover:bg-black/[0.05] transition-colors"
            >
              <Edit3 size={13} className="text-gray-400" /> Edit
            </button>
            <button
              onClick={() => { toggleActive(eventMenu.event._id, eventMenu.event.isActive); setEventMenu(null); }}
              className="w-full px-4 py-2 text-left text-sm flex items-center gap-2.5 text-gray-700 hover:bg-black/[0.05] transition-colors"
            >
              {eventMenu.event.isActive
                ? <XCircle size={13} className="text-gray-400" />
                : <CheckCircle size={13} className="text-gray-400" />}
              {eventMenu.event.isActive ? 'Nonaktifkan' : 'Aktifkan'}
            </button>
            <div className="my-1 border-t border-black/[0.06]" />
            <button
              onClick={() => { openDeleteModal(eventMenu.event); setEventMenu(null); }}
              className="w-full px-4 py-2 text-left text-sm flex items-center gap-2.5 text-red-600 hover:bg-red-50/60 transition-colors"
            >
              <Trash2 size={13} /> Hapus
            </button>
          </div>
        </>,
        document.body
      )}

      {/* Create/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/20 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-white/80 backdrop-blur-2xl border border-white/70 rounded-2xl shadow-[0_8px_40px_rgba(0,0,0,0.15),inset_0_1px_0_rgba(255,255,255,0.9)] max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-5 py-4 border-b border-black/[0.06] sticky top-0 bg-white/80 backdrop-blur-2xl rounded-t-2xl">
              <h2 className="text-sm font-semibold text-gray-800">
                {modalMode === 'create' ? 'Tambah Event' : 'Edit Event'}
              </h2>
              <button
                type="button"
                onClick={closeModal}
                className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-black/5 rounded-lg transition-colors"
              >
                <X size={14} />
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="p-5 space-y-4">
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1.5">
                    Judul Event <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full px-3 py-2 text-sm bg-white/60 border border-black/[0.08] rounded-xl focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 outline-none transition-all placeholder:text-gray-400"
                    placeholder="Contoh: Upacara Bendera"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1.5">
                    Deskripsi (Opsional)
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full px-3 py-2 text-sm bg-white/60 border border-black/[0.08] rounded-xl focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 outline-none transition-all placeholder:text-gray-400"
                    rows="2"
                    placeholder="Deskripsi singkat event..."
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1.5">
                      Tanggal <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="date"
                      value={formData.eventDate}
                      onChange={(e) => setFormData({ ...formData, eventDate: e.target.value })}
                      className="w-full px-3 py-2 text-sm bg-white/60 border border-black/[0.08] rounded-xl focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 outline-none transition-all placeholder:text-gray-400"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1.5">
                      Kategori
                    </label>
                    <div className="relative">
                      <select
                        value={formData.category}
                        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                        className="w-full px-3 py-2 text-sm bg-white/60 border border-black/[0.08] rounded-xl focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 outline-none transition-all appearance-none pr-8"
                      >
                        <option value="akademik">Akademik</option>
                        <option value="non-akademik">Non Akademik</option>
                      </select>
                      <ChevronDown size={13} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1.5">
                      Jam Mulai
                    </label>
                    <input
                      type="time"
                      value={formData.startTime}
                      onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                      className="w-full px-3 py-2 text-sm bg-white/60 border border-black/[0.08] rounded-xl focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 outline-none transition-all placeholder:text-gray-400"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1.5">
                      Jam Selesai
                    </label>
                    <input
                      type="time"
                      value={formData.endTime}
                      onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                      className="w-full px-3 py-2 text-sm bg-white/60 border border-black/[0.08] rounded-xl focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 outline-none transition-all placeholder:text-gray-400"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1.5">
                    Lokasi (Opsional)
                  </label>
                  <input
                    type="text"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    className="w-full px-3 py-2 text-sm bg-white/60 border border-black/[0.08] rounded-xl focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 outline-none transition-all placeholder:text-gray-400"
                    placeholder="Contoh: Aula Sekolah"
                  />
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="isActive"
                    checked={formData.isActive}
                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                    className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                  />
                  <label htmlFor="isActive" className="ml-2 text-sm text-gray-700">
                    Tampilkan di website
                  </label>
                </div>
              </div>

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
                  Simpan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && eventToDelete && (
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
                Apakah Anda yakin ingin menghapus event <strong>{eventToDelete.title}</strong>?
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

export default Events;
