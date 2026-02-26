import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Mail, MailOpen, Trash2, ChevronDown, X } from 'lucide-react';
import api from '../services/api';

const ContactMessages = ({ embedded = false }) => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('semua'); // semua | belum | sudah
  const [toast, setToast] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [expanded, setExpanded] = useState({}); // { [id]: bool }

  useEffect(() => {
    fetchMessages();
  }, [filter]);

  const fetchMessages = async () => {
    try {
      setLoading(true);
      const params = {};
      if (filter === 'belum') params.isRead = false;
      if (filter === 'sudah') params.isRead = true;
      const res = await api.get('/api/contact-messages', { params });
      setMessages(res.data.data.messages || []);
    } catch {
      showToast('Gagal memuat pesan', 'error');
    } finally {
      setLoading(false);
    }
  };

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const markRead = async (id) => {
    try {
      await api.patch(`/api/contact-messages/${id}/read`);
      setMessages(prev => prev.map(m => m._id === id ? { ...m, isRead: true } : m));
    } catch {
      showToast('Gagal menandai pesan', 'error');
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await api.delete(`/api/contact-messages/${deleteTarget._id}`);
      showToast('Pesan dihapus');
      setMessages(prev => prev.filter(m => m._id !== deleteTarget._id));
      setDeleteTarget(null);
    } catch {
      showToast('Gagal menghapus pesan', 'error');
    }
  };

  const toggleExpand = (id) => setExpanded(prev => ({ ...prev, [id]: !prev[id] }));

  const unreadCount = messages.filter(m => !m.isRead).length;

  return (
    <div className={embedded ? '' : 'p-6'}>
      {/* Toast */}
      {toast && createPortal(
        <div className={`fixed top-4 right-4 z-[9999] px-5 py-3 rounded-xl shadow-lg text-sm font-medium text-white ${toast.type === 'success' ? 'bg-green-500' : 'bg-red-500'}`}>
          {toast.message}
        </div>,
        document.body
      )}

      {/* Header */}
      {!embedded && (
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            Pesan Masuk
            {unreadCount > 0 && (
              <span className="px-2 py-0.5 bg-red-500 text-white text-xs font-bold rounded-full">{unreadCount}</span>
            )}
          </h1>
          <p className="text-gray-500 text-sm mt-1">Pesan dari form kontak publik</p>
        </div>
      )}

      {/* Filter tabs */}
      <div className={`flex gap-1 mb-4 ${embedded ? 'px-4 pt-4' : ''}`}>
        {[
          { id: 'semua', label: 'Semua' },
          { id: 'belum', label: 'Belum Dibaca' },
          { id: 'sudah', label: 'Sudah Dibaca' },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setFilter(tab.id)}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
              filter === tab.id ? 'bg-blue-600 text-white' : 'bg-black/5 text-gray-600 hover:bg-black/10'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Messages list */}
      {loading ? (
        <div className="flex justify-center items-center py-16">
          <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : messages.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <Mail size={40} className="mx-auto mb-3 opacity-40" />
          <p className="text-sm">Tidak ada pesan</p>
        </div>
      ) : (
        <div className={`space-y-2 ${embedded ? 'px-4 pb-4' : ''}`}>
          {messages.map(msg => (
            <div
              key={msg._id}
              className={`rounded-xl border transition-all ${
                msg.isRead
                  ? 'bg-white/50 border-black/[0.06]'
                  : 'bg-blue-50/60 border-blue-200/60'
              }`}
            >
              <div className="p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-2.5 flex-1 min-w-0">
                    <div className={`mt-0.5 flex-shrink-0 ${msg.isRead ? 'text-gray-400' : 'text-blue-500'}`}>
                      {msg.isRead ? <MailOpen size={15} /> : <Mail size={15} />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm font-semibold text-gray-800">{msg.namaLengkap}</span>
                        <span className="text-xs text-gray-400">{msg.email}</span>
                        {!msg.isRead && (
                          <span className="px-1.5 py-0.5 bg-blue-500 text-white text-[10px] font-bold rounded-full">Baru</span>
                        )}
                      </div>
                      <p className="text-xs text-gray-400 mt-0.5">
                        {new Date(msg.createdAt).toLocaleString('id-ID', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                      </p>
                      {/* Message body */}
                      <p
                        className="text-sm text-gray-700 mt-2 leading-relaxed"
                        style={!expanded[msg._id] ? { display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' } : {}}
                      >
                        {msg.pertanyaan}
                      </p>
                      {msg.pertanyaan.length > 100 && (
                        <button
                          onClick={() => toggleExpand(msg._id)}
                          className="flex items-center gap-1 text-[10px] text-blue-500 hover:text-blue-700 mt-1 font-medium"
                        >
                          {expanded[msg._id] ? 'Lebih sedikit' : 'Selengkapnya'}
                          <ChevronDown size={11} className={`transition-transform ${expanded[msg._id] ? 'rotate-180' : ''}`} />
                        </button>
                      )}
                    </div>
                  </div>
                  {/* Actions */}
                  <div className="flex items-center gap-1 flex-shrink-0">
                    {!msg.isRead && (
                      <button
                        onClick={() => markRead(msg._id)}
                        title="Tandai dibaca"
                        className="p-1.5 text-blue-500 hover:text-blue-700 hover:bg-blue-100 rounded-lg transition-colors"
                      >
                        <MailOpen size={13} />
                      </button>
                    )}
                    <button
                      onClick={() => setDeleteTarget(msg)}
                      title="Hapus"
                      className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Delete confirm modal */}
      {deleteTarget && createPortal(
        <div className="fixed inset-0 bg-black/20 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-white/80 backdrop-blur-2xl border border-white/70 rounded-2xl shadow-[0_8px_40px_rgba(0,0,0,0.15),inset_0_1px_0_rgba(255,255,255,0.9)] max-w-sm w-full p-6 text-center">
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <Trash2 size={20} className="text-red-500" />
            </div>
            <h3 className="text-sm font-semibold text-gray-800 mb-1">Hapus Pesan?</h3>
            <p className="text-xs text-gray-500 mb-4">Pesan dari <strong>{deleteTarget.namaLengkap}</strong> akan dihapus permanen.</p>
            <div className="flex gap-2">
              <button onClick={() => setDeleteTarget(null)} className="flex-1 px-4 py-2 text-xs text-gray-600 border border-black/[0.08] rounded-xl hover:bg-black/5 transition-colors">Batal</button>
              <button onClick={handleDelete} className="flex-1 px-4 py-2 text-xs bg-red-600 text-white rounded-xl hover:bg-red-700 transition-colors">Hapus</button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
};

export default ContactMessages;
