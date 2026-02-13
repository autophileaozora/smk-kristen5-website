import { lazy, Suspense } from 'react';
import { useSearchParams } from 'react-router-dom';
import TabWrapper from '../../components/TabWrapper';
import { FileText, FolderOpen } from 'lucide-react';

const Articles = lazy(() => import('../Articles'));
const Categories = lazy(() => import('../Categories'));

const TabLoading = () => (
  <div className="flex items-center justify-center min-h-[300px]">
    <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
  </div>
);

const ArtikelPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get('tab') || 'artikel';

  const tabs = [
    { id: 'artikel', label: 'Semua Artikel', icon: FileText },
    { id: 'kategori', label: 'Kategori', icon: FolderOpen },
  ];

  return (
    <TabWrapper
      title="Artikel"
      subtitle="Kelola artikel dan kategori konten"
      tabs={tabs}
      activeTab={activeTab}
      onTabChange={(id) => setSearchParams({ tab: id }, { replace: true })}
    >
      <Suspense fallback={<TabLoading />}>
        {activeTab === 'artikel' && <Articles embedded />}
        {activeTab === 'kategori' && <Categories embedded />}
      </Suspense>
    </TabWrapper>
  );
};

export default ArtikelPage;
