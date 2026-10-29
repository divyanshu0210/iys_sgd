import { useEffect, useState } from "react";
import API from "../services/api";
import { useAuth } from "../context/AuthContext";
import Footer from "../components/Footer";
import FullPageLoader from "../components/FullPageLoader";
import YatraCard from "../components/YatraCard";
import useYatraClickHandler from "../hooks/useYatraClickHandler";
import "./YatraList.css";

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
  const [loadError, setLoadError] = useState(false);

  const { setUseFullWidth } = useAuth();
  const { handleYatraClick, modals: yatraModals } = useYatraClickHandler();

  useEffect(() => {
    setUseFullWidth(true);
    return () => setUseFullWidth(false);
  }, []);

  useEffect(() => {
    API.get("/yatra/list/")
      .then(res => setYatras(res.data.filter(y => !y.close_yatra)))
      .catch((error) => {
        console.error("Failed to load yatras", error);
        setLoadError(true);
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="yatra-list-page" style={{ background: C.cream, display: "flex", flexDirection: "column" }}>
      {loading && <FullPageLoader />}
      <div className="yatra-list-content" style={{ flex: 1,minHeight: "100vh", maxWidth: 1140, width: "100%", margin: "0 auto", padding: "clamp(32px, 6vw, 24px) clamp(16px, 3vw, 24px)" }}>

        <div className="yatra-list-heading">
          <h1 style={{ fontFamily: "'Source Serif 4', Georgia, serif", fontWeight: 700, fontSize: "clamp(2rem, 4vw, 3rem)", letterSpacing: "-0.02em", margin: "0 0 8px" }}>
            All Yatras
          </h1>
          <p style={{ color: C.secondary, fontSize: 16, margin: 0 }}>
            Embark on transformative pilgrimages to the most sacred places in India.
          </p>
        </div>

        {!loading && loadError && (
          <p style={{ textAlign: "center", color: C.secondary, padding: "80px 0" }}>Could not load yatras. Please try again.</p>
        )}
        {!loading && !loadError && yatras.length === 0 && (
          <p style={{ textAlign: "center", color: C.secondary, padding: "80px 0" }}>No yatras available at the moment.</p>
        )}
        <div className="yatra-card-grid">
          {yatras.map(y => (
            <YatraCard key={y.id} y={y} onRegisterClick={e => handleYatraClick(e, y)} />
          ))}
        </div>
      </div>

      {yatraModals}
      <Footer />
    </div>
  );
}
