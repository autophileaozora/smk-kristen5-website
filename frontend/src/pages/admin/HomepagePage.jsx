import { lazy, Suspense } from 'react';
import { useSearchParams } from 'react-router-dom';
import TabWrapper from '../../components/TabWrapper';
import { Images, Video, MousePointerClick, Handshake, Megaphone } from 'lucide-react';

const HeroSlides = lazy(() => import('../HeroSlides'));
const VideoHero = lazy(() => import('../VideoHero'));
const CTAManagement = lazy(() => import('../CTAManagement'));
const Partner = lazy(() => import('../Partner'));
const RunningText = lazy(() => import('../RunningText'));

const TabLoading = () => (
  <div className="flex items-center justify-center min-h-[300px]">
    <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
  </div>
);

const HomepagePage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get('tab') || 'hero-slides';

  const tabs = [
    { id: 'hero-slides', label: 'Hero Slides', icon: Images },
    { id: 'video-hero', label: 'Video Hero', icon: Video },
    { id: 'cta', label: 'CTA', icon: MousePointerClick },
    { id: 'partner', label: 'Partner', icon: Handshake },
    { id: 'running-text', label: 'Running Text', icon: Megaphone },
  ];

  return (
    <TabWrapper
      title="Homepage"
      subtitle="Kelola konten halaman utama website"
      tabs={tabs}
      activeTab={activeTab}
      onTabChange={(id) => setSearchParams({ tab: id }, { replace: true })}
    >
      <Suspense fallback={<TabLoading />}>
        {activeTab === 'hero-slides' && <HeroSlides embedded />}
        {activeTab === 'video-hero' && <VideoHero embedded />}
        {activeTab === 'cta' && <CTAManagement embedded />}
        {activeTab === 'partner' && <Partner embedded />}
        {activeTab === 'running-text' && <RunningText embedded />}
      </Suspense>
    </TabWrapper>
  );
};

export default HomepagePage;
