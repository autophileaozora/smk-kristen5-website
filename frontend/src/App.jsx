import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import DashboardLayout from './layouts/DashboardLayout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Users from './pages/Users';
import Articles from './pages/Articles';
import Categories from './pages/Categories';
import RunningText from './pages/RunningText';
import Prestasi from './pages/Prestasi';
import Jurusan from './pages/Jurusan';
import Ekskul from './pages/Ekskul';
import Alumni from './pages/Alumni';
import VideoHero from './pages/VideoHero';
import MataPelajaran from './pages/MataPelajaran';
import Fasilitas from './pages/Fasilitas';
import KontakManagement from './pages/KontakManagement';
import AuditLogs from './pages/AuditLogs';
import ProfileManagement from './pages/ProfileManagement';
import HomepageFixed from './pages/public/HomepageFixed';
import JurusanList from './pages/public/JurusanList';
import JurusanDetail from './pages/public/JurusanDetail';
import Artikel from './pages/public/Artikel';
import ArtikelDetail from './pages/public/ArtikelDetail';
import Kontak from './pages/public/Kontak';

function App() {
  return (
    <BrowserRouter>
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

          {/* Placeholder routes - will be implemented in later phases */}
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
