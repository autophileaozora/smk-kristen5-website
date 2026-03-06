import { useState, useEffect } from 'react';
import { Plus, Pencil, Trash2, Eye, EyeOff, GripVertical } from 'lucide-react';
import api from '../services/api';

const PRESET_COLORS = [
  { label: 'Biru', value: '#008fd7' },
  { label: 'Kuning', value: '#fbbf24' },
  { label: 'Merah', value: '#ef4444' },
  { label: 'Oranye', value: '#ea580c' },
  { label: 'Hijau', value: '#22c55e' },
  { label: 'Ungu', value: '#a855f7' },
  { label: 'Pink', value: '#ec4899' },
  { label: 'Abu', value: '#6b7280' },
];

const DATA_SOURCES = [
  { value: 'ekskul', label: 'Auto — Jumlah Ekskul' },
  { value: 'fasilitas', label: 'Auto — Jumlah Fasilitas' },
  { value: 'jurusan', label: 'Auto — Jumlah Jurusan' },
  { value: 'tahun', label: 'Auto — Tahun Melayani' },
  { value: 'custom', label: 'Angka Custom (isi sendiri)' },
];

const emptyForm = {
  title: '',
  description: '',
  dataSource: 'custom',
  customValue: '0',
  linkUrl: '',
  linkText: 'Lihat Selengkapnya',
  borderColor: '#008fd7',
  order: 0,
  isVisible: true,
};

const Toast = ({ msg, type }) => (
  <div className={`fixed bottom-6 right-6 z-50 px-4 py-3 rounded-xl shadow-lg text-white text-sm font-medium
    ${type === 'error' ? 'bg-red-500' : 'bg-green-500'}`}>
    {msg}
  </div>
);

const Modal = ({ title, onClose, children }) => (
  <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
      <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
        <h3 className="font-bold text-gray-800">{title}</h3>
        <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl leading-none">&times;</button>
      </div>
      <div className="px-6 py-5">{children}</div>
    </div>
  </div>
);

const ColorPicker = ({ value, onChange }) => (
  <div className="space-y-2">
    <div className="flex flex-wrap gap-2">
      {PRESET_COLORS.map((c) => (
        <button
          key={c.value}
          type="button"
          title={c.label}
          onClick={() => onChange(c.value)}
          className={`w-7 h-7 rounded-full border-2 transition-transform hover:scale-110
            ${value === c.value ? 'border-gray-700 scale-110' : 'border-transparent'}`}
          style={{ backgroundColor: c.value }}
        />
      ))}
    </div>
    <div className="flex items-center gap-2">
      <label className="text-xs text-gray-500">Custom:</label>
      <input
        type="color"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-8 h-8 rounded cursor-pointer border border-gray-200"
      />
      <span className="text-xs text-gray-500 font-mono">{value}</span>
    </div>
  </div>
);

