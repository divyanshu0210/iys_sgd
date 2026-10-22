import { useEffect, useState } from "react";
import API from "../../../services/api";
import Modal from "../../../components/Modal";
import MemberDetailsCard from "../../../components/MemberDetailsCard";
import FullPageLoader from "../../../components/FullPageLoader";

const toMember = (request, pending = true) => ({
  ...request.from_user,
  is_pending: pending,
  request_id: request.id,
  request_created_at: request.created_at,
  bace: request.bace,
});

function NewProfileRow({ member, onView }) {
  return (
    <div className="whatsapp-card" style={{ backgroundColor: "#fff" }}>
      <div
        className="whatsapp-card-with-register-btn"
        style={{
          backgroundColor: "#fff",
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
          gap: "12px",
          position: "relative",
        }}
      >
        <div className="whatsapp-name-line" style={{ display: "flex", alignItems: "center" }}>
          <div className="whatsapp-avatar">
            <img src={member.profile_picture || "/default-avatar.png"} alt={member.full_name} />
          </div>
          <div style={{ display: "flex", flexDirection: "column" }}>
            <div className="whatsapp-profileName">
              <strong>{member.is_initiated ? member.initiated_name : member.full_name}</strong>
            </div>
            <div className="whatsapp-memberid">ID: {member.member_id || "N/A"}</div>
          </div>
        </div>
        <span
          className="badge-self"
          style={{
            position: "absolute",
            left: "50%",
            transform: "translateX(-50%)",
            whiteSpace: "nowrap",
          }}
        >
          New profile
        </span>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <button type="button" className="action-btn request" onClick={onView}>
            View
          </button>
        </div>
      </div>
    </div>
  );
}

export default function ProfileRequestsPanel() {
  const [requests, setRequests] = useState([]);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);

  const loadRequests = async () => {
    try {
      const response = await API.get("/api/mentor/requests/");
      setRequests(response.data?.pending_requests || []);
    } catch {
      setRequests([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRequests();
  }, []);

  const closePreview = () => {
    setSelectedRequest(null);
  };

  const approve = async (requestId) => {
    setActionLoading(requestId);
    try {
      await API.post("/api/mentor/requests/", { request_id: requestId });
      setRequests((current) => current.filter((request) => request.id !== requestId));
      setSelectedRequest(null);
      window.location.reload();
    } catch {
      alert("Failed to connect this profile.");
    } finally {
      setActionLoading(null);
    }
  };

  const reject = async (requestId) => {
    setActionLoading(requestId);
    try {
      await API.delete(`/api/mentor/requests/${requestId}/`);
      setRequests((current) => current.filter((request) => request.id !== requestId));
      setSelectedRequest(null);
    } catch {
      alert("Failed to reject this profile.");
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <section style={{ marginBottom: "1rem" }}>
      <h3>New Profile Requests</h3>
      <p className="info-text">
        Review each new profile before connecting it to your Bace.
      </p>

      {loading ? (
        <FullPageLoader small />
      ) : requests.length === 0 ? (
        <p className="empty-msg">No new profile requests.</p>
      ) : (
        <div className="members-list">
          {requests.map((request) => {
            const member = toMember(request, false);
            return (
              <NewProfileRow
                key={request.id}
                member={member}
                onView={() => setSelectedRequest(request)}
              />
            );
          })}
        </div>
      )}

      <Modal open={Boolean(selectedRequest)} onClose={closePreview}>
        {selectedRequest && (
          <div style={{ padding: "1.5rem 1rem 1rem" }}>
            <h3 style={{ marginTop: 0 }}>Review New Profile</h3>
            <MemberDetailsCard m={toMember(selectedRequest, false)} />
            <div className="form-actions" style={{ marginTop: "1rem" }}>
              <button
                type="button"
                className="cp-btn-ghost"
                disabled={actionLoading === selectedRequest.id}
                onClick={() => reject(selectedRequest.id)}
              >
                Reject
              </button>
              <button
                type="button"
                className="cp-btn-primary"
                disabled={actionLoading === selectedRequest.id}
                onClick={() => approve(selectedRequest.id)}
              >
                Connect
              </button>
            </div>
          </div>
        )}
      </Modal>
    </section>
  );
}
