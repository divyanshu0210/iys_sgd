// src/components/ProfileCard.jsx
import React from "react";
import "../css/members.css";

export default function RegisterProfileCard({
  profile,
  onApprove,
  onReject,
  onRequestApproval,
  onSelect,
  isSelected,
  showCheckbox = false,
  showActions = false,
  loading = false,
  showStatus = true,
}) {
  const formatDate = (dateStr) => {
    if (!dateStr) return "";
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  return (
    <div className="member-card">
      <div className="member-content">
        {showCheckbox && !profile.is_registered && (
          <input
            type="checkbox"
            checked={isSelected}
            onChange={() => onSelect && onSelect(profile)}
            disabled={!profile.is_eligible}
            className="user-checkbox"
          />
        )}

        <div className="member-photo">
          <img
            src={profile.profile_picture_url || "/default-avatar.png"}
            alt={profile.full_name || "Profile"}
          />
        </div>

        <div className="member-info">
          <p className="member-line name-line">
            {profile.full_name || "Unnamed"}
            {profile.is_pending && (
              <span
                style={{
                  marginLeft: 8,
                  color: "#f39c12",
                  fontSize: "0.85rem",
                }}
              >
                (Pending)
              </span>
            )}
            {profile.is_self && (
              <span className="badge-self" style={{ marginLeft: 6 }}>
                You
              </span>
            )}
          </p>

          <p className="member-line">
            ID: {profile.member_id || "N/A"}
            {profile.user_type && ` | ${profile.user_type}`}
          </p>

          {profile.dob && (
            <p className="member-line">Born: {formatDate(profile.dob)}</p>
          )}
          {profile.gender && (
            <p className="member-line">Gender: {profile.gender}</p>
          )}
          {profile.marital_status && (
            <p className="member-line">
              Marital Status: {profile.marital_status}
            </p>
          )}
          {profile.center && (
            <p className="member-line">Center: {profile.center}</p>
          )}
          {profile.satsanga && (
            <p className="member-line">Satsangas: {profile.satsanga}</p>
          )}
          {profile.email && (
            <p className="member-line">
              Email: {profile.email}
              {profile.email2 ? `, ${profile.email2}` : ""} (Personal)
            </p>
          )}
          {profile.mobile && (
            <p className="member-line">Mobile: {profile.mobile}</p>
          )}

          {profile.request_created_at && (
            <p className="member-line" style={{ color: "#777" }}>
              Requested: {formatDate(profile.request_created_at)}
            </p>
          )}

          {showStatus && (
            <p className="member-line">
              {profile.is_registered ? (
                <span className="badge-approved">Registered</span>
              ) : profile.is_eligible ? (
                <span className="badge-approved">Approved</span>
              ) : (
                <span className="badge-pending">Pending Approval</span>
              )}
            </p>
          )}

          {/* Action Buttons */}
          {showActions && (
            <div style={{ marginTop: 12, display: "flex", gap: 8 }}>
              {onApprove && (
                <button
                  onClick={() => onApprove(profile)}
                  className="convert-btn"
                  style={{ background: "#27ae60" }}
                  disabled={loading}
                >
                  {loading ? "Approving..." : "Approve"}
                </button>
              )}
              {onReject && (
                <button
                  onClick={() => onReject(profile)}
                  className="convert-btn"
                  style={{ background: "#e74c3c" }}
                  disabled={loading}
                >
                  {loading ? "Rejecting..." : "Reject"}
                </button>
              )}
              {onRequestApproval && (
                <button
                  onClick={() => onRequestApproval(profile)}
                  className="convert-btn"
                  style={{ background: "#3498db" }}
                  disabled={loading}
                >
                  {loading ? "Requesting..." : "Request Approval"}
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
