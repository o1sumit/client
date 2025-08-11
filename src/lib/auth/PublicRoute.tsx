import React from "react";
import { useAuth } from "react-oidc-context";
import { Navigate } from "react-router-dom";

interface PublicRouteProps {
  children: React.ReactNode;
}

const PublicRoute: React.FC<PublicRouteProps> = ({ children }) => {
  // const { isAuthenticated, loading, user } = useSelector((state: RootState) => state.auth);
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="loading-spinner">
        <div className="spinner"></div>
      </div>
    );
  }

  return !isAuthenticated ? <>{children}</> : <Navigate to="/" />;
};

export default PublicRoute;
