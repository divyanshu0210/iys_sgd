import React, { useState, useEffect } from "react";
import API from "../../../services/api";
import FullPageLoader from "../../../components/FullPageLoader";
import "../css/initiateSubstitutionModal.css";
import useCountdown from "./useCountdown";
import { BreakdownSection, BreakdownToggle } from "./BreakdownSection";
/* ------------------ SMALL COMPONENTS ------------------ */
const calculateTimeLeft = (expiresAt) => {};
const ErrorBox = ({ message }) =>
  message ? <div className="sub-error-box">{message}</div> : null;

const ExistingNotice = () => (
  <div className="sub-existing-notice">
    You already have a substitution request.
  </div>
);

/* ------------------ COMPLETED VIEW ------------------ */

const CompletedView = ({
  response,
  yatra,
  isExisting,
  error,
  showBreakdown,
  setShowBreakdown,
  timeLeft,
}) => (
  <div style={{ textAlign: "center", marginTop: "10px" }}>
    <p className="sub-heading">Substitution Request Created</p>

    {isExisting && <ExistingNotice />}
    <ErrorBox message={error} />

    <p className="sub-desc">
      Share this verification code with the target member:
    </p>

    <div className="sub-code-box">{response.two_digit_code}</div>

    <p style={{ fontSize: "12px", color: "#666" }}>
      The other member must <strong>confirm</strong> this code.
    </p>

    {timeLeft && (
      <p
        style={{
          fontSize: "13px",
          marginTop: "10px",
          color: timeLeft === "Expired" ? "#dc2626" : "#2563eb",
          fontWeight: 600,
        }}
      >
        {timeLeft === "Expired" ? "Request Expired" : `Expires in: ${timeLeft}`}
      </p>
    )}

    <p
      style={{
        fontSize: "13px",
        color: "#333",
        marginTop: "15px",
        textAlign: "center",
      }}
    >
      The other member must transfer you
      <strong style={{ color: "#047857", fontSize: "15px" }}>
        {" "}
        ₹{Number(response.amount_paid) - Number(yatra.cancellation_fee)}
      </strong>
    </p>
<br/>
    <BreakdownToggle
      show={showBreakdown}
      onClick={() => setShowBreakdown(!showBreakdown)}
    />

    {showBreakdown && (
      <BreakdownSection
        amount_paid={response.amount_paid}
        cancellation_fee={yatra.cancellation_fee}
      />
    )}
  </div>
);

/* ------------------ FORM VIEW ------------------ */

const FormView = ({
  targetId,
  setTargetId,
  error,
  yatra,
  loading,
  handleSubmit,
}) => (
  <>
    <h2 className="sub-heading">Cancel & Substitute Registration</h2>

    <p className="sub-desc" style={{ marginBottom: "20px" }}>
      Transfer your registration, accommodation, travel & payments to another
      member.
    </p>

    <ErrorBox message={error} />

    <label className="sub-label">Substitute To — Member ID</label>

    <input
      value={targetId}
      onChange={(e) => setTargetId(e.target.value)}
      className="sub-input"
      placeholder="Enter Member ID"
    />

    <p className="sub-fee-note">
      Yatra cancellation fee <strong>₹{yatra.cancellation_fee}</strong>.
      <br />
      <br />
      Substitution is <strong style={{ color: "#b91c1c" }}>permanent</strong>.
      <br />
      <p style={{fontSize:"13px" ,color:"#b91c1c"}}>

        <strong>NOTE :</strong> You will not be allowed to register/substitute for the yatra again .
        </p>
    </p>

    <button
      onClick={handleSubmit}
      disabled={loading}
      className={loading ? "sub-btn disabled" : "sub-btn"}
    >
      {loading ? "Processing..." : "Initiate Substitution"}
    </button>
  </>
);

/* ------------------ MAIN COMPONENT ------------------ */

export default function InitiateSubstitutionModal({ registrationId, yatra }) {
  const [targetId, setTargetId] = useState("");
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState(null);
  const [error, setError] = useState("");
  const [isExisting, setIsExisting] = useState(false);
  const [showBreakdown, setShowBreakdown] = useState(false);

  useEffect(() => {
    const fetchExisting = async () => {
      setLoading(true);
      try {
        const res = await API.get(
          `/yatra-transfers/registrations/${registrationId}/existing/`
        );
        if (res.data?.has_request) {
          setResponse(res.data.request);
          setIsExisting(true);
        }
      } catch (err) {
        console.log("No existing substitution request.");
      } finally {
        setLoading(false);
      }
    };
    fetchExisting();
  }, [registrationId]);

  // ---------------- TIMER HANDLER ----------------
  const timeLeft = useCountdown(response?.expires_at, () => {
    setError("This substitution request has expired.");
  });

  const handleSubmit = async () => {
    setError("");

    if (!targetId.trim()) {
      setError("Please enter a valid Member ID");
      return;
    }

    if (!window.confirm("Substitution cannot be undone. Proceed?")) return;

    setLoading(true);
    try {
      const res = await API.post(
        `/yatra-transfers/registrations/${registrationId}/substitute/`,
        { target_profile_id: targetId }
      );
      setResponse(res.data);
      setIsExisting(false);
    } catch (err) {
      setError(
        err?.response?.data?.detail || "Failed to initiate substitution"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {loading && <FullPageLoader />}

      <div className="sub-modal-wrapper">
        {response ? (
          <CompletedView
            response={response}
            yatra={yatra}
            isExisting={isExisting}
            error={error}
            showBreakdown={showBreakdown}
            setShowBreakdown={setShowBreakdown}
            timeLeft={timeLeft}
          />
        ) : (
          <FormView
            targetId={targetId}
            setTargetId={setTargetId}
            error={error}
            yatra={yatra}
            loading={loading}
            handleSubmit={handleSubmit}
          />
        )}
      </div>
    </>
  );
}
