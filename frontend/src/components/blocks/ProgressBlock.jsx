import { useState, useEffect, useRef } from 'react';

// Progress Block - Display progress bars or achievement stats
const ProgressBlock = ({
  title = '',
  subtitle = '',
  items = [
    { label: 'Kelulusan', value: 100, max: 100, suffix: '%', color: 'primary' },
    { label: 'Siswa Bekerja', value: 85, max: 100, suffix: '%', color: 'green' },
    { label: 'Lanjut Kuliah', value: 45, max: 100, suffix: '%', color: 'blue' },
    { label: 'Kepuasan Orang Tua', value: 95, max: 100, suffix: '%', color: 'yellow' },
  ],
  variant = 'horizontal', // horizontal, vertical, circular, stats
  showValue = true,
  showLabel = true,
  animated = true,
  size = 'md', // sm, md, lg
  backgroundColor = 'white',
  columns = 1,
}) => {

  const [isVisible, setIsVisible] = useState(false);
  const containerRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.2 }
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => observer.disconnect();
  }, []);

  const bgClasses = {
    white: 'bg-white',
    gray: 'bg-gray-50',
    dark: 'bg-gray-900 text-white',
    primary: 'bg-primary-600 text-white',
    gradient: 'bg-gradient-to-r from-primary-600 to-blue-500 text-white',
  };

  const colorClasses = {
    primary: { bar: 'bg-primary-500', track: 'bg-primary-100', text: 'text-primary-600' },
    blue: { bar: 'bg-blue-500', track: 'bg-blue-100', text: 'text-blue-600' },
    green: { bar: 'bg-green-500', track: 'bg-green-100', text: 'text-green-600' },
    yellow: { bar: 'bg-yellow-500', track: 'bg-yellow-100', text: 'text-yellow-600' },
    red: { bar: 'bg-red-500', track: 'bg-red-100', text: 'text-red-600' },
    purple: { bar: 'bg-purple-500', track: 'bg-purple-100', text: 'text-purple-600' },
    gray: { bar: 'bg-gray-500', track: 'bg-gray-200', text: 'text-gray-600' },
  };

  const sizeClasses = {
    sm: { bar: 'h-2', text: 'text-sm', circle: 80, stroke: 6 },
    md: { bar: 'h-3', text: 'text-base', circle: 100, stroke: 8 },
    lg: { bar: 'h-4', text: 'text-lg', circle: 120, stroke: 10 },
  };

  const columnClasses = {
    1: 'grid-cols-1',
    2: 'grid-cols-1 sm:grid-cols-2',
    3: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-2 lg:grid-cols-4',
  };

  const sizeConfig = sizeClasses[size] || sizeClasses.md;
  const isDark = backgroundColor === 'dark' || backgroundColor === 'primary' || backgroundColor === 'gradient';

  const renderHorizontalProgress = (item, idx) => {
    const colors = colorClasses[item.color] || colorClasses.primary;
    const percentage = (item.value / item.max) * 100;

    return (
      <div key={idx} className="mb-4 last:mb-0">
        <div className="flex justify-between items-center mb-2">
          {showLabel && <span className={`font-medium ${sizeConfig.text}`}>{item.label}</span>}
          {showValue && (
            <span className={`font-bold ${colors.text} ${isDark ? '!text-white' : ''}`}>
              {item.value}
              {item.suffix}
            </span>
          )}
        </div>
        <div className={`w-full rounded-full overflow-hidden ${sizeConfig.bar} ${isDark ? 'bg-white/20' : colors.track}`}>
          <div
            className={`${colors.bar} ${sizeConfig.bar} rounded-full transition-all duration-1000 ease-out`}
            style={{ width: animated && isVisible ? `${percentage}%` : '0%' }}
          />
        </div>
      </div>
    );
  };

  const renderCircularProgress = (item, idx) => {
    const colors = colorClasses[item.color] || colorClasses.primary;
    const percentage = (item.value / item.max) * 100;
    const radius = (sizeConfig.circle - sizeConfig.stroke) / 2;
    const circumference = radius * 2 * Math.PI;
    const offset = circumference - (percentage / 100) * circumference;

    return (
      <div key={idx} className="flex flex-col items-center">
        <div className="relative" style={{ width: sizeConfig.circle, height: sizeConfig.circle }}>
          <svg className="transform -rotate-90" width={sizeConfig.circle} height={sizeConfig.circle}>
            {/* Background circle */}
            <circle
              cx={sizeConfig.circle / 2}
              cy={sizeConfig.circle / 2}
              r={radius}
              stroke={isDark ? 'rgba(255,255,255,0.2)' : '#e5e7eb'}
              strokeWidth={sizeConfig.stroke}
              fill="none"
            />
            {/* Progress circle */}
            <circle
              cx={sizeConfig.circle / 2}
              cy={sizeConfig.circle / 2}
              r={radius}
              stroke={colors.bar.replace('bg-', '').includes('primary') ? '#6366f1' :
                     colors.bar.replace('bg-', '').includes('green') ? '#22c55e' :
                     colors.bar.replace('bg-', '').includes('blue') ? '#3b82f6' :
                     colors.bar.replace('bg-', '').includes('yellow') ? '#eab308' :
                     colors.bar.replace('bg-', '').includes('red') ? '#ef4444' :
                     colors.bar.replace('bg-', '').includes('purple') ? '#a855f7' : '#6b7280'}
              strokeWidth={sizeConfig.stroke}
              fill="none"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={animated && isVisible ? offset : circumference}
              className="transition-all duration-1000 ease-out"
            />
          </svg>
          {showValue && (
            <div className="absolute inset-0 flex items-center justify-center">
              <span className={`font-bold ${sizeConfig.text}`}>
                {item.value}
                {item.suffix}
              </span>
            </div>
          )}
        </div>
        {showLabel && <p className={`mt-3 font-medium text-center ${sizeConfig.text}`}>{item.label}</p>}
      </div>
    );
  };

  const renderStatsProgress = (item, idx) => {
    const colors = colorClasses[item.color] || colorClasses.primary;

    return (
      <div
        key={idx}
        className={`p-6 rounded-xl text-center ${
          isDark ? 'bg-white/10' : 'bg-white shadow-lg'
        }`}
      >
        <div className={`text-4xl font-bold mb-2 ${isDark ? 'text-white' : colors.text}`}>
          {showValue && (
            <>
              {item.value}
              {item.suffix}
            </>
          )}
        </div>
        {showLabel && (
          <p className={`font-medium ${isDark ? 'text-white/80' : 'text-gray-600'}`}>{item.label}</p>
        )}
      </div>
    );
  };

  const renderItem = (item, idx) => {
    switch (variant) {
      case 'circular':
        return renderCircularProgress(item, idx);
      case 'stats':
        return renderStatsProgress(item, idx);
      case 'vertical':
        return (
          <div key={idx} className="flex flex-col items-center">
            {renderHorizontalProgress(item, idx)}
          </div>
        );
      default:
        return renderHorizontalProgress(item, idx);
    }
  };

  return (
    <section
      ref={containerRef}
      className={`py-12 px-4 ${bgClasses[backgroundColor] || bgClasses.white}`}
    >
      <div className="max-w-5xl mx-auto">
        {(title || subtitle) && (
          <div className="text-center mb-10">
            {title && <h2 className="text-3xl font-bold mb-2">{title}</h2>}
            {subtitle && (
              <p className={`text-lg ${isDark ? 'text-white/70' : 'text-gray-600'}`}>{subtitle}</p>
            )}
          </div>
        )}

        {variant === 'horizontal' && columns === 1 ? (
          <div className="max-w-2xl mx-auto">{items.map((item, idx) => renderItem(item, idx))}</div>
        ) : (
          <div className={`grid ${columnClasses[columns] || columnClasses[1]} gap-6`}>
            {items.map((item, idx) => renderItem(item, idx))}
          </div>
        )}
      </div>
    </section>
  );
};

export default ProgressBlock;
