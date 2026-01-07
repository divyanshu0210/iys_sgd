import { useState } from "react";
import { useYatraRegistration } from "../context/YatraRegistrationContext";
import "../css/initiateSubstitutionModal.css";
import { BreakdownSection, BreakdownToggle } from "./BreakdownSection";

const ErrorBox = ({ message }) =>
  message ? <div className="sub-error-box">{message}</div> : null;

export default function SubstitutionRequestModal({
  request,
  code,
  setCode,
  onSubmit,
  onCancelRequest,
  error,
  isSubmitting = false,
  isApproved,
  isRegistered,
  timeLeft,
}) {
  const { yatra } = useYatraRegistration();
  const [showBreakdown, setShowBreakdown] = useState(false);
  const [checkboxes, setCheckboxes] = useState({
    c1: false,
    c2: false,
    c3: false,
  });
  const allChecked = checkboxes.c1 && checkboxes.c2 && checkboxes.c3;
  return (
    <div className="sub-modal-wrapper">
      <p className="sub-heading" style={{ marginBottom: "15px" }}>
        Substitution Request
      </p>

      {/* Show error immediately if present */}
      {error && <ErrorBox message={error} />}

      {/* Case 1: Not approved */}
      {!isApproved && (
        <>
          <p
            className="sub-desc"
            style={{ fontSize: "13px", color: "#dc2626" }}
          >
            You are not approved for this Yatra.
          </p>
        </>
      )}

      {/* Case 2: Already registered */}
      {isRegistered && (
        <>
          <p
            className="sub-desc"
            style={{ fontSize: "13px", color: "#16a34a" }}
          >
            Substitution is not available because you have had already
            registered for this Yatra.
          </p>
        </>
      )}

      {/* Case 3: Approved + Not registered → show code input */}
      {isApproved && !isRegistered && (
        <div style={{ textAlign: "center" }}>
          <p
            className="sub-desc"
            style={{ fontSize: "13px", marginBottom: "15px" }}
          >
            Enter the <strong>2-digit verification code</strong> given by the
            initiator.
          </p>

          <input
            className="sub-input"
            placeholder="Enter Code"
            value={code}
            onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
            maxLength={2}
            type="text"
            inputMode="numeric"
            style={{ maxWidth: "98%" }}
          />

          {timeLeft && (
            <p
              style={{
                textAlign: "center",
                fontSize: "13px",
                // marginTop: "10px",
                color: timeLeft === "Expired" ? "#dc2626" : "#2563eb",
                fontWeight: 600,
              }}
            >
              {timeLeft === "Expired"
                ? "Request Expired"
                : `Expires in: ${timeLeft}`}
            </p>
          )}
          <br />

          <p style={{ textAlign: "left", fontSize: "13px" }}>
            After Substitution, you need to :
          </p>
          <p
            style={{
              fontSize: "13px",
              color: "#333",
              marginTop: "15px",
              textAlign: "center",
            }}
          >
            1) Transfer
            <strong style={{ color: "#047857", fontSize: "15px" }}>
              {" "}
              ₹{Number(request.amount_paid) - Number(yatra.cancellation_fee)}
            </strong>{" "}
            to the other devotee.{"  "}
            <BreakdownToggle
              show={showBreakdown}
              onClick={() => setShowBreakdown(!showBreakdown)}
            />
          </p>
          {showBreakdown && (
            <BreakdownSection
              amount_paid={request.amount_paid}
              cancellation_fee={yatra.cancellation_fee}
            />
          )}
          <br />
          <p className="sub-fee-note">
            {/* Yatra Substitution fee <strong>₹{yatra.substitution_fee}</strong>.arriving devotee(s) has to */}
           <p style={{textAlign :"justify",color: "#333",}}>2) At registration desk,  pay</p>  ₹
            {yatra.substitution_fee}(Substitution Charges) <br />+ ₹
            {yatra.cancellation_fee}(Cancellation Charges) =
            <strong>
              ₹{Number(yatra.substitution_fee) + Number(yatra.cancellation_fee)}
            </strong>{" "}
          </p>

          <p className="sub-fee-note">
            Substitution is{" "}
            <strong style={{ color: "#b91c1c" }}>permanent</strong> & cannot be
            reversed.
          </p>

          {/* --- CHECKBOXES --- */}
          <div style={{ textAlign: "left", marginTop: "20px" }}>
            <label style={{ fontSize: "11px", display: "flex", gap: "8px" }}>
              <input
                type="checkbox"
                checked={checkboxes.c1}
                onChange={() =>
                  setCheckboxes({ ...checkboxes, c1: !checkboxes.c1 })
                }
              />
              I will transfer the required amount to the other devotee.
            </label>

            <label
              style={{
                fontSize: "11px",
                display: "flex",
                gap: "8px",
                marginTop: "8px",
              }}
            >
              <input
                type="checkbox"
                checked={checkboxes.c2}
                onChange={() =>
                  setCheckboxes({ ...checkboxes, c2: !checkboxes.c2 })
                }
              />
              I understand & will pay the substitution & cancellation charges at
              registration desk.
            </label>

            <label
              style={{
                fontSize: "11px",
                display: "flex",
                gap: "8px",
                marginTop: "8px",
              }}
            >
              <input
                type="checkbox"
                checked={checkboxes.c3}
                onChange={() =>
                  setCheckboxes({ ...checkboxes, c3: !checkboxes.c3 })
                }
              />
              I understand that substitution is permanent & irreversible under
              any circumstances.
            </label>
          </div>

          <div style={{ display: "flex", gap: "10px", marginTop: "20px" }}>
            <button
              className="sub-btn secondary"
              onClick={onCancelRequest}
              disabled={isSubmitting}
            >
              Reject
            </button>
            <button
              className="sub-btn"
              onClick={onSubmit}
              disabled={
                isSubmitting ||
                code.length !== 2 ||
                !allChecked ||
                timeLeft === "Expired"
              }
            >
              {isSubmitting ? "Confirming..." : "Confirm & Accept"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
