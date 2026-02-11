const FeaturesBlock = ({
  features = [
    { icon: '✨', title: 'Feature 1', description: 'Description for feature 1' },
    { icon: '🚀', title: 'Feature 2', description: 'Description for feature 2' },
    { icon: '💡', title: 'Feature 3', description: 'Description for feature 3' },
  ],
  columns = 3,
  layout = 'grid',
  iconSize = 'md',
}) => {
  const columnClasses = {
    2: 'md:grid-cols-2',
    3: 'md:grid-cols-3',
    4: 'md:grid-cols-4',
  };

  const iconSizeClasses = {
    sm: 'text-3xl',
    md: 'text-4xl',
    lg: 'text-5xl',
  };

  if (layout === 'list') {
    return (
      <div className="my-8 space-y-6">
        {features.map((feature, index) => (
          <div key={index} className="flex items-start gap-4 p-4 rounded-lg hover:bg-gray-50 transition-colors">
            <div className={`flex-shrink-0 ${iconSizeClasses[iconSize] || iconSizeClasses.md}`}>
              {feature.icon}
            </div>
            <div className="flex-1">
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                {feature.title}
              </h3>
              <p className="text-gray-600">
                {feature.description}
              </p>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="my-8">
      <div className={`grid grid-cols-1 ${columnClasses[columns] || columnClasses[3]} gap-6`}>
        {features.map((feature, index) => (
          <div
            key={index}
            className="p-6 rounded-lg border border-gray-200 bg-white hover:shadow-lg transition-shadow"
          >
            <div className={`${iconSizeClasses[iconSize] || iconSizeClasses.md} mb-4`}>
              {feature.icon}
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-3">
              {feature.title}
            </h3>
            <p className="text-gray-600">
              {feature.description}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default FeaturesBlock;
