import { useState } from 'react';
import Input from '../Input';
import Button from '../Button';

const FormBlock = ({
  title = 'Contact Us',
  description = 'Fill out the form below and we will get back to you.',
  fields = [
    { name: 'name', label: 'Name', type: 'text', required: true, placeholder: 'Your name' },
    { name: 'email', label: 'Email', type: 'email', required: true, placeholder: 'your@email.com' },
    { name: 'message', label: 'Message', type: 'textarea', required: true, placeholder: 'Your message' },
  ],
  submitButtonText = 'Send Message',
  successMessage = 'Thank you! Your message has been sent.',
  endpoint = '/api/contact',
}) => {
  const [formData, setFormData] = useState({});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        setSuccess(true);
        setFormData({});
      } else {
        setError('Failed to send message. Please try again.');
      }
    } catch (err) {
      setError('An error occurred. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="my-8 p-8 bg-green-50 border border-green-200 rounded-lg text-center">
        <svg
          className="w-16 h-16 text-green-500 mx-auto mb-4"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <p className="text-green-800 text-lg font-medium">{successMessage}</p>
        <button
          onClick={() => setSuccess(false)}
          className="mt-4 text-green-600 hover:text-green-700 font-medium"
        >
          Send another message
        </button>
      </div>
    );
  }

  return (
    <div className="my-8">
      <div className="bg-white rounded-lg shadow-md p-6 md:p-8 max-w-2xl mx-auto">
        {/* Header */}
        {(title || description) && (
          <div className="mb-6 text-center">
            {title && <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">{title}</h2>}
            {description && <p className="text-gray-600">{description}</p>}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {fields.map((field) => (
            <div key={field.name}>
              {field.type === 'textarea' ? (
                <div>
                  <label htmlFor={field.name} className="block text-sm font-medium text-gray-700 mb-1">
                    {field.label}
                    {field.required && <span className="text-red-500 ml-1">*</span>}
                  </label>
                  <textarea
                    id={field.name}
                    name={field.name}
                    value={formData[field.name] || ''}
                    onChange={handleChange}
                    required={field.required}
                    placeholder={field.placeholder}
                    rows={4}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>
              ) : (
                <Input
                  label={field.label}
                  name={field.name}
                  type={field.type}
                  value={formData[field.name] || ''}
                  onChange={handleChange}
                  required={field.required}
                  placeholder={field.placeholder}
                />
              )}
            </div>
          ))}

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              {error}
            </div>
          )}

          <Button
            type="submit"
            variant="primary"
            size="lg"
            className="w-full"
            loading={loading}
          >
            {submitButtonText}
          </Button>
        </form>
      </div>
    </div>
  );
};

export default FormBlock;
