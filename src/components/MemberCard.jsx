import MemberDetailsCard from "./MemberDetailsCard";
import MemberActions from "./MemberActions";
import "../css/memberCards.css";

export default function MemberCard({ m, selectable = false, selected = false, onSelect, hideActions = false }) {
  return (
    <div className={`member-card ${selectable ? "has-selection" : ""}`}>
      {selectable && (
        <input
          type="checkbox"
          className="member-select-checkbox"
          checked={selected}
          onChange={onSelect}
          onMouseDown={(event) => event.preventDefault()}
          aria-label={`Select ${m.full_name || "profile"}`}
        />
      )}
      <MemberDetailsCard m={m} hideActions={hideActions} />
    </div>
  );
}
