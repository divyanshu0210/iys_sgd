// SubstitutionRequests.jsx
import React, { use, useEffect, useState } from "react";
import API from "../../../services/api";
import SubstitutionBottomSheet from "./SubstitutionBottomSheet";
import SubstitutionRequestModal from "./SubstitutionRequestModal";
import Modal from "../../../components/Modal";
import { useYatraRegistration } from "../context/YatraRegistrationContext";
import useCountdown from "./useCountdown";

export default function SubstitutionRequests() {
  const [requests, setRequests] = useState([]);
  const [activeReq, setActiveReq] = useState(null);
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { fetchRegistrationData } = useYatraRegistration();
  const isApproved = activeReq?.is_target_eligible ?? false;
  const isRegistered = activeReq?.is_target_registered ?? false;

  useEffect(() => {
    loadRequests();
  }, []);

  const timeLeft = useCountdown(requests[0]?.expires_at, async () => {
    await handleCancelRequest();
    setError("This substitution request has expired.");
  });

  async function loadRequests() {
    const res = await API.get("/yatra-transfers/substitution_requests/");
    setRequests(res.data);
  }

  const handleCancelRequest = async () => {
    await API.post(
      `/yatra-transfers/substitution_requests/${
        activeReq ? activeReq.id : requests[0].id
      }/respond/`,
      { action: "reject" }
    );
    setActiveReq(null);
    await loadRequests();
  };

  const handleSubmitCode = async () => {
    setLoading(true);
    setError("");
    try {
      await API.post(
        `/yatra-transfers/substitution_requests/${activeReq.id}/respond/`,
        { action: "accept", code }
      );

      setActiveReq(null);
      setCode("");
      await loadRequests();
      window.location.reload();
      alert("Substitution completed successfully.");
    } catch (err) {
      setError(err.response?.data?.detail || "Failed to accept");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Bottom sheet only if requests exist and no modal open */}
      {requests.length > 0 && !activeReq && (
        <SubstitutionBottomSheet
          onView={() => setActiveReq(requests[0])}
          onCancel={() => handleCancelRequest()}
        />
      )}

      <Modal
        open={activeReq}
        onClose={() => {
          if (!isApproved || isRegistered) {
            handleCancelRequest();
          }
          setActiveReq(null);
        }}
      >
        <SubstitutionRequestModal
          request={activeReq}
          code={code}
          setCode={setCode}
          onSubmit={handleSubmitCode}
          onCancelRequest={handleCancelRequest}
          error={error}
          isSubmitting={loading}
          isApproved={isApproved}
          isRegistered={isRegistered}
          timeLeft={timeLeft}
        />
      </Modal>
    </>
  );
}
