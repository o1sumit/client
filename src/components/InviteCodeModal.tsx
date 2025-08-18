import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { RootState, AppDispatch } from "@store/index";
import {
  closeInviteModal,
  setInviteCode,
  submitInviteCode,
} from "@store/slices/inviteModalSlice";

import AdminModal from "./AdminModal";
import "./InviteCodeModal.css";

const InviteCodeModal: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { isOpen, isLoading, error, inviteCode } = useSelector(
    (state: RootState) => state.inviteModal,
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Basic validation
    if (!inviteCode.trim()) {
      return;
    }

    if (inviteCode.length < 3) {
      return;
    }

    dispatch(submitInviteCode(inviteCode.trim()));
  };

  const handleClose = () => {
    dispatch(closeInviteModal());
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    dispatch(setInviteCode(e.target.value));
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
              className={`invite-code-input ${error ? "error" : ""}`}
              disabled={isLoading}
              id="inviteCode"
              placeholder="Enter your invite code"
              type="text"
              value={inviteCode}
              onChange={handleInputChange}
            />
            {error && <div className="invite-code-error">{error}</div>}
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
