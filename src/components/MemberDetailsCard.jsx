import "../css/memberCards.css";
import MemberActions from "./MemberActions";
import { useAuth } from "../context/AuthContext";
const formatDate = (dateStr) => {
  if (!dateStr) return "";
  const date = new Date(dateStr);
  return date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

export default function MemberDetailsCard({ m, hideActions = false }) {
  const { profile: currentProfile } = useAuth();
  const canShowSelfBadge = ["mentor", "counsellor"].includes(currentProfile?.user_type);
  const isPending = m.is_pending;
  const verificationStatus = m.profile_verification_status || (isPending ? "pending" : "");
  const statusMeta = {
    verified: { label: "Verified", background: "#dcfce7", color: "#166534" },
    pending: { label: "Pending", background: "#fef3c7", color: "#92400e" },
    rejected: { label: "Rejected", background: "#fee2e2", color: "#991b1b" },
    incomplete: { label: "Incomplete", background: "#e5e7eb", color: "#374151" },
  }[verificationStatus];
  const displayName = m.is_initiated ? m.initiated_name : m.full_name || "Unnamed";

  const statusPill = statusMeta && (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        borderRadius: 999,
        padding: "2px 8px",
        fontSize: 11,
        fontWeight: 600,
        background: statusMeta.background,
        color: statusMeta.color,
        whiteSpace: "nowrap",
      }}
    >
      {statusMeta.label}
    </span>
  );

  return (
    <>
      <div className="member-mobile-name-row">
        <div className="member-mobile-name">
          <p className="member-line name-line">{displayName}</p>
          {m.is_self && canShowSelfBadge && <span className="member-self-badge">You</span>}
          {statusPill}
        </div>
        {isPending && !hideActions && <MemberActions m={m} />}
      </div>
    <div className="member-content">
      <div className="member-photo">
        <img
          src={m.profile_picture   || "/default-avatar.png"}
          alt={m.full_name || "Member"}
        />
      </div>

      <div className={`member-info ${isPending && !hideActions ? "has-actions" : ""}`}>
        <div className="member-name-row">
          <div className="member-name-details">

          <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
            <p className="member-line name-line">{displayName}</p>
            {m.is_self && canShowSelfBadge && <span className="member-self-badge">You</span>}
            {statusPill}
          </div>
          </div>
          {isPending && !hideActions && (
            <div className="member-card-actions">
              <MemberActions m={m} />
            </div>
          )}
        </div>
     
        <p className="member-line">
          <strong className="info-label">Role:</strong>{" "}
          {m.user_type === "mentor"
            ? "Mentor"
            : m.user_type === "counsellor"
            ? "Counsellor"
            : m.user_type === "guest"
            ? "Guest"
            : "Devotee"}{" "}
          <strong className="info-label">ID:</strong> {m.member_id || "N/A"}
          {m.dob && <>, <strong className="info-label">Born:</strong> {formatDate(m.dob)}</>}
          {m.gender && <>, <strong className="info-label">Gender:</strong> {m.gender}</>}
          {m.marital_status && <>, <strong className="info-label">Marital:</strong> {m.marital_status}</>}
        </p>

        {(m.center || m.bace) && (
          <p className="member-line">
            <strong className="info-label">Center:</strong> {m.center || m.bace}
          </p>
        )}
        {m.satsanga && <p className="member-line"><strong className="info-label">Satsangas:</strong> {m.satsanga}</p>}
        {m.email && (
          <p className="member-line">
            <strong className="info-label">Email:</strong> {m.email}
            {m.email2 ? `, ${m.email2}` : ""} 
          </p>
        )}
        {m.mobile && (
          <p className="member-line"><strong className="info-label">Mobile:</strong> {m.mobile}</p>
        )}
        {isPending && m.request_created_at && (
          <p
            className="member-line"
            style={{ color: "#777", fontStyle: "italic" }}
          >
            <strong className="info-label">Requested:</strong> {formatDate(m.request_created_at)}
          </p>
        )}
      </div>
    </div>
    </>
  );
}
