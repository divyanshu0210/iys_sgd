import React, { useState, useEffect, useMemo, useRef } from "react";
import { useAuth } from "../../context/AuthContext";
import "../../css/profile.css";
import "../../css/bulkActions.css";
import API from "../../services/api";
import { SPIRITUAL_MASTERS, GENDER_OPTIONS, MARITAL_OPTIONS, validateInitiationFields } from "./data";
import useProfileForm, { MAX_PROFILE_PHOTO_SIZE } from "./useProfileForm";
import useBaces from "../../hooks/useBaces";
import FullPageLoader from "../../components/FullPageLoader.jsx";
import MemberCard from "../../components/MemberCard";
import MentorRequestBulkBar from "../../components/MentorRequestBulkBar";
import useMentorRequestBulkActions from "../../hooks/useMentorRequestBulkActions";

const resolveProfileImageUrl = (value) => {
  if (!value || typeof value !== "string") return "";
  if (/^(https?:|data:|blob:)/i.test(value)) return value;
  const baseUrl = (API.defaults.baseURL || window.location.origin).replace(/\/$/, "");
  return `${baseUrl}/${value.replace(/^\//, "")}`;
};

// ---------------------------------------------------------------
export default function BasicProfile({
  onComplete,
  requestCenterFilter = "all",
  showYatraNotice = true,
  initialReviewRequests,
}) {
  const { user, profile, fetchProfile } = useAuth();
  const photoInputRef = useRef(null);
  const statusRef = useRef(null);

  const [details, setDetails] = useState({
    firstName: "",
    lastName: "",
    dob: "",
    gender: "",
    mobile: "",
    maritalStatus: "",
    center: "",
    customCenter: "", // ✅ NEW
    aadhaarNumber: "",
    receiveEmails: false,
    roundsChanting: "", // ✅ NEW

    // ---- NEW devotional fields ----
    harinamInitiated: "", // "Yes" | "No" | ""
    initiatedName: "",
    spiritualMaster: "",
    initiationDate: "",
    initiationPlace: "",
  });


  const [existingPhotoUrl, setExistingPhotoUrl] = useState("");
  const {
    photoFile,
    photoPreview,
    errors,
    setErrors,
    status,
    setStatus,
    saving: submitting,
    setSaving: setSubmitting,
    handlePhotoChange,
    removePhoto,
  } = useProfileForm({ existingPhotoUrl });
  const { baces, baceNames } = useBaces();
  const [verificationStatus, setVerificationStatus] = useState("");
  const [reviewRequests, setReviewRequests] = useState(initialReviewRequests || []);
  const [reviewRequestsResolved, setReviewRequestsResolved] = useState(
    Array.isArray(initialReviewRequests)
  );
  const [isProfileComplete, setIsProfileComplete] = useState(false);
  const [editingProfile, setEditingProfile] = useState(false);
  const [profileResolved, setProfileResolved] = useState(false);
  const isReviewer = profile?.user_type === "mentor" || profile?.user_type === "counsellor";
  const isProfileEditable =
    !isProfileComplete || ["rejected", "incomplete"].includes(verificationStatus);
  const filteredReviewRequests = useMemo(() => {
    if (requestCenterFilter === "all") return reviewRequests;

    return reviewRequests.filter((request) => {
      const center = String(
        request.from_user?.center || request.bace || "Unknown Center"
      ).trim();
      return center === requestCenterFilter;
    });
  }, [requestCenterFilter, reviewRequests]);
  const {
    selectedIds: selectedReviewRequests,
    allSelected: allReviewRequestsSelected,
    loading: bulkReviewLoading,
    toggleSelection: toggleReviewSelection,
    toggleAll: toggleAllReviewRequests,
    clearSelection: clearReviewSelection,
    handleAction: handleBulkReview,
  } = useMentorRequestBulkActions(filteredReviewRequests);

  useEffect(() => {
    if (status?.type === "error") {
      requestAnimationFrame(() => {
        statusRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
      });
    }
  }, [status]);

  useEffect(() => {
    if (Array.isArray(initialReviewRequests)) {
      setReviewRequests(initialReviewRequests);
      setReviewRequestsResolved(true);
      return undefined;
    }

    if (!isReviewer) {
      setReviewRequestsResolved(true);
      return undefined;
    }

    let cancelled = false;
    setReviewRequestsResolved(false);
    API.get("/api/mentor/requests/")
      .then((res) => {
        if (!cancelled) setReviewRequests(res.data?.pending_requests || []);
      })
      .catch(() => {
        if (!cancelled) setReviewRequests([]);
      })
      .finally(() => {
        if (!cancelled) setReviewRequestsResolved(true);
      });
    return () => { cancelled = true; };
  }, [initialReviewRequests, isReviewer]);

  // Load any profile data already saved for this account so completion can
  // be resumed without re-entering everything.
  useEffect(() => {
    let cancelled = false;

    const loadExistingProfile = async () => {
      try {
        const data = profile || (await API.get("/api/profile/")).data;
        if (cancelled || !data) return;
        const savedCenter = data.center || "";
        const isPrimaryBace = baces.some((bace) => bace.name === savedCenter);
        const existingPhoto = resolveProfileImageUrl(
          data.profile_picture_url || data.profile_picture || data.profile_image
        );

        setDetails((current) => ({
          ...current,
          firstName: data.first_name || "",
          lastName: data.last_name || "",
          dob: data.dob ? String(data.dob).slice(0, 10) : "",
          gender: data.gender
            ? String(data.gender).charAt(0).toUpperCase() + String(data.gender).slice(1).toLowerCase()
            : "",
          mobile: data.mobile || "",
          maritalStatus: data.marital_status || "",
          // The backend stores a custom “Others” center in `center`. Restore
          // it as the Others selection and put the original text back in the
          // custom field so it is visible and can be submitted unchanged.
          center: isPrimaryBace ? savedCenter : savedCenter ? "Others" : "",
          customCenter: !isPrimaryBace && savedCenter && savedCenter !== "Others" ? savedCenter : "",
          aadhaarNumber: data.aadhar_card_no || data.aadhaar_number || "",
          receiveEmails: Boolean(data.email_consent),
          roundsChanting:
            data.no_of_chanting_rounds === null || data.no_of_chanting_rounds === undefined
              ? ""
              : String(data.no_of_chanting_rounds),
          harinamInitiated:
            data.is_initiated === null || data.is_initiated === undefined
              ? ""
              : data.is_initiated ? "Yes" : "No",
          initiatedName: data.initiated_name || "",
          spiritualMaster: data.spiritual_master || "",
          initiationDate: data.initiation_date ? String(data.initiation_date).slice(0, 10) : "",
          initiationPlace: data.initiation_place || "",
        }));
        setExistingPhotoUrl(existingPhoto);
        setVerificationStatus(data.profile_verification_status || "");
        const complete = data.profile_verification_status !== "incomplete" && Boolean(
          data.first_name &&
          data.last_name &&
          data.dob &&
          data.gender &&
          data.mobile &&
          data.marital_status &&
          data.center &&
          data.aadhar_card_no &&
          data.is_initiated !== null &&
          data.is_initiated !== undefined &&
          data.no_of_chanting_rounds !== null &&
          data.no_of_chanting_rounds !== undefined &&
          (data.profile_picture_url || data.profile_picture || data.profile_image)
        );
        setIsProfileComplete(complete);
        setEditingProfile(!complete);
      } catch (err) {
        // A missing profile is expected for a brand-new user.
        console.debug("No existing profile to prefill", err);
      } finally {
        if (!cancelled) setProfileResolved(true);
      }
    };

    loadExistingProfile();
    return () => { cancelled = true; };
  }, [baceNames, baces, profile]);

  // -----------------------------------------------------------------
  const onChange = (key, value) => {
    setDetails((s) => ({ ...s, [key]: value }));
    setErrors((e) => ({ ...e, [key]: "" }));
  };

  // -----------------------------------------------------------------
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
      "roundsChanting", // ✅ REQUIRED FOR ALL
    ]) {
      if (!details[key]) newErrors[key] = "This field is required";
    }

    // Mobile number validation (exactly 10 digits)
    if (details.mobile) {
      const mobile = details.mobile.trim();
      const mobileRegex = /^\d{10}$/;
      if (!mobileRegex.test(mobile)) {
        newErrors.mobile = "Mobile number must be 10 digits";
      }
    }
    // Aadhaar specific validation
    if (details.aadhaarNumber) {
      const aadhaar = details.aadhaarNumber.trim();
      const aadhaarRegex = /^\d{12}$/; // exactly 12 digits
      if (!aadhaarRegex.test(aadhaar)) {
        newErrors.aadhaarNumber = "Aadhaar number must be 12 digits";
      }
    }

    if (details.center === "Others" && !details.customCenter.trim()) {
      newErrors.customCenter = "This field is required";
    }

    if (details.roundsChanting) {
      if (isNaN(details.roundsChanting) || Number(details.roundsChanting) < 0) {
        newErrors.roundsChanting = "Enter a valid number";
      }
    }

    // Photo
    if (!photoFile && !existingPhotoUrl) newErrors.photo = "Photo is required (max 1 MB)";
    else if (photoFile && photoFile.size > MAX_PROFILE_PHOTO_SIZE)
      newErrors.photo = "Photo exceeds 1 MB size limit";

    // Email consent
    if (!details.receiveEmails)
      newErrors.receiveEmails =
        "You must agree to receive temple announcements";

    // ---- Devotional validation (only when initiated = Yes) ----
    if (details.harinamInitiated === "Yes") {
      const missing = validateInitiationFields({
        initiated_name:   details.initiatedName,
        spiritual_master: details.spiritualMaster,
        initiation_date:  details.initiationDate,
        initiation_place: details.initiationPlace,
      });
      missing.forEach((label) => {
        const keyMap = { "Initiated Name": "initiatedName", "Spiritual Master": "spiritualMaster", "Initiation Date": "initiationDate", "Initiation Place": "initiationPlace" };
        newErrors[keyMap[label]] = "Required when initiated";
      });
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // -----------------------------------------------------------------
  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus(null);

    if (!validate()) {
      setStatus({
        type: "error",
        msg: "Please fill all required fields correctly.",
      });
      return;
    }

    const confirmed = window.confirm(
      "Are you sure you want to submit your profile? You will not be able to change your profile once it is submitted."
    );
    if (!confirmed) return;

    setSubmitting(true);
    const token = localStorage.getItem("userToken");

    try {
      // ---------- 1. Textual profile ----------
      const profileData = new FormData();
      profileData.append("username", user?.username || "");
      profileData.append("first_name", details.firstName);
      profileData.append("last_name", details.lastName);
      profileData.append("dob", details.dob);
      profileData.append("gender", details.gender?.toLowerCase() || "");
      profileData.append("marital_status", details.maritalStatus);
      profileData.append("mobile", details.mobile);
      profileData.append("aadhar_card_no", details.aadhaarNumber);
      profileData.append(
        "center",
        details.center === "Others" ? details.customCenter.trim() : details.center
      );
      profileData.append("email_consent", String(details.receiveEmails));
      profileData.append("is_initiated", String(details.harinamInitiated === "Yes"));
      profileData.append("no_of_chanting_rounds", String(Number(details.roundsChanting)));

      // ✅ Include devotional fields only if harinamInitiated is "Yes"
      if (details.harinamInitiated === "Yes") {
        profileData.append("initiated_name", details.initiatedName);
        profileData.append("spiritual_master", details.spiritualMaster);
        profileData.append("initiation_date", details.initiationDate);
        profileData.append("initiation_place", details.initiationPlace);
      }

      if (photoFile) {
        profileData.append("profile_picture", photoFile);
      }

      await API.post("/api/profile/", profileData, {
        headers: {
          ...(token && { Authorization: `Token ${token}` }),
        },
      });

      // ---------- SUCCESS ----------
      await fetchProfile();
      setStatus({ type: "success", msg: "Profile saved successfully!" });
      setIsProfileComplete(true);
      setEditingProfile(false);
      onComplete?.();
    } catch (err) {
      let errorMsg = "An error occurred while saving the profile.";

      const data = err.response?.data;

      if (data) {
        // 1️⃣ Field-level DRF errors (most common)
        if (typeof data === "object" && !Array.isArray(data)) {
          errorMsg = Object.entries(data)
            .map(([field, messages]) => {
              const values = Array.isArray(messages) ? messages : [messages];
              const text = values
                .map((msg) => {
                  const message = typeof msg === "string" ? msg : JSON.stringify(msg);
                  return message.charAt(0).toUpperCase() + message.slice(1);
                })
                .join(" ");
              return field === "detail" ? text : `${field}: ${text}`;
            })
            .join("\n");
        }

        // 2️⃣ DRF generic errors
        else if (data.detail) {
          errorMsg = data.detail;
        }
      } else if (err.message) {
        errorMsg = err.message;
      }

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
      customCenter: "",
      aadhaarNumber: "",
      receiveEmails: false,
      harinamInitiated: "",
      initiatedName: "",
      spiritualMaster: "",
      initiationDate: "",
      initiationPlace: "",
      roundsChanting: "",
    });
    setErrors({});
    setStatus(null);
    setIsProfileComplete(false);
    setEditingProfile(true);
  };

  const ownMember = {
    ...profile,
    is_self: true,
    full_name: `${details.firstName} ${details.lastName}`.trim(),
    first_name: details.firstName,
    last_name: details.lastName,
    profile_picture: photoPreview || profile?.profile_picture_url || existingPhotoUrl,
    user_type: profile?.user_type || "guest",
    dob: details.dob,
    gender: details.gender,
    marital_status: details.maritalStatus,
    mobile: details.mobile,
    center: details.center,
    bace: details.center,
    is_initiated: details.harinamInitiated === "Yes",
    initiated_name: details.initiatedName,
  };

  const profileSummary = (
    <div className={isReviewer ? "profile-summary-card" : "cp-card profile-summary-card"}>
      {!isReviewer && showYatraNotice && (
        <p className="step-purpose-notice">Profile needs to be verified before Approval for Yatra can be checked.</p>
      )}
      {verificationStatus === "rejected" && (
        <div className="status-box error" style={{ marginBottom: "1rem" }}>
          Your profile was rejected. Please check and submit your profile again.
        </div>
      )}
      <h2 className="cp-title">Your Profile</h2>
      <div className="members-list">
        <MemberCard m={ownMember} />
      </div>
      {isProfileEditable && (
        <div className="form-actions">
          <button
            type="button"
            className="cp-btn-primary"
            onClick={() => {
              if (!isProfileEditable) {
                alert("Your profile cannot be edited while it is pending approval.");
                return;
              }
              setEditingProfile(true);
            }}
          >
            Edit Profile
          </button>
        </div>
      )}
    </div>
  );

  // -----------------------------------------------------------------
  const Label = ({ htmlFor, children }) => (
    <label htmlFor={htmlFor}>
      {children} <span style={{ color: "#e74c3c" }}>*</span>
    </label>
  );

  // -----------------------------------------------------------------
  return (
    !profileResolved || (isReviewer && !reviewRequestsResolved) ? <FullPageLoader /> :
    <>
      {submitting && <FullPageLoader />}
      <div className="cp-page">
        {isReviewer && (
          <section className="cp-card profile-requests-section has-fixed-bulk-actions" style={{ marginBottom: "1rem" }}>
            {showYatraNotice && (
              <p className="step-purpose-notice">Profile needs to be verified before Approval for Yatra can be checked.</p>
            )}
            <div className="profile-requests-heading">
              <h3 style={{ margin: 0 }}>New Profile Requests</h3>
            </div>
            <p className="cp-subtitle" style={{ marginBottom: "1rem" }}>
              Review new profiles assigned to your Bace.
            </p>
            {reviewRequests.length === 0 ? (
              <p className="empty-msg">No new profile requests.</p>
            ) : filteredReviewRequests.length === 0 ? (
              <p className="empty-msg">No profile requests for this center.</p>
            ) : (
              <div className="members-list">
                {filteredReviewRequests.map((request) => (
                  <MemberCard
                    key={request.id}
                    selectable
                    selected={selectedReviewRequests.includes(request.id)}
                    onSelect={() => toggleReviewSelection(request.id)}
                    m={{
                      ...request.from_user,
                      is_pending: true,
                      request_id: request.id,
                      request_created_at: request.created_at,
                      bace: request.bace,
                    }}
                  />
                ))}
              </div>
            )}
            <MentorRequestBulkBar
              selectedCount={selectedReviewRequests.length}
              allSelected={allReviewRequestsSelected}
              loading={bulkReviewLoading}
              onToggleAll={toggleAllReviewRequests}
              onCancel={clearReviewSelection}
              onAction={handleBulkReview}
            />
            {isProfileComplete && !editingProfile && profileSummary}
          </section>
        )}

        {(!isProfileComplete || editingProfile) ? (
        <>
        <form className="cp-card profile-form-card" onSubmit={handleSubmit} noValidate>
        {!isReviewer && showYatraNotice && (
          <p className="step-purpose-notice">Profile needs to be verified before Approval for Yatra can be checked.</p>
        )}
          <div className="profile-form-scroll">
          <h2 className="cp-title">Complete Your Profile To Continue</h2>
          {status && status.type === "error" && (
            <div
              ref={statusRef}
              className="status-box error"
              style={{ whiteSpace: "pre-line", marginBottom: "1rem" }}
            >
              {status.msg}
            </div>
          )}
          <div className="cp-grid">
            {/* ---------- Core fields (unchanged) ---------- */}
            {[
              ["firstName", "First Name", "text", "Enter first name"],
              ["lastName", "Last Name", "text", "Enter last name"],
              ["dob", "Date of Birth", "date", ""],
              ["gender", "Gender", "select", ""],
              ["mobile", "Mobile Number", "tel", "Mobile number"],
              ["maritalStatus", "Marital Status", "select", ""],
              // ["center", "Center / Base", "text", "Enter center or base"],
              [
                "aadhaarNumber",
                "Aadhaar Number",
                "text",
                "Enter Aadhaar number",
              ],
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
                      MARITAL_OPTIONS.map((opt) => (
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

            {/* ---------- Center / Base ---------- */}
            <div className="cp-field">
              <Label htmlFor="center">Bace</Label>

              <select
                id="center"
                value={details.center}
                onChange={(e) => onChange("center", e.target.value)}
                disabled={submitting}
                className={errors.center ? "error-border" : ""}
              >
                <option value="">Select</option>
                {baceNames.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>

              {errors.center && (
                <div className="error-text">{errors.center}</div>
              )}

            </div>

            {/* ---------- Custom Center (only if Others) ---------- */}
            {details.center === "Others" && (
              <div className="cp-field">
                <Label htmlFor="customCenter">Specify Center</Label>
                <input
                  id="customCenter"
                  type="text"
                  placeholder="Enter your center name"
                  value={details.customCenter}
                  onChange={(e) => onChange("customCenter", e.target.value)}
                  disabled={submitting}
                  className={errors.customCenter ? "error-border" : ""}
                />
                {errors.customCenter && (
                  <div className="error-text">{errors.customCenter}</div>
                )}
              </div>
            )}

            {/* ---------- Rounds Chanting ---------- */}
            <div className="cp-field">
              <Label htmlFor="roundsChanting">Number of Rounds Chanting</Label>
              <input
                id="roundsChanting"
                type="number"
                min="0"
                placeholder="e.g. 4, 8, 16"
                value={details.roundsChanting}
                onChange={(e) => onChange("roundsChanting", e.target.value)}
                disabled={submitting}
                className={errors.roundsChanting ? "error-border" : ""}
              />
              {errors.roundsChanting && (
                <div className="error-text">{errors.roundsChanting}</div>
              )}
            </div>

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
                    onChange={(e) =>
                      onChange("spiritualMaster", e.target.value)
                    }
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
                  <input
                    id="initiationPlace"
                    type="text"
                    placeholder="e.g.Vrindavan, Pandharpur, Wada etc."
                    value={details.initiationPlace}
                    onChange={(e) =>
                      onChange("initiationPlace", e.target.value)
                    }
                    disabled={submitting}
                    className={errors.initiationPlace ? "error-border" : ""}
                  />
                  {errors.initiationPlace && (
                    <div className="error-text">{errors.initiationPlace}</div>
                  )}
                </div>
              </>
            )}

            {/* ---------- Photo Upload (unchanged) ---------- */}
            <div className="cp-field" style={{ alignSelf: "start" }}>
              <div
                className="photo-upload-layout"
                style={{
                  display: "flex",
                  flexDirection: "row",
                  alignItems: "center",
                  flexWrap: "wrap",
                  gap: "1rem",
                }}
              >
                <div className="photo-upload-controls">
                  <Label htmlFor="photo">Upload Profile Photo</Label>
                  <span style={{ fontSize: "0.7rem", color: "#888" }}>
                    Max size: <b>1 MB</b>.
                  </span>
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

                  {photoFile && (
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
                        {photoFile.name}
                      </span>
                      <button
                        type="button"
                        onClick={() => removePhoto(photoInputRef)}
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
                </div>

                {photoPreview && (
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
                        onError={(e) => {
                          e.currentTarget.style.display = "none";
                        }}
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
                {errors.photo && (
                  <div className="error-text">{errors.photo}</div>
                )}
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
              I agree to receive temple news, announcements, and other
              promotional emails.
            </label>
          </div>
          {errors.receiveEmails && (
            <div className="error-text">{errors.receiveEmails}</div>
          )}

          {/* ---------- Status ---------- */}
          {status && status.type !== "error" && (
            <div
              className="status-box success"
              style={{ whiteSpace: "pre-line" }}
            >
              {status.msg}
            </div>
          )}
          </div>

          {/* ---------- Actions ---------- */}
          <div className="form-actions profile-form-actions">
           
            {isProfileComplete && (
              <button
                type="button"
                onClick={() => {
                  setEditingProfile(false);
                  setErrors({});
                  setStatus(null);
                }}
                className="cp-btn-ghost"
                disabled={submitting}
              >
                Cancel
              </button>
            )}
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
              {submitting ? "Submitting..." : "Submit"}
            </button>
          </div>
        </form>
        </>
        ) : (!isReviewer ? profileSummary : null)}

      </div>
    </>
  );
}
