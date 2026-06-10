import { useEffect, useState } from "react";
import { Bell, Clock, MapPin, Megaphone } from "lucide-react";
import { Link } from "react-router-dom";
import API from "../services/api";
import EventCard from "./EventCard";

const C = {
  cream: "#FDF6EC",
  orange: "#E8943A",
  dark: "#1C1C1E",
  secondary: "#5A5A6A",
  rose: "#C4A0A0",
};

const TABS = ["All", "Events", "Workshops"];

// preview=true  → Home: max 3 upcoming, no tabs
// preview=false → AllEvents: all events, category tabs
const fmtDateShort = (d) =>
  d ? new Date(d).toLocaleDateString("en-IN", { day: "2-digit", month: "short" }) : "";

export default function EventsSection({ preview = false }) {
  const [events, setEvents] = useState([]);
  const [yatras, setYatras] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState("All");

  useEffect(() => {
    API.get("/announcements/events/home/")
      .then(r => setEvents(r.data))
      .catch(() => {})
      .finally(() => setLoading(false));
    API.get("/yatra/list/")
      .then(r => setYatras(r.data.filter(y => !y.close_yatra && y.is_registration_open)))
      .catch(() => {});
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

  const announcements = events.filter(e => e.category === "announcement" || e.category === "notice");
  const yatraItems = yatras.map(y => ({
    id: `yatra-${y.id}`,
    yatraId: y.id,
    category: "yatra",
    title: `${y.title} — Registrations Open${y.start_date ? ` from ${fmtDateShort(y.start_date)}` : ""}!`,
  }));
  const sideItems = [...announcements, ...yatraItems];

  const filtered = preview
    ? imageEvents.filter(e => new Date(e.start_datetime) >= now).slice(0, 3)
    : tab === "Workshops" ? imageEvents.filter(e => e.category === "workshop")
    : tab === "Events" ? imageEvents.filter(e => !e.category || e.category === "event")
    : imageEvents;

  const featuredIdx = filtered.findIndex(e => new Date(e.start_datetime) >= now);

  return (
    <div>
      {!preview && (
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 32 }}>
          {TABS.map(t => (
            <button key={t} onClick={() => setTab(t)}
              style={{ padding: "7px 18px", borderRadius: 999, fontWeight: 600, fontSize: 13, cursor: "pointer", border: `1px solid ${tab === t ? C.orange : `${C.orange}44`}`, background: tab === t ? C.orange : "transparent", color: tab === t ? "#FDF6EC" : C.dark, transition: "all 0.15s" }}>
              {t}
            </button>
          ))}
        </div>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "1fr 300px", gap: 32, alignItems: "start" }} className="events-section-layout">

        <div>
          {loading ? (
            <div style={{ textAlign: "center", padding: "60px 0", color: C.secondary }}>
              <Clock size={32} style={{ marginBottom: 12, opacity: 0.4 }} />
              <p>Loading events…</p>
            </div>
          ) : filtered.length === 0 ? (
            <div style={{ borderRadius: 12, border: `1px solid ${C.orange}33`, background: C.cream, padding: 20, display: "flex", alignItems: "center", gap: 12 }}>
              <div style={{ flexShrink: 0, background: `${C.rose}25`, borderRadius: 8, width: 36, height: 36, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Megaphone size={16} color={C.rose} />
              </div>
              <div>
                <span style={{ color: C.secondary, fontSize: 11 }}>Notice</span>
                <h4 style={{ fontWeight: 600, color: C.dark, fontSize: 13, margin: "2px 0 0" }}>Stay tuned for upcoming events</h4>
              </div>
            </div>
          ) : (
            <div
              className="ev-masonry"
              style={{
                "--cols-desktop": Math.min(filtered.length, 3),
                "--cols-tablet": Math.min(filtered.length, 2),
              }}
            >
              {filtered.map((ev, i) => (
                <div key={ev.id} className="ev-masonry-item">
                  <EventCard ev={ev} isFeatured={i === featuredIdx} horizontal={filtered.length === 1} />
                </div>
              ))}
            </div>
          )}
        </div>

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
                  const isYatra = item.category === "yatra";
                  const accentColor = isNotice ? C.rose : isYatra ? "#4A6FA5" : C.orange;
                  const bgColor = isNotice ? `${C.rose}25` : isYatra ? "#4A6FA520" : `${C.orange}22`;
                  const label = isNotice ? "Notice" : isYatra ? "Yatra" : "Announcement";
                  const inner = (
                    <>
                      <div style={{ flexShrink: 0, background: bgColor, borderRadius: 8, width: 32, height: 32, display: "flex", alignItems: "center", justifyContent: "center", marginTop: 2 }}>
                        {isNotice ? <Megaphone size={14} color={accentColor} /> : isYatra ? <MapPin size={14} color={accentColor} /> : <Bell size={14} color={accentColor} />}
                      </div>
                      <div style={{ minWidth: 0 }}>
                        <span style={{ fontSize: 11, fontWeight: 600, color: accentColor, letterSpacing: "0.5px" }}>
                          {label}
                        </span>
                        <p style={{ fontWeight: 600, color: C.dark, fontSize: 13, margin: "3px 0 0", lineHeight: 1.45 }}>{item.title}</p>
                        {item.description && (
                          <p style={{ color: C.secondary, fontSize: 12, margin: "4px 0 0", lineHeight: 1.55 }}>
                            {item.description.slice(0, 90)}{item.description.length > 90 ? "…" : ""}
                          </p>
                        )}
                      </div>
                    </>
                  );
                  const rowStyle = { padding: "14px 18px", borderBottom: i < sideItems.length - 1 ? `1px solid ${C.orange}18` : "none", display: "flex", gap: 12, alignItems: "flex-start" };
                  return isYatra ? (
                    <Link key={item.id} to="/yatras" style={{ ...rowStyle, textDecoration: "none", transition: "background 0.15s" }}
                      onMouseEnter={e => e.currentTarget.style.background = `${C.orange}08`}
                      onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                      {inner}
                    </Link>
                  ) : (
                    <div key={item.id} style={rowStyle}>{inner}</div>
                  );
                })}
              </div>
            )}
          </div>
        </aside>
      </div>

      <style>{`
        .ev-masonry { columns: var(--cols-desktop, 3); column-gap: 20px; }
        .ev-masonry-item { break-inside: avoid; margin-bottom: 20px; }
        @media (max-width: 900px) { .ev-masonry { columns: var(--cols-tablet, 2); } }
        @media (max-width: 480px) { .ev-masonry { columns: 1; } }
        @media (max-width: 768px) { .events-section-layout { grid-template-columns: 1fr !important; } }
      `}</style>
    </div>
  );
}
