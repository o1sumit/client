// Business entity interfaces for the admin panel application

// Enum types for better type safety
export type ApplicationStatus = "active" | "inactive";
export type UserRole = "admin" | "user" | "manager";
export type UserStatus = "active" | "inactive";
export type AccountType = "Temporary" | "Personal" | "Business";
export type AccountStatus = "active" | "inactive";
export type RightStatus = "active" | "inactive" | "expired";
export type Permission = "read" | "write" | "admin" | "owner" | "delete";
export type AdminRole = "super_admin" | "admin" | "moderator";

// Application entity interface
export interface Application {
  application_id: string;
  application_name: string;
  client_secret: string;
  version: string;
  // description?: string;
  // applicationSecret: string;
  // status: ApplicationStatus;
  created_on: string;
  updated_on: string;
}

// User entity interface
export interface User {
  id: string;
  username: string;
  email: string;
  role: UserRole;
  status: UserStatus;
  account_id: string;
  createdAt: string;
  updatedAt: string;
}

// Account entity interface
export interface Account {
  account_id: string;
  account_name: string;
  account_type: string;
  status: string;
  created_on: string;
  updated_on: string;
  // users?: User[];
}

// Rights entity interface
export interface Rights {
  rights_id: string;
  application_id: string;
  application_name: string;
  account_id: string;
  account_name: string;
  rights_code: string;
  expires_on?: string;
  // status: RightStatus;
  created_on: string;
  updated_on: string;
}

// Account sharing entity interface
export interface AccountSharing {
  id: string;
  sourceAccountId: string;
  targetAccountId: string;
  status: "pending" | "active" | "revoked";
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
  account_id: string;
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
