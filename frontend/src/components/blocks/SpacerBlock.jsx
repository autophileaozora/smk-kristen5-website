const SpacerBlock = ({ height = 'md', className = '' }) => {
  const heights = {
    sm: 'h-4',
    md: 'h-8',
    lg: 'h-16',
    xl: 'h-24',
  };

  return <div className={`${heights[height]} ${className}`} />;
};

export default SpacerBlock;
