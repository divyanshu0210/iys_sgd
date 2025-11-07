// src/pages/DevotionalDetails.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "../css/profile.css";

const API_URL = import.meta.env.VITE_API_URL;

export default function DevotionalDetails() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [details, setDetails] = useState({
    harinamInitiated: "",
    mentorName: "",
    address: "",
  });

  const [status, setStatus] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const onChange = (k, v) => setDetails((s) => ({ ...s, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setStatus(null);

    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_URL}/auth/devotionalDetails`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(details),
      });

      if (!res.ok) throw new Error("Failed to save devotional details");
      setStatus({ type: "success", msg: "Devotional details saved!" });
      setTimeout(() => navigate("/"), 1500);
    } catch (err) {
      setStatus({ type: "error", msg: err.message });
    } finally {
      setSubmitting(false);
    }
  };

  const Label = ({ htmlFor, children }) => (
    <label htmlFor={htmlFor}>
      {children} <span style={{ color: "#e74c3c" }}>*</span>
    </label>
  );

  return (
    <div className="cp-page" style={{ paddingTop: "4rem" }}>
      <form className="cp-card" onSubmit={handleSubmit}>
        <h2 className="cp-title">Devotional Details</h2>

        <div className="cp-grid">
          <div className="cp-field">
            <Label htmlFor="harinamInitiated">Harinam Initiated?</Label>
            <select
              id="harinamInitiated"
              value={details.harinamInitiated}
              onChange={(e) => onChange("harinamInitiated", e.target.value)}
              required
              disabled={submitting}
            >
              <option value="">Select</option>
              <option value="Yes">Yes</option>
              <option value="No">No</option>
            </select>
          </div>

          <div className="cp-field">
            <Label htmlFor="mentorName">Mentor / Counselor Name</Label>
            <input
              id="mentorName"
              type="text"
              placeholder="Enter mentor name"
              value={details.mentorName}
              onChange={(e) => onChange("mentorName", e.target.value)}
              required
              disabled={submitting}
            />
          </div>

             {/* Address */}
          <div className="cp-field cp-field-full">
            <Label htmlFor="address">Address</Label>
            <textarea
              id="address"
              placeholder="Full address"
              value={details.address}
              onChange={(e) => onChange("address", e.target.value)}
              required
              rows={3}
              disabled={submitting}
            />
          </div>
        </div>

        {status && (
          <div className={`status-box ${status.type === "success" ? "success" : "error"}`}>
            {status.msg}
          </div>
        )}

        <div className="form-actions">
          <button type="submit" className="cp-btn-primary" disabled={submitting}>
            {submitting ? "Saving..." : "Finish"}
          </button>
        </div>
      </form>
    </div>
  );
}
