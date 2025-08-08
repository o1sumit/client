import React from 'react';
import { Formik, Form, Field, ErrorMessage, type FormikHelpers } from 'formik';
import { editAdminValidationSchema } from '../utils/validation';
import type { EditAdminFormData } from '../types/forms';
import type { AdminUser, AdminRole, AdminPermission } from '../types/entities';
import './EditAdminForm.css';

interface EditAdminFormProps {
  admin: AdminUser;
  onSubmit: (values: EditAdminFormData) => Promise<void>;
  onCancel: () => void;
  availableRoles: AdminRole[];
  availablePermissions: AdminPermission[];
  isLoading?: boolean;
}

const EditAdminForm: React.FC<EditAdminFormProps> = ({
  admin,
  onSubmit,
  onCancel,
  availableRoles,
  availablePermissions,
  isLoading = false
}) => {
  const initialValues: EditAdminFormData = {
    username: admin.username,
    email: admin.email,
    firstName: admin.firstName,
    lastName: admin.lastName,
    role: admin.role,
    permissions: admin.permissions.map(p => p.id),
    status: admin.status
  };

  const roleOptions = [
    { value: 'super_admin', label: 'Super Admin' },
    { value: 'admin', label: 'Admin' },
    { value: 'moderator', label: 'Moderator' }
  ];

  const statusOptions = [
    { value: 'active', label: 'Active' },
    { value: 'inactive', label: 'Inactive' }
  ];

  const handleSubmit = async (values: EditAdminFormData, formikHelpers: FormikHelpers<EditAdminFormData>) => {
    try {
      await onSubmit(values);
      // Don't reset form on edit - keep the current values
    } catch (error) {
      // Error handling is done in the parent component
      console.error('Form submission error:', error);
    }
  };

  return (
    <div className="edit-admin-form">
      <Formik
        initialValues={initialValues}
        validationSchema={editAdminValidationSchema}
        onSubmit={handleSubmit}
        enableReinitialize={true}
      >
        {({ values, isSubmitting, errors, touched, setFieldValue }) => (
          <Form className="admin-form">
            <div className="form-section">
              <h3 className="section-title">Basic Information</h3>
              
              <div className="form-row">
                <div className="form-field">
                  <label htmlFor="firstName" className="form-label">
                    First Name <span className="required">*</span>
                  </label>
                  <Field
                    id="firstName"
                    name="firstName"
                    type="text"
                    placeholder="Enter first name"
                    className={`form-input ${errors.firstName && touched.firstName ? 'error' : ''}`}
                  />
                  <ErrorMessage name="firstName" component="div" className="error-message" />
                </div>

                <div className="form-field">
                  <label htmlFor="lastName" className="form-label">
                    Last Name <span className="required">*</span>
                  </label>
                  <Field
                    id="lastName"
                    name="lastName"
                    type="text"
                    placeholder="Enter last name"
                    className={`form-input ${errors.lastName && touched.lastName ? 'error' : ''}`}
                  />
                  <ErrorMessage name="lastName" component="div" className="error-message" />
                </div>
              </div>

              <div className="form-field">
                <label htmlFor="username" className="form-label">
                  Username <span className="required">*</span>
                </label>
                <Field
                  id="username"
                  name="username"
                  type="text"
                  placeholder="Enter username"
                  className={`form-input ${errors.username && touched.username ? 'error' : ''}`}
                />
                <ErrorMessage name="username" component="div" className="error-message" />
              </div>

              <div className="form-field">
                <label htmlFor="email" className="form-label">
                  Email <span className="required">*</span>
                </label>
                <Field
                  id="email"
                  name="email"
                  type="email"
                  placeholder="Enter email address"
                  className={`form-input ${errors.email && touched.email ? 'error' : ''}`}
                />
                <ErrorMessage name="email" component="div" className="error-message" />
              </div>
            </div>

            <div className="form-section">
              <h3 className="section-title">Role & Permissions</h3>
              
              <div className="form-field">
                <label htmlFor="role" className="form-label">
                  Role <span className="required">*</span>
                </label>
                <Field
                  as="select"
                  id="role"
                  name="role"
                  className={`form-select ${errors.role && touched.role ? 'error' : ''}`}
                >
                  <option value="">Select a role</option>
                  {roleOptions.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </Field>
                <ErrorMessage name="role" component="div" className="error-message" />
              </div>

              <div className="form-field">
                <label className="form-label">
                  Permissions <span className="required">*</span>
                </label>
                <div className="permissions-grid">
                  {availablePermissions.map(permission => (
                    <label key={permission.id} className="permission-checkbox">
                      <Field
                        type="checkbox"
                        name="permissions"
                        value={permission.id}
                        className="permission-input"
                      />
                      <span className="permission-label">{permission.name}</span>
                    </label>
                  ))}
                </div>
                <ErrorMessage name="permissions" component="div" className="error-message" />
              </div>
            </div>

            <div className="form-section">
              <h3 className="section-title">Account Status</h3>
              
              <div className="form-field">
                <label htmlFor="status" className="form-label">
                  Status <span className="required">*</span>
                </label>
                <Field
                  as="select"
                  id="status"
                  name="status"
                  className={`form-select ${errors.status && touched.status ? 'error' : ''}`}
                >
                  <option value="">Select status</option>
                  {statusOptions.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </Field>
                <ErrorMessage name="status" component="div" className="error-message" />
              </div>

              <div className="status-info">
                <p className="info-text">
                  <strong>Note:</strong> Password changes should be handled separately through the password reset functionality.
                </p>
              </div>
            </div>

            <div className="form-actions">
              <button
                type="button"
                onClick={onCancel}
                className="btn btn-secondary"
                disabled={isSubmitting || isLoading}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={isSubmitting || isLoading}
              >
                {isSubmitting || isLoading ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </Form>
        )}
      </Formik>
    </div>
  );
};

export default EditAdminForm;
