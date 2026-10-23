import { PROFILE_STATUS } from "./profileStatus";

export default function ProfileStatusBanner({ status = "incomplete", className = "" }) {
  const normalizedStatus = PROFILE_STATUS[status] ? status : "incomplete";
  const content = PROFILE_STATUS[normalizedStatus];

  return (
    <div
      className={`profile-status-banner ${className}`.trim()}
      role="status"
      style={{
        display: "flex", flexWrap: "wrap", alignItems: "baseline", gap: "0.5rem",
        marginBottom: "1rem", padding: "0.7rem 0.9rem", border: "1px solid",
        borderColor: content.borderColor, borderRadius: 8, fontSize: "0.85rem", lineHeight: 1.4,
        color: content.color, background: content.background,
      }}
    >
      <span style={{ fontWeight: 700, whiteSpace: "nowrap" }}>Status: {content.label}</span>
      <span>{content.message}</span>
    </div>
  );
}
