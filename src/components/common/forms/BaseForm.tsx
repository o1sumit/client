import { Formik, Form, type FormikHelpers } from "formik";
import * as yup from "yup";

interface BaseFormProps<T extends Record<string, any>> {
  initialValues: T;
  validationSchema: yup.ObjectSchema<any>;
  onSubmit: (
    values: T,
    formikHelpers: FormikHelpers<T>,
  ) => Promise<void> | void;
  children: React.ReactNode;
  className?: string;
  enableReinitialize?: boolean;
}

export function BaseForm<T extends Record<string, any>>({
  initialValues,
  validationSchema,
  onSubmit,
  children,
  className = "",
  enableReinitialize = false,
}: BaseFormProps<T>) {
  return (
    <Formik
      enableReinitialize={enableReinitialize}
      initialValues={initialValues}
      validationSchema={validationSchema}
      onSubmit={onSubmit}
    >
      {({ isSubmitting }) => (
        <Form className={`space-y-4 ${className}`}>
          {children}
          {/* <div className="flex justify-end space-x-2 pt-4">
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isSubmitting ? 'Submitting...' : 'Submit'}
                        </button>
                    </div> */}
        </Form>
      )}
    </Formik>
  );
}
