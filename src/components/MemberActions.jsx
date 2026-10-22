import { useState } from "react";
import { Check, X } from "lucide-react";
import API from "../services/api";

export default function MemberActions({ m }) {
  const [actionLoading, setActionLoading] = useState(null);
  const isPending = m.is_pending;

  // 🟢 Detect clicks outside dropdown
  const handleApprove = async () => {
    setActionLoading("approve");
    try {
      await API.post("/api/mentor/requests/", { request_id: m.request_id });
      window.location.reload();
    } catch {
      alert("Failed to approve.");
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async () => {
    if (!confirm("Reject this request?")) return;
    setActionLoading("reject");
    try {
      await API.delete(`/api/mentor/requests/${m.request_id}/`);
      window.location.reload();
    } catch {
      alert("Failed to reject.");
    } finally {
      setActionLoading(null);
    }
  };

  if (!isPending) return null;

  return (
    <div
      className="member-actions"
      style={{
        display: "flex",
        flexWrap: "wrap",
        justifyContent: "flex-end",
        gap: 6,
        flexShrink: 0,
      }}
    >
      <button
        className="action-btn approve"
        onClick={handleApprove}
        disabled={Boolean(actionLoading)}
        aria-label="Connect"
        title="Connect profile"
        style={{
          fontSize: 0,
          width: 30,
          height: 30,
          minWidth: 30,
          maxWidth: 30,
          padding: 0,
          border: "1px solid #15803d",
          background: "#16a34a",
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Check size={17} strokeWidth={3} aria-hidden="true" />
        ⋮
      </button>

      <button
        className="action-btn reject"
        onClick={handleReject}
        disabled={Boolean(actionLoading)}
        aria-label="Reject"
        title="Reject profile"
        style={{
          width: 30,
          height: 30,
          minWidth: 30,
          maxWidth: 30,
          padding: 0,
          border: "1px solid #b91c1c",
          background: "#dc2626",
          color: "#fff",
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <X size={17} strokeWidth={3} aria-hidden="true" />
      </button>
    </div>
  );
}
