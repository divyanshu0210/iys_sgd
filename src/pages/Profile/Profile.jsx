import { createContext, useContext, useEffect, useRef, useState } from "react";
import API from "../../services/api";
import "../../css/profiledisplay.css";
import FullPageLoader from "../../components/FullPageLoader";
import { SPIRITUAL_MASTERS, CENTER_OPTIONS, GENDER_OPTIONS, MARITAL_OPTIONS, validateInitiationFields } from "./data";
import { Check, X, Pencil, Camera } from "lucide-react";
import { useAuth } from "../../context/AuthContext";

const CENTER_OPTS = CENTER_OPTIONS.map((c) => ({ value: c, label: c }));

// Normalise any date value to YYYY-MM-DD for <input type="date">
const toDateInput = (val) => {
  if (!val) return "";
  if (/^\d{4}-\d{2}-\d{2}$/.test(val)) return val;
  const d = new Date(val);
  return isNaN(d) ? "" : d.toISOString().split("T")[0];
};

const EditCtx = createContext(null);

// ── Tab heading + Edit/Save/Cancel buttons in one row ────────────
function TabHeader({ title }) {
  const { isEditing, saving, saveStatus, startEditing, cancelEditing, handleSave } =
    useContext(EditCtx);
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.75rem" }}>
      <h3 style={{ margin: 0 }}>{title}</h3>
      <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
        {saveStatus && (
          <span style={{
            fontSize: "0.78rem", fontWeight: 600,
            color: saveStatus.type === "success" ? "#166534" : "#991b1b",
          }}>
            {saveStatus.msg}
          </span>
        )}
        {!isEditing ? (
          <button onClick={startEditing} title="Edit" style={{
            background: "none", border: "1px solid #2563eb", color: "#2563eb",
            borderRadius: 6, width: 28, height: 28, cursor: "pointer",
            display: "flex", alignItems: "center", justifyContent: "center", padding: 0,
          }}><Pencil size={14} /></button>
        ) : (
          <>
            <button onClick={handleSave} disabled={saving} title="Save" style={{
              background: "#16a34a", border: "none", color: "#fff",
              borderRadius: 6, width: 28, height: 28, cursor: "pointer",
              display: "flex", alignItems: "center", justifyContent: "center", padding: 0,
              opacity: saving ? 0.6 : 1,
            }}><Check size={15} /></button>
            <button onClick={cancelEditing} disabled={saving} title="Cancel" style={{
              background: "#e5e7eb", border: "none", color: "#374151",
              borderRadius: 6, width: 28, height: 28, cursor: "pointer",
              display: "flex", alignItems: "center", justifyContent: "center", padding: 0,
            }}><X size={15} /></button>
          </>
        )}
      </div>
    </div>
  );
}

// ── Inline-editable row ──────────────────────────────────────────
function Row({ label, value, field, type = "text", options, editable = true }) {
  const { isEditing, editData, set } = useContext(EditCtx);
  const showInput = isEditing && editable && field;

  let control = <span className="info-value">{value || "-"}</span>;

  if (showInput) {
    if (type === "boolean") {
      control = (
        <select value={editData[field] ? "yes" : "no"}
          onChange={(e) => set(field, e.target.value === "yes")}
          className="edit-input">
          <option value="yes">Yes</option>
          <option value="no">No</option>
        </select>
      );
    } else if (options) {
      control = (
        <select value={editData[field] ?? ""}
          onChange={(e) => set(field, e.target.value)}
          className="edit-input">
          <option value="">— Select —</option>
          {options.map((o) =>
            typeof o === "string"
              ? <option key={o} value={o}>{o}</option>
              : <option key={o.value} value={o.value}>{o.label}</option>
          )}
        </select>
      );
    } else if (type === "textarea") {
      control = (
        <textarea value={editData[field] ?? ""}
          onChange={(e) => set(field, e.target.value)}
          rows={2} className="edit-input" />
      );
    } else {
      control = (
        <input type={type} value={editData[field] ?? ""}
          onChange={(e) => set(field, e.target.value)}
          className="edit-input" />
      );
    }
  }

  return (
    <div className="info-row" style={{ flexDirection: "row", alignItems: "center", flexWrap: "wrap" }}>
      <span className="info-label">{label}:</span>
      {control}
    </div>
  );
}

