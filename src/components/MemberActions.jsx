import { useState, useEffect, useRef } from "react";
import API from "../services/api";

export default function MemberActions({ m }) {
  const [actionLoading, setActionLoading] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);
  const isPending = m.is_pending;

  // 🟢 Detect clicks outside dropdown
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleApprove = async () => {
    setActionLoading("approve");
    try {
      await API.post("/api/mentor/requests/", { request_id: m.request_id });
      window.location.reload();
    } catch {
      alert("Failed to approve.");
    } finally {
      setActionLoading(null);
      setMenuOpen(false);
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
      setMenuOpen(false);
    }
  };

  const handleAction = (action) => {
    if (action === "approve") handleApprove();
    if (action === "reject") handleReject();
  };

  if (!isPending) return null;

  return (
    <div className="member-actions" ref={menuRef}>
      <button
        className="action-menu-btn"
        onClick={() => setMenuOpen(!menuOpen)}
      >
        ⋮
      </button>

      {menuOpen && (
        <div className="action-dropdown">
          <button
            className="action-item"
            onClick={() => handleAction("approve")}
            disabled={actionLoading}
          >
            {actionLoading === "approve" ? "Approving..." : "Convert to Devotee"}
          </button>
          <button
            className="action-item reject"
            onClick={() => handleAction("reject")}
            disabled={actionLoading}
          >
            {actionLoading === "reject" ? "Rejecting..." : "Reject"}
          </button>
        </div>
      )}
    </div>
  );
}
