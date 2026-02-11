const DividerBlock = ({
  style = 'solid',
  color = 'gray',
  thickness = '1',
  spacing = 'md',
}) => {
  const spacingClasses = {
    sm: 'my-4',
    md: 'my-8',
    lg: 'my-12',
    xl: 'my-16',
  };

  const colorClasses = {
    gray: 'border-gray-300',
    blue: 'border-blue-500',
    primary: 'border-primary-500',
    black: 'border-black',
  };

  const styleClasses = {
    solid: 'border-solid',
    dashed: 'border-dashed',
    dotted: 'border-dotted',
  };

  const thicknessClass = `border-t-${thickness}`;

  return (
    <hr
      className={`
        ${spacingClasses[spacing] || spacingClasses.md}
        ${colorClasses[color] || colorClasses.gray}
        ${styleClasses[style] || styleClasses.solid}
        ${thicknessClass}
      `}
    />
  );
};

export default DividerBlock;
