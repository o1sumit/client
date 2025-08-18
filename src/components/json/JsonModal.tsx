import React from "react";
import JsonViewer from "./JsonViewer";

export interface JsonModalProps {
  isOpen: boolean;
  title?: string;
  json: unknown;
  onClose: () => void;
  onCopy?: () => void;
}

const JsonModal: React.FC<JsonModalProps> = ({ isOpen, title = "JSON", json, onClose, onCopy }) => {
  if (!isOpen) return null;
  return (
    <div className="modal-overlay">
      <div className="modal" style={{ maxWidth: 720 }}>
        <div className="modal-header">
          <h2>{title}</h2>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>
        <div className="modal-body">
          <JsonViewer json={json} />
        </div>
        <div className="modal-footer">
          <button className="cancel-btn" onClick={onClose}>Close</button>
          <button className="save-btn" onClick={onCopy}>Copy</button>
        </div>
      </div>
    </div>
  );
};

export default JsonModal;


