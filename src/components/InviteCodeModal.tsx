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
      isLoading={isLoading}
      isOpen={isOpen}
      maxWidth="400px"
      title="Enter Invite Code"
      onClose={handleClose}
    >
      <div className="invite-code-modal-content">
        <p className="invite-code-description">
          You need an invite code to access this application. Please enter your
          invite code below.
        </p>

        <form className="invite-code-form" onSubmit={handleSubmit}>
          <div className="invite-code-field">
            <label className="invite-code-label" htmlFor="inviteCode">
              Invite Code <span className="required">*</span>
            </label>
            <input
              autoFocus
              className={`invite-code-input ${error || serverError ? "error" : ""}`}
              disabled={isLoading}
              id="inviteCode"
              placeholder="Enter your invite code"
              type="text"
              value={inviteCode}
              onChange={handleInputChange}
            />
            {(error || serverError) && (
              <div className="invite-code-error">{error || serverError}</div>
            )}
          </div>

          <div className="invite-code-actions">
            <button
              className="invite-code-btn invite-code-btn-secondary"
              disabled={isLoading}
              type="button"
              onClick={handleClose}
            >
              Cancel
            </button>
            <button
              className="invite-code-btn invite-code-btn-primary"
              disabled={isLoading || !inviteCode.trim()}
              type="submit"
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
