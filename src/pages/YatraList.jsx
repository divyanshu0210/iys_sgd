import { useEffect, useState } from "react";
import { Clock } from "lucide-react";
import API from "../services/api";
import { useAuth } from "../context/AuthContext";
import Footer from "../components/Footer";
import YatraCard from "../components/YatraCard";
import useYatraClickHandler from "../hooks/useYatraClickHandler";

const C = {
  cream: "#FDF6EC",
  orange: "#E8943A",
  secondary: "#5A5A6A",
};

export function formatDateTime(dateString) {
  if (!dateString) return null;
  return new Date(dateString).toLocaleString("en-IN", {
    day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit",
  });
}

export default function YatraList() {
  const [yatras, setYatras] = useState([]);
  const [loading, setLoading] = useState(true);

  const { setUseFullWidth } = useAuth();
  const { handleYatraClick, modals: yatraModals } = useYatraClickHandler();

  useEffect(() => {
    setUseFullWidth(true);
    return () => setUseFullWidth(false);
  }, []);

  useEffect(() => {
    API.get("/yatra/list/")
      .then(res => setYatras(res.data.filter(y => !y.close_yatra)))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <div style={{ background: C.cream, minHeight: "100vh" }}>
      <div style={{ maxWidth: 1140, margin: "0 auto", padding: "clamp(32px, 6vw, 64px) clamp(16px, 3vw, 24px)" }}>

        <div style={{ marginBottom: 40 }}>
          <h1 style={{ fontFamily: "'Source Serif 4', Georgia, serif", fontWeight: 700, fontSize: "clamp(2rem, 4vw, 3rem)", letterSpacing: "-0.02em", margin: "0 0 8px" }}>
            All Yatras
          </h1>
          <p style={{ color: C.secondary, fontSize: 16, margin: 0 }}>
            Embark on transformative pilgrimages to the most sacred places in India.
          </p>
        </div>

        {loading ? (
          <div style={{ textAlign: "center", padding: "80px 0", color: C.secondary }}>
            <Clock size={32} style={{ marginBottom: 12, opacity: 0.4 }} />
            <p>Loading yatras…</p>
          </div>
        ) : yatras.length === 0 ? (
          <p style={{ textAlign: "center", color: C.secondary, padding: "80px 0" }}>No yatras available at the moment.</p>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 28, alignItems: "start" }}>
            {yatras.map(y => (
              <YatraCard key={y.id} y={y} onRegisterClick={e => handleYatraClick(e, y)} />
            ))}
          </div>
        )}
      </div>

      {yatraModals}
      <Footer />
    </div>
  );
}
