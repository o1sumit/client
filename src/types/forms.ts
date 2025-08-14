// Form-specific data types for the admin panel application

import type {
  UserRole,
  UserStatus,
  AccountType,
  AccountStatus,
  AdminRole,
} from "./entities";

// Application form data interface
export interface ApplicationFormData {
  application_name: string;
  client_secret: string;
  version: string;
  // status: ApplicationStatus;
}

// User form data interface
export interface UserFormData {
  username: string;
  email: string;
  role: UserRole;
  status: UserStatus;
}

// Account form data interface
export interface AccountFormData {
  account_name: string;
  account_email: string;
  // account_description: string;
  account_type: AccountType;
  status: AccountStatus;
}

// Rights form data interface
export interface RightsFormData {
  application_id: string;
  account_id: string;
  rights_code: string;
  expires_on?: string;
}

// Account sharing form data interface
export interface AccountSharingFormData {
  sourceAccountId: string;
  targetAccountId: string;
  invitedBy: string;
  expiresAt?: string;
}

// Login form data interface
export interface LoginFormData {
  email: string;
  password: string;
}

// Registration form data interface
export interface RegisterFormData {
  username: string;
  email: string;
  role?: UserRole;
}

// Change password form data interface
export interface ChangePasswordFormData {
  currentPassword: string;
  newPassword: string;
}

// Form validation error interface
export interface FormValidationError {
  field: string;
  message: string;
}

// Form state interface for managing form UI state
export interface FormState<T> {
  data: T;
  errors: Record<keyof T, string>;
  isSubmitting: boolean;
  isValid: boolean;
  touched: Record<keyof T, boolean>;
}

// Create admin form data interface
export interface CreateAdminFormData {
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  role: AdminRole;
  permissions: string[];
}

// Edit admin form data interface
export interface EditAdminFormData {
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  role: AdminRole;
  permissions: string[];
  status: UserStatus;
}

// Admin filters data interface
export interface AdminFiltersData {
  search: string;
  role: AdminRole | "all";
  status: UserStatus | "all";
}

// Modal form props interface
export interface ModalFormProps<T> {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: T) => Promise<void>;
  initialData?: Partial<T>;
  title: string;
  isEditing?: boolean;
}
