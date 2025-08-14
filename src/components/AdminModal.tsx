import React, { useEffect } from "react";
import "./AdminModal.css";

interface AdminModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  isLoading?: boolean;
  maxWidth?: string;
}

const AdminModal: React.FC<AdminModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  isLoading = false,
  maxWidth = "500px",
}) => {
  // Handle escape key to close modal
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape" && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
      // Prevent body scroll when modal is open
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "unset";
    };
  }, [isOpen, onClose]);

  // Handle overlay click to close modal
  const handleOverlayClick = (event: React.MouseEvent) => {
    if (event.target === event.currentTarget) {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="admin-modal-overlay" onClick={handleOverlayClick}>
      <div
        className="admin-modal"
        style={{ maxWidth }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="admin-modal-header">
          <h2>{title}</h2>
          <button
            aria-label="Close modal"
            className="admin-modal-close-btn"
            onClick={onClose}
          >
            ×
          </button>
        </div>

        <div className="admin-modal-body">
          {isLoading ? (
            <div className="admin-modal-loading">
              <div className="admin-modal-spinner" />
              <p>Loading...</p>
            </div>
          ) : (
            children
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminModal;
