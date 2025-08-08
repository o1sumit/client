import React, { useState } from 'react';
import { Formik, Form, Field, ErrorMessage, type FormikHelpers } from 'formik';
import { Eye, EyeOff, X } from 'lucide-react';
import { createAdminValidationSchema } from '../utils/validation';
import type { CreateAdminFormData } from '../types/forms';
import type { AdminRole, AdminPermission } from '../types/entities';
import './CreateAdminForm.css';

interface CreateAdminFormProps {
  onSubmit: (values: CreateAdminFormData) => Promise<void>;
  onCancel: () => void;
  availableRoles: AdminRole[];
  availablePermissions: AdminPermission[];
  isLoading?: boolean;
}

const CreateAdminForm: React.FC<CreateAdminFormProps> = ({
  onSubmit,
  onCancel,
  availableRoles,
  availablePermissions,
  isLoading = false
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const initialValues: CreateAdminFormData = {
    username: '',
    email: '',
    firstName: '',
    lastName: '',
    role: 'admin',
    permissions: [],
    password: '',
    confirmPassword: ''
  };

  const roleOptions = [
    { value: 'super_admin', label: 'Super Admin' },
    { value: 'admin', label: 'Admin' },
    { value: 'moderator', label: 'Moderator' }
  ];

  const handleSubmit = async (values: CreateAdminFormData, formikHelpers: FormikHelpers<CreateAdminFormData>) => {
    try {
      await onSubmit(values);
      formikHelpers.resetForm();
    } catch (error) {
      // Error handling is done in the parent component
      console.error('Form submission error:', error);
    }
  };

  const togglePasswordVisibility = () => setShowPassword(!showPassword);
  const toggleConfirmPasswordVisibility = () => setShowConfirmPassword(!showConfirmPassword);

  return (
    <div className="create-admin-form">
      <Formik
        initialValues={initialValues}
        validationSchema={createAdminValidationSchema}
        onSubmit={handleSubmit}
      >
        {({ values, setFieldValue, isSubmitting, errors, touched }) => (
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
              <h3 className="section-title">Security</h3>
              
              <div className="form-field">
                <label htmlFor="password" className="form-label">
                  Password <span className="required">*</span>
                </label>
                <div className="password-input-wrapper">
                  <Field
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Enter password"
                    className={`form-input password-input ${errors.password && touched.password ? 'error' : ''}`}
                  />
                  <button
                    type="button"
                    onClick={togglePasswordVisibility}
                    className="password-toggle"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                <ErrorMessage name="password" component="div" className="error-message" />
              </div>

              <div className="form-field">
                <label htmlFor="confirmPassword" className="form-label">
                  Confirm Password <span className="required">*</span>
                </label>
                <div className="password-input-wrapper">
                  <Field
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    placeholder="Confirm password"
                    className={`form-input password-input ${errors.confirmPassword && touched.confirmPassword ? 'error' : ''}`}
                  />
                  <button
                    type="button"
                    onClick={toggleConfirmPasswordVisibility}
                    className="password-toggle"
                    aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                  >
                    {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                <ErrorMessage name="confirmPassword" component="div" className="error-message" />
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
                {isSubmitting || isLoading ? 'Creating...' : 'Create Admin'}
              </button>
            </div>
          </Form>
        )}
      </Formik>
    </div>
  );
};

export default CreateAdminForm;
