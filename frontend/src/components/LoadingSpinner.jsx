const LoadingSpinner = ({
  size = 'md',
  text = 'Memuat...',
  fullScreen = true,
  className = ''
}) => {
  const sizeClasses = {
    sm: 'w-8 h-8 border-2',
    md: 'w-16 h-16 border-4',
    lg: 'w-24 h-24 border-6',
  };

  const containerClass = fullScreen
    ? 'min-h-screen flex items-center justify-center bg-gray-50'
    : 'flex items-center justify-center p-8';

  return (
    <div className={`${containerClass} ${className}`}>
      <div className="text-center">
        <div className={`inline-block ${sizeClasses[size]} border-blue-600 border-t-transparent rounded-full animate-spin mb-4`}></div>
        {text && <p className="text-gray-600 text-lg">{text}</p>}
      </div>
    </div>
  );
};

export default LoadingSpinner;
