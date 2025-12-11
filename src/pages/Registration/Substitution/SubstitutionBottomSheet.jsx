import React from "react";
import "../css/substitution.css";

export default function SubstitutionBottomSheet({ onView, onCancel }) {
  return (
    <div className="sub-bottom-sheet">
      <span style={{ fontSize: "14px", fontWeight: 500 }}>
        You have a new substitution request
      </span>

      <div style={{ display: "flex", gap: "6px" }}>
        <button  className="sub-btn" onClick={onView}>View</button>
      </div>
    </div>
  );
}
