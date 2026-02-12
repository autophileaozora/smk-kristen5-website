import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuthStore from '../store/authStore';
import api from '../services/api';
import {
  Users, FileText, Trophy, GraduationCap, Dribbble, Video, Megaphone,
  Plus, ArrowUpRight, RefreshCw, Clock, FilePlus, ExternalLink,
  TrendingUp, BookOpen, Building2,
} from 'lucide-react';

// SVG gradients for stat cards
const StatGradients = () => (
  <svg width="0" height="0" className="absolute">
    <defs>
      <linearGradient id="stat-blue" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#3B82F6" />
        <stop offset="100%" stopColor="#8B5CF6" />
      </linearGradient>
      <linearGradient id="stat-green" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#10B981" />
        <stop offset="100%" stopColor="#06B6D4" />
      </linearGradient>
      <linearGradient id="stat-orange" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#F59E0B" />
        <stop offset="100%" stopColor="#EF4444" />
      </linearGradient>
      <linearGradient id="stat-purple" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#8B5CF6" />
        <stop offset="100%" stopColor="#EC4899" />
      </linearGradient>
    </defs>
  </svg>
);

const getGreeting = () => {
  const hour = new Date().getHours();
  if (hour < 11) return 'Selamat Pagi';
  if (hour < 15) return 'Selamat Siang';
  if (hour < 18) return 'Selamat Sore';
  return 'Selamat Malam';
};

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

  const StatCard = ({ title, value, icon: Icon, gradient, subtitle }) => (
    <div className="bg-white rounded-xl border border-gray-100 p-5 hover:shadow-md transition-shadow group">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-500">{title}</p>
          <p className="text-3xl font-bold text-gray-900 mt-1.5">
            {loading ? (
              <span className="inline-block w-12 h-8 bg-gray-100 rounded animate-pulse" />
            ) : (
              value
            )}
          </p>
          {subtitle && (
            <p className="text-xs text-gray-400 mt-1">{subtitle}</p>
          )}
        </div>
        <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center group-hover:scale-110 transition-transform">
          <Icon size={22} stroke={`url(#${gradient})`} strokeWidth={1.8} />
        </div>
      </div>
    </div>
  );

  const formatTimestamp = (timestamp) => {
    const now = new Date();
    const date = new Date(timestamp);
    const diff = Math.floor((now - date) / 1000);

    if (diff < 60) return 'Baru saja';
    if (diff < 3600) return `${Math.floor(diff / 60)}m lalu`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}j lalu`;
    if (diff < 604800) return `${Math.floor(diff / 86400)}h lalu`;
    return date.toLocaleDateString('id-ID');
  };

  const getActivityDisplay = (activity) => {
    const displays = {
      article: { icon: FileText, color: 'text-blue-500 bg-blue-50', label: 'Artikel' },
      prestasi: { icon: Trophy, color: 'text-amber-500 bg-amber-50', label: 'Prestasi' },
      alumni: { icon: GraduationCap, color: 'text-purple-500 bg-purple-50', label: 'Alumni' },
    };
    return displays[activity.type] || displays.article;
  };

  const quickActions = [
    { name: 'Buat Artikel', desc: 'Tulis artikel baru', icon: Plus, path: '/admin/articles', gradient: 'from-blue-500 to-purple-500' },
    { name: 'Buat Halaman', desc: 'Halaman kustom baru', icon: FilePlus, path: '/admin/custom-pages/create', gradient: 'from-emerald-500 to-cyan-500' },
    { name: 'Lihat Website', desc: 'Buka tab baru', icon: ExternalLink, external: true, path: '/', gradient: 'from-orange-500 to-pink-500' },
  ];

  return (
    <div className="space-y-6 max-w-7xl">
      <StatGradients />

      {/* Welcome Header */}
      <div className="bg-gradient-to-r from-blue-600 via-blue-700 to-purple-700 rounded-2xl p-6 lg:p-8 text-white relative overflow-hidden">
        {/* Decorative circles */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/3" />
        <div className="absolute bottom-0 left-1/2 w-40 h-40 bg-white/5 rounded-full translate-y-1/2" />

        <div className="relative">
          <p className="text-blue-200 text-sm font-medium">{getGreeting()},</p>
          <h1 className="text-2xl lg:text-3xl font-bold mt-1">{user?.name}</h1>
          <p className="text-blue-200 text-sm mt-2 max-w-xl">
            {user?.role === 'administrator'
              ? 'Kelola seluruh konten dan pengguna website SMK Kristen 5 Klaten dari sini.'
              : 'Kelola konten artikel dan informasi sekolah.'}
          </p>

          {/* Quick Actions */}
          <div className="flex flex-wrap gap-3 mt-5">
            {quickActions.map((action) => (
              <button
                key={action.name}
                onClick={() => {
                  if (action.external) window.open(action.path, '_blank');
                  else navigate(action.path);
                }}
                className="flex items-center space-x-2 px-4 py-2 bg-white/15 hover:bg-white/25 backdrop-blur-sm rounded-lg transition-colors text-sm font-medium"
              >
                <action.icon size={16} />
                <span>{action.name}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {user?.role === 'administrator' && stats?.users && (
          <StatCard
            title="Total Pengguna"
            value={stats.users.total}
            icon={Users}
            gradient="stat-blue"
            subtitle="Semua pengguna sistem"
          />
        )}
        <StatCard
          title="Artikel"
          value={stats?.articles?.total || 0}
          icon={FileText}
          gradient="stat-green"
          subtitle={`${stats?.articles?.published || 0} published, ${stats?.articles?.draft || 0} draft`}
        />
        <StatCard
          title="Prestasi"
          value={stats?.prestasi?.total || 0}
          icon={Trophy}
          gradient="stat-orange"
          subtitle={`${stats?.prestasi?.active || 0} aktif`}
        />
        <StatCard
          title="Alumni"
          value={stats?.alumni?.total || 0}
          icon={GraduationCap}
          gradient="stat-purple"
          subtitle={`${stats?.alumni?.published || 0} published`}
        />
      </div>

      {/* Secondary Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { title: 'Jurusan', value: stats?.jurusan?.total || 0, icon: BookOpen, gradient: 'stat-blue' },
          { title: 'Ekskul', value: stats?.ekskul?.total || 0, icon: Dribbble, gradient: 'stat-green', sub: `${stats?.ekskul?.active || 0} aktif` },
          { title: 'Video Hero', value: stats?.videoHero?.total || 0, icon: Video, gradient: 'stat-orange', sub: `${stats?.videoHero?.active || 0}/3 aktif` },
          { title: 'Running Text', value: stats?.runningText?.total || 0, icon: Megaphone, gradient: 'stat-purple', sub: `${stats?.runningText?.active || 0} aktif` },
        ].map((item) => (
          <div key={item.title} className="bg-white rounded-xl border border-gray-100 p-4">
            <div className="flex items-center space-x-3">
              <div className="w-9 h-9 rounded-lg bg-gray-50 flex items-center justify-center">
                <item.icon size={18} stroke={`url(#${item.gradient})`} strokeWidth={1.8} />
              </div>
              <div>
                <p className="text-xl font-bold text-gray-900">
                  {loading ? <span className="inline-block w-6 h-5 bg-gray-100 rounded animate-pulse" /> : item.value}
                </p>
                <p className="text-xs text-gray-400">{item.title}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div className="flex items-center space-x-2">
            <Clock size={18} className="text-gray-400" />
            <h2 className="text-base font-semibold text-gray-900">Aktivitas Terbaru</h2>
          </div>
          <button
            onClick={fetchDashboardData}
            className="flex items-center space-x-1.5 text-xs font-medium text-gray-500 hover:text-blue-600 transition-colors"
          >
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
            <span>Refresh</span>
          </button>
        </div>

        {loading ? (
          <div className="p-6 space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center space-x-4">
                <div className="w-9 h-9 rounded-lg bg-gray-100 animate-pulse" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-100 rounded w-3/4 animate-pulse" />
                  <div className="h-3 bg-gray-100 rounded w-1/3 animate-pulse" />
                </div>
              </div>
            ))}
          </div>
        ) : activities.length === 0 ? (
          <div className="py-12 text-center">
            <Clock size={32} className="mx-auto text-gray-300 mb-3" />
            <p className="text-sm text-gray-500">Belum ada aktivitas</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {activities.map((activity, index) => {
              const display = getActivityDisplay(activity);
              const Icon = display.icon;
              return (
                <div key={index} className="flex items-center space-x-4 px-6 py-3.5 hover:bg-gray-50/50 transition-colors">
                  <div className={`w-9 h-9 rounded-lg ${display.color} flex items-center justify-center flex-shrink-0`}>
                    <Icon size={16} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-900 truncate">
                      <span className="font-medium">{activity.title}</span>
                    </p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {display.label}
                      {activity.user && ` · ${activity.user}`}
                    </p>
                  </div>
                  <span className="text-xs text-gray-400 flex-shrink-0">
                    {formatTimestamp(activity.timestamp)}
                  </span>
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
