import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import "../../css/profile.css";
import API from "../../services/api";
import { INITIATION_PLACES, SPIRITUAL_MASTERS } from "./data";
import ProfileApprovalForm from "./ProfileApprovalForm.jsx";
import FullPageLoader from "../../components/FullPageLoader.jsx";

const MAX_PHOTO_SIZE = 1 * 1024 * 1024; // 1MB

// ---------------------------------------------------------------
export default function BasicProfile() {
  const { user, fetchProfile ,profileStage} = useAuth();
  const navigate = useNavigate();
  const photoInputRef = useRef(null);

  const [details, setDetails] = useState({
    firstName: "",
    lastName: "",
    dob: "",
    gender: "",
    mobile: "",
    maritalStatus: "",
    center: "",
    aadhaarNumber: "",
    photo: null,
    receiveEmails: false,

    // ---- NEW devotional fields ----
    harinamInitiated: "", // "Yes" | "No" | ""
    initiatedName: "",
    spiritualMaster: "",
    initiationDate: "",
    initiationPlace: "",
  });

  const MARITAL_STATUS_OPTIONS = [
    { value: "brahmachari_temple", label: "Brahmachari (Temple)" },
    { value: "unmarried", label: "Unmarried" },
    { value: "grhastha", label: "Grhastha" },
    { value: "vanaprastha", label: "Vanaprastha" },
    { value: "sannyasi", label: "Sannyasi" },
    { value: "others", label: "Others" },
  ];

  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [status, setStatus] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);


  // -----------------------------------------------------------------
  // Photo preview
  useEffect(() => {
    if (!details.photo) return setPhotoPreview(null);
    const url = URL.createObjectURL(details.photo);
    setPhotoPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [details.photo]);

  // -----------------------------------------------------------------
  const onChange = (key, value) => {
    setDetails((s) => ({ ...s, [key]: value }));
    setErrors((e) => ({ ...e, [key]: "" }));
  };

  // -----------------------------------------------------------------
  const handlePhotoChange = (e) => {
    const file = e.target.files?.[0] ?? null;
    if (file && file.size > MAX_PHOTO_SIZE) {
      setErrors((e) => ({ ...e, photo: "File size must be less than 1 MB" }));
      onChange("photo", null);
      if (photoInputRef.current) photoInputRef.current.value = "";
      return;
    }
    onChange("photo", file);
  };

  const removePhoto = () => {
    onChange("photo", null);
    if (photoInputRef.current) photoInputRef.current.value = "";
  };

  // -----------------------------------------------------------------
  const validate = () => {
    const newErrors = {};

    // Core required fields
    for (const key of [
      "firstName",
      "lastName",
      "dob",
      "gender",
      "mobile",
      "maritalStatus",
      "center",
      "aadhaarNumber",
      "harinamInitiated",
    ]) {
      if (!details[key]) newErrors[key] = "This field is required";
    }

    // Photo
    if (!details.photo) newErrors.photo = "Photo is required (max 1 MB)";
    else if (details.photo.size > MAX_PHOTO_SIZE)
      newErrors.photo = "Photo exceeds 1 MB size limit";

    // Email consent
    if (!details.receiveEmails)
      newErrors.receiveEmails =
        "You must agree to receive temple announcements";

    // ---- Devotional validation (only when initiated = Yes) ----
    if (details.harinamInitiated === "Yes") {
      if (!details.initiatedName)
        newErrors.initiatedName = "Required when initiated";
      if (!details.spiritualMaster)
        newErrors.spiritualMaster = "Required when initiated";
      if (!details.initiationDate)
        newErrors.initiationDate = "Required when initiated";
      if (!details.initiationPlace)
        newErrors.initiationPlace = "Required when initiated";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // -----------------------------------------------------------------
  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus(null);

    if (!validate()) {
      setStatus({ type: "error", msg: "Please fill all required fields." });
      return;
    }

    setSubmitting(true);
    const token = localStorage.getItem("userToken");

    try {
      // ---------- 1. Textual profile ----------
      const profileData = {
        username: user?.username || "",
        first_name: details.firstName,
        last_name: details.lastName,
        dob: details.dob,
        gender: details.gender?.toLowerCase() || "",
        marital_status: details.maritalStatus,
        mobile: details.mobile,
        aadhar_card_no: details.aadhaarNumber,
        center: details.center,
        email_consent: details.receiveEmails,
        is_initiated: details.harinamInitiated === "Yes",
      };

      // ✅ Include devotional fields only if harinamInitiated is "Yes"
      if (details.harinamInitiated === "Yes") {
        profileData.initiated_name = details.initiatedName;
        profileData.spiritual_master = details.spiritualMaster;
        profileData.initiation_date = details.initiationDate;
        profileData.initiation_place = details.initiationPlace;
      }

      await API.post("/api/profile/", profileData, {
        headers: {
          "Content-Type": "application/json",
          ...(token && { Authorization: `Token ${token}` }),
        },
      });

      // ---------- 2. Photo (unchanged) ----------
      if (details.photo) {
        const formData = new FormData();
        formData.append("profile_picture", details.photo);

        await API.post("/api/profile/upload-picture/", formData, {
          headers: {
            ...(token && { Authorization: `Token ${token}` }),
            "Content-Type": "multipart/form-data",
          },
        });
      }

      // ---------- SUCCESS ----------
      setStatus({ type: "success", msg: "Profile saved successfully!" });
      const stage = await fetchProfile();
      // setTimeout(() => navigate("/"), 1500);
    } catch (err) {
      const errorMsg =
        err.response?.data?.message ||
        err.response?.data?.detail ||
        err.message ||
        "An error occurred while saving the profile.";
      setStatus({ type: "error", msg: errorMsg });
    } finally {
      setSubmitting(false);
    }
  };

  // -----------------------------------------------------------------
  const handleReset = () => {
    setDetails({
      firstName: "",
      lastName: "",
      dob: "",
      gender: "",
      mobile: "",
      maritalStatus: "",
      center: "",
      aadhaarNumber: "",
      photo: null,
      receiveEmails: false,
      harinamInitiated: "",
      initiatedName: "",
      spiritualMaster: "",
      initiationDate: "",
      initiationPlace: "",
    });
    setErrors({});
    setStatus(null);
  };

  // -----------------------------------------------------------------
  const Label = ({ htmlFor, children }) => (
    <label htmlFor={htmlFor}>
      {children} <span style={{ color: "#e74c3c" }}>*</span>
    </label>
  );

  // -----------------------------------------------------------------
  if (profileStage === "guest") {
    return <ProfileApprovalForm user={user} />;
  }
  return (
    <>
     {submitting&&<FullPageLoader/>}
    <div className="cp-page">
      <form className="cp-card" onSubmit={handleSubmit} noValidate>
        <h2 className="cp-title">Complete Your Profile To Continue</h2>
        <p style={{ textAlign: "center", color: "#555", marginBottom: "1rem" }}>
          Please fill in your details.
        </p>

        <div className="cp-grid">
          {/* ---------- Core fields (unchanged) ---------- */}
          {[
            ["firstName", "First Name", "text", "Enter first name"],
            ["lastName", "Last Name", "text", "Enter last name"],
            ["dob", "Date of Birth", "date", ""],
            ["gender", "Gender", "select", ""],
            ["mobile", "Mobile Number", "tel", "Mobile number"],
            ["maritalStatus", "Marital Status", "select", ""],
            ["center", "Center / Base", "text", "Enter center or base"],
            ["aadhaarNumber", "Aadhaar Number", "text", "Enter Aadhaar number"],
          ].map(([key, label, type, placeholder]) => (
            <div className="cp-field" key={key}>
              <Label htmlFor={key}>{label}</Label>

              {type === "select" ? (
                <select
                  id={key}
                  value={details[key]}
                  onChange={(e) => onChange(key, e.target.value)}
                  disabled={submitting}
                  className={errors[key] ? "error-border" : ""}
                >
                  <option value="">Select</option>
                  {key === "gender" && (
                    <>
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </>
                  )}
                  {key === "maritalStatus" &&
                    MARITAL_STATUS_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                </select>
              ) : (
                <input
                  id={key}
                  type={type}
                  placeholder={placeholder}
                  value={details[key]}
                  onChange={(e) => onChange(key, e.target.value)}
                  disabled={submitting}
                  className={errors[key] ? "error-border" : ""}
                />
              )}
              {errors[key] && <div className="error-text">{errors[key]}</div>}
            </div>
          ))}

          {/* ---------- NEW: Harinam Initiated ---------- */}
          <div className="cp-field">
            <Label htmlFor="harinamInitiated">Harinam Initiated?</Label>
            <select
              id="harinamInitiated"
              value={details.harinamInitiated}
              onChange={(e) => onChange("harinamInitiated", e.target.value)}
              disabled={submitting}
              className={errors.harinamInitiated ? "error-border" : ""}
            >
              <option value="">Select</option>
              <option value="Yes">Yes</option>
              <option value="No">No</option>
            </select>
            {errors.harinamInitiated && (
              <div className="error-text">{errors.harinamInitiated}</div>
            )}
          </div>

          {/* ---------- Conditional devotional fields ---------- */}
          {details.harinamInitiated === "Yes" && (
            <>
              <div className="cp-field">
                <Label htmlFor="initiatedName">Initiated Name</Label>
                <input
                  id="initiatedName"
                  type="text"
                  placeholder="Enter initiated name"
                  value={details.initiatedName}
                  onChange={(e) => onChange("initiatedName", e.target.value)}
                  disabled={submitting}
                  className={errors.initiatedName ? "error-border" : ""}
                />
                {errors.initiatedName && (
                  <div className="error-text">{errors.initiatedName}</div>
                )}
              </div>

              <div className="cp-field">
                <Label htmlFor="spiritualMaster">Spiritual Master</Label>
                <select
                  id="spiritualMaster"
                  value={details.spiritualMaster}
                  onChange={(e) => onChange("spiritualMaster", e.target.value)}
                  disabled={submitting}
                  className={errors.spiritualMaster ? "error-border" : ""}
                >
                  <option value="">Select Spiritual Master</option>
                  {SPIRITUAL_MASTERS.map((master) => (
                    <option key={master} value={master}>
                      {master}
                    </option>
                  ))}
                </select>
                {errors.spiritualMaster && (
                  <div className="error-text">{errors.spiritualMaster}</div>
                )}
              </div>

              <div className="cp-field">
                <Label htmlFor="initiationDate">Initiation Date</Label>
                <input
                  id="initiationDate"
                  type="date"
                  value={details.initiationDate}
                  onChange={(e) => onChange("initiationDate", e.target.value)}
                  disabled={submitting}
                  className={errors.initiationDate ? "error-border" : ""}
                />
                {errors.initiationDate && (
                  <div className="error-text">{errors.initiationDate}</div>
                )}
              </div>

              <div className="cp-field">
                <Label htmlFor="initiationPlace">Initiation Place</Label>
                <select
                  id="initiationPlace"
                  value={details.initiationPlace}
                  onChange={(e) => onChange("initiationPlace", e.target.value)}
                  disabled={submitting}
                  className={errors.initiationPlace ? "error-border" : ""}
                >
                  <option value="">Select Place</option>
                  {INITIATION_PLACES.map((place) => (
                    <option key={place} value={place}>
                      {place}
                    </option>
                  ))}
                </select>
                {errors.initiationPlace && (
                  <div className="error-text">{errors.initiationPlace}</div>
                )}
              </div>
            </>
          )}

          {/* ---------- Photo Upload (unchanged) ---------- */}
          <div className="cp-field" style={{ alignSelf: "start" }}>
            <Label htmlFor="photo">Upload Profile Photo</Label>
            <span style={{ fontSize: "0.7rem", color: "#888" }}>
              Max size: <b>1 MB</b>.
            </span>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "0.0rem",
              }}
            >
              <div
                style={{ display: "flex", alignItems: "center", gap: "1rem" }}
              >
                <input
                  id="photo"
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoChange}
                  disabled={submitting}
                  ref={photoInputRef}
                  style={{ display: "none" }}
                />
                <label
                  htmlFor="photo"
                  style={{
                    background: "#3498db",
                    color: "white",
                    padding: "0.5rem 1rem",
                    borderRadius: "6px",
                    fontSize: "0.9rem",
                    cursor: "pointer",
                    userSelect: "none",
                  }}
                >
                  Choose File
                </label>

                {details.photo && (
                  <>
                    <span
                      style={{
                        fontSize: "0.85rem",
                        color: "#2c3e50",
                        maxWidth: "150px",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {details.photo.name}
                    </span>
                    <button
                      type="button"
                      onClick={removePhoto}
                      disabled={submitting}
                      style={{
                        background: "none",
                        border: "1px solid #e74c3c",
                        color: "#e74c3c",
                        padding: "0.25rem 0.75rem",
                        borderRadius: "4px",
                        fontSize: "0.8rem",
                        cursor: "pointer",
                      }}
                    >
                      Remove
                    </button>
                  </>
                )}
              </div>

              {details.photo && (
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: "0.5rem",
                  }}
                >
                  <div
                    style={{
                      width: "80px",
                      height: "80px",
                      borderRadius: "50%",
                      overflow: "hidden",
                      border: "3px solid #ddd",
                      boxShadow: "0 2px 6px rgba(0,0,0,0.1)",
                    }}
                  >
                    <img
                      src={photoPreview}
                      alt="Profile"
                      style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                      }}
                    />
                  </div>
                  <a
                    href={photoPreview}
                    target="_blank"
                    rel="noreferrer"
                    style={{
                      fontSize: "0.8rem",
                      color: "#3498db",
                      textDecoration: "underline",
                    }}
                  >
                    View Full
                  </a>
                </div>
              )}
              {errors.photo && <div className="error-text">{errors.photo}</div>}
            </div>
          </div>
        </div>

        {/* ---------- Email consent ---------- */}
        <div
          style={{
            marginTop: "1rem",
            display: "flex",
            alignItems: "center",
            gap: "0.5rem",
          }}
        >
          <input
            type="checkbox"
            id="receiveEmails"
            checked={details.receiveEmails}
            onChange={(e) => onChange("receiveEmails", e.target.checked)}
            disabled={submitting}
            className={errors.receiveEmails ? "error-border" : ""}
          />
          <label
            htmlFor="receiveEmails"
            style={{ fontSize: "0.9rem", color: "#333" }}
          >
            I agree to receive temple news, announcements, and other promotional
            emails.
          </label>
        </div>
        {errors.receiveEmails && (
          <div className="error-text">{errors.receiveEmails}</div>
        )}

        {/* ---------- Status ---------- */}
        {status && (
          <div
            className={`status-box ${
              status.type === "success" ? "success" : "error"
            }`}
          >
            {status.msg}
          </div>
        )}

        {/* ---------- Actions ---------- */}
        <div className="form-actions">
          <button
            type="button"
            onClick={handleReset}
            className="cp-btn-ghost"
            disabled={submitting}
          >
            Reset
          </button>
          <button
            type="submit"
            className="cp-btn-primary"
            disabled={submitting}
          >
            {submitting ? "Saving..." : "Save & Continue"}
          </button>
        </div>
      </form>
    </div>
    </>

  );
}
