import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { Calendar, Clock, MapPin, Users, X } from "lucide-react";
import { getYatraRegistrationStatus } from "../hooks/yatraRegistrationStatus";
import "./YatraCard.css";

const C = {
  cream: "#FDF6EC",
  orange: "#E8943A",
  dark: "#1C1C1E",
  secondary: "#5A5A6A",
};

const fmtDate = (d) =>
  d ? new Date(d).toLocaleDateString("en-IN", { day: "2-digit", month: "short" }) : "";

export default function YatraCard({ y, onRegisterClick }) {
  const [posterOpen, setPosterOpen] = useState(false);
  useEffect(() => {
    if (!posterOpen) return undefined;
    const onKeyDown = (event) => {
      if (event.key === "Escape") setPosterOpen(false);
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [posterOpen]);
  const registrationStatus = getYatraRegistrationStatus(y);
  const isOpen = registrationStatus.canRegister;
  const canViewExistingProcess = Boolean(y.registration_in_progress);
  const canOpenRegistration = isOpen || canViewExistingProcess;
  const requiresApproval = y.registration_policy?.requires_approval !== false;
  const durationDays = y.start_date && y.end_date
    ? Math.max(1, Math.round((new Date(y.end_date) - new Date(y.start_date)) / 86400000) + 1)
    : null;

  return (
    <div style={{ borderRadius: 16, background: C.cream, border: `1px solid ${C.orange}33`, overflow: "hidden", boxShadow: "0 4px 16px rgba(0,0,0,0.06)", display: "flex", flexDirection: "column" }}>
      <div style={{ position: "relative" }}>
        {y.poster ? (
          <button type="button" className="yatra-card-poster-wrapper" onClick={() => setPosterOpen(true)} aria-label={`View full poster for ${y.title || "this yatra"}`}>
            <img className="yatra-card-poster-background" src={y.poster} alt="" aria-hidden="true" />
            <img className="yatra-card-poster" src={y.poster} alt={y.title} style={{ width: "100%", height: "auto", display: "block" }} />
          </button>
        ) : (
          <div style={{ aspectRatio: "4/3", background: `${C.orange}18`, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <MapPin size={40} color={`${C.orange}66`} />
          </div>
        )}

        {/* Registration status — top right */}
        <div style={{ position: "absolute", top: 12, right: 12, maxWidth: "52%", zIndex: 2, textAlign: "center" }}>
          <span style={{ background: "rgba(10,15,35,0.72)", color: "#FDF6EC", fontWeight: 700, fontSize: 11, lineHeight: 1.2, padding: "4px 10px", borderRadius: 999, display: "inline-block", whiteSpace: "normal" }}>
            {registrationStatus.label}
          </span>
        </div>

        {/* Access indicator — top left */}
        <div style={{ position: "absolute", top: 12, left: 12, zIndex: 2 }}>
          {requiresApproval ? (
            // <span style={{ background: "rgba(10,15,35,0.72)", color: "#fff", fontWeight: 600, fontSize: 10, padding: "3px 10px", borderRadius: 999, display: "flex", alignItems: "center", gap: 4, backdropFilter: "blur(4px)" }}>
            //   <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
            //   Counsellor Required
            // </span>
            <></>
          ) : (
            <span style={{ background: "rgba(34,197,94,0.85)", color: "#fff", fontWeight: 600, fontSize: 10, padding: "3px 10px", borderRadius: 999, display: "flex", alignItems: "center", gap: 4 }}>
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
              Open to All
            </span>
          )}
        </div>
      </div>

      {posterOpen && createPortal(
        <div className="yatra-poster-overlay" role="dialog" aria-modal="true" aria-label={`${y.title || "Yatra"} poster`} onClick={() => setPosterOpen(false)}>
          <button type="button" className="yatra-poster-close" aria-label="Close poster" onClick={() => setPosterOpen(false)}>
            <X size={22} strokeWidth={2.2} aria-hidden="true" />
          </button>
          <img src={y.poster} alt={`${y.title || "Yatra"} poster`} onClick={(event) => event.stopPropagation()} />
        </div>,
        document.body
      )}

      <div className="yatra-card-details" style={{ padding: 14, display: "flex", flexDirection: "column", gap: 16, flex: 1 }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          <h3 style={{ fontWeight: 700, color: C.dark, fontSize: 19, letterSpacing: "-0.02em", margin: 0 }}>
            {y.title || "Untitled Yatra"}
          </h3>
          {y.description && (
            <p className="yatra-card-description" style={{ color: C.secondary, fontSize: 14, lineHeight: 1.7, margin: 0 }}>
              {y.description.slice(0, 150)}{y.description.length > 120 ? "…" : ""}
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
          {canOpenRegistration ? (
            <Link
              to={`/yatra/${y.id}/register`}
              state={{ yatra: y }}
              onClick={onRegisterClick}
              style={{ background: isOpen ? C.orange : "transparent", color: isOpen ? "#FDF6EC" : C.orange, border: isOpen ? "none" : `1px solid ${C.orange}`, borderRadius: 10, padding: "8px 24px", fontWeight: 600, fontSize: 14, textDecoration: "none" }}
            >
              {isOpen ? "Register Now" : "View Details"}
            </Link>
          ) : (
            <button
              type="button"
              disabled
              style={{ background: C.orange, color: "#FDF6EC", border: "none", borderRadius: 10, padding: "8px 24px", fontWeight: 600, fontSize: 14, cursor: "not-allowed", opacity: 0.55 }}
            >
              {registrationStatus.buttonLabel || "Registration Closed"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
