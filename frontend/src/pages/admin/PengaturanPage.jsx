import { lazy, Suspense } from 'react';
import { useSearchParams } from 'react-router-dom';
import TabWrapper from '../../components/TabWrapper';
import { Settings, School, Navigation, PanelBottom, Share2 } from 'lucide-react';

const SiteSettings = lazy(() => import('../SiteSettings'));
const AboutManagement = lazy(() => import('../AboutManagement'));
const NavbarManagement = lazy(() => import('../NavbarManagement'));
const FooterManagement = lazy(() => import('../FooterManagement'));
const SocialMedia = lazy(() => import('../SocialMedia'));

const TabLoading = () => (
  <div className="flex items-center justify-center min-h-[300px]">
    <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
  </div>
);

const PengaturanPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get('tab') || 'website';

  const tabs = [
    { id: 'website', label: 'Website', icon: Settings },
    { id: 'sekolah', label: 'Info Sekolah', icon: School },
    { id: 'navbar', label: 'Navbar', icon: Navigation },
    { id: 'footer', label: 'Footer', icon: PanelBottom },
    { id: 'sosmed', label: 'Sosial Media', icon: Share2 },
  ];

  return (
    <TabWrapper
      title="Pengaturan"
      subtitle="Konfigurasi website, informasi sekolah, dan tampilan"
      tabs={tabs}
      activeTab={activeTab}
      onTabChange={(id) => setSearchParams({ tab: id }, { replace: true })}
    >
      <Suspense fallback={<TabLoading />}>
        {activeTab === 'website' && <SiteSettings embedded />}
        {activeTab === 'sekolah' && <AboutManagement embedded />}
        {activeTab === 'navbar' && <NavbarManagement embedded />}
        {activeTab === 'footer' && <FooterManagement embedded />}
        {activeTab === 'sosmed' && <SocialMedia embedded />}
      </Suspense>
    </TabWrapper>
  );
};

export default PengaturanPage;
