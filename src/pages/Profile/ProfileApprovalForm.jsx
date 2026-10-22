import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../../css/profile.css";
import API from "../../services/api";
import { useAuth } from "../../context/AuthContext";
import FullPageLoader from "../../components/FullPageLoader";

export default function ProfileApprovalForm({ onClose, onComplete, returnTo = "/" }) {
  const { profile, fetchProfile } = useAuth();
  const [memberId, setMemberId] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [status, setStatus] = useState(null);
  const navigate = useNavigate();

  // Kept as a compatibility component for any legacy import; the active UI
  // uses ProfileVerificationStatus and never exposes mentor selection.
  void profile;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus(null);

    if (!memberId) {
      setStatus({ type: "error", msg: "Member ID is required" });
      return;
    }
    setSubmitting(true);
    const token = localStorage.getItem("userToken");
    void token;

    try {
      await API.post("/api/profile/", { mentor: memberId });

      setStatus({
        type: "success",
        msg: "Approval request sent successfully!",
      });

      // navigate after short delay
      await fetchProfile();
      setTimeout(() => {
        if (onComplete) onComplete();
        else navigate(returnTo, { replace: true });
      }, 1500);
      onClose?.(); // ✅ close after submit
    } catch (err) {
      const errorMsg =
        err.response?.data?.message ||
        err.response?.data?.detail ||
        err.response?.data?.mentor ||
        err.message ||
        "An error occurred while sending approval request.";
      setStatus({ type: "error", msg: errorMsg });
    } finally {
      setSubmitting(false);
    }
  };

  const handleSkip = () => {
    if (onComplete) onComplete();
    else navigate(returnTo, { replace: true }); // continue to the originally requested page
    onClose?.(); // ✅ close after submit
  };

  return (
    <>
    {submitting&&<FullPageLoader/>}
    <div className="cp-page" style={{ padding:0 ,margin:0 }}>
      <form className="cp-card" onSubmit={handleSubmit} noValidate>
        <p className="cp-title">Get Profile Approved</p>
        <p className="cp-subtitle">
          Connect yourself with a spiritual guide to unlock yatra & all other features.
        </p>

        <div className="cp-field">
          <label htmlFor="memberId">
            Member ID <span style={{ color: "#e74c3c" }}>*</span>
          </label>
          <input
            id="memberId"
            type="text"
            placeholder="Enter spiritual guide's member ID"
            value={memberId}
            onChange={(e) => setMemberId(e.target.value)}
            disabled={submitting}
            className={
              !memberId && status?.type === "error" ? "error-border" : ""
            }
          />
        </div>

        {status && (
          <div
            className={`status-box ${
              status.type === "success" ? "success" : "error"
            }`}
          >
            {status.msg}
          </div>
        )}

        <div className="form-actions">
          <button
            type="button"
            onClick={handleSkip}
            className="cp-btn-ghost"
            disabled={submitting}
          >
            Skip
          </button>
          <button
            type="submit"
            className="cp-btn-primary"
            disabled={submitting}
          >
            {submitting ? "Sending..." : "Send for Approval"}
          </button>
        </div>
      </form>
    </div>
    </>

  );
}
