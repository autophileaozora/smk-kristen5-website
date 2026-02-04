const HeadingBlock = ({ text = 'Heading', level = 2, align = 'left', className = '' }) => {
  const Tag = `h${level}`;

  const sizeClasses = {
    1: 'text-4xl md:text-5xl lg:text-6xl',
    2: 'text-3xl md:text-4xl lg:text-5xl',
    3: 'text-2xl md:text-3xl lg:text-4xl',
    4: 'text-xl md:text-2xl lg:text-3xl',
    5: 'text-lg md:text-xl lg:text-2xl',
    6: 'text-base md:text-lg lg:text-xl',
  };

  const alignClasses = {
    left: 'text-left',
    center: 'text-center',
    right: 'text-right',
  };

  return (
    <Tag
      className={`font-bold mb-4 ${sizeClasses[level]} ${alignClasses[align]} ${className}`}
    >
      {text}
    </Tag>
  );
};

export default HeadingBlock;
