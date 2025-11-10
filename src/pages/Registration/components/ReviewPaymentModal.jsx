// src/components/ReviewPaymentModal.jsx
import InstallmentBadge from "./InstallmentBadge";

export default function ReviewPaymentModal({ registrations, onConfirm, onClose }) {
  const total = registrations.reduce((sum, r) => sum + r.amount, 0);

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal review-modal" onClick={(e) => e.stopPropagation()}>
        <h3>Review Details & Pay</h3>
        <div className="review-list">
          {registrations.map((reg) => (
            <div key={reg.profile_id} className="review-item">
         
                <strong>{reg.full_name}</strong>
                {/* <InstallmentBadge installment={reg.installment} /> */}
              <span className="amount">₹{reg.amount}</span>
           
            </div>
          ))}
        </div>
        <div className="total">
          <strong>Total: ₹{total}</strong>
        </div>
        <div className="form-actions">
          <button onClick={onConfirm} className="btn-pay">
            Confirm & Pay
          </button>
          <button onClick={onClose} className="btn-cancel">
            Back
          </button>
        </div>
      </div>
    </div>
  );
}