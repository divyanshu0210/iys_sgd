import React from "react";
import { createRoot } from "react-dom/client";

let alertRoot = null;
let alertContainer = null;

export default function CustomAlert(message) {
  // Prevent multiple alerts
  if (alertRoot) return;

  alertContainer = document.createElement("div");
  document.body.appendChild(alertContainer);

  alertRoot = createRoot(alertContainer);

  const close = () => {
    alertRoot.unmount();
    alertContainer.remove();
    alertRoot = null;
    alertContainer = null;
  };

  alertRoot.render(
    <AlertOverlay message={message} onClose={close} />
  );
}

function AlertOverlay({ message, onClose }) {
  return (
    <div style={styles.overlay} onClick={onClose}>
      <div style={styles.box} onClick={(e) => e.stopPropagation()}>
        <div style={styles.message}>{message}</div>

        <div style={styles.actions}>
          <button style={styles.button} onClick={onClose}>
            OK
          </button>
        </div>
      </div>
    </div>
  );
}

const styles = {
  overlay: {
    position: "fixed",
    inset: 0,
    backgroundColor: "rgba(0,0,0,0.45)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 9999,
  },

  box: {
    backgroundColor: "#fff",
    borderRadius: "12px",
    padding: "24px",
    width: "90%",
    maxWidth: "380px",
    boxShadow: "0 10px 25px rgba(0,0,0,0.25)",
    animation: "scaleIn 0.2s ease-out",
  },

  message: {
    fontSize: "15px",
    color: "#333",
    marginBottom: "20px",
    lineHeight: 1.4,
    // textAlign: "center",

  },
  actions: {
    display: "flex",
    justifyContent: "flex-end",
  },
  button: {
    padding: "10px 22px",
    fontSize: "14px",
    borderRadius: "8px",
    border: "none",
    backgroundColor: "#1a73e8",
    color: "#fff",
    cursor: "pointer",
  },
};
