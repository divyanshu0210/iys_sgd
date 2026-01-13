import { useEffect } from "react";
import { useYatraRegistration } from "../context/YatraRegistrationContext";

const APPROVAL_STATUS_MAP = {
  approved: { text: "Approved", icon: "✓" },
  not_approved: { text: "Not Approved", icon: "○" },
};

const YatraRegistrationStatusFilter = ({ activeTab }) => {
  const { statusFilter, setStatusFilter, getStatusCounts } =
    useYatraRegistration();
  const counts = getStatusCounts(activeTab);
  const isApproveTab = activeTab === "approve";

  useEffect(() => {
    setStatusFilter("all");
  }, [activeTab]);

  return (
    <div className="status-filter" >
      <select
        value={statusFilter}
        onChange={(e) => setStatusFilter(e.target.value)}
        style={{ width: "100%" , padding:"10px 2px"}}
      >
        <option value="all">All ({counts.all || 0})</option>

        {isApproveTab
          ? Object.entries(APPROVAL_STATUS_MAP).map(([key, v]) => (
              <option key={key} value={key} disabled={!counts[key]}>
                {v.icon} {v.text} ({counts[key] || 0})
              </option>
            ))
          : Object.entries(STATUS_MAP).map(([key, v]) => (
              <option key={key} value={key} disabled={!counts[key]}>
                {v.icon} {v.text} ({counts[key] || 0})
              </option>
            ))}
      </select>
    </div>
  );
};

export default YatraRegistrationStatusFilter;



// Full status map (matches backend)
export const STATUS_MAP = {
  pending: {
    text: "Not Started",
    bg: "#e2e3e5",
    color: "#383d41",
    icon: "○",
  },
  partial: {
    text: "Incomplete",
    bg: "#f59e0b",
    color: "#ffffff",
    icon: "●",
  },
  paid: {
    text: "Confirmed",
    bg: "#d4edda",
    color: "#155724",
    icon: "✓",
  },
  substituted: {
    text: "Substituted",
    bg: "#cce5ff",
    color: "#004085",
    icon: "⇄",
  },
  refunded: {
    text: "Refunded",
    bg: "#f8d7da",
    color: "#721c24",
    icon: "↩",
  },
  cancelled: {
    text: "Cancelled",
    bg: "#f8d7da",
    color: "#721c24",
    icon: "✗",
  },
  attended: {
    text: "Attended",
    bg: "#d1ecf1",
    color: "#0c5460",
    icon: "✓✓",
  },
};