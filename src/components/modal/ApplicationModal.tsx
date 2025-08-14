import { memo, useMemo, useEffect } from "react";
import { useFormik } from "formik";

import { ApplicationModalProps } from "@/types/application.type";
import { ApplicationFormData } from "@/types/forms";
import { applicationValidationSchema } from "@/utils";

const ApplicationModal = ({
  isOpen,
  onClose,
  editingApp,
  onSubmit,
  isSubmitting,
}: ApplicationModalProps) => {
  const initialValues: ApplicationFormData = useMemo(
    () => ({
      application_name: editingApp?.application_name || "",
      client_secret: editingApp?.client_secret || "",
      version: editingApp?.version || "1.0.0",
    }),
    [editingApp],
  );

  const formik = useFormik({
    initialValues,
    validationSchema: applicationValidationSchema,
    enableReinitialize: true,
    onSubmit: async (values: ApplicationFormData) => {
      await onSubmit(values);
    },
  });

  // Reset form when modal closes
  useEffect(() => {
    if (!isOpen) {
      formik.resetForm();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  console.log(formik.errors);

  return (
    <div className="modal-overlay">
      <div className="modal">
        <div className="modal-header">
          <h2>{editingApp ? "Edit Application" : "Add New Application"}</h2>
        </div>
        <div className="modal-body">
          <form onSubmit={formik.handleSubmit}>
            <div className="form-group">
              <div className="form-field">
                <label
                  className="block text-sm font-medium text-gray-700 mb-1"
                  htmlFor="application_name"
                >
                  Application Name
                  <span className="text-red-500-sm">*</span>
                </label>
                <input
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
                  disabled={isSubmitting}
                  id="application_name"
                  name="application_name"
                  placeholder="Enter application name"
                  type="text"
                  value={formik.values.application_name}
                  onBlur={formik.handleBlur}
                  onChange={formik.handleChange}
                />
                {formik.touched.application_name &&
                  formik.errors.application_name && (
                    <div className="text-red-500">
                      {formik.errors.application_name}
                    </div>
                  )}
              </div>
            </div>

            <div className="form-group">
              <div className="form-field">
                <label
                  className="block text-sm font-medium text-gray-700 mb-1"
                  htmlFor="version"
                >
                  Version
                  <span className="text-red-500-sm">*</span>
                </label>
                <input
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
                  disabled={isSubmitting}
                  id="version"
                  name="version"
                  placeholder="e.g., 1.0.0"
                  type="text"
                  value={formik.values.version}
                  onBlur={formik.handleBlur}
                  onChange={formik.handleChange}
                />
                {formik.touched.version && formik.errors.version && (
                  <div className="text-red-500">{formik.errors.version}</div>
                )}
              </div>
            </div>

            <div className="form-group">
              <div className="form-field">
                <label
                  className="block text-sm font-medium text-gray-700 mb-1"
                  htmlFor="client_secret"
                >
                  Client Secret
                  <span className="text-red-500-sm">*</span>
                </label>
                <input
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
                  disabled={isSubmitting}
                  id="client_secret"
                  name="client_secret"
                  placeholder="Enter client secret"
                  type="text"
                  value={formik.values.client_secret}
                  onBlur={formik.handleBlur}
                  onChange={formik.handleChange}
                />
                {formik.touched.client_secret &&
                  formik.errors.client_secret && (
                    <div className="text-red-500">
                      {formik.errors.client_secret}
                    </div>
                  )}
              </div>
            </div>

            <div className="modal-footer-application">
              <button
                className="cancel-btn"
                disabled={isSubmitting}
                type="button"
                onClick={onClose}
              >
                Cancel
              </button>
              <button
                className="save-btn"
                disabled={isSubmitting || !formik.isValid}
                type="submit"
                onClick={() => formik.handleSubmit()}
              >
                {isSubmitting ? "Processing..." : editingApp ? "Update" : "Add"}{" "}
                Application
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default memo(ApplicationModal);
