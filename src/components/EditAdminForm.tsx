import type { EditAdminFormData } from "../types/forms";
import type { AdminUser, AdminRole, AdminPermission } from "../types/entities";

import React from "react";
import { Formik, Form, Field, ErrorMessage, type FormikHelpers } from "formik";

import { editAdminValidationSchema } from "../utils/validation";
import "./EditAdminForm.css";

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
  isLoading = false,
}) => {
  const initialValues: EditAdminFormData = {
    username: admin.username,
    email: admin.email,
    firstName: admin.firstName,
    lastName: admin.lastName,
    role: admin.role,
    permissions: admin.permissions.map((p) => p.id),
    status: admin.status,
  };

  const roleOptions = [
    { value: "super_admin", label: "Super Admin" },
    { value: "admin", label: "Admin" },
    { value: "moderator", label: "Moderator" },
  ];

  const statusOptions = [
    { value: "active", label: "Active" },
    { value: "inactive", label: "Inactive" },
  ];

  const handleSubmit = async (
    values: EditAdminFormData,
    formikHelpers: FormikHelpers<EditAdminFormData>,
  ) => {
    try {
      await onSubmit(values);
      // Don't reset form on edit - keep the current values
    } catch (error) {
      // Error handling is done in the parent component
      console.error("Form submission error:", error);
    }
  };

  return (
    <div className="edit-admin-form">
      <Formik
        enableReinitialize={true}
        initialValues={initialValues}
        validationSchema={editAdminValidationSchema}
        onSubmit={handleSubmit}
      >
        {({ values, isSubmitting, errors, touched, setFieldValue }) => (
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
              <h3 className="section-title">Account Status</h3>

              <div className="form-field">
                <label className="form-label" htmlFor="status">
                  Status <span className="required">*</span>
                </label>
                <Field
                  as="select"
                  className={`form-select ${errors.status && touched.status ? "error" : ""}`}
                  id="status"
                  name="status"
                >
                  <option value="">Select status</option>
                  {statusOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </Field>
                <ErrorMessage
                  className="error-message"
                  component="div"
                  name="status"
                />
              </div>

              <div className="status-info">
                <p className="info-text">
                  <strong>Note:</strong> Password changes should be handled
                  separately through the password reset functionality.
                </p>
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
                {isSubmitting || isLoading ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </Form>
        )}
      </Formik>
    </div>
  );
};

export default EditAdminForm;
