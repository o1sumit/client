// Form-specific data types for the admin panel application

import type {
  ApplicationStatus,
  UserRole,
  UserStatus,
  AccountType,
  AccountStatus,
  Permission
} from './entities';

// Application form data interface
export interface ApplicationFormData {
  name: string;
  applicationId: string;
  description?: string;
  status: ApplicationStatus;
}

// User form data interface
export interface UserFormData {
  username: string;
  email: string;
  password: string;
  role: UserRole;
  status: UserStatus;
}

// Account form data interface
export interface AccountFormData {
  name: string;
  accountId: string;
  email?: string;
  description?: string;
  accountType: AccountType;
  status: AccountStatus;
}

// Rights form data interface
export interface RightsFormData {
  applicationId: string;
  accountId: string;
  permissions: Permission[];
  expiresAt?: string;
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
  password: string;
  confirmPassword: string;
  role?: UserRole;
}

// Change password form data interface
export interface ChangePasswordFormData {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
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

// Modal form props interface
export interface ModalFormProps<T> {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: T) => Promise<void>;
  initialData?: Partial<T>;
  title: string;
  isEditing?: boolean;
}