import { useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import Footer from "../components/Footer";
import EventsSection from "../components/EventsSection";

const C = {
  cream: "#FDF6EC",
  secondary: "#5A5A6A",
  dark: "#1C1C1E",
};

export default function AllEvents() {
  const { setUseFullWidth } = useAuth();

  useEffect(() => {
    setUseFullWidth(true);
    return () => setUseFullWidth(false);
  }, []);

  return (
    <div style={{ background: C.cream, minHeight: "100vh" }}>
      <div style={{ maxWidth: 1140, margin: "0 auto", padding: "clamp(32px, 6vw, 64px) clamp(16px, 3vw, 24px)" }}>
        <div style={{ marginBottom: 36 }}>
          <h1 style={{ fontFamily: "'Source Serif 4', Georgia, serif", fontWeight: 700, fontSize: "clamp(2rem, 4vw, 3rem)", letterSpacing: "-0.02em", margin: "0 0 8px" }}>
            All Events
          </h1>
          <p style={{ color: C.secondary, fontSize: 16, margin: 0 }}>
            Browse all our spiritual gatherings, workshops, and festivals.
          </p>
        </div>

        <EventsSection />
      </div>
      <Footer />
    </div>
  );
}
