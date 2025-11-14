import "../css/members.css";
import MemberActions from "./MemberActions";
const formatDate = (dateStr) => {
  if (!dateStr) return "";
  const date = new Date(dateStr);
  return date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

export default function MemberDetailsCard({ m }) {
  const isPending = m.is_pending;

  return (
    <div className="member-content">
      <div className="member-photo">
        <img
          src={m.profile_picture_url || "/default-avatar.png"}
          alt={m.full_name || "Member"}
        />
      </div>

      <div className="member-info">
        <div className="member-name-row">
          <div style={{ display: "flex" , flexDirection:"column"}}>

          <p className="member-line name-line">{m.full_name || "Unnamed"}</p>
             {isPending && <span className="pending-label">(Pending)</span>}
          </div>
          <MemberActions m={m} />
        </div>
     
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
        {isPending && m.request_created_at && (
          <p
            className="member-line"
            style={{ color: "#777", fontStyle: "italic" }}
          >
            Requested: {formatDate(m.request_created_at)}
          </p>
        )}
      </div>
    </div>
  );
}
