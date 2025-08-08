// Business entity interfaces for the admin panel application

// Enum types for better type safety
export type ApplicationStatus = 'active' | 'inactive';
export type UserRole = 'admin' | 'user' | 'manager';
export type UserStatus = 'active' | 'inactive';
export type AccountType = 'Temporary' | 'Personal' | 'Business';
export type AccountStatus = 'active' | 'inactive';
export type RightStatus = 'active' | 'inactive' | 'expired';
export type Permission = 'read' | 'write' | 'admin' | 'owner' | 'delete';
export type AdminRole = 'super_admin' | 'admin' | 'moderator';

// Application entity interface
export interface Application {
  id: string;
  name: string;
  applicationId: string;
  description?: string;
  applicationSecret: string;
  status: ApplicationStatus;
  createdAt: string;
  updatedAt: string;
}

// User entity interface
export interface User {
  id: string;
  username: string;
  email: string;
  role: UserRole;
  status: UserStatus;
  accountId: string;
  createdAt: string;
  updatedAt: string;
}

// Account entity interface
export interface Account {
  id: string;
  name: string;
  accountId: string;
  email?: string;
  description?: string;
  accountType: AccountType;
  status: AccountStatus;
  sharedAccounts: string[];
  createdAt: string;
  updatedAt: string;
  users?: User[];
}

// Rights entity interface
export interface Rights {
  id: string;
  applicationId: string;
  applicationName: string;
  accountId: string;
  accountName: string;
  rightsCode: string;
  permissions: Permission[];
  expiresAt?: string;
  status: RightStatus;
  createdAt: string;
  updatedAt: string;
}

// Account sharing entity interface
export interface AccountSharing {
  id: string;
  sourceAccountId: string;
  targetAccountId: string;
  status: 'pending' | 'active' | 'revoked';
  invitedBy: string;
  invitedAt: string;
  expiresAt?: string;
  createdAt: string;
  updatedAt: string;
}

// Auth user interface for authentication responses
export interface AuthUser {
  id: string;
  username: string;
  email: string;
  role: UserRole;
  status: UserStatus;
  accountId: string;
  createdAt: string;
  updatedAt: string;
}

// Admin permission interface
export interface AdminPermission {
  id: string;
  name: string;
  description: string;
  category: string;
}

// Admin user interface for admin management
export interface AdminUser {
  id: string;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  role: AdminRole;
  status: UserStatus;
  permissions: AdminPermission[];
  lastLoginAt?: string;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
}