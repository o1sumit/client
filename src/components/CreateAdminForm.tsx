import type { CreateAdminFormData } from "../types/forms";
import type { AdminRole, AdminPermission } from "../types/entities";

import React, { useState } from "react";
import { Formik, Form, Field, ErrorMessage, type FormikHelpers } from "formik";
import { Eye, EyeOff } from "lucide-react";

import { createAdminValidationSchema } from "../utils/validation";
import "./CreateAdminForm.css";

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
  isLoading = false,
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const initialValues: CreateAdminFormData = {
    username: "",
    email: "",
    firstName: "",
    lastName: "",
    role: "admin",
    permissions: [],
    password: "",
    confirmPassword: "",
  };

  const roleOptions = [
    { value: "super_admin", label: "Super Admin" },
    { value: "admin", label: "Admin" },
    { value: "moderator", label: "Moderator" },
  ];

  const handleSubmit = async (
    values: CreateAdminFormData,
    formikHelpers: FormikHelpers<CreateAdminFormData>,
  ) => {
    try {
      await onSubmit(values);
      formikHelpers.resetForm();
    } catch (error) {
      // Error handling is done in the parent component
      console.error("Form submission error:", error);
    }
  };

  const togglePasswordVisibility = () => setShowPassword(!showPassword);
  const toggleConfirmPasswordVisibility = () =>
    setShowConfirmPassword(!showConfirmPassword);

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
                  <label className="form-label" htmlFor="firstName">
                    First Name <span className="required">*</span>
                  </label>
                  <Field
                    className={`form-input ${errors.firstName && touched.firstName ? "error" : ""}`}
                    id="firstName"
                    name="firstName"
                    placeholder="Enter first name"
                    type="text"
                  />
                  <ErrorMessage
                    className="error-message"
                    component="div"
                    name="firstName"
                  />
                </div>

                <div className="form-field">
                  <label className="form-label" htmlFor="lastName">
                    Last Name <span className="required">*</span>
                  </label>
                  <Field
                    className={`form-input ${errors.lastName && touched.lastName ? "error" : ""}`}
                    id="lastName"
                    name="lastName"
                    placeholder="Enter last name"
                    type="text"
                  />
                  <ErrorMessage
                    className="error-message"
                    component="div"
                    name="lastName"
                  />
                </div>
              </div>

              <div className="form-field">
                <label className="form-label" htmlFor="username">
                  Username <span className="required">*</span>
                </label>
                <Field
                  className={`form-input ${errors.username && touched.username ? "error" : ""}`}
                  id="username"
                  name="username"
                  placeholder="Enter username"
                  type="text"
                />
                <ErrorMessage
                  className="error-message"
                  component="div"
                  name="username"
                />
              </div>

              <div className="form-field">
                <label className="form-label" htmlFor="email">
                  Email <span className="required">*</span>
                </label>
                <Field
                  className={`form-input ${errors.email && touched.email ? "error" : ""}`}
                  id="email"
                  name="email"
                  placeholder="Enter email address"
                  type="email"
                />
                <ErrorMessage
                  className="error-message"
                  component="div"
                  name="email"
                />
              </div>
            </div>

            <div className="form-section">
              <h3 className="section-title">Role & Permissions</h3>

              <div className="form-field">
                <label className="form-label" htmlFor="role">
                  Role <span className="required">*</span>
                </label>
                <Field
                  as="select"
                  className={`form-select ${errors.role && touched.role ? "error" : ""}`}
                  id="role"
                  name="role"
                >
                  <option value="">Select a role</option>
                  {roleOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </Field>
                <ErrorMessage
                  className="error-message"
                  component="div"
                  name="role"
                />
              </div>

              <div className="form-field">
                <label className="form-label">
                  Permissions <span className="required">*</span>
                </label>
                <div className="permissions-grid">
                  {availablePermissions.map((permission) => (
                    <label key={permission.id} className="permission-checkbox">
                      <Field
                        className="permission-input"
                        name="permissions"
                        type="checkbox"
                        value={permission.id}
                      />
                      <span className="permission-label">
                        {permission.name}
                      </span>
                    </label>
                  ))}
                </div>
                <ErrorMessage
                  className="error-message"
                  component="div"
                  name="permissions"
                />
              </div>
            </div>

            <div className="form-section">
              <h3 className="section-title">Security</h3>

              <div className="form-field">
                <label className="form-label" htmlFor="password">
                  Password <span className="required">*</span>
                </label>
                <div className="password-input-wrapper">
                  <Field
                    className={`form-input password-input ${errors.password && touched.password ? "error" : ""}`}
                    id="password"
                    name="password"
                    placeholder="Enter password"
                    type={showPassword ? "text" : "password"}
                  />
                  <button
                    aria-label={
                      showPassword ? "Hide password" : "Show password"
                    }
                    className="password-toggle"
                    type="button"
                    onClick={togglePasswordVisibility}
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                <ErrorMessage
                  className="error-message"
                  component="div"
                  name="password"
                />
              </div>

              <div className="form-field">
                <label className="form-label" htmlFor="confirmPassword">
                  Confirm Password <span className="required">*</span>
                </label>
                <div className="password-input-wrapper">
                  <Field
                    className={`form-input password-input ${errors.confirmPassword && touched.confirmPassword ? "error" : ""}`}
                    id="confirmPassword"
                    name="confirmPassword"
                    placeholder="Confirm password"
                    type={showConfirmPassword ? "text" : "password"}
                  />
                  <button
                    aria-label={
                      showConfirmPassword ? "Hide password" : "Show password"
                    }
                    className="password-toggle"
                    type="button"
                    onClick={toggleConfirmPasswordVisibility}
                  >
                    {showConfirmPassword ? (
                      <EyeOff size={16} />
                    ) : (
                      <Eye size={16} />
                    )}
                  </button>
                </div>
                <ErrorMessage
                  className="error-message"
                  component="div"
                  name="confirmPassword"
                />
              </div>
            </div>

            <div className="form-actions">
              <button
                className="btn btn-secondary"
                disabled={isSubmitting || isLoading}
                type="button"
                onClick={onCancel}
              >
                Cancel
              </button>
              <button
                className="btn btn-primary"
                disabled={isSubmitting || isLoading}
                type="submit"
              >
                {isSubmitting || isLoading ? "Creating..." : "Create Admin"}
              </button>
            </div>
          </Form>
        )}
      </Formik>
    </div>
  );
};

export default CreateAdminForm;
