import React from "react";
import { Navigate } from "react-router-dom";

import { usePermissions } from "../utils/permissions";

interface PermissionRouteProps {
  children: React.ReactNode;
  requiredPermission?: string;
  requiredPermissions?: string[];
  requireAll?: boolean;
  fallbackPath?: string;
  fallbackComponent?: React.ReactNode;
}

const PermissionRoute: React.FC<PermissionRouteProps> = ({
  children,
  requiredPermission,
  requiredPermissions,
  requireAll = true,
  fallbackPath = "/",
  fallbackComponent,
}) => {
  const { hasPermission, hasAllPermissions, hasAnyPermission } =
    usePermissions();

  // Check if user has required permission(s)
  const hasAccess = () => {
    if (requiredPermission) {
      return hasPermission(requiredPermission);
    }

    if (requiredPermissions && requiredPermissions.length > 0) {
      return requireAll
        ? hasAllPermissions(requiredPermissions)
        : hasAnyPermission(requiredPermissions);
    }

    // Default to true if no permissions specified
    return true;
  };

  if (!hasAccess()) {
    if (fallbackComponent) {
      return <>{fallbackComponent}</>;
    }

    return <Navigate replace to={fallbackPath} />;
  }

  return <>{children}</>;
};

export default PermissionRoute;
