import Alert from '../Alert';

const AlertBlock = ({
  type = 'info',
  title,
  message,
  onClose,
  className = '',
  icon,
  ...props
}) => {
  return (
    <Alert
      type={type}
      title={title}
      message={message}
      onClose={onClose}
      className={className}
      icon={icon}
      {...props}
    />
  );
};

export default AlertBlock;
