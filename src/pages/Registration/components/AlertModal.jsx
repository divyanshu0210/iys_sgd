// src/pages/components/AlertModal.jsx
const AlertModal = ({ show, message, onClose, title = "Action Required" }) => {
  if (!show) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <h3>{title}</h3>
        <p style={{ whiteSpace: "pre-line" }}>{message}</p>
        <button onClick={onClose} className="btn-close">
          Close
        </button>
      </div>
    </div>
  );
};

export default AlertModal;
