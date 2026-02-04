const TextBlock = ({ content = '<p>Your text here...</p>', className = '' }) => {
  return (
    <div
      className={`prose prose-lg max-w-none mb-4 ${className}`}
      dangerouslySetInnerHTML={{ __html: content }}
    />
  );
};

export default TextBlock;
