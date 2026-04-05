import { useState, useEffect, useCallback } from 'react';
import { Trash2, RotateCcw, AlertTriangle, Clock, RefreshCw, X } from 'lucide-react';
import api from '../services/api';

const TYPE_COLORS = {
  artikel:          'bg-blue-50 text-blue-700 border-blue-200',
  jurusan:          'bg-violet-50 text-violet-700 border-violet-200',
  'mata-pelajaran': 'bg-green-50 text-green-700 border-green-200',
  ekskul:           'bg-orange-50 text-orange-700 border-orange-200',
  fasilitas:        'bg-teal-50 text-teal-700 border-teal-200',
  prestasi:         'bg-yellow-50 text-yellow-700 border-yellow-200',
};

const RecycleBin = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null); // id of item being acted on
  const [toast, setToast] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null); // item to permanently delete
  const [filterType, setFilterType] = useState('');

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  const fetchItems = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get('/api/recycle-bin');
      setItems(res.data.data.items || []);
    } catch (e) {
      showToast(e.response?.data?.message || 'Gagal memuat recycle bin', 'error');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchItems(); }, [fetchItems]);

  const handleRestore = async (item) => {
    setActionLoading(item._id);
    try {
      await api.post(`/api/recycle-bin/${item.type}/${item._id}/restore`);
      showToast(`${item.name} berhasil dipulihkan`);
      setItems(prev => prev.filter(i => i._id !== item._id));
    } catch (e) {
      showToast(e.response?.data?.message || 'Gagal memulihkan item', 'error');
    } finally {
      setActionLoading(null);
    }
  };

  const handlePermanentDelete = async () => {
    if (!confirmDelete) return;
    setActionLoading(confirmDelete._id);
    setConfirmDelete(null);
    try {
      await api.delete(`/api/recycle-bin/${confirmDelete.type}/${confirmDelete._id}`);
      showToast(`${confirmDelete.name} dihapus permanen`);
      setItems(prev => prev.filter(i => i._id !== confirmDelete._id));
    } catch (e) {
      showToast(e.response?.data?.message || 'Gagal menghapus permanen', 'error');
    } finally {
      setActionLoading(null);
    }
  };

  const filteredItems = filterType ? items.filter(i => i.type === filterType) : items;

  const uniqueTypes = [...new Set(items.map(i => i.type))];

  const formatTimeLeft = (hoursLeft) => {
    if (hoursLeft <= 0) return 'Kedaluwarsa';
    if (hoursLeft < 1) return '< 1 jam';
    if (hoursLeft < 24) return `${hoursLeft} jam`;
    return `${Math.floor(hoursLeft / 24)} hari ${hoursLeft % 24} jam`;
  };

  const urgencyClass = (hoursLeft) => {
    if (hoursLeft <= 0) return 'text-red-600';
    if (hoursLeft < 6) return 'text-red-500';
    if (hoursLeft < 24) return 'text-orange-500';
    return 'text-gray-500';
  };

  return (
    <div className="p-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Trash2 size={24} className="text-red-500" />
            Recycle Bin
          </h1>
          <p className="text-gray-500 mt-1 text-sm">
            Item yang dihapus akan otomatis terhapus permanen setelah <strong>2 hari</strong>.
          </p>
        </div>
        <button
          onClick={fetchItems}
          className="flex items-center gap-1.5 px-3 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <RefreshCw size={15} />
          Refresh
        </button>
      </div>

      {/* Filter tabs */}
      {uniqueTypes.length > 1 && (
        <div className="flex flex-wrap gap-2 mb-5">
          <button
            onClick={() => setFilterType('')}
            className={`px-3 py-1.5 text-xs font-medium rounded-full border transition-colors ${
              filterType === '' ? 'bg-gray-900 text-white border-gray-900' : 'bg-white text-gray-600 border-gray-200 hover:border-gray-400'
            }`}
          >
            Semua ({items.length})
          </button>
          {uniqueTypes.map(type => (
            <button
              key={type}
              onClick={() => setFilterType(type)}
              className={`px-3 py-1.5 text-xs font-medium rounded-full border transition-colors ${
                filterType === type ? 'bg-gray-900 text-white border-gray-900' : 'bg-white text-gray-600 border-gray-200 hover:border-gray-400'
              }`}
            >
              {items.find(i => i.type === type)?.typeLabel} ({items.filter(i => i.type === type).length})
            </button>
          ))}
        </div>
      )}

      {/* Items list */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-20 bg-gray-100 rounded-xl animate-pulse" />
          ))}
        </div>
      ) : filteredItems.length === 0 ? (
        <div className="py-20 text-center">
          <Trash2 size={48} className="mx-auto text-gray-200 mb-4" />
          <p className="text-gray-400 font-medium">Recycle bin kosong</p>
          <p className="text-gray-300 text-sm mt-1">Tidak ada item yang dihapus</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredItems.map(item => (
            <div
              key={item._id}
              className="flex items-center gap-4 bg-white border border-gray-100 rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow"
            >
              {/* Thumbnail */}
              <div className="w-12 h-12 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                {item.image ? (
                  <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Trash2 size={18} className="text-gray-300" />
                  </div>
                )}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <span className={`px-2 py-0.5 text-[10px] font-semibold rounded-full border ${TYPE_COLORS[item.type] || 'bg-gray-50 text-gray-600 border-gray-200'}`}>
                    {item.typeLabel}
                  </span>
                </div>
                <p className="text-sm font-semibold text-gray-800 truncate">{item.name}</p>
                <div className={`flex items-center gap-1 mt-0.5 text-xs ${urgencyClass(item.hoursLeft)}`}>
                  <Clock size={11} />
                  <span>Terhapus permanen dalam: {formatTimeLeft(item.hoursLeft)}</span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 flex-shrink-0">
                <button
                  onClick={() => handleRestore(item)}
                  disabled={actionLoading === item._id}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-green-700 bg-green-50 border border-green-200 rounded-lg hover:bg-green-100 transition-colors disabled:opacity-50"
                >
                  <RotateCcw size={13} />
                  Pulihkan
                </button>
                <button
                  onClick={() => setConfirmDelete(item)}
                  disabled={actionLoading === item._id}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-red-700 bg-red-50 border border-red-200 rounded-lg hover:bg-red-100 transition-colors disabled:opacity-50"
                >
                  <Trash2 size={13} />
                  Hapus Permanen
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Confirm permanent delete modal */}
      {confirmDelete && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-6">
            <div className="flex items-start gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
                <AlertTriangle size={20} className="text-red-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Hapus Permanen</h3>
                <p className="text-sm text-gray-500 mt-1">
                  Hapus <strong>"{confirmDelete.name}"</strong> secara permanen? Tindakan ini tidak bisa dibatalkan.
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setConfirmDelete(null)}
                className="flex-1 px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-xl transition-colors"
              >
                Batal
              </button>
              <button
                onClick={handlePermanentDelete}
                className="flex-1 px-4 py-2 text-sm bg-red-600 text-white rounded-xl hover:bg-red-700 transition-colors"
              >
                Hapus Permanen
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast */}
      {toast && (
        <div className={`fixed bottom-6 right-6 flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg text-sm font-medium z-50 ${
          toast.type === 'error' ? 'bg-red-600 text-white' : 'bg-gray-900 text-white'
        }`}>
          {toast.message}
          <button onClick={() => setToast(null)}><X size={14} /></button>
        </div>
      )}
    </div>
  );
};

export default RecycleBin;
