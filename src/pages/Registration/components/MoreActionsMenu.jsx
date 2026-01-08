import { useState, useRef, useEffect } from "react";

export default function MoreActionsMenu({ onSubstitute, onCancellation , yatra }) {
  const [open, setOpen] = useState(false);
  const menuRef = useRef();

  // Close when clicking outside
  useEffect(() => {
    function handleClickOutside(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div style={{ position: "relative" }} ref={menuRef}>
      {/* 3 dots button */}
      <button
        className="action-btn"
        style={{
          width: "35px",
          height: "35px",
          color: "black",
          backgroundColor: "white",
          fontSize: "20px",
          padding: 0,
        }}
        onClick={() => setOpen(!open)}
      >
        ⋮
      </button>

      {/* DROPDOWN MENU */}
      {open && (
        <div
          style={{
            position: "absolute",
            bottom: "40px",
            right: 0,
            background: "white",
            border: "1px solid #ddd",
            borderRadius: "6px",
            boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
            padding: "5px 0",
            minWidth: "170px",
            zIndex: 999,
          }}
        >
          {yatra.is_substitution_open && (
            <div
            style={{
              padding: "8px 12px",
              cursor: "pointer",
              fontSize: "14px",
            }}
            onClick={() => {
              setOpen(false);
              onSubstitute();
            }}
          >
            Substitution
          </div>
          )}
          {yatra.is_cancellation_open && (
       
          <div
            style={{
              padding: "8px 12px",
              cursor: "pointer",
              fontSize: "14px",
              color: "#b91c1c",
            }}
            onClick={() => {
              setOpen(false);
              onCancellation();
            }}
          >
            Cancellation
          </div>
          )}
       

        </div>
      )}
    </div>
  );
}
