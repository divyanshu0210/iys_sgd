import "../css/members.css";
  const formatDate = (dateStr) => {
    if (!dateStr) return "";
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  
export default function BasicMemberCard({ m }) {

  return (
    <div className="member-content">
      <div className="member-photo">
        <img
          src={m.profile_picture_url || "/default-avatar.png"}
          alt={m.full_name || "Member"}
        />
      </div>

      <div className="member-info">
        <p className="member-line name-line">
          {m.full_name || "Unnamed"}
        </p>

        <p className="member-line">
          {m.user_type === "mentor"
            ? "Mentor"
            : m.user_type === "guest"
            ? "Guest"
            : "Devotee"}
          : {m.member_id || "N/A"}
          {m.dob ? `, Born: ${formatDate(m.dob)}` : ""}
          {m.gender ? `, ${m.gender}` : ""}
          {m.marital_status ? `, ${m.marital_status}` : ""}
        </p>

        {m.center && <p className="member-line">Center: {m.center}</p>}
        {m.satsanga && <p className="member-line">Satsangas: {m.satsanga}</p>}
        {m.email && (
          <p className="member-line">
            Email: {m.email}
            {m.email2 ? `, ${m.email2}` : ""} (Personal)
          </p>
        )}
        {m.mobile && (
          <p className="member-line">Mobile: {m.mobile} (Personal)</p>
        )}
        
      </div>
    </div>
  );
}
