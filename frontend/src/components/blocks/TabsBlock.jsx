import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { BLOCK_REGISTRY } from './index';

// Helper function to create URL-friendly slug from label
const createSlug = (label) => {
  return label
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .trim();
};

const TabsBlock = ({
  tabs = [
    { label: 'Tab 1', content: 'Content for tab 1', blocks: [] },
    { label: 'Tab 2', content: 'Content for tab 2', blocks: [] },
    { label: 'Tab 3', content: 'Content for tab 3', blocks: [] },
  ],
  variant = 'default',
  enableUrlHash = true,
}) => {
  const location = useLocation();
  const navigate = useNavigate();

  // Find initial tab index from URL hash
  const getInitialTabIndex = () => {
    if (!enableUrlHash) return 0;
    const hash = location.hash.replace('#', '');
    if (!hash) return 0;

    const tabIndex = tabs.findIndex(
      (tab) => createSlug(tab.label) === hash.toLowerCase()
    );
    return tabIndex >= 0 ? tabIndex : 0;
  };

  const [activeTab, setActiveTab] = useState(getInitialTabIndex);

  // Update active tab when URL hash changes
  useEffect(() => {
    if (!enableUrlHash) return;
    const hash = location.hash.replace('#', '');
    if (hash) {
      const tabIndex = tabs.findIndex(
        (tab) => createSlug(tab.label) === hash.toLowerCase()
      );
      if (tabIndex >= 0 && tabIndex !== activeTab) {
        setActiveTab(tabIndex);
      }
    }
  }, [location.hash, tabs, enableUrlHash]);

  // Handle tab click - update URL hash
  const handleTabClick = (index) => {
    setActiveTab(index);
    if (enableUrlHash && tabs[index]) {
      const slug = createSlug(tabs[index].label);
      navigate(`${location.pathname}#${slug}`, { replace: true });
    }
  };

  const variantStyles = {
    default: {
      container: 'border-b-2 border-gray-100',
      tab: 'px-5 py-3 font-semibold transition-all duration-300 relative text-sm',
      activeTab: 'text-[#0d76be] after:absolute after:bottom-0 after:left-2 after:right-2 after:h-[3px] after:bg-[#0d76be] after:rounded-full',
      inactiveTab: 'text-gray-400 hover:text-gray-600',
    },
    modern: {
      container: 'bg-gradient-to-r from-gray-50 to-gray-100 rounded-2xl p-1.5 inline-flex shadow-sm',
      tab: 'px-6 py-3 rounded-xl font-semibold transition-all duration-300 text-sm',
      activeTab: 'bg-white shadow-lg text-[#0d76be] scale-[1.02]',
      inactiveTab: 'text-gray-500 hover:text-gray-700 hover:bg-white/50',
    },
    gradient: {
      container: 'bg-gradient-to-r from-[#0d76be] to-[#2e41e4] rounded-2xl p-1.5 inline-flex shadow-lg',
      tab: 'px-6 py-3 rounded-xl font-semibold transition-all duration-300 text-sm',
      activeTab: 'bg-white text-[#0d76be] shadow-lg',
      inactiveTab: 'text-white/80 hover:text-white hover:bg-white/10',
    },
    pills: {
      container: 'bg-gray-100 rounded-xl p-1.5 inline-flex gap-1',
      tab: 'px-5 py-2.5 rounded-lg font-semibold transition-all duration-300 text-sm',
      activeTab: 'bg-white shadow-md text-[#0d76be]',
      inactiveTab: 'text-gray-500 hover:text-gray-700 hover:bg-white/50',
    },
    underline: {
      container: 'border-b-2 border-gray-200',
      tab: 'px-6 py-3.5 font-semibold transition-all duration-300 relative text-sm',
      activeTab: 'text-[#0d76be] after:absolute after:bottom-0 after:left-0 after:right-0 after:h-[3px] after:bg-gradient-to-r after:from-[#0d76be] after:to-[#2e41e4] after:rounded-full',
      inactiveTab: 'text-gray-400 hover:text-gray-600',
    },
    boxed: {
      container: 'bg-gray-50 rounded-t-xl p-1',
      tab: 'px-6 py-3 font-semibold transition-all duration-300 border-b-2 text-sm',
      activeTab: 'bg-white border-[#0d76be] text-[#0d76be] rounded-t-lg shadow-sm -mb-[2px]',
      inactiveTab: 'border-transparent text-gray-500 hover:text-gray-700',
    },
  };

  const styles = variantStyles[variant] || variantStyles.default;

  // Render nested blocks for a tab
  const renderTabBlocks = (blocks) => {
    if (!blocks || blocks.length === 0) return null;

    return blocks.map((block, index) => {
      const BlockComponent = BLOCK_REGISTRY[block.type];
      if (!BlockComponent) {
        console.warn(`Unknown block type in tab: ${block.type}`);
        return null;
      }

      return (
        <div key={block.id || index} className="tab-block">
          <BlockComponent {...block.props}>
            {block.children && block.children.length > 0 && (
              <div className="block-children">
                {renderTabBlocks(block.children)}
              </div>
            )}
          </BlockComponent>
        </div>
      );
    });
  };

  const currentTab = tabs[activeTab];
  const hasBlocks = currentTab?.blocks && currentTab.blocks.length > 0;

  return (
    <div className="my-8">
      {/* Tab Headers */}
      <div className={`flex flex-wrap gap-1 mb-6 ${styles.container}`}>
        {tabs.map((tab, index) => (
          <button
            key={index}
            onClick={() => handleTabClick(index)}
            className={`
              ${styles.tab}
              ${activeTab === index ? styles.activeTab : styles.inactiveTab}
            `}
          >
            {tab.icon && <span className="mr-2">{tab.icon}</span>}
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="p-5 bg-white rounded-xl min-h-[100px] transition-all duration-300">
        {currentTab && (
          <>
            {/* Render nested blocks if available */}
            {hasBlocks ? (
              <div className="tab-blocks-container space-y-4">
                {renderTabBlocks(currentTab.blocks)}
              </div>
            ) : currentTab.content ? (
              /* Fallback to HTML content if no blocks */
              <div
                className="text-gray-700 prose prose-lg max-w-none prose-img:rounded-lg prose-img:mx-auto prose-img:max-w-md prose-img:w-auto prose-img:h-auto prose-headings:text-gray-900 prose-a:text-[#0d76be]"
                dangerouslySetInnerHTML={{ __html: currentTab.content }}
              />
            ) : (
              <p className="text-gray-400 text-center py-8">
                Tab ini belum memiliki konten. Tambahkan blocks atau content.
              </p>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default TabsBlock;
