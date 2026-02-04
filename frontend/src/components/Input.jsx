const Input = ({
  type = 'text',
  label,
  placeholder,
  value,
  onChange,
  error,
  helper,
  disabled = false,
  required = false,
  icon,
  className = '',
  containerClassName = '',
  ...props
}) => {
  const baseClasses = 'w-full px-4 py-2.5 border rounded-lg transition-all duration-200 focus:outline-none focus:ring-2';

  const stateClasses = error
    ? 'border-red-300 focus:border-red-500 focus:ring-red-200'
    : 'border-gray-300 focus:border-blue-500 focus:ring-blue-200';

  const disabledClasses = disabled
    ? 'bg-gray-100 cursor-not-allowed'
    : 'bg-white hover:border-gray-400';

  return (
    <div className={`${containerClassName}`}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}

      <div className="relative">
        {icon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
            {icon}
          </div>
        )}

        <input
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          disabled={disabled}
          required={required}
          className={`${baseClasses} ${stateClasses} ${disabledClasses} ${icon ? 'pl-10' : ''} ${className}`}
          {...props}
        />
      </div>

      {error && (
        <p className="mt-1.5 text-sm text-red-600">{error}</p>
      )}

      {helper && !error && (
        <p className="mt-1.5 text-sm text-gray-500">{helper}</p>
      )}
    </div>
  );
};

export default Input;
