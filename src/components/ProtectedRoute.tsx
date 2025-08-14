import React from "react";
import { useAuth } from "react-oidc-context";
import { Navigate } from "react-router-dom";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  // const { isAuthenticated, loading } = useSelector((state: RootState) => state.auth);
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="loading-spinner">
        <div className="spinner" />
      </div>
    );
  }

  return isAuthenticated ? <>{children}</> : <Navigate to="/login" />;
};

export default ProtectedRoute;