const CardForm = ({ form, setForm, onSubmit, onCancel, loading }) => (
  <form onSubmit={onSubmit} className="space-y-4">
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">Judul Card *</label>
      <input
        type="text"
        value={form.title}
        onChange={(e) => setForm({ ...form, title: e.target.value })}
        placeholder="contoh: EKSTRAKURIKULER"
        required
        className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
    </div>

    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">Deskripsi</label>
      <textarea
        value={form.description}
        onChange={(e) => setForm({ ...form, description: e.target.value })}
        placeholder="Teks kecil di bawah judul..."
        rows={2}
        className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
      />
    </div>

    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">Sumber Angka</label>
      <select
        value={form.dataSource}
        onChange={(e) => setForm({ ...form, dataSource: e.target.value })}
        className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        {DATA_SOURCES.map((s) => (
          <option key={s.value} value={s.value}>{s.label}</option>
        ))}
      </select>
      <p className="text-xs text-gray-400 mt-1">
        {form.dataSource === 'custom'
          ? 'Angka diisi manual di bawah.'
          : 'Angka otomatis dihitung dari database.'}
      </p>
    </div>

    {form.dataSource === 'custom' && (
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Nilai Angka</label>
        <input
          type="text"
          value={form.customValue}
          onChange={(e) => setForm({ ...form, customValue: e.target.value })}
          placeholder="contoh: 100"
          className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
    )}

    {/* Link */}
    <div className="space-y-2 rounded-xl border border-gray-100 bg-gray-50 p-3">
      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Link Tombol (opsional)</p>
      <div>
        <label className="block text-xs text-gray-600 mb-1">URL Tujuan</label>
        <input
          type="text"
          value={form.linkUrl}
          onChange={(e) => setForm({ ...form, linkUrl: e.target.value })}
          placeholder="contoh: /ekskul atau https://..."
          className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
        />
      </div>
      <div>
        <label className="block text-xs text-gray-600 mb-1">Teks Tombol</label>
        <input
          type="text"
          value={form.linkText}
          onChange={(e) => setForm({ ...form, linkText: e.target.value })}
          placeholder="contoh: Lihat Semua Ekskul"
          className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
        />
      </div>
      <p className="text-xs text-gray-400">Kosongkan URL untuk tidak menampilkan link.</p>
    </div>

    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">Warna Border</label>
      <ColorPicker value={form.borderColor} onChange={(v) => setForm({ ...form, borderColor: v })} />
    </div>

    <div className="grid grid-cols-2 gap-3">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Urutan</label>
        <input
          type="number"
          value={form.order}
          onChange={(e) => setForm({ ...form, order: Number(e.target.value) })}
          className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
      <div className="flex items-end pb-1">
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={form.isVisible}
            onChange={(e) => setForm({ ...form, isVisible: e.target.checked })}
            className="w-4 h-4 rounded"
          />
          <span className="text-sm text-gray-700">Tampilkan</span>
        </label>
      </div>
    </div>

    {/* Preview mini */}
    <div className="bg-gray-50 rounded-xl p-4">
      <p className="text-xs text-gray-400 mb-2 uppercase tracking-wide">Preview</p>
      <div
        className="bg-white rounded-xl p-4 shadow border-l-[5px] inline-block min-w-[140px]"
        style={{ borderLeftColor: form.borderColor }}
      >
        <div className="text-2xl font-bold text-gray-700 leading-none">
          {form.dataSource === 'custom' ? (form.customValue || '0') : '●'}
        </div>
        <div className="text-xs font-bold text-gray-800 mt-1 uppercase tracking-wide">
          {form.title || 'JUDUL CARD'}
        </div>
        {form.description && (
          <div className="text-xs text-gray-500 mt-1 leading-relaxed line-clamp-4">{form.description}</div>
        )}
        {form.linkUrl && (
          <div className="mt-2 text-xs font-semibold" style={{ color: form.borderColor }}>
            {form.linkText || 'Lihat Selengkapnya'} →
          </div>
        )}
      </div>
      {form.dataSource !== 'custom' && (
        <p className="text-xs text-gray-400 mt-2">
          ● = angka otomatis dari database
        </p>
      )}
    </div>

    <div className="flex gap-2 pt-2">
      <button
        type="submit"
        disabled={loading}
        className="flex-1 bg-blue-600 text-white py-2.5 rounded-xl text-sm font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors"
      >
        {loading ? 'Menyimpan...' : 'Simpan'}
      </button>
      <button
        type="button"
        onClick={onCancel}
        className="px-4 py-2.5 rounded-xl text-sm text-gray-600 hover:bg-gray-100 transition-colors border border-gray-200"
      >
        Batal
      </button>
    </div>
  </form>
);

