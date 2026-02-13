import { lazy, Suspense } from 'react';
import { useSearchParams } from 'react-router-dom';
import TabWrapper from '../../components/TabWrapper';
import { CalendarDays, CalendarCheck } from 'lucide-react';

const Activities = lazy(() => import('../Activities'));
const Events = lazy(() => import('../Events'));

const TabLoading = () => (
  <div className="flex items-center justify-center min-h-[300px]">
    <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
  </div>
);

const KegiatanPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get('tab') || 'kegiatan';

  const tabs = [
    { id: 'kegiatan', label: 'Kegiatan', icon: CalendarDays },
    { id: 'agenda', label: 'Agenda', icon: CalendarCheck },
  ];

  return (
    <TabWrapper
      title="Kegiatan & Agenda"
      subtitle="Kelola kegiatan sekolah dan agenda acara"
      tabs={tabs}
      activeTab={activeTab}
      onTabChange={(id) => setSearchParams({ tab: id }, { replace: true })}
    >
      <Suspense fallback={<TabLoading />}>
        {activeTab === 'kegiatan' && <Activities embedded />}
        {activeTab === 'agenda' && <Events embedded />}
      </Suspense>
    </TabWrapper>
  );
};

export default KegiatanPage;
