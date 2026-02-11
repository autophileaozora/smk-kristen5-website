const StatsBlock = ({
  stats = [
    { value: '1000+', label: 'Siswa Aktif', icon: '👨‍🎓' },
    { value: '50+', label: 'Tenaga Pengajar', icon: '👨‍🏫' },
    { value: '15+', label: 'Program Keahlian', icon: '🎓' },
    { value: '25+', label: 'Tahun Berpengalaman', icon: '🏆' },
  ],
  columns = 4,
  variant = 'default',
  showIcons = true,
}) => {
  const columnClasses = {
    2: 'grid-cols-1 md:grid-cols-2',
    3: 'grid-cols-1 md:grid-cols-3',
    4: 'grid-cols-2 md:grid-cols-4',
    5: 'grid-cols-2 md:grid-cols-5',
  };

  const variantClasses = {
    default: 'bg-white border border-gray-200',
    primary: 'bg-primary-600 text-white',
    gradient: 'bg-gradient-to-br from-primary-600 to-blue-700 text-white',
    glass: 'bg-white/10 backdrop-blur-md border border-white/20 text-white',
  };

  return (
    <div className="my-8">
      <div className={`grid ${columnClasses[columns] || columnClasses[4]} gap-6`}>
        {stats.map((stat, index) => (
          <div
            key={index}
            className={`
              ${variantClasses[variant] || variantClasses.default}
              rounded-lg p-6 text-center
              transform transition-transform duration-300 hover:scale-105
            `}
          >
            {showIcons && stat.icon && (
              <div className="text-4xl mb-3">{stat.icon}</div>
            )}
            <div className="text-3xl md:text-4xl font-bold mb-2">
              {stat.value}
            </div>
            <div className={`text-sm md:text-base ${variant === 'default' ? 'text-gray-600' : 'opacity-90'}`}>
              {stat.label}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default StatsBlock;
