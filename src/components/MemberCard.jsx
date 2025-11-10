import MemberDetailsCard from "./MemberDetailsCard";
import MemberActions from "./MemberActions";
import "../css/members.css";

export default function MemberCard({ m }) {
  return (
    <div className="member-card">
      <div className="member-card-header">
        <div className="member-header-left">
          <MemberDetailsCard m={m} />
        </div>
        <div className="member-header-right">
          <MemberActions m={m} />
        </div>
      </div>
    </div>
  );
}
