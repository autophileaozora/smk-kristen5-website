import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuthStore from '../store/authStore';
import api from '../services/api';

const Dashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [stats, setStats] = useState(null);
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Fetch stats and activities in parallel
      const [statsRes, activitiesRes] = await Promise.all([
        api.get('/api/dashboard/stats'),
        api.get('/api/dashboard/recent-activity?limit=5'),
      ]);

      setStats(statsRes.data.data);
      setActivities(activitiesRes.data.data.activities);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const StatCard = ({ title, value, icon, color, subtitle }) => (
    <div className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-3xl font-bold text-gray-900 mt-2">
            {loading ? '...' : value}
          </p>
          {subtitle && (
            <p className="text-xs text-gray-500 mt-1">{subtitle}</p>
          )}
        </div>
        <div className={`p-3 rounded-full ${color}`}>
          <span className="text-2xl">{icon}</span>
        </div>
      </div>
    </div>
  );

  // Format timestamp
  const formatTimestamp = (timestamp) => {
    const now = new Date();
    const date = new Date(timestamp);
    const diff = Math.floor((now - date) / 1000); // seconds

    if (diff < 60) return 'Baru saja';
    if (diff < 3600) return `${Math.floor(diff / 60)} menit yang lalu`;
    if (diff < 86400) return `${Math.floor(diff / 3600)} jam yang lalu`;
    if (diff < 604800) return `${Math.floor(diff / 86400)} hari yang lalu`;
    return date.toLocaleDateString('id-ID');
  };

  // Get activity icon and color
  const getActivityDisplay = (activity) => {
    const displays = {
      article: {
        icon: '📝',
        color: 'bg-blue-100',
        textColor: 'text-blue-600',
        label: 'Artikel',
      },
      prestasi: {
        icon: '🏆',
        color: 'bg-yellow-100',
        textColor: 'text-yellow-600',
        label: 'Prestasi',
      },
      alumni: {
        icon: '🎓',
        color: 'bg-purple-100',
        textColor: 'text-purple-600',
        label: 'Alumni',
      },
    };
    return displays[activity.type] || displays.article;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow p-6">
        <h1 className="text-2xl font-bold text-gray-900">
          Selamat Datang, {user?.name}! 👋
        </h1>
        <p className="text-gray-600 mt-2">
          {user?.role === 'administrator'
            ? 'Kelola seluruh konten dan pengguna website SMK Kristen 5 Klaten'
            : 'Kelola konten artikel dan informasi sekolah'}
        </p>
      </div>

      {/* Main Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {user?.role === 'administrator' && stats?.users && (
          <StatCard
            title="Total Pengguna"
            value={stats.users.total}
            icon="👥"
            color="bg-blue-100"
            subtitle="Semua pengguna sistem"
          />
        )}
        <StatCard
          title="Artikel"
          value={stats?.articles?.total || 0}
          icon="📝"
          color="bg-green-100"
          subtitle={`${stats?.articles?.published || 0} published, ${stats?.articles?.draft || 0} draft`}
        />
        <StatCard
          title="Prestasi"
          value={stats?.prestasi?.total || 0}
          icon="🏆"
          color="bg-yellow-100"
          subtitle={`${stats?.prestasi?.active || 0} aktif`}
        />
        <StatCard
          title="Alumni"
          value={stats?.alumni?.total || 0}
          icon="🎓"
          color="bg-purple-100"
          subtitle={`${stats?.alumni?.published || 0} published, ${stats?.alumni?.featured || 0} featured`}
        />
      </div>

      {/* Additional Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Jurusan"
          value={stats?.jurusan?.total || 0}
          icon="📚"
          color="bg-indigo-100"
        />
        <StatCard
          title="Ekstrakurikuler"
          value={stats?.ekskul?.total || 0}
          icon="🎯"
          color="bg-pink-100"
          subtitle={`${stats?.ekskul?.active || 0} aktif`}
        />
        <StatCard
          title="Video Hero"
          value={stats?.videoHero?.total || 0}
          icon="🎬"
          color="bg-red-100"
          subtitle={`${stats?.videoHero?.active || 0}/3 aktif`}
        />
        <StatCard
          title="Running Text"
          value={stats?.runningText?.total || 0}
          icon="📢"
          color="bg-orange-100"
          subtitle={`${stats?.runningText?.active || 0} aktif`}
        />
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">
          Aksi Cepat
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <button 
            onClick={() => navigate('/admin/articles')}
            className="flex items-center space-x-3 p-4 border-2 border-gray-200 rounded-lg hover:border-primary-500 hover:bg-primary-50 transition-colors"
          >
            <span className="text-2xl">📝</span>
            <div className="text-left">
              <p className="font-semibold text-gray-900">Artikel</p>
              <p className="text-sm text-gray-600">Kelola artikel</p>
            </div>
          </button>

          <button 
            onClick={() => navigate('/admin/prestasi')}
            className="flex items-center space-x-3 p-4 border-2 border-gray-200 rounded-lg hover:border-primary-500 hover:bg-primary-50 transition-colors"
          >
            <span className="text-2xl">🏆</span>
            <div className="text-left">
              <p className="font-semibold text-gray-900">Prestasi</p>
              <p className="text-sm text-gray-600">Input prestasi</p>
            </div>
          </button>

          <button 
            onClick={() => navigate('/admin/alumni')}
            className="flex items-center space-x-3 p-4 border-2 border-gray-200 rounded-lg hover:border-primary-500 hover:bg-primary-50 transition-colors"
          >
            <span className="text-2xl">🎓</span>
            <div className="text-left">
              <p className="font-semibold text-gray-900">Alumni</p>
              <p className="text-sm text-gray-600">Kelola alumni</p>
            </div>
          </button>

          {user?.role === 'administrator' && (
            <button 
              onClick={() => navigate('/admin/users')}
              className="flex items-center space-x-3 p-4 border-2 border-gray-200 rounded-lg hover:border-primary-500 hover:bg-primary-50 transition-colors"
            >
              <span className="text-2xl">👥</span>
              <div className="text-left">
                <p className="font-semibold text-gray-900">Kelola User</p>
                <p className="text-sm text-gray-600">Manajemen user</p>
              </div>
            </button>
          )}
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gray-900">
            Aktivitas Terbaru
          </h2>
          <button 
            onClick={fetchDashboardData}
            className="text-sm text-primary-600 hover:text-primary-700 font-medium"
          >
            🔄 Refresh
          </button>
        </div>
        {loading ? (
          <div className="text-center py-8 text-gray-500">
            Memuat aktivitas...
          </div>
        ) : activities.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            Belum ada aktivitas
          </div>
        ) : (
          <div className="space-y-3">
            {activities.map((activity, index) => {
              const display = getActivityDisplay(activity);
              return (
                <div key={index} className="flex items-start space-x-4 p-3 hover:bg-gray-50 rounded-lg transition">
                  <div className={`w-10 h-10 rounded-full ${display.color} flex items-center justify-center flex-shrink-0`}>
                    <span>{display.icon}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900">
                      <span className="text-gray-600">[{display.label}]</span> {activity.title}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {formatTimestamp(activity.timestamp)}
                      {activity.user && ` • ${activity.user}`}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
