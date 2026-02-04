const Card = ({
  children,
  variant = 'default',
  padding = 'md',
  shadow = 'md',
  hover = false,
  className = '',
  onClick,
}) => {
  const baseClasses = 'rounded-lg transition-all duration-300';

  const variants = {
    default: 'bg-white border border-gray-200',
    elevated: 'bg-white',
    glass: 'bg-white/80 backdrop-blur-md border border-white/20',
    gradient: 'bg-gradient-to-br from-blue-50 to-white',
    dark: 'bg-gray-800 text-white',
  };

  const paddings = {
    none: '',
    sm: 'p-3',
    md: 'p-4 md:p-6',
    lg: 'p-6 md:p-8',
    xl: 'p-8 md:p-10',
  };

  const shadows = {
    none: '',
    sm: 'shadow-sm',
    md: 'shadow-md',
    lg: 'shadow-lg',
    xl: 'shadow-xl',
  };

  const hoverEffect = hover
    ? 'hover:shadow-xl hover:scale-105 cursor-pointer'
    : '';

  const clickable = onClick ? 'cursor-pointer' : '';

  return (
    <div
      className={`${baseClasses} ${variants[variant]} ${paddings[padding]} ${shadows[shadow]} ${hoverEffect} ${clickable} ${className}`}
      onClick={onClick}
    >
      {children}
    </div>
  );
};

export default Card;
