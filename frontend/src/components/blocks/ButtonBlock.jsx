import Button from '../Button';

const ButtonBlock = ({
  children,
  variant = 'primary',
  size = 'md',
  onClick,
  disabled = false,
  type = 'button',
  className = '',
  fullWidth = false,
  loading = false,
  icon,
  ...props
}) => {
  return (
    <Button
      variant={variant}
      size={size}
      onClick={onClick}
      disabled={disabled}
      type={type}
      className={className}
      fullWidth={fullWidth}
      loading={loading}
      icon={icon}
      {...props}
    >
      {children}
    </Button>
  );
};

export default ButtonBlock;
