const TabWrapper = ({ title, subtitle, tabs, activeTab, onTabChange, children }) => {
  return (
    <div className="p-6">
      {/* Page Header + Tab Navigation with background */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 px-5 py-4 mb-6">
        {/* Title */}
        <div className="mb-4">
          <h1 className="text-2xl font-bold text-gray-800">{title}</h1>
          {subtitle && <p className="text-sm text-gray-500 mt-1">{subtitle}</p>}
        </div>

        {/* Tab Navigation */}
        <div className="border-t border-gray-100 pt-3 -mb-1">
          <nav className="flex space-x-1 overflow-x-auto" aria-label="Tabs">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                className={`flex items-center space-x-2 px-4 py-2.5 rounded-lg font-medium text-sm whitespace-nowrap transition-all ${
                  activeTab === tab.id
                    ? 'bg-blue-50 text-blue-700 shadow-sm'
                    : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                }`}
              >
                {tab.icon && <tab.icon size={16} />}
                <span>{tab.label}</span>
                {tab.badge > 0 && (
                  <span className="ml-1 inline-flex items-center justify-center w-5 h-5 text-[10px] font-bold text-white bg-red-500 rounded-full">
                    {tab.badge}
                  </span>
                )}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Tab Content */}
      {children}
    </div>
  );
};

export default TabWrapper;
