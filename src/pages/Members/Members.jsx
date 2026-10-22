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

  const getMembersForTab = () => {
    if (!data) return [];

    switch (activeTab) {
      case "all":
        return [
          data.mentor_profile,
          ...data.approved_mentees,
          ...data.pending_requests.map((r) => ({
            ...r.from_user,
            is_pending: true,
            request_id: r.id,
            request_created_at: r.created_at,
            bace: r.bace,
          })),
        ];
      case "devotee":
        return [data.mentor_profile, ...data.approved_mentees];
      case "guest":
        return data.pending_requests.map((r) => ({
          ...r.from_user,
          is_pending: true,
          request_id: r.id,
          request_created_at: r.created_at,
          bace: r.bace,
        }));
      default:
        return [];
    }
  };

  const members = getMembersForTab();
  const isRequestTab = activeTab === "guest";
  const {
    selectedIds: selectedRequestIds,
    allSelected: allRequestsSelected,
    loading: bulkActionLoading,
    toggleSelection: toggleRequestSelection,
    toggleAll: toggleAllRequests,
    clearSelection: clearRequestSelection,
    handleAction: handleBulkRequestAction,
  } = useMentorRequestBulkActions(data?.pending_requests || []);

  const totalMentees = data?.approved_mentees?.length || 0;
  const pendingCount = data?.pending_requests?.length || 0;
  const totalAll = totalMentees + pendingCount;

  const tabs = [
    { id: "all", label: `All (${totalAll + 1})` },
    { id: "devotee", label: `Devotees (${totalMentees + 1})` },
    { id: "guest", label: `Member Requests (${pendingCount})` },
  ];

  return (
    <>
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

        <div className={`profile-content ${selectedRequestIds.length ? "has-fixed-bulk-actions" : ""}`}>
          <h3 style={{ marginBottom: 10 }}>
            {activeTab === "all" && "All Members"}
            {activeTab === "devotee" && "Devotees List"}
            {activeTab === "guest" && "Pending Requests"}
          </h3>

          <div className="members-list" style={{ position: "relative" }}>
            {loading && <FullPageLoader small />}

            {!loading && members.length === 0 && <p>No members found.</p>}

            {!loading &&
              members.length > 0 &&
              members.map((m) => (
                <MemberCard
                  key={m.id || m.member_id}
                  selectable={isRequestTab && m.is_pending}
                  selected={selectedRequestIds.includes(m.request_id)}
                  onSelect={() => toggleRequestSelection(m.request_id)}
                  hideActions={isRequestTab && m.is_pending}
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

          {isRequestTab && (
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
