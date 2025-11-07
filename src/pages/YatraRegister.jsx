import { useEffect, useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import API from "../services/api";
import "../css/profiledisplay.css"; // ✅ reuse same CSS file as Profile
import "../css/profileCard.css"; // ✅ reuse same CSS file as Profile

export default function YatraRegister() {
  const { yatra_id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  // 🔹 Yatra details passed from YatraList
  const yatra = location.state?.yatra || null;

  const [eligible, setEligible] = useState([]);
  const [selected, setSelected] = useState([]);
  const [activeTab, setActiveTab] = useState("registered");

  useEffect(() => {
    API.get(`/api/yatras/${yatra_id}/register/`).then((res) => {
      setEligible(res.data);
      const self = res.data.find((p) => p.mentor === null);
      if (self) setSelected([self.id]);
    });
  }, [yatra_id]);

  const toggle = (id) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const submit = async () => {
    await API.post(`/api/yatras/${yatra_id}/register/`, {
      registered_for_ids: selected,
    });
    navigate("/yatras");
  };

  const registered = eligible.filter((p) => p.is_registered);
  const notRegistered = eligible.filter((p) => !p.is_registered);

  const formatDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

const renderList = (list, registeredStatus) => (
  <div className="tab-content">
    <h3>{registeredStatus ? "Already Registered" : "Eligible for Registration"}</h3>

    {list.length === 0 ? (
      <p style={{ color: "#64748b" }}>
        {registeredStatus
          ? "No devotees registered yet."
          : "No devotees available for registration."}
      </p>
    ) : (
      <div className="user-grid">
        {list.map((p) => (
          <label
            key={p.id}
            className={`user-card ${registeredStatus ? "registered" : ""}`}
          >
            {!registeredStatus && (
              <input
                type="checkbox"
                checked={selected.includes(p.id)}
                onChange={() => toggle(p.id)}
                className="user-checkbox"
              />
            )}
            <div className="user-avatar">
              <img
                src={p.profile_picture || "/default-avatar.png"}
                alt={p.full_name}
              />
            </div>
            <div className="user-info">
              <strong className="user-name">{p.full_name}</strong>
              <span className="user-memberid">ID: {p.member_id || "N/A"}</span>
            </div>
          </label>
        ))}
      </div>
    )}

    {!registeredStatus && list.length > 0 && (
      <button
        onClick={submit}
        disabled={selected.length === 0}
        className="submit-btn"
      >
        Confirm Registration
      </button>
    )}
  </div>
);


  const tabs = [
    { id: "registered", label: "Registered" },
    { id: "notRegistered", label: "Not Registered" },
  ];

  return (
    <div className="profile-page">
      {/* Sidebar Tabs */}
      <div className="profile-sidebar">
        <div className="profile-header" style={{ padding: "1.2rem" }}>
          <div className="profile-info-compact">
            <h2 className="profile-name">{yatra?.title || "Yatra Registration"}</h2>
            {yatra ? (
              <>
                <p className="profile-username">
                  📍 {yatra.location || "Unknown Location"}
                </p>
                <p style={{ fontSize: "0.9rem", color: "#475569" }}>
                  🗓 {formatDate(yatra.start_date)} → {formatDate(yatra.end_date)}
                </p>
                {yatra.description && (
                  <p
                    style={{
                      fontSize: "0.85rem",
                      color: "#64748b",
                      marginTop: "0.4rem",
                    }}
                  >
                    {yatra.description}
                  </p>
                )}
              </>
            ) : (
              <p className="profile-username">Yatra ID: {yatra_id}</p>
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
            </button>
          ))}
        </nav>
      </div>

      {/* Right Content */}
      <div className="profile-content">
        {activeTab === "registered" && renderList(registered, true)}
        {activeTab === "notRegistered" && renderList(notRegistered, false)}
      </div>
    </div>
  );
}
