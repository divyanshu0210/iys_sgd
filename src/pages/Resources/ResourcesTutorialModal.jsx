import { useNavigate } from "react-router-dom";
import "./ResourcesTutorialModal.css";
import { ChevronRight, Menu } from "lucide-react"; // Lucide icon
import { useState } from "react";

export default function ResourcesTutorialModal({ onClose }) {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true); // loader state
  return (
    <div className="resources-tutorial">
      <p className="tutorial-heading">
        <span className="new-badge">NEW</span> Dham Darshan Resources
      </p>

      <p className="note">
        Find all PDFs, Audios, Videos & YouTube links for{" "}
        <strong>Mayapur Yatra</strong>
      </p>
      {/* Added nav hint below paragraph */}
      <p style={{ fontSize: "0.95rem", color: "#555" }}>
        <Menu size={16} /> <ChevronRight size={16} /> Resources
      </p>

      <div className="gif-wrapper" style={{ position: "relative" }}>
        {loading && (
          <div
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              background: "rgba(0,0,0,0.1)",
              zIndex: 1,
            }}
          >
            <div
              className="spinner"
              style={{
                border: "4px solid #f3f3f3",
                borderTop: "4px solid #2c3e50",
                borderRadius: "50%",
                width: "40px",
                height: "40px",
                animation: "spin 1s linear infinite",
              }}
            ></div>
          </div>
        )}

        <video
          src="Resources_Tutorial.mp4"
          autoPlay
          loop
          muted
          playsInline
          onLoadedData={() => setLoading(false)} // hide loader when video loads
          ref={(video) => {
            if (video) video.playbackRate = 2; // 🔥 1.25–1.5 is ideal
          }}
            style={{ width: "100%", borderRadius: "10px", display: loading ? "none" : "block" }}
        />
      </div>
      <div className="tutorial-actions">
        <button
          className="view-btn"
          onClick={() => {
            onClose();
            localStorage.setItem("resources_tutorial_dismissed", "true");
            navigate("/resources");
          }}
        >
          View Resources
        </button>
        <button
          className="skip-btn"
          onClick={() => {
            localStorage.setItem("resources_tutorial_dismissed", "true");
            onClose();
          }}
        >
          Don’t show again
        </button>
      </div>
    </div>
  );
}
