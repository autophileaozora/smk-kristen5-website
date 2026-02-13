import { lazy, Suspense } from 'react';
import { useSearchParams } from 'react-router-dom';
import TabWrapper from '../../components/TabWrapper';
import { GraduationCap, BookOpen } from 'lucide-react';

const Jurusan = lazy(() => import('../Jurusan'));
const MataPelajaran = lazy(() => import('../MataPelajaran'));

const TabLoading = () => (
  <div className="flex items-center justify-center min-h-[300px]">
    <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
  </div>
);

const AkademikPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get('tab') || 'jurusan';

  const tabs = [
    { id: 'jurusan', label: 'Jurusan', icon: GraduationCap },
    { id: 'mapel', label: 'Mata Pelajaran', icon: BookOpen },
  ];

  return (
    <TabWrapper
      title="Jurusan & Mata Pelajaran"
      subtitle="Kelola program keahlian dan kurikulum"
      tabs={tabs}
      activeTab={activeTab}
      onTabChange={(id) => setSearchParams({ tab: id }, { replace: true })}
    >
      <Suspense fallback={<TabLoading />}>
        {activeTab === 'jurusan' && <Jurusan embedded />}
        {activeTab === 'mapel' && <MataPelajaran embedded />}
      </Suspense>
    </TabWrapper>
  );
};

export default AkademikPage;
