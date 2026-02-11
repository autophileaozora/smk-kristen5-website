import { useState } from 'react';

const AccordionBlock = ({
  items = [
    { title: 'Accordion Item 1', content: 'Content for item 1' },
    { title: 'Accordion Item 2', content: 'Content for item 2' },
    { title: 'Accordion Item 3', content: 'Content for item 3' },
  ],
  allowMultiple = false,
  variant = 'default',
}) => {
  const [openItems, setOpenItems] = useState([0]); // First item open by default

  const toggleItem = (index) => {
    if (allowMultiple) {
      setOpenItems((prev) =>
        prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index]
      );
    } else {
      setOpenItems((prev) => (prev.includes(index) ? [] : [index]));
    }
  };

  const variantClasses = {
    default: 'border border-gray-200',
    minimal: 'border-b border-gray-200',
    card: 'bg-white shadow-md rounded-lg border border-gray-100',
  };

  return (
    <div className="my-8 space-y-2">
      {items.map((item, index) => {
        const isOpen = openItems.includes(index);

        return (
          <div
            key={index}
            className={`
              ${variantClasses[variant] || variantClasses.default}
              ${variant === 'card' ? 'rounded-lg overflow-hidden' : ''}
            `}
          >
            {/* Header */}
            <button
              onClick={() => toggleItem(index)}
              className="w-full flex items-center justify-between p-4 text-left hover:bg-gray-50 transition-colors"
            >
              <span className="font-semibold text-gray-900">{item.title}</span>
              <svg
                className={`w-5 h-5 text-gray-500 transform transition-transform ${
                  isOpen ? 'rotate-180' : ''
                }`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {/* Content */}
            <div
              className={`
                overflow-hidden transition-all duration-300
                ${isOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}
              `}
            >
              <div className="p-4 pt-0 text-gray-700">
                {item.content}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default AccordionBlock;
