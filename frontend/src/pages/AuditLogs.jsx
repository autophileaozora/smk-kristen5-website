import { useState, useEffect } from 'react';
import api from '../services/api';

const AuditLogs = ({
  embedded = false,
  filters = { action: '', resource: '', status: '', startDate: '', endDate: '' },
  externalPage = 1,
  onPageChange,
  onPaginationChange,
}) => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);

  useEffect(() => { fetchAuditLogs(); }, [externalPage, filters]);
  useEffect(() => { fetchStats(); }, []);

  const fetchAuditLogs = async () => {
    try {
      setLoading(true);
      const q = new URLSearchParams();
      if (filters.action)    q.append('action',    filters.action);
      if (filters.resource)  q.append('resource',  filters.resource);
      if (filters.status)    q.append('status',    filters.status);
      if (filters.startDate) q.append('startDate', filters.startDate);
      if (filters.endDate)   q.append('endDate',   filters.endDate);
      q.append('page', externalPage);
      q.append('limit', 20);

      const res = await api.get(`/api/audit-logs?${q.toString()}`);
      if (res.data.success) {
        setLogs(res.data.data.logs);
        const pag = res.data.data.pagination;
        onPaginationChange?.({ pages: pag.totalPages, total: pag.totalLogs });
      }
    } catch (error) {
      console.error('Error fetching audit logs:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const res = await api.get('/api/audit-logs/stats');
      if (res.data.success) setStats(res.data.data);
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const actionColors = {
    login:    'bg-emerald-100/80 text-emerald-700',
    logout:   'bg-gray-100/80 text-gray-500',
    create:   'bg-blue-100/80 text-blue-700',
    update:   'bg-amber-100/80 text-amber-700',
    delete:   'bg-red-100/80 text-red-700',
    approve:  'bg-purple-100/80 text-purple-700',
    reject:   'bg-orange-100/80 text-orange-700',
    upload:   'bg-indigo-100/80 text-indigo-700',
    download: 'bg-cyan-100/80 text-cyan-700',
  };

  const resourceLabels = {
    user: 'User', article: 'Artikel', runningText: 'Running Text',
    prestasi: 'Prestasi', jurusan: 'Jurusan', ekskul: 'Ekskul',
    alumni: 'Alumni', category: 'Kategori', videoHero: 'Video Hero', file: 'File',
  };

  const formatDate = (d) => new Intl.DateTimeFormat('id-ID', {
    day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit',
  }).format(new Date(d));

  return (
    <div className={embedded ? 'p-4 pb-24' : 'p-6'}>

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-3 gap-2 mb-3">
          {[
            { label: 'Log Hari Ini',     today: stats.todayLogs,    total: stats.totalLogs,   color: 'text-gray-800' },
            { label: 'Berhasil Hari Ini', today: stats.todaySuccess, total: stats.successLogs, color: 'text-emerald-600' },
            { label: 'Gagal Hari Ini',   today: stats.todayFailed,  total: stats.failedLogs,  color: 'text-red-500' },
          ].map(({ label, today, total, color }) => (
            <div key={label} className="bg-white/55 backdrop-blur-sm border border-white/75 rounded-2xl shadow-[0_1px_6px_rgba(0,0,0,0.05),inset_0_1px_0_rgba(255,255,255,0.8)] px-4 py-3">
              <p className={`text-2xl font-bold ${color}`}>{today?.toLocaleString() ?? 0}</p>
              <p className="text-[11px] text-gray-500 mt-0.5">{label}</p>
              <p className="text-[10px] text-gray-400 mt-1">{total?.toLocaleString() ?? 0} total</p>
            </div>
          ))}
        </div>
      )}

      {/* Log list */}
      {loading ? (
        <div className="flex items-center justify-center py-16">
          <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : logs.length === 0 ? (
        <div className="py-12 text-center text-sm text-gray-400">
          Tidak ada data audit log
        </div>
      ) : (
        <div className="space-y-1.5">
          {logs.map(log => (
            <div key={log._id}
              className="bg-white/55 backdrop-blur-sm border border-white/75 rounded-2xl shadow-[0_1px_6px_rgba(0,0,0,0.05),inset_0_1px_0_rgba(255,255,255,0.8)] px-3.5 py-2.5">
              {/* Top row: action + resource + status + time */}
              <div className="flex items-center gap-2 flex-wrap">
                <span className={`px-1.5 py-px text-[10px] font-semibold rounded-md ${actionColors[log.action] || 'bg-gray-100/80 text-gray-600'}`}>
                  {log.action.toUpperCase()}
                </span>
                <span className="text-[11px] text-gray-500">
                  {resourceLabels[log.resource] || log.resource}
                </span>
                <span className="flex-1" />
                {log.status === 'success'
                  ? <span className="px-1.5 py-px text-[10px] bg-emerald-100/80 text-emerald-700 rounded-md font-medium">Berhasil</span>
                  : <span className="px-1.5 py-px text-[10px] bg-red-100/80 text-red-600 rounded-md font-medium">Gagal</span>
                }
                <span className="text-[10px] text-gray-400">{formatDate(log.createdAt)}</span>
              </div>

              {/* Bottom row: user + IP */}
              <div className="flex items-center gap-2 mt-1">
                <span className="text-xs font-medium text-gray-700">{log.user?.name || 'Unknown'}</span>
                {log.user?.email && <span className="text-[11px] text-gray-400">· {log.user.email}</span>}
                {log.ipAddress && <span className="text-[10px] text-gray-400 ml-auto">{log.ipAddress}</span>}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AuditLogs;
