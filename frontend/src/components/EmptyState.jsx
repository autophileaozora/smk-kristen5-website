const EmptyState = ({
  icon = '📭',
  title = 'Tidak ada data',
  description = 'Belum ada data yang tersedia saat ini',
  action,
  actionText,
  className = ''
}) => {
  return (
    <div className={`flex flex-col items-center justify-center py-12 px-4 text-center ${className}`}>
      <div className="text-6xl mb-4">{icon}</div>
      <h3 className="text-xl font-semibold text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-500 mb-6 max-w-md">{description}</p>
      {action && actionText && (
        <button
          onClick={action}
          className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors duration-200"
        >
          {actionText}
        </button>
      )}
    </div>
  );
};

export default EmptyState;
