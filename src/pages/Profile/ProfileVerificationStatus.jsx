import React from "react";
import { useNavigate } from "react-router-dom";
import "../../css/profile.css";
import { useAuth } from "../../context/AuthContext";

export default function ProfileVerificationStatus({ onClose }) {
  const { profile } = useAuth();
  const navigate = useNavigate();
  const isRejected = profile?.profile_verification_status === "rejected";

  return (
    <div className="cp-page" style={{ padding: 0, margin: 0 }}>
      <div className="cp-card">
        <p className="cp-title">{isRejected ? "Profile Rejected" : "Profile Verification"}</p>
        <p className="cp-subtitle">
          {isRejected
            ? "Your profile was rejected. Please check and submit your profile again."
            : "Your profile is being reviewed by the mentors and counsellor assigned to your Bace."}
        </p>
        <div className="form-actions">
          <button
            type="button"
            className="cp-btn-primary"
            onClick={() => {
              onClose?.();
              navigate("/complete-profile");
            }}
          >
            Review Profile
          </button>
        </div>
      </div>
    </div>
  );
}
