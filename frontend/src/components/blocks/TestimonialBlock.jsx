const TestimonialBlock = ({
  name = 'John Doe',
  role = 'CEO, Company',
  image = '',
  quote = 'This is an amazing testimonial quote that shows how great the service is.',
  rating = 5,
  variant = 'default',
}) => {
  const variantClasses = {
    default: 'bg-white border border-gray-200',
    primary: 'bg-primary-50 border border-primary-200',
    card: 'bg-white shadow-lg',
  };

  return (
    <div className="my-8">
      <div className={`${variantClasses[variant] || variantClasses.default} rounded-lg p-6 md:p-8`}>
        {/* Quote */}
        <div className="mb-6">
          <svg
            className="w-10 h-10 text-primary-500 mb-4 opacity-50"
            fill="currentColor"
            viewBox="0 0 32 32"
          >
            <path d="M10 8c-3.314 0-6 2.686-6 6s2.686 6 6 6c1.657 0 3.157-.672 4.243-1.757l-2.121-2.122c-.545.544-1.294.879-2.122.879-1.657 0-3-1.343-3-3s1.343-3 3-3c.828 0 1.577.335 2.122.879l2.121-2.122C13.157 8.672 11.657 8 10 8zm12 0c-3.314 0-6 2.686-6 6s2.686 6 6 6c1.657 0 3.157-.672 4.243-1.757l-2.121-2.122c-.545.544-1.294.879-2.122.879-1.657 0-3-1.343-3-3s1.343-3 3-3c.828 0 1.577.335 2.122.879l2.121-2.122C25.157 8.672 23.657 8 22 8z" />
          </svg>
          <p className="text-lg text-gray-700 italic leading-relaxed">
            {quote}
          </p>
        </div>

        {/* Rating */}
        {rating > 0 && (
          <div className="flex gap-1 mb-4">
            {[...Array(5)].map((_, i) => (
              <svg
                key={i}
                className={`w-5 h-5 ${i < rating ? 'text-yellow-400' : 'text-gray-300'}`}
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
            ))}
          </div>
        )}

        {/* Author */}
        <div className="flex items-center gap-4">
          {image ? (
            <img
              src={image}
              alt={name}
              className="w-12 h-12 rounded-full object-cover"
            />
          ) : (
            <div className="w-12 h-12 rounded-full bg-primary-500 flex items-center justify-center text-white font-bold text-lg">
              {name.charAt(0)}
            </div>
          )}
          <div>
            <div className="font-semibold text-gray-900">{name}</div>
            <div className="text-sm text-gray-600">{role}</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TestimonialBlock;
