import { useState } from "react";
import API from "../services/api";

export default function YatraActions({ yatra }) {
  const [actionLoading, setActionLoading] = useState(null);
  const isApproved = yatra.is_approved;

  const handleApproveToggle = async () => {
    if (actionLoading) return;
    const action = isApproved ? "unapprove" : "approve";
    const confirmMsg = isApproved
      ? "Are you sure you want to unapprove this yatra?"
      : "Approve this yatra?";

    if (!confirm(confirmMsg)) return;

    setActionLoading(action);

    try {
      // ✅ Adjust endpoint as per your backend
      await API.post(`/api/yatras/${yatra.yatra_id}/${action}/`);
      window.location.reload();
    } catch (err) {
      alert(`Failed to ${action}.`);
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <div style={{ marginTop: 12, display: "flex", gap: 8 }}>
      <button
        onClick={handleApproveToggle}
        className="convert-btn"
        style={{
          background: isApproved ? "#f39c12" : "#27ae60",
          opacity: actionLoading ? 0.7 : 1,
          cursor: actionLoading ? "not-allowed" : "pointer",
        }}
        disabled={actionLoading}
      >
        {actionLoading
          ? isApproved
            ? "Unapproving..."
            : "Approving..."
          : isApproved
          ? "Unapprove"
          : "Approve"}
      </button>
    </div>
  );
}
