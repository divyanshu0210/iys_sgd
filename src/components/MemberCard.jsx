import MemberDetailsCard from "./MemberDetailsCard";
import MemberActions from "./MemberActions";
import "../css/members.css";

export default function MemberCard({ m }) {
  return (
    <div className="member-card">
      <MemberDetailsCard m={m} />
    </div>
  );
}
