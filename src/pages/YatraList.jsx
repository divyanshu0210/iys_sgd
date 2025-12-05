import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import API from "../services/api";
import { useAuth } from "../context/AuthContext";
import Modal from "../components/Modal";
import ProfileApprovalForm from "./Profile/ProfileApprovalForm";

function ShimmerBox() {
  return (
    <div
      style={{
        height: "140px",
        borderRadius: "12px",
        background:
          "linear-gradient(90deg, #e6e8eb 0%, #f5f6f8 50%, #e9ebee 100%)",
        backgroundSize: "200% 100%",
        animation: "shimmer 1.4s infinite",
      }}
    />
  );
}

export default function YatraList() {
  const [yatras, setYatras] = useState([]);
  const [loading, setLoading] = useState(true);

  const [openApprovalModal, setOpenApprovalModal] = useState(false);
  const [openPendingModal, setOpenPendingModal] = useState(false);
  const [open24HrModal, setOpen24HrModal] = useState(false);

  const { profileStage, profile } = useAuth();

  useEffect(() => {
    API.get("/yatra/list/")
      .then((res) => setYatras(res.data))
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

  function formatDateTime(dateString) {
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

  const has24HoursPassed = (approvedAt) => {
    if (!approvedAt) return false;
    console.log("Approved at:", approvedAt);
    const approvedTime = new Date(approvedAt).getTime();
    const now = Date.now();
    const diffHours = (now - approvedTime) / (1000 * 60 * 60);
    return diffHours >= 24;
  };

  const handleOpenClick = (e, yatra) => {
    console.log("Profile stage on Yatra open click:", profileStage);
    if (profileStage === "guest") {
      e.preventDefault();
      setOpenApprovalModal(true);
    } else if (profileStage === "approval") {
      e.preventDefault();
      setOpenPendingModal(true);
    } else if (
      profileStage === "devotee" &&
      !has24HoursPassed(profile?.profile_approved_at)
    ) {
      // e.preventDefault();
      // setOpen24HrModal(true);
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
      }}
    >
      {/* 🔵 Show 2 shimmers while loading */}
      {loading ? (
        <>
          <ShimmerBox />
          <ShimmerBox />
        </>
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

              {isOpen && (
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
              )}
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
            Your profile has been submitted for approval. Profile will become acive after 24 hrs of approval.
          </p>
        </div>
      </Modal>

      <Modal open={open24HrModal} onClose={() => setOpen24HrModal(false)}>
        <div style={{ textAlign: "center", padding: 20 }}>
          <h3 style={{ color: "#1E3A8A" }}>Profile Activation</h3>

          <p style={{ fontSize: 15, marginBottom: 10 }}>
            Profile will become acive after 24 hrs of approval.
          </p>

          {profile?.profile_approved_at && (
            <p style={{ fontSize: 12, color: "#555" }}>
              <strong>Approved At:</strong>{" "}
              {formatDateTime(profile.profile_approved_at)}
            </p>
          )}
        </div>
      </Modal>
    </div>
  );
}
