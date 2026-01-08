import { useState } from "react";
import "../css/initiateSubstitutionModal.css";
import API from "../../../services/api";
import { BreakdownSection, BreakdownToggle } from "./BreakdownSection";

export default function CancellationModal({
  profile_id,
  installments,
  yatra,
  onSuccess,
}) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [showBreakdown, setShowBreakdown] = useState(false);

  // ─────────────────────────────
  // CHECKBOXES CONFIRMATION
  // ─────────────────────────────
  const [confirmations, setConfirmations] = useState({
    permanent: false,
    noReRegister: false,
    refundProcess: false,
  });

  const toggleConfirmation = (key) => {
    setConfirmations((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const confirmationTexts = {
    permanent: "I understand that this action is permanent.",
    noReRegister: "I understand I cannot register again.",
    refundProcess: `I understand the refund will be made after ${new Date(yatra?.payment_refund_date).toLocaleDateString()}.`,
  };

  const isAllConfirmed = Object.values(confirmations).every(Boolean);
  // ─────────────────────────────

  // Calculate total amount paid from verified installments
  const amountPaid = installments
    .filter((i) => i.tag === "verified")
    .reduce((sum, i) => sum + Number(i.amount), 0);

  const netRefund = Number(amountPaid) - Number(yatra.cancellation_fee);

  // ───────────────────────────────────────────────
  // SUBMIT → CANCEL REGISTRATION
  // ───────────────────────────────────────────────
  const handleSubmit = async () => {
    setIsSubmitting(true);
    setError("");

    try {
      await API.delete(`/yatras/${yatra.id}/register/`, {
        data: { profile_id: profile_id },
      });
      // notify parent to refresh and close the modal
      if (onSuccess) onSuccess();
      // optional alert
      window.alert("Registration cancelled successfully.");
    } catch (err) {
      setError(
        err.response?.data?.detail ||
          err.response?.data?.error ||
          "Failed to cancel the registration. Please try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="sub-modal-wrapper">
      {/* Heading */}
      <p className="sub-heading" style={{ marginBottom: "15px" }}>
        Cancel Registration
      </p>

      {/* Error box */}
      {error && <div className="sub-error-box">{error}</div>}

      {/* Warning */}
      <p
        style={{
          fontSize: "13px",
          color: "#b91c1c",
          marginTop: "15px",
          textAlign: "center",
        }}
      >
        Cancellation is <strong>permanent</strong> and cannot be undone.
        <br />
        <strong style={{ fontSize: "15px" }}>
          You will not be allowed to register for the yatra again .
        </strong>
      </p>
      <p
        style={{
          fontSize: "13px",
          color: "#333",
          marginTop: "15px",
          textAlign: "center",
        }}
      >
        Refund Amount :
        <strong style={{ color: "#047857", fontSize: "15px" }}>
          {" "}
          ₹{netRefund}
        </strong>{" "}
        {"  "}
        <BreakdownToggle
          show={showBreakdown}
          onClick={() => setShowBreakdown(!showBreakdown)}
        />
        <br />
        <br />
        Yatra Team will contact you to proceed the refund.
      </p>
      {showBreakdown && (
        <BreakdownSection
          cancellation_fee={yatra.cancellation_fee}
          amount_paid={amountPaid}
        />
      )}
      {/* Confirmation Checkbox */}
      {Object.entries(confirmationTexts).map(([key, label]) => (
        <label
          key={key}
          style={{
            fontSize: "13px",
            display: "flex",
            alignItems: "center",
            marginTop: "15px",
            cursor: "pointer",
          }}
        >
          <input
            type="checkbox"
            checked={confirmations[key]}
            onChange={() => toggleConfirmation(key)}
            style={{ marginRight: "8px" }}
          />
          {label}
        </label>
      ))}

      {/* Button */}
      <div style={{ display: "flex", gap: "10px", marginTop: "25px" }}>
        <button
          className="sub-btn"
          onClick={handleSubmit}
          disabled={!isAllConfirmed || isSubmitting}
        >
          {isSubmitting ? "Cancelling..." : "Confirm Cancellation"}
        </button>
      </div>
    </div>
  );
}
