import React from "react";
import { useAuth } from "react-oidc-context";

// Admin management permissions
export const ADMIN_PERMISSIONS = {
  VIEW_ADMIN_MANAGEMENT: "view_admin_management",
  CREATE_ADMIN: "create_admin",
  EDIT_ADMIN: "edit_admin",
  DELETE_ADMIN: "delete_admin",
  TOGGLE_ADMIN_STATUS: "toggle_admin_status",
  MANAGE_ADMIN_PERMISSIONS: "manage_admin_permissions",
  MANAGE_ADMIN_ROLES: "manage_admin_roles",
} as const;

// Role-based permissions mapping
export const ROLE_PERMISSIONS = {
  super_admin: [
    ADMIN_PERMISSIONS.VIEW_ADMIN_MANAGEMENT,
    ADMIN_PERMISSIONS.CREATE_ADMIN,
    ADMIN_PERMISSIONS.EDIT_ADMIN,
    ADMIN_PERMISSIONS.DELETE_ADMIN,
    ADMIN_PERMISSIONS.TOGGLE_ADMIN_STATUS,
    ADMIN_PERMISSIONS.MANAGE_ADMIN_PERMISSIONS,
    ADMIN_PERMISSIONS.MANAGE_ADMIN_ROLES,
  ],
  admin: [
    ADMIN_PERMISSIONS.VIEW_ADMIN_MANAGEMENT,
    ADMIN_PERMISSIONS.CREATE_ADMIN,
    ADMIN_PERMISSIONS.EDIT_ADMIN,
    ADMIN_PERMISSIONS.TOGGLE_ADMIN_STATUS,
  ],
  moderator: [ADMIN_PERMISSIONS.VIEW_ADMIN_MANAGEMENT],
} as const;

// Hook to check user permissions
export const usePermissions = () => {
  const { user } = useAuth();

  const getUserRole = (): string | null => {
    // Collect roles from multiple possible sources (profile, realm_access, resource_access, access token)
    const collectedRoles: string[] = [];

    try {
      const profile = (user?.profile || {}) as any;
      const profileRoles: string[] = Array.isArray(profile.roles)
        ? profile.roles
        : [];
      const realmRoles: string[] = Array.isArray(profile?.realm_access?.roles)
        ? profile.realm_access.roles
        : [];

      collectedRoles.push(...profileRoles, ...realmRoles);

      // Parse roles from access_token (JWT) if available
      if (user?.access_token) {
        const tokenParts = user.access_token.split(".");

        if (tokenParts.length === 3) {
          const payloadJson = atob(
            tokenParts[1].replace(/-/g, "+").replace(/_/g, "/"),
          );
          const payload = JSON.parse(payloadJson);
          const realmAccessRoles: string[] = Array.isArray(
            payload?.realm_access?.roles,
          )
            ? payload.realm_access.roles
            : [];

          collectedRoles.push(...realmAccessRoles);

          // Also check resource_access for the current client
          const clientId = import.meta.env.VITE_KEYCLOAK_CLIENT_ID as
            | string
            | undefined;
          const resourceAccess = payload?.resource_access || {};

          if (clientId && resourceAccess[clientId]?.roles) {
            const clientRoles: string[] = Array.isArray(
              resourceAccess[clientId].roles,
            )
              ? resourceAccess[clientId].roles
              : [];

            collectedRoles.push(...clientRoles);
          }
        }
      }
    } catch {
      // noop - fall through to evaluated roles so far
    }

    // Deduplicate roles
    const roles = Array.from(new Set(collectedRoles));

    // Priority order: super_admin > admin > moderator
    if (roles.includes("super_admin")) return "super_admin";
    if (roles.includes("admin")) return "admin";
    if (roles.includes("moderator")) return "moderator";

    return null;
  };

  const hasPermission = (permission: string): boolean => {
    const userRole = getUserRole();

    if (!userRole) return false;

    const rolePermissions =
      ROLE_PERMISSIONS[userRole as keyof typeof ROLE_PERMISSIONS];

    return rolePermissions?.includes(permission as any) || false;
  };

  const hasAnyPermission = (permissions: string[]): boolean => {
    return permissions.some((permission) => hasPermission(permission));
  };

  const hasAllPermissions = (permissions: string[]): boolean => {
    return permissions.every((permission) => hasPermission(permission));
  };

  const canManageAdmins = (): boolean => {
    return hasPermission(ADMIN_PERMISSIONS.VIEW_ADMIN_MANAGEMENT);
  };

  const canCreateAdmin = (): boolean => {
    return hasPermission(ADMIN_PERMISSIONS.CREATE_ADMIN);
  };

  const canEditAdmin = (): boolean => {
    return hasPermission(ADMIN_PERMISSIONS.EDIT_ADMIN);
  };

  const canDeleteAdmin = (): boolean => {
    return hasPermission(ADMIN_PERMISSIONS.DELETE_ADMIN);
  };

  const canToggleAdminStatus = (): boolean => {
    return hasPermission(ADMIN_PERMISSIONS.TOGGLE_ADMIN_STATUS);
  };

  const canManageAdminPermissions = (): boolean => {
    return hasPermission(ADMIN_PERMISSIONS.MANAGE_ADMIN_PERMISSIONS);
  };

  const canManageAdminRoles = (): boolean => {
    return hasPermission(ADMIN_PERMISSIONS.MANAGE_ADMIN_ROLES);
  };

  return {
    getUserRole,
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    canManageAdmins,
    canCreateAdmin,
    canEditAdmin,
    canDeleteAdmin,
    canToggleAdminStatus,
    canManageAdminPermissions,
    canManageAdminRoles,
    userRole: getUserRole(),
  };
};

// Component wrapper for permission-based rendering
export const withPermission = (
  WrappedComponent: React.ComponentType<any>,
  requiredPermission: string,
  fallback?: React.ReactNode,
) => {
  return (props: any) => {
    const { hasPermission } = usePermissions();

    if (!hasPermission(requiredPermission)) {
      return fallback || null;
    }

    return React.createElement(WrappedComponent, props);
  };
};

// Higher-order component for multiple permissions
export const withPermissions = (
  WrappedComponent: React.ComponentType<any>,
  requiredPermissions: string[],
  requireAll: boolean = true,
  fallback?: React.ReactNode,
) => {
  return (props: any) => {
    const { hasAllPermissions, hasAnyPermission } = usePermissions();

    const hasAccess = requireAll
      ? hasAllPermissions(requiredPermissions)
      : hasAnyPermission(requiredPermissions);

    if (!hasAccess) {
      return fallback || null;
    }

    return React.createElement(WrappedComponent, props);
  };
};
