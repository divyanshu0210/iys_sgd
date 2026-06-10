import { useEffect, useState } from "react";
import { Calendar, MapPin, PlayCircle, CheckCircle, Video, Clock, Bell, Megaphone } from "lucide-react";
import API from "../services/api";
import { useAuth } from "../context/AuthContext";
import Footer from "../components/Footer";

const C = {
  cream: "#FDF6EC",
  orange: "#E8943A",
  dark: "#1C1C1E",
  secondary: "#5A5A6A",
  rose: "#C4A0A0",
};

const fmtDate = (d) =>
  d ? new Date(d).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) : "";

const getDaysToGo = (dateStr) => {
  const diff = new Date(dateStr) - new Date();
  if (diff <= 0) return null;
  const days = Math.floor(diff / 86400000);
  return days === 0 ? "Today" : `${days} day${days > 1 ? "s" : ""} to go`;
};

function EventCard({ ev, isFeatured }) {
  const imgSrc = ev.poster || ev.youtube_thumbnail;
  const daysToGo = isFeatured && ev.start_datetime ? getDaysToGo(ev.start_datetime) : null;
  const badge = ev.status === "live" ? "live"
    : isFeatured ? "Upcoming"
    : ev.category === "workshop" ? "Workshop"
    : ev.event_type === "online" ? "Online"
    : ev.event_type === "hybrid" ? "Hybrid"
    : "Event";

  return (
    <div style={{ borderRadius: 16, border: `1px solid ${C.orange}33`, overflow: "hidden", background: "#fff", boxShadow: "0 2px 10px rgba(0,0,0,0.06)", display: "flex", flexDirection: "column" }}>
      {imgSrc && (
        <div style={{ position: "relative" }}>
          <img src={imgSrc} alt={ev.title} style={{ width: "100%", height: 200, objectFit: "cover", display: "block" }} />
          <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(10,15,35,0.55) 0%, transparent 50%)" }} />

          {/* category badge top-left */}
          <div style={{ position: "absolute", top: 10, left: 10 }}>
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

          {/* days to go top-right */}
          {daysToGo && (
            <div style={{ position: "absolute", top: 10, right: 10, background: "rgba(52,152,219,0.92)", color: "#fff", fontWeight: 700, fontSize: 11, padding: "3px 10px", borderRadius: 999, display: "flex", alignItems: "center", gap: 4 }}>
              <Calendar size={11} /> {daysToGo}
            </div>
          )}
        </div>
      )}

      <div style={{ flex: 1, padding: "16px 18px", display: "flex", flexDirection: "column", gap: 10, background: C.cream }}>
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

const TABS = ["All", "Events", "Workshops"];

export default function AllEvents() {
  const { setUseFullWidth } = useAuth();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState("All");

  useEffect(() => {
    setUseFullWidth(true);
    return () => setUseFullWidth(false);
  }, []);

  useEffect(() => {
    API.get("/announcements/events/home/")
      .then(r => setEvents(r.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const now = new Date();
  const imageEvents = events
    .filter(e => !e.category || e.category === "event" || e.category === "workshop")
    .sort((a, b) => {
      const aFuture = new Date(a.start_datetime) >= now;
      const bFuture = new Date(b.start_datetime) >= now;
      if (aFuture && !bFuture) return -1;
      if (!aFuture && bFuture) return 1;
      return aFuture
        ? new Date(a.start_datetime) - new Date(b.start_datetime)
        : new Date(b.start_datetime) - new Date(a.start_datetime);
    });

  const sideItems = events.filter(e => e.category === "announcement" || e.category === "notice");

  const filtered =
    tab === "All" ? imageEvents :
    tab === "Workshops" ? imageEvents.filter(e => e.category === "workshop") :
    imageEvents.filter(e => !e.category || e.category === "event");

  return (
    <div style={{ background: C.cream, minHeight: "100vh" }}>
      <div style={{ maxWidth: 1140, margin: "0 auto", padding: "clamp(32px, 6vw, 64px) clamp(16px, 3vw, 24px)" }}>

        {/* Header */}
        <div style={{ marginBottom: 36 }}>
          <h1 style={{ fontFamily: "'Source Serif 4', Georgia, serif", fontWeight: 700, fontSize: "clamp(2rem, 4vw, 3rem)", letterSpacing: "-0.02em", margin: "0 0 8px" }}>
            All Events
          </h1>
          <p style={{ color: C.secondary, fontSize: 16, margin: 0 }}>
            Browse all our spiritual gatherings, workshops, and festivals.
          </p>
        </div>

        {/* Tabs */}
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 32 }}>
          {TABS.map(t => (
            <button key={t} onClick={() => setTab(t)}
              style={{ padding: "7px 18px", borderRadius: 999, fontWeight: 600, fontSize: 13, cursor: "pointer", border: `1px solid ${tab === t ? C.orange : `${C.orange}44`}`, background: tab === t ? C.orange : "transparent", color: tab === t ? "#FDF6EC" : C.dark, transition: "all 0.15s" }}>
              {t}
            </button>
          ))}
        </div>

        {/* Two-column layout */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 300px", gap: 32, alignItems: "start" }} className="events-page-layout">

          {/* Left: event cards */}
          <div>
            {loading ? (
              <div style={{ textAlign: "center", padding: "60px 0", color: C.secondary }}>
                <Clock size={32} style={{ marginBottom: 12, opacity: 0.4 }} />
                <p>Loading events…</p>
              </div>
            ) : filtered.length === 0 ? (
              <div style={{ textAlign: "center", padding: "60px 0", color: C.secondary }}>
                <p>No events found.</p>
              </div>
            ) : (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 20 }}>
                {(() => {
                  const now = new Date();
                  const featuredIdx = filtered.findIndex(e => new Date(e.start_datetime) >= now);
                  return filtered.map((ev, i) => <EventCard key={ev.id} ev={ev} isFeatured={i === featuredIdx} />);
                })()}
              </div>
            )}
          </div>

          {/* Right: announcements & notices panel */}
          <aside style={{ position: "sticky", top: 24 }}>
            <div style={{ borderRadius: 16, border: `1px solid ${C.orange}33`, background: "#fff", overflow: "hidden", boxShadow: "0 2px 10px rgba(0,0,0,0.05)" }}>
              <div style={{ padding: "14px 18px", borderBottom: `1px solid ${C.orange}22`, background: C.cream }}>
                <h3 style={{ fontWeight: 700, fontSize: 15, color: C.dark, margin: 0, letterSpacing: "-0.01em" }}>Announcements & Notices</h3>
              </div>
              {sideItems.length === 0 ? (
                <div style={{ padding: "24px 18px", color: C.secondary, fontSize: 13, textAlign: "center" }}>
                  No announcements right now.
                </div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column" }}>
                  {sideItems.map((item, i) => {
                    const isNotice = item.category === "notice";
                    return (
                      <div key={item.id} style={{ padding: "14px 18px", borderBottom: i < sideItems.length - 1 ? `1px solid ${C.orange}18` : "none", display: "flex", gap: 12, alignItems: "flex-start" }}>
                        <div style={{ flexShrink: 0, background: isNotice ? `${C.rose}25` : `${C.orange}22`, borderRadius: 8, width: 32, height: 32, display: "flex", alignItems: "center", justifyContent: "center", marginTop: 2 }}>
                          {isNotice ? <Megaphone size={14} color={C.rose} /> : <Bell size={14} color={C.orange} />}
                        </div>
                        <div style={{ minWidth: 0 }}>
                          <span style={{ fontSize: 11, fontWeight: 600, color: isNotice ? C.rose : C.orange, textTransform: "uppercase", letterSpacing: "0.5px" }}>
                            {isNotice ? "Notice" : "Announcement"}
                          </span>
                          <p style={{ fontWeight: 600, color: C.dark, fontSize: 13, margin: "3px 0 0", lineHeight: 1.45 }}>{item.title}</p>
                          {item.description && (
                            <p style={{ color: C.secondary, fontSize: 12, margin: "4px 0 0", lineHeight: 1.55 }}>
                              {item.description.slice(0, 90)}{item.description.length > 90 ? "…" : ""}
                            </p>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </aside>
        </div>
      </div>

      <style>{`
        @media (max-width: 768px) {
          .events-page-layout { grid-template-columns: 1fr !important; }
        }
      `}</style>
      <Footer />
    </div>
  );
}
