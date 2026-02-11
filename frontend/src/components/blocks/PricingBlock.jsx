import { Link } from 'react-router-dom';

// Pricing Block - Display pricing/tuition comparison
const PricingBlock = ({
  title = 'Biaya Pendidikan',
  subtitle = 'Pilih program yang sesuai dengan kebutuhan Anda',
  plans = [
    {
      name: 'Program Reguler',
      price: 'Rp 5.000.000',
      period: '/tahun',
      description: 'Program pembelajaran standar',
      features: ['Pembelajaran di kelas', 'Praktik laboratorium', 'Ekstrakurikuler dasar', 'Seragam standar'],
      buttonText: 'Daftar Sekarang',
      buttonUrl: '/pendaftaran',
      highlighted: false,
      badge: '',
    },
    {
      name: 'Program Unggulan',
      price: 'Rp 7.500.000',
      period: '/tahun',
      description: 'Program dengan fasilitas lengkap',
      features: [
        'Semua fitur Reguler',
        'Sertifikasi industri',
        'Magang di perusahaan',
        'Tablet pembelajaran',
        'Bimbingan karir intensif',
      ],
      buttonText: 'Daftar Sekarang',
      buttonUrl: '/pendaftaran',
      highlighted: true,
      badge: 'Populer',
    },
    {
      name: 'Program Beasiswa',
      price: 'Gratis',
      period: '',
      description: 'Untuk siswa berprestasi',
      features: ['Bebas biaya pendidikan', 'Seragam gratis', 'Buku pelajaran gratis', 'Syarat & ketentuan berlaku'],
      buttonText: 'Lihat Syarat',
      buttonUrl: '/beasiswa',
      highlighted: false,
      badge: 'Terbatas',
    },
  ],
  columns = 3,
  variant = 'cards', // cards, simple, comparison
  showFeatures = true,
  backgroundColor = 'gray',
}) => {

  const bgClasses = {
    white: 'bg-white',
    gray: 'bg-gray-50',
    dark: 'bg-gray-900',
    gradient: 'bg-gradient-to-b from-primary-50 to-white',
  };

  const columnClasses = {
    2: 'grid-cols-1 md:grid-cols-2',
    3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4',
  };

  const renderPlan = (plan, idx) => {
    const isHighlighted = plan.highlighted;

    if (variant === 'simple') {
      return (
        <div
          key={idx}
          className={`p-6 rounded-xl ${
            isHighlighted
              ? 'bg-primary-600 text-white'
              : backgroundColor === 'dark'
              ? 'bg-gray-800 text-white'
              : 'bg-white'
          } ${isHighlighted ? 'shadow-xl scale-105' : 'shadow-md'}`}
        >
          {plan.badge && (
            <span
              className={`inline-block px-3 py-1 text-xs font-bold rounded-full mb-4 ${
                isHighlighted ? 'bg-white text-primary-600' : 'bg-primary-100 text-primary-600'
              }`}
            >
              {plan.badge}
            </span>
          )}
          <h3 className="text-xl font-bold mb-2">{plan.name}</h3>
          <div className="mb-4">
            <span className="text-3xl font-bold">{plan.price}</span>
            {plan.period && <span className="text-sm opacity-70">{plan.period}</span>}
          </div>
          {plan.description && <p className="text-sm opacity-80 mb-4">{plan.description}</p>}
          <Link
            to={plan.buttonUrl || '#'}
            className={`block text-center py-2 px-4 rounded-lg font-semibold transition-colors ${
              isHighlighted
                ? 'bg-white text-primary-600 hover:bg-gray-100'
                : 'bg-primary-600 text-white hover:bg-primary-700'
            }`}
          >
            {plan.buttonText}
          </Link>
        </div>
      );
    }

    // Cards variant (default)
    return (
      <div
        key={idx}
        className={`relative flex flex-col rounded-2xl overflow-hidden transition-all ${
          isHighlighted
            ? 'bg-white shadow-2xl scale-105 z-10 border-2 border-primary-500'
            : backgroundColor === 'dark'
            ? 'bg-gray-800 text-white shadow-lg'
            : 'bg-white shadow-lg hover:shadow-xl'
        }`}
      >
        {/* Badge */}
        {plan.badge && (
          <div className="absolute top-0 right-0">
            <span className="inline-block bg-primary-500 text-white text-xs font-bold px-4 py-1 rounded-bl-lg">
              {plan.badge}
            </span>
          </div>
        )}

        {/* Header */}
        <div
          className={`p-6 text-center ${
            isHighlighted ? 'bg-primary-600 text-white' : backgroundColor === 'dark' ? 'bg-gray-700' : 'bg-gray-50'
          }`}
        >
          <h3 className="text-xl font-bold mb-2">{plan.name}</h3>
          {plan.description && <p className="text-sm opacity-80">{plan.description}</p>}
        </div>

        {/* Price */}
        <div className="p-6 text-center border-b border-gray-100">
          <span className="text-4xl font-bold">{plan.price}</span>
          {plan.period && (
            <span className={`text-sm ${backgroundColor === 'dark' && !isHighlighted ? 'text-gray-400' : 'text-gray-500'}`}>
              {plan.period}
            </span>
          )}
        </div>

        {/* Features */}
        {showFeatures && plan.features && plan.features.length > 0 && (
          <div className="flex-1 p-6">
            <ul className="space-y-3">
              {plan.features.map((feature, fIdx) => (
                <li key={fIdx} className="flex items-start gap-3">
                  <svg
                    className={`w-5 h-5 flex-shrink-0 ${
                      isHighlighted ? 'text-primary-500' : 'text-green-500'
                    }`}
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <span className={`text-sm ${backgroundColor === 'dark' && !isHighlighted ? 'text-gray-300' : ''}`}>
                    {feature}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Button */}
        <div className="p-6 pt-0">
          <Link
            to={plan.buttonUrl || '#'}
            className={`block text-center py-3 px-6 rounded-lg font-semibold transition-all ${
              isHighlighted
                ? 'bg-primary-600 text-white hover:bg-primary-700'
                : backgroundColor === 'dark'
                ? 'bg-white text-gray-900 hover:bg-gray-100'
                : 'bg-gray-900 text-white hover:bg-gray-800'
            }`}
          >
            {plan.buttonText}
          </Link>
        </div>
      </div>
    );
  };

  return (
    <section className={`py-16 px-4 ${bgClasses[backgroundColor] || bgClasses.gray}`}>
      <div className="max-w-6xl mx-auto">
        {(title || subtitle) && (
          <div className="text-center mb-12">
            {title && (
              <h2 className={`text-3xl font-bold mb-3 ${backgroundColor === 'dark' ? 'text-white' : ''}`}>
                {title}
              </h2>
            )}
            {subtitle && (
              <p className={`text-lg ${backgroundColor === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                {subtitle}
              </p>
            )}
          </div>
        )}

        <div className={`grid ${columnClasses[columns] || columnClasses[3]} gap-6 items-stretch`}>
          {plans.map((plan, idx) => renderPlan(plan, idx))}
        </div>
      </div>
    </section>
  );
};

export default PricingBlock;
