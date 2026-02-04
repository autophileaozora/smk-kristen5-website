const Container = ({
  children,
  size = 'default',
  padding = true,
  className = '',
}) => {
  const baseClasses = 'mx-auto';

  const sizes = {
    sm: 'max-w-3xl',
    default: 'max-w-7xl',
    lg: 'max-w-[1400px]',
    xl: 'max-w-[1600px]',
    full: 'max-w-full',
  };

  const paddingClasses = padding ? 'px-4 sm:px-6 lg:px-8' : '';

  return (
    <div className={`${baseClasses} ${sizes[size]} ${paddingClasses} ${className}`}>
      {children}
    </div>
  );
};

export default Container;
