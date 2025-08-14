import type { ApplicationFormData } from "../../../types/forms";

import { applicationValidationSchema } from "../../../utils/validation";

import { BaseForm, FormField, FormSelect, FormTextarea } from "./index";

// Example component showing how to use the form components
export function ApplicationFormExample() {
  const initialValues: ApplicationFormData = {
    name: "",
    applicationId: "",
    description: "",
    status: "active",
  };

  const statusOptions = [
    { value: "active", label: "Active" },
    { value: "inactive", label: "Inactive" },
  ];

  const handleSubmit = async (values: ApplicationFormData) => {
    console.log("Form submitted:", values);
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
          required
          label="Application Name"
          name="name"
          placeholder="Enter application name"
        />

        <FormField
          required
          label="Application ID"
          name="applicationId"
          placeholder="Enter unique application ID"
        />

        <FormTextarea
          label="Description"
          name="description"
          placeholder="Enter application description"
          rows={4}
        />

        <FormSelect
          required
          label="Status"
          name="status"
          options={statusOptions}
        />
      </BaseForm>
    </div>
  );
}
