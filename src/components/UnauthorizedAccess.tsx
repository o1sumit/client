import React from "react";
import { Shield, AlertTriangle, Key } from "lucide-react";
import { Link } from "react-router-dom";
import { useDispatch } from "react-redux";
import { AppDispatch } from "@store/index";
import { openInviteModal } from "@store/slices/inviteModalSlice";
import "./UnauthorizedAccess.css";

const UnauthorizedAccess: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();

  const handleOpenInviteModal = () => {
    dispatch(openInviteModal());
  };

  return (
    <div className="unauthorized-access">
      <div className="unauthorized-content">
        <div className="unauthorized-icon">
          <Shield size={64} />
        </div>

        <h1 className="unauthorized-title">Access Denied</h1>

        <div className="unauthorized-message">
          <AlertTriangle size={24} />
          <p>You don't have permission to access this section.</p>
        </div>

        <div className="unauthorized-details">
          <p>
            This section requires administrative privileges. If you have an
            invite code, you can enter it below to gain access.
          </p>
        </div>

        {/* Invite Code Section */}
        <div className="invite-code-section">
          <button
            className="invite-code-toggle-btn"
            type="button"
            onClick={handleOpenInviteModal}
          >
            <Key size={20} />I have an invite code
          </button>
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
