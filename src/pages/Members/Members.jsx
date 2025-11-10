// import { useEffect, useState } from "react";
// import API from "../../services/api";
// import "../../css/members.css";

// export default function Members() {
//   const [data, setData] = useState(null);
//   const [loading, setLoading] = useState(false);
//   const [activeTab, setActiveTab] = useState("all");

//   // Fetch dashboard once
//   useEffect(() => {
//     const fetchDashboard = async () => {
//       setLoading(true);
//       try {
//         const res = await API.get("/api/mentor/requests/");
//         setData(res.data);
//       } catch (err) {
//         console.error("Error loading dashboard:", err);
//         setData(null);
//       } finally {
//         setLoading(false);
//       }
//     };
//     fetchDashboard();
//   }, []);

//   // Derive members based on active tab
//   const getMembersForTab = () => {
//     if (!data) return [];

//     const approvedCount = data.approved_mentees?.length || 0;
//     const pendingCount = data.pending_requests?.length || 0;

//     switch (activeTab) {
//       case "all":
//         return [
//           data.mentor_profile,
//           ...data.approved_mentees,
//           ...data.pending_requests.map(r => ({
//             ...r.from_user,
//             is_pending: true,
//             request_id: r.id,
//             request_created_at: r.created_at,
//           })),
//         ];
//       case "devotee":
//         return [data.mentor_profile, ...data.approved_mentees];
//       case "guest":
//         return data.pending_requests.map(r => ({
//           ...r.from_user,
//           is_pending: true,
//           request_id: r.id,
//           request_created_at: r.created_at,
//         }));
//       default:
//         return [];
//     }
//   };

//   const members = getMembersForTab();

//   const formatDate = (dateStr) => {
//     if (!dateStr) return "";
//     const date = new Date(dateStr);
//     return date.toLocaleDateString("en-GB", {
//       day: "2-digit",
//       month: "short",
//       year: "numeric",
//     });
//   };

// const MemberCard = ({ m }) => {
//   const [actionLoading, setActionLoading] = useState(null); // 'approve' | 'reject' | null
//   const isPending = m.is_pending;

//   const handleApprove = async () => {
//     if (!isPending || actionLoading) return;
//     setActionLoading("approve");
//     try {
//       await API.post("/api/mentor/requests/", {
//         request_id: m.request_id,
//       });
//       setActionLoading(null);
//       // Instead of full reload, re-fetch after success
//       window.location.reload();
//     } catch (err) {
//       setActionLoading(null);
//       alert("Failed to approve.");
//     }
//   };

//   const handleReject = async () => {
//     if (!isPending || actionLoading) return;
//     if (!confirm("Reject this request?")) return;
//     setActionLoading("reject");
//     try {
//       await API.delete(`/api/mentor/requests/${m.request_id}/`);
//       setActionLoading(null);
//       window.location.reload();
//     } catch (err) {
//       setActionLoading(null);
//       alert("Failed to reject.");
//     }
//   };

//   return (
//     <div className="member-card">
//       <div className="member-content">
//         <div className="member-photo">
//           <img
//             src={m.profile_picture_url || "/default-avatar.png"}
//             alt={m.full_name || "Member"}
//           />
//         </div>

//         <div className="member-info">
//           <p className="member-line name-line">
//             {m.full_name || "Unnamed"}
//             {isPending && (
//               <span
//                 style={{
//                   marginLeft: 8,
//                   color: "#f39c12",
//                   fontSize: "0.85rem",
//                 }}
//               >
//                 (Pending)
//               </span>
//             )}
//           </p>

//           <p className="member-line">
//             {m.user_type === "mentor"
//               ? "Mentor"
//               : m.user_type === "guest"
//               ? "Guest"
//               : "Devotee"}
//             : {m.member_id || "N/A"}
//             {m.dob ? `, Born: ${formatDate(m.dob)}` : ""}
//             {m.gender ? `, ${m.gender}` : ""}
//             {m.marital_status ? `, ${m.marital_status}` : ""}
//           </p>

//           {m.center && <p className="member-line">Center: {m.center}</p>}
//           {m.satsanga && <p className="member-line">Satsangas: {m.satsanga}</p>}
//           {m.email && (
//             <p className="member-line">
//               Email: {m.email}
//               {m.email2 ? `, ${m.email2}` : ""} (Personal)
//             </p>
//           )}
//           {m.mobile && (
//             <p className="member-line">Mobile: {m.mobile} (Personal)</p>
//           )}
//           {isPending && m.request_created_at && (
//             <p
//               className="member-line"
//               style={{ color: "#777", fontStyle: "italic" }}
//             >
//               Requested: {formatDate(m.request_created_at)}
//             </p>
//           )}

//           {isPending && (
//             <div style={{ marginTop: 12, display: "flex", gap: 8 }}>
//               <button
//                 onClick={handleApprove}
//                 className="convert-btn"
//                 style={{
//                   background: "#27ae60",
//                   opacity: actionLoading ? 0.7 : 1,
//                   cursor: actionLoading ? "not-allowed" : "pointer",
//                 }}
//                 disabled={actionLoading}
//               >
//                 {actionLoading === "approve" ? "Approving..." : "Convert this member to Devotee"}
//               </button>

//               <button
//                 onClick={handleReject}
//                 className="convert-btn"
//                 style={{
//                   background: "#e74c3c",
//                   opacity: actionLoading ? 0.7 : 1,
//                   cursor: actionLoading ? "not-allowed" : "pointer",
//                 }}
//                 disabled={actionLoading}
//               >
//                 {actionLoading === "reject" ? "Rejecting..." : "Reject"}
//               </button>
//             </div>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// };


//   const totalMentees = data?.approved_mentees?.length || 0;
//   const pendingCount = data?.pending_requests?.length || 0;
//   const totalAll = totalMentees + pendingCount;

//   const tabs = [
//     { id: "all", label: `All (${totalAll+1})` },
//     { id: "devotee", label: `Devotees (${totalMentees+1})` },
//     { id: "guest", label: `Member Requests (${pendingCount})` },
//   ];

//   if (loading) {
//     return (
//       <div className="profile-page">
//         <p>Loading members...</p>
//       </div>
//     );
//   }

//   return (
//     <>
//       <div className="members-header">
//       <h2>Members List</h2>
//       <div className="header-line"></div>
//     </div>
//     <div className="profile-page">

//       <div className="profile-sidebar">
//         <nav className="vertical-tabs">
//           {tabs.map((tab) => (
//             <button
//               key={tab.id}
//               className={`tab-button ${activeTab === tab.id ? "active" : ""}`}
//               onClick={() => setActiveTab(tab.id)}
//             >
//               {tab.label}
//             </button>
//           ))}
//         </nav>
//       </div>

//       <div className="profile-content">
//         <h3 style={{ marginBottom: 10 }}>
//           {activeTab === "all" && "All Members"}
//           {activeTab === "devotee" && "Devotees List"}
//           {activeTab === "guest" && "Pending Requests"}
//         </h3>

//         {members.length === 0 ? (
//           <p>No members found.</p>
//         ) : (
//           <div className="members-list">
//             {members.map((m) => (
//               <MemberCard key={m.id || m.member_id} m={m} />
//             ))}
//           </div>
//         )}
//       </div>
//     </div>
//     </>

//   );
// }
// src/pages/Members/Members.jsx
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
      <div className="members-header">
        <h2>Members List</h2>
        <div className="header-line"></div>
      </div>

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