// ── Main component ───────────────────────────────────────────────
export default function Profile() {
  const { fetchProfile: refreshAuthProfile } = useAuth();
  const [profile, setProfile] = useState(null);
  const [activeTab, setActiveTab] = useState("basic");
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({});
  const [saving, setSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState(null);
  const [photoFile, setPhotoFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const photoInputRef = useRef(null);

  useEffect(() => {
    API.get("/api/profile/").then((res) => setProfile(res.data));
  }, []);

  useEffect(() => {
    if (!photoFile) return setPhotoPreview(null);
    const url = URL.createObjectURL(photoFile);
    setPhotoPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [photoFile]);

  const set = (key, value) => setEditData((p) => ({ ...p, [key]: value }));

  const startEditing = () => {
    setEditData({
      first_name: profile.first_name || "",
      last_name: profile.last_name || "",
      dob: toDateInput(profile.dob),
      gender: profile.gender || "",
      marital_status: profile.marital_status || "",
      mobile: profile.mobile || "",
      center: profile.center || "",
      aadhar_card_no: profile.aadhar_card_no || "",
      is_initiated: profile.is_initiated ?? false,
      initiated_name: profile.initiated_name || "",
      spiritual_master: profile.spiritual_master || "",
      initiation_date: toDateInput(profile.initiation_date),
      initiation_place: profile.initiation_place || "",
      no_of_chanting_rounds: profile.no_of_chanting_rounds ?? profile.daily_chanting_rounds ?? 0,
      iskcon_introduction_date: toDateInput(profile.iskcon_introduction_date),
      iskcon_introduced_by: profile.iskcon_introduced_by || "",
      first_connected_center: profile.first_connected_center || "",
      email_consent: profile.email_consent ?? false,
      address: profile.address || "",
      emergency_contact: profile.emergency_contact || "",
      country: profile.country || "",
    });
    setSaveStatus(null);
    setIsEditing(true);
  };

  const cancelEditing = () => {
    setIsEditing(false);
    setEditData({});
    setPhotoFile(null);
    setSaveStatus(null);
  };

  const DATE_FIELDS = ["dob", "initiation_date", "iskcon_introduction_date"];

  const handleSave = async () => {
    setSaving(true);
    setSaveStatus(null);

    // If marking as initiated, the 4 devotional fields are required
    const initiated = editData.is_initiated ?? profile.is_initiated;
    if (initiated) {
      // Merge profile defaults so unchanged fields still count
      const merged = { ...profile, ...editData };
      const missing = validateInitiationFields(merged);
      if (missing.length) {
        setSaveStatus({ type: "error", msg: `Required when initiated: ${missing.join(", ")}` });
        setSaving(false);
        return;
      }
    }

    // Build a partial payload — only include fields that actually changed
    const changes = {};
    for (const key of Object.keys(editData)) {
      const original = profile[key] ?? "";
      const current = editData[key];
      // Normalise booleans and numbers for comparison
      if (String(current) !== String(original)) {
        // Skip empty date strings — backend rejects them
        if (DATE_FIELDS.includes(key) && current === "") continue;
        changes[key] = current;
      }
    }

    try {
      if (Object.keys(changes).length > 0) {
        await API.post("/api/profile/", changes);
      }
      if (photoFile) {
        const fd = new FormData();
        fd.append("profile_picture", photoFile);
        await API.post("/api/profile/upload-picture/", fd);
        setPhotoFile(null);
      }
      const res = await API.get("/api/profile/");
      setProfile(res.data);
      setIsEditing(false);
      setSaveStatus({ type: "success", msg: "Profile updated!" });
      refreshAuthProfile();
      setTimeout(() => setSaveStatus(null), 3000);
    } catch (err) {
      const data = err.response?.data;
      const msg =
        data && typeof data === "object"
          ? Object.values(data).flat().join(" | ")
          : "Failed to update profile.";
      setSaveStatus({ type: "error", msg });
    } finally {
      setSaving(false);
    }
  };

  const tabs = [
    { id: "basic", label: "Basic Info" },
    { id: "devotional", label: "Devotional Info" },
    { id: "other", label: "Other Info" },
  ];

  if (!profile) return <FullPageLoader />;

  return (
    <EditCtx.Provider value={{ isEditing, editData, set, saving, saveStatus, startEditing, cancelEditing, handleSave }}>
      {saving && <FullPageLoader />}
      <div className="profile-page">

        {/* ── Sidebar ── */}
        <div className="profile-sidebar">
          <div className="profile-header">
            <div style={{ position: "relative", display: "inline-block", verticalAlign: "top" }}>
              <div className="avatar-container">
                <img
                  src={photoPreview || profile.profile_picture_url || "/default-avatar.png"}
                  alt="Profile" className="profile-avatar"
                />
              </div>
              {isEditing && (
                <>
                  <button type="button" title="Change photo"
                    onClick={() => photoInputRef.current?.click()}
                    style={{
                      position: "absolute", bottom: "14%", right: "14%",
                      transform: "translate(50%, 50%)",
                      background: "rgba(0,0,0,0.55)",
                      backdropFilter: "blur(4px)",
                      color: "#fff", border: "2px solid #fff",
                      borderRadius: "50%", width: 28, height: 28,
                      cursor: "pointer", display: "flex",
                      alignItems: "center", justifyContent: "center",
                      padding: 0,
                    }}><Camera size={14} /></button>
                  <input ref={photoInputRef} type="file" accept="image/*"
                    style={{ display: "none" }}
                    onChange={(e) => setPhotoFile(e.target.files?.[0] ?? null)} />
                </>
              )}
            </div>

            <div className="profile-info-compact">
              <h2 className="profile-name" style={{ display: "flex", flexWrap: "wrap", alignItems: "baseline", gap: "4px" }}>
                <span style={{ whiteSpace: "nowrap" }}>
                  {profile.is_initiated ? profile.initiated_name : profile.full_name}
                </span>
                <span style={{ whiteSpace: "nowrap", fontSize: "0.75em", color: "#64748b", fontWeight: 500 }}>
                  (ID: {profile.member_id || "N/A"})
                </span>
              </h2>
              <p className="profile-username">{profile.email || "guest"}</p>
              <div className="profile-member-info">
                <p><strong>Type:</strong> {profile.user_type || "Member"}</p>
              </div>
            </div>
          </div>

          <nav className="vertical-tabs">
            {tabs.map((tab) => (
              <button key={tab.id}
                className={`tab-button ${activeTab === tab.id ? "active" : ""}`}
                onClick={() => setActiveTab(tab.id)}>
                <span className="tab-label">{tab.label}</span>
              </button>
            ))}
          </nav>
        </div>

        {/* ── Content ── */}
        <div className="profile-content">
          {activeTab === "basic" && (
            <div className="tab-content">
              <TabHeader title="Basic Information" />
              <div className="info-grid">
                <Row label="First Name"      field="first_name"       value={profile.first_name} />
                <Row label="Last Name"       field="last_name"        value={profile.last_name} />
                <Row label="Date of Birth"   field="dob"              value={profile.dob} type="date" />
                <Row label="Gender"          field="gender"           value={profile.gender} options={GENDER_OPTIONS} />
                <Row label="Marital Status"  field="marital_status"   value={profile.marital_status} options={MARITAL_OPTIONS} />
                <Row label="Mobile"          field="mobile"           value={profile.mobile} type="tel" />
                <Row label="Center"          field="center"           value={profile.center} options={CENTER_OPTS} />
                <Row label="Aadhaar No"      field="aadhar_card_no"   value={profile.aadhar_card_no} />
                <Row label="Rounds Chanting" field="no_of_chanting_rounds"
                  value={String(profile.no_of_chanting_rounds ?? profile.daily_chanting_rounds ?? 0)} type="number" />
                <Row label="Harinam Initiated" field="is_initiated"
                  value={profile.is_initiated ? "Yes" : "No"} type="boolean" />
                {(profile.is_initiated || (isEditing && editData.is_initiated)) && (
                  <>
                    <Row label="Initiated Name"   field="initiated_name"   value={profile.initiated_name} />
                    <Row label="Spiritual Master" field="spiritual_master" value={profile.spiritual_master}
                      options={SPIRITUAL_MASTERS.map((m) => ({ value: m, label: m }))} />
                    <Row label="Initiation Date"  field="initiation_date"  value={profile.initiation_date} type="date" />
                    <Row label="Initiation Place" field="initiation_place" value={profile.initiation_place} />
                  </>
                )}
                <Row label="Member ID" value={profile.member_id} editable={false} />
              </div>
            </div>
          )}

          {activeTab === "devotional" && (
            <div className="tab-content">
              <TabHeader title="Devotional Information" />
              <div className="info-grid">
                <Row label="Introduced to ISKCON"   field="iskcon_introduction_date" value={profile.iskcon_introduction_date} type="date" />
                <Row label="Introduced by"          field="iskcon_introduced_by"     value={profile.iskcon_introduced_by} />
                <Row label="First connected center" field="first_connected_center"   value={profile.first_connected_center} />
                <Row label="Daily chanting rounds"  field="no_of_chanting_rounds"
                  value={`${profile.no_of_chanting_rounds ?? profile.daily_chanting_rounds ?? 0} round(s)`} type="number" />
                <Row label="Mentor / Counsellor" value={profile.mentor_name || profile.mentor || "-"} editable={false} />
              </div>
            </div>
          )}

          {activeTab === "other" && (
            <div className="tab-content">
              <TabHeader title="Other Information" />
              <div className="info-grid">
                <Row label="Email Consent"     field="email_consent"     value={profile.email_consent ? "Yes" : "No"} type="boolean" />
                <Row label="Country"           field="country"           value={profile.country} />
                <Row label="Address"           field="address"           value={profile.address} type="textarea" />
                <Row label="Emergency Contact" field="emergency_contact" value={profile.emergency_contact} type="tel" />
                <Row label="Member Since" editable={false}
                  value={new Date(profile.created_at).toLocaleDateString("en-IN", {
                    day: "2-digit", month: "long", year: "numeric",
                  })} />
              </div>
            </div>
          )}
        </div>
      </div>
    </EditCtx.Provider>
  );
}
