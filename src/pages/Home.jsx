import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import API from "../services/api";
import Modal from "../components/Modal";
import ProfileApprovalForm from "./Profile/ProfileApprovalForm";
import Footer from "../components/Footer";
import {
  ArrowRight, Bell, BookOpen, Building2, Calendar, Clock,
  Globe, Heart, Images, Leaf, MapPin, Megaphone, Mic, Music,
  Phone, Play, Users, Utensils, Zap,
} from "lucide-react";

const C = {
  cream: "#FDF6EC",
  orange: "#E8943A",
  dark: "#1C1C1E",
  secondary: "#5A5A6A",
  navy: "#1A2744",
  beige: "#F0E8DC",
  rose: "#C4A0A0",
};

const HERO_IMG = "/hero.png";

const GALLERY = [
  {
    src: "https://images.unsplash.com/photo-1606298855672-3efb63017be8?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=800",
    label: "Khajuraho Temple Yatra", sub: "March 2025 · 48 Devotees", wide: true,
  },
  {
    src: "https://images.unsplash.com/photo-1667162862361-e2dbce58db05?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=600",
    label: "Vrindavan Dham",
  },
  {
    src: "https://images.unsplash.com/photo-1603228254119-e6a4d095dc59?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=600",
    label: "Holi Mahotsav",
  },
  {
    src: "https://images.unsplash.com/photo-1724433789678-2ac769239bbb?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=600",
    label: "Ganga Aarti, Haridwar",
  },
  {
    src: "https://images.unsplash.com/photo-1522075782449-e45a34f1ddfb?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=600",
    label: "Meditation Retreat",
  },
];

const ACTIVITIES = [
  { icon: BookOpen, title: "Spiritual Education", desc: "Structured courses on Bhagavad Gita, Srimad Bhagavatam, and Vedic philosophy.", accent: C.orange },
  { icon: Music, title: "Kirtan & Bhajan", desc: "Weekly kirtan sessions, bhajan workshops, and musical training in devotional arts.", accent: C.orange },
  { icon: Heart, title: "Community Service", desc: "Food distribution, outreach programs, and social welfare activities led by youth.", accent: C.rose },
  { icon: Globe, title: "Sacred Pilgrimages", desc: "Guided spiritual tours to Vrindavan, Mayapur, Tirupati, and other holy dhams.", accent: C.orange },
  { icon: Users, title: "Youth Camps", desc: "Residential camps combining adventure, team-building, and spiritual practices.", accent: C.rose },
  { icon: Leaf, title: "Yoga & Wellness", desc: "Daily yoga, pranayama, and meditation sessions for physical and spiritual well-being.", accent: C.rose },
  { icon: Mic, title: "Seminars & Talks", desc: "Inspiring talks by senior devotees and leadership development programs.", accent: C.orange },
  { icon: Utensils, title: "Prasadam Seva", desc: "Learn the art of cooking sanctified food and participate in prasadam distribution.", accent: C.orange },
];

const CENTRES = [
  {
    name: "Vrindavan Bace",
    location: "Vrindavan, UP",
    desc: "A vibrant spiritual home for youth — daily kirtans, classes, mentoring & seva opportunities.",
    phone: "+919075080391",
    map: "https://maps.app.goo.gl/y1KSdUnGKirjerqq9",
    hours: "Mon–Sun: 5:00 AM – 9:00 PM",
  },
  {
    name: "Giri Govardhan Bace",
    location: "Govardhan, UP",
    desc: "Special programs for college students — weekly sessions, group discussions & retreats.",
    phone: "+917774032548",
    map: "https://maps.app.goo.gl/KpmwWMBxfpRdafxHA",
    hours: "Mon–Sun: 5:00 AM – 8:30 PM",
  },
  {
    name: "Mayapur Bace",
    location: "Mayapur, WB",
    desc: "Special programs for college students to connect, grow, and study the Gita together.",
    phone: "+917774048503",
    map: "https://maps.app.goo.gl/ygcFt7Scu8KjUu8T6",
    hours: "Mon–Sun: 5:30 AM – 8:00 PM",
  },
];

function useAutoSlider(intervalMs = 3200) {
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current;
    if (!el || window.innerWidth > 768) return;
    const advance = () => {
      const itemW = (el.firstElementChild?.offsetWidth || 260) + 16;
      const maxScroll = el.scrollWidth - el.clientWidth;
      if (el.scrollLeft >= maxScroll - 8) {
        el.scrollTo({ left: 0, behavior: "smooth" });
      } else {
        el.scrollBy({ left: itemW, behavior: "smooth" });
      }
    };
    const timer = setInterval(advance, intervalMs);
    return () => clearInterval(timer);
  }, [intervalMs]);
  return ref;
}

function SectionLabel({ text }) {
  return (
    <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: 12, marginBottom: 16 }}>
      <div style={{ background: C.orange, width: 32, height: 1 }} />
      <span style={{ fontWeight: 700, textTransform: "uppercase", color: C.orange, fontSize: 13, letterSpacing: "4px" }}>{text}</span>
      <div style={{ background: C.orange, width: 32, height: 1 }} />
    </div>
  );
}

function OutlineBtn({ children, onClick, style }) {
  return (
    <button
      onClick={onClick}
      style={{
        display: "inline-flex", alignItems: "center", gap: 8,
        padding: "10px 28px", borderRadius: 12, fontWeight: 600, fontSize: 14,
        background: C.cream, color: C.dark,
        border: `1px solid ${C.orange}4D`, cursor: "pointer",
        ...style,
      }}
    >
      {children}
    </button>
  );
}

