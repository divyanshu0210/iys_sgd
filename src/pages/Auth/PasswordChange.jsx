// src/pages/PasswordChange.jsx
import { useState } from "react";
import API from "../../services/api";
import "../../css/signIn.css";

export default function PasswordChange() {
  const [form, setForm] = useState({ old_password: "", new_password1: "", new_password2: "" });
  const [status, setStatus] = useState(null); // { type, msg }
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.old_password || !form.new_password1 || !form.new_password2) return;

    setLoading(true);
    setStatus(null);

    try {
      await API.post("api/auth/password/change/", form);
      setStatus({ type: "success", msg: "Password changed successfully!" });
      setForm({ old_password: "", new_password1: "", new_password2: "" });
    } catch (err) {
      const msg =
        err.response?.data?.old_password?.[0] ||
        err.response?.data?.new_password1?.[0] ||
        err.response?.data?.new_password2?.[0] ||
        err.response?.data?.non_field_errors?.[0] ||
        "Password change failed. Please try again.";
      setStatus({ type: "error", msg });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="reg-page">
      <form className="reg-card" onSubmit={handleSubmit}>
        <h2 className="reg-title">Change Password</h2>

        {/* Status */}
        {status && (
          <div
            className={`status-box ${
              status.type === "info"
                ? "info"
                : status.type === "success"
                ? "success"
                : "error"
            }`}
            style={{ marginBottom: "1rem" }}
          >
            {status.msg}
          </div>
        )}

        <div className="reg-grid">
          <div className="input-group reg-field-full">
            <input
              type="password"
              placeholder=" "
              value={form.old_password}
              onChange={(e) => setForm({ ...form, old_password: e.target.value })}
              required
              disabled={loading}
              autoComplete="current-password"
            />
            <label>Old Password</label>
          </div>

          <div className="input-group reg-field-full">
            <input
              type="password"
              placeholder=" "
              value={form.new_password1}
              onChange={(e) => setForm({ ...form, new_password1: e.target.value })}
              required
              disabled={loading}
              autoComplete="new-password"
            />
            <label>New Password</label>
          </div>

          <div className="input-group reg-field-full">
            <input
              type="password"
              placeholder=" "
              value={form.new_password2}
              onChange={(e) => setForm({ ...form, new_password2: e.target.value })}
              required
              disabled={loading}
              autoComplete="new-password"
            />
            <label>Confirm New Password</label>
          </div>
        </div>

        <div className="form-actions">
          <button
            type="submit"
            className="btn-primary"
            disabled={
              loading ||
              !form.old_password ||
              !form.new_password1 ||
              !form.new_password2
            }
          >
            {loading ? "Changing..." : "Change Password"}
          </button>
        </div>
      </form>
    </div>
  );
}
