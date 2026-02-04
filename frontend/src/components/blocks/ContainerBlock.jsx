import Container from '../Container';

const ContainerBlock = ({
  children,
  size = 'default',
  padding = true,
  className = '',
  ...props
}) => {
  return (
    <Container
      size={size}
      padding={padding}
      className={className}
      {...props}
    >
      {children}
    </Container>
  );
};

export default ContainerBlock;
