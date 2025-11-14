import { useEffect, useState } from "react";
import API from "../../services/api";
import MemberCard from "../../components/MemberCard";
import "../../css/members.css";

export default function Members() {
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
        }));
      default:
        return [];
    }
  };

  const members = getMembersForTab();



  const totalMentees = data?.approved_mentees?.length || 0;
  const pendingCount = data?.pending_requests?.length || 0;
  const totalAll = totalMentees + pendingCount;

  const tabs = [
    { id: "all", label: `All (${totalAll + 1})` },
    { id: "devotee", label: `Devotees (${totalMentees + 1})` },
    { id: "guest", label: `Member Requests (${pendingCount})` },
  ];

  if (loading) {
    return (
      <div className="profile-page">
        <p>Loading members...</p>
      </div>
    );
  }

  return (
    <>
      <div className="profile-page">
        <div className="profile-sidebar">
          <nav className="vertical-tabs">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                className={`tab-button ${activeTab === tab.id ? "active" : ""}`}
                onClick={() => setActiveTab(tab.id)}
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

          {members.length === 0 ? (
            <p>No members found.</p>
          ) : (
            <div className="members-list">
              {members.map((m) => (
                <MemberCard key={m.id || m.member_id} m={m} />
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
