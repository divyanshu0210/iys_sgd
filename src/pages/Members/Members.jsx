import { useEffect, useState } from "react";
import API from "../../services/api";
import MemberCard from "../../components/MemberCard";
import FullPageLoader from "../../components/FullPageLoader";
import { useAuth } from "../../context/AuthContext";
import "../../css/bulkActions.css";
import MentorRequestBulkBar from "../../components/MentorRequestBulkBar";
import useMentorRequestBulkActions from "../../hooks/useMentorRequestBulkActions";

export default function Members() {
  const { profile: currentProfile } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("all");

  useEffect(() => {
    const fetchDashboard = async () => {
      setLoading(true);
      try {
        const res = await API.get("/api/mentor/requests/");
        setData(res.data);
      } catch (err) {
        console.error("Error loading dashboard:", err);
        setData(null);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  const selfId = data?.mentor_profile?.id;
  const approvedMentees = data?.approved_mentees || [];
  const selfProfile = approvedMentees.find((member) => member.id === selfId) || data?.mentor_profile;
  const otherMentees = approvedMentees.filter((member) => member.id !== selfId);
  const pendingMembers = (data?.pending_requests || []).map((request) => ({
    ...request.from_user,
    is_pending: true,
    request_id: request.id,
    request_created_at: request.created_at,
    bace: request.bace,
  }));
  const devoteeMembers = [...(selfProfile ? [selfProfile] : []), ...otherMentees];
  const members = activeTab === "all"
    ? [...(selfProfile ? [selfProfile] : []), ...pendingMembers, ...otherMentees]
    : activeTab === "devotee"
      ? devoteeMembers
      : pendingMembers;
  const canBulkManageRequests = activeTab === "all" || activeTab === "guest";
  const {
    selectedIds: selectedRequestIds,
    allSelected: allRequestsSelected,
    loading: bulkActionLoading,
    toggleSelection: toggleRequestSelection,
    toggleAll: toggleAllRequests,
    clearSelection: clearRequestSelection,
    handleAction: handleBulkRequestAction,
  } = useMentorRequestBulkActions(data?.pending_requests || []);

  const pendingCount = pendingMembers.length;

  const tabs = [
    { id: "all", label: `All (${devoteeMembers.length + pendingCount})` },
    { id: "devotee", label: `Devotees (${devoteeMembers.length})` },
    { id: "guest", label: `Member Requests (${pendingCount})` },
  ];

  return (
    <>
      {bulkActionLoading && <FullPageLoader />}
      <div className="profile-page">
        <div className="registration-sidebar">
          <nav className="vertical-tabs">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                className={`tab-button ${activeTab === tab.id ? "active" : ""}`}
                onClick={() => {
                  setActiveTab(tab.id);
                  clearRequestSelection();
                }}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        <div className="profile-content">
          <h3 style={{ marginBottom: 10 }}>
            {activeTab === "all" && "All Members"}
            {activeTab === "devotee" && "Devotees List"}
            {activeTab === "guest" && "Pending Requests"}
          </h3>

          <div className="members-list has-fixed-bulk-actions" style={{ position: "relative" }}>
            {loading && <FullPageLoader small />}

            {!loading && members.length === 0 && <p>No members found.</p>}

            {!loading &&
              members.length > 0 &&
              members.map((m) => (
                <MemberCard
                  key={m.id || m.member_id}
                  selectable={canBulkManageRequests && m.is_pending}
                  selected={selectedRequestIds.includes(m.request_id)}
                  onSelect={() => toggleRequestSelection(m.request_id)}
                  m={{
                    ...m,
                    is_self:
                      m.is_self ||
                      (currentProfile &&
                        (m.id === currentProfile.id ||
                          m.member_id === currentProfile.member_id)),
                  }}
                />
              ))}
          </div>

          {canBulkManageRequests && (
            <MentorRequestBulkBar
              selectedCount={selectedRequestIds.length}
              allSelected={allRequestsSelected}
              loading={bulkActionLoading}
              onToggleAll={toggleAllRequests}
              onCancel={clearRequestSelection}
              onAction={handleBulkRequestAction}
            />
          )}
        </div>
      </div>
    </>
  );
}
