import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { UserCog, AlertTriangle, CheckCircle, XCircle } from "lucide-react";
import type { AppDispatch } from "../store";
import { toggleAdminStatus } from "../store/slices/adminManagementSlice";
import type { AdminUser, UserStatus } from "../types/entities";
import "./AdminStatusToggle.css";

interface AdminStatusToggleProps {
  admin: AdminUser;
  onToggle?: (admin: AdminUser, newStatus: UserStatus) => void;
  className?: string;
}

const AdminStatusToggle: React.FC<AdminStatusToggleProps> = ({
  admin,
  onToggle,
  className = "",
}) => {
  const dispatch = useDispatch<AppDispatch>();
  const [isConfirming, setIsConfirming] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);

  const isActive = admin.status === "active";
  const newStatus: UserStatus = isActive ? "inactive" : "active";
  const actionText = isActive ? "Deactivate" : "Activate";

  // Handle toggle click
  const handleToggleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowConfirmation(true);
  };

  // Handle confirmation
  const handleConfirm = async () => {
    setIsLoading(true);
    setShowConfirmation(false);

    try {
      // Optimistic update - update UI immediately
      const optimisticAdmin = { ...admin, status: newStatus };
      onToggle?.(optimisticAdmin, newStatus);

      // Call API to update status
      await dispatch(toggleAdminStatus(admin.id)).unwrap();

      // Success feedback
      showSuccessMessage(`${admin.firstName} ${admin.lastName} has been ${newStatus === 'active' ? 'activated' : 'deactivated'}`);
    } catch (error) {
      // Rollback optimistic update on failure
      const rollbackAdmin = { ...admin, status: admin.status };
      onToggle?.(rollbackAdmin, admin.status);

      // Error feedback
      const errorMessage = error instanceof Error ? error.message : 'Failed to update admin status';
      showErrorMessage(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle cancel
  const handleCancel = () => {
    setShowConfirmation(false);
  };

  // Show success message
  const showSuccessMessage = (message: string) => {
    // Create a temporary success notification
    const notification = document.createElement("div");
    notification.className = "status-toggle-notification success";
    notification.innerHTML = `
      <div class="notification-content">
        <CheckCircle size={16} />
        <span>${message}</span>
      </div>
    `;
    document.body.appendChild(notification);

    // Remove after 3 seconds
    setTimeout(() => {
      if (notification.parentNode) {
        notification.parentNode.removeChild(notification);
      }
    }, 3000);
  };

  // Show error message
  const showErrorMessage = (message: string) => {
    // Create a temporary error notification
    const notification = document.createElement("div");
    notification.className = "status-toggle-notification error";
    notification.innerHTML = `
      <div class="notification-content">
        <XCircle size={16} />
        <span>${message}</span>
      </div>
    `;
    document.body.appendChild(notification);

    // Remove after 5 seconds
    setTimeout(() => {
      if (notification.parentNode) {
        notification.parentNode.removeChild(notification);
      }
    }, 5000);
  };

  return (
    <>
      <button
        className={`status-toggle-btn ${isActive ? 'active' : 'inactive'} ${className}`}
        onClick={handleToggleClick}
        disabled={isLoading}
        title={`${actionText} ${admin.firstName} ${admin.lastName}`}
        aria-label={`${actionText} admin user`}
      >
        <UserCog size={12} />
        {isLoading && <div className="loading-spinner" />}
      </button>

      {/* Confirmation Dialog */}
      {showConfirmation && (
        <div className="confirmation-overlay" onClick={handleCancel}>
          <div className="confirmation-dialog" onClick={(e) => e.stopPropagation()}>
            <div className="confirmation-header">
              <AlertTriangle size={20} className="warning-icon" />
              <h3>Confirm Status Change</h3>
            </div>
            
            <div className="confirmation-content">
              <p>
                Are you sure you want to {actionText.toLowerCase()} <strong>{admin.firstName} {admin.lastName}</strong>?
              </p>
              <p className="confirmation-details">
                This will change their status from <span className={`status-badge status-${admin.status}`}>{admin.status.toUpperCase()}</span> to <span className={`status-badge status-${newStatus}`}>{newStatus.toUpperCase()}</span>.
              </p>
              {admin.status === 'active' && (
                <div className="warning-message">
                  <AlertTriangle size={14} />
                  <span>Deactivating an admin will prevent them from accessing the system.</span>
                </div>
              )}
            </div>

            <div className="confirmation-actions">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={handleCancel}
                disabled={isLoading}
              >
                Cancel
              </button>
              <button
                type="button"
                className={`btn ${isActive ? 'btn-danger' : 'btn-primary'}`}
                onClick={handleConfirm}
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <div className="loading-spinner small" />
                    {actionText}ing...
                  </>
                ) : (
                  actionText
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default AdminStatusToggle;
