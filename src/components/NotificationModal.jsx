import React from 'react';
import { Info, X, ShieldAlert } from 'lucide-react';

/**
 * Modal dialog with cyber-tactical styling for notifications and confirmations.
 */
export default function NotificationModal({
  isOpen,
  onClose,
  title = 'System Notice',
  message,
  actionLabel = 'Acknowledge',
  onAction,
  type = 'info',
}) {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-dialog" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className={`modal-icon ${type}`}>
            {type === 'alert' ? <ShieldAlert size={20} /> : <Info size={20} />}
          </div>
          <div style={{ flex: 1 }}>
            <h3 className="modal-title">{title}</h3>
            <span className="modal-subtitle">AEGIS // TACTICAL ADVISORY</span>
          </div>
          <button
            onClick={onClose}
            className="modal-close-btn"
            title="Close dialog"
          >
            <X size={18} />
          </button>
        </div>

        <div className="modal-body">
          {message}
        </div>

        <div className="modal-footer">
          <button type="button" className="btn btn-outline" onClick={onClose}>
            Dismiss
          </button>
          <button
            type="button"
            className="btn btn-primary"
            onClick={() => {
              if (onAction) onAction();
              onClose();
            }}
          >
            {actionLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
