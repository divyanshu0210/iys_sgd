import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import API from "../services/api";
import { useAuth } from "../context/AuthContext";
import Modal from "../components/Modal";
import ProfileApprovalForm from "./Profile/ProfileApprovalForm";
import FullPageLoader from "../components/FullPageLoader";

export function formatDateTime(dateString) {
  if (!dateString) return null;

  const date = new Date(dateString);

  return date.toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}


export default function YatraList() {
  const [yatras, setYatras] = useState([]);
  const [loading, setLoading] = useState(true);

  const [openApprovalModal, setOpenApprovalModal] = useState(false);
  const [openPendingModal, setOpenPendingModal] = useState(false);

  const { profileStage, profile } = useAuth();

 useEffect(() => {
  API.get("/yatra/list/")
    .then((res) => {
      const openYatras = res.data.filter(
        (y) => y.close_yatra === false
      );
      setYatras(openYatras);
    })
    .finally(() => setLoading(false));
}, []);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const handleOpenClick = (e, yatra) => {
    const requiresApproval = yatra.registration_policy?.requires_approval !== false;

    if (requiresApproval) {
      if (profileStage === "guest") {
        e.preventDefault();
        setOpenApprovalModal(true);
        return;
      }
      if (profileStage === "approval") {
        e.preventDefault();
        setOpenPendingModal(true);
        return;
      }
    }

    const minRounds = yatra.registration_policy?.min_chanting_rounds || 0;
    if (minRounds > 0 && (profile?.no_of_chanting_rounds || 0) < minRounds) {
      e.preventDefault();
      alert(`You need a minimum of ${minRounds} chanting rounds to register for this Yatra. You currently have ${profile?.no_of_chanting_rounds || 0} rounds.`);
    }
  };

  return (
    <div
      style={{
        padding: "10px",
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
        gap: "16px",
        width: "100%",
        maxWidth: "950px",
        marginBottom: "30px",
        margin: "auto",
        display:'flex',
        flexDirection:'row',
        flexWrap:'wrap'
      }}
    >
      {loading ? (
        <FullPageLoader />
      ) : yatras.length === 0 ? (
        <p>No yatras yet.</p>
      ) : (
        yatras.map((y) => {
          const isOpen = Boolean(y.is_registration_open);
          const baseStyle = {
            borderRadius: "12px",
            padding: "12px 14px",
            transition: "transform 0.2s ease, box-shadow 0.2s ease",
            display: "flex",
            flexDirection: "column",
            gap: 4,
            background: "white",
            boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
            width:"100%",
          };

          return (
            <article
              key={y.id}
              style={baseStyle}
              onMouseEnter={(e) =>
                (e.currentTarget.style.transform = "translateY(-3px)")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.transform = "translateY(0)")
              }
            >
              {y.poster && (
                <img
                  src={y.poster}
                  alt={y.title}
                  style={{
                    width: "100%",
                    borderRadius: "8px",
                    objectFit: "cover",
                    maxHeight: "160px",
                    marginBottom: "8px",
                  }}
                />
              )}
              <h2
                style={{
                  color: "#1E3A8A",
                  fontSize: "17px",
                  margin: 0,
                  marginBottom: "3px",
                  lineHeight: "1.2",
                }}
              >
                {y.title || "Untitled Yatra"}
              </h2>

              <div style={{ color: "#555", fontSize: 13, lineHeight: "1.3" }}>
                <div>
                  <strong>Location:</strong> {y.location}
                </div>
                <div>
                  <strong>Dates:</strong> {formatDate(y.start_date)} →{" "}
                  {formatDate(y.end_date)}
                </div>
              </div>

              <div style={{ marginTop: 4, fontSize: 13 }}>
                <strong>Registration:</strong>{" "}
                <span
                  style={{
                    fontWeight: 500,
                    color: isOpen ? "#2563EB" : "#6B7280",
                  }}
                >
                  {isOpen ? "Open" : "Closed"}
                </span>
              </div>

                <div style={{ marginTop: 8 }}>
                  <Link
                    to={`/yatra/${y.id}/register`}
                    state={{ yatra: y }}
                    onClick={(e) => handleOpenClick(e, y)}
                  >
                    <button
                      style={{
                        background: "#2563EB",
                        color: "white",
                        border: "none",
                        padding: "6px 12px",
                        borderRadius: "5px",
                        cursor: "pointer",
                        fontSize: 13,
                        fontWeight: 500,
                      }}
                    >
                      Open
                    </button>
                  </Link>
                </div>

            </article>
          );
        })
      )}

      {/* Guest → Show Approval Form */}
      <Modal
        open={openApprovalModal}
        onClose={() => setOpenApprovalModal(false)}
      >
        <ProfileApprovalForm onClose={() => setOpenApprovalModal(false)} />
      </Modal>

      {/* Approval Pending → Show Info */}
      <Modal open={openPendingModal} onClose={() => setOpenPendingModal(false)}>
        <div style={{ textAlign: "center", padding: "20px" }}>
          <h3 style={{ color: "#1E3A8A", marginBottom: 12 }}>
            Approval Pending
          </h3>
          <p style={{ fontSize: 15, color: "#444", lineHeight: "1.5" }}>
            Your profile has been submitted for approval. Profile will become
            acive after 24 hrs of approval.
          </p>
        </div>
      </Modal>

    </div>
  );
}
