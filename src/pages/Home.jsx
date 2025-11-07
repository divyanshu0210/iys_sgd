// src/pages/Home.jsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import YatraList from "./YatraList";
import Modal from "../components/Modal";
import ProfileApprovalForm from "./Profile/ProfileApprovalForm";

export default function Home() {
  const { user, profileStage, loading } = useAuth();
  const navigate = useNavigate();
  const [openApprovalModal, setOpenApprovalModal] = useState(false);

  useEffect(() => {
    if (loading) return;
    if (user && profileStage === "not-exists") {
      navigate("/complete-profile", { replace: true });
    }
  }, [user, profileStage, loading, navigate]);

  const bannerStyle = {
    background: "#fff3cd",
    border: "1px solid #ffeaa7",
    padding: "1rem",
    borderRadius: "8px",
    margin: "1rem 0",
    textAlign: "center",
  };

  return (
    <div>
      <h1>Welcome to YatraApp</h1>

      {/* ✅ Guest banner */}
      {profileStage === "guest" && (
        <div style={bannerStyle}>
          <strong>Get Approved!</strong> To access all features, please get your
          profile approved by your mentor.
          <button
            onClick={() => setOpenApprovalModal(true)}
            style={{
              marginLeft: "1rem",
              background: "#f39c12",
              color: "white",
              border: "none",
              padding: "0.5rem 1rem",
              borderRadius: "4px",
              cursor: "pointer",
            }}
          >
            Get Approved
          </button>
        </div>
      )}

      {/* ✅ Approval pending */}
      {profileStage === "approval" && (
        <div style={bannerStyle}>
          <strong>Approval Pending:</strong> Your profile has been submitted for
          approval. You’ll get access to all features once it’s confirmed.
        </div>
      )}

      <section style={{ marginTop: "2rem" }}>
        <h2>Latest Updates</h2>
        <YatraList />
      </section>

      {/* ✅ Modal for approval form */}
      <Modal open={openApprovalModal} onClose={() => setOpenApprovalModal(false)}>
        <ProfileApprovalForm onClose={() => setOpenApprovalModal(false)} />
      </Modal>
    </div>
  );
}
