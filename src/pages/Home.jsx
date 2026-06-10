import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import API from "../services/api";
import Modal from "../components/Modal";
import ProfileApprovalForm from "./Profile/ProfileApprovalForm";
import Footer from "../components/Footer";
import EventsSection from "../components/EventsSection";
import YatraCard from "../components/YatraCard";
import useYatraClickHandler from "../hooks/useYatraClickHandler";
import {
  ArrowRight, BookOpen, Building2, Calendar, Clock,
  Globe, Heart, Images, Leaf, MapPin, Mic, Music,
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
  const { user, profileStage, loading, setUseFullWidth } = useAuth();
  const navigate = useNavigate();
  const { handleYatraClick, modals: yatraModals } = useYatraClickHandler();
  const [yatras, setYatras] = useState([]);

  useEffect(() => {
    setUseFullWidth(true);
    if (loading) return;
    if (user && profileStage === "not-exists") navigate("/complete-profile", { replace: true });
    return () => setUseFullWidth(false);
  }, [user, profileStage, loading, navigate]);

  useEffect(() => {
    API.get("/yatra/list/").then(r => setYatras(r.data.filter(y => !y.close_yatra).slice(0, 3))).catch(() => {});
  }, []);

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
  const handleSliderScroll = (e, setter) => {
    const el = e.currentTarget;
    const itemW = el.firstElementChild?.offsetWidth || 1;
    setter(Math.round(el.scrollLeft / itemW));
  };

  const fmtDate = (d) => d ? new Date(d).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) : "";
  const fmtDateShort = (d) => d ? new Date(d).toLocaleDateString("en-IN", { day: "2-digit", month: "short" }) : "";

  return (
    <div style={{ background: C.cream, color: C.dark, minHeight: "100vh", overflowX: "hidden" }}>

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

        <EventsSection preview />

        <div style={{ display: "flex", justifyContent: "center", marginTop: "clamp(25px, 4vw, 48px)" }}>
          <Link to="/events" style={{ textDecoration: "none" }}>
            <OutlineBtn>
              View All Events <ArrowRight size={16} />
            </OutlineBtn>
          </Link>
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
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 28, alignItems: "start" }}>
              {yatras.map(y => (
                <YatraCard key={y.id} y={y} onRegisterClick={e => handleYatraClick(e, y)} />
              ))}
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
      {yatraModals}

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
