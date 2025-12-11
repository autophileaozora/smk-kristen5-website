import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { lazy, Suspense } from 'react';

// Lazy load all components for better performance
const DashboardLayout = lazy(() => import('./layouts/DashboardLayout'));
const Login = lazy(() => import('./pages/Login'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Users = lazy(() => import('./pages/Users'));
const Articles = lazy(() => import('./pages/Articles'));
const Categories = lazy(() => import('./pages/Categories'));
const RunningText = lazy(() => import('./pages/RunningText'));
const Prestasi = lazy(() => import('./pages/Prestasi'));
const Jurusan = lazy(() => import('./pages/Jurusan'));
const Ekskul = lazy(() => import('./pages/Ekskul'));
const Alumni = lazy(() => import('./pages/Alumni'));
const VideoHero = lazy(() => import('./pages/VideoHero'));
const MataPelajaran = lazy(() => import('./pages/MataPelajaran'));
const Fasilitas = lazy(() => import('./pages/Fasilitas'));
const KontakManagement = lazy(() => import('./pages/KontakManagement'));
const AuditLogs = lazy(() => import('./pages/AuditLogs'));
const ProfileManagement = lazy(() => import('./pages/ProfileManagement'));
const HomepageFixed = lazy(() => import('./pages/public/HomepageFixed'));
const JurusanList = lazy(() => import('./pages/public/JurusanList'));
const JurusanDetail = lazy(() => import('./pages/public/JurusanDetail'));
const Artikel = lazy(() => import('./pages/public/Artikel'));
const ArtikelDetail = lazy(() => import('./pages/public/ArtikelDetail'));
const Kontak = lazy(() => import('./pages/public/Kontak'));

// Loading component
const LoadingFallback = () => (
  <div className="min-h-screen flex items-center justify-center bg-gray-50">
    <div className="text-center">
      <div className="inline-block w-12 h-12 border-4 border-primary-600 border-t-transparent rounded-full animate-spin mb-4"></div>
      <p className="text-gray-600">Memuat...</p>
    </div>
  </div>
);

function App() {
  return (
    <BrowserRouter>
      <Suspense fallback={<LoadingFallback />}>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<HomepageFixed />} />
          <Route path="/jurusan" element={<JurusanList />} />
          <Route path="/jurusan/:slug" element={<JurusanDetail />} />
          <Route path="/artikel" element={<Artikel />} />
          <Route path="/artikel/:slug" element={<ArtikelDetail />} />
          <Route path="/kontak" element={<Kontak />} />
          <Route path="/login" element={<Login />} />

          {/* Protected Routes - Admin Panel */}
          <Route path="/admin" element={<DashboardLayout />}>
            <Route index element={<Navigate to="/admin/dashboard" replace />} />
            <Route path="dashboard" element={<Dashboard />} />

            {/* Admin routes with lazy loading */}
            <Route path="articles" element={<Articles />} />
            <Route path="my-articles" element={<Articles />} />
            <Route path="running-text" element={<RunningText />} />
            <Route path="prestasi" element={<Prestasi />} />
            <Route path="jurusan" element={<Jurusan />} />
            <Route path="ekskul" element={<Ekskul />} />
            <Route path="alumni" element={<Alumni />} />
            <Route path="video-hero" element={<VideoHero />} />
            <Route path="mata-pelajaran" element={<MataPelajaran />} />
            <Route path="fasilitas" element={<Fasilitas />} />
            <Route path="kontak" element={<KontakManagement />} />
            <Route path="categories" element={<Categories />} />
            <Route path="users" element={<Users />} />
            <Route path="audit-logs" element={<AuditLogs />} />
            <Route path="profile" element={<ProfileManagement />} />
          </Route>

          {/* 404 Not Found */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}

// 404 Not Found component
const NotFound = () => (
  <div className="min-h-screen flex items-center justify-center bg-gray-50">
    <div className="text-center">
      <h1 className="text-6xl font-bold text-gray-900 mb-4">404</h1>
      <p className="text-xl text-gray-600 mb-6">Halaman tidak ditemukan</p>
      <a
        href="/dashboard"
        className="inline-block bg-primary-600 text-white px-6 py-3 rounded-lg hover:bg-primary-700"
      >
        Kembali ke Dashboard
      </a>
    </div>
  </div>
);

export default App;
