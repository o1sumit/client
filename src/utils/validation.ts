import * as yup from 'yup';
// Import types are used in JSDoc comments and type annotations

// Application validation schema
export const applicationValidationSchema = yup.object({
  name: yup
    .string()
    .required('Application name is required')
    .min(2, 'Application name must be at least 2 characters')
    .max(100, 'Application name must not exceed 100 characters'),
  applicationId: yup
    .string()
    .required('Application ID is required')
    .min(2, 'Application ID must be at least 2 characters')
    .max(50, 'Application ID must not exceed 50 characters')
    .matches(/^[a-zA-Z0-9_-]+$/, 'Application ID can only contain letters, numbers, hyphens, and underscores'),
  description: yup
    .string()
    .optional()
    .max(500, 'Description must not exceed 500 characters'),
  status: yup
    .string()
    .oneOf(['active', 'inactive'], 'Status must be either active or inactive')
    .required('Status is required'),
});

// User validation schema
export const userValidationSchema = yup.object({
  username: yup
    .string()
    .required('Username is required')
    .min(3, 'Username must be at least 3 characters')
    .max(50, 'Username must not exceed 50 characters')
    .matches(/^[a-zA-Z0-9_]+$/, 'Username can only contain letters, numbers, and underscores'),
  email: yup
    .string()
    .email('Please enter a valid email address')
    .required('Email is required')
    .max(255, 'Email must not exceed 255 characters'),
  password: yup
    .string()
    .required('Password is required')
    .min(8, 'Password must be at least 8 characters')
    .max(128, 'Password must not exceed 128 characters')
    .matches(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      'Password must contain at least one lowercase letter, one uppercase letter, and one number'
    ),
  role: yup
    .string()
    .oneOf(['admin', 'user', 'manager'], 'Role must be admin, user, or manager')
    .required('Role is required'),
  status: yup
    .string()
    .oneOf(['active', 'inactive'], 'Status must be either active or inactive')
    .required('Status is required'),
});

// Account validation schema
export const accountValidationSchema = yup.object({
  name: yup
    .string()
    .required('Account name is required')
    .min(2, 'Account name must be at least 2 characters')
    .max(100, 'Account name must not exceed 100 characters'),
  accountId: yup
    .string()
    .required('Account ID is required')
    .min(2, 'Account ID must be at least 2 characters')
    .max(50, 'Account ID must not exceed 50 characters')
    .matches(/^[a-zA-Z0-9_-]+$/, 'Account ID can only contain letters, numbers, hyphens, and underscores'),
  email: yup
    .string()
    .optional()
    .email('Please enter a valid email address')
    .max(255, 'Email must not exceed 255 characters'),
  description: yup
    .string()
    .optional()
    .max(500, 'Description must not exceed 500 characters'),
  accountType: yup
    .string()
    .oneOf(['Temporary', 'Personal', 'Business'], 'Account type must be Temporary, Personal, or Business')
    .required('Account type is required'),
  status: yup
    .string()
    .oneOf(['active', 'inactive'], 'Status must be either active or inactive')
    .required('Status is required'),
});

// Rights validation schema
export const rightsValidationSchema = yup.object({
  applicationId: yup
    .string()
    .required('Application is required'),
  accountId: yup
    .string()
    .required('Account is required'),
  permissions: yup
    .array()
    .of(yup.string().oneOf(['read', 'write', 'admin', 'owner', 'delete']).required())
    .min(1, 'At least one permission must be selected')
    .required('Permissions are required'),
  expiresAt: yup
    .string()
    .optional()
    .test('future-date', 'Expiration date must be in the future', function(value) {
      if (!value) return true; // Allow empty/null values
      const expirationDate = new Date(value);
      const now = new Date();
      return expirationDate > now;
    }),
});

// Account sharing validation schema
export const accountSharingValidationSchema = yup.object({
  sourceAccountId: yup
    .string()
    .required('Source account is required'),
  targetAccountId: yup
    .string()
    .required('Target account is required')
    .test('different-accounts', 'Target account must be different from source account', function(value) {
      return value !== this.parent.sourceAccountId;
    }),
  invitedBy: yup
    .string()
    .required('Invited by is required'),
  expiresAt: yup
    .string()
    .optional()
    .test('future-date', 'Expiration date must be in the future', function(value) {
      if (!value) return true; // Allow empty/null values
      const expirationDate = new Date(value);
      const now = new Date();
      return expirationDate > now;
    }),
});

// Login validation schema
export const loginValidationSchema = yup.object({
  email: yup
    .string()
    .email('Please enter a valid email address')
    .required('Email is required'),
  password: yup
    .string()
    .required('Password is required'),
});

// Registration validation schema
export const registerValidationSchema = yup.object({
  username: yup
    .string()
    .required('Username is required')
    .min(3, 'Username must be at least 3 characters')
    .max(50, 'Username must not exceed 50 characters')
    .matches(/^[a-zA-Z0-9_]+$/, 'Username can only contain letters, numbers, and underscores'),
  email: yup
    .string()
    .email('Please enter a valid email address')
    .required('Email is required')
    .max(255, 'Email must not exceed 255 characters'),
  password: yup
    .string()
    .required('Password is required')
    .min(8, 'Password must be at least 8 characters')
    .max(128, 'Password must not exceed 128 characters')
    .matches(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      'Password must contain at least one lowercase letter, one uppercase letter, and one number'
    ),
  confirmPassword: yup
    .string()
    .required('Please confirm your password')
    .oneOf([yup.ref('password')], 'Passwords must match'),
  role: yup
    .string()
    .oneOf(['admin', 'user', 'manager'])
    .optional(),
});

// Change password validation schema
export const changePasswordValidationSchema = yup.object({
  currentPassword: yup
    .string()
    .required('Current password is required'),
  newPassword: yup
    .string()
    .required('New password is required')
    .min(8, 'Password must be at least 8 characters')
    .max(128, 'Password must not exceed 128 characters')
    .matches(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      'Password must contain at least one lowercase letter, one uppercase letter, and one number'
    )
    .test('different-password', 'New password must be different from current password', function(value) {
      return value !== this.parent.currentPassword;
    }),
  confirmPassword: yup
    .string()
    .required('Please confirm your new password')
    .oneOf([yup.ref('newPassword')], 'Passwords must match'),
});

// Helper function to get validation schema by entity type
export const getValidationSchema = (entityType: string) => {
  switch (entityType) {
    case 'application':
      return applicationValidationSchema;
    case 'user':
      return userValidationSchema;
    case 'account':
      return accountValidationSchema;
    case 'rights':
      return rightsValidationSchema;
    case 'accountSharing':
      return accountSharingValidationSchema;
    case 'login':
      return loginValidationSchema;
    case 'register':
      return registerValidationSchema;
    case 'changePassword':
      return changePasswordValidationSchema;
    default:
      throw new Error(`Unknown entity type: ${entityType}`);
  }
};