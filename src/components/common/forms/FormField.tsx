import { Field, ErrorMessage } from "formik";

interface FormFieldProps {
  name: string;
  label: string;
  type?: string;
  placeholder?: string;
  required?: boolean;
  className?: string;
  disabled?: boolean;
}

export function FormField({
  name,
  label,
  type = "text",
  placeholder,
  required = false,
  className = "",
  disabled = false,
}: FormFieldProps) {
  return (
    <div className={`form-field ${className}`}>
      <label
        className="block text-sm font-medium text-gray-700 mb-1"
        htmlFor={name}
      >
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      <Field
        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
        disabled={disabled}
        id={name}
        name={name}
        placeholder={placeholder}
        type={type}
      />
      <ErrorMessage
        className="text-red-500 text-sm mt-1"
        component="div"
        name={name}
      />
    </div>
  );
}
