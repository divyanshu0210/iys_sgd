// src/pages/components/Sidebar.jsx
import { useYatraRegistration } from "../context/YatraRegistrationContext";
// import "../../../../css/profileDisplay.css";

const Sidebar = () => {
  const { yatra, registerData, activeTab, setActiveTab, selected } =
    useYatraRegistration();

  const formatDate = (dateString) => {
    if (!dateString) return "";
    return new Date(dateString).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const tabs = [
    { id: "registered", label: "Registered" },
    { id: "approve", label: "Approve Devotees" },
    { id: "newReg", label: "New Registration" },
  ];

  return (
    <div className="profile-sidebar">
      <div className="profile-header" style={{ borderBottom: "none" }}>
        <div className="profile-info-compact2">
          <div className="info-row">
            <h2 className="profile-name">
              {yatra?.title ||
                registerData.yatra?.title ||
                "Yatra Registration"}
            </h2>

            {(yatra || registerData.yatra).description && (
              <p className="profile-desc">
                ({(yatra || registerData.yatra).description})
              </p>
            )}
          </div>
          <div className="info-row">
            {(yatra || registerData.yatra) && (
          <>
                <p className="profile-username">
                  Location: {(yatra || registerData.yatra).location}
                </p>
                <p className="profile-username">
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
