// src/pages/components/Sidebar.jsx
import { useEffect, useState } from "react";
import { useYatraRegistration } from "../context/YatraRegistrationContext";
// import "../../../../css/profileDisplay.css";

const Sidebar = () => {
  const { yatra, registerData } =
    useYatraRegistration();
  const [showDescription, setShowDescription] = useState(false);
  const [isMobile, setIsMobile] = useState(() => window.innerWidth <= 768);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const formatDate = (dateString) => {
    if (!dateString) return "";
    return new Date(dateString).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  return (
    <div className="registration-sidebar">
      <div className="registration-header" style={{ borderBottom: "none" }}>
        <div className="profile-info-compact2">
          <div
            className="registration-info-row yatra-title-row"
            style={{ display: "flex", flexDirection: "column", alignItems: "center", width: "100%" }}
          >
            <h2 className="registration-profile-name">
              {yatra?.title ||
                registerData.yatra?.title ||
                "Yatra Registration"}
            </h2>

            {(yatra || registerData.yatra).description && (() => {
              const description = (yatra || registerData.yatra).description;
              const limit = isMobile ? 30 : 180;
              const isTruncated = description.length > limit;
              return (
                <div
                  className="yatra-description-block"
                  style={{ width: "100%", textAlign: "center" }}
                >
                  <span>(</span>
                  <span
                    className={`registration-profile-desc ${showDescription ? "expanded" : ""}`}
                    style={{ ...(showDescription ? { whiteSpace: "normal" } : {}) }}
                  >
                    {showDescription || !isTruncated ? description : `${description.slice(0, limit)}…`}
                  </span>{" "}
                  {isTruncated && (
                    <button
                      type="button"
                      className="yatra-description-toggle"
                      style={{ border: 0, padding: 0, background: "transparent", color: "#2563eb", fontSize: "0.75rem", cursor: "pointer", whiteSpace: "nowrap" }}
                      onClick={() => setShowDescription((current) => !current)}
                    >
                      {showDescription ? "Show less" : "Show more"}
                    </button>
                  )}
                  <span>)</span>
                </div>
              );
            })()}
          </div>
          <div className="registration-info-row">
            {(yatra || registerData.yatra) && (
          <>
                <p className="registration-profile-username">
                  Location: {(yatra || registerData.yatra).location}
                </p>
                <p className="registration-profile-username">
                  {formatDate((yatra || registerData.yatra).start_date)} to{" "}
                  {formatDate((yatra || registerData.yatra).end_date)}
                </p>
          </>
     
            )}
          </div>
        </div>
      </div>

    </div>
  );
};

export default Sidebar;
