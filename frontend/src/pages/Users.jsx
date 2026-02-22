import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { MoreHorizontal, Pencil, Trash2, Eye, EyeOff, ChevronDown, X, UserCircle } from 'lucide-react';
import api from '../utils/api';
import useAuthStore from '../store/authStore';

const Users = ({
  embedded = false,
  filters = { search: '', role: '', isActive: '' },
  externalPage = 1,
  onPageChange,
  onPaginationChange,
  createTrigger = 0,
}) => {
  const { user: currentUser } = useAuthStore();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [formData, setFormData] = useState({ name: '', email: '', password: '', role: 'admin_siswa' });
  const [toast, setToast] = useState(null);
  const [openMenu, setOpenMenu] = useState(null);

  useEffect(() => { fetchUsers(); }, [externalPage, filters]);
  useEffect(() => { if (createTrigger > 0) { resetForm(); setShowCreateModal(true); } }, [createTrigger]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const params = {
        page: externalPage,
        limit: 10,
        ...(filters.search    && { search:   filters.search }),
        ...(filters.role      && { role:     filters.role }),
        ...(filters.isActive !== '' && { isActive: filters.isActive }),
      };
      const res = await api.get('/api/users', { params });
      setUsers(res.data.data.users);
      const pag = res.data.data.pagination;
      onPaginationChange?.({ pages: pag.pages, total: pag.total });
    } catch (error) {
      showToast(error.response?.data?.message || 'Gagal memuat data', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateUser = async () => {
    try {
      await api.post('/api/users', formData);
      showToast('User berhasil dibuat');
      setShowCreateModal(false);
      resetForm();
      fetchUsers();
    } catch (error) {
      showToast(error.response?.data?.message || 'Gagal membuat user', 'error');
    }
  };

  const handleUpdateUser = async () => {
    try {
      await api.put(`/api/users/${selectedUser._id}`, {
        name: formData.name, email: formData.email,
        role: formData.role, isActive: formData.isActive,
      });
      showToast('User berhasil diperbarui');
      setShowEditModal(false);
      resetForm();
      fetchUsers();
    } catch (error) {
      showToast(error.response?.data?.message || 'Gagal memperbarui user', 'error');
    }
  };

  const handleToggleActive = async (user) => {
    try {
      const endpoint = user.isActive ? 'deactivate' : 'activate';
      await api.patch(`/api/users/${user._id}/${endpoint}`);
      showToast(user.isActive ? 'User dinonaktifkan' : 'User diaktifkan');
      fetchUsers();
    } catch (error) {
      showToast(error.response?.data?.message || 'Gagal mengubah status', 'error');
    }
  };

  const handleDeleteUser = async (user) => {
    if (!window.confirm(`Hapus user "${user.name}"?`)) return;
    try {
      await api.delete(`/api/users/${user._id}`);
      showToast('User berhasil dihapus');
      fetchUsers();
    } catch (error) {
      showToast(error.response?.data?.message || 'Gagal menghapus user', 'error');
    }
  };

  const openEditModal = (user) => {
    setSelectedUser(user);
    setFormData({ name: user.name, email: user.email, password: '', role: user.role, isActive: user.isActive });
    setOpenMenu(null);
    setShowEditModal(true);
  };

  const resetForm = () => {
    setFormData({ name: '', email: '', password: '', role: 'admin_siswa' });
    setSelectedUser(null);
  };

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const openMenuFor = (id, e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setOpenMenu({ id, top: rect.bottom + 4, right: window.innerWidth - rect.right });
  };

  const roleBadge = (role) =>
    role === 'administrator'
      ? <span className="px-1.5 py-px text-[10px] bg-purple-100/80 text-purple-600 rounded-md font-medium">Administrator</span>
      : <span className="px-1.5 py-px text-[10px] bg-blue-100/80 text-blue-600 rounded-md font-medium">Admin Siswa</span>;

  const avatarCls = (role) =>
    role === 'administrator' ? 'bg-purple-100 text-purple-600' : 'bg-blue-100 text-blue-600';

  const inputCls = 'w-full px-3 py-2 text-sm bg-white/60 border border-black/[0.08] rounded-xl focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 outline-none transition-all placeholder:text-gray-300';

  const Sel = ({ value, onChange, children }) => (
    <div className="relative">
      <select value={value} onChange={onChange} className={`${inputCls} appearance-none pr-8`}>
        {children}
      </select>
      <ChevronDown size={13} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
    </div>
  );

  return (
    <div className={embedded ? 'p-4 pb-24' : 'p-6'}>

      {/* Toast */}
      {toast && (
        <div className={`fixed top-4 right-4 z-[200] px-4 py-2.5 rounded-xl shadow-lg text-sm font-medium text-white ${toast.type === 'error' ? 'bg-red-500/90' : 'bg-green-500/90'}`}>
          {toast.message}
        </div>
      )}

      {/* User list */}
      {loading ? (
        <div className="flex items-center justify-center py-16">
          <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : users.length === 0 ? (
        <div className="py-16 text-center text-gray-400">
          <div className="w-12 h-12 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-3">
            <UserCircle size={20} className="text-gray-300" />
          </div>
          <p className="text-sm">Tidak ada user ditemukan.</p>
        </div>
      ) : (
        <div className="space-y-1.5">
          {users.map(user => (
            <div
              key={user._id}
              className={`bg-white/55 backdrop-blur-sm border border-white/75 rounded-2xl shadow-[0_1px_6px_rgba(0,0,0,0.05),inset_0_1px_0_rgba(255,255,255,0.8)] flex items-center gap-3 px-3.5 py-2.5 transition-opacity ${!user.isActive ? 'opacity-55' : ''}`}
            >
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-sm font-bold flex-shrink-0 ${avatarCls(user.role)}`}>
                {user.name.charAt(0).toUpperCase()}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="text-sm font-medium text-gray-800">{user.name}</span>
                  {user._id === currentUser?.id && <span className="text-[10px] text-gray-400">(Anda)</span>}
                  {roleBadge(user.role)}
                  {!user.isActive && <span className="px-1.5 py-px text-[10px] bg-gray-100 text-gray-400 rounded-md">Nonaktif</span>}
                </div>
                <p className="text-[11px] text-gray-400 truncate mt-0.5">{user.email}</p>
              </div>

              <button onClick={e => openMenuFor(user._id, e)}
                className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-black/5 rounded-xl transition-colors flex-shrink-0">
                <MoreHorizontal size={15} />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Create modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/20 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-white/80 backdrop-blur-2xl border border-white/70 rounded-2xl shadow-[0_8px_40px_rgba(0,0,0,0.15),inset_0_1px_0_rgba(255,255,255,0.9)] max-w-md w-full">
            <div className="flex items-center justify-between px-5 py-4 border-b border-black/[0.06]">
              <h2 className="text-sm font-semibold text-gray-800">Tambah User Baru</h2>
              <button onClick={() => { setShowCreateModal(false); resetForm(); }}
                className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-black/5 rounded-lg transition-colors"><X size={14} /></button>
            </div>
            <div className="p-5 space-y-3">
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1.5">Nama Lengkap</label>
                <input type="text" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} className={inputCls} placeholder="Budi Santoso" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1.5">Email</label>
                <input type="email" value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} className={inputCls} placeholder="budi@smk5klaten.sch.id" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1.5">Password</label>
                <input type="password" value={formData.password} onChange={e => setFormData({ ...formData, password: e.target.value })} className={inputCls} placeholder="Minimal 6 karakter" minLength={6} />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1.5">Role</label>
                <Sel value={formData.role} onChange={e => setFormData({ ...formData, role: e.target.value })}>
                  <option value="admin_siswa">Admin Siswa</option>
                  <option value="administrator">Administrator</option>
                </Sel>
              </div>
            </div>
            <div className="flex justify-end gap-2 px-5 pb-5 pt-2 border-t border-black/[0.06]">
              <button onClick={() => { setShowCreateModal(false); resetForm(); }} className="px-4 py-2 text-xs text-gray-600 hover:bg-black/5 rounded-xl transition-colors">Batal</button>
              <button onClick={handleCreateUser} className="px-4 py-2 text-xs bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors">Simpan</button>
            </div>
          </div>
        </div>
      )}

      {/* Edit modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black/20 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-white/80 backdrop-blur-2xl border border-white/70 rounded-2xl shadow-[0_8px_40px_rgba(0,0,0,0.15),inset_0_1px_0_rgba(255,255,255,0.9)] max-w-md w-full">
            <div className="flex items-center justify-between px-5 py-4 border-b border-black/[0.06]">
              <h2 className="text-sm font-semibold text-gray-800">Edit User</h2>
              <button onClick={() => { setShowEditModal(false); resetForm(); }}
                className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-black/5 rounded-lg transition-colors"><X size={14} /></button>
            </div>
            <div className="p-5 space-y-3">
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1.5">Nama Lengkap</label>
                <input type="text" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} className={inputCls} />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1.5">Email</label>
                <input type="email" value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} className={inputCls} />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1.5">Role</label>
                <Sel value={formData.role} onChange={e => setFormData({ ...formData, role: e.target.value })}>
                  <option value="admin_siswa">Admin Siswa</option>
                  <option value="administrator">Administrator</option>
                </Sel>
              </div>
            </div>
            <div className="flex justify-end gap-2 px-5 pb-5 pt-2 border-t border-black/[0.06]">
              <button onClick={() => { setShowEditModal(false); resetForm(); }} className="px-4 py-2 text-xs text-gray-600 hover:bg-black/5 rounded-xl transition-colors">Batal</button>
              <button onClick={handleUpdateUser} className="px-4 py-2 text-xs bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors">Simpan</button>
            </div>
          </div>
        </div>
      )}

      {/* Context menu portal */}
      {openMenu && (() => {
        const target = users.find(u => u._id === openMenu.id);
        if (!target) return null;
        const isSelf = target._id === currentUser?.id;
        return createPortal(
          <>
            <div className="fixed inset-0 z-[90]" onClick={() => setOpenMenu(null)} />
            <div className="fixed bg-white/85 backdrop-blur-2xl border border-white/70 rounded-xl shadow-[0_4px_24px_rgba(0,0,0,0.12),inset_0_1px_0_rgba(255,255,255,0.9)] py-1 min-w-[150px] z-[100]"
              style={{ top: openMenu.top, right: openMenu.right }}>
              <button onClick={() => openEditModal(target)}
                className="w-full flex items-center gap-2.5 px-3 py-2 text-xs text-gray-700 hover:bg-black/[0.05] transition-colors">
                <Pencil size={13} className="text-blue-400" />Edit
              </button>
              {!isSelf && (
                <button onClick={() => { handleToggleActive(target); setOpenMenu(null); }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-xs text-gray-700 hover:bg-black/[0.05] transition-colors">
                  {target.isActive
                    ? <><EyeOff size={13} className="text-gray-400" />Nonaktifkan</>
                    : <><Eye size={13} className="text-emerald-500" />Aktifkan</>
                  }
                </button>
              )}
              {!isSelf && <>
                <div className="mx-2 my-0.5 h-px bg-black/[0.06]" />
                <button onClick={() => { handleDeleteUser(target); setOpenMenu(null); }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-xs text-red-500 hover:bg-red-50 transition-colors">
                  <Trash2 size={13} />Hapus
                </button>
              </>}
            </div>
          </>,
          document.body
        );
      })()}
    </div>
  );
};

export default Users;
