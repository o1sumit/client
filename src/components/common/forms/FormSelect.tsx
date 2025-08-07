import { Field, ErrorMessage } from 'formik';

interface SelectOption<T = string> {
  value: T;
  label: string;
}

interface FormSelectProps<T = string> {
  name: string;
  label: string;
  options: SelectOption<T>[];
  required?: boolean;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
}

export function FormSelect<T = string>({
  name,
  label,
  options,
  required = false,
  placeholder = 'Select an option',
  className = '',
  disabled = false,
}: FormSelectProps<T>) {
  return (
    <div className={`form-select ${className}`}>
      <label htmlFor={name} className="block text-sm font-medium text-gray-700 mb-1">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      <Field
        as="select"
        id={name}
        name={name}
        disabled={disabled}
        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
      >
        <option value="">{placeholder}</option>
        {options.map((option, index) => (
          <option key={index} value={String(option.value)}>
            {option.label}
          </option>
        ))}
      </Field>
      <ErrorMessage
        name={name}
        component="div"
        className="text-red-500 text-sm mt-1"
      />
    </div>
  );
}