import Badge from '../Badge';

const BadgeBlock = ({
  children,
  variant = 'default',
  size = 'md',
  rounded = 'md',
  className = '',
  ...props
}) => {
  return (
    <Badge
      variant={variant}
      size={size}
      rounded={rounded}
      className={className}
      {...props}
    >
      {children}
    </Badge>
  );
};

export default BadgeBlock;
