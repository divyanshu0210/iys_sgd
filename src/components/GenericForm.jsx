import React, { useState, useEffect, useRef } from "react";
import "../css/profile.css";

const MAX_PHOTO_SIZE = 1 * 1024 * 1024; // 1 MB

export default function GenericForm({
  title,
  description,
  fields,
  apiEndpoint,
  onSuccess,
  submitButtonLabel = "Submit",
  resetButtonLabel = "Reset",
}) {
  const photoInputRef = useRef(null);
  const [details, setDetails] = useState({});
  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [photoPreview, setPhotoPreview] = useState(null);

  useEffect(() => {
    // Initialize empty fields
    const init = {};
    fields.forEach((f) => (init[f.name] = f.defaultValue || ""));
    setDetails(init);
  }, [fields]);

  // Update preview when photo changes
  useEffect(() => {
    if (!details.photo) return setPhotoPreview(null);
    const url = URL.createObjectURL(details.photo);
    setPhotoPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [details.photo]);

  const onChange = (key, value) => {
    setDetails((s) => ({ ...s, [key]: value }));
    setErrors((e) => ({ ...e, [key]: "" }));
  };

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

  const validate = () => {
    const newErrors = {};
    fields.forEach((f) => {
      if (f.required && !details[f.name]) {
        newErrors[f.name] = "This field is required";
      }
      if (f.name === "photo" && details.photo) {
        if (details.photo.size > MAX_PHOTO_SIZE) {
          newErrors.photo = "Photo exceeds 1 MB size limit";
        }
      }
    });
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus(null);
    if (!validate()) {
      setStatus({ type: "error", msg: "Please fill all required fields." });
      return;
    }

    setSubmitting(true);
    try {
      const token = localStorage.getItem("token");
      const formData = new FormData();
      Object.entries(details).forEach(([key, val]) => {
        if (val instanceof File) formData.append(key, val);
        else formData.append(key, val ?? "");
      });

      const res = await fetch(apiEndpoint, {
        method: "POST",
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        body: formData,
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || "Failed to save form");
      }

      setStatus({ type: "success", msg: "Saved successfully!" });
      if (onSuccess) onSuccess();
    } catch (err) {
      setStatus({ type: "error", msg: err.message });
    } finally {
      setSubmitting(false);
    }
  };

  const handleReset = () => {
    const reset = {};
    fields.forEach((f) => (reset[f.name] = f.defaultValue || ""));
    setDetails(reset);
    setErrors({});
    setStatus(null);
  };

  const Label = ({ htmlFor, children }) => (
    <label htmlFor={htmlFor}>
      {children} <span style={{ color: "#e74c3c" }}>*</span>
    </label>
  );

  return (
    <form className="cp-card" onSubmit={handleSubmit} noValidate>
      <h2 className="cp-title">{title}</h2>
      {description && (
        <p style={{ textAlign: "center", color: "#555", marginBottom: "1rem" }}>
          {description}
        </p>
      )}

      <div className="cp-grid">
        {fields.map((f) => (
          <div className="cp-field" key={f.name}>
            {f.label && f.required && <Label htmlFor={f.name}>{f.label}</Label>}

            {f.type === "select" ? (
              <select
                id={f.name}
                value={details[f.name] ?? ""}
                onChange={(e) => onChange(f.name, e.target.value)}
                disabled={submitting}
                className={errors[f.name] ? "error-border" : ""}
              >
                <option value="">Select</option>
                {f.options?.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            ) : f.type === "file" ? (
              <>
                <input
                  id={f.name}
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoChange}
                  disabled={submitting}
                  ref={photoInputRef}
                  style={{ display: "none" }}
                />
                <label
                  htmlFor={f.name}
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
                    <span style={{ fontSize: "0.85rem" }}>{details.photo.name}</span>
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
                    {photoPreview && (
                      <div
                        style={{
                          width: "80px",
                          height: "80px",
                          borderRadius: "50%",
                          overflow: "hidden",
                          border: "3px solid #ddd",
                        }}
                      >
                        <img
                          src={photoPreview}
                          alt="Preview"
                          style={{ width: "100%", height: "100%", objectFit: "cover" }}
                        />
                      </div>
                    )}
                  </>
                )}
              </>
            ) : (
              <input
                id={f.name}
                type={f.type}
                placeholder={f.placeholder}
                value={details[f.name] ?? ""}
                onChange={(e) => onChange(f.name, e.target.value)}
                disabled={submitting}
                className={errors[f.name] ? "error-border" : ""}
              />
            )}
            {errors[f.name] && <div className="error-text">{errors[f.name]}</div>}
          </div>
        ))}
      </div>

      {status && (
        <div
          className={`status-box ${
            status.type === "success" ? "success" : "error"
          }`}
        >
          {status.msg}
        </div>
      )}

      <div className="form-actions">
        <button
          type="button"
          onClick={handleReset}
          className="cp-btn-ghost"
          disabled={submitting}
        >
          {resetButtonLabel}
        </button>
        <button
          type="submit"
          className="cp-btn-primary"
          disabled={submitting}
        >
          {submitting ? "Saving..." : submitButtonLabel}
        </button>
      </div>
    </form>
  );
}
