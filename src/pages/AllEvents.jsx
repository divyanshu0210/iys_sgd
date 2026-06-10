import { useEffect, useState } from "react";
import { Bell, Megaphone, Clock } from "lucide-react";
import API from "../services/api";
import { useAuth } from "../context/AuthContext";
import Footer from "../components/Footer";
import EventCard from "../components/EventCard";

const C = {
  cream: "#FDF6EC",
  orange: "#E8943A",
  dark: "#1C1C1E",
  secondary: "#5A5A6A",
  rose: "#C4A0A0",
};

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
              <div className="events-masonry">
                {(() => {
                  const now = new Date();
                  const featuredIdx = filtered.findIndex(e => new Date(e.start_datetime) >= now);
                  return filtered.map((ev, i) => (
                    <div key={ev.id} style={{ breakInside: "avoid", marginBottom: 20 }}>
                      <EventCard ev={ev} isFeatured={i === featuredIdx} />
                    </div>
                  ));
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
        .events-masonry { columns: 3; column-gap: 20px; }
        @media (max-width: 900px) { .events-masonry { columns: 2; } }
        @media (max-width: 560px) { .events-masonry { columns: 1; } }
        @media (max-width: 768px) { .events-page-layout { grid-template-columns: 1fr !important; } }
      `}</style>
      <Footer />
    </div>
  );
}
