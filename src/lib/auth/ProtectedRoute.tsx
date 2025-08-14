import type { ReactNode } from "react";

import { Navigate } from "react-router-dom";
import { useAuth } from "react-oidc-context";
import { useAppSelector } from "@store/index";

interface ProtectedRouteProps {
  children: ReactNode;
  requiredRoles?: string[];
}

export const ProtectedRoute = ({
  children,
  requiredRoles = [],
}: ProtectedRouteProps) => {
  const { isAuthenticated, isLoading } = useAuth();
  const data = useAuth();

  // Get user data from Redux store
  const { user } = useAppSelector((state) => state.auth);

  // Check if user has admin role in Redux state
  // Only allow access if user has admin role (includes admin, sub_admin, super_admin)
  const allowedAdminRoles = ["admin", "sub_admin", "super_admin"];
  const hasAdminRole = user?.role && allowedAdminRoles.includes(user.role);

  console.log("data", data);
  console.log("Redux user:", user);

  // If Keycloak is still initializing, show a loading state
  if (isLoading) {
    return <div>Loading...</div>;
  }

  // If not authenticated, redirect to login page
  if (!isAuthenticated || !hasAdminRole) {
    return <Navigate replace to="/login" />;
  }

  if (!hasAdminRole) {
    return <Navigate replace to="/unauthorized" />;
  }

  if (data?.user?.id_token) {
    localStorage.setItem("token", data.user.id_token);
  }

  return <>{children}</>;
};

export default ProtectedRoute;
