import { Navigate } from "react-router-dom";
import { useAuth } from "react-oidc-context";
import type { ReactNode } from "react";

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
  console.log("data", data);

  // If Keycloak is still initializing, show a loading state
  if (isLoading) {
    return <div>Loading...</div>;
  }

  // If not authenticated, redirect to login page
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  // If roles are required, check if the user has at least one of them
  if (requiredRoles.length > 0) {
    return <Navigate to="/unauthorized" replace />;
  }

  if (data?.user?.id_token) {
    localStorage.setItem("token", data.user.id_token);
  }

  return <>{children}</>;
};

export default ProtectedRoute;
