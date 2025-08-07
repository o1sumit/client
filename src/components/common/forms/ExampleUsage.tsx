import { BaseForm, FormField, FormSelect, FormTextarea } from './index';
import { applicationValidationSchema } from '../../../utils/validation';
import type { ApplicationFormData } from '../../../types/forms';

// Example component showing how to use the form components
export function ApplicationFormExample() {
  const initialValues: ApplicationFormData = {
    name: '',
    applicationId: '',
    description: '',
    status: 'active',
  };

  const statusOptions = [
    { value: 'active', label: 'Active' },
    { value: 'inactive', label: 'Inactive' },
  ];

  const handleSubmit = async (values: ApplicationFormData) => {
    console.log('Form submitted:', values);
    // Handle form submission here
  };

  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-xl font-semibold mb-4">Create Application</h2>
      <BaseForm
        initialValues={initialValues}
        validationSchema={applicationValidationSchema}
        onSubmit={handleSubmit}
      >
        <FormField
          name="name"
          label="Application Name"
          placeholder="Enter application name"
          required
        />
        
        <FormField
          name="applicationId"
          label="Application ID"
          placeholder="Enter unique application ID"
          required
        />
        
        <FormTextarea
          name="description"
          label="Description"
          placeholder="Enter application description"
          rows={4}
        />
        
        <FormSelect
          name="status"
          label="Status"
          options={statusOptions}
          required
        />
      </BaseForm>
    </div>
  );
}