export default function Home() {
  const { user, profile, profileStage, loading, setDonatePage } = useAuth();
  const navigate = useNavigate();
  const [openApprovalModal, setOpenApprovalModal] = useState(false);
  const [openPendingModal, setOpenPendingModal] = useState(false);
  const [events, setEvents] = useState([]);
  const [yatras, setYatras] = useState([]);

  useEffect(() => {
    setDonatePage(true);
    if (loading) return;
    if (user && profileStage === "not-exists") navigate("/complete-profile", { replace: true });
    return () => setDonatePage(false);
  }, [user, profileStage, loading, navigate]);

  useEffect(() => {
    API.get("/announcements/events/home/").then(r => setEvents(r.data)).catch(() => {});
    API.get("/yatra/list/").then(r => setYatras(r.data.filter(y => !y.close_yatra).slice(0, 3))).catch(() => {});
  }, []);

  const handleYatraClick = (e, yatra) => {
    const requiresApproval = yatra.registration_policy?.requires_approval !== false;
    if (requiresApproval) {
      if (profileStage === "guest") { e.preventDefault(); setOpenApprovalModal(true); return; }
      if (profileStage === "approval") { e.preventDefault(); setOpenPendingModal(true); return; }
    }
    const minRounds = yatra.registration_policy?.min_chanting_rounds || 0;
    if (minRounds > 0 && (profile?.no_of_chanting_rounds || 0) < minRounds) {
      e.preventDefault();
      alert(`You need a minimum of ${minRounds} chanting rounds to register for this Yatra. You currently have ${profile?.no_of_chanting_rounds || 0} rounds.`);
    }
  };

  useEffect(() => {
    const el = document.getElementById("navbar");
    if (el) {
      const update = () => document.documentElement.style.setProperty("--navbar-h", `${el.offsetHeight}px`);
      update();
      window.addEventListener("resize", update);
      return () => window.removeEventListener("resize", update);
    }
  }, []);

  const activitiesRef = useAutoSlider(3200);
  const galleryRef = useAutoSlider(3600);
  const [actIdx, setActIdx] = useState(0);
  const [galIdx, setGalIdx] = useState(0);
  const [imgOrient, setImgOrient] = useState({});

  const handleImgLoad = (id, e) => {
    const { naturalWidth: w, naturalHeight: h } = e.target;
    setImgOrient(prev => ({ ...prev, [id]: w >= h ? "landscape" : "portrait" }));
  };

  const handleSliderScroll = (e, setter) => {
    const el = e.currentTarget;
    const itemW = el.firstElementChild?.offsetWidth || 1;
    setter(Math.round(el.scrollLeft / itemW));
  };

  const fmtDate = (d) => d ? new Date(d).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) : "";
  const fmtDateShort = (d) => d ? new Date(d).toLocaleDateString("en-IN", { day: "2-digit", month: "short" }) : "";
  const getDaysToGo = (dateStr) => {
    const diff = new Date(dateStr) - new Date();
    if (diff <= 0) return null;
    const days = Math.floor(diff / 86400000);
    return days === 0 ? "Today" : `${days} day${days > 1 ? "s" : ""} to go`;
  };

  // Image cards: future events first (soonest → latest), then past events
  const now = new Date();
  const imageCards = [...events]
    .filter(e => !e.category || e.category === "event" || e.category === "workshop")
    .sort((a, b) => {
      const aDate = new Date(a.start_datetime);
      const bDate = new Date(b.start_datetime);
      const aFuture = aDate >= now;
      const bFuture = bDate >= now;
      if (aFuture && !bFuture) return -1;
      if (!aFuture && bFuture) return 1;
      return aFuture ? aDate - bDate : bDate - aDate;
    });

  const announcementEvents = events.filter(
    e => e.category === "announcement" || e.category === "notice"
  );

  return (
    <div style={{ background: C.cream, color: C.dark, minHeight: "100vh", overflowX: "hidden" }}>

      {/* ── Auth banners ─────────────────────────────────────── */}
      {/* {profileStage === "guest" && (
        <div style={{ background: "#fff3cd", border: "1px solid #ffeaa7", padding: "0.9rem 1.5rem", textAlign: "center" }}>
          <strong>Get Approved!</strong> To access all features, get your profile approved by your mentor.
          <button onClick={() => setOpenApprovalModal(true)} style={{ marginLeft: 12, background: C.orange, color: "#fff", border: "none", padding: "6px 16px", borderRadius: 6, cursor: "pointer", fontWeight: 600 }}>
            Get Approved
          </button>
        </div>
      )}
      {profileStage === "approval" && (
        <div style={{ background: "#fff3cd", border: "1px solid #ffeaa7", padding: "0.9rem 1.5rem", textAlign: "center" }}>
          <strong>Approval Pending:</strong> Your profile has been submitted. You'll get full access once confirmed.
        </div>
      )} */}

      {/* ── HERO ─────────────────────────────────────────────── */}
      <section style={{ position: "relative", width: "100%", display: "flex", flexDirection: "column" }} className="hero-section-new">
        <img src={HERO_IMG} alt="Temple" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", objectPosition: "center" }} />
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to right, rgba(10,15,35,0.82) 0%, rgba(10,15,35,0.55) 85%, rgba(10,15,35,0.18) 100%)" }} />
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(253,246,236,0.65) 0%, transparent 25%)" }} />

        <div style={{ position: "relative", zIndex: 2, flex: 1, maxWidth: 1140, width: "100%", margin: "0 auto", padding: "clamp(40px, 8vw, 80px) clamp(16px, 3vw, 24px) clamp(24px, 4vw, 40px)", display: "flex", flexDirection: "column", justifyContent: "center" }} className="hero-content">
          <div style={{ maxWidth: 640 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 24 }}>
              <span style={{ fontWeight: 600, textTransform: "uppercase", color: C.orange, fontSize: 11, letterSpacing: "3.2px" }}>ISKCON Youth Services · Sri Govind Dham</span>
            </div>
            <h1 style={{ fontFamily: "'Source Serif 4', Georgia, serif", fontWeight: 700, color: "#FDF6EC", fontSize: "clamp(2.4rem, 6vw, 4.2rem)", lineHeight: 1.12, letterSpacing: "-0.02em", marginBottom: 24 }}>
              Ignite Your<br />
              <span style={{ color: C.orange }}>Spiritual Journey</span>
            </h1>
            <p style={{ color: "rgba(253,246,236,0.75)", fontSize: "clamp(1rem, 2vw, 1.2rem)", lineHeight: 1.7, marginBottom: 40, maxWidth: 480 }}>
              Connect with a vibrant community of young devotees. Explore sacred pilgrimages, spiritual education, and transformative experiences rooted in Vedic wisdom.
            </p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 16, alignItems: "center" }}>
              <button
                onClick={() => document.getElementById("centres-section")?.scrollIntoView({ behavior: "smooth" })}
                style={{ background: C.orange, color: "#FDF6EC", border: "none", borderRadius: 12, padding: "14px 32px", fontWeight: 700, fontSize: 16, cursor: "pointer" }}
              >
                Join Youth Programs
              </button>
              <button
                onClick={() => document.getElementById("trips-section")?.scrollIntoView({ behavior: "smooth" })}
                style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "rgba(253,246,236,0.1)", color: "#FDF6EC", border: "1px solid rgba(253,246,236,0.3)", borderRadius: 12, padding: "14px 32px", fontWeight: 600, fontSize: 16, textDecoration: "none", cursor: "pointer" }}
              >
                <Play size={16} fill="#FDF6EC" />
                View Upcoming Retreats
              </button>
            </div>
          </div>
        </div>

        {/* Stats bar — in flow, always visible */}
        <div style={{ position: "relative", zIndex: 2, padding: "16px clamp(16px, 3vw, 24px) clamp(20px, 4vw, 36px)" }} className="hero-stats-bar">
          <div style={{ maxWidth: 900, margin: "0 auto", display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16, textAlign: "center" }} className="hero-stats-grid">
            {[["500+", "Youth Members"], ["20+", "Sacred Trips"], ["3", "Active Centres"], ["50+", "Events Yearly"]].map(([num, label]) => (
              <div key={label}>
                <p style={{ fontWeight: 800, color: "#FDF6EC", fontSize: "clamp(1.4rem, 3vw, 1.9rem)", margin: 0 }}>{num}</p>
                <p style={{ color: "rgba(253,246,236,0.6)", fontSize: 13, marginTop: 4 }}>{label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── EVENTS & ANNOUNCEMENTS ───────────────────────────── */}
      <section style={{ maxWidth: 1140, margin: "0 auto", padding: "clamp(36px, 8vw, 80px) clamp(16px, 3vw, 24px)" }}>
        <div style={{ textAlign: "center", marginBottom: "clamp(28px, 5vw, 56px)" }}>
          <SectionLabel text="Events & Announcements" />
          <h2 style={{ fontFamily: "'Source Serif 4', Georgia, serif", fontWeight: 700, fontSize: "clamp(2.2rem, 4.5vw, 3.4rem)", letterSpacing: "-0.03em", marginBottom: 16 }}>What's Happening</h2>
          <p style={{ color: C.secondary, fontSize: 16, lineHeight: 1.7, maxWidth: 480, margin: "0 auto" }}>
            Stay updated with our latest events, festivals, and spiritual gatherings.
          </p>
        </div>

        {(() => {
          const pillItems = [
            ...announcementEvents,
            ...yatras.map(y => ({
              id: `yatra-${y.id}`,
              category: "announcement",
              title: `${y.title} Yatra — Registrations Open${y.start_date ? ` from ${fmtDateShort(y.start_date)}` : ""}!`,
            })),
          ];

          const imgCount = imageCards.length;
          const gridCols =
            imgCount <= 1 ? "1fr" :
            imgCount === 2 ? "3fr 2fr" :
            imgCount <= 4 ? "3fr 2fr" :
            "repeat(3, 1fr)";
          const firstRowSpan = imgCount >= 3 ? 2 : 1;
          const firstColSpan = imgCount >= 5 ? 2 : 1;

          return (
            <>
              {/* ── Image cards grid ── */}
              {imgCount > 0 && (
                <div style={{ display: "grid", gridTemplateColumns: gridCols, gap: 20, alignItems: "start" }} className="events-image-grid">
                  {imageCards.map((ev, idx) => {
                    const isFeatured = idx === 0;
                    const isPortrait = imgOrient[ev.id] === "portrait";
                    const imgSrc = ev.poster || ev.youtube_thumbnail ||
                      (isFeatured
                        ? "https://images.unsplash.com/photo-1603228254119-e6a4d095dc59?w=800&q=80"
                        : "https://images.unsplash.com/photo-1651077837628-52b3247550ae?w=600&q=80");
                    const isUpcoming = new Date(ev.start_datetime) >= now;
                    const badge = ev.status === "live" ? "🔴 Live Now"
                      : (isFeatured && isUpcoming) ? "Upcoming Next"
                      : ev.category === "workshop" ? "Workshop"
                      : ev.event_type === "online" ? "Online"
                      : ev.event_type === "hybrid" ? "Hybrid" : "Event";
                    const cellStyle = {
                      ...(idx === 0 && firstRowSpan > 1 ? { gridRow: `span ${firstRowSpan}` } : {}),
                      ...(idx === 0 && firstColSpan > 1 ? { gridColumn: `span ${firstColSpan}` } : {}),
                    };
                    const shadow = isFeatured ? "0 4px 16px rgba(0,0,0,0.07)" : "0 2px 8px rgba(0,0,0,0.05)";

                    // Side cards (not upcoming next): always compact horizontal
                    if (!isFeatured) {
                      return (
                        <div key={ev.id} style={{ ...cellStyle, display: "flex", borderRadius: 16, border: `1px solid ${C.orange}33`, overflow: "hidden", background: "#fff", boxShadow: shadow }}>
                          <div style={{ position: "relative", width: "36%", flexShrink: 0, maxHeight: 160, overflow: "hidden" }}>
                            <img src={imgSrc} alt={ev.title} onLoad={e => handleImgLoad(ev.id, e)} style={{ width: "100%", height: "auto", display: "block" }} />
                            <div style={{ position: "absolute", top: 8, left: 8 }}>
                              <span style={{ background: "rgba(196,160,160,0.9)", color: "#FDF6EC", fontWeight: 700, fontSize: 10, padding: "3px 10px", borderRadius: 999 }}>{badge}</span>
                            </div>
                          </div>
                          <div style={{ flex: 1, background: C.cream, padding: "12px 14px", display: "flex", flexDirection: "column", justifyContent: "space-between", gap: 6 }}>
                            <div>
                              <p style={{ fontWeight: 700, color: C.dark, fontSize: 13, letterSpacing: "-0.01em", margin: "0 0 4px", lineHeight: 1.4 }}>{ev.title}</p>
                              {ev.start_datetime && (
                                <span style={{ color: C.secondary, fontSize: 11, display: "flex", alignItems: "center", gap: 3 }}>
                                  <Calendar size={11} /> {fmtDate(ev.start_datetime)}
                                </span>
                              )}
                              <p style={{ color: C.secondary, fontSize: 12, lineHeight: 1.6, margin: "5px 0 0" }}>
                                {ev.description?.slice(0, 80)}{ev.description?.length > 80 ? "…" : ""}
                              </p>
                            </div>
                            {ev.registration_link && (
                              <a href={ev.registration_link} target="_blank" rel="noreferrer" style={{ background: `${C.orange}22`, color: C.orange, borderRadius: 6, padding: "4px 12px", fontWeight: 600, fontSize: 11, textDecoration: "none", display: "inline-block", width: "fit-content" }}>Learn More</a>
                            )}
                          </div>
                        </div>
                      );
                    }

                    // Upcoming Next card: portrait or landscape
                    return isPortrait ? (
                      <div key={ev.id} style={{ ...cellStyle, display: "flex", borderRadius: 16, border: `1px solid ${C.orange}33`, overflow: "hidden", background: "#fff", boxShadow: shadow }} className="portrait-event-card">
                        <div style={{ position: "relative", width: "38%", flexShrink: 0 }} className="portrait-img-col">
                          <img src={imgSrc} alt={ev.title} onLoad={e => handleImgLoad(ev.id, e)} style={{ width: "100%", height: "auto", display: "block" }} />
                          <div style={{ position: "absolute", top: 12, left: 12 }}>
                            <span style={{ background: C.orange, color: "#FDF6EC", fontWeight: 700, fontSize: 11, padding: "4px 12px", borderRadius: 999 }}>{badge}</span>
                          </div>
                          {ev.status === "upcoming" && ev.start_datetime && getDaysToGo(ev.start_datetime) && (
                            <div style={{ position: "absolute", top: 12, right: 12, background: "rgba(52,152,219,0.92)", color: "#fff", fontWeight: 700, fontSize: 11, padding: "4px 12px", borderRadius: 999, display: "flex", alignItems: "center", gap: 5 }}>
                              <Calendar size={11} /> {getDaysToGo(ev.start_datetime)}
                            </div>
                          )}
                        </div>
                        <div style={{ flex: 1, background: C.cream, padding: 24, display: "flex", flexDirection: "column", justifyContent: "space-between", gap: 16 }}>
                          <div>
                            <h3 style={{ fontWeight: 700, color: C.dark, fontSize: 20, letterSpacing: "-0.02em", margin: "0 0 10px" }}>{ev.title}</h3>
                            <div style={{ display: "flex", flexDirection: "column", gap: 4, marginBottom: 10 }}>
                              {ev.start_datetime && (
                                <span style={{ color: C.secondary, fontSize: 12, display: "flex", alignItems: "center", gap: 4 }}>
                                  <Calendar size={12} /> {fmtDate(ev.start_datetime)}
                                </span>
                              )}
                              {ev.location_name && (
                                <span style={{ color: C.secondary, fontSize: 12, display: "flex", alignItems: "center", gap: 4 }}>
                                  <MapPin size={12} /> {ev.location_name}
                                </span>
                              )}
                            </div>
                            <p style={{ color: C.secondary, fontSize: 14, lineHeight: 1.75, margin: 0 }}>
                              {ev.description?.slice(0, 180)}{ev.description?.length > 180 ? "…" : ""}
                            </p>
                          </div>
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 10 }}>
                            {ev.registration_link
                              ? <a href={ev.registration_link} target="_blank" rel="noreferrer" style={{ background: C.orange, color: "#FDF6EC", borderRadius: 8, padding: "8px 24px", fontWeight: 600, fontSize: 14, textDecoration: "none", display: "inline-block" }}>Register Now</a>
                              : <span style={{ background: `${C.orange}18`, color: C.orange, border: `1px solid ${C.orange}44`, borderRadius: 8, padding: "8px 24px", fontWeight: 600, fontSize: 14, display: "inline-block" }}>Open to All</span>
                            }
                            {ev.end_datetime && <span style={{ color: C.secondary, fontSize: 12 }}>Ends {fmtDate(ev.end_datetime)}</span>}
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div key={ev.id} style={{ ...cellStyle, display: "flex", flexDirection: "column", borderRadius: 16, border: `1px solid ${C.orange}33`, overflow: "hidden", background: "#fff", boxShadow: shadow }}>
                        <div style={{ position: "relative" }}>
                          <img src={imgSrc} alt={ev.title} onLoad={e => handleImgLoad(ev.id, e)} style={{ width: "100%", height: "auto", display: "block" }} />
                          <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(10,15,35,0.80) 0%, transparent 55%)" }} />
                          <div style={{ position: "absolute", top: 12, left: 12 }}>
                            <span style={{ background: C.orange, color: "#FDF6EC", fontWeight: 700, fontSize: 11, padding: "4px 12px", borderRadius: 999 }}>{badge}</span>
                          </div>
                          {ev.status === "upcoming" && ev.start_datetime && getDaysToGo(ev.start_datetime) && (
                            <div style={{ position: "absolute", top: 12, right: 12, background: "rgba(52,152,219,0.92)", color: "#fff", fontWeight: 700, fontSize: 11, padding: "4px 12px", borderRadius: 999, display: "flex", alignItems: "center", gap: 5 }}>
                              <Calendar size={11} /> {getDaysToGo(ev.start_datetime)}
                            </div>
                          )}
                          <div style={{ position: "absolute", bottom: 12, left: 14, right: 14 }}>
                            <h3 style={{ fontWeight: 700, color: "#FDF6EC", fontSize: 21, letterSpacing: "-0.02em", margin: 0 }}>{ev.title}</h3>
                            <div style={{ display: "flex", gap: 14, marginTop: 6, flexWrap: "wrap" }}>
                              {ev.start_datetime && (
                                <span style={{ color: "rgba(253,246,236,0.75)", fontSize: 12, display: "flex", alignItems: "center", gap: 4 }}>
                                  <Calendar size={12} /> {fmtDate(ev.start_datetime)}
                                </span>
                              )}
                              {ev.location_name && (
                                <span style={{ color: "rgba(253,246,236,0.75)", fontSize: 12, display: "flex", alignItems: "center", gap: 4 }}>
                                  <MapPin size={12} /> {ev.location_name}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                        <div style={{ background: C.cream, padding: 24, display: "flex", flexDirection: "column", gap: 14, justifyContent: "space-between" }}>
                          <p style={{ color: C.secondary, fontSize: 15, lineHeight: 1.75, margin: 0 }}>
                            {ev.description?.slice(0, 180)}{ev.description?.length > 180 ? "…" : ""}
                          </p>
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
                            {ev.registration_link
                              ? <a href={ev.registration_link} target="_blank" rel="noreferrer" style={{ background: C.orange, color: "#FDF6EC", borderRadius: 8, padding: "8px 24px", fontWeight: 600, fontSize: 14, textDecoration: "none", display: "inline-block" }}>Register Now</a>
                              : <span style={{ background: `${C.orange}18`, color: C.orange, border: `1px solid ${C.orange}44`, borderRadius: 8, padding: "8px 24px", fontWeight: 600, fontSize: 14, display: "inline-block" }}>Open to All</span>
                            }
                            {ev.end_datetime && <span style={{ color: C.secondary, fontSize: 12 }}>Ends {fmtDate(ev.end_datetime)}</span>}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* ── Pills row (announcements, notices, yatras) ── */}
              {pillItems.length > 0 && (
                <div style={{ display: "flex", flexWrap: "wrap", gap: 14, marginTop: imgCount > 0 ? 20 : 0 }}>
                  {pillItems.map(ev => {
                    const isNotice = ev.category === "notice";
                    return (
                      <div key={ev.id} style={{ flex: "1 1 280px", borderRadius: 12, border: `1px solid ${isNotice ? C.rose : C.orange}33`, background: C.cream, padding: 16, display: "flex", alignItems: "flex-start", gap: 12, boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}>
                        <div style={{ flexShrink: 0, background: isNotice ? `${C.rose}25` : `${C.orange}22`, borderRadius: 8, width: 36, height: 36, display: "flex", alignItems: "center", justifyContent: "center" }}>
                          {isNotice ? <Megaphone size={16} color={C.rose} /> : <Bell size={16} color={C.orange} />}
                        </div>
                        <div>
                          <span style={{ color: C.secondary, fontSize: 12 }}>{isNotice ? "Notice" : "Announcement"}</span>
                          <h4 style={{ fontWeight: 600, color: C.dark, fontSize: 15, letterSpacing: "-0.01em", margin: "3px 0 0" }}>{ev.title}</h4>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* ── Empty state ── */}
              {events.length === 0 && yatras.length === 0 && (
                <div style={{ borderRadius: 12, border: `1px solid ${C.orange}33`, background: C.cream, padding: 20, display: "flex", alignItems: "center", gap: 12 }}>
                  <div style={{ flexShrink: 0, background: `${C.rose}25`, borderRadius: 8, width: 36, height: 36, display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <Megaphone size={16} color={C.rose} />
                  </div>
                  <div>
                    <span style={{ color: C.secondary, fontSize: 11 }}>Notice</span>
                    <h4 style={{ fontWeight: 600, color: C.dark, fontSize: 13, margin: "2px 0 0" }}>Stay tuned for upcoming announcements</h4>
                  </div>
                </div>
              )}
            </>
          );
        })()}

        <div style={{ display: "flex", justifyContent: "center", marginTop: "clamp(25px, 4vw, 48px)" }}>
          <OutlineBtn>
            View All Events <ArrowRight size={16} />
          </OutlineBtn>
        </div>
      </section>

      {/* ── ACTIVITIES ───────────────────────────────────────── */}
      <section style={{ background: C.navy, padding: "clamp(36px, 8vw, 80px) 0", width: "100%", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse at top right, rgba(232,148,58,0.12) 0%, transparent 60%)" }} />
        <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse at bottom left, rgba(196,160,160,0.08) 0%, transparent 60%)" }} />
        <div style={{ maxWidth: 1140, margin: "0 auto", padding: "0 clamp(16px, 3vw, 24px)", position: "relative", zIndex: 1 }}>
          <div style={{ textAlign: "center", marginBottom: "clamp(28px, 5vw, 56px)" }}>
            <SectionLabel text="What We Offer" />
            <h2 style={{ fontFamily: "'Source Serif 4', Georgia, serif", fontWeight: 700, fontSize: "clamp(2.2rem, 4.5vw, 3.4rem)", color: "#FDF6EC", letterSpacing: "-0.03em", marginBottom: 16 }}>Activities for Youth</h2>
            <p style={{ color: "rgba(253,246,236,0.6)", fontSize: 16, lineHeight: 1.7, maxWidth: 480, margin: "0 auto" }}>
              Transformative programs designed to nurture spiritual growth, community bonds, and personal development.
            </p>
          </div>
          <div ref={activitiesRef} className="activities-slider" onScroll={e => handleSliderScroll(e, setActIdx)}>
            {ACTIVITIES.map(({ icon: Icon, title, desc, accent }) => (
              <div key={title} style={{ borderRadius: 16, background: "rgba(253,246,236,0.05)", border: "1px solid rgba(232,148,58,0.15)", padding: 24, display: "flex", flexDirection: "column", gap: 16 }}>
                <div style={{ borderRadius: 12, background: `${accent}22`, width: 48, height: 48, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <Icon size={22} color={accent} />
                </div>
                <h3 style={{ fontWeight: 700, color: "#FDF6EC", fontSize: 17, letterSpacing: "-0.01em", margin: 0 }}>{title}</h3>
                <p style={{ color: "rgba(253,246,236,0.6)", fontSize: 14, lineHeight: 1.7, margin: 0 }}>{desc}</p>
              </div>
            ))}
          </div>
          <div className="slider-dots">
            {ACTIVITIES.map((_, i) => (
              <div key={i} className={`slider-dot${i === actIdx ? " active" : ""}`} />
            ))}
          </div>
        </div>
      </section>

      {/* ── GALLERY ──────────────────────────────────────────── */}
      <section style={{ maxWidth: 1140, margin: "0 auto", padding: "clamp(36px, 8vw, 80px) clamp(16px, 3vw, 24px)" }}>
        <div style={{ textAlign: "center", marginBottom: "clamp(28px, 5vw, 56px)" }}>
          <SectionLabel text="Our Memories" />
          <h2 style={{ fontFamily: "'Source Serif 4', Georgia, serif", fontWeight: 700, fontSize: "clamp(2.2rem, 4.5vw, 3.4rem)", letterSpacing: "-0.03em", marginBottom: 16 }}>Moments from Our Trips</h2>
          <p style={{ color: C.secondary, fontSize: 16, lineHeight: 1.7, maxWidth: 480, margin: "0 auto" }}>
            Glimpses of joy, devotion, and togetherness from our sacred journeys.
          </p>
        </div>
        <div ref={galleryRef} style={{ gap: 16 }} className="gallery-grid" onScroll={e => handleSliderScroll(e, setGalIdx)}>
          {GALLERY.map(({ src, label, sub, wide }) => (
            <div key={label} className={wide ? "gallery-item gallery-wide" : "gallery-item"} style={{ position: "relative", borderRadius: 16, overflow: "hidden" }}>
              <img src={src} alt={label} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(10,15,35,0.85) 0%, transparent 55%)" }} />
              <div style={{ position: "absolute", bottom: 16, left: 16 }}>
                <span style={{ fontWeight: 700, color: "#FDF6EC", fontSize: wide ? 15 : 13 }}>{label}</span>
                {sub && <p style={{ color: "rgba(253,246,236,0.65)", fontSize: 13, margin: "4px 0 0" }}>{sub}</p>}
              </div>
            </div>
          ))}
        </div>
        <div className="slider-dots" style={{ marginTop: 16 }}>
          {GALLERY.map((_, i) => (
            <div key={i} className={`slider-dot${i === galIdx ? " active" : ""}`} />
          ))}
        </div>
        <div style={{ display: "flex", justifyContent: "center", marginTop: 32 }}>
          <OutlineBtn>
            <Images size={16} /> View Full Gallery
          </OutlineBtn>
        </div>
      </section>

      {/* ── UPCOMING TRIPS ───────────────────────────────────── */}
      <section id="trips-section" style={{ background: C.beige, padding: "clamp(36px, 8vw, 80px) 0", position: "relative" }}>
        <div style={{ borderBottom: `1px solid ${C.orange}26`, position: "absolute", bottom: 0, left: 0, right: 0 }} />
        <div style={{ maxWidth: 1140, margin: "0 auto", padding: "0 24px" }}>
          <div style={{ textAlign: "center", marginBottom: "clamp(28px, 5vw, 56px)" }}>
            <SectionLabel text="Sacred Journeys" />
            <h2 style={{ fontFamily: "'Source Serif 4', Georgia, serif", fontWeight: 700, fontSize: "clamp(2.2rem, 4.5vw, 3.4rem)", letterSpacing: "-0.03em", marginBottom: 16 }}>Upcoming Yatras</h2>
            <p style={{ color: C.secondary, fontSize: 16, lineHeight: 1.7, maxWidth: 480, margin: "0 auto" }}>
              Embark on transformative pilgrimages to the most sacred places in India with fellow devotees.
            </p>
          </div>

          {yatras.length === 0 ? (
            <p style={{ textAlign: "center", color: C.secondary }}>No upcoming yatras at the moment.</p>
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 28 }}>
              {yatras.map(y => {
                const isOpen = Boolean(y.is_registration_open);
                const durationDays = y.start_date && y.end_date
                  ? Math.max(1, Math.round((new Date(y.end_date) - new Date(y.start_date)) / 86400000) + 1)
                  : null;
                return (
                  <div key={y.id} style={{ borderRadius: 16, background: C.cream, border: `1px solid ${C.orange}33`, overflow: "hidden", boxShadow: "0 4px 16px rgba(0,0,0,0.06)", display: "flex", flexDirection: "column" }}>
                    <div style={{ position: "relative", height: 200, overflow: "hidden" }}>
                      {y.poster ? (
                        <img src={y.poster} alt={y.title} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                      ) : (
                        <div style={{ width: "100%", height: "100%", background: `${C.orange}18`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                          <MapPin size={40} color={`${C.orange}66`} />
                        </div>
                      )}
                      <div style={{ position: "absolute", top: 12, right: 12 }}>
                        <span style={{ background: isOpen ? C.orange : "rgba(26,39,68,0.8)", color: "#FDF6EC", fontWeight: 700, fontSize: 11, padding: "4px 12px", borderRadius: 999 }}>
                          {isOpen ? "Open" : "Closed"}
                        </span>
                      </div>
                    </div>
                    <div style={{ padding: 24, display: "flex", flexDirection: "column", gap: 16, flex: 1 }}>
                      <div>
                      <h3 style={{ fontWeight: 700, color: C.dark, fontSize: 19, letterSpacing: "-0.02em", margin: 0 }}>{y.title || "Untitled Yatra"}</h3>
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
                      <div style={{ display: "flex", flexWrap: "wrap", justifyContent:'space-between', gap: 12 }}>
                        {y.start_date && (
                          <span style={{ color: C.secondary, fontSize: 12, display: "flex", alignItems: "center", gap: 4 }}>
                            <Calendar size={12} /> {fmtDateShort(y.start_date)}–{fmtDateShort(y.end_date)}
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
                      <div style={{ borderTop: `1px solid ${C.orange}62`, paddingTop: 16, display: "flex", justifyContent: "center", alignItems: "center", marginTop: "auto" }}>
                        <Link
                          to={`/yatra/${y.id}/register`}
                          state={{ yatra: y }}
                          onClick={e => handleYatraClick(e, y)}
                          style={{ background: isOpen ? C.orange : "transparent", color: isOpen ? "#FDF6EC" : C.orange, border: isOpen ? "none" : `1px solid ${C.orange}`, borderRadius: 10, padding: "8px 24px", fontWeight: 600, fontSize: 14, textDecoration: "none" }}
                        >
                          {isOpen ? "Register Now" : "View Details"}
                        </Link>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          <div style={{ display: "flex", justifyContent: "center", marginTop: 48 }}>
            <Link
              to="/yatras"
              style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "10px 28px", borderRadius: 12, fontWeight: 600, fontSize: 14, background: C.cream, color: C.dark, border: `1px solid ${C.orange}4D`, textDecoration: "none" }}
            >
              View All Yatras <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>

      {/* ── CENTRES ──────────────────────────────────────────── */}
      <section id="centres-section" style={{ maxWidth: 1140, margin: "0 auto", padding: "clamp(36px, 8vw, 80px) clamp(16px, 3vw, 24px)" }}>
        <div style={{ textAlign: "center", marginBottom: "clamp(28px, 5vw, 56px)" }}>
          <SectionLabel text="Find Us Near You" />
          <h2 style={{ fontFamily: "'Source Serif 4', Georgia, serif", fontWeight: 700, fontSize: "clamp(2.2rem, 4.5vw, 3.4rem)", letterSpacing: "-0.03em", marginBottom: 16 }}>Our Centres</h2>
          <p style={{ color: C.secondary, fontSize: 16, lineHeight: 1.7, maxWidth: 480, margin: "0 auto" }}>
            Connect with your local IYS Sri Govind Dham centre and become part of a thriving spiritual community.
          </p>
        </div>
        <div className="centres-grid">
          {CENTRES.map((c, i) => (
            <div key={c.name} className="centre-card">
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{ borderRadius: 10, background: i % 2 === 0 ? `${C.orange}18` : `${C.rose}25`, width: 38, height: 38, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <Building2 size={18} color={i % 2 === 0 ? C.orange : C.rose} />
                </div>
                <h3 style={{ fontWeight: 700, color: C.dark, fontSize: 16, letterSpacing: "-0.01em", margin: 0 }}>{c.name}</h3>
              </div>
              <p style={{ color: C.secondary, fontSize: 14, lineHeight: 1.65, margin: 0 }}>{c.desc}</p>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8, width: "100%" }}>
                <a href={`tel:${c.phone}`} style={{ borderRadius: 8, background: C.cream, color: C.dark, border: `1px solid ${C.orange}4D`, padding: "6px 10px", fontWeight: 600, fontSize: 12, textDecoration: "none", display: "flex", alignItems: "center", gap: 6, minWidth: 0 }}>
                  <Phone size={12} color={C.orange} style={{ flexShrink: 0 }} /> <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{c.phone}</span>
                </a>
                <a href={c.map} target="_blank" rel="noreferrer"
                  style={{ borderRadius: 8, background: C.cream, color: C.dark, border: `1px solid ${C.orange}4D`, padding: "6px 14px", fontWeight: 600, fontSize: 12, textDecoration: "none", whiteSpace: "nowrap", flexShrink: 0, display: "flex", alignItems: "center", gap: 6 }}>
                  <MapPin size={12} color={C.orange} style={{ flexShrink: 0 }} /> Directions
                </a>
              </div>
            </div>
          ))}
        </div>
      </section>

      <Footer />

      {/* ── MODALS ───────────────────────────────────────────── */}
      <Modal open={openApprovalModal} onClose={() => setOpenApprovalModal(false)}>
        <ProfileApprovalForm onClose={() => setOpenApprovalModal(false)} />
      </Modal>
      <Modal open={openPendingModal} onClose={() => setOpenPendingModal(false)}>
        <div style={{ textAlign: "center", padding: 24 }}>
          <h3 style={{ color: "#1E3A8A", marginBottom: 12 }}>Approval Pending</h3>
          <p style={{ fontSize: 15, color: "#444", lineHeight: 1.6 }}>
            Your profile has been submitted for approval. You'll get full access once your mentor confirms it.
          </p>
        </div>
      </Modal>

      <style>{`
        .hero-section-new { min-height: calc(100vh - var(--navbar-h, 64px)); min-height: calc(100dvh - var(--navbar-h, 64px)); }
        @media (max-width: 600px) { .hero-stats-grid { grid-template-columns: repeat(2, 1fr) !important; } }

        @media (max-width: 768px) { .events-image-grid { grid-template-columns: 1fr !important; } }
        @media (max-width: 768px) { .events-image-grid > * { grid-row: auto !important; grid-column: auto !important; } }
        @media (max-width: 768px) { .portrait-event-card { flex-direction: column !important; } }
        @media (max-width: 768px) { .portrait-img-col { width: 100% !important; } }

        /* Slider dots — mobile only */
        .slider-dots {
          display: none;
          justify-content: center;
          gap: 7px;
          margin-top: 14px;
        }
        .slider-dot {
          width: 7px; height: 7px;
          border-radius: 50%;
          background: #E8943A40;
          transition: background 0.25s, transform 0.25s;
        }
        .slider-dot.active {
          background: #E8943A;
          transform: scale(1.35);
        }
        @media (max-width: 768px) {
          .slider-dots { display: flex; }
        }

        /* Activities — desktop grid */
        .activities-slider {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
          gap: 20px;
        }

        /* Gallery — desktop grid */
        .gallery-grid { display: grid; grid-template-columns: repeat(4, 1fr); grid-auto-rows: 200px; }
        .gallery-item { min-height: 0; }
        .gallery-wide { grid-column: span 2; grid-row: span 2; }

        @media (max-width: 900px) {
          .gallery-grid { grid-template-columns: repeat(2, 1fr); grid-auto-rows: 180px; }
          .gallery-wide { grid-column: span 2; grid-row: span 1; }
        }

        /* Mobile — both become horizontal sliders */
        @media (max-width: 768px) {
          .activities-slider {
            display: flex;
            overflow-x: scroll;
            overflow-y: visible;
            scroll-snap-type: x mandatory;
            -webkit-overflow-scrolling: touch;
            scrollbar-width: none;
            padding-bottom: 4px;
          }
          .activities-slider::-webkit-scrollbar { display: none; }
          .activities-slider > * {
            flex-shrink: 0;
            width: 78vw;
            scroll-snap-align: start;
          }

          .gallery-grid {
            display: flex;
            overflow-x: scroll;
            scroll-snap-type: x mandatory;
            -webkit-overflow-scrolling: touch;
            scrollbar-width: none;
            grid-template-columns: unset;
            grid-auto-rows: unset;
            padding-bottom: 6px;
          }
          .gallery-grid::-webkit-scrollbar { display: none; }
          .gallery-item {
            flex-shrink: 0;
            width: 78vw;
            height: 220px;
            scroll-snap-align: start;
            grid-column: unset !important;
            grid-row: unset !important;
          }
          .gallery-wide {
            width: 78vw;
            height: 220px;
          }
        }

        /* Centres grid */
        .centres-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
          gap: 16px;
        }
        .centre-card {
          border-radius: 14px;
          background: #FDF6EC;
          border: 1px solid rgba(232,148,58,0.2);
          padding: 18px;
          display: flex;
          flex-direction: column;
          gap: 12px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.05);
        }
        @media (max-width: 768px) {
          .centres-grid {
            grid-template-columns: 1fr;
            gap: 10px;
          }
          .centre-card {
            padding: 14px;
            gap: 10px;
            flex-direction: row;
            flex-wrap: wrap;
            align-items: flex-start;
          }
          .centre-card > *:first-child { width: 100%; }
          .centre-card > p { width: 100%; margin: 0; }
        }
      `}</style>
    </div>
  );
}
