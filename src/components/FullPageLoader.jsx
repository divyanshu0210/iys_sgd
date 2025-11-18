// src/components/FullPageLoader.jsx
export default function FullPageLoader() {
  return (
    <div style={styles.wrapper}>
      <div style={styles.spinner}></div>
    </div>
  );
}

const styles = {
  wrapper: {
    height: "100vh",
    width: "100%",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    background: "#f8fafc",
  },
  spinner: {
    width: "48px",
    height: "48px",
    border: "5px solid #dbeafe",
    borderTopColor: "#2563eb",
    borderRadius: "50%",
    animation: "spin 0.9s linear infinite",
  },
};

// Global animation
const styleSheet = document.styleSheets[0];
styleSheet.insertRule(`
  @keyframes spin {
    to { transform: rotate(360deg); }
  }
`);
