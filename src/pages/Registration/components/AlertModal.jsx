// src/pages/components/AlertModal.jsx
const AlertModal = ({ show, message, onClose }) => {
  if (!show) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <h3>Action Required</h3>
        <p>{message}</p>
        <button onClick={onClose} className="btn-close">
          Close
        </button>
      </div>
    </div>
  );
};

export default AlertModal;