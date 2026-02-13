import { lazy, Suspense } from 'react';
import { useSearchParams } from 'react-router-dom';
import TabWrapper from '../../components/TabWrapper';
import { UserCog, ClipboardList } from 'lucide-react';

const Users = lazy(() => import('../Users'));
const AuditLogs = lazy(() => import('../AuditLogs'));

const TabLoading = () => (
  <div className="flex items-center justify-center min-h-[300px]">
    <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
  </div>
);

const SistemPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get('tab') || 'users';

  const tabs = [
    { id: 'users', label: 'Manajemen User', icon: UserCog },
    { id: 'audit-log', label: 'Audit Log', icon: ClipboardList },
  ];

  return (
    <TabWrapper
      title="User & Log"
      subtitle="Kelola pengguna dan pantau aktivitas sistem"
      tabs={tabs}
      activeTab={activeTab}
      onTabChange={(id) => setSearchParams({ tab: id }, { replace: true })}
    >
      <Suspense fallback={<TabLoading />}>
        {activeTab === 'users' && <Users embedded />}
        {activeTab === 'audit-log' && <AuditLogs embedded />}
      </Suspense>
    </TabWrapper>
  );
};

export default SistemPage;
