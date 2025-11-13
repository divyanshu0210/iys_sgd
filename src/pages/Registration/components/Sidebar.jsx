// src/pages/components/Sidebar.jsx
import { useYatraRegistration } from "../context/YatraRegistrationContext";

const Sidebar = () => {
  const {
    yatra,
    registerData,
    activeTab,
    setActiveTab,
    selected
  } = useYatraRegistration();

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
      <div className="profile-header">
        <div className="profile-info-compact">
          <h2 className="profile-name">
            {yatra?.title || registerData.yatra?.title || "Yatra Registration"}
          </h2>
          {(yatra || registerData.yatra) && (
            <>
              <p className="profile-username">
                Location: {(yatra || registerData.yatra).location}
              </p>
              <p className="profile-dates">
                {formatDate((yatra || registerData.yatra).start_date)} to{" "}
                {formatDate((yatra || registerData.yatra).end_date)}
              </p>
              {(yatra || registerData.yatra).description && (
                <p className="profile-desc">
                  {(yatra || registerData.yatra).description}
                </p>
              )}
            </>
          )}
        </div>
      </div>

      <nav className="vertical-tabs">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            className={`tab-button ${activeTab === tab.id ? "active" : ""}`}
            onClick={() => setActiveTab(tab.id)}
          >
            <span className="tab-label">{tab.label}</span>
            {/* {tab.id === "newReg" && selected.length > 0 && (
              <span className="tab-count">{selected.length}</span>
            )} */}
          </button>
        ))}
      </nav>
    </div>
  );
};

export default Sidebar;