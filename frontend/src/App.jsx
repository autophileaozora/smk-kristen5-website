import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { lazy, Suspense, useEffect } from 'react';
import { HelmetProvider } from 'react-helmet-async';
import { useSchoolLogo } from './hooks/useContact';

// Lazy load all components for better performance
const DashboardLayout = lazy(() => import('./layouts/DashboardLayout'));
const Login = lazy(() => import('./pages/Login'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Articles = lazy(() => import('./pages/Articles'));
const CustomPages = lazy(() => import('./pages/CustomPages'));
const CustomPageEditor = lazy(() => import('./pages/CustomPageEditor'));
const ProfileManagement = lazy(() => import('./pages/ProfileManagement'));

// Consolidated admin wrapper pages
const ArtikelPage = lazy(() => import('./pages/admin/ArtikelPage'));
const AkademikPage = lazy(() => import('./pages/admin/AkademikPage'));
const KesiswaanPage = lazy(() => import('./pages/admin/KesiswaanPage'));
const KegiatanPage = lazy(() => import('./pages/admin/KegiatanPage'));
const HomepagePage = lazy(() => import('./pages/admin/HomepagePage'));
const PengaturanPage = lazy(() => import('./pages/admin/PengaturanPage'));
const SistemPage = lazy(() => import('./pages/admin/SistemPage'));
const HomepageFixed = lazy(() => import('./pages/public/HomepageFixed'));
const CustomPageView = lazy(() => import('./pages/public/CustomPageView'));
const JurusanList = lazy(() => import('./pages/public/JurusanList'));
const JurusanDetail = lazy(() => import('./pages/public/JurusanDetail'));
const Artikel = lazy(() => import('./pages/public/Artikel'));
const ArtikelDetail = lazy(() => import('./pages/public/ArtikelDetail'));
const Kontak = lazy(() => import('./pages/public/Kontak'));
const Sejarah = lazy(() => import('./pages/public/Sejarah'));
const VisiMisi = lazy(() => import('./pages/public/VisiMisi'));
const Sambutan = lazy(() => import('./pages/public/Sambutan'));
const SearchPage = lazy(() => import('./pages/public/SearchPage'));
const FasilitasList = lazy(() => import('./pages/public/FasilitasList'));

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
  const { logo } = useSchoolLogo();

  // Update favicon dynamically
  useEffect(() => {
    if (logo && logo !== '/logo.svg') {
      const link = document.querySelector("link[rel~='icon']") || document.createElement('link');
      link.type = 'image/png';
      link.rel = 'icon';
      link.href = logo;
      document.getElementsByTagName('head')[0].appendChild(link);

      // Also update apple-touch-icon
      const appleTouchIcon = document.querySelector("link[rel~='apple-touch-icon']") || document.createElement('link');
      appleTouchIcon.rel = 'apple-touch-icon';
      appleTouchIcon.href = logo;
      document.getElementsByTagName('head')[0].appendChild(appleTouchIcon);
    }
  }, [logo]);

  return (
    <HelmetProvider>
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
          <Route path="/sejarah" element={<Sejarah />} />
          <Route path="/visi-misi" element={<VisiMisi />} />
          <Route path="/sambutan" element={<Sambutan />} />
          <Route path="/tentang" element={<Navigate to="/page/profil#tentang-kami" replace />} />
          <Route path="/fasilitas" element={<FasilitasList />} />
          <Route path="/search" element={<SearchPage />} />
          <Route path="/page/:slug" element={<CustomPageView />} />
          <Route path="/login" element={<Login />} />

          {/* Full-screen Editor Routes (Outside Dashboard Layout) */}
          <Route path="/admin/custom-pages/create" element={<CustomPageEditor />} />
          <Route path="/admin/custom-pages/:id/edit" element={<CustomPageEditor />} />
          <Route path="/admin/jurusan/:jurusanId/edit-layout" element={<CustomPageEditor sourceType="jurusan" />} />

          {/* Protected Routes - Admin Panel */}
          <Route path="/admin" element={<DashboardLayout />}>
            <Route index element={<Navigate to="/admin/dashboard" replace />} />
            <Route path="dashboard" element={<Dashboard />} />

            {/* Consolidated admin routes */}
            <Route path="articles" element={<ArtikelPage />} />
            <Route path="custom-pages" element={<CustomPages />} />
            <Route path="akademik" element={<AkademikPage />} />
            <Route path="kesiswaan" element={<KesiswaanPage />} />
            <Route path="kegiatan" element={<KegiatanPage />} />
            <Route path="homepage" element={<HomepagePage />} />
            <Route path="pengaturan" element={<PengaturanPage />} />
            <Route path="sistem" element={<SistemPage />} />
            <Route path="profile" element={<ProfileManagement />} />
            <Route path="my-articles" element={<Articles />} />

            {/* Redirects from old routes to new consolidated routes */}
            <Route path="categories" element={<Navigate to="/admin/articles?tab=kategori" replace />} />
            <Route path="jurusan" element={<Navigate to="/admin/akademik?tab=jurusan" replace />} />
            <Route path="mata-pelajaran" element={<Navigate to="/admin/akademik?tab=mapel" replace />} />
            <Route path="ekskul" element={<Navigate to="/admin/kesiswaan?tab=ekskul" replace />} />
            <Route path="prestasi" element={<Navigate to="/admin/kesiswaan?tab=prestasi" replace />} />
            <Route path="alumni" element={<Navigate to="/admin/kesiswaan?tab=alumni" replace />} />
            <Route path="fasilitas" element={<Navigate to="/admin/kesiswaan?tab=fasilitas" replace />} />
            <Route path="activities" element={<Navigate to="/admin/kegiatan?tab=kegiatan" replace />} />
            <Route path="events" element={<Navigate to="/admin/kegiatan?tab=agenda" replace />} />
            <Route path="hero-slides" element={<Navigate to="/admin/homepage?tab=hero-slides" replace />} />
            <Route path="video-hero" element={<Navigate to="/admin/homepage?tab=video-hero" replace />} />
            <Route path="cta" element={<Navigate to="/admin/homepage?tab=cta" replace />} />
            <Route path="partners" element={<Navigate to="/admin/homepage?tab=partner" replace />} />
            <Route path="running-text" element={<Navigate to="/admin/homepage?tab=running-text" replace />} />
            <Route path="site-settings" element={<Navigate to="/admin/pengaturan?tab=website" replace />} />
            <Route path="about" element={<Navigate to="/admin/pengaturan?tab=sekolah" replace />} />
            <Route path="kontak" element={<Navigate to="/admin/pengaturan?tab=sekolah" replace />} />
            <Route path="navbar" element={<Navigate to="/admin/pengaturan?tab=navbar" replace />} />
            <Route path="footer" element={<Navigate to="/admin/pengaturan?tab=footer" replace />} />
            <Route path="social-media" element={<Navigate to="/admin/pengaturan?tab=sosmed" replace />} />
            <Route path="users" element={<Navigate to="/admin/sistem?tab=users" replace />} />
            <Route path="audit-logs" element={<Navigate to="/admin/sistem?tab=audit-log" replace />} />
          </Route>

          {/* 404 Not Found */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
    </HelmetProvider>
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
