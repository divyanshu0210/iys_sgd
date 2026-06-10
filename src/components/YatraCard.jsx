import { Link } from "react-router-dom";
import { Calendar, Clock, MapPin, Users } from "lucide-react";

const C = {
  cream: "#FDF6EC",
  orange: "#E8943A",
  dark: "#1C1C1E",
  secondary: "#5A5A6A",
};

const fmtDate = (d) =>
  d ? new Date(d).toLocaleDateString("en-IN", { day: "2-digit", month: "short" }) : "";

export default function YatraCard({ y, onRegisterClick }) {
  const isOpen = Boolean(y.is_registration_open);
  const requiresApproval = y.registration_policy?.requires_approval !== false;
  const durationDays = y.start_date && y.end_date
    ? Math.max(1, Math.round((new Date(y.end_date) - new Date(y.start_date)) / 86400000) + 1)
    : null;

  return (
    <div style={{ borderRadius: 16, background: C.cream, border: `1px solid ${C.orange}33`, overflow: "hidden", boxShadow: "0 4px 16px rgba(0,0,0,0.06)", display: "flex", flexDirection: "column" }}>
      <div style={{ position: "relative" }}>
        {y.poster ? (
          <img src={y.poster} alt={y.title} style={{ width: "100%", height: "auto", display: "block" }} />
        ) : (
          <div style={{ aspectRatio: "4/3", background: `${C.orange}18`, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <MapPin size={40} color={`${C.orange}66`} />
          </div>
        )}

        {/* Registration status — top right */}
        <div style={{ position: "absolute", top: 12, right: 12, zIndex: 2 }}>
          <span style={{ background: isOpen ? C.orange : "rgba(26,39,68,0.8)", color: "#FDF6EC", fontWeight: 700, fontSize: 11, padding: "4px 12px", borderRadius: 999 }}>
            {isOpen ? "Registration Open" : "Registration Closed"}
          </span>
        </div>

        {/* Access indicator — top left */}
        <div style={{ position: "absolute", top: 12, left: 12, zIndex: 2 }}>
          {requiresApproval ? (
            <span style={{ background: "rgba(10,15,35,0.72)", color: "#fff", fontWeight: 600, fontSize: 10, padding: "3px 10px", borderRadius: 999, display: "flex", alignItems: "center", gap: 4, backdropFilter: "blur(4px)" }}>
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
              Counsellor Required
            </span>
          ) : (
            <span style={{ background: "rgba(34,197,94,0.85)", color: "#fff", fontWeight: 600, fontSize: 10, padding: "3px 10px", borderRadius: 999, display: "flex", alignItems: "center", gap: 4 }}>
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
              Open to All
            </span>
          )}
        </div>
      </div>

      <div style={{ padding: 24, display: "flex", flexDirection: "column", gap: 16, flex: 1 }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          <h3 style={{ fontWeight: 700, color: C.dark, fontSize: 19, letterSpacing: "-0.02em", margin: 0 }}>
            {y.title || "Untitled Yatra"}
          </h3>
          {y.description && (
            <p style={{ color: C.secondary, fontSize: 14, lineHeight: 1.7, margin: 0 }}>
              {y.description.slice(0, 120)}{y.description.length > 120 ? "…" : ""}
            </p>
          )}
          {y.location && (
            <span style={{ color: C.secondary, fontSize: 12, display: "flex", alignItems: "center", gap: 4 }}>
              <MapPin size={12} /> {y.location}
            </span>
          )}
        </div>

        <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", gap: 12 }}>
          {y.start_date && (
            <span style={{ color: C.secondary, fontSize: 12, display: "flex", alignItems: "center", gap: 4 }}>
              <Calendar size={12} /> {fmtDate(y.start_date)}–{fmtDate(y.end_date)}
            </span>
          )}
          {durationDays && (
            <span style={{ color: C.secondary, fontSize: 12, display: "flex", alignItems: "center", gap: 4 }}>
              <Clock size={12} /> {durationDays} day{durationDays > 1 ? "s" : ""}
            </span>
          )}
          {y.capacity && (
            <span style={{ color: C.secondary, fontSize: 12, display: "flex", alignItems: "center", gap: 4 }}>
              <Users size={12} /> {y.capacity} seats
            </span>
          )}
        </div>

        <div style={{ borderTop: `1px solid ${C.orange}62`, paddingTop: 16, display: "flex", justifyContent: "center", marginTop: "auto" }}>
          <Link
            to={`/yatra/${y.id}/register`}
            state={{ yatra: y }}
            onClick={onRegisterClick}
            style={{ background: isOpen ? C.orange : "transparent", color: isOpen ? "#FDF6EC" : C.orange, border: isOpen ? "none" : `1px solid ${C.orange}`, borderRadius: 10, padding: "8px 24px", fontWeight: 600, fontSize: 14, textDecoration: "none" }}
          >
            {isOpen ? "Register Now" : "View Details"}
          </Link>
        </div>
      </div>
    </div>
  );
}
