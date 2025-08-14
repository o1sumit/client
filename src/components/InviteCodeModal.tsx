import React, { useState } from "react";
import AdminModal from "./AdminModal";
import "./InviteCodeModal.css";

interface InviteCodeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (inviteCode: string) => void;
  isLoading?: boolean;
  serverError?: string;
  onClearServerError?: () => void;
}

const InviteCodeModal: React.FC<InviteCodeModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  isLoading = false,
  serverError,
  onClearServerError,
}) => {
  const [inviteCode, setInviteCode] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Basic validation
    if (!inviteCode.trim()) {
      setError("Invite code is required");
      return;
    }
    
    if (inviteCode.length < 3) {
      setError("Invite code must be at least 3 characters long");
      return;
    }
    
    // Clear error and submit
    setError("");
    onSubmit(inviteCode.trim());
  };

  const handleClose = () => {
    setInviteCode("");
    setError("");
    onClose();
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInviteCode(e.target.value);
    if (error) setError(""); // Clear client-side error when user starts typing
    if (serverError && onClearServerError) onClearServerError(); // Clear server error when user starts typing
  };

  return (
    <AdminModal
      isOpen={isOpen}
      onClose={handleClose}
      title="Enter Invite Code"
      maxWidth="400px"
      isLoading={isLoading}
    >
      <div className="invite-code-modal-content">
        <p className="invite-code-description">
          You need an invite code to access this application. Please enter your
          invite code below.
        </p>
        
        <form onSubmit={handleSubmit} className="invite-code-form">
          <div className="invite-code-field">
            <label htmlFor="inviteCode" className="invite-code-label">
              Invite Code <span className="required">*</span>
            </label>
            <input
              id="inviteCode"
              type="text"
              value={inviteCode}
              onChange={handleInputChange}
              placeholder="Enter your invite code"
              className={`invite-code-input ${(error || serverError) ? "error" : ""}`}
              disabled={isLoading}
              autoFocus
            />
            {(error || serverError) && (
              <div className="invite-code-error">{error || serverError}</div>
            )}
          </div>
          
          <div className="invite-code-actions">
            <button
              type="button"
              onClick={handleClose}
              className="invite-code-btn invite-code-btn-secondary"
              disabled={isLoading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="invite-code-btn invite-code-btn-primary"
              disabled={isLoading || !inviteCode.trim()}
            >
              {isLoading ? "Submitting..." : "Submit"}
            </button>
          </div>
        </form>
      </div>
    </AdminModal>
  );
};

export default InviteCodeModal;
