import { useState, useEffect, useCallback } from 'react';
import api from '../services/api';
import { CheckCircle, XCircle, Trash2, Clock, ExternalLink, ChevronDown } from 'lucide-react';

const STATUS_LABELS = {
  pending: { label: 'Menunggu', color: 'bg-yellow-100 text-yellow-700' },
  approved: { label: 'Disetujui', color: 'bg-green-100 text-green-700' },
  rejected: { label: 'Ditolak', color: 'bg-red-100 text-red-700' },
};

const AlumniSubmissions = ({ embedded = false, onCountChange }) => {
  const [submissions, setSubmissions] = useState([]);
  const [counts, setCounts] = useState({ pending: 0, approved: 0, rejected: 0 });
  const [activeFilter, setActiveFilter] = useState('pending');
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);
  const [rejectTarget, setRejectTarget] = useState(null); // { id, reason }
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [toast, setToast] = useState(null);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  const fetchSubmissions = useCallback(async (status) => {
    try {
      setLoading(true);
      const params = status !== 'all' ? `?status=${status}` : '';
      const res = await api.get(`/api/alumni-submissions${params}`);
      setSubmissions(res.data.data.submissions);
      const c = res.data.data.counts;
      setCounts(c);
      onCountChange?.(c.pending);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [onCountChange]);

  useEffect(() => {
    fetchSubmissions(activeFilter);
  }, [activeFilter, fetchSubmissions]);

  const handleApprove = async (id) => {
    if (!window.confirm('Setujui review ini dan tambahkan ke daftar alumni?')) return;
    setActionLoading(id + '-approve');
    try {
      const res = await api.patch(`/api/alumni-submissions/${id}/approve`);
      showToast(res.data.message);
      fetchSubmissions(activeFilter);
    } catch (err) {
      showToast(err.response?.data?.message || 'Gagal menyetujui review', 'error');
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async () => {
    if (!rejectTarget) return;
    setActionLoading(rejectTarget.id + '-reject');
    try {
      await api.patch(`/api/alumni-submissions/${rejectTarget.id}/reject`, {
        reason: rejectTarget.reason,
      });
      showToast('Review ditolak');
      setRejectTarget(null);
      fetchSubmissions(activeFilter);
    } catch (err) {
      showToast(err.response?.data?.message || 'Gagal menolak review', 'error');
    } finally {
      setActionLoading(null);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setActionLoading(deleteTarget + '-delete');
    try {
      await api.delete(`/api/alumni-submissions/${deleteTarget}`);
      showToast('Submission dihapus');
      setDeleteTarget(null);
      fetchSubmissions(activeFilter);
    } catch (err) {
      showToast(err.response?.data?.message || 'Gagal menghapus', 'error');
    } finally {
      setActionLoading(null);
    }
  };

  const filterTabs = [
    { id: 'pending', label: 'Menunggu', count: counts.pending },
    { id: 'approved', label: 'Disetujui', count: counts.approved },
    { id: 'rejected', label: 'Ditolak', count: counts.rejected },
    { id: 'all', label: 'Semua', count: counts.pending + counts.approved + counts.rejected },
  ];

  const content = (
    <div>
      {/* Toast */}
      {toast && (
        <div className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-lg shadow-lg text-sm font-medium text-white transition-all ${toast.type === 'error' ? 'bg-red-500' : 'bg-green-500'}`}>
          {toast.message}
        </div>
      )}

      {/* Filter tabs */}
      <div className="flex gap-2 flex-wrap mb-6">
        {filterTabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveFilter(tab.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              activeFilter === tab.id
                ? 'bg-blue-600 text-white'
                : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
            }`}
          >
            {tab.label}
            <span className={`inline-flex items-center justify-center min-w-[20px] h-5 px-1 text-[11px] font-bold rounded-full ${
              activeFilter === tab.id ? 'bg-white/30 text-white' : 'bg-gray-100 text-gray-600'
            }`}>
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex justify-center py-20">
          <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : submissions.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-xl border border-gray-100">
          <Clock className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500">Tidak ada review di sini</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {submissions.map((s) => (
            <SubmissionCard
              key={s._id}
              submission={s}
              actionLoading={actionLoading}
              onApprove={handleApprove}
              onReject={(id) => setRejectTarget({ id, reason: '' })}
              onDelete={(id) => setDeleteTarget(id)}
            />
          ))}
        </div>
      )}

      {/* Reject Dialog */}
      {rejectTarget && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl">
            <h3 className="text-lg font-semibold text-gray-800 mb-2">Tolak Review</h3>
            <p className="text-sm text-gray-500 mb-4">Opsional: berikan alasan penolakan</p>
            <textarea
              value={rejectTarget.reason}
              onChange={(e) => setRejectTarget({ ...rejectTarget, reason: e.target.value })}
              placeholder="Alasan penolakan (opsional)..."
              rows={3}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-400 resize-none"
            />
            <div className="flex gap-3 mt-4 justify-end">
              <button
                onClick={() => setRejectTarget(null)}
                className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                Batal
              </button>
              <button
                onClick={handleReject}
                disabled={actionLoading === rejectTarget.id + '-reject'}
                className="px-4 py-2 text-sm bg-red-500 hover:bg-red-600 text-white rounded-lg font-medium transition-colors disabled:opacity-60"
              >
                {actionLoading === rejectTarget.id + '-reject' ? 'Menolak...' : 'Tolak Review'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Dialog */}
      {deleteTarget && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-xl">
            <h3 className="text-lg font-semibold text-gray-800 mb-2">Hapus Submission?</h3>
            <p className="text-sm text-gray-500 mb-5">Data dan foto akan dihapus permanen.</p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setDeleteTarget(null)}
                className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                Batal
              </button>
              <button
                onClick={handleDelete}
                disabled={actionLoading === deleteTarget + '-delete'}
                className="px-4 py-2 text-sm bg-red-500 hover:bg-red-600 text-white rounded-lg font-medium transition-colors disabled:opacity-60"
              >
                {actionLoading === deleteTarget + '-delete' ? 'Menghapus...' : 'Hapus'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  if (embedded) return content;

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Review Alumni</h1>
        <p className="text-sm text-gray-500 mt-1">Kelola review yang dikirim alumni</p>
      </div>
      {content}
    </div>
  );
};

// ── Submission Card ─────────────────────────────────────────────────────────

const SubmissionCard = ({ submission: s, actionLoading, onApprove, onReject, onDelete }) => {
  const [expanded, setExpanded] = useState(false);
  const status = STATUS_LABELS[s.status] || STATUS_LABELS.pending;
  const isPending = s.status === 'pending';

  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden flex flex-col">
      {/* Photo + name header */}
      <div className="flex items-start gap-3 p-4 pb-3">
        <img
          src={s.photo?.url || '/placeholder.jpg'}
          alt={s.name}
          className="w-14 h-14 rounded-full object-cover flex-shrink-0 border-2 border-gray-100"
        />
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div>
              <h3 className="font-semibold text-gray-800 text-sm leading-tight">{s.name}</h3>
              {(s.currentOccupation || s.company) && (
                <p className="text-xs text-gray-500 mt-0.5">
                  {[s.currentOccupation, s.company].filter(Boolean).join(' · ')}
                </p>
              )}
            </div>
            <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold whitespace-nowrap flex-shrink-0 ${status.color}`}>
              {status.label}
            </span>
          </div>
          <div className="flex gap-2 mt-1.5 flex-wrap">
            <span className="px-2 py-0.5 bg-blue-50 text-blue-700 text-[10px] font-medium rounded-full">{s.jurusan}</span>
            <span className="px-2 py-0.5 bg-gray-100 text-gray-600 text-[10px] font-medium rounded-full">Lulus {s.graduationYear}</span>
          </div>
        </div>
      </div>

      {/* Testimonial */}
      <div className="px-4 pb-3 flex-1">
        <p
          className="text-xs text-gray-600 leading-relaxed"
          style={!expanded ? { display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' } : {}}
        >
          "{s.testimonial}"
        </p>
        {s.testimonial?.length > 150 && (
          <button
            onClick={() => setExpanded(!expanded)}
            className="flex items-center gap-1 text-[10px] text-blue-500 hover:text-blue-700 mt-1 font-medium"
          >
            {expanded ? 'Lebih sedikit' : 'Selengkapnya'}
            <ChevronDown size={12} className={`transition-transform ${expanded ? 'rotate-180' : ''}`} />
          </button>
        )}

        {/* Rejection reason */}
        {s.status === 'rejected' && s.rejectionReason && (
          <div className="mt-2 p-2 bg-red-50 rounded-lg text-[10px] text-red-600">
            <span className="font-semibold">Alasan: </span>{s.rejectionReason}
          </div>
        )}

        {/* Approved: link to alumni */}
        {s.status === 'approved' && s.linkedAlumniId && (
          <a
            href={`/admin/kesiswaan?tab=alumni`}
            className="inline-flex items-center gap-1 mt-2 text-[10px] text-green-600 hover:text-green-700 font-medium"
          >
            <ExternalLink size={10} /> Lihat data alumni
          </a>
        )}
      </div>

      {/* Date */}
      <div className="px-4 pb-2">
        <p className="text-[10px] text-gray-400">
          Dikirim {new Date(s.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
          {s.reviewedAt && ` · Direview ${new Date(s.reviewedAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}`}
        </p>
      </div>

      {/* Actions */}
      <div className="border-t border-gray-100 px-4 py-3 flex gap-2">
        {isPending && (
          <>
            <button
              onClick={() => onApprove(s._id)}
              disabled={actionLoading === s._id + '-approve'}
              className="flex-1 flex items-center justify-center gap-1.5 px-3 py-1.5 bg-green-500 hover:bg-green-600 text-white text-xs font-medium rounded-lg transition-colors disabled:opacity-60"
            >
              <CheckCircle size={13} />
              {actionLoading === s._id + '-approve' ? '...' : 'Setujui'}
            </button>
            <button
              onClick={() => onReject(s._id)}
              disabled={!!actionLoading}
              className="flex-1 flex items-center justify-center gap-1.5 px-3 py-1.5 bg-red-100 hover:bg-red-200 text-red-700 text-xs font-medium rounded-lg transition-colors disabled:opacity-60"
            >
              <XCircle size={13} />
              Tolak
            </button>
          </>
        )}
        <button
          onClick={() => onDelete(s._id)}
          disabled={!!actionLoading}
          className={`flex items-center justify-center gap-1.5 px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-600 text-xs font-medium rounded-lg transition-colors disabled:opacity-60 ${isPending ? '' : 'flex-1'}`}
        >
          <Trash2 size={13} />
          {!isPending && 'Hapus'}
        </button>
      </div>
    </div>
  );
};

export default AlumniSubmissions;
