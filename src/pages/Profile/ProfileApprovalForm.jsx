import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../../css/profile.css";
import API from "../../services/api";
import { useAuth } from "../../context/AuthContext";

export default function ProfileApprovalForm({ onClose }) {
  const { fetchProfile } = useAuth();
  const [memberId, setMemberId] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [status, setStatus] = useState(null);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus(null);

    if (!memberId) {
      setStatus({ type: "error", msg: "Member ID is required" });
      return;
    }
    setSubmitting(true);
    const token = localStorage.getItem("userToken");

    try {
      await API.post("/api/profile/", { mentor: memberId });

      setStatus({
        type: "success",
        msg: "Approval request sent successfully!",
      });

      // navigate after short delay
      const stage = await fetchProfile();
      setTimeout(() => navigate("/"), 1500);
      onClose(); // ✅ close after submit
    } catch (err) {
      const errorMsg =
        err.response?.data?.message ||
        err.response?.data?.detail ||
        err.message ||
        "An error occurred while sending approval request.";
      setStatus({ type: "error", msg: errorMsg });
    } finally {
      setSubmitting(false);
    }
  };

  const handleSkip = () => {
    navigate("/"); // 👈 skip approval and continue
    onClose(); // ✅ close after submit
  };

  return (
    <div className="cp-page" style={{ padding:0 ,margin:0 }}>
      <form className="cp-card" onSubmit={handleSubmit} noValidate>
        <p className="cp-title">Get Profile Approved</p>
        <p className="cp-subtitle">
          To access Yatra Registration & all features,get profile approved by
          your mentor.
        </p>

        <div className="cp-field">
          <label htmlFor="memberId">
            Mentor Member ID <span style={{ color: "#e74c3c" }}>*</span>
          </label>
          <input
            id="memberId"
            type="text"
            placeholder="Enter mentor's member ID"
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
  );
}
