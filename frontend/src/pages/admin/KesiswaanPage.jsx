import { lazy, Suspense, useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import TabWrapper from '../../components/TabWrapper';
import { Dribbble, Trophy, Users, Building2, MessageSquare } from 'lucide-react';
import api from '../../services/api';

const Ekskul = lazy(() => import('../Ekskul'));
const Prestasi = lazy(() => import('../Prestasi'));
const Alumni = lazy(() => import('../Alumni'));
const Fasilitas = lazy(() => import('../Fasilitas'));
const AlumniSubmissions = lazy(() => import('../AlumniSubmissions'));

const TabLoading = () => (
  <div className="flex items-center justify-center min-h-[300px]">
    <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
  </div>
);

const KesiswaanPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get('tab') || 'ekskul';
  const [pendingCount, setPendingCount] = useState(0);

  useEffect(() => {
    api.get('/api/alumni-submissions/count')
      .then((r) => setPendingCount(r.data.pending || 0))
      .catch(() => {});
  }, []);

  const tabs = [
    { id: 'ekskul', label: 'Ekskul', icon: Dribbble },
    { id: 'prestasi', label: 'Prestasi', icon: Trophy },
    { id: 'alumni', label: 'Alumni', icon: Users },
    { id: 'fasilitas', label: 'Fasilitas', icon: Building2 },
    { id: 'review-alumni', label: 'Review Alumni', icon: MessageSquare, badge: pendingCount || undefined },
  ];

  return (
    <TabWrapper
      title="Kesiswaan"
      subtitle="Kelola ekstrakurikuler, prestasi, alumni, dan fasilitas"
      tabs={tabs}
      activeTab={activeTab}
      onTabChange={(id) => setSearchParams({ tab: id }, { replace: true })}
    >
      <Suspense fallback={<TabLoading />}>
        {activeTab === 'ekskul' && <Ekskul embedded />}
        {activeTab === 'prestasi' && <Prestasi embedded />}
        {activeTab === 'alumni' && <Alumni embedded />}
        {activeTab === 'fasilitas' && <Fasilitas embedded />}
        {activeTab === 'review-alumni' && (
          <AlumniSubmissions embedded onCountChange={setPendingCount} />
        )}
      </Suspense>
    </TabWrapper>
  );
};

export default KesiswaanPage;
