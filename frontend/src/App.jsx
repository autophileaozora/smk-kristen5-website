import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { lazy, Suspense, useEffect } from 'react';
import { HelmetProvider } from 'react-helmet-async';
import { useSchoolLogo } from './hooks/useContact';

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
const HeroSlides = lazy(() => import('./pages/HeroSlides'));
const MataPelajaran = lazy(() => import('./pages/MataPelajaran'));
const Fasilitas = lazy(() => import('./pages/Fasilitas'));
const AuditLogs = lazy(() => import('./pages/AuditLogs'));
const ProfileManagement = lazy(() => import('./pages/ProfileManagement'));
const SocialMedia = lazy(() => import('./pages/SocialMedia'));
const Partner = lazy(() => import('./pages/Partner'));
const CTAManagement = lazy(() => import('./pages/CTAManagement'));
const AboutManagement = lazy(() => import('./pages/AboutManagement'));
const Activities = lazy(() => import('./pages/Activities'));
const Events = lazy(() => import('./pages/Events'));
const CustomPages = lazy(() => import('./pages/CustomPages'));
const CustomPageEditor = lazy(() => import('./pages/CustomPageEditor'));
const SiteSettings = lazy(() => import('./pages/SiteSettings'));
const NavbarManagement = lazy(() => import('./pages/NavbarManagement'));
const FooterManagement = lazy(() => import('./pages/FooterManagement'));
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
const Tentang = lazy(() => import('./pages/public/Tentang'));
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
          <Route path="/tentang" element={<Tentang />} />
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

            {/* Admin routes with lazy loading */}
            <Route path="articles" element={<Articles />} />
            <Route path="my-articles" element={<Articles />} />
            <Route path="running-text" element={<RunningText />} />
            <Route path="prestasi" element={<Prestasi />} />
            <Route path="jurusan" element={<Jurusan />} />
            <Route path="ekskul" element={<Ekskul />} />
            <Route path="alumni" element={<Alumni />} />
            <Route path="video-hero" element={<VideoHero />} />
            <Route path="hero-slides" element={<HeroSlides />} />
            <Route path="mata-pelajaran" element={<MataPelajaran />} />
            <Route path="fasilitas" element={<Fasilitas />} />
            <Route path="kontak" element={<Navigate to="/admin/about" replace />} />
            <Route path="social-media" element={<SocialMedia />} />
            <Route path="partners" element={<Partner />} />
            <Route path="cta" element={<CTAManagement />} />
            <Route path="about" element={<AboutManagement />} />
            <Route path="activities" element={<Activities />} />
            <Route path="events" element={<Events />} />
            <Route path="custom-pages" element={<CustomPages />} />
            <Route path="categories" element={<Categories />} />
            <Route path="users" element={<Users />} />
            <Route path="audit-logs" element={<AuditLogs />} />
            <Route path="profile" element={<ProfileManagement />} />
            <Route path="site-settings" element={<SiteSettings />} />
            <Route path="navbar" element={<NavbarManagement />} />
            <Route path="footer" element={<FooterManagement />} />
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
