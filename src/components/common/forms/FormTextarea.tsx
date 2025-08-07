import { Field, ErrorMessage } from 'formik';

interface FormTextareaProps {
  name: string;
  label: string;
  placeholder?: string;
  required?: boolean;
  rows?: number;
  className?: string;
  disabled?: boolean;
}

export function FormTextarea({
  name,
  label,
  placeholder,
  required = false,
  rows = 3,
  className = '',
  disabled = false,
}: FormTextareaProps) {
  return (
    <div className={`form-textarea ${className}`}>
      <label htmlFor={name} className="block text-sm font-medium text-gray-700 mb-1">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      <Field
        as="textarea"
        id={name}
        name={name}
        placeholder={placeholder}
        rows={rows}
        disabled={disabled}
        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-vertical disabled:bg-gray-100 disabled:cursor-not-allowed"
      />
      <ErrorMessage
        name={name}
        component="div"
        className="text-red-500 text-sm mt-1"
      />
    </div>
  );
}