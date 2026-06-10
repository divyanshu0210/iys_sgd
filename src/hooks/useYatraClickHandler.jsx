import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Modal from "../components/Modal";
import ProfileApprovalForm from "../pages/Profile/ProfileApprovalForm";

export default function useYatraClickHandler() {
  const { user, profileStage, profile } = useAuth();
  const navigate = useNavigate();
  const [openApprovalModal, setOpenApprovalModal] = useState(false);
  const [openPendingModal, setOpenPendingModal] = useState(false);

  const handleYatraClick = (e, yatra) => {
    if (!user) { e.preventDefault(); navigate("/signin"); return; }
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

  const modals = (
    <>
      <Modal open={openApprovalModal} onClose={() => setOpenApprovalModal(false)}>
        <ProfileApprovalForm onClose={() => setOpenApprovalModal(false)} />
      </Modal>
      <Modal open={openPendingModal} onClose={() => setOpenPendingModal(false)}>
        <div style={{ textAlign: "center", padding: "20px" }}>
          <h3 style={{ color: "#1E3A8A", marginBottom: 12 }}>Approval Pending</h3>
          <p style={{ fontSize: 15, color: "#444", lineHeight: 1.6 }}>
            Your profile has been submitted for approval. You'll get full access once your counsellor confirms it.
          </p>
        </div>
      </Modal>
    </>
  );

  return { handleYatraClick, modals };
}
