const QuoteBlock = ({
  quote = 'Enter your quote here',
  author = '',
  role = '',
  variant = 'default',
  size = 'md',
}) => {
  const variantClasses = {
    default: 'border-l-4 border-gray-400 bg-gray-50 text-gray-700',
    primary: 'border-l-4 border-primary-500 bg-primary-50 text-primary-900',
    success: 'border-l-4 border-green-500 bg-green-50 text-green-900',
    minimal: 'border-none bg-transparent text-gray-700',
  };

  const sizeClasses = {
    sm: 'text-base py-3 px-4',
    md: 'text-lg py-4 px-6',
    lg: 'text-xl py-6 px-8',
  };

  return (
    <blockquote
      className={`
        ${variantClasses[variant] || variantClasses.default}
        ${sizeClasses[size] || sizeClasses.md}
        rounded-r-lg my-6 italic
      `}
    >
      <p className="mb-2">&ldquo;{quote}&rdquo;</p>
      {(author || role) && (
        <footer className="text-sm not-italic font-medium mt-3">
          {author && <cite className="font-semibold not-italic">{author}</cite>}
          {role && <span className="text-gray-600 ml-2">- {role}</span>}
        </footer>
      )}
    </blockquote>
  );
};

export default QuoteBlock;