const StatsCardManagement = ({ embedded = false, createTrigger = 0 }) => {
  const [cards, setCards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState(null);
  const [modal, setModal] = useState(null); // 'create' | 'edit'
  const [editTarget, setEditTarget] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const fetchCards = async () => {
    try {
      setLoading(true);
      const res = await api.get('/api/stats-cards');
      setCards(res.data.data || []);
    } catch {
      showToast('Gagal memuat data', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchCards(); }, []);

  // external create trigger from HomepagePage
  useEffect(() => {
    if (createTrigger > 0) openCreate();
  }, [createTrigger]);

  const openCreate = () => {
    setForm({ ...emptyForm, order: cards.length });
    setModal('create');
  };

  const openEdit = (card) => {
    setEditTarget(card);
    setForm({
      title: card.title,
      description: card.description || '',
      dataSource: card.dataSource,
      customValue: card.customValue || '0',
      linkUrl: card.linkUrl || '',
      linkText: card.linkText || 'Lihat Selengkapnya',
      borderColor: card.borderColor || '#008fd7',
      order: card.order ?? 0,
      isVisible: card.isVisible ?? true,
    });
    setModal('edit');
  };

  const closeModal = () => {
    setModal(null);
    setEditTarget(null);
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.post('/api/stats-cards', form);
      showToast('Card berhasil dibuat');
      closeModal();
      fetchCards();
    } catch (err) {
      showToast(err.response?.data?.message || 'Gagal membuat card', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.put(`/api/stats-cards/${editTarget._id}`, form);
      showToast('Card berhasil diperbarui');
      closeModal();
      fetchCards();
    } catch (err) {
      showToast(err.response?.data?.message || 'Gagal memperbarui card', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`/api/stats-cards/${id}`);
      showToast('Card berhasil dihapus');
      setDeleteConfirm(null);
      fetchCards();
    } catch {
      showToast('Gagal menghapus card', 'error');
    }
  };

  const toggleVisible = async (card) => {
    try {
      await api.put(`/api/stats-cards/${card._id}`, { ...card, isVisible: !card.isVisible });
      fetchCards();
    } catch {
      showToast('Gagal mengubah visibilitas', 'error');
    }
  };

  const dataSourceLabel = (ds) => DATA_SOURCES.find((d) => d.value === ds)?.label ?? ds;

  return (
    <div className={embedded ? 'p-4 lg:p-6' : 'min-h-screen bg-gray-50 p-6'}>
      {toast && <Toast msg={toast.msg} type={toast.type} />}

      {/* Header (non-embedded only) */}
      {!embedded && (
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-xl font-bold text-gray-800">Stats Cards</h1>
            <p className="text-sm text-gray-500 mt-0.5">Kelola kartu statistik di halaman utama</p>
          </div>
          <button onClick={openCreate}
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-blue-700 transition-colors">
            <Plus size={15} /> Tambah Card
          </button>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-16">
          <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : cards.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <div className="text-5xl mb-3">📊</div>
          <p className="font-medium">Belum ada stats card</p>
          <p className="text-sm mt-1">Klik tombol + untuk membuat card pertama</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-3">
          {cards.map((card) => (
            <div
              key={card._id}
              className={`bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden transition-opacity
                ${card.isVisible ? '' : 'opacity-50'}`}
            >
              {/* Color bar */}
              <div className="h-1.5" style={{ backgroundColor: card.borderColor }} />
              <div className="p-4">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: card.borderColor }} />
                      <span className="text-xs text-gray-400 font-medium truncate">{dataSourceLabel(card.dataSource)}</span>
                    </div>
                    <div className="font-bold text-gray-800 text-base uppercase tracking-wide">{card.title}</div>
                    {card.description && (
                      <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">{card.description}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-1 flex-shrink-0">
                    <button
                      onClick={() => toggleVisible(card)}
                      title={card.isVisible ? 'Sembunyikan' : 'Tampilkan'}
                      className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
                    >
                      {card.isVisible ? <Eye size={14} /> : <EyeOff size={14} />}
                    </button>
                    <button
                      onClick={() => openEdit(card)}
                      className="p-1.5 rounded-lg text-blue-500 hover:text-blue-700 hover:bg-blue-50 transition-colors"
                    >
                      <Pencil size={14} />
                    </button>
                    <button
                      onClick={() => setDeleteConfirm(card)}
                      className="p-1.5 rounded-lg text-red-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
                <div className="mt-2 flex items-center gap-2 text-xs text-gray-400">
                  <GripVertical size={12} />
                  <span>Urutan: {card.order}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Modal */}
      {modal === 'create' && (
        <Modal title="Tambah Stats Card" onClose={closeModal}>
          <CardForm form={form} setForm={setForm} onSubmit={handleCreate} onCancel={closeModal} loading={saving} />
        </Modal>
      )}

      {/* Edit Modal */}
      {modal === 'edit' && (
        <Modal title="Edit Stats Card" onClose={closeModal}>
          <CardForm form={form} setForm={setForm} onSubmit={handleUpdate} onCancel={closeModal} loading={saving} />
        </Modal>
      )}

      {/* Delete Confirm */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl p-6 max-w-sm w-full text-center">
            <div className="text-4xl mb-3">🗑️</div>
            <h3 className="font-bold text-gray-800 mb-1">Hapus Card?</h3>
            <p className="text-sm text-gray-500 mb-5">
              Card <strong>"{deleteConfirm.title}"</strong> akan dihapus permanen.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => handleDelete(deleteConfirm._id)}
                className="flex-1 bg-red-500 text-white py-2 rounded-xl text-sm font-medium hover:bg-red-600 transition-colors"
              >
                Hapus
              </button>
              <button
                onClick={() => setDeleteConfirm(null)}
                className="flex-1 border border-gray-200 py-2 rounded-xl text-sm text-gray-600 hover:bg-gray-50 transition-colors"
              >
                Batal
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StatsCardManagement;
