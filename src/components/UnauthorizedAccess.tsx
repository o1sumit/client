import React from "react";
import { Shield, AlertTriangle } from "lucide-react";
import { Link } from "react-router-dom";
import "./UnauthorizedAccess.css";

const UnauthorizedAccess: React.FC = () => {
  return (
    <div className="unauthorized-access">
      <div className="unauthorized-content">
        <div className="unauthorized-icon">
          <Shield size={64} />
        </div>

        <h1 className="unauthorized-title">Access Denied</h1>

        <div className="unauthorized-message">
          <AlertTriangle size={24} />
          <p>
            You don't have permission to access the Admin Management section.
          </p>
        </div>

        <div className="unauthorized-details">
          <p>
            This section requires administrative privileges. Please contact your
            system administrator if you believe you should have access to this
            feature.
          </p>
        </div>

        <div className="unauthorized-actions">
          <Link className="btn btn-primary" to="/">
            Return to Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
};

export default UnauthorizedAccess;
