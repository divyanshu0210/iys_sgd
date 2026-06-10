import { Calendar, MapPin, PlayCircle, CheckCircle, Video } from "lucide-react";

const C = {
  cream: "#FDF6EC",
  orange: "#E8943A",
  dark: "#1C1C1E",
  secondary: "#5A5A6A",
};

const fmtDate = (d) =>
  d ? new Date(d).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) : "";

const getDaysToGo = (dateStr) => {
  const diff = new Date(dateStr) - new Date();
  if (diff <= 0) return null;
  const days = Math.floor(diff / 86400000);
  return days === 0 ? "Today" : `${days} day${days > 1 ? "s" : ""} to go`;
};

export default function EventCard({ ev, isFeatured }) {
  const imgSrc = ev.poster || ev.youtube_thumbnail;
  const daysToGo = isFeatured && ev.start_datetime ? getDaysToGo(ev.start_datetime) : null;
  const badge = ev.status === "live" ? "live"
    : isFeatured ? "Upcoming"
    : ev.category === "workshop" ? "Workshop"
    : ev.event_type === "online" ? "Online"
    : ev.event_type === "hybrid" ? "Hybrid"
    : "Event";

  return (
    <div style={{ borderRadius: 16, border: `1px solid ${C.orange}33`, overflow: "hidden", background: C.cream, boxShadow: "0 2px 10px rgba(0,0,0,0.06)", display: "flex", flexDirection: "column" }}>
      {imgSrc && (
        <div style={{ position: "relative" }}>
          <img src={imgSrc} alt={ev.title} style={{ width: "100%", height: "auto", display: "block" }} />
          <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(10,15,35,0.45) 0%, transparent 50%)" }} />

          <div style={{ position: "absolute", top: 10, left: 10, zIndex: 3 }}>
            {badge === "live" ? (
              <span style={{ background: "#e74c3c", color: "#fff", fontWeight: 700, fontSize: 11, padding: "3px 10px", borderRadius: 999, display: "flex", alignItems: "center", gap: 4 }}>
                <PlayCircle size={11} /> LIVE
              </span>
            ) : badge === "Upcoming" ? (
              <span style={{ background: C.orange, color: "#FDF6EC", fontWeight: 700, fontSize: 11, padding: "3px 10px", borderRadius: 999 }}>Upcoming</span>
            ) : (
              <span style={{ background: "rgba(90,90,106,0.82)", color: "#fff", fontWeight: 700, fontSize: 11, padding: "3px 10px", borderRadius: 999 }}>{badge}</span>
            )}
          </div>

          {daysToGo && (
            <div style={{ position: "absolute", top: 10, right: 10, zIndex: 3, background: "rgba(52,152,219,0.92)", color: "#fff", fontWeight: 700, fontSize: 11, padding: "3px 10px", borderRadius: 999, display: "flex", alignItems: "center", gap: 4 }}>
              <Calendar size={11} /> {daysToGo}
            </div>
          )}
        </div>
      )}

      <div style={{ flex: 1, padding: "16px 18px", display: "flex", flexDirection: "column", gap: 10 }}>
        <h3 style={{ fontWeight: 700, color: C.dark, fontSize: 15, letterSpacing: "-0.01em", margin: 0, lineHeight: 1.4 }}>{ev.title}</h3>

        <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
          {ev.start_datetime && (
            <span style={{ color: C.secondary, fontSize: 12, display: "flex", alignItems: "center", gap: 5 }}>
              <Calendar size={12} color={C.orange} /> {fmtDate(ev.start_datetime)}
            </span>
          )}
          {ev.location_name && (
            <span style={{ color: C.secondary, fontSize: 12, display: "flex", alignItems: "center", gap: 5 }}>
              <MapPin size={12} color={C.orange} /> {ev.location_name}
            </span>
          )}
        </div>

        {ev.description && (
          <p style={{ color: C.secondary, fontSize: 13, lineHeight: 1.65, margin: 0 }}>
            {ev.description.slice(0, 120)}{ev.description.length > 120 ? "…" : ""}
          </p>
        )}

        <div style={{ marginTop: "auto", paddingTop: 8, display: "flex", gap: 8, flexWrap: "wrap" }}>
          {ev.status === "live" && ev.youtube_live_url && (
            <a href={ev.youtube_live_url} target="_blank" rel="noreferrer"
              style={{ background: "#e74c3c", color: "#fff", borderRadius: 8, padding: "6px 16px", fontWeight: 600, fontSize: 13, textDecoration: "none", display: "flex", alignItems: "center", gap: 5 }}>
              <PlayCircle size={13} /> Watch Live
            </a>
          )}
          {ev.status === "completed" && ev.youtube_replay_url && (
            <a href={ev.youtube_replay_url} target="_blank" rel="noreferrer"
              style={{ background: C.dark, color: "#fff", borderRadius: 8, padding: "6px 16px", fontWeight: 600, fontSize: 13, textDecoration: "none", display: "flex", alignItems: "center", gap: 5 }}>
              <Video size={13} /> Watch Replay
            </a>
          )}
          {ev.status === "upcoming" && ev.registration_link && (
            <a href={ev.registration_link} target="_blank" rel="noreferrer"
              style={{ background: C.orange, color: "#FDF6EC", borderRadius: 8, padding: "6px 16px", fontWeight: 600, fontSize: 13, textDecoration: "none", display: "flex", alignItems: "center", gap: 5 }}>
              <CheckCircle size={13} /> Register
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
