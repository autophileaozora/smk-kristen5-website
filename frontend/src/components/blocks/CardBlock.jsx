import Card from '../Card';

const CardBlock = ({
  children,
  variant = 'default',
  padding = 'md',
  shadow = 'md',
  hover = false,
  className = '',
  onClick,
  ...props
}) => {
  return (
    <Card
      variant={variant}
      padding={padding}
      shadow={shadow}
      hover={hover}
      className={className}
      onClick={onClick}
      {...props}
    >
      {children}
    </Card>
  );
};

export default CardBlock;
