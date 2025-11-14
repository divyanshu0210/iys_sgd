import { useEffect, useState } from "react";
import API from "../../services/api";
import { useAuth } from "../../context/AuthContext";
import "../../css/profiledisplay.css";

export default function Profile() {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [activeTab, setActiveTab] = useState("basic");

  // Fetch profile
  useEffect(() => {
    API.get(`/api/profile/`).then((res) => setProfile(res.data));
  }, []);

  if (!profile) return <div className="loading">Loading profile...</div>;

  const tabs = [
    { id: "basic", label: "Basic Info" },
    { id: "devotional", label: "Devotional Info" },
    { id: "other", label: "Other Info" },
  ];

  const InfoRow = ({ label, value }) => (
    <div className="info-row">
      <span className="info-label">{label}:</span>
      <span className="info-value">{value || "-"}</span>
    </div>
  );

  const renderBasicInfo = () => (
    <div className="tab-content">
      <h3>Basic Information</h3>
      <div className="info-grid">
        <InfoRow label="Full Name" value={profile.full_name} />
        <InfoRow label="Date of Birth" value={profile.dob} />
        <InfoRow label="Gender" value={profile.gender} />
        <InfoRow label="Marital Status" value={profile.marital_status} />
        <InfoRow label="Mobile" value={profile.mobile} />
        <InfoRow label="Center" value={profile.center} />
        <InfoRow label="Aadhar Card No" value={profile.aadhar_card_no} />

        {/* 🔹 Show Initiation details only if initiated */}
        <InfoRow label="Initiated" value={profile.is_initiated ? "Yes" : "No"} />
        {profile.is_initiated && (
          <>
            <InfoRow label="Initiated Name" value={profile.initiated_name} />
            <InfoRow label="Spiritual Master" value={profile.spiritual_master} />
            <InfoRow label="Initiation Date" value={profile.initiation_date} />
            <InfoRow label="Initiation Place" value={profile.initiation_place} />
          </>
        )}
      </div>
    </div>
  );

  const renderDevotionalInfo = () => (
    <div className="tab-content">
      <h3>Devotional Information</h3>
      <div className="info-grid">
        <InfoRow
          label="When were you introduced to ISKCON?"
          value={profile.iskcon_introduction_date}
        />
        <InfoRow
          label="Who introduced you to ISKCON?"
          value={profile.iskcon_introduced_by}
        />
        <InfoRow
          label="Which ISKCON center you first connected to?"
          value={profile.first_connected_center}
        />
        <InfoRow
          label="How many rounds of Hare Krishna Mahamantra you chant daily?"
          value={`${profile.daily_chanting_rounds || 0} round(s)`}
        />
        <InfoRow
          label="Mentor / Counsellor"
          value={profile.mentor_name || profile.mentor || "-"}
        />
      </div>
    </div>
  );

  const renderOtherInfo = () => (
    <div className="tab-content">
      <h3>Other Information</h3>
      <div className="info-grid">
        <InfoRow
          label="Email Consent"
          value={profile.email_consent ? "Yes" : "No"}
        />
        <InfoRow label="Address" value={profile.address} />
        <InfoRow label="Emergency Contact" value={profile.emergency_contact} />
        <InfoRow label="Country" value={profile.country} />
        <InfoRow
          label="Member Since"
          value={new Date(profile.created_at).toLocaleDateString("en-IN", {
            day: "2-digit",
            month: "long",
            year: "numeric",
          })}
        />
      </div>
    </div>
  );

  return (
    <div className="profile-page">
      {/* Left Sidebar */}
      <div className="profile-sidebar">
        <div className="profile-header">
          <div className="avatar-container">
            <img
              src={profile.profile_picture_url || "/default-avatar.png"}
              alt="Profile"
              className="profile-avatar"
            />
          </div>

          <div className="profile-info-compact">
            <h2 className="profile-name">{profile.full_name}</h2>
            <p className="profile-username">@{profile.email || "guest"}</p>

            <div className="profile-member-info">
              <p>
                <strong>ID:</strong> {profile.member_id || "N/A"}
              </p>
              <p>
                <strong>Type:</strong> {profile.user_type || "Member"}
              </p>
            </div>
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

      {/* Right Content Area */}
      <div className="profile-content">
        {activeTab === "basic" && renderBasicInfo()}
        {activeTab === "devotional" && renderDevotionalInfo()}
        {activeTab === "other" && renderOtherInfo()}
      </div>
    </div>
  );
}
