import { useAuth } from "../context/AuthContext";

// src/components/FullPageLoader.jsx
export default function FullPageLoader() {

  return (
    <div style={styles.overlay}>
      <div style={styles.dotsWrapper}>
        <div style={{ ...styles.dot, animationDelay: "0s" }}></div>
        <div style={{ ...styles.dot, animationDelay: "0.2s" }}></div>
        <div style={{ ...styles.dot, animationDelay: "0.4s" }}></div>
      </div>
    </div>
  );
}

const styles = {
 overlay: {
  position: "fixed",
  inset: 0,
  background: "rgba(255,255,255,0.2)", // ⬅️ Very light white transparency
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  zIndex: 9999,
  pointerEvents: "none",               // ⬅️ Allows click-through if you want
},

  dotsWrapper: {
    display: "flex",
    gap: "10px",
  },
  dot: {
    width: "12px",
    height: "12px",
    borderRadius: "50%",
    background: "#2563eb",
    opacity: 0.6,
    animation: "bounce 0.6s infinite ease-in-out",
  },
};

// Insert keyframes globally
const sheet = document.styleSheets[0];
sheet.insertRule(`
  @keyframes bounce {
    0%, 80%, 100% {
      transform: scale(0);
      opacity: 0.6;
    }
    40% {
      transform: scale(1.2);
      opacity: 1;
    }
  }
`);
